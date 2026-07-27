import { useState } from 'react';
import { Link } from 'react-router-dom';
import FAQAccordion, { type FAQItem } from '@/components/ui/FAQAccordion';
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

const calorieCalculatorFAQ: FAQItem[] = [
  {
    "question": "What is TDEE?",
    "answer": "TDEE stands for Total Daily Energy Expenditure. It is the total number of calories your body burns in a 24-hour period, including sleeping, digesting food, and physical activity."
  },
  {
    "question": "How many calories should I eat to lose weight?",
    "answer": "To lose weight, you must create a calorie deficit. A safe deficit is typically 300 to 500 calories below your maintenance level, aiming for a steady loss of 0.5 to 1 kg per week."
  },
  {
    "question": "How accurate is the calorie calculator?",
    "answer": "The calculator provides an estimate based on population averages. Actual energy expenditure varies based on muscle mass, thyroid function, genetics, and precise daily activity levels."
  },
  {
    "question": "What counts as 'moderately active'?",
    "answer": "Moderately active is defined as engaging in moderate exercise or sports 3 to 5 days a week. If you work a desk job but walk regularly, lightly active (1.375) may be a safer estimate."
  },
  {
    "question": "Does muscle mass affect calorie burn?",
    "answer": "Yes. Muscle tissue is more metabolically active than fat tissue. People with higher muscle mass burn more calories at rest than individuals of the same weight with higher body fat."
  }
];

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
      <SEO title="Calorie Calculator" description="Estimate daily calorie needs with the Mifflin-St Jeor equation." path="/calorie-calculator" faqSchema={calorieCalculatorFAQ} />
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
          {/* ── SEO Content Sections ── */}
      <div className="seo-content">

        <section className="seo-section">
          <h2>How the Calorie Calculator Works</h2>
          <p>This calorie calculator estimates the daily energy intake needed to maintain your current weight based on your age, gender, height, weight, and activity level. WWI-standard metabolic equations determine your baseline burn.</p>
        </section>

        <section className="seo-section">
          <h2>Formula Used</h2>
          <div className="seo-formula" style={{ whiteSpace: 'pre-line' }}>
            {"Maintenance Calories = BMR × Activity Multiplier"}
          </div>
          <dl className="seo-formula-vars">
            <dt>BMR</dt>
            <dd>— Basal Metabolic Rate calculated via the Mifflin-St Jeor formula</dd>
            <dt>Activity Multiplier</dt>
            <dd>— factor scales from 1.2 (sedentary) to 1.9 (extra active) based on exercise level</dd>
            <dt>Maintenance Calories</dt>
            <dd>— total calories burned daily (Total Daily Energy Expenditure, or TDEE)</dd>
          </dl>
        </section>

        <section className="seo-section">
          <h2>Example Calculation</h2>
          <p>For a 25-year-old male weighing 75 kg, 180 cm tall, with a BMR of 1,755 kcal, who is moderately active (1.55 multiplier): Maintenance = 1,755 × 1.55 = 2,720 kcal/day to maintain weight.</p>
        </section>

        <section className="seo-section">
          <h2>Frequently Asked Questions</h2>
          <FAQAccordion items={calorieCalculatorFAQ} />
        </section>

      </div>
    </PageTransition>
  );
}
