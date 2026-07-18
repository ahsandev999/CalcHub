import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useScrollDirection } from '@/hooks/useScroll';
import ThemeToggle from './ThemeToggle';
import './Navbar.css';

export default function Navbar() {
  const { visible, scrolled } = useScrollDirection();
  const location = useLocation();
  const isCurrentHome = location.pathname === '/';

  // On home page: transparent until scrolled, then glass dark
  // On other pages: glass with theme vars
  const navClass = [
    'navbar',
    scrolled ? 'navbar-scrolled' : '',
    isCurrentHome && !scrolled ? 'navbar-hero-mode' : '',
    isCurrentHome ? 'navbar-on-home' : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <motion.header
      className={navClass}
      initial={{ y: 0 }}
      animate={{ y: visible ? 0 : -100 }}
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="navbar-inner container">
        <Link to="/" className="navbar-brand" aria-label="CalcHub Home">
          <motion.span
            className="navbar-logo"
            whileHover={{ rotate: 180 }}
            transition={{ duration: 0.5 }}
          >
            ◈
          </motion.span>
          <span className="navbar-name">CalcHub</span>
        </Link>

        <nav className="navbar-nav" aria-label="Main navigation">
          {!isCurrentHome && (
            <Link to="/" className="navbar-link">Tools</Link>
          )}
          <Link to="/about" className="navbar-link">About</Link>
          <Link to="/privacy" className="navbar-link">Privacy</Link>
        </nav>

        <ThemeToggle heroMode={isCurrentHome && !scrolled} />
      </div>
    </motion.header>
  );
}
