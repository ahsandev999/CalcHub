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
      <SEO title="Date Difference Calculator" description="Calculate the exact difference between two dates in years, months, days and more." path="/date-difference" />
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
    </PageTransition>
  );
}
