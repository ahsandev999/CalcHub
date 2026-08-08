import Breadcrumbs from '@/components/ui/Breadcrumbs';
import { getBreadcrumbsForTool } from '@/lib/tools';
import { useState, useMemo } from 'react';

import FAQAccordion, { type FAQItem } from '@/components/ui/FAQAccordion';
import PageTransition from '@/components/ui/PageTransition';
import SEO from '@/components/ui/SEO';
import Card from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { useToolTracking } from '@/hooks/useScroll';
import { addHistory } from '@/lib/storage';
import '@/styles/components.css';

const UNITS: Record<string, { label: string; toBase: (v: number) => number; fromBase: (v: number) => number }> = {
  m: { label: 'Meters', toBase: (v) => v, fromBase: (v) => v },
  km: { label: 'Kilometers', toBase: (v) => v * 1000, fromBase: (v) => v / 1000 },
  cm: { label: 'Centimeters', toBase: (v) => v / 100, fromBase: (v) => v * 100 },
  mm: { label: 'Millimeters', toBase: (v) => v / 1000, fromBase: (v) => v * 1000 },
  mi: { label: 'Miles', toBase: (v) => v * 1609.344, fromBase: (v) => v / 1609.344 },
  ft: { label: 'Feet', toBase: (v) => v * 0.3048, fromBase: (v) => v / 0.3048 },
  in: { label: 'Inches', toBase: (v) => v * 0.0254, fromBase: (v) => v / 0.0254 },
  yd: { label: 'Yards', toBase: (v) => v * 0.9144, fromBase: (v) => v / 0.9144 },
};

const WEIGHT: Record<string, { label: string; toBase: (v: number) => number; fromBase: (v: number) => number }> = {
  kg: { label: 'Kilograms', toBase: (v) => v, fromBase: (v) => v },
  g: { label: 'Grams', toBase: (v) => v / 1000, fromBase: (v) => v * 1000 },
  lb: { label: 'Pounds', toBase: (v) => v * 0.453592, fromBase: (v) => v / 0.453592 },
  oz: { label: 'Ounces', toBase: (v) => v * 0.0283495, fromBase: (v) => v / 0.0283495 },
};

const TEMP = {
  c: { label: 'Celsius', toBase: (v: number) => v, fromBase: (v: number) => v },
  f: { label: 'Fahrenheit', toBase: (v: number) => (v - 32) * 5 / 9, fromBase: (v: number) => v * 9 / 5 + 32 },
  k: { label: 'Kelvin', toBase: (v: number) => v - 273.15, fromBase: (v: number) => v + 273.15 },
};

const CATEGORIES = {
  length: UNITS,
  weight: WEIGHT,
  temperature: TEMP,
};

type Cat = keyof typeof CATEGORIES;

const unitConverterFAQ: FAQItem[] = [
  {
    "question": "Are these conversions exact?",
    "answer": "Most unit conversions are based on exact scientific definitions (for example, 1 inch is defined as exactly 2.54 cm). Temperature conversions are also exact algebraic formulas."
  },
  {
    "question": "What is the difference between mass and weight?",
    "answer": "Mass measures the amount of matter in an object and is constant. Weight is the force exerted on that mass by gravity. On Earth, mass and weight units like kilograms and pounds are used interchangeably in daily life."
  },
  {
    "question": "How does the temperature converter work?",
    "answer": "Unlike other units that use a simple multiplier, temperature units have different zero points. The calculator uses formulas: Celsius to Fahrenheit is (C × 9/5) + 32, and Celsius to Kelvin is C + 273.15."
  },
  {
    "question": "What is the metric system?",
    "answer": "The metric system (SI) is a decimal-based system of measurement used globally. It scales by powers of 10 using prefixes like milli-, centi-, and kilo-, making conversions simple."
  },
  {
    "question": "Why do some unit conversions have rounding differences?",
    "answer": "The calculator rounds results to 6 decimal places to prevent long floating-point precision errors (like 0.0000000000002) inherent to computer arithmetic, while preserving practical accuracy."
  }
];

