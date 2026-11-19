// Lớp API tiếng Anh của @nhatnguyet/bat-tu: tham số đặt tên, giờ đồng hồ
// "HH:MM", giới tính "male"/"female", kết quả theo `lang`. Mọi phép tính gọi
// lại đúng hàm tiếng Việt của gói (lapLaSoBatTu, tinhTieuVanBatTu); đối tượng
// gốc giữ nguyên ở trường `raw`.
//
// English API layer for BaZi (Four Pillars, Bát Tự). The untouched original
// object stays in `raw`.

import {
  TIET_KHI_TABLE,
  checkLang,
  checkTerms,
  convertTerms,
  termName,
  elementName,
  formatDate,
  formatTime,
  hourBranch,
  parseDateInRange,
  parseTime,
  pickLang,
  pillarFromIndex,
  term,
  chiSoCan,
  chiSoChi,
} from "@nhatnguyet/am-lich";
import type { DateInput, Lang, Pillar, Terms } from "@nhatnguyet/am-lich";
import { lapLaSoBatTu } from "./la-so.ts";
import type { BaZiSchools, LaSoBatTu, Tru, TruLaSo } from "./la-so.ts";
import { tinhTieuVanBatTu } from "./tieu-van.ts";
import { veBatTuSvg } from "./ve-svg.ts";

/** Input of `castBaZi`. */
export interface BaZiInput {
  /** Gregorian birth date: "YYYY-MM-DD", a Date (local time) or { year, month, day }. */
  date: DateInput;
  /**
   * Clock time of birth "HH:MM" (Vietnam time, UTC+7). Omit or null when
   * unknown: the hour pillar is left out and the luck start is computed from
   * noon. The DAY pillar changes at 23:00 (start of the Tý hour) unless
   * `schools.ziHour` is "split-at-midnight".
   */
  time?: string | number | null;
  /** "male" or "female" (also "m", "f", "Nam", "Nữ"). Needed: luck pillars run by gender. */
  gender: string;
  /** Language of names in the result. Default "en". */
  lang?: Lang;
  /**
   * With lang "en": how stems and branches are written: "pinyin" (default,
   * "Geng Wu"), "han" ("庚午") or "vi" ("Canh Ngọ"). See `Terms` in @nhatnguyet/am-lich.
   */
  terms?: Terms;
  /**
   * School options. `ziHour`: "next-day-from-23" (default) or
   * "split-at-midnight" (early and late Zi). See `BaZiSchools` and docs/schools.md.
   *
   * @example castBaZi({ date: "2024-01-01", time: "23:30", gender: "male", schools: { ziHour: "split-at-midnight" } })
   */
  schools?: BaZiSchools;
}

/** A natal pillar with everything read from it. */
export interface BaZiPillar extends Pillar {
  /** Ten God of the stem relative to the Day Master ("Day Master" on the day pillar). */
  tenGod: string;
  /** Stems hidden in the branch, main qi first. */
  hiddenStems: { stem: string; element: string; role: string; tenGod: string }[];
  /** Twelve-stage position of the Day Master at this branch. */
  stage: string;
  /** Twelve-stage position of this pillar's own stem at its branch. */
  selfStage: string;
  /** Symbolic stars (thần sát) on this pillar. */
  stars: string[];
}

/** A ten-year luck pillar (đại vận). */
export interface LuckPillar extends Pillar {
  order: number;
  tenGod: string;
  /** Day Master's stage at the luck pillar's branch. */
  stage: string;
  /** Exact age (not East Asian age) when the pillar starts. */
  fromAge: number;
  fromYear: number;
  toYear: number;
}

