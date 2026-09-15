import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import yaml from "js-yaml";
import dotenv from "dotenv";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
export const PUBLISH_ROOT = path.resolve(__dirname, "..");
export const SIGNAL_ROOT = path.resolve(PUBLISH_ROOT, "../..");
export const QUEUE_ROOT = path.join(SIGNAL_ROOT, "queue");
export const ARCHIVE_ROOT = path.join(SIGNAL_ROOT, "archive");

dotenv.config({ path: path.join(PUBLISH_ROOT, ".env") });

export function loadEnv() {
  return {
    dryRun: String(process.env.PUBLISH_DRY_RUN || "true").toLowerCase() !== "false",
    timezone: process.env.SIGNAL_TIMEZONE || "Asia/Kolkata",
    linkedin: {
      clientId: process.env.LINKEDIN_CLIENT_ID || "",
      clientSecret: process.env.LINKEDIN_CLIENT_SECRET || "",
      redirectUri:
        process.env.LINKEDIN_REDIRECT_URI || "http://localhost:8765/callback",
      accessToken: process.env.LINKEDIN_ACCESS_TOKEN || "",
      refreshToken: process.env.LINKEDIN_REFRESH_TOKEN || "",
      personUrn: process.env.LINKEDIN_PERSON_URN || "",
    },
    x: {
      apiKey: process.env.TWITTERAPI_API_KEY || "",
      loginCookies: process.env.TWITTERAPI_LOGIN_COOKIES || "",
      authSession: process.env.TWITTERAPI_AUTH_SESSION || "",
      proxy: process.env.X_PROXY_URL || "",
      screenName: process.env.X_SCREEN_NAME || "touchey_phoenix",
      baseUrl: "https://api.twitterapi.io",
    },
    // Official X API (pay-per-use) — preferred when set. Post-only; no reads.
    xOfficial: {
      apiKey: process.env.X_API_KEY || "",
      apiSecret: process.env.X_API_SECRET || "",
      accessToken: process.env.X_ACCESS_TOKEN || "",
      accessSecret: process.env.X_ACCESS_SECRET || "",
      allowUrls:
        String(process.env.X_ALLOW_URLS || "false").toLowerCase() === "true",
    },
    // auto | official | twitterapi
    xProvider: process.env.X_PROVIDER || "auto",
  };
}

export function packDir(date) {
  return path.join(QUEUE_ROOT, date);
}

export function readMeta(date) {
  const file = path.join(packDir(date), "meta.yml");
  if (!fs.existsSync(file)) throw new Error(`meta.yml missing for ${date}`);
  const meta = yaml.load(fs.readFileSync(file, "utf8")) || {};
  if (meta.date instanceof Date) {
    meta.date = new Intl.DateTimeFormat("en-CA", {
      timeZone: "UTC",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(meta.date);
  } else if (typeof meta.date === "string" && meta.date.includes("T")) {
    meta.date = meta.date.slice(0, 10);
  }
  return meta;
}

export function writeMeta(date, meta) {
  const file = path.join(packDir(date), "meta.yml");
  if (meta.date instanceof Date) {
    meta.date = meta.date.toISOString().slice(0, 10);
  } else if (typeof meta.date === "string" && meta.date.includes("T")) {
    meta.date = meta.date.slice(0, 10);
  } else if (!meta.date) {
    meta.date = date;
  }
  fs.writeFileSync(
    file,
    yaml.dump(meta, { lineWidth: 100, noRefs: true }),
    "utf8"
  );
}

export function listQueueDates() {
  if (!fs.existsSync(QUEUE_ROOT)) return [];
  return fs
    .readdirSync(QUEUE_ROOT)
    .filter((name) => /^\d{4}-\d{2}-\d{2}$/.test(name))
    .sort();
}

export function ensureSchedule(meta) {
  if (!meta.schedule) {
    meta.schedule = {
      timezone: loadEnv().timezone,
      suggestions: [],
      chosen: { x: null, linkedin: null },
      published: { x: null, linkedin: null },
    };
  }
  if (!meta.schedule.chosen) meta.schedule.chosen = { x: null, linkedin: null };
  if (!meta.schedule.published)
    meta.schedule.published = { x: null, linkedin: null };
  if (!meta.schedule.suggestions) meta.schedule.suggestions = [];
  if (!meta.schedule.timezone) meta.schedule.timezone = loadEnv().timezone;

  // FAILSAFE yaml can turn YAML null into the string "null"
  for (const key of ["x", "linkedin"]) {
    if (meta.schedule.chosen[key] === "null" || meta.schedule.chosen[key] === "") {
      meta.schedule.chosen[key] = null;
    }
    if (
      meta.schedule.published[key] === "null" ||
      meta.schedule.published[key] === ""
    ) {
      meta.schedule.published[key] = null;
    }
  }
  return meta;
}

export function isPublished(entry) {
  if (!entry || entry === "null") return false;
  if (typeof entry === "string") return entry.length > 0 && entry !== "null";
  if (typeof entry === "object") {
    if (entry.dryRun) return false; // dry-run must not block live publish
    return Boolean(entry.id || entry.url);
  }
  return false;
}

export function parseArgs(argv = process.argv.slice(2)) {
  const out = { _: [] };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a.startsWith("--")) {
      const key = a.slice(2);
      const next = argv[i + 1];
      if (!next || next.startsWith("--")) out[key] = true;
      else {
        out[key] = next;
        i++;
      }
    } else out._.push(a);
  }
  return out;
}

export function todayInTz(tz = "Asia/Kolkata") {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: tz,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}
