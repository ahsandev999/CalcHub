import { motion } from 'framer-motion';
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
    <motion.div
      className={`card glass-card card-pad-${padding} ${hover ? 'card-hover' : ''} ${glow ? 'card-glow' : ''} ${className}`}
      whileHover={hover ? { y: -4, transition: { duration: 0.2 } } : undefined}
      {...cleanProps}
    >
      {children}
    </motion.div>
  );
}
