import { useState } from 'react';
import { Link } from 'react-router-dom';
import FAQAccordion, { type FAQItem } from '@/components/ui/FAQAccordion';
import PageTransition from '@/components/ui/PageTransition';
import SEO from '@/components/ui/SEO';
import Card from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import { useToolTracking } from '@/hooks/useScroll';
import '@/styles/components.css';

type Base = 2 | 8 | 10 | 16;

function convertBase(value: string, from: Base, to: Base): string {
  const decimal = parseInt(value, from);
  if (isNaN(decimal)) throw new Error('Invalid number for selected base');
  if (decimal < 0) throw new Error('Only non-negative integers supported');
  return decimal.toString(to).toUpperCase();
}

const BASE_LABELS: Record<Base, string> = { 2: 'Binary', 8: 'Octal', 10: 'Decimal', 16: 'Hexadecimal' };

const numberBaseConverterFAQ: FAQItem[] = [
  {
    "question": "What are number bases?",
    "answer": "A number base is the number of unique digits used to represent numbers. Decimal is base 10 (10 digits). Binary is base 2 (2 digits). Hexadecimal is base 16 (16 digits, adding letters A-F)."
  },
  {
    "question": "Why do computers use binary?",
    "answer": "Computers use binary because digital hardware uses transistors that operate in one of two states: ON (represented as 1) or OFF (represented as 0)."
  },
  {
    "question": "What is hexadecimal used for?",
    "answer": "Hexadecimal is used in computing to represent binary data in a more human-readable format. Since one hex digit represents exactly 4 binary bits, a byte (8 bits) can be written as just two hex digits."
  },
  {
    "question": "How do I convert binary to decimal?",
    "answer": "Multiply each binary digit by its place value (powers of 2) starting from the right (2⁰, 2¹, 2², etc.) and sum the results. For example, 1010 = (1×8) + (0×4) + (1×2) + (0×1) = 10."
  },
  {
    "question": "Can this converter handle decimals?",
    "answer": "This simple base converter is designed for integers. Converting fractions between bases can result in repeating decimals depending on the base."
  }
];

export default function NumberBaseConverter() {
  useToolTracking('number-base-converter', 'Base Converter');
  const [fromBase, setFromBase] = useState<Base>(10);
  const [input, setInput] = useState('255');
  const [results, setResults] = useState<Record<Base, string> | null>(null);
  const [convertError, setConvertError] = useState<string | null>(null);

  const convert = () => {
    try {
      setConvertError(null);
      const r: Record<Base, string> = { 2: '', 8: '', 10: '', 16: '' };
      const bases: Base[] = [2, 8, 10, 16];
      for (const b of bases) {
        r[b] = b === fromBase ? input.toUpperCase() : convertBase(input, fromBase, b);
      }
      setResults(r);
    } catch (e) {
      setConvertError((e as Error).message);
      setResults(null);
    }
  };

  return (
    <PageTransition className="page-medium">
      <SEO title="Free Number Base Converter" description="Convert numbers between binary, octal, decimal, and hexadecimal bases online for free." path="/number-base-converter" faqSchema={numberBaseConverterFAQ} />
      <Link to="/" className="back-link">← Back to tools</Link>
      <div className="tool-header">
        <div className="eyebrow">Converter</div>
        <h1 className="page-title">Base Converter</h1>
        <p className="page-lede">Convert numbers between binary, octal, decimal, and hex.</p>
      </div>
      <Card padding="lg">
        <label className="field-label">Input Base</label>
        <div className="tabs" style={{ marginBottom: 16 }}>
          {([2, 8, 10, 16] as Base[]).map((b) => (
            <button key={b} className={`tab ${fromBase === b ? 'active' : ''}`} onClick={() => { setFromBase(b); setConvertError(null); }}>{BASE_LABELS[b]}</button>
          ))}
        </div>
        <Input label="Number" value={input} onChange={(e) => { setInput(e.target.value); setConvertError(null); }} error={convertError || undefined} />
        <button className="btn btn-primary btn-md" style={{ width: '100%', marginTop: 8 }} onClick={convert}>Convert</button>
        {results && (
          <div className="result-grid" style={{ marginTop: 24 }}>
            {([2, 8, 10, 16] as Base[]).map((b) => (
              <div key={b} className="result-slot">
                <div className="label">{BASE_LABELS[b]}</div>
                <div className="value">{results[b]}</div>
              </div>
            ))}
          </div>
        )}
      </Card>
          {/* ── SEO Content Sections ── */}
      <div className="seo-content">

        <section className="seo-section">
          <h2>How the Number Base Converter Works</h2>
          <p>This tool converts numbers between four common numerical bases: Decimal (base 10), Binary (base 2), Octal (base 8), and Hexadecimal (base 16). Enter a number in any base to see its equivalent value in all other bases.</p>
        </section>

        <section className="seo-section">
          <h2>Formula Used</h2>
          <div className="seo-formula" style={{ whiteSpace: 'pre-line' }}>
            {"Value (Base A) → Decimal (Base 10) → Value (Base B)"}
          </div>
          <dl className="seo-formula-vars">
            <dt>Decimal (Base 10)</dt>
            <dd>— standard human number system using digits 0-9</dd>
            <dt>Binary (Base 2)</dt>
            <dd>— computer system using digits 0 and 1</dd>
            <dt>Octal (Base 8)</dt>
            <dd>— system using digits 0-7, representing groups of 3 bits</dd>
            <dt>Hexadecimal (Base 16)</dt>
            <dd>— system using digits 0-9 and letters A-F, representing groups of 4 bits</dd>
          </dl>
        </section>

        <section className="seo-section">
          <h2>Example Calculation</h2>
          <p>If you enter the Decimal number 42, the converter translates it: Binary = 101010; Octal = 52; Hexadecimal = 2A. All fields update simultaneously.</p>
        </section>

        <section className="seo-section">
          <h2>Frequently Asked Questions</h2>
          <FAQAccordion items={numberBaseConverterFAQ} />
        </section>

      </div>
    </PageTransition>
  );
}
