import { useState } from 'react';
import { Link } from 'react-router-dom';
import FAQAccordion, { type FAQItem } from '@/components/ui/FAQAccordion';
import PageTransition from '@/components/ui/PageTransition';
import SEO from '@/components/ui/SEO';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { useToolTracking } from '@/hooks/useScroll';
import { addHistory } from '@/lib/storage';
import '@/styles/components.css';

const randomNumberFAQ: FAQItem[] = [
  {
    "question": "Are these numbers truly random?",
    "answer": "This tool uses JavaScript's Math.random() function, which is a pseudo-random number generator (PRNG). It is highly random and suitable for games, statistics, and decisions, but not for cryptographic purposes."
  },
  {
    "question": "Can I generate negative numbers?",
    "answer": "Yes. You can enter negative values in the Min and Max fields. For example, setting Min = -10 and Max = 10 will generate numbers between -10 and 10."
  },
  {
    "question": "What does 'Allow Duplicates' mean?",
    "answer": "If checked, the generator can output the same number multiple times when generating a list. If unchecked, all generated numbers in the list will be unique."
  },
  {
    "question": "Is the maximum value inclusive?",
    "answer": "Yes. The generated number can be equal to both the minimum and maximum values you enter."
  },
  {
    "question": "How do I roll a standard six-sided die?",
    "answer": "Simply set the Min value to 1 and the Max value to 6. Click generate to get a random roll."
  }
];

export default function RandomNumber() {
  useToolTracking('random-number', 'Random Number');  const [min, setMin] = useState('');
  const [max, setMax] = useState('');
  const [count, setCount] = useState('');
  const [results, setResults] = useState<number[]>([]);
  const [validationError, setValidationError] = useState<string | null>(null);

  const generate = (overrideMin?: string, overrideMax?: string, overrideCount?: string) => {
    const minVal = overrideMin !== undefined ? overrideMin : min;
    const maxVal = overrideMax !== undefined ? overrideMax : max;
    const countVal = overrideCount !== undefined ? overrideCount : count;

    const lo = parseInt(minVal);
    const hi = parseInt(maxVal);
    const n = parseInt(countVal) || 1;
    if (isNaN(lo) || isNaN(hi) || lo > hi) { setValidationError('Enter a valid range.'); return; }

    setValidationError(null);

    const nums: number[] = [];
    for (let i = 0; i < Math.min(n, 100); i++) {
      nums.push(Math.floor(Math.random() * (hi - lo + 1)) + lo);
    }
    setResults(nums);
    addHistory({ tool: 'Random Number', toolSlug: 'random-number', expression: `${lo}–${hi}`, result: nums.join(', ') });
  };

  const fillExample = () => {
    const exMin = '1';
    const exMax = '100';
    const exCount = '1';
    setMin(exMin);
    setMax(exMax);
    setCount(exCount);
    setValidationError(null);
    generate(exMin, exMax, exCount);
  };

  return (
    <PageTransition className="page-medium">
      <SEO title="Free Random Number Generator" description="Generate single or multiple random numbers within any custom range online for free." path="/random-number" faqSchema={randomNumberFAQ} />
      <Link to="/" className="back-link">← Back to tools</Link>
      <div className="tool-header">
        <div className="eyebrow">Utility</div>
        <h1 className="page-title">Random Number</h1>
        <p className="page-lede">Generate random numbers within any range.</p>
      </div>
      <Card padding="lg">
        <div className="grid-2">
          <Input label="Minimum" type="number" value={min} onChange={(e) => { setMin(e.target.value); setValidationError(null); }} placeholder="e.g. 1" error={validationError ? 'Enter a valid minimum.' : undefined} />
          <Input label="Maximum" type="number" value={max} onChange={(e) => { setMax(e.target.value); setValidationError(null); }} placeholder="e.g. 100" error={validationError ? 'Enter a valid maximum.' : undefined} />
        </div>
        <Input label="How many numbers" type="number" value={count} onChange={(e) => setCount(e.target.value)} min="1" max="100" placeholder="e.g. 1" />
        {validationError && <p className="input-message input-message-error" role="alert">{validationError}</p>}
        <Button onClick={() => generate()} magnetic style={{ width: '100%' }}>Generate</Button>
        <button className="btn-demo-fill" onClick={fillExample}>Try Example</button>
        {results.length > 0 && (
          <div className="result-display">
            <div className="result-highlight">{results.join(', ')}</div>
          </div>
        )}
      </Card>
          {/* ── SEO Content Sections ── */}
      <div className="seo-content">

        <section className="seo-section">
          <h2>How the Random Number Generator Works</h2>
          <p>This generator produces random integers within a user-defined minimum and maximum range. It can generate single numbers or a list of multiple numbers, with options to allow or disallow duplicates in the output.</p>
        </section>

        <section className="seo-section">
          <h2>Formula Used</h2>
          <div className="seo-formula" style={{ whiteSpace: 'pre-line' }}>
            {"Random Integer = Math.floor(Math.random() × (Max − Min + 1)) + Min"}
          </div>
          <dl className="seo-formula-vars">
            <dt>Math.random()</dt>
            <dd>— a built-in JavaScript function that returns a pseudo-random decimal between 0 (inclusive) and 1 (exclusive)</dd>
            <dt>Min</dt>
            <dd>— the lower limit of the desired range (inclusive)</dd>
            <dt>Max</dt>
            <dd>— the upper limit of the desired range (inclusive)</dd>
          </dl>
        </section>

        <section className="seo-section">
          <h2>Example Calculation</h2>
          <p>If you set Min = 1 and Max = 100, the formula scales the random decimal: Math.floor(random * 100) + 1. This returns a random integer such as 42.</p>
        </section>

        <section className="seo-section">
          <h2>Frequently Asked Questions</h2>
          <FAQAccordion items={randomNumberFAQ} />
        </section>

      </div>
    </PageTransition>
  );
}
