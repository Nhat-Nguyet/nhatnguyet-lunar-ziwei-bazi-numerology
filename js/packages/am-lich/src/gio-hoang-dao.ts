// Giờ hoàng đạo của một ngày kèm thần trực giờ. Chuyển ngữ của
// coreengine.GioHoangDaoKemThan (gio_hoang_dao_than.go, hoangdao.go,
// truc_ngay.go); đáp án kiểm bằng ca-kiem/auspicious-hours.json.
//
// Một hệ duy nhất: bảng sáu giờ hoàng đạo theo cặp chi ngày (hoangDaoChiByGroup
// của lõi), và vòng mười hai thần khởi từ Thanh Long, chỗ khởi GIẢI NGƯỢC từ
// chính bảng ấy (viTriThanhLong), không gõ bảng thứ hai.
//
// Auspicious (hoàng đạo) and inauspicious (hắc đạo) double hours of a day,
// with the presiding spirit of each hour.

import { DIA_CHI, dayCanChi, mod } from "./can-chi.ts";
import type { CanChi } from "./can-chi.ts";
import { checkLang, checkTerms, formatDate, parseDate, stemBranchName, termName, zodiacName } from "./en.ts";
import type { DateInput, Lang, Terms } from "./en.ts";

// Sáu giờ hoàng đạo (chỉ số chi, 0 là Tý) theo chi ngày mod 6: Tý Ngọ, Sửu
// Mùi, Dần Thân, Mão Dậu, Thìn Tuất, Tỵ Hợi. Chép từ hoangDaoChiByGroup.
const HOANG_DAO_THEO_CAP: readonly (readonly number[])[] = [
  [0, 1, 3, 6, 8, 9],
  [2, 3, 5, 8, 10, 11],
  [0, 1, 4, 5, 7, 10],
  [0, 2, 3, 6, 7, 9],
  [2, 4, 5, 8, 9, 11],
  [1, 4, 6, 7, 10, 11],
];

// Vòng mười hai thần (tenThanNgay của lõi), Thanh Long trước.
const THAN_VI: readonly string[] = [
  "Thanh Long", "Minh Đường", "Thiên Hình", "Chu Tước",
  "Kim Quỹ", "Kim Đường", "Bạch Hổ", "Ngọc Đường",
  "Thiên Lao", "Nguyên Vũ", "Tư Mệnh", "Câu Trần",
];
// Chữ Hán theo bảng GIỜ của sách (tenThanGioZh): thần thứ sáu là 宝光.
const THAN_ZH: readonly string[] = ["青龙", "明堂", "天刑", "朱雀", "金匮", "宝光", "白虎", "玉堂", "天牢", "元武", "司命", "勾陈"];

/** Pinyin (no tone marks) of the twelve hour spirits, Qing Long first. */
export const HOUR_SPIRIT_PINYIN: readonly string[] = [
  "Qing Long", "Ming Tang", "Tian Xing", "Zhu Que", "Jin Kui", "Bao Guang",
  "Bai Hu", "Yu Tang", "Tian Lao", "Yuan Wu", "Si Ming", "Gou Chen",
];

/** Positions in the cycle of twelve spirits that make an hour auspicious. */
export const AUSPICIOUS_SPIRITS: readonly number[] = [0, 1, 4, 5, 7, 10];

// Chỗ Thanh Long khởi: giờ s sao cho s + mọi vị trí hoàng đạo đều thuộc bảng.
const KHOI = HOANG_DAO_THEO_CAP.map((tot) => {
  for (let s = 0; s < 12; s++) if (AUSPICIOUS_SPIRITS.every((v) => tot.includes((s + v) % 12))) return s;
  throw new Error("bảng giờ hoàng đạo không giải ra chỗ khởi của Thanh Long");
});

const KHUNG_GIO: readonly string[] = ["23h-1h", "1h-3h", "3h-5h", "5h-7h", "7h-9h", "9h-11h", "11h-13h", "13h-15h", "15h-17h", "17h-19h", "19h-21h", "21h-23h"];
const CHI_ZH: readonly string[] = ["子", "丑", "寅", "卯", "辰", "巳", "午", "未", "申", "酉", "戌", "亥"];
const CAN_ZH: Readonly<Record<string, string>> = { Giáp: "甲", Ất: "乙", Bính: "丙", Đinh: "丁", Mậu: "戊", Kỷ: "己", Canh: "庚", Tân: "辛", Nhâm: "壬", Quý: "癸" };

/** @internal Một canh giờ, khoá đúng như ca kiểm. */
export interface ThanGio {
  chi: string;
  chiZh: string;
  khungGio: string;
  hoangDao: boolean;
  thuTuThan: number;
  than: string;
  thanZh: string;
}

