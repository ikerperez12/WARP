import { chromium } from 'playwright';

const [, , targetUrl] = process.argv;

if (!targetUrl) {
  console.error('Usage: node scripts/diagnose-gaming.mjs <url>');
  process.exit(1);
}

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({
  viewport: { width: 1440, height: 900 },
});

const diagnostics = {
  url: targetUrl,
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
    stack: error.stack,
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

await page.goto(targetUrl, { waitUntil: 'networkidle', timeout: 45000 });

await page.waitForTimeout(12000);

const overlayState = await page.evaluate(() => {
  const overlayIds = [
    'game-loading-overlay',
    'game-start-overlay',
    'game-pause-overlay',
    'game-over-overlay',
    'game-victory-overlay',
    'game-fallback-overlay',
  ];

  const overlays = Object.fromEntries(overlayIds.map((id) => {
    const node = document.getElementById(id);
    return [id, node ? {
      hidden: node.classList.contains('is-hidden'),
      active: node.classList.contains('is-active'),
      text: node.textContent?.replace(/\s+/g, ' ').trim() ?? '',
    } : null];
  }));

  return {
    title: document.title,
    loadingPercent: document.getElementById('loading-progress-value')?.textContent ?? null,
    loadingLabel: document.getElementById('loading-progress-label')?.textContent ?? null,
    fallbackTitle: document.querySelector('#game-fallback-overlay h2')?.textContent ?? null,
    fallbackLead: document.querySelector('#game-fallback-overlay .panel-lead')?.textContent ?? null,
    canvasPresent: Boolean(document.getElementById('game-canvas')),
    overlays,
  };
});

console.log(JSON.stringify({
  ...diagnostics,
  overlayState,
}, null, 2));

await browser.close();
