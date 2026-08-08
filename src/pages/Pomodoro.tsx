import RelatedTools from '../components/ui/RelatedTools';
import Breadcrumbs from '@/components/ui/Breadcrumbs';
import { getBreadcrumbsForTool } from '@/lib/tools';
import { useState, useRef, useEffect, useCallback } from 'react';

import FAQAccordion, { type FAQItem } from '@/components/ui/FAQAccordion';
import PageTransition from '@/components/ui/PageTransition';
import SEO from '@/components/ui/SEO';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { useToolTracking } from '@/hooks/useScroll';
import '@/styles/components.css';

const WORK = 25 * 60;
const SHORT = 5 * 60;
const LONG = 15 * 60;

type Phase = 'work' | 'short' | 'long';

function formatSec(s: number) {
  return `${Math.floor(s / 60).toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`;
}

const pomodoroFAQ: FAQItem[] = [
  {
    "question": "What is the Pomodoro Technique?",
    "answer": "Developed by Francesco Cirillo in the late 1980s, the technique uses a timer to break work down into intervals, traditionally 25 minutes, separated by short breaks. It is designed to reduce the impact of internal and external distractions."
  },
  {
    "question": "Why is it called Pomodoro?",
    "answer": "'Pomodoro' is the Italian word for tomato. The creator named the technique after the tomato-shaped kitchen timer he used to track his work sessions."
  },
  {
    "question": "Can I customise the session lengths?",
    "answer": "The traditional Pomodoro uses 25-minute work and 5-minute break intervals. However, you can adjust these durations in the settings to suit your personal concentration span (e.g., 50-minute work, 10-minute break)."
  },
  {
    "question": "What should I do during the breaks?",
    "answer": "Step away from your screen. Walk around, stretch, get a glass of water, or rest your eyes. Avoid checking social media or emails, as this does not give your brain a true break."
  },
  {
    "question": "How many Pomodoros should I do in a day?",
    "answer": "A typical productive workday contains about 6 to 8 complete Pomodoro cycles (focus + break). Don't force yourself to do more, as mental fatigue will decrease your overall work quality."
  }
];

export default function Pomodoro() {
  const breadcrumbs = getBreadcrumbsForTool('pomodoro');
  useToolTracking('pomodoro', 'Pomodoro Timer');  const [phase, setPhase] = useState<Phase>('work');
  const [remaining, setRemaining] = useState(WORK);
  const [running, setRunning] = useState(false);
  const [sessions, setSessions] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval>>();

  const durations: Record<Phase, number> = { work: WORK, short: SHORT, long: LONG };
  const total = durations[phase];
  const progress = 1 - remaining / total;
  const circumference = 2 * Math.PI * 90;

  const nextPhase = useCallback(() => {
    if (phase === 'work') {
      const newSessions = sessions + 1;
      setSessions(newSessions);
      if (newSessions % 4 === 0) {
        setPhase('long');
        setRemaining(LONG);
        
      } else {
        setPhase('short');
        setRemaining(SHORT);
        
      }
    } else {
      setPhase('work');
      setRemaining(WORK);
      
    }
    setRunning(false);
  }, [phase, sessions]);

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => {
        setRemaining((r) => {
          if (r <= 1) { nextPhase(); return 0; }
          return r - 1;
        });
      }, 1000);
    }
    return () => clearInterval(intervalRef.current);
  }, [running, nextPhase]);

  const switchPhase = (p: Phase) => {
    setPhase(p);
    setRemaining(durations[p]);
    setRunning(false);
  };

  return (
    <PageTransition className="page-medium">
      <SEO
        title="Free Pomodoro Timer" description="A free online Pomodoro timer to help structure your focus sessions and break cycles." path="/pomodoro" faqSchema={pomodoroFAQ} 
        breadcrumbSchema={breadcrumbs?.schema}
      />
      <Breadcrumbs items={breadcrumbs?.visual || []} />
      <div className="tool-header">
        <div className="eyebrow">Time</div>
        <h1 className="page-title">Pomodoro Timer</h1>
        <p className="page-lede">Stay focused with structured work and break intervals.</p>
      </div>
      <Card padding="lg">
        <div className="pomodoro-phase">{phase === 'work' ? '🎯 Focus' : phase === 'short' ? '☕ Short Break' : '🌴 Long Break'}</div>
        <div className="pomodoro-ring">
          <svg viewBox="0 0 200 200">
            <circle className="ring-bg" cx="100" cy="100" r="90" />
            <circle
              className="ring-fg"
              cx="100" cy="100" r="90"
              strokeDasharray={circumference}
              strokeDashoffset={circumference * (1 - progress)}
            />
          </svg>
          <div className="pomodoro-time">{formatSec(remaining)}</div>
        </div>
        <p style={{ textAlign: 'center', color: 'var(--text-muted)', marginBottom: 16 }}>Sessions completed: {sessions}</p>
        <div className="time-controls">
          {!running ? <Button onClick={() => setRunning(true)} magnetic>Start</Button> : <Button onClick={() => setRunning(false)} variant="secondary">Pause</Button>}
          <Button onClick={() => { setRunning(false); setRemaining(durations[phase]); }} variant="ghost">Reset</Button>
        </div>
        <div className="tabs" style={{ marginTop: 24 }}>
          {(['work', 'short', 'long'] as Phase[]).map((p) => (
            <button key={p} className={`tab ${phase === p ? 'active' : ''}`} onClick={() => switchPhase(p)}>
              {p === 'work' ? 'Work' : p === 'short' ? 'Short' : 'Long'}
            </button>
          ))}
        </div>
        <button
          className="btn-demo-fill"
          onClick={() => {
            setSessions(3);
            setPhase('short');
            setRemaining(SHORT - 10);
            setRunning(false);
          }}
          style={{ marginTop: 16 }}
        >
          Try Example
        </button>
      </Card>

      <RelatedTools currentSlug="pomodoro" />
          {/* ── SEO Content Sections ── */}
      <div className="seo-content">

        <section className="seo-section">
          <h2>How the Pomodoro Timer Works</h2>
          <p>The Pomodoro Technique is a time-management method that breaks work into intervals, traditionally 25 minutes in length, separated by short breaks. This timer automates these intervals, cycling through work sessions and breaks to sustain mental focus.</p>
        </section>

        <section className="seo-section">
          <h2>Formula Used</h2>
          <div className="seo-formula" style={{ whiteSpace: 'pre-line' }}>
            {"Session Cycle: Focus (25m) → Short Break (5m) → Focus (25m) → ... → Long Break (15m) after 4 sessions"}
          </div>
          <dl className="seo-formula-vars">
            <dt>Focus Session</dt>
            <dd>— 25 minutes of uninterrupted work on a single task</dd>
            <dt>Short Break</dt>
            <dd>— 5-minute break to rest, stretch, or hydrate</dd>
            <dt>Long Break</dt>
            <dd>— 15 to 30-minute break after completing 4 consecutive focus sessions to recharge</dd>
          </dl>
        </section>

        <section className="seo-section">
          <h2>Example Calculation</h2>
          <p>Click Start to begin a 25-minute focus countdown. When the timer hits 0:00, an alarm plays, and the timer automatically prompts a 5-minute short break before starting the next focus session.</p>
        </section>

        <section className="seo-section">
          <h2>Frequently Asked Questions</h2>
          <FAQAccordion items={pomodoroFAQ} />
        </section>

      </div>
    </PageTransition>
  );
}
