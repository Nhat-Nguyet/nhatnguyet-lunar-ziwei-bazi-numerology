// Ba mươi mốt phụ tinh, tạp diệu thêm 19/11/2026 (chuyển ngữ
// tuvi_saophu_them.go). Phép an theo Tử Vi Đẩu Số Tân Biên (Vân Đằng Thái
// Thứ Lang), chương An sao, mục 8.6.3 tới 8.36; số mục ghi tại từng hàm.
//
// Chỗ các sách khác nhau (ghi đủ ở bản Go):
// - Hỏa Tinh, Linh Tinh: Tân Biên đếm Hỏa thuận, Linh nghịch với Dương Nam,
//   Âm Nữ và ngược lại với Âm Nam, Dương Nữ; Toàn Thư (và iztro) đếm cả hai
//   thuận; Việt Viêm Tử và lá số in trong Số Tử Vi Kinh Nghiệm đếm thuận
//   nhưng đổi cung khởi của hai sao.
// - Thiên Trù tuổi Quý: Tân Biên ở Tuất, sách Trung Hoa ở Hợi.
// - Không an Thiên Vu, Thiên Nguyệt, Âm Sát, Phi Liêm theo năm, Giải Thần
//   theo tháng: chỉ có ở sách Trung Hoa.
//
// Mức sáng tối để trống: Tân Biên chỉ ghi chỗ đắc địa của vài sao, không có
// bảng năm mức như chính tinh.

import { mod } from "./phu-thuoc.ts";
import type { BaNgonNgu } from "./kieu.ts";

/** Nhóm của phụ tinh (trường `nhom` của sao). */
export type NhomSao = "sat-tinh" | "cat-tinh" | "tap-dieu";

/** Tên ba thứ tiếng của nhóm sao. */
export const NHAN_NHOM_SAO: Readonly<Record<NhomSao, BaNgonNgu>> = {
  "sat-tinh": { vi: "Sát tinh", en: "Malefic star", zh: "煞星" },
  "cat-tinh": { vi: "Cát tinh", en: "Auspicious star", zh: "吉星" },
  "tap-dieu": { vi: "Tạp diệu", en: "Minor star", zh: "杂曜" },
};

/** Nhóm của hai mươi bốn phụ tinh có từ trước; tên không có ở đây là tạp diệu. */
const NHOM_PHU_TINH_CU: Readonly<Record<string, NhomSao>> = {
  "Kình Dương": "sat-tinh", "Đà La": "sat-tinh", "Địa Không": "sat-tinh", "Địa Kiếp": "sat-tinh",
  "Tả Phù": "cat-tinh", "Hữu Bật": "cat-tinh", "Văn Xương": "cat-tinh", "Văn Khúc": "cat-tinh",
  "Thiên Khôi": "cat-tinh", "Thiên Việt": "cat-tinh", "Lộc Tồn": "cat-tinh", "Thiên Mã": "cat-tinh",
};

