import { Link } from 'react-router-dom';
import { TOOLS } from '@/lib/tools';
import './Footer.css';

export default function Footer() {
  const year = new Date().getFullYear();
  const featured = TOOLS.filter((t) => t.featured);

  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          <div className="footer-brand">
            <Link to="/" className="footer-logo">
              <span className="navbar-logo">◈</span>
              <span>CalcHub</span>
            </Link>
            <p className="footer-tagline">
              Premium calculators and tools — free, fast, and beautiful. No sign-up required.
            </p>
          </div>

          <div className="footer-col">
            <h4>Featured Tools</h4>
            <ul>
              {featured.map((t) => (
                <li key={t.slug}><Link to={`/${t.slug}`}>{t.name}</Link></li>
              ))}
            </ul>
          </div>

          <div className="footer-col">
            <h4>More Tools</h4>
            <ul>
              {TOOLS.filter((t) => !t.featured).slice(0, 5).map((t) => (
                <li key={t.slug}><Link to={`/${t.slug}`}>{t.name}</Link></li>
              ))}
            </ul>
          </div>

          <div className="footer-col">
            <h4>Company</h4>
            <ul>
              <li><Link to="/about">About</Link></li>
              <li><Link to="/privacy">Privacy Policy</Link></li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <span>© {year} CalcHub. All rights reserved.</span>
          <span className="footer-made">Made with precision</span>
        </div>
      </div>
    </footer>
  );
}
