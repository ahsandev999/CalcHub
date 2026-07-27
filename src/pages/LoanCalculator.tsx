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

const loanCalculatorFAQ: FAQItem[] = [
  {
    "question": "What is the difference between APR and interest rate?",
    "answer": "The interest rate is the cost of borrowing the principal only, expressed as an annual percentage. APR includes the interest rate plus any additional fees charged by the lender, making it a more complete measure of the total yearly cost."
  },
  {
    "question": "Does paying extra each month reduce total interest?",
    "answer": "Yes — any extra payment beyond the scheduled monthly amount goes directly toward reducing the principal balance, which compounds over the life of the loan and can save significant money."
  },
  {
    "question": "What happens if I choose a shorter loan term?",
    "answer": "A shorter term increases the monthly payment but dramatically reduces the total interest paid. The trade-off is higher monthly cash flow pressure in exchange for a lower total cost of borrowing."
  },
  {
    "question": "Can I use this for mortgage calculations?",
    "answer": "Yes — the underlying formula is identical. Enter the mortgage amount, interest rate, and term. Note that mortgages may also include property tax, insurance, and PMI on top of the principal and interest payment calculated here."
  },
  {
    "question": "What is a good interest rate for a personal loan?",
    "answer": "Personal loan rates typically range from 6% to 36% annually, depending on your credit score and the lender. Borrowers with excellent credit (750+) often qualify for rates under 12%."
  }
];

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
      <SEO title="Free Loan Calculator" description="Calculate monthly payments, interest, and total repayment for any amortized loan with this free online tool." path="/loan-calculator" faqSchema={loanCalculatorFAQ} />
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
            {/* ── SEO Content Sections ── */}
      <div className="seo-content">

        <section className="seo-section">
          <h2>How the Loan Calculator Works</h2>
          <p>This calculator uses the standard amortization formula to compute your fixed monthly payment for a loan given its principal, annual interest rate, and repayment term in years. Amortization means each monthly payment covers both interest accrued that month and a portion of the principal.</p>
        </section>

        <section className="seo-section">
          <h2>Formula Used</h2>
          <div className="seo-formula" style={{ whiteSpace: 'pre-line' }}>
            {"M = P × [r(1 + r)ⁿ] ÷ [(1 + r)ⁿ − 1]"}
          </div>
          <dl className="seo-formula-vars">
            <dt>M</dt>
            <dd>— fixed monthly payment amount</dd>
            <dt>P</dt>
            <dd>— loan principal (the amount borrowed)</dd>
            <dt>r</dt>
            <dd>— monthly interest rate = annual rate ÷ 12 ÷ 100</dd>
            <dt>n</dt>
            <dd>— total number of monthly payments = years × 12</dd>
          </dl>
        </section>

        <section className="seo-section">
          <h2>Example Calculation</h2>
          <p>Suppose you borrow $20,000 at an annual interest rate of 6% over 5 years (60 months). The monthly rate r = 6 ÷ 12 ÷ 100 = 0.005. Applying the formula: M = 20,000 × [0.005 × (1.005)⁶⁰] ÷ [(1.005)⁶⁰ − 1] ≈ $386.66 per month. Total paid over 5 years = $386.66 × 60 = $23,199.60, with $3,199.60 paid in interest.</p>
        </section>

        <section className="seo-section">
          <h2>Frequently Asked Questions</h2>
          <FAQAccordion items={loanCalculatorFAQ} />
        </section>

      </div>
    </PageTransition>
  );
}
