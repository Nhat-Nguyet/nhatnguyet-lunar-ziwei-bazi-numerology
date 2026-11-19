// Hàm tra cứu trên lá số của API tiếng Anh: lấy cung theo tên, sao, tam
// phương tứ chính, hai cung giáp, đường bay Tứ Hóa (phi tinh), và vận hạn ở
// một ngày (horoscope). Mọi giá trị lấy từ lõi: đại vận (`daiVan`), hạn năm,
// tiểu vận, lưu Tứ Hóa và nguyệt hạn (`tinhHanNam`), sao lưu (`tinhSaoLuu`),
// bảng Tứ Hóa của lõi áp cho can cung (như phép phi tinh LapMachNoiCung của bản
// Go). Lõi không có thì để null hay mảng rỗng: tứ hóa của tháng, lưu nhật, lưu
// thời, đồng hạn (trước đại vận đầu: decade là null).
//
// `castZiWei` ở đây bọc `castZiWei` của en.ts và gắn các hàm ấy lên lá số
// (không liệt kê, JSON không đổi). Bản Python: nhatnguyet/tu_vi_chuc_nang.py,
// JSON ra trùng từng byte (test chuc-nang.test.ts).
//
// Functional helpers of the English API: palace and star lookup, the three
// harmonies and opposite palace (三方四正), flanking palaces, flying Four
// Transformations, and the horoscope (decade, minor limit, year, month) of a
// date. Values come from the engine; what it does not compute is null or empty.

import { DIA_CHI, THIEN_CAN, canThangDan, checkLang, checkTerms, formatDate, mod, parseDate, solarToLunar, stemBranchName, term, termName } from "@nhatnguyet/am-lich";
import type { DateInput, Lang, Terms } from "@nhatnguyet/am-lich";
import { tuHoaTheoPhai } from "./schools.ts";
import { daiVan } from "./chieu-sau.ts";
import { tinhHanNam } from "./luu-nien.ts";
import { viTriSao } from "./tra-cuu.ts";
import { castZiWei as castZiWeiData, localizeZiWei, yearlyLuck, yearlyStars } from "./en.ts";
import type { YearlyStar, ZiWeiChart, ZiWeiInput, ZiWeiPalace, ZiWeiStar } from "./en.ts";
import type { LaSoTuVi } from "./kieu.ts";

type ChartLike = ZiWeiChart | Omit<ZiWeiChart, "toSvg"> | LaSoTuVi;

/** A palace given by index (0 = Tý ... 11 = Hợi) or by name in Vietnamese, English or Chinese (case-insensitive). */
export type PalaceRef = number | string;

/** One of the Four Transformations: "Hua Lu" / "Lu" / "lu", "Hóa Lộc" / "Lộc", "化禄" / "禄"... */
export type TransformationName = string;

/** Options shared by the helpers. */
export interface LookupOptions {
  lang?: Lang;
  terms?: Terms;
}

/** Where a transformed star sits. */
export interface ZiWeiTransformation {
  /** "Hua Lu", "Hua Quan", "Hua Ke", "Hua Ji" (en, pinyin), 化禄... (zh), Hóa Lộc... (vi). */
  type: string;
  star: string;
  /** Palace holding the star, or null when the star is not on the chart. */
  palaceIndex: number | null;
  palace: string | null;
}

/** A flying transformation of one palace (phi tinh): the palace stem transforms a star, wherever it sits. */
export interface FlyingTransformation extends ZiWeiTransformation {
  /** The star sits in the source palace itself (self-transformation, 自化). */
  self: boolean;
}

/** One scope of a horoscope. */
export interface HoroscopeScope {
  palaceIndex: number;
  branch: string;
  /** Natal name of the palace the scope falls on. */
  palace: string;
  /** Decade and minor limit: the palace's stem-branch. Year and month: the year and month pillars. */
  stemBranch: string;
  /** The twelve palace names (index 0 = Tý) when this scope's palace is taken as the Life palace. */
  palaceNames: string[];
  /** Decade and minor limit: the transformations of the palace stem; year: of the year stem; month: [] (not computed by the engine). */
  transformations: ZiWeiTransformation[];
}

