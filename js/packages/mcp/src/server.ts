// Máy chủ MCP của Nhật Nguyệt: cho trợ lý AI gọi bộ máy tất định (lịch âm,
// tiết khí, Tử Vi, Bát Tự, thần số học, lễ hội) thay vì tự tính. Không gọi
// mạng; mọi phép tính chạy tại chỗ bằng các gói @nhatnguyet.
//
// MCP server for the Nhat Nguyet libraries. Tool descriptions are in English
// (the language assistants read best); results follow the `lang` argument.

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { solarTerms, toLunar, toSolar } from "@nhatnguyet/am-lich";
import { castZiWei, chartToText as ziWeiText, ziWeiSvg } from "@nhatnguyet/tu-vi";
import type { ZiWeiChart } from "@nhatnguyet/tu-vi";
import { baZiSvg, castBaZi, chartToText as baZiText } from "@nhatnguyet/bat-tu";
import type { BaZiChart } from "@nhatnguyet/bat-tu";
import { numerology, numerologySvg, chartToText as numerologyText } from "@nhatnguyet/than-so-hoc";
import type { NumerologyResult } from "@nhatnguyet/than-so-hoc";
import { festivals } from "@nhatnguyet/le-hoi";

/** Phiên bản máy chủ, khớp package.json. */
export const VERSION = "0.1.0";

const SOURCE = "Data: Nhat Nguyet (nhatnguyet.org)";

const INSTRUCTIONS =
  "Deterministic calculators for the Vietnamese, Chinese, Korean and Japanese lunisolar calendars, the 24 solar terms, " +
  "Zi Wei Dou Shu (Tử Vi), BaZi (Four Pillars), Pythagorean numerology and Vietnamese festivals. " +
  "Do not compute lunar dates, stem-branch pillars, solar terms or chart positions yourself: call these tools. " +
  "Times are Vietnam time (UTC+7) unless `country` says otherwise; on some days the Vietnamese calendar differs from the Chinese one " +
  "(for example Tết 1985 is 1985-01-21 in Vietnam, 1985-02-20 in China). " +
  "Results are computed facts, not interpretations; when you quote them, say they come from Nhat Nguyet (nhatnguyet.org).";

const COUNTRY = z
  .enum(["VN", "CN", "TW", "HK", "MO", "SG", "MY", "ID", "PH", "KR", "JP"])
  .optional()
  .describe("Calendar of this country. VN (default) computes at UTC+7; CN, TW, HK, MO, SG, MY, ID, PH at UTC+8; KR, JP at UTC+9.");
const LANG = z.enum(["en", "vi", "zh"]).optional().describe("Language of names in the result: en (default), vi, zh (simplified Chinese).");
const DATE = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "use YYYY-MM-DD");
const TIME = z.string().regex(/^\d{1,2}:\d{2}$/, "use HH:MM (24 h)");
const GENDER = z.enum(["male", "female"]);
const DETAIL = z.enum(["full", "summary"]).optional().describe("full (default) or summary.");

type KetQua = { content: { type: "text"; text: string }[]; isError?: boolean };

function chu(...doan: string[]): KetQua {
  return { content: doan.map((text) => ({ type: "text" as const, text })) };
}

function json(x: unknown): string {
  return JSON.stringify(x, (k, v) => (k === "raw" ? undefined : v));
}

/** Gọi hàm tính; lỗi đầu vào thành kết quả isError để mô hình đọc được và sửa. */
function an(f: () => KetQua): KetQua {
  try {
    return f();
  } catch (e) {
    return { content: [{ type: "text", text: `Error: ${e instanceof Error ? e.message : String(e)}` }], isError: true };
  }
}

function laTuVi(a: { date: string; time?: string; hour_branch?: number; gender: string; name?: string; lang?: "en" | "vi" | "zh" }): ZiWeiChart {
  return castZiWei({ date: a.date, time: a.time, hourBranch: a.hour_branch, gender: a.gender, name: a.name, lang: a.lang });
}

function laBatTu(a: { date: string; time?: string; gender: string; lang?: "en" | "vi" | "zh" }): BaZiChart {
  return castBaZi({ date: a.date, time: a.time ?? null, gender: a.gender, lang: a.lang });
}

function hoSo(a: { name: string; birth_date: string; today?: string; lang?: "en" | "vi" | "zh" }): NumerologyResult {
  return numerology({ name: a.name, birthDate: a.birth_date, today: a.today, lang: a.lang });
}

