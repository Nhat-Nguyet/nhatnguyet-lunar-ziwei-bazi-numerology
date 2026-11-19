// Lớp API tiếng Anh của @nhatnguyet/am-lich: tham số đặt tên, ngày nhận
// `Date`, chuỗi "YYYY-MM-DD" hay {year, month, day}, nước chọn bằng mã ISO,
// kết quả theo `lang` ("vi", "en", "zh"). Mọi phép tính gọi lại đúng hàm tiếng
// Việt của gói (solarToLunar, lunarToSolar, mocTietKhiTrongNam...), không tính
// lại bằng đường song song.
//
// English API layer: named options, flexible date input, country codes and a
// `lang` switch. Every result is produced by the package's original
// Vietnamese-named functions.

import { CON_GIAP, DIA_CHI, THIEN_CAN, chiGioTuGioDongHo, dayCanChi, lunarMonthCanChi, mod, yearCanChi } from "./can-chi.ts";
import { MUI_GIO_THEO_NUOC, TIME_ZONE_VN, jdFromDate, jdToDate, lunarToSolar, solarToLunar } from "./lich.ts";
import { CAN_NGU_HANH, CHI_NGU_HANH, HANH_EN, HANH_ZH, nguHanhNapAm } from "./ngu-hanh.ts";
import { mocTietKhiTrongNam, TIET_KHI_TABLE } from "./tiet-khi.ts";
import { TU_VUNG } from "./tu-vung.ts";

export { TU_VUNG } from "./tu-vung.ts";

/** Output language: Vietnamese, English or Simplified Chinese. */
export type Lang = "vi" | "en" | "zh";

/** A Gregorian date: a `Date` (read in local time), "YYYY-MM-DD", or `{ year, month, day }`. */
export type DateInput = Date | string | { year: number; month: number; day: number };

/** A plain calendar date. */
export interface YMD {
  year: number;
  month: number;
  day: number;
}

/** Calendar options shared by the lunar functions. */
export interface CalendarOptions {
  /**
   * ISO 3166-1 country whose lunar calendar to use: "VN" (default, UTC+7),
   * "CN", "TW", "HK", "MO", "SG", "MY", "ID", "PH" (UTC+8), "KR", "JP" (UTC+9).
   * Same rules everywhere; only the local time used to decide the day differs.
   */
  country?: string;
  /** Override the time zone in hours (wins over `country`). */
  timeZone?: number;
  /** Language of names in the result. Default "en". */
  lang?: Lang;
  /** With lang "en": how to write stems and branches ("pinyin" default, "han", "vi"). See `Terms`. */
  terms?: Terms;
}

/**
 * How names WITHOUT an established English translation are written when
 * `lang` is "en": the ten stems, twelve branches, their sexagenary pairs and
 * the Four Transformations.
 *
 * - "pinyin" (default): Jia, Zi, "Geng Wu", "Hua Lu". Pinyin without tone
 *   marks, as English BaZi and Zi Wei books write them (note that 戊 and 午
 *   are both "Wu", 己 and 忌 both "Ji").
 * - "han": Chinese characters 庚, 午, "庚午", "化禄".
 * - "vi": Sino-Vietnamese, as printed in Vietnamese almanacs: Canh, Ngọ,
 *   "Canh Ngọ", "Hóa Lộc" (the behaviour of version 0.2.0).
 *
 * Names that have an English translation (elements, zodiac animals, solar
 * terms, palaces, stars) are English whatever `terms` says. `lang` "vi" is
 * always Vietnamese and "zh" always Chinese characters; `terms` is ignored.
 */
export type Terms = "vi" | "pinyin" | "han";

/** Check a `terms` option; the result is "vi" for lang "vi", "han" for "zh", default "pinyin" for "en". */
export function checkTerms(terms: unknown, lang: Lang): Terms {
  if (terms !== undefined && terms !== null && terms !== "vi" && terms !== "pinyin" && terms !== "han") {
    throw new TypeError(`terms must be "pinyin", "han" or "vi", got ${JSON.stringify(terms)}`);
  }
  if (lang === "vi") return "vi";
  if (lang === "zh") return "han";
  return (terms as Terms | undefined) ?? "pinyin";
}

