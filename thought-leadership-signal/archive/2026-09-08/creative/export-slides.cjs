const puppeteer = require("puppeteer-core");
const path = require("path");
const fs = require("fs");

const CHROME =
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const htmlPath = path.resolve(__dirname, "carousel.html");
const outDir = __dirname;

(async () => {
  const browser = await puppeteer.launch({
    executablePath: CHROME,
    headless: "new",
    args: ["--no-sandbox", "--disable-gpu"],
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1200, height: 1400, deviceScaleFactor: 2 });
  await page.goto(`file://${htmlPath}`, { waitUntil: "networkidle0" });
  // wait for webfonts
  await page.evaluate(async () => {
    if (document.fonts?.ready) await document.fonts.ready;
  });
  await new Promise((r) => setTimeout(r, 800));

  const slides = await page.$$(".slide");
  for (let i = 0; i < slides.length; i++) {
    const name = `slide-0${i + 1}.png`;
    const out = path.join(outDir, name);
    await slides[i].screenshot({ path: out, type: "png" });
    console.log("wrote", name, fs.statSync(out).size);
  }
  await browser.close();
})().catch((err) => {
  console.error(err);
  process.exit(1);
});
