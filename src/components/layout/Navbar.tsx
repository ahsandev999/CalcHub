import { Link, useLocation } from 'react-router-dom';
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
    !visible ? 'navbar-hidden' : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <header className={navClass}>
      <div className="navbar-inner container">
        <Link to="/" className="navbar-brand" aria-label="CalcHub Home">
          <span className="navbar-logo">
            ◈
          </span>
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
    </header>
  );
}
