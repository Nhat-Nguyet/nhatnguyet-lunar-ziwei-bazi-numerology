// @nhatnguyet/le-hoi: lịch lễ hội Việt Nam (bộ dữ liệu mở le-hoi-viet-nam của
// Nhật Nguyệt) và phép quy đổi sang ngày dương của từng năm.
//
// Luật quy đổi là luật của lõi tính Go (dulieu.NgayDuongCuaLe), kiểm bằng ca
// kiểm le-hoi.json:
// - lễ dương lịch giữ ngày tháng; 29/2 của năm không nhuận không có thật nên bỏ;
// - lễ âm lịch đổi ở giờ Việt Nam (UTC+7), đặt vào tháng CHÍNH, không tháng nhuận;
// - ngày 30 của tháng âm thiếu (29 ngày) không có thật: bỏ năm ấy, không đoán
//   lễ dời về ngày nào;
// - lễ "theo-nam" do ban tổ chức công bố từng năm: không tính, xem lich_cong_bo.

import { jdFromDate, jdToDate, lunarToSolar, solarToLunar } from "@nhatnguyet/am-lich";
import type { SolarDate } from "@nhatnguyet/am-lich";
import type { LeHoi } from "./kieu.ts";
import { DANH_SACH_LE_HOI } from "./du-lieu.ts";

export type { LeHoi } from "./kieu.ts";
export type { Province } from "./kieu.ts";
export { DANH_SACH_LE_HOI, MA_PHAT_HANH, PHIEN_BAN_DU_LIEU, DATA_UPDATED, PROVINCES } from "./du-lieu.ts";

function tach(s: string): [number, number] {
  const i = s.indexOf("/");
  if (i <= 0) return [0, 0];
  return [Number(s.slice(0, i)), Number(s.slice(i + 1))];
}

/** Ngày dương của lễ trong năm `nam`, hoặc null khi năm ấy không có ngày ấy hay lễ không theo ngày cố định. */
export function ngayDuongCuaLe(le: LeHoi, nam: number): SolarDate | null {
  if (le.loai_ngay === "solar") {
    const [d, m] = tach(le.ngay_duong);
    if (!d || !m) return null;
    const sd = jdToDate(jdFromDate(d, m, nam));
    return sd.day === d && sd.month === m && sd.year === nam ? sd : null;
  }
  if (le.loai_ngay !== "lunar") return null;
  const [d, m] = tach(le.ngay_am);
  if (!d || !m) return null;
  const r = lunarToSolar(d, m, nam, false, 7);
  if (!r.hopLe) return null;
  const al = solarToLunar(r.duong.day, r.duong.month, r.duong.year, 7);
  if (al.day !== d || al.month !== m || al.year !== nam || al.leap) return null;
  return r.duong;
}

function chuoiNgay(sd: SolarDate): string {
  const p = (n: number, w: number) => String(n).padStart(w, "0");
  return `${p(sd.year, 4)}-${p(sd.month, 2)}-${p(sd.day, 2)}`;
}

/** Mọi lễ ngày cố định (âm hay dương) của năm `nam`, theo thứ tự trong bộ dữ liệu, ngày dạng YYYY-MM-DD. */
export function leHoiTrongNam(nam: number): { id: string; ngay: string }[] {
  const out: { id: string; ngay: string }[] = [];
  for (const le of DANH_SACH_LE_HOI) {
    const sd = ngayDuongCuaLe(le, nam);
    if (sd) out.push({ id: le.id, ngay: chuoiNgay(sd) });
  }
  return out;
}

/** Các lễ rơi đúng vào ngày dương dd/mm/yyyy (chỉ lễ ngày cố định). */
export function leHoiTheoNgay(dd: number, mm: number, yyyy: number): LeHoi[] {
  return DANH_SACH_LE_HOI.filter((le) => {
    const sd = ngayDuongCuaLe(le, yyyy);
    return sd !== null && sd.day === dd && sd.month === mm;
  });
}

// Lớp API tiếng Anh (tham số đặt tên, kết quả theo lang).
export * from "./en.ts";
// iCalendar (RFC 5545).
export { festivalsIcs } from "./ics.ts";
