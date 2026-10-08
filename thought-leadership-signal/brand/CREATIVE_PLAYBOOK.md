# Creative Playbook

Goal: scroll stop before the hook, with **million dollar agency craft**, using **real world assets**.

## Quality bar

Treat every pack like a paid studio engagement for a serious fintech / protocol brand.

- Typography and spacing do the selling
- Layout is HTML/CSS (or Figma) → export PNG — not "prompt an illustration"
- Unique composition per pack; never the same template forever

## Creative vs post text (critical)

Creatives and copy must **not mirror the same data**.

| Lives in creative | Lives in post text |
|-------------------|--------------------|
| Hook / frame / visual hierarchy | Full story and nuance |
| One memorable model or contrast | Detailed numbers, dates, scores, URLs |
| Eye catch only when it earns attention | Receipts and sourcing |

Do **not** paste the same upvotes, quotes, or bullet list onto slides and into the caption.
Eye catching assets (photo, meme, chart) are optional. Use them when they add stop power. Never force them.

## Variety rules

1. Never use the same format two days in a row
2. Cap paid AgentCash creatives per [`ops/BUDGET.md`](../ops/BUDGET.md)
3. Prefer studio HTML carousels, receipt collages, and real meme templates
4. Log format + asset sources in `meta.yml`

## Format catalog

### carousel_studio
- **Use for:** multi beat teaching + receipts
- **Build:** HTML/CSS design system → PNG export
- **Assets:** real photo strips, source chips (logos), charts from research numbers
- **Save:** `slide-01.png` … + `carousel.html` + `assets/`

### meme_real
- **Use for:** irony, builder pain, culture
- **AgentCash:** StableMemes / Imgflip templates (~$0.01–0.02)
- **Why allowed:** templates are real meme corpus, not invented scenes
- **Save:** `meme.png` + template id in `prompt.txt`

### receipt_collage
- **Use for:** newsjack with proof
- **Build:** screenshot of real post/article + studio typography overlay
- **Save:** `receipt.png` + original screenshot in `assets/`

### data_frame
- **Use for:** one honest chart or comparison
- **Build:** chart from cited numbers (SVG/HTML), not AI fake graphs
- **Save:** `chart.png` + source note in brief

### quote_editorial
- **Use for:** hook as premium type
- **Build:** studio HTML; optional real photo background at low opacity
- **Save:** `quote.png`

### diagram_systems
- **Use for:** mental models, stacks, flows
- **Build:** vector/HTML diagram (not AI surreal diagram art)
- **Save:** `diagram.png`

### code_receipt
- **Use for:** technical posts where one code path is the proof
- **Build:** studio HTML with a short monospace block (smoking gun), not a full file dump
- **Rule:** one idea per slide; long snippets live in the caption
- **Save:** `slide-0N.png` + note language in `prompt.txt`

### photo_essay
- **Use for:** human / city / work reality as emotional bridge
- **Build:** licensed real photography + short type
- **Save:** `photo.png` + attribution

## Suggested weekly rotation

| Day | Format |
|-----|--------|
| Mon | meme_real |
| Tue | diagram_systems |
| Wed | carousel_studio |
| Thu | receipt_collage |
| Fri | data_frame |
| Sat | photo_essay |
| Sun | quote_editorial |

Swap when the angle demands it. Never invent assets to force a format.

## Visual system (default studio)

- Display: Syne (or equally strong paid/licensed geometric display)
- Text: IBM Plex Sans
- Ink `#0e1114` · Paper `#e9e6df` · Signal teal `#3d9b8f`
- Soft grid, generous margins, folio `01 / 05`, brand chip `Signal · Abhinil`
- Avoid purple neon, stock moon rockets, cream + terracotta cliché stacks

## 3D stills (hard gate — 2026-10-02)

Carousels are frozen motion frames, not flat decks.

