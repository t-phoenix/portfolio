# Signal publish + pack learnings

Living notes so a new session can ship without re-deriving failures. Update when something bites twice.

## X — Official pay-per-use (preferred)

| Item | Detail |
|------|--------|
| Credentials | `X_API_KEY`, `X_API_SECRET`, `X_ACCESS_TOKEN`, `X_ACCESS_SECRET` in `ops/publish/.env` |
| Provider | `X_PROVIDER=auto` uses official when all four set; else twitterapi.io |
| Cost | ~$0.015 text/media post; **~$0.20 if tweet contains a URL** |
| Guard | `X_ALLOW_URLS=false` (default). Publisher is **post-only** (no search/read loops) |
| Credits | Console must have pay-per-use balance. Bearer `402 credits depleted` means top up first |
| Permissions | App **Read and write**. Saving auth settings needs Website + Callback even if we never use browser OAuth |
| Suggested URLs | Website `https://www.abhinil.in` · Callback `http://localhost:8765/callback` |
| Account | Access token must be for `@touchey_phoenix` (user id `2253716034`) |

### Credential failure modes (seen live)

1. **403 oauth1-permissions** — App still Read-only, or Access Token minted before Read/write. Fix permission → **regenerate Access Token+Secret**.
2. **401 Could not authenticate you** on `verify_credentials` / `request_token` — Consumer Key/Secret mismatch (not a matching regenerate pair), or Access Secret not paired with Access Token. Bearer working does **not** prove OAuth1 consumer pair.
3. **Wrong paste** — OAuth 2.0 Client ID (~34 chars) into `X_API_KEY` (real Consumer API Key is ~25). Never use Client ID/Secret for OAuth1 posting.
4. After any key regenerate, paste **all related fields from the same app page** in one pass.

### Auth smoke test (no post)

From `ops/publish/`:

```bash
node --input-type=module -e "
import OAuth from 'oauth-1.0a';
import crypto from 'node:crypto';
import { loadEnv } from './src/lib.mjs';
const o = loadEnv().xOfficial;
const oauth = OAuth({
  consumer: { key: o.apiKey, secret: o.apiSecret },
  signature_method: 'HMAC-SHA1',
  hash_function(b,k){ return crypto.createHmac('sha1',k).update(b).digest('base64'); }
});
const token = { key: o.accessToken, secret: o.accessSecret };
const req = { url: 'https://api.x.com/1.1/account/verify_credentials.json', method: 'GET' };
const res = await fetch(req.url, { headers: { ...oauth.toHeader(oauth.authorize(req, token)) } });
console.log(res.status, await res.json());
"
```

Expect `200` + `screen_name: touchey_phoenix` before live publish.

### Successful live posts

- 2026-09-09 → https://x.com/touchey_phoenix/status/2098018729426866447
- 2026-09-10 (Day 3 desk/vault) → https://x.com/touchey_phoenix/status/2098489772671156656  
  LinkedIn: `urn:li:ugcPost:7504255519499436033`  
  Archived to `archive/2026-09-10/`
- 2026-09-11 (x402 key on wire) → https://x.com/touchey_phoenix/status/2099082674526973971  
  LinkedIn: `urn:li:ugcPost:7504848419010691072`  
  Archived to `archive/2026-09-11/`

### Ship flow that worked (2026-09-12 session)

1. Pack must be `status: ready` with slides exported
2. `npm run schedule -- --date YYYY-MM-DD --x <iso now/past> --linkedin <iso>`
3. `PUBLISH_DRY_RUN=false npm run publish-due` from `ops/publish/`
4. Only `scheduled`/`failed` packs publish; do not schedule other queue dates by accident
5. LinkedIn may return `url: null` — construct feed URL from `urn:li:ugcPost:…`

## twitterapi.io (fallback only)

- Needs API key + `login_cookies` + static residential proxy
- `npm run x-login`; TOTP/`OTP_REQUIRED` often blocks even with `X_TOTP_SECRET`
- Prefer official path when OAuth1 works

## LinkedIn

