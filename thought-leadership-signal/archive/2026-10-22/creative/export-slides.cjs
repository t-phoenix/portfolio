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
  await page.setViewport({ width: 1200, height: 4600, deviceScaleFactor: 2 });
  await page.goto(`file://${htmlPath}`, { waitUntil: "networkidle0" });
  await page.evaluate(async () => {
    if (document.fonts?.ready) await document.fonts.ready;
  });
  await new Promise((r) => setTimeout(r, 800));

  const overflow = await page.evaluate(() => {
    const problems = [];
    document.querySelectorAll(".slide").forEach((slide, i) => {
      const root = slide.getBoundingClientRect();
      slide.querySelectorAll("h1, h2, .n, .pct, .amt, .big, .who, .d, .role, .note, .closer, .k, .eye").forEach((el) => {
        const r = el.getBoundingClientRect();
        const text = (el.textContent || "").trim().slice(0, 40);
        if (r.right > root.right - 8 || r.left < root.left + 8 || r.bottom > root.bottom - 8 || r.top < root.top + 8) {
          problems.push(`slide ${i + 1} edge: ${text}`);
        }
        if (el.scrollWidth > el.clientWidth + 8 || el.scrollHeight > el.clientHeight + 8) {
          problems.push(`slide ${i + 1} clip: ${text} sw${el.scrollWidth} cw${el.clientWidth}`);
        }
      });
    });
    return problems;
  });
  if (overflow.length) {
    console.error("OVERFLOW\n" + overflow.join("\n"));
  } else {
    console.log("overflow check: clean");
  }

  const slides = await page.$$(".slide");
  for (let i = 0; i < slides.length; i++) {
    const name = `slide-0${i + 1}.png`;
    const out = path.join(outDir, name);
    await slides[i].screenshot({ path: out, type: "png" });
    console.log("wrote", name, fs.statSync(out).size);
  }
  await browser.close();
  if (overflow.length) process.exit(2);
})().catch((err) => {
  console.error(err);
  process.exit(1);
});
