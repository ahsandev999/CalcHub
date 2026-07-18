import { useEffect, useRef, useState } from 'react';
import { useReducedMotion } from '@/hooks/useScroll';

interface AnimatedNumberProps {
  value: number;
  duration?: number;
  format?: (n: number) => string;
  className?: string;
}

export default function AnimatedNumber({
  value,
  duration = 800,
  format = (n) => n.toLocaleString(),
  className = '',
}: AnimatedNumberProps) {
  const [display, setDisplay] = useState(0);
  const reduced = useReducedMotion();
  const prevValue = useRef(0);

  useEffect(() => {
    if (reduced) {
      setDisplay(value);
      return;
    }

    const start = prevValue.current;
    const diff = value - start;
    const startTime = performance.now();

    const animate = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(start + diff * eased));
      if (progress < 1) requestAnimationFrame(animate);
      else prevValue.current = value;
    };

    requestAnimationFrame(animate);
  }, [value, duration, reduced]);

  return <span className={className}>{format(display)}</span>;
}
