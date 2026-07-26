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
      <SEO title="Simple Interest Calculator" description="Calculate simple interest and the final account balance." path="/simple-interest-calculator" />
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
    </PageTransition>
  );
}
