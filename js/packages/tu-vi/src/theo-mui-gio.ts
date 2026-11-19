// Lá số Tử Vi theo lịch âm của một múi giờ khác UTC+7 (lịch Trung Quốc UTC+8,
// Hàn Quốc, Nhật Bản UTC+9...). Lõi lapLaSoTuVi đổi ngày dương sang âm theo
// UTC+7; mọi sao chỉ phụ thuộc can chi năm, tháng âm, ngày âm, giờ và giới, nên
// ở múi giờ khác ta đổi âm theo đúng múi ấy rồi dựng lá từ ngày âm. Dùng chung
// cho castZiWei (tùy chọn country, timeZone) và lớp iztro.

import { lunarToSolar, solarToLunar } from "@nhatnguyet/am-lich";
import { lapLaSoTuVi } from "./la-so.ts";
import { normalizeZiWeiSchools, thangAnTheoPhai } from "./schools.ts";
import type { ZiWeiSchools } from "./schools.ts";
import type { LaSoTuVi } from "./kieu.ts";

/**
 * Lá số lõi cho một ngày âm bất kỳ: lapLaSoTuVi nhận ngày dương và đổi âm theo
 * UTC+7, nên tìm một ngày dương cho ra đúng (năm cùng can chi, tháng, ngày),
 * thử năm cách nhau 60 năm khi tháng ấy ở UTC+7 thiếu ngày 30.
 */
export function laSoTheoNgayAm(
  gioiTinh: string,
  nam: number,
  thang: number,
  ngay: number,
  chi: number,
  schools?: ZiWeiSchools,
  hoTen = "",
): LaSoTuVi {
  for (const k of [0, -1, 1, -2, 2, -3, 3, -4, 4, -5, 5]) {
    const y = nam + 60 * k;
    const r = lunarToSolar(ngay, thang, y, false, 7);
    if (!r.hopLe) continue;
    const back = solarToLunar(r.duong.day, r.duong.month, r.duong.year, 7);
    if (back.year === y && back.month === thang && back.day === ngay && !back.leap) {
      return lapLaSoTuVi(hoTen, gioiTinh, r.duong.day, r.duong.month, r.duong.year, chi, schools);
    }
  }
  throw new Error(`no chart for lunar ${nam}-${thang}-${ngay}`);
}

/**
 * Như lapLaSoTuVi nhưng đổi ngày dương sang âm theo `timeZone` (giờ). Ở UTC+7
 * là đúng lapLaSoTuVi; ở múi khác, lá số giữ ngày dương đã nhập, ngày âm của
 * múi ấy, lựa chọn phái và tháng an sao (khi khác tháng âm).
 */
export function lapLaSoTuViTheoMuiGio(
  hoTen: string,
  gioiTinh: string,
  dd: number,
  mm: number,
  yyyy: number,
  chi: number,
  schools: ZiWeiSchools | undefined,
  timeZone: number,
): LaSoTuVi {
  if (timeZone === 7) return lapLaSoTuVi(hoTen, gioiTinh, dd, mm, yyyy, chi, schools);
  const tc = normalizeZiWeiSchools(schools) ?? {};
  const am = solarToLunar(dd, mm, yyyy, timeZone);
  const thangAn = thangAnTheoPhai(am, tc.leapMonth);
  const conLai: ZiWeiSchools = { ...tc };
  delete conLai.leapMonth;
  const raw = laSoTheoNgayAm(gioiTinh, am.year, thangAn, am.day, chi, conLai, hoTen);
  if (Object.keys(tc).length) raw.schools = tc;
  else delete raw.schools;
  if (thangAn !== am.month) raw.placementMonth = thangAn;
  raw.ngaySinhDuong = { ngay: dd, thang: mm, nam: yyyy };
  raw.ngaySinhAm = am;
  return raw;
}
