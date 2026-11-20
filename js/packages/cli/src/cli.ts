#!/usr/bin/env node
// Lệnh dòng lệnh `nhatnguyet`: gọi lớp API tiếng Anh của các gói @nhatnguyet
// rồi in ra terminal (render.ts) hoặc JSON (--json).
//
// Command line for the Nhat Nguyet libraries.

import { auspiciousHours, checkTerms, solarTerms, toLunar, toSolar } from "@nhatnguyet/am-lich";
import type { Lang, Terms } from "@nhatnguyet/am-lich";
import { castZiWei, decadeLuck, findPatterns, yearlyLuck, ziWeiSvg } from "@nhatnguyet/tu-vi";
import { baZiSvg, castBaZi } from "@nhatnguyet/bat-tu";
import { numerology, numerologySvg } from "@nhatnguyet/than-so-hoc";
import { writeFileSync } from "node:fs";
import { festivals, festivalsIcs } from "@nhatnguyet/le-hoi";
import { castCoins, dailyHexagram, hexagram, mutual, najia, opposite, renderHexagramSvg, reverse, text } from "@nhatnguyet/iching";
import { flyingStarChart, lifeGua, lubanRuler, lubanRulers, renderCompassSvg, renderFlyingStarSvg } from "@nhatnguyet/fengshui";
import type { RulerId } from "@nhatnguyet/fengshui";
import {
  renderBaZi, renderCast, renderDailyHexagram, renderFestivals, renderFlyingStars, renderHexagram, renderHours, renderLifeGua,
  renderLuban, renderLunar, renderNumerology, renderSixLines, renderSolarTerms, renderZiWei,
} from "./render.ts";

// Gói không phụ thuộc @types/node: khai đúng phần process đang dùng.
declare const process: {
  argv: string[];
  env: Record<string, string | undefined>;
  stdout: {
    isTTY?: boolean;
    columns?: number;
    write(s: string): boolean;
    on(ev: "error", f: (e: { code?: string }) => void): unknown;
  };
  stderr: { write(s: string): boolean };
  exitCode?: number;
  exit(code?: number): never;
};

/** Version printed by --version. */
export const VERSION = "0.4.0";

export const HELP = `nhatnguyet: Zi Wei Dou Shu, BaZi, lunar calendar, numerology, Vietnamese festivals,
I Ching, feng shui

Usage:
  nhatnguyet ziwei <YYYY-MM-DD> <HH:MM> <male|female> [--name "..."] [--year 2026] [school options]
  nhatnguyet bazi <YYYY-MM-DD> [HH:MM] <male|female> [--zi-hour ...]
  nhatnguyet lunar <YYYY-MM-DD> [--country VN|CN|KR|JP|...]
  nhatnguyet solar <lunar YYYY-MM-DD> [--leap] [--country ...]
  nhatnguyet terms <year> [--country ...]
  nhatnguyet hours <YYYY-MM-DD>     auspicious and inauspicious double hours of a day
  nhatnguyet numerology "<full name>" <YYYY-MM-DD> [--today YYYY-MM-DD]
  nhatnguyet festivals <year> [--ics]
  nhatnguyet hexagram <number|name>  one of the 64 hexagrams ("11", "Peace", "泰", "Thai")
  nhatnguyet cast [--lines 987678] [--date YYYY-MM-DD]
                                    three-coin cast (random without --lines, bottom line
                                    first) and its Six Lines (najia) chart for the date
  nhatnguyet daily-hexagram <YYYY-MM-DD>  hexagram ruling the day (Gua Qi calendar)
  nhatnguyet kua <YYYY-MM-DD|lunar year> <male|female>  Eight Mansions life gua
  nhatnguyet flying-stars --period 9 --facing <mountain|degrees>
                                    Xuan Kong chart (or --year 2026, --sitting ...)
  nhatnguyet luban <cm> [--ruler luban|clear-opening|dinglan]  Luban rulers

Options:
  --lang en|vi|zh   language of the result (default en)
  --terms pinyin|han|vi  English only: stems, branches and transformations as
                    pinyin (default, "Geng Wu"), Chinese characters or Sino-Vietnamese
  --json            print JSON instead of text
  --svg <file>      also write the chart as SVG (ziwei, bazi, numerology, hexagram,
                    cast, daily-hexagram, kua, flying-stars)
  --ics             festivals: print an iCalendar (.ics) file instead
  --theme dark      dark SVG
  --no-color        no ANSI colours (also when NO_COLOR is set or output is not a terminal)

School options (where the books disagree; default first, sources in docs/schools.md):
  --fire-bell vietnamese|quanshu|swap-for-female|swap-for-yin-male-yang-female
  --leap-month whole|split-at-15|next-month
  --transformations vietnamese|quanshu|zhongzhou   (Geng year row)
  --heavenly-kitchen vietnamese|chinese            (Gui year)
  --injury-messenger standard|zhongzhou
  --zi-hour next-day-from-23|split-at-midnight     (bazi: day pillar from 23:00 to 24:00)

  -h, --help        this help
  -v, --version     version

Times are clock times; the Zi (Rat) double hour runs 23:00 to 00:59. Dates and times
are read as Vietnam time (UTC+7) unless --country says otherwise (lunar, solar,
terms, ziwei). The I Ching and feng shui commands give the rules of traditional
schools, not predictions. Docs: https://nhatnguyet.org/en/ma-nguon-mo`;

