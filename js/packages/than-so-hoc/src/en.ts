// Lớp API tiếng Anh của @nhatnguyet/than-so-hoc: tham số đặt tên, ngày dạng
// "YYYY-MM-DD", nhãn theo `lang`. Phép tính gọi lại đúng tinhHoSoThanSoHocSau;
// đối tượng gốc giữ ở trường `raw`. Gói này không phụ thuộc gói nào nên tự
// đọc ngày ở đây.
//
// English API layer for Pythagorean numerology. The untouched original object
// stays in `raw`.

import { tinhHoSoThanSoHocSau } from "./index.ts";
import type { HoSoThanSoHocSau, LuoiPythago } from "./index.ts";
import { veThanSoHocSvg } from "./ve-svg.ts";

/** Output language of labels. */
export type NumerologyLang = "vi" | "en" | "zh";

/** A Gregorian date: a `Date` (read in local time), "YYYY-MM-DD", or `{ year, month, day }`. */
export type NumerologyDate = Date | string | { year: number; month: number; day: number };

function docNgay(input: NumerologyDate, ten: string): { year: number; month: number; day: number } {
  let y: number;
  let m: number;
  let d: number;
  if (input instanceof Date) {
    if (Number.isNaN(input.getTime())) throw new RangeError(`${ten}: Invalid Date`);
    y = input.getFullYear();
    m = input.getMonth() + 1;
    d = input.getDate();
  } else if (typeof input === "string") {
    const k = /^\s*(\d{1,4})-(\d{1,2})-(\d{1,2})\s*$/.exec(input);
    if (!k) throw new RangeError(`${ten} must look like "YYYY-MM-DD", got ${JSON.stringify(input)}`);
    y = Number(k[1]);
    m = Number(k[2]);
    d = Number(k[3]);
  } else if (input && typeof input === "object") {
    ({ year: y, month: m, day: d } = input);
  } else {
    throw new TypeError(`${ten} must be a Date, a "YYYY-MM-DD" string or { year, month, day }`);
  }
  const t = new Date(Date.UTC(2000, m - 1, d));
  t.setUTCFullYear(y);
  if (![y, m, d].every(Number.isInteger) || t.getUTCFullYear() !== y || t.getUTCMonth() !== m - 1 || t.getUTCDate() !== d) {
    throw new RangeError(`${ten}: no such date ${y}-${m}-${d}`);
  }
  return { year: y, month: m, day: d };
}

const p2 = (n: number) => String(n).padStart(2, "0");
const iso = (x: { year: number; month: number; day: number }) => `${String(x.year).padStart(4, "0")}-${p2(x.month)}-${p2(x.day)}`;

/** Labels of every number, in three languages. */
export const NUMEROLOGY_LABELS: Readonly<Record<NumerologyLang, Readonly<Record<string, string>>>> = {
  vi: {
    lifePath: "Số chủ đạo", expression: "Số sứ mệnh", soulUrge: "Số linh hồn", personality: "Số nhân cách",
    attitude: "Số thái độ", birthday: "Số ngày sinh", maturity: "Số trưởng thành",
    personalYear: "Năm cá nhân", personalMonth: "Tháng cá nhân", personalDay: "Ngày cá nhân",
    pinnacles: "Đỉnh cao", challenges: "Thách thức", karmicDebt: "Nợ nghiệp", grid: "Biểu đồ ngày sinh",
  },
  en: {
    lifePath: "Life Path", expression: "Expression (Destiny)", soulUrge: "Soul Urge", personality: "Personality",
    attitude: "Attitude", birthday: "Birthday", maturity: "Maturity",
    personalYear: "Personal Year", personalMonth: "Personal Month", personalDay: "Personal Day",
    pinnacles: "Pinnacles", challenges: "Challenges", karmicDebt: "Karmic Debt", grid: "Birth chart grid",
  },
  zh: {
    lifePath: "生命灵数", expression: "使命数", soulUrge: "灵魂数", personality: "人格数",
    attitude: "态度数", birthday: "生日数", maturity: "成熟数",
    personalYear: "个人年数", personalMonth: "个人月数", personalDay: "个人日数",
    pinnacles: "巅峰数", challenges: "挑战数", karmicDebt: "业力债数", grid: "出生日期九宫格",
  },
};

/** Input of `numerology`. */
export interface NumerologyInput {
  /** Full name. Vietnamese (and other Latin) diacritics are folded; only A-Z letters count. */
  name: string;
  birthDate: NumerologyDate;
  /** Date for the personal year, month and day numbers. Default: today (local). */
  today?: NumerologyDate;
  lang?: NumerologyLang;
}

