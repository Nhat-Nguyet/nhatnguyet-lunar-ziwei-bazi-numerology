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
import { renderBaZi, renderFestivals, renderHours, renderLunar, renderNumerology, renderSolarTerms, renderZiWei } from "./render.ts";

// Gói không phụ thuộc @types/node: khai đúng phần process đang dùng.
declare const process: {
  argv: string[];
  env: Record<string, string | undefined>;
  stdout: { isTTY?: boolean; columns?: number; write(s: string): boolean };
  stderr: { write(s: string): boolean };
  exitCode?: number;
};

/** Version printed by --version. */
export const VERSION = "0.3.0";

export const HELP = `nhatnguyet: Zi Wei Dou Shu, BaZi, lunar calendar, numerology, Vietnamese festivals

Usage:
  nhatnguyet ziwei <YYYY-MM-DD> <HH:MM> <male|female> [--name "..."] [--year 2026] [school options]
  nhatnguyet bazi <YYYY-MM-DD> [HH:MM] <male|female> [--zi-hour ...]
  nhatnguyet lunar <YYYY-MM-DD> [--country VN|CN|KR|JP|...]
  nhatnguyet solar <lunar YYYY-MM-DD> [--leap] [--country ...]
  nhatnguyet terms <year> [--country ...]
  nhatnguyet hours <YYYY-MM-DD>     auspicious and inauspicious double hours of a day
  nhatnguyet numerology "<full name>" <YYYY-MM-DD> [--today YYYY-MM-DD]
  nhatnguyet festivals <year> [--ics]

Options:
  --lang en|vi|zh   language of the result (default en)
  --terms pinyin|han|vi  English only: stems, branches and transformations as
                    pinyin (default, "Geng Wu"), Chinese characters or Sino-Vietnamese
  --json            print JSON instead of text
  --svg <file>      also write the chart as SVG (ziwei, bazi, numerology)
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

Times are clock times; the Tý double hour runs 23:00 to 00:59. Dates and times
are read as Vietnam time (UTC+7) unless --country says otherwise (lunar, solar,
terms). Docs: https://nhatnguyet.org/ma-nguon-mo`;

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
  const coGiaTri = new Set(["lang", "country", "name", "year", "today", "tz", "svg", "theme", "terms", ...SCHOOL_FLAGS]);
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
      const chart = castZiWei({ date: p[0], time: p[1], gender: p[2], name: typeof flags.name === "string" ? flags.name : undefined, lang, terms, viewYear: year, schools });
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
      return json ? dumpJson(t) : renderSolarTerms(y, t, lang, opts);
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
  }
  throw new Error(`unknown command "${command}". Try: nhatnguyet --help`);
}

function main(): void {
  const out = process.stdout;
  const env = process.env;
  const ep = env.FORCE_COLOR !== undefined && env.FORCE_COLOR !== "0";
  const color = env.NO_COLOR === undefined && (ep || (!!out.isTTY && env.TERM !== "dumb"));
  const width = out.isTTY && out.columns ? Math.min(out.columns, 140) : 88;
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
