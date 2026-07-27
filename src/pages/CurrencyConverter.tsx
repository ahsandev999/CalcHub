import { useState, useEffect, useMemo, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import FAQAccordion, { type FAQItem } from '@/components/ui/FAQAccordion';
import PageTransition from '@/components/ui/PageTransition';
import SEO from '@/components/ui/SEO';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { useToolTracking } from '@/hooks/useScroll';
import { addHistory } from '@/lib/storage';
import { ArrowLeftRight, ArrowLeft, RefreshCw, Copy, Check, Globe } from 'lucide-react';
import '@/styles/components.css';

const POPULAR_CURRENCIES: Record<string, { code: string; name: string; symbol: string }> = {
  USD: { code: 'USD', name: 'US Dollar', symbol: '$' },
  EUR: { code: 'EUR', name: 'Euro', symbol: '€' },
  GBP: { code: 'GBP', name: 'British Pound', symbol: '£' },
  JPY: { code: 'JPY', name: 'Japanese Yen', symbol: '¥' },
  AUD: { code: 'AUD', name: 'Australian Dollar', symbol: 'A$' },
  CAD: { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$' },
  CHF: { code: 'CHF', name: 'Swiss Franc', symbol: 'CHF' },
  CNY: { code: 'CNY', name: 'Chinese Yuan', symbol: '¥' },
  INR: { code: 'INR', name: 'Indian Rupee', symbol: '₹' },
  BRL: { code: 'BRL', name: 'Brazilian Real', symbol: 'R$' },
  MXN: { code: 'MXN', name: 'Mexican Peso', symbol: 'Mex$' },
  SGD: { code: 'SGD', name: 'Singapore Dollar', symbol: 'S$' },
  HKD: { code: 'HKD', name: 'Hong Kong Dollar', symbol: 'HK$' },
  NZD: { code: 'NZD', name: 'New Zealand Dollar', symbol: 'NZ$' },
  KRW: { code: 'KRW', name: 'South Korean Won', symbol: '₩' },
  TRY: { code: 'TRY', name: 'Turkish Lira', symbol: '₺' },
};

const FALLBACK_RATES: Record<string, number> = {
  USD: 1.0,
  EUR: 0.92,
  GBP: 0.78,
  JPY: 157.8,
  AUD: 1.51,
  CAD: 1.37,
  CHF: 0.90,
  CNY: 7.26,
  INR: 83.5,
  BRL: 5.3,
  MXN: 18.2,
  SGD: 1.35,
  HKD: 7.8,
  NZD: 1.63,
  KRW: 1378.0,
  TRY: 32.5,
};

const currencyConverterFAQ: FAQItem[] = [
  {
    "question": "How are exchange rates determined?",
    "answer": "Exchange rates are determined by the global foreign exchange market, where currencies are traded 24/7. Rates float constantly based on supply and demand, interest rates, inflation, and economic health."
  },
  {
    "question": "What is a fiat currency?",
    "answer": "Fiat currency is government-issued money that is not backed by a physical commodity like gold, but by the trust in the issuing government (e.g., USD, EUR, GBP)."
  },
  {
    "question": "Why do currency exchanges charge fees?",
    "answer": "Banks and exchange kiosks buy and sell currencies at slightly different rates (the spread) or charge transaction commissions to cover operational costs and turn a profit."
  },
  {
    "question": "Does this converter work offline?",
    "answer": "This tool requires an active internet connection to fetch the latest conversion rates from the API, ensuring you get accurate, up-to-date conversion values."
  },
  {
    "question": "What is the base currency?",
    "answer": "In exchange rate pairs (e.g. USD/EUR), the first currency (USD) is the base currency, and the second (EUR) is the quote currency. The rate tells you how much quote currency is needed to buy one unit of the base currency."
  }
];

export default function CurrencyConverter() {
  useToolTracking('currency-converter', 'Currency Converter');
  const [amount, setAmount] = useState('100');
  const [fromCurrency, setFromCurrency] = useState('USD');
  const [toCurrency, setToCurrency] = useState('EUR');
  const [rates, setRates] = useState<Record<string, number>>(FALLBACK_RATES);
  const [loading, setLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<string>('Offline Fallback');
  const [copied, setCopied] = useState(false);
  const [amountError, setAmountError] = useState<string | null>(null);

  const fetchRates = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const res = await fetch('https://open.er-api.com/v6/latest/USD');
      if (!res.ok) throw new Error('API request failed');
      const data = await res.json();
      if (data && data.rates) {
        setRates(data.rates);
        const dateStr = new Date(data.time_last_update_utc).toLocaleString();
        setLastUpdated(dateStr);
      }
    } catch {
      setRates(FALLBACK_RATES);
      setLastUpdated('Offline Fallback');
    } finally {
      if (!silent) setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRates(true);
  }, [fetchRates]);

  const convertedAmount = useMemo(() => {
    const amt = parseFloat(amount);
    if (isNaN(amt) || amt <= 0) return 0;
    
    // We convert the amount fromFrom to USD, then from USD to To
    const fromRate = rates[fromCurrency] || FALLBACK_RATES[fromCurrency];
    const toRate = rates[toCurrency] || FALLBACK_RATES[toCurrency];
    
    if (!fromRate || !toRate) return 0;
    
    const amountInUSD = amt / fromRate;
    return Math.round((amountInUSD * toRate) * 100) / 100;
  }, [amount, fromCurrency, toCurrency, rates]);

  const handleSwap = () => {
    setFromCurrency(toCurrency);
    setToCurrency(fromCurrency);
  };

  const handleCalculate = () => {
    const amt = parseFloat(amount);
    if (isNaN(amt) || amt <= 0) {
      setAmountError('Please enter a valid amount.');
      return;
    }
    setAmountError(null);

    addHistory({
      tool: 'Currency Converter',
      toolSlug: 'currency-converter',
      expression: `${amount} ${fromCurrency} to ${toCurrency}`,
      result: `${POPULAR_CURRENCIES[toCurrency].symbol}${convertedAmount.toLocaleString()}`,
    });
    
    
  };

  const copyResultText = async () => {
    if (convertedAmount <= 0) return;
    const text = `${amount} ${fromCurrency} = ${convertedAmount} ${toCurrency}\nRates last updated: ${lastUpdated}`;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      
      setTimeout(() => setCopied(false), 2000);
    } catch {
      
    }
  };

  return (
    <PageTransition className="page-medium">
      <SEO title="Currency Converter" description="Convert currency values in real-time using live global exchange rates API." path="/currency-converter" faqSchema={currencyConverterFAQ} />

      <Link to="/" className="back-link">
        <ArrowLeft size={16} />
        Back to tools
      </Link>

      <div className="tool-header">
        <div className="eyebrow">Converter</div>
        <h1 className="page-title text-gradient">Currency Converter</h1>
        <p className="page-lede">Instantly convert between major global currencies using live, up-to-the-minute API exchange rates.</p>
      </div>

      <Card padding="lg">
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => fetchRates(false)}
            disabled={loading}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: '0.8125rem', padding: '6px 12px' }}
          >
            <RefreshCw size={12} className={loading ? 'spin-anim' : ''} style={{ animation: loading ? 'spin 1s infinite linear' : 'none' }} />
            Refresh Rates
          </Button>
        </div>

        <div className="grid-3" style={{ alignItems: 'end', marginBottom: 24 }}>
          <Input
            label="Amount to Convert"
            type="number"
            value={amount}
            onChange={(e) => { setAmount(e.target.value); setAmountError(null); }}
            min="0"
            style={{ marginBottom: 0 }}
            error={amountError || undefined}
          />

          <div>
            <label className="field-label">From</label>
            <select
              className="input-select"
              value={fromCurrency}
              onChange={(e) => setFromCurrency(e.target.value)}
              style={{ marginTop: 0 }}
            >
              {Object.values(POPULAR_CURRENCIES).map((c) => (
                <option key={c.code} value={c.code}>
                  {c.code} — {c.name}
                </option>
              ))}
            </select>
          </div>

          <div style={{ display: 'flex', justifyContent: 'center', alignSelf: 'center', paddingBottom: 6 }}>
            <motion.button
              className="calc-key op"
              onClick={handleSwap}
              aria-label="Swap currencies"
              whileHover={{ scale: 1.1, rotate: 180 }}
              whileTap={{ scale: 0.9 }}
              transition={{ duration: 0.3 }}
              style={{
                width: 44,
                height: 44,
                borderRadius: '50%',
                padding: 0,
                background: 'var(--bg-subtle)',
                border: '1px solid var(--border)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
              }}
            >
              <ArrowLeftRight size={16} style={{ transform: 'rotate(90deg)' }} />
            </motion.button>
          </div>

          <div>
            <label className="field-label">To</label>
            <select
              className="input-select"
              value={toCurrency}
              onChange={(e) => setToCurrency(e.target.value)}
              style={{ marginTop: 0 }}
            >
              {Object.values(POPULAR_CURRENCIES).map((c) => (
                <option key={c.code} value={c.code}>
                  {c.code} — {c.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <Button onClick={handleCalculate} magnetic style={{ width: '100%' }}>
          Convert Currency
        </Button>

        <AnimatePresence>
          {convertedAmount > 0 && (
            <motion.div
              className="result-display"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ duration: 0.4 }}
            >
              <div className="result-highlight-wrap">
                <h3 className="result-title">Conversion Result</h3>
                <Button size="sm" variant="ghost" onClick={copyResultText} style={{ padding: '6px 10px', height: 'auto' }}>
                  {copied ? <Check size={14} style={{ color: 'var(--success)' }} /> : <Copy size={14} />}
                  <span style={{ marginLeft: 6 }}>Copy Result</span>
                </Button>
              </div>
              <div className="result-highlight">
                {POPULAR_CURRENCIES[toCurrency].symbol}
                {convertedAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
              <p className="result-subtitle">
                <strong>{amount} {fromCurrency}</strong> is approximately equal to{' '}
                <strong>
                  {convertedAmount} {toCurrency}
                </strong>
                <br />
                <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 6, marginTop: 8 }}>
                  <Globe size={12} />
                  Rates updated: {lastUpdated}
                </span>
              </p>

              <div className="result-grid">
                <div className="result-slot">
                  <span className="label">1 {fromCurrency} =</span>
                  <span className="value">
                    {POPULAR_CURRENCIES[toCurrency].symbol}
                    {((rates[toCurrency] || FALLBACK_RATES[toCurrency]) / (rates[fromCurrency] || FALLBACK_RATES[fromCurrency])).toFixed(4)}
                  </span>
                </div>
                <div className="result-slot">
                  <span className="label">1 {toCurrency} =</span>
                  <span className="value">
                    {POPULAR_CURRENCIES[fromCurrency].symbol}
                    {((rates[fromCurrency] || FALLBACK_RATES[fromCurrency]) / (rates[toCurrency] || FALLBACK_RATES[toCurrency])).toFixed(4)}
                  </span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>
          {/* ── SEO Content Sections ── */}
      <div className="seo-content">

        <section className="seo-section">
          <h2>How the Currency Converter Works</h2>
          <p>This calculator converts currency values between major global currencies using exchange rates. Select the starting currency, the target currency, and enter the amount to see the converted total.</p>
        </section>

        <section className="seo-section">
          <h2>Formula Used</h2>
          <div className="seo-formula" style={{ whiteSpace: 'pre-line' }}>
            {"Target Amount = Source Amount × Exchange Rate"}
          </div>
          <dl className="seo-formula-vars">
            <dt>Source Amount</dt>
            <dd>— the amount of money in the original currency</dd>
            <dt>Exchange Rate</dt>
            <dd>— the ratio value indicating how much of the target currency is obtained per unit of the source currency</dd>
            <dt>Target Amount</dt>
            <dd>— the equivalent value in the target currency, rounded to two decimal places</dd>
          </dl>
        </section>

        <section className="seo-section">
          <h2>Example Calculation</h2>
          <p>To convert $100 USD to Euros (EUR) with an exchange rate of 0.92: Target Amount = 100 × 0.92 = €92.00. The calculator displays this equivalent value.</p>
        </section>

        <section className="seo-section">
          <h2>Frequently Asked Questions</h2>
          <FAQAccordion items={currencyConverterFAQ} />
        </section>

      </div>
    </PageTransition>
  );
}
