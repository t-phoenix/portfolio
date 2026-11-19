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

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function xFormPost(cfg, params) {
  const url = `${UPLOAD}/1.1/media/upload.json`;
  const auth = oauthHeader("POST", url, params, cfg);
  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: auth,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams(params),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(`X media ${params.command} failed: ${res.status} ${JSON.stringify(data)}`);
  }
  return data;
}

/** Chunked video upload. Images stay on the simple endpoint; video must INIT/APPEND/FINALIZE. */
export async function uploadVideoOfficial(cfg, filePath) {
  assertOfficialX(cfg);
  if (cfg.dryRun) return "dry-run-media";

  const file = fs.readFileSync(filePath);
  const init = await xFormPost(cfg, {
    command: "INIT",
    total_bytes: String(file.length),
    media_type: "video/mp4",
    media_category: "tweet_video",
  });
  const mediaId = String(init.media_id_string || init.media_id || "");
  if (!mediaId) throw new Error(`X video INIT: no id in ${JSON.stringify(init)}`);

  const chunkSize = 4 * 1024 * 1024;
  const appendUrl = `${UPLOAD}/1.1/media/upload.json`;
  let segment = 0;
  for (let offset = 0; offset < file.length; offset += chunkSize) {
    const chunk = file.subarray(offset, Math.min(offset + chunkSize, file.length));
    const auth = oauthHeader("POST", appendUrl, {}, cfg);
    const form = new FormData();
    form.append("command", "APPEND");
    form.append("media_id", mediaId);
    form.append("segment_index", String(segment));
    form.append("media", new Blob([chunk]), "chunk.mp4");
    const res = await fetch(appendUrl, {
      method: "POST",
      headers: { Authorization: auth },
      body: form,
    });
    if (!res.ok && res.status !== 204) {
      const t = await res.text();
      throw new Error(`X video APPEND ${segment} failed: ${res.status} ${t.slice(0, 400)}`);
    }
    console.log(`X video chunk ${segment + 1} uploaded`);
    segment += 1;
  }

  let fin = await xFormPost(cfg, { command: "FINALIZE", media_id: mediaId });
  for (let i = 0; i < 40 && fin.processing_info; i++) {
    const state = fin.processing_info.state;
    if (state === "succeeded") break;
    if (state === "failed") {
      throw new Error(`X video processing failed: ${JSON.stringify(fin.processing_info)}`);
    }
    const wait = Math.max(1, Number(fin.processing_info.check_after_secs) || 3) * 1000;
    await sleep(wait);
    const params = { command: "STATUS", media_id: mediaId };
    const url = `${UPLOAD}/1.1/media/upload.json`;
    const auth = oauthHeader("GET", url, params, cfg);
    const res = await fetch(`${url}?${new URLSearchParams(params)}`, {
      headers: { Authorization: auth },
    });
    fin = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(`X video STATUS failed: ${res.status} ${JSON.stringify(fin)}`);
    }
    console.log(`X video processing: ${fin.processing_info?.state || "ready"}`);
  }
  if (fin.processing_info && fin.processing_info.state !== "succeeded") {
    throw new Error(`X video still processing: ${JSON.stringify(fin.processing_info)}`);
  }
  return mediaId;
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

export async function deleteTweetOfficial(cfg, tweetId) {
  assertOfficialX(cfg);
  const url = `${API}/2/tweets/${tweetId}`;
  const auth = oauthHeader("DELETE", url, {}, cfg);
  const res = await fetch(url, { method: "DELETE", headers: { Authorization: auth } });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(`X delete failed: ${res.status} ${JSON.stringify(data)}`);
  }
  return data;
}

export async function createTweetOfficial(
  cfg,
  { text, replyToTweetId = null, mediaIds = [], editPreviousPostId = null }
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
  if (editPreviousPostId) {
    payload.edit_options = { previous_post_id: String(editPreviousPostId) };
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

async function uploadTweetMedia(cfg, paths) {
  const vids = paths.filter((p) => /\.mp4$/i.test(p));
  if (vids.length) return [await uploadVideoOfficial(cfg, vids[0])]; // one video per tweet, no images with it
  const ids = [];
  for (const p of paths.slice(0, 4)) ids.push(await uploadMediaOfficial(cfg, p));
  return ids;
}

/**
 * Thread with media per tweet. Resume-safe: `done` holds tweet ids already posted
 * (index-aligned); they are skipped, and `onProgress(ids)` fires after every new tweet
 * so a crash mid-thread never reposts earlier tweets. Media failures throw before that tweet is posted.
 */
export async function publishXThreadPerTweetOfficial(cfg, { tweets, mediaPerTweet, done = [], onProgress }) {
  if (!tweets?.length) throw new Error("No tweets to publish");
  tweets.forEach((t) => guardPostCost(t, { allowUrls: cfg.xOfficial.allowUrls })); // fail before tweet 1, not mid-thread
  const ids = [...done];
  for (let i = ids.length; i < tweets.length; i++) {
    const mediaIds = mediaPerTweet?.[i]?.length ? await uploadTweetMedia(cfg, mediaPerTweet[i]) : [];
    const r = await createTweetOfficial(cfg, {
      text: tweets[i],
      replyToTweetId: i > 0 ? ids[i - 1] : null,
      mediaIds,
    });
    ids.push(cfg.dryRun ? `dry-run-${i}` : r.tweet_id);
    console.log(`X tweet ${i + 1}/${tweets.length} ok`, r.url || "(dry run)", mediaIds.length ? `media=${mediaIds.length}` : "");
    if (onProgress && !cfg.dryRun) onProgress(ids);
  }
  const first = ids[0];
  const url = (id) => `https://x.com/${cfg.x.screenName}/status/${id}`;
  return {
    tweet_id: cfg.dryRun ? null : first,
    url: cfg.dryRun ? null : url(first),
    thread: cfg.dryRun ? [] : ids.map(url),
    dryRun: Boolean(cfg.dryRun),
    provider: "official",
  };
}

export async function publishXThreadOfficial(cfg, { tweets, imagePaths = [], videoPath = null }) {
  if (!tweets?.length) throw new Error("No tweets to publish");

  // One video, or up to 4 images, on tweet 1. A failed video must not become a text-only post.
  let mediaIds = [];
  if (videoPath) {
    const mid = await uploadVideoOfficial(cfg, videoPath);
    mediaIds = [mid];
    console.log("X video ready", mid);
  }
  const mediaPaths = videoPath ? [] : (imagePaths || []).slice(0, 4);
  for (const imagePath of mediaPaths) {
    try {
      const mid = await uploadMediaOfficial(cfg, imagePath);
      mediaIds.push(mid);
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