// Mọi tên công cụ MCP cũng là bí danh của lệnh tương ứng (cast_ziwei, solar_terms...).
const ALIAS: Readonly<Record<string, string>> = {
  ziwei: "ziwei", "zi-wei": "ziwei", zi_wei: "ziwei", cast_ziwei: "ziwei", cast_zi_wei: "ziwei", tuvi: "ziwei", "tu-vi": "ziwei",
  bazi: "bazi", "ba-zi": "bazi", cast_bazi: "bazi", battu: "bazi", "bat-tu": "bazi",
  lunar: "lunar", lunar_convert: "lunar", amlich: "lunar", "am-lich": "lunar",
  solar: "solar", duong: "solar",
  terms: "terms", "solar-terms": "terms", solar_terms: "terms", tietkhi: "terms",
  hours: "hours", auspicious_hours: "hours", "auspicious-hours": "hours", "gio-hoang-dao": "hours",
  numerology: "numerology", "than-so-hoc": "numerology",
  festivals: "festivals", "le-hoi": "festivals", lehoi: "festivals",
  hexagram: "hexagram", "i-ching": "hexagram", iching: "hexagram", "kinh-dich": "hexagram",
  cast: "cast", najia: "cast", "six-lines": "cast", six_lines_chart: "cast", "liu-yao": "cast", "luc-hao": "cast",
  "daily-hexagram": "daily-hexagram", daily_hexagram: "daily-hexagram", "que-ngay": "daily-hexagram",
  kua: "kua", "life-gua": "kua", life_gua: "kua", "cung-phi": "kua",
  "flying-stars": "flying-stars", "flying-star": "flying-stars", flying_star_chart: "flying-stars", "phi-tinh": "flying-stars",
  luban: "luban", luban_ruler: "luban", "lo-ban": "luban",
};

// Cờ lựa chọn phái: tên cờ (kebab-case) và khoá của `schools`.
const SCHOOL_FLAGS = ["fire-bell", "leap-month", "transformations", "heavenly-kitchen", "injury-messenger", "zi-hour"];

/** Lựa chọn phái từ các cờ (chỉ những cờ có mặt); undefined khi không có cờ nào. */
function schoolsFrom(flags: Record<string, string | boolean>, keys: string[]): Record<string, string> | undefined {
  const r: Record<string, string> = {};
  for (const f of keys) {
    const v = flags[f];
    if (v === undefined) continue;
    if (typeof v !== "string") throw new TypeError(`--${f} needs a value`);
    r[f.replace(/-(\w)/g, (_, c: string) => c.toUpperCase())] = v;
  }
  return Object.keys(r).length ? r : undefined;
}

