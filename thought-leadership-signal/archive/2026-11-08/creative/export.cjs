// Stills: every slide at its final state (render(LOOP)).
// Hero loop: slide 1 stepped through window.render(t) frame by frame, plus a 1.5s hold, then ffmpeg -> hero-loop.mp4.
// Usage: node export.cjs            (stills + loop)
//        node export.cjs --stills   (stills only)
const http = require("http");
const fs = require("fs");
const os = require("os");
const path = require("path");
const { execFileSync } = require("child_process");

const ROOT = __dirname;
const puppeteer = require(path.resolve(__dirname, "../../../archive/2026-10-30/creative/node_modules/puppeteer-core"));
const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const TYPES = { ".html": "text/html", ".jpg": "image/jpeg", ".png": "image/png", ".svg": "image/svg+xml" };
const FPS = 30, HOLD = 1.5;

const server = http.createServer((req, res) => {
  const file = path.resolve(ROOT, decodeURIComponent(new URL(req.url, "http://127.0.0.1").pathname).replace(/^\//, ""));
  if (!file.startsWith(ROOT + path.sep)) { res.writeHead(404); return res.end(); }
  fs.readFile(file, (err, buf) => {
    if (err) { res.writeHead(404); return res.end(); }
    res.writeHead(200, { "Content-Type": TYPES[path.extname(file)] || "application/octet-stream" });
    res.end(buf);
  });
});

(async () => {
  await new Promise((r) => server.listen(0, "127.0.0.1", r));
  const browser = await puppeteer.launch({ executablePath: CHROME, headless: "new" });
  const page = await browser.newPage();
  await page.setViewport({ width: 1200, height: 1500, deviceScaleFactor: 2 });
  await page.goto(`http://127.0.0.1:${server.address().port}/carousel.html`, { waitUntil: "networkidle0", timeout: 60000 });
  await page.waitForFunction("window.READY === true", { timeout: 20000 });
  const loop = await page.evaluate(() => window.LOOP);

  const slides = await page.$$(".slide");
  if (slides.length !== 5) throw new Error("expected 5 slides, got " + slides.length);
  await page.evaluate((t) => window.render(t), loop);
  for (let i = 0; i < slides.length; i++) {
    const out = path.join(ROOT, `slide-0${i + 1}.png`);
    await slides[i].screenshot({ path: out, type: "png" });
    if (fs.statSync(out).size < 200000) throw new Error(out + " looks empty");
    console.log("wrote", path.basename(out));
  }

  if (!process.argv.includes("--stills")) {
    await page.setViewport({ width: 1200, height: 1500, deviceScaleFactor: 1 });
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), "signal-hero-"));
    const frames = Math.round((loop + HOLD) * FPS);
    for (let f = 0; f < frames; f++) {
      await page.evaluate((t) => window.render(t), f / FPS);
      await slides[0].screenshot({ path: path.join(dir, `f${String(f).padStart(4, "0")}.png`), type: "png" });
    }
    const out = path.join(ROOT, "hero-loop.mp4");
    execFileSync("ffmpeg", ["-y", "-loglevel", "error", "-framerate", String(FPS), "-i", path.join(dir, "f%04d.png"),
      "-c:v", "libx264", "-pix_fmt", "yuv420p", "-crf", "17", "-preset", "slow", "-movflags", "+faststart", out]);
    fs.rmSync(dir, { recursive: true, force: true });
    console.log("wrote hero-loop.mp4", frames, "frames");
  }
  await browser.close();
  server.close();
})().catch((err) => { console.error(err); process.exit(1); });
