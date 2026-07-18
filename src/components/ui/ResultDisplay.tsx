import { motion, AnimatePresence } from 'framer-motion';
import AnimatedNumber from './AnimatedNumber';

interface ResultSlot {
  label: string;
  value: string | number;
  animate?: boolean;
}

interface ResultDisplayProps {
  title?: string;
  subtitle?: string;
  slots: ResultSlot[];
  visible: boolean;
  highlight?: string;
}

export default function ResultDisplay({ title, subtitle, slots, visible, highlight }: ResultDisplayProps) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="result-display"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        >
          {title && <div className="result-title">{title}</div>}
          {highlight && (
            <motion.div
              className="result-highlight"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}
            >
              {highlight}
            </motion.div>
          )}
          {subtitle && <p className="result-subtitle">{subtitle}</p>}
          <div className="result-grid">
            {slots.map((slot, i) => (
              <motion.div
                key={slot.label}
                className="result-slot"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 * i }}
              >
                <div className="label">{slot.label}</div>
                <div className="value">
                  {slot.animate && typeof slot.value === 'number' ? (
                    <AnimatedNumber value={slot.value} />
                  ) : (
                    slot.value
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