/** Check and normalise a `lang` option (default "en"). */
export function checkLang(lang: unknown): Lang {
  if (lang === undefined || lang === null) return "en";
  if (lang === "vi" || lang === "en" || lang === "zh") return lang;
  throw new TypeError(`lang must be "vi", "en" or "zh", got ${JSON.stringify(lang)}`);
}

function soNguyen(x: unknown): x is number {
  return typeof x === "number" && Number.isInteger(x);
}

/** Days in a Gregorian month (Julian before 15/10/1582, as the core does). */
function ngayHopLe(y: number, m: number, d: number): boolean {
  if (m < 1 || m > 12 || d < 1 || d > 31) return false;
  const sd = jdToDate(jdFromDate(d, m, y));
  return sd.day === d && sd.month === m && sd.year === y;
}

/**
 * Parse a date input into `{ year, month, day }`. A `Date` object is read in
 * the runtime's LOCAL time zone (its calendar date as shown to the user);
 * prefer the "YYYY-MM-DD" string to avoid surprises. Throws on invalid dates.
 */
export function parseDate(input: DateInput): YMD {
  let y: number;
  let m: number;
  let d: number;
  if (input instanceof Date) {
    if (Number.isNaN(input.getTime())) throw new RangeError("Invalid Date");
    y = input.getFullYear();
    m = input.getMonth() + 1;
    d = input.getDate();
  } else if (typeof input === "string") {
    const k = /^\s*(-?\d{1,4})-(\d{1,2})-(\d{1,2})\s*$/.exec(input);
    if (!k) throw new RangeError(`date must look like "YYYY-MM-DD", got ${JSON.stringify(input)}`);
    y = Number(k[1]);
    m = Number(k[2]);
    d = Number(k[3]);
  } else if (input && typeof input === "object") {
    y = input.year;
    m = input.month;
    d = input.day;
    if (!soNguyen(y) || !soNguyen(m) || !soNguyen(d)) {
      throw new TypeError("date object needs integer year, month and day");
    }
  } else {
    throw new TypeError("date must be a Date, a \"YYYY-MM-DD\" string or { year, month, day }");
  }
  if (!ngayHopLe(y, m, d)) throw new RangeError(`no such date: ${y}-${m}-${d}`);
  return { year: y, month: m, day: d };
}

/** Format `{ year, month, day }` as "YYYY-MM-DD". */
export function formatDate(d: YMD): string {
  const p = (n: number, w: number) => String(n).padStart(w, "0");
  return `${p(d.year, 4)}-${p(d.month, 2)}-${p(d.day, 2)}`;
}

/** A clock time. */
export interface ClockTime {
  hour: number;
  minute: number;
}

/**
 * Parse a clock time: "20:00", "8:05", "20" or the number 20. `null` and
 * `undefined` mean "unknown" and return null. Throws on anything else.
 */
export function parseTime(input: string | number | null | undefined): ClockTime | null {
  if (input === null || input === undefined || input === "") return null;
  let h: number;
  let mi = 0;
  if (typeof input === "number") {
    h = input;
  } else if (typeof input === "string") {
    const k = /^\s*(\d{1,2})(?::(\d{2}))?(?::\d{2})?\s*$/.exec(input);
    if (!k) throw new RangeError(`time must look like "HH:MM", got ${JSON.stringify(input)}`);
    h = Number(k[1]);
    mi = k[2] === undefined ? 0 : Number(k[2]);
  } else {
    throw new TypeError("time must be \"HH:MM\", an hour number, or null");
  }
  if (!soNguyen(h) || h < 0 || h > 23 || mi < 0 || mi > 59) {
    throw new RangeError(`time out of range: ${JSON.stringify(input)}`);
  }
  return { hour: h, minute: mi };
}

/** Format a clock time as "HH:MM". */
export function formatTime(t: ClockTime): string {
  return String(t.hour).padStart(2, "0") + ":" + String(t.minute).padStart(2, "0");
}

