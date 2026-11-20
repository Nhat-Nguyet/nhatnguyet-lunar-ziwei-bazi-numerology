// Lớp API tiếng Anh của @nhatnguyet/fengshui: tham số đặt tên, kết quả theo
// `lang` ("vi", "en", "zh") và `terms` ("pinyin", "han", "vi"). Mọi phép tính
// gọi lại đúng hàm lõi chuyển ngữ (core.ts), không tính lại bằng đường song
// song; chữ tiếng Việt chỉ là giá trị hiển thị.
//
// English API layer. Every result is produced by the ported engine functions.

import {
  BRANCH_PINYIN, DIA_CHI, STEM_PINYIN, THIEN_CAN, TU_VUNG, checkLang, checkTerms, checkYear, elementName, formatDate,
  parseDate, solarToLunar,
} from "@nhatnguyet/am-lich";
import type { DateInput, Lang, Terms } from "@nhatnguyet/am-lich";
import {
  BAT_TRACH, CACH_HK, CUNG_LAC_THU, HANH_CUU_TINH, KHI, SAO_BAT_TRACH, SAO_TOT, SAO_XAU, SO_NHA_QUAI, TAM_HUONG,
  TEN_CUU_TINH, TEN_SON, allBatQuai, allSonHuong, bangThuoc, chinVan, khiCuaSao, kuaGroup, kuaNumber, laDuongHK,
  lapTinhBanHK, phiTinhNam, sonHuongTheoDo, thanhMon, traLoBan, vanCuaNam, viTriNguyenLong,
  type LoaiSao, type SonHuong,
} from "./core.ts";
import { BANG_THUOC, TEN_CUNG_NHO } from "./thuoc-lo-ban.ts";

export type { DateInput, Lang, Terms } from "@nhatnguyet/am-lich";

/** `lang` and `terms` options shared by every function. */
export interface NameOptions {
  /** Language of names: "en" (default), "vi" or "zh". */
  lang?: Lang;
  /**
   * With lang "en": how to write names that have no established English
   * translation (mountains, trigrams, Eight Mansions stars, Luban sectors and
   * sub-sectors):
   * "pinyin" (default), "han" (Chinese characters) or "vi" (Sino-Vietnamese).
   */
  terms?: Terms;
}

function opts(o: NameOptions | undefined): { lang: Lang; terms: Terms } {
  const lang = checkLang(o?.lang);
  return { lang, terms: checkTerms(o?.terms, lang) };
}

/** Pick the vi / pinyin / han form by `terms` ("vi" for lang vi, "han" for zh). */
function theoTerms(t: Terms, vi: string, pinyin: string, han: string): string {
  return t === "vi" ? vi : t === "pinyin" ? pinyin : han;
}

function han(vi: string): string {
  const t = TU_VUNG[vi];
  if (!t) throw new Error("missing vocabulary: " + vi);
  return t[1];
}

// ── Directions ──────────────────────────────────────────────────────────

/** The eight compass directions, clockwise from north. */
export type DirectionId = "north" | "northeast" | "east" | "southeast" | "south" | "southwest" | "west" | "northwest";

/** Direction ids in compass order from north. */
export const DIRECTIONS: readonly DirectionId[] = ["north", "northeast", "east", "southeast", "south", "southwest", "west", "northwest"];

function huongIndex(vi: string): number {
  return TAM_HUONG.findIndex((h) => h[0] === vi);
}

function directionName(i: number, lang: Lang): string {
  const h = TAM_HUONG[i];
  return lang === "vi" ? h[0] : lang === "en" ? h[1] : h[2];
}

const CENTER_NAME: Readonly<Record<Lang, string>> = { vi: "Trung cung", en: "Center", zh: "中宫" };

// ── Trigrams ────────────────────────────────────────────────────────────

/** The eight trigrams by pinyin. */
export type TrigramId = "qian" | "dui" | "li" | "zhen" | "xun" | "kan" | "gen" | "kun";

/** A trigram of the Later Heaven (King Wen) arrangement used by feng shui. */
export interface Trigram {
  id: TrigramId;
  /** Name in `lang` / `terms`. */
  name: string;
  pinyin: string;
  /** Chinese character (simplified). */
  han: string;
  nameVi: string;
  symbol: string;
  /** Nature image in `lang` (Water, Mountain...). */
  image: string;
  /** Element in `lang`. */
  element: string;
  /** Later Heaven (Lo Shu) number: 1 Kan ... 9 Li; also the Kua number. */
  number: number;
  direction: DirectionId;
  directionName: string;
}

function trigram(vi: string, lang: Lang, terms: Terms): Trigram {
  const q = allBatQuai().find((x) => x.ten === vi);
  if (!q) throw new Error("unknown trigram " + vi);
  const i = huongIndex(q.phuongVi);
  return {
    id: q.tenEn.toLowerCase() as TrigramId,
    name: theoTerms(terms, q.ten, q.tenEn, han(q.ten)),
    pinyin: q.tenEn,
    han: han(q.ten),
    nameVi: q.ten,
    symbol: q.kyHieu,
    image: lang === "vi" ? q.tuong : lang === "en" ? q.tuongEn : han(q.tuongHan),
    element: elementName(q.nguHanh, lang),
    number: SO_NHA_QUAI[q.ten],
    direction: DIRECTIONS[i],
    directionName: directionName(i, lang),
  };
}

