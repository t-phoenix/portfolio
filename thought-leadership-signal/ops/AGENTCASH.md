# AgentCash map — Thought Leadership Signal

## Origins

| Origin | Role |
|--------|------|
| `https://stableenrich.dev` | News, Exa search, Reddit discourse, Serper |
| `https://stablememes.dev` | Real Imgflip meme templates (allowed) |
| `https://stablestudio.dev` | **Restricted** — layout assist only if needed; never AI imaginary hero scenes |
| `https://stablesocial.dev` | Avoid by default ($0.06); Enrich Reddit first |

## Research (prefer)

| Endpoint | Cost | Use |
|----------|------|-----|
| Exa search | $0.01 | Primary discovery |
| Exa answer | $0.01 | Synthesis with citations |
| Exa contents | $0.002 | Deepen a URL |
| Serper news | $0.04 | 1 to 2× / week |
| Reddit search | $0.02 | Discourse + engagement numbers |

Always pay on **Solana** when Base is empty for Enrich routes.

## Creatives

| Need | Path | Note |
|------|------|------|
| Meme | StableMemes automeme / ai_meme | Real templates |
| Carousel / diagram / quote / chart | **Studio HTML → PNG** (local) | Default; $0; agency craft |
| Photoreal scene | **Forbidden via AI** | Use Wikimedia / own photo / licensed stock |

StableStudio image models are last resort for **abstract texture only**, never faces, cities, products, or fake UI. Prefer not to use them.

## Batch recipe (≤ $0.08)

1. Exa × 2 ($0.02)
2. Reddit × 1 ($0.02)
3. Optional Serper news ($0.04)

Capture **real metrics** (scores, comments, dates) into research for chart slides.

## Publishing (not AgentCash)

Do **not** use AgentCash `agntos.dev` social endpoints for Abhinil's personal handles (those target agent-owned accounts).

| Platform | Path | Cost |
|----------|------|------|
| LinkedIn personal | Official Share on LinkedIn OAuth | $0 |
| X (preferred) | Official pay-per-use API, post-only | ~$0.015/tweet; avoid URLs (~$0.20) |
| X (fallback) | twitterapi.io + residential proxy | ~$0.001–0.003/post + proxy |

See [`publish/README.md`](publish/README.md) and [`LEARNINGS.md`](LEARNINGS.md). AgentCash may still enrich **suggest-times** research only.

## Safety

- `get_balance` before paid research batches
- Daily gate $0.35 for AgentCash research/creatives
- Log spend in research + queue meta
- Base USDC needed for StableMemes; Solana or Base for Enrich
