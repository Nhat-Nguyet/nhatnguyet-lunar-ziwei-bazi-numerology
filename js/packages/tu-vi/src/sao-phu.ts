// Phép an phụ tinh theo tháng, ngày, giờ, can chi năm (chuyển ngữ
// tuvi_saophu.go). Mỗi sao một hàm để bảng tra và lá số dùng chung một phép.
//
// Chỗ các sách khác nhau ghi tại hàm: Thiên Quý (sách Việt đếm nghịch từ Văn
// Khúc, sách Trung Hoa đếm thuận), Thiên Quan (có bảng ghi Ất ở Mùi, Bính ở
// Thìn), Thiên Tài (có trang ghi khởi từ cung Thân), Đẩu Quân (năm sinh hay
// năm xem).

import { DIA_CHI, THIEN_CAN, mod } from "./phu-thuoc.ts";
import { TU_VUNG_SAO } from "./du-lieu.ts";
import type { BaNgonNgu } from "./kieu.ts";

/** Tả Phù: tháng Giêng ở Thìn, đếm thuận theo tháng sinh. */
export function viTriTaPhu(thang: number): number {
  return mod(4 + (thang - 1), 12);
}

/** Hữu Bật: tháng Giêng ở Tuất, đếm nghịch theo tháng sinh. */
export function viTriHuuBat(thang: number): number {
  return mod(2 - viTriTaPhu(thang), 12);
}

/** Văn Khúc: giờ Tý ở Thìn, đếm thuận theo giờ sinh. */
export function viTriVanKhuc(gio: number): number {
  return mod(4 + gio, 12);
}

/** Văn Xương: giờ Tý ở Tuất, đếm nghịch theo giờ sinh. */
export function viTriVanXuong(gio: number): number {
  return mod(2 - viTriVanKhuc(gio), 12);
}

/** Tam Thai: lấy cung Tả Phù làm mùng một, đếm thuận tới ngày sinh. */
export function viTriTamThai(thang: number, ngay: number): number {
  return mod(viTriTaPhu(thang) + (ngay - 1), 12);
}

/** Bát Tọa: lấy cung Hữu Bật làm mùng một, đếm nghịch tới ngày sinh. */
export function viTriBatToa(thang: number, ngay: number): number {
  return mod(viTriHuuBat(thang) - (ngay - 1), 12);
}

/** Ân Quang: lấy cung Văn Xương làm mùng một, đếm thuận tới ngày sinh rồi lùi một cung. */
export function viTriAnQuang(gio: number, ngay: number): number {
  return mod(viTriVanXuong(gio) + (ngay - 1) - 1, 12);
}

/**
 * Thiên Quý: lấy cung Văn Khúc làm mùng một, đếm NGHỊCH tới ngày sinh rồi lùi
 * một cung (lối sách Việt; sách Trung Hoa đếm thuận).
 */
export function viTriThienQuy(gio: number, ngay: number): number {
  return mod(viTriVanKhuc(gio) - (ngay - 1) + 1, 12);
}

/** Thiên Quan theo can năm (Giáp Mùi, Ất Thìn, Bính Tỵ, Đinh Dần, Mậu Mão, Kỷ Dậu, Canh Hợi, Tân Dậu, Nhâm Tuất, Quý Ngọ). */
export const THIEN_QUAN_VI_TRI: readonly number[] = [7, 4, 5, 2, 3, 9, 11, 9, 10, 6];
/** Thiên Phúc theo can năm (Giáp Dậu, Ất Thân, Bính Tý, Đinh Hợi, Mậu Mão, Kỷ Dần, Canh Ngọ, Tân Tỵ, Nhâm Ngọ, Quý Tỵ). */
export const THIEN_PHUC_VI_TRI: readonly number[] = [9, 8, 0, 11, 3, 2, 6, 5, 6, 5];

/** Thiên Quan theo can năm sinh (0 là Giáp). */
export function viTriThienQuan(canNam: number): number {
  return THIEN_QUAN_VI_TRI[mod(canNam, 10)];
}

/** Thiên Phúc theo can năm sinh (0 là Giáp). */
export function viTriThienPhuc(canNam: number): number {
  return THIEN_PHUC_VI_TRI[mod(canNam, 10)];
}

