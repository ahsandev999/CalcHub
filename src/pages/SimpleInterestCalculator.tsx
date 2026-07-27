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

const simpleInterestCalculatorFAQ: FAQItem[] = [
  {
    "question": "What is simple interest?",
    "answer": "Simple interest is interest calculated strictly on the original principal amount of a loan or investment. Unlike compound interest, you do not earn interest on previously accumulated interest."
  },
  {
    "question": "When is simple interest used?",
    "answer": "Simple interest is commonly used for short-term loans, auto loans, personal loans, and simple savings certificates where compounding is not specified."
  },
  {
    "question": "How does simple interest differ from compound interest?",
    "answer": "Simple interest grows linearly (the interest amount stays the same every year), while compound interest grows exponentially because interest is added back to the principal, earning more interest."
  },
  {
    "question": "How do I calculate simple interest if time is in months?",
    "answer": "Divide the number of months by 12 to convert the term to years. For example, a 6-month term is 0.5 years (6 ÷ 12) in the formula."
  },
  {
    "question": "Is simple interest better for a borrower or a lender?",
    "answer": "Simple interest is generally better for a borrower because the total interest paid is lower than it would be with compound interest. Lenders typically prefer compound interest to maximise returns."
  }
];

export default function SimpleInterestCalculator() {
  useToolTracking('simple-interest-calculator', 'Simple Interest Calculator');
  const [principal, setPrincipal] = useState('');
  const [rate, setRate] = useState('');
  const [time, setTime] = useState('');
  const [result, setResult] = useState<{ interest: number; totalAmount: number } | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);

  const calculate = () => {
    const p = Number(principal);
    const r = Number(rate);
    const t = Number(time);

    if (!p || !r || !t || p <= 0 || r < 0 || t <= 0) {
      setValidationError('Enter valid principal, rate, and time.');
      return;
    }

    setValidationError(null);
    const interest = p * (r / 100) * t;
    const totalAmount = p + interest;
    const nextResult = {
      interest: Number(interest.toFixed(2)),
      totalAmount: Number(totalAmount.toFixed(2)),
    };

    setResult(nextResult);
    addHistory({
      tool: 'Simple Interest Calculator',
      toolSlug: 'simple-interest-calculator',
      expression: `${p}, ${r}%, ${t}y`,
      result: `$${nextResult.totalAmount.toLocaleString()}`,
    });
  };

  return (
    <PageTransition className="page-medium">
      <SEO title="Free Simple Interest Calculator" description="Calculate simple interest earned and final balance over time with this free online financial calculator." path="/simple-interest-calculator" faqSchema={simpleInterestCalculatorFAQ} />
      <Link to="/" className="back-link">← Back to tools</Link>
      <div className="tool-header">
        <div className="eyebrow">Financial</div>
        <h1 className="page-title">Simple Interest Calculator</h1>
        <p className="page-lede">Compute interest earned and total repayment or balance using the simple interest formula.</p>
      </div>
      <Card padding="lg">
        <Input label="Principal" type="number" value={principal} onChange={(e) => { setPrincipal(e.target.value); setValidationError(null); }} min="0" />
        <Input label="Rate (%)" type="number" value={rate} onChange={(e) => { setRate(e.target.value); setValidationError(null); }} min="0" step="0.01" />
        <Input label="Time (Years)" type="number" value={time} onChange={(e) => { setTime(e.target.value); setValidationError(null); }} min="0" step="0.1" />
        {validationError && <p className="input-message input-message-error" role="alert">{validationError}</p>}
        <Button onClick={calculate} magnetic style={{ width: '100%' }}>Calculate</Button>
        <ResultDisplay
          visible={!!result}
          highlight={result ? `$${result.totalAmount.toLocaleString()}` : undefined}
          subtitle="Total amount"
          slots={result ? [
            { label: 'Interest Earned', value: `$${result.interest.toLocaleString()}` },
            { label: 'Final Amount', value: `$${result.totalAmount.toLocaleString()}` },
          ] : []}
        />
      </Card>
          {/* ── SEO Content Sections ── */}
      <div className="seo-content">

        <section className="seo-section">
          <h2>How the Simple Interest Calculator Works</h2>
          <p>This simple interest calculator computes the interest earned or paid on a loan or deposit where interest is calculated solely on the original principal amount. There is no compounding in this calculation.</p>
        </section>

        <section className="seo-section">
          <h2>Formula Used</h2>
          <div className="seo-formula" style={{ whiteSpace: 'pre-line' }}>
            {"I = P × r × t"}
          </div>
          <dl className="seo-formula-vars">
            <dt>I</dt>
            <dd>— Interest amount earned or paid</dd>
            <dt>P</dt>
            <dd>— Principal (original amount borrowed or invested)</dd>
            <dt>r</dt>
            <dd>— annual interest rate (expressed as a decimal, e.g. 4% = 0.04)</dd>
            <dt>t</dt>
            <dd>— time period the money is borrowed or invested, in years</dd>
          </dl>
        </section>

        <section className="seo-section">
          <h2>Example Calculation</h2>
          <p>If you invest $5,000 at an annual simple interest rate of 4% for 3 years: Interest I = 5,000 × 0.04 × 3 = $600. The total value at the end of 3 years is $5,000 + $600 = $5,600.</p>
        </section>

        <section className="seo-section">
          <h2>Frequently Asked Questions</h2>
          <FAQAccordion items={simpleInterestCalculatorFAQ} />
        </section>

      </div>
    </PageTransition>
  );
}
