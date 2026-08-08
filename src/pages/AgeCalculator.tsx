import Breadcrumbs from '@/components/ui/Breadcrumbs';
import { getBreadcrumbsForTool } from '@/lib/tools';
import { useState, useRef } from 'react';

import { motion, AnimatePresence } from 'framer-motion';
import FAQAccordion, { type FAQItem } from '@/components/ui/FAQAccordion';
import PageTransition from '@/components/ui/PageTransition';
import SEO from '@/components/ui/SEO';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { useToolTracking } from '@/hooks/useScroll';
import { calculateAge, calculateAgeDifference } from '@/lib/calculators/age';
import { addHistory } from '@/lib/storage';
import { Calendar, Users, Award, Star, Compass, Clock, Copy, Check } from 'lucide-react';
import confetti from 'canvas-confetti';
import '@/styles/components.css';

function todayStr() {
  return new Date().toISOString().split('T')[0];
}

const ageCalculatorFAQ: FAQItem[] = [
  {
    "question": "How do I calculate my exact age in days?",
    "answer": "Enter your date of birth and leave the reference date as today. The calculator displays your total age in days in the result panel alongside years, months, and weeks."
  },
  {
    "question": "Does the calculator handle leap year birthdays (Feb 29)?",
    "answer": "Yes. If you were born on February 29 and the current year is not a leap year, the calculator treats March 1 as your effective birthday for that year when determining whether your birthday has passed."
  },
  {
    "question": "Can I calculate how old I'll be on a future date?",
    "answer": "Absolutely — just change the 'As of date' field to any future date. The calculator will show exactly how old you will be on that date."
  },
  {
    "question": "What is the age difference calculator used for?",
    "answer": "The 'Compare Ages' mode tells you the exact gap in years, months, and days between two people's birth dates. It is commonly used to check age differences for couples, siblings, or sports brackets."
  },
  {
    "question": "Why does my age in months sometimes seem off by one?",
    "answer": "The month component shows only complete elapsed months after the last birthday. If your birthday is on the 28th and today is the 26th, the current month has not yet completed, so the month count reflects the last fully-elapsed month."
  }
];

