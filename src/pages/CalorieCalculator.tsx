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

const activityMultipliers = {
  sedentary: 1.2,
  lightly: 1.375,
  moderately: 1.55,
  very: 1.725,
  extra: 1.9,
} as const;

export default function CalorieCalculator() {
  useToolTracking('calorie-calculator', 'Calorie Calculator');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState<'male' | 'female'>('male');
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [activity, setActivity] = useState<keyof typeof activityMultipliers>('moderately');
  const [result, setResult] = useState<number | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);

  const calculate = () => {
    const ageNum = Number(age);
    const weightNum = Number(weight);
    const heightNum = Number(height);

    if (!ageNum || !weightNum || !heightNum || ageNum <= 0 || weightNum <= 0 || heightNum <= 0) {
      setValidationError('Enter valid age, weight, and height.');
      return;
    }

    setValidationError(null);
    const bmr = gender === 'male'
      ? 10 * weightNum + 6.25 * heightNum - 5 * ageNum + 5
      : 10 * weightNum + 6.25 * heightNum - 5 * ageNum - 161;

    const calories = Math.round(bmr * activityMultipliers[activity]);
    setResult(calories);
    addHistory({
      tool: 'Calorie Calculator',
      toolSlug: 'calorie-calculator',
      expression: `${gender}, ${weightNum}kg, ${heightNum}cm, ${ageNum}y`,
      result: `${calories} kcal`,
    });
    
  };

  return (
    <PageTransition className="page-medium">
      <SEO title="Calorie Calculator" description="Estimate daily calorie needs with the Mifflin-St Jeor equation." path="/calorie-calculator" />
      <Link to="/" className="back-link">← Back to tools</Link>
      <div className="tool-header">
        <div className="eyebrow">Fitness & Health</div>
        <h1 className="page-title">Calorie Calculator</h1>
        <p className="page-lede">Estimate your daily calorie needs based on your body data and activity level.</p>
      </div>
      <Card padding="lg">
        <div className="tabs">
          <button className={`tab ${gender === 'male' ? 'active' : ''}`} onClick={() => setGender('male')}>Male</button>
          <button className={`tab ${gender === 'female' ? 'active' : ''}`} onClick={() => setGender('female')}>Female</button>
        </div>
        <Input label="Age" type="number" value={age} onChange={(e) => { setAge(e.target.value); setValidationError(null); }} min="1" error={validationError ? 'Enter a valid age.' : undefined} />
        <Input label="Weight (kg)" type="number" value={weight} onChange={(e) => { setWeight(e.target.value); setValidationError(null); }} min="1" error={validationError ? 'Enter a valid weight.' : undefined} />
        <Input label="Height (cm)" type="number" value={height} onChange={(e) => { setHeight(e.target.value); setValidationError(null); }} min="1" error={validationError ? 'Enter a valid height.' : undefined} />
        <div className="tabs">
          {(['sedentary', 'lightly', 'moderately', 'very', 'extra'] as const).map((item) => (
            <button key={item} className={`tab ${activity === item ? 'active' : ''}`} onClick={() => setActivity(item)}>{item}</button>
          ))}
        </div>
        {validationError && <p className="input-message input-message-error" role="alert">{validationError}</p>}
        <Button onClick={calculate} magnetic style={{ width: '100%' }}>Calculate Calories</Button>
        <ResultDisplay
          visible={result !== null}
          highlight={result ? `${result} kcal/day` : undefined}
          subtitle="Estimated daily calorie target"
          slots={result !== null ? [{ label: 'Daily Calories', value: `${result} kcal` }] : []}
        />
      </Card>
    </PageTransition>
  );
}
