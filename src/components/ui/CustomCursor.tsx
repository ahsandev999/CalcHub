import { useEffect, useRef } from 'react';
import { motion, useSpring, useMotionValue } from 'framer-motion';
import { useIsMobile, useReducedMotion } from '@/hooks/useScroll';
import './CustomCursor.css';

export default function CustomCursor() {
  const isMobile = useIsMobile();
  const reduced = useReducedMotion();
  const cursorX = useMotionValue(-100);
  const cursorY = useMotionValue(-100);
  const ringX = useSpring(cursorX, { stiffness: 150, damping: 20 });
  const ringY = useSpring(cursorY, { stiffness: 150, damping: 20 });
  const scale = useSpring(1, { stiffness: 300, damping: 20 });
  const ringRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isMobile || reduced) {
      document.body.classList.remove('custom-cursor-active');
      return;
    }

    document.body.classList.add('custom-cursor-active');

    const onMove = (e: MouseEvent) => {
      cursorX.set(e.clientX);
      cursorY.set(e.clientY);
    };

    const onEnter = () => scale.set(1.8);
    const onLeave = () => scale.set(1);

    window.addEventListener('mousemove', onMove);

    const attach = () => {
      const targets = document.querySelectorAll('a, button, [role="button"], input, select, textarea, [data-magnetic]');
      targets.forEach((el) => {
        el.addEventListener('mouseenter', onEnter);
        el.addEventListener('mouseleave', onLeave);
      });
      return targets;
    };

    let targets = attach();
    const observer = new MutationObserver(() => {
      targets.forEach((el) => {
        el.removeEventListener('mouseenter', onEnter);
        el.removeEventListener('mouseleave', onLeave);
      });
      targets = attach();
    });
    observer.observe(document.body, { childList: true, subtree: true });

    return () => {
      window.removeEventListener('mousemove', onMove);
      targets.forEach((el) => {
        el.removeEventListener('mouseenter', onEnter);
        el.removeEventListener('mouseleave', onLeave);
      });
      observer.disconnect();
      document.body.classList.remove('custom-cursor-active');
    };
  }, [isMobile, reduced, cursorX, cursorY, scale]);

  if (isMobile || reduced) return null;

  return (
    <>
      <motion.div
        className="cursor-dot"
        style={{ x: cursorX, y: cursorY, scale, translateX: '-50%', translateY: '-50%' }}
      />
      <motion.div
        ref={ringRef}
        className="cursor-ring"
        style={{ x: ringX, y: ringY, scale, translateX: '-50%', translateY: '-50%' }}
      />
    </>
  );
}
