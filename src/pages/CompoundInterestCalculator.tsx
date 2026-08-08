import RelatedTools from '../components/ui/RelatedTools';
import Breadcrumbs from '@/components/ui/Breadcrumbs';
import { getBreadcrumbsForTool } from '@/lib/tools';
import { useState } from 'react';

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

const frequencyMap = {
  yearly: 1,
  monthly: 12,
  daily: 365,
} as const;

const compoundInterestCalculatorFAQ: FAQItem[] = [
  {
    "question": "What is compound interest?",
    "answer": "Compound interest is interest calculated on the initial principal and also on the accumulated interest of previous periods. It is essentially 'interest on interest' and causes investments to grow exponentially."
  },
  {
    "question": "How does compounding frequency affect growth?",
    "answer": "More frequent compounding (e.g., monthly or daily vs. yearly) increases the rate of growth because interest is added to the balance sooner, allowing it to start earning its own interest faster."
  },
  {
    "question": "What is the Rule of 72?",
    "answer": "The Rule of 72 is a quick mental formula to estimate when an investment will double. Divide 72 by the annual interest rate. For example, at a 6% interest rate, your money will double in approximately 12 years (72 ÷ 6)."
  },
  {
    "question": "What is the difference between nominal and effective interest rate?",
    "answer": "The nominal rate is the stated annual interest rate. The effective rate (APY) accounts for compounding within the year, representing the actual annual return."
  },
  {
    "question": "Can compound interest work against me?",
    "answer": "Yes — compound interest applies to debt as well. Credit cards use compound interest, which is why unpaid credit card balances can spiral out of control so quickly."
  }
];

