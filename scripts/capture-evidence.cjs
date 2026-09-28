/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require('C:/Users/Lenovo/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');

async function main() {
  const phase = process.argv[2];
  if (!['before', 'after'].includes(phase)) throw new Error('Use before or after');
  const output = path.join(__dirname, '..', 'docs', 'usability-evidence', phase);
  fs.mkdirSync(output, { recursive: true });
  const browser = await chromium.launch({ headless: true, executablePath: 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe' });
  const pages = [
    ['t1-pencarian', '/knowledge'],
    ['t5-status-revisi', '/review'],
    ['t3-laporan', '/knowledge/panduan-struk-parkir'],
  ];
  for (const [name, route] of pages) {
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
    await page.goto(`http://127.0.0.1:3000${route}`);
    await page.getByText('Pagi Sore').first().waitFor();
    await page.waitForTimeout(1100);
    await page.screenshot({ path: path.join(output, `${name}-desktop.png`), fullPage: true });
    await page.close();
  }
  if (phase === 'after') {
    for (const [name, route] of pages) {
      const page = await browser.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1, isMobile: true });
      await page.goto(`http://127.0.0.1:3000${route}`);
      await page.waitForTimeout(1100);
      await page.screenshot({ path: path.join(output, `${name}-mobile.png`), fullPage: true });
      await page.close();
    }
  }
  await browser.close();
}

main().catch((error) => { console.error(error); process.exit(1); });
