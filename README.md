# Clariti design system

The colour palette, the shared base styles, the app shell and the brand assets that every Clariti
product shares. This repository holds the foundation: the palette, a Tailwind theme for the apps,
the sidebar and chat frame the apps share, a plain CSS base for the plugins, and the assets. Product
components stay in the product that renders them.

| Path | What it is |
| --- | --- |
| [`tokens.css`](tokens.css) | The palette: every `--c-*` role, light and dark. Plain CSS that any page can read. |
| [`theme.css`](theme.css) | For Tailwind 4 products: the palette under the names Clariti's components are written against (`bg-card`, `text-status-warn`, `text-ai-accent`, `rounded-control`, ...). No colour of its own. |
| [`viewer.css`](viewer.css) | For 3D views: the canvas and its chrome, engineering status in the scene, the white card model, physical materials, evidence in the scene, evidence basis and light. Read after `tokens.css`. |
| [`controls.css`](controls.css) | The form controls every product shares: the range slider (thin track, mid-grey fill, hollow thumb) and the check box, both in ink-3. Plain CSS on the palette roles, in the base layer. |
| [`plugin.css`](plugin.css) | For plain HTML pages and plugins, such as the Revit panel: the shared fonts, radii, page, text fields and focus. Each plugin keeps its own buttons and components and names these variables (`--plugin-sans`, `--plugin-mono`, `--plugin-radius-sm`, ...). No colour of its own. |
| [`slides.css`](slides.css), [`templates/deck.html`](templates/deck.html) | For presentations: a 16:9 deck written as one HTML page, read on screen and printed to PDF one slide per page. The template shows every layout; [`docs/slides.md`](docs/slides.md) says when to use which. No colour of its own. |
| [`fonts.css`](fonts.css), [`fonts/`](fonts) | IBM Plex Mono, the mono face, in 400, 500 and 600, for each product to serve itself (no font service). Helvetica Neue, the face for words, is the system's. SIL Open Font License 1.1. |
| [`shell/`](shell) | For the Clariti apps (Next.js, React, Tailwind 4): the sidebar (lockup, collapse, the app's switch and links, recent chats, the person) and the chat frame (header, thread, message, reply bar). Layout only: each app passes its links, chats, labels and account menu. Needs `next`, `react` and `lucide-react`; the app serves `brand/` at `/brand/`. |
| [`brand/`](brand) | The Clariti lockups (ink, paper), the mark (ink, paper) and the favicon. |
| [`dist/tokens.json`](dist/tokens.json) | The palette as JSON, for code that cannot read CSS (PDF generators, Python). Generated. |
| [`docs/roles.md`](docs/roles.md) | Which role means what, and the rules for using them. |
| [`docs/3d.md`](docs/3d.md) | How a Clariti 3D view looks and behaves: colours, states, chrome, interaction and stills. |

## How products read it

Nothing from here is committed into a product. Each product reads it at install or build time and
records which commit it took.

| Product | Reads it | A change ships |
| --- | --- | --- |
| Clariti application, its 3D viewers and its Outlook add-in, and the partners site | An npm dependency installed from this repository (`"@clariti/design-system": "github:claritiai/design-system"`). Stylesheets import it from `node_modules`; the build copies the served files (`tokens.css`, `viewer.css`, `plugin.css`, `fonts.css`, `fonts/`, `brand/`) into `public/brand/`, which is not committed, and the app loads `fonts/` with its font loader. The lockfile records the commit, `npm update @clariti/design-system` takes `main`, and the build warns while it is behind. | with the next deploy after the update is merged |
| Revit panel (`claritiai/revit-plugin`) | `tokens.css`, `plugin.css`, `controls.css`, `fonts.css` and `fonts/`, fetched from `main` when a release is built (`tools/make_release.py`), and by `tools/sync_clariti_tokens.py` for development and tests. Not committed. | with the next plugin release |

## Add a product

Pick the row that matches how the product renders.

| The product is | It reads |
| --- | --- |
| A page inside the Clariti application | Nothing extra: it uses Clariti's components and utilities, which already read this repository. |
| A separate Tailwind 4 app | Install it like Clariti does, then `@import` `tokens.css`, `theme.css` and `controls.css` from the package after `tailwindcss`, and load `fonts/` with the framework's font loader as `--font-plex-mono` (or serve `fonts.css`). Its components then use the same utility names as Clariti's. For Clariti's sidebar and chat frame, add `transpilePackages: ['@clariti/design-system']` to `next.config` and import them from `@clariti/design-system/shell`; `theme.css` already points Tailwind at their classes. |
| A plain HTML plugin or page, no React or Tailwind | Fetch `tokens.css`, `plugin.css` and `fonts.css` with its `fonts/` folder (and `controls.css` once it has a slider or check box) when the plugin is built and bundle them, then the plugin's own stylesheet. That stylesheet keeps the plugin's own components and names the `--c-*` roles and `--plugin-*` variables. Take the logos from `brand/` the same way. The Revit panel's `index.html` shows the order. |
| A 3D view | `tokens.css`, then `viewer.css`, and [`docs/3d.md`](docs/3d.md) for how the view behaves. Inside Clariti, the shared viewer theme already loads both. |
| A presentation | Copy [`templates/deck.html`](templates/deck.html), keep the slides it needs, and print it to PDF. [`docs/slides.md`](docs/slides.md) covers the layouts and the rules. |
| A document or a script (PDF, email, Python) | `dist/tokens.json`, from the installed package or fetched at build. |

Whichever row applies, the product brings no palette of its own: a role it lacks is added here
first ([`docs/roles.md`](docs/roles.md)). The repository is public, so installing or fetching it needs no token.

## What belongs here

This repository is public, so it holds only the foundation:

- the colour palette (`tokens.css`) and its JSON export;
- the theme names for Tailwind apps (`theme.css`);
- the base styles for plain HTML pages and plugins (`plugin.css`);
- the presentation styles and the deck template (`slides.css`, `templates/`);
- the app shell (`shell/`): the sidebar and chat frame, layout only;
- the Clariti logos (`brand/`);
- the roles doc, and the tooling that builds and tests all of the above.

It never holds:

- product components, or anything with product logic or data: the shell takes everything it shows
  from the app;
- wording about customers, manufacturers or product data;
- internal plans, or anything about what is coming next: the files describe what exists;
- credentials, keys or environment values.

`tests/test_public.py` enforces what a test can check. It fails when the README, the docs, the
stylesheets, the shell, the tooling or the workflow use a word from a short deny-list (wording about what is
coming next, and the manufacturer names that Clariti's product data is organised by, kept there as
hashes), or contain something shaped like a key or a token. `tests/test_shell.py` fails when the shell imports
anything but React, Next.js's link and image, react-dom and the icon set.

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
