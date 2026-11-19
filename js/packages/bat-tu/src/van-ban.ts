// In lá số Bát Tự thành văn bản markdown gọn cho mô hình ngôn ngữ đọc: mỗi trụ
// một khối, chỉ dữ kiện tính được (không lời luận), ba thứ tiếng, dòng cuối ghi
// nguồn. Bản Python (`nhatnguyet/van_ban.py`) ra ĐÚNG TỪNG BYTE như bản này
// (test bat-tu/test/van-ban.test.ts gọi Python so trực tiếp).
//
// BaZi chart as compact markdown text for language models.

import { checkLang, checkTerms } from "@nhatnguyet/am-lich";
import type { Lang, Pillar, Terms } from "@nhatnguyet/am-lich";
import { localizeBaZi } from "./en.ts";
import type { BaZiChart, BaZiPillar } from "./en.ts";
import type { LaSoBatTu } from "./la-so.ts";

/** How much to print: "summary" (pillars and luck pillars) or "full" (default). */
export type TextDetail = "summary" | "full";

/** Options of `chartToText`. */
export interface ChartTextOptions {
  /** Language of the text; default: the chart's `lang` ("en" for a raw chart). */
  lang?: Lang;
  /** With lang "en": "pinyin", "han" or "vi" (see `BaZiInput.terms`); default: the chart's `terms`. */
  terms?: Terms;
  /** "full" (default): adds twelve stages, symbolic stars, conception pillar, life palace. "summary": pillars and luck pillars. */
  detail?: TextDetail;
}

/** Dòng ghi nguồn cuối mọi văn bản, theo ngôn ngữ. */
export const SOURCE_LINE: Readonly<Record<Lang, string>> = {
  vi: "Dữ liệu: Nhật Nguyệt (nhatnguyet.org)",
  en: "Data: Nhat Nguyet (nhatnguyet.org)",
  zh: "数据：Nhat Nguyet (nhatnguyet.org)",
};

const NHAN = {
  vi: {
    title: "Lá số Bát Tự (Tứ Trụ)", intro: "Chỉ gồm dữ kiện tính được, không có lời luận.", colon: ": ",
    gender: "Giới tính", male: "Nam", female: "Nữ", solar: "Ngày sinh dương lịch", unknownTime: "chưa biết giờ",
    dayMaster: "Nhật chủ", solarTerm: "Tiết khí lúc sinh", monthTerm: "Tiết mở tháng sinh", pillarYear: "Năm của trụ năm",
    calendar: "Giờ", calendarValue: "giờ Việt Nam, UTC+7",
    pillars: "Bốn trụ", year: "Trụ năm", month: "Trụ tháng", day: "Trụ ngày", hour: "Trụ giờ",
    stem: "Thiên can", branch: "Địa chi", tenGod: "thập thần", hidden: "Tàng can", naYin: "Nạp âm",
    stage: "Trường sinh của nhật chủ", selfStage: "Tự tọa", stars: "Thần sát", none: "không có",
    other: "Trụ phụ", conception: "Thai nguyên", lifePalace: "Mệnh cung",
    luck: "Đại vận", direction: "Chiều", forward: "thuận", backward: "nghịch",
    start: "Khởi vận", startValue: "{years} năm {months} tháng, ngày {date}", counted: "Tính từ tiết",
    countedValue: "{term} {date} {time}, cách {days} ngày", luckLine: "{label}, từ {age} tuổi ({from}-{to})",
    symbolic: "Thần sát theo trụ", notes: "Ghi chú", semi: "; ", stageShort: "trường sinh của nhật chủ",
  },
  en: {
    title: "BaZi (Four Pillars) chart", intro: "Computed data only, no interpretation.", colon: ": ",
    gender: "Gender", male: "male", female: "female", solar: "Birth date (Gregorian)", unknownTime: "time unknown",
    dayMaster: "Day Master", solarTerm: "Solar term at birth", monthTerm: "Term that opened the birth month", pillarYear: "Year of the year pillar",
    calendar: "Time", calendarValue: "Vietnam time, UTC+7",
    pillars: "Four pillars", year: "Year pillar", month: "Month pillar", day: "Day pillar", hour: "Hour pillar",
    stem: "Stem", branch: "Branch", tenGod: "Ten God", hidden: "Hidden stems", naYin: "Na yin",
    stage: "Day Master's stage here", selfStage: "Own stage", stars: "Symbolic stars", none: "none",
    other: "Other pillars", conception: "Conception pillar", lifePalace: "Life palace",
    luck: "Luck pillars", direction: "Direction", forward: "forward", backward: "backward",
    start: "Luck starts", startValue: "at {years} years {months} months, on {date}", counted: "Counted from",
    countedValue: "{term} {date} {time}, {days} days", luckLine: "{label}, from age {age} ({from}-{to})",
    symbolic: "Symbolic stars by pillar", notes: "Notes", semi: "; ", stageShort: "Day Master's stage",
  },
  zh: {
    title: "八字命盘（四柱）", intro: "仅列可计算的数据，不含论断。", colon: "：",
    gender: "性别", male: "男", female: "女", solar: "公历生日", unknownTime: "时辰未知",
    dayMaster: "日主", solarTerm: "出生节气", monthTerm: "月令所起之节", pillarYear: "年柱所属年",
    calendar: "时间", calendarValue: "越南时间，UTC+7",
    pillars: "四柱", year: "年柱", month: "月柱", day: "日柱", hour: "时柱",
    stem: "天干", branch: "地支", tenGod: "十神", hidden: "藏干", naYin: "纳音",
    stage: "日主十二长生", selfStage: "自坐", stars: "神煞", none: "无",
    other: "其他", conception: "胎元", lifePalace: "命宫",
    luck: "大运", direction: "顺逆", forward: "顺行", backward: "逆行",
    start: "起运", startValue: "{years}年{months}个月，{date}", counted: "起算节气",
    countedValue: "{term} {date} {time}，相距{days}天", luckLine: "{label}，{age}岁起（{from}-{to}）",
    symbolic: "各柱神煞", notes: "说明", semi: "；", stageShort: "日主十二长生",
  },
} as const;

