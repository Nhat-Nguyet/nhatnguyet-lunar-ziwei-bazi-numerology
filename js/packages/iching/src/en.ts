// Lớp API tiếng Anh của gói Kinh Dịch: tên tiếng Anh, tùy chọn có tên
// (`lang`, `terms`), đối tượng gốc của lớp lõi ở `raw`. Bản Python
// `nhatnguyet.iching` trả đúng các khoá và giá trị này.

import {
  TIET_KHI_TABLE,
  checkLang,
  checkTerms,
  elementName,
  formatDate,
  parseDateInRange,
  stemBranchName,
  term,
  termName,
} from "@nhatnguyet/am-lich";
import type { DateInput, Lang, Terms } from "@nhatnguyet/am-lich";
import { QUAI, TEN_QUE, VAI_TRO_QUAI_KHI, VI_TRI_CUNG } from "./data.ts";
import {
  gieoTho,
  haoQue,
  kiemGieo,
  maiHoaTho,
  najiaTho,
  queNgayTho,
  queTho,
  quaiTho,
  soQueTuHao,
  tenVietQue,
} from "./core.ts";

export type { DateInput, Lang, Terms } from "@nhatnguyet/am-lich";

/** Options shared by every function: language of names, and how stems and branches are written in English. */
export interface NameOptions {
  /** "en" (default), "vi" or "zh". */
  lang?: Lang;
  /** With lang "en": "pinyin" (default), "han" or "vi" for stems, branches and trigram names. */
  terms?: Terms;
}

/**
 * A hexagram: its King Wen number (1 to 64), six lines (bottom line first,
 * `true` = yang), a binary string of the same lines ("111111" = Qian), a
 * name, a Hexagram object (anything with `number`), or the six coin values
 * 6, 7, 8, 9 (the primary hexagram is used).
 */
export type HexagramInput = number | string | readonly (boolean | number)[] | { readonly number: number };

/** A trigram (one of the eight). `number` is the Fu Xi (Earlier Heaven) order: 1 Qian ... 8 Kun. */
export interface Trigram {
  number: number;
  name: string;
  nameVi: string;
  nameHan: string;
  pinyin: string;
  symbol: string;
  /** Bottom line first, true = yang. */
  lines: boolean[];
  /** The natural image: Heaven, Lake, Fire, Thunder, Wind, Water, Mountain, Earth. */
  image: string;
  element: string;
  /** Direction in the Later Heaven (King Wen) arrangement. */
  direction: string;
}

/** The palace of a hexagram in the Eight Palaces (Jing Fang) order. */
export interface Palace {
  /** Trigram number of the palace (Fu Xi order). */
  number: number;
  name: string;
  element: string;
  /** 0 Pure, 1 to 5 first to fifth generation, 6 Wandering soul, 7 Returning soul. */
  generation: number;
  generationName: string;
}

/** One of the 64 hexagrams. */
export interface Hexagram {
  number: number;
  /** Unicode hexagram symbol (U+4DC0 to U+4DFF, King Wen order). */
  symbol: string;
  /** In `lang`: English name, Vietnamese name, or Chinese characters (simplified). */
  name: string;
  nameEn: string;
  nameVi: string;
  /** Traditional characters, as printed in the classic. */
  nameHan: string;
  nameZh: string;
  /** Pinyin with tone marks. */
  pinyin: string;
  /** Bottom line first, true = yang. */
  lines: boolean[];
  /** The same lines as "0"/"1", bottom line first. */
  binary: string;
  upper: Trigram;
  lower: Trigram;
  palace: Palace;
  /** World (Shi) line, 1 to 6. */
  world: number;
  /** Response (Ying) line, 1 to 6. */
  response: number;
  lang: Lang;
  raw: ReturnType<typeof queTho>;
}

const TUONG_ZH: readonly string[] = ["", "天", "泽", "火", "雷", "风", "水", "山", "地"];
const PHUONG_ZH: readonly string[] = ["", "西北", "西", "南", "东", "东南", "北", "东北", "西南"];

function opts(o: NameOptions | undefined): { lang: Lang; terms: Terms } {
  const lang = checkLang(o?.lang);
  return { lang, terms: checkTerms(o?.terms, lang) };
}

function tenQuai(so: number, lang: Lang, terms: Terms): string {
  const q = QUAI[so];
  if (lang === "vi" || terms === "vi") return q[0];
  if (lang === "zh" || terms === "han") return q[3];
  return q[1];
}

