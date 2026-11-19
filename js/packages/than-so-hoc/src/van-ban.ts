// In hồ sơ thần số học thành văn bản markdown gọn cho mô hình ngôn ngữ đọc:
// mỗi nhóm chỉ số một khối, chỉ con số tính được (không lời luận), ba thứ
// tiếng, dòng cuối ghi nguồn. Bản Python (`nhatnguyet/van_ban.py`) ra ĐÚNG TỪNG
// BYTE như bản này (test than-so-hoc/test/van-ban.test.ts gọi Python so trực tiếp).
//
// Numerology profile as compact markdown text for language models.

import { NUMEROLOGY_LABELS } from "./en.ts";
import type { NumerologyLang, NumerologyResult } from "./en.ts";
import type { HoSoThanSoHocSau } from "./index.ts";

/** How much to print: "summary" (core numbers) or "full" (default). */
export type TextDetail = "summary" | "full";

/** Options of `chartToText`. */
export interface ChartTextOptions {
  /** Language of the text; default: the profile's `lang` ("en" for a raw profile). */
  lang?: NumerologyLang;
  /** "full" (default): adds personal month and day, pinnacles, challenges and the birth grid. */
  detail?: TextDetail;
}

/** Dòng ghi nguồn cuối mọi văn bản, theo ngôn ngữ. */
export const SOURCE_LINE: Readonly<Record<NumerologyLang, string>> = {
  vi: "Dữ liệu: Nhật Nguyệt (nhatnguyet.org)",
  en: "Data: Nhat Nguyet (nhatnguyet.org)",
  zh: "数据：Nhat Nguyet (nhatnguyet.org)",
};

const NHAN = {
  vi: {
    title: "Hồ sơ thần số học (Pythagoras)", intro: "Chỉ gồm con số tính được, không có lời luận.", colon: ": ",
    name: "Họ tên", birth: "Ngày sinh", today: "Ngày xem", core: "Chỉ số chính", cycles: "Chu kỳ cá nhân",
    none: "không có", toAge: "tới {age} tuổi", life: "trọn đời",
    master: "Giữ nguyên số chủ 11, 22, 33. Họ tên bỏ dấu, chỉ tính chữ A tới Z.",
  },
  en: {
    title: "Numerology profile (Pythagorean)", intro: "Computed numbers only, no interpretation.", colon: ": ",
    name: "Name", birth: "Birth date", today: "Reference date", core: "Core numbers", cycles: "Personal cycles",
    none: "none", toAge: "to age {age}", life: "for life",
    master: "Master numbers 11, 22, 33 are kept. Diacritics are folded; only letters A to Z count.",
  },
  zh: {
    title: "数字命理档案（毕达哥拉斯）", intro: "仅列可计算的数字，不含论断。", colon: "：",
    name: "姓名", birth: "出生日期", today: "参照日期", core: "核心数字", cycles: "个人周期",
    none: "无", toAge: "至{age}岁", life: "终身",
    master: "保留大师数 11、22、33。姓名去掉声调符号，只计 A 至 Z 字母。",
  },
} as const;

/** Profile with the fields the text needs (name and dates may be empty for a raw profile). */
type HoSo = Omit<NumerologyResult, "toSvg" | "raw" | "labels" | "lang">;

function tuThoi(r: HoSoThanSoHocSau): HoSo {
  const p = r.soDinhCao;
  const c = r.soThachThuc;
  return {
    name: "", birthDate: "", today: "",
    lifePath: r.soDuongDoi, expression: r.soSuMenh, soulUrge: r.soLinhHon, personality: r.soNhanCach,
    attitude: r.soThaiDo, birthday: r.soNgaySinh, maturity: r.soTruongThanh,
    personalYear: r.soNamCaNhan, personalMonth: r.soThangCaNhan, personalDay: r.soNgayCaNhan,
    grid: { ...r.luoiPythago },
    pinnacles: [
      { number: p.dinh1, toAge: p.tuoiKetThucDinh1 },
      { number: p.dinh2, toAge: p.tuoiKetThucDinh2 },
      { number: p.dinh3, toAge: p.tuoiKetThucDinh3 },
      { number: p.dinh4, toAge: null },
    ],
    challenges: [c.thachThuc1, c.thachThuc2, c.thachThuc3, c.thachThuc4],
    karmicDebt: r.soNoNghiepNgaySinh ?? null,
  };
}

