import type { ReactNode, ButtonHTMLAttributes } from 'react';
import './Button.css';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  magnetic?: boolean;
  children: ReactNode;
}

export default function Button({
  variant = 'primary',
  size = 'md',
  magnetic = false,
  className = '',
  children,
  ...props
}: ButtonProps) {
  const {
    onAnimationStart,
    onDragStart,
    onDragEnd,
    onDrag,
    ...cleanProps
  } = props as any;

  return (
    <button
      className={`btn btn-${variant} btn-${size} ${className}`}
      data-magnetic={magnetic || undefined}
      {...cleanProps}
    >
      <span className="btn-ripple" aria-hidden="true" />
      <span className="btn-content">{children}</span>
    </button>
  );
}
