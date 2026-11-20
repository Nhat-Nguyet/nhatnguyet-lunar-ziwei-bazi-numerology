// Văn bản cổ thuộc phạm vi công cộng: lời quẻ, lời hào của Chu Dịch (nguyên
// văn) và bản dịch Anh của James Legge (1882). Không có lời luận nào của site.

import { CLASSICAL_SOURCE, CLASSICAL_TEXT } from "./text-data.ts";
import { hexagramNumber } from "./en.ts";
import type { HexagramInput } from "./en.ts";

export { CLASSICAL_SOURCE } from "./text-data.ts";

/** One line statement. */
export interface LineStatement {
  /** 1 = bottom line ... 6 = top; 7 is the extra statement of hexagrams 1 and 2 (use of nine, use of six). */
  line: number;
  /** The line's name in the classic (its first two characters): 初九, 六二 ... 上六, 用九, 用六. */
  label: string;
  /** Classical Chinese, traditional characters, as in the received text. */
  zh: string;
  /** James Legge's 1882 translation, OCR text as printed; null if missing. */
  en: string | null;
}

/** The classical text of a hexagram. */
export interface HexagramText {
  number: number;
  /** The judgment (卦辭) on the whole hexagram. */
  judgment: { zh: string; en: string | null };
  lines: LineStatement[];
  source: { zh: string; en: string; dataset: string };
}

/**
 * The public domain text of a hexagram: the judgment and the line statements
 * of the Zhou Yi, with James Legge's 1882 English translation. The English
 * is OCR of the 1882 printing and is given as printed (old romanization,
 * the translator's words in parentheses). Nothing else: no commentary, no
 * modern reading.
 */
export function text(input: HexagramInput): HexagramText {
  const n = hexagramNumber(input);
  const [jz, je, ls] = CLASSICAL_TEXT[n - 1];
  return {
    number: n,
    judgment: { zh: jz, en: je },
    lines: ls.map(([zh, en], i) => ({ line: i + 1, label: zh.slice(0, 2), zh, en })),
    source: { zh: CLASSICAL_SOURCE.zh, en: CLASSICAL_SOURCE.en, dataset: CLASSICAL_SOURCE.dataset },
  };
}
