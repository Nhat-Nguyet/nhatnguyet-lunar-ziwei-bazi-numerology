// Đổi lịch dương sang âm lịch Việt Nam và ngược lại.
//
// Ghi công:
// - Công thức thiên văn (điểm sóc, kinh độ Mặt Trời, số ngày Julian) theo
//   Jean Meeus, "Astronomical Algorithms" (Willmann-Bell, 1991; bản 2, 1998).
// - Cách dựng lịch âm từ điểm sóc và trung khí là quy tắc chung của lịch âm
//   dương truyền thống (lịch Thời Hiến), áp ở giờ Việt Nam: tháng âm bắt đầu ở ngày chứa
//   điểm sóc theo giờ địa phương, tháng 11 âm là tháng chứa Đông Chí, năm có
//   13 tháng thì tháng đầu tiên sau tháng 11 không chứa trung khí là tháng
//   nhuận.
// Mã ở đây viết lại từ mô tả thuật toán, theo bản Go của lõi tính Nhật Nguyệt
// (lÃµi tÃ­nh Go cá»§a Nháº­t Nguyá»t lunar.go), không chép mã nguồn của ai.
//
// Mọi phép tính giữ ĐÚNG thứ tự phép toán số thực của bản Go, để kết quả
// trùng từng bit: lệch một ulp ở chỗ lấy phần nguyên cũng đủ đổi một ngày.

/** Múi giờ của lịch Việt Nam (UTC+7), dùng cho mọi năm. */
export const TIME_ZONE_VN = 7;

/**
 * Múi giờ tính lịch âm của từng nước. Cùng một quy tắc lịch (tháng bắt đầu ở
 * ngày có điểm sóc, tháng 11 chứa Đông Chí, tháng nhuận là tháng đầu tiên
 * không có trung khí), chỉ khác giờ địa phương dùng để xét ngày. Dùng cho mọi
 * năm: lịch in trong quá khứ của từng nước có lúc theo giờ khác.
 */
export const MUI_GIO_LICH = {
  /** Việt Nam, UTC+7. */
  vietNam: 7,
  /** Trung Quốc (và Đài Loan, Hồng Kông), UTC+8. */
  trungQuoc: 8,
  /** Hàn Quốc, UTC+9. */
  hanQuoc: 9,
  /** Âm lịch cũ của Nhật Bản (kyūreki), UTC+9. */
  nhatBan: 9,
} as const;

/**
 * Múi giờ lịch âm theo mã nước ISO 3166-1. Các nước dùng lịch âm dương kiểu
 * Á Đông; cộng đồng người Hoa ở Đông Nam Á đón Tết theo lịch Trung Quốc.
 * Nước không có ở đây (Mông Cổ, Tây Tạng, Thái Lan, Lào, Campuchia, Myanmar,
 * Ấn Độ...) dùng hệ lịch khác quy tắc, không tính bằng hàm này.
 */
export const MUI_GIO_THEO_NUOC: Readonly<Record<string, number>> = {
  VN: 7, // Việt Nam (mặc định)
  CN: 8, // Trung Quốc
  TW: 8, // Đài Loan
  HK: 8, // Hồng Kông
  MO: 8, // Ma Cao
  SG: 8, // Singapore (Tết theo lịch Trung Quốc)
  MY: 8, // Malaysia (Tết theo lịch Trung Quốc)
  ID: 8, // Indonesia (Tết Imlek theo lịch Trung Quốc)
  PH: 8, // Philippines (Tết theo lịch Trung Quốc)
  KR: 9, // Hàn Quốc
  JP: 9, // Nhật Bản, âm lịch cũ (kyūreki)
};

/** Ngày dương lịch (Gregory; trước 15/10/1582 là Julius). */
export interface SolarDate {
  day: number;
  month: number;
  year: number;
}

/** Ngày âm lịch. `leap` đúng khi ngày thuộc tháng nhuận. */
export interface LunarDate {
  day: number;
  month: number;
  year: number;
  leap: boolean;
}

const floor = Math.floor;
/** Hệ số đổi độ sang radian. */
const DR = Math.PI / 180;
/** JD (giờ quốc tế) của điểm sóc mốc ngày 1/1/1900. */
const SOC_MOC = 2415021.076998695;
/** Độ dài trung bình một tháng sóc vọng (ngày). */
const THANG_SOC = 29.530588853;