/** Ba mươi mốt sao theo thứ tự in (thứ tự mục của Tân Biên): tên, Anh, Hán, nhóm. */
export const SAO_PHU_THEM: readonly { readonly ten: string; readonly en: string; readonly zh: string; readonly nhom: NhomSao }[] = [
  { ten: "Hỏa Tinh", en: "Fire Star", zh: "火星", nhom: "sat-tinh" },
  { ten: "Linh Tinh", en: "Bell Star", zh: "铃星", nhom: "sat-tinh" },
  { ten: "Long Trì", en: "Dragon Pool", zh: "龙池", nhom: "tap-dieu" },
  { ten: "Phượng Các", en: "Phoenix Pavilion", zh: "凤阁", nhom: "tap-dieu" },
  { ten: "Thiên Đức", en: "Celestial Virtue", zh: "天德", nhom: "tap-dieu" },
  { ten: "Nguyệt Đức", en: "Monthly Virtue", zh: "月德", nhom: "tap-dieu" },
  { ten: "Thiên Hình", en: "Celestial Punishment", zh: "天刑", nhom: "tap-dieu" },
  { ten: "Thiên Diêu", en: "Celestial Charm", zh: "天姚", nhom: "tap-dieu" },
  { ten: "Thiên Y", en: "Celestial Physician", zh: "天医", nhom: "tap-dieu" },
  { ten: "Hồng Loan", en: "Red Phoenix", zh: "红鸾", nhom: "tap-dieu" },
  { ten: "Thiên Hỷ", en: "Celestial Joy", zh: "天喜", nhom: "tap-dieu" },
  { ten: "Quốc Ấn", en: "State Seal", zh: "国印", nhom: "tap-dieu" },
  { ten: "Đường Phù", en: "Court Tally", zh: "唐符", nhom: "tap-dieu" },
  { ten: "Thiên Giải", en: "Celestial Release", zh: "天解", nhom: "tap-dieu" },
  { ten: "Địa Giải", en: "Earthly Release", zh: "地解", nhom: "tap-dieu" },
  { ten: "Giải Thần", en: "Releasing Spirit", zh: "解神", nhom: "tap-dieu" },
  { ten: "Thai Phụ", en: "Terrace Aide", zh: "台辅", nhom: "tap-dieu" },
  { ten: "Phong Cáo", en: "Patent of Honour", zh: "封诰", nhom: "tap-dieu" },
  { ten: "Thiên Thương", en: "Celestial Injury", zh: "天伤", nhom: "tap-dieu" },
  { ten: "Thiên Sứ", en: "Celestial Messenger", zh: "天使", nhom: "tap-dieu" },
  { ten: "Thiên La", en: "Celestial Net", zh: "天罗", nhom: "tap-dieu" },
  { ten: "Địa Võng", en: "Earthly Snare", zh: "地网", nhom: "tap-dieu" },
  { ten: "Cô Thần", en: "Solitary Star", zh: "孤辰", nhom: "tap-dieu" },
  { ten: "Quả Tú", en: "Widow Star", zh: "寡宿", nhom: "tap-dieu" },
  { ten: "Kiếp Sát", en: "Robbery Sha", zh: "劫煞", nhom: "tap-dieu" },
  { ten: "Phá Toái", en: "Shattering Star", zh: "破碎", nhom: "tap-dieu" },
  { ten: "Hoa Cái", en: "Canopy", zh: "华盖", nhom: "tap-dieu" },
  { ten: "Lưu Hà", en: "Flowing Haze", zh: "流霞", nhom: "tap-dieu" },
  { ten: "Thiên Trù", en: "Celestial Kitchen", zh: "天厨", nhom: "tap-dieu" },
  { ten: "Lưu Niên Văn Tinh", en: "Annual Literary Star", zh: "流年文星", nhom: "tap-dieu" },
  { ten: "Thiên Không", en: "Celestial Void", zh: "天空", nhom: "tap-dieu" },
];

/** Nhóm của một phụ tinh theo tên. */
export function nhomCuaPhuTinh(ten: string): NhomSao {
  return NHOM_PHU_TINH_CU[ten] ?? SAO_PHU_THEM.find((s) => s.ten === ten)?.nhom ?? "tap-dieu";
}

/**
 * Cung khởi (kể là giờ Tý) của Hỏa Tinh, Linh Tinh theo nhóm tam hợp của chi
 * năm: Dần Ngọ Tuất Sửu, Mão; Thân Tý Thìn Dần, Tuất; Tỵ Dậu Sửu Mão, Tuất;
 * Hợi Mão Mùi Dậu, Tuất (Tân Biên 8.6.3).
 */
export function khoiHoaLinh(chiNam: number): [number, number] {
  switch (mod(chiNam, 4)) {
    case 2: return [1, 3];
    case 0: return [2, 10];
    case 1: return [3, 10];
    default: return [9, 10];
  }
}

/**
 * Hỏa Tinh, Linh Tinh (lối Tân Biên): amDuongNamNu +1 (Dương Nam, Âm Nữ) đếm
 * Hỏa thuận, Linh nghịch tới giờ sinh; -1 (Âm Nam, Dương Nữ) ngược lại.
 */
export function viTriHoaLinh(chiNam: number, gio: number, amDuongNamNu: number): [number, number] {
  const [kh, kl] = khoiHoaLinh(chiNam);
  const s = amDuongNamNu < 0 ? -1 : 1;
  return [mod(kh + s * gio, 12), mod(kl - s * gio, 12)];
}

