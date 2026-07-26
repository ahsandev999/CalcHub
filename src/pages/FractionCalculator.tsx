import { useState } from 'react';
import { Link } from 'react-router-dom';
import PageTransition from '@/components/ui/PageTransition';
import SEO from '@/components/ui/SEO';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import ResultDisplay from '@/components/ui/ResultDisplay';

import { useToolTracking } from '@/hooks/useScroll';
import { addHistory } from '@/lib/storage';
import '@/styles/components.css';

interface Fraction { numerator: number; denominator: number; }

function gcd(a: number, b: number): number {
  a = Math.abs(a);
  b = Math.abs(b);
  while (b) {
    const t = a % b;
    a = b;
    b = t;
  }
  return a;
}

function normalizeFraction({ numerator, denominator }: Fraction): Fraction {
  if (denominator === 0) return { numerator: 0, denominator: 1 };
  if (denominator < 0) {
    numerator *= -1;
    denominator *= -1;
  }
  const divisor = gcd(numerator, denominator);
  return { numerator: numerator / divisor, denominator: denominator / divisor };
}

export default function FractionCalculator() {
  useToolTracking('fraction-calculator', 'Fraction Calculator');
  const [aNum, setANum] = useState('');
  const [aDen, setADen] = useState('');
  const [bNum, setBNum] = useState('');
  const [bDen, setBDen] = useState('');
  const [operation, setOperation] = useState<'add' | 'subtract' | 'multiply' | 'divide'>('add');
  const [result, setResult] = useState<{ fraction: string; decimal: string } | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);

  const calculate = () => {
    const n1 = Number(aNum);
    const d1 = Number(aDen);
    const n2 = Number(bNum);
    const d2 = Number(bDen);

    if (!n1 || !d1 || !n2 || !d2 || d1 === 0 || d2 === 0) {
      setValidationError('Enter valid fractions with non-zero denominators.');
      return;
    }

    setValidationError(null);
    let output: Fraction = { numerator: 0, denominator: 1 };
    if (operation === 'add') output = normalizeFraction({ numerator: n1 * d2 + n2 * d1, denominator: d1 * d2 });
    if (operation === 'subtract') output = normalizeFraction({ numerator: n1 * d2 - n2 * d1, denominator: d1 * d2 });
    if (operation === 'multiply') output = normalizeFraction({ numerator: n1 * n2, denominator: d1 * d2 });
    if (operation === 'divide') output = normalizeFraction({ numerator: n1 * d2, denominator: d1 * n2 });

    const fraction = `${output.numerator}/${output.denominator}`;
    const decimal = (output.numerator / output.denominator).toFixed(4);
    const nextResult = { fraction, decimal };
    setResult(nextResult);
    addHistory({
      tool: 'Fraction Calculator',
      toolSlug: 'fraction-calculator',
      expression: `${aNum}/${aDen} ${operation} ${bNum}/${bDen}`,
      result: fraction,
    });
    
  };

  return (
    <PageTransition className="page-medium">
      <SEO title="Fraction Calculator" description="Add, subtract, multiply, or divide two fractions and simplify the result." path="/fraction-calculator" />
      <Link to="/" className="back-link">← Back to tools</Link>
      <div className="tool-header">
        <div className="eyebrow">Math</div>
        <h1 className="page-title">Fraction Calculator</h1>
        <p className="page-lede">Perform fraction operations and view the simplified result in both fraction and decimal form.</p>
      </div>
      <Card padding="lg">
        <div className="tabs">
          {(['add', 'subtract', 'multiply', 'divide'] as const).map((item) => (
            <button key={item} className={`tab ${operation === item ? 'active' : ''}`} onClick={() => setOperation(item)}>{item}</button>
          ))}
        </div>
        <Input label="Fraction 1 Numerator" type="number" value={aNum} onChange={(e) => { setANum(e.target.value); setValidationError(null); }} error={validationError ? 'Enter a valid numerator.' : undefined} />
        <Input label="Fraction 1 Denominator" type="number" value={aDen} onChange={(e) => { setADen(e.target.value); setValidationError(null); }} error={validationError ? 'Enter a valid denominator.' : undefined} />
        <Input label="Fraction 2 Numerator" type="number" value={bNum} onChange={(e) => { setBNum(e.target.value); setValidationError(null); }} error={validationError ? 'Enter a valid numerator.' : undefined} />
        <Input label="Fraction 2 Denominator" type="number" value={bDen} onChange={(e) => { setBDen(e.target.value); setValidationError(null); }} error={validationError ? 'Enter a valid denominator.' : undefined} />
        {validationError && <p className="input-message input-message-error" role="alert">{validationError}</p>}
        <Button onClick={calculate} magnetic style={{ width: '100%' }}>Calculate Fraction</Button>
        <ResultDisplay
          visible={!!result}
          highlight={result ? result.fraction : undefined}
          subtitle="Simplified result"
          slots={result ? [
            { label: 'Fraction', value: result.fraction },
            { label: 'Decimal', value: result.decimal },
          ] : []}
        />
      </Card>
    </PageTransition>
  );
}
