#!/usr/bin/env node
// Sinh bộ câu hỏi đánh giá AI (questions.jsonl): mỗi đáp án do chính bộ máy
// tính ra (am-lich, tu-vi, bat-tu, than-so-hoc), không câu nào gõ tay đáp án.
// Tất định: cùng mã nguồn, cùng hạt giống thì ra cùng từng byte
// (check.test.mjs ép). Không gọi mạng, không gọi mô hình nào.
//
// Deterministic generator of the AI evaluation set. Every answer is computed
// by the Nhat Nguyet engine; the same sources and seed give the same bytes.
// Hard cases for the Vietnamese/Chinese calendar come from the published
// comparison in doi-chieu/ (khac-ngay-am.csv, ket-qua.json).
//
//   node --conditions=source ai-eval/generate.mjs           # write questions.jsonl
//   node --conditions=source ai-eval/generate.mjs --check   # check only

import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import * as AL from "../js/packages/am-lich/src/index.ts";
import * as TV from "../js/packages/tu-vi/src/index.ts";
import * as BT from "../js/packages/bat-tu/src/index.ts";
import * as TSH from "../js/packages/than-so-hoc/src/index.ts";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, "..");
export const OUT_FILE = "questions.jsonl";
export const SEED = 20261119;
export const VERSION = "1.0.0";

// ---------------------------------------------------------------- ngẫu nhiên tất định

