import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import FAQAccordion, { type FAQItem } from '@/components/ui/FAQAccordion';
import PageTransition from '@/components/ui/PageTransition';
import SEO from '@/components/ui/SEO';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { useToolTracking } from '@/hooks/useScroll';
import { calculateSleep, formatTime, type SleepMode } from '@/lib/calculators/sleep';
import { addHistory } from '@/lib/storage';
import { Moon, Sun, Clock, Coffee, Sparkles, Check, Copy, ArrowLeft } from 'lucide-react';
import '@/styles/components.css';

const sleepCalculatorFAQ: FAQItem[] = [
  {
    "question": "Why do sleep cycles matter?",
    "answer": "A typical sleep cycle lasts about 90 minutes and moves through stages of light, deep, and REM sleep. Waking up at the end of a completed cycle prevents grogginess (sleep inertia), helping you feel alert instantly."
  },
  {
    "question": "How many hours of sleep do I need?",
    "answer": "Most healthy adults require 7 to 9 hours of sleep per night. This equates to about 5 or 6 full sleep cycles. Children and teenagers require significantly more sleep."
  },
  {
    "question": "Does this calculator account for personal differences?",
    "answer": "This tool uses the standard 90-minute average cycle length and 15-minute sleep latency. While standard for most, individuals may vary, so adjust your schedule slightly if you find your cycles are shorter or longer."
  },
  {
    "question": "What is sleep debt?",
    "answer": "Sleep debt is the cumulative effect of not getting enough sleep over time. If you miss sleep cycles consistently, you build a deficit that can lead to physical fatigue, mental fog, and weakened immunity."
  },
  {
    "question": "How long should a power nap be?",
    "answer": "A power nap should last either 20 minutes (staying in light sleep) or a full 90 minutes (a complete sleep cycle). Napping for 45-60 minutes will land you in deep sleep, causing you to wake up feeling groggy."
  }
];

