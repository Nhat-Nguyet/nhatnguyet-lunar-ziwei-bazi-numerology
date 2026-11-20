// Máy chủ MCP của Nhật Nguyệt: cho trợ lý AI gọi bộ máy tất định (lịch âm,
// tiết khí, Tử Vi, Bát Tự, thần số học, lễ hội, Kinh Dịch, phong thuỷ) thay
// vì tự tính. Không gọi
// mạng; mọi phép tính chạy tại chỗ bằng các gói @nhatnguyet.
//
// MCP server for the Nhat Nguyet libraries. Tool descriptions are in English
// (the language assistants read best); results follow the `lang` argument.

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { auspiciousHours, solarTerms, toLunar, toSolar } from "@nhatnguyet/am-lich";
import { castZiWei, chartToText as ziWeiText, ziWeiSvg } from "@nhatnguyet/tu-vi";
import type { ZiWeiChart } from "@nhatnguyet/tu-vi";
import { baZiSvg, castBaZi, chartToText as baZiText } from "@nhatnguyet/bat-tu";
import type { BaZiChart } from "@nhatnguyet/bat-tu";
import { numerology, numerologySvg, chartToText as numerologyText } from "@nhatnguyet/than-so-hoc";
import type { NumerologyResult } from "@nhatnguyet/than-so-hoc";
import { festivals } from "@nhatnguyet/le-hoi";
import { castCoins, dailyHexagram, hexagram, mutual, najia, opposite, reverse, text as hexagramText } from "@nhatnguyet/iching";
import { flyingStarChart, lifeGua, lubanRuler, lubanRulers } from "@nhatnguyet/fengshui";

/** Phiên bản máy chủ, khớp package.json. */
export const VERSION = "0.4.0";

const SOURCE = "Data: Nhat Nguyet (nhatnguyet.org)";

const INSTRUCTIONS =
  "Deterministic calculators for the Vietnamese, Chinese, Korean and Japanese lunisolar calendars, the 24 solar terms, auspicious hours, " +
  "Zi Wei Dou Shu (Tử Vi), BaZi (Four Pillars), Pythagorean numerology, Vietnamese festivals, the I Ching (hexagrams, Six Lines najia chart, " +
  "Gua Qi daily hexagram) and feng shui (Eight Mansions life gua, Xuan Kong flying stars, Luban rulers). " +
  "Do not compute lunar dates, stem-branch pillars, solar terms or chart positions yourself: call these tools. " +
  "Times are Vietnam time (UTC+7) unless `country` says otherwise; on some days the Vietnamese calendar differs from the Chinese one " +
  "(for example Tết 1985 is 1985-01-21 in Vietnam, 1985-02-20 in China). " +
  "Results are computed facts, not interpretations; the I Ching and feng shui tools give the rules of traditional schools, not predictions or verified effects. " +
  "When you quote results, say they come from Nhat Nguyet (nhatnguyet.org).";

const COUNTRY = z
  .enum(["VN", "CN", "TW", "HK", "MO", "SG", "MY", "ID", "PH", "KR", "JP"])
  .optional()
  .describe("Calendar of this country. VN (default) computes at UTC+7; CN, TW, HK, MO, SG, MY, ID, PH at UTC+8; KR, JP at UTC+9.");
const LANG = z.enum(["en", "vi", "zh"]).optional().describe("Language of names in the result: en (default), vi, zh (simplified Chinese).");
const TERMS = z
  .enum(["pinyin", "han", "vi"])
  .optional()
  .describe('With lang en: stems, branches and the Four Transformations as pinyin (default: "Geng Wu", "Hua Ji"), Chinese characters ("庚午") or Sino-Vietnamese ("Canh Ngọ").');
const DATE = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "use YYYY-MM-DD");
const TIME = z.string().regex(/^\d{1,2}:\d{2}$/, "use HH:MM (24 h)");
const GENDER = z.enum(["male", "female"]);
const DETAIL = z.enum(["full", "summary"]).optional().describe("full (default) or summary.");

