import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import FAQAccordion, { type FAQItem } from '@/components/ui/FAQAccordion';
import PageTransition from '@/components/ui/PageTransition';
import SEO from '@/components/ui/SEO';
import Card from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { useToolTracking } from '@/hooks/useScroll';
import { addHistory } from '@/lib/storage';
import '@/styles/components.css';

function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const m = hex.replace('#', '').match(/^([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i);
  if (!m) return null;
  return { r: parseInt(m[1], 16), g: parseInt(m[2], 16), b: parseInt(m[3], 16) };
}

function rgbToHsl(r: number, g: number, b: number): { h: number; s: number; l: number } {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0;
  const l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
    }
  }
  return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
}

function hslToRgb(h: number, s: number, l: number): { r: number; g: number; b: number } {
  s /= 100; l /= 100;
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs((h / 60) % 2 - 1));
  const m = l - c / 2;
  let r = 0, g = 0, b = 0;
  if (h < 60) { r = c; g = x; }
  else if (h < 120) { r = x; g = c; }
  else if (h < 180) { g = c; b = x; }
  else if (h < 240) { g = x; b = c; }
  else if (h < 300) { r = x; b = c; }
  else { r = c; b = x; }
  return { r: Math.round((r + m) * 255), g: Math.round((g + m) * 255), b: Math.round((b + m) * 255) };
}

function toHex(r: number, g: number, b: number) {
  return '#' + [r, g, b].map((v) => v.toString(16).padStart(2, '0')).join('');
}

const colorConverterFAQ: FAQItem[] = [
  {
    "question": "What is HEX color format?",
    "answer": "HEX is a hexadecimal code used in web design to represent colors. It consists of a '#' followed by three bytes representing Red, Green, and Blue intensities in base-16 (from 00 to FF)."
  },
  {
    "question": "What does HSL stand for?",
    "answer": "HSL stands for Hue, Saturation, and Lightness. Hue is the color type represented as an angle on the color wheel (0-360°). Saturation is the intensity or purity (0-100%). Lightness is the brightness (0-100%)."
  },
  {
    "question": "Which color format is best for CSS?",
    "answer": "All three formats are supported in modern CSS. HEX is popular for static colors. HSL is often preferred by designers because it is easier to adjust brightness or saturation dynamically using variables."
  },
  {
    "question": "What is RGB color model?",
    "answer": "RGB is an additive color model where red, green, and blue light are added together in various proportions to produce a broad array of colors. It is the standard format for digital displays."
  },
  {
    "question": "Why do some conversions look slightly different?",
    "answer": "Floating-point rounding when converting between base-256 RGB values and base-100 HSL percentages can cause minor rounding differences, but they are visually identical."
  }
];