/** Horoscope of one date. `day` and `hour` are null: the engine has no daily or hourly limits. */
export interface ZiWeiHoroscope {
  /** Gregorian date, "YYYY-MM-DD". */
  date: string;
  /** Lunar date (Vietnamese calendar, UTC+7). The leap month counts as the month it repeats. */
  lunar: { year: number; month: number; day: number; leap: boolean };
  /** East Asian age (1 at birth) in that lunar year. */
  age: number;
  /** The ten-year period, or null before the first period (the engine has no childhood-limit rule) or after the twelfth. */
  decade: (HoroscopeScope & { fromAge: number; toAge: number }) | null;
  minorLimit: HoroscopeScope;
  year: HoroscopeScope & { year: number; stars: YearlyStar[] };
  month: HoroscopeScope & { month: number };
  day: null;
  hour: null;
}

/** The target palace with its opposite (+6) and its two trines (wealth +8, career +4). */
export interface SurroundingPalaces {
  target: ZiWeiPalace;
  opposite: ZiWeiPalace;
  wealth: ZiWeiPalace;
  career: ZiWeiPalace;
}

/** The two palaces next to a palace (index -1 and +1). */
export interface FlankingPalaces {
  previous: ZiWeiPalace;
  next: ZiWeiPalace;
}

/** A chart from `castZiWei` with lookup methods (non-enumerable; JSON is unchanged). */
export interface FunctionalZiWeiChart extends ZiWeiChart {
  horoscope(opts?: { date?: DateInput } & LookupOptions): ZiWeiHoroscope;
  palace(ref: PalaceRef): ZiWeiPalace | undefined;
  star(name: string): { star: ZiWeiStar; palace: ZiWeiPalace } | undefined;
  surroundingPalaces(ref: PalaceRef): SurroundingPalaces;
  flankingPalaces(ref: PalaceRef): FlankingPalaces;
  flyingTransformations(ref: PalaceRef, opts?: LookupOptions): FlyingTransformation[];
}

// ── Nội bộ ───────────────────────────────────────────────────────────────

const BON_HOA = ["Hóa Lộc", "Hóa Quyền", "Hóa Khoa", "Hóa Kỵ"];
/** Tên nhận cho từng hóa (chữ thường). */
const TEN_HOA: readonly (readonly string[])[] = [
  ["hóa lộc", "lộc", "hoa loc", "loc", "hua lu", "lu", "化禄", "禄", "化祿", "祿"],
  ["hóa quyền", "quyền", "hoa quyen", "quyen", "hua quan", "quan", "化权", "权", "化權", "權"],
  ["hóa khoa", "khoa", "hoa khoa", "hua ke", "ke", "化科", "科"],
  ["hóa kỵ", "kỵ", "hoa ky", "ky", "hua ji", "ji", "化忌", "忌"],
];

function chiSoHoa(ten: unknown): number {
  if (typeof ten !== "string") throw new TypeError("transformation must be a string such as \"Hua Lu\", \"lu\", \"禄\"");
  const k = ten.trim().toLowerCase();
  const i = TEN_HOA.findIndex((ds) => ds.includes(k));
  if (i < 0) throw new RangeError(`unknown transformation ${JSON.stringify(ten)}: use Lu, Quan, Ke or Ji (or 禄, 权, 科, 忌)`);
  return i;
}

interface Hop {
  raw: LaSoTuVi;
  lang: Lang;
  terms: Terms;
  /** Lá số đã dịch theo lang, terms. */
  la: Omit<ZiWeiChart, "toSvg">;
}

// Như boc() của en.ts (giữ cùng luật chọn lang, terms).
function boc(c: ChartLike, lang?: Lang, terms?: Terms): Hop {
  let raw: LaSoTuVi;
  let l: Lang;
  let tm: Terms;
  if (c && typeof c === "object" && "raw" in c && "palaces" in c) {
    l = checkLang(lang ?? c.lang);
    tm = checkTerms(terms ?? (l === c.lang ? c.terms : undefined), l);
    raw = c.raw;
    // Cùng ngôn ngữ, cùng lối viết: trả chính các cung của lá (cùng đối tượng).
    if (l === c.lang && tm === c.terms) return { raw, lang: l, terms: tm, la: c };
  } else if (c && typeof c === "object" && "cung" in c) {
    l = checkLang(lang);
    tm = checkTerms(terms, l);
    raw = c;
  } else {
    throw new TypeError("expected a chart from castZiWei (or lapLaSoTuVi)");
  }
  return { raw, lang: l, terms: tm, la: localizeZiWei(raw, l, { terms: tm, viewYear: 0 }) };
}