/** Resolve `country` / `timeZone` options to a country code and an hour offset. */
export function resolveCountry(opts: { country?: string; timeZone?: number } = {}): { country: string; timeZone: number } {
  const country = (opts.country ?? "VN").toUpperCase();
  if (opts.timeZone !== undefined) {
    if (typeof opts.timeZone !== "number" || !Number.isFinite(opts.timeZone)) throw new TypeError("timeZone must be a number of hours");
    return { country, timeZone: opts.timeZone };
  }
  const tz = MUI_GIO_THEO_NUOC[country];
  if (tz === undefined) {
    throw new RangeError(
      `unsupported country ${JSON.stringify(opts.country)}; use one of ${Object.keys(MUI_GIO_THEO_NUOC).join(", ")} or pass timeZone`,
    );
  }
  return { country, timeZone: tz };
}

/**
 * Translate one Vietnamese domain term (stem, branch, element, palace, star,
 * na yin...) using the core's three-language vocabulary. Unknown terms come
 * back as `fallback` (default: the Vietnamese term itself). Stems, branches
 * and the Four Transformations come back in Sino-Vietnamese for "en"; use
 * `termName` to follow a `terms` option.
 */
export function term(vi: string, lang: Lang, fallback?: string): string {
  if (lang === "vi") return vi;
  const t = TU_VUNG[vi];
  if (t) return lang === "en" ? t[0] : t[1];
  return fallback ?? vi;
}

/**
 * Read the `lang` version of field `key` from a core result object: `key`
 * for "vi", `key + "En"` / `key + "Zh"` otherwise. When the core object has
 * no such field (older core, or a field never translated), `fallback()`
 * supplies the value.
 */
export function pickLang(obj: object, key: string, lang: Lang, fallback: () => string): string {
  const r = obj as Record<string, unknown>;
  if (lang === "vi" && typeof r[key] === "string") return r[key] as string;
  const v = r[key + (lang === "en" ? "En" : "Zh")];
  return typeof v === "string" && v !== "" ? v : fallback();
}

/** Pinyin (no tone marks) of the ten stems, Giáp ... Quý. */
export const STEM_PINYIN: readonly string[] = ["Jia", "Yi", "Bing", "Ding", "Wu", "Ji", "Geng", "Xin", "Ren", "Gui"];
/** Pinyin (no tone marks) of the twelve branches, Tý ... Hợi. */
export const BRANCH_PINYIN: readonly string[] = ["Zi", "Chou", "Yin", "Mao", "Chen", "Si", "Wu", "Wei", "Shen", "You", "Xu", "Hai"];

/** Tứ Hóa: tên Việt, pinyin, chữ Hán (giản thể); chữ ngắn ở cột 3, 4, 5. */
const TU_HOA_TEN: Readonly<Record<string, readonly [string, string, string, string, string]>> = {
  "Hóa Lộc": ["Hua Lu", "化禄", "Lộc", "Lu", "禄"],
  "Hóa Quyền": ["Hua Quan", "化权", "Quyền", "Quan", "权"],
  "Hóa Khoa": ["Hua Ke", "化科", "Khoa", "Ke", "科"],
  "Hóa Kỵ": ["Hua Ji", "化忌", "Kỵ", "Ji", "忌"],
};

/**
 * One stem, branch or Four-Transformation name ("Canh", "Ngọ", "Hóa Kỵ") in
 * `lang` and `terms`; any other term goes through `term`.
 */
export function termName(vi: string, lang: Lang, terms?: Terms): string {
  const t = checkTerms(terms, lang);
  let i = THIEN_CAN.indexOf(vi);
  if (i >= 0) return t === "vi" ? vi : t === "pinyin" ? STEM_PINYIN[i] : term(vi, "zh");
  i = DIA_CHI.indexOf(vi);
  if (i >= 0) return t === "vi" ? vi : t === "pinyin" ? BRANCH_PINYIN[i] : term(vi, "zh");
  const h = TU_HOA_TEN[vi];
  if (h) return t === "vi" ? vi : t === "pinyin" ? h[0] : h[1];
  return term(vi, lang);
}

