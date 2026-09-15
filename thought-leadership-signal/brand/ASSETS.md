# Real Asset Library

**Hard rule:** hero visuals come from the real world. Do not use AI invented people, places, products, or charts.

AI tools may help with **layout rasterization** (HTML → PNG) or **captioning real meme templates**. They must not invent the subject matter.

## Allowed sources

| Type | Where | Notes |
|------|-------|--------|
| Photography | Wikimedia Commons, your own shots, licensed stock with attribution | Store files + credit in `ATTRIBUTION.md` |
| Brand marks | Official press kits, Simple Icons, Wikimedia | Only marks you are discussing or citing as source |
| Memes | StableMemes / Imgflip **templates** (real meme corpus) | Caption your joke; do not generate fake photoreal scenes |
| Social / news receipts | Screenshots you capture, or cropped public pages | Show enough to verify; do not fabricate UI |
| Charts / numbers | Your research notes, public dashboards, on chain explorers | Cite source + date on the creative or in `brief.md` |
| NFTs / on chain art | Token media URLs you cite | Credit collection / token id |
| Icons | Simple Icons, Phosphor, Heroicons (real icon sets) | Prefer mono marks in the studio system |
| Characters | Licensed comics / known meme characters via template platforms | No AI "original characters" |

## Library layout

```
brand/assets/
  photography/     # real photos
  logos/           # brand / product marks
  screenshots/     # news & social receipts
  memes/           # exported meme templates used
  charts/          # exported chart images from real data
  ATTRIBUTION.md   # required credits
```

Pack local copies live under `queue/YYYY-MM-DD/creative/assets/` so packs stay portable.

## Forbidden

- AI generated faces, hands, offices, cities, or "cinematic metaphors"
- Fake dashboards with made up KPIs
- Logos of brands unrelated to the post (confusion + legal risk)
- Uncredited photography
- Deepfakes or misleading edits of real people

## How to use marks

1. Editorial / commentary context only
2. Keep mark small as a **source chip**, not as endorsement
3. Pair with the real URL or handle in research notes
4. Prefer monochrome treatment inside the Signal type system

## How to use numbers

1. Pull from `research/YYYY-MM-DD/` (Reddit scores, news figures, on chain stats)
2. Label the date and source on chart slides when space allows
3. If the number is approximate, say so ("about", "as of DATE")
4. Never invent a statistic to fill a layout

## Attribution file

Every asset folder that holds third party media must have `ATTRIBUTION.md` entries:

```md
| File | Source | License / terms | Used in |
|------|--------|-----------------|---------|
| wikimedia-shibuya-crossing.jpg | Wikimedia Commons | per file page | 2026-09-08 carousel |
```