/**
 * The trigram of a Later Heaven (Lo Shu) number: 1 Kan, 2 Kun, 3 Zhen,
 * 4 Xun, 6 Qian, 7 Dui, 8 Gen, 9 Li (5 has no trigram).
 */
export function trigramOf(number: number, options?: NameOptions): Trigram {
  const { lang, terms } = opts(options);
  const h = TAM_HUONG.find((x) => SO_NHA_QUAI[x[3]] === number);
  if (!h) throw new RangeError("trigram number must be 1 to 9 except 5");
  return trigram(h[3], lang, terms);
}

// ── Mountains ───────────────────────────────────────────────────────────

/** Kind of a mountain: one of 8 stems, 12 branches or 4 corner trigrams. */
export type MountainKind = "stem" | "branch" | "trigram";

/** One of the 24 mountains (sectors of 15 degrees) of the compass. */
export interface Mountain {
  /** 1 (Zi, due north) to 24, clockwise. */
  index: number;
  /** Lowercase pinyin, e.g. "zi", "xun". */
  id: string;
  /** Name in `lang` / `terms`. */
  name: string;
  pinyin: string;
  han: string;
  nameVi: string;
  kind: MountainKind;
  direction: DirectionId;
  directionName: string;
  /** Trigram governing the 45 degree direction the mountain lies in. */
  trigram: TrigramId;
  trigramName: string;
  /** Element of that trigram (palace element), in `lang`. */
  trigramElement: string;
  /** Start of the sector, degrees (Zi starts at 352.5 and wraps through 0). */
  from: number;
  /** End of the sector, degrees (exclusive). */
  to: number;
  /** Middle of the sector, degrees. */
  center: number;
  /** Three Cycles dragon (Tam Nguyên Long): earth, heaven or human. */
  dragon: "earth" | "heaven" | "human";
  /** Yin or yang as the Xuan Kong flying star school (Shen) assigns it; other schools differ. */
  xuanKongPolarity: "yang" | "yin";
}

const DRAGON = { "Địa": "earth", "Thiên": "heaven", "Nhân": "human" } as const;

function tenSon(vi: string, terms: Terms): { name: string; pinyin: string; han: string } {
  let i = THIEN_CAN.indexOf(vi);
  let pinyin: string;
  if (i >= 0) pinyin = STEM_PINYIN[i];
  else {
    i = DIA_CHI.indexOf(vi);
    pinyin = i >= 0 ? BRANCH_PINYIN[i] : (TU_VUNG[vi] as readonly [string, string])[0];
  }
  return { name: theoTerms(terms, vi, pinyin, han(vi)), pinyin, han: han(vi) };
}

function mountainFrom(s: SonHuong, lang: Lang, terms: Terms): Mountain {
  const t = tenSon(s.ten, terms);
  const i = huongIndex(s.huong);
  const q = allBatQuai().find((x) => x.ten === s.quai);
  return {
    index: s.so,
    id: t.pinyin.toLowerCase(),
    name: t.name,
    pinyin: t.pinyin,
    han: t.han,
    nameVi: s.ten,
    kind: s.loai === "Thiên Can" ? "stem" : s.loai === "Địa Chi" ? "branch" : "trigram",
    direction: DIRECTIONS[i],
    directionName: directionName(i, lang),
    trigram: (q?.tenEn.toLowerCase() ?? "") as TrigramId,
    trigramName: theoTerms(terms, s.quai, q?.tenEn ?? "", han(s.quai)),
    trigramElement: elementName(q?.nguHanh ?? "", lang),
    from: s.tuDo,
    to: s.denDo,
    center: (s.so - 1) * 15,
    dragon: DRAGON[s.nguyenLong],
    xuanKongPolarity: laDuongHK(SO_NHA_QUAI[s.quai], viTriNguyenLong(s.nguyenLong)) ? "yang" : "yin",
  };
}

/** The 24 mountains in compass order, from Zi (due north). */
export function mountains24(options?: NameOptions): Mountain[] {
  const { lang, terms } = opts(options);
  return allSonHuong().map((s) => mountainFrom(s, lang, terms));
}

/**
 * The mountain containing a compass bearing in degrees (any real number; it
 * is normalised to 0 to 360). Each sector includes its lower edge: 7.5 is Gui,
 * 7.4999 is Zi.
 */
export function mountainAt(degrees: number, options?: NameOptions): Mountain {
  if (typeof degrees !== "number" || !Number.isFinite(degrees)) throw new TypeError("degrees must be a finite number");
  const { lang, terms } = opts(options);
  return mountainFrom(sonHuongTheoDo(degrees), lang, terms);
}

function chuanChu(s: string): string {
  return s.normalize("NFC").trim();
}