export default function SleepCalculator() {
  useToolTracking('sleep-calculator', 'Sleep Calculator');
  const [mode, setMode] = useState<SleepMode>('wake');
  const [wakeTime, setWakeTime] = useState('');
  const [fallAsleep, setFallAsleep] = useState('');
  const [napDuration, setNapDuration] = useState('');
  const [result, setResult] = useState<ReturnType<typeof calculateSleep> | null>(null);
  const [copied, setCopied] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  const calculate = (overrideWakeTime?: string, overrideFallAsleep?: string, overrideNap?: string) => {
    const wt = overrideWakeTime !== undefined ? overrideWakeTime : wakeTime;
    const fa = overrideFallAsleep !== undefined ? overrideFallAsleep : fallAsleep;
    const nd = overrideNap !== undefined ? overrideNap : napDuration;

    if ((mode === 'wake' || mode === 'bedtime') && !wt) {
      setValidationError('Please select a time.');
      return;
    }

    setValidationError(null);

    const r = calculateSleep(
      mode,
      wt || undefined,
      parseInt(fa) || 15,
      parseInt(nd) || 20
    );
    setResult(r);

    addHistory({
      tool: 'Sleep Calculator',
      toolSlug: 'sleep-calculator',
      expression: `${mode === 'wake' ? 'Wake at' : mode === 'sleep' ? 'Sleep now' : mode === 'bedtime' ? 'Bedtime' : 'Nap'} mode`,
      result: r.options[0] ? formatTime(r.options[0].time) : '',
    });
  };

  const fillExample = () => {
    const exWT = '07:00';
    const exFA = '15';
    const exND = '20';
    setWakeTime(exWT);
    setFallAsleep(exFA);
    setNapDuration(exND);
    setValidationError(null);
    calculate(exWT, exFA, exND);
  };

  const copyResultText = async () => {
    if (!result) return;
    const text = `Sleep calculation (${result.mode} mode):\n${result.note}\n` +
      result.options.map(opt => `- ${opt.cycles > 0 ? `${opt.cycles} cycles (${opt.durationHours}h)` : `${opt.durationHours * 60}m nap`}: ${formatTime(opt.time)} (${opt.qualityLabel})`).join('\n');
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      
      setTimeout(() => setCopied(false), 2000);
    } catch {
      
    }
  };

  const modes: { id: SleepMode; label: string; icon: any }[] = [
    { id: 'wake', label: 'Wake at', icon: Sun },
    { id: 'sleep', label: 'Sleep now', icon: Moon },
    { id: 'bedtime', label: 'Bedtime', icon: Clock },
    { id: 'nap', label: 'Nap', icon: Coffee },
  ];

  return (
    <PageTransition className="page-medium">
      <SEO title="Free Sleep Calculator" description="Calculate optimal sleep cycles, bedtimes, and wake times online for free to improve sleep quality." path="/sleep-calculator" faqSchema={sleepCalculatorFAQ} />
      
      <Link to="/" className="back-link">
        <ArrowLeft size={16} />
        Back to tools
      </Link>

      <div className="tool-header">
        <div className="eyebrow">Health</div>
        <h1 className="page-title text-gradient">Sleep Calculator</h1>
        <p className="page-lede">Optimize your rest using natural 90-minute sleep cycles. Determine when to fall asleep, wake up, or take refreshing power naps.</p>
      </div>

      <Card padding="lg">
        <div className="tabs" role="tablist" style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {modes.map((m) => {
            const Icon = m.icon;
            return (
              <button 
                key={m.id} 
                role="tab" 
                aria-selected={mode === m.id} 
                className={`tab ${mode === m.id ? 'active' : ''}`} 
                onClick={() => { setMode(m.id); setResult(null); setValidationError(null); }}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
              >
                <Icon size={14} />
                {m.label}
              </button>
            );
          })}
        </div>

        <div className="grid-2" style={{ marginBottom: 20 }}>
          {(mode === 'wake' || mode === 'bedtime') && (
            <Input 
              label={mode === 'wake' ? 'Target Wake Up Time' : 'Bedtime'} 
              type="time" 
              value={wakeTime} 
              onChange={(e) => { setWakeTime(e.target.value); setValidationError(null); }} 
              placeholder="e.g. 07:00"
              error={validationError ? 'Please select a time.' : undefined}
            />
          )}
          {mode === 'nap' && (
            <Input 
              label="Nap Duration (minutes)" 
              type="number" 
              value={napDuration} 
              onChange={(e) => { setNapDuration(e.target.value); setValidationError(null); }} 
              min="5" 
              max="120" 
              placeholder="e.g. 20"
            />
          )}
          <Input 
            label="Time to Fall Asleep (minutes)" 
            type="number" 
            value={fallAsleep} 
            onChange={(e) => { setFallAsleep(e.target.value); setValidationError(null); }} 
            min="0" 
            max="60" 
            placeholder="e.g. 15"
            hint="Typically takes about 10-20 minutes" 
          />
        </div>
        {validationError && <p className="input-message input-message-error" role="alert">{validationError}</p>}
        <Button onClick={() => calculate()} magnetic style={{ width: '100%' }}>
          {mode === 'wake' ? 'Calculate Bedtime' : mode === 'sleep' ? 'Calculate Wake Time' : mode === 'nap' ? 'Calculate Nap Alarm' : 'Calculate Wake Time'}
        </Button>
        <button className="btn-demo-fill" onClick={fillExample} style={{ marginTop: 12 }}>Try Example</button>

        <AnimatePresence>
          {result && (
            <motion.div 
              className="result-display"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ duration: 0.4 }}
            >
              <div className="result-highlight-wrap">
                <p className="result-subtitle" style={{ margin: 0, fontWeight: 600 }}>{result.note}</p>
                <Button size="sm" variant="ghost" onClick={copyResultText} style={{ padding: '6px 10px', height: 'auto' }}>
                  {copied ? <Check size={14} style={{ color: 'var(--success)' }} /> : <Copy size={14} />}
                  <span style={{ marginLeft: 6 }}>Copy Schedule</span>
                </Button>
              </div>

              <div className="result-grid" style={{ marginTop: 16 }}>
                {result.options.map((opt, i) => (
                  <div 
                    key={i} 
                    className="result-slot"
                    style={{
                      borderLeft: `4px solid var(--${opt.quality})`,
                      background: 'rgba(255, 255, 255, 0.01)',
                    }}
                  >
                    <div>
                      <div className="label" style={{ fontSize: '0.6875rem', fontWeight: 700 }}>
                        <span className={`quality-dot ${opt.quality}`} />
                        {opt.cycles > 0 ? `${opt.cycles} cycles` : 'nap alert'}
                      </div>
                      <div className="value" style={{ fontSize: '1.25rem', marginTop: 4, letterSpacing: '-0.01em' }}>
                        {formatTime(opt.time)}
                      </div>
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: 8, lineHeight: 1.3 }}>
                      <strong>{opt.cycles > 0 ? `${opt.durationHours} hrs sleep` : `${opt.durationHours * 60} mins`}</strong>
                      <div style={{ color: 'var(--text-muted)', marginTop: 2 }}>{opt.qualityLabel}</div>
                    </div>
                  </div>
                ))}
              </div>

              {result.suggestions.length > 0 && (
                <div style={{ marginTop: 24 }}>
                  <h4 style={{ fontSize: '0.8125rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Sparkles size={14} style={{ color: 'var(--accent)' }} />
                    Sleep Recommendations
                  </h4>
                  <ul className="suggestions-list" style={{ marginTop: 8, borderTop: 'none', paddingTop: 0 }}>
                    {result.suggestions.map((s, i) => (
                      <li key={i} style={{ fontSize: '0.875rem' }}>{s}</li>
                    ))}
                  </ul>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </Card>
          {/* ── SEO Content Sections ── */}
      <div className="seo-content">

        <section className="seo-section">
          <h2>How the Sleep Calculator Works</h2>
          <p>This calculator helps you determine the best times to go to bed or wake up by planning your sleep around 90-minute sleep cycles. Waking up at the end of a sleep cycle leaves you feeling refreshed and alert, whereas waking up mid-cycle can cause grogginess and sleep inertia.</p>
        </section>

        <section className="seo-section">
          <h2>Formula Used</h2>
          <div className="seo-formula" style={{ whiteSpace: 'pre-line' }}>
            {"Wake Time = Sleep Time + (n × 90 minutes) + 15 minutes\nBedtime = Wake Time − (n × 90 minutes) − 15 minutes"}
          </div>
          <dl className="seo-formula-vars">
            <dt>n</dt>
            <dd>— the number of completed sleep cycles (typically 5 or 6 cycles is optimal, equivalent to 7.5 or 9 hours of sleep)</dd>
            <dt>90 minutes</dt>
            <dd>— the average length of a human sleep cycle, spanning light sleep, deep sleep, and REM sleep states</dd>
            <dt>15 minutes</dt>
            <dd>— the average latency period (time it takes to fall asleep) added to the calculation</dd>
          </dl>
        </section>

        <section className="seo-section">
          <h2>Example Calculation</h2>
          <p>If you need to wake up at 7:00 AM, the calculator computes Bedtime options by subtracting sleep cycles. For 6 sleep cycles (9 hours of sleep) plus 15 minutes to fall asleep: 7:00 AM − 9 hours = 10:00 PM, then minus 15 minutes = 9:45 PM. Going to bed at 9:45 PM will help you wake up naturally at 7:00 AM.</p>
        </section>

        <section className="seo-section">
          <h2>Frequently Asked Questions</h2>
          <FAQAccordion items={sleepCalculatorFAQ} />
        </section>

      </div>
    </PageTransition>
  );
}
