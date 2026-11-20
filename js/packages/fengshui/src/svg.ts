// Vẽ la bàn 24 sơn và tinh bàn Huyền Không thành tệp SVG tự chứa (không phông
// ngoài, không ảnh, không mã chạy), ba thứ tiếng, hai bộ màu sáng tối theo nhận
// diện của Nhật Nguyệt (cùng bộ màu với hình thần số học).
//
// Toạ độ trên vòng tròn KHÔNG gọi Math.sin, Math.cos: mọi góc là bội của 7,5
// độ và lấy từ một bảng hằng, vì hàm lượng giác của mỗi ngôn ngữ có thể lệch ở
// chữ số cuối. Nhờ vậy bản Python `nhatnguyet.fengshui` ra ĐÚNG TỪNG BYTE như
// bản này (băm ghim ở python/tests/ve_svg_fengshui.json).

import { checkLang } from "@nhatnguyet/am-lich";
import type { Lang } from "@nhatnguyet/am-lich";
import {
  eightDirections, flyingStarChart, mountains24, findMountain, trigramOf,
  type FlyingStarChart, type FlyingStarInput, type NameOptions,
} from "./en.ts";
import { SO_NHA_QUAI, TAM_HUONG, allBatQuai } from "./core.ts";

/** Options shared by the two drawings. */
export interface SvgOptions extends NameOptions {
  /** "light" (default) or "dark". */
  theme?: "light" | "dark";
  /** Display width in px (the `width` attribute); default 480. */
  width?: number;
}

/** Options of `renderCompassSvg`. */
export interface CompassSvgOptions extends SvgOptions {
  /** Draw the eight Eight Mansions stars of this gua (a number or a `lifeGua` / `houseGua` result). */
  gua?: number | { number: number };
  /** Mark the facing mountain (bearing in degrees or a mountain name) and its opposite. */
  facing?: number | string;
  /** "south-up" (default, as Chinese and Vietnamese compass books draw it) or "north-up". */
  orientation?: "south-up" | "north-up";
}

interface BangMau {
  nen: string;
  o: string;
  vien: string;
  chu: string;
  chuMo: string;
  chinh: string;
  chinhNen: string;
  vang: string;
  gach: string;
  gachNen: string;
  chuTrenNhan: string;
}

const MAU: Readonly<Record<"light" | "dark", BangMau>> = {
  light: {
    nen: "#ECEEEB", o: "#FFFFFF", vien: "#D3D9D5", chu: "#1B1F1E", chuMo: "#4F5956", chinh: "#1F6F6B",
    chinhNen: "#E4F0ED", vang: "#C9922E", gach: "#B5402F", gachNen: "#F6E4DF", chuTrenNhan: "#FFFFFF",
  },
  dark: {
    nen: "#0F1E1D", o: "#182A28", vien: "#2C423F", chu: "#E8EEEC", chuMo: "#B3C2BE", chinh: "#7CC7BF",
    chinhNen: "#1E3835", vang: "#E0A53C", gach: "#EE8D78", gachNen: "#3A2622", chuTrenNhan: "#0F1E1D",
  },
};

const PHONG = "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, 'Noto Sans', 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', 'Noto Sans CJK SC', sans-serif";

// sin của 0, 7,5, ..., 90 độ; góc khác suy theo đối xứng.
const SIN_GOC = [
  0, 0.13052619222005157, 0.25881904510252074, 0.3826834323650898, 0.5, 0.6087614290087207, 0.7071067811865476,
  0.7933533402912352, 0.8660254037844386, 0.9238795325112867, 0.9659258262890683, 0.9914448613738104, 1,
];

/** sin của k × 7,5 độ. */
function sinK(k: number): number {
  const j = ((k % 48) + 48) % 48;
  if (j <= 12) return SIN_GOC[j];
  if (j <= 24) return SIN_GOC[24 - j];
  if (j <= 36) return -SIN_GOC[j - 24];
  return -SIN_GOC[48 - j];
}

function cosK(k: number): number {
  return sinK(k + 12);
}

/** Số ra chuỗi, làm tròn một chữ số thập phân, không đuôi ".0". */
function so(n: number): string {
  const k = Math.floor(n * 10 + 0.5);
  const am = k < 0;
  const t = am ? -k : k;
  const nguyen = Math.floor(t / 10);
  const le = t - nguyen * 10;
  return (am ? "-" : "") + String(nguyen) + (le === 0 ? "" : "." + String(le));
}