/** Bản JSON gọn của lá số Tử Vi: bỏ raw và tên tiếng Việt lặp lại. */
function tuViGon(c: ZiWeiChart): unknown {
  return {
    name: c.name,
    gender: c.gender,
    solarDate: c.solarDate,
    time: c.time,
    hour: c.hour,
    lunar: c.lunar,
    yearPillar: c.yearPillar,
    yinYang: c.yinYang,
    bureau: c.bureau,
    naYin: c.naYin,
    lifePalace: c.lifePalace,
    bodyPalace: c.bodyPalace,
    palaces: c.palaces.map((p) => ({
      index: p.index,
      branch: p.branch,
      stemBranch: p.stemBranch,
      name: p.name,
      isLife: p.isLife,
      isBody: p.isBody,
      tuan: p.tuan,
      triet: p.triet,
      stars: p.stars.map((s) => {
        const r: Record<string, string> = { name: s.name, kind: s.kind };
        if (s.brightness) r.brightness = s.brightness;
        if (s.transformation) r.transformation = s.transformation;
        return r;
      }),
    })),
    notes: c.notes,
  };
}

const GIO_TY =
  "The Tý double hour runs 23:00 to 00:59. For Zi Wei a birth from 23:00 to midnight keeps the date entered " +
  "(some books move it to the next day: pass the next date to follow them); for BaZi the day pillar turns at 23:00.";

