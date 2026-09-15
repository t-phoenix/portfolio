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

## Density doctrine (1080×1080)

Carousel slides must feel **composed**, not a sticky note on a void — and not a wall of type jammed to the edges.

### Balance (hard gate — 2026-09-13)

Density without readability is a reject. Over-dense overflow is as bad as sparse voids.

1. **Safe inset** — Content padding ~52–60px from the frame. Limited spacing, not deserts and not edge kiss.
2. **Hook size sweet spot** — Hero display usually **76–88px**. Bold enough to stop scroll; not 100–140px overflow.
3. **Breathing room on hero** — Small intentional gaps between blocks (~14–22px). Avoid huge empty mid bands *and* wall-to-wall type.
4. **No overflow** — Every string must fit inside its box. Prefer normal-width faces for long words.
5. **Body scale** — Supporting copy ~24–30px. Code receipts ~28–32px mono with wrap.
6. **One idea, clear** — Fewer elements, each large enough to read at phone size.
7. **Avoid extremes** — Reject sparse void posters *and* reject cramped overflow posters. Archive failed passes under `creative/archive-v*`.
8. **Fixed slide height** — Root `.slide` stays `1080×1080` with `display: grid`.

### Density checklist before export

- [ ] Hook grabs attention and is fully inside the frame with visible margin
- [ ] No text clipped at edges or box borders
- [ ] Hero has some air (not edge-to-edge type soup)
- [ ] Supporting lines readable at ~1/3 phone width
- [ ] Contrast panels / options have internal padding
- [ ] No large empty mid band with only a tiny caption (sparse reject)

### Anti patterns (updated)

- AI imaginary hero art
- Fake metrics
- Tiny unreadable type **or** oversized empty margins with small type
- **Oversized display that overflows / touches crop**
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