/** Số ngày Julian (JDN) của một ngày dương lịch. */
export function jdFromDate(dd: number, mm: number, yy: number): number {
  const a = floor((14 - mm) / 12);
  const y = yy + 4800 - a;
  const m = mm + 12 * a - 3;
  let jd = dd + floor((153 * m + 2) / 5) + 365 * y + floor(y / 4) - floor(y / 100) + floor(y / 400) - 32045;
  if (jd < 2299161) {
    // Trước ngày đổi sang lịch Gregory: dùng lịch Julius.
    jd = dd + floor((153 * m + 2) / 5) + 365 * y + floor(y / 4) - 32083;
  }
  return Math.trunc(jd);
}

/** Đổi ngược số ngày Julian sang ngày dương lịch. */
export function jdToDate(jd: number): SolarDate {
  let b: number;
  let c: number;
  if (jd > 2299160) {
    const a = jd + 32044;
    b = floor((4 * a + 3) / 146097);
    c = a - floor((b * 146097) / 4);
  } else {
    b = 0;
    c = jd + 32082;
  }
  const d = floor((4 * c + 3) / 1461);
  const e = c - floor((1461 * d) / 4);
  const m = floor((5 * e + 2) / 153);
  const day = e - floor((153 * m + 2) / 5) + 1;
  const month = m + 3 - 12 * floor(m / 10);
  const year = b * 100 + d - 4800 + floor(m / 10);
  return { day: Math.trunc(day), month: Math.trunc(month), year: Math.trunc(year) };
}

/**
 * Thời điểm (JD, giờ quốc tế) của điểm sóc thứ k tính từ sóc 1/1/1900,
 * theo chuỗi rút gọn của Meeus cho pha trăng mới.
 */
export function newMoon(k: number): number {
  const T = k / 1236.85;
  const T2 = T * T;
  const T3 = T2 * T;
  const dr = DR;

  let jd1 = 2415020.75933 + 29.53058868 * k + 0.0001178 * T2 - 0.000000155 * T3;
  jd1 += 0.00033 * Math.sin((166.56 + 132.87 * T - 0.009173 * T2) * dr);

  // Dị thường trung bình của Mặt Trời (M), của Mặt Trăng (Mpr), và đối số vĩ độ (F).
  const M = 359.2242 + 29.10535608 * k - 0.0000333 * T2 - 0.00000347 * T3;
  const Mpr = 306.0253 + 385.81691806 * k + 0.0107306 * T2 + 0.00001236 * T3;
  const F = 21.2964 + 390.67050646 * k - 0.0016528 * T2 - 0.00000239 * T3;

  const C1 =
    (0.1734 - 0.000393 * T) * Math.sin(M * dr) +
    0.0021 * Math.sin(2 * dr * M) -
    0.4068 * Math.sin(Mpr * dr) +
    0.0161 * Math.sin(dr * 2 * Mpr) -
    0.0004 * Math.sin(dr * 3 * Mpr) +
    0.0104 * Math.sin(dr * 2 * F) -
    0.0051 * Math.sin(dr * (M + Mpr)) -
    0.0074 * Math.sin(dr * (M - Mpr)) +
    0.0004 * Math.sin(dr * (2 * F + M)) -
    0.0004 * Math.sin(dr * (2 * F - M)) -
    0.0006 * Math.sin(dr * (2 * F + Mpr)) +
    0.001 * Math.sin(dr * (2 * F - Mpr)) +
    0.0005 * Math.sin(dr * (2 * Mpr + M));

  // Hiệu chỉnh ΔT (đổi giờ động lực về giờ quốc tế), hai khoảng của T.
  let deltaT: number;
  if (T < -11) {
    deltaT = 0.001 + 0.000839 * T + 0.0002261 * T2 - 0.00000845 * T3 - 0.000000081 * T * T3;
  } else {
    deltaT = -0.000278 + 0.000265 * T + 0.000262 * T2;
  }
  return jd1 + C1 - deltaT;
}