// Lựa chọn phái (docs/schools.md): tham số phẳng snake_case như hour_branch.
const SCHOOLS_ZI_WEI = {
  fire_bell: z
    .enum(["vietnamese", "quanshu", "swap-for-female", "swap-for-yin-male-yang-female"])
    .optional()
    .describe("School for the Fire (Hỏa Tinh) and Bell (Linh Tinh) stars. vietnamese (default, Tân Biên): one forward, one backward by yin-yang and sex; quanshu (Zi Wei Dou Shu Quan Shu, as iztro): both forward; swap-for-female, swap-for-yin-male-yang-female: both forward with the starting palaces swapped."),
  leap_month: z
    .enum(["whole", "split-at-15", "next-month"])
    .optional()
    .describe("Birth in a leap lunar month. whole (default): as the month it repeats; split-at-15: days 1-15 as that month, 16 on as the next (iztro fixLeap); next-month: as the next month (Quan Shu)."),
  transformations: z
    .enum(["vietnamese", "quanshu", "zhongzhou"])
    .optional()
    .describe("Four Transformations of the Geng (Canh) stem. vietnamese (default): Tian Tong Ke, Tai Yin Ji; quanshu: Tai Yin Ke, Tian Tong Ji (as iztro); zhongzhou: Tian Fu Ke, Tian Tong Ji (Wang Tingzhi)."),
  heavenly_kitchen: z.enum(["vietnamese", "chinese"]).optional().describe("Celestial Kitchen (Thiên Trù) for a Gui (Quý) year: vietnamese (default) at Xu (Tuất), chinese at Hai (Hợi)."),
  injury_messenger: z.enum(["standard", "zhongzhou"]).optional().describe("Celestial Injury and Messenger: standard (default), or zhongzhou (swapped for yin-year men and yang-year women)."),
};
const ZI_HOUR = z
  .enum(["next-day-from-23", "split-at-midnight"])
  .optional()
  .describe("BaZi day pillar for a birth from 23:00 to 24:00. next-day-from-23 (default): next day's pillar; split-at-midnight: early and late Zi, the day pillar of the date entered.");

type SchoolArgs = { fire_bell?: string; leap_month?: string; transformations?: string; heavenly_kitchen?: string; injury_messenger?: string };

/** Tham số phẳng thành `schools` của castZiWei (bỏ khoá vắng). */
function schoolsZiWei(a: SchoolArgs): Record<string, string> | undefined {
  const r: Record<string, string> = {};
  if (a.fire_bell) r.fireBell = a.fire_bell;
  if (a.leap_month) r.leapMonth = a.leap_month;
  if (a.transformations) r.transformations = a.transformations;
  if (a.heavenly_kitchen) r.heavenlyKitchen = a.heavenly_kitchen;
  if (a.injury_messenger) r.injuryMessenger = a.injury_messenger;
  return Object.keys(r).length ? r : undefined;
}

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

type Terms = "pinyin" | "han" | "vi";

function laTuVi(a: { date: string; time?: string; hour_branch?: number; gender: string; name?: string; lang?: "en" | "vi" | "zh"; terms?: Terms } & SchoolArgs): ZiWeiChart {
  return castZiWei({ date: a.date, time: a.time, hourBranch: a.hour_branch, gender: a.gender, name: a.name, lang: a.lang, terms: a.terms, schools: schoolsZiWei(a) as never });
}

function laBatTu(a: { date: string; time?: string; gender: string; lang?: "en" | "vi" | "zh"; terms?: Terms; zi_hour?: string }): BaZiChart {
  return castBaZi({ date: a.date, time: a.time ?? null, gender: a.gender, lang: a.lang, terms: a.terms, schools: a.zi_hour ? { ziHour: a.zi_hour as never } : undefined });
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
        if (s.group) r.group = s.group;
        if (s.brightness) r.brightness = s.brightness;
        if (s.transformation) r.transformation = s.transformation;
        return r;
      }),
    })),
    notes: c.notes,
    ...(c.schools ? { schools: c.schools } : {}),
  };
}

