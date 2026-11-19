// Lớp API tiếng Anh của @nhatnguyet/le-hoi: lễ của một năm, xếp theo ngày,
// tên và mô tả theo `lang`. Ngày tính bằng đúng ngayDuongCuaLe của gói.
//
// English API layer for the Vietnamese festival calendar.

import { DANH_SACH_LE_HOI, ngayDuongCuaLe } from "./index.ts";
import { PROVINCES } from "./du-lieu.ts";
import type { LeHoi, Province } from "./kieu.ts";

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
  /**
   * Group, an English code in every `lang`: "holiday" (public holidays, Tết
   * and the seasonal feasts), "folk-religion", "other". The dataset's own code
   * ("le-tet", "tin-nguong", "khac") stays in `raw.nhom`.
   */
  group: string;
  /**
   * Scope, an English code in every `lang`: "national", "regional", "local",
   * "representative" (one row for a festival held in many places) or "" (not
   * classified yet). The dataset's code stays in `raw.pham_vi`.
   */
  scope: string;
  /** True for the official days off in Vietnam. */
  publicHoliday: boolean;
  /** Days the festival customarily opens before `date` (its main day) and continues after it. */
  daysBefore: number;
  daysAfter: number;
  /** Current provinces where it is held (34-unit map of 2025), name in `lang`; empty when not tied to a place or not known. */
  provinces: FestivalProvince[];
  /** True when observed nationwide (holidays, commemorations, household festivals). Can be true together with `provinces`. */
  nationwide: boolean;
  /** Ethnic groups whose festival it is (official list of 54), in `lang`; only where the description says so, otherwise empty. */
  ethnicGroups: string[];
  /** Specific venues, name in `lang`; `coordinates` and `sourceUrl` only when a sourced coordinate is known. */
  venues: FestivalVenue[];
  /** The dataset row, untouched. */
  raw: LeHoi;
}

/** A province in a festival, name in the requested language. */
export interface FestivalProvince {
  /** Stable code, e.g. "ninh-binh" (see PROVINCES). */
  code: string;
  name: string;
}

/** A venue of a festival. */
export interface FestivalVenue {
  name: string;
  /** WGS 84, only when the dataset gives a source for it. */
  coordinates: { lat: number; lon: number } | null;
  /** Where the coordinates come from (Wikidata, an official page...). */
  sourceUrl: string | null;
}

/** Split one list cell of the dataset ("a; b; c"); an empty cell gives []. */
function listCell(s: string | undefined): string[] {
  return s ? s.split("; ") : [];
}

const provinceByCode: ReadonlyMap<string, Province> = new Map(PROVINCES.map((p) => [p.code, p]));

/** Province, nationwide flag, ethnic groups and venues of one dataset row, in `lang`. */
export function festivalPlaces(le: LeHoi, lang: FestivalLang = "en"): Pick<Festival, "provinces" | "nationwide" | "ethnicGroups" | "venues"> {
  const provinces = listCell(le.tinh).map((code) => {
    const p = provinceByCode.get(code);
    return { code, name: p ? p[lang] : code };
  });
  const ethnicGroups = listCell(lang === "vi" ? le.dan_toc : lang === "en" ? le.dan_toc_en || le.dan_toc : le.dan_toc_zh || le.dan_toc);
  const vi = listCell(le.noi_to_chuc);
  const local = listCell(lang === "vi" ? le.noi_to_chuc : lang === "en" ? le.noi_to_chuc_en : le.noi_to_chuc_zh);
  const coords = listCell(le.toa_do);
  const sources = listCell(le.toa_do_nguon);
  const venues = vi.map((name, i): FestivalVenue => {
    const c = (coords[i] ?? "").split(",");
    const ok = c.length === 2 && c[0] !== "" && Number.isFinite(Number(c[0])) && Number.isFinite(Number(c[1])) && !!sources[i];
    return {
      name: local[i] || name,
      coordinates: ok ? { lat: Number(c[0]), lon: Number(c[1]) } : null,
      sourceUrl: ok ? sources[i] : null,
    };
  });
  return { provinces, nationwide: le.toan_quoc === "co", ethnicGroups, venues };
}

/** English slugs of the dataset's `nhom` (group) codes. */
export const FESTIVAL_GROUP_EN: Readonly<Record<string, string>> = { "le-tet": "holiday", "tin-nguong": "folk-religion", khac: "other" };
/** English slugs of the dataset's `pham_vi` (scope) codes. */
export const FESTIVAL_SCOPE_EN: Readonly<Record<string, string>> = {
  "quoc-gia": "national",
  vung: "regional",
  "dia-phuong": "local",
  "dai-dien": "representative",
  "": "",
};

/**
 * Festivals with a fixed date (lunar or Gregorian) in a year, sorted by date.
 * The dataset holds 206 festivals: 164 have a fixed lunar or Gregorian date
 * and are returned for every year (1900 to 2100: always 164); the other 42
 * are dated by their organisers each year and are not included (see
 * `lich_cong_bo` in `DANH_SACH_LE_HOI`).
 * Wraps `ngayDuongCuaLe`.
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
      group: FESTIVAL_GROUP_EN[le.nhom] ?? "other",
      scope: FESTIVAL_SCOPE_EN[le.pham_vi] ?? "",
      publicHoliday: le.ngay_nghi_le === "co",
      daysBefore: Number(le.ngay_truoc) || 0,
      daysAfter: Number(le.ngay_sau) || 0,
      ...festivalPlaces(le, lang),
      raw: le,
    });
  }
  // Sắp ổn định theo ngày: lễ cùng ngày giữ thứ tự của bộ dữ liệu.
  return out.map((f, i) => [f, i] as const).sort((a, b) => (a[0].date < b[0].date ? -1 : a[0].date > b[0].date ? 1 : a[1] - b[1])).map((x) => x[0]);
}
