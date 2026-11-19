// Dựng kết quả của lớp API tiếng Anh thành chữ cho terminal: lá số Tử Vi dạng
// lưới 4x4 bằng ký tự khung, bảng Bát Tự, ngày âm, thần số học, lễ hội. Màu
// ANSI chỉ khi người gọi bật (cli.ts tắt khi không phải TTY hay có NO_COLOR).
//
// Renders results of the English API as terminal text.

import { term } from "@nhatnguyet/am-lich";
import type { AuspiciousHoursResult, LunarResult, SolarTerm, Terms } from "@nhatnguyet/am-lich";
import type { ZiWeiChart, ZiWeiPalace, DecadeLuck, YearlyLuck, ZiWeiPattern } from "@nhatnguyet/tu-vi";
import type { BaZiChart, BaZiPillar } from "@nhatnguyet/bat-tu";
import type { NumerologyResult } from "@nhatnguyet/than-so-hoc";
import type { Festival } from "@nhatnguyet/le-hoi";

type Lang = "vi" | "en" | "zh";

/** Rendering options. */
export interface RenderOptions {
  /** Use ANSI colours. Default false. */
  color?: boolean;
  /** Total width available, in terminal columns. Default 88. */
  width?: number;
}

// ── Đo bề rộng hiển thị ─────────────────────────────────────────────────

/** Terminal columns taken by one code point: 2 for CJK and fullwidth, 0 for combining marks. */
export function charWidth(cp: number): number {
  if (cp === 0) return 0;
  if ((cp >= 0x300 && cp <= 0x36f) || (cp >= 0x200b && cp <= 0x200f) || cp === 0xfe0f) return 0;
  if (
    (cp >= 0x1100 && cp <= 0x115f) ||
    (cp >= 0x2e80 && cp <= 0x303e) ||
    (cp >= 0x3041 && cp <= 0x33ff) ||
    (cp >= 0x3400 && cp <= 0x4dbf) ||
    (cp >= 0x4e00 && cp <= 0x9fff) ||
    (cp >= 0xa000 && cp <= 0xa4cf) ||
    (cp >= 0xac00 && cp <= 0xd7a3) ||
    (cp >= 0xf900 && cp <= 0xfaff) ||
    (cp >= 0xfe30 && cp <= 0xfe4f) ||
    (cp >= 0xff00 && cp <= 0xff60) ||
    (cp >= 0xffe0 && cp <= 0xffe6) ||
    (cp >= 0x20000 && cp <= 0x3fffd)
  ) {
    return 2;
  }
  return 1;
}

/** Display width of a string (no ANSI codes inside). */
export function displayWidth(s: string): number {
  let w = 0;
  for (const ch of s.normalize("NFC")) w += charWidth(ch.codePointAt(0) as number);
  return w;
}

/** Cut a string to at most `width` columns, ending with "…" when cut. */
export function truncate(s: string, width: number): string {
  s = s.normalize("NFC");
  if (displayWidth(s) <= width) return s;
  let out = "";
  let w = 0;
  for (const ch of s) {
    const cw = charWidth(ch.codePointAt(0) as number);
    if (w + cw > width - 1) break;
    out += ch;
    w += cw;
  }
  return out + "…";
}

/** Wrap words into lines of at most `width` columns (CJK text breaks anywhere). */
export function wrap(s: string, width: number): string[] {
  const lines: string[] = [];
  let line = "";
  const tokens = s.normalize("NFC").split(/(\s+)/).filter((t) => t !== "");
  for (const tok of tokens) {
    if (/^\s+$/.test(tok)) {
      if (line !== "") line += " ";
      continue;
    }
    if (displayWidth(line + tok) <= width) {
      line += tok;
      continue;
    }
    if (line.trim() !== "") lines.push(line.trimEnd());
    line = "";
    // Một từ dài hơn cả dòng (chữ Hán viết liền): cắt theo ký tự.
    let t = tok;
    while (displayWidth(t) > width) {
      let head = "";
      for (const ch of t) {
        if (displayWidth(head + ch) > width) break;
        head += ch;
      }
      lines.push(head);
      t = t.slice(head.length);
    }
    line = t;
  }
  if (line.trim() !== "") lines.push(line.trimEnd());
  return lines;
}