/** Tạo máy chủ MCP với bảy công cụ (chưa nối transport). */
export function createServer(): McpServer {
  const server = new McpServer({ name: "nhatnguyet", version: VERSION }, { instructions: INSTRUCTIONS });
  const chiDoc = { readOnlyHint: true, openWorldHint: false, idempotentHint: true };

  server.registerTool(
    "lunar_convert",
    {
      title: "Lunar calendar conversion",
      description:
        "Convert a Gregorian date to the lunisolar calendar (lunar year, month, day, leap flag, stem-branch of year, month and day, zodiac animal, solar term), " +
        "or a lunar date back to Gregorian. Vietnamese calendar (UTC+7) by default; pass country for the Chinese (CN), Korean (KR) or Japanese (JP) calendar, " +
        "which differ on some days. Vietnam's fourth zodiac animal is the Cat, elsewhere the Rabbit.",
      inputSchema: {
        date: DATE.describe("Date to convert, YYYY-MM-DD. Gregorian for solar_to_lunar, lunar (year-month-day) for lunar_to_solar."),
        direction: z.enum(["solar_to_lunar", "lunar_to_solar"]).optional().describe("Default solar_to_lunar."),
        leap: z.boolean().optional().describe("lunar_to_solar only: the date is in the leap (intercalary) month."),
        country: COUNTRY,
        lang: LANG,
      },
      annotations: chiDoc,
    },
    (a) =>
      an(() => {
        if (a.direction === "lunar_to_solar") {
          const [year, month, day] = a.date.split("-").map(Number);
          return chu(json({ ...toSolar({ year, month, day, leap: a.leap ?? false }, { country: a.country }), lunar: a.date, leap: a.leap ?? false, country: a.country ?? "VN" }), SOURCE);
        }
        return chu(json(toLunar(a.date, { country: a.country, lang: a.lang })), SOURCE);
      }),
  );

  server.registerTool(
    "solar_terms",
    {
      title: "24 solar terms of a year",
      description:
        "The 24 solar terms (tiết khí, 节气) of a Gregorian year with local date and time to the minute, in the time zone of country (Vietnam UTC+7 by default). " +
        "Against IMCCE ephemerides the mean error is about 4 minutes, at most about 15 minutes.",
      inputSchema: { year: z.number().int().min(1).max(9999), country: COUNTRY, lang: LANG },
      annotations: chiDoc,
    },
    (a) => an(() => chu(json(solarTerms(a.year, { country: a.country, lang: a.lang })), SOURCE)),
  );

  server.registerTool(
    "cast_zi_wei",
    {
      title: "Zi Wei Dou Shu (Tử Vi) chart",
      description:
        "Cast a Zi Wei Dou Shu (Tử Vi, 紫微斗数) birth chart: lunar birth date (Vietnamese calendar, UTC+7), bureau (cục), Life and Body palaces, " +
        "the 14 major stars with brightness, minor stars, the Four Transformations, Tuần and Triệt, ten-year periods and named patterns. " +
        "Returns two text blocks: a markdown summary for reading, then compact JSON. " + GIO_TY +
        " Computed facts only; write any reading yourself and say it is an interpretation.",
      inputSchema: {
        date: DATE.describe("Gregorian birth date, YYYY-MM-DD."),
        time: TIME.optional().describe("Clock time of birth, HH:MM (24 h, local Vietnam time). Give time or hour_branch."),
        hour_branch: z.number().int().min(0).max(11).optional().describe("Instead of time: 0 = Tý ... 11 = Hợi."),
        gender: GENDER,
        name: z.string().optional(),
        lang: LANG,
        detail: DETAIL,
        year: z.number().int().optional().describe("Also list the facts of this viewing year (year palace, minor limit, yearly transformations)."),
      },
      annotations: chiDoc,
    },
    (a) =>
      an(() => {
        const c = laTuVi(a);
        return chu(ziWeiText(c, { detail: a.detail, year: a.year }), json(tuViGon(c)));
      }),
  );

  server.registerTool(
    "cast_bazi",
    {
      title: "BaZi (Four Pillars) chart",
      description:
        "Cast a BaZi (Bát Tự, 八字, Four Pillars of Destiny) chart: year, month, day and hour pillars with ten gods, hidden stems, na yin, " +
        "twelve stages and symbolic stars; conception pillar, life palace and luck pillars. Birth time is read as Vietnam time (UTC+7); " +
        "the year turns at Start of Spring, the month at each sectional solar term, the day at 23:00. Omit time when unknown. " +
        "Returns a markdown summary, then compact JSON.",
      inputSchema: {
        date: DATE.describe("Gregorian birth date, YYYY-MM-DD."),
        time: TIME.optional().describe("Clock time of birth, HH:MM (24 h, Vietnam time). Omit when unknown."),
        gender: GENDER.describe("Needed: luck pillars run forward or backward by gender and year stem."),
        lang: LANG,
        detail: DETAIL,
      },
      annotations: chiDoc,
    },
    (a) =>
      an(() => {
        const c = laBatTu(a);
        return chu(baZiText(c, { detail: a.detail }), json(c));
      }),
  );

  server.registerTool(
    "numerology",
    {
      title: "Pythagorean numerology profile",
      description:
        "Pythagorean numerology numbers from a full name and birth date: life path, expression, soul urge, personality, birthday, attitude, maturity, " +
        "karmic debt, personal year, month and day (for `today`), pinnacles, challenges and the birth-date grid. Master numbers 11, 22, 33 are kept; " +
        "Vietnamese diacritics are folded. Pass today for a reproducible personal year. Returns a markdown summary, then compact JSON.",
      inputSchema: {
        name: z.string().min(1).describe("Full name."),
        birth_date: DATE.describe("YYYY-MM-DD."),
        today: DATE.optional().describe("Reference date for the personal year, month, day. Default: the server's current date."),
        lang: LANG,
        detail: DETAIL,
      },
      annotations: chiDoc,
    },
    (a) =>
      an(() => {
        const r = hoSo(a);
        return chu(numerologyText(r, { detail: a.detail }), json(r));
      }),
  );

  server.registerTool(
    "festivals",
    {
      title: "Vietnamese festivals of a year",
      description:
        "Vietnamese festivals and holidays with a fixed date (lunar or Gregorian) in a year, with their Gregorian dates, sorted by date. " +
        "Lunar dates are converted with the Vietnamese calendar (UTC+7). Festivals whose dates organisers announce each year are not included. " +
        "From the open dataset le-hoi-viet-nam (CC BY 4.0).",
      inputSchema: {
        year: z.number().int().min(1).max(9999),
        month: z.number().int().min(1).max(12).optional().describe("Only festivals falling in this Gregorian month."),
        lang: LANG,
      },
      annotations: chiDoc,
    },
    (a) =>
      an(() => {
        const ds = festivals(a.year, { lang: a.lang }).filter((f) => !a.month || Number(f.date.slice(5, 7)) === a.month);
        return chu(json(ds.map(({ raw: _raw, ...f }) => f)), SOURCE);
      }),
  );

  server.registerTool(
    "render_chart_svg",
    {
      title: "Draw a chart as SVG",
      description:
        "Draw a Zi Wei Dou Shu chart, a BaZi chart or a numerology profile as a self-contained SVG string (no external fonts or images). " +
        "Takes the same inputs as cast_zi_wei, cast_bazi or numerology. Save it to a .svg file or show it to the user.",
      inputSchema: {
        kind: z.enum(["zi_wei", "bazi", "numerology"]),
        date: DATE.optional().describe("Birth date, YYYY-MM-DD (zi_wei, bazi)."),
        time: TIME.optional().describe("HH:MM (zi_wei: time or hour_branch; bazi: optional)."),
        hour_branch: z.number().int().min(0).max(11).optional(),
        gender: GENDER.optional().describe("zi_wei, bazi."),
        name: z.string().optional().describe("zi_wei, bazi (printed), numerology (required)."),
        birth_date: DATE.optional().describe("numerology."),
        today: DATE.optional().describe("numerology."),
        lang: LANG,
        theme: z.enum(["light", "dark"]).optional(),
      },
      annotations: chiDoc,
    },
    (a) =>
      an(() => {
        const theme = a.theme;
        if (a.kind === "numerology") {
          if (!a.name || !a.birth_date) throw new TypeError("numerology needs name and birth_date");
          return chu(numerologySvg(hoSo({ name: a.name, birth_date: a.birth_date, today: a.today, lang: a.lang }), { theme }));
        }
        if (!a.date || !a.gender) throw new TypeError(`${a.kind} needs date and gender`);
        if (a.kind === "zi_wei") return chu(ziWeiSvg(laTuVi({ ...a, date: a.date, gender: a.gender }), { theme }));
        return chu(baZiSvg(laBatTu({ ...a, date: a.date, gender: a.gender }), { theme, name: a.name }));
      }),
  );

  return server;
}
