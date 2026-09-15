# Pipeline — Thought Leadership Signal

## Cadence

- One angle per day
- Publish ready packs for **X** and **LinkedIn**
- No product CTAs, no follow / DM / link in bio prompts

Session learnings (X OAuth, costs, dry-run traps, thesis arc): [`LEARNINGS.md`](LEARNINGS.md). Cursor rule: `.cursor/rules/thought-leadership-signal.mdc`.

## Daily checklist

1. **Research check**  
   Ensure `research/` has fresh receipts (news + social). Prefer 2 to 3 day reuse. See [`AGENTCASH.md`](AGENTCASH.md).

2. **Pick**  
   One pillar from [`topics/TOPICS.yml`](../topics/TOPICS.yml) + one real signal. Follow [`topics/SELECTION.md`](../topics/SELECTION.md): Web3 only, AI only, or intersection — no forced mashup, no sequel of yesterday.

3. **Engagement gate**  
   Confirm the pack will create long term value per [`brand/ENGAGEMENT.md`](../brand/ENGAGEMENT.md). Kill farming angles.

4. **Brief**  
   `queue/YYYY-MM-DD/brief.md` must list receipts, numbers (if any), emotional bridge, insight.

5. **Copy**  
   `x.md` + `linkedin.md` per [`brand/VOICE.md`](../brand/VOICE.md). No hyphens or dashes.

6. **Creative**  
   Agency craft + real assets only ([`CREATIVE_PLAYBOOK.md`](../brand/CREATIVE_PLAYBOOK.md), [`ASSETS.md`](../brand/ASSETS.md)).  
   Never same format two days in a row. Respect [`BUDGET.md`](BUDGET.md).

7. **Log**  
   `meta.yml` includes `creative_assets`, `receipts`, spend. Set `status: ready`. Update budget ledger.

8. **Suggest times**  
   From `ops/publish/`:

   ```bash
   npm run suggest-times -- --date YYYY-MM-DD
   ```

   Review `queue/YYYY-MM-DD/schedule-suggestions.md`.

9. **Lock schedule** (you pick; AI only suggests)

   ```bash
   npm run schedule -- --date YYYY-MM-DD \
     --x 2026-09-10T09:30:00+05:30 \
     --linkedin 2026-09-10T09:30:00+05:30
   ```

   Sets `status: scheduled`.

10. **Auto ship**  
    GitHub Action `signal-publish` runs every 5 minutes via `publish-due`.  
    When both platforms succeed → `status: posted` → pack moves to `archive/YYYY-MM-DD/`.  
    See [`publish/README.md`](publish/README.md).

## Post formula

1. Agency creative (real assets)
2. Crazy HOOK
3. Story / emotional bridge tied to receipt
4. Insight (+ honest number or diagram)
5. Experience based comment invite

## Weekly rhythm

| Day | Focus |
|-----|--------|
| Mon / Thu | Research batch |
| Daily | One pack + schedule |
| Sun | Budget + engagement review |

## Status values

`draft` · `ready` · `scheduled` · `posted` · `failed` · `killed`

Auto-publish runs **only** for `scheduled` packs with `schedule.chosen` timestamps.
