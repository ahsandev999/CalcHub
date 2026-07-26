import { useState, useRef, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
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

export default function Pomodoro() {
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
      <SEO title="Pomodoro Timer" description="Focus timer with work/break cycles using the Pomodoro Technique." path="/pomodoro" />
      <Link to="/" className="back-link">← Back to tools</Link>
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
      </Card>
    </PageTransition>
  );
}
