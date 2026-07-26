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

export default function MortgageCalculator() {
  useToolTracking('mortgage-calculator', 'Mortgage Calculator');
  const [price, setPrice] = useState('');
  const [downPayment, setDownPayment] = useState('');
  const [rate, setRate] = useState('');
  const [years, setYears] = useState('');
  const [tax, setTax] = useState('');
  const [insurance, setInsurance] = useState('');
  const [result, setResult] = useState<{ mortgage: number; monthlyTax: number; monthlyInsurance: number; totalInterest: number; totalCost: number } | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);

  const calculate = () => {
    const homePrice = Number(price);
    const dp = Number(downPayment);
    const annualRate = Number(rate);
    const termYears = Number(years);
    const annualTax = Number(tax || 0);
    const annualInsurance = Number(insurance || 0);

    if (!homePrice || !annualRate || !termYears || homePrice <= 0 || annualRate <= 0 || termYears <= 0) {
      setValidationError('Enter valid home price, interest rate, and term.');
      return;
    }

    setValidationError(null);
    const principal = Math.max(homePrice - dp, 0);
    if (principal <= 0) {
      setValidationError('Down payment must be less than the home price.');
      return;
    }

    const monthlyRate = annualRate / 100 / 12;
    const totalMonths = termYears * 12;
    const monthlyMortgage = monthlyRate === 0
      ? principal / totalMonths
      : (principal * monthlyRate) / (1 - Math.pow(1 + monthlyRate, -totalMonths));
	const monthlyTax = annualTax / 12;
	const monthlyInsurance = annualInsurance / 12;
    const monthlyPayment = monthlyMortgage + monthlyTax + monthlyInsurance;
    const totalPaid = monthlyPayment * totalMonths;
    const totalInterest = totalPaid - principal;

    const nextResult = {
      mortgage: Number(monthlyMortgage.toFixed(2)),
      monthlyTax: Number(monthlyTax.toFixed(2)),
      monthlyInsurance: Number(monthlyInsurance.toFixed(2)),
      totalInterest: Number(totalInterest.toFixed(2)),
      totalCost: Number(totalPaid.toFixed(2)),
    };

    setResult(nextResult);
    addHistory({
      tool: 'Mortgage Calculator',
      toolSlug: 'mortgage-calculator',
      expression: `${homePrice}, ${annualRate}%, ${termYears}y`,
      result: `$${nextResult.monthlyInsurance.toFixed(2)} / month`,
    });
    
  };

  return (
    <PageTransition className="page-medium">
      <SEO title="Mortgage Calculator" description="Estimate mortgage payments with taxes and insurance." path="/mortgage-calculator" />
      <Link to="/" className="back-link">← Back to tools</Link>
      <div className="tool-header">
        <div className="eyebrow">Financial</div>
        <h1 className="page-title">Mortgage Calculator</h1>
        <p className="page-lede">Estimate your monthly payment, loan interest, and the effect of taxes and insurance.</p>
      </div>
      <Card padding="lg">
        <Input label="Home Price" type="number" value={price} onChange={(e) => { setPrice(e.target.value); setValidationError(null); }} min="0" error={validationError ? 'Enter a valid home price.' : undefined} />
        <Input label="Down Payment" type="number" value={downPayment} onChange={(e) => { setDownPayment(e.target.value); setValidationError(null); }} min="0" />
        <Input label="Annual Interest Rate (%)" type="number" value={rate} onChange={(e) => { setRate(e.target.value); setValidationError(null); }} min="0" step="0.01" error={validationError ? 'Enter a valid rate.' : undefined} />
        <Input label="Loan Term (Years)" type="number" value={years} onChange={(e) => { setYears(e.target.value); setValidationError(null); }} min="1" step="1" error={validationError ? 'Enter a valid term.' : undefined} />
        <Input label="Annual Property Tax ($)" type="number" value={tax} onChange={(e) => setTax(e.target.value)} min="0" />
        <Input label="Annual Insurance ($)" type="number" value={insurance} onChange={(e) => setInsurance(e.target.value)} min="0" />
        {validationError && <p className="input-message input-message-error" role="alert">{validationError}</p>}
        <Button onClick={calculate} magnetic style={{ width: '100%' }}>Calculate Mortgage</Button>
        <ResultDisplay
          visible={!!result}
          highlight={result ? `$${(result.mortgage + result.monthlyTax + result.monthlyInsurance).toLocaleString()}` : undefined}
          subtitle="Monthly total payment"
          slots={result ? [
            { label: 'Mortgage Principal & Interest', value: `$${result.mortgage.toLocaleString()}` },
            { label: 'Monthly Property Tax', value: `$${result.monthlyTax.toLocaleString()}` },
            { label: 'Monthly Insurance', value: `$${result.monthlyInsurance.toLocaleString()}` },
            { label: 'Total Interest Over Life', value: `$${result.totalInterest.toLocaleString()}` },
            { label: 'Total Amount Paid', value: `$${result.totalCost.toLocaleString()}` },
          ] : []}
        />
      </Card>
    </PageTransition>
  );
}