/** Parsed command line. */
export interface Args {
  command: string;
  positional: string[];
  flags: Record<string, string | boolean>;
}

/** Split argv (without node and script) into command, positional arguments and flags. */
export function parseArgs(argv: string[]): Args {
  const positional: string[] = [];
  const flags: Record<string, string | boolean> = {};
  const coGiaTri = new Set(["lang", "country", "name", "year", "today", "tz", "svg", "theme", "terms", "lines", "date", "period", "facing", "sitting", "ruler", ...SCHOOL_FLAGS]);
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "-h") flags.help = true;
    else if (a === "-v") flags.version = true;
    else if (a.startsWith("--")) {
      const eq = a.indexOf("=");
      const k = eq > 0 ? a.slice(2, eq) : a.slice(2);
      if (eq > 0) flags[k] = a.slice(eq + 1);
      else if (coGiaTri.has(k)) {
        if (i + 1 >= argv.length) throw new Error(`--${k} needs a value`);
        flags[k] = argv[++i];
      } else flags[k] = true;
    } else positional.push(a);
  }
  const lenh = positional.shift() ?? "";
  return { command: ALIAS[lenh.toLowerCase()] ?? lenh, positional, flags };
}

const GIOI = /^(male|female|m|f|nam|nữ|nu)$/i;

