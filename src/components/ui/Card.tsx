import type { ReactNode, HTMLAttributes } from 'react';
import './Card.css';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  hover?: boolean;
  glow?: boolean;
  padding?: 'sm' | 'md' | 'lg';
}

export default function Card({
  children,
  hover = false,
  glow = false,
  padding = 'md',
  className = '',
  ...props
}: CardProps) {
  const {
    onAnimationStart,
    onDragStart,
    onDragEnd,
    onDrag,
    ...cleanProps
  } = props as any;

  return (
    <div
      className={`card glass-card card-pad-${padding} ${hover ? 'card-hover' : ''} ${glow ? 'card-glow' : ''} ${className}`}
      {...cleanProps}
    >
      {children}
    </div>
  );
}
