const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');
const puppeteer = require('puppeteer-core');
const chromium = require('@sparticuz/chromium').default;
const { getAllRoutes, SITEMAP_HOST } = require('./site-data.cjs');

const ROUTES = getAllRoutes();

const DIST_DIR = path.join(process.cwd(), 'dist');
const VERCEL_CONFIG_PATH = path.join(process.cwd(), 'vercel.json');
const PORT = process.env.PRERENDER_PORT || 5173;
const HOST = `http://localhost:${PORT}`;
const IS_LINUX = process.platform === 'linux';
const DEBUG_PRERENDER_LOCAL = process.env.DEBUG_PRERENDER_LOCAL === '1';

function ensureDir(p) {
  if (!fs.existsSync(p)) fs.mkdirSync(p, { recursive: true });
}

function readVercelConfig() {
  if (!fs.existsSync(VERCEL_CONFIG_PATH)) {
    console.warn('vercel.json not found; skipping rewrite validation.');
    return null;
  }

  try {
    return JSON.parse(fs.readFileSync(VERCEL_CONFIG_PATH, 'utf8'));
  } catch (err) {
    console.warn('Unable to parse vercel.json:', err.message);
    return null;
  }
}

function validateVercelRewrites() {
  const config = readVercelConfig();
  if (!config) return;

  const rewrites = Array.isArray(config.rewrites) ? config.rewrites : [];
  const expectedRoutes = new Set(ROUTES.filter((route) => route !== '/'));
  const seenRoutes = new Set();
  const missing = [];
  const extra = [];

  for (const item of rewrites) {
    if (!item || typeof item.source !== 'string' || typeof item.destination !== 'string') continue;
    if (item.source === '(.*)') continue;

    seenRoutes.add(item.source);

    if (!expectedRoutes.has(item.source)) {
      extra.push(item.source);
      continue;
    }

    const expectedDestination = `${item.source}/index.html`;
    if (item.destination !== expectedDestination) {
      console.warn(
        `vercel.json rewrite mismatch for ${item.source}: expected ${expectedDestination}, got ${item.destination}`
      );
    }
  }

  for (const route of expectedRoutes) {
    if (!seenRoutes.has(route)) missing.push(route);
  }

  const fallback = rewrites.some(
    (item) => item && item.source === '(.*)' && item.destination === '/index.html'
  );

  if (missing.length) {
    console.warn(`vercel.json is missing rewrites for: ${missing.join(', ')}`);
  }
  if (extra.length) {
    console.warn(`vercel.json contains extra rewrites not in prerender route list: ${extra.join(', ')}`);
  }
  if (!fallback) {
    console.warn('vercel.json is missing SPA fallback rewrite "(.*)" -> "/index.html".');
  }

  if (!missing.length && !extra.length && fallback) {
    console.log('vercel.json rewrite list matches prerender routes.');
  } else {
    console.warn('Vercel route consistency check completed. Missing or mismatched rewrites will not block the build.');
  }
}

async function startStaticServer() {
  return new Promise((resolve, reject) => {
    let sirvCliPath;
    try {
      sirvCliPath = require.resolve('sirv-cli/bin.js');
    } catch (err) {
      return reject(new Error('Unable to resolve sirv-cli package. Make sure it is installed.'));
    }

    const server = spawn(process.execPath, [sirvCliPath, 'dist', '--single', '--port', String(PORT)], { stdio: 'inherit' });

    server.on('error', (err) => reject(err));
    // Give server a moment to start
    setTimeout(() => resolve(server), 800);
  });
}

async function prerender() {
  if (!IS_LINUX && !DEBUG_PRERENDER_LOCAL) {
    console.warn('Skipping prerender on non-Linux environment. This script is intended for Linux CI like Vercel.');
    return;
  }

  let serverProcess;
  try {
    if (!fs.existsSync(DIST_DIR)) {
      throw new Error('dist folder not found. Run `npm run build` first.');
    }

    console.log('Validating vercel.json rewrite consistency...');
    validateVercelRewrites();

    console.log('Starting static server...');
    serverProcess = await startStaticServer();

    console.log('Launching headless browser...');
  const executablePath = await chromium.executablePath();
  console.log('Chromium executable path:', executablePath);
  const browser = await puppeteer.launch({
    executablePath,
    headless: 'new',
    args: [
      ...chromium.args,
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-accelerated-2d-canvas',
      '--disable-gpu',
    ],
    ignoreHTTPSErrors: true,
    defaultViewport: { width: 1280, height: 800 },
  });
  const page = await browser.newPage();

  for (const route of ROUTES) {
    const routeStart = Date.now();
    const url = route === '/' ? `${HOST}/` : `${HOST}${route}`;
    console.log(`Prerendering route=${route} url=${url}`);
    try {
      const waitOptions = {
        waitUntil: 'domcontentloaded',
        timeout: 120000,
      };

      const response = await page.goto(url, waitOptions);
      console.log(`  response status=${response ? response.status() : 'no response'}`);

      const selector = 'h1.page-title';
      console.log(`  waiting for selector ${selector}`);
      await page.waitForSelector(selector, { timeout: 120000 });

      if (route === '/stopwatch' || route === '/percentage-calculator') {
        console.log('  applying extra render wait for route', route);
        await new Promise((resolve) => setTimeout(resolve, 1000));
      } else {
        await new Promise((resolve) => setTimeout(resolve, 600));
      }

      const html = await page.content();
      const title = await page.title();
      const description = await page.$eval('meta[name="description"]', (el) => el.getAttribute('content')).catch(() => 'missing');
      console.log(`  page title=${title}`);
      console.log(`  page description=${description}`);
      console.log(`  route prerendered successfully in ${Date.now() - routeStart}ms`);

      // Determine output path
      if (route === '/') {
        // leave root index.html as-is
        console.log('Skipping root replacement (keep dist/index.html)');
      } else {
        const outDir = path.join(DIST_DIR, route.replace(/(^\/|\/$)/g, ''));
        ensureDir(outDir);
        const outPath = path.join(outDir, 'index.html');
        fs.writeFileSync(outPath, html, 'utf8');
        console.log('Wrote', outPath);
      }
    } catch (e) {
      console.error(`Failed to prerender ${route}:`, e.message);
      console.error(e.stack || e);
      console.error(`Route ${route} failed after ${Date.now() - routeStart}ms`);
    }
  }

  // Generate sitemap.xml using calccode.com as requested
  const sitemapEntries = ROUTES.map((r) => {
    const loc = r === '/' ? `${SITEMAP_HOST}/` : `${SITEMAP_HOST}${r}`;
    return `  <url>\n    <loc>${loc}</loc>\n  </url>`;
  }).join('\n');
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${sitemapEntries}\n</urlset>`;
  fs.writeFileSync(path.join(DIST_DIR, 'sitemap.xml'), sitemap, 'utf8');
  console.log('Wrote sitemap.xml');

  // Update robots.txt to reference sitemap
  const robots = `User-agent: *\nAllow: /\nSitemap: https://calccode.com/sitemap.xml\n`;
  fs.writeFileSync(path.join(DIST_DIR, 'robots.txt'), robots, 'utf8');
  console.log('Wrote robots.txt');

  await browser.close();
  console.log('Prerender complete.');
  return;
  } catch (err) {
    console.error('Prerender encountered an issue. The SPA fallback will still be used to deploy the site.');
    console.error(err);
    return;
  } finally {
    if (serverProcess) {
      try {
        serverProcess.kill();
      } catch (e) {
        // ignore
      }
    }
  }
}

prerender();
