const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, '..', 'src', 'pages');
const files = fs.readdirSync(dir).filter(f => f.endsWith('.tsx'));

for (const file of files) {
  const filePath = path.join(dir, file);
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Remove import
  content = content.replace(/import\s+\{\s*useToast\s*\}\s+from\s+'@\/context\/ToastContext';\n?/g, '');
  
  // Remove hook usage
  content = content.replace(/\s*const\s+\{\s*showToast\s*\}\s*=\s*useToast\(\);\n?/g, '');
  
  // Remove showToast calls completely
  // Handle multiline or single line showToast calls. 
  // It's safer to just replace showToast(...) with empty string, but we need to handle trailing semicolons
  content = content.replace(/showToast\([^)]+\);?/g, '');
  
  // Remove any remaining showToast references in dependency arrays
  content = content.replace(/,\s*showToast/g, '');
  content = content.replace(/showToast,\s*/g, '');
  
  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`Cleaned toasts from ${file}`);
}
