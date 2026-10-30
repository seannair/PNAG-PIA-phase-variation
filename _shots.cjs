/* Captures index.html?render=1&t=<sec> at 3 viewports into _shots/. */
const { createRequire } = require('module');
const fs = require('fs'), path = require('path'), os = require('os');
const req = createRequire('C:/Users/sfaas/html-video/packages/adapter-hyperframes/package.json');
const { chromium } = req('playwright');

const BASE = 'file:///C:/Users/sfaas/Documents/Qwen/workspace/ica-is256-animation/index.html';
const OUT  = path.join(__dirname, '_shots');
const VIEWS = [
  ['desktop',   1920, 1080],
  ['phone-por', 390, 844],
  ['phone-land',844, 390]
];
/* extra timestamps can be passed as CLI args: node _shots.cjs 0 1.15 2.6 */
const TS = [...new Set([4, 12, 17.5, 23, 29.5, 35.5, ...process.argv.slice(2).map(parseFloat)].filter(Number.isFinite))].sort((a,b)=>a-b);

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
  const errors = [];
  for (const [name, w, h] of VIEWS) {
    const page = await browser.newPage({ viewport: { width: w, height: h }, isMobile: name !== 'desktop', hasTouch: name !== 'desktop' });
    page.on('pageerror', e => errors.push(`${name} PAGEERROR ${e.message}`));
    for (const t of TS) {
      await page.goto(BASE + `?render=1&t=${t}`, { waitUntil: 'load' });
      await page.waitForTimeout(300);
      const f = path.join(OUT, `${name}_t${String(t).replace('.', '_')}.png`);
      await page.screenshot({ path: f });
    }
    console.log('done', name);
    await page.close();
  }
  if (errors.length) { console.log('ERRORS:\n' + errors.join('\n')); process.exitCode = 1; }
  await browser.close();
})().catch(e => { console.error('FATAL:', e.message); process.exit(2); });