/** Short form of a Four-Transformation name: Lộc / Lu / 禄 (by `lang` and `terms`). */
export function transformationShort(vi: string, lang: Lang, terms?: Terms): string {
  const h = TU_HOA_TEN[vi];
  if (!h) return vi;
  const t = checkTerms(terms, lang);
  return t === "vi" ? h[2] : t === "pinyin" ? h[3] : h[4];
}

/**
 * Translate a stem-branch label such as "Bính Ngọ": "Bing Wu" (en, pinyin),
 * "丙午" (zh, or en with terms "han"), "Bính Ngọ" (vi, or en with terms "vi").
 * Anything that is not exactly a stem followed by a branch goes through `term`.
 */
export function stemBranchName(label: string, lang: Lang, terms?: Terms): string {
  const t = checkTerms(terms, lang);
  const p = label.split(" ");
  if (p.length === 2 && THIEN_CAN.includes(p[0]) && DIA_CHI.includes(p[1])) {
    if (t === "vi") return label;
    if (t === "pinyin") return STEM_PINYIN[THIEN_CAN.indexOf(p[0])] + " " + BRANCH_PINYIN[DIA_CHI.indexOf(p[1])];
    return term(p[0], "zh") + term(p[1], "zh");
  }
  return lang === "en" ? label : term(label, lang);
}

// Bảng thay chữ trong câu tiếng Anh, đệm theo cách viết.
const DEM_THAY = new Map<string, { re: RegExp; bang: Map<string, string> }>();

/**
 * Rewrite the Vietnamese domain words left inside an English sentence (stem
 * and branch names, sexagenary pairs, Four Transformations, solar terms) in
 * `terms`, plus any `extra` phrases (exact Vietnamese phrase to replacement;
 * longest match wins, whole words only). Used by the packages for the
 * explanations and notes that the core writes in English.
 */
export function convertTerms(text: string, terms: Terms, extra: Readonly<Record<string, string>> = {}, extraKey = ""): string {
  const khoa = terms + "|" + extraKey;
  let b = DEM_THAY.get(khoa);
  if (!b) {
    const bang = new Map<string, string>();
    for (const t of TIET_KHI_TABLE) bang.set(t.ten, t.tenEn);
    for (const [vi, h] of Object.entries(TU_HOA_TEN)) bang.set(vi, terms === "vi" ? vi : terms === "pinyin" ? h[0] : h[1]);
    THIEN_CAN.forEach((c, i) => {
      bang.set(c, terms === "vi" ? c : terms === "pinyin" ? STEM_PINYIN[i] : term(c, "zh"));
      DIA_CHI.forEach((z, j) => {
        if (i % 2 === j % 2) bang.set(c + " " + z, stemBranchName(c + " " + z, "en", terms));
      });
    });
    DIA_CHI.forEach((z, j) => bang.set(z, terms === "vi" ? z : terms === "pinyin" ? BRANCH_PINYIN[j] : term(z, "zh")));
    for (const [k, v] of Object.entries(extra)) bang.set(k, v);
    const khoaXep = [...bang.keys()].sort((a, c) => c.length - a.length || (a < c ? -1 : a > c ? 1 : 0));
    const thoat = (x: string) => x.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const re = new RegExp("(?<![\\p{L}\\p{N}])(?:" + khoaXep.map(thoat).join("|") + ")(?![\\p{L}\\p{N}])", "gu");
    b = { re, bang };
    if (DEM_THAY.size > 32) DEM_THAY.clear();
    DEM_THAY.set(khoa, b);
  }
  const bb = b;
  return text.normalize("NFC").replace(bb.re, (m) => bb.bang.get(m) ?? m);
}

/** Name of an element (Kim, Mộc, Thủy, Hỏa, Thổ) in `lang`. */
export function elementName(vi: string, lang: Lang): string {
  if (lang === "vi" || !vi) return vi;
  return (lang === "en" ? HANH_EN[vi] : HANH_ZH[vi]) ?? term(vi, lang);
}

