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

type Mode = 'percent-of' | 'what-percent' | 'change' | 'increase';

const percentageCalculatorFAQ: FAQItem[] = [
  {
    "question": "How do I find what percentage one number is of another?",
    "answer": "Use the 'X is % of' tab. Enter the part as A and the whole as B. For example, if you scored 42 out of 60 on a test, enter A = 42 and B = 60 to get 70%."
  },
  {
    "question": "How do I calculate a percentage increase or decrease?",
    "answer": "Use the '% change' tab. Enter the original value as A and the new value as B. The result will be positive for an increase and negative for a decrease."
  },
  {
    "question": "What's the difference between percentage change and percentage point change?",
    "answer": "Percentage change measures relative change: if a rate rises from 10% to 15%, that is a 50% change. Percentage points simply count the arithmetic difference: 15% - 10% = 5 percentage points."
  },
  {
    "question": "How do I add VAT (or any tax) to a price?",
    "answer": "Use the 'Increase by %' tab. Enter the base price as A and the VAT rate as B. For example, a £200 product with 20% VAT: Result = 200 × 1.20 = £240 including tax."
  },
  {
    "question": "Can the calculator handle decimal percentages like 2.5%?",
    "answer": "Yes — all four modes accept decimal inputs. Simply enter 2.5 in the percentage field."
  }
];

export default function PercentageCalculator() {
  useToolTracking('percentage-calculator', 'Percentage Calculator');  const [mode, setMode] = useState<Mode>('percent-of');
  const [a, setA] = useState('');
  const [b, setB] = useState('');
  const [result, setResult] = useState<string | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);

  const calculate = () => {
    const na = parseFloat(a);
    const nb = parseFloat(b);
    if (isNaN(na) || isNaN(nb)) { setValidationError('Enter valid numbers.'); return; }

    setValidationError(null);

    let r: string;
    switch (mode) {
      case 'percent-of': r = `${na}% of ${nb} = ${(na / 100 * nb).toFixed(2)}`; break;
      case 'what-percent': r = `${na} is ${nb !== 0 ? ((na / nb) * 100).toFixed(2) : '∞'}% of ${nb}`; break;
      case 'change': r = `Change from ${nb} to ${na} = ${nb !== 0 ? (((na - nb) / nb) * 100).toFixed(2) : '∞'}%`; break;
      case 'increase': r = `${nb} + ${na}% = ${(nb * (1 + na / 100)).toFixed(2)}`; break;
    }
    setResult(r);
    addHistory({ tool: 'Percentage Calculator', toolSlug: 'percentage-calculator', expression: `${a}, ${b}`, result: r });
    
  };

  const labels: Record<Mode, [string, string]> = {
    'percent-of': ['Percentage (%)', 'Of number'],
    'what-percent': ['Number', 'Of total'],
    'change': ['New value', 'Original value'],
    'increase': ['Increase (%)', 'Original number'],
  };

  return (
    <PageTransition className="page-medium">
      <SEO title="Percentage Calculator" description="Calculate percentages, increases, decreases and percentage differences." path="/percentage-calculator" faqSchema={percentageCalculatorFAQ} />
      <Link to="/" className="back-link">← Back to tools</Link>
      <div className="tool-header">
        <div className="eyebrow">Math</div>
        <h1 className="page-title">Percentage Calculator</h1>
        <p className="page-lede">Quick percentage calculations for everyday use.</p>
      </div>
      <Card padding="lg">
        <div className="tabs">
          {([['percent-of', '% of'], ['what-percent', 'X is % of'], ['change', '% change'], ['increase', 'increase by %']] as const).map(([id, label]) => (
            <button key={id} className={`tab ${mode === id ? 'active' : ''}`} onClick={() => setMode(id)}>{label}</button>
          ))}
        </div>
        <Input label={labels[mode][0]} type="number" value={a} onChange={(e) => { setA(e.target.value); setValidationError(null); }} error={validationError ? 'Enter a valid number.' : undefined} />
        <Input label={labels[mode][1]} type="number" value={b} onChange={(e) => { setB(e.target.value); setValidationError(null); }} error={validationError ? 'Enter a valid number.' : undefined} />
        {validationError && <p className="input-message input-message-error" role="alert">{validationError}</p>}
        <Button onClick={calculate} magnetic style={{ width: '100%' }}>Calculate</Button>
        <ResultDisplay visible={!!result} highlight={result || undefined} slots={[]} />
      </Card>
            {/* ── SEO Content Sections ── */}
      <div className="seo-content">

        <section className="seo-section">
          <h2>How the Percentage Calculator Works</h2>
          <p>This calculator handles four of the most common percentage problems in a single tool. Use the tabs to switch between modes: calculating what a percentage of a number is, finding what percentage one number is of another, computing percentage change between two values, or increasing a number by a given percentage.</p>
        </section>

        <section className="seo-section">
          <h2>Formula Used</h2>
          <div className="seo-formula" style={{ whiteSpace: 'pre-line' }}>
            {"% of a number: Result = (A ÷ 100) × B\nX is what % of Y: Result = (A ÷ B) × 100\n% change: Result = ((B − A) ÷ A) × 100\nIncrease by %: Result = A × (1 + B ÷ 100)"}
          </div>
          <dl className="seo-formula-vars">
            <dt>A</dt>
            <dd>— the first input value (the percentage, the original value, or the base number depending on mode)</dd>
            <dt>B</dt>
            <dd>— the second input value (the whole, the new value, or the percentage to increase by)</dd>
            <dt>Result</dt>
            <dd>— rounded to two decimal places for readability</dd>
          </dl>
        </section>

        <section className="seo-section">
          <h2>Example Calculation</h2>
          <p>Suppose a jacket originally costs £80 and is on sale at a 25% discount. Using '% of a number' mode with A = 25 and B = 80: Result = (25 ÷ 100) × 80 = £20 discount. Subtracting from the original price: £80 - £20 = £60 final price.</p>
        </section>

        <section className="seo-section">
          <h2>Frequently Asked Questions</h2>
          <FAQAccordion items={percentageCalculatorFAQ} />
        </section>

      </div>
    </PageTransition>
  );
}