/** Long Trì: năm Tý ở Thìn, đếm thuận (8.9). */
export function viTriLongTri(chiNam: number): number { return mod(4 + chiNam, 12); }
/** Phượng Các: năm Tý ở Tuất, đếm nghịch (8.9). */
export function viTriPhuongCac(chiNam: number): number { return mod(10 - chiNam, 12); }
/** Giải Thần: cùng cung Phượng Các (8.18). */
export function viTriGiaiThan(chiNam: number): number { return viTriPhuongCac(chiNam); }
/** Thiên Đức: năm Tý ở Dậu, đếm thuận (8.14). */
export function viTriThienDuc(chiNam: number): number { return mod(9 + chiNam, 12); }
/** Nguyệt Đức: năm Tý ở Tỵ, đếm thuận (8.14). */
export function viTriNguyetDuc(chiNam: number): number { return mod(5 + chiNam, 12); }
/** Hồng Loan: năm Tý ở Mão, đếm nghịch (8.16). */
export function viTriHongLoan(chiNam: number): number { return mod(3 - chiNam, 12); }
/** Thiên Hỷ: cung đối của Hồng Loan (8.16). */
export function viTriThienHy(chiNam: number): number { return mod(viTriHongLoan(chiNam) + 6, 12); }
/** Cô Thần: Hợi Tý Sửu Dần, Dần Mão Thìn Tỵ, Tỵ Ngọ Mùi Thân, Thân Dậu Tuất Hợi (8.25). */
export function viTriCoThan(chiNam: number): number { return mod(2 + 3 * Math.floor(mod(chiNam + 1, 12) / 3), 12); }
/** Quả Tú: Hợi Tý Sửu Tuất, Dần Mão Thìn Sửu, Tỵ Ngọ Mùi Thìn, Thân Dậu Tuất Mùi (8.25). */
export function viTriQuaTu(chiNam: number): number { return mod(10 + 3 * Math.floor(mod(chiNam + 1, 12) / 3), 12); }
/** Kiếp Sát: Thân Tý Thìn Tỵ, Tỵ Dậu Sửu Dần, Dần Ngọ Tuất Hợi, Hợi Mão Mùi Thân (8.28). */
export function viTriKiepSat(chiNam: number): number { return [5, 2, 11, 8][mod(chiNam, 4)]; }
/** Phá Toái: Tý Ngọ Mão Dậu Tỵ, Thìn Tuất Sửu Mùi Sửu, Dần Thân Tỵ Hợi Dậu (8.29). */
export function viTriPhaToai(chiNam: number): number { return [5, 1, 9][mod(chiNam, 3)]; }
/** Hoa Cái: Thân Tý Thìn Thìn, Tỵ Dậu Sửu Sửu, Dần Ngọ Tuất Tuất, Hợi Mão Mùi Mùi (8.30). */
export function viTriHoaCai(chiNam: number): number { return [4, 1, 10, 7][mod(chiNam, 4)]; }
/** Thiên Không: cung ngay trước Thái Tuế (8.36). */
export function viTriThienKhong(chiNam: number): number { return mod(chiNam + 1, 12); }

/** Thiên Hình: tháng Giêng ở Dậu, đếm thuận (8.15). */
export function viTriThienHinh(thang: number): number { return mod(9 + (thang - 1), 12); }
/** Thiên Diêu (Tân Biên viết Thiên Riêu): tháng Giêng ở Sửu, đếm thuận; Thiên Y cùng cung (8.15). */
export function viTriThienDieu(thang: number): number { return mod(1 + (thang - 1), 12); }
/** Thiên Giải: tháng Giêng ở Thân, đếm thuận (8.18). */
export function viTriThienGiai(thang: number): number { return mod(8 + (thang - 1), 12); }
/** Địa Giải: tháng Giêng ở Mùi, đếm thuận (8.18). */
export function viTriDiaGiai(thang: number): number { return mod(7 + (thang - 1), 12); }

/** Thai Phụ: giờ Tý ở Ngọ, đếm thuận (8.19). */
export function viTriThaiPhu(gio: number): number { return mod(6 + gio, 12); }
/** Phong Cáo: giờ Tý ở Dần, đếm thuận (8.19). */
export function viTriPhongCao(gio: number): number { return mod(2 + gio, 12); }

/** Quốc Ấn: từ Lộc Tồn đếm thuận tới cung thứ chín (8.17). */
export function viTriQuocAn(viTriLocTon: number): number { return mod(viTriLocTon + 8, 12); }
/** Đường Phù: từ Lộc Tồn đếm nghịch tới cung thứ tám (8.17). */
export function viTriDuongPhu(viTriLocTon: number): number { return mod(viTriLocTon - 7, 12); }

