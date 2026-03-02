import fs from 'node:fs/promises';
import path from 'node:path';
import { chromium } from 'playwright';

const [, , targetUrl = 'http://127.0.0.1:4173/gaming.html', outputDirArg = 'artifacts/gaming-captures'] = process.argv;
const outputDir = path.resolve(process.cwd(), outputDirArg);

await fs.mkdir(outputDir, { recursive: true });

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({
  viewport: { width: 1440, height: 900 },
});

const diagnostics = {
  targetUrl,
  outputDir,
  console: [],
  pageErrors: [],
  requestFailures: [],
  badResponses: [],
};

page.on('console', (message) => {
  diagnostics.console.push({
    type: message.type(),
    text: message.text(),
  });
});

page.on('pageerror', (error) => {
  diagnostics.pageErrors.push({
    name: error.name,
    message: error.message,
  });
});

page.on('requestfailed', (request) => {
  diagnostics.requestFailures.push({
    url: request.url(),
    method: request.method(),
    failure: request.failure()?.errorText ?? 'unknown',
  });
});

page.on('response', (response) => {
  if (response.status() >= 400) {
    diagnostics.badResponses.push({
      url: response.url(),
      status: response.status(),
    });
  }
});

const captureOverlayState = async () => page.evaluate(() => {
  const overlayIds = [
    'game-loading-overlay',
    'game-start-overlay',
    'game-fallback-overlay',
  ];

  return {
    title: document.title,
    overlays: Object.fromEntries(overlayIds.map((id) => {
      const node = document.getElementById(id);
      return [id, node ? {
        hidden: node.classList.contains('is-hidden'),
        active: node.classList.contains('is-active'),
      } : null];
    })),
  };
});

await page.goto(targetUrl, { waitUntil: 'networkidle', timeout: 45000 });
await page.waitForTimeout(4000);
await page.screenshot({ path: path.join(outputDir, '01-start.png') });

await page.click('#btn-start-game');
await page.waitForTimeout(3500);
await page.screenshot({ path: path.join(outputDir, '02-live.png') });

await page.keyboard.down('w');
await page.waitForTimeout(2600);
await page.keyboard.up('w');
await page.waitForTimeout(800);
await page.screenshot({ path: path.join(outputDir, '03-drive.png') });

const overlayState = await captureOverlayState();

await fs.writeFile(
  path.join(outputDir, 'diagnostics.json'),
  JSON.stringify({ ...diagnostics, overlayState }, null, 2),
  'utf8',
);

console.log(JSON.stringify({
  outputDir,
  screenshots: ['01-start.png', '02-live.png', '03-drive.png'],
  diagnostics: 'diagnostics.json',
}, null, 2));

await browser.close();
