import Breadcrumbs from '@/components/ui/Breadcrumbs';
import { getBreadcrumbsForTool } from '@/lib/tools';
import { useState } from 'react';

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

const bMRCalculatorFAQ: FAQItem[] = [
  {
    "question": "What is Basal Metabolic Rate?",
    "answer": "BMR is the minimum number of calories your body needs to survive at rest. It does not include the calories burned from moving, digesting food, or daily activities."
  },
  {
    "question": "What formula does this calculator use?",
    "answer": "This calculator uses the Mifflin-St Jeor equation, which was introduced in 1990 and is currently considered the standard for calculating metabolic rate."
  },
  {
    "question": "How is BMR different from RMR?",
    "answer": "BMR is measured under strict laboratory conditions after waking up. Resting Metabolic Rate (RMR) is measured under looser conditions and includes slight energy costs, making it about 10% higher than BMR."
  },
  {
    "question": "How can I increase my BMR?",
    "answer": "The most effective way to increase BMR is to build lean muscle mass. Muscle is more metabolically active than fat, meaning it burns more calories even when you are completely at rest."
  },
  {
    "question": "Does age affect BMR?",
    "answer": "Yes. BMR naturally decreases as you age. This is due to a natural loss of lean muscle tissue and changes in hormonal activity, which slows down overall metabolic rate."
  }
];

export default function BMRCalculator() {
  const breadcrumbs = getBreadcrumbsForTool('bmr-calculator');
  useToolTracking('bmr-calculator', 'BMR Calculator');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState<'male' | 'female'>('male');
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [result, setResult] = useState<number | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);

  const calculate = (overrideAge?: string, overrideW?: string, overrideH?: string) => {
    const ageNum = Number(overrideAge !== undefined ? overrideAge : age);
    const weightNum = Number(overrideW !== undefined ? overrideW : weight);
    const heightNum = Number(overrideH !== undefined ? overrideH : height);

    if (!ageNum || !weightNum || !heightNum || ageNum <= 0 || weightNum <= 0 || heightNum <= 0) {
      setValidationError('Enter valid age, weight, and height.');
      return;
    }

    setValidationError(null);
    const bmr = gender === 'male'
      ? 10 * weightNum + 6.25 * heightNum - 5 * ageNum + 5
      : 10 * weightNum + 6.25 * heightNum - 5 * ageNum - 161;

    const rounded = Math.round(bmr);
    setResult(rounded);
    addHistory({
      tool: 'BMR Calculator',
      toolSlug: 'bmr-calculator',
      expression: `${gender}, ${weightNum}kg, ${heightNum}cm, ${ageNum}y`,
      result: `${rounded} kcal/day`,
    });
  };

  const fillExample = () => {
    const exAge = '30';
    const exW = '70';
    const exH = '175';
    setAge(exAge);
    setWeight(exW);
    setHeight(exH);
    setValidationError(null);
    calculate(exAge, exW, exH);
  };

  return (
    <PageTransition className="page-medium">
      <SEO
        title="Free BMR Calculator" description="Calculate your basal metabolic rate (BMR) using the Mifflin-St Jeor equation online for free." path="/bmr-calculator" faqSchema={bMRCalculatorFAQ} 
        breadcrumbSchema={breadcrumbs?.schema}
      />
      <Breadcrumbs items={breadcrumbs?.visual || []} />
      <div className="tool-header">
        <div className="eyebrow">Fitness & Health</div>
        <h1 className="page-title">BMR Calculator</h1>
        <p className="page-lede">Calculate your daily resting calorie burn with the Mifflin-St Jeor formula.</p>
      </div>
      <Card padding="lg">
        <div className="tabs">
          <button className={`tab ${gender === 'male' ? 'active' : ''}`} onClick={() => setGender('male')}>Male</button>
          <button className={`tab ${gender === 'female' ? 'active' : ''}`} onClick={() => setGender('female')}>Female</button>
        </div>
        <Input label="Age" type="number" value={age} onChange={(e) => { setAge(e.target.value); setValidationError(null); }} min="1" placeholder="e.g. 30" error={validationError ? 'Enter a valid age.' : undefined} />
        <Input label="Weight (kg)" type="number" value={weight} onChange={(e) => { setWeight(e.target.value); setValidationError(null); }} min="1" placeholder="e.g. 70" error={validationError ? 'Enter a valid weight.' : undefined} />
        <Input label="Height (cm)" type="number" value={height} onChange={(e) => { setHeight(e.target.value); setValidationError(null); }} min="1" placeholder="e.g. 175" error={validationError ? 'Enter a valid height.' : undefined} />
        {validationError && <p className="input-message input-message-error" role="alert">{validationError}</p>}
        <Button onClick={() => calculate()} magnetic style={{ width: '100%' }}>Calculate BMR</Button>
        <button className="btn-demo-fill" onClick={fillExample}>Try Example</button>
        <ResultDisplay
          visible={result !== null}
          highlight={result ? `${result} kcal/day` : undefined}
          subtitle="Basal Metabolic Rate"
          slots={result !== null ? [{ label: 'BMR', value: `${result} kcal/day` }] : []}
        />
      </Card>
          {/* ── SEO Content Sections ── */}
      <div className="seo-content">

        <section className="seo-section">
          <h2>How the BMR Calculator Works</h2>
          <p>This calculator estimates your Basal Metabolic Rate (BMR) — the number of calories your body burns to perform basic life-sustaining functions (like breathing, circulation, and cell production) while at rest.</p>
        </section>

        <section className="seo-section">
          <h2>Formula Used</h2>
          <div className="seo-formula" style={{ whiteSpace: 'pre-line' }}>
            {"BMR (Male) = 10 × weight (kg) + 6.25 × height (cm) − 5 × age (years) + 5\nBMR (Female) = 10 × weight (kg) + 6.25 × height (cm) − 5 × age (years) − 161"}
          </div>
          <dl className="seo-formula-vars">
            <dt>weight</dt>
            <dd>— your body weight in kilograms</dd>
            <dt>height</dt>
            <dd>— your height in centimetres</dd>
            <dt>age</dt>
            <dd>— your current age in years</dd>
          </dl>
        </section>

        <section className="seo-section">
          <h2>Example Calculation</h2>
          <p>For a 30-year-old female weighing 60 kg and 165 cm tall: BMR = 10 × 60 + 6.25 × 165 − 5 × 30 − 161 = 600 + 1031.25 − 150 − 161 = 1,320 kcal/day. This is her resting energy cost.</p>
        </section>

        <section className="seo-section">
          <h2>Frequently Asked Questions</h2>
          <FAQAccordion items={bMRCalculatorFAQ} />
        </section>

      </div>
    </PageTransition>
  );
}
