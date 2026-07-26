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
    <div className={`toast toast-${type}`} role="status">
      <span className="toast-icon" aria-hidden="true">{icons[type]}</span>
      <span className="toast-message">{message}</span>
      <button className="toast-close" onClick={onDismiss} aria-label="Dismiss notification">×</button>
    </div>
  );
}
