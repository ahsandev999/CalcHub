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

const idealWeightCalculatorFAQ: FAQItem[] = [
  {
    "question": "How is ideal weight calculated?",
    "answer": "Ideal weight is calculated using medical formulas (Devine, Robinson, Miller) that establish a base weight for a person 5 feet tall, adding a set weight increment for every inch above that height."
  },
  {
    "question": "What is a healthy weight range?",
    "answer": "Rather than a single 'ideal' weight, health organizations recommend aiming for a BMI range of 18.5 to 24.9, which corresponds to a healthy weight buffer for your height."
  },
  {
    "question": "Do these formulas apply to everyone?",
    "answer": "No. These formulas are based on height and gender averages. They do not account for muscle mass, bone density, or body frame size, and can underestimate ideal weight for muscular individuals."
  },
  {
    "question": "Why is there a difference between formulas?",
    "answer": "Each formula (Devine, Robinson, Miller) was developed in different research studies using slightly different datasets, resulting in minor differences in the weight added per inch of height."
  },
  {
    "question": "Is the ideal weight the same for men and women?",
    "answer": "No. Men naturally have higher bone density and muscle mass, so ideal weight formulas allocate a higher base weight for men of the same height."
  }
];

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
      <SEO title="Ideal Weight Calculator" description="Estimate an ideal weight range using common medical formulas." path="/ideal-weight-calculator" faqSchema={idealWeightCalculatorFAQ} />
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
          {/* ── SEO Content Sections ── */}
      <div className="seo-content">

        <section className="seo-section">
          <h2>How the Ideal Weight Calculator Works</h2>
          <p>This calculator estimates your ideal body weight based on your height and gender using the three most popular formulas: Devine, Robinson, and Miller. These formulas estimate healthy body weight ranges used in medical settings.</p>
        </section>

        <section className="seo-section">
          <h2>Formula Used</h2>
          <div className="seo-formula" style={{ whiteSpace: 'pre-line' }}>
            {"Devine (Male) = 50.0 + 2.3 × (Height in inches − 60)\nDevine (Female) = 45.5 + 2.3 × (Height in inches − 60)"}
          </div>
          <dl className="seo-formula-vars">
            <dt>Height</dt>
            <dd>— measured in inches (60 inches is the baseline, equivalent to 5 feet)</dd>
            <dt>2.3 kg</dt>
            <dd>— the ideal weight added for every inch of height above 5 feet</dd>
          </dl>
        </section>

        <section className="seo-section">
          <h2>Example Calculation</h2>
          <p>For a female who is 5 feet 5 inches tall (65 inches total): Devine = 45.5 + 2.3 × (65 − 60) = 45.5 + 11.5 = 57.0 kg. The calculator displays the ranges computed across all three formulas.</p>
        </section>

        <section className="seo-section">
          <h2>Frequently Asked Questions</h2>
          <FAQAccordion items={idealWeightCalculatorFAQ} />
        </section>

      </div>
    </PageTransition>
  );
}
