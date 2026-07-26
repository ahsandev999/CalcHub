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
      <SEO title="Standard Deviation Calculator" description="Calculate standard deviation, variance, and mean from a list of numbers." path="/standard-deviation-calculator" />
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
    </PageTransition>
  );
}
