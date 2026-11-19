// Chữ tiếng Anh của lớp API tiếng Anh (en.ts, ve-svg.ts, van-ban.ts) mà lõi
// tính không có hay có mà chưa ổn: tên tiếng Anh của cách cục, vài tên sao
// tiếng Anh sửa theo cách sách tiếng Anh gọi, tên chữ Hán bị cắt cụt của hai
// cách cục, và bảng thay chữ Việt còn sót trong câu tiếng Anh của lõi (điều
// kiện, mô tả cách cục, tên sao lưu). Bảng của lõi (du-lieu.ts, la-so.ts)
// không đổi: ca kiểm so đúng bảng ấy; ở đây chỉ là lớp trình bày.
//
// English names used by the English layer only. The core tables stay as the
// Go engine has them (the test cases check them); this file adjusts the
// presentation.

import { convertTerms } from "@nhatnguyet/am-lich";
import type { Terms } from "@nhatnguyet/am-lich";
import { CHINH_TINH_NAME_EN, PHU_TINH_NAME_EN, TEN_CUNG_THEO_OFFSET, TU_VUNG_SAO } from "./du-lieu.ts";

/**
 * Tên tiếng Anh của sao, sửa so với bảng của lõi:
 * - Đà La 陀羅: lõi ghi "Spinning Camel"; sách tiếng Anh gọi "Spinning Top"
 *   (iztro: tangled).
 * - Thiên Tướng 天相: 相 là quan tướng (thừa tướng), không phải tướng quân;
 *   "Celestial Minister" (iztro: minister). Tránh trùng "General" của Tướng Quân.
 * - Thiên Việt 天鉞: 鉞 là cây việt (rìu chiến), lõi ghi "Celestial Excellence"
 *   (đọc nhầm 越); "Celestial Halberd".
 */
export const STAR_EN_FIX: Readonly<Record<string, string>> = {
  "Đà La": "Spinning Top",
  "Thiên Tướng": "Celestial Minister",
  "Thiên Việt": "Celestial Halberd",
};

/** English name of a star: the fixed name above, else the core's name. */
export function starEn(vi: string, coreEn: string): string {
  return STAR_EN_FIX[vi] ?? coreEn;
}

/**
 * Tên tiếng Anh của cách cục, dịch theo nghĩa tên chữ Hán; tên sao trong tên
 * cách dùng đúng tên tiếng Anh của sao ở thư viện này.
 */
export const PATTERN_EN: Readonly<Record<string, string>> = {
  "Sát Phá Lang": "Killings, Breaker and Wolf",
  "Cơ Nguyệt Đồng Lương": "Mechanism, Moon, Blessing and Beam",
  "Tử Phủ Vũ Tướng": "Purple Star, Treasury, Military and Minister",
  "Tử Phủ đồng cung": "Purple Star and Treasury in One Palace",
  "Nhật Nguyệt tịnh minh": "Sun and Moon Both Bright",
  "Mệnh vô chính diệu": "Life Palace Without a Major Star",
  "Xương Khúc giáp Mệnh": "Literary Stars Flanking the Life Palace",
  "Xương Khúc đồng hội": "Literary Stars Meeting",
  "Tả Hữu đồng hội": "Left and Right Assistants Meeting",
  "Không Kiếp đồng hội": "Void and Robber Meeting",
  "Nhật Nguyệt giáp Tài": "Sun and Moon Flanking Wealth",
  "Tài Lộc giáp Mã": "Wealth and Prosperity Flanking the Horse",
  "Nhật Nguyệt chiếu bích": "Sun and Moon Shining on the Jade Disc",
  "Kim xán quang huy": "Brilliant Golden Radiance",
  "Nhật Nguyệt giáp Mệnh": "Sun and Moon Flanking the Life Palace",
  "Nhật xuất Phù Tang": "Sun Rising from Fusang",
  "Nguyệt lạc Hợi cung": "Moon Setting in the Hai Palace",
  "Nguyệt sinh thương hải": "Moon Rising over the Vast Sea",
  "Phụ Bật củng chủ": "Assistants Supporting the Sovereign",
  "Quân thần khánh hội": "Sovereign and Ministers Meeting in Celebration",
  "Toạ quý hướng quý": "Seated with Nobility, Facing Nobility",
  "Thất Sát triều Đẩu": "Seven Killings Facing the Dipper",
  "Nhật Nguyệt đồng lâm": "Sun and Moon Arriving Together",
  "Khoa Quyền Lộc củng": "Fame, Power and Prosperity Converging",
  "Vũ Khúc thủ viên": "Military Song Guarding Its Seat",
  "Phủ Tướng triều viên": "Treasury and Minister Facing the Seat",
  "Quyền Lộc sinh phùng": "Power and Prosperity Met at Birth",
  "Dương Nhận nhập miếu": "Sword Ram in Its Temple",
  "Cự Cơ cư Mão": "Giant Gate and Mechanism at Mao",
  "Sinh bất phùng thời": "Born at the Wrong Time",
  "Lộc phùng lưỡng sát": "Prosperity Meeting Two Killers",
  "Mã lạc không vong": "Horse Falling into the Void",
  "Nhất sinh cô bần": "Lonely and Poor All Life",
  "Lưỡng trùng Hoa Cái": "Double Canopy",
};

