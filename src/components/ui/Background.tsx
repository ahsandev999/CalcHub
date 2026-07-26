import { useReducedMotion } from '@/hooks/useScroll';
import './Background.css';

export default function Background() {
  const reduced = useReducedMotion();

  return (
    <div className="bg-effects" aria-hidden="true">
      <div className="bg-gradient" />
      <div className="bg-noise" />
      {!reduced && (
        <>
          <div className="bg-blob bg-blob-1" />
          <div className="bg-blob bg-blob-2" />
          <div className="bg-blob bg-blob-3" />
          <div className="bg-particles">
            {Array.from({ length: 30 }).map((_, i) => (
              <span
                key={i}
                className="bg-particle"
                style={{
                  left: `${(i * 37) % 100}%`,
                  top: `${(i * 53) % 100}%`,
                  '--p-duration': `${3 + (i % 5)}s`,
                  '--p-delay': `${i * 0.2}s`,
                } as React.CSSProperties}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
