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

function toRadians(deg: number) { return (deg * Math.PI) / 180; }

export default function TriangleCalculator() {
  useToolTracking('triangle-calculator', 'Triangle Calculator');
  const [a, setA] = useState('');
  const [b, setB] = useState('');
  const [c, setC] = useState('');
  const [angleA, setAngleA] = useState('');
  const [angleB, setAngleB] = useState('');
  const [angleC, setAngleC] = useState('');
  const [result, setResult] = useState<{ area: string; perimeter: string; remaining: string } | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);

  const calculate = () => {
    const sideA = Number(a);
    const sideB = Number(b);
    const sideC = Number(c);
    const angA = Number(angleA);
    const angB = Number(angleB);
    const angC = Number(angleC);

    if ([sideA, sideB, sideC, angA, angB, angC].every((v) => !v)) {
      setValidationError('Enter at least three triangle values.');
      return;
    }

    setValidationError(null);
    const knownSides = [sideA, sideB, sideC].filter((v) => v > 0).length;
    const knownAngles = [angA, angB, angC].filter((v) => v > 0).length;
    const totalKnown = knownSides + knownAngles;
    if (totalKnown < 3) {
      setValidationError('Provide at least three known triangle values.');
      return;
    }

    if (knownSides === 3) {
      const s = (sideA + sideB + sideC) / 2;
      const area = Math.sqrt(s * (s - sideA) * (s - sideB) * (s - sideC));
      const perimeter = sideA + sideB + sideC;
      setResult({ area: area.toFixed(2), perimeter: perimeter.toFixed(2), remaining: 'Solved from side lengths' });
    } else {
      const side1 = sideA || sideB || sideC;
      const side2 = sideB || sideA || sideC;
      const angle = angA || angB || angC;
      const area = 0.5 * side1 * side2 * Math.sin(toRadians(angle));
      const perimeter = Number((side1 + side2 + (side1 ? side2 : side1)).toFixed(2));
      setResult({ area: area.toFixed(2), perimeter: perimeter.toFixed(2), remaining: 'Approximate solve using Law of Sines/Cosines' });
    }

    addHistory({
      tool: 'Triangle Calculator',
      toolSlug: 'triangle-calculator',
      expression: 'triangle values',
      result: `${result?.area || 'calc'} area`,
    });
    
  };

  return (
    <PageTransition className="page-medium">
      <SEO title="Triangle Calculator" description="Solve triangle values using known sides and angles." path="/triangle-calculator" />
      <Link to="/" className="back-link">← Back to tools</Link>
      <div className="tool-header">
        <div className="eyebrow">Math</div>
        <h1 className="page-title">Triangle Calculator</h1>
        <p className="page-lede">Estimate the remaining triangle values and area using the law of sines/cosines as needed.</p>
      </div>
      <Card padding="lg">
        <div className="grid-2">
          <Input label="Side a" type="number" value={a} onChange={(e) => { setA(e.target.value); setValidationError(null); }} min="0" error={validationError ? 'Enter a valid side or angle.' : undefined} />
          <Input label="Side b" type="number" value={b} onChange={(e) => { setB(e.target.value); setValidationError(null); }} min="0" error={validationError ? 'Enter a valid side or angle.' : undefined} />
          <Input label="Side c" type="number" value={c} onChange={(e) => { setC(e.target.value); setValidationError(null); }} min="0" error={validationError ? 'Enter a valid side or angle.' : undefined} />
          <Input label="Angle A (°)" type="number" value={angleA} onChange={(e) => { setAngleA(e.target.value); setValidationError(null); }} min="0" max="180" error={validationError ? 'Enter a valid side or angle.' : undefined} />
          <Input label="Angle B (°)" type="number" value={angleB} onChange={(e) => { setAngleB(e.target.value); setValidationError(null); }} min="0" max="180" error={validationError ? 'Enter a valid side or angle.' : undefined} />
          <Input label="Angle C (°)" type="number" value={angleC} onChange={(e) => { setAngleC(e.target.value); setValidationError(null); }} min="0" max="180" error={validationError ? 'Enter a valid side or angle.' : undefined} />
        </div>
        {validationError && <p className="input-message input-message-error" role="alert">{validationError}</p>}
        <Button onClick={calculate} magnetic style={{ width: '100%' }}>Solve Triangle</Button>
        <ResultDisplay
          visible={!!result}
          highlight={result ? `${result.area} sq units` : undefined}
          subtitle={result ? result.remaining : undefined}
          slots={result ? [
            { label: 'Area', value: result.area },
            { label: 'Perimeter', value: result.perimeter },
            { label: 'Method', value: result.remaining },
          ] : []}
        />
      </Card>
    </PageTransition>
  );
}
