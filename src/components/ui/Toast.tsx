import { motion } from 'framer-motion';
import type { ToastType } from '@/context/ToastContext';
import './Toast.css';

interface ToastProps {
  message: string;
  type: ToastType;
  onDismiss: () => void;
}

const icons: Record<ToastType, string> = {
  success: '✓',
  error: '✕',
  info: 'ℹ',
};

export default function Toast({ message, type, onDismiss }: ToastProps) {
  return (
    <motion.div
      className={`toast toast-${type}`}
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 10, scale: 0.95 }}
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
      role="status"
    >
      <span className="toast-icon" aria-hidden="true">{icons[type]}</span>
      <span className="toast-message">{message}</span>
      <button className="toast-close" onClick={onDismiss} aria-label="Dismiss notification">×</button>
    </motion.div>
  );
}