export default function CompoundInterestCalculator() {
  const breadcrumbs = getBreadcrumbsForTool('compound-interest-calculator');
  useToolTracking('compound-interest-calculator', 'Compound Interest Calculator');
  const [principal, setPrincipal] = useState('');
  const [rate, setRate] = useState('');
  const [frequency, setFrequency] = useState<keyof typeof frequencyMap>('monthly');
  const [years, setYears] = useState('');
  const [contribution, setContribution] = useState('');
  const [result, setResult] = useState<{ finalAmount: number; interestEarned: number } | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);

  const calculate = (
    overrideP?: string,
    overrideRate?: string,
    overrideYrs?: string,
    overrideCont?: string
  ) => {
    const p = Number(overrideP !== undefined ? overrideP : principal);
    const annualRate = Number(overrideRate !== undefined ? overrideRate : rate) / 100;
    const periodsPerYear = frequencyMap[frequency];
    const totalYears = Number(overrideYrs !== undefined ? overrideYrs : years);
    const monthlyContribution = Number(overrideCont !== undefined ? overrideCont : (contribution || 0));

    if (!p || !annualRate || !totalYears || p <= 0 || annualRate <= 0 || totalYears <= 0) {
      setValidationError('Enter valid principal, rate, and time period.');
      return;
    }

    setValidationError(null);
    const totalPeriods = periodsPerYear * totalYears;
    const perPeriodRate = annualRate / periodsPerYear;
    const futureValue = p * Math.pow(1 + perPeriodRate, totalPeriods)
      + monthlyContribution * (((Math.pow(1 + perPeriodRate, totalPeriods) - 1) / perPeriodRate) || 0);

    const totalInterest = futureValue - p - monthlyContribution * totalYears * 12;

    const nextResult = {
      finalAmount: Number(futureValue.toFixed(2)),
      interestEarned: Number(totalInterest.toFixed(2)),
    };
    setResult(nextResult);
    addHistory({
      tool: 'Compound Interest Calculator',
      toolSlug: 'compound-interest-calculator',
      expression: `${p}, ${Number(overrideRate !== undefined ? overrideRate : rate).toFixed(2)}%, ${totalYears}y`,
      result: `$${nextResult.finalAmount.toLocaleString()}`,
    });
  };

  const fillExample = () => {
    const exP = '10000';
    const exRate = '8';
    const exYrs = '10';
    const exCont = '200';
    setPrincipal(exP);
    setRate(exRate);
    setYears(exYrs);
    setContribution(exCont);
    setValidationError(null);
    calculate(exP, exRate, exYrs, exCont);
  };

  return (
    <PageTransition className="page-medium">
      <SEO
        title="Free Compound Interest Calculator" description="Project investment growth with compound interest and recurring monthly contributions using this free online calculator." path="/compound-interest-calculator" faqSchema={compoundInterestCalculatorFAQ} 
        breadcrumbSchema={breadcrumbs?.schema}
      />
      <Breadcrumbs items={breadcrumbs?.visual || []} />
      <div className="tool-header">
        <div className="eyebrow">Financial</div>
        <h1 className="page-title">Compound Interest Calculator</h1>
        <p className="page-lede">Project how investments grow over time with compound interest and recurring monthly contributions.</p>
      </div>
      <Card padding="lg">
        <div className="tabs">
          {(['yearly', 'monthly', 'daily'] as const).map((item) => (
            <button key={item} className={`tab ${frequency === item ? 'active' : ''}`} onClick={() => setFrequency(item)}>{item}</button>
          ))}
        </div>
        <Input label="Principal" type="number" value={principal} onChange={(e) => { setPrincipal(e.target.value); setValidationError(null); }} min="0" placeholder="e.g. 10000" error={validationError ? 'Enter a valid principal.' : undefined} />
        <Input label="Annual Interest Rate (%)" type="number" value={rate} onChange={(e) => { setRate(e.target.value); setValidationError(null); }} min="0" step="0.01" placeholder="e.g. 8" error={validationError ? 'Enter a valid rate.' : undefined} />
        <Input label="Time (Years)" type="number" value={years} onChange={(e) => { setYears(e.target.value); setValidationError(null); }} min="1" step="1" placeholder="e.g. 10" error={validationError ? 'Enter a valid time period.' : undefined} />
        <Input label="Monthly Contribution (optional)" type="number" value={contribution} onChange={(e) => setContribution(e.target.value)} min="0" placeholder="e.g. 200" />
        {validationError && <p className="input-message input-message-error" role="alert">{validationError}</p>}
        <Button onClick={() => calculate()} magnetic style={{ width: '100%' }}>Calculate Growth</Button>
        <button className="btn-demo-fill" onClick={fillExample}>Try Example</button>
        <ResultDisplay
          visible={!!result}
          highlight={result ? `$${result.finalAmount.toLocaleString()}` : undefined}
          subtitle="Final amount"
          slots={result ? [
            { label: 'Total Interest Earned', value: `$${result.interestEarned.toLocaleString()}` },
            { label: 'Compounding Period', value: frequency },
          ] : []}
        />
      </Card>

      <RelatedTools currentSlug="compound-interest-calculator" />
          {/* ── SEO Content Sections ── */}
      <div className="seo-content">

        <section className="seo-section">
          <h2>How the Compound Interest Calculator Works</h2>
          <p>This calculator estimates the future value of an investment over time, taking compound interest and regular monthly contributions into account. Compounding means you earn interest on your principal plus the interest you have already accumulated.</p>
        </section>

        <section className="seo-section">
          <h2>Formula Used</h2>
          <div className="seo-formula" style={{ whiteSpace: 'pre-line' }}>
            {"FV = P × (1 + r)ⁿ + C × [((1 + r)ⁿ − 1) ÷ r]"}
          </div>
          <dl className="seo-formula-vars">
            <dt>FV</dt>
            <dd>— Future Value of the investment</dd>
            <dt>P</dt>
            <dd>— Principal (initial investment amount)</dd>
            <dt>r</dt>
            <dd>— interest rate per compounding period (annual rate ÷ periods per year)</dd>
            <dt>n</dt>
            <dd>— total number of compounding periods (years × periods per year)</dd>
            <dt>C</dt>
            <dd>— regular contribution amount made at each compounding interval</dd>
          </dl>
        </section>

        <section className="seo-section">
          <h2>Example Calculation</h2>
          <p>If you invest $10,000 at 5% annual interest compounded monthly (r = 0.05 / 12 = 0.004167) for 10 years (n = 120) with a $100 monthly contribution: Future value = $31,998.32. Total contributions were $22,000, and interest earned was $9,998.32.</p>
        </section>

        <section className="seo-section">
          <h2>Frequently Asked Questions</h2>
          <FAQAccordion items={compoundInterestCalculatorFAQ} />
        </section>

      </div>
    </PageTransition>
  );
}
