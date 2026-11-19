// Lớp API tiếng Anh của @nhatnguyet/le-hoi: lễ của một năm, xếp theo ngày,
// tên và mô tả theo `lang`. Ngày tính bằng đúng ngayDuongCuaLe của gói.
//
// English API layer for the Vietnamese festival calendar.

import { DANH_SACH_LE_HOI, ngayDuongCuaLe } from "./index.ts";
import type { LeHoi } from "./kieu.ts";

/** Output language. */
export type FestivalLang = "vi" | "en" | "zh";

/** A festival on its Gregorian date in one year. */
export interface Festival {
  /** Stable id from the open dataset (le-hoi-viet-nam). */
  id: string;
  /** Gregorian date that year, "YYYY-MM-DD". */
  date: string;
  /** Name and description in `lang`. */
  name: string;
  description: string;
  /** "lunar": fixed lunar date (converted at UTC+7); "solar": fixed Gregorian date. */
  calendar: "lunar" | "solar";
  /** The fixed date as "day/month" in its own calendar. */
  fixedDate: string;
  /** "major" or "minor". */
  level: string;
  /** Dataset group: "le-tet" (holidays and Tết), "tin-nguong" (folk religion), "khac" (other). */
  group: string;
  /** "quoc-gia" (national), "dia-phuong" (local) or "" (not classified yet). */
  scope: string;
  /** True for the official days off in Vietnam. */
  publicHoliday: boolean;
  /** The dataset row, untouched. */
  raw: LeHoi;
}

/**
 * Festivals with a fixed date (lunar or Gregorian) in a year, sorted by date.
 * Festivals whose dates are announced each year by the organisers are not
 * included; see `raw.lich_cong_bo` in the dataset. Wraps `ngayDuongCuaLe`.
 *
 * @example festivals(2027, { lang: "en" })
 */
export function festivals(year: number, opts: { lang?: FestivalLang } = {}): Festival[] {
  if (!Number.isInteger(year)) throw new TypeError("year must be an integer");
  const lang = opts.lang ?? "en";
  if (lang !== "vi" && lang !== "en" && lang !== "zh") throw new TypeError(`lang must be "vi", "en" or "zh", got ${JSON.stringify(lang)}`);
  const out: Festival[] = [];
  for (const le of DANH_SACH_LE_HOI) {
    const sd = ngayDuongCuaLe(le, year);
    if (!sd) continue;
    const p = (n: number, w: number) => String(n).padStart(w, "0");
    out.push({
      id: le.id,
      date: `${p(sd.year, 4)}-${p(sd.month, 2)}-${p(sd.day, 2)}`,
      name: lang === "vi" ? le.ten : lang === "en" ? le.ten_en || le.ten : le.ten_zh || le.ten_en || le.ten,
      description: lang === "vi" ? le.mo_ta : lang === "en" ? le.mo_ta_en || le.mo_ta : le.mo_ta_zh || le.mo_ta_en || le.mo_ta,
      calendar: le.loai_ngay === "lunar" ? "lunar" : "solar",
      fixedDate: le.loai_ngay === "lunar" ? le.ngay_am : le.ngay_duong,
      level: le.muc_do,
      group: le.nhom,
      scope: le.pham_vi,
      publicHoliday: le.ngay_nghi_le === "co",
      raw: le,
    });
  }
  // Sắp ổn định theo ngày: lễ cùng ngày giữ thứ tự của bộ dữ liệu.
  return out.map((f, i) => [f, i] as const).sort((a, b) => (a[0].date < b[0].date ? -1 : a[0].date > b[0].date ? 1 : a[1] - b[1])).map((x) => x[0]);
}