export default function AgeCalculator() {
  const breadcrumbs = getBreadcrumbsForTool('age-calculator');
  useToolTracking('age-calculator', 'Age Calculator');  const dobRef = useRef<HTMLInputElement>(null);

  const [mode, setMode] = useState<'single' | 'compare'>('single');
  const [dob, setDob] = useState('');
  const [asOf, setAsOf] = useState(todayStr());
  const [dob2, setDob2] = useState('');
  const [result, setResult] = useState<ReturnType<typeof calculateAge> | null>(null);
  const [diffResult, setDiffResult] = useState<ReturnType<typeof calculateAgeDifference> | null>(null);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  const calculate = (overrideDob?: string, overrideAsOf?: string, overrideDob2?: string) => {
    setError('');
    const d = overrideDob !== undefined ? overrideDob : dob;
    const a = overrideAsOf !== undefined ? overrideAsOf : asOf;
    const d2 = overrideDob2 !== undefined ? overrideDob2 : dob2;

    if (!d) {
      setError('Please enter a date of birth');
      dobRef.current?.focus();
      return;
    }

    try {
      if (mode === 'single') {
        const r = calculateAge(d, a);
        setResult(r);
        setDiffResult(null);
        
        addHistory({
          tool: 'Age Calculator',
          toolSlug: 'age-calculator',
          expression: `Born ${d}`,
          result: `${r.years}y ${r.months}m ${r.days}d`,
        });

        // Trigger confetti on their birthday!
        if (r.isBirthdayToday) {
          confetti({
            particleCount: 150,
            spread: 80,
            origin: { y: 0.6 }
          });
        }
      } else {
        if (!d2) {
          setError('Please enter second date of birth');
          return;
        }
        const r = calculateAgeDifference(d, d2);
        setDiffResult(r);
        setResult(null);
      }
    } catch (e) {
      setError((e as Error).message);
    }
  };

  const fillExample = () => {
    const exDob = '1995-04-12';
    const exAsOf = todayStr();
    const exDob2 = '1997-08-25';
    setDob(exDob);
    setAsOf(exAsOf);
    setDob2(exDob2);
    setError('');
    calculate(exDob, exAsOf, exDob2);
  };

  const copyResultText = async () => {
    let text = '';
    if (result) {
      text = `Age: ${result.years} years, ${result.months} months, ${result.days} days.\nZodiac: ${result.zodiac} (${result.chineseZodiac})\nNext Birthday: ${result.nextBirthdayDays} days.\nTotal Days Alive: ${result.totalDays.toLocaleString()} days.`;
    } else if (diffResult) {
      text = `Age difference: ${diffResult.years} years, ${diffResult.months} months, ${diffResult.days} days.\nTotal Days Apart: ${diffResult.totalDays.toLocaleString()} days.`;
    }
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      
      setTimeout(() => setCopied(false), 2000);
    } catch {
      
    }
  };

  const slots = result ? [
    { label: 'Total Days Alive', value: result.totalDays.toLocaleString(), animate: true },
    { label: 'Total Weeks Alive', value: result.totalWeeks.toLocaleString(), animate: true },
    { label: 'Total Months Alive', value: result.totalMonths.toLocaleString(), animate: true },
    { label: 'Total Hours Alive', value: result.totalHours.toLocaleString(), animate: true },
    { label: 'Total Minutes Alive', value: result.totalMinutes.toLocaleString(), animate: true },
    { label: 'Leap Years Experienced', value: result.leapYears, animate: true },
    { label: 'Zodiac Sign', value: result.zodiac },
    { label: 'Chinese Zodiac', value: result.chineseZodiac },
    { label: 'Day of Week Born', value: result.dayOfWeek },
    { label: 'Next Birthday Countdown', value: result.isBirthdayToday ? 'Today! 🎉' : `${result.nextBirthdayDays} days` },
    { label: 'Hours to Next Birthday', value: result.nextBirthdayHours.toLocaleString(), animate: true },
  ] : [];

  const diffSlots = diffResult ? [
    { label: 'Older Person', value: diffResult.olderPerson === 'same' ? 'Same age' : diffResult.olderPerson === 'first' ? 'Person 1' : 'Person 2' },
    { label: 'Total Days Difference', value: diffResult.totalDays.toLocaleString(), animate: true },
  ] : [];

  return (
    <PageTransition className="page-medium">
      <SEO
        title="Free Age Calculator" description="Calculate your exact age online in years, months, and days for free. Check birth details and compare two ages instantly." path="/age-calculator" faqSchema={ageCalculatorFAQ} 
        breadcrumbSchema={breadcrumbs?.schema}
      />
      
      <Breadcrumbs items={breadcrumbs?.visual || []} />

      <div className="tool-header">
        <div className="eyebrow">Time</div>
        <h1 className="page-title text-gradient">Age Calculator</h1>
        <p className="page-lede">Discover your exact lifetime statistics, countdowns, zodiac elements, or compare ages between two people.</p>
      </div>

      <div className="tabs" role="tablist">
        <button
          role="tab"
          aria-selected={mode === 'single'}
          className={`tab ${mode === 'single' ? 'active' : ''}`}
          onClick={() => { setMode('single'); setResult(null); setDiffResult(null); }}
        >
          <Calendar size={14} style={{ marginRight: 6, display: 'inline-block', verticalAlign: 'text-bottom' }} />
          Calculate Age
        </button>
        <button
          role="tab"
          aria-selected={mode === 'compare'}
          className={`tab ${mode === 'compare' ? 'active' : ''}`}
          onClick={() => { setMode('compare'); setResult(null); setDiffResult(null); }}
        >
          <Users size={14} style={{ marginRight: 6, display: 'inline-block', verticalAlign: 'text-bottom' }} />
          Compare Ages
        </button>
      </div>

      <Card padding="lg">
        <div className="grid-2" style={{ marginBottom: 20 }}>
          <Input
            ref={dobRef}
            label={mode === 'single' ? "Date of Birth" : "Person 1 Date of Birth"}
            type="date"
            value={dob}
            onChange={(e) => setDob(e.target.value)}
            max={todayStr()}
            placeholder="e.g. 1995-04-12"
            error={error && !dob ? error : undefined}
          />
          {mode === 'single' && (
            <Input
              label="Calculate Age As Of"
              type="date"
              value={asOf}
              onChange={(e) => setAsOf(e.target.value)}
              placeholder="e.g. 2026-08-07"
            />
          )}
          {mode === 'compare' && (
            <Input
              label="Person 2 Date of Birth"
              type="date"
              value={dob2}
              onChange={(e) => setDob2(e.target.value)}
              max={todayStr()}
              placeholder="e.g. 1997-08-25"
              error={error && !dob2 ? error : undefined}
            />
          )}
        </div>

        <Button onClick={() => calculate()} magnetic style={{ width: '100%', marginBottom: 16 }}>
          Calculate Age
        </Button>
        <button className="btn-demo-fill" onClick={fillExample} style={{ marginTop: 0, marginBottom: 16 }}>Try Example</button>

        <AnimatePresence>
          {result && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ duration: 0.4 }}
            >
              <div className="result-display">
                <div className="result-highlight-wrap">
                  <h3 className="result-title">Exact Age</h3>
                  <Button size="sm" variant="ghost" onClick={copyResultText} style={{ padding: '6px 10px', height: 'auto' }}>
                    {copied ? <Check size={14} style={{ color: 'var(--success)' }} /> : <Copy size={14} />}
                    <span style={{ marginLeft: 6 }}>Copy Stats</span>
                  </Button>
                </div>
                <div className="result-highlight" style={{ fontSize: 'clamp(1.5rem, 4vw, 2.5rem)' }}>
                  {result.years} years, {result.months} months, {result.days} days
                </div>
                <p className="result-subtitle" style={{ marginTop: 8 }}>
                  {result.isBirthdayToday ? (
                    <span style={{ fontWeight: 700, color: 'var(--accent)' }}>It's your birthday today! 🎉 Have an amazing day!</span>
                  ) : (
                    <span>🎂 Next Birthday: <strong>{result.nextBirthdayDays}</strong> days ({result.isBirthdayToday ? 'Today' : `${result.nextBirthdayHours.toLocaleString()} hours`})</span>
                  )}
                </p>

                <div className="result-grid">
                  {slots.map((s, idx) => (
                    <div key={idx} className="result-slot">
                      <span className="label">
                        {s.label.includes('Zodiac') ? <Star size={12} style={{ marginRight: 6, color: 'var(--accent)' }} /> :
                         s.label.includes('Day') ? <Compass size={12} style={{ marginRight: 6, color: 'var(--accent)' }} /> :
                         s.label.includes('Leap') ? <Award size={12} style={{ marginRight: 6, color: 'var(--accent)' }} /> :
                         <Clock size={12} style={{ marginRight: 6, color: 'var(--accent)' }} />}
                        {s.label}
                      </span>
                      <span className="value">{s.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {diffResult && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ duration: 0.4 }}
            >
              <div className="result-display">
                <div className="result-highlight-wrap">
                  <h3 className="result-title">Age Difference</h3>
                  <Button size="sm" variant="ghost" onClick={copyResultText} style={{ padding: '6px 10px', height: 'auto' }}>
                    {copied ? <Check size={14} style={{ color: 'var(--success)' }} /> : <Copy size={14} />}
                    <span style={{ marginLeft: 6 }}>Copy Difference</span>
                  </Button>
                </div>
                <div className="result-highlight" style={{ fontSize: 'clamp(1.5rem, 4vw, 2.5rem)' }}>
                  {diffResult.years} years, {diffResult.months} months, {diffResult.days} days apart
                </div>
                <p className="result-subtitle">
                  {diffResult.olderPerson === 'same' ? (
                    <span>Both people are exactly the same age.</span>
                  ) : (
                    <span>The older person is <strong>{diffResult.olderPerson === 'first' ? 'Person 1' : 'Person 2'}</strong>.</span>
                  )}
                </p>

                <div className="result-grid">
                  {diffSlots.map((s, idx) => (
                    <div key={idx} className="result-slot">
                      <span className="label">
                        <Users size={12} style={{ marginRight: 6, color: 'var(--accent)' }} />
                        {s.label}
                      </span>
                      <span className="value">{s.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>
            {/* ── SEO Content Sections ── */}
      <div className="seo-content">

        <section className="seo-section">
          <h2>How the Age Calculator Works</h2>
          <p>This calculator computes your exact age in years, months, and days by comparing your date of birth to a chosen reference date (defaulting to today). It accounts for the varying number of days in each month and correctly handles leap years, so the result is always precise to the day.</p>
        </section>

        <section className="seo-section">
          <h2>Formula Used</h2>
          <div className="seo-formula" style={{ whiteSpace: 'pre-line' }}>
            {"Age = (Reference Date) − (Date of Birth)"}
          </div>
          <dl className="seo-formula-vars">
            <dt>Reference Date</dt>
            <dd>— the date you want to calculate age as of (defaults to today's date)</dd>
            <dt>Date of Birth</dt>
            <dd>— your birth date in YYYY-MM-DD format</dd>
            <dt>Result</dt>
            <dd>— the difference broken down into complete years, remaining months, and remaining days, with additional conversions to total weeks, hours, and minutes</dd>
          </dl>
        </section>

        <section className="seo-section">
          <h2>Example Calculation</h2>
          <p>Suppose someone was born on 15 March 1990 and today is 27 July 2025. The calculator first counts complete years: 35 years. Then the remaining months: March to July = 4 complete months. Finally the remaining days: 15 July to 27 July = 12 days. The result is 35 years, 4 months, and 12 days.</p>
        </section>

        <section className="seo-section">
          <h2>Frequently Asked Questions</h2>
          <FAQAccordion items={ageCalculatorFAQ} />
        </section>

      </div>
    </PageTransition>
  );
}
