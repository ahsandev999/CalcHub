import { useState } from 'react';
import { Link } from 'react-router-dom';
import PageTransition from '@/components/ui/PageTransition';
import SEO from '@/components/ui/SEO';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import ResultDisplay from '@/components/ui/ResultDisplay';
import { useToolTracking } from '@/hooks/useScroll';
import { addHistory } from '@/lib/storage';
import '@/styles/components.css';

type Mode = 'percent-of' | 'what-percent' | 'change' | 'increase';

export default function PercentageCalculator() {
  useToolTracking('percentage-calculator', 'Percentage Calculator');  const [mode, setMode] = useState<Mode>('percent-of');
  const [a, setA] = useState('');
  const [b, setB] = useState('');
  const [result, setResult] = useState<string | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);

  const calculate = () => {
    const na = parseFloat(a);
    const nb = parseFloat(b);
    if (isNaN(na) || isNaN(nb)) { setValidationError('Enter valid numbers.'); return; }

    setValidationError(null);

    let r: string;
    switch (mode) {
      case 'percent-of': r = `${na}% of ${nb} = ${(na / 100 * nb).toFixed(2)}`; break;
      case 'what-percent': r = `${na} is ${nb !== 0 ? ((na / nb) * 100).toFixed(2) : '∞'}% of ${nb}`; break;
      case 'change': r = `Change from ${nb} to ${na} = ${nb !== 0 ? (((na - nb) / nb) * 100).toFixed(2) : '∞'}%`; break;
      case 'increase': r = `${nb} + ${na}% = ${(nb * (1 + na / 100)).toFixed(2)}`; break;
    }
    setResult(r);
    addHistory({ tool: 'Percentage Calculator', toolSlug: 'percentage-calculator', expression: `${a}, ${b}`, result: r });
    
  };

  const labels: Record<Mode, [string, string]> = {
    'percent-of': ['Percentage (%)', 'Of number'],
    'what-percent': ['Number', 'Of total'],
    'change': ['New value', 'Original value'],
    'increase': ['Increase (%)', 'Original number'],
  };

  return (
    <PageTransition className="page-medium">
      <SEO title="Percentage Calculator" description="Calculate percentages, increases, decreases and percentage differences." path="/percentage-calculator" />
      <Link to="/" className="back-link">← Back to tools</Link>
      <div className="tool-header">
        <div className="eyebrow">Math</div>
        <h1 className="page-title">Percentage Calculator</h1>
        <p className="page-lede">Quick percentage calculations for everyday use.</p>
      </div>
      <Card padding="lg">
        <div className="tabs">
          {([['percent-of', '% of'], ['what-percent', 'X is % of'], ['change', '% change'], ['increase', 'increase by %']] as const).map(([id, label]) => (
            <button key={id} className={`tab ${mode === id ? 'active' : ''}`} onClick={() => setMode(id)}>{label}</button>
          ))}
        </div>
        <Input label={labels[mode][0]} type="number" value={a} onChange={(e) => { setA(e.target.value); setValidationError(null); }} error={validationError ? 'Enter a valid number.' : undefined} />
        <Input label={labels[mode][1]} type="number" value={b} onChange={(e) => { setB(e.target.value); setValidationError(null); }} error={validationError ? 'Enter a valid number.' : undefined} />
        {validationError && <p className="input-message input-message-error" role="alert">{validationError}</p>}
        <Button onClick={calculate} magnetic style={{ width: '100%' }}>Calculate</Button>
        <ResultDisplay visible={!!result} highlight={result || undefined} slots={[]} />
      </Card>
    </PageTransition>
  );
}
