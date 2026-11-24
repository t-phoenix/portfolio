const puppeteer = require("puppeteer-core");
const path = require("path");
const fs = require("fs");

const CHROME =
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const htmlPath = path.resolve(
  __dirname,
  "Abhinil_Agarwal_Senior_Solidity_DeFi_Engineer.html"
);
const outPath = path.resolve(
  __dirname,
  "Abhinil_Agarwal_Senior_Solidity_DeFi_Engineer.pdf"
);

(async () => {
  const browser = await puppeteer.launch({
    executablePath: CHROME,
    headless: "new",
    args: ["--no-sandbox", "--disable-gpu"],
  });
  const page = await browser.newPage();
  await page.goto(`file://${htmlPath}`, { waitUntil: "networkidle0" });
  await page.pdf({
    path: outPath,
    format: "A4",
    printBackground: true,
    margin: { top: "11mm", right: "12mm", bottom: "11mm", left: "12mm" },
  });
  console.log("wrote", outPath, fs.statSync(outPath).size);
  await browser.close();
})().catch((err) => {
  console.error(err);
  process.exit(1);
});
