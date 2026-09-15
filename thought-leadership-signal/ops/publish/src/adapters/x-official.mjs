/**
 * Official X API publisher (pay-per-use) — post-only.
 * Prefer this over twitterapi.io when OAuth credentials are set.
 *
 * Cost controls (2026 pay-per-use approx):
 * - Text/media post: ~$0.015
 * - Post containing a URL: ~$0.20  ← avoid links in copy
 * - Never call read/search endpoints from this adapter
 *
 * Auth: OAuth 1.0a user context (API key/secret + access token/secret).
 * Scopes needed in portal: Read and Write (tweet.write equivalent).
 */

import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";

const API = "https://api.x.com";
const UPLOAD = "https://upload.x.com";

function percentEncode(str) {
  return encodeURIComponent(str)
    .replace(/[!'()*]/g, (c) => `%${c.charCodeAt(0).toString(16).toUpperCase()}`);
}

function oauthHeader(method, url, params, cfg) {
  const oauth = {
    oauth_consumer_key: cfg.xOfficial.apiKey,
    oauth_nonce: crypto.randomBytes(16).toString("hex"),
    oauth_signature_method: "HMAC-SHA1",
    oauth_timestamp: Math.floor(Date.now() / 1000).toString(),
    oauth_token: cfg.xOfficial.accessToken,
    oauth_version: "1.0",
  };
  const all = { ...params, ...oauth };
  const base = Object.keys(all)
    .sort()
    .map((k) => `${percentEncode(k)}=${percentEncode(String(all[k]))}`)
    .join("&");
  const baseString = [
    method.toUpperCase(),
    percentEncode(url),
    percentEncode(base),
  ].join("&");
  const signingKey = `${percentEncode(cfg.xOfficial.apiSecret)}&${percentEncode(
    cfg.xOfficial.accessSecret
  )}`;
  oauth.oauth_signature = crypto
    .createHmac("sha1", signingKey)
    .update(baseString)
    .digest("base64");

  const header =
    "OAuth " +
    Object.keys(oauth)
      .sort()
      .map((k) => `${percentEncode(k)}="${percentEncode(oauth[k])}"`)
      .join(", ");
  return header;
}

export function hasOfficialX(cfg) {
  const o = cfg.xOfficial || {};
  return Boolean(o.apiKey && o.apiSecret && o.accessToken && o.accessSecret);
}

export function assertOfficialX(cfg) {
  if (!hasOfficialX(cfg)) {
    throw new Error(
      "Official X API credentials missing. Set X_API_KEY, X_API_SECRET, X_ACCESS_TOKEN, X_ACCESS_SECRET"
    );
  }
}

/** Reject or warn on URL posts (13x more expensive on pay-per-use). */
export function guardPostCost(text, { allowUrls = false } = {}) {
  const hasUrl = /https?:\/\//i.test(text);
  if (hasUrl && !allowUrls) {
    throw new Error(
      "Tweet contains a URL (~$0.20 on X pay-per-use). Remove the link or set X_ALLOW_URLS=true"
    );
  }
  return hasUrl;
}

/** Simple image upload via v1.1 media/upload (OAuth 1.0a). */
export async function uploadMediaOfficial(cfg, filePath) {
  assertOfficialX(cfg);
  if (cfg.dryRun) return "dry-run-media";

  const buf = fs.readFileSync(filePath);
  const mediaData = buf.toString("base64");
  const url = `${UPLOAD}/1.1/media/upload.json`;
  const params = { media_data: mediaData };
  const auth = oauthHeader("POST", url, params, cfg);

  const body = new URLSearchParams(params);
  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: auth,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(`X media upload failed: ${res.status} ${JSON.stringify(data)}`);
  }
  const id = data.media_id_string || data.media_id || data.data?.id;
  if (!id) throw new Error(`X media upload: no id in ${JSON.stringify(data)}`);
  return String(id);
}

export async function createTweetOfficial(
  cfg,
  { text, replyToTweetId = null, mediaIds = [] }
) {
  if (cfg.dryRun) {
    return {
      tweet_id: "dry-run",
      dryRun: true,
      preview: { text: text.slice(0, 180), replyToTweetId, mediaIds },
      provider: "official",
    };
  }

  assertOfficialX(cfg);
  guardPostCost(text, { allowUrls: cfg.xOfficial.allowUrls });

  const url = `${API}/2/tweets`;
  const payload = { text };
  if (replyToTweetId) {
    payload.reply = { in_reply_to_tweet_id: String(replyToTweetId) };
  }
  if (mediaIds.length) {
    payload.media = { media_ids: mediaIds.map(String) };
  }

  // OAuth 1.0a for JSON body: only oauth_* params in signature (no body params)
  const auth = oauthHeader("POST", url, {}, cfg);
  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: auth,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(`X create tweet failed: ${res.status} ${JSON.stringify(data)}`);
  }
  const tweetId = data.data?.id || data.id;
  return {
    tweet_id: tweetId ? String(tweetId) : null,
    url: tweetId
      ? `https://x.com/${cfg.x.screenName}/status/${tweetId}`
      : null,
    raw: data,
    provider: "official",
  };
}

export async function publishXThreadOfficial(cfg, { tweets, imagePaths = [] }) {
  if (!tweets?.length) throw new Error("No tweets to publish");

  let mediaIds = [];
  if (imagePaths[0]) {
    try {
      const mid = await uploadMediaOfficial(cfg, imagePaths[0]);
      mediaIds = [mid];
    } catch (err) {
      console.warn("Official X media upload skipped:", err.message);
    }
  }

  const results = [];
  let replyTo = null;
  for (let i = 0; i < tweets.length; i++) {
    const r = await createTweetOfficial(cfg, {
      text: tweets[i],
      replyToTweetId: replyTo,
      mediaIds: i === 0 ? mediaIds : [],
    });
    results.push(r);
    replyTo = r.tweet_id;
    if (cfg.dryRun) replyTo = `dry-run-${i}`;
  }

  return {
    tweet_id: results[0]?.tweet_id || null,
    url: results[0]?.url || null,
    thread: results,
    dryRun: Boolean(cfg.dryRun),
    provider: "official",
  };
}
