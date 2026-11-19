// Lựa chọn phái của lá số Tử Vi (chuyển ngữ coreengine/tuy_chon_phai.go).
// Khoá và giá trị tiếng Anh (API công khai của thư viện bằng tiếng Anh); mặc
// định giữ đúng từng byte lá số cũ. Nguồn của từng lựa chọn ở bản Go và ở
// docs/schools.md.
//
// School options of the Zi Wei chart: where the books disagree, as named,
// documented parameters. Defaults reproduce the previous output byte for byte.
// Sources: thu-vien-mo/docs/schools.md.

import { mod } from "./phu-thuoc.ts";
import type { LunarDate } from "./phu-thuoc.ts";
import { TU_HOA_THEO_CAN } from "./du-lieu.ts";
import type { TuHoa } from "./du-lieu.ts";
import { khoiHoaLinh, viTriHoaLinh, viTriThienTru } from "./sao-phu-them.ts";
import type { BaNgonNgu } from "./kieu.ts";

/**
 * How Hỏa Tinh (Fire Star) and Linh Tinh (Bell Star) are counted.
 * - "vietnamese" (default): Tử Vi Đẩu Số Tân Biên 8.6.3; yang-year men and
 *   yin-year women count Fire forward and Bell backward, the others the reverse.
 * - "quanshu": Zi Wei Dou Shu Quan Shu (as iztro): both count forward.
 * - "swap-for-female": Việt Viêm Tử: both forward, starting palaces swapped for women.
 * - "swap-for-yin-male-yang-female": the three charts printed by Quan Xuân Thịnh:
 *   both forward, starting palaces swapped for yin-year men and yang-year women.
 */
export type FireBellSchool = "vietnamese" | "quanshu" | "swap-for-female" | "swap-for-yin-male-yang-female";
/**
 * Birth in a leap lunar month.
 * - "whole" (default): the whole leap month counts as the month it repeats.
 * - "split-at-15": days 1 to 15 as that month, day 16 on as the next month (Đẩu Số Tinh Thành; iztro `fixLeap`).
 * - "next-month": the whole leap month counts as the next month (Quan Shu, book 2).
 */
export type LeapMonthRule = "whole" | "split-at-15" | "next-month";
/**
 * Four Transformations table; only the Canh (Geng) row differs.
 * - "vietnamese" (default): Thiên Đồng Ke, Thái Âm Ji (Huyền Vi, Thiên Lương, Việt Viêm Tử).
 * - "quanshu": Thái Âm Ke, Thiên Đồng Ji (Quan Shu, Tân Biên; as iztro).
 * - "zhongzhou": Thiên Phủ Ke, Thiên Đồng Ji (Wang Tingzhi).
 */
export type TransformationSchool = "vietnamese" | "quanshu" | "zhongzhou";
/** Thiên Trù (Celestial Kitchen) for a Quý (Gui) year: "vietnamese" (default, at Tuất) or "chinese" (at Hợi). */
export type HeavenlyKitchenSchool = "vietnamese" | "chinese";
/** Thiên Thương and Thiên Sứ: "standard" (default) or "zhongzhou" (swapped for yin-year men and yang-year women). */
export type InjuryMessengerSchool = "standard" | "zhongzhou";

/** School options of a Zi Wei chart. Omitted keys take the default. */
export interface ZiWeiSchools {
  fireBell?: FireBellSchool;
  leapMonth?: LeapMonthRule;
  transformations?: TransformationSchool;
  heavenlyKitchen?: HeavenlyKitchenSchool;
  injuryMessenger?: InjuryMessengerSchool;
}

/** Accepted values of each option, the default first. */
export const ZI_WEI_SCHOOL_VALUES = {
  fireBell: ["vietnamese", "quanshu", "swap-for-female", "swap-for-yin-male-yang-female"],
  leapMonth: ["whole", "split-at-15", "next-month"],
  transformations: ["vietnamese", "quanshu", "zhongzhou"],
  heavenlyKitchen: ["vietnamese", "chinese"],
  injuryMessenger: ["standard", "zhongzhou"],
} as const satisfies Record<keyof ZiWeiSchools, readonly string[]>;