/** Tên một cung, một sao ở ba thứ tiếng (chữ thường), để nhận tên ở bất kỳ thứ tiếng nào. */
function tenBaThu(raw: LaSoTuVi): { cung: Set<string>[]; sao: Set<string>[][] } {
  const ba = (["vi", "en", "zh"] as Lang[]).map((l) => localizeZiWei(raw, l, { viewYear: 0 }));
  const cung = raw.cung.map((_, i) => new Set(ba.map((x) => x.palaces[i].name.toLowerCase())));
  const sao = raw.cung.map((c, i) => c.sao.map((_, j) => new Set(ba.map((x) => x.palaces[i].stars[j].name.toLowerCase()))));
  return { cung, sao };
}

function viTriCung(raw: LaSoTuVi, ref: PalaceRef): number {
  if (typeof ref === "number") {
    if (!Number.isInteger(ref) || ref < 0 || ref > 11) throw new RangeError("palace index must be an integer 0 (Tý) to 11 (Hợi)");
    return ref;
  }
  if (typeof ref !== "string") throw new TypeError("palace must be an index (0-11) or a name");
  const k = ref.trim().toLowerCase();
  const i = tenBaThu(raw).cung.findIndex((s) => s.has(k));
  if (i < 0) throw new RangeError(`unknown palace ${JSON.stringify(ref)}`);
  return i;
}

/** Bốn sao do can ở một cung hóa ra (bảng Tứ Hóa của lõi). */
function saoHoaCuaCung(raw: LaSoTuVi, viTri: number): string[] {
  const can = THIEN_CAN.indexOf(raw.cung[viTri].canChi.split(" ")[0]);
  const th = tuHoaTheoPhai(can, raw.schools?.transformations);
  return [th.loc, th.quyen, th.khoa, th.ky];
}

function tenSao(h: Hop, ten: string): string {
  for (const p of h.la.palaces) for (const s of p.stars) if (s.nameVi === ten) return s.name;
  return term(ten, h.lang);
}

function hoaCuaCung(h: Hop, viTri: number): FlyingTransformation[] {
  return saoHoaCuaCung(h.raw, viTri).map((sao, i) => {
    const p = viTriSao(h.raw, sao);
    return {
      type: termName(BON_HOA[i], h.lang, h.terms),
      star: tenSao(h, sao),
      palaceIndex: p >= 0 ? p : null,
      palace: p >= 0 ? h.la.palaces[p].name : null,
      self: p === viTri,
    };
  });
}

/** Tên mười hai cung khi cung `tu` làm Mệnh, theo thứ tự tên cung của lá. */
function tenXoay(h: Hop, tu: number): string[] {
  const m = h.raw.cungMenh;
  return Array.from({ length: 12 }, (_, i) => h.la.palaces[mod(m + i - tu, 12)].name);
}

function phamVi(h: Hop, viTri: number, stemBranch: string, transformations: ZiWeiTransformation[]): HoroscopeScope {
  const p = h.la.palaces[viTri];
  return { palaceIndex: viTri, branch: termName(DIA_CHI[viTri], h.lang, h.terms), palace: p.name, stemBranch, palaceNames: tenXoay(h, viTri), transformations };
}

const boSelf = (x: FlyingTransformation): ZiWeiTransformation => ({ type: x.type, star: x.star, palaceIndex: x.palaceIndex, palace: x.palace });

// ── Hàm công khai ────────────────────────────────────────────────────────

/** A palace by index (0 = Tý) or name in any of the three languages; undefined when the name is unknown. */
export function palaceOf(chart: ChartLike, ref: PalaceRef, opts: LookupOptions = {}): ZiWeiPalace | undefined {
  const h = boc(chart, opts.lang, opts.terms);
  try {
    return h.la.palaces[viTriCung(h.raw, ref)];
  } catch (e) {
    if (typeof ref === "string" && e instanceof RangeError) return undefined;
    throw e;
  }
}

/** A star by name in any of the three languages, with the palace it sits in; undefined when absent. */
export function starOf(chart: ChartLike, name: string, opts: LookupOptions = {}): { star: ZiWeiStar; palace: ZiWeiPalace } | undefined {
  const h = boc(chart, opts.lang, opts.terms);
  const k = String(name).trim().toLowerCase();
  const { sao } = tenBaThu(h.raw);
  for (let i = 0; i < 12; i++) {
    const j = sao[i].findIndex((s) => s.has(k));
    if (j >= 0) return { star: h.la.palaces[i].stars[j], palace: h.la.palaces[i] };
  }
  return undefined;
}

