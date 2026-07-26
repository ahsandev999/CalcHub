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

function getBMICategory(bmi: number): { label: string; color: string } {
  if (bmi < 18.5) return { label: 'Underweight', color: 'var(--warning)' };
  if (bmi < 25) return { label: 'Normal weight', color: 'var(--success)' };
  if (bmi < 30) return { label: 'Overweight', color: 'var(--warning)' };
  return { label: 'Obese', color: 'var(--error)' };
}

export default function BMICalculator() {
  useToolTracking('bmi-calculator', 'BMI Calculator');  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [unit, setUnit] = useState<'metric' | 'imperial'>('metric');
  const [bmi, setBmi] = useState<number | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);

  const calculate = () => {
    const w = parseFloat(weight);
    const h = parseFloat(height);
    if (!w || !h || w <= 0 || h <= 0) { setValidationError('Enter valid weight and height.'); return; }

    setValidationError(null);

    let bmiVal: number;
    if (unit === 'metric') {
      bmiVal = w / ((h / 100) ** 2);
    } else {
      bmiVal = (w / (h * h)) * 703;
    }
    bmiVal = Math.round(bmiVal * 10) / 10;
    setBmi(bmiVal);
    addHistory({ tool: 'BMI Calculator', toolSlug: 'bmi-calculator', expression: `${w}${unit === 'metric' ? 'kg' : 'lbs'}, ${h}${unit === 'metric' ? 'cm' : 'in'}`, result: String(bmiVal) });
    
  };

  const cat = bmi ? getBMICategory(bmi) : null;
  const healthyRange = unit === 'metric'
    ? { min: Math.round(18.5 * (parseFloat(height) / 100) ** 2 * 10) / 10, max: Math.round(24.9 * (parseFloat(height) / 100) ** 2 * 10) / 10 }
    : null;

  return (
    <PageTransition className="page-medium">
      <SEO title="BMI Calculator" description="Calculate your Body Mass Index with health category and weight recommendations." path="/bmi-calculator" />
      <Link to="/" className="back-link">← Back to tools</Link>
      <div className="tool-header">
        <div className="eyebrow">Health</div>
        <h1 className="page-title">BMI Calculator</h1>
        <p className="page-lede">Calculate your Body Mass Index and understand your health category.</p>
      </div>
      <Card padding="lg">
        <div className="tabs">
          <button className={`tab ${unit === 'metric' ? 'active' : ''}`} onClick={() => setUnit('metric')}>Metric (kg/cm)</button>
          <button className={`tab ${unit === 'imperial' ? 'active' : ''}`} onClick={() => setUnit('imperial')}>Imperial (lbs/in)</button>
        </div>
        <Input label={`Weight (${unit === 'metric' ? 'kg' : 'lbs'})`} type="number" value={weight} onChange={(e) => { setWeight(e.target.value); setValidationError(null); }} min="1" error={validationError ? 'Enter a valid weight.' : undefined} />
        <Input label={`Height (${unit === 'metric' ? 'cm' : 'inches'})`} type="number" value={height} onChange={(e) => { setHeight(e.target.value); setValidationError(null); }} min="1" error={validationError ? 'Enter a valid height.' : undefined} />
        {validationError && <p className="input-message input-message-error" role="alert">{validationError}</p>}
        <Button onClick={calculate} magnetic style={{ width: '100%' }}>Calculate BMI</Button>
        <ResultDisplay
          visible={bmi !== null}
          highlight={bmi !== null ? String(bmi) : undefined}
          subtitle={cat ? cat.label : undefined}
          slots={[
            ...(cat ? [{ label: 'Category', value: cat.label }] : []),
            ...(healthyRange && healthyRange.min ? [{ label: 'Healthy Weight Range', value: `${healthyRange.min}–${healthyRange.max} kg` }] : []),
            { label: 'BMI Scale', value: '<18.5 Under · 18.5–24.9 Normal · 25–29.9 Over · 30+ Obese' },
          ]}
        />
      </Card>
    </PageTransition>
  );
}
