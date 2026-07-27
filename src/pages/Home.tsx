import { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { motion, useMotionValue, useSpring, AnimatePresence } from 'framer-motion';
import SEO from '@/components/ui/SEO';
import ToolIcon from '@/components/ui/ToolIcon';
import { TOOLS } from '@/lib/tools';
import { getRecentTools, getToolStats, getHistory, toggleFavorite, clearHistory } from '@/lib/storage';
import { Search, Star, Download, Trash2, Copy, Check, X, History, ChevronDown, ArrowRight, Zap } from 'lucide-react';

import '@/styles/components.css';

// ─── Particle data ────────────────────────────────────────────────────────────
const PARTICLE_COUNT = 40;
const particles = Array.from({ length: PARTICLE_COUNT }, (_, i) => ({
  id: i,
  x: Math.random() * 100,
  y: Math.random() * 100,
  size: Math.random() * 2.5 + 1,
  duration: Math.random() * 8 + 5,
  delay: Math.random() * 6,
  opacity: Math.random() * 0.4 + 0.1,
}));

// ─── AnimatedCounter ─────────────────────────────────────────────────────────
function AnimatedCounter({ value, suffix = '' }: { value: number; suffix?: string }) {
  const [display, setDisplay] = useState(value);
  const ref = useRef<HTMLSpanElement>(null);
  const started = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          const start = performance.now();
          const duration = 1400;
          const animate = (now: number) => {
            const progress = Math.min((now - start) / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            setDisplay(Math.round(value * eased));
            if (progress < 1) requestAnimationFrame(animate);
          };
          requestAnimationFrame(animate);
        }
      },
      { threshold: 0.5 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [value]);

  return (
    <span ref={ref} className="hero-stat-value">
      {display}{suffix}
    </span>
  );
}

// ─── Category config ─────────────────────────────────────────────────────────
const CATEGORY_CONFIG = [
  { id: 'all', label: 'All Tools' },
  { id: 'favorites', label: 'Favorites' },
  { id: 'math', label: 'Math' },
  { id: 'health', label: 'Health' },
  { id: 'time', label: 'Time' },
  { id: 'utility', label: 'Utility' },
  { id: 'converter', label: 'Converters' },
  { id: 'education', label: 'Education' },
] as const;

