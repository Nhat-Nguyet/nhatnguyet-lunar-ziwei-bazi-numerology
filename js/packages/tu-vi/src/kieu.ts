// Kiểu dữ liệu của lá số Tử Vi. Khoá đúng như JSON của lõi tính Go (khoá Go
// viết hoa đầu đã hạ chữ đầu). Trường Go mang `omitempty` là trường tuỳ chọn
// ở đây: vắng khi rỗng.

import type { LunarDate } from "./phu-thuoc.ts";

/** Ba bản của cùng một mẩu chữ. */
export interface BaNgonNgu {
  vi: string;
  en: string;
  zh: string;
}

/** Loại sao trên lá số. */
export type LoaiSao = "chinh-tinh" | "phu-tinh" | "truong-sinh" | "thai-tue" | "bac-sy";

/** Một sao an tại một cung. */
export interface SaoTuVi {
  ten: string;
  tenEn: string;
  /** Chữ Hán giản thể; có ở mọi sao. */
  tenZh?: string;
  loai: LoaiSao;
  /**
   * Nhóm của phụ tinh: "sat-tinh" (lục sát), "cat-tinh" (lục cát cộng Lộc Tồn,
   * Thiên Mã), "tap-dieu" (còn lại); chỉ có ở loai "phu-tinh". Tên ba thứ
   * tiếng ở NHAN_NHOM_SAO.
   */
  nhom?: "sat-tinh" | "cat-tinh" | "tap-dieu";
  /** Miếu, Vượng, Đắc, Bình, Hãm; chỉ có ở chính tinh. */
  mieuVuong?: string;
  mieuVuongEn?: string;
  /** 庙, 旺, 得地, 平, 陷. */
  mieuVuongZh?: string;
  /** "Hóa Lộc", "Hóa Quyền", "Hóa Khoa", "Hóa Kỵ" (bản Anh giữ tên này). */
  tuHoa?: string;
  /** 化禄, 化权, 化科, 化忌. */
  tuHoaZh?: string;
}

/** Một trong 12 cung, gắn với một vị trí địa chi cố định. */
export interface CungTuVi {
  /** 0 là Tý, 11 là Hợi. */
  viTri: number;
  chi: string;
  /** Chữ Hán của chi, ví dụ 子. Bản Anh giữ tên chi tiếng Việt. */
  chiZh: string;
  canChi: string;
  canChiZh: string;
  tenCung: string;
  tenCungEn: string;
  /** Ví dụ 命宫. */
  tenCungZh: string;
  laThan: boolean;
  tuanTrung: boolean;
  trietLo: boolean;
  sao: SaoTuVi[];
}

/** Ngày dương lịch đã nhập. */
export interface SolarInput {
  ngay: number;
  thang: number;
  nam: number;
}

/** Lá số Tử Vi đầy đủ. */
export interface LaSoTuVi {
  hoTen: string;
  gioiTinh: string;
  ngaySinhDuong: SolarInput;
  ngaySinhAm: LunarDate;
  /** Chi của giờ sinh, ví dụ "Ngọ". */
  gioSinh: string;
  gioSinhZh: string;
  canChiNam: string;
  canChiNamZh: string;
  /** Ví dụ "Âm Nam", "Dương Nữ". */
  amDuongMenh: string;
  amDuongMenhEn: string;
  amDuongMenhZh: string;
  cuc: number;
  tenCuc: string;
  /** Ví dụ "Metal Four". */
  tenCucEn: string;
  /** Ví dụ 金四局. */
  tenCucZh: string;
  banMenhNapAm: string;
  banMenhNapAmEn: string;
  banMenhNapAmZh: string;
  cungMenh: number;
  cungThan: number;
  menhCungChi: string;
  menhCungChiZh: string;
  /** Sắp theo vị trí 0 tới 11 (Tý tới Hợi). */
  cung: CungTuVi[];
  caveat: string;
  caveatEn: string;
  caveatZh: string;
  /** Chỉ có khi sinh giờ Tý. */
  ghiChuGioTy?: string;
  ghiChuGioTyEn?: string;
  ghiChuGioTyZh?: string;
  /** School options used, only those that differ from the default (see `ZiWeiSchools`). */
  schools?: import("./schools.ts").ZiWeiSchools;
  /** Lunar month used to place the stars when it differs from `ngaySinhAm.month` (leap-month birth with `leapMonth` "split-at-15" or "next-month"). */
  placementMonth?: number;
}