/** A BaZi chart in `lang`. */
export interface BaZiChart {
  lang: Lang;
  /** How stems and branches are written (see `BaZiInput.terms`). */
  terms: Terms;
  gender: "male" | "female";
  solarDate: string;
  /** "HH:MM" or null when the birth time is unknown. */
  time: string | null;
  pillars: { year: BaZiPillar; month: BaZiPillar; day: BaZiPillar; hour: BaZiPillar | null };
  dayMaster: { stem: string; element: string; yinYang: string };
  /** Solar term in effect at birth, and the sectional term that opened the birth month. */
  solarTerm: string;
  monthTerm: string;
  /** Gregorian year the year pillar belongs to (the year changes at Start of Spring, not at Tết). */
  pillarYear: number;
  /** Conception pillar (thai nguyên). */
  conception: Pillar;
  /** Life palace (mệnh cung); null without a birth time. */
  lifePalace: Pillar | null;
  symbolicStars: { name: string; branches: string[]; pillars: ("year" | "month" | "day" | "hour")[]; lookup: string; variants: string }[];
  luck: {
    direction: "forward" | "backward";
    /** Solar term used to count the starting age. */
    term: { name: string; date: string; time: string };
    days: number;
    startAge: { years: number; months: number };
    startDate: string;
    explanation: string;
    pillars: LuckPillar[];
  };
  notes: string[];
  /** The original Vietnamese-keyed object from `lapLaSoBatTu`. */
  raw: LaSoBatTu;
  /** School options used, only those that differ from the default; absent for a default chart. */
  schools?: BaZiSchools;
  /** Draw this chart as a self-contained SVG in the chart's `lang` (non-enumerable, not in JSON). */
  toSvg(opts?: BaZiSvgOptions): string;
}

/** Options for the BaZi SVG drawing. */
export interface BaZiSvgOptions {
  theme?: "light" | "dark";
  /** Displayed width in px (default 720). */
  width?: number;
  /** Default: the language of the chart. */
  lang?: Lang;
  /** With lang "en": "pinyin", "han" or "vi"; default: the chart's `terms`. */
  terms?: Terms;
  /** Name printed at the top (a BaZi chart carries no name). */
  name?: string;
}

/**
 * Draw a BaZi chart (from `castBaZi` or `lapLaSoBatTu`) as a self-contained
 * SVG string. Wraps `veBatTuSvg` (`renderBaziSvg`).
 */
export function baZiSvg(chart: BaZiChart | LaSoBatTu, opts: BaZiSvgOptions = {}): string {
  const raw = "raw" in chart ? chart.raw : chart;
  const lang = checkLang(opts.lang ?? ("raw" in chart ? chart.lang : undefined));
  const terms = checkTerms(opts.terms ?? ("raw" in chart && chart.lang === lang ? chart.terms : undefined), lang);
  return veBatTuSvg(raw, { lang, theme: opts.theme, width: opts.width, hoTen: opts.name ?? "", terms });
}

/** Chữ Việt còn trong câu tiếng Anh của lõi Bát Tự (thần sát, sách, phái). */
const THAY_BAT_TU: Readonly<Record<string, string>> = {
  "The Bát Tự Văn Xương": "The BaZi Literary Glory",
  "the Tử Vi star of the same name": "the Zi Wei Dou Shu star of the same name",
  "Tử Bình": "Zi Ping",
  "Dương Nhận": "Yang Blade",
  "the Lộc": "the Prosperity Star",
};

/** Rewrite the Vietnamese words left in an English sentence of the BaZi core. */
function enText(text: string, terms: Terms): string {
  return convertTerms(text, terms, THAY_BAT_TU, "bat-tu");
}

/**
 * Lời giải thích đại vận bản Anh: lõi (và ca kiểm) viết mốc tiết "04:37 on
 * 8/9/1990" theo lối ngày/tháng của bản Việt, người đọc tiếng Anh dễ đọc
 * thành tháng/ngày. Lớp tiếng Anh đổi đúng cụm ấy sang ISO "1990-09-08 04:37".
 */
function lyDoVanEn(dv: LaSoBatTu["daiVan"], terms: Terms): string {
  let s = enText(dv.lyDoEn, terms);
  const d = dv.tietMocNgay;
  if (d.year) {
    const cu = `(${formatTime({ hour: dv.tietMocGio, minute: dv.tietMocPhut })} on ${d.day}/${d.month}/${d.year})`;
    s = s.replace(cu, `(${formatDate(d)} ${formatTime({ hour: dv.tietMocGio, minute: dv.tietMocPhut })})`);
  }
  return s;
}

