# Signal Publish — X + LinkedIn scheduler

Cheap, approval-gated publisher for Thought Leadership Signal packs.

## Flow

1. Finish pack → `meta.yml` `status: ready`
2. `npm run suggest-times -- --date YYYY-MM-DD` → AI / heuristic options
3. Pick a slot → `npm run schedule -- --date YYYY-MM-DD --x <iso> --linkedin <iso>`
4. GitHub Action runs `publish-due` every 5 minutes
5. When due → posts → `status: posted` → moves pack to `archive/`

## Status values

`draft` · `ready` · `scheduled` · `posted` · `failed` · `killed`

Auto-publish only when `status: scheduled` and `schedule.chosen.*` times are set.

## Setup

```bash
cd thought-leadership-signal/ops/publish
cp .env.example .env
npm install
```

### LinkedIn (free)

1. Create an app at [LinkedIn Developer Portal](https://www.linkedin.com/developers/apps)
2. Products → add **Sign In with LinkedIn using OpenID Connect** and **Share on LinkedIn**
3. Auth tab → redirect URL `http://localhost:8765/callback` (match `.env`)
4. Copy Client ID / Client Secret into `.env`
5. Run:

```bash
npm run linkedin-auth
```

Browser opens; after consent, tokens are printed. Paste `LINKEDIN_ACCESS_TOKEN`, `LINKEDIN_REFRESH_TOKEN`, and `LINKEDIN_PERSON_URN` into `.env` (and GitHub Actions secrets).

Scopes used: `openid profile w_member_social`  
Rate limits (Share on LinkedIn): 150 requests / member / day — enough for 1–2 posts/day.

### X — Official API (preferred, pay-per-use, post-only)

Cheapest reliable path for 1 thread/day. No proxy. No login cookies.

1. Open [console.x.com](https://console.x.com) → create Project + App
2. User authentication settings → **Read and write** (not read-only)
3. Keys and tokens → generate **API Key + Secret** and **Access Token + Secret** for your account (`@touchey_phoenix`)
4. Paste into `.env`:

```bash
X_API_KEY=...
X_API_SECRET=...
X_ACCESS_TOKEN=...
X_ACCESS_SECRET=...
X_PROVIDER=auto
X_ALLOW_URLS=false
```

**Cost controls (approx 2026 pay-per-use)**

| Action | Cost | Our rule |
|--------|------|----------|
| Text / media post | ~$0.015 | Allowed |
| Post with a URL | ~$0.20 | Blocked unless `X_ALLOW_URLS=true` |
| Reads / search | billed | **Never called** by this publisher |

Example: 1 thread × 6 tweets + 1 image ≈ **~$0.09/day** ≈ **~$2.70/month**. Set a low spend cap in the X console.

`X_PROVIDER=auto` uses official when those four keys are set; otherwise falls back to twitterapi.io.

### X — twitterapi.io (fallback)

Dashboard **API key** + **user id** alone are not enough to post. Writes need a session (`login_cookies`) plus a **static residential proxy**.

1. Copy your API key from [twitterapi.io](https://twitterapi.io) → `TWITTERAPI_API_KEY` (user id is billing only; ignore for posting)
2. Get a static residential proxy (e.g. Webshare) → `X_PROXY_URL=http://user:pass@host:port`
3. In `.env` set `X_EMAIL`, `X_PASSWORD`, and ideally `X_TOTP_SECRET` (X 2FA base32 seed from “can’t scan QR”)
4. Run once:

```bash
npm run x-login
```

That calls `/twitter/user_login_v2` and saves `TWITTERAPI_LOGIN_COOKIES` into `.env`. Re-run when cookies expire.

Do **not** hand-write cookies. Prefer `login_cookies` (v2) over legacy `auth_session`.

Approx cost: ~$0.001–$0.003 per tweet + proxy. Blocked today if 2FA/TOTP login fails.

### GitHub Actions secrets

| Secret | Purpose |
|--------|---------|
| `LINKEDIN_CLIENT_ID` | OAuth |
| `LINKEDIN_CLIENT_SECRET` | OAuth |
| `LINKEDIN_ACCESS_TOKEN` | Posting |
| `LINKEDIN_REFRESH_TOKEN` | Refresh |
| `LINKEDIN_PERSON_URN` | `urn:li:person:…` |
| `X_API_KEY` | Official X (preferred) |
| `X_API_SECRET` | Official X |
| `X_ACCESS_TOKEN` | Official X |
| `X_ACCESS_SECRET` | Official X |
| `X_PROVIDER` | `auto` / `official` / `twitterapi` |
| `X_ALLOW_URLS` | Keep `false` |
| `TWITTERAPI_API_KEY` | Fallback |
| `TWITTERAPI_LOGIN_COOKIES` | Fallback session |
| `TWITTERAPI_AUTH_SESSION` | Alt session |
| `X_PROXY_URL` | Fallback proxy |
| `X_SCREEN_NAME` | Default `touchey_phoenix` |
| `PUBLISH_DRY_RUN` | Set `false` for live posts |

Workflow: [`.github/workflows/signal-publish.yml`](../../../../.github/workflows/signal-publish.yml)

## CLI

```bash
# Suggest 3–5 IST slots for a pack
npm run suggest-times -- --date 2026-09-09

# Lock schedule (sets status: scheduled)
npm run schedule -- --date 2026-09-09 \
  --x 2026-09-10T09:30:00+05:30 \
  --linkedin 2026-09-10T09:30:00+05:30

# Dry-run publish of anything due
PUBLISH_DRY_RUN=true npm run publish-due
```

## Safety

- Start with `PUBLISH_DRY_RUN=true`
- Never commit `.env`
- Refresh LinkedIn tokens before 60-day access expiry (refresh token lasts longer)
- Re-login twitterapi.io session if posts start failing auth
