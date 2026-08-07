import { useState, useCallback, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import FAQAccordion, { type FAQItem } from '@/components/ui/FAQAccordion';
import PageTransition from '@/components/ui/PageTransition';
import SEO from '@/components/ui/SEO';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { useToolTracking } from '@/hooks/useScroll';
import { formatDisplay, formatResult, evaluate, pressKey } from '@/lib/calculators/scientific';
import { addHistory } from '@/lib/storage';
import { Copy, Check, History, RotateCcw, Delete, ArrowLeft } from 'lucide-react';
import '@/styles/components.css';

const scientificCalculatorFAQ: FAQItem[] = [
  {
    "question": "What is the difference between DEG and RAD mode?",
    "answer": "In Degree mode, angles are measured in degrees (a full circle = 360°). In Radian mode, angles are measured in radians (a full circle = 2π ≈ 6.283). Trigonometric functions like sin and cos give different results depending on which mode is active."
  },
  {
    "question": "How do I calculate factorial (n!)?",
    "answer": "Enter the number first, then press the n! button. For example, to calculate 6!, press 6 then n! to get 720. Results beyond approximately 170! exceed JavaScript's maximum number and will return Infinity."
  },
  {
    "question": "What is the memory function (M+, MR, MC) used for?",
    "answer": "Memory lets you store an intermediate result and recall it later. M+ adds the current result to memory, MR pastes the stored value into the current expression, and MC clears the memory."
  },
  {
    "question": "How do I enter scientific notation like 2.5 × 10⁶?",
    "answer": "Use the EXP button (or type 'e' in the expression) to enter the exponent separator. For 2.5 × 10⁶, press 2.5 EXP 6. The calculator interprets this as 2.5 × 10^6 = 2,500,000."
  },
  {
    "question": "Why does my result show 'Error' instead of a number?",
    "answer": "An Error result usually means the expression is mathematically undefined or malformed. Common causes include dividing by zero (e.g. 1 ÷ 0), taking the square root of a negative number, or unbalanced parentheses."
  }
];

export default function ScientificCalculator() {
  useToolTracking('scientific-calculator', 'Scientific Calculator');
  const [expr, setExpr] = useState('');
  const [justEvaluated, setJustEvaluated] = useState(false);
  const [isDeg, setIsDeg] = useState(true);
  const [memory, setMemory] = useState(0);
  const [hasMemory, setHasMemory] = useState(false);
  const [history, setHistory] = useState<{ expr: string; result: string }[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [copied, setCopied] = useState(false);
  const [activeExpr, setActiveExpr] = useState(''); // Stores the expression before evaluation for top row display

  const press = useCallback((ch: string) => {
    setCopied(false);
    const { expr: newExpr, justEvaluated: newJust } = pressKey(expr, ch, justEvaluated);
    setExpr(newExpr);
    setJustEvaluated(newJust);
  }, [expr, justEvaluated]);

  const backspace = () => {
    setCopied(false);
    setExpr((e) => e.slice(0, -1));
    setJustEvaluated(false);
  };

  const clearAll = () => {
    setCopied(false);
    setExpr('');
    setActiveExpr('');
    setJustEvaluated(false);
  };

  const doEquals = () => {
    if (!expr) return;
    try {
      const result = evaluate(expr, isDeg);
      const formatted = formatResult(result);
      const displayExpr = formatDisplay(expr);
      setActiveExpr(displayExpr);
      setHistory((h) => [{ expr: displayExpr, result: formatted }, ...h].slice(0, 20));
      addHistory({
        tool: 'Scientific Calculator',
        toolSlug: 'scientific-calculator',
        expression: displayExpr,
        result: formatted,
      });
      setExpr(formatted);
      setJustEvaluated(true);
    } catch {
      
      // Shake animation effect is handled in class names
      const displayElement = document.getElementById('calc-display-box');
      if (displayElement) {
        displayElement.classList.add('shake');
        setTimeout(() => displayElement.classList.remove('shake'), 400);
      }
    }
  };

  const memoryAdd = () => {
    try {
      const val = evaluate(expr || '0', isDeg);
      setMemory((m) => m + val);
      setHasMemory(true);
      
    } catch {  }
  };

  const memorySub = () => {
    try {
      const val = evaluate(expr || '0', isDeg);
      setMemory((m) => m - val);
      setHasMemory(true);
      
    } catch {  }
  };

  const memoryRecall = () => {
    if (hasMemory) {
      setExpr(String(memory));
      setJustEvaluated(false);
    }
  };

  const memoryClear = () => {
    setMemory(0);
    setHasMemory(false);
    
  };

  const copyToClipboard = async () => {
    if (!expr) return;
    try {
      await navigator.clipboard.writeText(expr);
      setCopied(true);
      
      setTimeout(() => setCopied(false), 2000);
    } catch {
      
    }
  };

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (/[0-9.+\-*/%^()]/.test(e.key)) {
        e.preventDefault();
        press(e.key);
      }
      else if (e.key === 'Enter' || e.key === '=') { e.preventDefault(); doEquals(); }
      else if (e.key === 'Backspace') { e.preventDefault(); backspace(); }
      else if (e.key === 'Escape') { e.preventDefault(); clearAll(); }
      else if (e.key.toLowerCase() === 'c' && e.ctrlKey) {
        e.preventDefault();
        copyToClipboard();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  });

  const display = formatDisplay(expr);

  return (
    <PageTransition className="page-medium">
      <SEO title="Free Scientific Calculator" description="A free online scientific calculator with trigonometric, logarithmic, and exponential functions, formula parsing, and computation history." path="/scientific-calculator" faqSchema={scientificCalculatorFAQ} />

      <Link to="/" className="back-link">
        <ArrowLeft size={16} />
        Back to tools
      </Link>

      <div className="tool-header">
        <div className="eyebrow">Math</div>
        <h1 className="page-title text-gradient">Scientific Calculator</h1>
        <p className="page-lede">Precision arithmetic, trigonometric functions, memory settings & live calculation history.</p>
      </div>

      <Card padding="lg" className="calc-wrapper">
        <div className="calc-header-controls" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <div className="calc-memory">
            {hasMemory && (
              <span className="calc-memory-ind">M = {formatResult(memory)}</span>
            )}
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <Button
              size="sm"
              variant="ghost"
              onClick={copyToClipboard}
              disabled={!expr}
              aria-label="Copy result"
              style={{ padding: '6px 10px', height: 'auto', opacity: expr ? 1 : 0.4 }}
            >
              {copied ? <Check size={14} style={{ color: 'var(--success)' }} /> : <Copy size={14} />}
            </Button>
            <Button
              size="sm"
              variant={showHistory ? 'primary' : 'ghost'}
              onClick={() => setShowHistory(!showHistory)}
              aria-label="Toggle history"
              style={{ padding: '6px 10px', height: 'auto' }}
            >
              <History size={14} />
            </Button>
          </div>
        </div>

        <div id="calc-display-box" className="calc-display" role="status" aria-live="polite" aria-label="Calculator display">
          <div className="calc-expression">{activeExpr}</div>
          <div className="calc-result" style={justEvaluated ? { background: 'linear-gradient(135deg, var(--gradient-1), var(--gradient-2))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', fontWeight: 800 } : {}}>
            {display}
          </div>
        </div>

        <div className="calc-keypad sci">
          {[
            ['MC', memoryClear], ['MR', memoryRecall], ['M+', memoryAdd], ['M−', memorySub],
            ['sin', () => press('sin(')], ['cos', () => press('cos(')],
          ].map(([label, action]) => (
            <motion.button key={label as string} className="calc-key fn" onClick={action as () => void} whileTap={{ scale: 0.94 }}>
              {label as string}
            </motion.button>
          ))}
        </div>
        <div className="calc-keypad sci">
          {[
            ['tan', () => press('tan(')], ['log', () => press('log(')], ['ln', () => press('ln(')],
            ['√', () => press('√(')], ['^', () => press('^')], ['π', () => press('π')],
          ].map(([label, action]) => (
            <motion.button key={label as string} className="calc-key fn" onClick={action as () => void} whileTap={{ scale: 0.94 }}>
              {label as string}
            </motion.button>
          ))}
        </div>
        <div className="calc-keypad sci">
          {[
            ['(', () => press('(')], [')', () => press(')')], ['e', () => press('e')],
            ['%', () => press('%')], ['DEG', () => setIsDeg(!isDeg)],
            [isDeg ? 'RAD' : 'DEG', () => setIsDeg(!isDeg)], // Swap mode key
          ].map(([label, action], idx) => {
            // Only render 6 buttons. Let's filter DEG/RAD and show the active one.
            if (idx === 4) return null; // Skip duplicate DEG
            return (
              <motion.button
                key={label as string}
                className={`calc-key fn ${label === (isDeg ? 'DEG' : 'RAD') ? 'active-mode' : ''}`}
                onClick={action as () => void}
                whileTap={{ scale: 0.94 }}
              >
                {label === (isDeg ? 'DEG' : 'RAD') ? (isDeg ? 'DEG' : 'RAD') : label as string}
              </motion.button>
            );
          })}
        </div>

        <div className="calc-keypad" style={{ marginTop: 10 }}>
          {[
            ['C', clearAll, 'fn'], ['⌫', backspace, 'op'], ['±', () => press('-'), 'op'], ['÷', () => press('/'), 'op'],
            ['7', () => press('7'), ''], ['8', () => press('8'), ''], ['9', () => press('9'), ''], ['×', () => press('*'), 'op'],
            ['4', () => press('4'), ''], ['5', () => press('5'), ''], ['6', () => press('6'), ''], ['−', () => press('-'), 'op'],
            ['1', () => press('1'), ''], ['2', () => press('2'), ''], ['3', () => press('3'), ''], ['+', () => press('+'), 'op'],
            ['0', () => press('0'), ' wide'], ['.', () => press('.'), ''], ['=', doEquals, 'equals'],
          ].map(([label, action, cls]) => {
            let iconElement = null;
            if (label === '⌫') iconElement = <Delete size={16} />;
            if (label === 'C') iconElement = <RotateCcw size={16} />;

            return (
              <motion.button
                key={label as string}
                className={`calc-key ${cls || ''}`}
                onClick={action as () => void}
                whileTap={{ scale: 0.94 }}
              >
                {iconElement || label as string}
              </motion.button>
            );
          })}
        </div>

        <AnimatePresence>
          {showHistory && (
            <motion.div
              className="calc-history"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
            >
              <h3 className="result-title" style={{ marginTop: 8 }}>Calculation History</h3>
              {history.length === 0 ? (
                <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', textAlign: 'center', padding: '16px 0' }}>No history yet.</p>
              ) : (
                history.map((h, i) => (
                  <motion.div
                    key={i}
                    className="calc-history-item"
                    onClick={() => { setExpr(h.result); setJustEvaluated(false); }}
                    role="button"
                    tabIndex={0}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                  >
                    <span className="calc-history-expr" style={{ color: 'var(--text-secondary)' }}>{h.expr} =</span>
                    <span className="calc-history-result" style={{ fontWeight: 600 }}>{h.result}</span>
                  </motion.div>
                ))
              )}
            </motion.div>
          )}
        </AnimatePresence>
        
        <button
          className="btn-demo-fill"
          onClick={() => {
            const sample = '(5+3)*12/sin(30)';
            setExpr(sample);
            setJustEvaluated(false);
            try {
              const result = evaluate(sample, isDeg);
              const formatted = formatResult(result);
              const displayExpr = formatDisplay(sample);
              setActiveExpr(displayExpr);
              setHistory((h) => [{ expr: displayExpr, result: formatted }, ...h].slice(0, 20));
              addHistory({
                tool: 'Scientific Calculator',
                toolSlug: 'scientific-calculator',
                expression: displayExpr,
                result: formatted,
              });
              setExpr(formatted);
              setJustEvaluated(true);
            } catch {}
          }}
          style={{ marginTop: 16 }}
        >
          Try Example
        </button>
      </Card>

      <Card padding="md" style={{ marginTop: 24, maxWidth: 460, margin: '24px auto 0' }}>
        <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
          <strong>Keyboard Guide:</strong> Number keys, standard operations (+, -, *, /), parentheses, and decimals are mapped. Press <code>Enter</code> to evaluate, <code>Backspace</code> to delete, and <code>Ctrl+C</code> to copy result.
        </p>
      </Card>
            {/* ── SEO Content Sections ── */}
      <div className="seo-content">

        <section className="seo-section">
          <h2>How the Scientific Calculator Works</h2>
          <p>This calculator evaluates mathematical expressions using standard operator precedence (PEMDAS/BODMAS): exponents are evaluated first, then multiplication and division left to right, then addition and subtraction. Parentheses override this order, allowing complex nested expressions to be entered.</p>
        </section>

        <section className="seo-section">
          <h2>Formula Used</h2>
          <div className="seo-formula" style={{ whiteSpace: 'pre-line' }}>
            {"Expression → Tokenise → Parse (respecting precedence) → Evaluate → Result"}
          </div>
          <dl className="seo-formula-vars">
            <dt>Tokenise</dt>
            <dd>— the input string is split into numbers, operators, functions, and parentheses</dd>
            <dt>Parse</dt>
            <dd>— a recursive-descent or shunting-yard algorithm arranges tokens by precedence and associativity</dd>
            <dt>Evaluate</dt>
            <dd>— the resulting expression tree is evaluated; trig functions use the selected angle unit (deg/rad)</dd>
            <dt>Precision</dt>
            <dd>— results are displayed up to 10 significant digits, with trailing zeros trimmed for readability</dd>
          </dl>
        </section>

        <section className="seo-section">
          <h2>Example Calculation</h2>
          <p>To calculate the hypotenuse of a right triangle with legs of length 3 and 4, you can use the Pythagorean theorem directly: enter √(3² + 4²) as √(3^2 + 4^2). The calculator evaluates 3² = 9, 4² = 16, 9 + 16 = 25, then √25 = 5.</p>
        </section>

        <section className="seo-section">
          <h2>Frequently Asked Questions</h2>
          <FAQAccordion items={scientificCalculatorFAQ} />
        </section>

      </div>
    </PageTransition>
  );
}
