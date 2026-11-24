# Virality playbook for Signal packs

Load with every draft. Complements [`brand/ENGAGEMENT.md`](../../brand/ENGAGEMENT.md).
Does **not** permit farming. Goal: distribution that compounds trust.

## Pack checklist (hard gate before `ready`)

- [ ] **One scroll stop creative** preferred for X growth tests (`hero_billboard`, `meme_real`, `data_frame`, `receipt_collage`). Carousel only if every frame is a hero and the angle needs beats.
- [ ] **Hook in line 1** is quoteable and disagreeable enough to invite a take.
- [ ] **Comment magnet** is a fork or lived ask (see `x.yml` / `linkedin.yml`). Ban "Thoughts?" and "Agree?".
- [ ] **Tags** ≤ 3 relevant entities that appear in the receipt. No pod tagging.
- [ ] **Links**: LinkedIn can carry source URLs after the insight. X puts URLs in **first reply** by default (cost + dwell).
- [ ] **Author ops plan** in brief: seed reply text + how you will answer first 5 comments.
- [ ] **Same thesis**, platform native shape: X short; LinkedIn story + white space.
- [ ] Zero product / follow / DM CTAs.

## Growth stack (order of leverage)

1. **Daily replies** into other people's threads (largest proven lever on this account)
2. **Comment magnet + fast author replies** on your own post
3. **Single hero creative** that earns dwell and copy link shares
4. **Profile clarity** (bio, pin, LinkedIn headline) so new visitors convert

Craft without distribution is theater. Distribution without craft is spam. Signal needs both.

## Creative preference for reach tests (2026-10+)

| Rank | Format | Why |
|------|--------|-----|
| 1 | `hero_billboard` | One agency frame, max dwell, works on both platforms |
| 2 | `meme_real` | Irony + shareability when the angle is cultural |
| 3 | `receipt_collage` | Newsjack with proof |
| 4 | `data_frame` | One honest comparison |
| 5 | carousel | Teaching arcs only; historically weak reach here |

## Comment magnet formula

1. Name the stake in plain language
2. Offer two real options (or an open slot: "where did X fail")
3. Demand one reason / one case
4. Stay answerable in under 20 words

## Meta fields to add

```yaml
virality:
  comment_magnet: ""
  tags_x: []
  tags_linkedin: []
  links_in_post: []      # LinkedIn ok; X usually empty
  links_in_first_reply: []
  format: hero_billboard
  experiment: single_hero_vs_carousel
```

## Field notes from X community operators (2026-11-08)

Context from a person who used to run strong X communities. Internal only, never quote it in a post.

What reliably works on X, in order of fit for Signal:
1. **Shitposting**, especially **creative shitposting**: a real thing from your life, framed as a joke with a crypto native punchline (portfolio update of stickers, zero airdrops).
2. **Giveaways / rewards**: give away something real (a spare sticker, a sticker pack, a review slot). Must be real and fulfilled.
3. **Job search posts**: hiring or looking posts get shared far beyond the follower graph.

How to apply: default new packs to a creative shitpost register on top, with one honest, slightly controversial opinion underneath. Be direct about what you actually think (example: "I don't collect swag, and still came home with this much in 7 days"). Roast categories, praise names.

### Share CTA experiment (2026-11-08 pack, owner approved)
Owner asked for a CTA that drives shares. Used: "Quote this with your idea. Best one gets a sticker." (quote tweets are shares) and "Tag the friend still wearing their lanyard." (audience tags, not author tags). Tags spread across the thread, max 3 per tweet, each one an object in the photo. Compare this pack's quotes and reposts at 72h against earlier packs before making it the default.

### Storyline carousel (2026-11-19, owner request)
Owner asked for controversial plus informative, with a hook, clean data in creatives, and a storyline where text and creatives connect. Built as 4 beats (crash, pattern, buyer, your move): each slide footer teases the next, LinkedIn uses the same numbered beats, and each X thread tweet expands one slide. Controversy lands on one honest opinion against your own camp (a web3 builder saying Bitcoin is not digital gold yet). Compare replies and saves at 72h against the 2026-11-08 sticker pack.
