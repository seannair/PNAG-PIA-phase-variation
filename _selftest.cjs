/* Loads index.html?test=1 in headless Chromium and reports the self-test badge. */
const { createRequire } = require('module');
const fs = require('fs'), path = require('path'), os = require('os');
const req = createRequire('C:/Users/sfaas/html-video/packages/adapter-hyperframes/package.json');
const { chromium } = req('playwright');

const url = process.argv[2] || 'file:///C:/Users/sfaas/Documents/Qwen/workspace/ica-is256-animation/index.html?test=1';

(async () => {
  let browser;
  try {
    browser = await chromium.launch();
  } catch (e) {
    const dir = path.join(os.homedir(), 'AppData', 'Local', 'ms-playwright');
    const builds = fs.readdirSync(dir).filter(d => /^chromium-\d+$/.test(d))
      .sort((a, b) => parseInt(b.split('-')[1]) - parseInt(a.split('-')[1]));
    let exe;
    for (const b of builds) {
      const c = path.join(dir, b, 'chrome-win64', 'chrome.exe');
      if (fs.existsSync(c)) { exe = c; break; }
    }
    if (!exe) throw e;
    console.log('FALLBACK executablePath:', exe);
    browser = await chromium.launch({ executablePath: exe });
  }
  const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
  const errors = [];
  page.on('pageerror', e => errors.push('PAGEERROR: ' + e.message));
  page.on('console', m => { if (m.type() === 'error') errors.push('CONSOLE: ' + m.text()); });
  await page.goto(url, { waitUntil: 'load' });
  await page.waitForTimeout(600);
  const res = await page.evaluate(() => ({
    badge: document.getElementById('badge').textContent,
    selftest: document.body.dataset.selftest || ''
  }));
  console.log(JSON.stringify(res));
  if (errors.length) { console.log('ERRORS:\n' + errors.join('\n')); process.exitCode = 1; }
  await browser.close();
})().catch(e => { console.error('FATAL:', e.message); process.exit(2); });