/**
 * Find a mountain by bearing (number, degrees) or by name: pinyin id ("zi",
 * "Xun"), Vietnamese ("Tý", "Tốn") or Chinese character ("子", "巽"). Throws
 * a RangeError for an unknown name.
 */
export function findMountain(m: number | string, options?: NameOptions): Mountain {
  if (typeof m === "number") return mountainAt(m, options);
  if (typeof m !== "string") throw new TypeError("mountain must be a bearing in degrees or a name");
  const { lang, terms } = opts(options);
  const k = chuanChu(m);
  const kl = k.toLowerCase();
  for (const s of allSonHuong()) {
    const t = tenSon(s.ten, "pinyin");
    if (t.pinyin.toLowerCase() === kl || s.ten === k || t.han === k) return mountainFrom(s, lang, terms);
  }
  throw new RangeError(`unknown mountain ${JSON.stringify(m)}: use a bearing in degrees, a pinyin id ("zi"), Vietnamese ("Tý") or Chinese ("子")`);
}

// ── Eight Mansions ──────────────────────────────────────────────────────

/** The eight wandering stars (du niên) of the Eight Mansions school. */
export type StarId = "sheng-qi" | "tian-yi" | "yan-nian" | "fu-wei" | "huo-hai" | "liu-sha" | "wu-gui" | "jue-ming";

const STAR_ID: Readonly<Record<LoaiSao, StarId>> = {
  sinh_khi: "sheng-qi", thien_y: "tian-yi", dien_nien: "yan-nian", phuc_vi: "fu-wei",
  hoa_hai: "huo-hai", luc_sat: "liu-sha", ngu_quy: "wu-gui", tuyet_menh: "jue-ming",
};

/** Literal English gloss of each star name (what the characters say, not a prediction). */
export const STAR_GLOSS: Readonly<Record<StarId, string>> = {
  "sheng-qi": "Generating Qi",
  "tian-yi": "Heavenly Doctor",
  "yan-nian": "Extended Years",
  "fu-wei": "Hidden Position",
  "huo-hai": "Mishap",
  "liu-sha": "Six Shas",
  "wu-gui": "Five Ghosts",
  "jue-ming": "Severed Life",
};

/** One direction with its Eight Mansions star. */
export interface DirectionStar {
  direction: DirectionId;
  directionName: string;
  /** Start of the 45 degree sector (north runs 337.5 to 22.5). */
  from: number;
  to: number;
  /** Ids of the three mountains in the sector. */
  mountains: string[];
  star: StarId;
  /** Star name in `lang` / `terms`. */
  starName: string;
  pinyin: string;
  han: string;
  nameVi: string;
  /** Literal English gloss of the name. */
  gloss: string;
  /** The school counts the star among its four favourable stars. */
  favorable: boolean;
}

function sonCuaHuong(i: number): string[] {
  return [TEN_SON[(3 * i + 23) % 24], TEN_SON[3 * i], TEN_SON[3 * i + 1]].map((v) => tenSon(v, "pinyin").pinyin.toLowerCase());
}

function directionStars(kua: number, lang: Lang, terms: Terms): DirectionStar[] {
  const bang = BAT_TRACH[kua];
  if (!bang) throw new RangeError("gua number must be 1 to 9 except 5");
  return [...SAO_TOT, ...SAO_XAU].map((s) => {
    const i = huongIndex(bang[s]);
    const t = SAO_BAT_TRACH[s];
    const id = STAR_ID[s];
    return {
      direction: DIRECTIONS[i],
      directionName: directionName(i, lang),
      from: (i * 45 + 337.5) % 360,
      to: i * 45 + 22.5,
      mountains: sonCuaHuong(i),
      star: id,
      starName: theoTerms(terms, t[0], t[1], t[2]),
      pinyin: t[1],
      han: t[2],
      nameVi: t[0],
      gloss: STAR_GLOSS[id],
      favorable: t[3],
    };
  });
}

/**
 * The eight directions of a gua number (1 to 9 except 5, or any object with a
 * `number`, such as a `lifeGua` or `houseGua` result), in the engine's order:
 * the four favourable stars from Sheng Qi to Fu Wei, then the four
 * unfavourable ones from Huo Hai to Jue Ming.
 */
export function eightDirections(gua: number | { number: number }, options?: NameOptions): DirectionStar[] {
  const { lang, terms } = opts(options);
  const n = typeof gua === "number" ? gua : gua?.number;
  if (!Number.isInteger(n)) throw new TypeError("gua must be a number 1 to 9 (not 5) or an object with `number`");
  return directionStars(n, lang, terms);
}

/** East group (Kan, Zhen, Xun, Li) or west group (Qian, Kun, Gen, Dui). */
export type Group = "east" | "west";

