/**
 * X publish router: prefer official pay-per-use API, else twitterapi.io.
 */
import { hasOfficialX, publishXThreadOfficial } from "./adapters/x-official.mjs";
import { publishXThread as publishXThreadTwitterApi } from "./adapters/x-twitterapi.mjs";

export function resolveXProvider(cfg) {
  const pref = String(cfg.xProvider || "auto").toLowerCase();
  if (pref === "official") return "official";
  if (pref === "twitterapi") return "twitterapi";
  if (hasOfficialX(cfg)) return "official";
  return "twitterapi";
}

export async function publishXThread(cfg, args) {
  const provider = resolveXProvider(cfg);
  console.log(`X provider: ${provider}`);
  if (provider === "official") {
    return publishXThreadOfficial(cfg, args);
  }
  return publishXThreadTwitterApi(cfg, args);
}
