// The text of every reply, as plain functions of their input: no Telegram, no
// network, so they are tested directly (test/replies.test.js).
import { auspiciousHours, parseDate, solarTermOn, toLunar, toSolar } from "@nhatnguyet/lunar";
import { castZiWei, chartToText } from "@nhatnguyet/ziwei";

const L = {
  en: {
    lunar: "Lunar date", leap: " (leap month)", day: "Day", month: "Month", year: "Year",
    term: "Solar term", nextTerm: "next",
    tetToday: (y) => `Today is Tết, the first day of the ${y} year. Happy New Year!`,
    tet: (y, date, n) => `Tết ${y} falls on ${date}: ${n} day${n === 1 ? "" : "s"} to go.`,
    badDate: "Please write the date as YYYY-MM-DD, for example /today 2027-02-06.",
    ziweiUsage: "Usage: /ziwei YYYY-MM-DD HH:MM male|female\nExample: /ziwei 1990-09-19 20:00 male",
    hours: (date, day) => `Auspicious hours of ${date} (day ${day}), Vietnam time:`,
    help: [
      "Vietnamese lunar calendar bot.",
      "/today [YYYY-MM-DD]: lunar date, can chi, solar term",
      "/hours [YYYY-MM-DD]: the six auspicious hours of the day",
      "/tet: days until the Lunar New Year",
      "/ziwei YYYY-MM-DD HH:MM male|female: Zi Wei Dou Shu chart summary",
    ],
  },
  vi: {
    lunar: "Âm lịch", leap: " (tháng nhuận)", day: "Ngày", month: "Tháng", year: "Năm",
    term: "Tiết khí", nextTerm: "tiếp theo",
    tetToday: (y) => `Hôm nay là mùng 1 Tết năm ${y}. Chúc mừng năm mới!`,
    tet: (y, date, n) => `Tết ${y} là ngày ${date}: còn ${n} ngày.`,
    badDate: "Anh chị viết ngày theo dạng YYYY-MM-DD, ví dụ /today 2027-02-06.",
    ziweiUsage: "Cách dùng: /ziwei YYYY-MM-DD HH:MM male|female\nVí dụ: /ziwei 1990-09-19 20:00 male",
    hours: (date, day) => `Giờ hoàng đạo ngày ${date} (ngày ${day}), giờ Việt Nam:`,
    help: [
      "Bot lịch âm Việt Nam.",
      "/today [YYYY-MM-DD]: ngày âm, can chi, tiết khí",
      "/hours [YYYY-MM-DD]: sáu giờ hoàng đạo trong ngày",
      "/tet: còn bao nhiêu ngày tới Tết",
      "/ziwei YYYY-MM-DD HH:MM male|female: tóm tắt lá số Tử Vi",
    ],
  },
  zh: {
    lunar: "农历", leap: "（闰月）", day: "日", month: "月", year: "年",
    term: "节气", nextTerm: "下一个",
    tetToday: (y) => `今天是${y}年正月初一，新年快乐！`,
    tet: (y, date, n) => `${y}年春节是${date}，还有${n}天。`,
    badDate: "请用 YYYY-MM-DD 格式，例如 /today 2027-02-06。",
    ziweiUsage: "用法：/ziwei YYYY-MM-DD HH:MM male|female\n例如：/ziwei 1990-09-19 20:00 male",
    hours: (date, day) => `${date}（${day}日）黄道吉时，越南时间：`,
    help: [
      "越南农历机器人。",
      "/today [YYYY-MM-DD]：农历日期、干支、节气",
      "/hours [YYYY-MM-DD]：当日六个黄道吉时",
      "/tet：距离春节还有几天",
      "/ziwei YYYY-MM-DD HH:MM male|female：紫微斗数命盘摘要",
    ],
  },
};

const pick = (lang) => (L[lang] ? lang : "en");
const pad = (n) => String(n).padStart(2, "0");

/** Today's date in Vietnam (UTC+7) as "YYYY-MM-DD", whatever the server's time zone. */
export function vietnamToday(now = new Date()) {
  const d = new Date(now.getTime() + 7 * 3600 * 1000);
  return `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}`;
}

/** Validates "YYYY-MM-DD" (a real Gregorian day) and returns it, or null. */
function readDate(text) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(text)) return null;
  try {
    const { year, month, day } = parseDate(text);
    return `${year}-${pad(month)}-${pad(day)}` === text ? text : null;
  } catch {
    return null;
  }
}

/** Reply to /today [date]. */
export function todayReply(arg = "", { lang = "en", now } = {}) {
  const t = L[pick(lang)];
  const date = arg.trim() ? readDate(arg.trim()) : vietnamToday(now);
  if (!date) return t.badDate;
  const l = toLunar(date, { lang: pick(lang) });
  const term = solarTermOn(date, { lang: pick(lang) });
  return [
    `${date}`,
    `${t.lunar}: ${l.day}/${l.month}/${l.year}${l.leap ? t.leap : ""}`,
    `${t.day} ${l.dayName} · ${t.month} ${l.monthName} · ${t.year} ${l.yearName} (${l.zodiac})`,
    `${t.term}: ${term.current.name} (${t.nextTerm}: ${term.next.name}, ${term.next.date})`,
  ].join("\n");
}

/** Reply to /hours [date]: the six auspicious double hours of the day. */
export function hoursReply(arg = "", { lang = "en", now } = {}) {
  const t = L[pick(lang)];
  const date = arg.trim() ? readDate(arg.trim()) : vietnamToday(now);
  if (!date) return t.badDate;
  const r = auspiciousHours(date, { lang: pick(lang) });
  return [t.hours(date, r.day), ...r.hours.filter((h) => h.auspicious).map((h) => `${h.range} ${h.branch} (${h.animal}), ${h.spirit}`)].join("\n");
}

/** Reply to /tet. */
export function tetReply({ lang = "en", now } = {}) {
  const t = L[pick(lang)];
  const today = vietnamToday(now);
  const l = toLunar(today);
  let tet = toSolar({ year: l.year, month: 1, day: 1 }).date;
  if (tet < today) tet = toSolar({ year: l.year + 1, month: 1, day: 1 }).date;
  const days = Math.round((Date.parse(tet) - Date.parse(today)) / 86400000);
  const yearName = toLunar(tet, { lang: pick(lang) }).yearName;
  return days === 0 ? t.tetToday(yearName) : t.tet(yearName, tet, days);
}

/** Reply to /ziwei YYYY-MM-DD HH:MM male|female: the chart as text. */
export function ziweiReply(arg = "", { lang = "en" } = {}) {
  const t = L[pick(lang)];
  const [d, time, gender] = arg.trim().split(/\s+/);
  const date = readDate(d ?? "");
  if (!date || !/^([01]\d|2[0-3]):[0-5]\d$/.test(time ?? "") || !["male", "female"].includes(gender)) {
    return t.ziweiUsage;
  }
  const chart = castZiWei({ date, time, gender, lang: pick(lang) });
  return chartToText(chart, { detail: "summary" });
}

/** Reply to /start and /help. */
export function helpReply({ lang = "en" } = {}) {
  return L[pick(lang)].help.join("\n");
}
