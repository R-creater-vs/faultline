const http = require('http');
const fs = require('fs');
const path = require('path');

// Resolve playwright from ASCEND node_modules
const playwrightPath = path.resolve(__dirname, '..', '..', 'ASCEND', 'node_modules', 'playwright');
const { chromium } = require(playwrightPath);

const DIST_DIR = path.resolve(__dirname, '..', 'dist');
const SCREENSHOTS_DIR = path.resolve(__dirname, '..', 'docs', 'screenshots');
const ARTIFACTS_DIR = path.resolve(__dirname, '..', 'artifacts');

[SCREENSHOTS_DIR, ARTIFACTS_DIR].forEach(dir => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

// Minimal static HTTP server to serve dist folder
const MIME_TYPES = {
  '.html': 'text/html',
  '.js': 'application/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
};

const server = http.createServer((req, res) => {
  let reqPath = req.url.split('?')[0];
  if (reqPath === '/' || reqPath === '') reqPath = '/index.html';
  
  const filePath = path.join(DIST_DIR, reqPath.replace(/^\//, ''));
  
  if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
    const ext = path.extname(filePath);
    res.writeHead(200, {
      'Content-Type': MIME_TYPES[ext] || 'application/octet-stream',
      'Access-Control-Allow-Origin': '*',
    });
    fs.createReadStream(filePath).pipe(res);
  } else {
    // SPA fallback
    const indexPath = path.join(DIST_DIR, 'index.html');
    res.writeHead(200, { 'Content-Type': 'text/html' });
    fs.createReadStream(indexPath).pipe(res);
  }
});

const PORT = 4175;

server.listen(PORT, async () => {
  console.log(`[FAULTLINE Capture] Serving dist on http://localhost:${PORT}`);

  try {
    const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
    const browser = await chromium.launch({ 
      executablePath: chromePath, 
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'] 
    });

    const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    page.on('console', msg => console.log('PAGE LOG:', msg.text()));
    page.on('pageerror', err => console.error('PAGE ERROR:', err));

    console.log('[FAULTLINE Capture] Loading base application...');
    await page.goto(`http://localhost:${PORT}/`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);

    // 1. Decision Room (Default view, 1440px)
    console.log('[FAULTLINE Capture] Capturing 01-decision-room (1440px)...');
    const p01 = path.join(SCREENSHOTS_DIR, '01-decision-room.png');
    await page.screenshot({ path: p01, fullPage: false });
    fs.copyFileSync(p01, path.join(ARTIFACTS_DIR, '01-decision-room.png'));

    // 2. Fault Studio View
    console.log('[FAULTLINE Capture] Capturing 02-fault-studio (1440px)...');
    await page.click('button:has-text("Fault Studio")');
    await page.waitForTimeout(600);
    const p02 = path.join(SCREENSHOTS_DIR, '02-fault-studio.png');
    await page.screenshot({ path: p02, fullPage: false });
    fs.copyFileSync(p02, path.join(ARTIFACTS_DIR, '02-fault-studio.png'));

    // 3. Breaking Point View
    console.log('[FAULTLINE Capture] Capturing 03-breaking-point (1440px)...');
    await page.click('button:has-text("Breaking Point")');
    await page.waitForTimeout(800);
    const p03 = path.join(SCREENSHOTS_DIR, '03-breaking-point.png');
    await page.screenshot({ path: p03, fullPage: false });
    fs.copyFileSync(p03, path.join(ARTIFACTS_DIR, '03-breaking-point.png'));

    // 4. Defense Bench View
    console.log('[FAULTLINE Capture] Capturing 04-defense-bench (1440px)...');
    await page.click('button:has-text("Defense Bench")');
    await page.waitForTimeout(600);
    const p04 = path.join(SCREENSHOTS_DIR, '04-defense-bench.png');
    await page.screenshot({ path: p04, fullPage: false });
    fs.copyFileSync(p04, path.join(ARTIFACTS_DIR, '04-defense-bench.png'));

    // 5. Experiment Ledger View
    console.log('[FAULTLINE Capture] Capturing 05-experiment-ledger (1440px)...');
    await page.click('button:has-text("Experiment Ledger")');
    await page.waitForTimeout(600);
    const p05 = path.join(SCREENSHOTS_DIR, '05-experiment-ledger.png');
    await page.screenshot({ path: p05, fullPage: false });
    fs.copyFileSync(p05, path.join(ARTIFACTS_DIR, '05-experiment-ledger.png'));

    // 6. Tablet 1024px (Decision Room)
    console.log('[FAULTLINE Capture] Capturing 06-tablet-1024...');
    const page1024 = await browser.newPage({ viewport: { width: 1024, height: 768 } });
    await page1024.goto(`http://localhost:${PORT}/`, { waitUntil: 'networkidle' });
    await page1024.waitForTimeout(800);
    const p06 = path.join(SCREENSHOTS_DIR, '06-tablet-1024.png');
    await page1024.screenshot({ path: p06, fullPage: false });
    fs.copyFileSync(p06, path.join(ARTIFACTS_DIR, '06-tablet-1024.png'));
    await page1024.close();

    // 7. Mobile 390px (Decision Room)
    console.log('[FAULTLINE Capture] Capturing 07-mobile-390...');
    const page390 = await browser.newPage({ viewport: { width: 390, height: 844 } });
    await page390.goto(`http://localhost:${PORT}/`, { waitUntil: 'networkidle' });
    await page390.waitForTimeout(800);
    const p07 = path.join(SCREENSHOTS_DIR, '07-mobile-390.png');
    await page390.screenshot({ path: p07, fullPage: false });
    fs.copyFileSync(p07, path.join(ARTIFACTS_DIR, '07-mobile-390.png'));
    await page390.close();

    // 8. LinkedIn 1080x1350 Showcase Composition
    console.log('[FAULTLINE Capture] Capturing 08-linkedin-showcase-cover (1080x1350)...');
    const pageCover = await browser.newPage({ viewport: { width: 1080, height: 1350 } });
    await pageCover.goto(`http://localhost:${PORT}/`, { waitUntil: 'networkidle' });
    await pageCover.waitForTimeout(1000);
    const p08 = path.join(SCREENSHOTS_DIR, '08-linkedin-showcase-cover.png');
    await pageCover.screenshot({ path: p08, fullPage: false });
    fs.copyFileSync(p08, path.join(ARTIFACTS_DIR, '08-linkedin-showcase-cover.png'));
    await pageCover.close();

    await browser.close();
    console.log('[FAULTLINE Capture] Successfully captured all 8 application screenshots!');
  } catch (err) {
    console.error('[FAULTLINE Capture Error]', err);
  } finally {
    server.close();
    process.exit(0);
  }
});
