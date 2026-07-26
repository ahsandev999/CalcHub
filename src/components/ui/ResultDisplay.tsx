import AnimatedNumber from './AnimatedNumber';

interface ResultSlot {
  label: string;
  value: string | number;
  animate?: boolean;
}

interface ResultDisplayProps {
  title?: string;
  subtitle?: string;
  slots: ResultSlot[];
  visible: boolean;
  highlight?: string;
}

export default function ResultDisplay({ title, subtitle, slots, visible, highlight }: ResultDisplayProps) {
  if (!visible) return null;

  return (
    <div className="result-display">
      {title && <div className="result-title">{title}</div>}
      {highlight && <div className="result-highlight">{highlight}</div>}
      {subtitle && <p className="result-subtitle">{subtitle}</p>}
      <div className="result-grid">
        {slots.map((slot) => (
          <div key={slot.label} className="result-slot">
            <div className="label">{slot.label}</div>
            <div className="value">
              {slot.animate && typeof slot.value === 'number' ? (
                <AnimatedNumber value={slot.value} />
              ) : (
                slot.value
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
