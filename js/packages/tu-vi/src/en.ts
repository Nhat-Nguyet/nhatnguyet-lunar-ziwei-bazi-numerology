// Lớp API tiếng Anh của @nhatnguyet/tu-vi: tham số đặt tên, giờ đồng hồ thay
// cho chỉ số chi, giới tính "male"/"female", kết quả theo `lang`. Mọi phép
// tính gọi lại đúng hàm tiếng Việt của gói (lapLaSoTuVi, daiVan, tinhHanNam,
// tinhSaoLuu, nhanDienCachCuc); đối tượng gốc giữ nguyên ở trường `raw`.
// Chỉ số vị trí cộng 0 để đổi -0 (phép mod của lõi) thành 0.
//
// Chữ Trung: lấy trường ...Zh của lõi khi có, không thì bảng TU_VUNG (chỉ khi
// bản tiếng Anh của bảng trùng bản tiếng Anh của lõi, để khỏi lấy nhầm nghĩa
// khác cùng chữ Việt), không nữa thì để bản tiếng Anh.
//
// English API layer for Zi Wei Dou Shu (Tử Vi). Results are produced by the
// package's original Vietnamese-named functions; the untouched original object
// stays in `raw`.

import {
  DIA_CHI,
  TU_VUNG,
  checkLang,
  formatDate,
  formatTime,
  hourBranch as hourBranchOf,
  parseDate,
  parseTime,
  pickLang,
  stemBranchName,
  term,
} from "@nhatnguyet/am-lich";
import type { DateInput, HourBranch, Lang } from "@nhatnguyet/am-lich";
import { lapLaSoTuVi } from "./la-so.ts";
import { daiVan } from "./chieu-sau.ts";
import { tinhHanNam } from "./luu-nien.ts";
import { tinhSaoLuu } from "./luu-sao.ts";
import { nhanDienCachCuc } from "./cach-cuc.ts";
import { veLaSoSvg } from "./ve-svg.ts";
import type { CachCuc } from "./cach-cuc-toan-thu.ts";
import type { CungTuVi, LaSoTuVi, LoaiSao, SaoTuVi } from "./kieu.ts";

/** "male" or "female" (also accepted: "m", "f", "Nam", "Nữ"). */
export type Gender = "male" | "female";

/** Normalise a gender option to "male" / "female"; throws on anything else. */
export function parseGender(g: unknown): Gender {
  switch (g) {
    case "male":
    case "Male":
    case "m":
    case "M":
    case "Nam":
    case "nam":
      return "male";
    case "female":
    case "Female":
    case "f":
    case "F":
    case "Nữ":
    case "nữ":
    case "Nu":
    case "nu":
      return "female";
  }
  throw new TypeError(`gender must be "male" or "female", got ${JSON.stringify(g)}`);
}

/** Input of `castZiWei`. */
export interface ZiWeiInput {
  /** Gregorian birth date: "YYYY-MM-DD", a Date (local time) or { year, month, day }. */
  date: DateInput;
  /**
   * Clock time of birth, "HH:MM" (24 h). Mapped to its double hour by the
   * package's own rule: Tý is 23:00 to 00:59, Sửu 01:00 to 02:59, and so on.
   * Give either `time` or `hourBranch`.
   */
  time?: string | number;
  /** Alternative to `time`: branch index of the birth hour, 0 = Tý ... 11 = Hợi. */
  hourBranch?: number;
  gender: Gender | string;
  name?: string;
  /** Language of names in the result. Default "en". */
  lang?: Lang;
  /** Year used by `yearlyLuck` / `yearlyStars` when no year is passed. Default: current year. */
  viewYear?: number;
}

/** Kind of star on the chart. */
export type StarKind = "major" | "minor" | "growth" | "year-ring" | "scholar";

const KIND: Readonly<Record<LoaiSao, StarKind>> = {
  "chinh-tinh": "major",
  "phu-tinh": "minor",
  "truong-sinh": "growth",
  "thai-tue": "year-ring",
  "bac-sy": "scholar",
};