/** The three harmonies and the opposite palace (三方四正, tam phương tứ chính) of a palace. */
export function surroundingPalaces(chart: ChartLike, ref: PalaceRef, opts: LookupOptions = {}): SurroundingPalaces {
  const h = boc(chart, opts.lang, opts.terms);
  const i = viTriCung(h.raw, ref);
  const p = (k: number) => h.la.palaces[mod(i + k, 12)];
  return { target: p(0), opposite: p(6), wealth: p(8), career: p(4) };
}

/** The two palaces flanking a palace (giáp cung): index -1 and +1. */
export function flankingPalaces(chart: ChartLike, ref: PalaceRef, opts: LookupOptions = {}): FlankingPalaces {
  const h = boc(chart, opts.lang, opts.terms);
  const i = viTriCung(h.raw, ref);
  return { previous: h.la.palaces[mod(i - 1, 12)], next: h.la.palaces[mod(i + 1, 12)] };
}

function coSao(raw: LaSoTuVi, viTri: number, ten: string): boolean {
  const k = String(ten).trim().toLowerCase();
  return tenBaThu(raw).sao[viTri].some((s) => s.has(k));
}

/** The palace holds every star in `stars` (names in any of the three languages). */
export function palaceHas(chart: ChartLike, ref: PalaceRef, stars: string[]): boolean {
  const { raw } = boc(chart);
  const i = viTriCung(raw, ref);
  return stars.every((s) => coSao(raw, i, s));
}

/** The palace holds at least one star in `stars`. */
export function palaceHasOneOf(chart: ChartLike, ref: PalaceRef, stars: string[]): boolean {
  const { raw } = boc(chart);
  const i = viTriCung(raw, ref);
  return stars.some((s) => coSao(raw, i, s));
}

/** The palace holds none of `stars`. */
export function palaceNotHave(chart: ChartLike, ref: PalaceRef, stars: string[]): boolean {
  const { raw } = boc(chart);
  const i = viTriCung(raw, ref);
  return stars.every((s) => !coSao(raw, i, s));
}

/** No major star in the palace (vô chính diệu), unless one of `exceptStars` is there. */
export function palaceIsEmpty(chart: ChartLike, ref: PalaceRef, exceptStars: string[] = []): boolean {
  const { raw } = boc(chart);
  const i = viTriCung(raw, ref);
  if (raw.cung[i].sao.some((s) => s.loai === "chinh-tinh")) return false;
  return !exceptStars.some((s) => coSao(raw, i, s));
}

/**
 * The four flying transformations of a palace: its stem transforms four stars
 * (the engine's Four Transformations table), and each lands where that star sits.
 */
export function flyingTransformations(chart: ChartLike, ref: PalaceRef, opts: LookupOptions = {}): FlyingTransformation[] {
  const h = boc(chart, opts.lang, opts.terms);
  return hoaCuaCung(h, viTriCung(h.raw, ref));
}

/** The stem of `from` transforms, with every type in `types`, a star sitting in `to`. */
export function fliesTo(chart: ChartLike, from: PalaceRef, to: PalaceRef, types: TransformationName | TransformationName[]): boolean {
  const { raw } = boc(chart);
  const a = viTriCung(raw, from);
  const b = viTriCung(raw, to);
  const sao = saoHoaCuaCung(raw, a);
  const ds = Array.isArray(types) ? types : [types];
  return ds.length > 0 && ds.every((t) => viTriSao(raw, sao[chiSoHoa(t)]) === b);
}

/** Self-transformation (自化): the palace stem transforms, with every type in `types` (default: any of the four), a star in the same palace. */
export function selfTransformed(chart: ChartLike, ref: PalaceRef, types?: TransformationName | TransformationName[]): boolean {
  const { raw } = boc(chart);
  const i = viTriCung(raw, ref);
  const sao = saoHoaCuaCung(raw, i);
  if (types === undefined || (Array.isArray(types) && types.length === 0)) return sao.some((s) => viTriSao(raw, s) === i);
  return (Array.isArray(types) ? types : [types]).every((t) => viTriSao(raw, sao[chiSoHoa(t)]) === i);
}

