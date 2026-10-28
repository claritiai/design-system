# Clariti design system

The colour palette, the shared base styles and the brand assets that every Clariti product
shares. This repository holds the foundation and no components: the palette, a Tailwind theme
for the apps, a plain CSS base for the plugins, and the assets. Components stay in the product
that renders them.

| Path | What it is |
| --- | --- |
| [`tokens.css`](tokens.css) | The palette: every `--c-*` role, light and dark. Plain CSS that any page can read. |
| [`theme.css`](theme.css) | For Tailwind 4 products: the palette under the names Clariti's components are written against (`bg-card`, `text-status-warn`, `text-ai-accent`, `rounded-control`, ...). No colour of its own. |
| [`viewer.css`](viewer.css) | For 3D views: the canvas and its chrome, engineering status in the scene, physical materials, evidence in the scene, evidence basis and light. Read after `tokens.css`. |
| [`controls.css`](controls.css) | The form controls every product shares: the range slider (thin track, mid-grey fill, hollow thumb) and the check box, both in ink-3. Plain CSS on the palette roles, in the base layer. |
| [`plugin.css`](plugin.css) | For plain HTML pages and plugins, such as the Revit panel: the shared fonts, radii, page, text fields and focus. Each plugin keeps its own buttons and components and names these variables (`--plugin-sans`, `--plugin-mono`, `--plugin-radius-sm`, ...). No colour of its own. |
| [`brand/`](brand) | The Clariti lockups (ink, paper), the mark (ink, paper) and the favicon. |
| [`dist/tokens.json`](dist/tokens.json) | The palette as JSON, for code that cannot read CSS (PDF generators, Python). Generated. |
| [`docs/roles.md`](docs/roles.md) | Which role means what, and the rules for using them. |
| [`docs/3d.md`](docs/3d.md) | How a Clariti 3D view looks and behaves: colours, states, chrome, interaction and stills. |

## Products sync from main

Each product keeps a committed copy of the files it uses and refreshes it with one command. A
change merged here reaches a product when that product syncs and ships; nothing is fetched at
build or load time.

| Product | Copies | Command | A change ships |
| --- | --- | --- | --- |
| Clariti application, its 3D viewers and its Outlook add-in | `tokens.css`, `viewer.css`, `plugin.css` and `brand/` into `public/brand/`; `theme.css`, `controls.css` and `tokens.json` into `src/design-system/` | `npm run sync:design-system` in `claritiai/clariti` | with the next deploy after the synced copy is committed |
| Revit panel (`claritiai/revit-plugin`) | `tokens.css` and `plugin.css` into `frontend/v3-coord/` | `python3 tools/sync_clariti_tokens.py` | with the next plugin release |

Each sync stamps its copies with the commit they came from, and stops if `main` lacks a name the
product uses.

## Add a product

Pick the row that matches how the product renders.

| The product is | It reads |
| --- | --- |
| A page inside the Clariti application | Nothing extra: it uses Clariti's components and utilities, which already read this repository. |
| A separate Tailwind 4 app | Sync `tokens.css`, `theme.css` and `controls.css` like Clariti does, then `@import` them after `tailwindcss`. Its components then use the same utility names as Clariti's. |
| A plain HTML plugin or page, no React or Tailwind | Bundle synced copies of `tokens.css` and `plugin.css` (and `controls.css` once it has a slider or check box), then the plugin's own stylesheet. That stylesheet keeps the plugin's own components and names the `--c-*` roles and `--plugin-*` variables. Take the logos from a synced copy of `brand/`. The Revit panel's `index.html` shows the order. |
| A 3D view | `tokens.css`, then `viewer.css`, and [`docs/3d.md`](docs/3d.md) for how the view behaves. Inside Clariti, the shared viewer theme already loads both. |
| A document or a script (PDF, email, Python) | `dist/tokens.json`, synced the same way. |

Whichever row applies, the product brings no palette of its own: a role it lacks is added here
first ([`docs/roles.md`](docs/roles.md)). The repository is public, so syncing needs no token.

## What belongs here

This repository is public, so it holds only the foundation:

- the colour palette (`tokens.css`) and its JSON export;
- the theme names for Tailwind apps (`theme.css`);
- the base styles for plain HTML pages and plugins (`plugin.css`);
- the Clariti logos (`brand/`);
- the roles doc, and the tooling that builds and tests all of the above.

It never holds:

- components, or anything with product logic;
- wording about customers, manufacturers or product data;
- internal plans, or anything about what is coming next: the files describe what exists;
- credentials, keys or environment values.

Shared React components, if they ever leave Clariti, go in a separate private repository.

`tests/test_public.py` enforces what a test can check. It fails when the README, the docs, the
stylesheets, the tooling or the workflow use a word from a short deny-list (wording about what is
coming next, and the manufacturer names that Clariti's product data is organised by, kept there as
hashes), or contain something shaped like a key or a token.

## Change a colour

1. Edit `tokens.css`, in both themes.
2. `python3 tools/build.py` to regenerate `dist/tokens.json`.
3. `python3 -m unittest discover -s tests`. The tests check that both themes declare every role,
   that every value is a colour, that `theme.css` and `plugin.css` name only declared roles and
   write no colour, and that the JSON export is current.
4. Open a pull request to `main`.

## Use

This repository is public so that builds and plugins can read it without a token. The Clariti
name, marks and palette are not licensed for use outside Clariti products.
