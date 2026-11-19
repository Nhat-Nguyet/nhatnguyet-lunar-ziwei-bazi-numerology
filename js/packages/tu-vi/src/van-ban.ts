// In lá số Tử Vi thành văn bản markdown gọn cho mô hình ngôn ngữ đọc: mỗi cung
// một khối, chỉ dữ kiện tính được (không lời luận), ba thứ tiếng, dòng cuối ghi
// nguồn. Bản Python (`nhatnguyet/van_ban.py`) ra ĐÚNG TỪNG BYTE như bản này
// (test tu-vi/test/van-ban.test.ts gọi Python so trực tiếp).
//
// Chart as compact markdown text for language models (iztro issue #220):
// one block per palace, computed facts only, vi / en / zh.

import { checkLang } from "@nhatnguyet/am-lich";
import type { Lang } from "@nhatnguyet/am-lich";
import { decadeLuck, findPatterns, localizeZiWei, yearlyLuck } from "./en.ts";
import type { ZiWeiChart, ZiWeiPalace, ZiWeiStar } from "./en.ts";
import type { LaSoTuVi } from "./kieu.ts";

/** How much to print: "summary" (major stars and transformations) or "full" (default). */
export type TextDetail = "summary" | "full";

/** Options of `chartToText`. */
export interface ChartTextOptions {
  /** Language of the text; default: the chart's `lang` ("en" for a raw chart). */
  lang?: Lang;
  /** "full" (default): every star, the ten-year periods and named patterns. "summary": major stars and transformations. */
  detail?: TextDetail;
  /** Also print the facts of this viewing year (year palace, minor limit, yearly transformations). */
  year?: number;
}

/** Dòng ghi nguồn cuối mọi văn bản, theo ngôn ngữ. */
export const SOURCE_LINE: Readonly<Record<Lang, string>> = {
  vi: "Dữ liệu: Nhật Nguyệt (nhatnguyet.org)",
  en: "Data: Nhat Nguyet (nhatnguyet.org)",
  zh: "数据：Nhat Nguyet (nhatnguyet.org)",
};

const NHAN = {
  vi: {
    title: "Lá số Tử Vi", intro: "Chỉ gồm dữ kiện tính được, không có lời luận.", colon: ": ", stop: ". ",
    name: "Họ tên", gender: "Giới tính", male: "Nam", female: "Nữ",
    solar: "Ngày sinh dương lịch", hour: "Giờ sinh", lunar: "Ngày sinh âm lịch", leap: "tháng nhuận",
    year: "Năm can chi", yinYang: "Âm dương", bureau: "Cục", naYin: "Bản mệnh (nạp âm)",
    life: "Cung Mệnh", body: "Cung Thân", calendar: "Lịch", calendarValue: "âm lịch Việt Nam, UTC+7",
    palaces: "Mười hai cung", major: "Chính tinh", minor: "Phụ tinh", growth: "Vòng Tràng Sinh",
    yearRing: "Vòng Thái Tuế", scholar: "Vòng Bác Sỹ", transformations: "Tứ Hóa", none: "không có",
    opposite: "Cung đối", tuan: "Tuần", triet: "Triệt",
    decades: "Đại vận", agesNote: "Tuổi tính theo tuổi mụ (sinh ra là 1 tuổi).", noMajor: "không có chính tinh",
    patterns: "Cách cục", noPatterns: "không nhận ra cách nào", notes: "Ghi chú",
    yearHead: "Năm {year} ({pillar}), {age} tuổi mụ", yearPalace: "Cung lưu niên", minorLimit: "Tiểu vận",
    decade: "Đại vận", outside: "ngoài mười hai đại vận", notOnChart: "không có trên lá số",
  },
  en: {
    title: "Zi Wei Dou Shu chart", intro: "Computed data only, no interpretation.", colon: ": ", stop: ". ",
    name: "Name", gender: "Gender", male: "male", female: "female",
    solar: "Birth date (Gregorian)", hour: "Birth hour", lunar: "Birth date (lunar)", leap: "leap month",
    year: "Year pillar", yinYang: "Yin-yang", bureau: "Bureau", naYin: "Na yin of the year",
    life: "Life palace", body: "Body palace", calendar: "Calendar", calendarValue: "Vietnamese lunar calendar, UTC+7",
    palaces: "Palaces", major: "Major stars", minor: "Minor stars", growth: "Twelve stages",
    yearRing: "Year ring (Thái Tuế)", scholar: "Scholar ring (Bác Sỹ)", transformations: "Transformations", none: "none",
    opposite: "Opposite palace", tuan: "Tuần void", triet: "Triệt void",
    decades: "Ten-year periods", agesNote: "Ages are East Asian ages (1 at birth).", noMajor: "no major star",
    patterns: "Named patterns", noPatterns: "none found", notes: "Notes",
    yearHead: "Year {year} ({pillar}), East Asian age {age}", yearPalace: "Year palace", minorLimit: "Minor limit",
    decade: "Ten-year period", outside: "outside the twelve periods", notOnChart: "not on the chart",
  },
  zh: {
    title: "紫微斗数命盘", intro: "仅列可计算的数据，不含论断。", colon: "：", stop: "。",
    name: "姓名", gender: "性别", male: "男", female: "女",
    solar: "公历生日", hour: "出生时辰", lunar: "农历生日", leap: "闰月",
    year: "年干支", yinYang: "阴阳", bureau: "五行局", naYin: "年纳音",
    life: "命宫", body: "身宫", calendar: "历法", calendarValue: "越南农历，UTC+7",
    palaces: "十二宫", major: "主星", minor: "辅星", growth: "长生十二神",
    yearRing: "岁前十二神", scholar: "博士十二神", transformations: "四化", none: "无",
    opposite: "对宫", tuan: "旬空", triet: "截空",
    decades: "大限", agesNote: "年龄按虚岁计（出生即一岁）。", noMajor: "无主星",
    patterns: "格局", noPatterns: "未识别出格局", notes: "说明",
    yearHead: "{year}年（{pillar}），虚岁{age}", yearPalace: "流年命宫", minorLimit: "小限",
    decade: "大限", outside: "不在十二大限内", notOnChart: "不在命盘上",
  },
} as const;

