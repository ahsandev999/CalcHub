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
    let rafId: number;

    const onMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    };

    const onEnter = () => { targetScale = 1.8; };
    const onLeave = () => { targetScale = 1; };

    const loop = () => {
      ringX += (mouseX - ringX) * 0.25;
      ringY += (mouseY - ringY) * 0.25;
      currentScale += (targetScale - currentScale) * 0.2;

      if (dotRef.current) {
        dotRef.current.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0) scale(${currentScale}) translate(-50%, -50%)`;
      }
      if (ringRef.current) {
        ringRef.current.style.transform = `translate3d(${ringX}px, ${ringY}px, 0) scale(${currentScale}) translate(-50%, -50%)`;
      }

      rafId = requestAnimationFrame(loop);
    };

    window.addEventListener('mousemove', onMove, { passive: true });
    rafId = requestAnimationFrame(loop);

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
