import { useState } from 'react';
import { Link } from 'react-router-dom';
import PageTransition from '@/components/ui/PageTransition';
import SEO from '@/components/ui/SEO';
import Card from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import { useToast } from '@/context/ToastContext';
import { useToolTracking } from '@/hooks/useScroll';
import '@/styles/components.css';

type Base = 2 | 8 | 10 | 16;

function convertBase(value: string, from: Base, to: Base): string {
  const decimal = parseInt(value, from);
  if (isNaN(decimal)) throw new Error('Invalid number for selected base');
  if (decimal < 0) throw new Error('Only non-negative integers supported');
  return decimal.toString(to).toUpperCase();
}

const BASE_LABELS: Record<Base, string> = { 2: 'Binary', 8: 'Octal', 10: 'Decimal', 16: 'Hexadecimal' };

export default function NumberBaseConverter() {
  useToolTracking('number-base-converter', 'Base Converter');
  const { showToast } = useToast();
  const [fromBase, setFromBase] = useState<Base>(10);
  const [input, setInput] = useState('255');
  const [results, setResults] = useState<Record<Base, string> | null>(null);

  const convert = () => {
    try {
      const r: Record<Base, string> = { 2: '', 8: '', 10: '', 16: '' };
      const bases: Base[] = [2, 8, 10, 16];
      for (const b of bases) {
        r[b] = b === fromBase ? input.toUpperCase() : convertBase(input, fromBase, b);
      }
      setResults(r);
      showToast('Converted!', 'success');
    } catch (e) {
      showToast((e as Error).message, 'error');
    }
  };

  return (
    <PageTransition className="page-medium">
      <SEO title="Number Base Converter" description="Convert between decimal, binary, octal and hexadecimal." path="/number-base-converter" />
      <Link to="/" className="back-link">← Back to tools</Link>
      <div className="tool-header">
        <div className="eyebrow">Converter</div>
        <h1 className="page-title">Base Converter</h1>
        <p className="page-lede">Convert numbers between binary, octal, decimal, and hex.</p>
      </div>
      <Card padding="lg">
        <label className="field-label">Input Base</label>
        <div className="tabs" style={{ marginBottom: 16 }}>
          {([2, 8, 10, 16] as Base[]).map((b) => (
            <button key={b} className={`tab ${fromBase === b ? 'active' : ''}`} onClick={() => setFromBase(b)}>{BASE_LABELS[b]}</button>
          ))}
        </div>
        <Input label="Number" value={input} onChange={(e) => setInput(e.target.value)} />
        <button className="btn btn-primary btn-md" style={{ width: '100%', marginTop: 8 }} onClick={convert}>Convert</button>
        {results && (
          <div className="result-grid" style={{ marginTop: 24 }}>
            {([2, 8, 10, 16] as Base[]).map((b) => (
              <div key={b} className="result-slot">
                <div className="label">{BASE_LABELS[b]}</div>
                <div className="value">{results[b]}</div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </PageTransition>
  );
}
