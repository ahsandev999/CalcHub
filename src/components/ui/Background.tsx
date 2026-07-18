import { motion } from 'framer-motion';
import { useReducedMotion } from '@/hooks/useScroll';
import './Background.css';

export default function Background() {
  const reduced = useReducedMotion();

  return (
    <div className="bg-effects" aria-hidden="true">
      <div className="bg-gradient" />
      <div className="bg-noise" />
      {!reduced && (
        <>
          <motion.div
            className="bg-blob bg-blob-1"
            animate={{ x: [0, 30, -20, 0], y: [0, -40, 20, 0] }}
            transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.div
            className="bg-blob bg-blob-2"
            animate={{ x: [0, -40, 30, 0], y: [0, 30, -30, 0] }}
            transition={{ duration: 25, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.div
            className="bg-blob bg-blob-3"
            animate={{ x: [0, 20, -30, 0], y: [0, -20, 40, 0] }}
            transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
          />
          <div className="bg-particles">
            {Array.from({ length: 30 }).map((_, i) => (
              <motion.span
                key={i}
                className="bg-particle"
                style={{ left: `${(i * 37) % 100}%`, top: `${(i * 53) % 100}%` }}
                animate={{ y: [0, -20, 0], opacity: [0.2, 0.6, 0.2] }}
                transition={{ duration: 3 + (i % 5), repeat: Infinity, delay: i * 0.2 }}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