/** A star placed in a palace. */
export interface ZiWeiStar {
  /** Name in `lang`. */
  name: string;
  /** Vietnamese name (stable key). */
  nameVi: string;
  /** "major" (14 main stars), "minor", "growth" (Tràng Sinh ring), "year-ring" (Thái Tuế ring), "scholar" (Bác Sỹ ring). */
  kind: StarKind;
  /** Brightness of a major star: Exalted, Prosperous, Favorable, Neutral, Weak (in `lang`). */
  brightness?: string;
  /** One of the Four Transformations: Hóa Lộc, Hóa Quyền, Hóa Khoa, Hóa Kỵ (zh: 化禄...). */
  transformation?: string;
}

/** One of the twelve palaces, fixed to an earthly branch. */
export interface ZiWeiPalace {
  /** 0 = Tý ... 11 = Hợi. */
  index: number;
  branch: string;
  /** Stem-branch label of the palace. */
  stemBranch: string;
  /** Palace name in `lang` (Life Palace, Siblings, Spouse...). */
  name: string;
  nameVi: string;
  isLife: boolean;
  isBody: boolean;
  /** Tuần (Xun Kong) void marker. */
  tuan: boolean;
  /** Triệt (Jie Kong) void marker. */
  triet: boolean;
  stars: ZiWeiStar[];
}

/** A Zi Wei Dou Shu chart in `lang`. */
export interface ZiWeiChart {
  lang: Lang;
  name: string;
  gender: Gender;
  /** Birth date as entered, "YYYY-MM-DD". */
  solarDate: string;
  /** Birth time as entered, "HH:MM", or null when only `hourBranch` was given. */
  time: string | null;
  hour: HourBranch;
  /** Lunar birth date (Vietnamese calendar, UTC+7). */
  lunar: { year: number; month: number; day: number; leap: boolean };
  /** Stem-branch of the lunar birth year. */
  yearPillar: string;
  /** Yin/Yang and gender, e.g. "Yang Male". */
  yinYang: string;
  /** Element bureau (cục): number and name, e.g. 4, "Metal Four". */
  bureau: { number: number; name: string };
  /** Na yin of the birth year (bản mệnh). */
  naYin: string;
  /** Palace index (0 = Tý) of the Life and Body palaces. */
  lifePalace: number;
  bodyPalace: number;
  /** Twelve palaces, index 0 (Tý) to 11 (Hợi). */
  palaces: ZiWeiPalace[];
  viewYear: number;
  /** Conventions used (hour mapping, calendar), in `lang`. */
  notes: string[];
  /** The original Vietnamese-keyed object from `lapLaSoTuVi`. */
  raw: LaSoTuVi;
  /** Draw this chart as a self-contained SVG in the chart's `lang` (non-enumerable, not in JSON). */
  toSvg(opts?: SvgOptions): string;
}

/** Options for the SVG drawings. */
export interface SvgOptions {
  /** "light" (default) or "dark". */
  theme?: "light" | "dark";
  /** Displayed width in px (default 720); the drawing scales by its viewBox. */
  width?: number;
  /** Language of the drawing; default: the language of the chart. */
  lang?: Lang;
}

/** Gắn hàm toSvg không liệt kê (JSON, deepEqual không thấy). */
function ganToSvg<T extends object>(o: T, ve: (opts?: SvgOptions) => string): T {
  Object.defineProperty(o, "toSvg", { value: ve, enumerable: false, writable: true, configurable: true });
  return o;
}

/** Tên sao theo ngôn ngữ (xem quy tắc chọn chữ Trung ở đầu tệp). */
function tenSao(s: { ten: string; tenEn: string; tenZh?: string }, lang: Lang): string {
  if (lang === "vi") return s.ten;
  if (lang === "en") return s.tenEn || term(s.ten, "en");
  if (s.tenZh) return s.tenZh;
  const t = TU_VUNG[s.ten];
  if (t && (!s.tenEn || t[0] === s.tenEn)) return t[1];
  return s.tenEn || s.ten; // TODO(zh): lõi chưa có chữ Trung cho sao này.
}

