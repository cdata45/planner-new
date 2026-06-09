import jalaali from "jalaali-js";

export const PERSIAN_MONTHS = [
  "فروردین",
  "اردیبهشت",
  "خرداد",
  "تیر",
  "مرداد",
  "شهریور",
  "مهر",
  "آبان",
  "آذر",
  "دی",
  "بهمن",
  "اسفند",
];

// Saturday-first week (Persian calendar)
export const PERSIAN_WEEKDAYS_SHORT = ["ش", "ی", "د", "س", "چ", "پ", "ج"];
export const PERSIAN_WEEKDAYS_FULL = [
  "شنبه",
  "یکشنبه",
  "دوشنبه",
  "سه‌شنبه",
  "چهارشنبه",
  "پنجشنبه",
  "جمعه",
];

export function toPersianDigits(input: string | number): string {
  const map = ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"];
  return String(input).replace(/\d/g, (d) => map[+d]);
}

export interface JDate {
  jy: number;
  jm: number;
  jd: number;
}

export function dateToJalali(date: Date): JDate {
  const { jy, jm, jd } = jalaali.toJalaali(
    date.getFullYear(),
    date.getMonth() + 1,
    date.getDate(),
  );
  return { jy, jm, jd };
}

export function jalaliToDate(j: JDate): Date {
  const { gy, gm, gd } = jalaali.toGregorian(j.jy, j.jm, j.jd);
  return new Date(gy, gm - 1, gd);
}

export function jalaliKey(j: JDate): string {
  return `${j.jy}-${String(j.jm).padStart(2, "0")}-${String(j.jd).padStart(2, "0")}`;
}

export function parseKey(key: string): JDate {
  const [jy, jm, jd] = key.split("-").map(Number);
  return { jy, jm, jd };
}

export function todayJalali(): JDate {
  return dateToJalali(new Date());
}

export function todayKey(): string {
  return jalaliKey(todayJalali());
}

export function addDaysToJalali(j: JDate, days: number): JDate {
  const d = jalaliToDate(j);
  d.setDate(d.getDate() + days);
  return dateToJalali(d);
}

// In Persian calendar, Saturday is day 0
export function jalaliWeekday(j: JDate): number {
  const d = jalaliToDate(j);
  // JS: Sunday=0..Saturday=6 -> map to Persian Saturday=0
  const jsDay = d.getDay(); // 0=Sun..6=Sat
  return (jsDay + 1) % 7; // Sat -> 0, Sun -> 1, ...
}

export function jalaliDaysInMonth(jy: number, jm: number): number {
  return jalaali.jalaaliMonthLength(jy, jm);
}

export function formatJalaliLong(j: JDate): string {
  const wd = PERSIAN_WEEKDAYS_FULL[jalaliWeekday(j)];
  return `${wd} ${toPersianDigits(j.jd)} ${PERSIAN_MONTHS[j.jm - 1]} ${toPersianDigits(j.jy)}`;
}

export function formatJalaliShort(j: JDate): string {
  return `${toPersianDigits(j.jd)} ${PERSIAN_MONTHS[j.jm - 1]}`;
}

export function compareJalali(a: JDate, b: JDate): number {
  if (a.jy !== b.jy) return a.jy - b.jy;
  if (a.jm !== b.jm) return a.jm - b.jm;
  return a.jd - b.jd;
}

export function isSameJalali(a: JDate, b: JDate): boolean {
  return a.jy === b.jy && a.jm === b.jm && a.jd === b.jd;
}
