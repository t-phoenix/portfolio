const http = require("http");
const fs = require("fs");
const path = require("path");

const ROOT = __dirname;
const NODE = path.resolve(__dirname, "../../../archive/2026-10-30/creative/node_modules");
const THREE = path.join(NODE, "three");
const puppeteer = require(path.join(NODE, "puppeteer-core"));
const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";

function fileFor(urlPath) {
  const pathname = decodeURIComponent(urlPath.split("?")[0]);
  if (pathname.startsWith("/vendor/three/")) {
    const rel = path.normalize(pathname.slice("/vendor/three/".length)).replace(/^(\.\.(\/|\\|$))+/, "");
    const file = path.join(THREE, rel);
    if (!file.startsWith(THREE)) return null;
    return file;
  }
  const file = path.resolve(ROOT, pathname.replace(/^\//, ""));
  if (file !== ROOT && !file.startsWith(ROOT + path.sep)) return null;
  if (!/\.(html|svg|png|css)$/.test(file)) return null;
  return file;
}

const server = http.createServer((req, res) => {
  const file = fileFor(new URL(req.url, "http://127.0.0.1").pathname);
  if (!file) {
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
    const type = file.endsWith(".js") ? "text/javascript" : file.endsWith(".svg") ? "image/svg+xml" : file.endsWith(".png") ? "image/png" : "text/html";
    res.writeHead(200, { "Content-Type": type });
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
  page.on("console", (m) => console.log("[page]", m.text()));
  page.on("pageerror", (e) => console.log("[pageerror]", e.message));
  await page.setViewport({ width: 1200, height: 1400, deviceScaleFactor: 2 });
  const story = process.argv[2] === "story";
  const doc = story ? "story.html" : "carousel.html";
  const prefix = story ? "story" : "slide";
  const expect = story ? 6 : 5;
  await page.goto(`http://127.0.0.1:${port}/${doc}`, { waitUntil: "networkidle0", timeout: 60000 });
  await page.waitForFunction("window.READY === true", { timeout: 30000 });
  await page.evaluate(async () => { if (document.fonts?.ready) await document.fonts.ready; });
  const slides = await page.$$(".slide");
  if (slides.length !== expect) throw new Error("expected " + expect + " slides, got " + slides.length);
  for (let i = 0; i < slides.length; i++) {
    const name = `${prefix}-0${i + 1}.png`;
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