/** Thiên Tài: lấy cung Mệnh làm năm Tý, đếm thuận tới chi năm sinh. */
export function viTriThienTai(cungMenh: number, chiNam: number): number {
  return mod(cungMenh + chiNam, 12);
}

/** Thiên Thọ: lấy cung Thân làm năm Tý, đếm thuận tới chi năm sinh. */
export function viTriThienTho(cungThan: number, chiNam: number): number {
  return mod(cungThan + chiNam, 12);
}

/** Thiên Khốc: năm Tý ở Ngọ, đếm nghịch tới chi năm sinh. */
export function viTriThienKhoc(chiNam: number): number {
  return mod(6 - chiNam, 12);
}

/** Thiên Hư: năm Tý ở Ngọ, đếm thuận tới chi năm sinh; luôn cùng cung Tuế Phá. */
export function viTriThienHu(chiNam: number): number {
  return mod(6 + chiNam, 12);
}

/** Sao thứ `thu` (0 là Thái Tuế, 6 là Tuế Phá) của vòng Thái Tuế, luôn đi thuận. */
export function viTriSaoThaiTue(chiNam: number, thu: number): number {
  return mod(chiNam + thu, 12);
}

/**
 * Đẩu Quân: từ cung Thái Tuế kể là tháng Giêng, đếm nghịch tới tháng sinh;
 * lấy cung ấy làm giờ Tý, đếm thuận tới giờ sinh. Trên lá số gốc chiNam là
 * chi năm sinh; khi xem hạn tháng là chi năm xem (lưu Đẩu Quân).
 */
export function viTriDauQuan(chiNam: number, thang: number, gio: number): number {
  return mod(chiNam - (thang - 1) + gio, 12);
}

/** Mười một phụ tinh thêm vào lá số, theo thứ tự in. */
export const TEN_SAO_PHU_MOI: readonly string[] = [
  "Tam Thai", "Bát Tọa", "Ân Quang", "Thiên Quý", "Thiên Quan", "Thiên Phúc",
  "Thiên Tài", "Thiên Thọ", "Thiên Khốc", "Thiên Hư", "Đẩu Quân",
];

/** Tên riêng của sao có chữ Việt trùng thuật ngữ khác ("Thiên Tài" của Bát Tự là 偏财). */
const TEN_SAO_RIENG: Readonly<Record<string, { en: string; zh: string }>> = {
  "Thiên Tài": { en: "Celestial Talent", zh: "天才" },
};

/** Tên tiếng Anh và tiếng Trung của một phụ tinh mới. */
export function tenSaoBaThu(ten: string): { en: string; zh: string } {
  const r = TEN_SAO_RIENG[ten] ?? TU_VUNG_SAO[ten];
  return r ? { en: r.en, zh: r.zh } : { en: "", zh: "" };
}