function tenCung(c: CungTuVi, lang: Lang): string {
  return pickLang(c, "tenCung", lang, () => term(c.tenCung, lang, c.tenCungEn));
}

function doSang(s: SaoTuVi, lang: Lang): string | undefined {
  if (!s.mieuVuong) return undefined;
  const mv = s.mieuVuong;
  return pickLang(s, "mieuVuong", lang, () => term(mv, lang, s.mieuVuongEn));
}

const GIO_TY: Readonly<Record<Lang, string>> = {
  vi: "Sinh giờ Tý (23h tới 0h59): lá số giữ đúng ngày dương đã nhập kể cả sau 23h; có sách tính sang ngày hôm sau, muốn theo cách ấy thì nhập ngày hôm sau.",
  en: "Born in the Tý hour (23:00 to 00:59): the chart keeps the date you entered even after 23:00. Some texts count a birth after 23:00 as the next day; to follow them, enter the next day's date.",
  zh: "子时（23 时至 0 时 59 分）出生：本命盘保留所输入的日期，23 时后出生亦然。有的书把 23 时后出生算作次日，如按此法，请输入次日日期。",
};

function ghiChuGio(h: HourBranch, time: string | null, lang: Lang): string {
  const lich = { vi: "Ngày âm theo lịch Việt Nam (UTC+7).", en: "The lunar date follows the Vietnamese calendar (UTC+7).", zh: "农历日期按越南历（UTC+7）。" }[lang];
  if (time === null) return lich;
  if (lang === "vi") return `Giờ sinh ${time} thuộc giờ ${h.name} (${h.range}). ${lich}`;
  if (lang === "en") return `Birth time ${time} falls in the ${h.name} double hour (${h.range}). ${lich}`;
  return `出生时间 ${time} 属${h.name}时（${h.range}）。${lich}`;
}

/** Turn a raw `LaSoTuVi` into the English-API shape in `lang`. */
export function localizeZiWei(raw: LaSoTuVi, lang: Lang = "en", extra: { time?: string | null; viewYear?: number } = {}): ZiWeiChart {
  const l = checkLang(lang);
  const chiIdx = DIA_CHI.indexOf(raw.gioSinh);
  const h: HourBranch = hourBranchOf(chiIdx === 0 ? 0 : chiIdx * 2, l);
  const time = extra.time ?? null;
  const palaces: ZiWeiPalace[] = raw.cung.map((c) => ({
    index: c.viTri,
    branch: pickLang(c, "chi", l, () => term(c.chi, l)),
    stemBranch: pickLang(c, "canChi", l, () => stemBranchName(c.canChi, l)),
    name: tenCung(c, l),
    nameVi: c.tenCung,
    isLife: c.viTri === raw.cungMenh,
    isBody: c.laThan,
    tuan: c.tuanTrung,
    triet: c.trietLo,
    stars: c.sao.map((s) => {
      const r: ZiWeiStar = { name: tenSao(s, l), nameVi: s.ten, kind: KIND[s.loai] };
      const b = doSang(s, l);
      if (b) r.brightness = b;
      const hoa = s.tuHoa;
      if (hoa) r.transformation = pickLang(s, "tuHoa", l, () => term(hoa, l));
      return r;
    }),
  }));
  const notes = [ghiChuGio(h, time, l)];
  if (chiIdx === 0) notes.push(GIO_TY[l]);
  const chart = {
    lang: l,
    name: raw.hoTen,
    gender: raw.gioiTinh === "Nữ" ? "female" : "male",
    solarDate: formatDate({ year: raw.ngaySinhDuong.nam, month: raw.ngaySinhDuong.thang, day: raw.ngaySinhDuong.ngay }),
    time,
    hour: h,
    lunar: { year: raw.ngaySinhAm.year, month: raw.ngaySinhAm.month, day: raw.ngaySinhAm.day, leap: raw.ngaySinhAm.leap },
    yearPillar: pickLang(raw, "canChiNam", l, () => stemBranchName(raw.canChiNam, l)),
    yinYang: pickLang(raw, "amDuongMenh", l, () => term(raw.amDuongMenh, l)),
    bureau: { number: raw.cuc, name: pickLang(raw, "tenCuc", l, () => term(raw.tenCuc, l)) },
    naYin: pickLang(raw, "banMenhNapAm", l, () => term(raw.banMenhNapAm, l)),
    lifePalace: raw.cungMenh,
    bodyPalace: raw.cungThan,
    palaces,
    viewYear: extra.viewYear ?? new Date().getFullYear(),
    notes,
    raw,
  } as Omit<ZiWeiChart, "toSvg">;
  return ganToSvg(chart, (opts?: SvgOptions) => ziWeiSvg(raw, { ...opts, lang: opts?.lang ?? l })) as ZiWeiChart;
}