/** Thay {khoá} trong mẫu câu. */
function dien(mau: string, vao: Record<string, string | number>): string {
  return mau.replace(/\{(\w+)\}/g, (_, k: string) => String(vao[k]));
}

function sao(s: ZiWeiStar): string {
  const them: string[] = [];
  if (s.brightness) them.push(s.brightness);
  if (s.transformation) them.push(s.transformation);
  return them.length ? `${s.name} (${them.join(", ")})` : s.name;
}

function dsSao(ds: ZiWeiStar[]): string {
  return ds.map(sao).join(", ");
}

/** Biến mọi dạng đầu vào thành lá số tiếng Anh ở đúng ngôn ngữ. */
function chuanHoa(chart: ZiWeiChart | Omit<ZiWeiChart, "toSvg"> | LaSoTuVi, lang?: Lang): ZiWeiChart {
  if (chart && typeof chart === "object" && "raw" in chart && "palaces" in chart) {
    return localizeZiWei(chart.raw, checkLang(lang ?? chart.lang), { time: chart.time, viewYear: chart.viewYear });
  }
  if (chart && typeof chart === "object" && "cung" in chart) return localizeZiWei(chart, checkLang(lang ?? "en"), { viewYear: 0 });
  throw new TypeError("chartToText expects a chart from castZiWei or lapLaSoTuVi");
}

/**
 * Print a Zi Wei Dou Shu chart as compact markdown for a language model: the
 * birth data, then one block per palace (from the Life palace, in the usual
 * order), optionally the ten-year periods, named patterns and a viewing year.
 * Only computed facts; no interpretation. Ends with the source line.
 *
 * @example chartToText(castZiWei({ date: "1990-09-19", time: "20:00", gender: "male" }), { lang: "en" })
 */
