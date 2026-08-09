import { Link } from 'react-router-dom';
import { TOOLS } from '@/lib/tools';
import './Footer.css';

export default function Footer() {
  const year = new Date().getFullYear();
  const featured = TOOLS.filter((t) => t.featured);
  const footerLimit = 4;
  const grouped = [
    { title: 'Featured', tools: featured.slice(0, footerLimit), extra: Math.max(featured.length - footerLimit, 0) },
    { title: 'Math', tools: TOOLS.filter((t) => t.category === 'math').slice(0, footerLimit), extra: Math.max(TOOLS.filter((t) => t.category === 'math').length - footerLimit, 0) },
    { title: 'Health', tools: TOOLS.filter((t) => t.category === 'health').slice(0, footerLimit), extra: Math.max(TOOLS.filter((t) => t.category === 'health').length - footerLimit, 0) },
    { title: 'Time', tools: TOOLS.filter((t) => t.category === 'time').slice(0, footerLimit), extra: Math.max(TOOLS.filter((t) => t.category === 'time').length - footerLimit, 0) },
    { title: 'Utility', tools: TOOLS.filter((t) => t.category === 'utility').slice(0, footerLimit), extra: Math.max(TOOLS.filter((t) => t.category === 'utility').length - footerLimit, 0) },
    { title: 'Converters', tools: TOOLS.filter((t) => t.category === 'converter').slice(0, footerLimit), extra: Math.max(TOOLS.filter((t) => t.category === 'converter').length - footerLimit, 0) },
    { title: 'Education', tools: TOOLS.filter((t) => t.category === 'education').slice(0, footerLimit), extra: Math.max(TOOLS.filter((t) => t.category === 'education').length - footerLimit, 0) },
  ];

  return (
    <footer className="footer">
      <div className="container">
        {/* Brand sits in its own row above the column grid */}
        <div className="footer-brand">
          <Link to="/" className="footer-logo">
            <span className="navbar-logo">◈</span>
            <span>CalcHub</span>
          </Link>
          <p className="footer-tagline">
            Premium calculators and tools — free, fast, and beautiful. No sign-up required.
          </p>
        </div>

        {/* All category columns in one flex-wrap row — Education & Company align cleanly */}
        <div className="footer-cols">
          {grouped.map((group) => (
            <div className="footer-col" key={group.title}>
              <div className="footer-col-title">{group.title}</div>
              <ul>
                {group.tools.map((t) => (
                  <li key={t.slug}><Link to={`/${t.slug}`}>{t.name}</Link></li>
                ))}
                {group.extra > 0 && (
                  <li className="footer-more"><Link to="/all-calculators">+{group.extra} more</Link></li>
                )}
              </ul>
            </div>
          ))}

          <div className="footer-col">
            <div className="footer-col-title">Company</div>
            <ul>
              <li><Link to="/about">About</Link></li>
              <li><Link to="/privacy">Privacy Policy</Link></li>
              <li><Link to="/watch/scientific-calculator">Video Tutorials 🎬</Link></li>
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
