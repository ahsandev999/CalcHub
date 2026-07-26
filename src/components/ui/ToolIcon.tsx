import {
  Calculator,
  Calendar,
  Moon,
  Heart,
  Percent,
  Ruler,
  Clock,
  Timer,
  Hourglass,
  Flame,
  Dices,
  Key,
  Palette,
  Binary,
  Coins,
  Shield,
  HelpCircle,
  House,
  TrendingUp,
  Wallet,
  Scale,
  BarChart3,
  BookOpen
} from 'lucide-react';

const ICONS: Record<string, React.ComponentType<any>> = {
  calculator: Calculator,
  calendar: Calendar,
  moon: Moon,
  heart: Heart,
  percent: Percent,
  ruler: Ruler,
  clock: Clock,
  stopwatch: Timer,
  timer: Hourglass,
  tomato: Flame, // Pomodoro flame/focus
  dice: Dices,
  key: Key,
  palette: Palette,
  binary: Binary,
  currency: Coins,
  shield: Shield,
  house: House,
  'trending-up': TrendingUp,
  wallet: Wallet,
  scale: Scale,
  chart: BarChart3,
  'book-open': BookOpen,
};

interface ToolIconProps {
  icon: string;
  className?: string;
  size?: number;
  style?: React.CSSProperties;
}

export default function ToolIcon({ icon, className = '', size = 20, style }: ToolIconProps) {
  const IconComponent = ICONS[icon] || HelpCircle;
  return <IconComponent className={className} size={size} style={style} aria-hidden="true" />;
}