const TEN_TRU = ["year", "month", "day", "hour"] as const;

/** Thay {khoá} trong mẫu câu. */
function dien(mau: string, vao: Record<string, string | number>): string {
  return mau.replace(/\{(\w+)\}/g, (_, k: string) => String(vao[k]));
}

function chuanHoa(chart: BaZiChart | Omit<BaZiChart, "toSvg"> | LaSoBatTu, lang?: Lang, terms?: Terms): Omit<BaZiChart, "toSvg"> {
  if (chart && typeof chart === "object" && "raw" in chart && "pillars" in chart) {
    const l = checkLang(lang ?? chart.lang);
    return localizeBaZi(chart.raw, l, checkTerms(terms ?? (l === chart.lang ? chart.terms : undefined), l));
  }
  if (chart && typeof chart === "object" && "truNgay" in chart) return localizeBaZi(chart, checkLang(lang ?? "en"), terms);
  throw new TypeError("chartToText expects a chart from castBaZi or lapLaSoBatTu");
}

function truPhu(p: Pillar): string {
  return `${p.label} (${p.naYin})`;
}

/**
 * Print a BaZi (Four Pillars) chart as compact markdown for a language model:
 * the birth data, one block per pillar, the luck pillars and (in "full") the
 * twelve stages and symbolic stars. Only computed facts; no interpretation.
 * Ends with the source line.
 *
 * @example chartToText(castBaZi({ date: "1990-09-19", time: "20:00", gender: "male" }))
 */
export function chartToText(chart: BaZiChart | Omit<BaZiChart, "toSvg"> | LaSoBatTu, opts: ChartTextOptions = {}): string {
  if (opts.detail !== undefined && opts.detail !== "summary" && opts.detail !== "full") {
    throw new TypeError(`detail must be "summary" or "full", got ${JSON.stringify(opts.detail)}`);
  }
  const c = chuanHoa(chart, opts.lang, opts.terms);
  const t = NHAN[c.lang];
  const day = opts.detail !== "summary";
  const d: string[] = [];
  const dong = (nhan: string, giaTri: string | number) => d.push(`- ${nhan}${t.colon}${giaTri}`);
  d.push(`# ${t.title}`, "", t.intro, "");
  dong(t.gender, c.gender === "female" ? t.female : t.male);
  dong(t.solar, c.time ? `${c.solarDate} ${c.time}` : `${c.solarDate} (${t.unknownTime})`);
  dong(t.dayMaster, `${c.dayMaster.stem} (${c.dayMaster.element}, ${c.dayMaster.yinYang})`);
  dong(t.solarTerm, c.solarTerm);
  dong(t.monthTerm, c.monthTerm);
  dong(t.pillarYear, c.pillarYear);
  dong(t.calendar, t.calendarValue);

  d.push("", `## ${t.pillars}`);
  for (const k of TEN_TRU) {
    const p: BaZiPillar | null = c.pillars[k];
    if (!p) {
      d.push("", `### ${t[k]}${t.colon}${t.unknownTime}`);
      continue;
    }
    d.push("", `### ${t[k]}${t.colon}${p.label}`);
    dong(t.stem, `${p.stem} (${p.stemElement}), ${t.tenGod}${t.colon}${p.tenGod}`);
    dong(t.branch, `${p.branch} (${p.branchElement})`);
    dong(t.hidden, p.hiddenStems.map((h) => `${h.stem} (${h.element}, ${h.role}, ${h.tenGod})`).join(", "));
    dong(t.naYin, p.naYin);
    if (day) {
      dong(t.stage, p.stage);
      dong(t.selfStage, p.selfStage);
      dong(t.stars, p.stars.length ? p.stars.join(", ") : t.none);
    }
  }

  if (day) {
    d.push("", `## ${t.other}`);
    dong(t.conception, truPhu(c.conception));
    dong(t.lifePalace, c.lifePalace ? truPhu(c.lifePalace) : t.unknownTime);
  }

  const lk = c.luck;
  d.push("", `## ${t.luck}`);
  dong(t.direction, lk.direction === "forward" ? t.forward : t.backward);
  dong(t.start, dien(t.startValue, { years: lk.startAge.years, months: lk.startAge.months, date: lk.startDate }));
  if (day) dong(t.counted, dien(t.countedValue, { term: lk.term.name, date: lk.term.date, time: lk.term.time, days: lk.days }));
  for (const v of lk.pillars) {
    const dau = dien(t.luckLine, { label: v.label, age: v.fromAge, from: v.fromYear, to: v.toYear });
    d.push(`- ${v.order}. ${dau}${t.semi}${t.tenGod}${t.colon}${v.tenGod}${day ? `${t.semi}${t.stageShort}${t.colon}${v.stage}` : ""}`);
  }

  const coSao = c.symbolicStars.filter((s) => s.pillars.length);
  if (day && coSao.length) {
    d.push("", `## ${t.symbolic}`);
    for (const s of coSao) d.push(`- ${s.name}${t.colon}${s.pillars.map((x) => t[x]).join(", ")}`);
  }

  d.push("", `## ${t.notes}`);
  for (const n of c.notes) d.push(`- ${n}`);
  d.push("", SOURCE_LINE[c.lang]);
  return d.join("\n") + "\n";
}

/** Same as `chartToText` (explicit name when several packages are imported together). */
export const baZiToText = chartToText;