/**
 * Kinh độ hình học của Mặt Trời (radian, 0 tới 2π) tại một JD, theo phương
 * trình tâm rút gọn của Meeus. Bộ đổi âm lịch dùng thẳng hàm này.
 */
export function sunLongitude(jdn: number): number {
  const T = (jdn - 2451545.0) / 36525;
  const T2 = T * T;
  const dr = DR;
  const M = 357.5291 + 35999.0503 * T - 0.0001559 * T2 - 0.00000048 * T * T2;
  const L0 = 280.46645 + 36000.76983 * T + 0.0003032 * T2;
  const DL =
    (1.9146 - 0.004817 * T - 0.000014 * T2) * Math.sin(dr * M) +
    (0.019993 - 0.000101 * T) * Math.sin(dr * 2 * M) +
    0.00029 * Math.sin(dr * 3 * M);
  let L = (L0 + DL) * dr;
  L = L - Math.PI * 2 * floor(L / (Math.PI * 2));
  return L;
}

/**
 * Cung kinh độ Mặt Trời (0 tới 11, mỗi cung 30 độ) lúc 0h của ngày JDN
 * `dayNumber` theo múi giờ `timeZone`. Cung 9 chứa Đông Chí (270 độ).
 */
export function getSunLongitude(dayNumber: number, timeZone: number): number {
  return floor((sunLongitude(dayNumber - 0.5 - timeZone / 24) / Math.PI) * 6);
}

/** JDN của ngày chứa điểm sóc thứ k, theo múi giờ `timeZone`. */
export function getNewMoonDay(k: number, timeZone: number): number {
  return floor(newMoon(k) + 0.5 + timeZone / 24);
}

/** JDN mùng 1 tháng 11 âm (tháng chứa Đông Chí) của năm dương `yy`. */
export function getLunarMonth11(yy: number, timeZone: number): number {
  const off = jdFromDate(31, 12, yy) - SOC_MOC;
  const k = floor(off / THANG_SOC);
  let nm = getNewMoonDay(k, timeZone);
  const sl = getSunLongitude(nm, timeZone);
  if (sl >= 9) {
    nm = getNewMoonDay(k - 1, timeZone);
  }
  return nm;
}

/**
 * Vị trí tháng nhuận trong một kỳ 13 tháng bắt đầu từ tháng 11 âm có mùng 1
 * là `a11`: tháng thứ i sau tháng 11 mà cung kinh độ Mặt Trời lúc đầu tháng
 * không đổi so với tháng trước (tức tháng không chứa trung khí).
 */
export function getLeapMonthOffset(a11: number, timeZone: number): number {
  const k = floor((a11 - SOC_MOC) / THANG_SOC + 0.5);
  let last = 0;
  let i = 1;
  let arc = getSunLongitude(getNewMoonDay(k + i, timeZone), timeZone);
  do {
    last = arc;
    i++;
    arc = getSunLongitude(getNewMoonDay(k + i, timeZone), timeZone);
  } while (arc !== last && i < 14);
  return i - 1;
}

/** Các giá trị trung gian của một lượt đổi dương sang âm. */
export interface BuocDoiAmLich {
  jdn: number;
  /** Số thứ tự lần sóc (tính từ sóc 1/1/1900) mở đầu tháng chứa ngày. */
  kSoc: number;
  /** JDN mùng 1 của tháng chứa ngày. */
  ngaySoc: number;
  /** JDN mùng 1 của hai tháng 11 âm kẹp ngày đang xét. */
  thang11: number;
  thang11Sau: number;
  /** Số tháng âm từ tháng 11 đầu kỳ tới tháng đang xét. */
  soThangTuThang11: number;
  /** Kỳ 13 tháng thì tháng thứ viTriNhuan sau tháng 11 là tháng nhuận; 0 khi kỳ 12 tháng. */
  viTriNhuan: number;
  ketQua: LunarDate;
}

