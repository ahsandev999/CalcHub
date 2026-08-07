import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useScrollDirection } from '@/hooks/useScroll';
import { Menu, X } from 'lucide-react';
import { TOOLS } from '@/lib/tools';
import ToolIcon from '@/components/ui/ToolIcon';
import ThemeToggle from './ThemeToggle';
import './Navbar.css';

export default function Navbar() {
  const { visible, scrolled } = useScrollDirection();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [isMegaOpen, setIsMegaOpen] = useState(false);
  const isCurrentHome = location.pathname === '/';

  // Close mobile menu on route change
  useEffect(() => {
    setIsOpen(false);
    setIsMegaOpen(false);
  }, [location.pathname]);

  // Prevent background scroll when mobile menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const navClass = [
    'navbar',
    scrolled ? 'navbar-scrolled' : '',
    isCurrentHome && !scrolled ? 'navbar-hero-mode' : '',
    isCurrentHome ? 'navbar-on-home' : '',
    !visible ? 'navbar-hidden' : '',
    isOpen ? 'navbar-mobile-open' : '',
  ]
    .filter(Boolean)
    .join(' ');

  const mathTools = TOOLS.filter(t => t.category === 'math');
  const healthTools = TOOLS.filter(t => t.category === 'health');
  const timeTools = TOOLS.filter(t => t.category === 'time');
  const educationTools = TOOLS.filter(t => t.category === 'education');
  const converterTools = TOOLS.filter(t => t.category === 'converter');
  const utilityTools = TOOLS.filter(t => t.category === 'utility');

  return (
    <header className={navClass}>
      <div className="navbar-inner container">
        <Link to="/" className="navbar-brand" aria-label="CalcHub Home" onClick={() => setIsOpen(false)}>
          <span className="navbar-logo">◈</span>
          <span className="navbar-name">CalcHub</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="navbar-nav" aria-label="Main navigation">
          <div 
            className="navbar-item-with-dropdown"
            onMouseEnter={() => setIsMegaOpen(true)}
            onMouseLeave={() => setIsMegaOpen(false)}
          >
            <Link 
              to="/all-calculators" 
              className="navbar-link"
              onClick={() => setIsMegaOpen(false)}
            >
              All Calculators <span className="dropdown-caret">▾</span>
            </Link>
            
            <div className={`navbar-mega-menu ${isMegaOpen ? 'is-active' : ''}`}>
              <div className="mega-menu-inner">
                
                {/* Column 1: Math */}
                <div className="mega-menu-column">
                  <h4 className="mega-menu-title">Math</h4>
                  <ul className="mega-menu-list">
                    {mathTools.map(t => (
                      <li key={t.slug}>
                        <Link 
                          to={`/${t.slug}`} 
                          className="mega-menu-item"
                          onClick={() => setIsMegaOpen(false)}
                        >
                          <ToolIcon icon={t.icon} className="mega-menu-icon" size={14} />
                          <span className="mega-menu-name">{t.name}</span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Column 2: Health */}
                <div className="mega-menu-column">
                  <h4 className="mega-menu-title">Health</h4>
                  <ul className="mega-menu-list">
                    {healthTools.map(t => (
                      <li key={t.slug}>
                        <Link 
                          to={`/${t.slug}`} 
                          className="mega-menu-item"
                          onClick={() => setIsMegaOpen(false)}
                        >
                          <ToolIcon icon={t.icon} className="mega-menu-icon" size={14} />
                          <span className="mega-menu-name">{t.name}</span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Column 3: Time & Education */}
                <div className="mega-menu-column">
                  <h4 className="mega-menu-title">Time &amp; Education</h4>
                  <ul className="mega-menu-list">
                    {[...timeTools, ...educationTools].map(t => (
                      <li key={t.slug}>
                        <Link 
                          to={`/${t.slug}`} 
                          className="mega-menu-item"
                          onClick={() => setIsMegaOpen(false)}
                        >
                          <ToolIcon icon={t.icon} className="mega-menu-icon" size={14} />
                          <span className="mega-menu-name">{t.name}</span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Column 4: Converters & Utility */}
                <div className="mega-menu-column">
                  <h4 className="mega-menu-title">Converters &amp; Utility</h4>
                  <ul className="mega-menu-list">
                    {[...converterTools, ...utilityTools].map(t => (
                      <li key={t.slug}>
                        <Link 
                          to={`/${t.slug}`} 
                          className="mega-menu-item"
                          onClick={() => setIsMegaOpen(false)}
                        >
                          <ToolIcon icon={t.icon} className="mega-menu-icon" size={14} />
                          <span className="mega-menu-name">{t.name}</span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>

              </div>
            </div>
          </div>
          
          <Link to="/about" className="navbar-link">About</Link>
          <Link to="/privacy" className="navbar-link">Privacy</Link>
        </nav>

        <div className="navbar-actions">
          <ThemeToggle heroMode={isCurrentHome && !scrolled} />
          
          <button 
            className="navbar-toggle" 
            onClick={() => setIsOpen(!isOpen)}
            aria-expanded={isOpen}
            aria-label="Toggle navigation"
          >
            {isOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Slide-down Overlay */}
      <div className={`navbar-mobile-overlay ${isOpen ? 'is-visible' : ''}`} onClick={() => setIsOpen(false)} />
      <div className={`navbar-mobile-menu ${isOpen ? 'is-open' : ''}`}>
        <nav className="navbar-mobile-nav" aria-label="Mobile navigation">
          <Link to="/all-calculators" className="navbar-mobile-link" onClick={() => setIsOpen(false)}>
            All Calculators
          </Link>
          <Link to="/about" className="navbar-mobile-link" onClick={() => setIsOpen(false)}>
            About
          </Link>
          <Link to="/privacy" className="navbar-mobile-link" onClick={() => setIsOpen(false)}>
            Privacy Policy
          </Link>
        </nav>
      </div>
    </header>
  );
}
