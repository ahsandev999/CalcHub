import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import PageTransition from '@/components/ui/PageTransition';
import SEO from '@/components/ui/SEO';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { useToast } from '@/context/ToastContext';
import { useToolTracking } from '@/hooks/useScroll';
import { calculateSleep, formatTime, type SleepMode } from '@/lib/calculators/sleep';
import { addHistory } from '@/lib/storage';
import { Moon, Sun, Clock, Coffee, Sparkles, Check, Copy, ArrowLeft } from 'lucide-react';
import '@/styles/components.css';

export default function SleepCalculator() {
  useToolTracking('sleep-calculator', 'Sleep Calculator');
  const { showToast } = useToast();

  const [mode, setMode] = useState<SleepMode>('wake');
  const [wakeTime, setWakeTime] = useState('07:00');
  const [fallAsleep, setFallAsleep] = useState('15');
  const [napDuration, setNapDuration] = useState('20');
  const [result, setResult] = useState<ReturnType<typeof calculateSleep> | null>(null);
  const [copied, setCopied] = useState(false);

  const calculate = () => {
    const r = calculateSleep(
      mode,
      mode !== 'sleep' ? wakeTime : undefined,
      parseInt(fallAsleep) || 15,
      parseInt(napDuration) || 20
    );
    setResult(r);
    
    addHistory({
      tool: 'Sleep Calculator',
      toolSlug: 'sleep-calculator',
      expression: `${mode === 'wake' ? 'Wake at' : mode === 'sleep' ? 'Sleep now' : mode === 'bedtime' ? 'Bedtime' : 'Nap'} mode`,
      result: r.options[0] ? formatTime(r.options[0].time) : '',
    });
    
    showToast('Sleep times calculated!', 'success');
  };

  const copyResultText = async () => {
    if (!result) return;
    const text = `Sleep calculation (${result.mode} mode):\n${result.note}\n` +
      result.options.map(opt => `- ${opt.cycles > 0 ? `${opt.cycles} cycles (${opt.durationHours}h)` : `${opt.durationHours * 60}m nap`}: ${formatTime(opt.time)} (${opt.qualityLabel})`).join('\n');
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      showToast('Calculated schedule copied!', 'success');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      showToast('Failed to copy', 'error');
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
      <SEO 
        title="Sleep Calculator" 
        description="Calculate optimal bedtimes, wake times, and nap durations based on 90-minute sleep cycles." 
        path="/sleep-calculator" 
      />
      
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
                onClick={() => { setMode(m.id); setResult(null); }}
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
              onChange={(e) => setWakeTime(e.target.value)} 
            />
          )}
          {mode === 'nap' && (
            <Input 
              label="Nap Duration (minutes)" 
              type="number" 
              value={napDuration} 
              onChange={(e) => setNapDuration(e.target.value)} 
              min="5" 
              max="120" 
            />
          )}
          <Input 
            label="Time to Fall Asleep (minutes)" 
            type="number" 
            value={fallAsleep} 
            onChange={(e) => setFallAsleep(e.target.value)} 
            min="0" 
            max="60" 
            hint="Typically takes about 10-20 minutes" 
          />
        </div>

        <Button onClick={calculate} magnetic style={{ width: '100%' }}>
          {mode === 'wake' ? 'Calculate Bedtime' : mode === 'sleep' ? 'Calculate Wake Time' : mode === 'nap' ? 'Calculate Nap Alarm' : 'Calculate Wake Time'}
        </Button>

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
    </PageTransition>
  );
}