/** Pack items into lines of at most `width` columns, never splitting an item (long items are cut). */
export function wrapItems(items: string[], sep: string, width: number): string[] {
  const lines: string[] = [];
  let line = "";
  const duoi = displayWidth(sep.trimEnd());
  for (const raw of items) {
    const it = truncate(raw, width - duoi);
    if (line === "") line = it;
    else if (displayWidth(line + sep + it) + duoi <= width) line += sep + it;
    else {
      lines.push(line + sep.trimEnd());
      line = it;
    }
  }
  if (line !== "") lines.push(line);
  return lines;
}

// ── Màu ─────────────────────────────────────────────────────────────────

type Style = "" | "bold" | "dim" | "red" | "green" | "yellow" | "blue" | "magenta" | "cyan" | "title";

const ANSI: Readonly<Record<Exclude<Style, "">, string>> = {
  bold: "\x1b[1m",
  dim: "\x1b[2m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  magenta: "\x1b[35m",
  cyan: "\x1b[36m",
  title: "\x1b[1;33m",
};

/** A piece of text with one style. */
type Seg = [string, Style];
/** A line made of styled pieces. */
type Line = Seg[];

function paint(text: string, style: Style, color: boolean): string {
  if (!color || style === "" || text === "") return text;
  return ANSI[style] + text + "\x1b[0m";
}

/** Fit a styled line into exactly `width` columns (cut or pad). */
function fitLine(line: Line, width: number, color: boolean, align: "left" | "center" = "left"): string {
  const plain = line.map((s) => s[0]).join("");
  let out = "";
  let used = 0;
  if (displayWidth(plain) > width) {
    // Cắt: giữ từng mẩu tới khi hết chỗ, mẩu cuối cắt kèm dấu "…".
    for (const [t, st] of line) {
      const con = width - used;
      if (con <= 0) break;
      const w = displayWidth(t);
      if (w < con) {
        out += paint(t, st, color);
        used += w;
        continue;
      }
      const c = truncate(w === con ? t + " " : t, con);
      out += paint(c, st, color);
      used += displayWidth(c);
      break;
    }
    return out + " ".repeat(Math.max(0, width - used));
  }
  const pad = width - displayWidth(plain);
  const left = align === "center" ? Math.floor(pad / 2) : 0;
  out = " ".repeat(left) + line.map(([t, st]) => paint(t, st, color)).join("") + " ".repeat(pad - left);
  return out;
}

// ── Chữ giao diện ba thứ tiếng ──────────────────────────────────────────

const UI: Readonly<Record<Lang, Readonly<Record<string, string>>>> = {
  vi: {
    zwTitle: "LÁ SỐ TỬ VI", body: "Thân", life: "Mệnh", tuan: "Tuần", triet: "Triệt", born: "Sinh", lunar: "Âm lịch",
    leap: "nhuận", year: "Năm", bureau: "Cục", naYin: "Bản mệnh", view: "Năm xem", age: "tuổi", decades: "Đại vận",
    patterns: "Cách cục", notes: "Ghi chú", legend: "Sáng tối: M miếu, V vượng, Đ đắc, B bình, H hãm. Tuổi tính theo tuổi mụ.",
    yearPalace: "Lưu niên", minorLimit: "Tiểu vận", decade: "Đại vận", none: "không",
    bzTitle: "LÁ SỐ BÁT TỰ", pYear: "Năm", pMonth: "Tháng", pDay: "Ngày", pHour: "Giờ", tenGod: "Thập thần", stem: "Can",
    branch: "Chi", hidden: "Tàng can", stage: "Trường sinh", stars: "Thần sát", dayMaster: "Nhật chủ", luck: "Đại vận",
    forward: "thuận", backward: "nghịch", startAt: "khởi vận lúc", years: "năm", months: "tháng", term: "Tiết khí",
    gregorian: "Dương lịch", month: "Tháng", day: "Ngày", zodiac: "Con giáp", solarTerm: "Tiết khí", country: "Lịch",
    nmTitle: "THẦN SỐ HỌC", pinnacles: "Đỉnh cao", challenges: "Thách thức", until: "tới", fest: "LỄ HỘI",
    terms: "TIẾT KHÍ", unknown: "chưa biết giờ", male: "Nam", female: "Nữ",
    hrsTitle: "GIỜ HOÀNG ĐẠO", good: "hoàng đạo", bad: "hắc đạo",
  },
  en: {
    zwTitle: "ZI WEI DOU SHU CHART", body: "Body", life: "Life", tuan: "Tuần", triet: "Triệt", born: "Born", lunar: "Lunar",
    leap: "leap", year: "Year", bureau: "Bureau", naYin: "Na yin", view: "Year", age: "age", decades: "Ten-year periods",
    patterns: "Patterns", notes: "Notes", legend: "Brightness: Ex exalted, Pr prosperous, Fa favorable, Ne neutral, We weak. Ages are East Asian ages (1 at birth).",
    yearPalace: "Year palace", minorLimit: "Minor limit", decade: "Decade", none: "none",
    bzTitle: "BAZI (FOUR PILLARS)", pYear: "Year", pMonth: "Month", pDay: "Day", pHour: "Hour", tenGod: "Ten God", stem: "Stem",
    branch: "Branch", hidden: "Hidden stems", stage: "Stage", stars: "Stars", dayMaster: "Day Master", luck: "Luck pillars",
    forward: "forward", backward: "backward", startAt: "starting at", years: "y", months: "m", term: "Solar term",
    gregorian: "Gregorian", month: "Month", day: "Day", zodiac: "Zodiac", solarTerm: "Solar term", country: "Calendar",
    nmTitle: "NUMEROLOGY", pinnacles: "Pinnacles", challenges: "Challenges", until: "to age", fest: "FESTIVALS",
    terms: "SOLAR TERMS", unknown: "time unknown", male: "male", female: "female",
    hrsTitle: "AUSPICIOUS HOURS", good: "auspicious", bad: "inauspicious",
  },
  zh: {
    zwTitle: "紫微斗数命盘", body: "身", life: "命", tuan: "旬空", triet: "截空", born: "出生", lunar: "农历",
    leap: "闰", year: "年", bureau: "五行局", naYin: "纳音", view: "流年", age: "虚岁", decades: "大限",
    patterns: "格局", notes: "说明", legend: "亮度：庙、旺、得地、平、陷。年龄按虚岁计。",
    yearPalace: "流年命宫", minorLimit: "小限", decade: "大限", none: "无",
    bzTitle: "八字命盘", pYear: "年柱", pMonth: "月柱", pDay: "日柱", pHour: "时柱", tenGod: "十神", stem: "天干",
    branch: "地支", hidden: "藏干", stage: "十二长生", stars: "神煞", dayMaster: "日主", luck: "大运",
    forward: "顺排", backward: "逆排", startAt: "起运", years: "岁", months: "个月", term: "节气",
    gregorian: "公历", month: "月", day: "日", zodiac: "生肖", solarTerm: "节气", country: "历法",
    nmTitle: "生命灵数", pinnacles: "巅峰数", challenges: "挑战数", until: "至", fest: "节日",
    terms: "二十四节气", unknown: "时辰未知", male: "男", female: "女",
    hrsTitle: "黄道吉时", good: "黄道", bad: "黑道",
  },
};

function ui(lang: Lang): Readonly<Record<string, string>> {
  return UI[lang] ?? UI.en;
}

/** Viết tắt độ sáng của chính tinh để vừa ô. */
function doSangNgan(b: string, lang: Lang): string {
  if (lang === "zh") return b;
  if (lang === "vi") return b.charAt(0);
  return b.slice(0, 2);
}

/** Viết tắt Tứ Hóa: bỏ chữ "Hóa", "Hua" hay 化 ("Hua Ji" ra "Ji", 化忌 ra 忌). */
function hoaNgan(t: string, lang: Lang): string {
  return lang === "zh" || t.startsWith("化") ? t.replace("化", "") : t.replace(/^(?:Hóa|Hua)\s+/, "");
}

/** Tuần, Triệt theo cách viết của lá số (bản Anh: pinyin, chữ Hán hay Hán Việt). */
function chuKhong(chart: ZiWeiChart, u: Readonly<Record<string, string>>): [string, string] {
  if (chart.lang !== "en" || chart.terms === "vi") return [u.tuan, u.triet];
  return chart.terms === "han" ? ["旬空", "截空"] : ["Xun Kong", "Jie Kong"];
}

// ── Lưới Tử Vi ──────────────────────────────────────────────────────────

/** Vị trí 12 cung trên lưới 4x4 (hàng, cột), chi 0 Tý tới 11 Hợi, Tỵ ở góc trên trái. */
const VI_TRI_LUOI: ReadonlyArray<readonly [number, number]> = [
  [3, 2], [3, 1], [3, 0], [2, 0], [1, 0], [0, 0], [0, 1], [0, 2], [0, 3], [1, 3], [2, 3], [3, 3],
];

function dongCung(p: ZiWeiPalace, lang: Lang, W: number, khong: [string, string]): Line[] {
  const u = ui(lang);
  const lines: Line[] = [];
  const dau: Line = [[p.name, p.isLife ? "title" : "bold"]];
  if (p.isBody) dau.push([" · " + u.body, "yellow"]);
  lines.push(dau);
  const dau2: Line = [[p.stemBranch, "dim"]];
  if (p.tuan) dau2.push([" " + khong[0], "blue"]);
  if (p.triet) dau2.push([" " + khong[1], "blue"]);
  lines.push(dau2);
  for (const s of p.stars) {
    if (s.kind !== "major") continue;
    const dau: Line = [];
    if (s.brightness) dau.push([" " + doSangNgan(s.brightness, lang), "dim"]);
    if (s.transformation) dau.push([" " + hoaNgan(s.transformation, lang), "green"]);
    const rong = displayWidth(s.name) + dau.reduce((n, x) => n + displayWidth(x[0]), 0);
    if (rong <= W) lines.push([[s.name, "red"], ...dau]);
    else {
      // Tên dài: dấu sáng tối và Tứ Hóa xuống dòng dưới, thụt vào.
      lines.push([[s.name, "red"]]);
      if (dau.length) lines.push([[" ", ""], ...dau]);
    }
  }
  const phu = p.stars.filter((s) => s.kind === "minor").map((s) => (s.transformation ? `${s.name} ${hoaNgan(s.transformation, lang)}` : s.name));
  for (const w of wrapItems(phu, lang === "zh" ? "、" : ", ", W)) lines.push([[w, "cyan"]]);
  const ts = p.stars.find((s) => s.kind === "growth");
  if (ts) lines.push([[ts.name, "dim"]]);
  return lines;
}

/**
 * The Zi Wei chart as a 4x4 grid: the twelve palaces around the edge (Tỵ at
 * the top left, as in printed charts), birth data in the middle.
 */
export function renderZiWeiGrid(chart: ZiWeiChart, opts: RenderOptions = {}): string {
  const color = opts.color === true;
  const lang = chart.lang;
  const u = ui(lang);
  const width = opts.width ?? 88;
  const W = Math.max(16, Math.min(30, Math.floor((width - 5) / 4)));
  const C = 2 * W + 1;
  const o: (Line[])[][] = [[], [], [], []];
  for (let r = 0; r < 4; r++) o[r] = [[], [], [], []];
  for (const p of chart.palaces) {
    const [r, c] = VI_TRI_LUOI[p.index];
    o[r][c] = dongCung(p, lang, W - 2, chuKhong(chart, u));
  }
  const h = [0, 0, 0, 0];
  for (let r = 0; r < 4; r++) for (let c = 0; c < 4; c++) h[r] = Math.max(h[r], o[r][c].length);

  // Phần giữa: thông tin người sinh, canh giữa.
  const l = chart.lunar;
  const giua: Line[] = ([
    [[u.zwTitle, "title"]],
    [[chart.name || "", "bold"]],
    [[`${u.born} ${chart.solarDate} ${chart.time ?? ""} (${chart.hour.name})`.replace(/\s+/g, " "), ""]],
    [[`${u.lunar} ${l.year}-${String(l.month).padStart(2, "0")}${l.leap ? " " + u.leap : ""}-${String(l.day).padStart(2, "0")} · ${chart.yearPillar}`, ""]],
    [[chart.yinYang, "yellow"]],
    [[`${u.bureau}: ${chart.bureau.name}`, ""]],
    [[`${u.naYin}: ${chart.naYin}`, ""]],
    [[`${u.life}: ${chart.palaces[chart.lifePalace].branch} · ${u.body}: ${chart.palaces[chart.bodyPalace].branch}`, "dim"]],
  ] as Line[]).filter((x) => x[0][0] !== "");
  const giuaH = h[1] + 1 + h[2];
  if (giua.length > giuaH) h[2] += giua.length - giuaH;
  const tong = h[1] + 1 + h[2];
  const lech = Math.floor((tong - giua.length) / 2);
  const giuaDong = (i: number): string => fitLine(giua[i - lech] ?? [["", ""]], C, color, "center");

  const ngang = (a: string, b: string[], z: string) => a + b.map((x) => (x === "─" ? "─".repeat(W) : x)).join("") + z;
  const k = (s: string) => paint(s, "dim", color);
  const o1 = (r: number, c: number, i: number) => " " + fitLine(o[r][c][i] ?? [], W - 1, color);
  const out: string[] = [];
  out.push(k(ngang("┌", ["─", "┬", "─", "┬", "─", "┬", "─"], "┐")));
  for (let i = 0; i < h[0]; i++) out.push(k("│") + [0, 1, 2, 3].map((c) => o1(0, c, i)).join(k("│")) + k("│"));
  out.push(k(ngang("├", ["─", "┼", "─", "┴", "─", "┼", "─"], "┤")));
  for (let i = 0; i < h[1]; i++) out.push(k("│") + o1(1, 0, i) + k("│") + giuaDong(i) + k("│") + o1(1, 3, i) + k("│"));
  out.push(k("├" + "─".repeat(W) + "┤") + giuaDong(h[1]) + k("├" + "─".repeat(W) + "┤"));
  for (let i = 0; i < h[2]; i++) out.push(k("│") + o1(2, 0, i) + k("│") + giuaDong(h[1] + 1 + i) + k("│") + o1(2, 3, i) + k("│"));
  out.push(k(ngang("├", ["─", "┼", "─", "┬", "─", "┼", "─"], "┤")));
  for (let i = 0; i < h[3]; i++) out.push(k("│") + [0, 1, 2, 3].map((c) => o1(3, c, i)).join(k("│")) + k("│"));
  out.push(k(ngang("└", ["─", "┴", "─", "┴", "─", "┴", "─"], "┘")));
  return out.join("\n");
}

/** Grid plus the viewing year, ten-year periods, patterns and notes. */
export function renderZiWei(
  chart: ZiWeiChart,
  extra: { decades?: DecadeLuck[]; year?: YearlyLuck; patterns?: ZiWeiPattern[] },
  opts: RenderOptions = {},
): string {
  const color = opts.color === true;
  const u = ui(chart.lang);
  const width = opts.width ?? 88;
  const out = [renderZiWeiGrid(chart, opts), ...wrap(u.legend, width).map((x) => paint(x, "dim", color))];
  if (extra.year) {
    const y = extra.year;
    out.push("", paint(`${u.view} ${y.year} (${y.yearPillar})`, "bold", color));
    const dong = [
      `${u.age} ${y.age}`,
      `${u.yearPalace}: ${y.yearPalace.palace}`,
      `${u.minorLimit}: ${y.minorLimit.palace}`,
      ...(y.decade ? [`${u.decade}: ${y.decade.palace} (${y.decade.fromAge}-${y.decade.toAge})`] : []),
      ...y.transformations.map((t) => `${t.type}: ${t.star}${t.palace ? " → " + t.palace : ""}`),
    ];
    for (const x of wrapItems(dong, " · ", width - 2)) out.push("  " + x);
  }
  if (extra.decades && extra.decades.length) {
    out.push("", paint(u.decades, "bold", color));
    for (const d of extra.decades) {
      const tuoi = `${String(d.fromAge).padStart(3)}-${String(d.toAge).padEnd(3)}`;
      const nam = `${d.fromYear}-${d.toYear}`;
      out.push(truncate(`  ${tuoi} ${nam}  ${d.palace} (${d.branch})  ${d.majorStars.join(", ") || "-"}`, width));
    }
  }
  if (extra.patterns && extra.patterns.length) {
    out.push("", paint(u.patterns, "bold", color));
    for (const p of extra.patterns) out.push(truncate(`  ${p.name}${p.nameHan && chart.lang !== "zh" ? " " + p.nameHan : ""}${p.palace ? " · " + p.palace : ""}`, width));
  }
  if (chart.notes.length) {
    out.push("");
    for (const n of chart.notes) for (const w of wrap(n, width)) out.push(paint(w, "dim", color));
  }
  return out.join("\n");
}

// ── Bảng chung ──────────────────────────────────────────────────────────

/** A boxed table; each cell may hold several lines. */
function bang(header: string[] | null, rows: string[][][], color: boolean, widths?: number[]): string {
  const n = header ? header.length : rows[0]?.length ?? 0;
  const w =
    widths ??
    Array.from({ length: n }, (_, c) => Math.max(header ? displayWidth(header[c]) : 0, ...rows.map((r) => Math.max(0, ...(r[c] ?? []).map(displayWidth)))));
  const k = (s: string) => paint(s, "dim", color);
  const vien = (a: string, m: string, z: string) => k(a + w.map((x) => "─".repeat(x + 2)).join(m) + z);
  const out = [vien("┌", "┬", "┐")];
  if (header) {
    out.push(k("│") + header.map((hd, c) => " " + fitLine([[hd, "bold"]], w[c], color) + " ").join(k("│")) + k("│"));
    out.push(vien("├", "┼", "┤"));
  }
  for (const r of rows) {
    const hgt = Math.max(1, ...r.map((x) => x.length));
    for (let i = 0; i < hgt; i++) {
      out.push(k("│") + Array.from({ length: n }, (_, c) => " " + fitLine([[r[c]?.[i] ?? "", c === 0 ? "dim" : ""]], w[c], color) + " ").join(k("│")) + k("│"));
    }
  }
  out.push(vien("└", "┴", "┘"));
  return out.join("\n");
}

// ── Bát Tự ──────────────────────────────────────────────────────────────

/** The four pillars as a table, then the luck pillars. */
export function renderBaZi(chart: BaZiChart, opts: RenderOptions = {}): string {
  const color = opts.color === true;
  const lang = chart.lang;
  const u = ui(lang);
  const width = opts.width ?? 88;
  const tru: (BaZiPillar | null)[] = [chart.pillars.year, chart.pillars.month, chart.pillars.day, chart.pillars.hour];
  const cot = (f: (p: BaZiPillar) => string[]): string[][] => tru.map((p) => (p ? f(p) : ["-"]));
  const hang: [string, string[][]][] = [
    [u.tenGod, cot((p) => [p.tenGod])],
    [u.stem, cot((p) => [`${p.stem} ${p.stemElement}`])],
    [u.branch, cot((p) => [`${p.branch} ${p.branchElement}`])],
    [u.hidden, cot((p) => p.hiddenStems.map((x) => `${x.stem} ${x.tenGod}`))],
    [u.naYin, cot((p) => [p.naYin])],
    [u.stage, cot((p) => [p.stage])],
    [u.stars, cot((p) => (p.stars.length ? p.stars : ["-"]))],
  ];
  const nhan = Math.max(...hang.map((x) => displayWidth(x[0])));
  const cw = Math.max(12, Math.min(24, Math.floor((width - nhan - 3 - 4 * 3 - 1) / 4)));
  const rows = hang.map(([nh, cells]) => [[nh], ...cells.map((c) => c.flatMap((x) => wrap(x, cw)))]);
  const head = ["", `${u.pYear} ${tru[0]?.label ?? ""}`, `${u.pMonth} ${tru[1]?.label ?? ""}`, `${u.pDay} ${tru[2]?.label ?? ""}`, `${u.pHour} ${tru[3]?.label ?? u.unknown}`];
  const out: string[] = [];
  out.push(paint(`${u.bzTitle}`, "title", color) + `  ${chart.solarDate} ${chart.time ?? u.unknown} · ${u[chart.gender]}`);
  out.push(`${u.dayMaster}: ${paint(`${chart.dayMaster.stem} (${chart.dayMaster.yinYang} ${chart.dayMaster.element})`, "yellow", color)} · ${u.term}: ${chart.solarTerm}`);
  out.push(bang(head, rows, color, [nhan, cw, cw, cw, cw]));
  const lk = chart.luck;
  out.push("");
  out.push(
    paint(u.luck, "bold", color) +
      ` (${lk.direction === "forward" ? u.forward : u.backward}, ${u.startAt} ${lk.startAge.years}${u.years} ${lk.startAge.months}${u.months}, ${lk.startDate})`,
  );
  for (const v of lk.pillars) {
    out.push(truncate(`  ${String(v.fromAge).padStart(3)}  ${v.fromYear}-${v.toYear}  ${v.label}  ${v.tenGod} · ${v.stage}`, width));
  }
  out.push("");
  for (const n of [lk.explanation, ...chart.notes]) for (const w of wrap(n, width)) out.push(paint(w, "dim", color));
  return out.join("\n");
}

// ── Âm lịch ─────────────────────────────────────────────────────────────

/** A lunar date as a small key-value box. */
export function renderLunar(r: LunarResult, opts: RenderOptions = {}): string {
  const color = opts.color === true;
  const u = ui(r.lang);
  const p2 = (n: number) => String(n).padStart(2, "0");
  const mon = r.leap ? `${p2(r.month)} (${u.leap})` : p2(r.month);
  const rows: string[][][] = [
    [[u.gregorian], [r.solarDate]],
    [[u.lunar], [`${r.year}-${mon}-${p2(r.day)}`]],
    [[u.year], [`${r.yearName} · ${r.zodiac}`]],
    [[u.month], [r.monthName]],
    [[u.day], [r.dayName]],
    [[u.solarTerm], [r.solarTerm]],
    [[u.country], [`${r.country} (UTC${r.timeZone >= 0 ? "+" : ""}${r.timeZone})`]],
  ];
  return bang(null, rows, color);
}

/**
 * The 24 solar terms of a year as a table. The name is in `lang` only; in
 * English, `nameTerms` "han" or "vi" adds the Chinese or Vietnamese name in
 * brackets ("Minor Cold (小寒)", "Minor Cold (Tiểu Hàn)"), "pinyin" (default)
 * adds nothing.
 */
export function renderSolarTerms(year: number, terms: SolarTerm[], lang: Lang, opts: RenderOptions = {}, nameTerms: Terms = "pinyin"): string {
  const color = opts.color === true;
  const u = ui(lang);
  const kem = (t: SolarTerm) => (lang !== "en" || nameTerms === "pinyin" ? "" : ` (${nameTerms === "vi" ? t.nameVi : term(t.nameVi, "zh")})`);
  const rows = terms.map((t) => [[t.date], [t.time], [t.name + kem(t)], [String(t.longitude) + "°"]]);
  return paint(`${u.terms} ${year}`, "title", color) + "\n" + bang(null, rows, color);
}

/** The twelve double hours of a day: branch, clock range, auspicious or not, spirit. */
export function renderHours(r: AuspiciousHoursResult, opts: RenderOptions = {}): string {
  const color = opts.color === true;
  const u = ui(r.lang);
  const rows = r.hours.map((h) => [[`${h.branch} (${h.animal})`], [h.range], [h.auspicious ? u.good : u.bad], [h.spirit]]);
  return paint(u.hrsTitle, "title", color) + `  ${r.date} · ${u.day} ${r.day}` + "\n" + bang(null, rows, color);
}

// ── Thần số học ─────────────────────────────────────────────────────────

/** Numerology numbers, the 3x3 birth-date grid, pinnacles and challenges. */
export function renderNumerology(r: NumerologyResult, opts: RenderOptions = {}): string {
  const color = opts.color === true;
  const L = r.labels;
  const u = ui(r.lang);
  const khoa = ["lifePath", "expression", "soulUrge", "personality", "attitude", "birthday", "maturity", "personalYear", "personalMonth", "personalDay"] as const;
  const nhan = Math.max(...khoa.map((k) => displayWidth(L[k])));
  const out = [paint(u.nmTitle, "title", color) + `  ${r.name} · ${r.birthDate}`];
  for (const k of khoa) {
    const v = r[k];
    const so = v === 11 || v === 22 || v === 33 ? paint(String(v), "magenta", color) : paint(String(v), "bold", color);
    out.push(`  ${L[k]}${" ".repeat(nhan - displayWidth(L[k]))}  ${so}`);
  }
  if (r.karmicDebt) out.push(`  ${L.karmicDebt}${" ".repeat(Math.max(1, nhan - displayWidth(L.karmicDebt)))}  ${r.karmicDebt}`);
  out.push(`  ${L.pinnacles}: ` + r.pinnacles.map((p) => `${p.number}${p.toAge ? ` (${u.until} ${p.toAge})` : ""}`).join(", "));
  out.push(`  ${L.challenges}: ${r.challenges.join(", ")}`);
  // Lưới Pythagoras: 3 6 9 / 2 5 8 / 1 4 7.
  const o = (d: number) => {
    const n = r.grid[String(d) as keyof typeof r.grid];
    return n ? String(d).repeat(n) : "-";
  };
  out.push("", `  ${L.grid}`);
  out.push(
    bang(null, [[[o(3)], [o(6)], [o(9)]], [[o(2)], [o(5)], [o(8)]], [[o(1)], [o(4)], [o(7)]]], color, [5, 5, 5])
      .split("\n")
      .map((x) => "  " + x)
      .join("\n"),
  );
  return out.join("\n");
}

// ── Lễ hội ──────────────────────────────────────────────────────────────

/** Festivals of a year as a table: date, fixed date, name. */
export function renderFestivals(year: number, list: Festival[], lang: Lang, opts: RenderOptions = {}): string {
  const color = opts.color === true;
  const u = ui(lang);
  const width = opts.width ?? 88;
  const ten = Math.max(20, width - 12 - 14 - 8);
  const rows = list.map((f) => [[f.date], [`${f.fixedDate} ${f.calendar === "lunar" ? (lang === "en" ? "lunar" : u.lunar) : ""}`.trim()], [truncate(f.name, ten)]]);
  return paint(`${u.fest} ${year} (${list.length})`, "title", color) + "\n" + bang(null, rows, color);
}
