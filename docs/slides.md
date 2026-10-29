# Slides

How a Clariti presentation looks: a 16:9 deck written as one HTML page with
[`slides.css`](../slides.css), read in a browser and printed to PDF one slide per page.
[`templates/deck.html`](../templates/deck.html) shows every layout below; copy it to start a deck.

## Make a deck

1. Copy `templates/deck.html`. Point its four stylesheets and two logos at where
   `tokens.css`, `fonts.css`, `plugin.css`, `slides.css` and `brand/` are served, in that order.
2. Keep the slides the deck needs, delete the rest, and write the words. Set the running footer
   (`.foot`) once and repeat it; slide numbers count themselves.
3. Open it in Chrome. Each slide fits the window; Page Down steps from slide to slide.
4. Print to PDF: margins None, background graphics on. The page is 1280 × 720 px, one slide each.

## What a slide is

Every slide is drawn on a 1280 × 720 grid (`--u` is one unit of it) and scales with the
window, so it reads the same on a laptop, a projector and paper.

- **A margin of 88, a title at the same height on every slide.** The eyebrow, then the title,
  then one or two blocks. A footer sits at the bottom of every slide except the cover.
- **A title is a sentence that states the point.** The slide underneath proves it.
- **Two faces.** Helvetica Neue for words, IBM Plex Mono for facts: eyebrows, labels, numbers,
  figures, prompts and the footer.
- **Light by default.** Pages are `--c-page`; `.muted` takes a slide onto `--c-muted` to mark a
  change of pace. An ink slide (`.ink`) is `--c-ink` with `--c-on-ink`: use it for the cover or
  close, a statement, or one slide the audience must not miss. Slides do not follow dark mode.
- **The accent is the brand.** It appears on the agenda numbers, the ink statement, the band's
  label, and the card that is the AI's step. It never marks a status, a good or a bad.
- **Placeholders in brackets.** A value the presenter fills in is written `[__ kg]`, `[Date]`.

## Layouts

| Layout | Markup | Use it for |
| --- | --- | --- |
| Cover | `.slide.cover`: logo, `.eyebrow`, `h1`, `.lede`, `dl.meta.push` | The first slide: who it is for, from whom, when. Can be `.ink`. |
| Agenda | `ol.rows`: number, title, time | The parts of a session, with their timings. |
| Text and ruled list | `.cols.split`: a `.lede` beside `.ruled` items | An argument on the left, the things it covers on the right. |
| Panels | `.cols.wide-mid.stretch` of `.panel` | Phases or groups that differ in size, such as a timeline. |
| Ruled grid | `.cols` with `--cols: 3` or `4`, of `.ruled` | A list of equals: what is delivered, what is needed. |
| Steps | `.slide.muted`, `.cols` of `.card`, one `.card.ai` | A process; the accent frames only the step the AI takes. |
| Numbered | `.card` with a `.numeral` | Objectives, or a short numbered list that carries weight. |
| Statement | `.slide.ink`, `.statement` with an `<em>` | One sentence that carries a section. `.push` centres it. |
| Compare | two `.panel`s, the second `.panel.ink` | What it does against what it must not do. |
| Band | `p.band` with a `.label` | One closing line the audience acts on: an exercise, a measure. `.band.quiet` for a note. |
| Prompt | `.code` with a `.label` and `<pre>` | A prompt or code, exactly as typed, beside what comes back. |
| Figure and table | `.cols.wide-last`: a `.panel` with a `.stat`, then a `table` | One number, then the terms around it. |
| Close | `.slide.ink`, `.ruled` steps, the paper logo | Next steps, then the mark. |

`.push` sends a block, and everything after it, to the bottom of the slide. `.small` and `.fine`
step body text down for detail and caveats; `<strong>` picks out the one phrase that carries a
line.