/**
 * Zodiac animal of a branch index (0 = Tý). Vietnam's fourth animal is the
 * Cat (Mèo); for every other country it is the Rabbit.
 */
export function zodiacName(branchIndex: number, lang: Lang, country = "VN"): string {
  const i = mod(branchIndex, 12);
  if (i === 3 && country !== "VN") return lang === "vi" ? "Thỏ" : lang === "en" ? "Rabbit" : "兔";
  return term(CON_GIAP[i], lang);
}

/** The double-hour (canh giờ) of a clock time. */
export interface HourBranch {
  /** 0 = Tý (23:00 to 00:59), 1 = Sửu (01:00 to 02:59) ... 11 = Hợi (21:00 to 22:59). */
  index: number;
  /** Branch name in `lang`. */
  name: string;
  /** Zodiac animal of the branch in `lang` (the Tuất hour is the Dog hour). */
  animal: string;
  /** The two clock hours the branch covers, e.g. "19:00-20:59". */
  range: string;
}

/**
 * Map a clock time to its earthly-branch double hour. Convention: the Tý
 * hour runs from 23:00 to 00:59, so 23:30 is Tý. Uses the package's own
 * `chiGioTuGioDongHo`.
 */
export function hourBranch(time: string | number, lang: Lang = "en", terms?: Terms): HourBranch {
  const t = parseTime(time);
  if (!t) throw new TypeError("hourBranch needs a time");
  const index = chiGioTuGioDongHo(t.hour);
  const dau = mod(index * 2 - 1, 24);
  const p = (n: number) => String(n).padStart(2, "0");
  const l = checkLang(lang);
  return { index, name: termName(DIA_CHI[index], l, terms), animal: zodiacName(index, l), range: `${p(dau)}:00-${p(mod(dau + 1, 24))}:59` };
}

/** A stem-branch pillar with its elements, in `lang`. */
export interface Pillar {
  /** e.g. "Geng Wu" (en), "Canh Ngọ" (vi) or "庚午" (zh). */
  label: string;
  stem: string;
  branch: string;
  stemIndex: number;
  branchIndex: number;
  stemElement: string;
  branchElement: string;
  /** Na yin (nạp âm) name, e.g. "Lộ Bàng Thổ" / "Earth by the Roadside" / "路旁土". */
  naYin: string;
  naYinElement: string;
}

/** Build a pillar from stem and branch indexes (0 = Giáp, 0 = Tý). */
export function pillarFromIndex(stemIndex: number, branchIndex: number, lang: Lang = "en", terms?: Terms): Pillar {
  const l = checkLang(lang);
  const s = mod(stemIndex, 10);
  const b = mod(branchIndex, 12);
  const na = nguHanhNapAm(s, b);
  return {
    label: stemBranchName(THIEN_CAN[s] + " " + DIA_CHI[b], l, terms),
    stem: termName(THIEN_CAN[s], l, terms),
    branch: termName(DIA_CHI[b], l, terms),
    stemIndex: s,
    branchIndex: b,
    stemElement: elementName(CAN_NGU_HANH[s], l),
    branchElement: elementName(CHI_NGU_HANH[b], l),
    naYin: term(na.ten, l),
    naYinElement: elementName(na.hanh, l),
  };
}

/** The day pillar (can chi of the day) of a Gregorian date. Independent of time zone. */
export function dayPillar(date: DateInput, opts: { lang?: Lang; terms?: Terms } = {}): Pillar {
  const d = parseDate(date);
  const cc = dayCanChi(d.day, d.month, d.year);
  return pillarFromIndex(THIEN_CAN.indexOf(cc.can), DIA_CHI.indexOf(cc.chi), checkLang(opts.lang), opts.terms);
}

/** The pillar of a LUNAR year (2026 is Bính Ngọ). */
export function yearPillar(lunarYear: number, opts: { lang?: Lang; terms?: Terms } = {}): Pillar {
  const cc = yearCanChi(lunarYear);
  return pillarFromIndex(THIEN_CAN.indexOf(cc.can), DIA_CHI.indexOf(cc.chi), checkLang(opts.lang), opts.terms);
}

