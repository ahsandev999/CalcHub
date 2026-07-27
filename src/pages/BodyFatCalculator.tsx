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

function bodyFatCategory(percent: number) {
  if (percent < 6) return 'Essential';
  if (percent < 14) return 'Athletic';
  if (percent < 18) return 'Fitness';
  if (percent < 25) return 'Average';
  return 'Obese';
}

const bodyFatCalculatorFAQ: FAQItem[] = [
  {
    "question": "How accurate is the Navy body fat method?",
    "answer": "The U.S. Navy method is highly accessible and usually accurate within 3-4% of professional methods like DEXA scans or hydrostatic weighing, provided measurements are taken carefully."
  },
  {
    "question": "Where should I measure my waist?",
    "answer": "For men, measure horizontally at the level of the navel. For women, measure horizontally at the narrowest part of the torso (above the navel and below the rib cage)."
  },
  {
    "question": "What is a healthy body fat percentage?",
    "answer": "A healthy range for men is typically 8% to 19% (under 25% is acceptable). For women, a healthy range is 21% to 31% (under 32% is acceptable) due to essential reproductive fat."
  },
  {
    "question": "Why does the female formula require hip measurement?",
    "answer": "Women naturally store more essential fat in the hip and thigh regions. Including hip circumference allows the formula to estimate female body density and fat distribution accurately."
  },
  {
    "question": "How do I reduce my body fat percentage?",
    "answer": "To lower body fat, combine a modest calorie deficit (nutrition) with strength training to preserve muscle mass and cardiovascular exercise to support overall energy expenditure."
  }
];

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
      <SEO title="Body Fat Calculator" description="Estimate body fat percentage using the US Navy method." path="/body-fat-calculator" faqSchema={bodyFatCalculatorFAQ} />
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
          {/* ── SEO Content Sections ── */}
      <div className="seo-content">

        <section className="seo-section">
          <h2>How the Body Fat Calculator Works</h2>
          <p>This body fat calculator estimates your body fat percentage using the U.S. Navy circumference method. It requires height and circumference measurements of the neck and waist (and hips for females) to calculate body density.</p>
        </section>

        <section className="seo-section">
          <h2>Formula Used</h2>
          <div className="seo-formula" style={{ whiteSpace: 'pre-line' }}>
            {"Body Fat % (Male) = 495 ÷ [1.0324 − 0.19077 × log₁₀(waist − neck) + 0.15456 × log₁₀(height)] − 450\nBody Fat % (Female) = 495 ÷ [1.29579 − 0.35004 × log₁₀(waist + hip − neck) + 0.22100 × log₁₀(height)] − 450"}
          </div>
          <dl className="seo-formula-vars">
            <dt>waist / neck / hip / height</dt>
            <dd>— measurements in centimetres (hip is required only for females)</dd>
            <dt>log₁₀</dt>
            <dd>— base-10 logarithm of the values</dd>
          </dl>
        </section>

        <section className="seo-section">
          <h2>Example Calculation</h2>
          <p>For a male with waist = 90 cm, neck = 38 cm, and height = 180 cm: Body Fat % = 495 ÷ (1.0324 − 0.19077 × log₁₀(52) + 0.15456 × log₁₀(180)) − 450 = 495 ÷ 1.05362 − 450 ≈ 19.8%. This falls in the Average fitness category.</p>
        </section>

        <section className="seo-section">
          <h2>Frequently Asked Questions</h2>
          <FAQAccordion items={bodyFatCalculatorFAQ} />
        </section>

      </div>
    </PageTransition>
  );
}
