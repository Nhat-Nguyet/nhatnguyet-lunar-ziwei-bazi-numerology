// Vẽ quẻ thành một tệp SVG tự chứa (không phông ngoài, không ảnh, không mã
// chạy): sáu hào, hào động đánh dấu (vòng tròn cho hào dương động, dấu chéo
// cho hào âm động), quẻ biến đặt bên phải khi có hào động. Mọi toạ độ là số
// nguyên để bản Python `nhatnguyet.iching.render_hexagram_svg` ra ĐÚNG TỪNG
// BYTE như bản này.

import { checkLang } from "@nhatnguyet/am-lich";
import type { Lang } from "@nhatnguyet/am-lich";
import { gieoTho } from "./core.ts";
import { giaTriGieo, hexagram } from "./en.ts";
import type { Cast, Hexagram, HexagramInput } from "./en.ts";

/** Options of `renderHexagramSvg`. */
export interface HexagramSvgOptions {
  /** Language of the names: "en" (default), "vi", "zh". */
  lang?: Lang;
  /** "light" (default) or "dark". */
  theme?: "light" | "dark";
  /** Width in pixels; the height follows the aspect ratio. Default: natural size. */
  width?: number;
}

type BangMau = { readonly nen: string; readonly o: string; readonly vien: string; readonly chu: string; readonly chuMo: string; readonly gach: string };

const MAU: Readonly<Record<"light" | "dark", BangMau>> = {
  light: { nen: "#ECEEEB", o: "#FFFFFF", vien: "#D3D9D5", chu: "#1B1F1E", chuMo: "#4F5956", gach: "#B5402F" },
  dark: { nen: "#0F1E1D", o: "#182A28", vien: "#2C423F", chu: "#E8EEEC", chuMo: "#B3C2BE", gach: "#EE8D78" },
};

const RONG_O = 200;
const CAO = 232;
const KHE = 40;
const RONG_CHU = 184;

function thoat(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

/** Bề rộng ước của chuỗi ở cỡ 14 (số nguyên): chữ hoa 9, chữ Hán 14, còn lại 8. */
function rongUoc(s: string): number {
  let w = 0;
  for (const ch of s) {
    const c = ch.codePointAt(0) as number;
    if (c >= 0x41 && c <= 0x5a) w += 9;
    else if (c >= 0x2e80) w += 14;
    else w += 8;
  }
  return w;
}

function tieuDe(q: Hexagram, lang: Lang): [string, string] {
  if (lang === "zh") return [`${q.number}. ${q.nameZh}`, q.pinyin];
  return [`${q.number}. ${q.name}`, `${q.nameHan} ${q.pinyin}`];
}

function o(x0: number, q: Hexagram, g: readonly number[] | null, lang: Lang, m: BangMau): string {
  let s = "";
  for (let i = 1; i <= 6; i++) {
    const y = 28 + (6 - i) * 24;
    const v = g ? g[i - 1] : q.lines[i - 1] ? 7 : 8;
    if (v === 7 || v === 9) s += `<rect x="${x0 + 40}" y="${y}" width="120" height="14" rx="2" fill="${m.chu}"/>`;
    else s += `<rect x="${x0 + 40}" y="${y}" width="52" height="14" rx="2" fill="${m.chu}"/><rect x="${x0 + 108}" y="${y}" width="52" height="14" rx="2" fill="${m.chu}"/>`;
    const x = x0 + 178;
    const cy = y + 7;
    if (v === 9) s += `<circle cx="${x}" cy="${cy}" r="6" fill="none" stroke="${m.gach}" stroke-width="2"/>`;
    if (v === 6) s += `<path d="M${x - 5} ${cy - 5}L${x + 5} ${cy + 5}M${x + 5} ${cy - 5}L${x - 5} ${cy + 5}" stroke="${m.gach}" stroke-width="2"/>`;
  }
  const [t1, t2] = tieuDe(q, lang);
  const ep = rongUoc(t1) > RONG_CHU ? ` textLength="${RONG_CHU}" lengthAdjust="spacingAndGlyphs"` : "";
  s += `<text x="${x0 + 100}" y="192" text-anchor="middle" font-size="14" font-weight="600" fill="${m.chu}"${ep}>${thoat(t1)}</text>`;
  s += `<text x="${x0 + 100}" y="212" text-anchor="middle" font-size="12" fill="${m.chuMo}">${thoat(t2)}</text>`;
  return s;
}

/**
 * Draw a hexagram as a self-contained SVG. Given a cast (or six coin values
 * 6 to 9) with moving lines, moving lines are marked (a circle on a moving
 * yang line, a cross on a moving yin line) and the changed hexagram is drawn
 * on the right.
 */
export function renderHexagramSvg(input: HexagramInput | Cast, opts: HexagramSvgOptions = {}): string {
  const lang = checkLang(opts.lang);
  const theme = opts.theme ?? "light";
  if (theme !== "light" && theme !== "dark") throw new TypeError(`theme must be "light" or "dark", got ${JSON.stringify(theme)}`);
  if (opts.width !== undefined && !(Number.isInteger(opts.width) && opts.width > 0)) {
    throw new RangeError(`width must be a positive integer, got ${opts.width}`);
  }
  const m = MAU[theme];
  const g = giaTriGieo(input);
  const r = gieoTho(g);
  const chinh = hexagram(r.primary, { lang });
  const bien = r.changed === null ? null : hexagram(r.changed, { lang });
  const rong = bien ? RONG_O * 2 + KHE : RONG_O;
  const nhan = tieuDe(chinh, lang)[0] + (bien ? " → " + tieuDe(bien, lang)[0] : "");
  const kho = opts.width !== undefined ? ` width="${opts.width}"` : ` width="${rong}" height="${CAO}"`;
  let s = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${rong} ${CAO}"${kho} role="img" aria-label="${thoat(nhan)}" font-family="system-ui, -apple-system, 'Segoe UI', Roboto, 'Noto Sans', 'Noto Sans CJK SC', sans-serif">`;
  s += `<title>${thoat(nhan)}</title>`;
  s += `<rect width="${rong}" height="${CAO}" rx="16" fill="${m.nen}"/>`;
  s += `<rect x="8" y="8" width="${rong - 16}" height="${CAO - 16}" rx="12" fill="${m.o}" stroke="${m.vien}"/>`;
  s += o(0, chinh, g, lang, m);
  if (bien) {
    s += `<path d="M${RONG_O + 6} 95H${RONG_O + KHE - 8}M${RONG_O + KHE - 14} 89L${RONG_O + KHE - 8} 95L${RONG_O + KHE - 14} 101" fill="none" stroke="${m.chuMo}" stroke-width="2"/>`;
    s += o(RONG_O + KHE, bien, null, lang, m);
  }
  return s + "</svg>";
}
