#!/usr/bin/env node
/**
 * Publish due scheduled packs to X + LinkedIn.
 * Idempotent: skips platforms already in schedule.published.
 */
import fs from "node:fs";
import path from "node:path";
import {
  ARCHIVE_ROOT,
  ensureSchedule,
  isPublished,
  listQueueDates,
  loadEnv,
  packDir,
  readMeta,
  writeMeta,
} from "./lib.mjs";
import { listCreativeSlides, parseLinkedInCaption, parseXThread } from "./parse-pack.mjs";
import { publishLinkedInPost } from "./adapters/linkedin.mjs";
import { publishXThread } from "./x-publish.mjs";

function isDue(iso, now = new Date()) {
  if (!iso || iso === "null") return false;
  const t = new Date(iso);
  if (Number.isNaN(t.getTime())) return false;
  return t.getTime() <= now.getTime();
}

function bothPublished(meta) {
  const p = meta.schedule?.published || {};
  return isPublished(p.x) && isPublished(p.linkedin);
}

function moveToArchive(date) {
  const src = packDir(date);
  const dest = path.join(ARCHIVE_ROOT, date);
  fs.mkdirSync(ARCHIVE_ROOT, { recursive: true });
  if (fs.existsSync(dest)) {
    fs.rmSync(dest, { recursive: true, force: true });
  }
  fs.renameSync(src, dest);
  console.log(`Archived ${date} → archive/${date}`);
}

async function publishPack(date, cfg) {
  let meta = ensureSchedule(readMeta(date));
  if (meta.status !== "scheduled" && meta.status !== "failed") {
    return { skipped: true, reason: `status=${meta.status}` };
  }

  const chosen = meta.schedule.chosen || {};
  const published = meta.schedule.published || { x: null, linkedin: null };
  const slides = listCreativeSlides(date);
  const errors = [];

  // X
  if (!isPublished(published.x) && isDue(chosen.x)) {
    try {
      const tweets = parseXThread(date);
      console.log(`[${date}] Publishing X (${tweets.length} tweets, dryRun=${cfg.dryRun})`);
      const result = await publishXThread(cfg, {
        tweets,
        imagePaths: slides,
      });
      published.x = {
        id: result.tweet_id,
        url: result.url,
        at: new Date().toISOString(),
        dryRun: Boolean(result.dryRun),
      };
      console.log(`[${date}] X ok`, published.x);
    } catch (err) {
      errors.push(`x: ${err.message}`);
      console.error(`[${date}] X failed`, err.message);
    }
  }

  // LinkedIn
  if (!isPublished(published.linkedin) && isDue(chosen.linkedin)) {
    try {
      const text = parseLinkedInCaption(date);
      console.log(`[${date}] Publishing LinkedIn (dryRun=${cfg.dryRun})`);
      const result = await publishLinkedInPost(cfg, {
        text,
        imagePaths: slides,
      });
      published.linkedin = {
        id: result.id,
        url: result.url,
        at: new Date().toISOString(),
        dryRun: Boolean(result.dryRun),
      };
      console.log(`[${date}] LinkedIn ok`, published.linkedin);
    } catch (err) {
      errors.push(`linkedin: ${err.message}`);
      console.error(`[${date}] LinkedIn failed`, err.message);
    }
  }

  meta.schedule.published = published;

  if (errors.length) {
    meta.status = "failed";
    meta.notes = [meta.notes, `publish errors: ${errors.join("; ")}`]
      .filter(Boolean)
      .join(" | ");
    writeMeta(date, meta);
    return { failed: true, errors, published };
  }

  // If times not due yet, leave scheduled
  const waiting =
    (!isPublished(published.x) && chosen.x && !isDue(chosen.x)) ||
    (!isPublished(published.linkedin) && chosen.linkedin && !isDue(chosen.linkedin));

  if (waiting) {
    writeMeta(date, meta);
    return { waiting: true, published };
  }

  if (bothPublished(meta)) {
    meta.status = "posted";
    writeMeta(date, meta);
    if (!cfg.dryRun) {
      moveToArchive(date);
    } else {
      console.log(`[${date}] dry-run: skip archive (status left as posted for preview only)`);
    }
    return { posted: true, published };
  }

  writeMeta(date, meta);
  return { partial: true, published };
}

async function main() {
  const cfg = loadEnv();
  console.log(`publish-due dryRun=${cfg.dryRun} at ${new Date().toISOString()}`);
  const dates = listQueueDates();
  let ran = 0;
  for (const date of dates) {
    try {
      const meta = readMeta(date);
      if (meta.status !== "scheduled" && meta.status !== "failed") continue;
      ran++;
      const result = await publishPack(date, cfg);
      console.log(`[${date}]`, result);
    } catch (err) {
      console.error(`[${date}] fatal`, err);
    }
  }
  if (!ran) console.log("No scheduled/failed packs in queue.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
