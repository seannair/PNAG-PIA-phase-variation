/* Deterministic MP4 frame capture: drives window.__IS256.render(i/30) via Playwright,
   screenshots the 1920x1080 viewport per frame. Usage: node _capture.mjs [start] [endExclusive] */
import { createRequire } from 'module';
import fs from 'fs';
import path from 'path';
import os from 'os';
import { fileURLToPath } from 'url';
const req = createRequire('C:/Users/sfaas/html-video/packages/adapter-hyperframes/package.json');
const { chromium } = req('playwright');

const DIR = path.dirname(fileURLToPath(import.meta.url));
const BASE = 'file:///C:/Users/sfaas/Documents/Qwen/workspace/ica-is256-animation/index.html?render=1';
const OUT = path.join(DIR, '_frames');
const FPS = 30;
const start = Number(process.argv[2] ?? 0);
const end = Number(process.argv[3] ?? 1080); // exclusive

(async () => {
  let browser;
  try {
    browser = await chromium.launch();
  } catch (e) {
    const dir = path.join(os.homedir(), 'AppData', 'Local', 'ms-playwright');
    const builds = fs.readdirSync(dir).filter(d => /^chromium-\d+$/.test(d))
      .sort((a, b) => parseInt(b.split('-')[1]) - parseInt(a.split('-')[1]));
    let exe;
    for (const b of builds) { const c = path.join(dir, b, 'chrome-win64', 'chrome.exe'); if (fs.existsSync(c)) { exe = c; break; } }
    browser = await chromium.launch({ executablePath: exe });
  }
  fs.mkdirSync(OUT, { recursive: true });
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 1 });
  const errors = [];
  page.on('pageerror', e => errors.push(`PAGEERROR ${e.message}`));
  await page.goto(BASE, { waitUntil: 'load' });
  await page.waitForTimeout(300);
  const t0 = Date.now();
  for (let i = start; i < end; i++) {
    await page.evaluate(t => window.__IS256.render(t), i / FPS);
    await page.screenshot({ path: path.join(OUT, `frame_${String(i).padStart(4, '0')}.png`) });
    if (i % 90 === 0) console.log(`frame ${i}/${end - start} (${((Date.now() - t0) / 1000).toFixed(1)}s)`);
  }
  console.log(`done ${start}-${end - 1} in ${((Date.now() - t0) / 1000).toFixed(1)}s`);
  if (errors.length) { console.log('ERRORS:\n' + errors.join('\n')); process.exitCode = 1; }
  await browser.close();
})().catch(e => { console.error('FATAL:', e.message); process.exit(2); });
