const puppeteer = require("puppeteer-core");
const path = require("path");
const fs = require("fs");

const CHROME =
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const htmlPath = path.resolve(__dirname, "hero.html");
const outPath = path.resolve(__dirname, "hero.png");

(async () => {
  const browser = await puppeteer.launch({
    executablePath: CHROME,
    headless: "new",
    args: ["--no-sandbox", "--disable-gpu"],
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1200, height: 1200, deviceScaleFactor: 2 });
  await page.goto(`file://${htmlPath}`, { waitUntil: "networkidle0" });
  await page.evaluate(async () => {
    if (document.fonts?.ready) await document.fonts.ready;
  });
  await new Promise((r) => setTimeout(r, 800));
  const hero = await page.$(".hero");
  if (!hero) throw new Error("missing .hero");
  await hero.screenshot({ path: outPath, type: "png" });
  console.log("wrote hero.png", fs.statSync(outPath).size);
  await browser.close();
})().catch((err) => {
  console.error(err);
  process.exit(1);
});
