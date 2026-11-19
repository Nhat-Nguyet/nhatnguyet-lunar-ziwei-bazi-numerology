// Tiểu vận (小运) và quan hệ can của năm với vận. Chuyển ngữ từ
// lÃµi tÃ­nh Go cá»§a Nháº­t Nguyá»t battu_tieuvan.go.
//
// Lối khởi từ TRỤ GIỜ (Tam Mệnh Thông Hội quyển 2, luận tiểu vận, dẫn Tuý
// Tỉnh Tử): một tuổi là trụ liền sau (hay liền trước) trụ giờ, mỗi năm một
// trụ; chiều đi như đại vận. Tuổi là TUỔI MỤ theo trụ năm (đổi ở Lập Xuân).
// Không có giờ sinh thì không có tiểu vận. Lối cổ (nam khởi Bính Dần, nữ
// khởi Nhâm Thân) không dùng vì không nói gì riêng về một lá số.

import { canToNguHanh, chiSoCan, chiSoChi, mod, nguHanhKhacDuoc, nguHanhSinhRa } from "./am-lich.ts";
import { truTuChiSo } from "./la-so.ts";
import type { LaSoBatTu, Tru } from "./la-so.ts";
import { thapThanCuaCan } from "./thap-than.ts";

/** Tiểu vận của một năm xem. */
export interface TieuVanBatTu extends Tru {
  nam: number;
  tuoiMu: number;
  thapThanCan: string;
  thapThanCanEn: string;
  thapThanCanZh: string;
  thuan: boolean;
}

/**
 * Tiểu vận của năm xem. Trả null khi lá số không có giờ sinh hay năm xem
 * đứng trước năm của trụ năm.
 */
export function tinhTieuVanBatTu(laSo: LaSoBatTu | null | undefined, namXem: number): TieuVanBatTu | null {
  if (!laSo || !laSo.truGio || !laSo.coGioSinh) return null;
  const tuoi = namXem - laSo.namTruNam + 1;
  if (tuoi < 1) return null;
  const can = chiSoCan(laSo.truGio.can);
  const chi = chiSoChi(laSo.truGio.chi);
  if (can < 0 || chi < 0) return null;
  const buoc = laSo.daiVan.thuan ? tuoi : -tuoi;
  const tru = truTuChiSo(can + buoc, chi + buoc);
  const tt = thapThanCuaCan(laSo.nhatChu, tru.can);
  return {
    nam: namXem,
    tuoiMu: tuoi,
    ...tru,
    thapThanCan: tt ? tt.ten : "",
    thapThanCanEn: tt ? tt.tenEn : "",
    thapThanCanZh: tt ? tt.tenZh : "",
    thuan: laSo.daiVan.thuan,
  };
}

/** Quan hệ của can thứ nhất với can thứ hai. */
export type QuanHeCan = "ngu-hop" | "khac" | "bi-khac" | "sinh" | "duoc-sinh" | "dong-hanh" | "";

/**
 * Quan hệ của can a với can b (tên tiếng Việt). Ngũ hợp (Giáp Kỷ, Ất Canh,
 * Bính Tân, Đinh Nhâm, Mậu Quý) xét TRƯỚC khắc. Rỗng khi tên can lạ.
 */
export function quanHeHaiCan(a: string, b: string): QuanHeCan {
  const ia = chiSoCan(a);
  const ib = chiSoCan(b);
  if (ia < 0 || ib < 0) return "";
  if (mod(ia - ib, 10) === 5) return "ngu-hop";
  const ha = canToNguHanh(a).hanh;
  const hb = canToNguHanh(b).hanh;
  if (ha === hb) return "dong-hanh";
  if (nguHanhKhacDuoc(ha) === hb) return "khac";
  if (nguHanhKhacDuoc(hb) === ha) return "bi-khac";
  if (nguHanhSinhRa(ha) === hb) return "sinh";
  if (nguHanhSinhRa(hb) === ha) return "duoc-sinh";
  return "";
}

/** Thiên khắc địa xung: can khắc nhau (một chiều bất kỳ, không tính ngũ hợp) VÀ chi lục xung. */
export function thienKhacDiaXung(canA: string, chiA: string, canB: string, chiB: string): boolean {
  const q = quanHeHaiCan(canA, canB);
  if (q !== "khac" && q !== "bi-khac") return false;
  const ia = chiSoChi(chiA);
  const ib = chiSoChi(chiB);
  return ia >= 0 && ib >= 0 && mod(ia - ib, 12) === 6;
}
