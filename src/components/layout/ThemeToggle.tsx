import { motion } from 'framer-motion';
import { useTheme } from '@/context/ThemeContext';
import { Sun, Moon } from 'lucide-react';
import './ThemeToggle.css';

interface ThemeToggleProps {
  heroMode?: boolean;
}

export default function ThemeToggle({ heroMode = false }: ThemeToggleProps) {
  const { theme, toggleTheme } = useTheme();

  return (
    <motion.button
      className={`theme-toggle ${heroMode ? 'theme-toggle-hero' : ''}`}
      onClick={toggleTheme}
      aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
      whileTap={{ scale: 0.9 }}
    >
      <motion.div
        className="theme-toggle-track"
        animate={{
          background: heroMode
            ? 'rgba(255,255,255,0.08)'
            : theme === 'dark'
            ? 'var(--accent-soft)'
            : 'var(--bg-subtle)',
        }}
      >
        <motion.div
          className="theme-toggle-thumb"
          animate={{ x: theme === 'dark' ? 28 : 0 }}
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        >
          <motion.span
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            animate={{ rotate: theme === 'dark' ? 180 : 0, opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            {theme === 'dark' ? (
              <Moon size={14} style={{ color: heroMode ? '#a5b4fc' : 'var(--accent)' }} />
            ) : (
              <Sun size={14} style={{ color: heroMode ? '#fbbf24' : '#f59e0b' }} />
            )}
          </motion.span>
        </motion.div>
      </motion.div>
    </motion.button>
  );
}