export default function ColorConverter() {
  useToolTracking('color-converter', 'Color Converter');
  const [hex, setHex] = useState('#6366f1');
  const [rgb, setRgb] = useState({ r: 99, g: 102, b: 241 });
  const [hsl, setHsl] = useState({ h: 239, s: 84, l: 67 });

  const preview = useMemo(() => {
    const c = hexToRgb(hex);
    return c ? `rgb(${c.r}, ${c.g}, ${c.b})` : hex;
  }, [hex]);

  const updateFromHex = (val: string) => {
    setHex(val);
    const c = hexToRgb(val);
    if (c) { setRgb(c); setHsl(rgbToHsl(c.r, c.g, c.b)); }
  };

  const updateFromRgb = (key: 'r' | 'g' | 'b', val: number) => {
    const newRgb = { ...rgb, [key]: Math.min(255, Math.max(0, val)) };
    setRgb(newRgb);
    setHex(toHex(newRgb.r, newRgb.g, newRgb.b));
    setHsl(rgbToHsl(newRgb.r, newRgb.g, newRgb.b));
  };

  const updateFromHsl = (key: 'h' | 's' | 'l', val: number) => {
    const newHsl = { ...hsl, [key]: val };
    setHsl(newHsl);
    const c = hslToRgb(newHsl.h, newHsl.s, newHsl.l);
    setRgb(c);
    setHex(toHex(c.r, c.g, c.b));
  };

  const handleConvert = () => {
    addHistory({
      tool: 'Color Converter',
      toolSlug: 'color-converter',
      expression: hex,
      result: `RGB(${rgb.r}, ${rgb.g}, ${rgb.b}) | HSL(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`,
    });
  };

  return (
    <PageTransition className="page-medium">
      <SEO title="Free Color Converter" description="Convert color codes between HEX, RGB, and HSL formats online with this free color tool." path="/color-converter" faqSchema={colorConverterFAQ} />
      <Link to="/" className="back-link">← Back to tools</Link>
      <div className="tool-header">
        <div className="eyebrow">Converter</div>
        <h1 className="page-title">Color Converter</h1>
        <p className="page-lede">Convert between HEX, RGB, and HSL formats.</p>
      </div>
      <Card padding="lg">
        <div className="color-preview" style={{ background: preview }} />
        <Input label="HEX" value={hex} onChange={(e) => updateFromHex(e.target.value)} />
        <div className="grid-3">
          <Input label="R" type="number" value={String(rgb.r)} onChange={(e) => updateFromRgb('r', parseInt(e.target.value) || 0)} min="0" max="255" />
          <Input label="G" type="number" value={String(rgb.g)} onChange={(e) => updateFromRgb('g', parseInt(e.target.value) || 0)} min="0" max="255" />
          <Input label="B" type="number" value={String(rgb.b)} onChange={(e) => updateFromRgb('b', parseInt(e.target.value) || 0)} min="0" max="255" />
        </div>
        <div className="grid-3">
          <Input label="H" type="number" value={String(hsl.h)} onChange={(e) => updateFromHsl('h', parseInt(e.target.value) || 0)} min="0" max="360" />
          <Input label="S %" type="number" value={String(hsl.s)} onChange={(e) => updateFromHsl('s', parseInt(e.target.value) || 0)} min="0" max="100" />
          <Input label="L %" type="number" value={String(hsl.l)} onChange={(e) => updateFromHsl('l', parseInt(e.target.value) || 0)} min="0" max="100" />
        </div>
        <Button onClick={handleConvert} magnetic style={{ width: '100%', marginTop: 16 }}>Convert Color</Button>
        <div className="result-display">
          <p className="result-subtitle">CSS: <code>{preview}</code></p>
        </div>
      </Card>
          {/* ── SEO Content Sections ── */}
      <div className="seo-content">

        <section className="seo-section">
          <h2>How the Color Converter Works</h2>
          <p>This color converter translates color codes between HEX, RGB (Red, Green, Blue), and HSL (Hue, Saturation, Lightness) formats. Enter a value in any format to see the equivalents in the other formats and view a live color preview.</p>
        </section>

        <section className="seo-section">
          <h2>Formula Used</h2>
          <div className="seo-formula" style={{ whiteSpace: 'pre-line' }}>
            {"HEX ↔ RGB ↔ HSL conversion formulas"}
          </div>
          <dl className="seo-formula-vars">
            <dt>HEX</dt>
            <dd>— a six-digit hexadecimal representation of colors (e.g. #3498db)</dd>
            <dt>RGB</dt>
            <dd>— color defined by Red, Green, and Blue intensities from 0 to 255</dd>
            <dt>HSL</dt>
            <dd>— color defined by Hue (0-360°), Saturation (0-100%), and Lightness (0-100%)</dd>
          </dl>
        </section>

        <section className="seo-section">
          <h2>Example Calculation</h2>
          <p>If you enter the HEX value '#3498db', the converter translates it: RGB = (52, 152, 219); HSL = (204°, 70%, 53%). It also displays a blue preview block.</p>
        </section>

        <section className="seo-section">
          <h2>Frequently Asked Questions</h2>
          <FAQAccordion items={colorConverterFAQ} />
        </section>

      </div>
    </PageTransition>
  );
}