export default function UnitConverter() {
  const breadcrumbs = getBreadcrumbsForTool('unit-converter');
  useToolTracking('unit-converter', 'Unit Converter');
  const [category, setCategory] = useState<Cat>('length');
  const [fromUnit, setFromUnit] = useState('m');
  const [toUnit, setToUnit] = useState('km');
  const [value, setValue] = useState('');

  const units = CATEGORIES[category];
  const unitKeys = Object.keys(units);

  const result = useMemo(() => {
    const v = parseFloat(value);
    if (isNaN(v)) return '—';
    const u = units as Record<string, { toBase: (v: number) => number; fromBase: (v: number) => number }>;
    if (!u[fromUnit] || !u[toUnit]) return '—';
    const base = u[fromUnit].toBase(v);
    const converted = u[toUnit].fromBase(base);
    return converted.toLocaleString(undefined, { maximumFractionDigits: 6 });
  }, [value, fromUnit, toUnit, units]);

  const switchCategory = (cat: Cat) => {
    setCategory(cat);
    const keys = Object.keys(CATEGORIES[cat]);
    setFromUnit(keys[0]);
    setToUnit(keys[1] || keys[0]);
  };

  const handleConvert = (overrideVal?: string, overrideFrom?: string, overrideTo?: string) => {
    const val = overrideVal !== undefined ? overrideVal : value;
    const fromU = overrideFrom !== undefined ? overrideFrom : fromUnit;
    const toU = overrideTo !== undefined ? overrideTo : toUnit;

    const v = parseFloat(val);
    if (isNaN(v)) return;
    const u = units as Record<string, { toBase: (v: number) => number; fromBase: (v: number) => number }>;
    if (!u[fromU] || !u[toU]) return;
    const base = u[fromU].toBase(v);
    const converted = u[toU].fromBase(base);
    const res = converted.toLocaleString(undefined, { maximumFractionDigits: 6 });

    const fromLabel = units[fromU as keyof typeof units]?.label || fromU;
    const toLabel = units[toU as keyof typeof units]?.label || toU;
    addHistory({
      tool: 'Unit Converter',
      toolSlug: 'unit-converter',
      expression: `${val} ${fromLabel}`,
      result: `${res} ${toLabel}`,
    });
  };

  const fillExample = () => {
    setCategory('length');
    setFromUnit('m');
    setToUnit('km');
    setValue('1000');
    handleConvert('1000', 'm', 'km');
  };

  return (
    <PageTransition className="page-medium">
      <SEO
        title="Free Unit Converter" description="Convert length, weight, temperature, volume, and other measurements online with this free converter." path="/unit-converter" faqSchema={unitConverterFAQ} 
        breadcrumbSchema={breadcrumbs?.schema}
      />
      <Breadcrumbs items={breadcrumbs?.visual || []} />
      <div className="tool-header">
        <div className="eyebrow">Converter</div>
        <h1 className="page-title">Unit Converter</h1>
        <p className="page-lede">Convert between length, weight, and temperature units.</p>
      </div>
      <Card padding="lg">
        <div className="tabs">
          {(['length', 'weight', 'temperature'] as Cat[]).map((c) => (
            <button key={c} className={`tab ${category === c ? 'active' : ''}`} onClick={() => switchCategory(c)}>{c}</button>
          ))}
        </div>
        <Input label="Value" type="number" value={value} onChange={(e) => setValue(e.target.value)} placeholder="e.g. 1000" />
        <div className="grid-2">
          <div>
            <label className="field-label">From</label>
            <select className="input-select" value={fromUnit} onChange={(e) => setFromUnit(e.target.value)}>
              {unitKeys.map((k) => <option key={k} value={k}>{units[k as keyof typeof units].label}</option>)}
            </select>
          </div>
          <div>
            <label className="field-label">To</label>
            <select className="input-select" value={toUnit} onChange={(e) => setToUnit(e.target.value)}>
              {unitKeys.map((k) => <option key={k} value={k}>{units[k as keyof typeof units].label}</option>)}
            </select>
          </div>
        </div>
        <Button onClick={() => handleConvert()} magnetic style={{ width: '100%', marginTop: 16 }}>Convert Units</Button>
        <button className="btn-demo-fill" onClick={fillExample}>Try Example</button>
        <div className="result-display">
          <div className="result-highlight">{result}</div>
          <p className="result-subtitle">{value} {units[fromUnit as keyof typeof units].label} = {result} {units[toUnit as keyof typeof units].label}</p>
        </div>
      </Card>
          {/* ── SEO Content Sections ── */}
      <div className="seo-content">

        <section className="seo-section">
          <h2>How the Unit Converter Works</h2>
          <p>This tool converts measurements across common categories including length, mass/weight, area, volume, and temperature. Simply select a measurement category, select the input and output units, and type the value to see the converted result instantly.</p>
        </section>

        <section className="seo-section">
          <h2>Formula Used</h2>
          <div className="seo-formula" style={{ whiteSpace: 'pre-line' }}>
            {"Result = Input Value × Conversion Factor\n(For temperature: °F = °C × 1.8 + 32, etc.)"}
          </div>
          <dl className="seo-formula-vars">
            <dt>Input Value</dt>
            <dd>— the numeric magnitude of the measurement in the starting unit</dd>
            <dt>Conversion Factor</dt>
            <dd>— the mathematical constant multiplier between the two selected units</dd>
            <dt>Result</dt>
            <dd>— the equivalent measurement magnitude expressed in the destination unit</dd>
          </dl>
        </section>

        <section className="seo-section">
          <h2>Example Calculation</h2>
          <p>To convert 10 inches to centimetres, select Length. The conversion factor from inches to cm is 2.54. Result = 10 × 2.54 = 25.4 cm. The calculator displays this exact conversion.</p>
        </section>

        <section className="seo-section">
          <h2>Frequently Asked Questions</h2>
          <FAQAccordion items={unitConverterFAQ} />
        </section>

      </div>
    </PageTransition>
  );
}