function thoat(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function chu(x: number, y: number, noiDung: string, co: number, mau: string, them = ""): string {
  return `<text x="${so(x)}" y="${so(y)}" font-size="${co}" fill="${mau}" text-anchor="middle" dominant-baseline="central"${them}>${thoat(noiDung)}</text>`;
}

const MO_TA: Readonly<Record<Lang, string>> = {
  vi: "Quy tắc của các phái phong thuỷ truyền thống, chưa được kiểm chứng; nhatnguyet.org",
  en: "Rules of traditional feng shui schools, not verified effects; nhatnguyet.org",
  zh: "传统风水流派的规则，未经验证；nhatnguyet.org",
};

function moDau(w: number, h: number, width: number, m: BangMau, title: string, lang: Lang): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${so(width)}" height="${so((width * h) / w)}" role="img" aria-labelledby="nn-tieu-de nn-mo-ta" lang="${lang}" font-family="${PHONG}">` +
    `<title id="nn-tieu-de">${thoat(title)}</title><desc id="nn-mo-ta">${thoat(MO_TA[lang])}</desc><rect width="${w}" height="${h}" fill="${m.nen}"/>`;
}

function checkTheme(t: unknown): "light" | "dark" {
  if (t === undefined || t === null) return "light";
  if (t === "light" || t === "dark") return t;
  throw new TypeError(`theme must be "light" or "dark", got ${JSON.stringify(t)}`);
}

function checkWidth(w: unknown): number {
  if (w === undefined || w === null) return 480;
  if (typeof w !== "number" || !Number.isFinite(w) || w <= 0) throw new TypeError("width must be a positive number");
  return w;
}

function theoLang(lang: Lang, vi: string, en: string, zh: string): string {
  return lang === "vi" ? vi : lang === "en" ? en : zh;
}

// ── La bàn ──────────────────────────────────────────────────────────────

const CX = 240;
const CY = 280;

/**
 * Draw the 24-mountain compass (with the eight trigrams and, when `gua` is
 * given, the eight Eight Mansions stars) as a self-contained SVG string.
 */
