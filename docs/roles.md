# Colour roles

Every Clariti colour is written once, in [`tokens.css`](../tokens.css), for light and dark.
Each product names these roles in its own vocabulary and never restates a value.

| Meaning | Role |
| --- | --- |
| Page, then card and popover | `--c-page`, `--c-surface` |
| Quiet fill, chip, hover, track | `--c-muted`, `--c-sunken` |
| Hairline, then inputs and frames | `--c-line`, `--c-line-strong` |
| Text, body, then labels (`ink-3` is the lightest small text may use) | `--c-ink`, `--c-ink-2`, `--c-ink-3` |
| Text on an ink or accent fill | `--c-on-ink`, `--c-on-accent` |
| Primary action: the main button, a selected segment (ink, off-white in dark) | `--c-ink` with `--c-on-ink` |
| Elevation: the one shadow colour, used by `shadow-hairline`, `shadow-raised`, `shadow-overlay` | `--c-shadow` |
| The veil behind a dialog, a sheet or a drawer (`bg-scrim`) | `--c-scrim` |
| Brand: the mark, AI at work (spark, generating, the AI-changes note), eyebrow, favourite | `--c-accent`, `--c-accent-tint`, `--c-accent-line` |
| Passed check | `--c-verified`, `--c-verified-icon`, `--c-verified-bg`, `--c-verified-line` |
| Check this: warning, tip, draft, alert | `--c-warn`, `--c-warn-bg`, `--c-warn-line` |
| Assumed value the engineer confirms (the orange field), and the count of values to review | `--c-warn`, `--c-warn-bg`, `--c-warn-line` |
| Evidence that does not cover the case: check it, not an alarm | `--c-notcov`, `--c-notcov-bg`, `--c-notcov-line` |
| Failed check, destructive action | `--c-error`, `--c-error-icon`, `--c-error-bg`, `--c-error-line` |
| Note, information: says something, asks nothing (`text-note`, `bg-note-bg`, `border-note-border`) | `--c-sunken`, `--c-line`, `--c-ink-2`, label in `--c-ink` |

Dark mode is the same roles on a warm near-black. The application and the Revit panel switch it
with `class="dark"` on `<html>`, the 3D viewers and the Outlook add-in with `data-theme="dark"`.

## Rules

- The accent is the brand. It never marks a status, and a status never borrows it.
- Status is a tinted panel with an icon and text, never colour alone.
- Information has no hue. A note is neutral, so it never competes with a status; there is no
  blue role.
- A product brings no palette of its own. A role Clariti lacks is added to `tokens.css` here,
  for both themes, and then named in each product that uses it.
- Physical materials, evidence in the scene and evidence bases have their own roles in
  [`viewer.css`](../viewer.css). They are data, not brand. [`3d.md`](3d.md) covers 3D views.
- A role is never renamed or removed while a product still names it. Add the new role, move
  the products over, then remove the old one.