/** Thứ tự khoá cố định (như thứ tự trường của struct Go). */
export const ZI_WEI_SCHOOL_KEYS = ["fireBell", "leapMonth", "transformations", "heavenlyKitchen", "injuryMessenger"] as const;

/**
 * Bỏ giá trị mặc định, ném lỗi giá trị lạ (thông điệp như bản Go). Trả
 * undefined khi mọi lựa chọn là mặc định.
 */
export function normalizeZiWeiSchools(o: unknown): ZiWeiSchools | undefined {
  if (o === undefined || o === null) return undefined;
  if (typeof o !== "object" || Array.isArray(o)) throw new TypeError("schools must be an object");
  const r: Record<string, string> = {};
  for (const k of Object.keys(o)) {
    if (!(ZI_WEI_SCHOOL_KEYS as readonly string[]).includes(k)) {
      throw new RangeError(`unknown school option ${JSON.stringify(k)}; use ${ZI_WEI_SCHOOL_KEYS.join(", ")}`);
    }
  }
  for (const k of ZI_WEI_SCHOOL_KEYS) {
    const v = (o as Record<string, unknown>)[k];
    if (v === undefined || v === null || v === "") continue;
    const hopLe: readonly string[] = ZI_WEI_SCHOOL_VALUES[k];
    if (typeof v !== "string" || !hopLe.includes(v)) {
      throw new RangeError(`invalid ${k} ${JSON.stringify(v)}, expected one of: ${hopLe.join(", ")}`);
    }
    if (v !== hopLe[0]) r[k] = v;
  }
  return Object.keys(r).length ? (r as ZiWeiSchools) : undefined;
}

/** Hàng can Canh theo từng lối (hàng các can khác như TU_HOA_THEO_CAN). */
const TU_HOA_CANH: Readonly<Record<string, TuHoa>> = {
  quanshu: { loc: "Thái Dương", quyen: "Vũ Khúc", khoa: "Thái Âm", ky: "Thiên Đồng" },
  zhongzhou: { loc: "Thái Dương", quyen: "Vũ Khúc", khoa: "Thiên Phủ", ky: "Thiên Đồng" },
};

/** Bốn sao hóa của can chỉ số canIdx (0 là Giáp) theo lựa chọn transformations. */
export function tuHoaTheoPhai(canIdx: number, transformations?: string): TuHoa {
  if (canIdx === 6 && transformations && TU_HOA_CANH[transformations]) return TU_HOA_CANH[transformations];
  return TU_HOA_THEO_CAN[mod(canIdx, 10)];
}

/** Tháng âm dùng để an sao theo lựa chọn leapMonth (tháng thường: chính nó). */
export function thangAnTheoPhai(am: LunarDate, leapMonth?: string): number {
  if (!am.leap) return am.month;
  const sau = (am.month % 12) + 1;
  if (leapMonth === "next-month") return sau;
  if (leapMonth === "split-at-15" && am.day > 15) return sau;
  return am.month;
}

/** Hỏa Tinh, Linh Tinh theo lựa chọn fireBell (undefined: lối Tân Biên). */
export function viTriHoaLinhTheoPhai(chiNam: number, gio: number, amDuongNamNu: number, nu: boolean, fireBell?: string): [number, number] {
  let [kh, kl] = khoiHoaLinh(chiNam);
  switch (fireBell) {
    case "quanshu":
      break;
    case "swap-for-female":
      if (nu) [kh, kl] = [kl, kh];
      break;
    case "swap-for-yin-male-yang-female":
      if (amDuongNamNu < 0) [kh, kl] = [kl, kh];
      break;
    default:
      return viTriHoaLinh(chiNam, gio, amDuongNamNu);
  }
  return [mod(kh + gio, 12), mod(kl + gio, 12)];
}

