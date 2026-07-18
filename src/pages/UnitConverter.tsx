import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import PageTransition from '@/components/ui/PageTransition';
import SEO from '@/components/ui/SEO';
import Card from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import { useToolTracking } from '@/hooks/useScroll';
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

export default function UnitConverter() {
  useToolTracking('unit-converter', 'Unit Converter');
  const [category, setCategory] = useState<Cat>('length');
  const [fromUnit, setFromUnit] = useState('m');
  const [toUnit, setToUnit] = useState('km');
  const [value, setValue] = useState('1');

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

  return (
    <PageTransition className="page-medium">
      <SEO title="Unit Converter" description="Convert length, weight, and temperature units instantly." path="/unit-converter" />
      <Link to="/" className="back-link">← Back to tools</Link>
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
        <Input label="Value" type="number" value={value} onChange={(e) => setValue(e.target.value)} />
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
        <div className="result-display">
          <div className="result-highlight">{result}</div>
          <p className="result-subtitle">{value} {units[fromUnit as keyof typeof units].label} = {result} {units[toUnit as keyof typeof units].label}</p>
        </div>
      </Card>
    </PageTransition>
  );
}
