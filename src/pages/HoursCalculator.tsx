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

const hoursCalculatorFAQ: FAQItem[] = [
  {
    "question": "How do I calculate decimal hours?",
    "answer": "To convert minutes to decimal hours, divide the minutes by 60. For example, 45 minutes = 45 ÷ 60 = 0.75 hours. 8 hours and 45 minutes is written as 8.75 hours."
  },
  {
    "question": "Does the calculator handle shifts spanning midnight?",
    "answer": "Yes. If the end time is earlier than the start time (e.g. start at 10:00 PM, end at 6:00 AM), the calculator automatically assumes the shift crossed midnight into the next day and calculates the correct elapsed time."
  },
  {
    "question": "What is the difference between decimal hours and minutes?",
    "answer": "Decimal hours represent time as a decimal fraction (e.g. 7.5 hours). Hours and minutes format displays standard time units (e.g. 7 hours and 30 minutes)."
  },
  {
    "question": "Can I log multiple days of work?",
    "answer": "This simple calculator is designed for a single shift. For multi-day timesheets, calculate each day's hours individually and sum the decimal hours."
  },
  {
    "question": "Does the calculator support 24-hour military time?",
    "answer": "Yes. You can enter times using either 12-hour AM/PM format or 24-hour format depending on your system's clock configuration."
  }
];

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
      <SEO title="Free Hours Calculator" description="Calculate total work hours and decimal time between two times, including break subtraction, online for free." path="/hours-calculator" faqSchema={hoursCalculatorFAQ} />
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
          {/* ── SEO Content Sections ── */}
      <div className="seo-content">

        <section className="seo-section">
          <h2>How the Hours Calculator Works</h2>
          <p>This hours calculator tracks elapsed work time. Input your start time, end time, and any unpaid break duration to compute the total hours and minutes worked — useful for timesheet preparation and payroll checks.</p>
        </section>

        <section className="seo-section">
          <h2>Formula Used</h2>
          <div className="seo-formula" style={{ whiteSpace: 'pre-line' }}>
            {"Hours Worked = (End Time − Start Time) − Break Duration"}
          </div>
          <dl className="seo-formula-vars">
            <dt>Start Time / End Time</dt>
            <dd>— the timestamps marking the beginning and end of the shift</dd>
            <dt>Break Duration</dt>
            <dd>— unpaid rest time in minutes, subtracted from the total time elapsed</dd>
            <dt>Hours Worked</dt>
            <dd>— the net duration of the shift, displayed in decimal hours and HH:MM format</dd>
          </dl>
        </section>

        <section className="seo-section">
          <h2>Example Calculation</h2>
          <p>If you start work at 9:00 AM, finish at 5:30 PM, and take a 30-minute unpaid break: Total elapsed time = 8.5 hours (8 hours and 30 minutes). Subtracting the 30-minute break leaves 8.0 worked hours.</p>
        </section>

        <section className="seo-section">
          <h2>Frequently Asked Questions</h2>
          <FAQAccordion items={hoursCalculatorFAQ} />
        </section>

      </div>
    </PageTransition>
  );
}