/** Thiên Trù theo lựa chọn heavenlyKitchen ("chinese": can Quý ở Hợi). */
export function viTriThienTruTheoPhai(canNam: number, heavenlyKitchen?: string): number {
  if (heavenlyKitchen === "chinese" && mod(canNam, 10) === 9) return 11;
  return viTriThienTru(canNam);
}

// ── Lời rào ghép theo lựa chọn (chép từ bản Go) ──────────────────────────

const DAU: BaNgonNgu = {
  vi: "Lá số lập theo bản phổ biến ở Việt Nam, phần lớn theo Tử Vi Đẩu Số Tân Biên. " +
    "Tứ Hóa của can Canh, Tân, Nhâm có dị bản giữa các phái. ",
  en: "This chart follows the version most used in Vietnam, largely after Tử Vi Đẩu Số Tân Biên. " +
    "The Four Transformations for the stems Canh, Tân and Nhâm differ between schools. ",
  zh: "本命盘按越南最通行的版本排出，大体依《紫微斗数新编》。" +
    "庚、辛、壬三干的四化各派说法不一。",
};

const TU_HOA: Readonly<Record<string, BaNgonNgu>> = {
  "": {
    vi: "Riêng can Canh, lá số này dùng Thiên Đồng hóa Khoa, Thái Âm hóa Kỵ theo Huyền Vi, Thiên Lương và Việt Viêm Tử; Tân Biên và Tử Vi Đẩu Số toàn thư ghi Thái Âm hóa Khoa, Thiên Đồng hóa Kỵ; có sách ghi Thiên Phủ hóa Khoa, Thiên Đồng hóa Kỵ. ",
    en: "For Canh, this chart uses Thiên Đồng as Hóa Khoa and Thái Âm as Hóa Kỵ, after Huyền Vi, Thiên Lương and Việt Viêm Tử; Tân Biên and the Tử Vi Đẩu Số Toàn Thư give Thái Âm as Hóa Khoa and Thiên Đồng as Hóa Kỵ; others give Thiên Phủ as Hóa Khoa and Thiên Đồng as Hóa Kỵ. ",
    zh: "庚干本命盘取天同化科、太阴化忌，依三位越南作者的紫微书；《紫微斗数新编》与《紫微斗数全书》作太阴化科、天同化忌；也有的书作天府化科、天同化忌。",
  },
  quanshu: {
    vi: "Riêng can Canh, lá số này dùng Thái Âm hóa Khoa, Thiên Đồng hóa Kỵ theo Tân Biên và Tử Vi Đẩu Số toàn thư; Huyền Vi, Thiên Lương và Việt Viêm Tử ghi Thiên Đồng hóa Khoa, Thái Âm hóa Kỵ; Vương Đình Chi ghi Thiên Phủ hóa Khoa, Thiên Đồng hóa Kỵ. ",
    en: "For Canh, this chart uses Thái Âm as Hóa Khoa and Thiên Đồng as Hóa Kỵ, after Tân Biên and the Tử Vi Đẩu Số Toàn Thư; Huyền Vi, Thiên Lương and Việt Viêm Tử give Thiên Đồng as Hóa Khoa and Thái Âm as Hóa Kỵ; Wang Tingzhi gives Thiên Phủ as Hóa Khoa and Thiên Đồng as Hóa Kỵ. ",
    zh: "庚干本命盘取太阴化科、天同化忌，依《紫微斗数新编》与《紫微斗数全书》；三位越南作者的紫微书作天同化科、太阴化忌；王亭之作天府化科、天同化忌。",
  },
  zhongzhou: {
    vi: "Riêng can Canh, lá số này dùng Thiên Phủ hóa Khoa, Thiên Đồng hóa Kỵ theo Vương Đình Chi (phái Trung Châu); Tân Biên và Tử Vi Đẩu Số toàn thư ghi Thái Âm hóa Khoa, Thiên Đồng hóa Kỵ; Huyền Vi, Thiên Lương và Việt Viêm Tử ghi Thiên Đồng hóa Khoa, Thái Âm hóa Kỵ. ",
    en: "For Canh, this chart uses Thiên Phủ as Hóa Khoa and Thiên Đồng as Hóa Kỵ, after Wang Tingzhi (Zhongzhou school); Tân Biên and the Tử Vi Đẩu Số Toàn Thư give Thái Âm as Hóa Khoa and Thiên Đồng as Hóa Kỵ; Huyền Vi, Thiên Lương and Việt Viêm Tử give Thiên Đồng as Hóa Khoa and Thái Âm as Hóa Kỵ. ",
    zh: "庚干本命盘取天府化科、天同化忌，依王亭之（中州派）；《紫微斗数新编》与《紫微斗数全书》作太阴化科、天同化忌；三位越南作者的紫微书作天同化科、太阴化忌。",
  },
};

