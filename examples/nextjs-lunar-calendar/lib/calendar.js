// Everything the page shows, as plain functions: no React, so `npm test` runs
// them in Node. Dates are "YYYY-MM-DD" strings; the lunar calendar is the
// Vietnamese one (UTC+7) unless you pass another country.
import { solarTerms, toLunar, toSolar } from "@nhatnguyet/lunar";

const pad = (n) => String(n).padStart(2, "0");

/** A JS Date as "YYYY-MM-DD" in the viewer's local time. */
export function isoDate(d) {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

/** Days between two "YYYY-MM-DD" dates (b minus a). */
export function daysBetween(a, b) {
  return Math.round((Date.parse(`${b}T00:00:00Z`) - Date.parse(`${a}T00:00:00Z`)) / 86400000);
}

/**
 * The weeks of a Gregorian month (weeks start on Monday). Each cell is null
 * (padding) or { date, day, lunarDay, lunarMonth, leap, term } where `term`
 * is the name of a solar term that starts that day.
 */
export function monthGrid(year, month, opts = {}) {
  const terms = new Map(solarTerms(year, opts).map((t) => [t.date, t.name]));
  const first = new Date(Date.UTC(year, month - 1, 1));
  const lead = (first.getUTCDay() + 6) % 7;
  const count = new Date(Date.UTC(year, month, 0)).getUTCDate();
  const cells = Array.from({ length: lead }, () => null);
  for (let day = 1; day <= count; day++) {
    const date = `${year}-${pad(month)}-${pad(day)}`;
    const l = toLunar(date, opts);
    cells.push({ date, day, lunarDay: l.day, lunarMonth: l.month, leap: l.leap, term: terms.get(date) ?? null });
  }
  while (cells.length % 7) cells.push(null);
  const weeks = [];
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));
  return weeks;
}

/** Lunar date, can chi, zodiac and solar term of one day. */
export function dayInfo(date, opts = {}) {
  return toLunar(date, opts);
}

/** The next Lunar New Year (Tết) on or after `date`, and how many days away. */
export function nextTet(date, opts = {}) {
  const l = toLunar(date, opts);
  let tet = toSolar({ year: l.year, month: 1, day: 1 }, opts).date;
  if (tet < date) tet = toSolar({ year: l.year + 1, month: 1, day: 1 }, opts).date;
  return { date: tet, days: daysBetween(date, tet), year: toLunar(tet, opts) };
}
