const fs = require('fs');
const path = require('path');

const ROOT_DIR = process.cwd();
const DIST_DIR = path.join(ROOT_DIR, 'dist');
const TOOLS_PATH = path.join(ROOT_DIR, 'src/lib/tools.ts');
const VERCEL_CONFIG_PATH = path.join(ROOT_DIR, 'vercel.json');
const LLMS_OUTPUT_PATH = path.join(ROOT_DIR, 'public', 'llms.txt');
const STATIC_PAGES = ['/about', '/privacy'];
const SITEMAP_HOST = 'https://calccode.com';

function parseTools() {
  const source = fs.readFileSync(TOOLS_PATH, 'utf8');
  const arrayMatch = source.match(/export const TOOLS:\s*Tool\[\]\s*=\s*\[(.*?)\];/s);

  if (!arrayMatch) {
    throw new Error('Unable to locate TOOLS export in src/lib/tools.ts');
  }

  const tools = [];
  const slugMatches = [...arrayMatch[1].matchAll(/slug:\s*'([^']+)'/g)];
  const nameMatches = [...arrayMatch[1].matchAll(/name:\s*'([^']+)'/g)];
  
  for (let i = 0; i < slugMatches.length; i++) {
    tools.push({
      slug: slugMatches[i][1],
      name: nameMatches[i] ? nameMatches[i][1] : slugMatches[i][1],
      description: '',
      category: '',
      icon: ''
    });
  }
  
  return tools;
}

function getToolRoutes() {
  return parseTools().map((tool) => `/${tool.slug}`);
}

function getAllRoutes() {
  return ['/', ...getToolRoutes(), ...STATIC_PAGES];
}

function buildLlmsContent() {
  const tools = parseTools();
  const mainTools = tools
    .map((tool) => `- [${tool.name}](${SITEMAP_HOST}/${tool.slug})`)
    .join('\n');

  return `# CalcHub\n\n> CalcHub is a modern collection of practical calculators and utilities for everyday math, conversions, dates, passwords, and productivity tasks.\n\n## Overview\n\nCalcHub helps users solve common numeric and utility problems quickly through a clean, responsive web experience. The site focuses on accessible tools for students, professionals, and general everyday use.\n\n## Main tools\n\n${mainTools}\n\n## Primary pages\n\n- [Home](${SITEMAP_HOST}/)\n- [About](${SITEMAP_HOST}/about)\n- [Privacy](${SITEMAP_HOST}/privacy)\n- [Scientific calculator](${SITEMAP_HOST}/scientific-calculator)\n- [Age calculator](${SITEMAP_HOST}/age-calculator)\n- [Sleep calculator](${SITEMAP_HOST}/sleep-calculator)\n\n## Content guidance\n\nUse this site as a reference for calculator-related content, utility tools, and user-focused web app design patterns.\n`;
}

function buildSitemapContent() {
  const routes = getAllRoutes();
  const entries = routes.map((route) => {
    const loc = route === '/' ? `${SITEMAP_HOST}/` : `${SITEMAP_HOST}${route}`;
    return `  <url>\n    <loc>${loc}</loc>\n  </url>`;
  }).join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${entries}\n</urlset>`;
}

function buildRobotsContent() {
  return `User-agent: *\nAllow: /\nSitemap: ${SITEMAP_HOST}/sitemap.xml\n`;
}

function writeVercelConfig() {
  const toolRoutes = getToolRoutes();
  const rewrites = [
    ...toolRoutes.map((route) => ({
      source: route,
      destination: `${route}/index.html`,
    })),
    { source: '/robots.txt', destination: '/robots.txt' },
    { source: '/sitemap.xml', destination: '/sitemap.xml' },
    { source: '/llms.txt', destination: '/llms.txt' },
    { source: '(.*)', destination: '/index.html' },
  ];

  const config = { rewrites };
  fs.writeFileSync(VERCEL_CONFIG_PATH, `${JSON.stringify(config, null, 2)}\n`, 'utf8');
}

function writeLlmsFile() {
  fs.writeFileSync(LLMS_OUTPUT_PATH, buildLlmsContent(), 'utf8');
}

function writeDistStaticFiles() {
  if (!fs.existsSync(DIST_DIR)) return;

  fs.writeFileSync(path.join(DIST_DIR, 'llms.txt'), buildLlmsContent(), 'utf8');
  fs.writeFileSync(path.join(DIST_DIR, 'sitemap.xml'), buildSitemapContent(), 'utf8');
  fs.writeFileSync(path.join(DIST_DIR, 'robots.txt'), buildRobotsContent(), 'utf8');
}

function main() {
  writeVercelConfig();
  writeLlmsFile();
  writeDistStaticFiles();
}

module.exports = {
  parseTools,
  getToolRoutes,
  getAllRoutes,
  buildLlmsContent,
  buildSitemapContent,
  buildRobotsContent,
  writeVercelConfig,
  writeLlmsFile,
  writeDistStaticFiles,
  STATIC_PAGES,
  SITEMAP_HOST,
  LLMS_OUTPUT_PATH,
};

if (require.main === module) {
  main();
}