- Free Share API; `npm run linkedin-auth` writes tokens to `.env`
- MultiImage = organic carousel
- Keep LinkedIn API version current (stale `202401` failed; use current YYYYMM)
- Day 2 LI: `urn:li:ugcPost:7503763763062403072`

## publish-due behavior

- Only `scheduled` or `failed` packs
- Skip platform if `schedule.published.*` already set
- **`isPublished` must ignore `dryRun: true`** so dry runs never block live
- Live + both platforms done → `posted` + move to `archive/`
- Default dry run: `PUBLISH_DRY_RUN` unset/true. Live: `PUBLISH_DRY_RUN=false`

## Pack / creative lessons

- No hyphens/dashes in outward copy
- Numbers in thread/caption only; creatives carry frame/model, not duplicated stats
- Never same creative format two days running
- Prefer local HTML→PNG (puppeteer) over paid image gen
- Long tweets (>280) only if account supports; otherwise shorten before live

### Thesis arc (avoid repeats)

| Date | Thesis | Format |
|------|--------|--------|
| 2026-09-08 | Incentive bug when agents sell mid-task / keys risk | (studio / frame) |
| 2026-09-09 | Soft edges fail first (transition risk, probing) | teal rail / studio |
| 2026-09-10 | Desk not vault — permission is the product | carousel_clearance |
| 2026-09-11 | x402 MCP npm package transmitted raw wallet key | code_receipt |
| 2026-09-12 | Settlement scaled → float needs a lender (Visa / Credit Coop) | diagram_systems |
| 2026-09-13 | Issuer builds the chain (Circle Arc / USDC gas) | quote_editorial |
| 2026-09-14 | 99.9% and 62.7% are the same model (harness vs weights) | data_frame |

**Hard ban after this week’s arc:** do not ship another “agent trust / MCP / desk / key on the wire” sequel. Pick Web3-only, AI-only (non-MCP-exfil), DeFi, stablecoins, builder ops, or a new mechanism.

## Topic breadth (user direction 2026-09-11+)

- Not always Web3 x AI. Web3 alone, AI alone, or intersection are all valid.
- Technical depth + tasteful code snippets on creatives are allowed.
- Open lanes: x402, web3 finance, contracts, DeFi, LLM, agents, skills, MCP, etc.
- See [`topics/SELECTION.md`](../topics/SELECTION.md). Do not ship sequel theses of the prior day.

## Creative density + readability (user direction 2026-09-11 + 2026-09-13)

User reject criteria (hard gate before `ready`):

1. **Bold capturing hook** — slide 1 must stop the scroll, but stay readable.
2. **Not sparse** — no void posters with tiny type in a desert.
3. **Not over-dense** — no wall-to-wall type, no text kissing/leaving the crop, no cramped boxes.
4. **Safe inset ~52–60px**; hero display usually **76–88px**; body **24–30px**. Limited gaps (~14–22px).
5. Prefer normal-width faces for long words (Space Grotesk / Newsreader) over ultra-extended display that overflows.
6. Archive weak passes: `creative/archive-v1/` (sparse), `archive-v2-dense/` (overflow/cramp).
7. Canonical: [`brand/CREATIVE_PLAYBOOK.md`](../brand/CREATIVE_PLAYBOOK.md) → Density doctrine.

### Format rotation lock

Never same format two days running. After `code_receipt` (09-11) prefer diagram / studio / meme / receipt / data_frame / quote — not clearance again either (09-10).

## AgentCash research

- Prefer Cursor-native first; Enrich for news/Exa/Reddit
- Prefer **Base** when Solana/Tempo balance fails
- Log spend in `research/YYYY-MM-DD/spend.yml` + pack `meta.yml`
- Daily research gate ~$0.35; typical pack research ≤ ~$0.08

## Console checklist (new session)

- [ ] `.env` has matching Consumer + Access pairs; verify_credentials 200
- [ ] X credits > 0
- [ ] LinkedIn token still valid (re-auth if 401)
- [ ] Next queue date not repeating yesterday’s format or thesis
- [ ] Schedule only after human picks slot
