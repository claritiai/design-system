# Clariti design system

The colour palette, theme and brand assets that every Clariti product shares. This repository
holds the foundation (tokens, the Tailwind theme, assets) and no components. Components stay
in the product that renders them.

| Path | What it is |
| --- | --- |
| [`tokens.css`](tokens.css) | The palette: every `--c-*` role, light and dark. Plain CSS that any page can read. |
| [`theme.css`](theme.css) | For Tailwind 4 products: the palette under the names Clariti's components are written against (`bg-card`, `text-status-warn`, `text-ai-accent`, `rounded-control`, ...). No colour of its own. |
| [`brand/`](brand) | The Clariti lockups (ink, paper), the mark (ink, paper) and the favicon. |
| [`dist/tokens.json`](dist/tokens.json) | The palette as JSON, for code that cannot read CSS (PDF generators, Python). Generated. |
| [`docs/roles.md`](docs/roles.md) | Which role means what, and the rules for using them. |

## Products follow main

Nothing is pinned or repinned. What merges here reaches every product the next time that product
builds or loads.

| Product | Reads | A change arrives |
| --- | --- | --- |
| Clariti application, its 3D viewers, the Outlook add-in it serves today | Clariti's Vercel build fetches `main`: `tokens.css` and `brand/` into `public/brand/`, `theme.css` and `tokens.json` into `src/design-system/` (`scripts/sync-design-system.mjs` in `claritiai/clariti`) | at the next deploy: staging on the next `develop` push, production on the next release |
| Revit panel (`claritiai/revit-plugin`) | `app.clariti.site/brand/tokens.css`, live, after its bundled copy (`frontend/v3-coord/clariti-tokens.css`, refreshed by `tools/sync_clariti_tokens.py`) | when production Clariti has it. Offline, the bundled copy |

Each product also keeps a committed copy for its tests and for offline work. Clariti's build keeps
that copy, and logs a warning, if it cannot fetch `main` or if `main` lacks a name Clariti uses.

## Add a product

Pick the row that matches how the product renders.

| The product is | It reads | Example |
| --- | --- | --- |
| A page inside the Clariti application | Nothing extra: it uses Clariti's components and utilities, which already read this repository. | the manufacturer portal, if it moves into Clariti |
| A separate Tailwind 4 app | Fetch `main` at build like Clariti does, then `@import` `tokens.css` and `theme.css` after `tailwindcss`. Its components then use the same utility names as Clariti's. | the manufacturer portal, if it stays a separate app |
| A plain HTML plugin or page, no React or Tailwind | Bundle a synced `tokens.css` and link `https://app.clariti.site/brand/tokens.css` after it, loaded without blocking. Then name the `--c-*` roles in the plugin's own stylesheet. Take the logos from `https://app.clariti.site/brand/` or a synced copy. | the Revit panel; the Outlook plugin, once it moves to its own repository |
| A document or a script (PDF, email, Python) | `dist/tokens.json`, fetched or synced the same way. | Clariti's PDF reports |

Whichever row applies, the product brings no palette of its own: a role it lacks is added here
first ([`docs/roles.md`](docs/roles.md)). The repository is public, so none of these needs a token.

## Change a colour

1. Edit `tokens.css`, in both themes.
2. `python3 tools/build.py` to regenerate `dist/tokens.json`.
3. `python3 -m unittest discover -s tests`. The tests check that both themes declare every role,
   that every value is a colour, that `theme.css` names only declared roles and writes no colour,
   and that the JSON export is current.
4. Open a pull request to `main`.

## Use

This repository is public so that builds and plugins can read it without a token. The Clariti
name, marks and palette are not licensed for use outside Clariti products.
