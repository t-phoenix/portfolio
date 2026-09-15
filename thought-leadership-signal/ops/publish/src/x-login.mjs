#!/usr/bin/env node
/**
 * Obtain twitterapi.io login_cookies via /twitter/user_login_v2
 * and write them into ops/publish/.env.
 *
 * Required in .env:
 *   TWITTERAPI_API_KEY
 *   X_PROXY_URL=http://user:pass@host:port   (static residential)
 *   X_USER_NAME=touchey_phoenix
 *   X_EMAIL=...
 *   X_PASSWORD=...
 * Optional but strongly recommended:
 *   X_TOTP_SECRET=...   (base32 seed from X 2FA "can't scan QR")
 */
import fs from "node:fs";
import path from "node:path";
import { loadEnv, PUBLISH_ROOT } from "./lib.mjs";

const ENV_PATH = path.join(PUBLISH_ROOT, ".env");

function upsertEnv(updates) {
  let text = fs.existsSync(ENV_PATH) ? fs.readFileSync(ENV_PATH, "utf8") : "";
  for (const [key, value] of Object.entries(updates)) {
    if (value == null || value === "") continue;
    const line = `${key}=${value}`;
    const re = new RegExp(`^${key}=.*$`, "m");
    if (re.test(text)) text = text.replace(re, line);
    else text = `${text.trimEnd()}\n${line}\n`;
  }
  fs.writeFileSync(ENV_PATH, text, "utf8");
}

async function main() {
  const cfg = loadEnv();
  const userName = process.env.X_USER_NAME || cfg.x.screenName;
  const email = process.env.X_EMAIL || "";
  const password = process.env.X_PASSWORD || "";
  const totpSecret = process.env.X_TOTP_SECRET || "";
  const proxy = cfg.x.proxy;
  const apiKey = cfg.x.apiKey;

  const missing = [];
  if (!apiKey) missing.push("TWITTERAPI_API_KEY");
  if (!proxy) missing.push("X_PROXY_URL");
  if (!userName) missing.push("X_USER_NAME");
  if (!email) missing.push("X_EMAIL");
  if (!password) missing.push("X_PASSWORD");
  if (missing.length) {
    console.error("Missing required env for X login:");
    for (const m of missing) console.error(`  - ${m}`);
    console.error("\nDashboard API key alone is not enough to post.");
    console.error("You need a one-time login that returns login_cookies.");
    console.error("See: https://docs.twitterapi.io/api-reference/endpoint/user_login_v2");
    process.exit(1);
  }

  const body = {
    user_name: userName,
    email,
    password,
    proxy,
  };
  if (totpSecret) body.totp_secret = totpSecret;

  console.log(`Logging in as @${userName} via twitterapi.io user_login_v2…`);
  const res = await fetch(`${cfg.x.baseUrl}/twitter/user_login_v2`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-API-Key": apiKey,
    },
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok || data.status === "error") {
    console.error("Login failed:", JSON.stringify(data, null, 2));
    process.exit(1);
  }

  const cookies =
    data.login_cookies ||
    data.login_cookie ||
    data.data?.login_cookies ||
    data.data?.login_cookie;

  if (!cookies) {
    console.error("No login_cookies in response:", JSON.stringify(data, null, 2));
    process.exit(1);
  }

  upsertEnv({ TWITTERAPI_LOGIN_COOKIES: cookies });
  console.log("Saved TWITTERAPI_LOGIN_COOKIES to ops/publish/.env");
  console.log("Reuse the SAME X_PROXY_URL for every publish call.");
  if (!totpSecret) {
    console.warn(
      "Warning: no X_TOTP_SECRET set. twitterapi.io recommends 2FA secret or cookies may be flagged."
    );
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