/**
 * Chinese names [simplified, traditional] of two patterns that engine 2.2.0
 * and earlier wrote truncated ("左右", "空劫"). The core now returns the full
 * names itself, so this table only repeats them.
 *
 * @deprecated The core result already carries these names; kept for
 * compatibility and removed in 1.0.
 */
export const PATTERN_HAN_FIX: Readonly<Record<string, readonly [string, string]>> = {
  "Tả Hữu đồng hội": ["左右同会", "左右同會"],
  "Không Kiếp đồng hội": ["空劫同会", "空劫同會"],
};

// Sao có thể đứng trong câu tiếng Anh của lõi (điều kiện, mô tả, sao lưu).
function bangSao(): Record<string, string> {
  const b: Record<string, string> = {};
  for (const [vi, en] of Object.entries(CHINH_TINH_NAME_EN)) b[vi] = starEn(vi, en);
  for (const [vi, en] of Object.entries(PHU_TINH_NAME_EN)) b[vi] = starEn(vi, en);
  for (const [vi, v] of Object.entries(TU_VUNG_SAO)) b[vi] = starEn(vi, v.en);
  b["Thái Tuế"] = "Grand Duke";
  return b;
}

/** Bảng thay chữ Việt trong câu tiếng Anh của lõi Tử Vi, theo cách viết. */
function bangThay(terms: Terms): Record<string, string> {
  const t3 = (vi: string, py: string, han: string) => (terms === "vi" ? vi : terms === "pinyin" ? py : han);
  const b: Record<string, string> = { ...bangSao() };
  for (const c of TEN_CUNG_THEO_OFFSET) b[c.vi] = c.en;
  // Cung Mệnh: tên tiếng Anh của cung là "Life Palace", trong câu viết "the Life palace".
  b["Mệnh"] = "Life";
  b["in Mệnh"] = "in the Life palace";
  b["occupies Mệnh"] = "occupies the Life palace";
  b["of Mệnh"] = "of the Life palace";
  b["Tử Vi Đẩu Số Toàn Thư"] = "Zi Wei Dou Shu Quan Shu";
  b["Tân Biên"] = "the Xin Bian";
  b["Sát Phá Liêm Tham"] = "the Killings-Breaker-Purity-Wolf group";
  b["the Cự Nhật pair"] = "a Gate and Sun pair";
  b["Lộc"] = t3("Lộc", "Lu", "禄");
  b["Quyền"] = t3("Quyền", "Quan", "权");
  b["Khoa"] = t3("Khoa", "Ke", "科");
  b["Kỵ"] = t3("Kỵ", "Ji", "忌");
  b["Tuần"] = t3("Tuần", "Xun Kong", "旬空");
  b["Triệt"] = t3("Triệt", "Jie Kong", "截空");
  return b;
}

const DEM: Partial<Record<Terms, Record<string, string>>> = {};

/** Rewrite the Vietnamese words left in an English sentence of the Zi Wei core (stars, palaces, stems, branches...). */
export function enText(text: string, terms: Terms): string {
  const b = (DEM[terms] ??= bangThay(terms));
  return convertTerms(text, terms, b, "tu-vi");
}

/** Tuần, Triệt (void markers) in `terms`. */
export function voidName(which: "tuan" | "triet", terms: Terms): string {
  if (which === "tuan") return terms === "vi" ? "Tuần" : terms === "pinyin" ? "Xun Kong" : "旬空";
  return terms === "vi" ? "Triệt" : terms === "pinyin" ? "Jie Kong" : "截空";
}