const HOA_LINH: Readonly<Record<string, BaNgonNgu>> = {
  "": {
    vi: "Hỏa Tinh, Linh Tinh an theo Tân Biên: Dương Nam, Âm Nữ đếm Hỏa thuận, Linh nghịch; Âm Nam, Dương Nữ ngược lại. Tử Vi Đẩu Số toàn thư đếm cả hai sao thuận.",
    en: "Hỏa Tinh and Linh Tinh follow Tân Biên: for a yang-year man or yin-year woman Hỏa Tinh counts forward and Linh Tinh backward, the other way round for a yin-year man or yang-year woman. The Tử Vi Đẩu Số Toàn Thư counts both forward.",
    zh: "火星、铃星依《紫微斗数新编》安：阳男阴女火星顺数、铃星逆数，阴男阳女相反。《紫微斗数全书》二星皆顺数。",
  },
  quanshu: {
    vi: "Hỏa Tinh, Linh Tinh an theo Tử Vi Đẩu Số toàn thư: cả hai sao đếm thuận, không xét âm dương nam nữ. Tân Biên đếm Hỏa thuận, Linh nghịch với Dương Nam, Âm Nữ và ngược lại với Âm Nam, Dương Nữ.",
    en: "Hỏa Tinh and Linh Tinh follow the Tử Vi Đẩu Số Toàn Thư: both count forward whatever the sex and year polarity. Tân Biên counts Hỏa Tinh forward and Linh Tinh backward for a yang-year man or yin-year woman, the other way round for a yin-year man or yang-year woman.",
    zh: "火星、铃星依《紫微斗数全书》安：二星皆顺数，不分阴阳男女。《紫微斗数新编》阳男阴女火星顺数、铃星逆数，阴男阳女相反。",
  },
  "swap-for-female": {
    vi: "Hỏa Tinh, Linh Tinh an theo Việt Viêm Tử (Tử Vi áo bí biện chứng học): cả hai sao đếm thuận, người nữ đổi cung khởi của hai sao cho nhau. Tân Biên đếm Hỏa thuận, Linh nghịch với Dương Nam, Âm Nữ và ngược lại với Âm Nam, Dương Nữ.",
    en: "Hỏa Tinh and Linh Tinh follow Việt Viêm Tử (Tử Vi áo bí biện chứng học): both count forward, and for a woman the two starting palaces are swapped. Tân Biên counts Hỏa Tinh forward and Linh Tinh backward for a yang-year man or yin-year woman, the other way round for a yin-year man or yang-year woman.",
    zh: "火星、铃星依 Việt Viêm Tử（《Tử Vi áo bí biện chứng học》）安：二星皆顺数，女命二星起宫互换。《紫微斗数新编》阳男阴女火星顺数、铃星逆数，阴男阳女相反。",
  },
  "swap-for-yin-male-yang-female": {
    vi: "Hỏa Tinh, Linh Tinh an như ba lá số in trong Số Tử Vi Kinh Nghiệm (Quan Xuân Thịnh): cả hai sao đếm thuận, Âm Nam, Dương Nữ đổi cung khởi của hai sao cho nhau. Tân Biên đếm Hỏa thuận, Linh nghịch với Dương Nam, Âm Nữ và ngược lại với Âm Nam, Dương Nữ.",
    en: "Hỏa Tinh and Linh Tinh are placed as in the three charts printed in Số Tử Vi Kinh Nghiệm (Quan Xuân Thịnh): both count forward, and for a yin-year man or yang-year woman the two starting palaces are swapped. Tân Biên counts Hỏa Tinh forward and Linh Tinh backward for a yang-year man or yin-year woman, the other way round for a yin-year man or yang-year woman.",
    zh: "火星、铃星依 Quan Xuân Thịnh《Số Tử Vi Kinh Nghiệm》所载三张命盘安：二星皆顺数，阴男阳女二星起宫互换。《紫微斗数新编》阳男阴女火星顺数、铃星逆数，阴男阳女相反。",
  },
};

