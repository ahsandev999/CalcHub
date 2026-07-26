const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, '..', 'src', 'pages');

const filesToFix = [
  'BMICalculator.tsx',
  'BMRCalculator.tsx',
  'CalorieCalculator.tsx',
  'CompoundInterestCalculator.tsx',
  'DateDifference.tsx',
  'FractionCalculator.tsx',
  'IdealWeightCalculator.tsx',
  'LoanCalculator.tsx',
  'MortgageCalculator.tsx',
  'PercentageCalculator.tsx',
  'RandomNumber.tsx',
  'SalaryCalculator.tsx'
];

for (const file of filesToFix) {
  const filePath = path.join(dir, file);
  if (!fs.existsSync(filePath)) continue;
  let content = fs.readFileSync(filePath, 'utf8');
  content = content.replace(/ disabled=\{[^\}]+\}/g, '');
  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`Fixed ${file}`);
}

const pwPath = path.join(dir, 'PasswordGenerator.tsx');
if (fs.existsSync(pwPath)) {
  let pwContent = fs.readFileSync(pwPath, 'utf8');
  pwContent = pwContent.replace(/disabled=\{noTypeSelected\}/g, '');
  fs.writeFileSync(pwPath, pwContent, 'utf8');
  console.log('Fixed PasswordGenerator.tsx');
}
