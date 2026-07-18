export interface Tool {
  slug: string;
  name: string;
  description: string;
  category: 'math' | 'health' | 'time' | 'utility' | 'converter';
  icon: string;
  featured?: boolean;
}

export const TOOLS: Tool[] = [
  { slug: 'scientific-calculator', name: 'Scientific Calculator', description: 'Trig, logs, powers, memory, history & scientific notation.', category: 'math', icon: 'calculator', featured: true },
  { slug: 'age-calculator', name: 'Age Calculator', description: 'Exact age, zodiac signs, birthday countdown & age comparison.', category: 'time', icon: 'calendar', featured: true },
  { slug: 'sleep-calculator', name: 'Sleep Calculator', description: 'Optimize bedtimes, wake times, naps & sleep quality.', category: 'health', icon: 'moon', featured: true },
  { slug: 'bmi-calculator', name: 'BMI Calculator', description: 'Body Mass Index with health category & recommendations.', category: 'health', icon: 'heart', featured: true },
  { slug: 'percentage-calculator', name: 'Percentage Calculator', description: 'Calculate percentages, increases, decreases & differences.', category: 'math', icon: 'percent' },
  { slug: 'unit-converter', name: 'Unit Converter', description: 'Convert length, weight, temperature, volume & more.', category: 'converter', icon: 'ruler' },
  { slug: 'date-difference', name: 'Date Difference', description: 'Calculate the exact difference between two dates.', category: 'time', icon: 'clock' },
  { slug: 'stopwatch', name: 'Stopwatch', description: 'Precision stopwatch with lap times.', category: 'time', icon: 'stopwatch' },
  { slug: 'timer', name: 'Timer', description: 'Countdown timer with presets and notifications.', category: 'time', icon: 'timer' },
  { slug: 'pomodoro', name: 'Pomodoro Timer', description: 'Focus sessions with work/break cycles.', category: 'time', icon: 'tomato' },
  { slug: 'random-number', name: 'Random Number', description: 'Generate random numbers within any range.', category: 'utility', icon: 'dice' },
  { slug: 'password-generator', name: 'Password Generator', description: 'Create secure, customizable passwords.', category: 'utility', icon: 'key' },
  { slug: 'color-converter', name: 'Color Converter', description: 'Convert between HEX, RGB, HSL & CSS formats.', category: 'converter', icon: 'palette' },
  { slug: 'number-base-converter', name: 'Base Converter', description: 'Convert between decimal, binary, octal & hexadecimal.', category: 'converter', icon: 'binary' },
  { slug: 'currency-converter', name: 'Currency Converter', description: 'Convert between global currencies with live API rates.', category: 'converter', icon: 'currency' },
];

export function getToolBySlug(slug: string): Tool | undefined {
  return TOOLS.find((t) => t.slug === slug);
}

export const CATEGORIES = [
  { id: 'all', label: 'All Tools' },
  { id: 'math', label: 'Math' },
  { id: 'health', label: 'Health' },
  { id: 'time', label: 'Time' },
  { id: 'utility', label: 'Utility' },
  { id: 'converter', label: 'Converters' },
] as const;