const GROUP_NAME: Readonly<Record<Group, Readonly<Record<Lang, string>>>> = {
  east: { vi: "Đông tứ mệnh", en: "East group", zh: "东四命" },
  west: { vi: "Tây tứ mệnh", en: "West group", zh: "西四命" },
};
const HOUSE_GROUP_NAME: Readonly<Record<Group, Readonly<Record<Lang, string>>>> = {
  east: { vi: "Đông tứ trạch", en: "East group", zh: "东四宅" },
  west: { vi: "Tây tứ trạch", en: "West group", zh: "西四宅" },
};

/** Gender accepted by `lifeGua`. */
export type Gender = "male" | "female";

function checkGender(g: unknown): Gender {
  if (g === "male" || g === "Male" || g === "m" || g === "M" || g === "Nam" || g === "nam") return "male";
  if (g === "female" || g === "Female" || g === "f" || g === "F" || g === "Nữ" || g === "nữ" || g === "Nu" || g === "nu") return "female";
  throw new TypeError(`gender must be "male" or "female", got ${JSON.stringify(g)}`);
}

/** Result of `lifeGua`. */
export interface LifeGua {
  /** "YYYY-MM-DD", or null when a lunar year was passed. */
  birthDate: string | null;
  /** Lunar year the gua is computed from. */
  lunarYear: number;
  /** The engine starts the year at the lunar New Year (Tết), Vietnam time (UTC+7). */
  yearBoundary: "lunar-new-year";
  gender: Gender;
  /** Kua number 1 to 9; 5 never appears (male 5 becomes 2, female 5 becomes 8). */
  number: number;
  trigram: Trigram;
  group: Group;
  groupName: string;
  /** Element of the trigram, in `lang`. */
  element: string;
  directions: DirectionStar[];
  /** Present when the Gregorian birth year is not the lunar year. */
  note?: string;
}

/**
 * Eight Mansions life gua (Kua number) of a person: trigram, east or west
 * group, element and the eight directions. `birth` is a date (the lunar year
 * is taken from it, the year turning at the lunar New Year as the engine
 * does) or a lunar year number (pass the year you want if you follow books
 * that turn the year at the Start of Spring).
 *
 * @example lifeGua("1990-09-19", "female").number // 5 -> 8 (Gen)
 */
export function lifeGua(birth: DateInput | number, gender: Gender | string, options?: NameOptions): LifeGua {
  const { lang, terms } = opts(options);
  const g = checkGender(gender);
  let lunarYear: number;
  let birthDate: string | null = null;
  let gregYear = 0;
  if (typeof birth === "number") {
    if (!Number.isInteger(birth)) throw new TypeError("a lunar year must be an integer");
    checkYear(birth, `lunar year ${birth}`);
    lunarYear = birth;
  } else {
    const d = parseDate(birth);
    checkYear(d.year, `date ${formatDate(d)}`);
    birthDate = formatDate(d);
    gregYear = d.year;
    lunarYear = solarToLunar(d.day, d.month, d.year, 7).year;
  }
  const kua = kuaNumber(lunarYear, g === "male" ? "Nam" : "Nữ");
  const group: Group = kuaGroup(kua) === "dong_tu_menh" ? "east" : "west";
  const tri = trigram(TAM_HUONG.find((h) => SO_NHA_QUAI[h[3]] === kua)![3], lang, terms);
  const r: LifeGua = {
    birthDate, lunarYear, yearBoundary: "lunar-new-year", gender: g, number: kua, trigram: tri,
    group, groupName: GROUP_NAME[group][lang], element: tri.element, directions: directionStars(kua, lang, terms),
  };
  if (birthDate && gregYear !== lunarYear) {
    r.note = lang === "vi"
      ? `Sinh trước Tết nên năm âm lịch là ${lunarYear}.`
      : lang === "en"
        ? `Born before the lunar New Year, so the lunar year is ${lunarYear}.`
        : `生于春节之前，故农历年为 ${lunarYear} 年。`;
  }
  return r;
}

/** Result of `houseGua`. */
export interface HouseGua {
  sitting: Mountain;
  facing: Mountain;
  /** Number of the sitting trigram (the house trigram). */
  number: number;
  trigram: Trigram;
  group: Group;
  groupName: string;
  directions: DirectionStar[];
}

/** Where a house faces or sits: a bearing in degrees or a mountain name. */
export interface Orientation {
  /** Facing bearing (degrees) or facing mountain. */
  facing?: number | string;
  /** Sitting bearing (degrees) or sitting mountain; the opposite of facing. */
  sitting?: number | string;
}

function toaHuong(o: Orientation): SonHuong {
  if (!o || typeof o !== "object") throw new TypeError("give { facing } or { sitting }");
  const coF = o.facing !== undefined && o.facing !== null;
  const coS = o.sitting !== undefined && o.sitting !== null;
  if (coF === coS) throw new TypeError("give exactly one of facing or sitting");
  const m = findMountain((coF ? o.facing : o.sitting) as number | string, { lang: "vi" });
  const ds = allSonHuong();
  const i = m.index - 1;
  return coF ? ds[(i + 12) % 24] : ds[i];
}

/**
 * Eight Mansions house gua: the trigram of the SITTING side (the back of the
 * house), as the engine reads it, with its eight directions.
 *
 * @example houseGua({ facing: 180 }).trigram.pinyin // "Kan" (sits north)
 */
