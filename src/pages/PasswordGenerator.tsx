import { useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import FAQAccordion, { type FAQItem } from '@/components/ui/FAQAccordion';
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

const passwordGeneratorFAQ: FAQItem[] = [
  {
    "question": "What makes a password strong?",
    "answer": "A strong password is long (at least 12-16 characters) and contains a mix of uppercase letters, lowercase letters, numbers, and symbols. Avoiding common dictionary words or predictable patterns is also critical."
  },
  {
    "question": "Is this password generator secure?",
    "answer": "Yes. The passwords are generated locally in your web browser. None of the generated passwords or criteria are sent to any server, meaning your passwords remain private and secure."
  },
  {
    "question": "Why should I avoid duplicate characters?",
    "answer": "Avoiding duplicate characters does not mathematically increase password entropy, but some legacy systems require passwords without consecutive repeating characters. For security, leaving duplicates allowed is generally best."
  },
  {
    "question": "How do I store my passwords safely?",
    "answer": "We recommend using a dedicated, reputable password manager (such as Bitwarden, 1Password, or Dashlane) to store and auto-fill your complex passwords securely across devices."
  },
  {
    "question": "Can a hacker guess a 16-character random password?",
    "answer": "A 16-character password with mixed characters has over 90 bits of entropy. It would take modern supercomputers trillions of years to crack it via brute-force attacks, making it practically uncrackable."
  }
];

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
      <SEO title="Free Password Generator" description="Generate secure, customizable passwords online for free to keep your accounts protected." path="/password-generator" faqSchema={passwordGeneratorFAQ} />
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
          {/* ── SEO Content Sections ── */}
      <div className="seo-content">

        <section className="seo-section">
          <h2>How the Password Generator Works</h2>
          <p>This tool generates secure, randomized passwords based on your criteria. You can specify the password length and choose which character sets to include: uppercase letters, lowercase letters, numbers, and special symbols.</p>
        </section>

        <section className="seo-section">
          <h2>Formula Used</h2>
          <div className="seo-formula" style={{ whiteSpace: 'pre-line' }}>
            {"Password = Random selection of characters from the active pool of enabled character sets"}
          </div>
          <dl className="seo-formula-vars">
            <dt>Length</dt>
            <dd>— the total number of characters in the generated password (recommended minimum is 12-16)</dd>
            <dt>Character Sets</dt>
            <dd>— the individual pools of characters: Lowercase (a-z), Uppercase (A-Z), Numbers (0-9), and Symbols (!@#$%^&*)</dd>
          </dl>
        </section>

        <section className="seo-section">
          <h2>Example Calculation</h2>
          <p>If you choose a length of 12 and enable all character types, the generator builds a pool of 94 possible characters. It randomly selects 12 characters, producing a strong password such as 'K9#pL2x$mW8q'.</p>
        </section>

        <section className="seo-section">
          <h2>Frequently Asked Questions</h2>
          <FAQAccordion items={passwordGeneratorFAQ} />
        </section>

      </div>
    </PageTransition>
  );
}