/** Hôm nay theo đồng hồ máy, YYYY-MM-DD (lệnh cast khi không có --date). */
function homNay(): string {
  const d = new Date();
  const p2 = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p2(d.getMonth() + 1)}-${p2(d.getDate())}`;
}

/** Độ (số) hay tên sơn (chuỗi) của --facing, --sitting. */
function sonHayDo(v: string | boolean | undefined): string | number | undefined {
  if (typeof v !== "string") return undefined;
  return /^-?\d+(\.\d+)?$/.test(v) ? Number(v) : v;
}

/** Where `run` writes files (the SVG of --svg); tests pass their own. */
export interface RunEnv {
  color: boolean;
  width: number;
  writeFile?: (path: string, data: string) => void;
}

/** Run one command; returns the text to print (no trailing newline). */
export function run(argv: string[], env: RunEnv): string {
  const { command, positional: p, flags } = parseArgs(argv);
  if (flags.version) return VERSION;
  if (flags.help || command === "" || command === "help") return HELP;
  const lang = (typeof flags.lang === "string" ? flags.lang : "en") as Lang;
  const terms: Terms = checkTerms(typeof flags.terms === "string" ? flags.terms : undefined, lang === "vi" || lang === "zh" ? lang : "en");
  const json = flags.json === true;
  const opts = { color: env.color && flags.color !== false && flags["no-color"] !== true, width: env.width };
  const country = typeof flags.country === "string" ? flags.country : undefined;
  const can = (n: number, mau: string) => {
    if (p.length < n) throw new Error(`usage: nhatnguyet ${mau}`);
  };
  const dumpJson = (x: unknown) => JSON.stringify(x, (k, v) => (k === "raw" ? undefined : v), 2);
  const theme = flags.theme === "dark" ? ("dark" as const) : ("light" as const);
  const ghiSvg = (ve: () => string) => {
    if (typeof flags.svg !== "string") return;
    (env.writeFile ?? writeFileSync)(flags.svg, ve() + "\n");
  };

  switch (command) {
    case "ziwei": {
      can(3, "ziwei <YYYY-MM-DD> <HH:MM> <male|female>");
      const year = typeof flags.year === "string" ? Number(flags.year) : undefined;
      const schools = schoolsFrom(flags, SCHOOL_FLAGS.slice(0, 5));
      const chart = castZiWei({ date: p[0], time: p[1], gender: p[2], name: typeof flags.name === "string" ? flags.name : undefined, lang, terms, viewYear: year, schools, country });
      const extra = { decades: decadeLuck(chart), year: yearlyLuck(chart), patterns: findPatterns(chart) };
      ghiSvg(() => ziWeiSvg(chart, { theme }));
      if (json) return dumpJson({ chart, ...extra });
      return renderZiWei(chart, extra, opts);
    }
    case "bazi": {
      can(2, "bazi <YYYY-MM-DD> [HH:MM] <male|female>");
      const coGio = p.length >= 3 || !GIOI.test(p[1]);
      if (coGio) can(3, "bazi <YYYY-MM-DD> [HH:MM] <male|female>");
      const chart = castBaZi({ date: p[0], time: coGio ? p[1] : null, gender: coGio ? p[2] : p[1], lang, terms, schools: schoolsFrom(flags, ["zi-hour"]) });
      ghiSvg(() => baZiSvg(chart, { theme, name: typeof flags.name === "string" ? flags.name : "" }));
      return json ? dumpJson(chart) : renderBaZi(chart, opts);
    }
    case "lunar": {
      can(1, "lunar <YYYY-MM-DD> [--country CN]");
      const r = toLunar(p[0], { country, lang, terms });
      return json ? dumpJson(r) : renderLunar(r, opts);
    }
    case "solar": {
      can(1, "solar <lunar YYYY-MM-DD> [--leap]");
      const k = /^(-?\d+)-(\d+)-(\d+)$/.exec(p[0]);
      if (!k) throw new Error("lunar date must look like YYYY-MM-DD");
      const r = toSolar({ year: Number(k[1]), month: Number(k[2]), day: Number(k[3]), leap: flags.leap === true }, { country });
      // Bảng như lệnh lunar, dựng từ ngày dương vừa đổi được.
      return json ? dumpJson(r) : renderLunar(toLunar(r.date, { country, lang, terms }), opts);
    }
    case "terms": {
      can(1, "terms <year>");
      const y = Number(p[0]);
      const t = solarTerms(y, { country, lang });
      return json ? dumpJson(t) : renderSolarTerms(y, t, lang, opts, terms);
    }
    case "hours": {
      can(1, "hours <YYYY-MM-DD>");
      const r = auspiciousHours(p[0], { lang, terms });
      return json ? dumpJson(r) : renderHours(r, opts);
    }
    case "numerology": {
      can(2, 'numerology "<full name>" <YYYY-MM-DD>');
      const r = numerology({ name: p[0], birthDate: p[1], today: typeof flags.today === "string" ? flags.today : undefined, lang });
      ghiSvg(() => numerologySvg(r, { theme }));
      return json ? dumpJson(r) : renderNumerology(r, opts);
    }
    case "festivals": {
      can(1, "festivals <year>");
      const y = Number(p[0]);
      // --ics: tệp kết thúc bằng CRLF; main() thêm "\n" nên bỏ "\n" cuối ở đây.
      if (flags.ics === true) return festivalsIcs(y, { lang }).slice(0, -1);
      const list = festivals(y, { lang });
      return json ? dumpJson(list) : renderFestivals(y, list, lang, opts);
    }
    case "hexagram": {
      can(1, "hexagram <number|name>");
      const vao = p.join(" ");
      const o = { lang, terms };
      const h = hexagram(/^\d+$/.test(vao) ? Number(vao) : vao, o);
      const rel = { mutual: mutual(h.number, o), opposite: opposite(h.number, o), reverse: reverse(h.number, o) };
      const t = text(h.number);
      ghiSvg(() => renderHexagramSvg(h, { theme, lang }));
      if (json) return dumpJson({ hexagram: h, ...rel, text: t });
      return renderHexagram(h, { ...rel, judgment: t.judgment.zh }, opts);
    }
    case "cast": {
      const lines = typeof flags.lines === "string" ? flags.lines.replace(/[\s,]/g, "").split("").map(Number) : undefined;
      const cast = castCoins({ lines, lang, terms });
      const chart = najia(cast, { date: typeof flags.date === "string" ? flags.date : homNay(), lang, terms });
      ghiSvg(() => renderHexagramSvg(cast, { theme, lang }));
      if (json) return dumpJson({ cast, chart });
      return renderCast(cast, opts) + "\n\n" + renderSixLines(chart, opts);
    }
    case "daily-hexagram": {
      can(1, "daily-hexagram <YYYY-MM-DD>");
      const r = dailyHexagram(p[0], { lang, terms });
      ghiSvg(() => renderHexagramSvg(r.hexagram, { theme, lang }));
      return json ? dumpJson(r) : renderDailyHexagram(r, opts);
    }
    case "kua": {
      can(2, "kua <YYYY-MM-DD|lunar year> <male|female>");
      const g = lifeGua(/^\d{1,4}$/.test(p[0]) ? Number(p[0]) : p[0], p[1], { lang, terms });
      ghiSvg(() => renderCompassSvg({ gua: g, lang, terms, theme }));
      return json ? dumpJson(g) : renderLifeGua(g, lang, opts);
    }
    case "flying-stars": {
      const num = (v: string | boolean | undefined) => (typeof v === "string" ? Number(v) : undefined);
      if (flags.period === undefined && flags.year === undefined) throw new Error("usage: nhatnguyet flying-stars --period <1-9> --facing <mountain|degrees>");
      const c = flyingStarChart({ period: num(flags.period), year: num(flags.year), facing: sonHayDo(flags.facing), sitting: sonHayDo(flags.sitting) }, { lang, terms });
      ghiSvg(() => renderFlyingStarSvg(c, { theme, lang, terms }));
      return json ? dumpJson(c) : renderFlyingStars(c, lang, opts);
    }
    case "luban": {
      can(1, "luban <cm> [--ruler luban|clear-opening|dinglan]");
      const len = Number(p[0]);
      const rulers = typeof flags.ruler === "string" ? [flags.ruler as RulerId] : lubanRulers().map((r) => r.ruler);
      const rs = rulers.map((ruler) => lubanRuler(len, { ruler, lang, terms }));
      if (json) return dumpJson(typeof flags.ruler === "string" ? rs[0] : rs);
      return renderLuban(rs, lang, opts);
    }
  }
  throw new Error(`unknown command "${command}". Try: nhatnguyet --help`);
}

function main(): void {
  const out = process.stdout;
  const env = process.env;
  const ep = env.FORCE_COLOR !== undefined && env.FORCE_COLOR !== "0";
  const color = env.NO_COLOR === undefined && (ep || (!!out.isTTY && env.TERM !== "dumb"));
  const width = out.isTTY && out.columns ? Math.min(out.columns, 140) : 88;
  // Người đọc đóng ống sớm (`nhatnguyet festivals 2027 --ics | head`): thoát
  // êm với mã 0 như lệnh Unix thường, không in lỗi EPIPE.
  out.on("error", (e) => {
    if (e.code === "EPIPE") process.exit(0);
    throw e;
  });
  try {
    out.write(run(process.argv.slice(2), { color, width }) + "\n");
  } catch (e) {
    process.stderr.write("nhatnguyet: " + (e instanceof Error ? e.message : String(e)) + "\n");
    process.exitCode = 1;
  }
}

// Chạy khi được gọi như chương trình (không chạy khi test nhập mô-đun).
const laChuongTrinh = (() => {
  const a = process.argv[1] ?? "";
  return /(?:^|[\\/])(?:cli\.(?:ts|js)|nhatnguyet)$/.test(a) || a.includes("/.bin/") || a.includes("@nhatnguyet/cli");
})();
if (laChuongTrinh) main();