/** Lời mô tả phép an, đúng với hàm viTri... tương ứng. */
const CACH_AN_SAO_PHU_MOI: Readonly<Record<string, BaNgonNgu>> = {
  "Tam Thai": {
    vi: "Lấy cung Tả Phù làm mùng một, đếm thuận tới ngày sinh âm lịch.",
    en: "Count the Tả Phù palace as day 1 and move forward to the lunar birth day.",
    zh: "以左辅所在宫为初一，顺数至生日。",
  },
  "Bát Tọa": {
    vi: "Lấy cung Hữu Bật làm mùng một, đếm nghịch tới ngày sinh âm lịch.",
    en: "Count the Hữu Bật palace as day 1 and move backward to the lunar birth day.",
    zh: "以右弼所在宫为初一，逆数至生日。",
  },
  "Ân Quang": {
    vi: "Lấy cung Văn Xương làm mùng một, đếm thuận tới ngày sinh rồi lùi một cung.",
    en: "Count the Văn Xương palace as day 1, move forward to the birth day, then step back one palace.",
    zh: "以文昌所在宫为初一，顺数至生日，再退一宫。",
  },
  "Thiên Quý": {
    vi: "Lấy cung Văn Khúc làm mùng một, đếm nghịch tới ngày sinh rồi lùi một cung (lối sách Việt; sách Trung Hoa đếm thuận).",
    en: "Count the Văn Khúc palace as day 1, move backward to the birth day, then step back one palace (Vietnamese books; Chinese books count forward).",
    zh: "以文曲所在宫为初一，逆数至生日，再退一宫（越南书的排法；中国书顺数）。",
  },
  "Thiên Quan": { vi: "Tra theo can năm sinh: ", en: "Looked up by the birth-year stem: ", zh: "依生年天干查：" },
  "Thiên Phúc": { vi: "Tra theo can năm sinh: ", en: "Looked up by the birth-year stem: ", zh: "依生年天干查：" },
  "Thiên Tài": {
    vi: "Lấy cung Mệnh làm năm Tý, đếm thuận tới chi năm sinh.",
    en: "Count the Life palace as the Tý year and move forward to the birth-year branch.",
    zh: "以命宫为子年，顺数至生年地支。",
  },
  "Thiên Thọ": {
    vi: "Lấy cung Thân làm năm Tý, đếm thuận tới chi năm sinh.",
    en: "Count the Body palace as the Tý year and move forward to the birth-year branch.",
    zh: "以身宫为子年，顺数至生年地支。",
  },
  "Thiên Khốc": {
    vi: "Năm Tý ở cung Ngọ, đếm nghịch tới chi năm sinh.",
    en: "The Tý year sits at Ngọ; move backward to the birth-year branch.",
    zh: "子年起午宫，逆数至生年地支。",
  },
  "Thiên Hư": {
    vi: "Năm Tý ở cung Ngọ, đếm thuận tới chi năm sinh; luôn cùng cung với Tuế Phá.",
    en: "The Tý year sits at Ngọ; move forward to the birth-year branch. It always shares a palace with Tuế Phá.",
    zh: "子年起午宫，顺数至生年地支；恒与岁破同宫。",
  },
  "Đẩu Quân": {
    vi: "Từ cung Thái Tuế kể là tháng Giêng, đếm nghịch tới tháng sinh; lấy cung ấy làm giờ Tý, đếm thuận tới giờ sinh.",
    en: "Count the Thái Tuế palace as the first month and move backward to the birth month; take that palace as the Tý hour and move forward to the birth hour.",
    zh: "以太岁所在宫为正月，逆数至生月；再以该宫为子时，顺数至生时。",
  },
};

// Chữ Hán giản thể của can và chi, chép từ từ vựng nghiệp vụ, chỉ dùng cho
// lời mô tả phép an Thiên Quan, Thiên Phúc.
const CAN_ZH = ["甲", "乙", "丙", "丁", "戊", "己", "庚", "辛", "壬", "癸"];
const CHI_ZH = ["子", "丑", "寅", "卯", "辰", "巳", "午", "未", "申", "酉", "戌", "亥"];

function cachAnTheoCan(dan: BaNgonNgu, tab: readonly number[]): BaNgonNgu {
  const vi = tab.map((p, i) => THIEN_CAN[i] + " " + DIA_CHI[p]);
  const zh = tab.map((p, i) => CAN_ZH[i] + "在" + CHI_ZH[p]);
  return {
    vi: dan.vi + vi.join(", ") + ".",
    en: dan.en + vi.join(", ") + ".",
    zh: dan.zh + zh.join("，") + "。",
  };
}

/** Một phụ tinh mới kèm lời mô tả phép an, đủ ba thứ tiếng. */
export interface MoTaSaoPhu {
  ten: string;
  tenEn: string;
  tenZh: string;
  cachAn: BaNgonNgu;
}

/** Mười một phụ tinh mới theo thứ tự in, kèm phép an. */
export function saoPhuMoi(): MoTaSaoPhu[] {
  return TEN_SAO_PHU_MOI.map((ten) => {
    const { en, zh } = tenSaoBaThu(ten);
    let cach = CACH_AN_SAO_PHU_MOI[ten];
    if (ten === "Thiên Quan") cach = cachAnTheoCan(cach, THIEN_QUAN_VI_TRI);
    else if (ten === "Thiên Phúc") cach = cachAnTheoCan(cach, THIEN_PHUC_VI_TRI);
    return { ten, tenEn: en, tenZh: zh, cachAn: { ...cach } };
  });
}