/** Result of `numerology`. Master numbers 11, 22, 33 are kept. */
export interface NumerologyResult {
  lang: NumerologyLang;
  name: string;
  birthDate: string;
  today: string;
  lifePath: number;
  expression: number;
  soulUrge: number;
  personality: number;
  attitude: number;
  birthday: number;
  maturity: number;
  personalYear: number;
  personalMonth: number;
  personalDay: number;
  /** How many times each digit 1-9 appears in the birth date. */
  grid: LuoiPythago;
  /** Four pinnacles; the first three end at `toAge`, the last runs for life (null). */
  pinnacles: { number: number; toAge: number | null }[];
  challenges: number[];
  /** 13, 14, 16 or 19 when born on that day; otherwise null. */
  karmicDebt: number | null;
  /** Labels of the fields above in `lang`. */
  labels: Readonly<Record<string, string>>;
  /** The original Vietnamese-keyed object from `tinhHoSoThanSoHocSau`. */
  raw: HoSoThanSoHocSau;
  /** Draw this profile as a self-contained SVG in its `lang` (non-enumerable, not in JSON). */
  toSvg(opts?: NumerologySvgOptions): string;
}

/** Options for the numerology SVG drawing. */
export interface NumerologySvgOptions {
  theme?: "light" | "dark";
  /** Displayed width in px (default 720). */
  width?: number;
  /** Default: the language of the result. */
  lang?: NumerologyLang;
}

/**
 * Draw a numerology profile (from `numerology`) as a self-contained SVG
 * string; the personal year is the year of `today`. Wraps `veThanSoHocSvg`
 * (`renderNumerologySvg`).
 */
export function numerologySvg(r: NumerologyResult | Omit<NumerologyResult, "toSvg">, opts: NumerologySvgOptions = {}): string {
  const [y, m, d] = r.birthDate.split("-").map(Number);
  return veThanSoHocSvg(
    { hoTen: r.name, dd: d, mm: m, yyyy: y, namXem: Number(r.today.slice(0, 4)) },
    { lang: opts.lang ?? r.lang, theme: opts.theme, width: opts.width },
  );
}

/**
 * Pythagorean numerology profile.
 *
 * @example numerology({ name: "Nguyen Van An", birthDate: "1990-09-19", today: "2026-11-19" })
 */
export function numerology(input: NumerologyInput): NumerologyResult {
  if (!input || typeof input !== "object") throw new TypeError("numerology needs an options object");
  if (typeof input.name !== "string" || input.name.trim() === "") throw new TypeError("name must be a non-empty string");
  const lang = input.lang ?? "en";
  if (lang !== "vi" && lang !== "en" && lang !== "zh") throw new TypeError(`lang must be "vi", "en" or "zh", got ${JSON.stringify(lang)}`);
  const b = docNgay(input.birthDate, "birthDate");
  const t = docNgay(input.today ?? new Date(), "today");
  const r = tinhHoSoThanSoHocSau(input.name, b.day, b.month, b.year, t.year, t.month, t.day);
  const p = r.soDinhCao;
  const c = r.soThachThuc;
  const ra = {
    lang,
    name: input.name,
    birthDate: iso(b),
    today: iso(t),
    lifePath: r.soDuongDoi,
    expression: r.soSuMenh,
    soulUrge: r.soLinhHon,
    personality: r.soNhanCach,
    attitude: r.soThaiDo,
    birthday: r.soNgaySinh,
    maturity: r.soTruongThanh,
    personalYear: r.soNamCaNhan,
    personalMonth: r.soThangCaNhan,
    personalDay: r.soNgayCaNhan,
    grid: { ...r.luoiPythago },
    pinnacles: [
      { number: p.dinh1, toAge: p.tuoiKetThucDinh1 },
      { number: p.dinh2, toAge: p.tuoiKetThucDinh2 },
      { number: p.dinh3, toAge: p.tuoiKetThucDinh3 },
      { number: p.dinh4, toAge: null },
    ],
    challenges: [c.thachThuc1, c.thachThuc2, c.thachThuc3, c.thachThuc4],
    karmicDebt: r.soNoNghiepNgaySinh ?? null,
    labels: NUMEROLOGY_LABELS[lang],
    raw: r,
  } as Omit<NumerologyResult, "toSvg">;
  Object.defineProperty(ra, "toSvg", {
    value: (opts?: NumerologySvgOptions) => numerologySvg(ra, opts),
    enumerable: false,
    writable: true,
    configurable: true,
  });
  return ra as NumerologyResult;
}
