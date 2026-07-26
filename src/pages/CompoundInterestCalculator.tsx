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

const frequencyMap = {
  yearly: 1,
  monthly: 12,
  daily: 365,
} as const;

export default function CompoundInterestCalculator() {
  useToolTracking('compound-interest-calculator', 'Compound Interest Calculator');
  const [principal, setPrincipal] = useState('');
  const [rate, setRate] = useState('');
  const [frequency, setFrequency] = useState<keyof typeof frequencyMap>('monthly');
  const [years, setYears] = useState('');
  const [contribution, setContribution] = useState('');
  const [result, setResult] = useState<{ finalAmount: number; interestEarned: number } | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);

  const calculate = () => {
    const p = Number(principal);
    const annualRate = Number(rate) / 100;
    const periodsPerYear = frequencyMap[frequency];
    const totalYears = Number(years);
    const monthlyContribution = Number(contribution || 0);

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
      expression: `${p}, ${Number(rate).toFixed(2)}%, ${years}y`,
      result: `$${nextResult.finalAmount.toLocaleString()}`,
    });
    
  };

  return (
    <PageTransition className="page-medium">
      <SEO title="Compound Interest Calculator" description="Estimate compounding growth with optional monthly contributions." path="/compound-interest-calculator" />
      <Link to="/" className="back-link">← Back to tools</Link>
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
        <Input label="Principal" type="number" value={principal} onChange={(e) => { setPrincipal(e.target.value); setValidationError(null); }} min="0" error={validationError ? 'Enter a valid principal.' : undefined} />
        <Input label="Annual Interest Rate (%)" type="number" value={rate} onChange={(e) => { setRate(e.target.value); setValidationError(null); }} min="0" step="0.01" error={validationError ? 'Enter a valid rate.' : undefined} />
        <Input label="Time (Years)" type="number" value={years} onChange={(e) => { setYears(e.target.value); setValidationError(null); }} min="1" step="1" error={validationError ? 'Enter a valid time period.' : undefined} />
        <Input label="Monthly Contribution (optional)" type="number" value={contribution} onChange={(e) => setContribution(e.target.value)} min="0" />
        {validationError && <p className="input-message input-message-error" role="alert">{validationError}</p>}
        <Button onClick={calculate} magnetic style={{ width: '100%' }}>Calculate Growth</Button>
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
    </PageTransition>
  );
}