const GIO_TY =
  "The Tý double hour runs 23:00 to 00:59. For Zi Wei a birth from 23:00 to midnight keeps the date entered " +
  "(some books move it to the next day: pass the next date to follow them); for BaZi the day pillar turns at 23:00.";

/**
 * Tạo máy chủ MCP (chưa nối transport): mười bốn công cụ, tên theo lệnh dòng
 * lệnh (cast_ziwei như `nhatnguyet ziwei`), cộng `cast_zi_wei` là tên cũ giữ
 * làm bí danh.
 */
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
        terms: TERMS,
      },
      annotations: chiDoc,
    },
    (a) =>
      an(() => {
        if (a.direction === "lunar_to_solar") {
          const [year, month, day] = a.date.split("-").map(Number);
          return chu(json({ ...toSolar({ year, month, day, leap: a.leap ?? false }, { country: a.country }), lunar: a.date, leap: a.leap ?? false, country: a.country ?? "VN" }), SOURCE);
        }
        return chu(json(toLunar(a.date, { country: a.country, lang: a.lang, terms: a.terms })), SOURCE);
      }),
  );

  server.registerTool(
    "solar_terms",
    {
      title: "24 solar terms of a year",
      description:
        "The 24 solar terms (tiết khí, 节气) of a Gregorian year with local date and time to the minute, in the time zone of country (Vietnam UTC+7 by default). " +
        "Against IMCCE ephemerides the mean error is about 4 minutes, at most about 15 minutes.",
      inputSchema: { year: z.number().int().min(1900).max(2100), country: COUNTRY, lang: LANG },
      annotations: chiDoc,
    },
    (a) => an(() => chu(json(solarTerms(a.year, { country: a.country, lang: a.lang })), SOURCE)),
  );

  server.registerTool(
    "auspicious_hours",
    {
      title: "Auspicious hours of a day",
      description:
        "The twelve double hours (two clock hours each, Vietnam time UTC+7; the Tý hour runs 23:00 to 00:59) of a Gregorian date, " +
        "each marked auspicious (giờ hoàng đạo) or inauspicious (giờ hắc đạo) with its presiding spirit (Qing Long, Ming Tang...), " +
        "as Vietnamese almanacs print them. Six hours of every day are auspicious; which six depends only on the day's earthly branch. " +
        "This is a traditional almanac convention, not a prediction.",
      inputSchema: { date: DATE.describe("Gregorian date, YYYY-MM-DD."), lang: LANG, terms: TERMS },
      annotations: chiDoc,
    },
    (a) => an(() => chu(json(auspiciousHours(a.date, { lang: a.lang, terms: a.terms })), SOURCE)),
  );

  const tuViVao = {
    date: DATE.describe("Gregorian birth date, YYYY-MM-DD."),
    time: TIME.optional().describe("Clock time of birth, HH:MM (24 h, local Vietnam time). Give time or hour_branch."),
    hour_branch: z.number().int().min(0).max(11).optional().describe("Instead of time: 0 = Zi (Tý) ... 11 = Hai (Hợi)."),
    gender: GENDER,
    name: z.string().optional(),
    lang: LANG,
    terms: TERMS,
    detail: DETAIL,
    year: z.number().int().optional().describe("Also list the facts of this viewing year (year palace, minor limit, yearly transformations)."),
    ...SCHOOLS_ZI_WEI,
  };
  const tuViMoTa =
    "Cast a Zi Wei Dou Shu (Tử Vi, 紫微斗数) birth chart: lunar birth date (Vietnamese calendar, UTC+7), bureau, Life and Body palaces, " +
    "the 14 major stars with brightness, minor stars, the Four Transformations, the Xun Kong and Jie Kong voids, ten-year periods and named patterns. " +
    "Returns two text blocks: a markdown summary for reading, then compact JSON. " + GIO_TY +
    " Where the books disagree (Fire and Bell stars, leap month, Geng transformations, Celestial Kitchen, Celestial Injury and Messenger), " +
    "the default follows the Vietnamese tradition (Tân Biên); pass fire_bell, leap_month, transformations, heavenly_kitchen or injury_messenger to follow another school. " +
    "Computed facts only; write any reading yourself and say it is an interpretation.";
  const tuViChay = (a: Parameters<typeof laTuVi>[0] & { detail?: "full" | "summary"; year?: number }) =>
    an(() => {
      const c = laTuVi(a);
      return chu(ziWeiText(c, { detail: a.detail, year: a.year }), json(tuViGon(c)));
    });
  server.registerTool("cast_ziwei", { title: "Zi Wei Dou Shu (Tử Vi) chart", description: tuViMoTa, inputSchema: tuViVao, annotations: chiDoc }, tuViChay);
  // Tên cũ (0.1, 0.2) giữ làm bí danh để cấu hình đã viết không gãy.
  server.registerTool(
    "cast_zi_wei",
    { title: "Zi Wei Dou Shu chart (alias of cast_ziwei)", description: "Same as cast_ziwei (older name). " + tuViMoTa, inputSchema: tuViVao, annotations: chiDoc },
    tuViChay,
  );

  server.registerTool(
    "cast_bazi",
    {
      title: "BaZi (Four Pillars) chart",
      description:
        "Cast a BaZi (Bát Tự, 八字, Four Pillars of Destiny) chart: year, month, day and hour pillars with ten gods, hidden stems, na yin, " +
        "twelve stages and symbolic stars; conception pillar, life palace and luck pillars. Birth time is read as Vietnam time (UTC+7); " +
        "the year turns at Start of Spring, the month at each sectional solar term, the day at 23:00 (zi_hour split-at-midnight: at midnight). Omit time when unknown. " +
        "Returns a markdown summary, then compact JSON.",
      inputSchema: {
        date: DATE.describe("Gregorian birth date, YYYY-MM-DD."),
        time: TIME.optional().describe("Clock time of birth, HH:MM (24 h, Vietnam time). Omit when unknown."),
        gender: GENDER.describe("Needed: luck pillars run forward or backward by gender and year stem."),
        lang: LANG,
        terms: TERMS,
        detail: DETAIL,
        zi_hour: ZI_HOUR,
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
        year: z.number().int().min(1900).max(2100),
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
        "Takes the same inputs as cast_ziwei, cast_bazi or numerology. Save it to a .svg file or show it to the user.",
      inputSchema: {
        kind: z.enum(["ziwei", "bazi", "numerology", "zi_wei"]).describe('ziwei, bazi or numerology ("zi_wei" is accepted as an older name of ziwei).'),
        date: DATE.optional().describe("Birth date, YYYY-MM-DD (zi_wei, bazi)."),
        time: TIME.optional().describe("HH:MM (zi_wei: time or hour_branch; bazi: optional)."),
        hour_branch: z.number().int().min(0).max(11).optional(),
        gender: GENDER.optional().describe("zi_wei, bazi."),
        name: z.string().optional().describe("zi_wei, bazi (printed), numerology (required)."),
        birth_date: DATE.optional().describe("numerology."),
        today: DATE.optional().describe("numerology."),
        lang: LANG,
        terms: TERMS,
        theme: z.enum(["light", "dark"]).optional(),
        ...SCHOOLS_ZI_WEI,
        zi_hour: ZI_HOUR,
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
        if (a.kind === "ziwei" || a.kind === "zi_wei") return chu(ziWeiSvg(laTuVi({ ...a, date: a.date, gender: a.gender }), { theme }));
        return chu(baZiSvg(laBatTu({ ...a, date: a.date, gender: a.gender }), { theme, name: a.name }));
      }),
  );

  const SCHOOLS_NOTE = " These are the rules of traditional schools as the Nhat Nguyet engine encodes them, not predictions or verified effects.";
  const HEX = z
    .union([z.number().int().min(1).max(64), z.string().min(1)])
    .describe('King Wen number 1 to 64, or a name in English ("Peace"), pinyin ("Tai"), Chinese ("泰") or Vietnamese ("Địa Thiên Thái", "Thai").');

  server.registerTool(
    "hexagram",
    {
      title: "I Ching hexagram",
      description:
        "One of the 64 I Ching hexagrams: King Wen number, symbol, names in English, pinyin, Chinese and Vietnamese, upper and lower trigrams " +
        "(image, element, direction), Eight Palaces palace with its element and generation, world and response lines, the nuclear, opposite and " +
        "reversed hexagrams, and the public domain Zhou Yi text (judgment and line statements) with James Legge's 1882 English translation. " +
        "Returns JSON. No reading or advice: write any interpretation yourself and say it is one.",
      inputSchema: { hexagram: HEX, lang: LANG, terms: TERMS },
      annotations: chiDoc,
    },
    (a) =>
      an(() => {
        const o = { lang: a.lang, terms: a.terms };
        const h = hexagram(a.hexagram, o);
        return chu(json({ hexagram: h, mutual: mutual(h.number, o), opposite: opposite(h.number, o), reverse: reverse(h.number, o), text: hexagramText(h.number) }), SOURCE);
      }),
  );

  server.registerTool(
    "six_lines_chart",
    {
      title: "I Ching Six Lines (najia) chart",
      description:
        "A Six Lines (Liu Yao, najia) chart of a cast for a date (1900 to 2100): primary and changed hexagram, moving lines, and for each line its " +
        "stem and branch, element, six relation by the palace element, six spirit by the day stem, world and response, void (empty in the day's decade), " +
        "seasonal state under the month branch and month break. The month is the BaZi month pillar at noon Vietnam time. Pass the six line values of a " +
        "cast, bottom line first (6 old yin and 9 old yang are moving, 7 young yang, 8 young yin); without lines the server tosses three coins six " +
        "times (random)." + SCHOOLS_NOTE + " Returns JSON with the cast and the chart.",
      inputSchema: {
        lines: z.array(z.number().int().min(6).max(9)).length(6).optional().describe("Six line values 6 to 9, bottom line first. Omit for a random three-coin cast."),
        date: DATE.describe("Date of the cast, YYYY-MM-DD (Vietnam time)."),
        lang: LANG,
        terms: TERMS,
      },
      annotations: { ...chiDoc, idempotentHint: false },
    },
    (a) =>
      an(() => {
        const cast = castCoins({ lines: a.lines, lang: a.lang, terms: a.terms });
        return chu(json({ cast, chart: najia(cast, { date: a.date, lang: a.lang, terms: a.terms }) }), SOURCE);
      }),
  );

  server.registerTool(
    "daily_hexagram",
    {
      title: "Hexagram of the day (Gua Qi)",
      description:
        "The hexagram ruling a date (1900 to 2100) by the Han-dynasty Gua Qi calendar of Meng Xi: sixty hexagrams of 6 7/80 days each from Inner Truth " +
        "at the true winter solstice, read at 12:00 Vietnam time; its place in the cycle and rank, the ruling line, the cardinal hexagram of the solar " +
        "term, and the time of a change of hexagram during the day. It is assigned by the calendar, not cast. Returns JSON.",
      inputSchema: { date: DATE.describe("Gregorian date, YYYY-MM-DD."), lang: LANG, terms: TERMS },
      annotations: chiDoc,
    },
    (a) => an(() => chu(json(dailyHexagram(a.date, { lang: a.lang, terms: a.terms })), SOURCE)),
  );

  server.registerTool(
    "life_gua",
    {
      title: "Feng shui life gua (Kua number)",
      description:
        "Eight Mansions (Ba Zhai, Bát Trạch) life gua or Kua number of a person: trigram, east or west group, element, and the eight directions with " +
        "their stars (Sheng Qi, Tian Yi, Yan Nian, Fu Wei favorable; Huo Hai, Liu Sha, Wu Gui, Jue Ming unfavorable) and degrees. The year is the lunar " +
        "year, turning at the lunar New Year in Vietnam time; books that turn it at the Start of Spring differ for births between the two dates (pass " +
        "lunar_year to follow them)." + SCHOOLS_NOTE + " Returns JSON.",
      inputSchema: {
        birth_date: DATE.optional().describe("Gregorian birth date, YYYY-MM-DD. Give birth_date or lunar_year."),
        lunar_year: z.number().int().min(1900).max(2100).optional().describe("Instead of birth_date: the lunar year of birth."),
        gender: GENDER,
        lang: LANG,
        terms: TERMS,
      },
      annotations: chiDoc,
    },
    (a) =>
      an(() => {
        const birth = a.birth_date ?? a.lunar_year;
        if (birth === undefined) throw new TypeError("give birth_date or lunar_year");
        return chu(json(lifeGua(birth, a.gender, { lang: a.lang, terms: a.terms })), SOURCE);
      }),
  );

  const SON = z
    .union([z.number().min(0).max(360), z.string().min(1)])
    .optional()
    .describe('A compass bearing in degrees (0 = north, 180 = south) or one of the 24 mountains ("wu", "zi", "gen"...).');
  server.registerTool(
    "flying_star_chart",
    {
      title: "Feng shui flying star chart (Xuan Kong)",
      description:
        "A Xuan Kong flying star chart (Shen school, plain facing): the period (base), mountain and facing stars of the nine palaces, the role of each " +
        "star in the period (prosperous, growing, retreating, killing, dead), the named pattern (prosperous sitting and facing, reversed, double stars) " +
        "and the castle gates. Give period (1 to 9) or year (then the 20-year period of that year), and facing or sitting. Replacement stars for a " +
        "facing near a mountain edge, and monthly stars, are not computed." + SCHOOLS_NOTE + " Returns JSON; palaces are in Lo Shu order, grid is " +
        "south on top.",
      inputSchema: {
        period: z.number().int().min(1).max(9).optional(),
        year: z.number().int().min(1900).max(2100).optional().describe("Instead of period: the year the house was built or moved into (counted from the Start of Spring)."),
        facing: SON,
        sitting: SON,
        lang: LANG,
        terms: TERMS,
      },
      annotations: chiDoc,
    },
    (a) => an(() => chu(json(flyingStarChart({ period: a.period, year: a.year, facing: a.facing, sitting: a.sitting }, { lang: a.lang, terms: a.terms })), SOURCE)),
  );

  server.registerTool(
    "luban_ruler",
    {
      title: "Luban ruler",
      description:
        "Read a length on the Luban rulers used by Vietnamese and Chinese carpenters: the 52.2 cm clear-opening rule (door and window openings), the " +
        "42.9 cm Luban rule (solid furniture, plinths, steps) and the 38.8 cm Dinglan rule (altars, graves). Gives the sector and sub-sector, whether " +
        "the book puts it in the good or bad group, and for a bad length the nearest good lengths below and above. Without ruler, all three." +
        SCHOOLS_NOTE + " Returns JSON.",
      inputSchema: {
        length: z.number().positive().describe("The length to read."),
        unit: z.enum(["cm", "mm"]).optional().describe("Default cm."),
        ruler: z.enum(["clear-opening", "luban", "dinglan"]).optional().describe("One ruler; default all three."),
        lang: LANG,
        terms: TERMS,
      },
      annotations: chiDoc,
    },
    (a) =>
      an(() => {
        const o = { unit: a.unit, lang: a.lang, terms: a.terms };
        const r = a.ruler ? lubanRuler(a.length, { ...o, ruler: a.ruler }) : lubanRulers().map((x) => lubanRuler(a.length, { ...o, ruler: x.ruler }));
        return chu(json(r), SOURCE);
      }),
  );

  return server;
}