- Shared palette, type, folio, and frame inside a pack. A new spatial idea on every slide. Do not stamp the same prop five times.
- Mix how the idea is shown: a statement, a bold number, a simple chart, a contrast. One idea still owns the frame.
- Bold display type. Subtext clearly smaller. Object large enough to read as the creative, not a corner icon.
- Frame border, 56–64px inset, no clipped glyphs.
- Build in studio HTML (perspective, depth, light) and export PNG. Do not pay for imaginary hero scenes.
- Paid image models (StableStudio and similar) stay off the hero. Spline or a real Three.js capture is the upgrade if a pack needs true rendered geometry.

## Hero every slide (hard gate — 2026-09-22)

**Every carousel frame is a hero creative.** There are no “supporting” slides, no filler cards, no tiny caption under a void.

A slide fails if someone would swipe past it because only slide 01 felt like the ad.

### What “hero” means

1. **One dominant idea owns the frame** — statement, contrast, or model fills the optical center.
2. **Display type is the product** — the hero line is the scroll stop, not decoration around widgets.
3. **Equal craft across 01–05** — same type system, same inset, same intentional rhythm. Slide 04 cannot look like a checklist after a cinematic 01.
4. **Secondary lines earn their size** — if it is on the slide, it is large enough to read at phone distance (≥22px). Prefer one powerful secondary line over two small cards.
5. **Composition fills the square** — use hierarchy and banding, not a sticky note floating in the bottom third.

### Reject (supporting-creative tells)

- Small title + two tiny info cards
- Bullet / equation rows that look like a deck appendix
- Huge empty mid band with a caption
- Slide that only makes sense after reading the caption
- Text clipped, kissing the crop, or overflowing its box

Archive supporting-style fails under `creative/archive-v3-support/` (or next `archive-v*`).

## Density doctrine (1080×1080)

Carousel slides must feel **composed**, not a sticky note on a void — and not a wall of type jammed to the edges.

### Balance (hard gate)

Density without readability is a reject. Over-dense overflow is as bad as sparse voids.

1. **Safe inset** — Content padding **56–64px** from the outer edge (inside any frame rule). Visible margin on all sides. Never edge kiss.
2. **Hero display** — Usually **72–88px** for multi-line hooks; short punches may go **90–104px** if every glyph stays inside the safe inset.
3. **Breathing room** — Gaps between major blocks **16–28px**. Avoid deserts *and* wall-to-wall type.
4. **No overflow / no cut text** — Every string fully visible. Prefer normal-width faces (Syne / Space Grotesk / IBM Plex) for long words. Soft wrap allowed; hard clip is a reject.
5. **Body / secondary** — **24–34px**. Labels / folio **14–18px**. Code receipts **26–32px** mono with wrap.
6. **Internal padding** — Any panel/band has ≥20px inner padding.
7. **One idea, clear** — Fewer elements, each large enough at ~1/3 phone width.
8. **Fixed slide** — Root `.slide` is exactly `1080×1080`. Prefer CSS grid for vertical rhythm.

### Pre-export checklist (every slide)

- [ ] Would this frame stop scroll **alone** (hero test)?
- [ ] Hook / statement fully inside the frame with visible margin
- [ ] No text clipped, truncated, or kissing the crop
- [ ] Big type with intentional spacing (not soup, not void)
- [ ] Secondary lines still phone-legible
- [ ] Folio + brand chip present and consistent
- [ ] Same craft level as slide 01

### Anti patterns

- AI imaginary hero art
- Fake metrics
- Tiny unreadable type **or** oversized empty margins with small type
- **Oversized display that overflows / touches crop**
- **Supporting-deck layouts** (cards, appendix lists, tiny captions)
- Same quote card every day
- Logo spam without citation role
- Cluttered "infographic vomit"
- Sparse "poster void" layouts
- Ultra-extended display faces used for long words without checking fit
## File hygiene

```
queue/YYYY-MM-DD/creative/
  carousel.html | layout source
  export-slides.cjs
  slide-XX.png
  assets/              # real photos, logos, screenshots used
  prompt.txt           # build notes (not AI scene prompts)
  carousel.md
```
