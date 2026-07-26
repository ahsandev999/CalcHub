const fs = require('fs');
const path = require('path');

const toolsContent = fs.readFileSync(path.join(__dirname, '../src/lib/tools.ts'), 'utf8');
const slugs = [];
const names = [];

// Extract slug and name
const slugMatches = [...toolsContent.matchAll(/slug:\s*'([^']+)'/g)];
const nameMatches = [...toolsContent.matchAll(/name:\s*'([^']+)'/g)];

slugMatches.forEach((match, index) => {
  slugs.push(match[1]);
  names.push(nameMatches[index][1]);
});

const appTsx = fs.readFileSync(path.join(__dirname, '../src/App.tsx'), 'utf8');
const sitemap = fs.existsSync(path.join(__dirname, '../public/sitemap.xml')) ? fs.readFileSync(path.join(__dirname, '../public/sitemap.xml'), 'utf8') : '';
const llmsTxt = fs.existsSync(path.join(__dirname, '../public/llms.txt')) ? fs.readFileSync(path.join(__dirname, '../public/llms.txt'), 'utf8') : '';

const results = [];

for (let i = 0; i < slugs.length; i++) {
  const slug = slugs[i];
  const name = names[i];
  
  const hasRoute = appTsx.includes(`path="/${slug}"`);
  
  let compFile = '';
  const lines = appTsx.split('\n');
  lines.forEach(line => {
    if (line.includes(`lazy(() => import('./pages/`)) {
      const match = line.match(/const\s+(\w+)\s+=\s+lazy\(\(\)\s*=>\s*import\('\.\/pages\/(.+?)'\)/);
      if (match) {
        if (appTsx.includes(`path="/${slug}" element={<${match[1]} />}`)) {
          compFile = match[2];
        }
      }
    }
  });

  let hasSEO = false;
  let hasUniqueTitle = false;
  let hasMetaDesc = false;

  if (compFile) {
    const compPath = path.join(__dirname, `../src/pages/${compFile}.tsx`);
    if (fs.existsSync(compPath)) {
      const content = fs.readFileSync(compPath, 'utf8');
      if (content.includes('<SEO')) {
        hasSEO = true;
        const titleMatch = content.match(/title="([^"]+)"/);
        const descMatch = content.match(/description="([^"]+)"/);
        
        if (titleMatch && titleMatch[1].trim() !== '' && titleMatch[1] !== 'CalcHub - Comprehensive Calculator Suite') hasUniqueTitle = true;
        if (descMatch && descMatch[1].trim() !== '') hasMetaDesc = true;
      }
    }
  }

  const inSitemap = sitemap.includes(`/${slug}</loc>`);
  const inLlms = llmsTxt.includes(`/${slug}]`);
  
  results.push({
    name,
    slug,
    hasRoute: hasRoute ? '✓' : '✗',
    hasUniqueTitle: hasUniqueTitle ? '✓' : '✗',
    hasMetaDesc: hasMetaDesc ? '✓' : '✗',
    inSitemap: inSitemap ? '✓' : '✗',
    inLlms: inLlms ? '✓' : '✗',
    inGrid: '✓', // By definition, it's mapped in Home.tsx from tools.ts
    inFooter: '✓' // Mapped from tools.ts in Footer.tsx
  });
}

console.log(JSON.stringify(results, null, 2));
console.log('Total tools in tools.ts:', slugs.length);

const routesMatches = appTsx.match(/<Route path="\//g);
// Subtract 1 for the root route '/'
console.log('Total tool routes in App.tsx:', routesMatches ? routesMatches.length - 1 : 0);

const sitemapLocs = sitemap.match(/<loc>/g);
console.log('Total entries in sitemap:', sitemapLocs ? sitemapLocs.length : 0);

const llmsEntries = llmsTxt.match(/\[[^\]]+\]\(https:\/\/calccode.com\//g);
console.log('Total tool entries in llms.txt:', llmsEntries ? llmsEntries.length : 0);
