const puppeteer = require("puppeteer-core");
const path = require("path");
const fs = require("fs");

const CHROME =
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const htmlPath = path.resolve(
  __dirname,
  "Abhinil_Agarwal_Product_Web3_AI_Finance.html"
);
const outPath = path.resolve(
  __dirname,
  "Abhinil_Agarwal_Product_Web3_AI_Finance.pdf"
);

(async () => {
  const browser = await puppeteer.launch({
    executablePath: CHROME,
    headless: "new",
    args: ["--no-sandbox", "--disable-gpu"],
  });
  const page = await browser.newPage();
  await page.goto(`file://${htmlPath}`, { waitUntil: "networkidle0" });
  await page.evaluate(async () => {
    if (document.fonts?.ready) await document.fonts.ready;
  });
  await new Promise((r) => setTimeout(r, 600));
  await page.pdf({
    path: outPath,
    format: "A4",
    printBackground: true,
    margin: { top: "0", right: "0", bottom: "0", left: "0" },
  });
  console.log("wrote", outPath, fs.statSync(outPath).size);
  await browser.close();
})().catch((err) => {
  console.error(err);
  process.exit(1);
});