/**
 * Print a numerology profile (from `numerology` or `tinhHoSoThanSoHocSau`) as
 * compact markdown for a language model. Only computed numbers; no
 * interpretation. Ends with the source line.
 *
 * @example chartToText(numerology({ name: "Nguyen Van An", birthDate: "1990-09-19", today: "2026-11-19" }))
 */
export function chartToText(profile: NumerologyResult | Omit<NumerologyResult, "toSvg"> | HoSoThanSoHocSau, opts: ChartTextOptions = {}): string {
  if (opts.detail !== undefined && opts.detail !== "summary" && opts.detail !== "full") {
    throw new TypeError(`detail must be "summary" or "full", got ${JSON.stringify(opts.detail)}`);
  }
  let r: HoSo;
  let lang: NumerologyLang;
  if (profile && typeof profile === "object" && "lifePath" in profile) {
    r = profile;
    lang = opts.lang ?? profile.lang;
  } else if (profile && typeof profile === "object" && "soDuongDoi" in profile) {
    r = tuThoi(profile);
    lang = opts.lang ?? "en";
  } else {
    throw new TypeError("chartToText expects a profile from numerology or tinhHoSoThanSoHocSau");
  }
  if (lang !== "vi" && lang !== "en" && lang !== "zh") throw new TypeError(`lang must be "vi", "en" or "zh", got ${JSON.stringify(lang)}`);
  const t = NHAN[lang];
  const n = NUMEROLOGY_LABELS[lang];
  const day = opts.detail !== "summary";
  const d: string[] = [];
  const dong = (nhan: string, giaTri: string | number) => d.push(`- ${nhan}${t.colon}${giaTri}`);
  d.push(`# ${t.title}`, "", t.intro);
  if (r.name || r.birthDate || r.today) d.push("");
  if (r.name) dong(t.name, r.name);
  if (r.birthDate) dong(t.birth, r.birthDate);
  if (r.today) dong(t.today, r.today);

  d.push("", `## ${t.core}`);
  dong(n.lifePath, r.lifePath);
  dong(n.expression, r.expression);
  dong(n.soulUrge, r.soulUrge);
  dong(n.personality, r.personality);
  dong(n.birthday, r.birthday);
  if (day) {
    dong(n.attitude, r.attitude);
    dong(n.maturity, r.maturity);
  }
  dong(n.karmicDebt, r.karmicDebt ?? t.none);

  d.push("", `## ${t.cycles}`);
  dong(r.today ? `${n.personalYear} (${r.today.slice(0, 4)})` : n.personalYear, r.personalYear);
  if (day) {
    dong(n.personalMonth, r.personalMonth);
    dong(n.personalDay, r.personalDay);
    d.push("", `## ${n.pinnacles}`);
    r.pinnacles.forEach((p, i) => dong(String(i + 1), `${p.number} (${p.toAge === null ? t.life : t.toAge.replace("{age}", String(p.toAge))})`));
    d.push("", `## ${n.challenges}`);
    r.challenges.forEach((c, i) => dong(String(i + 1), c));
    d.push("", `## ${n.grid}`);
    const g = r.grid as Record<string, number>;
    d.push(["1", "2", "3", "4", "5", "6", "7", "8", "9"].map((k) => `${k}${t.colon}${g[k]}`).join(", "));
  }

  d.push("", t.master, "", SOURCE_LINE[lang]);
  return d.join("\n") + "\n";
}

/** Same as `chartToText` (explicit name when several packages are imported together). */
export const numerologyToText = chartToText;
