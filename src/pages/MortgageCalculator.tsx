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

const mortgageCalculatorFAQ: FAQItem[] = [
  {
    "question": "What is included in a monthly mortgage payment?",
    "answer": "A standard monthly payment includes Principal and Interest (P&I), and often Property Taxes and Homeowners Insurance (held in an escrow account)."
  },
  {
    "question": "How does the down payment affect my mortgage?",
    "answer": "A larger down payment reduces the principal loan amount, which lowers your monthly payments and decreases the total interest paid over the life of the loan."
  },
  {
    "question": "What is Private Mortgage Insurance (PMI)?",
    "answer": "PMI is an extra monthly fee required by conventional lenders if your down payment is less than 20% of the home purchase price. It protects the lender if you default on the loan."
  },
  {
    "question": "Should I choose a 15-year or 30-year mortgage?",
    "answer": "A 30-year mortgage has lower monthly payments, making it more affordable month-to-month. A 15-year mortgage has higher monthly payments but lower interest rates, saving you substantial interest over time."
  },
  {
    "question": "How does amortization work in a mortgage?",
    "answer": "In early years, most of your monthly payment goes toward interest. Over time, the proportion shifts so that a larger portion goes toward reducing the principal balance until the loan is paid off."
  }
];

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
      <SEO title="Free Mortgage Calculator" description="Calculate your monthly home mortgage payments including taxes and insurance with this free online estimator." path="/mortgage-calculator" faqSchema={mortgageCalculatorFAQ} />
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
          {/* ── SEO Content Sections ── */}
      <div className="seo-content">

        <section className="seo-section">
          <h2>How the Mortgage Calculator Works</h2>
          <p>This mortgage calculator estimates your total monthly home payment, including principal and interest, property taxes, and home insurance. By factoring in your down payment, interest rate, and term length, it helps you plan your home purchasing budget.</p>
        </section>

        <section className="seo-section">
          <h2>Formula Used</h2>
          <div className="seo-formula" style={{ whiteSpace: 'pre-line' }}>
            {"M = P × [r(1 + r)ⁿ] ÷ [(1 + r)ⁿ − 1] + Monthly Tax + Monthly Insurance"}
          </div>
          <dl className="seo-formula-vars">
            <dt>P (Principal)</dt>
            <dd>— the loan amount (Home Price − Down Payment)</dd>
            <dt>r</dt>
            <dd>— monthly interest rate = annual interest rate ÷ 12 ÷ 100</dd>
            <dt>n</dt>
            <dd>— total number of monthly payments = term in years × 12</dd>
            <dt>Monthly Tax / Insurance</dt>
            <dd>— annual property tax and insurance divided by 12, added to the monthly payment</dd>
          </dl>
        </section>

        <section className="seo-section">
          <h2>Example Calculation</h2>
          <p>For a $300,000 home with a $60,000 down payment (P = $240,000), a 6% interest rate over 30 years (360 months), with annual taxes of $3,000 and insurance of $1,200: Monthly mortgage principal and interest = $1,438.92. Plus monthly tax ($250) and insurance ($100) = $1,788.92 total monthly payment.</p>
        </section>

        <section className="seo-section">
          <h2>Frequently Asked Questions</h2>
          <FAQAccordion items={mortgageCalculatorFAQ} />
        </section>

      </div>
    </PageTransition>
  );
}
