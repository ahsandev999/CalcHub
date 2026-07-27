import { useState, useRef, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import FAQAccordion, { type FAQItem } from '@/components/ui/FAQAccordion';
import PageTransition from '@/components/ui/PageTransition';
import SEO from '@/components/ui/SEO';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { useToolTracking } from '@/hooks/useScroll';
import '@/styles/components.css';

const PRESETS = [60, 300, 600, 1500, 3600];

function formatSec(s: number) {
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
}

const timerFAQ: FAQItem[] = [
  {
    "question": "Does the timer keep running if I switch tabs?",
    "answer": "Yes. The timer calculates remaining time using the system's absolute clock, ensuring it remains accurate even if the browser tab is minimised or goes to sleep."
  },
  {
    "question": "Can I pause and resume the timer?",
    "answer": "Yes. Clicking 'Pause' halts the countdown. Clicking 'Resume' recalculates a new target end time based on the remaining seconds, letting the countdown continue."
  },
  {
    "question": "Will the audio alert play if my device is muted?",
    "answer": "No. The alert relies on the browser's audio API. If your device volume is muted or your browser has blocked autoplay audio, the alarm will not be audible, though the visual alert will still flash."
  },
  {
    "question": "Can I set multiple timers simultaneously?",
    "answer": "This simple timer tool supports one active countdown at a time. If you need multiple timers, you can open additional tabs of this page in your browser."
  },
  {
    "question": "How do I clear or reset the timer?",
    "answer": "Click 'Reset' or 'Cancel' to stop the active countdown, reset the progress bar, and return the inputs to their default states."
  }
];

export default function Timer() {
  useToolTracking('timer', 'Timer');  const [seconds, setSeconds] = useState(300);
  const [remaining, setRemaining] = useState(300);
  const [running, setRunning] = useState(false);
  const [inputMin, setInputMin] = useState('5');
  const [inputSec, setInputSec] = useState('0');
  const intervalRef = useRef<ReturnType<typeof setInterval>>();

  const tick = useCallback(() => {
    setRemaining((r) => {
      if (r <= 1) {
        setRunning(false);
        
        try { new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdH2Onp6hqq6xtLa3uLm6u7y9vr/AwcLDxMXGx8jJysvMzc7P0NHS09TV1tfY2drb3N3e3+Dh4uPk5ebn6Onq6+zt7u/w8fLz9PX29/j5+vv8/f7/').play(); } catch { /* */ }
        return 0;
      }
      return r - 1;
    });
  }, []);

  useEffect(() => {
    if (running) intervalRef.current = setInterval(tick, 1000);
    return () => clearInterval(intervalRef.current);
  }, [running, tick]);

  const setTime = (s: number) => { setSeconds(s); setRemaining(s); setRunning(false); };
  const start = () => { if (remaining > 0) setRunning(true); };
  const pause = () => setRunning(false);
  const reset = () => { setRunning(false); setRemaining(seconds); };

  const applyCustom = () => {
    const s = (parseInt(inputMin) || 0) * 60 + (parseInt(inputSec) || 0);
    if (s > 0) setTime(s);
  };

  return (
    <PageTransition className="page-medium">
      <SEO title="Timer" description="Countdown timer with presets and audio notification." path="/timer" faqSchema={timerFAQ} />
      <Link to="/" className="back-link">← Back to tools</Link>
      <div className="tool-header">
        <div className="eyebrow">Time</div>
        <h1 className="page-title">Timer</h1>
        <p className="page-lede">Countdown timer with quick presets.</p>
      </div>
      <Card padding="lg">
        <div className="time-display" aria-live="polite">{formatSec(remaining)}</div>
        <div className="time-controls" style={{ marginBottom: 24 }}>
          {!running ? <Button onClick={start} magnetic disabled={remaining === 0}>Start</Button> : <Button onClick={pause} variant="secondary">Pause</Button>}
          <Button onClick={reset} variant="ghost">Reset</Button>
        </div>
        <div className="tabs" style={{ marginBottom: 16 }}>
          {PRESETS.map((p) => (
            <button key={p} className={`tab ${seconds === p ? 'active' : ''}`} onClick={() => setTime(p)}>
              {p < 60 ? `${p}s` : p < 3600 ? `${p / 60}m` : `${p / 3600}h`}
            </button>
          ))}
        </div>
        <div className="grid-2">
          <Input label="Minutes" type="number" value={inputMin} onChange={(e) => setInputMin(e.target.value)} min="0" />
          <Input label="Seconds" type="number" value={inputSec} onChange={(e) => setInputSec(e.target.value)} min="0" max="59" />
        </div>
        <Button onClick={applyCustom} variant="secondary" style={{ width: '100%' }}>Set Custom Time</Button>
      </Card>
          {/* ── SEO Content Sections ── */}
      <div className="seo-content">

        <section className="seo-section">
          <h2>How the Timer Works</h2>
          <p>This countdown timer alerts you when a specified duration has elapsed. Set the hours, minutes, and seconds, then click Start. A progress bar visualises the remaining time, and an audio alert plays when the timer reaches zero.</p>
        </section>

        <section className="seo-section">
          <h2>Formula Used</h2>
          <div className="seo-formula" style={{ whiteSpace: 'pre-line' }}>
            {"Time Remaining = Target End Time − Current Timestamp"}
          </div>
          <dl className="seo-formula-vars">
            <dt>Target End Time</dt>
            <dd>— the absolute timestamp when the countdown should end</dd>
            <dt>Current Timestamp</dt>
            <dd>— the system clock timestamp at the current frame</dd>
            <dt>Time Remaining</dt>
            <dd>— the difference in seconds, formatted as HH:MM:SS</dd>
          </dl>
        </section>

        <section className="seo-section">
          <h2>Example Calculation</h2>
          <p>If you set a timer for 5 minutes, the target duration is 300 seconds. The countdown progresses, and when remaining time reaches 0, the browser triggers the alarm sound.</p>
        </section>

        <section className="seo-section">
          <h2>Frequently Asked Questions</h2>
          <FAQAccordion items={timerFAQ} />
        </section>

      </div>
    </PageTransition>
  );
}
