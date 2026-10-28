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
