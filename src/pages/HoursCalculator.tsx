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

export default function HoursCalculator() {
  useToolTracking('hours-calculator', 'Hours Calculator');
  const [start, setStart] = useState('09:00');
  const [end, setEnd] = useState('17:00');
  const [breakMinutes, setBreakMinutes] = useState('0');
  const [result, setResult] = useState<{ decimal: string; hhmm: string } | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);

  const timeToMinutes = (value: string) => {
    const [hours, minutes] = value.split(':').map(Number);
    return hours * 60 + minutes;
  };

  const calculate = () => {
    const startMinutes = timeToMinutes(start);
    const endMinutes = timeToMinutes(end);
    const breakTotal = Number(breakMinutes || 0);

    if (Number.isNaN(startMinutes) || Number.isNaN(endMinutes) || breakTotal < 0) {
      setValidationError('Enter valid times.');
      return;
    }

    setValidationError(null);
    let working = endMinutes - startMinutes - breakTotal;
    if (working < 0) working += 24 * 60;

    const totalHours = working / 60;
    const hours = Math.floor(totalHours);
    const minutes = Math.round((totalHours - hours) * 60);
    const hhmm = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;

    const nextResult = { decimal: totalHours.toFixed(2), hhmm };
    setResult(nextResult);
    addHistory({
      tool: 'Hours Calculator',
      toolSlug: 'hours-calculator',
      expression: `${start} → ${end}`,
      result: nextResult.hhmm,
    });
  };

  return (
    <PageTransition className="page-medium">
      <SEO title="Hours Calculator" description="Calculate total time worked between two times, including optional breaks." path="/hours-calculator" />
      <Link to="/" className="back-link">← Back to tools</Link>
      <div className="tool-header">
        <div className="eyebrow">Time</div>
        <h1 className="page-title">Hours Calculator</h1>
        <p className="page-lede">Calculate total hours worked, including break time, in decimal and hh:mm formats.</p>
      </div>
      <Card padding="lg">
        <Input label="Start Time" type="time" value={start} onChange={(e) => { setStart(e.target.value); setValidationError(null); }} />
        <Input label="End Time" type="time" value={end} onChange={(e) => { setEnd(e.target.value); setValidationError(null); }} />
        <Input label="Break Duration (minutes)" type="number" value={breakMinutes} onChange={(e) => { setBreakMinutes(e.target.value); setValidationError(null); }} min="0" />
        {validationError && <p className="input-message input-message-error" role="alert">{validationError}</p>}
        <Button onClick={calculate} magnetic style={{ width: '100%' }}>Calculate Hours</Button>
        <ResultDisplay
          visible={!!result}
          highlight={result ? `${result.decimal} hrs` : undefined}
          subtitle={result ? `Duration: ${result.hhmm}` : undefined}
          slots={result ? [
            { label: 'Decimal Hours', value: result.decimal },
            { label: 'HH:MM', value: result.hhmm },
          ] : []}
        />
      </Card>
    </PageTransition>
  );
}