export function houseGua(orientation: Orientation, options?: NameOptions): HouseGua {
  const { lang, terms } = opts(options);
  const sToa = toaHuong(orientation);
  const ds = allSonHuong();
  const sHuong = ds[(sToa.so - 1 + 12) % 24];
  const kua = SO_NHA_QUAI[sToa.quai];
  const group: Group = kuaGroup(kua) === "dong_tu_menh" ? "east" : "west";
  return {
    sitting: mountainFrom(sToa, lang, terms),
    facing: mountainFrom(sHuong, lang, terms),
    number: kua,
    trigram: trigram(sToa.quai, lang, terms),
    group,
    groupName: HOUSE_GROUP_NAME[group][lang],
    directions: directionStars(kua, lang, terms),
  };
}

// ── Xuan Kong flying stars ──────────────────────────────────────────────

/** One of the nine stars of Xuan Kong. */
export interface NineStar {
  number: number;
  /** Name in `lang`: "One White", 一白, Nhất Bạch. */
  name: string;
  han: string;
  nameVi: string;
  element: string;
}

function nineStar(n: number, lang: Lang): NineStar {
  const vi = TEN_CUU_TINH[n];
  const t = TU_VUNG[vi] as readonly [string, string];
  return { number: n, name: lang === "vi" ? vi : lang === "en" ? t[0] : t[1], han: t[1], nameVi: vi, element: elementName(HANH_CUU_TINH[n], lang) };
}

/** The nine stars 1 to 9 with their names and elements. */
export function nineStars(options?: NameOptions): NineStar[] {
  const { lang } = opts(options);
  return [1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => nineStar(n, lang));
}

/** Role of a star in a period (the common five-way split; see docs). */
export type QiId = "prosperous" | "growing" | "retreating" | "killing" | "dead";

const QI: readonly (readonly [string, QiId, string, string])[] = [
  [KHI.vuong, "prosperous", "Prosperous", "旺气"],
  [KHI.sinh, "growing", "Growing", "生气"],
  [KHI.thoai, "retreating", "Retreating", "退气"],
  [KHI.sat, "killing", "Killing", "煞气"],
  [KHI.tu, "dead", "Dead", "死气"],
];

/**
 * Role of star `star` (1 to 9) in period `period` (1 to 9): prosperous (the
 * period star), growing (the next two), retreating (the last one), killing,
 * dead. This is the split the engine uses; some books count only one growing
 * star or call Five Yellow killing in every period.
 */
export function starQi(period: number, star: number, options?: NameOptions): { qi: QiId; name: string } {
  const { lang } = opts(options);
  if (!Number.isInteger(period) || period < 1 || period > 9) throw new RangeError("period must be 1 to 9");
  if (!Number.isInteger(star) || star < 1 || star > 9) throw new RangeError("star must be 1 to 9");
  const q = QI.find((x) => x[0] === khiCuaSao(period, star))!;
  return { qi: q[1], name: lang === "vi" ? q[0] : lang === "en" ? q[2] : q[3] };
}

/** One 20-year period of the Three Cycles (San Yuan). */
export interface Period {
  period: number;
  era: "upper" | "middle" | "lower";
  eraName: string;
  /** First and last year, years counted from the Start of Spring (about 4 February). */
  from: number;
  to: number;
  star: NineStar;
  /** Lo Shu palace of the period number (Zheng Shen); null in period 5. */
  zhengShenPalace: number | null;
  /** The opposite palace (Ling Shen); null in period 5. */
  lingShenPalace: number | null;
}

const ERA = ["upper", "middle", "lower"] as const;

function periodFrom(v: ReturnType<typeof vanCuaNam>, lang: Lang): Period {
  return {
    period: v.so,
    era: ERA[Math.trunc((v.so - 1) / 3)],
    eraName: lang === "vi" ? v.nguyen : lang === "en" ? v.nguyenEn : v.nguyenZh,
    from: v.tuNam,
    to: v.denNam,
    star: nineStar(v.so, lang),
    zhengShenPalace: v.chinhThan || null,
    lingShenPalace: v.linhThan || null,
  };
}

/**
 * The period (1 to 9) a year belongs to. Years count from the Start of Spring
 * (Lập Xuân, about 4 February): a date in January or early February belongs
 * to the previous year. Period 9 runs 2024 to 2043.
 */
export function periodOf(year: number, options?: NameOptions): Period {
  const { lang } = opts(options);
  if (!Number.isInteger(year)) throw new TypeError("year must be an integer");
  checkYear(year);
  return periodFrom(vanCuaNam(year), lang);
}

/** The nine periods of the 180-year cycle containing `year`. */
export function periods(year: number, options?: NameOptions): Period[] {
  const { lang } = opts(options);
  if (!Number.isInteger(year)) throw new TypeError("year must be an integer");
  checkYear(year);
  return chinVan(year).map((v) => periodFrom(v, lang));
}

