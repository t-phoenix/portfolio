#!/usr/bin/env node
/**
 * Lock chosen post times → status: scheduled
 */
import {
  ensureSchedule,
  loadEnv,
  parseArgs,
  readMeta,
  todayInTz,
  writeMeta,
} from "./lib.mjs";

function parseWhen(value) {
  if (!value) throw new Error("Missing datetime");
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) {
    throw new Error(`Invalid datetime: ${value}`);
  }
  return value;
}

function main() {
  const args = parseArgs();
  const cfg = loadEnv();
  const date = args.date || todayInTz(cfg.timezone);
  if (!args.x && !args.linkedin) {
    console.error(
      "Usage: npm run schedule -- --date YYYY-MM-DD --x <iso> --linkedin <iso>"
    );
    process.exit(1);
  }

  const meta = ensureSchedule(readMeta(date));
  if (!["ready", "scheduled", "failed", "draft"].includes(meta.status)) {
    console.warn(
      `Warning: status is "${meta.status}". Prefer ready before scheduling.`
    );
  }

  if (args.x) meta.schedule.chosen.x = parseWhen(args.x);
  if (args.linkedin) meta.schedule.chosen.linkedin = parseWhen(args.linkedin);

  // If only one platform time given, mirror to the other when null
  if (meta.schedule.chosen.x && !meta.schedule.chosen.linkedin) {
    meta.schedule.chosen.linkedin = meta.schedule.chosen.x;
  }
  if (meta.schedule.chosen.linkedin && !meta.schedule.chosen.x) {
    meta.schedule.chosen.x = meta.schedule.chosen.linkedin;
  }

  meta.schedule.published = meta.schedule.published || { x: null, linkedin: null };
  meta.status = "scheduled";
  meta.notes = [
    meta.notes,
    `Scheduled x=${meta.schedule.chosen.x} linkedin=${meta.schedule.chosen.linkedin}`,
  ]
    .filter(Boolean)
    .join(" | ");

  writeMeta(date, meta);
  console.log(`Scheduled ${date}`);
  console.log(JSON.stringify(meta.schedule.chosen, null, 2));
}

main();
