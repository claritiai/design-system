"""The design workspace (workspace/) is the frame and the parts every product family's panes are built from: it imports
React, the icon set, Radix's select and the shell's class joiner, and nothing from an app, so every Clariti app can
install it as it is. It names no product family: a family's words and rules stay with the family."""
import re
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
WORKSPACE = ROOT / "workspace"
ALLOWED = {"react", "lucide-react", "@radix-ui/react-select", "../shell/cn"}
#: The product families Clariti designs today, whose words belong in their own views.
FAMILIES = {"lifting", "channel", "channels", "masonry", "brickwork", "lintel", "lintels", "socket", "sockets", "rope",
            "barrier", "anchor", "anchors", "bracket", "brackets", "tie", "ties"}


def sources(path):
    return re.findall(r"""^(?:import|export)\b[^'"]*?from\s+['"]([^'"]+)['"]""", path.read_text(encoding="utf-8"), re.M)


class Workspace(unittest.TestCase):
    files = sorted(WORKSPACE.glob("*.ts*"))

    def test_imports_nothing_from_an_app(self):
        self.assertTrue(self.files)
        for path in self.files:
            with self.subTest(file=path.name):
                self.assertEqual(sorted(s for s in sources(path) if s not in ALLOWED and not s.startswith("./")), [])

    def test_names_no_product_family(self):
        for path in self.files:
            with self.subTest(file=path.name):
                words = set(re.findall(r"[a-z]+", path.read_text(encoding="utf-8").lower()))
                self.assertEqual(sorted(words & FAMILIES), [])

    def test_the_index_exports_every_part(self):
        index = sources(WORKSPACE / "index.ts")
        parts = {f"./{p.stem}" for p in self.files if p.name != "index.ts"}
        self.assertEqual(sorted(parts - set(index)), [])


if __name__ == "__main__":
    unittest.main()
