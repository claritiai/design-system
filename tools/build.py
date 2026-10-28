#!/usr/bin/env python3
"""Write dist/tokens.json from tokens.css: the palette for code that cannot read CSS (PDF
generators, Python). Roles lose their --c- prefix; values are kept as written.

    python3 tools/build.py           # write dist/tokens.json
    python3 tools/build.py --check   # exit 1 if dist/tokens.json is not what tokens.css gives

Stdlib only."""
import argparse
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
TOKENS = ROOT / "tokens.css"
JSON_OUT = ROOT / "dist" / "tokens.json"
COMMENT = "Generated from tokens.css by tools/build.py. Do not edit."


def blocks(css):
    """{selector: {name: value}} for every innermost block, comments removed."""
    css = re.sub(r"/\*.*?\*/", "", css, flags=re.S)
    out = {}
    for prelude, body in re.findall(r"([^{}]+)\{([^{}]*)\}", css):
        selector = " ".join(prelude.split(";")[-1].split())
        out.setdefault(selector, {}).update(
            (name, value.strip()) for name, value in re.findall(r"(--[\w-]+)\s*:\s*([^;]+);", body))
    return out


def themes(css):
    """(light, dark) role maps, each {name without --c-: value}."""
    b = blocks(css)
    light = b[":root"]
    dark = next(v for k, v in b.items() if "dark" in k)
    strip = lambda d: {name[len("--c-"):]: value for name, value in d.items()}
    return strip(light), strip(dark)


def render(css):
    light, dark = themes(css)
    return json.dumps({"$comment": COMMENT, "light": light, "dark": dark}, indent=2) + "\n"


def main(argv=None):
    parser = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    parser.add_argument("--check", action="store_true")
    args = parser.parse_args(argv)
    want = render(TOKENS.read_text(encoding="utf-8"))
    if args.check:
        if not JSON_OUT.exists() or JSON_OUT.read_text(encoding="utf-8") != want:
            print("dist/tokens.json is stale: run python3 tools/build.py")
            return 1
        return 0
    JSON_OUT.write_text(want, encoding="utf-8", newline="\n")
    print("dist/tokens.json <- tokens.css")
    return 0


if __name__ == "__main__":
    sys.exit(main())