/** Chart patterns the engine names (read from where the period star lands). */
export type PatternId = "prosperous-sitting-facing" | "reversed" | "double-facing" | "double-sitting";

const PATTERN: readonly (readonly [string, PatternId, string, string])[] = [
  [CACH_HK.vuongSonVuongHuong, "prosperous-sitting-facing", "Prosperous Sitting and Facing", "旺山旺向"],
  [CACH_HK.thuongSonHaThuy, "reversed", "Up the Mountain, Down the Water", "上山下水"],
  [CACH_HK.songTinhDaoHuong, "double-facing", "Double Stars at Facing", "双星到向"],
  [CACH_HK.songTinhDaoToa, "double-sitting", "Double Stars at Sitting", "双星到坐"],
];

/** One palace of a flying star chart. */
export interface FlyingStarPalace {
  /** Lo Shu number of the palace: 1 north, 9 south, 5 center. */
  palace: number;
  direction: DirectionId | "center";
  directionName: string;
  trigram: TrigramId | null;
  /** Period (base) star. */
  base: number;
  /** Mountain (sitting) star. */
  mountain: number;
  /** Facing (water) star. */
  facing: number;
  /** Role of each star in the chart's period. */
  qi: { base: QiId; mountain: QiId; facing: QiId };
}

/** A castle gate (thành môn) candidate beside the facing palace. */
export interface CastleGate {
  palace: number;
  direction: DirectionId;
  /** The primary gate (its number pairs with the facing palace in the He Tu). */
  primary: boolean;
  /** Base star of that palace, flown from the center for the test. */
  baseStar: number;
  forward: boolean;
  /** The star that lands back on the palace. */
  arrivingStar: number;
  /** The period star lands there: the gate can be used. */
  usable: boolean;
}

/** Result of `flyingStarChart`. */
export interface FlyingStarChart {
  period: number;
  /** The year given, or null when the period was given. */
  year: number | null;
  sitting: Mountain;
  facing: Mountain;
  sittingPalace: number;
  facingPalace: number;
  mountainStarForward: boolean;
  facingStarForward: boolean;
  pattern: PatternId | null;
  patternName: string | null;
  /** Palaces 1 to 9 in Lo Shu order. */
  palaces: FlyingStarPalace[];
  /** Palace numbers as drawn in the books, south on top: [[4, 9, 2], [3, 5, 7], [8, 1, 6]]. */
  grid: number[][];
  castleGates: CastleGate[];
  /** Replacement stars (替卦) for houses facing near a mountain edge are not computed. */
  replacementStars: false;
}

/** Palace numbers as drawn with south on top. */
export const LO_SHU_GRID: readonly (readonly number[])[] = [[4, 9, 2], [3, 5, 7], [8, 1, 6]];

function cungInfo(c: number, lang: Lang): { direction: DirectionId | "center"; directionName: string; trigram: TrigramId | null } {
  const [quai, huong] = CUNG_LAC_THU[c];
  if (!quai) return { direction: "center", directionName: CENTER_NAME[lang], trigram: null };
  const i = huongIndex(huong);
  const q = allBatQuai().find((x) => x.ten === quai)!;
  return { direction: DIRECTIONS[i], directionName: directionName(i, lang), trigram: q.tenEn.toLowerCase() as TrigramId };
}

/** Input of `flyingStarChart`: a period or a year, and a facing or sitting. */
export interface FlyingStarInput extends Orientation {
  /** Period 1 to 9. */
  period?: number;
  /** A year (counted from the Start of Spring); its period is used. */
  year?: number;
}

/**
 * Xuan Kong flying star chart of a house: base (period), mountain and facing
 * stars in the nine palaces, by the Shen school's rules for the "lower
 * trigram" (the plain facing). Houses whose facing is within about 3 degrees
 * of a mountain edge are read with replacement stars in many books; this
 * engine does not compute them.
 *
 * @example flyingStarChart({ period: 9, facing: "wu" }).palaces[8] // palace 9 (south)
 */