/** Tên tiết khí theo ngôn ngữ: tiếng Anh lấy bảng tiết khí của am-lich, tiếng Trung lấy TU_VUNG. */
function tenTiet(ten: string, lang: Lang): string {
  if (lang === "vi" || !ten) return ten;
  const t = TIET_KHI_TABLE.find((x) => x.ten === ten);
  if (lang === "en") return t ? t.tenEn : ten;
  return term(ten, "zh", t ? t.tenEn : ten);
}

function thapThan(t: { thapThanCan: string; thapThanCanEn: string; thapThanCanZh: string }, lang: Lang): string {
  return lang === "vi" ? t.thapThanCan : lang === "en" ? t.thapThanCanEn : t.thapThanCanZh;
}

/** Trụ cơ bản: lấy trường ...En/...Zh của lõi khi có, không thì tính từ chỉ số can chi. */
function truCoBan(t: Tru, lang: Lang, terms: Terms): Pillar {
  const f = pillarFromIndex(chiSoCan(t.can), chiSoChi(t.chi), lang, terms);
  const p = (k: string, fb: string) => pickLang(t, k, lang, () => fb);
  // Bản Anh: can chi theo `terms` (lõi giữ tên Hán Việt), không lấy trường của lõi.
  const en = lang === "en";
  return {
    ...f,
    label: en ? f.label : p("label", f.label),
    stem: en ? f.stem : p("can", f.stem),
    branch: en ? f.branch : p("chi", f.branch),
    stemElement: p("canHanh", f.stemElement),
    branchElement: p("chiHanh", f.branchElement),
    naYin: p("napAmTen", f.naYin),
    naYinElement: p("napAm", f.naYinElement),
  };
}

function mang(t: object, k: string, lang: Lang, fb: string[]): string[] {
  if (lang === "vi") return fb;
  const v = (t as Record<string, unknown>)[k + (lang === "en" ? "En" : "Zh")];
  return Array.isArray(v) && v.length === fb.length ? (v as string[]) : fb.map((x) => term(x, lang));
}

function truDayDu(t: TruLaSo, lang: Lang, terms: Terms): BaZiPillar {
  return {
    ...truCoBan(t, lang, terms),
    tenGod: thapThan(t, lang),
    hiddenStems: t.tangCan.map((h) => ({
      stem: lang === "en" ? termName(h.can, lang, terms) : pickLang(h, "can", lang, () => term(h.can, lang)),
      element: pickLang(h, "hanh", lang, () => elementName(h.hanh, lang)),
      role: pickLang(h, "vaiTro", lang, () => term(h.vaiTro, lang)),
      tenGod: lang === "vi" ? h.thapThan : lang === "en" ? h.thapThanEn ?? "" : h.thapThanZh ?? "",
    })),
    stage: pickLang(t, "truongSinh", lang, () => term(t.truongSinh, lang)),
    selfStage: pickLang(t, "tuToa", lang, () => term(t.tuToa, lang)),
    stars: mang(t, "thanSat", lang, t.thanSat),
  };
}

const TEN_TRU = ["year", "month", "day", "hour"] as const;

const QUY_UOC: Readonly<Record<Lang, string>> = {
  vi: "Giờ sinh đọc theo giờ Việt Nam (UTC+7). Trụ năm đổi ở Lập Xuân, trụ tháng theo tiết khí, trụ ngày đổi lúc 23h (đầu giờ Tý).",
  en: "Birth time is read as Vietnam time (UTC+7). The year pillar changes at Start of Spring, the month pillar at each sectional solar term, and the day pillar at 23:00 (start of the Tý hour).",
  zh: "出生时间按越南时间（UTC+7）。年柱以立春为界，月柱按节气，日柱于 23 时（子时起点）换日。",
};

