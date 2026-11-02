"""Every change to a file the package ships raises its version. A webpack build cache (Next.js's, kept between builds
on Vercel) knows an installed package by its name and version only, so a product built with the same version goes on
using the files it saw last (README, "How products read it")."""
import json
import os
import subprocess
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
BASE = "origin/main"


def git(*args):
    return subprocess.run(["git", *args], cwd=ROOT, capture_output=True, text=True, check=True).stdout


def version(text):
    return tuple(int(part) for part in json.loads(text)["version"].split("."))


class Version(unittest.TestCase):
    def test_a_change_to_a_shipped_file_raises_the_version(self):
        try:
            base = git("merge-base", "HEAD", BASE).strip()
        except (OSError, subprocess.CalledProcessError):
            if os.environ.get("CI"):
                self.fail(f"{BASE} is not in this checkout: fetch it (actions/checkout with fetch-depth: 0)")
            self.skipTest(f"no {BASE} to compare with")
        shipped = json.loads((ROOT / "package.json").read_text(encoding="utf-8"))["files"]
        changed = [p for p in git("diff", "--name-only", base, "--", *shipped).splitlines() if p]
        if changed:
            before = version(git("show", f"{base}:package.json"))
            now = version((ROOT / "package.json").read_text(encoding="utf-8"))
            self.assertGreater(now, before, f"raise version in package.json: {', '.join(changed[:5])} changed")


if __name__ == "__main__":
    unittest.main()
