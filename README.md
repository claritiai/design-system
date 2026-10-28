# Clariti design system

The colour palette, the shared base styles and the brand assets that every Clariti product
shares. This repository holds the foundation and no components: the palette, a Tailwind theme
for the apps, a plain CSS base for the plugins, and the assets. Components stay in the product
that renders them.

| Path | What it is |
| --- | --- |
| [`tokens.css`](tokens.css) | The palette: every `--c-*` role, light and dark. Plain CSS that any page can read. |
| [`theme.css`](theme.css) | For Tailwind 4 products: the palette under the names Clariti's components are written against (`bg-card`, `text-status-warn`, `text-ai-accent`, `rounded-control`, ...). No colour of its own. |
| [`plugin.css`](plugin.css) | For plain HTML pages and plugins, such as the Revit panel: the shared fonts, radii, page, text fields and focus. Each plugin keeps its own buttons and components and names these variables (`--plugin-sans`, `--plugin-mono`, `--plugin-radius-sm`, ...). No colour of its own. |
| [`brand/`](brand) | The Clariti lockups (ink, paper), the mark (ink, paper) and the favicon. |
| [`dist/tokens.json`](dist/tokens.json) | The palette as JSON, for code that cannot read CSS (PDF generators, Python). Generated. |
| [`docs/roles.md`](docs/roles.md) | Which role means what, and the rules for using them. |

## Products follow main

Nothing is pinned or repinned. What merges here reaches every product the next time that product
builds or loads.

| Product | Reads | A change arrives |
| --- | --- | --- |
| Clariti application, its 3D viewers and its Outlook add-in | Clariti's Vercel build fetches `main`: `tokens.css`, `plugin.css` and `brand/` into `public/brand/` (served, so plugins can link them), `theme.css` and `tokens.json` into `src/design-system/` (`scripts/sync-design-system.mjs` in `claritiai/clariti`) | at the next deploy: staging on the next `develop` push, production on the next release |
| Revit panel (`claritiai/revit-plugin`) | `app.clariti.site/brand/tokens.css` and `plugin.css`, live, each after its bundled copy (`frontend/v3-coord/clariti-tokens.css`, `clariti-plugin.css`, refreshed by `tools/sync_clariti_tokens.py`) | when production Clariti has it. Offline, the bundled copies |

Each product also keeps a committed copy for its tests and for offline work. Clariti's build keeps
that copy, and logs a warning, if it cannot fetch `main` or if `main` lacks a name Clariti uses.

## Add a product

Pick the row that matches how the product renders.

| The product is | It reads |
| --- | --- |
| A page inside the Clariti application | Nothing extra: it uses Clariti's components and utilities, which already read this repository. |
| A separate Tailwind 4 app | Fetch `main` at build like Clariti does, then `@import` `tokens.css` and `theme.css` after `tailwindcss`. Its components then use the same utility names as Clariti's. |
| A plain HTML plugin or page, no React or Tailwind | Bundle synced copies of `tokens.css` and `plugin.css`, each followed by its live copy from `https://app.clariti.site/brand/` loaded without blocking, then the plugin's own stylesheet. That stylesheet keeps the plugin's own components and names the `--c-*` roles and `--plugin-*` variables. Take the logos from `https://app.clariti.site/brand/` or a synced copy. The Revit panel's `index.html` shows the order. |
| A document or a script (PDF, email, Python) | `dist/tokens.json`, fetched or synced the same way. |

Whichever row applies, the product brings no palette of its own: a role it lacks is added here
first ([`docs/roles.md`](docs/roles.md)). The repository is public, so none of these needs a token.

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
