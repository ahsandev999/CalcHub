const ZODIAC = [
  { sign: 'Capricorn', start: [1, 1], end: [1, 19] },
  { sign: 'Aquarius', start: [1, 20], end: [2, 18] },
  { sign: 'Pisces', start: [2, 19], end: [3, 20] },
  { sign: 'Aries', start: [3, 21], end: [4, 19] },
  { sign: 'Taurus', start: [4, 20], end: [5, 20] },
  { sign: 'Gemini', start: [5, 21], end: [6, 20] },
  { sign: 'Cancer', start: [6, 21], end: [7, 22] },
  { sign: 'Leo', start: [7, 23], end: [8, 22] },
  { sign: 'Virgo', start: [8, 23], end: [9, 22] },
  { sign: 'Libra', start: [9, 23], end: [10, 22] },
  { sign: 'Scorpio', start: [10, 23], end: [11, 21] },
  { sign: 'Sagittarius', start: [11, 22], end: [12, 21] },
  { sign: 'Capricorn', start: [12, 22], end: [12, 31] },
];

const CHINESE_ZODIAC = ['Monkey', 'Rooster', 'Dog', 'Pig', 'Rat', 'Ox', 'Tiger', 'Rabbit', 'Dragon', 'Snake', 'Horse', 'Goat'];
const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export interface AgeResult {
  years: number;
  months: number;
  days: number;
  totalDays: number;
  totalWeeks: number;
  totalMonths: number;
  totalHours: number;
  totalMinutes: number;
  leapYears: number;
  zodiac: string;
  chineseZodiac: string;
  dayOfWeek: string;
  nextBirthdayDays: number;
  nextBirthdayHours: number;
  isBirthdayToday: boolean;
}

function parseDate(val: string): Date {
  return new Date(val + 'T00:00:00');
}

function isLeapYear(year: number): boolean {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
}

function countLeapYears(start: Date, end: Date): number {
  let count = 0;
  const startYear = start.getFullYear();
  const endYear = end.getFullYear();
  for (let y = startYear; y <= endYear; y++) {
    if (isLeapYear(y)) {
      const leapDay = new Date(y, 1, 29);
      if (leapDay >= start && leapDay <= end) count++;
    }
  }
  return count;
}

function getZodiac(month: number, day: number): string {
  for (const z of ZODIAC) {
    const [sm, sd] = z.start;
    const [em, ed] = z.end;
    if (
      (month === sm && day >= sd) ||
      (month === em && day <= ed) ||
      (sm < em && month > sm && month < em)
    ) {
      return z.sign;
    }
  }
  return 'Unknown';
}

export function calculateAge(dobStr: string, asOfStr: string): AgeResult {
  const dob = parseDate(dobStr);
  const asOf = parseDate(asOfStr);

  if (dob > asOf) throw new Error('Date of birth must be before the reference date.');

  let years = asOf.getFullYear() - dob.getFullYear();
  let months = asOf.getMonth() - dob.getMonth();
  let days = asOf.getDate() - dob.getDate();

  if (days < 0) {
    months -= 1;
    const prevMonth = new Date(asOf.getFullYear(), asOf.getMonth(), 0);
    days += prevMonth.getDate();
  }
  if (months < 0) {
    years -= 1;
    months += 12;
  }

  const totalDays = Math.floor((asOf.getTime() - dob.getTime()) / 86400000);
  const totalWeeks = Math.floor(totalDays / 7);
  const totalMonths = years * 12 + months;
  const totalHours = totalDays * 24;
  const totalMinutes = totalHours * 60;

  let nextBday = new Date(asOf.getFullYear(), dob.getMonth(), dob.getDate());
  if (nextBday < asOf) nextBday = new Date(asOf.getFullYear() + 1, dob.getMonth(), dob.getDate());
  const msToNext = nextBday.getTime() - asOf.getTime();
  const nextBirthdayDays = Math.ceil(msToNext / 86400000);
  const nextBirthdayHours = Math.ceil(msToNext / 3600000);

  return {
    years,
    months,
    days,
    totalDays,
    totalWeeks,
    totalMonths,
    totalHours,
    totalMinutes,
    leapYears: countLeapYears(dob, asOf),
    zodiac: getZodiac(dob.getMonth() + 1, dob.getDate()),
    chineseZodiac: CHINESE_ZODIAC[dob.getFullYear() % 12],
    dayOfWeek: DAYS[dob.getDay()],
    nextBirthdayDays,
    nextBirthdayHours,
    isBirthdayToday: nextBirthdayDays === 0,
  };
}

export interface AgeDifference {
  years: number;
  months: number;
  days: number;
  totalDays: number;
  olderPerson: 'first' | 'second' | 'same';
}

export function calculateAgeDifference(dob1: string, dob2: string): AgeDifference {
  const d1 = parseDate(dob1);
  const d2 = parseDate(dob2);

  const [older, younger] = d1 <= d2 ? [d1, d2] : [d2, d1];
  const olderPerson = d1 < d2 ? 'first' : d1 > d2 ? 'second' : 'same';

  let years = younger.getFullYear() - older.getFullYear();
  let months = younger.getMonth() - older.getMonth();
  let days = younger.getDate() - older.getDate();

  if (days < 0) {
    months -= 1;
    days += new Date(younger.getFullYear(), younger.getMonth(), 0).getDate();
  }
  if (months < 0) {
    years -= 1;
    months += 12;
  }

  return {
    years,
    months,
    days,
    totalDays: Math.floor((younger.getTime() - older.getTime()) / 86400000),
    olderPerson,
  };
}
