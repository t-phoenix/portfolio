# Schedule suggestions — 2026-09-12 pack

Timezone: **Asia/Kolkata** · Shipping window refreshed **2026-09-13** (pack date slots for Sep 12 are past).

Pick one slot, then run from `ops/publish/`:

```bash
npm run schedule -- --date 2026-09-12 --x <iso> --linkedin <iso>
```

| Rank | Label | When (IST) | Score | Why |
|------|-------|------------|-------|-----|
| 1 | Morning prime | `2026-09-13T09:00:00+05:30` | 95 | Sunday builder skim; soonest clean slot |
| 2 | Evening prime | `2026-09-13T19:15:00+05:30` | 93 | After work India + EU overlap |
| 3 | Next morning | `2026-09-14T09:00:00+05:30` | 88 | Monday morning if reviewing overnight |
| 4 | Midday scroll | `2026-09-13T12:45:00+05:30` | 85 | Lunch; LinkedIn often stronger |
| 5 | Late edge | `2026-09-13T21:00:00+05:30` | 78 | US East afternoon for X |

## Notes

- Suggestions are advisory. You lock the schedule.
- Same timestamp on both platforms is fine for v1.
- To post immediately: schedule a past/now ISO then `PUBLISH_DRY_RUN=false npm run publish-due`.
