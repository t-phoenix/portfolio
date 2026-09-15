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

## Comment invite

## Creative format
<!-- from CREATIVE_PLAYBOOK -->

## Real assets to use
- photography:
- logos / marks:
- screenshots:
- chart data:
```

---

## x.md / linkedin.md

Follow VOICE. Name the receipt in copy when you lean on it. No hyphens or dashes.

---

## meta.yml

```yml
date: YYYY-MM-DD
status: draft   # draft | ready | scheduled | posted | failed | killed
pillar: web3-ai
platform_targets: [x, linkedin]
creative_format: carousel_studio
hook: ""
receipts: []
numbers: []
creative_assets: []
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
