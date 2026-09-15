#!/usr/bin/env node
/**
 * Suggest best post times (IST) for a pack.
 * Uses creator heuristics + optional research freshness; does not auto-lock.
 */
import fs from "node:fs";
import path from "node:path";
import {
  ensureSchedule,
  loadEnv,
  packDir,
  parseArgs,
  readMeta,
  todayInTz,
  writeMeta,
} from "./lib.mjs";

const WINDOW_DEFS = [
  {
    id: "morning-prime",
    startHour: 8,
    startMin: 30,
    label: "Morning prime",
    rationale:
      "IST weekday morning when builders and operators skim feeds before deep work.",
    score: 90,
  },
  {
    id: "midday",
    startHour: 12,
    startMin: 45,
    label: "Midday scroll",
    rationale: "Lunch window; LinkedIn often stronger than X here.",
    score: 78,
  },
  {
    id: "evening-prime",
    startHour: 19,
    startMin: 15,
    label: "Evening prime",
    rationale: "After work engagement peak for India + EU overlap start.",
    score: 88,
  },
  {
    id: "late-edge",
    startHour: 21,
    startMin: 0,
    label: "Late edge",
    rationale: "US East afternoon overlap; good for X crypto discourse.",
    score: 72,
  },
  {
    id: "next-morning",
    startHour: 9,
    startMin: 0,
    label: "Next morning",
    rationale: "If shipping late tonight, park for tomorrow morning instead of low-signal hours.",
    score: 85,
    nextDay: true,
  },
];

function pad(n) {
  return String(n).padStart(2, "0");
}

function formatOffsetISO(date, hour, min, tz) {
  // Build a calendar date in tz, then attach +05:30 for Asia/Kolkata (Signal default).
  // For Asia/Kolkata we use fixed offset.
  const y = date.slice(0, 4);
  const m = date.slice(5, 7);
  const d = date.slice(8, 10);
  const offset = tz === "Asia/Kolkata" ? "+05:30" : "+05:30";
  return `${y}-${m}-${d}T${pad(hour)}:${pad(min)}:00${offset}`;
}

function addDays(isoDate, days) {
  const dt = new Date(`${isoDate}T12:00:00+05:30`);
  dt.setDate(dt.getDate() + days);
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(dt);
}

function weekdayName(isoDate) {
  const dt = new Date(`${isoDate}T12:00:00+05:30`);
  return new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Kolkata",
    weekday: "long",
  }).format(dt);
}

function researchBoost(date) {
  const researchDir = path.join(
    path.resolve(packDir(date), "../../research"),
    date
  );
  if (fs.existsSync(path.join(researchDir, "news.md"))) return 5;
  // try yesterday
  const y = addDays(date, -1);
  if (fs.existsSync(path.join(path.resolve(packDir(date), "../../research"), y, "news.md")))
    return 3;
  return 0;
}

function buildSuggestions(baseDate, tz) {
  const boost = researchBoost(baseDate);
  const day = weekdayName(baseDate);
  const isWeekend = day === "Saturday" || day === "Sunday";

  return WINDOW_DEFS.map((w) => {
    let score = w.score + boost;
    if (isWeekend && w.id === "morning-prime") score -= 12;
    if (isWeekend && w.id === "evening-prime") score += 4;
    if (!isWeekend && w.id === "midday") score += 2;

    const date = w.nextDay ? addDays(baseDate, 1) : baseDate;
    const iso = formatOffsetISO(date, w.startHour, w.startMin, tz);
    return {
      id: w.id,
      label: w.label,
      at: iso,
      platforms: ["x", "linkedin"],
      score,
      rationale: w.rationale,
    };
  })
    .sort((a, b) => b.score - a.score)
    .slice(0, 5);
}

function main() {
  const args = parseArgs();
  const cfg = loadEnv();
  const date = args.date || todayInTz(cfg.timezone);
  const meta = ensureSchedule(readMeta(date));

  const suggestions = buildSuggestions(date, cfg.timezone);
  meta.schedule.suggestions = suggestions;
  meta.schedule.timezone = cfg.timezone;
  writeMeta(date, meta);

  const md = [
    `# Schedule suggestions — ${date}`,
    "",
    `Timezone: **${cfg.timezone}** · Weekday: **${weekdayName(date)}**`,
    "",
    "Pick one slot (or different times per platform), then run:",
    "",
    "```bash",
    `npm run schedule -- --date ${date} --x <iso> --linkedin <iso>`,
    "```",
    "",
    "| Rank | Label | When (IST) | Score | Why |",
    "|------|-------|------------|-------|-----|",
    ...suggestions.map(
      (s, i) =>
        `| ${i + 1} | ${s.label} | \`${s.at}\` | ${s.score} | ${s.rationale} |`
    ),
    "",
    "## Notes",
    "",
    "- Suggestions are advisory. You lock the schedule.",
    "- Same timestamp on both platforms is fine for v1; stagger if you prefer.",
    "- Fresh research folder for this date boosts morning/evening scores slightly.",
    "",
  ].join("\n");

  const out = path.join(packDir(date), "schedule-suggestions.md");
  fs.writeFileSync(out, md, "utf8");
  console.log(`Wrote ${out}`);
  console.log(JSON.stringify(suggestions, null, 2));
}

main();