export function flyingStarChart(input: FlyingStarInput, options?: NameOptions): FlyingStarChart {
  const { lang, terms } = opts(options);
  if (!input || typeof input !== "object") throw new TypeError("give { period or year, facing or sitting }");
  const coP = input.period !== undefined && input.period !== null;
  const coY = input.year !== undefined && input.year !== null;
  if (coP === coY) throw new TypeError("give exactly one of period or year");
  let period: number;
  let year: number | null = null;
  if (coY) {
    if (!Number.isInteger(input.year)) throw new TypeError("year must be an integer");
    checkYear(input.year as number);
    year = input.year as number;
    period = vanCuaNam(year).so;
  } else {
    period = input.period as number;
    if (!Number.isInteger(period) || period < 1 || period > 9) throw new RangeError("period must be an integer 1 to 9");
  }
  const sToa = toaHuong(input);
  const tb = lapTinhBanHK(period, sToa.ten);
  const ds = allSonHuong();
  const sHuong = ds.find((s) => s.ten === tb.huong)!;
  const qi = (s: number) => QI.find((x) => x[0] === khiCuaSao(period, s))![1];
  const palaces: FlyingStarPalace[] = [];
  for (let c = 1; c <= 9; c++) {
    palaces.push({
      palace: c, ...cungInfo(c, lang),
      base: tb.vanBan[c], mountain: tb.sonTinh[c], facing: tb.huongTinh[c],
      qi: { base: qi(tb.vanBan[c]), mountain: qi(tb.sonTinh[c]), facing: qi(tb.huongTinh[c]) },
    });
  }
  const p = PATTERN.find((x) => x[0] === tb.cach);
  const tm = thanhMon(period, sToa.ten);
  return {
    period, year,
    sitting: mountainFrom(sToa, lang, terms),
    facing: mountainFrom(sHuong, lang, terms),
    sittingPalace: tb.cungToa,
    facingPalace: tb.cungHuong,
    mountainStarForward: tb.sonTinh[6] === (tb.sonTinh[5] % 9) + 1,
    facingStarForward: tb.huongTinh[6] === (tb.huongTinh[5] % 9) + 1,
    pattern: p ? p[1] : null,
    patternName: p ? (lang === "vi" ? p[0] : lang === "en" ? p[2] : p[3]) : null,
    palaces,
    grid: LO_SHU_GRID.map((r) => [...r]),
    castleGates: tm.cung.map((g) => ({
      palace: g.cung, direction: cungInfo(g.cung, lang).direction as DirectionId, primary: g.laChinh,
      baseStar: g.soVanBan, forward: g.thuan, arrivingStar: g.saoDen, usable: g.dungDuoc,
    })),
    replacementStars: false,
  };
}

/** One palace of the annual stars. */
export interface AnnualPalace {
  palace: number;
  direction: DirectionId | "center";
  directionName: string;
  star: number;
}

/** Result of `annualStars`. */
export interface AnnualStars {
  year: number;
  /** The year counts from the Start of Spring (Lập Xuân, about 4 February). */
  yearBoundary: "start-of-spring";
  /** Star in the center palace. */
  center: number;
  /** Palaces 1 to 9 in Lo Shu order. */
  palaces: AnnualPalace[];
}

/**
 * Annual flying stars (lưu niên): the center star of the year (2026 is One
 * White, each year one less) flown forward through the nine palaces. The
 * engine has no monthly stars.
 */
export function annualStars(year: number, options?: NameOptions): AnnualStars {
  const { lang } = opts(options);
  if (!Number.isInteger(year)) throw new TypeError("year must be an integer");
  checkYear(year);
  const p = phiTinhNam(year);
  const palaces: AnnualPalace[] = [];
  for (let c = 1; c <= 9; c++) {
    const i = cungInfo(c, lang);
    palaces.push({ palace: c, direction: i.direction, directionName: i.directionName, star: p.sao[c] });
  }
  return { year, yearBoundary: "start-of-spring", center: p.saoTrung, palaces };
}

// ── Luban rulers ────────────────────────────────────────────────────────

/** The three rulers: 52.2 cm (clear openings), 42.9 cm (solid pieces), 38.8 cm (altars and graves). */
export type RulerId = "clear-opening" | "luban" | "dinglan";

const RULER: Readonly<Record<RulerId, string>> = { "clear-opening": "THONG_THUY", luban: "DUONG_TRACH", dinglan: "AM_PHAN" };
const RULER_ALIAS: Readonly<Record<string, RulerId>> = {
  "clear-opening": "clear-opening", "52.2": "clear-opening", luban: "luban", "42.9": "luban", dinglan: "dinglan", "38.8": "dinglan",
};

function checkRuler(r: unknown): RulerId {
  if (r === undefined || r === null) return "luban";
  const id = RULER_ALIAS[String(r)];
  if (!id) throw new TypeError(`ruler must be "clear-opening" (52.2), "luban" (42.9) or "dinglan" (38.8), got ${JSON.stringify(r)}`);
  return id;
}

/** One sector of a Luban ruler. */
export interface LubanSector {
  /** 0-based position on the ruler. */
  index: number;
  /** Name in `lang` / `terms`. */
  name: string;
  pinyin: string;
  /** Characters as engraved (traditional). */
  han: string;
  /** Simplified characters. */
  nameZh: string;
  nameVi: string;
  /** The ruler puts the sector in its good group. */
  auspicious: boolean;
  /** What the characters mean, in `lang`. */
  meaning: string;
}

/** A sub-sector name (the 52.2 cm and 42.9 cm rulers split each sector into four or five). */
export interface LubanSubSector {
  /** Name in `lang` / `terms`: pinyin by default in English, like the sectors. */
  name: string;
  pinyin: string;
  /** Short literal English translation of the characters, e.g. "Quarrels" for 口舌. */
  nameEn: string;
  nameVi: string;
  /** Simplified characters. */
  nameZh: string;
}

