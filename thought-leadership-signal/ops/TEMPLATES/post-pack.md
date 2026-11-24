# Post pack template

Copy into `queue/YYYY-MM-DD/`.

---

## brief.md

```md
# Brief — YYYY-MM-DD

## Pillar

## Receipts (required)
1. What happened — source URL — date
2.

## Numbers (if honest)
- metric: value (source, as of DATE)

## Angle

## Emotional bridge

## Hook candidates
1.
2.
3.

## Insight

## Comment magnet (required)
<!-- fork or lived ask; ban Thoughts? / Agree? -->

## Tags
- X:
- LinkedIn:

## Links
- In LinkedIn body:
- In X first reply:

## Author ops
- Seed reply text:
- First hour: reply to every comment

## Creative format
<!-- prefer hero_billboard | meme_real | data_frame | receipt_collage; carousel only if earned -->

## Real assets to use
- photography:
- logos / marks:
- screenshots:
- chart data:
```

---

## x.md / linkedin.md

Follow VOICE + [`research/virality/playbook.md`](../../research/virality/playbook.md).  
Name the receipt. No hyphens or dashes. Include `## First reply (X)` with source links.

---

## meta.yml

```yml
date: YYYY-MM-DD
status: draft   # draft | ready | scheduled | posted | failed | killed
pillar: web3-ai
platform_targets: [x, linkedin]
creative_format: hero_billboard
hook: ""
receipts: []
numbers: []
creative_assets: []
virality:
  comment_magnet: ""
  tags_x: []
  tags_linkedin: []
  links_in_post: []
  links_in_first_reply: []
  experiment: single_hero_vs_carousel
spend_usd: 0.00
spend_breakdown: []
notes: ""
schedule:
  timezone: Asia/Kolkata
  suggestions: []
  chosen:
    x: null
    linkedin: null
  published:
    x: null
    linkedin: null
```

After creatives: set `status: ready`, run `ops/publish` suggest-times, then schedule to lock times (`status: scheduled`).
