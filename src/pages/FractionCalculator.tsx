import { useState } from 'react';
import { Link } from 'react-router-dom';
import FAQAccordion, { type FAQItem } from '@/components/ui/FAQAccordion';
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

const fractionCalculatorFAQ: FAQItem[] = [
  {
    "question": "What is a proper fraction?",
    "answer": "A proper fraction is a fraction where the numerator (top number) is smaller than the denominator (bottom number), representing a value less than 1 (e.g. 3/4)."
  },
  {
    "question": "What is a mixed number?",
    "answer": "A mixed number is a whole number combined with a proper fraction (e.g. 1 1/2). It represents values greater than 1."
  },
  {
    "question": "How do I divide fractions?",
    "answer": "To divide two fractions, multiply the first fraction by the reciprocal (the inverted form) of the second fraction. For example, 1/2 ÷ 3/4 = 1/2 × 4/3 = 4/6 = 2/3."
  },
  {
    "question": "What is the lowest common denominator?",
    "answer": "The LCD is the lowest common multiple of the denominators of a set of fractions. Finding the LCD is required before you can add or subtract fractions."
  },
  {
    "question": "How does the calculator simplify fractions?",
    "answer": "The calculator finds the Greatest Common Divisor (GCD) of the numerator and denominator and divides both numbers by it to reduce the fraction to its simplest form."
  }
];

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
      <SEO title="Free Fraction Calculator" description="Add, subtract, multiply, or divide fractions and simplify results with this free online tool." path="/fraction-calculator" faqSchema={fractionCalculatorFAQ} />
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
          {/* ── SEO Content Sections ── */}
      <div className="seo-content">

        <section className="seo-section">
          <h2>How the Fraction Calculator Works</h2>
          <p>This fraction calculator performs addition, subtraction, multiplication, and division on common fractions. It supports proper fractions, improper fractions, and mixed numbers, displaying the simplified result as both a fraction and a decimal.</p>
        </section>

        <section className="seo-section">
          <h2>Formula Used</h2>
          <div className="seo-formula" style={{ whiteSpace: 'pre-line' }}>
            {"a/b ± c/d = (ad ± bc) ÷ bd\na/b × c/d = ac ÷ bd\na/b ÷ c/d = ad ÷ bc"}
          </div>
          <dl className="seo-formula-vars">
            <dt>a / c</dt>
            <dd>— the numerators of the fractions being operated on</dd>
            <dt>b / d</dt>
            <dd>— the denominators of the fractions being operated on (must be non-zero)</dd>
            <dt>Result</dt>
            <dd>— reduced to the lowest common denominator (LCD)</dd>
          </dl>
        </section>

        <section className="seo-section">
          <h2>Example Calculation</h2>
          <p>To add 1/2 and 3/4, find the LCD (4). 1/2 becomes 2/4. Sum = 2/4 + 3/4 = 5/4. The calculator simplifies this to the mixed number 1 1/4 and the decimal 1.25.</p>
        </section>

        <section className="seo-section">
          <h2>Frequently Asked Questions</h2>
          <FAQAccordion items={fractionCalculatorFAQ} />
        </section>

      </div>
    </PageTransition>
  );
}
