// Renders replay.html → t4-replay.png and captures the live ownback.tech scratch cards → t6-scratch.png
const http = require("http");
const fs = require("fs");
const path = require("path");
const ROOT = __dirname;
const NODE = path.resolve(ROOT, "../../../archive/2026-10-30/creative/node_modules");
const puppeteer = require(path.join(NODE, "puppeteer-core"));
const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const TYPES = { ".html": "text/html", ".svg": "image/svg+xml", ".png": "image/png", ".webp": "image/webp" };

const server = http.createServer((req, res) => {
  const file = path.resolve(ROOT, decodeURIComponent(new URL(req.url, "http://x").pathname).slice(1));
  if (!file.startsWith(ROOT + path.sep)) { res.writeHead(404); return res.end(); }
  fs.readFile(file, (err, buf) => {
    if (err) { res.writeHead(404); return res.end(); }
    res.writeHead(200, { "Content-Type": TYPES[path.extname(file)] || "application/octet-stream" });
    res.end(buf);
  });
});

(async () => {
  const only = process.argv[2];
  await new Promise((r) => server.listen(0, "127.0.0.1", r));
  const port = server.address().port;
  const browser = await puppeteer.launch({ executablePath: CHROME, headless: "new" });
  const page = await browser.newPage();

  if (!only || only === "replay") {
    await page.setViewport({ width: 1080, height: 1350, deviceScaleFactor: 2 });
    await page.goto(`http://127.0.0.1:${port}/replay.html`, { waitUntil: "networkidle0" });
    await page.waitForFunction("window.READY === true", { timeout: 20000 });
    await page.screenshot({ path: path.join(ROOT, "t4-replay.png") });
    console.log("t4-replay.png");
  }

  if (only === "short") {
    fs.mkdirSync(path.join(ROOT, "short"), { recursive: true });
    await page.setViewport({ width: 1080, height: 1920, deviceScaleFactor: 1 });
    for (const s of ["a", "b", "c", "d", "e"]) {
      await page.goto(`http://127.0.0.1:${port}/short-frame.html?s=${s}`, { waitUntil: "networkidle0" });
      await page.waitForFunction("window.READY === true", { timeout: 20000 });
      await page.screenshot({ path: path.join(ROOT, "short", `bg-${s}.png`) });
      console.log(`short/bg-${s}.png`);
    }
  }

  if (!only || only === "scratch") {
    await page.setViewport({ width: 1280, height: 900, deviceScaleFactor: 2 });
    await page.goto("https://ownback.tech/", { waitUntil: "networkidle2", timeout: 60000 });
    const box = await page.evaluate(async () => {
      const h = [...document.querySelectorAll("h1,h2,h3,p,div,span")].find((e) => /SCRATCH TO SEE WHAT YOU/i.test(e.textContent) && e.children.length < 3);
      if (!h) return null;
      let sec = h.closest("section") || h.parentElement.parentElement;
      sec.scrollIntoView({ block: "start" });
      await new Promise((r) => setTimeout(r, 800));
      // Reveal the cards: clear every scratch canvas inside the section.
      sec.querySelectorAll("canvas").forEach((c) => { c.style.opacity = "0"; });
      sec.querySelectorAll("[class*=scratch], [class*=foil], [class*=cover]").forEach((e) => { if (e.tagName !== "SECTION") e.style.opacity = "0"; });
      await new Promise((r) => setTimeout(r, 400));
      const b = sec.getBoundingClientRect();
      return { x: b.x, y: b.y + window.scrollY, width: b.width, height: b.height };
    });
    if (!box) throw new Error("scratch section not found");
    await page.screenshot({ path: path.join(ROOT, "t6-scratch-raw.png"), clip: box, captureBeyondViewport: true });
    console.log("t6-scratch-raw.png", box);
  }

  await browser.close();
  server.close();
})().catch((e) => { console.error(e); process.exit(1); });
