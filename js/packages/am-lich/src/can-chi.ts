// Can chi của năm, tháng âm, ngày; con giáp. Chuyển ngữ từ
// lÃµi tÃ­nh Go cá»§a Nháº­t Nguyá»t canchi.go.

import { jdFromDate, solarToLunar, TIME_ZONE_VN } from "./lich.ts";
import { CAN_NGU_HANH, HANH_EN, chiToNguHanh, nguHanhNapAm, tuongSinhTuongKhac } from "./ngu-hanh.ts";
import type { QuanHeNguHanh } from "./ngu-hanh.ts";

/** Mười thiên can, chỉ số 0 (Giáp) tới 9 (Quý). */
export const THIEN_CAN: readonly string[] = ["Giáp", "Ất", "Bính", "Đinh", "Mậu", "Kỷ", "Canh", "Tân", "Nhâm", "Quý"];

/** Mười hai địa chi, chỉ số 0 (Tý) tới 11 (Hợi). */
export const DIA_CHI: readonly string[] = ["Tý", "Sửu", "Dần", "Mão", "Thìn", "Tỵ", "Ngọ", "Mùi", "Thân", "Dậu", "Tuất", "Hợi"];

/** Con giáp theo thứ tự địa chi. */
export const CON_GIAP: readonly string[] = ["Chuột", "Trâu", "Hổ", "Mèo", "Rồng", "Rắn", "Ngựa", "Dê", "Khỉ", "Gà", "Chó", "Lợn"];

/** Một cặp can chi, ví dụ `{can: "Giáp", chi: "Thìn", label: "Giáp Thìn"}`. */
export interface CanChi {
  can: string;
  chi: string;
  label: string;
}

/** Phép chia lấy dư luôn không âm (như hàm mod của bản Go). */
export function mod(a: number, b: number): number {
  const m = a % b;
  return m < 0 ? m + b : m;
}

/** Chỉ số can (0 tới 9) của một tên can; -1 khi không phải tên can. */
export function chiSoCan(can: string): number {
  return THIEN_CAN.indexOf(can);
}

/** Chỉ số chi (0 tới 11) của một tên chi; -1 khi không phải tên chi. */
export function chiSoChi(chi: string): number {
  return DIA_CHI.indexOf(chi);
}

/** Dựng cặp can chi từ hai chỉ số (tự đưa về vòng). */
export function canChiTuChiSo(canIdx: number, chiIdx: number): CanChi {
  const can = THIEN_CAN[mod(canIdx, 10)];
  const chi = DIA_CHI[mod(chiIdx, 12)];
  return { can, chi, label: can + " " + chi };
}

/** Chỉ số can của năm âm lịch: (năm - 4) mod 10. */
export function chiSoCanNam(lunarYear: number): number {
  return mod(lunarYear - 4, 10);
}

/** Chỉ số chi của năm âm lịch: (năm - 4) mod 12. */
export function chiSoChiNam(lunarYear: number): number {
  return mod(lunarYear - 4, 12);
}

/** Can chi của NĂM ÂM LỊCH (không phải năm dương). 2026 là Bính Ngọ. */
export function yearCanChi(lunarYear: number): CanChi {
  return canChiTuChiSo(chiSoCanNam(lunarYear), chiSoChiNam(lunarYear));
}

/** Tên con giáp của năm âm lịch. */
export function conGiapOfYear(lunarYear: number): string {
  return CON_GIAP[mod(lunarYear - 4, 12)];
}

/**
 * Con giáp theo năm ÂM của ngày sinh dương lịch: người sinh tháng 1, 2 trước
 * Tết thuộc năm âm trước. Thiếu ngày hay tháng thì dùng năm dương.
 */
export function conGiapTheoNgaySinh(dd: number, mm: number, yyyy: number): string {
  if (dd <= 0 || mm <= 0 || yyyy <= 0) return conGiapOfYear(yyyy);
  return conGiapOfYear(solarToLunar(dd, mm, yyyy, TIME_ZONE_VN).year);
}

/** Chỉ số can của ngày: (JDN + 9) mod 10. */
export function chiSoCanNgay(dd: number, mm: number, yy: number): number {
  return mod(jdFromDate(dd, mm, yy) + 9, 10);
}

/** Chỉ số chi của ngày: (JDN + 1) mod 12. */
export function chiSoChiNgay(dd: number, mm: number, yy: number): number {
  return mod(jdFromDate(dd, mm, yy) + 1, 12);
}

/** Can chi của một ngày dương lịch. */
export function dayCanChi(dd: number, mm: number, yy: number): CanChi {
  return canChiTuChiSo(chiSoCanNgay(dd, mm, yy), chiSoChiNgay(dd, mm, yy));
}

const CHI_THANG_AM: readonly string[] = ["Dần", "Mão", "Thìn", "Tỵ", "Ngọ", "Mùi", "Thân", "Dậu", "Tuất", "Hợi", "Tý", "Sửu"];

/** Chi cố định theo số tháng âm (tháng Giêng là Dần); "?" khi tháng không hợp lệ. */
export function chiOfLunarMonth(lunarMonth: number): string {
  if (Number.isInteger(lunarMonth) && lunarMonth >= 1 && lunarMonth <= 12) return CHI_THANG_AM[lunarMonth - 1];
  return "?";
}