/** Result of `toLunar`. */
export interface LunarResult {
  /** Lunar year, month (1-12), day (1-30). */
  year: number;
  month: number;
  day: number;
  /** True when the month is the intercalary (leap) month. */
  leap: boolean;
  /** The Gregorian date that was converted, "YYYY-MM-DD". */
  solarDate: string;
  country: string;
  timeZone: number;
  /** Stem-branch of the lunar year, month and day, in `lang` and `terms` ("Ding Wei" by default in English). */
  yearName: string;
  monthName: string;
  dayName: string;
  /** Zodiac animal of the lunar year (Cat in Vietnam, Rabbit elsewhere). */
  zodiac: string;
  /** Solar term in effect on that day (by local date), in `lang`. */
  solarTerm: string;
  lang: Lang;
}

/**
 * Convert a Gregorian date to the lunar calendar of a country (default
 * Vietnam, UTC+7). Wraps `solarToLunar`.
 *
 * @example toLunar("2027-02-06") // { year: 2027, month: 1, day: 1, ... }: Tết 2027 in Vietnam
 */
export function toLunar(date: DateInput, opts: CalendarOptions = {}): LunarResult {
  const lang = checkLang(opts.lang);
  const terms = checkTerms(opts.terms, lang);
  const d = parseDate(date);
  const { country, timeZone } = resolveCountry(opts);
  const l = solarToLunar(d.day, d.month, d.year, timeZone);
  return {
    year: l.year,
    month: l.month,
    day: l.day,
    leap: l.leap,
    solarDate: formatDate(d),
    country,
    timeZone,
    yearName: stemBranchName(yearCanChi(l.year).label, lang, terms),
    monthName: stemBranchName(lunarMonthCanChi(l.month, l.year).label, lang, terms),
    dayName: stemBranchName(dayCanChi(d.day, d.month, d.year).label, lang, terms),
    zodiac: zodiacName(mod(l.year - 4, 12), lang, country),
    solarTerm: solarTermOn(d, { country, timeZone, lang }).current.name,
    lang,
  };
}

/** A lunar date to convert back. */
export interface LunarInput {
  year: number;
  month: number;
  day: number;
  /** The intercalary month of that number. Default false. */
  leap?: boolean;
}

/** Result of `toSolar`. */
export interface SolarResult extends YMD {
  /** "YYYY-MM-DD". */
  date: string;
}

/**
 * Convert a lunar date back to Gregorian. Throws RangeError when the lunar
 * date does not exist (no such leap month that year, or day 30 of a 29-day
 * month). Wraps `lunarToSolar`.
 */
export function toSolar(lunar: LunarInput, opts: { country?: string; timeZone?: number } = {}): SolarResult {
  if (!lunar || !soNguyen(lunar.year) || !soNguyen(lunar.month) || !soNguyen(lunar.day)) {
    throw new TypeError("lunar date needs integer year, month and day");
  }
  const leap = lunar.leap === true;
  const { timeZone } = resolveCountry(opts);
  const ten = `${lunar.year}-${lunar.month}${leap ? " (leap)" : ""}-${lunar.day}`;
  if (lunar.month < 1 || lunar.month > 12 || lunar.day < 1 || lunar.day > 30) throw new RangeError(`no such lunar date: ${ten}`);
  const r = lunarToSolar(lunar.day, lunar.month, lunar.year, leap, timeZone);
  if (!r.hopLe) throw new RangeError(`no such lunar date: ${ten} (that year has no such leap month)`);
  // Ngày 30 của tháng thiếu: hàm gốc trả mùng 1 tháng sau; ở đây báo lỗi.
  const kiem = solarToLunar(r.duong.day, r.duong.month, r.duong.year, timeZone);
  if (kiem.day !== lunar.day || kiem.month !== lunar.month || kiem.year !== lunar.year || kiem.leap !== leap) {
    throw new RangeError(`no such lunar date: ${ten} (the month has only 29 days)`);
  }
  return { ...r.duong, date: formatDate(r.duong) };
}

