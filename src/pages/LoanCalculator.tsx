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

export default function LoanCalculator() {
  useToolTracking('loan-calculator', 'Loan Calculator');
  const [amount, setAmount] = useState('');
  const [rate, setRate] = useState('');
  const [years, setYears] = useState('');
  const [result, setResult] = useState<{ monthly: number; totalInterest: number; totalPaid: number } | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);

  const calculate = () => {
    const principal = Number(amount);
    const annualRate = Number(rate);
    const termYears = Number(years);

    if (!principal || !annualRate || !termYears || principal <= 0 || annualRate <= 0 || termYears <= 0) {
      setValidationError('Enter valid loan amount, rate, and term.');
      return;
    }

    setValidationError(null);
    const monthlyRate = annualRate / 100 / 12;
    const totalMonths = termYears * 12;
    const monthly = monthlyRate === 0
      ? principal / totalMonths
      : (principal * monthlyRate) / (1 - Math.pow(1 + monthlyRate, -totalMonths));

    const totalPaid = monthly * totalMonths;
    const totalInterest = totalPaid - principal;
    const nextResult = {
      monthly: Number(monthly.toFixed(2)),
      totalInterest: Number(totalInterest.toFixed(2)),
      totalPaid: Number(totalPaid.toFixed(2)),
    };

    setResult(nextResult);
    addHistory({
      tool: 'Loan Calculator',
      toolSlug: 'loan-calculator',
      expression: `${principal}, ${annualRate}%, ${termYears}y`,
      result: `${nextResult.monthly.toFixed(2)} / month`,
    });
    
  };

  return (
    <PageTransition className="page-medium">
      <SEO title="Loan Calculator" description="Estimate monthly payments and total cost for a standard loan." path="/loan-calculator" />
      <Link to="/" className="back-link">← Back to tools</Link>
      <div className="tool-header">
        <div className="eyebrow">Financial</div>
        <h1 className="page-title">Loan Calculator</h1>
        <p className="page-lede">Calculate monthly payments, total interest, and total amount paid on a standard amortized loan.</p>
      </div>
      <Card padding="lg">
        <Input label="Loan Amount" type="number" value={amount} onChange={(e) => { setAmount(e.target.value); setValidationError(null); }} min="0" error={validationError ? 'Enter a valid loan amount.' : undefined} />
        <Input label="Annual Interest Rate (%)" type="number" value={rate} onChange={(e) => { setRate(e.target.value); setValidationError(null); }} min="0" step="0.01" error={validationError ? 'Enter a valid rate.' : undefined} />
        <Input label="Loan Term (Years)" type="number" value={years} onChange={(e) => { setYears(e.target.value); setValidationError(null); }} min="1" step="1" error={validationError ? 'Enter a valid term.' : undefined} />
        {validationError && <p className="input-message input-message-error" role="alert">{validationError}</p>}
        <Button onClick={calculate} magnetic style={{ width: '100%' }}>Calculate Loan</Button>
        <ResultDisplay
          visible={!!result}
          highlight={result ? `$${result.monthly.toLocaleString()}` : undefined}
          subtitle="Monthly payment"
          slots={result ? [
            { label: 'Total Interest Paid', value: `$${result.totalInterest.toLocaleString()}` },
            { label: 'Total Amount Paid', value: `$${result.totalPaid.toLocaleString()}` },
          ] : []}
        />
      </Card>
    </PageTransition>
  );
}
