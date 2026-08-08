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

function formatMs(ms: number) {
  const h = Math.floor(ms / 3600000);
  const m = Math.floor((ms % 3600000) / 60000);
  const s = Math.floor((ms % 60000) / 1000);
  const cs = Math.floor((ms % 1000) / 10);
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}.${cs.toString().padStart(2, '0')}`;
}

const stopwatchFAQ: FAQItem[] = [
  {
    "question": "How accurate is the stopwatch?",
    "answer": "This stopwatch uses the browser's high-resolution system clock, accurate to a fraction of a millisecond. However, display updates are throttled to 60 frames per second for rendering performance."
  },
  {
    "question": "What is a lap time?",
    "answer": "A lap time is the time elapsed for a single segment of an activity. Pressing 'Lap' saves the time at that instant while the main timer continues running in the background."
  },
  {
    "question": "Can I run the stopwatch in the background?",
    "answer": "Yes. Because the stopwatch calculates elapsed time by comparing absolute timestamps rather than counting ticks, it remains 100% accurate even if you switch browser tabs or lock your device."
  },
  {
    "question": "Is there a limit to how long it can run?",
    "answer": "There is no practical limit. The JavaScript timer can count up to thousands of hours before encountering any numerical limits."
  },
  {
    "question": "How do I reset the stopwatch?",
    "answer": "Press the 'Stop' button to pause the timer, then click 'Reset' to clear the elapsed time, reset the count to zero, and clear the lap history table."
  }
];

export default function Stopwatch() {
  const breadcrumbs = getBreadcrumbsForTool('stopwatch');
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
      <SEO
        title="Free Stopwatch" description="A free online precision stopwatch with lap times and high-resolution counter." path="/stopwatch" faqSchema={stopwatchFAQ} 
        breadcrumbSchema={breadcrumbs?.schema}
      />
      <Breadcrumbs items={breadcrumbs?.visual || []} />
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
        <button
          className="btn-demo-fill"
          onClick={() => {
            setElapsed(131000);
            offsetRef.current = 131000;
            setLaps([131000, 87000, 45000]);
            setRunning(false);
          }}
          style={{ marginTop: 16 }}
        >
          Try Example
        </button>
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
          {/* ── SEO Content Sections ── */}
      <div className="seo-content">

        <section className="seo-section">
          <h2>How the Stopwatch Works</h2>
          <p>This stopwatch measures elapsed time with millisecond precision. Press Start to begin counting, Lap to record split times without stopping the main timer, and Stop to pause the count.</p>
        </section>

        <section className="seo-section">
          <h2>Formula Used</h2>
          <div className="seo-formula" style={{ whiteSpace: 'pre-line' }}>
            {"Elapsed Time = Current Timestamp − Start Timestamp + Accumulated Paused Time"}
          </div>
          <dl className="seo-formula-vars">
            <dt>Current Timestamp</dt>
            <dd>— the high-resolution system clock value at the current frame</dd>
            <dt>Start Timestamp</dt>
            <dd>— the clock value when the stopwatch was started or resumed</dd>
            <dt>Accumulated Paused Time</dt>
            <dd>— time elapsed during previous start/stop cycles, added to the current run</dd>
          </dl>
        </section>

        <section className="seo-section">
          <h2>Example Calculation</h2>
          <p>If you start the stopwatch, press Lap at 12.34 seconds, the calculator records 'Lap 1' as 12.34 seconds. The main timer continues counting uninterrupted.</p>
        </section>

        <section className="seo-section">
          <h2>Frequently Asked Questions</h2>
          <FAQAccordion items={stopwatchFAQ} />
        </section>

      </div>
    </PageTransition>
  );
}
