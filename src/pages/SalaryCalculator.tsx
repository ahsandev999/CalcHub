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

const salaryCalculatorFAQ: FAQItem[] = [
  {
    "question": "How many working hours are in a year?",
    "answer": "Assuming a standard 40-hour work week and 52 weeks, there are 2,080 working hours in a year. Some calculations subtract holidays and paid time off (typically leaving 2,000 hours)."
  },
  {
    "question": "What is gross salary vs. net salary?",
    "answer": "Gross salary is your total earnings before any deductions. Net salary ('take-home pay') is the amount you receive after taxes, pension contributions, and insurance are deducted."
  },
  {
    "question": "Does this calculator account for leap years?",
    "answer": "No. This tool uses the standard 52-week year (364 days). In reality, a year has slightly more than 52 weeks, but 52 is the standard convention for payroll calculations."
  },
  {
    "question": "How do I convert monthly salary to hourly rate?",
    "answer": "Multiply the monthly salary by 12 to get the annual salary, then divide by the total annual working hours (weekly hours × 52)."
  },
  {
    "question": "What is the standard number of hours for a full-time job?",
    "answer": "In most countries, full-time employment is defined as working between 35 and 40 hours per week."
  }
];

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
      <SEO title="Free Salary Calculator" description="Convert hourly wages and annual salary into weekly, monthly, and yearly pay rates with this free online tool." path="/salary-calculator" faqSchema={salaryCalculatorFAQ} />
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
          {/* ── SEO Content Sections ── */}
      <div className="seo-content">

        <section className="seo-section">
          <h2>How the Salary Calculator Works</h2>
          <p>This salary converter translates your earnings between different time periods. It converts hourly wages, weekly hours, or annual salary into equivalent hourly, weekly, monthly, and annual figures.</p>
        </section>

        <section className="seo-section">
          <h2>Formula Used</h2>
          <div className="seo-formula" style={{ whiteSpace: 'pre-line' }}>
            {"Annual = Hourly Rate × Hours Per Week × 52\nWeekly = Hourly Rate × Hours Per Week\nMonthly = Annual ÷ 12"}
          </div>
          <dl className="seo-formula-vars">
            <dt>Hourly Rate</dt>
            <dd>— the wage paid for one hour of work</dd>
            <dt>Hours Per Week</dt>
            <dd>— the number of hours worked per week (defaults to 40)</dd>
            <dt>52</dt>
            <dd>— the number of weeks in a year used for conversion</dd>
          </dl>
        </section>

        <section className="seo-section">
          <h2>Example Calculation</h2>
          <p>If you earn $25 per hour working 40 hours per week: Weekly = 25 × 40 = $1,000. Annual = $1,000 × 52 = $52,000. Monthly = $52,000 ÷ 12 = $4,333.33.</p>
        </section>

        <section className="seo-section">
          <h2>Frequently Asked Questions</h2>
          <FAQAccordion items={salaryCalculatorFAQ} />
        </section>

      </div>
    </PageTransition>
  );
}