// ─── Main Component ───────────────────────────────────────────────────────────
export default function Home() {
  const heroRef = useRef<HTMLDivElement>(null);

  // Mouse-follow glow
  const mouseX = useMotionValue(-9999);
  const mouseY = useMotionValue(-9999);
  const glowX = useSpring(mouseX, { stiffness: 60, damping: 20 });
  const glowY = useSpring(mouseY, { stiffness: 60, damping: 20 });

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const rect = heroRef.current?.getBoundingClientRect();
      if (!rect) return;
      mouseX.set(e.clientX - rect.left);
      mouseY.set(e.clientY - rect.top);
    },
    [mouseX, mouseY]
  );

  // Category / search / favorites
  const [category, setCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [favoriteTools, setFavoriteTools] = useState<string[]>(() => {
    try { return JSON.parse(localStorage.getItem('calchub_favorite_tools') || '[]'); }
    catch { return []; }
  });

  // History
  const [calcHistory, setCalcHistory] = useState(() => getHistory());
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isExported, setIsExported] = useState(false);
  const [isCleared, setIsCleared] = useState(false);

  const recent = getRecentTools();
  const stats = getToolStats();

  const toggleFavTool = (slug: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const isFav = favoriteTools.includes(slug);
    const next = isFav ? favoriteTools.filter(s => s !== slug) : [...favoriteTools, slug];
    setFavoriteTools(next);
    localStorage.setItem('calchub_favorite_tools', JSON.stringify(next));
  };

  const toggleFavCalc = (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    toggleFavorite(id);
    setCalcHistory(getHistory());
  };

  const handleClearHistory = () => {
    clearHistory();
    setCalcHistory([]);
    setIsCleared(true);
    setTimeout(() => setIsCleared(false), 2000);
  };

  const handleExport = () => {
    const data = JSON.stringify(calcHistory, null, 2);
    const url = URL.createObjectURL(new Blob([data], { type: 'application/json' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = `calchub-history-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setIsExported(true);
    setTimeout(() => setIsExported(false), 2000);
  };

  const handleCopy = async (id: string, text: string, e: React.MouseEvent) => {
    e.preventDefault();
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch { /* silently fail */ }
  };

  const scrollToCards = () => {
    document.getElementById('cards-section')?.scrollIntoView({ behavior: 'smooth' });
  };

  // Filter tools
  const filtered = useMemo(() => {
    let list = TOOLS;
    if (category === 'favorites') list = TOOLS.filter(t => favoriteTools.includes(t.slug));
    else if (category !== 'all') list = TOOLS.filter(t => t.category === category);
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(t => t.name.toLowerCase().includes(q) || t.description.toLowerCase().includes(q));
    }
    return list;
  }, [category, searchQuery, favoriteTools]);

  const favCount = favoriteTools.length;

  return (
    <>
      <SEO
        title="CalcHub — Free Online Calculators & Tools"
        description="Free, beautiful calculators for everyday life. Scientific math, age, sleep, BMI, timers, converters and more — no sign-up required."
        path="/"
      />

      {/* ═══════════════════════════════════════════════
          DARK HERO SECTION — Fixed premium aesthetic
          ═══════════════════════════════════════════════ */}
      <div className="hero-section" ref={heroRef} onMouseMove={handleMouseMove}>

        {/* Aurora gradient blobs */}
        <div className="hero-aurora" aria-hidden="true">
          <div className="hero-aurora-blob aurora-1" />
          <div className="hero-aurora-blob aurora-2" />
          <div className="hero-aurora-blob aurora-3" />
          <div className="hero-aurora-blob aurora-4" />
        </div>

        {/* Dot grid */}
        <div className="hero-grid" aria-hidden="true" />

        {/* Noise */}
        <div className="hero-noise" aria-hidden="true" />

        {/* Mouse-follow glow */}
        <motion.div
          className="hero-mouse-glow"
          style={{ x: glowX, y: glowY }}
          aria-hidden="true"
        />

        {/* Floating particles */}
        <div className="hero-particles" aria-hidden="true">
          {particles.map(p => (
            <span
              key={p.id}
              className="hero-particle"
              style={{
                left: `${p.x}%`,
                top: `${p.y}%`,
                width: p.size,
                height: p.size,
                opacity: p.opacity,
                '--particle-duration': `${p.duration}s`,
                '--particle-delay': `${p.delay}s`,
              } as React.CSSProperties}
            />
          ))}
        </div>

        {/* ── Hero content ── */}
        <div className="hero-content-wrap">
          <div className="container">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              style={{ maxWidth: 720 }}
            >
              {/* Eyebrow pill */}
              <div className="hero-eyebrow">
                <span className="hero-eyebrow-dot" />
                <Zap size={12} style={{ marginRight: 4 }} />
                15+ Award-Worthy Instruments
              </div>

              {/* Main heading */}
              <h1 className="hero-title">
                Calculators,{' '}
                <span className="hero-title-gradient">reimagined.</span>
              </h1>

              {/* Lede */}
              <p className="hero-lede">
                Beautiful, blazing-fast utilities for the questions you ask every day.
                No accounts, no ads, no friction — just precision, refined.
              </p>

              {/* CTA Buttons */}
              <div className="hero-cta">
                <motion.button
                  className="hero-btn-primary"
                  onClick={scrollToCards}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Explore Instruments
                  <ArrowRight size={18} />
                </motion.button>

                {recent.length > 0 && (
                  <motion.button
                    className="hero-btn-secondary"
                    onClick={() => document.getElementById('recent-section')?.scrollIntoView({ behavior: 'smooth' })}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Recently Used
                    <ChevronDown size={16} />
                  </motion.button>
                )}
              </div>

              {/* Stats row */}
              <motion.div
                className="hero-stats"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              >
                <div className="hero-stat">
                  <AnimatedCounter value={TOOLS.length} />
                  <div className="hero-stat-label">Total Instruments</div>
                </div>
                <div className="hero-stat-divider" />
                <div className="hero-stat">
                  <AnimatedCounter value={stats.totalCalculations} />
                  <div className="hero-stat-label">Calculations Run</div>
                </div>
                <div className="hero-stat-divider" />
                <div className="hero-stat">
                  <span className="hero-stat-value">100%</span>
                  <div className="hero-stat-label">Client-Side Private</div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>

        {/* Scroll indicator */}
        <button className="scroll-indicator" onClick={scrollToCards} aria-label="Scroll to tools">
          <div className="scroll-indicator-line" />
          <ChevronDown size={18} />
        </button>
      </div>

      {/* ═══════════════════════════════════════════════
          SVG WAVE DIVIDER — Dark to Light
          ═══════════════════════════════════════════════ */}
      <div className="wave-divider" aria-hidden="true">
        <svg
          viewBox="0 0 1440 80"
          preserveAspectRatio="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M0,40 C240,80 480,0 720,40 C960,80 1200,0 1440,40 L1440,80 L0,80 Z"
            fill="#fafafa"
          />
        </svg>
      </div>

      {/* ═══════════════════════════════════════════════
          LIGHT CARDS SECTION — Fixed premium aesthetic
          ═══════════════════════════════════════════════ */}
      <div className="cards-section" id="cards-section">
        <div className="container">

          {/* Recently used chips */}
          {recent.length > 0 && (
            <motion.div
              id="recent-section"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              style={{ marginBottom: 56 }}
            >
              <p style={{
                fontFamily: 'var(--font-display)',
                fontSize: '0.75rem',
                fontWeight: 700,
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                color: 'var(--cards-text-muted)',
                marginBottom: 14,
              }}>
                Recently Used
              </p>
              <div className="recent-chips">
                {recent.map(r => {
                  const tool = TOOLS.find(t => t.slug === r.slug);
                  return (
                    <Link
                      key={r.slug}
                      to={`/${r.slug}`}
                      className="recent-chip-light"
                      id={`recent-${r.slug}`}
                      onClick={() => sessionStorage.setItem('calchub_last_clicked', `recent-${r.slug}`)}
                    >
                      <ToolIcon icon={tool?.icon || 'calculator'} size={14} style={{ color: 'var(--cards-accent)' }} />
                      {r.name}
                    </Link>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* Section header */}
          <motion.div
            className="cards-section-header"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="cards-eyebrow">All Instruments</div>
            <h2 className="cards-title">Find the right tool, instantly.</h2>
            <p className="cards-subtitle">
              Every calculator is crafted for precision, speed, and delight.
              Search or browse by category.
            </p>
          </motion.div>

          {/* Search bar */}
          <div className="cards-search-wrap">
            <Search size={18} className="cards-search-icon" />
            <input
              className="cards-search"
              type="text"
              placeholder="Search calculators…"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              aria-label="Search tools"
            />
            <AnimatePresence>
              {searchQuery && (
                <motion.button
                  className="cards-search-clear"
                  onClick={() => setSearchQuery('')}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  aria-label="Clear search"
                >
                  <X size={14} />
                </motion.button>
              )}
            </AnimatePresence>
          </div>

          {/* Category tabs */}
          <div className="cards-tabs" role="tablist">
            {CATEGORY_CONFIG.map(c => (
              <button
                key={c.id}
                role="tab"
                aria-selected={category === c.id}
                className={`cards-tab ${category === c.id ? 'active' : ''}`}
                onClick={() => setCategory(c.id)}
              >
                {c.id === 'favorites' && favCount > 0 ? `★ Favorites (${favCount})` : c.label}
              </button>
            ))}
          </div>

          {/* Tool cards grid */}
          <AnimatePresence mode="popLayout">
            <motion.div
              key={`${category}-${searchQuery}`}
              className="grid-3"
              style={{ minHeight: 480 }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            >
              {filtered.map((tool, i) => {
                const isFav = favoriteTools.includes(tool.slug);
                return (
                  <motion.div
                    key={tool.slug}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.04, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                  >
                    <Link
                      to={`/${tool.slug}`}
                      style={{ display: 'block', height: '100%' }}
                      id={`card-${tool.slug}`}
                      onClick={() => sessionStorage.setItem('calchub_last_clicked', `card-${tool.slug}`)}
                    >
                      <div className="tool-card-light">
                        {/* Featured badge */}
                        {tool.featured && (
                          <span className="tool-card-featured-badge">Featured</span>
                        )}

                        {/* Favorite button */}
                        <button
                          className={`tool-fav-btn-light ${isFav ? 'is-fav' : ''}`}
                          onClick={e => toggleFavTool(tool.slug, e)}
                          style={{ position: 'absolute', top: 20, right: tool.featured ? 90 : 20 }}
                          aria-label={isFav ? 'Remove from favorites' : 'Add to favorites'}
                        >
                          <Star size={14} fill={isFav ? '#f59e0b' : 'transparent'} />
                        </button>

                        {/* Icon */}
                        <div className="tool-card-light-icon">
                          <ToolIcon icon={tool.icon} size={22} />
                        </div>

                        {/* Meta */}
                        <span className="tool-card-light-tag">{tool.category}</span>
                        <h3>{tool.name}</h3>
                        <p>{tool.description}</p>

                        {/* Footer with animated arrow */}
                        <div className="tool-card-light-footer">
                          <div className="tool-card-light-cta">
                            Open Instrument
                            <span className="tool-card-light-arrow">
                              <ArrowRight size={16} />
                            </span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                );
              })}
            </motion.div>
          </AnimatePresence>

          {filtered.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              style={{ textAlign: 'center', padding: '60px 0', color: 'var(--cards-text-muted)' }}
            >
              <div style={{ fontSize: '2.5rem', marginBottom: 16, opacity: 0.3 }}>🔭</div>
              <p style={{ fontSize: '1rem', color: 'var(--cards-text-secondary)' }}>
                No instruments match your search. Try a different keyword or category.
              </p>
            </motion.div>
          )}
        </div>
      </div>

      {/* ═══════════════════════════════════════════════
          HISTORY PANEL — Light section
          ═══════════════════════════════════════════════ */}
      <div className="history-section">
        <div className="container">
          <div className="history-header">
            <div className="history-title">
              <History size={20} style={{ color: 'var(--cards-accent)' }} />
              Calculations Log
            </div>
            {calcHistory.length > 0 && (
              <div className="history-actions">
                <button className="history-action-btn" onClick={handleExport}>
                  {isExported ? <Check size={13} style={{ color: '#10b981' }} /> : <Download size={13} />}
                  {isExported ? 'Exported!' : 'Export JSON'}
                </button>
                <button className="history-action-btn danger" onClick={handleClearHistory}>
                  {isCleared ? <Check size={13} /> : <Trash2 size={13} />}
                  {isCleared ? 'Cleared!' : 'Clear All'}
                </button>
              </div>
            )}
          </div>

          <div className="history-panel">
            {calcHistory.length === 0 ? (
              <div className="history-empty">
                <div className="history-empty-icon">⚙️</div>
                <p style={{ color: 'var(--cards-text-secondary)', fontSize: '0.9375rem' }}>
                  No recent calculations. Open any tool and start calculating — your results appear here.
                </p>
              </div>
            ) : (
              <>
                {calcHistory.slice(0, 8).map(h => {
                  const copyText = `${h.tool}: ${h.expression} = ${h.result}`;
                  return (
                    <div key={h.id} className="history-item">
                      <div className="history-item-info">
                        <div className="history-item-tool">{h.tool}</div>
                        <div className="history-item-expr">
                          {h.expression} ={' '}
                          <span className="history-item-result">{h.result}</span>
                        </div>
                      </div>
                      <div className="history-item-time">
                        {new Date(h.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                      <div className="history-item-actions">
                        <button
                          className="history-icon-btn"
                          onClick={e => handleCopy(h.id, copyText, e)}
                          aria-label="Copy result"
                        >
                          {copiedId === h.id
                            ? <Check size={13} style={{ color: '#10b981' }} />
                            : <Copy size={13} />
                          }
                        </button>
                        <button
                          className={`history-icon-btn ${h.favorite ? 'is-starred' : ''}`}
                          onClick={e => toggleFavCalc(h.id, e)}
                          aria-label="Toggle favorite"
                        >
                          <Star size={13} fill={h.favorite ? '#f59e0b' : 'transparent'} />
                        </button>
                      </div>
                    </div>
                  );
                })}
                {calcHistory.length > 8 && (
                  <div style={{ padding: '14px 24px', textAlign: 'center', borderTop: '1px solid var(--cards-border)', color: 'var(--cards-text-muted)', fontSize: '0.8125rem' }}>
                    Showing 8 of {calcHistory.length} entries — export to view all
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

    </>
  );
}