/**
 * Ngũ Hổ Độn: chỉ số can của tháng Dần suy từ chỉ số can năm.
 * Giáp, Kỷ ra Bính Dần; Ất, Canh ra Mậu Dần; Bính, Tân ra Canh Dần;
 * Đinh, Nhâm ra Nhâm Dần; Mậu, Quý ra Giáp Dần.
 */
export function canThangDan(canNamIdx: number): number {
  return (((canNamIdx % 5) * 2 + 2) % 10);
}

/**
 * Ngũ Thử Độn: chỉ số can của giờ Tý suy từ chỉ số can ngày.
 * Giáp, Kỷ ra Giáp Tý; Ất, Canh ra Bính Tý; Bính, Tân ra Mậu Tý;
 * Đinh, Nhâm ra Canh Tý; Mậu, Quý ra Nhâm Tý.
 */
export function canGioDau(canNgayIdx: number): number {
  return ((canNgayIdx % 5) * 2) % 10;
}

/** Chỉ số chi của giờ đồng hồ 0 tới 23 (giờ Tý từ 23h hôm trước tới 1h). */
export function chiGioTuGioDongHo(gio: number): number {
  return Math.trunc((gio + 1) / 2) % 12;
}

/**
 * Can chi của THÁNG ÂM LỊCH theo lịch vạn niên Việt Nam: chi theo số tháng,
 * can suy từ can năm theo Ngũ Hổ Độn. Tháng nhuận mang can chi của tháng
 * chính cùng số. Khác trụ tháng Bát Tự (đổi theo tiết khí).
 * Tháng ngoài 1 tới 12 trả ba chuỗi rỗng.
 */
export function lunarMonthCanChi(lunarMonth: number, lunarYear: number): CanChi {
  if (lunarMonth < 1 || lunarMonth > 12) return { can: "", chi: "", label: "" };
  const canNam = mod(lunarYear - 4, 10);
  const can = THIEN_CAN[mod(canThangDan(canNam) + lunarMonth - 1, 10)];
  const chi = chiOfLunarMonth(lunarMonth);
  return { can, chi, label: can + " " + chi };
}

/** Một dòng của bảng Lục Thập Hoa Giáp. */
export interface HoaGiapEntry {
  /** 1 tới 60, Giáp Tý thứ 1, Quý Hợi thứ 60. */
  thuTu: number;
  can: string;
  chi: string;
  label: string;
  conGiap: string;
  hanh: string;
  hanhEn: string;
  tenNapAm: string;
  /** Các năm ÂM LỊCH trong khoảng ứng với cặp can chi này. */
  nam: number[];
}

/** Đủ 60 cặp can chi theo vòng Hoa Giáp, kèm nạp âm và các năm âm trong [tuNam, denNam]. */
export function lucThapHoaGiap(tuNam: number, denNam: number): HoaGiapEntry[] {
  const out: HoaGiapEntry[] = [];
  for (let i = 0; i < 60; i++) {
    const canIdx = i % 10;
    const chiIdx = i % 12;
    const can = THIEN_CAN[canIdx];
    const chi = DIA_CHI[chiIdx];
    const na = nguHanhNapAm(canIdx, chiIdx);
    const nam: number[] = [];
    for (let y = tuNam; y <= denNam; y++) {
      if (mod(y - 4, 60) === i) nam.push(y);
    }
    out.push({
      thuTu: i + 1,
      can,
      chi,
      label: can + " " + chi,
      conGiap: CON_GIAP[chiIdx],
      hanh: na.hanh,
      hanhEn: na.hanhEn,
      tenNapAm: na.ten,
      nam,
    });
  }
  return out;
}

/** Hành và âm dương của một thiên can theo tên; `ok` sai khi tên không hợp lệ. Can chỉ số chẵn là Dương. */
export function canToNguHanh(can: string): { hanh: string; hanhEn: string; duong: boolean; ok: boolean } {
  const i = THIEN_CAN.indexOf(can);
  if (i < 0) return { hanh: "", hanhEn: "", duong: false, ok: false };
  const hanh = CAN_NGU_HANH[i];
  return { hanh, hanhEn: HANH_EN[hanh], duong: i % 2 === 0, ok: true };
}

/** Kết quả so ngũ hành của chi năm sinh giữa hai người. */
export interface NguHanhPairKetQua {
  chiNam1: string;
  chiNam2: string;
  hanhNam1: string;
  hanhNam2: string;
  quanHe: QuanHeNguHanh;
}

/** So ngũ hành của chi năm sinh (năm âm lịch) giữa hai người. */
export function xemNguHanhTheoNam(lunarYear1: number, lunarYear2: number): NguHanhPairKetQua {
  const chi1 = yearCanChi(lunarYear1).chi;
  const chi2 = yearCanChi(lunarYear2).chi;
  const hanh1 = chiToNguHanh(chi1).hanh;
  const hanh2 = chiToNguHanh(chi2).hanh;
  return { chiNam1: chi1, chiNam2: chi2, hanhNam1: hanh1, hanhNam2: hanh2, quanHe: tuongSinhTuongKhac(hanh1, hanh2) };
}
