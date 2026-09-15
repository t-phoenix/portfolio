/**
 * X publisher via twitterapi.io
 * Docs: create_tweet_v2 requires login_cookies + proxy (+ optional media_ids, reply_to).
 */

import fs from "node:fs";
import path from "node:path";

function headers(apiKey) {
  return {
    "Content-Type": "application/json",
    "X-API-Key": apiKey,
  };
}

function authFields(cfg) {
  const fields = { proxy: cfg.x.proxy };
  if (cfg.x.loginCookies) fields.login_cookies = cfg.x.loginCookies;
  if (cfg.x.authSession) {
    // Some endpoints use auth_session / session
    fields.auth_session = cfg.x.authSession;
    fields.session = cfg.x.authSession;
  }
  return fields;
}

function assertXConfig(cfg) {
  if (!cfg.x.apiKey) throw new Error("TWITTERAPI_API_KEY missing");
  if (!cfg.x.proxy) throw new Error("X_PROXY_URL missing (residential proxy required)");
  if (!cfg.x.loginCookies && !cfg.x.authSession) {
    throw new Error("Set TWITTERAPI_LOGIN_COOKIES or TWITTERAPI_AUTH_SESSION");
  }
}

/** Upload local image; returns media id string. */
export async function uploadMedia(cfg, filePath) {
  assertXConfig(cfg);
  const form = new FormData();
  const buf = fs.readFileSync(filePath);
  const blob = new Blob([buf], { type: "image/png" });
  form.append("file", blob, path.basename(filePath));
  form.append("proxy", cfg.x.proxy);
  if (cfg.x.loginCookies) form.append("login_cookies", cfg.x.loginCookies);
  if (cfg.x.authSession) form.append("login_cookies", cfg.x.authSession);

  const res = await fetch(`${cfg.x.baseUrl}/twitter/upload_media_v2`, {
    method: "POST",
    headers: { "X-API-Key": cfg.x.apiKey },
    body: form,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(`X media upload failed: ${res.status} ${JSON.stringify(data)}`);
  }
  const id =
    data.media_id ||
    data.mediaId ||
    data.id ||
    data.data?.media_id ||
    data.media_id_string;
  if (!id) throw new Error(`X media upload: no media id in ${JSON.stringify(data)}`);
  return String(id);
}

/**
 * Post a single tweet (optionally as reply, with media).
 */
export async function createTweet(cfg, { text, replyToTweetId = null, mediaIds = [] }) {
  if (cfg.dryRun) {
    return {
      tweet_id: "dry-run",
      dryRun: true,
      preview: { text: text.slice(0, 180), replyToTweetId, mediaIds },
    };
  }

  assertXConfig(cfg);

  const body = {
    ...authFields(cfg),
    tweet_text: text,
  };
  if (replyToTweetId) body.reply_to_tweet_id = String(replyToTweetId);
  if (mediaIds.length) body.media_ids = mediaIds.map(String);

  const res = await fetch(`${cfg.x.baseUrl}/twitter/create_tweet_v2`, {
    method: "POST",
    headers: headers(cfg.x.apiKey),
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok || data.status === "error") {
    throw new Error(`X create_tweet failed: ${res.status} ${JSON.stringify(data)}`);
  }
  const tweetId =
    data.tweet_id ||
    data.tweetId ||
    data.data?.tweet_id ||
    data.id ||
    data.data?.id;
  return {
    tweet_id: tweetId ? String(tweetId) : null,
    raw: data,
    url: tweetId
      ? `https://x.com/${cfg.x.screenName}/status/${tweetId}`
      : null,
  };
}

/**
 * Post a thread. Attaches mediaIds to the first tweet only.
 */
export async function publishXThread(cfg, { tweets, imagePaths = [] }) {
  if (!tweets?.length) throw new Error("No tweets to publish");

  let mediaIds = [];
  if (imagePaths[0] && !cfg.dryRun) {
    try {
      const mid = await uploadMedia(cfg, imagePaths[0]);
      mediaIds = [mid];
    } catch (err) {
      console.warn("X media upload skipped:", err.message);
    }
  }

  const results = [];
  let replyTo = null;
  for (let i = 0; i < tweets.length; i++) {
    const r = await createTweet(cfg, {
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
  };
}
