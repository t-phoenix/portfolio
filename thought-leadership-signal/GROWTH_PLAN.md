# Growth Plan — X and LinkedIn

Written 2026-10-02. Baseline data pulled the same day from twitterapi.io.
LinkedIn profile and post stats could not be read (see Gaps).

## 1. Where things stand

| Measure | Value |
|---|---|
| X followers / following | 497 / 666 |
| X account age, total posts | Since Dec 2013, 2,135 posts |
| Signal posts published | 7 (9 Sept to 24 Sept) |
| Signal posts, views each | 24 to 49, median 31 |
| Signal posts, total likes | 1 |
| AgentCash balance | $0.88 |

### What your own history says works

Last 60 posts and replies on X, grouped:

| Type | Examples | Views |
|---|---|---|
| Signal carousels | All seven | 24 to 49 |
| Casual text posts | "HTTP 402 sat unused for 30 years" (65), hills photos (52, 132) | 35 to 130 |
| Event and build posts | ETHGlobal New Delhi (754, 288), ETHOnline team post (1,037), Jaipur (182) | 180 to 1,040 |
| Replies to other accounts | @vovudebosh (410), @panditdhamdhere (369), @devfolio (294), @shafu0x (263) | Often 150 to 400 |
| Outliers | Quote of 0xPPL meetup (5,099), reply to @heart_ (5,068) | 5,000+ |

Three conclusions:

1. A one line reply in someone else's thread reaches about ten times more people than a Signal carousel that took hours.
2. Posts where you are physically present or building something beat commentary on other people's news.
3. The Signal posts are your lowest performing content on the account. The craft is not the problem; nobody is being shown them.

### Profile audit

**X bio (current):** "Explorer of Worlds | Free Spirit, Passionate about Art, Music, Culture and Sports, Blockchain Developer | Entrepreneur | Innovating from Laptop."

- Says nothing a visitor can use to decide to follow. No role, no proof, no topic.
- Pinned post is from January 2025 (Hackernoon Top 3 Finance writer, 1,465 views). Good proof, but 20 months old and unrelated to what Signal posts about.
- Display name is "abhinil", lowercase, no surname. Harder to find and to cite.

**You currently present four different identities:**

| Surface | Says you are |
|---|---|
| X bio | Explorer, free spirit, blockchain developer |
| abhinil.in title | Web3 Developer and Blockchain Engineer, Solidity Expert |
| Master resume | Technical Product Leader, Web3 · AI · Finance |
| Signal docs | Web3 x AI builder / CTO |

**The strongest fact about you is not used anywhere in public posts:** you built contract infrastructure for an onchain private credit platform that scaled to $2B+ bridged. The 12 Sept post was about onchain credit against settlement receivables and never mentioned you have done this work.

## 2. Positioning: pick one sentence

Recommended:

> I build the rails that let money move onchain, and I explain how credit, settlement and agents actually work.

Why this one: it is backed by the $2B credit work, it covers your best Signal topics (stablecoin settlement, x402, agents with wallets), and it is narrow enough to be remembered.

Cut the eight pillars in `topics/TOPICS.yml` to three:

1. **Onchain credit and settlement** (your proof)
2. **Agents that move money** (x402, wallets, permissions)
3. **Builder reality** (hackathons, shipping, working from the hills)

Park DAOs, memetics, macro history and AI x markets until one of the three has traction.

### Bio drafts

Check before using: confirm Pact Labs / CosX are fine with you citing the $2B figure publicly.

**X bio (under 160 characters):**

> CTO at ADPR. Built contracts behind $2B+ of onchain private credit. I explain how money, agents and incentives really work. Shipping from the Himalayas.

**X name:** Abhinil Agarwal

**X pinned post:** replace with a new one, written by you: who you are, the credit work, three things you write about, one link to abhinil.in. This is the only place a link and a follow ask belong.

**LinkedIn headline:**

> CTO, ADPR Memetic Brand Labs | Built onchain private credit rails ($2B+ bridged) | Writing on stablecoin settlement, AI agents and incentive design

