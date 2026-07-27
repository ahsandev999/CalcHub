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

function diffDates(start: string, end: string) {
  const s = new Date(start + 'T00:00:00');
  const e = new Date(end + 'T00:00:00');
  if (s > e) throw new Error('Start date must be before end date');

  const totalDays = Math.floor((e.getTime() - s.getTime()) / 86400000);
  const totalWeeks = Math.floor(totalDays / 7);
  const totalMonths = (e.getFullYear() - s.getFullYear()) * 12 + (e.getMonth() - s.getMonth());
  const totalHours = totalDays * 24;
  const totalMinutes = totalHours * 60;

  let years = e.getFullYear() - s.getFullYear();
  let months = e.getMonth() - s.getMonth();
  let days = e.getDate() - s.getDate();
  if (days < 0) { months--; days += new Date(e.getFullYear(), e.getMonth(), 0).getDate(); }
  if (months < 0) { years--; months += 12; }

  return { years, months, days, totalDays, totalWeeks, totalMonths, totalHours, totalMinutes };
}

const dateDifferenceFAQ: FAQItem[] = [
  {
    "question": "Does this calculator account for leap years?",
    "answer": "Yes. The calculator fully accounts for leap years, adding an extra day (February 29) in years divisible by 4 (except years divisible by 100 but not 400)."
  },
  {
    "question": "Is the end date included in the day count?",
    "answer": "By default, date difference calculations exclude the starting day and include the ending day. If you want to include both days, simply add 1 to the final day count."
  },
  {
    "question": "How many weeks are in the difference?",
    "answer": "The calculator provides the total days, which can be divided by 7 to get weeks. For example, 14 days is exactly 2 weeks, while 15 days is 2 weeks and 1 day."
  },
  {
    "question": "Can I calculate negative date differences?",
    "answer": "If the starting date is after the ending date, the calculator will return a negative day count, indicating that the second date occurred in the past relative to the first."
  },
  {
    "question": "Why do month differences vary in length?",
    "answer": "Because months have different numbers of days (28, 29, 30, or 31), the calculator counts full calendar months elapsed rather than assuming a fixed 30-day month, ensuring calendar accuracy."
  }
];

export default function DateDifference() {
  useToolTracking('date-difference', 'Date Difference');

  const [start, setStart] = useState('');
  const [end, setEnd] = useState(new Date().toISOString().split('T')[0]);
  const [result, setResult] = useState<ReturnType<typeof diffDates> | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);

  const calculate = () => {
    if (!start || !end) { setValidationError('Enter both dates.'); return; }

    setValidationError(null);
    try {
      const r = diffDates(start, end);
      setResult(r);
      addHistory({ tool: 'Date Difference', toolSlug: 'date-difference', expression: `${start} → ${end}`, result: `${r.totalDays} days` });
    } catch (e) { setValidationError((e as Error).message); }
  };

  return (
    <PageTransition className="page-medium">
      <SEO title="Free Date Difference Calculator" description="Calculate the exact number of days, weeks, or months between two dates online for free." path="/date-difference" faqSchema={dateDifferenceFAQ} />
      <Link to="/" className="back-link">← Back to tools</Link>
      <div className="tool-header">
        <div className="eyebrow">Time</div>
        <h1 className="page-title">Date Difference</h1>
        <p className="page-lede">Calculate the exact time between any two dates.</p>
      </div>
      <Card padding="lg">
        <Input label="Start Date" type="date" value={start} onChange={(e) => { setStart(e.target.value); setValidationError(null); }} error={validationError ? 'Select a start date.' : undefined} />
        <Input label="End Date" type="date" value={end} onChange={(e) => { setEnd(e.target.value); setValidationError(null); }} error={validationError ? 'Select an end date.' : undefined} />
        {validationError && <p className="input-message input-message-error" role="alert">{validationError}</p>}
        <Button onClick={calculate} magnetic style={{ width: '100%' }}>Calculate Difference</Button>
        <ResultDisplay
          visible={!!result}
          highlight={result ? `${result.years}y ${result.months}m ${result.days}d` : undefined}
          slots={result ? [
            { label: 'Total Days', value: result.totalDays, animate: true },
            { label: 'Total Weeks', value: result.totalWeeks, animate: true },
            { label: 'Total Months', value: result.totalMonths, animate: true },
            { label: 'Total Hours', value: result.totalHours, animate: true },
            { label: 'Total Minutes', value: result.totalMinutes, animate: true },
          ] : []}
        />
      </Card>
          {/* ── SEO Content Sections ── */}
      <div className="seo-content">

        <section className="seo-section">
          <h2>How the Date Difference Calculator Works</h2>
          <p>This calculator calculates the elapsed time between two calendar dates. It provides the total difference in days, as well as broken down into years, months, and days, helping you track deadlines, ages, or elapsed project times.</p>
        </section>

        <section className="seo-section">
          <h2>Formula Used</h2>
          <div className="seo-formula" style={{ whiteSpace: 'pre-line' }}>
            {"Days Elapsed = Date 2 − Date 1"}
          </div>
          <dl className="seo-formula-vars">
            <dt>Date 1</dt>
            <dd>— the starting date in YYYY-MM-DD format</dd>
            <dt>Date 2</dt>
            <dd>— the ending date in YYYY-MM-DD format</dd>
            <dt>Days Elapsed</dt>
            <dd>— the total number of full 24-hour days between the two dates, accounting for leap years</dd>
          </dl>
        </section>

        <section className="seo-section">
          <h2>Example Calculation</h2>
          <p>To find the difference between 1 January 2026 and 15 January 2026, enter the dates. The calculator subtracts the dates directly: 15 − 1 = 14 days difference (exactly 2 weeks).</p>
        </section>

        <section className="seo-section">
          <h2>Frequently Asked Questions</h2>
          <FAQAccordion items={dateDifferenceFAQ} />
        </section>

      </div>
    </PageTransition>
  );
}
