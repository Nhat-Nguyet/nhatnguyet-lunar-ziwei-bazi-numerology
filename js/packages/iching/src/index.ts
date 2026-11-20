// @nhatnguyet/iching: Kinh Dịch (I Ching) cho JS/TS. Lõi tính Go
// (coreengine) là nguồn sự thật; ca-kiem/iching.json
// ghim từng kết quả. API công khai bằng tiếng Anh.

export {
  allHexagrams,
  castCoins,
  castFromNumbers,
  changed,
  dailyHexagram,
  hexagram,
  hexagramNumber,
  MONTH_STATE_CODES,
  mutual,
  najia,
  opposite,
  RELATION_CODES,
  reverse,
  trigram,
} from "./en.ts";
export type {
  Cast,
  DailyHexagram,
  DateInput,
  Hexagram,
  HexagramInput,
  Lang,
  NameOptions,
  NumberCast,
  Palace,
  SixLinesChart,
  SixLinesLine,
  Terms,
  Trigram,
  TrigramResult,
} from "./en.ts";
export { CLASSICAL_SOURCE, text } from "./text.ts";
export type { HexagramText, LineStatement } from "./text.ts";
export { renderHexagramSvg } from "./svg.ts";
export type { HexagramSvgOptions } from "./svg.ts";

/** Version of the reference engine the package is checked against. */
export const ENGINE_VERSION = "2.3.0";
