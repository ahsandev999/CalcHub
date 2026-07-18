export type AngleMode = 'deg' | 'rad';

export interface CalcState {
  expr: string;
  memory: number;
  history: string[];
  isDeg: boolean;
}

export function formatDisplay(expr: string): string {
  return expr === '' ? '0' : expr.replace(/\*/g, '×').replace(/\//g, '÷');
}

export function formatResult(n: number): string {
  if (!isFinite(n)) return 'Error';
  if (Math.abs(n) >= 1e12 || (Math.abs(n) < 1e-6 && n !== 0)) {
    return n.toExponential(6).replace(/\.?0+e/, 'e');
  }
  const rounded = Math.round(n * 1e10) / 1e10;
  return String(rounded);
}

export function insertImplicitMultiplication(expr: string): string {
  let e = expr;

  // 1. Temporarily extract scientific notation numbers (e.g. 2e-3) so we don't inject * in them
  const placeholders: string[] = [];
  e = e.replace(/(\d+(?:\.\d+)?e[+-]?\d+)/gi, (match) => {
    placeholders.push(match);
    return `__SCI_${placeholders.length - 1}__`;
  });

  // 2. Insert '*' for implicit multiplication
  // Digit/constant/right-paren followed by left-paren
  e = e.replace(/([\dπe)])\(/g, '$1*(');
  // Right-paren followed by digit/constant
  e = e.replace(/\)([\dπe])/g, ')*$1');
  // Digit/right-paren followed by constant (π, e)
  e = e.replace(/([\d)])([πe])/g, '$1*$2');
  // Constant (π, e) followed by digit
  e = e.replace(/([πe])([\d])/g, '$1*$2');
  // Constant (π, e) followed by constant (π, e)
  e = e.replace(/([πe])([πe])/g, '$1*$2');
  // Digit/constant/right-paren followed by functions
  e = e.replace(/([\dπe)])(sin|cos|tan|log|ln|√)/g, '$1*$2');

  // 3. Restore scientific notation placeholders
  placeholders.forEach((val, idx) => {
    e = e.replace(new RegExp(`__SCI_${idx}__`, 'g'), val);
  });

  return e;
}

export function evaluate(expr: string, isDeg: boolean): number {
  let e = expr;

  // Auto-close open parentheses
  const openCount = (e.match(/\(/g) || []).length;
  const closeCount = (e.match(/\)/g) || []).length;
  if (openCount > closeCount) e += ')'.repeat(openCount - closeCount);

  // Apply implicit multiplication rules
  e = insertImplicitMultiplication(e);

  e = e.replace(/π/g, 'Math.PI');

  // Replace constant 'e' with 'Math.E' while ignoring scientific notation
  const placeholders: string[] = [];
  e = e.replace(/(\d+(?:\.\d+)?e[+-]?\d+)/gi, (match) => {
    placeholders.push(match);
    return `__SCI_${placeholders.length - 1}__`;
  });

  e = e.replace(/\be\b/g, 'Math.E');

  placeholders.forEach((val, idx) => {
    e = e.replace(new RegExp(`__SCI_${idx}__`, 'g'), val);
  });

  e = e.replace(/\^/g, '**');
  e = e.replace(/√\(/g, 'sqrt(');
  e = e.replace(/sin\(/g, 'sinF(');
  e = e.replace(/cos\(/g, 'cosF(');
  e = e.replace(/tan\(/g, 'tanF(');
  e = e.replace(/log\(/g, 'log10(');
  e = e.replace(/ln\(/g, 'Math.log(');

  e = processPercentages(e);

  // Validate expression safety (allowing letters, numbers, operators, brackets, and underscores for placeholders)
  if (!/^[0-9+\-*/.()%\sA-Za-z_]+$/.test(e)) throw new Error('invalid');

  const toRad = (x: number) => (x * Math.PI) / 180;
  const sinF = (x: number) => (isDeg ? Math.sin(toRad(x)) : Math.sin(x));
  const cosF = (x: number) => (isDeg ? Math.cos(toRad(x)) : Math.cos(x));
  const tanF = (x: number) => (isDeg ? Math.tan(toRad(x)) : Math.tan(x));
  const log10 = (x: number) => Math.log10(x);
  const sqrt = (x: number) => Math.sqrt(x);

  const result = Function(
    'sinF', 'cosF', 'tanF', 'log10', 'sqrt', 'Math',
    '"use strict"; return (' + e + ')'
  )(sinF, cosF, tanF, log10, sqrt, Math) as number;

  if (typeof result !== 'number' || !isFinite(result)) throw new Error('math error');
  return result;
}

function processPercentages(expr: string): string {
  return expr.replace(/(\d+\.?\d*)%/g, '($1/100)');
}

export function pressKey(expr: string, ch: string, justEvaluated: boolean): { expr: string; justEvaluated: boolean } {
  let newExpr = expr;
  let newJustEvaluated = justEvaluated;

  if (justEvaluated) {
    if (/[0-9.]/.test(ch) || ['sin(', 'cos(', 'tan(', 'log(', 'ln(', '√(', '(', 'π', 'e'].includes(ch)) {
      newExpr = '';
    }
    newJustEvaluated = false;
  }

  const opChars = ['+', '-', '*', '/', '%', '^'];
  const lastChar = newExpr.slice(-1);
  if (opChars.includes(ch) && opChars.includes(lastChar)) {
    newExpr = newExpr.slice(0, -1) + ch;
  } else {
    newExpr += ch;
  }

  return { expr: newExpr, justEvaluated: newJustEvaluated };
}
