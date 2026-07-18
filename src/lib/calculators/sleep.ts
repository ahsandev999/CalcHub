const CYCLE_MINUTES = 90;
const DEFAULT_FALL_ASLEEP = 15;

export type SleepMode = 'wake' | 'sleep' | 'nap' | 'bedtime';

export interface SleepOption {
  cycles: number;
  durationHours: number;
  time: Date;
  quality: 'excellent' | 'good' | 'fair' | 'short';
  qualityLabel: string;
}

export interface SleepResult {
  mode: SleepMode;
  options: SleepOption[];
  fallAsleepMin: number;
  note: string;
  suggestions: string[];
}

function fmt(date: Date): string {
  let h = date.getHours();
  const m = date.getMinutes();
  const ampm = h >= 12 ? 'PM' : 'AM';
  h = h % 12;
  if (h === 0) h = 12;
  return `${h}:${m.toString().padStart(2, '0')} ${ampm}`;
}

function getQuality(cycles: number): SleepOption['quality'] {
  if (cycles >= 5) return 'excellent';
  if (cycles >= 4) return 'good';
  if (cycles >= 3) return 'fair';
  return 'short';
}

const QUALITY_LABELS: Record<SleepOption['quality'], string> = {
  excellent: 'Excellent — 7.5+ hours',
  good: 'Good — 6+ hours',
  fair: 'Fair — 4.5+ hours',
  short: 'Short — under 4.5 hours',
};

function buildSuggestions(cycles: number, mode: SleepMode): string[] {
  const suggestions: string[] = [];
  if (cycles < 5) suggestions.push('Aim for 5–6 sleep cycles (7.5–9 hours) for optimal rest.');
  if (mode === 'nap') suggestions.push('Keep naps under 30 minutes to avoid sleep inertia.');
  suggestions.push('Maintain a consistent sleep schedule, even on weekends.');
  suggestions.push('Avoid screens 30 minutes before bed for better sleep quality.');
  if (cycles >= 5) suggestions.push('Great choice! This aligns with recommended adult sleep duration.');
  return suggestions;
}

export function calculateSleep(
  mode: SleepMode,
  wakeTime?: string,
  fallAsleepMin = DEFAULT_FALL_ASLEEP,
  napMinutes = 20
): SleepResult {
  const cycleCounts = mode === 'nap' ? [1] : [6, 5, 4, 3];
  const options: SleepOption[] = [];
  let note = '';
  const suggestions: string[] = [];

  if (mode === 'wake' && wakeTime) {
    const [hh, mm] = wakeTime.split(':').map(Number);
    const wake = new Date();
    wake.setHours(hh, mm, 0, 0);

    note = `To wake up refreshed at ${fmt(wake)}, fall asleep at one of these times:`;

    cycleCounts.forEach((c) => {
      const bedtime = new Date(wake.getTime() - (c * CYCLE_MINUTES + fallAsleepMin) * 60000);
      const quality = getQuality(c);
      options.push({
        cycles: c,
        durationHours: (c * CYCLE_MINUTES) / 60,
        time: bedtime,
        quality,
        qualityLabel: QUALITY_LABELS[quality],
      });
      suggestions.push(...buildSuggestions(c, mode));
    });
  } else if (mode === 'sleep') {
    const now = new Date();
    note = `If you fall asleep now (around ${fmt(now)}), wake up at:`;

    [...cycleCounts].reverse().forEach((c) => {
      const wakeTime = new Date(now.getTime() + (c * CYCLE_MINUTES + fallAsleepMin) * 60000);
      const quality = getQuality(c);
      options.push({
        cycles: c,
        durationHours: (c * CYCLE_MINUTES) / 60,
        time: wakeTime,
        quality,
        qualityLabel: QUALITY_LABELS[quality],
      });
    });
    suggestions.push(...buildSuggestions(5, mode));
  } else if (mode === 'nap') {
    const now = new Date();
    const wakeTime = new Date(now.getTime() + (napMinutes + fallAsleepMin) * 60000);
    note = `For a ${napMinutes}-minute nap, set your alarm for:`;
    options.push({
      cycles: 0,
      durationHours: napMinutes / 60,
      time: wakeTime,
      quality: napMinutes <= 30 ? 'good' : 'fair',
      qualityLabel: napMinutes <= 30 ? 'Ideal power nap' : 'Long nap — may cause grogginess',
    });
    suggestions.push('Power naps (15–20 min) boost alertness without grogginess.');
    suggestions.push('Avoid napping after 3 PM to protect nighttime sleep.');
  } else if (mode === 'bedtime' && wakeTime) {
    const [hh, mm] = wakeTime.split(':').map(Number);
    const bedtime = new Date();
    bedtime.setHours(hh, mm, 0, 0);

    note = `Going to bed at ${fmt(bedtime)}, wake up at:`;

    cycleCounts.forEach((c) => {
      const wake = new Date(bedtime.getTime() + (c * CYCLE_MINUTES + fallAsleepMin) * 60000);
      const quality = getQuality(c);
      options.push({
        cycles: c,
        durationHours: (c * CYCLE_MINUTES) / 60,
        time: wake,
        quality,
        qualityLabel: QUALITY_LABELS[quality],
      });
    });
    suggestions.push(...buildSuggestions(5, mode));
  }

  return {
    mode,
    options,
    fallAsleepMin,
    note,
    suggestions: [...new Set(suggestions)].slice(0, 4),
  };
}

export function formatTime(date: Date): string {
  return fmt(date);
}
