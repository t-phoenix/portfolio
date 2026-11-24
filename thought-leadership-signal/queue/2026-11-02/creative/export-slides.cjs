const http = require("http");
const fs = require("fs");
const path = require("path");

const ROOT = __dirname;
const NODE = path.resolve(__dirname, "../../../archive/2026-10-30/creative/node_modules");
const puppeteer = require(path.join(NODE, "puppeteer-core"));
const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";

const server = http.createServer((req, res) => {
  const file = path.resolve(ROOT, decodeURIComponent(new URL(req.url, "http://127.0.0.1").pathname).replace(/^\//, ""));
  if (file !== ROOT && !file.startsWith(ROOT + path.sep)) {
    res.writeHead(404);
    res.end();
    return;
  }
  fs.readFile(file, (err, buf) => {
    if (err) {
      res.writeHead(404);
      res.end();
      return;
    }
    res.writeHead(200, { "Content-Type": "text/html" });
    res.end(buf);
  });
});

(async () => {
  await new Promise((r) => server.listen(0, "127.0.0.1", r));
  const port = server.address().port;
  const browser = await puppeteer.launch({
    executablePath: CHROME,
    headless: "new",
    args: ["--use-angle=metal", "--enable-gpu", "--ignore-gpu-blocklist", "--enable-unsafe-swiftshader"],
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1200, height: 1400, deviceScaleFactor: 2 });
  await page.goto(`http://127.0.0.1:${port}/carousel.html`, { waitUntil: "networkidle0", timeout: 60000 });
  await page.waitForFunction("window.READY === true", { timeout: 20000 });
  await page.evaluate(async () => { if (document.fonts?.ready) await document.fonts.ready; });
  const slides = await page.$$(".slide");
  if (slides.length !== 4) throw new Error("expected 4 slides, got " + slides.length);
  for (let i = 0; i < slides.length; i++) {
    const name = `slide-0${i + 1}.png`;
    const out = path.join(ROOT, name);
    await slides[i].screenshot({ path: out, type: "png" });
    const size = fs.statSync(out).size;
    if (size < 50000) throw new Error(name + " looks empty: " + size);
    console.log("wrote", name, size);
  }
  await browser.close();
  server.close();
})().catch((err) => {
  console.error(err);
  process.exit(1);
});