/** QUY_UOC của lá số theo lựa chọn ziHour "split-at-midnight". */
const QUY_UOC_NUA_DEM: Readonly<Record<Lang, string>> = {
  vi: "Giờ sinh đọc theo giờ Việt Nam (UTC+7). Trụ năm đổi ở Lập Xuân, trụ tháng theo tiết khí, trụ ngày đổi lúc nửa đêm (tách Tý sớm, Tý muộn: sinh từ 23h tới 24h giữ ngày đã nhập, trụ giờ là giờ Tý của ngày hôm sau).",
  en: "Birth time is read as Vietnam time (UTC+7). The year pillar changes at Start of Spring, the month pillar at each sectional solar term, and the day pillar at midnight (early and late Tý: a birth from 23:00 to 24:00 keeps the date entered, and the hour pillar is the Tý hour of the next day).",
  zh: "出生时间按越南时间（UTC+7）。年柱以立春为界，月柱按节气，日柱于午夜换日（分早晚子时：23 时至 24 时出生者仍用所输入的日期，时柱取次日的子时）。",
};

const KHONG_GIO: Readonly<Record<Lang, string>> = {
  vi: "Chưa biết giờ sinh: không có trụ giờ và mệnh cung; tuổi khởi vận tạm tính từ 12h.",
  en: "Birth time unknown: no hour pillar or life palace; the luck start is counted from noon.",
  zh: "出生时辰未知：无时柱与命宫；起运岁数暂按中午计。",
};

/** Turn a raw `LaSoBatTu` into the English-API shape in `lang`. */
export function localizeBaZi(raw: LaSoBatTu, lang: Lang = "en", terms?: Terms): BaZiChart {
  const l = checkLang(lang);
  const tm = checkTerms(terms, l);
  const en = l === "en";
  const dv = raw.daiVan;
  const qu = raw.schools?.ziHour === "split-at-midnight" ? QUY_UOC_NUA_DEM : QUY_UOC;
  const notes = [en ? enText(qu.en, tm) : qu[l]];
  let time: string | null = null;
  if (raw.coGioSinh) {
    time = formatTime({ hour: raw.gio, minute: raw.phut });
    const h = hourBranch(raw.gio, l, tm);
    notes.push(
      l === "vi" ? `Giờ ${time} thuộc giờ ${h.name} (${h.range}).` : l === "en" ? `${time} falls in the ${h.name} double hour (${h.range}).` : `${time} 属${h.name}时（${h.range}）。`,
    );
  } else {
    notes.push(KHONG_GIO[l]);
  }
  const chart = {
    lang: l,
    terms: tm,
    gender: raw.gioiTinh === "Nữ" ? "female" : "male",
    solarDate: formatDate(raw.ngaySinh),
    time,
    pillars: {
      year: truDayDu(raw.truNam, l, tm),
      month: truDayDu(raw.truThang, l, tm),
      day: truDayDu(raw.truNgay, l, tm),
      hour: raw.truGio ? truDayDu(raw.truGio, l, tm) : null,
    },
    dayMaster: {
      stem: en ? termName(raw.nhatChu, l, tm) : pickLang(raw, "nhatChu", l, () => term(raw.nhatChu, l)),
      element: pickLang(raw, "nhatChuHanh", l, () => elementName(raw.nhatChuHanh, l)),
      yinYang: pickLang(raw, "nhatChuAmDuong", l, () => term(raw.nhatChuAmDuong, l)),
    },
    solarTerm: tenTiet(raw.tietKhi, l),
    monthTerm: tenTiet(raw.tietDauThang, l),
    pillarYear: raw.namTruNam,
    conception: truCoBan(raw.thaiNguyen, l, tm),
    lifePalace: raw.menhCung ? truCoBan(raw.menhCung, l, tm) : null,
    symbolicStars: raw.thanSat.map((s) => ({
      name: pickLang(s, "ten", l, () => term(s.ten, l)),
      branches: en ? s.chiDich.map((x) => termName(x, l, tm)) : mang(s, "chiDich", l, s.chiDich),
      pillars: s.viTri.map((v) => TEN_TRU[v]),
      lookup: l === "vi" ? s.traTheo : l === "en" ? enText(s.traTheoEn, tm) : s.traTheoZh,
      variants: l === "vi" ? s.loiKhac : l === "en" ? enText(s.loiKhacEn, tm) : s.loiKhacZh,
    })),
    luck: {
      direction: dv.thuan ? "forward" : "backward",
      term: {
        name: pickLang(dv, "tietMoc", l, () => tenTiet(dv.tietMoc, l)),
        date: dv.tietMocNgay.year ? formatDate(dv.tietMocNgay) : "",
        time: formatTime({ hour: dv.tietMocGio, minute: dv.tietMocPhut }),
      },
      days: dv.soNgay,
      startAge: { years: dv.tuoiKhoiNam, months: dv.tuoiKhoiThang },
      startDate: dv.ngayKhoiVan.year ? formatDate(dv.ngayKhoiVan) : "",
      explanation: l === "vi" ? dv.lyDo : l === "en" ? lyDoVanEn(dv, tm) : dv.lyDoZh,
      pillars: dv.cacVan.map((v) => ({
        ...truCoBan(v, l, tm),
        order: v.thuTu,
        tenGod: thapThan(v, l),
        stage: pickLang(v, "truongSinh", l, () => term(v.truongSinh, l)),
        fromAge: v.tuoiTu,
        fromYear: v.namTu,
        toYear: v.namDen,
      })),
    },
    notes,
    raw,
  } as Omit<BaZiChart, "toSvg">;
  if (raw.schools) chart.schools = { ...raw.schools };
  Object.defineProperty(chart, "toSvg", {
    value: (opts?: BaZiSvgOptions) => baZiSvg(raw, { ...opts, lang: opts?.lang ?? l, terms: opts?.terms ?? (opts?.lang === undefined || opts.lang === l ? tm : undefined) }),
    enumerable: false,
    writable: true,
    configurable: true,
  });
  return chart as BaZiChart;
}

