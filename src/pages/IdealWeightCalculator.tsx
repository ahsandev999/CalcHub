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

export default function IdealWeightCalculator() {
  useToolTracking('ideal-weight-calculator', 'Ideal Weight Calculator');
  const [gender, setGender] = useState<'male' | 'female'>('male');
  const [height, setHeight] = useState('');
  const [result, setResult] = useState<{ range: string; average: string } | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);

  const calculate = () => {
    const heightIn = Number(height);
    if (!heightIn || heightIn <= 0) {
      setValidationError('Enter a valid height.');
      return;
    }

    setValidationError(null);

    const heightCm = heightIn;
    const devineMale = 50 + 2.3 * (heightCm - 60);
    const devineFemale = 45.5 + 2.3 * (heightCm - 60);
    const robinsonMale = 52 + 1.9 * (heightCm - 60);
    const robinsonFemale = 49 + 1.7 * (heightCm - 60);
    const millerMale = 56.2 + 1.41 * (heightCm - 60);
    const millerFemale = 53.1 + 1.36 * (heightCm - 60);

    const methods = gender === 'male'
      ? [devineMale, robinsonMale, millerMale]
      : [devineFemale, robinsonFemale, millerFemale];

    const min = Math.min(...methods);
    const max = Math.max(...methods);
    const avg = (min + max) / 2;

    const nextResult = {
      range: `${min.toFixed(1)} kg – ${max.toFixed(1)} kg`,
      average: `${avg.toFixed(1)} kg`,
    };

    setResult(nextResult);
    addHistory({
      tool: 'Ideal Weight Calculator',
      toolSlug: 'ideal-weight-calculator',
      expression: `${gender}, ${heightCm} cm`,
      result: nextResult.average,
    });
    
  };

  return (
    <PageTransition className="page-medium">
      <SEO title="Ideal Weight Calculator" description="Estimate an ideal weight range using common medical formulas." path="/ideal-weight-calculator" />
      <Link to="/" className="back-link">← Back to tools</Link>
      <div className="tool-header">
        <div className="eyebrow">Fitness & Health</div>
        <h1 className="page-title">Ideal Weight Calculator</h1>
        <p className="page-lede">Estimate a healthy weight range using the Devine, Robinson, and Miller formulas.</p>
      </div>
      <Card padding="lg">
        <div className="tabs">
          <button className={`tab ${gender === 'male' ? 'active' : ''}`} onClick={() => setGender('male')}>Male</button>
          <button className={`tab ${gender === 'female' ? 'active' : ''}`} onClick={() => setGender('female')}>Female</button>
        </div>
        <Input label="Height (cm)" type="number" value={height} onChange={(e) => { setHeight(e.target.value); setValidationError(null); }} min="1" error={validationError ? 'Enter a valid height.' : undefined} />
        {validationError && <p className="input-message input-message-error" role="alert">{validationError}</p>}
        <Button onClick={calculate} magnetic style={{ width: '100%' }}>Calculate Ideal Weight</Button>
        <ResultDisplay
          visible={!!result}
          highlight={result ? result.average : undefined}
          subtitle="Average ideal weight"
          slots={result ? [
            { label: 'Ideal Weight Range', value: result.range },
            { label: 'Average', value: result.average },
          ] : []}
        />
      </Card>
    </PageTransition>
  );
}
