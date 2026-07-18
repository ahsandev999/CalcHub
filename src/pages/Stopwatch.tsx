import { useState, useRef, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import PageTransition from '@/components/ui/PageTransition';
import SEO from '@/components/ui/SEO';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { useToolTracking } from '@/hooks/useScroll';
import '@/styles/components.css';

function formatMs(ms: number) {
  const h = Math.floor(ms / 3600000);
  const m = Math.floor((ms % 3600000) / 60000);
  const s = Math.floor((ms % 60000) / 1000);
  const cs = Math.floor((ms % 1000) / 10);
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}.${cs.toString().padStart(2, '0')}`;
}

export default function Stopwatch() {
  useToolTracking('stopwatch', 'Stopwatch');
  const [elapsed, setElapsed] = useState(0);
  const [running, setRunning] = useState(false);
  const [laps, setLaps] = useState<number[]>([]);
  const startRef = useRef(0);
  const offsetRef = useRef(0);
  const frameRef = useRef(0);

  const tick = useCallback(() => {
    setElapsed(Date.now() - startRef.current + offsetRef.current);
    frameRef.current = requestAnimationFrame(tick);
  }, []);

  useEffect(() => {
    if (running) {
      startRef.current = Date.now();
      frameRef.current = requestAnimationFrame(tick);
    }
    return () => cancelAnimationFrame(frameRef.current);
  }, [running, tick]);

  const start = () => setRunning(true);
  const pause = () => { setRunning(false); offsetRef.current = elapsed; cancelAnimationFrame(frameRef.current); };
  const reset = () => { setRunning(false); setElapsed(0); offsetRef.current = 0; setLaps([]); cancelAnimationFrame(frameRef.current); };
  const lap = () => setLaps((l) => [elapsed, ...l]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.code === 'Space') { e.preventDefault(); running ? pause() : start(); }
      if (e.code === 'KeyL' && running) lap();
      if (e.code === 'KeyR') reset();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [running]);

  return (
    <PageTransition className="page-medium">
      <SEO title="Stopwatch" description="Precision stopwatch with lap times and keyboard shortcuts." path="/stopwatch" />
      <Link to="/" className="back-link">← Back to tools</Link>
      <div className="tool-header">
        <div className="eyebrow">Time</div>
        <h1 className="page-title">Stopwatch</h1>
        <p className="page-lede">Precision timing with lap support. Space to start/pause, L for lap, R to reset.</p>
      </div>
      <Card padding="lg">
        <div className="time-display" aria-live="polite">{formatMs(elapsed)}</div>
        <div className="time-controls">
          {!running ? <Button onClick={start} magnetic>Start</Button> : <Button onClick={pause} variant="secondary">Pause</Button>}
          <Button onClick={lap} variant="secondary" disabled={!running}>Lap</Button>
          <Button onClick={reset} variant="ghost">Reset</Button>
        </div>
        {laps.length > 0 && (
          <div className="lap-list">
            {laps.map((l, i) => (
              <div key={i} className="lap-item">
                <span>Lap {laps.length - i}</span>
                <span>{formatMs(l)}</span>
              </div>
            ))}
          </div>
        )}
      </Card>
    </PageTransition>
  );
}
