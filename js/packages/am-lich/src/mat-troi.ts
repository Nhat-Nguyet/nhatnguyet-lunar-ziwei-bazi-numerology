// Kinh độ biểu kiến của Mặt Trời cho tiết khí. Chuyển ngữ từ lõi tính Go của
// Nhật Nguyệt (mat_troi.go), cùng thứ tự phép tính để ra cùng số.
//
// Cách tính độ chính xác cao của Jean Meeus, "Astronomical Algorithms" (bản
// 2, 1998), chương 32, 25 và 22:
//
//  1. L, R nhật tâm của Trái Đất theo VSOP87D (Bretagnon và Francou 1988,
//     IMCCE), bản rút gọn ở mat-troi-bang.ts (sinh bằng
//     scripts/sinh-bang-mat-troi.py của kho Nhật Nguyệt);
//  2. địa tâm: Θ = L + 180 độ;
//  3. hệ FK5: -0,09033 giây cung;
//  4. chương động theo kinh độ Δψ, IAU 1980, 63 số hạng;
//  5. quang sai -20,4898 giây cung chia R.
//
// Tính ở giờ động lực TT; giờ quốc tế UT cộng ΔT của Espenak và Meeus (NASA,
// 2006). Đối chiếu IMCCE trên 4.824 mốc tiết khí 1900 tới 2100: lệch nhiều
// nhất 0,31 phút trước khi làm tròn.

import { CHUONG_DONG_IAU1980, VSOP87D_TRAI_DAT_L, VSOP87D_TRAI_DAT_R } from "./mat-troi-bang.ts";

type Bang = readonly (readonly (readonly [number, number, number])[])[];

const FK5_KINH_DO_GIAY = -0.09033;
/** Hệ số quang sai (giây cung); quang sai thật là hệ số này chia R. */
export const QUANG_SAI_K_GIAY = -20.4898;

/** Σ_p τ^p Σ A·cos(B + C·τ), lược đồ Horner, cùng thứ tự cộng với bản Go. */
function chuoiVSOP(bang: Bang, tau: number): number {
  let s = 0;
  for (let p = bang.length - 1; p >= 0; p--) {
    let x = 0;
    for (const h of bang[p]) x += h[0] * Math.cos(h[1] + h[2] * tau);
    s = s * tau + x;
  }
  return s;
}

/** Chương động theo kinh độ Δψ (giây cung), IAU 1980; T là thế kỷ Julius từ J2000 (TT). */
export function chuongDongKinhDoGiay(T: number): number {
  const T2 = T * T;
  const T3 = T2 * T;
  const D = 297.85036 + 445267.11148 * T - 0.0019142 * T2 + T3 / 189474;
  const M = 357.52772 + 35999.05034 * T - 0.0001603 * T2 - T3 / 300000;
  const Mp = 134.96298 + 477198.867398 * T + 0.0086972 * T2 + T3 / 56250;
  const F = 93.27191 + 483202.017538 * T - 0.0036825 * T2 + T3 / 327270;
  const Om = 125.04452 - 1934.136261 * T + 0.0020708 * T2 + T3 / 450000;
  const dr = Math.PI / 180;
  let s = 0;
  for (const h of CHUONG_DONG_IAU1980) {
    const doiSo = (h[0] * D + h[1] * M + h[2] * Mp + h[3] * F + h[4] * Om) * dr;
    s += (h[5] + h[6] * T) * Math.sin(doiSo);
  }
  return s * 0.0001;
}

/** Kinh độ biểu kiến của Mặt Trời (độ, 0 tới 360) tại ngày Julius `jde` theo giờ TT. */
export function kinhDoBieuKienTT(jde: number): number {
  const tau = (jde - 2451545.0) / 365250.0;
  const L = chuoiVSOP(VSOP87D_TRAI_DAT_L, tau);
  const R = chuoiVSOP(VSOP87D_TRAI_DAT_R, tau);
  const T = tau * 10;
  let deg = (L * 180) / Math.PI + 180;
  deg += (FK5_KINH_DO_GIAY + chuongDongKinhDoGiay(T) + QUANG_SAI_K_GIAY / R) / 3600.0;
  deg = deg % 360;
  if (deg < 0) deg += 360;
  return deg;
}

/** Ngày Julius (UT) sang năm dương lịch thập phân. */
export function namThapPhan(jdUT: number): number {
  return 2000 + (jdUT - 2451544.5) / 365.2425;
}

/**
 * ΔT = TT - UT (giây) theo các đa thức của Espenak và Meeus (NASA, 2006);
 * `y` là năm thập phân (2026.5 là giữa năm 2026). Ngoài 1600 tới 2150 dùng
 * parabol dài hạn cùng nguồn.
 */
export function deltaTGiay(y: number): number {
  if (y >= 1600 && y < 1700) {
    const t = y - 1600;
    return 120 - 0.9808 * t - 0.01532 * t * t + (t * t * t) / 7129;
  }
  if (y >= 1700 && y < 1800) {
    const t = y - 1700;
    return 8.83 + 0.1603 * t - 0.0059285 * t * t + 0.00013336 * t * t * t - (t * t * t * t) / 1174000;
  }
  if (y >= 1800 && y < 1860) {
    const t = y - 1800;
    return (
      13.72 - 0.332447 * t + 0.0068612 * t * t + 0.0041116 * t * t * t - 0.00037436 * t * t * t * t +
      0.0000121272 * t * t * t * t * t - 0.0000001699 * t * t * t * t * t * t + 0.000000000875 * t * t * t * t * t * t * t
    );
  }
  if (y >= 1860 && y < 1900) {
    const t = y - 1860;
    return 7.62 + 0.5737 * t - 0.251754 * t * t + 0.01680668 * t * t * t - 0.0004473624 * t * t * t * t + (t * t * t * t * t) / 233174;
  }
  if (y >= 1900 && y < 1920) {
    const t = y - 1900;
    return -2.79 + 1.494119 * t - 0.0598939 * t * t + 0.0061966 * t * t * t - 0.000197 * t * t * t * t;
  }
  if (y >= 1920 && y < 1941) {
    const t = y - 1920;
    return 21.2 + 0.84493 * t - 0.0761 * t * t + 0.0020936 * t * t * t;
  }
  if (y >= 1941 && y < 1961) {
    const t = y - 1950;
    return 29.07 + 0.407 * t - (t * t) / 233 + (t * t * t) / 2547;
  }
  if (y >= 1961 && y < 1986) {
    const t = y - 1975;
    return 45.45 + 1.067 * t - (t * t) / 260 - (t * t * t) / 718;
  }
  if (y >= 1986 && y < 2005) {
    const t = y - 2000;
    return 63.86 + 0.3345 * t - 0.060374 * t * t + 0.0017275 * t * t * t + 0.000651814 * t * t * t * t + 0.00002373599 * t * t * t * t * t;
  }
  if (y >= 2005 && y < 2050) {
    const t = y - 2000;
    return 62.92 + 0.32217 * t + 0.005589 * t * t;
  }
  if (y >= 2050 && y < 2150) {
    const u = (y - 1820) / 100;
    return -20 + 32 * u * u - 0.5628 * (2150 - y);
  }
  const u = (y - 1820) / 100;
  return -20 + 32 * u * u;
}

/** Kinh độ biểu kiến (độ) tại ngày Julius `jdUT` theo giờ UT. */
export function kinhDoMatTroiUT(jdUT: number): number {
  return kinhDoBieuKienTT(jdUT + deltaTGiay(namThapPhan(jdUT)) / 86400);
}
