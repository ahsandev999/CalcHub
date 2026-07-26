const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Compile tools.ts to js temporarily to extract TOOLS
execSync('npx tsc src/lib/tools.ts --esModuleInterop --skipLibCheck --module commonjs --outDir ./temp', { stdio: 'inherit' });
const { TOOLS } = require('../temp/tools.js');

const appTsx = fs.readFileSync(path.join(__dirname, '../src/App.tsx'), 'utf8');
const sitemap = fs.existsSync(path.join(__dirname, '../public/sitemap.xml')) ? fs.readFileSync(path.join(__dirname, '../public/sitemap.xml'), 'utf8') : '';
const llmsTxt = fs.existsSync(path.join(__dirname, '../public/llms.txt')) ? fs.readFileSync(path.join(__dirname, '../public/llms.txt'), 'utf8') : '';

// Map to store results
const results = [];

TOOLS.forEach(tool => {
  const slug = tool.slug;
  const name = tool.name;
  
  // Has route
  const hasRoute = appTsx.includes(`path="/${slug}"`);
  
  // Find component file by looking at App.tsx lazy imports
  let compFile = '';
  const lines = appTsx.split('\n');
  lines.forEach(line => {
    if (line.includes(`lazy(() => import('./pages/`)) {
      const match = line.match(/const\s+(\w+)\s+=\s+lazy\(\(\)\s*=>\s*import\('\.\/pages\/(.+?)'\)/);
      if (match) {
        // Find which component this route maps to
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
        
        if (titleMatch && titleMatch[1].trim() !== '') hasUniqueTitle = true;
        if (descMatch && descMatch[1].trim() !== '') hasMetaDesc = true;
      }
    }
  }

  const inSitemap = sitemap.includes(`/${slug}</loc>`);
  const inLlms = llmsTxt.includes(`/${slug}]`);
  
  results.push({
    name,
    slug,
    hasRoute,
    hasUniqueTitle,
    hasMetaDesc,
    inSitemap,
    inLlms
  });
});

console.log(JSON.stringify(results, null, 2));
