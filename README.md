# Clariti design system

The colour palette and brand assets that every Clariti product shares. This repository is only
the foundation: tokens and assets, no components.

| Path | What it is |
| --- | --- |
| [`tokens.css`](tokens.css) | The palette: every `--c-*` role, light and dark. |
| [`brand/`](brand) | The Clariti lockups (ink, paper), the mark (ink, paper) and the favicon. |
| [`dist/tokens.json`](dist/tokens.json) | The palette as JSON, for code that cannot read CSS (PDF generators, Python). Generated. |
| [`docs/roles.md`](docs/roles.md) | Which role means what, and the rules for using them. |

## How products read it

Products follow `main`. There is nothing to pin or repin: what merges here reaches every product
the next time that product builds or loads.

| Product | Reads | A change arrives |
| --- | --- | --- |
| Clariti application, 3D viewers, Outlook add-in | Clariti's Vercel build fetches `main` into `public/brand/` (`scripts/sync-design-system.mjs` in `claritiai/clariti`) | at the next deploy: staging on the next `develop` push, production on the next release |
| Revit panel | `app.clariti.site/brand/tokens.css`, live, after its bundled copy (`frontend/v3-coord/clariti-tokens.css` in `claritiai/revit-plugin`) | as soon as production Clariti has it. Offline, the panel keeps its bundled copy |

Each product also keeps a committed copy of these files for its tests and for offline work.
Clariti's build keeps that copy, and logs a warning, if it cannot fetch `main` or if `main` lacks a
role Clariti names.

## Change a colour

1. Edit `tokens.css`, in both themes.
2. `python3 tools/build.py` to regenerate `dist/tokens.json`.
3. `python3 -m unittest discover -s tests` to confirm both themes declare every role, every value
   is a colour and the JSON export is current.
4. Open a pull request to `main`.

To add a role, follow [`docs/roles.md`](docs/roles.md): add it to both themes here, then name it in
each product that uses it.

## Use

This repository is public so that builds can read it without a token. The Clariti name, marks and
palette are not licensed for use outside Clariti products.