export function renderCompassSvg(options: CompassSvgOptions = {}): string {
  const lang = checkLang(options.lang);
  const o: NameOptions = { lang, terms: options.terms };
  const m = MAU[checkTheme(options.theme)];
  const width = checkWidth(options.width);
  const nam = (options.orientation ?? "south-up") === "south-up";
  if (options.orientation !== undefined && options.orientation !== "south-up" && options.orientation !== "north-up") {
    throw new TypeError(`orientation must be "south-up" or "north-up", got ${JSON.stringify(options.orientation)}`);
  }
  const px = (r: number, k: number) => (nam ? CX - r * sinK(k) : CX + r * sinK(k));
  const py = (r: number, k: number) => (nam ? CY + r * cosK(k) : CY - r * cosK(k));
  const quat = (r1: number, r2: number, k1: number, k2: number) =>
    `M${so(px(r2, k1))} ${so(py(r2, k1))}A${r2} ${r2} 0 0 1 ${so(px(r2, k2))} ${so(py(r2, k2))}` +
    `L${so(px(r1, k2))} ${so(py(r1, k2))}A${r1} ${r1} 0 0 0 ${so(px(r1, k1))} ${so(py(r1, k1))}Z`;

  const son = mountains24(o);
  const coGua = options.gua !== undefined && options.gua !== null;
  const huongSao = coGua ? eightDirections(options.gua as number | { number: number }, o) : [];
  let iHuong = -1;
  let iToa = -1;
  if (options.facing !== undefined && options.facing !== null) {
    iHuong = findMountain(options.facing).index - 1;
    iToa = (iHuong + 12) % 24;
  }
  const g = options.gua as { number: number; gender?: unknown; sitting?: unknown } | number | undefined;
  const so_gua = typeof g === "number" ? g : g?.number;
  let tieuDe = theoLang(lang, "La bàn 24 sơn", "24-mountain compass", "二十四山罗盘");
  if (coGua) {
    const loai = typeof g === "object" && g && "gender" in g
      ? theoLang(lang, "Cung phi", "Life gua", "命卦")
      : typeof g === "object" && g && "sitting" in g
        ? theoLang(lang, "Trạch", "House gua", "宅卦")
        : theoLang(lang, "Quái", "Gua", "卦");
    tieuDe = `${loai} ${so_gua} · ${trigramOf(so_gua as number, o).name}`;
  }
  // Bán kính các vòng. Vòng quái và vòng du niên đủ rộng cho nhãn hai dòng ở
  // khổ 320px; mọi hình vẽ trước, chữ vẽ sau cùng để không hình nào đè chữ.
  const R0 = 200;
  const R1 = 168;
  const R2 = 122;
  const R3 = 78;
  let s = moDau(480, 520, width, m, tieuDe, lang);
  s += chu(240, 26, tieuDe, 18, m.chu, ' font-weight="600"');

  // Vòng 24 sơn.
  son.forEach((x, i) => {
    const laHuong = i === iHuong;
    const laToa = i === iToa;
    const nen = laHuong ? m.chinh : laToa ? m.vang : x.kind === "trigram" ? m.chinhNen : m.o;
    const mauChu = laHuong || laToa ? m.chuTrenNhan : m.chu;
    s += `<path d="${quat(R1, R0, 2 * i - 1, 2 * i + 1)}" fill="${nen}" stroke="${m.vien}" stroke-width="1"/>`;
    s += chu(px((R0 + R1) / 2, 2 * i), py((R0 + R1) / 2, 2 * i), x.name, 13, mauChu, laHuong || laToa ? ' font-weight="600"' : "");
  });

  // Vòng tám quái: quẻ phía trong, nhãn (tên và phương) phía ngoài, nơi cung dài hơn.
  let chuSau = "";
  const quai = allBatQuai();
  for (let h = 0; h < 8; h++) {
    const q = quai.find((x) => x.ten === TAM_HUONG[h][3])!;
    const ten = trigramOf(SO_NHA_QUAI[q.ten], o).name;
    s += `<path d="${quat(R2, R1, 6 * h - 3, 6 * h + 3)}" fill="${m.o}" stroke="${m.vien}" stroke-width="1"/>`;
    const x = px(142, 6 * h);
    const y = py(142, 6 * h);
    const tren = y < CY - 1;
    chuSau += chu(x, tren ? y + 8 : y - 8, q.kyHieu, 16, m.chu);
    chuSau += chu(x, tren ? y - 10 : y + 10, ten + " " + TEN_HUONG[lang][h], 10, m.chuMo);
  }

  // Vòng tám du niên: tên hai chữ trở lên (có dấu cách) xuống hai dòng.
  if (coGua) {
    for (const d of huongSao) {
      const h = TAM_HUONG.findIndex((x) => x[1].toLowerCase() === d.direction);
      const r = (R2 + R3) / 2;
      s += `<path d="${quat(R3, R2, 6 * h - 3, 6 * h + 3)}" fill="${d.favorable ? m.chinhNen : m.gachNen}" stroke="${m.vien}" stroke-width="1"/>`;
      const dong = d.starName.split(" ");
      const mau = d.favorable ? m.chinh : m.gach;
      if (dong.length === 2) {
        chuSau += chu(px(r, 6 * h), py(r, 6 * h) - 6.5, dong[0], 11, mau, ' font-weight="600"');
        chuSau += chu(px(r, 6 * h), py(r, 6 * h) + 6.5, dong[1], 11, mau, ' font-weight="600"');
      } else {
        chuSau += chu(px(r, 6 * h), py(r, 6 * h), d.starName, 11, mau, ' font-weight="600"');
      }
    }
  }

  // Tâm.
  const rTam = coGua ? R3 : R2;
  s += `<circle cx="${CX}" cy="${CY}" r="${rTam}" fill="${m.o}" stroke="${m.vien}" stroke-width="1"/>`;
  s += chuSau;
  if (coGua) {
    s += chu(CX, CY - 10, String(so_gua), 34, m.chinh, ' font-weight="700"');
    s += chu(CX, CY + 22, theoLang(lang, "cung phi", "gua number", "卦数"), 11, m.chuMo);
  } else {
    s += chu(CX, CY, theoLang(lang, "La bàn", "Compass", "罗盘"), 16, m.chuMo);
  }

  // Độ ở bốn phương chính, ngoài vòng.
  for (const k of [0, 12, 24, 36]) {
    s += chu(px(214, k), py(214, k), String(k * 7.5) + "°", 11, m.chuMo);
  }
  s += chu(240, 506, nam ? theoLang(lang, "Nam ở trên, như sách la bàn cổ", "South at the top, as compass books draw it", "南在上，依罗盘古书画法") : theoLang(lang, "Bắc ở trên", "North at the top", "北在上"), 11, m.chuMo);
  return s + "</svg>";
}

