import { useTheme } from '@/context/ThemeContext';
import { Sun, Moon } from 'lucide-react';
import './ThemeToggle.css';

interface ThemeToggleProps {
  heroMode?: boolean;
}

export default function ThemeToggle({ heroMode = false }: ThemeToggleProps) {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      className={`theme-toggle ${heroMode ? 'theme-toggle-hero' : ''}`}
      onClick={toggleTheme}
      aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
    >
      <div className="theme-toggle-track">
        <div className="theme-toggle-thumb">
          <span className="theme-toggle-icon">
            {theme === 'dark' ? (
              <Moon size={14} style={{ color: heroMode ? '#a5b4fc' : 'var(--accent)' }} />
            ) : (
              <Sun size={14} style={{ color: heroMode ? '#fbbf24' : '#f59e0b' }} />
            )}
          </span>
        </div>
      </div>
    </button>
  );
}
