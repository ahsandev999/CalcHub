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

const standardDeviationCalculatorFAQ: FAQItem[] = [
  {
    "question": "What is standard deviation?",
    "answer": "Standard deviation is a statistical metric that quantifies the amount of variation or dispersion in a set of data values. A low SD indicates values are close to the mean, while a high SD indicates wider dispersion."
  },
  {
    "question": "What is the difference between sample and population standard deviation?",
    "answer": "Population SD is used when you have the complete dataset of all members. Sample SD is used when the data represents a sample of a larger population, using Bessel's correction (n-1) to adjust for bias."
  },
  {
    "question": "What is variance?",
    "answer": "Variance is the average of the squared differences from the mean. Standard deviation is simply the square root of the variance."
  },
  {
    "question": "Why do we square the differences?",
    "answer": "Squaring the differences prevents positive and negative differences from cancelling each other out when summed, and gives extra mathematical weight to outliers."
  },
  {
    "question": "How is standard deviation used in daily life?",
    "answer": "It is widely used in finance to measure asset volatility and risk, in manufacturing quality control to ensure consistency, and in weather forecasting."
  }
];

export default function StandardDeviationCalculator() {
  useToolTracking('standard-deviation-calculator', 'Standard Deviation Calculator');
  const [numbers, setNumbers] = useState('');
  const [result, setResult] = useState<{ mean: number; population: number; sample: number; variance: number } | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);

  const calculate = () => {
    const values = numbers
      .split(/[,\n]+/)
      .map((v) => Number(v.trim()))
      .filter((v) => !Number.isNaN(v));

    if (values.length < 2) {
      setValidationError('Enter at least two valid numbers.');
      return;
    }

    setValidationError(null);
    const mean = values.reduce((sum, value) => sum + value, 0) / values.length;
    const variance = values.reduce((sum, value) => sum + (value - mean) ** 2, 0) / values.length;
    const sampleVariance = values.reduce((sum, value) => sum + (value - mean) ** 2, 0) / (values.length - 1);
    const nextResult = {
      mean: Number(mean.toFixed(4)),
      population: Number(Math.sqrt(variance).toFixed(4)),
      sample: Number(Math.sqrt(sampleVariance).toFixed(4)),
      variance: Number(variance.toFixed(4)),
    };

    setResult(nextResult);
    addHistory({
      tool: 'Standard Deviation Calculator',
      toolSlug: 'standard-deviation-calculator',
      expression: numbers,
      result: `${nextResult.population}`,
    });
  };

  return (
    <PageTransition className="page-medium">
      <SEO title="Standard Deviation Calculator" description="Calculate standard deviation, variance, and mean from a list of numbers." path="/standard-deviation-calculator" faqSchema={standardDeviationCalculatorFAQ} />
      <Link to="/" className="back-link">← Back to tools</Link>
      <div className="tool-header">
        <div className="eyebrow">Math</div>
        <h1 className="page-title">Standard Deviation Calculator</h1>
        <p className="page-lede">Compute the mean, variance, and both population and sample standard deviations from a list of numeric values.</p>
      </div>
      <Card padding="lg">
        <Input label="Numbers (comma or line separated)" type="text" value={numbers} onChange={(e) => { setNumbers(e.target.value); setValidationError(null); }} />
        {validationError && <p className="input-message input-message-error" role="alert">{validationError}</p>}
        <Button onClick={calculate} magnetic style={{ width: '100%' }}>Calculate</Button>
        <ResultDisplay
          visible={!!result}
          highlight={result ? `Mean: ${result.mean}` : undefined}
          subtitle="Statistical summary"
          slots={result ? [
            { label: 'Mean', value: result.mean },
            { label: 'Variance', value: result.variance },
            { label: 'Population Standard Deviation', value: result.population },
            { label: 'Sample Standard Deviation', value: result.sample },
          ] : []}
        />
      </Card>
          {/* ── SEO Content Sections ── */}
      <div className="seo-content">

        <section className="seo-section">
          <h2>How the Standard Deviation Calculator Works</h2>
          <p>This calculator computes the mean, variance, population standard deviation, and sample standard deviation for a set of numbers. Standard deviation measures how spread out the values in a dataset are relative to their average.</p>
        </section>

        <section className="seo-section">
          <h2>Formula Used</h2>
          <div className="seo-formula" style={{ whiteSpace: 'pre-line' }}>
            {"Population SD (σ) = √[Σ(x − μ)² ÷ N]\nSample SD (s) = √[Σ(x − x̄)² ÷ (n − 1)]"}
          </div>
          <dl className="seo-formula-vars">
            <dt>x</dt>
            <dd>— each individual value in the dataset</dd>
            <dt>μ / x̄</dt>
            <dd>— the arithmetic mean (average) of the values</dd>
            <dt>N / n</dt>
            <dd>— the total number of values in the dataset (N for population, n for sample)</dd>
          </dl>
        </section>

        <section className="seo-section">
          <h2>Example Calculation</h2>
          <p>For a dataset [10, 12, 23, 23, 16, 23, 21, 16] (mean = 18): Variance = 24. Population Standard Deviation = √24 = 4.8990. Sample Standard Deviation (dividing by n-1 = 7) = 5.2372.</p>
        </section>

        <section className="seo-section">
          <h2>Frequently Asked Questions</h2>
          <FAQAccordion items={standardDeviationCalculatorFAQ} />
        </section>

      </div>
    </PageTransition>
  );
}
