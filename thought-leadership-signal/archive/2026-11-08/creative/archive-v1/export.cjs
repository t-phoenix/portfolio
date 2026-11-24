// Stills: every slide frozen at t=3s (doodles drawn, sheen gone).
// Loops: slides listed in LOOPS rendered frame by frame (deterministic, via Web Animations currentTime), then ffmpeg -> mp4.
// Usage: node export.cjs            (stills + loops)
//        node export.cjs --stills   (stills only)
const http = require("http");
const fs = require("fs");
const path = require("path");
const { execFileSync } = require("child_process");

const ROOT = __dirname;
const NODE = path.resolve(__dirname, "../../../archive/2026-10-30/creative/node_modules");
const puppeteer = require(path.join(NODE, "puppeteer-core"));
const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const TYPES = { ".html": "text/html", ".jpg": "image/jpeg", ".png": "image/png" };
const STILL_T = 3000, LOOP_MS = 6000, FPS = 30;
const LOOPS = { 1: "hero-loop.mp4", 3: "spinners-loop.mp4" };

const server = http.createServer((req, res) => {
  const file = path.resolve(ROOT, decodeURIComponent(new URL(req.url, "http://127.0.0.1").pathname).replace(/^\//, ""));
  if (file !== ROOT && !file.startsWith(ROOT + path.sep)) { res.writeHead(404); return res.end(); }
  fs.readFile(file, (err, buf) => {
    if (err) { res.writeHead(404); return res.end(); }
    res.writeHead(200, { "Content-Type": TYPES[path.extname(file)] || "application/octet-stream" });
    res.end(buf);
  });
});

const seek = (page, t) => page.evaluate((t) => document.getAnimations().forEach((a) => { a.pause(); a.currentTime = t; }), t);

(async () => {
  await new Promise((r) => server.listen(0, "127.0.0.1", r));
  const browser = await puppeteer.launch({ executablePath: CHROME, headless: "new", args: ["--use-angle=metal", "--enable-gpu", "--ignore-gpu-blocklist"] });
  const page = await browser.newPage();
  await page.setViewport({ width: 1200, height: 1500, deviceScaleFactor: 2 });
  await page.goto(`http://127.0.0.1:${server.address().port}/carousel.html`, { waitUntil: "networkidle0", timeout: 60000 });
  await page.waitForFunction("window.READY === true", { timeout: 20000 });

  const slides = await page.$$(".slide");
  if (slides.length !== 5) throw new Error("expected 5 slides, got " + slides.length);

  await seek(page, STILL_T);
  for (let i = 0; i < slides.length; i++) {
    const out = path.join(ROOT, `slide-0${i + 1}.png`);
    await slides[i].screenshot({ path: out, type: "png" });
    const size = fs.statSync(out).size;
    if (size < 200000) throw new Error(out + " looks empty: " + size);
    console.log("wrote", path.basename(out), size);
  }

  if (!process.argv.includes("--stills")) {
    await page.setViewport({ width: 1200, height: 1500, deviceScaleFactor: 1 });
    for (const [n, name] of Object.entries(LOOPS)) {
      const dir = fs.mkdtempSync(path.join(require("os").tmpdir(), "signal-frames-"));
      const frames = (LOOP_MS / 1000) * FPS;
      for (let f = 0; f < frames; f++) {
        await seek(page, (f * 1000) / FPS);
        await slides[n - 1].screenshot({ path: path.join(dir, `f${String(f).padStart(4, "0")}.png`), type: "png" });
      }
      const out = path.join(ROOT, name);
      execFileSync("ffmpeg", ["-y", "-loglevel", "error", "-framerate", String(FPS), "-i", path.join(dir, "f%04d.png"),
        "-c:v", "libx264", "-pix_fmt", "yuv420p", "-crf", "16", "-preset", "slow", "-movflags", "+faststart", out]);
      fs.rmSync(dir, { recursive: true, force: true });
      console.log("wrote", name, fs.statSync(out).size);
    }
  }
  await browser.close();
  server.close();
})().catch((err) => { console.error(err); process.exit(1); });
