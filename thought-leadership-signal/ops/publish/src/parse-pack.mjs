import fs from "node:fs";
import path from "node:path";
import { packDir } from "./lib.mjs";

/**
 * Parse publish-ready body from x.md / linkedin.md.
 * Strips markdown headers and "## Creative" sections.
 */
export function parseMarkdownPost(filePath) {
  if (!fs.existsSync(filePath)) {
    throw new Error(`Missing file: ${filePath}`);
  }
  const raw = fs.readFileSync(filePath, "utf8");
  const lines = raw.split(/\r?\n/);
  const bodyLines = [];
  let inCreative = false;
  let started = false;

  for (const line of lines) {
    if (/^##\s+Creative/i.test(line)) {
      inCreative = true;
      continue;
    }
    if (inCreative && /^##\s+/.test(line)) {
      inCreative = false;
    }
    if (inCreative) continue;
    if (/^#\s+/.test(line)) continue;
    if (/^##\s+Post/i.test(line)) {
      started = true;
      continue;
    }
    // Stop before ops / seed-reply sections so they never ship in the caption
    if (
      started &&
      /^##\s+/.test(line) &&
      !/^##\s+Post/i.test(line) &&
      !/^##\s+Creative/i.test(line)
    ) {
      break;
    }
    if (/^###\s+\d+/.test(line)) {
      started = true;
      if (bodyLines.length && bodyLines[bodyLines.length - 1] !== "") {
        bodyLines.push("");
      }
      continue;
    }
    if (!started && line.trim() === "") continue;
    started = true;
    bodyLines.push(line);
  }

  return bodyLines.join("\n").trim();
}

/** Split X pack into thread tweets (separated by blank lines after ### N). */
export function parseXThread(date) {
  const file = path.join(packDir(date), "x.md");
  const raw = fs.readFileSync(file, "utf8");
  const parts = [];
  let current = [];
  let inCreative = false;
  let inPost = false;

  for (const line of raw.split(/\r?\n/)) {
    if (/^##\s+Creative/i.test(line)) {
      inCreative = true;
      continue;
    }
    if (inCreative) {
      if (/^##\s+Post/i.test(line)) {
        inCreative = false;
        inPost = true;
      }
      continue;
    }
    if (/^##\s+Post/i.test(line)) {
      inPost = true;
      continue;
    }
    if (!inPost) continue;
    // Stop before first-reply / author-ops sections (URLs stay manual or seed reply)
    if (
      /^##\s+/.test(line) &&
      !/^##\s+Post/i.test(line) &&
      !/^##\s+Creative/i.test(line)
    ) {
      break;
    }
    if (/^###\s+\d+/.test(line)) {
      if (current.length) {
        parts.push(current.join("\n").trim());
        current = [];
      }
      continue;
    }
    current.push(line);
  }
  if (current.length) parts.push(current.join("\n").trim());

  const tweets = parts.map(stripMediaLines).filter(Boolean);
  if (tweets.length) return tweets;

  // Fallback: whole body as one tweet
  const body = parseMarkdownPost(file);
  return body ? [body] : [];
}

const MEDIA_LINE = /^media:\s*(.+)$/i;

function stripMediaLines(text) {
  return text
    .split(/\r?\n/)
    .filter((l) => !MEDIA_LINE.test(l.trim()))
    .join("\n")
    .trim();
}

/**
 * Per-tweet media for x.md: a line "Media: creative/a.png, creative/b.png" inside a ### N block.
 * Paths are relative to the pack. Returns null when no tweet declares media (old packs: slides on tweet 1).
 */
export function parseXThreadMedia(date) {
  const file = path.join(packDir(date), "x.md");
  const raw = fs.readFileSync(file, "utf8");
  const out = [];
  let idx = -1;
  let inPost = false;
  let any = false;
  for (const line of raw.split(/\r?\n/)) {
    if (/^##\s+Post/i.test(line)) { inPost = true; continue; }
    if (!inPost) continue;
    if (/^##\s+/.test(line)) break;
    if (/^###\s+\d+/.test(line)) { idx++; out[idx] = []; continue; }
    const m = line.trim().match(MEDIA_LINE);
    if (m && idx >= 0) {
      for (const rel of m[1].split(",").map((x) => x.trim()).filter(Boolean)) {
        const full = path.resolve(packDir(date), rel);
        if (!fs.existsSync(full)) throw new Error(`x.md media missing: ${rel}`);
        out[idx].push(full);
        any = true;
      }
    }
  }
  return any ? out.map((x) => x || []) : null;
}

export function parseLinkedInCaption(date) {
  return parseMarkdownPost(path.join(packDir(date), "linkedin.md"));
}

export function listCreativeSlides(date) {
  const dir = path.join(packDir(date), "creative");
  if (!fs.existsSync(dir)) return [];
  const named = (re) =>
    fs
      .readdirSync(dir)
      .filter((f) => re.test(f))
      .sort()
      .map((f) => path.join(dir, f));
  // Story frames are the publish set when a pack has both.
  const story = named(/^story-\d+\.png$/i);
  if (story.length) return story;
  const slides = named(/^slide-\d+\.png$/i);
  if (slides.length) return slides;
  // Single hero billboard packs
  const hero = path.join(dir, "hero.png");
  if (fs.existsSync(hero)) return [hero];
  const meme = path.join(dir, "meme.png");
  if (fs.existsSync(meme)) return [meme];
  return [];
}