/** @internal Kết quả của gioHoangDaoKemThan, khoá đúng như ca kiểm. */
export interface GioHoangDaoNgay {
  canChiNgay: string;
  canChiNgayZh: string;
  chiNgay: string;
  gio: ThanGio[];
}

/**
 * @internal Lớp lõi (khoá theo Go) cho ca kiểm; người dùng gọi `auspiciousHours`.
 * Không xuất ra từ index của gói.
 */
export function gioHoangDaoKemThan(dd: number, mm: number, yy: number): GioHoangDaoNgay {
  const cc: CanChi = dayCanChi(dd, mm, yy);
  const iNgay = DIA_CHI.indexOf(cc.chi);
  const tot = HOANG_DAO_THEO_CAP[iNgay % 6];
  const s = KHOI[iNgay % 6];
  const gio: ThanGio[] = DIA_CHI.map((chi, i) => {
    const v = mod(i - s, 12);
    return { chi, chiZh: CHI_ZH[i], khungGio: KHUNG_GIO[i], hoangDao: tot.includes(i), thuTuThan: v, than: THAN_VI[v], thanZh: THAN_ZH[v] };
  });
  return { canChiNgay: cc.label, canChiNgayZh: (CAN_ZH[cc.can] ?? cc.can) + CHI_ZH[iNgay], chiNgay: cc.chi, gio };
}

/** One double hour of `auspiciousHours`. */
export interface AuspiciousHour {
  /** Branch index of the hour: 0 = Tý (23:00 to 00:59) ... 11 = Hợi (21:00 to 22:59). */
  index: number;
  /** Branch name in `lang` and `terms` ("Zi", "子", "Tý"). */
  branch: string;
  /** Zodiac animal of the branch in `lang` (the Mão hour is the Cat hour in Vietnam). */
  animal: string;
  /** Clock hours the double hour covers, Vietnam time: "23:00-00:59". */
  range: string;
  /** True for an auspicious hour (giờ hoàng đạo), false for an inauspicious one (giờ hắc đạo). */
  auspicious: boolean;
  /**
   * The spirit presiding over the hour, in `lang` and `terms`: "Qing Long"
   * (pinyin), "青龙" (han, zh) or "Thanh Long" (vi). The sixth spirit is Bao
   * Guang (宝光) in the hour tables of the books; Vietnamese almanacs call it
   * Kim Đường.
   */
  spirit: string;
  /** Position of the spirit in the cycle, 0 = Qing Long (Thanh Long) ... 11 = Gou Chen (Câu Trần). */
  spiritIndex: number;
}

/** Result of `auspiciousHours`. */
export interface AuspiciousHoursResult {
  /** The Gregorian date, "YYYY-MM-DD". */
  date: string;
  /** Stem-branch of the day in `lang` and `terms` ("Bing Chen", "丙辰", "Bính Thìn"). */
  day: string;
  /** Branch of the day, which alone decides the hours. */
  dayBranch: string;
  /** The twelve double hours, Tý first; six of them are auspicious. */
  hours: AuspiciousHour[];
  lang: Lang;
}

/**
 * The twelve double hours of a day with the auspicious (hoàng đạo) or
 * inauspicious (hắc đạo) flag and the presiding spirit, as Vietnamese
 * almanacs print them. The six auspicious hours depend only on the branch of
 * the day; the spirits circle from Qing Long (Thanh Long), which starts at an
 * hour fixed by the day's branch pair. Hours are Vietnam clock time.
 *
 * @example auspiciousHours("2027-02-06").hours.filter((h) => h.auspicious).map((h) => h.range)
 */
export function auspiciousHours(date: DateInput, opts: { lang?: Lang; terms?: Terms } = {}): AuspiciousHoursResult {
  const lang = checkLang(opts.lang);
  const terms = checkTerms(opts.terms, lang);
  const d = parseDate(date);
  const raw = gioHoangDaoKemThan(d.day, d.month, d.year);
  const p = (n: number) => String(n).padStart(2, "0");
  const hours = raw.gio.map((g, i): AuspiciousHour => {
    const dau = mod(i * 2 - 1, 24);
    return {
      index: i,
      branch: termName(g.chi, lang, terms),
      animal: zodiacName(i, lang),
      range: `${p(dau)}:00-${p(mod(dau + 1, 24))}:59`,
      auspicious: g.hoangDao,
      spirit: terms === "vi" ? g.than : terms === "pinyin" ? HOUR_SPIRIT_PINYIN[g.thuTuThan] : g.thanZh,
      spiritIndex: g.thuTuThan,
    };
  });
  return { date: formatDate(d), day: stemBranchName(raw.canChiNgay, lang, terms), dayBranch: termName(raw.chiNgay, lang, terms), hours, lang };
}
