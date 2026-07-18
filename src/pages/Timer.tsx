import { useState, useRef, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import PageTransition from '@/components/ui/PageTransition';
import SEO from '@/components/ui/SEO';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { useToast } from '@/context/ToastContext';
import { useToolTracking } from '@/hooks/useScroll';
import '@/styles/components.css';

const PRESETS = [60, 300, 600, 1500, 3600];

function formatSec(s: number) {
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
}

export default function Timer() {
  useToolTracking('timer', 'Timer');
  const { showToast } = useToast();
  const [seconds, setSeconds] = useState(300);
  const [remaining, setRemaining] = useState(300);
  const [running, setRunning] = useState(false);
  const [inputMin, setInputMin] = useState('5');
  const [inputSec, setInputSec] = useState('0');
  const intervalRef = useRef<ReturnType<typeof setInterval>>();

  const tick = useCallback(() => {
    setRemaining((r) => {
      if (r <= 1) {
        setRunning(false);
        showToast("Time's up!", 'success');
        try { new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdH2Onp6hqq6xtLa3uLm6u7y9vr/AwcLDxMXGx8jJysvMzc7P0NHS09TV1tfY2drb3N3e3+Dh4uPk5ebn6Onq6+zt7u/w8fLz9PX29/j5+vv8/f7/').play(); } catch { /* */ }
        return 0;
      }
      return r - 1;
    });
  }, [showToast]);

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
      <SEO title="Timer" description="Countdown timer with presets and audio notification." path="/timer" />
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
    </PageTransition>
  );
}
