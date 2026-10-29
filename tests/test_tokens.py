"""The palette every Clariti product reads: complete in both themes, colours only, and its JSON
export current. Products follow main, so what merges here is live at their next build."""
import re
import sys
import unittest
import xml.etree.ElementTree as ET
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT / "tools"))
import build  # noqa: E402

CSS = (ROOT / "tokens.css").read_text(encoding="utf-8")
COLOUR = re.compile(r"^(#[0-9a-f]{6}|rgba\(\d{1,3}, \d{1,3}, \d{1,3}, (0|1|0?\.\d+)\))$")


class Palette(unittest.TestCase):
    def test_both_themes_declare_every_role(self):
        light, dark = build.themes(CSS)
        self.assertTrue(light)
        self.assertEqual(sorted(dark), sorted(light))

    def test_every_value_is_a_colour(self):
        for theme in build.themes(CSS):
            for role, value in theme.items():
                with self.subTest(role=role):
                    self.assertRegex(value, COLOUR)

    def test_json_export_is_current(self):
        self.assertEqual(build.main(["--check"]), 0)


def code(name):
    return re.sub(r"/\*.*?\*/", "", (ROOT / name).read_text(encoding="utf-8"), flags=re.S)


class Layers(unittest.TestCase):
    """theme.css (Tailwind products), plugin.css (plain HTML plugins), controls.css (shared form
    controls) and slides.css (presentations) name palette roles and hold no colour of their own."""
    LAYERS = ("theme.css", "plugin.css", "controls.css", "slides.css")

    def test_name_only_roles_the_palette_declares(self):
        light, dark = build.themes(CSS)
        for layer in self.LAYERS:
            with self.subTest(layer=layer):
                named = set(re.findall(r"var\(--c-([\w-]+)\)", code(layer)))
                self.assertTrue(named)
                self.assertEqual(sorted(named - set(light)), [])
                self.assertEqual(sorted(named - set(dark)), [])

    def test_write_no_colour_and_no_role(self):
        for layer in self.LAYERS:
            with self.subTest(layer=layer):
                self.assertEqual(re.findall(r"#[0-9a-fA-F]{3,8}\b|\b(?:rgba?|hsla?|oklch|oklab)\(", code(layer)), [])
                self.assertEqual(re.findall(r"(--c-[\w-]+)\s*:", code(layer)), [])

    def test_every_theme_utility_reads_a_declared_variable(self):
        theme = code("theme.css")
        declared = set(re.findall(r"(--[\w-]+)\s*:", theme))
        block = re.search(r"@theme inline \{(.*?)\n\}", theme, flags=re.S).group(1)
        read = set(re.findall(r"var\((--[\w-]+)\)", block))
        self.assertEqual(sorted(r for r in read - declared if not r.startswith("--c-")), [])


class Viewer(unittest.TestCase):
    """viewer.css: chrome and status name palette roles; the scene's own roles are colours, and
    none of them is the brand accent, which never paints geometry."""
    ALIASED = ("--viewer-background", "--viewer-panel", "--viewer-fill", "--viewer-foreground",
               "--viewer-muted", "--viewer-border", "--viewer-accent", "--viewer-accent-bg",
               "--pass", "--pass-bg", "--pass-border", "--warn", "--warn-bg", "--warn-border",
               "--fail", "--fail-bg", "--fail-border")
    # the white card model: palette roles too, but a different one in each theme
    MODEL = ("--model-card", "--model-shade")

    def setUp(self):
        blocks = build.blocks((ROOT / "viewer.css").read_text(encoding="utf-8"))
        self.light = blocks[":root"]
        self.dark = next(v for k, v in blocks.items() if "dark" in k)

    def test_dark_overrides_only_roles_light_declares(self):
        self.assertEqual(sorted(set(self.dark) - set(self.light)), [])

    def test_chrome_and_status_name_palette_roles(self):
        light, _ = build.themes(CSS)
        for role in self.ALIASED:
            with self.subTest(role=role):
                match = re.fullmatch(r"var\(--c-([\w-]+)\)", self.light[role])
                self.assertIsNotNone(match)
                self.assertIn(match.group(1), light)
                self.assertNotIn(role, self.dark)

    def test_model_names_palette_roles_in_both_themes(self):
        light, dark = build.themes(CSS)
        for role in self.MODEL:
            for theme, palette in ((self.light, light), (self.dark, dark)):
                with self.subTest(role=role):
                    match = re.fullmatch(r"var\(--c-([\w-]+)\)", theme[role])
                    self.assertIsNotNone(match)
                    self.assertIn(match.group(1), palette)
                    self.assertNotIn(match.group(1), ("accent", "accent-tint", "accent-line"))

    def test_scene_roles_are_colours_and_never_the_accent(self):
        light, dark = build.themes(CSS)
        accents = {light["accent"], dark["accent"]}
        for theme in (self.light, self.dark):
            for role, value in theme.items():
                if role in self.ALIASED or role in self.MODEL:
                    continue
                with self.subTest(role=role):
                    self.assertRegex(value, COLOUR)
                    self.assertNotIn(value, accents)