/**
 * Draw a Zi Wei chart (from `castZiWei` or `lapLaSoTuVi`) as a self-contained
 * SVG string. Wraps `veLaSoSvg` (`renderChartSvg`).
 *
 * @example writeFileSync("chart.svg", ziWeiSvg(castZiWei({ date: "1990-09-19", time: "20:00", gender: "male" }), { theme: "dark" }))
 */
export function ziWeiSvg(chart: ZiWeiChart | LaSoTuVi, opts: SvgOptions = {}): string {
  const { raw, lang } = boc(chart, opts.lang);
  return veLaSoSvg(raw, { lang, theme: opts.theme, width: opts.width });
}

/**
 * Cast a Zi Wei Dou Shu (Tử Vi) chart.
 *
 * @example castZiWei({ date: "1990-09-19", time: "20:00", gender: "male" })
 */
export function castZiWei(input: ZiWeiInput): ZiWeiChart {
  if (!input || typeof input !== "object") throw new TypeError("castZiWei needs an options object");
  const lang = checkLang(input.lang);
  const d = parseDate(input.date);
  const gender = parseGender(input.gender);
  const t = parseTime(input.time);
  let chi: number;
  if (t) {
    chi = hourBranchOf(t.hour).index;
    if (input.hourBranch !== undefined && input.hourBranch !== chi) {
      throw new RangeError(`time ${formatTime(t)} is branch ${chi}, but hourBranch ${input.hourBranch} was given`);
    }
  } else if (input.hourBranch !== undefined) {
    chi = input.hourBranch;
    if (!Number.isInteger(chi) || chi < 0 || chi > 11) throw new RangeError("hourBranch must be an integer 0 (Tý) to 11 (Hợi)");
  } else {
    throw new TypeError('Zi Wei needs the birth hour: pass time ("HH:MM") or hourBranch (0-11)');
  }
  if (input.viewYear !== undefined && !Number.isInteger(input.viewYear)) throw new TypeError("viewYear must be an integer");
  const raw = lapLaSoTuVi(input.name ?? "", gender === "female" ? "Nữ" : "Nam", d.day, d.month, d.year, chi);
  return localizeZiWei(raw, lang, { time: t ? formatTime(t) : null, viewYear: input.viewYear });
}

type ChartLike = ZiWeiChart | Omit<ZiWeiChart, "toSvg"> | LaSoTuVi;

function boc(c: ChartLike, lang?: Lang): { raw: LaSoTuVi; lang: Lang; viewYear: number } {
  if (c && typeof c === "object" && "raw" in c && "palaces" in c) {
    return { raw: c.raw, lang: checkLang(lang ?? c.lang), viewYear: c.viewYear };
  }
  if (c && typeof c === "object" && "cung" in c) return { raw: c, lang: checkLang(lang), viewYear: new Date().getFullYear() };
  throw new TypeError("expected a chart from castZiWei (or lapLaSoTuVi)");
}

function tenCungTai(raw: LaSoTuVi, idx: number, lang: Lang): string {
  return tenCung(raw.cung[((idx % 12) + 12) % 12], lang);
}

