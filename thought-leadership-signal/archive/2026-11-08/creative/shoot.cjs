// Stills for static pages: node shoot.cjs page.html outPrefix  ->  outPrefix-1.png ... one per .slide
const path = require("path");
const fs = require("fs");
const http = require("http");
const puppeteer = require(path.resolve(__dirname, "../../../archive/2026-10-30/creative/node_modules/puppeteer-core"));

const ROOT = __dirname;
const TYPES = { ".html": "text/html", ".png": "image/png", ".jpg": "image/jpeg", ".svg": "image/svg+xml" };
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
  const browser = await puppeteer.launch({ executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome", headless: "new" });
  const page = await browser.newPage();
  await page.setViewport({ width: 3500, height: 1500, deviceScaleFactor: 1 });
  await page.goto(`http://127.0.0.1:${server.address().port}/${process.argv[2]}`, { waitUntil: "networkidle0" });
  await page.waitForFunction("window.READY === true");
  const slides = await page.$$(".slide");
  for (let i = 0; i < slides.length; i++) await slides[i].screenshot({ path: `${process.argv[3]}-${i + 1}.png` });
  await browser.close();
  server.close();
})().catch((err) => { console.error(err); process.exit(1); });