function sectorOf(b: NonNullable<ReturnType<typeof bangThuoc>>, idx: number, lang: Lang, terms: Terms): LubanSector {
  const c = b.cung[idx];
  return {
    index: idx, name: theoTerms(terms, c[0], c[2], c[3]), pinyin: c[2], han: c[1], nameZh: c[3], nameVi: c[0], auspicious: c[4],
    meaning: lang === "vi" ? c[5] : lang === "en" ? c[6] : c[7],
  };
}

function subOf(vi: string | undefined, zh: string | undefined, terms: Terms): LubanSubSector | null {
  if (!vi) return null;
  const t = TEN_CUNG_NHO[vi];
  if (!t) throw new Error("missing sub-sector name: " + vi);
  return { name: theoTerms(terms, vi, t[0], zh as string), pinyin: t[0], nameEn: t[1], nameVi: vi, nameZh: zh as string };
}

/** Result of `lubanRuler`. */
export interface LubanResult {
  lengthMm: number;
  lengthCm: number;
  ruler: RulerId;
  rulerName: string;
  cycleMm: number;
  /** What the ruler is used for, in `lang`. */
  use: string;
  /** Which repeat of the ruler the length reaches (1 = first). */
  cycle: number;
  /** Position inside that repeat, mm (rounded to 0.1). */
  positionMm: number;
  sector: LubanSector;
  subSector: LubanSubSector | null;
  auspicious: boolean;
  /** For a length in a bad sector: the nearest lengths in a good sector, below then above. */
  nearestAuspicious: { lengthMm: number; lengthCm: number; offsetMm: number; sector: string; subSector: LubanSubSector | null }[];
}

/** Options of `lubanRuler`. */
export interface LubanOptions extends NameOptions {
  /** "luban" (42.9 cm, default), "clear-opening" (52.2 cm) or "dinglan" (38.8 cm). */
  ruler?: RulerId | "52.2" | "42.9" | "38.8";
  /** Unit of `length`: "cm" (default) or "mm". */
  unit?: "cm" | "mm";
}

/**
 * Read a length on a Luban ruler as the ruler in common use in Vietnam
 * divides it (equal sectors; a length exactly on an edge belongs to the upper
 * sector). The length is rounded to 0.1 mm.
 *
 * @example lubanRuler(82, { ruler: "clear-opening" }).sector.pinyin
 */
export function lubanRuler(length: number, options?: LubanOptions): LubanResult {
  const { lang, terms } = opts(options);
  const ruler = checkRuler(options?.ruler);
  const unit = options?.unit ?? "cm";
  if (unit !== "cm" && unit !== "mm") throw new TypeError(`unit must be "cm" or "mm", got ${JSON.stringify(unit)}`);
  if (typeof length !== "number" || !Number.isFinite(length) || length <= 0) throw new RangeError("length must be a positive number");
  const mm = Math.floor(length * (unit === "cm" ? 100 : 10) + 0.5) / 10;
  if (!(mm > 0)) throw new RangeError("length rounds to 0 mm");
  const b = bangThuoc(RULER[ruler])!;
  const k = traLoBan(mm, b.loai);
  const idx = b.cung.findIndex((c) => c[0] === k.cung);
  return {
    lengthMm: mm,
    lengthCm: mm / 10,
    ruler,
    rulerName: lang === "vi" ? b.ten : lang === "en" ? b.tenEn : b.tenZh,
    cycleMm: b.doDaiMm,
    use: lang === "vi" ? b.dungDe : lang === "en" ? b.dungDeEn : b.dungDeZh,
    cycle: k.chuKyThu,
    positionMm: k.viTriMm,
    sector: sectorOf(b, idx, lang, terms),
    subSector: subOf(k.cungNho, k.cungNhoZh, terms),
    auspicious: k.tot,
    nearestAuspicious: (k.ganNhatTot ?? []).map((g) => ({
      lengthMm: g.mm,
      lengthCm: g.cm,
      offsetMm: g.lechMm ?? 0,
      sector: theoTerms(terms, g.cung, g.cungEn, g.cungZh),
      subSector: subOf(g.cungNho, g.cungNhoZh, terms),
    })),
  };
}

/** One ruler with all its sectors. */
export interface LubanRulerInfo {
  ruler: RulerId;
  name: string;
  lengthMm: number;
  use: string;
  sectors: (LubanSector & { subSectors: LubanSubSector[] })[];
}

/** The three rulers and their sectors. */
export function lubanRulers(options?: NameOptions): LubanRulerInfo[] {
  const { lang, terms } = opts(options);
  return (Object.keys(RULER) as RulerId[]).map((id) => {
    const b = BANG_THUOC.find((x) => x.loai === RULER[id])!;
    return {
      ruler: id,
      name: lang === "vi" ? b.ten : lang === "en" ? b.tenEn : b.tenZh,
      lengthMm: b.doDaiMm,
      use: lang === "vi" ? b.dungDe : lang === "en" ? b.dungDeEn : b.dungDeZh,
      sectors: b.cung.map((c, i) => ({
        ...sectorOf(b, i, lang, terms),
        subSectors: c[8].map((vi, j) => subOf(vi, c[9][j], terms) as LubanSubSector),
      })),
    };
  });
}