function homNay(): { year: number; month: number; day: number } {
  const d = new Date();
  return { year: d.getFullYear(), month: d.getMonth() + 1, day: d.getDate() };
}

/**
 * Horoscope of a date (default: today): the decade (đại vận), minor limit
 * (tiểu vận), year (lưu niên, with its Four Transformations and moving stars)
 * and month (nguyệt hạn, by the engine's Đẩu Quân rule). The lunar date is
 * read in the Vietnamese calendar, like the chart.
 *
 * @example horoscope(castZiWei({ date: "1990-09-19", time: "20:00", gender: "male" }), { date: "2026-11-19" }).year.palace
 */
export function horoscope(chart: ChartLike, opts: { date?: DateInput } & LookupOptions = {}): ZiWeiHoroscope {
  const h = boc(chart, opts.lang, opts.terms);
  const d = opts.date === undefined ? homNay() : parseDate(opts.date);
  const am = solarToLunar(d.day, d.month, d.year);
  const hn = tinhHanNam(h.raw, am.year);
  const yl = yearlyLuck(h.raw, am.year, { lang: h.lang, terms: h.terms });
  const dv = daiVan(h.raw).find((c) => hn.tuoiMu >= c.tuTuoi && hn.tuoiMu <= c.denTuoi);
  const canNam = mod(am.year - 4, 10);
  const canThang = mod(canThangDan(canNam) + am.month - 1, 10);
  const chiThang = mod(2 + am.month - 1, 12);
  const thang = yl.months[am.month - 1];
  return {
    date: formatDate(d),
    lunar: { year: am.year, month: am.month, day: am.day, leap: am.leap },
    age: hn.tuoiMu,
    decade: dv
      ? { ...phamVi(h, dv.viTri, h.la.palaces[dv.viTri].stemBranch, hoaCuaCung(h, dv.viTri).map(boSelf)), fromAge: dv.tuTuoi, toAge: dv.denTuoi }
      : null,
    minorLimit: phamVi(h, hn.tieuVanViTri, h.la.palaces[hn.tieuVanViTri].stemBranch, hoaCuaCung(h, hn.tieuVanViTri).map(boSelf)),
    year: { ...phamVi(h, hn.luuNienViTri, yl.yearPillar, yl.transformations), year: am.year, stars: yearlyStars(h.raw, am.year, { lang: h.lang, terms: h.terms }) },
    month: { ...phamVi(h, thang.index, stemBranchName(`${THIEN_CAN[canThang]} ${DIA_CHI[chiThang]}`, h.lang, h.terms), []), month: am.month },
    day: null,
    hour: null,
  };
}

/** Attach the lookup methods to a chart from `castZiWei` (non-enumerable: JSON is unchanged). */
export function withZiWeiMethods(chart: ZiWeiChart): FunctionalZiWeiChart {
  const ham: Record<string, unknown> = {
    horoscope: (opts: { date?: DateInput } & LookupOptions = {}) => horoscope(chart, opts),
    palace: (ref: PalaceRef) => palaceOf(chart, ref),
    star: (name: string) => starOf(chart, name),
    surroundingPalaces: (ref: PalaceRef) => surroundingPalaces(chart, ref),
    flankingPalaces: (ref: PalaceRef) => flankingPalaces(chart, ref),
    flyingTransformations: (ref: PalaceRef, opts: LookupOptions = {}) => flyingTransformations(chart, ref, opts),
  };
  for (const [k, v] of Object.entries(ham)) Object.defineProperty(chart, k, { value: v, enumerable: false, writable: true, configurable: true });
  return chart as FunctionalZiWeiChart;
}

/**
 * Cast a Zi Wei Dou Shu (Tử Vi) chart, with lookup methods: `horoscope({ date })`,
 * `palace(ref)`, `star(name)`, `surroundingPalaces(ref)`, `flankingPalaces(ref)`,
 * `flyingTransformations(ref)`. Same data as the plain chart (methods are not in JSON).
 *
 * @example castZiWei({ date: "1990-09-19", time: "20:00", gender: "male" }).horoscope({ date: "2026-11-19" }).year.palace
 */
export function castZiWei(input: ZiWeiInput): FunctionalZiWeiChart {
  return withZiWeiMethods(castZiWeiData(input));
}
