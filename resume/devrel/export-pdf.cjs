const puppeteer = require("puppeteer-core");
const path = require("path");
const fs = require("fs");

const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";

const jobs = [
  [
    "helius-developer-advocate/Abhinil_Agarwal_Helius_Developer_Advocate.html",
    "helius-developer-advocate/Abhinil_Agarwal_Helius_Developer_Advocate.pdf",
  ],
  [
    "nibiru-developer-relations/Abhinil_Agarwal_Nibiru_Developer_Relations.html",
    "nibiru-developer-relations/Abhinil_Agarwal_Nibiru_Developer_Relations.pdf",
  ],
];

(async () => {
  const browser = await puppeteer.launch({
    executablePath: CHROME,
    headless: "new",
    args: ["--no-sandbox", "--disable-gpu"],
  });
  for (const [htmlName, pdfName] of jobs) {
    const htmlPath = path.resolve(__dirname, htmlName);
    const outPath = path.resolve(__dirname, pdfName);
    const page = await browser.newPage();
    await page.goto(`file://${htmlPath}`, { waitUntil: "networkidle0" });
    await page.pdf({
      path: outPath,
      format: "A4",
      printBackground: true,
      margin: { top: "11mm", right: "12mm", bottom: "11mm", left: "12mm" },
    });
    console.log("wrote", outPath, fs.statSync(outPath).size);
    await page.close();
  }
  await browser.close();
})().catch((err) => {
  console.error(err);
  process.exit(1);
});