const TEN_HUONG: Readonly<Record<Lang, readonly string[]>> = {
  vi: ["B", "ĐB", "Đ", "ĐN", "N", "TN", "T", "TB"],
  en: ["N", "NE", "E", "SE", "S", "SW", "W", "NW"],
  zh: ["北", "东北", "东", "东南", "南", "西南", "西", "西北"],
};

// ── Tinh bàn ────────────────────────────────────────────────────────────

/**
 * Draw a Xuan Kong flying star chart as a 3 x 3 grid, south at the top: in
 * each palace the mountain star (left), facing star (right) and period star
 * (below). Pass a `flyingStarChart` result or its input.
 */
export function renderFlyingStarSvg(chart: FlyingStarChart | FlyingStarInput, options: SvgOptions = {}): string {
  const lang = checkLang(options.lang);
  const o: NameOptions = { lang, terms: options.terms };
  const m = MAU[checkTheme(options.theme)];
  const width = checkWidth(options.width);
  const c0 = chart as FlyingStarChart;
  const tb = c0 && Array.isArray(c0.palaces) && c0.sitting
    ? flyingStarChart({ period: c0.period, sitting: c0.sitting.nameVi }, o)
    : flyingStarChart(chart as FlyingStarInput, o);
  const tieuDe = lang === "vi"
    ? `Vận ${tb.period} · Tọa ${tb.sitting.name}, hướng ${tb.facing.name}`
    : lang === "en"
      ? `Period ${tb.period} · Sitting ${tb.sitting.name}, facing ${tb.facing.name}`
      : `${tb.period}运 · 坐${tb.sitting.name}向${tb.facing.name}`;
  let s = moDau(480, 560, width, m, tieuDe, lang);
  s += chu(240, 26, tieuDe, 17, m.chu, ' font-weight="600"');
  if (tb.patternName) s += chu(240, 50, tb.patternName, 13, m.chinh);
  const x0 = 30;
  const y0 = 70;
  const o0 = 140;
  tb.grid.forEach((hang, r) => {
    hang.forEach((cung, j) => {
      const p = tb.palaces[cung - 1];
      const x = x0 + j * o0;
      const y = y0 + r * o0;
      const laToa = cung === tb.sittingPalace;
      const laHuong = cung === tb.facingPalace;
      const vien = laHuong ? m.chinh : laToa ? m.vang : m.vien;
      const day = laHuong || laToa ? 3 : 1;
      s += `<rect x="${x}" y="${y}" width="${o0}" height="${o0}" fill="${cung === 5 ? m.chinhNen : m.o}" stroke="${vien}" stroke-width="${day}"/>`;
      s += chu(x + 70, y + 20, p.directionName, 12, m.chuMo);
      const mauSao = (q: string) => (q === "prosperous" || q === "growing" ? m.chinh : m.chu);
      s += chu(x + 38, y + 66, String(p.mountain), 30, mauSao(p.qi.mountain), ' font-weight="700"');
      s += chu(x + 102, y + 66, String(p.facing), 30, mauSao(p.qi.facing), ' font-weight="700"');
      s += chu(x + 70, y + 106, String(p.base), 18, m.chuMo);
      if (laToa) s += chu(x + 70, y + 127, theoLang(lang, "Tọa", "Sitting", "坐"), 10, m.vang, ' font-weight="600"');
      if (laHuong) s += chu(x + 70, y + 127, theoLang(lang, "Hướng", "Facing", "向"), 10, m.chinh, ' font-weight="600"');
    });
  });
  s += chu(240, 514, theoLang(lang, "Trái: sơn tinh · Phải: hướng tinh · Dưới: vận tinh", "Left: mountain star · Right: facing star · Below: period star", "左：山星 · 右：向星 · 下：运星"), 11, m.chuMo);
  s += chu(240, 536, theoLang(lang, "Nam ở trên, như sách cổ", "South at the top, as the books draw it", "南在上，依古书画法"), 11, m.chuMo);
  return s + "</svg>";
}
