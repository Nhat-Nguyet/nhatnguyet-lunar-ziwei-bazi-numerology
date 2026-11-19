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
  /** Chữ Hán giản thể; chỉ có ở mười một phụ tinh thêm. */
  tenZh?: string;
  loai: LoaiSao;
  /** Miếu, Vượng, Đắc, Bình, Hãm; chỉ có ở chính tinh. */
  mieuVuong?: string;
  mieuVuongEn?: string;
  /** "Hóa Lộc", "Hóa Quyền", "Hóa Khoa", "Hóa Kỵ". */
  tuHoa?: string;
}

/** Một trong 12 cung, gắn với một vị trí địa chi cố định. */
export interface CungTuVi {
  /** 0 là Tý, 11 là Hợi. */
  viTri: number;
  chi: string;
  canChi: string;
  tenCung: string;
  tenCungEn: string;
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
  canChiNam: string;
  /** Ví dụ "Âm Nam", "Dương Nữ". */
  amDuongMenh: string;
  cuc: number;
  tenCuc: string;
  banMenhNapAm: string;
  cungMenh: number;
  cungThan: number;
  menhCungChi: string;
  /** Sắp theo vị trí 0 tới 11 (Tý tới Hợi). */
  cung: CungTuVi[];
  caveat: string;
  caveatEn: string;
  caveatZh: string;
  /** Chỉ có khi sinh giờ Tý. */
  ghiChuGioTy?: string;
  ghiChuGioTyEn?: string;
  ghiChuGioTyZh?: string;
}