function tenSaoTheoTen(raw: LaSoTuVi, ten: string, lang: Lang): string {
  for (const c of raw.cung) for (const s of c.sao) if (s.ten === ten) return tenSao(s, lang);
  return term(ten, lang);
}

/** One ten-year period (đại vận). */
export interface DecadeLuck {
  order: number;
  palaceIndex: number;
  branch: string;
  palace: string;
  /** East Asian age (1 at birth), as the Tử Vi books count. */
  fromAge: number;
  toAge: number;
  /** Lunar years covered (birth lunar year + age - 1). */
  fromYear: number;
  toYear: number;
  /** Major stars sitting in the palace (empty: no major star). */
  majorStars: string[];
}

/** The twelve ten-year periods. Wraps `daiVan`. */
export function decadeLuck(chart: ChartLike, opts: { lang?: Lang } = {}): DecadeLuck[] {
  const { raw, lang } = boc(chart, opts.lang);
  return daiVan(raw).map((c) => ({
    order: c.thu,
    palaceIndex: c.viTri + 0,
    branch: term(c.chi, lang),
    palace: tenCungTai(raw, c.viTri, lang),
    fromAge: c.tuTuoi,
    toAge: c.denTuoi,
    fromYear: raw.ngaySinhAm.year + c.tuTuoi - 1,
    toYear: raw.ngaySinhAm.year + c.denTuoi - 1,
    majorStars: raw.cung[c.viTri].sao.filter((s) => s.loai === "chinh-tinh").map((s) => tenSao(s, lang)),
  }));
}

/** Facts of one viewing year (hạn năm). */
export interface YearlyLuck {
  year: number;
  yearPillar: string;
  /** East Asian age in that year. */
  age: number;
  /** Palace of the year branch (lưu niên). */
  yearPalace: { index: number; branch: string; palace: string };
  /** Minor limit (tiểu vận) palace. */
  minorLimit: { index: number; branch: string; palace: string };
  /** The decade in effect, or null outside the twelve periods. */
  decade: { fromAge: number; toAge: number; palace: string } | null;
  /** The year's Four Transformations and where their stars sit (palace null when the star is not on the chart). */
  transformations: { type: string; star: string; palaceIndex: number | null; palace: string | null }[];
  /** Twelve lunar months and their palaces (nguyệt hạn). */
  months: { month: number; index: number; branch: string; palace: string }[];
}

/** Facts of a viewing year. Wraps `tinhHanNam`. `year` defaults to the chart's `viewYear`. */
export function yearlyLuck(chart: ChartLike, year?: number, opts: { lang?: Lang } = {}): YearlyLuck {
  const b = boc(chart, opts.lang);
  const { raw, lang } = b;
  const nam = year ?? b.viewYear;
  if (!Number.isInteger(nam)) throw new TypeError("year must be an integer");
  const h = tinhHanNam(raw, nam);
  return {
    year: h.nam,
    yearPillar: stemBranchName(h.canChiNam, lang),
    age: h.tuoiMu,
    yearPalace: { index: h.luuNienViTri + 0, branch: term(h.luuNienChi, lang), palace: tenCungTai(raw, h.luuNienViTri, lang) },
    minorLimit: { index: h.tieuVanViTri + 0, branch: term(h.tieuVanChi, lang), palace: tenCungTai(raw, h.tieuVanViTri, lang) },
    decade: h.daiVanTenCung
      ? { fromAge: h.daiVanTuTuoi, toAge: h.daiVanDenTuoi, palace: tenCungTai(raw, raw.cung.findIndex((c) => c.tenCung === h.daiVanTenCung), lang) }
      : null,
    transformations: h.luuTuHoa.map((x) => ({
      type: term(x.hoa, lang),
      star: tenSaoTheoTen(raw, x.sao, lang),
      palaceIndex: x.coTrenLaSo ? x.viTri + 0 : null,
      palace: x.coTrenLaSo ? tenCungTai(raw, x.viTri, lang) : null,
    })),
    months: h.nguyetHan.thang.map((t) => ({ month: t.thang, index: t.viTri + 0, branch: term(t.chi, lang), palace: tenCungTai(raw, t.viTri, lang) })),
  };
}