/**
 * Cast a BaZi (Four Pillars) chart. The clock time is used as is: the day
 * pillar turns at 23:00, months follow solar terms, the year turns at Start
 * of Spring.
 *
 * @example castBaZi({ date: "1990-09-19", time: "20:00", gender: "male" })
 */
export function castBaZi(input: BaZiInput): BaZiChart {
  if (!input || typeof input !== "object") throw new TypeError("castBaZi needs an options object");
  const lang = checkLang(input.lang);
  const terms = checkTerms(input.terms, lang);
  const d = parseDateInRange(input.date);
  const t = parseTime(input.time);
  let gt: string;
  switch (input.gender) {
    case "male": case "Male": case "m": case "M": case "Nam": case "nam":
      gt = "Nam";
      break;
    case "female": case "Female": case "f": case "F": case "Nữ": case "nữ": case "Nu": case "nu":
      gt = "Nữ";
      break;
    default:
      throw new TypeError(`gender must be "male" or "female", got ${JSON.stringify(input.gender)}`);
  }
  const raw = lapLaSoBatTu(d.day, d.month, d.year, t ? t.hour : null, t ? t.minute : 0, gt, input.schools);
  return localizeBaZi(raw, lang, terms);
}

/** The minor luck pillar (tiểu vận) of a viewing year; null without a birth time. Wraps `tinhTieuVanBatTu`. */
export function minorLuck(
  chart: BaZiChart | Omit<BaZiChart, "toSvg"> | LaSoBatTu,
  year: number,
  opts: { lang?: Lang; terms?: Terms } = {},
): (Pillar & { year: number; age: number; tenGod: string }) | null {
  const raw = "raw" in chart ? chart.raw : chart;
  const lang = checkLang(opts.lang ?? ("raw" in chart ? chart.lang : undefined));
  const terms = checkTerms(opts.terms ?? ("raw" in chart && chart.lang === lang ? chart.terms : undefined), lang);
  const tv = tinhTieuVanBatTu(raw, year);
  if (!tv) return null;
  return { ...truCoBan(tv, lang, terms), year: tv.nam, age: tv.tuoiMu, tenGod: thapThan(tv, lang) };
}
