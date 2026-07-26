import { useEffect, useRef } from 'react';
import { useIsMobile, useReducedMotion } from '@/hooks/useScroll';
import './CustomCursor.css';

export default function CustomCursor() {
  const isMobile = useIsMobile();
  const reduced = useReducedMotion();
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isMobile || reduced) {
      document.body.classList.remove('custom-cursor-active');
      return;
    }

    document.body.classList.add('custom-cursor-active');

    let mouseX = -100;
    let mouseY = -100;
    let ringX = -100;
    let ringY = -100;
    let currentScale = 1;
    let targetScale = 1;
    let isAnimating = false;
    let rafId: number;

    const startLoop = () => {
      if (!isAnimating) {
        isAnimating = true;
        rafId = requestAnimationFrame(loop);
      }
    };

    const loop = () => {
      const dx = mouseX - ringX;
      const dy = mouseY - ringY;
      const ds = targetScale - currentScale;

      ringX += dx * 0.25;
      ringY += dy * 0.25;
      currentScale += ds * 0.2;

      if (dotRef.current) {
        dotRef.current.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0) scale(${currentScale}) translate(-50%, -50%)`;
      }
      if (ringRef.current) {
        ringRef.current.style.transform = `translate3d(${ringX}px, ${ringY}px, 0) scale(${currentScale}) translate(-50%, -50%)`;
      }

      if (Math.abs(dx) < 0.1 && Math.abs(dy) < 0.1 && Math.abs(ds) < 0.01) {
        isAnimating = false;
        return;
      }

      rafId = requestAnimationFrame(loop);
    };

    const onMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      startLoop();
    };

    const onEnter = () => { targetScale = 1.8; startLoop(); };
    const onLeave = () => { targetScale = 1; startLoop(); };

    window.addEventListener('mousemove', onMove, { passive: true });

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
      cancelAnimationFrame(rafId);
      window.removeEventListener('mousemove', onMove);
      targets.forEach((el) => {
        el.removeEventListener('mouseenter', onEnter);
        el.removeEventListener('mouseleave', onLeave);
      });
      observer.disconnect();
      document.body.classList.remove('custom-cursor-active');
    };
  }, [isMobile, reduced]);

  if (isMobile || reduced) return null;

  return (
    <>
      <div ref={dotRef} className="cursor-dot" />
      <div ref={ringRef} className="cursor-ring" />
    </>
  );
}