export function chartToText(chart: ZiWeiChart | Omit<ZiWeiChart, "toSvg"> | LaSoTuVi, opts: ChartTextOptions = {}): string {
  const c = chuanHoa(chart, opts.lang);
  const l = c.lang;
  const t = NHAN[l];
  const day = opts.detail !== "summary";
  if (opts.detail !== undefined && opts.detail !== "summary" && opts.detail !== "full") {
    throw new TypeError(`detail must be "summary" or "full", got ${JSON.stringify(opts.detail)}`);
  }
  const d: string[] = [];
  const dong = (nhan: string, giaTri: string | number) => d.push(`- ${nhan}${t.colon}${giaTri}`);
  d.push(`# ${t.title}`, "", t.intro, "");
  if (c.name) dong(t.name, c.name);
  dong(t.gender, c.gender === "female" ? t.female : t.male);
  dong(t.solar, c.time ? `${c.solarDate} ${c.time}` : c.solarDate);
  dong(t.hour, `${c.hour.name} (${c.hour.range})`);
  const p2 = (n: number) => String(n).padStart(2, "0");
  const am = `${String(c.lunar.year).padStart(4, "0")}-${p2(c.lunar.month)}-${p2(c.lunar.day)}`;
  dong(t.lunar, c.lunar.leap ? `${am} (${t.leap})` : am);
  dong(t.year, c.yearPillar);
  dong(t.yinYang, c.yinYang);
  dong(t.bureau, `${c.bureau.name} (${c.bureau.number})`);
  dong(t.naYin, c.naYin);
  const menh = c.palaces[c.lifePalace];
  const than = c.palaces[c.bodyPalace];
  dong(t.life, menh.branch);
  dong(t.body, `${than.branch} (${than.name})`);
  dong(t.calendar, t.calendarValue);

  d.push("", `## ${t.palaces}`);
  for (let k = 0; k < 12; k++) {
    const cung: ZiWeiPalace = c.palaces[(((c.lifePalace - k) % 12) + 12) % 12];
    const dau = [`${cung.name} (${cung.branch}, ${cung.stemBranch})`];
    if (cung.isBody && !cung.isLife) dau.push(t.body);
    if (cung.tuan) dau.push(t.tuan);
    if (cung.triet) dau.push(t.triet);
    d.push("", `### ${dau.join(" · ")}`);
    const chinh = cung.stars.filter((s) => s.kind === "major");
    if (chinh.length) {
      dong(t.major, dsSao(chinh));
    } else {
      const doi = c.palaces[(cung.index + 6) % 12];
      const muon = doi.stars.filter((s) => s.kind === "major");
      dong(t.major, `${t.none}${t.stop}${t.opposite} (${doi.name}, ${doi.branch})${t.colon}${muon.length ? dsSao(muon) : t.none}`);
    }
    if (day) {
      const phu = cung.stars.filter((s) => s.kind === "minor");
      if (phu.length) dong(t.minor, dsSao(phu));
      for (const [kind, nhan] of [["growth", t.growth], ["year-ring", t.yearRing], ["scholar", t.scholar]] as const) {
        const v = cung.stars.filter((s) => s.kind === kind);
        if (v.length) dong(nhan, dsSao(v));
      }
    } else {
      const hoa = cung.stars.filter((s) => s.kind !== "major" && s.transformation);
      if (hoa.length) dong(t.transformations, dsSao(hoa));
    }
  }

  if (day) {
    d.push("", `## ${t.decades}`, "", t.agesNote);
    for (const v of decadeLuck(c)) {
      d.push(`- ${v.fromAge}-${v.toAge} (${v.fromYear}-${v.toYear})${t.colon}${v.palace} (${v.branch})${t.colon}${v.majorStars.length ? v.majorStars.join(", ") : t.noMajor}`);
    }
    d.push("", `## ${t.patterns}`);
    const cc = findPatterns(c);
    if (!cc.length) d.push(`- ${t.noPatterns}`);
    for (const p of cc) d.push(p.palace ? `- ${p.name} (${p.palace})` : `- ${p.name}`);
  }

  if (opts.year !== undefined) {
    if (!Number.isInteger(opts.year)) throw new TypeError("year must be an integer");
    const y = yearlyLuck(c, opts.year);
    d.push("", `## ${dien(t.yearHead, { year: y.year, pillar: y.yearPillar, age: y.age })}`);
    dong(t.yearPalace, `${y.yearPalace.branch} (${y.yearPalace.palace})`);
    dong(t.minorLimit, `${y.minorLimit.branch} (${y.minorLimit.palace})`);
    dong(t.decade, y.decade ? `${y.decade.fromAge}-${y.decade.toAge} (${y.decade.palace})` : t.outside);
    for (const h of y.transformations) dong(h.type, `${h.star} (${h.palace ?? t.notOnChart})`);
  }

  d.push("", `## ${t.notes}`);
  for (const n of c.notes) d.push(`- ${n}`);
  d.push("", SOURCE_LINE[l]);
  return d.join("\n") + "\n";
}

/** Same as `chartToText` (explicit name when several packages are imported together). */
export const ziWeiToText = chartToText;