const THANG_NHUAN: Readonly<Record<string, BaNgonNgu>> = {
  "split-at-15": {
    vi: " Sinh tháng nhuận: từ mùng 1 tới 15 an như tháng cùng số, từ ngày 16 an như tháng sau, theo Đẩu số tinh thành; lá số mặc định an cả tháng nhuận như tháng cùng số.",
    en: " Born in a leap month: days 1 to 15 are placed as the month with the same number, from day 16 as the following month, after Đẩu Số Tinh Thành; the default chart places the whole leap month as the month with the same number.",
    zh: "闰月出生：初一至十五按同数之月安，十六以后按下一月安，依《Đẩu số tinh thành》；默认命盘整个闰月按同数之月安。",
  },
  "next-month": {
    vi: " Sinh tháng nhuận: an như tháng sau, theo Tử Vi Đẩu Số toàn thư; lá số mặc định an cả tháng nhuận như tháng cùng số.",
    en: " Born in a leap month: placed as the following month, after the Tử Vi Đẩu Số Toàn Thư; the default chart places the whole leap month as the month with the same number.",
    zh: "闰月出生：按下一月安，依《紫微斗数全书》；默认命盘整个闰月按同数之月安。",
  },
};

const THIEN_TRU: BaNgonNgu = {
  vi: " Thiên Trù tuổi Quý an ở Hợi theo sách Trung Hoa; Tân Biên an ở Tuất.",
  en: " For the stem Quý, Thiên Trù sits at Hợi as in Chinese texts; Tân Biên puts it at Tuất.",
  zh: "癸干天厨依中国典籍安于亥；《紫微斗数新编》安于戌。",
};

const THUONG_SU: BaNgonNgu = {
  vi: " Thiên Thương, Thiên Sứ đổi chỗ cho Âm Nam, Dương Nữ theo phái Trung Châu (Vương Đình Chi): Thiên Thương ở Tật Ách, Thiên Sứ ở Nô Bộc; Tân Biên và Tử Vi Đẩu Số toàn thư không đổi.",
  en: " Thiên Thương and Thiên Sứ swap places for a yin-year man or yang-year woman, after the Zhongzhou school (Wang Tingzhi): Thiên Thương in Health, Thiên Sứ in Friends; Tân Biên and the Tử Vi Đẩu Số Toàn Thư do not swap.",
  zh: "阴男阳女天伤、天使互换，依中州派（王亭之）：天伤在疾厄，天使在仆役；《紫微斗数新编》与《紫微斗数全书》不换。",
};

/**
 * Lời rào ghép theo lựa chọn (như caveatTheoPhai của bản Go). Câu tháng nhuận,
 * Thiên Trù, Thiên Thương chỉ thêm khi lựa chọn ấy đổi được chính lá số này.
 */
export function caveatTheoPhai(o: ZiWeiSchools, thangNhuan: boolean, tuoiQuy: boolean, amNamDuongNu: boolean): BaNgonNgu {
  const th = TU_HOA[o.transformations ?? ""];
  const hl = HOA_LINH[o.fireBell ?? ""];
  const r = { vi: DAU.vi + th.vi + hl.vi, en: DAU.en + th.en + hl.en, zh: DAU.zh + th.zh + hl.zh };
  const them = (b: BaNgonNgu) => {
    r.vi += b.vi;
    r.en += b.en;
    r.zh += b.zh;
  };
  const tn = o.leapMonth ? THANG_NHUAN[o.leapMonth] : undefined;
  if (tn && thangNhuan) them(tn);
  if (o.heavenlyKitchen === "chinese" && tuoiQuy) them(THIEN_TRU);
  if (o.injuryMessenger === "zhongzhou" && amNamDuongNu) them(THUONG_SU);
  return r;
}