/** Lưu Hà theo can năm (8.31): Giáp Dậu, Ất Tuất, Bính Mùi, Đinh Thìn, Mậu Tỵ, Kỷ Ngọ, Canh Thân, Tân Mão, Nhâm Hợi, Quý Dần. */
export const LUU_HA_VI_TRI: readonly number[] = [9, 10, 7, 4, 5, 6, 8, 3, 11, 2];
/** Thiên Trù theo can năm (8.32): Giáp Tỵ, Ất Ngọ, Bính Tý, Đinh Tỵ, Mậu Ngọ, Kỷ Thân, Canh Dần, Tân Ngọ, Nhâm Dậu, Quý Tuất. */
export const THIEN_TRU_VI_TRI: readonly number[] = [5, 6, 0, 5, 6, 8, 2, 6, 9, 10];
/** Lưu Niên Văn Tinh theo can năm (8.33): Giáp Tỵ, Ất Ngọ, Bính Thân, Đinh Dậu, Mậu Thân, Kỷ Dậu, Canh Hợi, Tân Tý, Nhâm Dần, Quý Mão. */
export const LUU_NIEN_VAN_TINH_VI_TRI: readonly number[] = [5, 6, 8, 9, 8, 9, 11, 0, 2, 3];

export function viTriLuuHa(canNam: number): number { return LUU_HA_VI_TRI[mod(canNam, 10)]; }
export function viTriThienTru(canNam: number): number { return THIEN_TRU_VI_TRI[mod(canNam, 10)]; }
export function viTriLuuNienVanTinh(canNam: number): number { return LUU_NIEN_VAN_TINH_VI_TRI[mod(canNam, 10)]; }

/** Thiên Thương: luôn ở cung Nô Bộc (8.21). */
export function viTriThienThuong(cungMenh: number): number { return mod(cungMenh + 5, 12); }
/** Thiên Sứ: luôn ở cung Tật Ách (8.21). */
export function viTriThienSu(cungMenh: number): number { return mod(cungMenh + 7, 12); }
/** Thiên La luôn ở Thìn, Địa Võng luôn ở Tuất (8.22). */
export const VI_TRI_THIEN_LA = 4;
export const VI_TRI_DIA_VONG = 10;

/** Vị trí của cả ba mươi mốt sao cho một lá số. */
export function viTriSaoPhuThem(
  canNam: number, chiNam: number, thang: number, gio: number, amDuongNamNu: number, cungMenh: number, viTriLocTon: number,
): Record<string, number> {
  const [hoa, linh] = viTriHoaLinh(chiNam, gio, amDuongNamNu);
  return {
    "Hỏa Tinh": hoa, "Linh Tinh": linh,
    "Long Trì": viTriLongTri(chiNam), "Phượng Các": viTriPhuongCac(chiNam),
    "Thiên Đức": viTriThienDuc(chiNam), "Nguyệt Đức": viTriNguyetDuc(chiNam),
    "Thiên Hình": viTriThienHinh(thang), "Thiên Diêu": viTriThienDieu(thang), "Thiên Y": viTriThienDieu(thang),
    "Hồng Loan": viTriHongLoan(chiNam), "Thiên Hỷ": viTriThienHy(chiNam),
    "Quốc Ấn": viTriQuocAn(viTriLocTon), "Đường Phù": viTriDuongPhu(viTriLocTon),
    "Thiên Giải": viTriThienGiai(thang), "Địa Giải": viTriDiaGiai(thang), "Giải Thần": viTriGiaiThan(chiNam),
    "Thai Phụ": viTriThaiPhu(gio), "Phong Cáo": viTriPhongCao(gio),
    "Thiên Thương": viTriThienThuong(cungMenh), "Thiên Sứ": viTriThienSu(cungMenh),
    "Thiên La": VI_TRI_THIEN_LA, "Địa Võng": VI_TRI_DIA_VONG,
    "Cô Thần": viTriCoThan(chiNam), "Quả Tú": viTriQuaTu(chiNam),
    "Kiếp Sát": viTriKiepSat(chiNam), "Phá Toái": viTriPhaToai(chiNam), "Hoa Cái": viTriHoaCai(chiNam),
    "Lưu Hà": viTriLuuHa(canNam), "Thiên Trù": viTriThienTru(canNam), "Lưu Niên Văn Tinh": viTriLuuNienVanTinh(canNam),
    "Thiên Không": viTriThienKhong(chiNam),
  };
}