**LinkedIn About, first two lines (the only part shown before "see more"):**

> I spent a year building the smart contracts behind an onchain private credit platform that grew past $2B. Now I write about what that taught me: how settlement, credit and AI agents work when real money is on the line.

**abhinil.in:** change the page title and meta description to match the same sentence.

## 3. Content changes

### Mix (4 posts a week, not 7)

| Slot | Type | Source |
|---|---|---|
| Mon | **Lived**: something you built, broke or decided | A 5 minute voice note or rough notes from you |
| Wed | **Receipt**: news through your experience | Existing research pipeline |
| Fri | **Lived** or **model**: one of your named ideas with a new case | Evergreen angles in `TOPICS.yml` |
| Sun | **Human**: hills, hackathon, what you are building | A photo and two lines from you |

### Rules to change in the brand docs

| Current rule | Change to | Why |
|---|---|---|
| Daily cadence | 4 a week | Seven posts in 24 days is the real pace; plan for it |
| Proof points "sparingly" | At least 2 lived posts a week | No personal brand without the person |
| No sequel theses | Named models may return with new evidence | Repetition is how a model gets attached to your name |
| Zero CTAs, zero links | Still none in posts; pinned post and bio carry the one link | Gives attention somewhere to go |
| No hyphens or dashes | Ban em dashes only | Stops phrases like "stablecoin linked card programs" |
| Same copy shape on X and LinkedIn | X: one strong tweet plus one image, thread only when earned. LinkedIn: carousel plus story | Your short X posts outperform the 6 tweet threads |
| Receipt may be unnamed | Always name who and link in research | The 3 Oct pack cites "one person read 19 projects" with no name |

### Format test on X

Your best non-event original post in 2026 was plain text: "HTTP 402 was added to the spec in 1996. It sat unused for 30 years." Run the next four X posts as a single tweet with one image and compare against the carousel thread baseline of 31 views.

## 4. Replies: the main growth lever

Target: 5 to 8 real replies a day, about 15 minutes.

- Build a watchlist of 30 accounts in `ops/WATCHLIST.yml`: 10 large (50k+) in stablecoins, onchain credit and agent payments, 15 mid sized builders (2k to 50k) who reply back, 5 Indian ecosystem accounts (ETHGlobal India, Devfolio, HackTour, Base India) where you already get reach.
- Reply within the first hour of their post, with a fact from your own work. "We hit this at $2B: the daily settlement file was the hard part, not the contract" beats any opinion.
- Reply to every comment on your own posts the same day.
- On LinkedIn, leave 3 substantive comments a day on posts from people in credit, payments and AI infrastructure.

## 5. What to automate and what stays manual

### Automate

| # | Job | How | Cost | Your time |
|---|---|---|---|---|
| A1 | **Metrics collector**: views, likes, replies, bookmarks for each Signal post at 24h, 72h, 7d | New `ops/publish/src/collect-metrics.mjs` using twitterapi.io reads; writes `metrics:` into each `meta.yml` and appends to `ops/metrics/ledger.csv`; runs in the existing GitHub Action daily | Fractions of a cent per run | 0 |
| A2 | **Follower snapshot**: daily follower and following count | Same script, one extra call, appended to `ops/metrics/followers.csv` | Same | 0 |
| A3 | **Reply radar**: each morning, fetch the latest posts from the watchlist, rank by freshness and low reply count, draft two reply options each in your voice | New script plus a drafting pass; output to `mind/DAILY_DISPATCH.md` | Small read cost | You pick and post, 15 min |
| A4 | **Reply tracking**: log the views your replies earn, by account replied to | Part of A1; reorders the watchlist | Included | 0 |
| A5 | **Research and drafting** of receipt posts | Already built | AgentCash, needs top up | 5 min approve |
| A6 | **Lived post drafting**: turn a voice note or rough notes into X and LinkedIn copy | Drop notes in `mind/nooks/inbox/`; drafting pass builds the pack | 0 | 5 min note, 5 min approve |
| A7 | **Scheduling and publishing** | Already built | ~$0.015 per X post | 0 |
| A8 | **Weekly review**: report, updated weights, next week's plan | Scheduled Sunday task; see section 6 | 0 | 10 min read |
| A9 | **Housekeeping**: move posted packs to `archive/`, keep the thesis table current | Add to `publish-due` | 0 | 0 |

