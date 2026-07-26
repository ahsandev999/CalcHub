import { useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import PageTransition from '@/components/ui/PageTransition';
import SEO from '@/components/ui/SEO';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { useToolTracking } from '@/hooks/useScroll';
import '@/styles/components.css';

const CHARSETS = {
  lowercase: 'abcdefghijklmnopqrstuvwxyz',
  uppercase: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
  numbers: '0123456789',
  symbols: '!@#$%^&*()_+-=[]{}|;:,.<>?',
};

function generatePassword(len: number, opts: Record<string, boolean>): string {
  let chars = '';
  if (opts.lowercase) chars += CHARSETS.lowercase;
  if (opts.uppercase) chars += CHARSETS.uppercase;
  if (opts.numbers) chars += CHARSETS.numbers;
  if (opts.symbols) chars += CHARSETS.symbols;
  if (!chars) return '';

  const arr = new Uint32Array(len);
  crypto.getRandomValues(arr);
  return Array.from(arr, (v) => chars[v % chars.length]).join('');
}

function getStrength(pw: string): { score: number; label: string } {
  let score = 0;
  if (pw.length >= 8) score++;
  if (pw.length >= 12) score++;
  if (pw.length >= 16) score++;
  if (/[a-z]/.test(pw) && /[A-Z]/.test(pw)) score++;
  if (/\d/.test(pw)) score++;
  if (/[^a-zA-Z0-9]/.test(pw)) score++;
  const labels = ['Weak', 'Fair', 'Good', 'Strong', 'Very Strong'];
  return { score: Math.min(score, 4), label: labels[Math.min(score, 4)] };
}

export default function PasswordGenerator() {
  useToolTracking('password-generator', 'Password Generator');  const [length, setLength] = useState(16);
  const [opts, setOpts] = useState({ lowercase: true, uppercase: true, numbers: true, symbols: true });
  const [password, setPassword] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);

  const generate = useCallback(() => {
    const pw = generatePassword(length, opts);
    if (!pw) {
      setValidationError('Select at least one character type.');
      return;
    }
    setValidationError(null);
    setPassword(pw);
  }, [length, opts]);

  const copy = async () => {
    if (!password) return;
    await navigator.clipboard.writeText(password);
    
  };

  const strength = password ? getStrength(password) : null;
  const strengthColors = ['var(--error)', 'var(--warning)', 'var(--accent)', 'var(--success)', 'var(--success)'];

  return (
    <PageTransition className="page-medium">
      <SEO title="Password Generator" description="Generate secure, customizable passwords." path="/password-generator" />
      <Link to="/" className="back-link">← Back to tools</Link>
      <div className="tool-header">
        <div className="eyebrow">Utility</div>
        <h1 className="page-title">Password Generator</h1>
        <p className="page-lede">Create strong, secure passwords instantly.</p>
      </div>
      <Card padding="lg">
        <div className="password-display" aria-live="polite">{password || 'Click generate'}</div>
        {strength && (
          <>
            <div className="strength-bar"><div className="strength-fill" style={{ width: `${(strength.score + 1) * 20}%`, background: strengthColors[strength.score] }} /></div>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginBottom: 16 }}>Strength: {strength.label}</p>
          </>
        )}
        <div style={{ marginBottom: 16 }}>
          <label className="field-label">Length: {length}</label>
          <input type="range" min="8" max="64" value={length} onChange={(e) => setLength(parseInt(e.target.value))} style={{ width: '100%' }} aria-label="Password length" />
        </div>
        <div className="grid-2" style={{ marginBottom: 24 }}>
          {Object.entries(opts).map(([key, val]) => (
            <label key={key} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.875rem', cursor: 'pointer' }}>
              <input type="checkbox" checked={val} onChange={(e) => { setOpts({ ...opts, [key]: e.target.checked }); setValidationError(null); }} />
              {key.charAt(0).toUpperCase() + key.slice(1)}
            </label>
          ))}
        </div>
        {validationError && <p className="input-message input-message-error" role="alert">{validationError}</p>}
        <div className="time-controls">
          <Button onClick={generate} magnetic >Generate</Button>
          <Button onClick={copy} variant="secondary" disabled={!password}>Copy</Button>
        </div>
      </Card>
    </PageTransition>
  );
}
