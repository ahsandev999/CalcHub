export interface Tool {
  slug: string;
  name: string;
  description: string;
  category: 'math' | 'health' | 'time' | 'utility' | 'converter' | 'education';
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
  { slug: 'loan-calculator', name: 'Loan Calculator', description: 'Estimate monthly payments, interest, and total repayment for an amortized loan.', category: 'math', icon: 'currency' },
  { slug: 'mortgage-calculator', name: 'Mortgage Calculator', description: 'Estimate monthly mortgage payments including taxes and insurance.', category: 'math', icon: 'house' },
  { slug: 'compound-interest-calculator', name: 'Compound Interest Calculator', description: 'Project investment growth with compounding and recurring monthly contributions.', category: 'math', icon: 'trending-up' },
  { slug: 'simple-interest-calculator', name: 'Simple Interest Calculator', description: 'Calculate interest earned and final balance using the simple interest formula.', category: 'math', icon: 'percent' },
  { slug: 'salary-calculator', name: 'Salary Calculator', description: 'Convert hourly and annual salary into weekly, monthly, and yearly pay.', category: 'math', icon: 'wallet' },
  { slug: 'calorie-calculator', name: 'Calorie Calculator', description: 'Estimate daily calorie needs from body metrics and activity level.', category: 'health', icon: 'heart' },
  { slug: 'body-fat-calculator', name: 'Body Fat Calculator', description: 'Estimate body fat percentage using the US Navy formula.', category: 'health', icon: 'scale' },
  { slug: 'bmr-calculator', name: 'BMR Calculator', description: 'Estimate your basal metabolic rate using the Mifflin-St Jeor equation.', category: 'health', icon: 'heart' },
  { slug: 'ideal-weight-calculator', name: 'Ideal Weight Calculator', description: 'Find an ideal weight range using multiple body-weight formulas.', category: 'health', icon: 'shield' },
  { slug: 'fraction-calculator', name: 'Fraction Calculator', description: 'Add, subtract, multiply, or divide fractions and simplify the result.', category: 'math', icon: 'calculator' },
  { slug: 'triangle-calculator', name: 'Triangle Calculator', description: 'Solve triangle sides, angles, area, and perimeter from known values.', category: 'math', icon: 'ruler' },
  { slug: 'standard-deviation-calculator', name: 'Standard Deviation Calculator', description: 'Calculate mean, variance, and population/sample standard deviation from a list.', category: 'math', icon: 'chart' },
  { slug: 'gpa-calculator', name: 'GPA Calculator', description: 'Calculate weighted GPA from course grades and credit hours.', category: 'education', icon: 'book-open' },
  { slug: 'grade-calculator', name: 'Grade Calculator', description: 'Calculate a weighted final grade percentage and letter grade.', category: 'education', icon: 'book-open' },
  { slug: 'hours-calculator', name: 'Hours Calculator', description: 'Compute total hours worked between two times, including breaks.', category: 'time', icon: 'clock' },
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
  { id: 'education', label: 'Education' },
] as const;

export function getBreadcrumbsForTool(slug: string) {
  const tool = getToolBySlug(slug);
  if (!tool) return null;
  const categoryObj = CATEGORIES.find((c) => c.id === tool.category);
  const categoryName = categoryObj ? categoryObj.label : 'Tools';

  return {
    categoryName,
    visual: [
      { name: 'Home', url: '/' },
      { name: categoryName, url: '/all-calculators' },
      { name: tool.name },
    ],
    schema: [
      { name: 'Home', path: '/' },
      { name: categoryName, path: '/all-calculators' },
      { name: tool.name, path: `/${tool.slug}` },
    ],
  };
}