function trigramOf(so: number, lang: Lang, terms: Terms): Trigram {
  const r = quaiTho(so);
  return {
    number: so,
    name: tenQuai(so, lang, terms),
    nameVi: r.nameVi,
    nameHan: r.nameHan,
    pinyin: r.pinyin,
    symbol: r.symbol,
    lines: r.lines,
    image: lang === "vi" ? r.imageVi : lang === "en" ? r.imageEn : TUONG_ZH[so],
    element: elementName(r.element, lang),
    direction: lang === "vi" ? r.direction : lang === "en" ? r.directionEn : PHUONG_ZH[so],
  };
}

/** A trigram returned by `trigram()`: the core object in `raw`. */
export interface TrigramResult extends Trigram {
  lang: Lang;
  raw: ReturnType<typeof quaiTho>;
}

/** One of the eight trigrams, by number (1 to 8, Fu Xi order), name or three lines (bottom first). */
export function trigram(input: number | string | readonly (boolean | number)[], o?: NameOptions): TrigramResult {
  const { lang, terms } = opts(o);
  let so = 0;
  if (typeof input === "number") so = Number.isInteger(input) && input >= 1 && input <= 8 ? input : 0;
  else if (Array.isArray(input)) {
    if (input.length === 3 && input.every((x) => x === true || x === false || x === 0 || x === 1)) {
      const h = input.map((x) => x === true || x === 1);
      so = 8 - ((h[0] ? 4 : 0) + (h[1] ? 2 : 0) + (h[2] ? 1 : 0));
    }
  } else if (typeof input === "string") {
    const k = gon(input);
    for (let i = 1; i <= 8; i++) {
      const q = QUAI[i];
      if ([q[0], q[1], q[2], q[3], q[4], q[8]].some((x) => gon(x) === k)) so = i;
    }
  }
  if (!so) throw new RangeError(`no such trigram: ${JSON.stringify(input)}`);
  return { ...trigramOf(so, lang, terms), lang, raw: quaiTho(so) };
}

function hexagramOf(so: number, lang: Lang, terms: Terms): Hexagram {
  const r = queTho(so);
  const ten = lang === "vi" ? r.nameVi : lang === "en" ? r.nameEn : r.nameZh;
  return {
    number: so,
    symbol: r.symbol,
    name: ten,
    nameEn: r.nameEn,
    nameVi: r.nameVi,
    nameHan: r.nameHan,
    nameZh: r.nameZh,
    pinyin: r.pinyin,
    lines: [...r.lines],
    binary: r.binary,
    upper: trigramOf(r.upper, lang, terms),
    lower: trigramOf(r.lower, lang, terms),
    palace: {
      number: r.palace,
      name: tenQuai(r.palace, lang, terms),
      element: elementName(r.palaceElement, lang),
      generation: r.generation,
      generationName: VI_TRI_CUNG[r.generation][lang === "vi" ? 0 : lang === "en" ? 1 : 2],
    },
    world: r.world,
    response: r.response,
    lang,
    raw: r,
  };
}