// ── Nhãn hiển thị (văn bản, SVG) ─────────────────────────────────────────

/** Nhãn ba thứ tiếng của từng lựa chọn và từng giá trị khác mặc định. */
export const ZI_WEI_SCHOOL_LABELS: Readonly<Record<keyof ZiWeiSchools, { label: BaNgonNgu; values: Readonly<Record<string, BaNgonNgu>> }>> = {
  fireBell: {
    label: { vi: "Hỏa Tinh, Linh Tinh", en: "Fire and Bell stars", zh: "火星、铃星" },
    values: {
      quanshu: { vi: "cả hai đếm thuận (Toàn Thư)", en: "both forward (Quan Shu)", zh: "二星皆顺数（《全书》）" },
      "swap-for-female": { vi: "nữ đổi cung khởi (Việt Viêm Tử)", en: "starts swapped for women", zh: "女命起宫互换" },
      "swap-for-yin-male-yang-female": { vi: "Âm Nam, Dương Nữ đổi cung khởi", en: "starts swapped for yin men and yang women", zh: "阴男阳女起宫互换" },
    },
  },
  leapMonth: {
    label: { vi: "Tháng nhuận", en: "Leap month", zh: "闰月" },
    values: {
      "split-at-15": { vi: "chia ở ngày 15", en: "split at day 15", zh: "以十五日为界" },
      "next-month": { vi: "như tháng sau", en: "as the next month", zh: "按下一月" },
    },
  },
  transformations: {
    label: { vi: "Tứ Hóa can Canh", en: "Four Transformations", zh: "庚干四化" },
    values: {
      quanshu: { vi: "theo Toàn Thư", en: "Quan Shu", zh: "依《全书》" },
      zhongzhou: { vi: "Trung Châu", en: "Zhongzhou", zh: "中州派" },
    },
  },
  heavenlyKitchen: {
    label: { vi: "Thiên Trù", en: "Celestial Kitchen", zh: "天厨" },
    values: { chinese: { vi: "theo sách Trung Hoa", en: "Chinese texts", zh: "依中国典籍" } },
  },
  injuryMessenger: {
    label: { vi: "Thiên Thương, Thiên Sứ", en: "Celestial Injury and Messenger", zh: "天伤、天使" },
    values: { zhongzhou: { vi: "Trung Châu", en: "Zhongzhou", zh: "中州派" } },
  },
};

/** Các lựa chọn khác mặc định thành chuỗi "nhãn: giá trị" theo ngôn ngữ. */
export function schoolLines(schools: ZiWeiSchools | undefined, lang: "vi" | "en" | "zh"): string[] {
  if (!schools) return [];
  const colon = lang === "zh" ? "：" : ": ";
  const ra: string[] = [];
  for (const k of ZI_WEI_SCHOOL_KEYS) {
    const v = schools[k];
    if (!v) continue;
    const l = ZI_WEI_SCHOOL_LABELS[k];
    ra.push(l.label[lang] + colon + (l.values[v]?.[lang] ?? v));
  }
  return ra;
}

/** Chỉ phần giá trị của các lựa chọn khác mặc định, nối gọn (cho hình SVG). */
export function schoolShort(schools: ZiWeiSchools | undefined, lang: "vi" | "en" | "zh"): string {
  if (!schools) return "";
  const ra: string[] = [];
  for (const k of ZI_WEI_SCHOOL_KEYS) {
    const v = schools[k];
    if (v) ra.push(ZI_WEI_SCHOOL_LABELS[k].values[v]?.[lang] ?? v);
  }
  return ra.join(lang === "zh" ? "；" : "; ");
}
