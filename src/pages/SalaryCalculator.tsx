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

export default function SalaryCalculator() {
  useToolTracking('salary-calculator', 'Salary Calculator');
  const [mode, setMode] = useState<'hourly' | 'annual'>('hourly');
  const [amount, setAmount] = useState('');
  const [hours, setHours] = useState('40');
  const [result, setResult] = useState<{ hourly: number; weekly: number; monthly: number; annual: number } | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);

  const calculate = () => {
    const value = Number(amount);
    const weeklyHours = Number(hours);

    if (!value || !weeklyHours || value <= 0 || weeklyHours <= 0) {
      setValidationError('Enter valid wage and hours worked.');
      return;
    }

    setValidationError(null);
    const annual = mode === 'hourly' ? value * weeklyHours * 52 : value;
    const hourly = annual / (weeklyHours * 52);
    const weekly = hourly * weeklyHours;
    const monthly = annual / 12;

    const nextResult = {
      hourly: Number(hourly.toFixed(2)),
      weekly: Number(weekly.toFixed(2)),
      monthly: Number(monthly.toFixed(2)),
      annual: Number(annual.toFixed(2)),
    };

    setResult(nextResult);
    addHistory({
      tool: 'Salary Calculator',
      toolSlug: 'salary-calculator',
      expression: `${mode}: ${value}`,
      result: `$${nextResult.annual.toLocaleString()}`,
    });
    
  };

  return (
    <PageTransition className="page-medium">
      <SEO title="Salary Calculator" description="Convert hourly wages and annual salary into weekly, monthly, and annual earnings." path="/salary-calculator" />
      <Link to="/" className="back-link">← Back to tools</Link>
      <div className="tool-header">
        <div className="eyebrow">Financial</div>
        <h1 className="page-title">Salary Calculator</h1>
        <p className="page-lede">Convert hourly compensation or annual pay into recurring pay periods.</p>
      </div>
      <Card padding="lg">
        <div className="tabs">
          <button className={`tab ${mode === 'hourly' ? 'active' : ''}`} onClick={() => setMode('hourly')}>Hourly Wage</button>
          <button className={`tab ${mode === 'annual' ? 'active' : ''}`} onClick={() => setMode('annual')}>Annual Salary</button>
        </div>
        <Input label={mode === 'hourly' ? 'Hourly Wage ($)' : 'Annual Salary ($)'} type="number" value={amount} onChange={(e) => { setAmount(e.target.value); setValidationError(null); }} min="0" error={validationError ? 'Enter a valid amount.' : undefined} />
        <Input label="Hours per Week" type="number" value={hours} onChange={(e) => { setHours(e.target.value); setValidationError(null); }} min="1" step="1" error={validationError ? 'Enter a valid weekly hour count.' : undefined} />
        {validationError && <p className="input-message input-message-error" role="alert">{validationError}</p>}
        <Button onClick={calculate} magnetic style={{ width: '100%' }}>Convert Salary</Button>
        <ResultDisplay
          visible={!!result}
          highlight={result ? `$${result.annual.toLocaleString()}` : undefined}
          subtitle="Annual income"
          slots={result ? [
            { label: 'Hourly', value: `$${result.hourly.toLocaleString()}` },
            { label: 'Weekly', value: `$${result.weekly.toLocaleString()}` },
            { label: 'Monthly', value: `$${result.monthly.toLocaleString()}` },
            { label: 'Annual', value: `$${result.annual.toLocaleString()}` },
          ] : []}
        />
      </Card>
    </PageTransition>
  );
}