class Type(unittest.TestCase):
    """One pair of faces everywhere: the Tailwind theme and the plugin base name the same families."""

    @staticmethod
    def families(css, name):
        value = re.search(r"%s:\s*([^;]+);" % re.escape(name), code(css)).group(1)
        value = re.sub(r"var\(--[\w-]+,\s*([^)]+)\)", r"\1", value)
        return [f.strip().strip('"') for f in value.split(",")]

    def test_theme_and_plugins_share_the_faces(self):
        self.assertEqual(self.families("theme.css", "--font-sans"), self.families("plugin.css", "--plugin-sans"))
        self.assertEqual(self.families("theme.css", "--font-mono"), self.families("plugin.css", "--plugin-mono"))
        self.assertEqual(self.families("theme.css", "--font-sans")[0], "Helvetica Neue")
        self.assertEqual(self.families("theme.css", "--font-mono")[0], "IBM Plex Mono")


class Fonts(unittest.TestCase):
    """fonts.css serves the mono face the theme and the plugin base name, from files beside it."""

    def test_every_face_is_a_shipped_file_of_the_named_family(self):
        css = code("fonts.css")
        faces = re.findall(r"@font-face\s*\{([^}]*)\}", css)
        self.assertEqual(sorted(re.search(r"font-weight:\s*(\d+)", f).group(1) for f in faces), ["400", "500", "600"])
        mono = Type.families("theme.css", "--font-mono")[0]
        for face in faces:
            with self.subTest(face=face):
                self.assertEqual(re.search(r'font-family:\s*"([^"]+)"', face).group(1), mono)
                url = re.search(r'url\("([^"]+)"\)', face).group(1)
                self.assertTrue((ROOT / url).is_file(), url)
        self.assertTrue((ROOT / "fonts" / "OFL.txt").is_file())


class Package(unittest.TestCase):
    """Products install this repository as @clariti/design-system: every file they read is shipped."""

    def test_package_ships_every_product_file(self):
        import json
        files = json.loads((ROOT / "package.json").read_text(encoding="utf-8"))["files"]
        for name in ("tokens.css", "theme.css", "controls.css", "viewer.css", "plugin.css", "slides.css", "fonts.css",
                     "fonts/", "brand/", "templates/", "dist/"):
            self.assertIn(name, files)


class Slides(unittest.TestCase):
    """The deck template reads the design system in load order, and every file it names exists."""

    def test_template_loads_the_layers_in_order_and_names_shipped_files(self):
        html = (ROOT / "templates" / "deck.html").read_text(encoding="utf-8")
        sheets = re.findall(r'<link rel="stylesheet" href="\.\./([^"]+)">', html)
        self.assertEqual(sheets, ["tokens.css", "fonts.css", "plugin.css", "slides.css"])
        for src in re.findall(r'src="\.\./([^"]+)"', html):
            with self.subTest(src=src):
                self.assertTrue((ROOT / src).is_file(), src)

    def test_template_writes_no_colour(self):
        html = (ROOT / "templates" / "deck.html").read_text(encoding="utf-8")
        self.assertEqual(re.findall(r"#[0-9a-fA-F]{3,8}\b|\b(?:rgba?|hsla?|oklch|oklab)\(", html), [])


class Brand(unittest.TestCase):
    def test_every_asset_is_an_svg(self):
        assets = sorted((ROOT / "brand").glob("*"))
        self.assertTrue(assets)
        for asset in assets:
            with self.subTest(asset=asset.name):
                self.assertEqual(asset.suffix, ".svg")
                self.assertEqual(ET.parse(asset).getroot().tag, "{http://www.w3.org/2000/svg}svg")


if __name__ == "__main__":
    unittest.main()
