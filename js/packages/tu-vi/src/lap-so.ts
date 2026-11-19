// Các bước lập lá số, mỗi bước một hàm (chuyển ngữ tuvi_lapso.go).
//
// Quy ước chỉ số: vị trí 0 là Tý, 11 là Hợi; tháng và ngày là số âm lịch;
// giờ là chỉ số chi của giờ sinh (0 là Tý); can năm 0 là Giáp.

import { mod, nguHanhNapAm } from "./phu-thuoc.ts";
import { HANH_TO_CUC, TEN_CUNG_THEO_OFFSET } from "./du-lieu.ts";

/** Từ Dần là tháng Giêng, đếm thuận tới tháng sinh. */
export function viTriCungThangSinh(thang: number): number {
  return mod(2 + (thang - 1), 12);
}

/** Lấy cung tháng sinh làm giờ Tý, đếm NGHỊCH tới giờ sinh. */
export function viTriCungMenh(thang: number, gio: number): number {
  return mod(viTriCungThangSinh(thang) - gio, 12);
}

/** Lấy cung tháng sinh làm giờ Tý, đếm THUẬN tới giờ sinh. */
export function viTriCungThan(thang: number, gio: number): number {
  return mod(viTriCungThangSinh(thang) + gio, 12);
}

/** Tên cung chức năng nằm cách cung Mệnh k bước đếm THUẬN trên địa bàn. */
export function tenCungCachMenhThuan(k: number): string {
  return TEN_CUNG_THEO_OFFSET[mod(-k, 12)].vi;
}

/** Tên cung chức năng mà cung Thân cư theo giờ sinh. */
export function cungThanCu(gio: number): string {
  return tenCungCachMenhThuan(2 * gio);
}

/** Tên cung thứ k (0 là Mệnh) khi an mười hai cung nghịch từ Mệnh. */
export function tenCungTheoThuTu(k: number): string {
  return TEN_CUNG_THEO_OFFSET[mod(k, 12)].vi;
}

/** Vị trí trên địa bàn của cung thứ k tính từ Mệnh (an nghịch). */
export function viTriCungThuK(cungMenh: number, k: number): number {
  return mod(cungMenh - k, 12);
}

/** Can của cung Dần theo Ngũ Hổ Độn. */
export function canCungDan(canNam: number): number {
  return mod(2 * canNam + 2, 10);
}

/** Can của một cung trên địa bàn, đếm thuận từ cung Dần. */
export function canCuaCung(canNam: number, viTri: number): number {
  return mod(canCungDan(canNam) + mod(viTri - 2, 12), 10);
}

/** Số cục và tên cục suy từ nạp âm can chi cung Mệnh; null khi không xác định được. */
export function cucTheoCungMenh(canNam: number, cungMenh: number): { so: number; ten: string } | null {
  const { hanh } = nguHanhNapAm(canCuaCung(canNam, cungMenh), cungMenh);
  const c = HANH_TO_CUC[hanh];
  return c ? { so: c.so, ten: c.ten } : null;
}

/** Vị trí sao Tử Vi theo số cục và ngày sinh âm lịch. */
export function viTriTuVi(cuc: number, ngay: number): number {
  let cungDan = 2; // Dần
  let c = cuc;
  while (c < ngay) {
    c += cuc;
    cungDan++;
  }
  let saiLech = c - ngay;
  if (saiLech % 2 !== 0) saiLech = -saiLech; // lẻ thì lùi
  return mod(cungDan + saiLech, 12);
}

/** Thiên Phủ đối xứng với Tử Vi qua trục Dần Thân. */
export function viTriThienPhu(viTriTuVi: number): number {
  return mod(4 - viTriTuVi, 12);
}

/** Một chính tinh và số bước của nó so với sao đầu chòm. */
export interface BuocChinhTinh {
  ten: string;
  buoc: number;
}

/** Sáu sao chòm Tử Vi, đi NGHỊCH từ Tử Vi. */
export const CHOM_TU_VI: readonly BuocChinhTinh[] = [
  { ten: "Tử Vi", buoc: 0 }, { ten: "Thiên Cơ", buoc: -1 }, { ten: "Thái Dương", buoc: -3 },
  { ten: "Vũ Khúc", buoc: -4 }, { ten: "Thiên Đồng", buoc: -5 }, { ten: "Liêm Trinh", buoc: -8 },
];

/** Tám sao chòm Thiên Phủ, đi THUẬN từ Thiên Phủ. */
export const CHOM_THIEN_PHU: readonly BuocChinhTinh[] = [
  { ten: "Thiên Phủ", buoc: 0 }, { ten: "Thái Âm", buoc: 1 }, { ten: "Tham Lang", buoc: 2 }, { ten: "Cự Môn", buoc: 3 },
  { ten: "Thiên Tướng", buoc: 4 }, { ten: "Thiên Lương", buoc: 5 }, { ten: "Thất Sát", buoc: 6 }, { ten: "Phá Quân", buoc: 10 },
];

/** Vị trí đủ mười bốn chính tinh khi biết vị trí Tử Vi. */
export function viTriChinhTinh(viTriTuVi: number): Record<string, number> {
  const ra: Record<string, number> = {};
  for (const s of CHOM_TU_VI) ra[s.ten] = mod(viTriTuVi + s.buoc, 12);
  const tp = viTriThienPhu(viTriTuVi);
  for (const s of CHOM_THIEN_PHU) ra[s.ten] = mod(tp + s.buoc, 12);
  return ra;
}
