"""This repository is public: its prose, stylesheets and tooling describe the foundation as it is,
name no manufacturer and carry nothing shaped like a credential (README, "What belongs here")."""
import hashlib
import re
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
#: Everything a reader sees, except the generated export, the logos and these tests.
SCANNED = sorted([ROOT / "README.md", *ROOT.glob("docs/**/*.md"), *ROOT.glob("*.css"),
                  *ROOT.glob("tools/*.py"), *ROOT.glob("templates/*.html"), *ROOT.glob("shell/*.ts*"),
                  *ROOT.glob(".github/workflows/*.yml")])
#: Wording about what is coming next. The files describe what exists.
AHEAD = {"future", "roadmap", "planned", "upcoming", "soon"}
#: sha256 of each manufacturer folder name in claritiai/ssot, lowercase, hashed so that this public
#: file names none of them. Add one with: python3 -c "import hashlib;print(hashlib.sha256(b'name').hexdigest())"
MANUFACTURERS = {
    "d8a77b11ba2ffbe6658ffab39fff81fee28610986802d9ae58c0ed1c2d461d57",
    "7c1f9029ec717db515a4bfa41feb1c7ad28f94eca004772d98e2982e2e8481dc",
    "7a9b644b57c15ce329d1cbf2daba9471c65ded2c00010197e0de74e99c72d973",
    "f2aabfdcbfda388425f2f5b8c2a6b5c33a555783c465d3dfc1105a318c5cf52a",
}
#: Shapes of keys and tokens: Stripe/Clerk-style, GitHub, JWT, PEM, and a secret assigned a value.
CREDENTIAL = re.compile(
    r"\b[sp]k_(?:live|test)_\w{8,}|\bgh[pousr]_\w{20,}|\beyJ[\w-]{20,}\.|-----BEGIN [A-Z ]*PRIVATE KEY"
    r"|(?i:\b(?:api[_-]?key|secret|password|access[_-]?token)\b\s*[:=]\s*\S{8,})")


class Public(unittest.TestCase):
    def test_scans_the_files_a_reader_sees(self):
        names = {p.relative_to(ROOT).as_posix() for p in SCANNED}
        self.assertTrue({"README.md", "docs/roles.md", "tokens.css", "theme.css", "plugin.css", "slides.css",
                         "templates/deck.html", "shell/sidebar.tsx", "shell/chat.tsx"} <= names)

    def test_no_wording_about_what_is_coming_and_no_manufacturer(self):
        for path in SCANNED:
            words = set(re.findall(r"[a-z0-9]+", path.read_text(encoding="utf-8").lower()))
            with self.subTest(file=path.relative_to(ROOT).as_posix()):
                self.assertEqual(sorted(words & AHEAD), [])
                self.assertEqual(sorted(w for w in words if hashlib.sha256(w.encode()).hexdigest() in MANUFACTURERS), [])

    def test_nothing_shaped_like_a_credential(self):
        for path in SCANNED:
            with self.subTest(file=path.relative_to(ROOT).as_posix()):
                self.assertEqual(CREDENTIAL.findall(path.read_text(encoding="utf-8")), [])


if __name__ == "__main__":
    unittest.main()