/** Đổi dương sang âm, trả kèm các bước trung gian. */
export function doiAmLichChiTiet(dd: number, mm: number, yy: number, timeZone: number = TIME_ZONE_VN): BuocDoiAmLich {
  const dayNumber = jdFromDate(dd, mm, yy);
  const k = floor((dayNumber - SOC_MOC) / THANG_SOC);
  let kSoc = k + 1;
  let monthStart = getNewMoonDay(k + 1, timeZone);
  // Lùi TỚI KHI mùng 1 không sau ngày đang xét: k ước theo tháng sóc trung
  // bình có lúc cao hơn thật tới hai (bản Go ghi 7/5/2054 và 9/4/2062).
  while (monthStart > dayNumber) {
    kSoc--;
    monthStart = getNewMoonDay(kSoc, timeZone);
  }
  let a11 = getLunarMonth11(yy, timeZone);
  let b11 = a11;
  let lunarYear: number;
  if (a11 >= monthStart) {
    lunarYear = yy;
    a11 = getLunarMonth11(yy - 1, timeZone);
  } else {
    lunarYear = yy + 1;
    b11 = getLunarMonth11(yy + 1, timeZone);
  }
  const lunarDay = dayNumber - monthStart + 1;
  const diff = floor((monthStart - a11) / 29);
  let lunarLeap = false;
  let lunarMonth = diff + 11;
  let viTriNhuan = 0;
  if (b11 - a11 > 365) {
    const leapMonthDiff = getLeapMonthOffset(a11, timeZone);
    viTriNhuan = leapMonthDiff;
    if (diff >= leapMonthDiff) {
      lunarMonth = diff + 10;
      if (diff === leapMonthDiff) lunarLeap = true;
    }
  }
  if (lunarMonth > 12) lunarMonth -= 12;
  if (lunarMonth >= 11 && diff < 4) lunarYear--;
  return {
    jdn: dayNumber,
    kSoc,
    ngaySoc: Math.trunc(monthStart),
    thang11: Math.trunc(a11),
    thang11Sau: Math.trunc(b11),
    soThangTuThang11: Math.trunc(diff),
    viTriNhuan: Math.trunc(viTriNhuan),
    ketQua: { day: Math.trunc(lunarDay), month: Math.trunc(lunarMonth), year: lunarYear, leap: lunarLeap },
  };
}

/** Đổi ngày dương lịch sang ngày âm lịch Việt Nam (mặc định UTC+7). */
export function solarToLunar(dd: number, mm: number, yy: number, timeZone: number = TIME_ZONE_VN): LunarDate {
  return doiAmLichChiTiet(dd, mm, yy, timeZone).ketQua;
}

/** Kết quả đổi âm sang dương: `hopLe` sai khi tổ hợp ngày âm không tồn tại. */
export interface KetQuaAmSangDuong {
  duong: SolarDate;
  hopLe: boolean;
}

/**
 * Đổi ngày âm lịch sang dương lịch. Tháng nhuận không có trong năm ấy thì
 * trả `hopLe: false` với `duong` bằng 0/0/0 (như bản Go). Ngày 30 của tháng
 * thiếu không bị kiểm, ra ngày đầu tháng sau (như bản Go).
 */
export function lunarToSolar(
  lunarDay: number,
  lunarMonth: number,
  lunarYear: number,
  lunarLeap: boolean,
  timeZone: number = TIME_ZONE_VN,
): KetQuaAmSangDuong {
  let a11: number;
  let b11: number;
  if (lunarMonth < 11) {
    a11 = getLunarMonth11(lunarYear - 1, timeZone);
    b11 = getLunarMonth11(lunarYear, timeZone);
  } else {
    a11 = getLunarMonth11(lunarYear, timeZone);
    b11 = getLunarMonth11(lunarYear + 1, timeZone);
  }
  const k = floor(0.5 + (a11 - SOC_MOC) / THANG_SOC);
  let off = lunarMonth - 11;
  if (off < 0) off += 12;
  if (b11 - a11 > 365) {
    const leapOff = getLeapMonthOffset(a11, timeZone);
    let leapMonth = leapOff - 2;
    if (leapMonth < 0) leapMonth += 12;
    if (lunarLeap && lunarMonth !== leapMonth) {
      return { duong: { day: 0, month: 0, year: 0 }, hopLe: false };
    } else if (lunarLeap || off >= leapOff) {
      off++;
    }
  }
  const monthStart = getNewMoonDay(k + off, timeZone);
  return { duong: jdToDate(Math.trunc(monthStart) + lunarDay - 1), hopLe: true };
}
