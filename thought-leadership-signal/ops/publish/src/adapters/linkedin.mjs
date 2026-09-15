/**
 * LinkedIn personal profile publisher (Share on LinkedIn / w_member_social).
 * Free self-serve product. No company page scopes.
 *
 * Organic multi-slide posts use MultiImage (not sponsored Carousel).
 */

import fs from "node:fs";
import path from "node:path";

const LI_API = "https://api.linkedin.com";
// LinkedIn monthly versions sunset ~12 months; bump YYYYMM when posts start 426'ing.
const LI_VERSION = process.env.LINKEDIN_API_VERSION || "202608";

export async function refreshAccessToken(cfg) {
  const { clientId, clientSecret, refreshToken } = cfg.linkedin;
  if (!clientId || !clientSecret || !refreshToken) {
    throw new Error("LinkedIn client id/secret/refresh token required to refresh");
  }
  const body = new URLSearchParams({
    grant_type: "refresh_token",
    refresh_token: refreshToken,
    client_id: clientId,
    client_secret: clientSecret,
  });
  const res = await fetch("https://www.linkedin.com/oauth/v2/accessToken", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(`LinkedIn refresh failed: ${JSON.stringify(data)}`);
  }
  return data;
}

async function authHeaders(accessToken) {
  return {
    Authorization: `Bearer ${accessToken}`,
    "Content-Type": "application/json",
    "X-Restli-Protocol-Version": "2.0.0",
    "LinkedIn-Version": LI_VERSION,
  };
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

/** Register and upload a single image; returns image URN. */
export async function uploadImage(cfg, filePath, accessToken) {
  const personUrn = cfg.linkedin.personUrn;
  if (!personUrn) throw new Error("LINKEDIN_PERSON_URN required");

  const initRes = await fetch(`${LI_API}/rest/images?action=initializeUpload`, {
    method: "POST",
    headers: await authHeaders(accessToken),
    body: JSON.stringify({
      initializeUploadRequest: {
        owner: personUrn,
      },
    }),
  });
  const initData = await initRes.json();
  if (!initRes.ok) {
    throw new Error(`LinkedIn image init failed: ${JSON.stringify(initData)}`);
  }
  const uploadUrl = initData.value?.uploadUrl;
  const imageUrn = initData.value?.image;
  if (!uploadUrl || !imageUrn) {
    throw new Error(`LinkedIn image init missing fields: ${JSON.stringify(initData)}`);
  }

  const bytes = fs.readFileSync(filePath);
  const put = await fetch(uploadUrl, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/octet-stream",
    },
    body: bytes,
  });
  if (!put.ok) {
    const t = await put.text();
    throw new Error(`LinkedIn image upload failed: ${put.status} ${t}`);
  }
  return imageUrn;
}

/**
 * Upload many images for a MultiImage (organic carousel-style) post.
 * Returns [{ id, altText }].
 */
export async function uploadImages(cfg, imagePaths, accessToken) {
  const out = [];
  for (let i = 0; i < imagePaths.length; i++) {
    const filePath = imagePaths[i];
    const urn = await uploadImage(cfg, filePath, accessToken);
    out.push({
      id: urn,
      altText: path.basename(filePath, path.extname(filePath)),
    });
    console.log(`LinkedIn uploaded slide ${i + 1}/${imagePaths.length}: ${urn}`);
  }
  // Brief settle time so assets leave WAITING_UPLOAD / PROCESSING.
  if (out.length) await sleep(2500);
  return out;
}

/**
 * Publish a member post.
 * - 0 images: text only
 * - 1 image: single media
 * - 2+ images: MultiImage (organic carousel swipe)
 * @returns {{ id: string, url: string|null, imageCount: number }}
 */
export async function publishLinkedInPost(cfg, { text, imagePaths = [] }) {
  if (cfg.dryRun) {
    return {
      id: "dry-run",
      url: null,
      dryRun: true,
      preview: { text: text.slice(0, 200), images: imagePaths.length },
      imageCount: imagePaths.length,
    };
  }

  let accessToken = cfg.linkedin.accessToken;
  if (!accessToken) throw new Error("LINKEDIN_ACCESS_TOKEN missing");
  if (!cfg.linkedin.personUrn) throw new Error("LINKEDIN_PERSON_URN missing");

  const paths = (imagePaths || []).slice(0, 20);
  let content = null;

  if (paths.length >= 2) {
    let images;
    try {
      images = await uploadImages(cfg, paths, accessToken);
    } catch (err) {
      if (cfg.linkedin.refreshToken) {
        const refreshed = await refreshAccessToken(cfg);
        accessToken = refreshed.access_token;
        images = await uploadImages(cfg, paths, accessToken);
      } else throw err;
    }
    content = { multiImage: { images } };
  } else if (paths.length === 1) {
    let mediaUrn;
    try {
      mediaUrn = await uploadImage(cfg, paths[0], accessToken);
    } catch (err) {
      if (cfg.linkedin.refreshToken) {
        const refreshed = await refreshAccessToken(cfg);
        accessToken = refreshed.access_token;
        mediaUrn = await uploadImage(cfg, paths[0], accessToken);
      } else throw err;
    }
    content = {
      media: {
        id: mediaUrn,
        altText: path.basename(paths[0], path.extname(paths[0])),
      },
    };
  }

  const postBody = {
    author: cfg.linkedin.personUrn,
    commentary: text,
    visibility: "PUBLIC",
    distribution: {
      feedDistribution: "MAIN_FEED",
      targetEntities: [],
      thirdPartyDistributionChannels: [],
    },
    lifecycleState: "PUBLISHED",
    isReshareDisabledByAuthor: false,
  };
  if (content) postBody.content = content;

  const doPost = async (token) =>
    fetch(`${LI_API}/rest/posts`, {
      method: "POST",
      headers: await authHeaders(token),
      body: JSON.stringify(postBody),
    });

  let res = await doPost(accessToken);
  // MultiImage sometimes needs assets fully AVAILABLE — retry once after wait.
  if (!res.ok && paths.length >= 2) {
    const rawFail = await res.text();
    if (/PROCESSING|AVAILABLE|image/i.test(rawFail)) {
      console.warn("LinkedIn multiImage first attempt failed; waiting and retrying…");
      console.warn(rawFail.slice(0, 300));
      await sleep(5000);
      res = await doPost(accessToken);
    } else {
      throw new Error(`LinkedIn post failed: ${res.status} ${rawFail}`);
    }
  }

  if (res.status === 401 && cfg.linkedin.refreshToken) {
    const refreshed = await refreshAccessToken(cfg);
    accessToken = refreshed.access_token;
    res = await doPost(accessToken);
  }

  const raw = await res.text();
  let data = {};
  try {
    data = raw ? JSON.parse(raw) : {};
  } catch {
    data = { raw };
  }

  if (!res.ok) {
    throw new Error(`LinkedIn post failed: ${res.status} ${raw}`);
  }

  const id =
    res.headers.get("x-restli-id") ||
    data.id ||
    data.value ||
    "unknown";

  return {
    id: String(id),
    url: null,
    imageCount: paths.length,
    accessTokenUpdated:
      accessToken !== cfg.linkedin.accessToken ? accessToken : null,
  };
}
