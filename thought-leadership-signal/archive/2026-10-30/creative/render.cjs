// usage: node render.cjs stills 2,6,12 outdir   |   node render.cjs video out.mp4 [fps]
const puppeteer = require('puppeteer-core');
const { spawn } = require('child_process');
const fs = require('fs');

const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const URL = process.env.FILM_URL || 'http://localhost:8765/film.html';
const [mode, arg, out, fpsArg] = process.argv.slice(2);
// TIMEMAP=file.json: [[outT, srcT], ...] knots; output time t renders film time interpolated between knots (scene stretch).
const knots = process.env.TIMEMAP ? JSON.parse(fs.readFileSync(process.env.TIMEMAP, 'utf8')) : null;
const warp = (t) => {
  if (!knots) return t;
  let i = 1; while (i < knots.length - 1 && knots[i][0] < t) i++;
  const [o0, s0] = knots[i - 1], [o1, s1] = knots[i];
  return s0 + (s1 - s0) * Math.min(1, Math.max(0, (t - o0) / (o1 - o0)));
};

(async () => {
  const browser = await puppeteer.launch({ executablePath: CHROME, headless: 'new', args: ['--use-angle=metal', '--enable-gpu', '--ignore-gpu-blocklist', '--enable-unsafe-swiftshader'] });
  const page = await browser.newPage();
  page.on('console', (m) => console.log('[page]', m.text()));
  page.on('pageerror', (e) => console.log('[pageerror]', e.message));
  await page.setViewport({ width: 1080, height: 1350, deviceScaleFactor: 1 });
  await page.goto(URL, { waitUntil: 'networkidle0' });
  await page.waitForFunction('window.READY === true', { timeout: 60000 });
  const shot = async (t) => { await page.evaluate((t) => window.renderAt(t), t); return page.screenshot({ type: 'jpeg', quality: 95 }); };

  if (mode === 'stills') {
    fs.mkdirSync(out, { recursive: true });
    for (const t of arg.split(',').map(Number)) fs.writeFileSync(`${out}/t${String(t).padStart(5, '0')}.jpg`, await shot(t));
  } else {
    const fps = +(fpsArg || 30);
    const dur = knots ? knots[knots.length - 1][0] : await page.evaluate(() => window.DURATION);
    const ff = spawn('ffmpeg', ['-y', '-f', 'image2pipe', '-framerate', String(fps), '-c:v', 'mjpeg', '-i', '-', '-c:v', 'libx264', '-preset', 'slow', '-crf', '16', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', arg], { stdio: ['pipe', 'inherit', 'inherit'] });
    const n = Math.round(dur * fps), t0 = Date.now();
    for (let i = 0; i < n; i++) {
      const buf = await shot(warp(i / fps));
      if (!ff.stdin.write(buf)) await new Promise((r) => ff.stdin.once('drain', r));
      if (i % 60 === 0) console.log(`frame ${i}/${n} ${((Date.now() - t0) / 1000).toFixed(0)}s`);
    }
    ff.stdin.end();
    await new Promise((r) => ff.on('close', r));
  }
  await browser.close();
})();
