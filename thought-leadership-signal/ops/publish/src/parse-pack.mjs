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

  const tweets = parts.filter(Boolean);
  if (tweets.length) return tweets;

  // Fallback: whole body as one tweet
  const body = parseMarkdownPost(file);
  return body ? [body] : [];
}

export function parseLinkedInCaption(date) {
  return parseMarkdownPost(path.join(packDir(date), "linkedin.md"));
}

export function listCreativeSlides(date) {
  const dir = path.join(packDir(date), "creative");
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((f) => /^slide-\d+\.png$/i.test(f))
    .sort()
    .map((f) => path.join(dir, f));
}
