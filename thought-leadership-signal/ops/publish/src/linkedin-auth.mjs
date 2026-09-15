/**
 * One-time LinkedIn OAuth helper (localhost callback).
 * Writes tokens into ops/publish/.env automatically.
 */
import fs from "node:fs";
import http from "node:http";
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

const cfg = loadEnv();
const { clientId, clientSecret, redirectUri } = cfg.linkedin;

if (!clientId || !clientSecret) {
  console.error("Set LINKEDIN_CLIENT_ID and LINKEDIN_CLIENT_SECRET in .env first.");
  console.error(`File: ${ENV_PATH}`);
  console.error("Create the app at https://www.linkedin.com/developers/apps then paste IDs.");
  process.exit(1);
}

const scopes = ["openid", "profile", "w_member_social"].join("%20");
const authUrl =
  `https://www.linkedin.com/oauth/v2/authorization` +
  `?response_type=code` +
  `&client_id=${encodeURIComponent(clientId)}` +
  `&redirect_uri=${encodeURIComponent(redirectUri)}` +
  `&scope=${scopes}` +
  `&state=signal`;

const port = Number(new URL(redirectUri).port || 8765);

const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url, redirectUri);
    if (url.pathname !== "/callback") {
      res.writeHead(404);
      res.end("Not found");
      return;
    }
    const code = url.searchParams.get("code");
    const err = url.searchParams.get("error");
    if (err) {
      res.writeHead(400);
      res.end(`OAuth error: ${err}`);
      server.close();
      return;
    }
    if (!code) {
      res.writeHead(400);
      res.end("Missing code");
      return;
    }

    const tokenBody = new URLSearchParams({
      grant_type: "authorization_code",
      code,
      redirect_uri: redirectUri,
      client_id: clientId,
      client_secret: clientSecret,
    });
    const tokenRes = await fetch("https://www.linkedin.com/oauth/v2/accessToken", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: tokenBody,
    });
    const tokens = await tokenRes.json();
    if (!tokenRes.ok) {
      res.writeHead(500);
      res.end(JSON.stringify(tokens));
      console.error(tokens);
      server.close();
      return;
    }

    const meRes = await fetch("https://api.linkedin.com/v2/userinfo", {
      headers: { Authorization: `Bearer ${tokens.access_token}` },
    });
    const me = await meRes.json();
    // OpenID sub is the person id for urn:li:person:{sub}
    const personUrn = me.sub ? `urn:li:person:${me.sub}` : "";

    const updates = {
      LINKEDIN_ACCESS_TOKEN: tokens.access_token,
      LINKEDIN_PERSON_URN: personUrn,
    };
    if (tokens.refresh_token) {
      updates.LINKEDIN_REFRESH_TOKEN = tokens.refresh_token;
    }
    upsertEnv(updates);

    console.log("\n=== Wrote tokens into ops/publish/.env ===\n");
    console.log(`LINKEDIN_ACCESS_TOKEN=(saved)`);
    if (tokens.refresh_token) console.log(`LINKEDIN_REFRESH_TOKEN=(saved)`);
    console.log(`LINKEDIN_PERSON_URN=${personUrn}`);
    console.log("\n=== userinfo ===");
    console.log(JSON.stringify(me, null, 2));

    res.writeHead(200, { "Content-Type": "text/html" });
    res.end(
      "<h1>LinkedIn connected</h1><p>Tokens saved to ops/publish/.env. You can close this tab.</p>"
    );
    server.close();
  } catch (e) {
    console.error(e);
    res.writeHead(500);
    res.end(String(e));
    server.close();
  }
});

server.listen(port, async () => {
  console.log(`Listening on ${redirectUri}`);
  console.log("Open this URL to authorize:\n");
  console.log(authUrl);
  console.log("");
  try {
    const open = (await import("open")).default;
    await open(authUrl);
  } catch {
    /* manual open */
  }
});