function mulberry32(a) {
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const JD_FIRST = AL.jdFromDate(1, 1, 1900);
const JD_LAST = AL.jdFromDate(31, 12, 2100);
const p2 = (n) => String(n).padStart(2, "0");
const iso = (d) => `${String(d.year).padStart(4, "0")}-${p2(d.month)}-${p2(d.day)}`;
const hhmm = (h, m) => `${p2(h)}:${p2(m)}`;

class Rng {
  constructor(seed) {
    this.r = mulberry32(seed);
  }
  int(a, b) {
    return a + Math.floor(this.r() * (b - a + 1));
  }
  pick(rows) {
    return rows[Math.floor(this.r() * rows.length)];
  }
  /** Lấy n phần tử khác nhau, giữ thứ tự xuất hiện trong ds. */
  sample(rows, n) {
    const picked = new Set();
    while (picked.size < Math.min(n, rows.length)) picked.add(Math.floor(this.r() * rows.length));
    return [...picked].sort((a, b) => a - b).map((i) => rows[i]);
  }
  date(tu = JD_FIRST, den = JD_LAST) {
    return AL.jdToDate(this.int(tu, den));
  }
}

// ---------------------------------------------------------------- tên ba thứ tiếng

const pillarNames = (label) => ({ vi: label, en: AL.stemBranchName(label, "en"), zh: AL.stemBranchName(label, "zh") });
const branchNames = (vi) => ({ vi, en: AL.termName(vi, "en"), zh: AL.termName(vi, "zh") });

const LUNAR_JSON = '{"year": <lunar year>, "month": <1-12>, "day": <1-30>, "leap": <true|false>}';

/** Ghi chú quy ước dùng chung cho câu hỏi, ba thứ tiếng. */
const VN = {
  en: "Vietnamese lunar calendar, computed for Vietnam time (UTC+7)",
  vi: "âm lịch Việt Nam, tính theo giờ Việt Nam (UTC+7)",
  zh: "越南农历（按越南时间 UTC+7 计算）",
};
const CN = {
  en: "Chinese lunar calendar, computed for China Standard Time (UTC+8)",
  vi: "âm lịch Trung Quốc, tính theo giờ Bắc Kinh (UTC+8)",
  zh: "中国农历（按北京时间 UTC+8 计算）",
};

// ---------------------------------------------------------------- dữ kiện khó

/**
 * Gregorian years holding the five months where the engine at UTC+8 does not
 * reproduce the reference Chinese calendar (doi-chieu/README.md, "Same time
 * zone, still different"): Chinese-calendar answers never come from them.
 */
export const CN_UNRELIABLE_YEARS = new Set([1914, 1916, 1920, 2057, 2097]);

/** "1984-10n-15" (doi-chieu format, n = leap) to a lunar date. */
function parseLunar(s) {
  const k = /^(\d{4})-(\d{2})(n?)-(\d{2})$/.exec(s);
  if (!k) throw new Error("bad lunar date " + s);
  return { year: +k[1], month: +k[2], leap: k[3] === "n", day: +k[4] };
}

/**
 * The days 1900 to 2100 whose Vietnamese lunar date differs from the Chinese
 * one given by lunar-javascript, read from the published comparison
 * (doi-chieu/khac-ngay-am.csv, 2,724 days). The Vietnamese date of every row
 * is recomputed by the engine and must match the file.
 */
export function vnCnDays() {
  const lines = readFileSync(path.join(ROOT, "doi-chieu/khac-ngay-am.csv"), "utf8").trim().split("\n").slice(1);
  const out = [];
  for (const line of lines) {
    const [date, vn, ljs] = line.split(",");
    if (vn === ljs) continue;
    const [y, m, d] = date.split("-").map(Number);
    const l = AL.toLunar(date);
    const v = parseLunar(vn);
    if (l.year !== v.year || l.month !== v.month || l.day !== v.day || l.leap !== v.leap) throw new Error("engine differs from doi-chieu at " + date);
    out.push({ d: { year: y, month: m, day: d }, cn: parseLunar(ljs) });
  }
  return out;
}

/** Năm có Tết Việt Nam khác Tết Trung Quốc. */
export function tetYearsVnCn() {
  const out = [];
  for (let y = 1900; y <= 2100; y++) {
    if (CN_UNRELIABLE_YEARS.has(y)) continue;
    const vn = AL.toSolar({ year: y, month: 1, day: 1 }).date;
    const cn = AL.toSolar({ year: y, month: 1, day: 1 }, { country: "CN" }).date;
    if (vn !== cn) out.push({ y, vn, cn });
  }
  // Chinese dates must agree with lunar-javascript in the published comparison.
  const ref = JSON.parse(readFileSync(path.join(ROOT, "doi-chieu/ket-qua.json"), "utf8")).tet.khacVN;
  if (ref.length !== out.length || ref.some((r, i) => r.nam !== out[i].y || r.nhatNguyetVN !== out[i].vn || r.lunarJavascript !== out[i].cn)) {
    throw new Error("Tết years differ from doi-chieu/ket-qua.json");
  }
  return out;
}

const lunarText = (l) => `${l.year}-${p2(l.month)}-${p2(l.day)}${l.leap ? " (leap month)" : ""}`;

// ---------------------------------------------------------------- từng loại câu

function lunarDateItems(rng, diffDays) {
  const out = [];
  const cnByDate = new Map(diffDays.map((k) => [iso(k.d), k.cn]));
  const add = (d, hard) => {
    const l = AL.toLunar(d);
    const s = iso(d);
    const cn = cnByDate.get(s);
    const item = {
      task: "lunar_date",
      tool: "lunar_convert",
      difficulty: hard ? "hard" : "easy",
      input: { date: s, calendar: "VN" },
      question_en: `Convert the Gregorian date ${s} to the ${VN.en}. Answer with JSON ${LUNAR_JSON}.`,
      question_vi: `Đổi ngày dương lịch ${s} sang ${VN.vi}. Trả lời bằng JSON ${LUNAR_JSON}.`,
      question_zh: `将公历 ${s} 换算为${VN.zh}。请以 JSON 回答：${LUNAR_JSON}。`,
      answer: { year: l.year, month: l.month, day: l.day, leap: l.leap },
      answer_text: `Lunar year ${l.year}, month ${l.month}${l.leap ? " (leap month)" : ""}, day ${l.day}.`,
    };
    if (hard) item.hard_case_reason = hard;
    else if (cn) {
      item.difficulty = "hard";
      item.hard_case_reason = `The Vietnamese and Chinese calendars differ on this date: the Chinese calendar (lunar-javascript) gives ${lunarText(cn)}.`;
    }
    out.push(item);
  };
  for (const k of rng.sample(diffDays, 120)) {
    add(k.d, `The Vietnamese and Chinese calendars differ on this date: the Chinese calendar (lunar-javascript) gives ${lunarText(k.cn)}.`);
  }
  // Ngày trong tháng nhuận.
  let n = 0;
  while (n < 40) {
    const d = rng.date();
    const l = AL.toLunar(d);
    if (!l.leap) continue;
    add(d, `Falls in a leap (intercalary) month, ${l.month} nhuận of lunar year ${l.year}.`);
    n++;
  }
  for (let i = 0; i < 140; i++) add(rng.date(), null);
  return out;
}

function tetItems(rng, tetDiff) {
  const out = [];
  const add = (y, country, hard) => {
    const cal = country === "VN" ? VN : CN;
    const d = AL.toSolar({ year: y, month: 1, day: 1 }, { country }).date;
    const item = {
      task: "tet_date",
      tool: "lunar_convert",
      difficulty: hard ? "hard" : "easy",
      input: { lunar_year: y, calendar: country },
      question_en: `On which Gregorian date does lunar new year (day 1 of month 1) of lunar year ${y} fall in the ${cal.en}? Answer with JSON {"date": "YYYY-MM-DD"}.`,
      question_vi: `Tết Nguyên Đán (mùng 1 tháng Giêng) của năm âm lịch ${y} theo ${cal.vi} rơi vào ngày dương lịch nào? Trả lời bằng JSON {"date": "YYYY-MM-DD"}.`,
      question_zh: `按${cal.zh}，农历 ${y} 年正月初一是公历哪一天？请以 JSON 回答：{"date": "YYYY-MM-DD"}。`,
      answer: { date: d },
      answer_text: `${d}.`,
    };
    if (hard) item.hard_case_reason = hard;
    out.push(item);
  };
  for (const t of tetDiff) {
    const r = `Vietnam and China celebrate this lunar new year on different days: ${t.vn} in Vietnam, ${t.cn} in China.`;
    add(t.y, "VN", r);
    add(t.y, "CN", r);
  }
  const diffDays = new Set(tetDiff.map((t) => t.y));
  const years = [];
  for (let y = 1900; y <= 2100; y++) if (!diffDays.has(y) && !CN_UNRELIABLE_YEARS.has(y)) years.push(y);
  for (const y of rng.sample(years, 62)) add(y, rng.r() < 0.5 ? "VN" : "CN", null);
  return out;
}

function dayPillarItems(rng) {
  const out = [];
  for (let i = 0; i < 100; i++) {
    const d = rng.date();
    const s = iso(d);
    const label = AL.dayPillar(s, { lang: "vi" }).label;
    out.push({
      task: "day_pillar",
      tool: "lunar_convert",
      difficulty: "easy",
      input: { date: s },
      question_en: `What is the sexagenary (stem-branch, can chi) name of the day ${s}? Answer with JSON {"pillar": "<stem> <branch>"}; Vietnamese, pinyin or Chinese characters are all accepted.`,
      question_vi: `Ngày dương lịch ${s} là ngày can chi gì? Trả lời bằng JSON {"pillar": "<can> <chi>"}; viết bằng tiếng Việt, pinyin hay chữ Hán đều được.`,
      question_zh: `公历 ${s} 的日干支是什么？请以 JSON 回答：{"pillar": "<天干><地支>"}，越南文、拼音或汉字皆可。`,
      answer: { pillar: pillarNames(label) },
      answer_text: `${AL.stemBranchName(label, "en")} (${label}, ${AL.stemBranchName(label, "zh")}).`,
    });
  }
  return out;
}

function yearPillarItems(rng) {
  const out = [];
  const add = (d, hard) => {
    const s = iso(d);
    const l = AL.toLunar(s, { lang: "vi" });
    const item = {
      task: "year_pillar",
      tool: "lunar_convert",
      difficulty: hard ? "hard" : "easy",
      input: { date: s, calendar: "VN" },
      question_en: `What is the sexagenary (stem-branch) name of the lunar year that contains the Gregorian date ${s} in the ${VN.en}? The lunar year starts at lunar new year (Tết). Answer with JSON {"pillar": "<stem> <branch>"}.`,
      question_vi: `Ngày dương lịch ${s} thuộc năm âm lịch nào, tên can chi là gì (theo ${VN.vi}; năm âm lịch bắt đầu từ Tết)? Trả lời bằng JSON {"pillar": "<can> <chi>"}.`,
      question_zh: `按${VN.zh}，公历 ${s} 所在农历年的干支是什么（农历年自春节起算）？请以 JSON 回答：{"pillar": "<天干><地支>"}。`,
      answer: { pillar: pillarNames(l.yearName), lunar_year: l.year },
      answer_text: `${AL.stemBranchName(l.yearName, "en")} (${l.yearName}), lunar year ${l.year}.`,
    };
    if (hard) item.hard_case_reason = hard;
    out.push(item);
  };
  let n = 0;
  while (n < 50) {
    const y = rng.int(1901, 2100);
    const tet = AL.toSolar({ year: y, month: 1, day: 1 });
    const jdTet = AL.jdFromDate(tet.day, tet.month, tet.year);
    const jd = rng.int(AL.jdFromDate(1, 1, y), jdTet - 1);
    const d = AL.jdToDate(jd);
    const startOfSpring = AL.solarTerms(y).find((t) => t.nameVi === "Lập Xuân");
    const afterStartOfSpring = iso(d) >= startOfSpring.date;
    add(
      d,
      `Before lunar new year (${tet.date}): the date still belongs to lunar year ${y - 1}, not ${y}.` +
        (afterStartOfSpring ? ` It is also after Start of Spring (${startOfSpring.date}), where the BaZi year pillar already changes.` : ""),
    );
    n++;
  }
  for (let i = 0; i < 50; i++) add(rng.date(), null);
  return out;
}

function solarTermOnDateItems(rng) {
  const out = [];
  const add = (s, hard) => {
    const t = AL.solarTermOn(s).current;
    const vi = t.nameVi;
    const item = {
      task: "solar_term_on_date",
      tool: "solar_terms",
      difficulty: hard ? "hard" : "easy",
      input: { date: s, calendar: "VN" },
      question_en: `Which of the 24 solar terms is in effect on ${s} in Vietnam, that is, the term whose start date (in Vietnam time, UTC+7) is the latest one not after ${s}? Answer with JSON {"solar_term": "<name>"}; English, Vietnamese or Chinese names are accepted.`,
      question_vi: `Ngày ${s} thuộc tiết khí nào trong 24 tiết khí ở Việt Nam, tức tiết có ngày bắt đầu (theo giờ Việt Nam, UTC+7) muộn nhất mà không sau ngày ${s}? Trả lời bằng JSON {"solar_term": "<tên>"}; tên tiếng Việt, tiếng Anh hay chữ Hán đều được.`,
      question_zh: `在越南，${s} 处于二十四节气中的哪一个（即按越南时间 UTC+7，开始日期不晚于 ${s} 的最近一个节气）？请以 JSON 回答：{"solar_term": "<名称>"}，中文、越南文或英文名称皆可。`,
      answer: { solar_term: { vi, en: t.name, zh: AL.term(vi, "zh") } },
      answer_text: `${t.name} (${vi}, ${AL.term(vi, "zh")}), which starts ${t.date} ${t.time} Vietnam time.`,
    };
    if (hard) item.hard_case_reason = hard;
    out.push(item);
  };
  for (let i = 0; i < 40; i++) {
    const y = rng.int(1900, 2100);
    const t = rng.pick(AL.solarTerms(y));
    const dayBefore = rng.r() < 0.5;
    let s = t.date;
    if (dayBefore) {
      const d = AL.jdToDate(AL.jdFromDate(+s.slice(8, 10), +s.slice(5, 7), +s.slice(0, 4)) - 1);
      s = iso(d);
    }
    add(
      s,
      dayBefore
        ? `The day before ${t.nameVi} (${t.name}) starts (${t.date} ${t.time} Vietnam time): the previous term is still in effect.`
        : `${t.nameVi} (${t.name}) starts on this very day, at ${t.time} Vietnam time.`,
    );
  }
  for (let i = 0; i < 60; i++) add(iso(rng.date()), null);
  return out;
}

function solarTermMomentItems(rng) {
  const out = [];
  const add = (y, idx, country, hard) => {
    const cal = country === "VN" ? { en: "Vietnam time, UTC+7", vi: "giờ Việt Nam, UTC+7", zh: "越南时间 UTC+7" } : { en: "China Standard Time, UTC+8", vi: "giờ Bắc Kinh, UTC+8", zh: "北京时间 UTC+8" };
    const t = AL.solarTerms(y, { country })[idx];
    const vi = t.nameVi;
    const zh = AL.term(vi, "zh");
    const item = {
      task: "solar_term_moment",
      tool: "solar_terms",
      difficulty: hard ? "hard" : "easy",
      input: { year: y, solar_term: vi, time_zone: country === "VN" ? 7 : 8 },
      question_en: `In Gregorian year ${y}, at what date and time (${cal.en}, to the minute) does the solar term ${t.name} (${vi}, ${zh}, sun at ${t.longitude}°) begin? Answer with JSON {"date": "YYYY-MM-DD", "time": "HH:MM"}.`,
      question_vi: `Trong năm dương lịch ${y}, tiết ${vi} (${zh}, Mặt Trời ở ${t.longitude}°) bắt đầu vào ngày giờ nào (${cal.vi}, tới phút)? Trả lời bằng JSON {"date": "YYYY-MM-DD", "time": "HH:MM"}.`,
      question_zh: `公历 ${y} 年，${zh}（太阳黄经 ${t.longitude}°）交节的日期与时刻是什么（${cal.zh}，精确到分钟）？请以 JSON 回答：{"date": "YYYY-MM-DD", "time": "HH:MM"}。`,
      answer: { date: t.date, time: t.time },
      answer_text: `${t.date} ${t.time} (${cal.en}).`,
    };
    if (hard) item.hard_case_reason = hard;
    out.push(item);
  };
  // Mốc rơi trong giờ cuối ngày ở Việt Nam: sang giờ Bắc Kinh là ngày hôm sau.
  const nearMidnight = [];
  for (let y = 1900; y <= 2100; y++) {
    const vn = AL.solarTerms(y);
    const cn = AL.solarTerms(y, { country: "CN" });
    vn.forEach((t, i) => {
      if (t.date !== cn[i].date && cn[i].date.slice(0, 4) === String(y)) nearMidnight.push({ y, i, vn: t, cn: cn[i] });
    });
  }
  for (const k of rng.sample(nearMidnight, 60)) {
    const country = rng.r() < 0.5 ? "VN" : "CN";
    add(k.y, k.i, country, `The moment falls near midnight: ${k.vn.date} ${k.vn.time} in Vietnam (UTC+7) but ${k.cn.date} ${k.cn.time} in China (UTC+8), so the date depends on the time zone.`);
  }
  for (let i = 0; i < 100; i++) {
    const y = rng.int(1900, 2100);
    const idx = rng.int(0, 23);
    const country = rng.r() < 0.5 ? "VN" : "CN";
    const vn = AL.solarTerms(y)[idx];
    const cn = AL.solarTerms(y, { country: "CN" })[idx];
    if (vn.date !== cn.date) {
      i--;
      continue;
    }
    add(y, idx, country, null);
  }
  return out;
}

const GENDER = { male: { en: "male", vi: "nam", zh: "男" }, female: { en: "female", vi: "nữ", zh: "女" } };
const ZIWEI_RULES = {
  en: "Use the Vietnamese lunar calendar (UTC+7); the clock time maps to its double hour (Tý is 23:00 to 00:59) and a birth after 23:00 keeps the date given; a leap month counts as the month of the same number.",
  vi: "Dùng âm lịch Việt Nam (UTC+7); giờ đồng hồ đổi sang giờ âm (giờ Tý từ 23:00 tới 00:59), sinh sau 23:00 vẫn giữ ngày đã cho; tháng nhuận tính như tháng cùng số.",
  zh: "使用越南农历（UTC+7）；钟点按时辰换算（子时为 23:00 至 00:59），23 点后出生仍按所给日期；闰月按同数之月计。",
};

function ziweiItems(rng, diffDays) {
  const out = [];
  const CHINH = Object.keys(TV.CHINH_TINH_NAME_EN);
  const births = [];
  // Ngày khác lịch Việt, Trung.
  for (const k of rng.sample(diffDays, 60)) {
    births.push({ d: k.d, h: rng.int(0, 22), m: rng.int(0, 59), hard: `Born on a day where the Vietnamese and Chinese calendars differ (Chinese calendar: ${lunarText(k.cn)}); tools built on the Chinese calendar start from that other lunar date.` });
  }
  let n = 0;
  while (n < 30) {
    const d = rng.date();
    const l = AL.toLunar(d);
    if (!l.leap) continue;
    births.push({ d, h: rng.int(0, 22), m: rng.int(0, 59), hard: `Born in a leap month (${l.month} nhuận, lunar year ${l.year}); this chart counts it as month ${l.month}, while some software splits leap months at day 15.` });
    n++;
  }
  for (let i = 0; i < 30; i++) {
    births.push({ d: rng.date(), h: 23, m: rng.int(0, 59), hard: "Born after 23:00: the Tý double hour, with the date kept as given (some texts move it to the next day)." });
  }
  for (let i = 0; i < 240; i++) births.push({ d: rng.date(), h: rng.int(0, 23), m: rng.int(0, 59), hard: null });
  // 360 lá: mỗi lá một câu, xoay vòng ba loại câu.
  births.forEach((v, i) => {
    const gender = rng.r() < 0.5 ? "male" : "female";
    const s = iso(v.d);
    const t = hhmm(v.h, v.m);
    const c = TV.castZiWei({ date: s, time: t, gender, lang: "vi" });
    const g = GENDER[gender];
    const born = {
      en: `A ${g.en} born on ${s} at ${t} (Vietnam time)`,
      vi: `Người ${g.vi} sinh ngày ${s} lúc ${t} (giờ Việt Nam)`,
      zh: `${g.zh}命，生于 ${s} ${t}（越南时间）`,
    };
    const base = { tool: "cast_ziwei", difficulty: v.hard ? "hard" : "easy", input: { date: s, time: t, gender } };
    const kind = i % 3;
    let item;
    if (kind === 0) {
      const branch = c.palaces[c.lifePalace].branch;
      item = {
        task: "ziwei_life_palace",
        ...base,
        question_en: `${born.en}. In Zi Wei Dou Shu (Tử Vi), which earthly branch holds the Life palace (Mệnh, 命宫)? ${ZIWEI_RULES.en} Answer with JSON {"branch": "<branch>"}.`,
        question_vi: `${born.vi}. Trong lá số Tử Vi, cung Mệnh an ở chi nào? ${ZIWEI_RULES.vi} Trả lời bằng JSON {"branch": "<chi>"}.`,
        question_zh: `${born.zh}。紫微斗数命盘中，命宫在哪个地支？${ZIWEI_RULES.zh}请以 JSON 回答：{"branch": "<地支>"}。`,
        answer: { branch: branchNames(branch) },
        answer_text: `The Life palace is at ${AL.termName(branch, "en")} (${branch}, ${AL.termName(branch, "zh")}).`,
      };
    } else if (kind === 1) {
      const bureauEn = TV.castZiWei({ date: s, time: t, gender, lang: "en" }).bureau;
      const bureauZh = TV.castZiWei({ date: s, time: t, gender, lang: "zh" }).bureau;
      item = {
        task: "ziwei_bureau",
        ...base,
        question_en: `${born.en}. In Zi Wei Dou Shu (Tử Vi), what is the element bureau (cục, 五行局) of the chart? ${ZIWEI_RULES.en} Answer with JSON {"bureau": "<name or number>"}.`,
        question_vi: `${born.vi}. Lá số Tử Vi thuộc cục gì? ${ZIWEI_RULES.vi} Trả lời bằng JSON {"bureau": "<tên cục hay số cục>"}.`,
        question_zh: `${born.zh}。紫微斗数命盘属何五行局？${ZIWEI_RULES.zh}请以 JSON 回答：{"bureau": "<局名或局数>"}。`,
        answer: { bureau: { vi: c.bureau.name, en: bureauEn.name, zh: bureauZh.name, number: c.bureau.number } },
        answer_text: `${bureauEn.name} (${c.bureau.name}, ${bureauZh.name}), number ${c.bureau.number}.`,
      };
    } else {
      const star = rng.pick(CHINH);
      const palace = c.palaces.find((p) => p.stars.some((x) => x.nameVi === star));
      const en = TV.starEn(star, TV.CHINH_TINH_NAME_EN[star]);
      const zh = TV.CHINH_TINH_NAME_ZH[star];
      item = {
        task: "ziwei_star_palace",
        ...base,
        input: { ...base.input, star: star },
        question_en: `${born.en}. In Zi Wei Dou Shu (Tử Vi), which earthly branch holds the major star ${en} (${star}, ${zh})? ${ZIWEI_RULES.en} Answer with JSON {"branch": "<branch>"}.`,
        question_vi: `${born.vi}. Trong lá số Tử Vi, sao ${star} (${zh}) an ở chi nào? ${ZIWEI_RULES.vi} Trả lời bằng JSON {"branch": "<chi>"}.`,
        question_zh: `${born.zh}。紫微斗数命盘中，主星${zh}在哪个地支？${ZIWEI_RULES.zh}请以 JSON 回答：{"branch": "<地支>"}。`,
        answer: { branch: branchNames(palace.branch) },
        answer_text: `${en} is at ${AL.termName(palace.branch, "en")} (${palace.branch}, ${AL.termName(palace.branch, "zh")}).`,
      };
    }
    if (v.hard) item.hard_case_reason = v.hard;
    out.push(item);
  });
  return out;
}

const BAZI_RULES = {
  en: "Use the clock time as given in Vietnam time (UTC+7), no true solar time; the year pillar changes at the exact moment of Start of Spring (Lập Xuân), the month pillar at each sectional solar term (jie) to the minute, the day pillar at 23:00, and the hour pillar follows the double hour.",
  vi: "Dùng giờ đồng hồ đã cho theo giờ Việt Nam (UTC+7), không đổi giờ mặt trời thật; trụ năm đổi đúng lúc Lập Xuân, trụ tháng đổi ở từng tiết (tiết lệnh) tới phút, trụ ngày đổi lúc 23:00, trụ giờ theo canh giờ.",
  zh: "按所给越南时间（UTC+7）钟点，不换算真太阳时；年柱以立春交节时刻为界，月柱以各节交节时刻（精确到分钟）为界，日柱于 23:00 换日，时柱按时辰。",
};
const BAZI_JSON = '{"year": "<stem> <branch>", "month": "<stem> <branch>", "day": "<stem> <branch>", "hour": "<stem> <branch>"}';

function baziItems(rng) {
  const out = [];
  const add = (d, h, m, hard) => {
    const gender = rng.r() < 0.5 ? "male" : "female";
    const s = iso(d);
    const t = hhmm(h, m);
    const c = BT.castBaZi({ date: s, time: t, gender, lang: "vi" });
    const pillar = (k) => c.pillars[k].label;
    const item = {
      task: "bazi_pillars",
      tool: "cast_bazi",
      difficulty: hard ? "hard" : "easy",
      input: { date: s, time: t, gender },
      question_en: `Give the BaZi four pillars (year, month, day, hour) for a birth on ${s} at ${t}. ${BAZI_RULES.en} Answer with JSON ${BAZI_JSON}; Vietnamese, pinyin or Chinese characters are all accepted.`,
      question_vi: `Lập tứ trụ Bát Tự (năm, tháng, ngày, giờ) cho người sinh ngày ${s} lúc ${t}. ${BAZI_RULES.vi} Trả lời bằng JSON ${BAZI_JSON.replace(/<stem> <branch>/g, "<can> <chi>")}; viết bằng tiếng Việt, pinyin hay chữ Hán đều được.`,
      question_zh: `请排出生于 ${s} ${t} 者的八字四柱（年、月、日、时）。${BAZI_RULES.zh}请以 JSON 回答：${BAZI_JSON.replace(/<stem> <branch>/g, "<天干><地支>")}，越南文、拼音或汉字皆可。`,
      answer: { year: pillarNames(pillar("year")), month: pillarNames(pillar("month")), day: pillarNames(pillar("day")), hour: pillarNames(pillar("hour")) },
      answer_text: ["year", "month", "day", "hour"].map((k) => `${k} ${AL.stemBranchName(pillar(k), "en")}`).join(", ") + ".",
    };
    if (hard) item.hard_case_reason = hard;
    out.push(item);
  };
  /** Mốc tiết cộng lệch phút ra ngày giờ Việt Nam. */
  const shift = (t, phut) => {
    const [Y, M, D] = t.date.split("-").map(Number);
    const [hh, mm] = t.time.split(":").map(Number);
    let p = hh * 60 + mm + phut;
    let jd = AL.jdFromDate(D, M, Y) + Math.floor(p / 1440);
    p = ((p % 1440) + 1440) % 1440;
    return { d: AL.jdToDate(jd), h: Math.floor(p / 60), m: p % 60 };
  };
  const randomOffset = () => (rng.r() < 0.5 ? -1 : 1) * rng.int(3, 120);
  // Sát Lập Xuân: trụ năm đổi.
  for (let i = 0; i < 30; i++) {
    const y = rng.int(1901, 2099);
    const t = AL.solarTerms(y).find((x) => x.nameVi === "Lập Xuân");
    const o = randomOffset();
    const x = shift(t, o);
    add(x.d, x.h, x.m, `Born ${Math.abs(o)} minutes ${o < 0 ? "before" : "after"} Start of Spring (Lập Xuân, ${t.date} ${t.time} Vietnam time), where both the year and the month pillar change.`);
  }
  // Sát các tiết khác: trụ tháng đổi.
  for (let i = 0; i < 50; i++) {
    const y = rng.int(1900, 2100);
    const t = rng.pick(AL.solarTerms(y).filter((x) => x.kind === "jie" && x.nameVi !== "Lập Xuân"));
    const o = randomOffset();
    const x = shift(t, o);
    add(x.d, x.h, x.m, `Born ${Math.abs(o)} minutes ${o < 0 ? "before" : "after"} the sectional term ${t.name} (${t.nameVi}, ${t.date} ${t.time} Vietnam time), where the month pillar changes.`);
  }
  // Sau 23:00: trụ ngày đã sang ngày sau.
  for (let i = 0; i < 30; i++) add(rng.date(), 23, rng.int(0, 59), "Born after 23:00: the day pillar already belongs to the next day (the Tý hour starts the new day).");
  for (let i = 0; i < 90; i++) {
    const d = rng.date();
    const h = rng.int(0, 22);
    const m = rng.int(0, 59);
    // Câu dễ không được nằm sát một tiết (trong 3 giờ).
    const nearMidnight = AL.solarTerms(d.year).some((t) => {
      if (t.kind !== "jie") return false;
      const [Y, M, D] = t.date.split("-").map(Number);
      const [hh, mm] = t.time.split(":").map(Number);
      const a = AL.jdFromDate(D, M, Y) * 1440 + hh * 60 + mm;
      const b = AL.jdFromDate(d.day, d.month, d.year) * 1440 + h * 60 + m;
      return Math.abs(a - b) < 180;
    });
    if (nearMidnight) {
      i--;
      continue;
    }
    add(d, h, m, null);
  }
  return out;
}

const NUMEROLOGY_RULES = {
  en: 'Pythagorean method: Life Path = add every digit of the birth date (day, month and year), then keep adding the digits of the result until one digit remains, but stop at 11, 22 or 33. Expression = remove Vietnamese diacritics from the full name (Đ becomes D), give each letter its value (A, J, S = 1; B, K, T = 2; ... I, R = 9), add them all, and reduce the same way.',
  vi: "Phương pháp Pythagoras: Số chủ đạo = cộng mọi chữ số của ngày sinh (ngày, tháng, năm), rồi cộng tiếp các chữ số của kết quả tới khi còn một chữ số, nhưng dừng ở 11, 22 hay 33. Số sứ mệnh = bỏ dấu họ tên (Đ thành D), mỗi chữ cái một giá trị (A, J, S = 1; B, K, T = 2; ... I, R = 9), cộng tất cả rồi rút gọn như trên.",
  zh: "毕达哥拉斯法：生命灵数 = 出生日期（日、月、年）各位数字相加，再把结果各位相加直至剩一位数，但遇 11、22、33 即停。使命数 = 姓名去掉越南文声调符号（Đ 作 D），每个字母取值（A、J、S = 1；B、K、T = 2；…… I、R = 9），全部相加后按同法化简。",
};

/** Cách rút gọn từng phần trước (ngày, tháng, năm riêng) mà nhiều nguồn dùng: để đánh dấu câu khó. */
function lifePathByParts(dd, mm, yyyy) {
  const r = (n) => TSH.reduceNumber(TSH.sumDigits(n));
  return TSH.reduceNumber(r(dd) + r(mm) + r(yyyy));
}

function numerologyItems(rng) {
  const out = [];
  const names = [...new Set(JSON.parse(readFileSync(path.join(ROOT, "ca-kiem/than-so-hoc.json"), "utf8")).ca.map((c) => c.vao.hoTen))];
  const add = (name, d, hard) => {
    const s = iso(d);
    const r = TSH.numerology({ name, birthDate: s, today: "2026-01-01" });
    const item = {
      task: "numerology",
      tool: "numerology",
      difficulty: hard ? "hard" : "easy",
      input: { name, birth_date: s },
      question_en: `Compute the numerology Life Path and Expression numbers for ${name}, born ${s}. ${NUMEROLOGY_RULES.en} Answer with JSON {"life_path": <number>, "expression": <number>}.`,
      question_vi: `Tính Số chủ đạo và Số sứ mệnh thần số học cho ${name}, sinh ngày ${s}. ${NUMEROLOGY_RULES.vi} Trả lời bằng JSON {"life_path": <số>, "expression": <số>}.`,
      question_zh: `请计算 ${name}（生于 ${s}）的生命灵数与使命数。${NUMEROLOGY_RULES.zh}请以 JSON 回答：{"life_path": <数字>, "expression": <数字>}。`,
      answer: { life_path: r.lifePath, expression: r.expression },
      answer_text: `Life Path ${r.lifePath}, Expression ${r.expression}.`,
    };
    if (hard) item.hard_case_reason = hard;
    out.push(item);
  };
  let masterCount = 0;
  let partsCount = 0;
  let easyCount = 0;
  let tries = 0;
  while ((masterCount < 30 || partsCount < 30 || easyCount < 60) && tries++ < 200000) {
    const d = rng.date();
    const name = rng.pick(names);
    const r = TSH.numerology({ name, birthDate: iso(d), today: "2026-01-01" });
    const byParts = lifePathByParts(d.day, d.month, d.year);
    if (byParts !== r.lifePath) {
      if (partsCount < 30) {
        add(name, d, `Reducing day, month and year separately first gives ${byParts}; adding every digit at once (the method asked) gives ${r.lifePath}.`);
        partsCount++;
      }
    } else if ([11, 22, 33].includes(r.lifePath) || [11, 22, 33].includes(r.expression)) {
      if (masterCount < 30) {
        add(name, d, "A master number (11, 22 or 33) must be kept, not reduced.");
        masterCount++;
      }
    } else if (easyCount < 60) {
      add(name, d, null);
      easyCount++;
    }
  }
  return out;
}

// ---------------------------------------------------------------- dựng bộ

export function buildSet() {
  const rng = new Rng(SEED);
  const diffDays = vnCnDays();
  const tetDiff = tetYearsVnCn();
  const groups = [
    lunarDateItems(rng, diffDays),
    tetItems(rng, tetDiff),
    dayPillarItems(rng),
    yearPillarItems(rng),
    solarTermOnDateItems(rng),
    solarTermMomentItems(rng),
    ziweiItems(rng, diffDays),
    baziItems(rng),
    numerologyItems(rng),
  ];
  const counts = {};
  const rows = [];
  for (const g of groups) {
    for (const it of g) {
      counts[it.task] = (counts[it.task] ?? 0) + 1;
      const id = `${it.task}-${String(counts[it.task]).padStart(4, "0")}`;
      // Thứ tự khoá cố định.
      const r = {
        id,
        task: it.task,
        difficulty: it.difficulty,
        tool: it.tool,
        input: it.input,
        question_en: it.question_en,
        question_vi: it.question_vi,
        question_zh: it.question_zh,
        answer: it.answer,
        answer_text: it.answer_text,
      };
      if (it.hard_case_reason) r.hard_case_reason = it.hard_case_reason;
      rows.push(r);
    }
  }
  return { rows, stats: { vnCnDays: diffDays.length, tetYears: tetDiff.map((t) => t.y) } };
}

const TASK_TEXT = {
  lunar_date: "Gregorian date to Vietnamese lunar date (year, month, day, leap)",
  tet_date: "Gregorian date of lunar new year, Vietnam or China",
  day_pillar: "Stem-branch name of a day",
  year_pillar: "Stem-branch name of the lunar year containing a date",
  solar_term_on_date: "Solar term in effect on a date (Vietnam)",
  solar_term_moment: "Start of a solar term to the minute, UTC+7 or UTC+8",
  ziwei_life_palace: "Zi Wei: branch of the Life palace",
  ziwei_bureau: "Zi Wei: element bureau (cục)",
  ziwei_star_palace: "Zi Wei: branch holding a given major star",
  bazi_pillars: "BaZi: the four pillars of a birth time",
  numerology: "Numerology: Life Path and Expression of a name and date",
};

const MARK_START = "<!-- counts:start (generated by generate.mjs) -->";
const MARK_END = "<!-- counts:end -->";

/** The README with its task table rebuilt from the rows. */
export function updateReadme(old, rows) {
  const counts = {};
  for (const r of rows) {
    counts[r.task] ??= { easy: 0, hard: 0, tool: r.tool };
    counts[r.task][r.difficulty]++;
  }
  const lines = ["| Task | What is asked | Easy | Hard | MCP tool |", "|---|---|---:|---:|---|"];
  for (const [k, v] of Object.entries(counts)) lines.push(`| \`${k}\` | ${TASK_TEXT[k]} | ${v.easy} | ${v.hard} | \`${v.tool}\` |`);
  const easy = rows.filter((r) => r.difficulty === "easy").length;
  lines.push(`| **Total** | | **${easy}** | **${rows.length - easy}** | ${rows.length} items |`);
  const i = old.indexOf(MARK_START);
  const j = old.indexOf(MARK_END);
  if (i < 0 || j < 0) throw new Error("README lacks the count markers");
  return old.slice(0, i + MARK_START.length) + "\n" + lines.join("\n") + "\n" + old.slice(j);
}

export function toJsonl(rows) {
  return rows.map((r) => JSON.stringify(r)).join("\n") + "\n";
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const { rows, stats } = buildSet();
  const content = toJsonl(rows);
  const p = path.join(HERE, OUT_FILE);
  let old = "";
  try {
    old = readFileSync(p, "utf8");
  } catch {}
  const readmePath = path.join(HERE, "README.md");
  const readmeOld = readFileSync(readmePath, "utf8");
  const readme = updateReadme(readmeOld, rows);
  if (process.argv.includes("--check")) {
    if (old !== content || readme !== readmeOld) {
      console.error(`stale: ${OUT_FILE} or README.md. Run: node --conditions=source ai-eval/generate.mjs`);
      process.exit(1);
    }
  } else {
    if (old !== content) writeFileSync(p, content);
    if (readme !== readmeOld) writeFileSync(readmePath, readme);
  }
  const counts = {};
  for (const r of rows) {
    counts[r.task] ??= { easy: 0, hard: 0 };
    counts[r.task][r.difficulty]++;
  }
  console.log(`${rows.length} items`);
  for (const [k, v] of Object.entries(counts)) console.log(`  ${k}: ${v.easy} easy, ${v.hard} hard`);
  console.log(`Vietnamese lunar date differs from lunar-javascript: ${stats.vnCnDays} days; Tết differs: ${stats.tetYears.join(", ")}`);
}
