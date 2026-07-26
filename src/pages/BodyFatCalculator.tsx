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

function bodyFatCategory(percent: number) {
  if (percent < 6) return 'Essential';
  if (percent < 14) return 'Athletic';
  if (percent < 18) return 'Fitness';
  if (percent < 25) return 'Average';
  return 'Obese';
}

export default function BodyFatCalculator() {
  useToolTracking('body-fat-calculator', 'Body Fat Calculator');
  const [validationError, setValidationError] = useState<string | null>(null);
  const [gender, setGender] = useState<'male' | 'female'>('male');
  const [waist, setWaist] = useState('');
  const [neck, setNeck] = useState('');
  const [height, setHeight] = useState('');
  const [hip, setHip] = useState('');
  const [result, setResult] = useState<{ percent: number; category: string } | null>(null);

  const calculate = () => {
    const waistNum = Number(waist);
    const neckNum = Number(neck);
    const heightNum = Number(height);
    const hipNum = Number(hip || 0);

    if (!waistNum || !neckNum || !heightNum || waistNum <= 0 || neckNum <= 0 || heightNum <= 0) {
      setValidationError('Enter valid waist, neck, and height values.');
      return;
    }

    let bodyFat: number;
    if (gender === 'male') {
      bodyFat = 495 / (1.0324 - 0.19077 * Math.log10(waistNum - neckNum) + 0.15456 * Math.log10(heightNum)) - 450;
    } else {
      if (!hipNum || hipNum <= 0) {
        setValidationError('Hip circumference is required for female body fat calculation.');
        return;
      }
      bodyFat = 495 / (1.29579 - 0.35004 * Math.log10(waistNum + hipNum - neckNum) + 0.221 * Math.log10(heightNum)) - 450;
    }

    setValidationError(null);
    const percent = Math.max(0, Number(bodyFat.toFixed(1)));
    const category = bodyFatCategory(percent);
    const nextResult = { percent, category };
    setResult(nextResult);
    addHistory({
      tool: 'Body Fat Calculator',
      toolSlug: 'body-fat-calculator',
      expression: `${gender}, waist=${waistNum}, neck=${neckNum}, height=${heightNum}`,
      result: `${percent}%`,
    });
  };

  return (
    <PageTransition className="page-medium">
      <SEO title="Body Fat Calculator" description="Estimate body fat percentage using the US Navy method." path="/body-fat-calculator" />
      <Link to="/" className="back-link">← Back to tools</Link>
      <div className="tool-header">
        <div className="eyebrow">Fitness & Health</div>
        <h1 className="page-title">Body Fat Calculator</h1>
        <p className="page-lede">Estimate body fat percentage using the US Navy method with waist, neck, and height inputs.</p>
      </div>
      <Card padding="lg">
        <div className="tabs">
          <button className={`tab ${gender === 'male' ? 'active' : ''}`} onClick={() => setGender('male')}>Male</button>
          <button className={`tab ${gender === 'female' ? 'active' : ''}`} onClick={() => setGender('female')}>Female</button>
        </div>
        <Input label="Waist (cm)" type="number" value={waist} onChange={(e) => { setWaist(e.target.value); setValidationError(null); }} min="0" />
        <Input label="Neck (cm)" type="number" value={neck} onChange={(e) => { setNeck(e.target.value); setValidationError(null); }} min="0" />
        <Input label="Height (cm)" type="number" value={height} onChange={(e) => { setHeight(e.target.value); setValidationError(null); }} min="0" />
        {gender === 'female' && (
          <Input label="Hip (cm)" type="number" value={hip} onChange={(e) => { setHip(e.target.value); setValidationError(null); }} min="0" />
        )}
        {validationError && <p className="input-message input-message-error" role="alert">{validationError}</p>}
        <Button onClick={calculate} magnetic style={{ width: '100%' }}>Calculate Body Fat</Button>
        <ResultDisplay
          visible={!!result}
          highlight={result ? `${result.percent}%` : undefined}
          subtitle={result ? result.category : undefined}
          slots={result ? [{ label: 'Body Fat Category', value: result.category }] : []}
        />
      </Card>
    </PageTransition>
  );
}
