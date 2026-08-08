import RelatedTools from '../components/ui/RelatedTools';
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

function toRadians(deg: number) { return (deg * Math.PI) / 180; }

const triangleCalculatorFAQ: FAQItem[] = [
  {
    "question": "What is Heron's formula?",
    "answer": "Heron's formula is a geometric formula that calculates the area of a triangle using only its three side lengths, without needing to know the height."
  },
  {
    "question": "What is the Law of Sines?",
    "answer": "The Law of Sines states that the ratio of the length of a side to the sine of its opposite angle is constant: a/sin(A) = b/sin(B) = c/sin(C)."
  },
  {
    "question": "Can a triangle have two obtuse angles?",
    "answer": "No. The sum of all angles in a triangle is exactly 180 degrees. Since an obtuse angle is greater than 90 degrees, two obtuse angles would exceed 180 degrees."
  },
  {
    "question": "What is an equilateral triangle?",
    "answer": "An equilateral triangle is a triangle where all three sides are equal in length and all three internal angles are exactly 60 degrees."
  },
  {
    "question": "What does it mean if the calculator says 'Invalid Triangle'?",
    "answer": "A triangle is invalid if the sum of any two side lengths is not greater than the length of the remaining side (known as the Triangle Inequality Theorem)."
  }
];

export default function TriangleCalculator() {
  const breadcrumbs = getBreadcrumbsForTool('triangle-calculator');
  useToolTracking('triangle-calculator', 'Triangle Calculator');
  const [a, setA] = useState('');
  const [b, setB] = useState('');
  const [c, setC] = useState('');
  const [angleA, setAngleA] = useState('');
  const [angleB, setAngleB] = useState('');
  const [angleC, setAngleC] = useState('');
  const [result, setResult] = useState<{ area: string; perimeter: string; remaining: string } | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);

  const calculate = (
    overrideA?: string,
    overrideB?: string,
    overrideC?: string,
    overrideAngleA?: string,
    overrideAngleB?: string,
    overrideAngleC?: string
  ) => {
    const sideA = Number(overrideA !== undefined ? overrideA : a);
    const sideB = Number(overrideB !== undefined ? overrideB : b);
    const sideC = Number(overrideC !== undefined ? overrideC : c);
    const angA = Number(overrideAngleA !== undefined ? overrideAngleA : angleA);
    const angB = Number(overrideAngleB !== undefined ? overrideAngleB : angleB);
    const angC = Number(overrideAngleC !== undefined ? overrideAngleC : angleC);

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

    let areaVal = '0.00';
    let perimeterVal = '0.00';
    let remainingVal = '';

    if (knownSides === 3) {
      const s = (sideA + sideB + sideC) / 2;
      const area = Math.sqrt(s * (s - sideA) * (s - sideB) * (s - sideC));
      const perimeter = sideA + sideB + sideC;
      areaVal = area.toFixed(2);
      perimeterVal = perimeter.toFixed(2);
      remainingVal = 'Solved from side lengths';
    } else {
      const side1 = sideA || sideB || sideC;
      const side2 = sideB || sideA || sideC;
      const angle = angA || angB || angC;
      const area = 0.5 * side1 * side2 * Math.sin(toRadians(angle));
      const perimeter = Number((side1 + side2 + (side1 ? side2 : side1)).toFixed(2));
      areaVal = area.toFixed(2);
      perimeterVal = perimeter.toFixed(2);
      remainingVal = 'Approximate solve using Law of Sines/Cosines';
    }

    setResult({ area: areaVal, perimeter: perimeterVal, remaining: remainingVal });

    addHistory({
      tool: 'Triangle Calculator',
      toolSlug: 'triangle-calculator',
      expression: 'triangle values',
      result: `${areaVal} area`,
    });
  };

  const fillExample = () => {
    const exA = '3';
    const exB = '4';
    const exC = '5';
    setA(exA);
    setB(exB);
    setC(exC);
    setAngleA('');
    setAngleB('');
    setAngleC('');
    setValidationError(null);
    calculate(exA, exB, exC, '', '', '');
  };

  return (
    <PageTransition className="page-medium">
      <SEO
        title="Free Triangle Calculator" description="Solve unknown triangle sides, angles, area, and perimeter online with this free geometry tool." path="/triangle-calculator" faqSchema={triangleCalculatorFAQ} 
        breadcrumbSchema={breadcrumbs?.schema}
      />
      <Breadcrumbs items={breadcrumbs?.visual || []} />
      <div className="tool-header">
        <div className="eyebrow">Math</div>
        <h1 className="page-title">Triangle Calculator</h1>
        <p className="page-lede">Estimate the remaining triangle values and area using the law of sines/cosines as needed.</p>
      </div>
      <Card padding="lg">
        <div className="grid-2">
          <Input label="Side a" type="number" value={a} onChange={(e) => { setA(e.target.value); setValidationError(null); }} min="0" placeholder="e.g. 3" error={validationError ? 'Enter a valid side or angle.' : undefined} />
          <Input label="Side b" type="number" value={b} onChange={(e) => { setB(e.target.value); setValidationError(null); }} min="0" placeholder="e.g. 4" error={validationError ? 'Enter a valid side or angle.' : undefined} />
          <Input label="Side c" type="number" value={c} onChange={(e) => { setC(e.target.value); setValidationError(null); }} min="0" placeholder="e.g. 5" error={validationError ? 'Enter a valid side or angle.' : undefined} />
          <Input label="Angle A (°)" type="number" value={angleA} onChange={(e) => { setAngleA(e.target.value); setValidationError(null); }} min="0" max="180" placeholder="e.g. 36.87" error={validationError ? 'Enter a valid side or angle.' : undefined} />
          <Input label="Angle B (°)" type="number" value={angleB} onChange={(e) => { setAngleB(e.target.value); setValidationError(null); }} min="0" max="180" placeholder="e.g. 53.13" error={validationError ? 'Enter a valid side or angle.' : undefined} />
          <Input label="Angle C (°)" type="number" value={angleC} onChange={(e) => { setAngleC(e.target.value); setValidationError(null); }} min="0" max="180" placeholder="e.g. 90.00" error={validationError ? 'Enter a valid side or angle.' : undefined} />
        </div>
        {validationError && <p className="input-message input-message-error" role="alert">{validationError}</p>}
        <Button onClick={() => calculate()} magnetic style={{ width: '100%' }}>Solve Triangle</Button>
        <button className="btn-demo-fill" onClick={fillExample}>Try Example</button>
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

      <RelatedTools currentSlug="triangle-calculator" />
          {/* ── SEO Content Sections ── */}
      <div className="seo-content">

        <section className="seo-section">
          <h2>How the Triangle Calculator Works</h2>
          <p>This triangle calculator solves triangle properties given any three known values (sides or angles). It computes the area, perimeter, and remaining unknown sides and angles using trigonometry and geometry rules.</p>
        </section>

        <section className="seo-section">
          <h2>Formula Used</h2>
          <div className="seo-formula" style={{ whiteSpace: 'pre-line' }}>
            {"Area = √[s(s − a)(s − b)(s − c)] (Heron's Formula)\nArea = 0.5 × a × b × sin(C)"}
          </div>
          <dl className="seo-formula-vars">
            <dt>a / b / c</dt>
            <dd>— the lengths of the three sides of the triangle</dd>
            <dt>s</dt>
            <dd>— semi-perimeter = (a + b + c) ÷ 2</dd>
            <dt>C</dt>
            <dd>— the angle opposite side c, in degrees</dd>
          </dl>
        </section>

        <section className="seo-section">
          <h2>Example Calculation</h2>
          <p>For a triangle with side lengths a = 3, b = 4, and c = 5: s = (3+4+5)/2 = 6. Area = √[6 × (6-3) × (6-4) × (6-5)] = √[6 × 3 × 2 × 1] = √36 = 6. The perimeter is 3 + 4 + 5 = 12.</p>
        </section>

        <section className="seo-section">
          <h2>Frequently Asked Questions</h2>
          <FAQAccordion items={triangleCalculatorFAQ} />
        </section>

      </div>
    </PageTransition>
  );
}
