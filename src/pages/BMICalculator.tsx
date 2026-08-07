import { useState } from 'react';
import { Link } from 'react-router-dom';
import PageTransition from '@/components/ui/PageTransition';
import SEO from '@/components/ui/SEO';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import ResultDisplay from '@/components/ui/ResultDisplay';
import FAQAccordion, { type FAQItem } from '@/components/ui/FAQAccordion';
import { useToolTracking } from '@/hooks/useScroll';
import { addHistory } from '@/lib/storage';
import '@/styles/components.css';

const bmiFAQ: FAQItem[] = [
  { question: 'What is a healthy BMI range for adults?', answer: 'For most adults aged 18–65, the World Health Organization defines a healthy BMI as 18.5 to 24.9. A BMI below 18.5 is classified as underweight, 25–29.9 as overweight, and 30 or above as obese. These thresholds are the same for both men and women, although body composition differences mean the categories are not equally predictive across sexes.' },
  { question: 'Is BMI accurate for athletes and muscular people?', answer: 'BMI can overestimate health risk for athletes and highly muscular individuals. Because muscle is denser than fat, a person with a large amount of lean muscle mass may have a high BMI despite having low body fat. In these cases, additional measures such as waist circumference or body fat percentage provide a more accurate health picture.' },
  { question: 'Does BMI apply to children and teenagers?', answer: 'Standard BMI thresholds (18.5–24.9) are designed for adults only. For children and teenagers (ages 2–19), BMI is interpreted using age- and sex-specific percentile charts because normal amounts of body fat change with age and differ between boys and girls. A paediatrician should assess BMI in younger individuals.' },
  { question: 'Can I use BMI to track weight-loss progress?', answer: 'Yes — BMI is a useful tracking metric when used alongside other indicators. Because it is calculated from weight and height alone, any change in weight directly changes your BMI, making it easy to monitor trends over time. However, also track waist measurement and energy levels to get a fuller picture of your health progress.' },
  { question: 'Why is my BMI different in metric vs. imperial mode?', answer: 'If you get a slightly different result between modes, it is most likely a rounding difference when converting between units. For best accuracy, use metric mode and enter your measurements directly in kilograms and centimetres, as the formula was originally defined using the metric system.' },
];

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

  const calculate = (overrideW?: string, overrideH?: string) => {
    const w = parseFloat(overrideW !== undefined ? overrideW : weight);
    const h = parseFloat(overrideH !== undefined ? overrideH : height);
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

  const fillExample = () => {
    const exW = unit === 'metric' ? '70' : '154';
    const exH = unit === 'metric' ? '175' : '69';
    setWeight(exW);
    setHeight(exH);
    setValidationError(null);
    calculate(exW, exH);
  };

  const cat = bmi ? getBMICategory(bmi) : null;
  const healthyRange = unit === 'metric'
    ? { min: Math.round(18.5 * (parseFloat(height) / 100) ** 2 * 10) / 10, max: Math.round(24.9 * (parseFloat(height) / 100) ** 2 * 10) / 10 }
    : null;

  return (
    <PageTransition className="page-medium">
      <SEO title="Free BMI Calculator" description="Calculate your Body Mass Index (BMI) online for free. Get height-to-weight category results and healthy range recommendations instantly." path="/bmi-calculator" faqSchema={bmiFAQ} />
      <Link to="/" className="back-link">← Back to tools</Link>
      <div className="tool-header">
        <div className="eyebrow">Health</div>
        <h1 className="page-title">BMI Calculator</h1>
        <p className="page-lede">Calculate your Body Mass Index and understand your health category.</p>
      </div>
      <Card padding="lg">
        <div className="tabs">
          <button className={`tab ${unit === 'metric' ? 'active' : ''}`} onClick={() => { setUnit('metric'); setBmi(null); }}>Metric (kg/cm)</button>
          <button className={`tab ${unit === 'imperial' ? 'active' : ''}`} onClick={() => { setUnit('imperial'); setBmi(null); }}>Imperial (lbs/in)</button>
        </div>
        <Input label={`Weight (${unit === 'metric' ? 'kg' : 'lbs'})`} type="number" value={weight} onChange={(e) => { setWeight(e.target.value); setValidationError(null); }} min="1" placeholder={unit === 'metric' ? 'e.g. 70' : 'e.g. 154'} error={validationError ? 'Enter a valid weight.' : undefined} />
        <Input label={`Height (${unit === 'metric' ? 'cm' : 'inches'})`} type="number" value={height} onChange={(e) => { setHeight(e.target.value); setValidationError(null); }} min="1" placeholder={unit === 'metric' ? 'e.g. 175' : 'e.g. 69'} error={validationError ? 'Enter a valid height.' : undefined} />
        {validationError && <p className="input-message input-message-error" role="alert">{validationError}</p>}
        <Button onClick={() => calculate()} magnetic style={{ width: '100%' }}>Calculate BMI</Button>
        <button className="btn-demo-fill" onClick={fillExample}>Try Example</button>
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
      {/* ── SEO Content Sections ── */}
      <div className="seo-content">

        <section className="seo-section">
          <h2>How the BMI Calculator Works</h2>
          <p>
            Body Mass Index (BMI) is a screening number calculated from your weight and height. It
            provides a quick, population-level estimate of whether a person falls into a weight range
            that is associated with increased health risks. BMI does not directly measure body fat,
            but research has shown it correlates well with more direct measures of body fat for most adults.
          </p>
          <p>
            This calculator supports both metric units (kilograms and centimetres) and imperial units
            (pounds and inches). After entering your measurements, it instantly computes your BMI,
            classifies it into a WHO-defined category, and shows the healthy weight range for your height.
          </p>
        </section>

        <section className="seo-section">
          <h2>Formula Used</h2>
          <div className="seo-formula">
            BMI (metric) = weight (kg) ÷ [height (m)]²
            <br />
            BMI (imperial) = [weight (lbs) ÷ height (in)²] × 703
          </div>
          <dl className="seo-formula-vars">
            <dt>weight (kg / lbs)</dt>
            <dd>— your body weight in kilograms or pounds</dd>
            <dt>height (m / in)</dt>
            <dd>— your height in metres (metric) or inches (imperial); centimetres are divided by 100 before squaring</dd>
            <dt>703</dt>
            <dd>— the unit conversion factor used when weight is in pounds and height is in inches</dd>
          </dl>
        </section>

        <section className="seo-section">
          <h2>Example Calculation</h2>
          <p>
            Suppose a person weighs <strong>70 kg</strong> and is <strong>175 cm</strong> (1.75 m) tall.
            Using the metric formula: BMI = 70 ÷ (1.75)² = 70 ÷ 3.0625 ≈ <strong>22.9</strong>.
          </p>
          <p>
            A BMI of 22.9 falls in the <strong>Normal weight</strong> range (18.5–24.9), which is
            associated with the lowest risk of weight-related health problems. For this person's height,
            the healthy weight range spans approximately 56.6 kg to 76.3 kg.
          </p>
        </section>

        <section className="seo-section">
          <h2>Frequently Asked Questions</h2>
          <FAQAccordion items={bmiFAQ} />
        </section>

      </div>
    </PageTransition>
  );
}
