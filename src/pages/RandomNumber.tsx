import { useState } from 'react';
import { Link } from 'react-router-dom';
import PageTransition from '@/components/ui/PageTransition';
import SEO from '@/components/ui/SEO';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { useToast } from '@/context/ToastContext';
import { useToolTracking } from '@/hooks/useScroll';
import { addHistory } from '@/lib/storage';
import '@/styles/components.css';

export default function RandomNumber() {
  useToolTracking('random-number', 'Random Number');
  const { showToast } = useToast();
  const [min, setMin] = useState('1');
  const [max, setMax] = useState('100');
  const [count, setCount] = useState('1');
  const [results, setResults] = useState<number[]>([]);

  const generate = () => {
    const lo = parseInt(min);
    const hi = parseInt(max);
    const n = parseInt(count) || 1;
    if (isNaN(lo) || isNaN(hi) || lo > hi) { showToast('Invalid range', 'error'); return; }

    const nums: number[] = [];
    for (let i = 0; i < Math.min(n, 100); i++) {
      nums.push(Math.floor(Math.random() * (hi - lo + 1)) + lo);
    }
    setResults(nums);
    addHistory({ tool: 'Random Number', toolSlug: 'random-number', expression: `${lo}–${hi}`, result: nums.join(', ') });
    showToast('Generated!', 'success');
  };

  return (
    <PageTransition className="page-medium">
      <SEO title="Random Number Generator" description="Generate random numbers within any range." path="/random-number" />
      <Link to="/" className="back-link">← Back to tools</Link>
      <div className="tool-header">
        <div className="eyebrow">Utility</div>
        <h1 className="page-title">Random Number</h1>
        <p className="page-lede">Generate random numbers within any range.</p>
      </div>
      <Card padding="lg">
        <div className="grid-2">
          <Input label="Minimum" type="number" value={min} onChange={(e) => setMin(e.target.value)} />
          <Input label="Maximum" type="number" value={max} onChange={(e) => setMax(e.target.value)} />
        </div>
        <Input label="How many numbers" type="number" value={count} onChange={(e) => setCount(e.target.value)} min="1" max="100" />
        <Button onClick={generate} magnetic style={{ width: '100%' }}>Generate</Button>
        {results.length > 0 && (
          <div className="result-display">
            <div className="result-highlight">{results.join(', ')}</div>
          </div>
        )}
      </Card>
    </PageTransition>
  );
}