const QUAN_HE: Readonly<Record<string, string>> = { "dong-cung": "same-palace", "xung-chieu": "opposite", "tam-hop": "trine", "": "" };

/** A yearly moving star (sao lưu). */
export interface YearlyStar {
  /** Stable code, e.g. "luu-loc-ton". */
  code: string;
  name: string;
  /** Placed by the year STEM (false: by the year branch). */
  byStem: boolean;
  palaceIndex: number;
  branch: string;
  palace: string;
  /** Relation to the year palace, the minor limit and the decade palace: "same-palace", "opposite", "trine" or "". */
  toYearPalace: string;
  toMinorLimit: string;
  toDecade: string;
}

/** The five yearly moving stars. Wraps `tinhSaoLuu`. */
export function yearlyStars(chart: ChartLike, year?: number, opts: { lang?: Lang } = {}): YearlyStar[] {
  const b = boc(chart, opts.lang);
  const { raw, lang } = b;
  const nam = year ?? b.viewYear;
  return tinhSaoLuu(raw, nam).map((s) => ({
    code: s.ma,
    name: lang === "vi" ? s.ten : lang === "en" ? s.tenEn : s.tenZh,
    byStem: s.theoCan,
    palaceIndex: s.viTri + 0,
    branch: term(s.chi, lang),
    palace: tenCungTai(raw, s.viTri, lang),
    toYearPalace: QUAN_HE[s.voiLuuNien] ?? s.voiLuuNien,
    toMinorLimit: QUAN_HE[s.voiTieuVan] ?? s.voiTieuVan,
    toDecade: QUAN_HE[s.voiDaiVan] ?? s.voiDaiVan,
  }));
}

const NHOM: Readonly<Record<string, string>> = { "dinh-phu": "wealth", "dinh-quy": "rank", "dinh-ban-tien": "hardship" };

/** A named chart pattern (cách cục). */
export interface ZiWeiPattern {
  /** Name in `lang` (English keeps the Sino-Vietnamese name, as the books do). */
  name: string;
  nameVi: string;
  /** Traditional Chinese name as in the source book, when known. */
  nameHan?: string;
  condition: string;
  description: string;
  /** Palace the pattern applies to, or null. */
  palaceIndex: number | null;
  palace: string | null;
  /** Table of the Tử Vi Đẩu Số Toàn Thư it comes from: "wealth", "rank", "hardship"; absent otherwise. */
  group?: string;
  /** Schools word the condition differently. */
  hasVariants: boolean;
  /** Commentary from the book, original Chinese. */
  quote?: string;
}

/** Recognise named patterns on a chart. Wraps `nhanDienCachCuc`. */
export function findPatterns(chart: ChartLike, opts: { lang?: Lang } = {}): ZiWeiPattern[] {
  const { raw, lang } = boc(chart, opts.lang);
  return nhanDienCachCuc(raw).map((c: CachCuc) => {
    const p: ZiWeiPattern = {
      name: lang === "zh" ? c.tenZh || c.ten : c.ten,
      nameVi: c.ten,
      condition: lang === "vi" ? c.dieuKien : lang === "en" ? c.dieuKienEn : c.dieuKienZh,
      description: lang === "vi" ? c.moTa : lang === "en" ? c.moTaEn : c.moTaZh,
      palaceIndex: c.viTri >= 0 ? c.viTri + 0 : null,
      palace: c.viTri >= 0 ? tenCungTai(raw, c.viTri, lang) : null,
      hasVariants: c.coDiBan === true,
    };
    if (c.tenHan) p.nameHan = c.tenHan;
    if (c.nhom) p.group = NHOM[c.nhom] ?? c.nhom;
    if (c.chuVan) p.quote = c.chuVan;
    return p;
  });
}
