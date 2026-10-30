"""The app shell (shell/) is layout only: it imports React, Next.js's link and image, react-dom and the icon set,
and nothing from an app, so every Clariti app can install it as it is."""
import re
import unittest
from pathlib import Path

SHELL = Path(__file__).resolve().parent.parent / "shell"
ALLOWED = {"react", "react-dom", "next/link", "next/image", "lucide-react"}


class Shell(unittest.TestCase):
    def test_imports_nothing_from_an_app(self):
        files = sorted(SHELL.glob("*.ts*"))
        self.assertTrue(files)
        for path in files:
            with self.subTest(file=path.name):
                sources = re.findall(r"""^(?:import|export)\b[^'"]*?from\s+['"]([^'"]+)['"]""", path.read_text(encoding="utf-8"), re.M)
                self.assertEqual(sorted(s for s in sources if s not in ALLOWED and not s.startswith("./")), [])


if __name__ == "__main__":
    unittest.main()