/** Gấp chữ để so tên: bỏ dấu (cả dấu thanh bính âm), chữ thường, bỏ khoảng trắng và gạch. */
function gon(s: string): string {
  return s
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase()
    .replace(/[\s\-'’.]/g, "");
}

// Khoá tra tên: [chữ nguyên văn hạ chữ thường, chữ đã gấp] -> số quẻ.
const TEN_TRA: readonly (readonly [number, string])[] = (() => {
  const out: [number, string][] = [];
  for (let so = 1; so <= 64; so++) {
    const t = TEN_QUE[so];
    const en = t[3];
    const cac = [en, en.replace(/^The /, ""), t[4], t[1], t[2], tenVietQue(so), t[0]];
    for (const c of cac) out.push([so, c]);
  }
  return out;
})();

function soTheoTen(s: string): number {
  const nguyen = s.normalize("NFC").trim().toLowerCase().replace(/\s+/g, " ");
  const tim = (ok: (c: string) => boolean): number[] => [...new Set(TEN_TRA.filter(([, c]) => ok(c)).map(([so]) => so))];
  let thay = tim((c) => c.toLowerCase() === nguyen);
  if (thay.length === 0) {
    const k = gon(s);
    thay = tim((c) => gon(c) === k);
  }
  if (thay.length === 1) return thay[0];
  if (thay.length > 1) {
    throw new RangeError(`hexagram name ${JSON.stringify(s)} is ambiguous: ${thay.join(", ")}; use the number, the tone marks or the characters`);
  }
  throw new RangeError(`no hexagram named ${JSON.stringify(s)}`);
}

/** Số King Wen của một đầu vào quẻ (ném lỗi khi không hợp lệ). */
export function hexagramNumber(input: HexagramInput): number {
  if (typeof input === "number") {
    if (Number.isInteger(input) && input >= 1 && input <= 64) return input;
    throw new RangeError(`hexagram number must be an integer from 1 to 64, got ${input}`);
  }
  if (typeof input === "string") {
    if (/^[01]{6}$/.test(input)) return soQueTuHao([...input].map((c) => c === "1"));
    return soTheoTen(input);
  }
  if (Array.isArray(input)) {
    if (input.length === 6 && input.every((x) => x === true || x === false || x === 0 || x === 1)) {
      return soQueTuHao(input.map((x) => x === true || x === 1));
    }
    if (input.length === 6 && input.every((x) => typeof x === "number" && x >= 6 && x <= 9)) {
      return gieoTho(input as number[]).primary;
    }
    throw new RangeError(`hexagram lines must be six booleans (or 0/1) or six coin values 6 to 9, bottom first, got ${JSON.stringify(input)}`);
  }
  if (input && typeof input === "object" && typeof (input as { number?: unknown }).number === "number") {
    return hexagramNumber((input as { number: number }).number);
  }
  throw new TypeError("hexagram must be a number, lines, a binary string, a name or a Hexagram");
}

/** One of the 64 hexagrams, by number, lines, binary string or name (English, pinyin, Chinese, Vietnamese). */
export function hexagram(input: HexagramInput, o?: NameOptions): Hexagram {
  const { lang, terms } = opts(o);
  return hexagramOf(hexagramNumber(input), lang, terms);
}

/** All 64 hexagrams in King Wen order. */
export function allHexagrams(o?: NameOptions): Hexagram[] {
  const { lang, terms } = opts(o);
  return Array.from({ length: 64 }, (_, i) => hexagramOf(i + 1, lang, terms));
}

/** The nuclear (mutual) hexagram: lines 2 to 4 below, 3 to 5 above. */
export function mutual(input: HexagramInput, o?: NameOptions): Hexagram {
  const { lang, terms } = opts(o);
  return hexagramOf(queTho(hexagramNumber(input)).mutual, lang, terms);
}

/** The opposite hexagram: every line turned yin to yang and yang to yin. */
export function opposite(input: HexagramInput, o?: NameOptions): Hexagram {
  const { lang, terms } = opts(o);
  return hexagramOf(queTho(hexagramNumber(input)).opposite, lang, terms);
}

/** The reversed hexagram: the figure turned upside down. Eight hexagrams are their own reverse. */
export function reverse(input: HexagramInput, o?: NameOptions): Hexagram {
  const { lang, terms } = opts(o);
  return hexagramOf(queTho(hexagramNumber(input)).reverse, lang, terms);
}

function kiemHaoDong(moving: readonly number[]): number[] {
  if (!Array.isArray(moving) || !moving.every((m) => Number.isInteger(m) && m >= 1 && m <= 6)) {
    throw new RangeError(`moving lines must be integers from 1 (bottom) to 6, got ${JSON.stringify(moving)}`);
  }
  return [...new Set(moving)].sort((a, b) => a - b);
}

/** The changed hexagram: the given moving lines (1 = bottom ... 6 = top) turned over. */
export function changed(input: HexagramInput, moving: readonly number[], o?: NameOptions): Hexagram {
  const { lang, terms } = opts(o);
  const h = haoQue(hexagramNumber(input));
  for (const m of kiemHaoDong(moving)) h[m - 1] = !h[m - 1];
  return hexagramOf(soQueTuHao(h), lang, terms);
}

/** A cast: six line values (6 old yin moving, 7 young yang, 8 young yin, 9 old yang moving), bottom first. */
export interface Cast {
  method: "three-coins" | "plum-blossom";
  /** Line values 6 to 9, bottom first. */
  lines: number[];
  /** Moving lines, 1 = bottom. */
  moving: number[];
  primary: Hexagram;
  /** null when no line moves. */
  changed: Hexagram | null;
  lang: Lang;
  raw: Record<string, unknown>;
}

/** Plum Blossom cast: the three numbers and the two trigrams they give. */
export interface NumberCast extends Cast {
  method: "plum-blossom";
  numbers: [number, number, number];
  upper: Trigram;
  lower: Trigram;
}

/** A random number in [0, 1): crypto.getRandomValues when the runtime has it, Math.random otherwise. */
function ngauNhien(): number {
  const c = (globalThis as { crypto?: { getRandomValues?: (a: Uint32Array) => Uint32Array } }).crypto;
  if (c && typeof c.getRandomValues === "function") return c.getRandomValues(new Uint32Array(1))[0] / 4294967296;
  return Math.random();
}

function castFrom(method: "three-coins", g: number[], lang: Lang, terms: Terms): Cast {
  const r = gieoTho(g);
  return {
    method,
    lines: [...g],
    moving: r.moving,
    primary: hexagramOf(r.primary, lang, terms),
    changed: r.changed === null ? null : hexagramOf(r.changed, lang, terms),
    lang,
    raw: r,
  };
}

/**
 * Three-coin method: six tosses of three coins, bottom line first. A coin
 * counts 3 when `rng()` is below 0.5 (the back, 背) and 2 otherwise (the
 * face, 字); the sum 6 to 9 is the line. Pass `lines` (six values 6 to 9) to
 * record a cast made by hand, or `rng` (a function returning [0, 1)) for a
 * reproducible cast. Without either, a cryptographic random source is used
 * when the runtime has one.
 */
export function castCoins(o: NameOptions & { rng?: () => number; lines?: readonly number[] } = {}): Cast {
  const { lang, terms } = opts(o);
  let g: number[];
  if (o.lines !== undefined) {
    kiemGieo(o.lines);
    g = [...o.lines];
  } else {
    const rng = o.rng ?? ngauNhien;
    if (typeof rng !== "function") throw new TypeError("rng must be a function returning a number in [0, 1)");
    g = [];
    for (let i = 0; i < 6; i++) {
      let tong = 0;
      for (let j = 0; j < 3; j++) {
        const x = rng();
        if (typeof x !== "number" || !(x >= 0 && x < 1)) throw new RangeError(`rng() must return a number in [0, 1), got ${x}`);
        tong += x < 0.5 ? 3 : 2;
      }
      g.push(tong);
    }
  }
  return castFrom("three-coins", g, lang, terms);
}

/**
 * Plum Blossom (Mei Hua Yi Shu) number method: upper trigram = a mod 8, lower
 * trigram = b mod 8, moving line = c mod 6, a remainder of 0 counting as 8
 * (Kun) or 6 (top line). Trigram numbers are in the Fu Xi order (Qian 1 ...
 * Kun 8). Any integers, negative ones too. `lines` gives the same cast as
 * coin values, so it can be passed to `najia`.
 */
export function castFromNumbers(a: number, b: number, c: number, o?: NameOptions): NumberCast {
  const { lang, terms } = opts(o);
  for (const x of [a, b, c]) {
    if (!Number.isSafeInteger(x)) throw new RangeError(`castFromNumbers takes three integers, got ${x}`);
  }
  const r = maiHoaTho(a, b, c);
  const g = haoQue(r.primary).map((y, i) => (i === r.moving[0] - 1 ? (y ? 9 : 6) : y ? 7 : 8));
  return {
    method: "plum-blossom",
    numbers: [a, b, c],
    upper: trigramOf(r.upper, lang, terms),
    lower: trigramOf(r.lower, lang, terms),
    lines: g,
    moving: [...r.moving],
    primary: hexagramOf(r.primary, lang, terms),
    changed: hexagramOf(r.changed, lang, terms),
    lang,
    raw: r,
  };
}

/** Codes of the six relations (liu qin), the same in every `lang`. */
export const RELATION_CODES: Readonly<Record<string, string>> = {
  "Phụ Mẫu": "parent",
  "Huynh Đệ": "sibling",
  "Tử Tôn": "offspring",
  "Thê Tài": "wealth",
  "Quan Quỷ": "officer",
};

/** Codes of the five seasonal states of a line under the month branch. */
export const MONTH_STATE_CODES: Readonly<Record<string, string>> = {
  "vượng": "prospering",
  "tướng": "supported",
  "hưu": "resting",
  "tù": "trapped",
  "tử": "dead",
};

/** One line of a Six Lines chart. */
export interface SixLinesLine {
  /** 1 = bottom. */
  position: number;
  yang: boolean;
  moving: boolean;
  stem: string;
  branch: string;
  element: string;
  /** Six relation by the palace element, in `lang`. */
  relation: string;
  /** "parent", "sibling", "offspring", "wealth", "officer". */
  relationCode: string;
  /** Six spirit by the day stem, in `lang`. */
  spirit: string;
  /** 0 Azure Dragon ... 5 Dark Warrior. */
  spiritIndex: number;
  world: boolean;
  response: boolean;
  /** The branch is void (xun kong) on this day. */
  void: boolean;
  /** Seasonal state of the line's element under the month branch, in `lang`. */
  monthState: string;
  monthStateCode: string;
  /** The month branch clashes with the line's branch (and the day branch does not equal it). */
  monthBreak: boolean;
  /** For a moving line: the line it turns into (branch, element, relation by the original palace). */
  changed: { branch: string; element: string; relation: string; relationCode: string } | null;
}

/** A Six Lines (Liu Yao, najia) chart. */
export interface SixLinesChart {
  date: string;
  /** Day pillar. */
  day: string;
  /** Month pillar, by the solar term at noon Vietnam time (the month turns at the twelve jie terms). */
  month: string;
  /** The two void branches of the day's decade. */
  void: [string, string];
  hexagram: Hexagram;
  changed: Hexagram | null;
  palace: Palace;
  world: number;
  response: number;
  lines: SixLinesLine[];
  lang: Lang;
  raw: ReturnType<typeof najiaTho>;
}

/** Sáu giá trị gieo 6..9 của một đầu vào (quẻ tĩnh cho 7, 8). Dùng chung với hình SVG. */
export function giaTriGieo(input: HexagramInput | Cast): number[] {
  if (input && typeof input === "object" && !Array.isArray(input) && Array.isArray((input as Cast).lines) && (input as Cast).lines.length === 6 && typeof (input as Cast).lines[0] === "number") {
    const g = [...(input as Cast).lines];
    kiemGieo(g);
    return g;
  }
  if (Array.isArray(input) && input.length === 6 && input.every((x) => typeof x === "number" && x >= 6 && x <= 9)) {
    const g = [...(input as number[])];
    kiemGieo(g);
    return g;
  }
  return haoQue(hexagramNumber(input as HexagramInput)).map((y) => (y ? 7 : 8));
}

/**
 * The Six Lines chart of a hexagram on a date (1900 to 2100): stem and
 * branch of every line (na jia), its element, six relation by the element of
 * the palace, world and response lines, six spirits from the day stem, the
 * void branches of the day, the seasonal state under the month branch and
 * month break, and for moving lines the branch they change into. `input` is a
 * Cast (from `castCoins` or `castFromNumbers`), six coin values 6 to 9, or
 * any hexagram input (no moving line).
 */
export function najia(input: HexagramInput | Cast, o: NameOptions & { date: DateInput }): SixLinesChart {
  const { lang, terms } = opts(o);
  if (!o || o.date === undefined) throw new TypeError("najia needs { date }");
  const d = parseDateInRange(o.date);
  const g = giaTriGieo(input);
  const r = najiaTho(g, d.day, d.month, d.year);
  const hx = hexagramOf(r.number, lang, terms);
  const ten3 = (vi: string, en: string, zh: string) => (lang === "vi" ? vi : lang === "en" ? en : zh);
  return {
    date: formatDate(d),
    day: stemBranchName(r.day, lang, terms),
    month: stemBranchName(r.month, lang, terms),
    void: [termName(r.void[0], lang, terms), termName(r.void[1], lang, terms)],
    hexagram: hx,
    changed: r.changed === null ? null : hexagramOf(r.changed, lang, terms),
    palace: hx.palace,
    world: r.world,
    response: r.response,
    lines: r.lines.map((h) => ({
      position: h.position,
      yang: h.yang,
      moving: h.moving,
      stem: termName(h.stem, lang, terms),
      branch: termName(h.branch, lang, terms),
      element: elementName(h.element, lang),
      relation: ten3(h.relation, h.relationEn, h.relationZh),
      relationCode: RELATION_CODES[h.relation],
      spirit: ten3(h.spirit, h.spiritEn, h.spiritZh),
      spiritIndex: ["Thanh Long", "Chu Tước", "Câu Trần", "Đằng Xà", "Bạch Hổ", "Huyền Vũ"].indexOf(h.spirit),
      world: h.world,
      response: h.response,
      void: h.void,
      monthState: ten3(h.monthState, h.monthStateEn, h.monthStateZh),
      monthStateCode: MONTH_STATE_CODES[h.monthState],
      monthBreak: h.monthBreak,
      changed: h.changed === null
        ? null
        : {
            branch: termName(h.changed.branch, lang, terms),
            element: elementName(h.changed.element, lang),
            relation: ten3(h.changed.relation, h.changed.relationEn, h.changed.relationZh),
            relationCode: RELATION_CODES[h.changed.relation],
          },
    })),
    lang,
    raw: r,
  };
}

/** The hexagram that rules a day in the Gua Qi calendar. */
export interface DailyHexagram {
  date: string;
  hexagram: Hexagram;
  /** 1 to 60 in the Gua Qi cycle (1 = Inner Truth at the winter solstice). */
  cycleIndex: number;
  /** Rank of the hexagram in its solar month: duke, sovereign, marquis, grand master, minister (in `lang`). */
  role: string;
  /** The line that rules this day (one line per day; the 7/80-day remainder goes to the top line). */
  rulingLine: number;
  /** 1 to 7: which noon since the hexagram began. */
  dayInHexagram: number;
  /** The winter solstice the count starts from, Vietnam time (UTC+7). */
  solstice: { date: string; time: string };
  minutesSinceSolstice: number;
  /** Minutes from noon to the nearest change of hexagram. */
  minutesToChange: number;
  /** Noon is within 2 minutes of a change: the neighbouring hexagram is within the solar-term error. */
  nearChange: boolean;
  /** The change of hexagram inside this day (Vietnam time), or null. */
  change: { time: string; before: Hexagram; after: Hexagram } | null;
  solarTerm: string;
  /** The cardinal hexagram (Kan, Zhen, Li, Dui) and its line that rule the solar term. */
  cardinal: { hexagram: Hexagram; line: number };
  /** Code of the method (Meng Xi, 6 days 7 parts each, anchored at the true winter solstice, read at noon UTC+7). */
  model: string;
  lang: Lang;
  raw: ReturnType<typeof queNgayTho>;
}

/**
 * The hexagram ruling a day (1900 to 2100) by the Han-dynasty Gua Qi method
 * as transmitted by Meng Xi: the sixty hexagrams other than Kan, Zhen, Li,
 * Dui each rule 6 7/80 days (8,766 minutes) in a fixed order, starting with
 * Inner Truth at the true winter solstice (to the minute, Vietnam time); the
 * day's hexagram is the one ruling at 12:00 UTC+7. It is assigned by the
 * calendar, not cast: there is no moving line.
 */
export function dailyHexagram(date: DateInput, o?: NameOptions): DailyHexagram {
  const { lang, terms } = opts(o);
  const d = parseDateInRange(date);
  const r = queNgayTho(d.day, d.month, d.year);
  const tk = TIET_KHI_TABLE[r.solarTerm];
  return {
    date: formatDate(d),
    hexagram: hexagramOf(r.number, lang, terms),
    cycleIndex: r.cycleIndex,
    role: VAI_TRO_QUAI_KHI[(r.cycleIndex - 1) % 5][lang === "vi" ? 0 : lang === "en" ? 1 : 2],
    rulingLine: r.rulingLine,
    dayInHexagram: r.dayInHexagram,
    solstice: { ...r.solstice },
    minutesSinceSolstice: r.minutesSinceSolstice,
    minutesToChange: r.minutesToChange,
    nearChange: r.nearChange,
    change: r.change === null
      ? null
      : { time: r.change.time, before: hexagramOf(r.change.before.number, lang, terms), after: hexagramOf(r.change.after.number, lang, terms) },
    solarTerm: lang === "vi" ? tk.ten : lang === "en" ? tk.tenEn : term(tk.ten, "zh", tk.tenEn),
    cardinal: { hexagram: hexagramOf(r.cardinal.number, lang, terms), line: r.cardinal.line },
    model: r.model,
    lang,
    raw: r,
  };
}