### Keep manual

| Job | Why it cannot be automated | Time |
|---|---|---|
| Posting replies and comments | X's automation rules do not allow automated replies, and accounts that do it get limited. Drafts are automated; sending is yours | 15 min a day |
| The raw material for lived posts | Only you know what happened | 5 min, twice a week |
| Approving each post before it is scheduled | Your name is on it | 5 min per post |
| Bio, pinned post, LinkedIn About | One time, account settings | 30 min once |
| LinkedIn numbers | The token is post only and LinkedIn restricts read access; paste impressions weekly, or reconnect the Chrome extension so it can be read for you | 2 min a week |
| DMs and real relationships | The point of the whole exercise | As they come |
| Photos from the hills and events | Your second best performing content type | As they happen |

**Total: about 25 minutes a day, plus 30 minutes on Sunday.**

## 6. The self learning loop

### Tag every post

Add to each `meta.yml`:

```yaml
experiment:
  pillar: credit-settlement | agents-money | builder-reality
  type: lived | receipt | model | human
  hook: number | story | reframe | scale
  x_format: single_image | thread_carousel | text_only
  slot: morning | evening
metrics:
  x: { h24: {views, likes, replies, bookmarks}, h72: {...}, d7: {...} }
  linkedin: { d7: {impressions, reactions, comments} }
```

### Score

For each post: `views at 72h ÷ followers that day`, plus `(likes + replies + bookmarks) ÷ views`. Dividing by followers keeps scores comparable as the account grows.

### Weekly review (Sunday, automated)

1. Compute median score per tag value (per pillar, per type, per hook, per format).
2. Write `ops/metrics/weekly/YYYY-WW.md`: what won, what lost, follower change, best reply of the week.
3. Update weights in `TOPICS.yml`: next week's four posts are picked 70% from the top scoring tags, 30% from untested ones.
4. Propose **one** experiment for the week, changing a single variable.
5. Append confirmed findings to `ops/LEARNINGS.md`.

### Guardrails

- No conclusion from fewer than 5 posts per variant. At 4 posts a week, a clean comparison takes about 3 weeks.
- A tag is dropped only after 5 posts all below the median.
- Every rule change the loop proposes goes in the weekly report for you to accept; it does not rewrite brand docs on its own.

## 7. Targets and timeline

Baseline: 497 followers, 31 median views per Signal post, 0 bookmarks. These targets are estimates from your own reply and event numbers, not guarantees.

| Period | Do | Check |
|---|---|---|
| Week 1 | New bio, name, pinned post, LinkedIn headline and About. Build A1 and A2. Create the watchlist. Top up AgentCash | Metrics landing in `meta.yml` daily |
| Weeks 2 to 4 | 4 posts a week in the new mix, daily replies, A3 and A8 running | Median views per post above 150; replies averaging above 200 views |
| Days 30 to 60 | First tag conclusions; drop the weakest type; test single image vs carousel | Follower growth positive every week; first bookmarks and inbound DMs |
| Days 60 to 90 | Start one weekly long form piece on abhinil.in from the best performing model | Profile visits to follower conversion tracked; one named model quoted back by someone else |

## 8. Gaps in this plan

- **LinkedIn was not audited.** The profile page needs a login and the Chrome extension was not connected, so the headline and About drafts above are written without seeing the current ones. LinkedIn post stats are also unread.
- **Posting time was not analysed.** All seven Signal posts went out in similar slots, so there is nothing to compare.
- **The $2B figure** needs your confirmation that it can be stated publicly.