/** One of the 24 solar terms with its exact moment. */
export interface SolarTerm {
  /** 0-23 by solar longitude: 0 = Vernal Equinox (Xuân Phân), 21 = Start of Spring (Lập Xuân). */
  index: number;
  /** Solar longitude in degrees (index × 15). */
  longitude: number;
  /** Name in `lang`. */
  name: string;
  /** Vietnamese name, always present. */
  nameVi: string;
  /** "jie" for the 12 sectional terms that start a BaZi month, "qi" for the 12 midpoint terms. */
  kind: "jie" | "qi";
  /** Local date and time (minute precision) in the chosen country. */
  date: string;
  time: string;
  timeZone: number;
}

function tenTiet(ten: string, tenEn: string, lang: Lang): string {
  if (lang === "vi") return ten;
  if (lang === "en") return tenEn;
  return term(ten, "zh", tenEn);
}

// Đệm 24 mốc của từng năm (phép dò chia đôi tốn vài mili giây mỗi năm); chỉ đọc.
const DEM_MOC = new Map<number, ReturnType<typeof mocTietKhiTrongNam>>();
function mocNam(year: number): ReturnType<typeof mocTietKhiTrongNam> {
  let ds = DEM_MOC.get(year);
  if (!ds) {
    if (DEM_MOC.size >= 512) DEM_MOC.clear();
    ds = mocTietKhiTrongNam(year);
    DEM_MOC.set(year, ds);
  }
  return ds;
}

/**
 * The 24 solar-term moments that fall in a Gregorian year, in time order,
 * local time of the chosen country. Wraps `mocTietKhiTrongNam` (computed at
 * UTC+7, then shifted by whole hours).
 */
export function solarTerms(year: number, opts: CalendarOptions = {}): SolarTerm[] {
  if (!soNguyen(year)) throw new TypeError("year must be an integer");
  const lang = checkLang(opts.lang);
  const { timeZone } = resolveCountry(opts);
  const lech = Math.round((timeZone - TIME_ZONE_VN) * 60);
  return mocNam(year).map((m) => {
    let phut = m.gio * 60 + m.phut + lech;
    let jd = jdFromDate(m.ngay.day, m.ngay.month, m.ngay.year);
    jd += Math.floor(phut / 1440);
    phut = mod(phut, 1440);
    return {
      index: m.index,
      longitude: m.kinhDo,
      name: tenTiet(m.ten, m.tenEn, lang),
      nameVi: m.ten,
      kind: m.laTiet ? "jie" : "qi",
      date: formatDate(jdToDate(jd)),
      time: formatTime({ hour: Math.floor(phut / 60), minute: phut % 60 }),
      timeZone,
    };
  });
}

/**
 * The solar term in effect on a date (the latest term whose local DATE is
 * not after it) and the next one.
 */
export function solarTermOn(date: DateInput, opts: CalendarOptions = {}): { current: SolarTerm; next: SolarTerm } {
  const d = formatDate(parseDate(date));
  const y = Number(d.slice(0, 4));
  const ds = [...solarTerms(y - 1, opts), ...solarTerms(y, opts), ...solarTerms(y + 1, opts)];
  let i = -1;
  ds.forEach((t, k) => {
    if (t.date <= d) i = k;
  });
  return { current: ds[i], next: ds[i + 1] };
}

/** All 24 solar terms (no dates), from Start of Spring, with meanings in `lang`. */
export function solarTermNames(opts: { lang?: Lang } = {}): { index: number; longitude: number; name: string; nameVi: string; meaning: string }[] {
  const lang = checkLang(opts.lang);
  const out = [];
  for (let k = 0; k < 24; k++) {
    const t = TIET_KHI_TABLE[(21 + k) % 24];
    out.push({
      index: t.index,
      longitude: t.kinhDo,
      name: tenTiet(t.ten, t.tenEn, lang),
      nameVi: t.ten,
      meaning: lang === "vi" ? t.yNghia : lang === "en" ? t.yNghiaEn : t.yNghiaZh,
    });
  }
  return out;
}
