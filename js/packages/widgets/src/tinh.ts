// Phần TÍNH của các thành phần, không đụng tới DOM: chạy được trong Node để
// kiểm, và là nơi duy nhất quyết định con số. Lõi lịch là @nhatnguyet/am-lich,
// tức đúng lõi Go mà widget trên nhatnguyet.org gọi qua API, nên ngày âm ở
// đây và ở widget trên site là một.

import {
  dayCanChi,
  jdFromDate,
  jdToDate,
  lunarToSolar,
  MUI_GIO_THEO_NUOC,
  solarToLunar,
  tietKhiCuaNgay,
  yearCanChi,
} from "@nhatnguyet/am-lich";
import type { LunarDate, SolarDate } from "@nhatnguyet/am-lich";

export type Lang = "vi" | "en" | "zh";

/** Múi giờ lịch âm của một mã nước (VN mặc định; mã lạ cũng về VN). */
export function muiGio(country: string | null | undefined): number {
  const ma = (country || "VN").toUpperCase();
  return MUI_GIO_THEO_NUOC[ma] ?? 7;
}

/** Đọc ngôn ngữ từ thuộc tính: chỉ nhận vi, en, zh; còn lại là vi. */
export function docLang(v: string | null | undefined): Lang {
  return v === "en" || v === "zh" ? v : "vi";
}

/** Đọc "YYYY-MM-DD"; sai dạng hay ngày không có thật thì null. */
export function docNgay(v: string | null | undefined): SolarDate | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(v || "");
  if (!m) return null;
  const sd = { year: +m[1], month: +m[2], day: +m[3] };
  const lai = jdToDate(jdFromDate(sd.day, sd.month, sd.year));
  return lai.day === sd.day && lai.month === sd.month && lai.year === sd.year ? sd : null;
}

/** Hôm nay theo đồng hồ của máy người đọc. */
export function homNay(bayGio: Date = new Date()): SolarDate {
  return { day: bayGio.getDate(), month: bayGio.getMonth() + 1, year: bayGio.getFullYear() };
}

export function chuoiNgay(sd: SolarDate): string {
  const p = (n: number, w = 2) => String(n).padStart(w, "0");
  return `${p(sd.year, 4)}-${p(sd.month)}-${p(sd.day)}`;
}

/** Thứ trong tuần, 0 là Chủ nhật. */
export function thuTrongTuan(sd: SolarDate): number {
  return (jdFromDate(sd.day, sd.month, sd.year) + 1) % 7;
}

export function congNgay(sd: SolarDate, n: number): SolarDate {
  return jdToDate(jdFromDate(sd.day, sd.month, sd.year) + n);
}

export function soNgayTrongThang(thang: number, nam: number): number {
  const sau = thang === 12 ? { m: 1, y: nam + 1 } : { m: thang + 1, y: nam };
  return jdFromDate(1, sau.m, sau.y) - jdFromDate(1, thang, nam);
}

// --- chữ ba thứ tiếng ---

export const THANG_EN = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const SO_HAN = ["", "一", "二", "三", "四", "五", "六", "七", "八", "九", "十"];
export const CAN_ZH = ["甲", "乙", "丙", "丁", "戊", "己", "庚", "辛", "壬", "癸"];
export const CHI_ZH = ["子", "丑", "寅", "卯", "辰", "巳", "午", "未", "申", "酉", "戌", "亥"];
const CHI_VI = ["Tý", "Sửu", "Dần", "Mão", "Thìn", "Tỵ", "Ngọ", "Mùi", "Thân", "Dậu", "Tuất", "Hợi"];
const CAN_VI = ["Giáp", "Ất", "Bính", "Đinh", "Mậu", "Kỷ", "Canh", "Tân", "Nhâm", "Quý"];
// Con giáp Việt: Mão là Mèo, Mùi là Dê.
const CON_GIAP_EN = ["Rat", "Ox", "Tiger", "Cat", "Dragon", "Snake", "Horse", "Goat", "Monkey", "Rooster", "Dog", "Pig"];
const CON_GIAP_VI = ["Chuột", "Trâu", "Hổ", "Mèo", "Rồng", "Rắn", "Ngựa", "Dê", "Khỉ", "Gà", "Chó", "Lợn"];
const CON_GIAP_ZH = ["鼠", "牛", "虎", "猫", "龙", "蛇", "马", "羊", "猴", "鸡", "狗", "猪"];

export const THU_DAI: Record<Lang, string[]> = {
  vi: ["Chủ nhật", "Thứ Hai", "Thứ Ba", "Thứ Tư", "Thứ Năm", "Thứ Sáu", "Thứ Bảy"],
  en: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
  zh: ["星期日", "星期一", "星期二", "星期三", "星期四", "星期五", "星期六"],
};

/** Đầu cột lịch tháng, tuần bắt đầu từ Thứ Hai. */
export const THU_NGAN: Record<Lang, string[]> = {
  vi: ["T2", "T3", "T4", "T5", "T6", "T7", "CN"],
  en: ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"],
  zh: ["一", "二", "三", "四", "五", "六", "日"],
};

/** "Tháng 11 · 2026" | "November 2026" | "2026年11月". */
export function thangNam(lang: Lang, thang: number, nam: number, thuong = false): string {
  if (lang === "en") return `${THANG_EN[thang - 1]} ${nam}`;
  if (lang === "zh") return `${nam}年${thang}月`;
  return `${thuong ? "tháng" : "Tháng"} ${thang} · ${nam}`;
}

/** Ngày dương đủ chữ: "19/11/2026" | "19 November 2026" | "2026年11月19日". */
export function ngayDuong(lang: Lang, sd: SolarDate): string {
  if (lang === "en") return `${sd.day} ${THANG_EN[sd.month - 1]} ${sd.year}`;
  if (lang === "zh") return `${sd.year}年${sd.month}月${sd.day}日`;
  const p = (n: number) => String(n).padStart(2, "0");
  return `${p(sd.day)}/${p(sd.month)}/${sd.year}`;
}

export function thangAmHan(thang: number): string {
  if (thang === 1) return "正月";
  if (thang === 11) return "冬月";
  if (thang === 12) return "腊月";
  return `${SO_HAN[thang]}月`;
}

export function ngayAmHan(ngay: number): string {
  if (ngay <= 10) return `初${SO_HAN[ngay]}`;
  if (ngay < 20) return `十${SO_HAN[ngay - 10]}`;
  if (ngay === 20) return "二十";
  if (ngay < 30) return `廿${SO_HAN[ngay - 20]}`;
  return "三十";
}

/** Ngày âm đủ chữ, cùng lối với widget trên site. */
export function nhanAm(lang: Lang, am: LunarDate, coNam = false): string {
  const nam = coNam ? am.year : 0;
  if (lang === "en") return `Lunar day ${am.day}, ${am.leap ? "leap " : ""}month ${am.month}${nam ? `, ${nam}` : ""}`;
  if (lang === "zh") return `农历${nam ? `${nam}年` : ""}${am.leap ? "闰" : ""}${thangAmHan(am.month)}${ngayAmHan(am.day)}`;
  return `${am.day}/${am.month}${am.leap ? " nhuận" : ""}${nam ? `/${nam}` : ""} âm lịch`;
}

/** Can chi theo ngôn ngữ: vi, en giữ âm Hán Việt ("Đinh Dậu"), zh chữ Hán ("丁酉"). */
export function canChiTheo(lang: Lang, can: string, chi: string): string {
  if (lang === "zh") return `${CAN_ZH[CAN_VI.indexOf(can)] ?? can}${CHI_ZH[CHI_VI.indexOf(chi)] ?? chi}`;
  return `${can} ${chi}`;
}

/** "ngày Đinh Dậu" | "Day Đinh Dậu" | "丁酉日". */
export function chuCanChiNgay(lang: Lang, sd: SolarDate, hoa = false): string {
  const cc = dayCanChi(sd.day, sd.month, sd.year);
  const t = canChiTheo(lang, cc.can, cc.chi);
  if (lang === "zh") return `${t}日`;
  if (lang === "en") return `Day ${t}`;
  return `${hoa ? "Ngày" : "ngày"} ${t}`;
}

/** Tên canh giờ theo chỉ số chi: vi "Sửu", en "Ox", zh "丑". */
export function tenCanhGio(lang: Lang, chi: number): string {
  return lang === "en" ? CON_GIAP_EN[chi] : lang === "zh" ? CHI_ZH[chi] : CHI_VI[chi];
}

/** Khung giờ của canh giờ thứ `chi`: vi "23h-1h", en, zh "23:00-01:00". */
export function khungGio(lang: Lang, chi: number): string {
  const dau = (chi * 2 + 23) % 24;
  const cuoi = (dau + 2) % 24;
  if (lang === "vi") return `${dau}h-${cuoi}h`;
  const h = (n: number) => String(n).padStart(2, "0") + ":00";
  return `${h(dau)}-${h(cuoi)}`;
}

export function tenConGiap(lang: Lang, chi: number): string {
  return lang === "en" ? CON_GIAP_EN[chi] : lang === "zh" ? CON_GIAP_ZH[chi] : CON_GIAP_VI[chi];
}

// --- lịch một ngày ---

export interface NgayLich {
  duong: SolarDate;
  am: LunarDate;
  /** 0 là Chủ nhật. */
  thu: number;
  canChiNgay: { can: string; chi: string };
  tietKhi: { ten: string; tenEn: string; tenZh: string };
}

// Tên chữ Hán của 24 tiết khí theo index kinh độ (0 là Xuân Phân).
const TIET_KHI_ZH = [
  "春分", "清明", "谷雨", "立夏", "小满", "芒种", "夏至", "小暑", "大暑", "立秋", "处暑", "白露",
  "秋分", "寒露", "霜降", "立冬", "小雪", "大雪", "冬至", "小寒", "大寒", "立春", "雨水", "惊蛰",
];

/**
 * Ngày âm, can chi, tiết khí của một ngày dương. Ngày âm đổi theo múi giờ của
 * nước (`tz`); tiết khí của ngày xét lúc 12 giờ trưa giờ Việt Nam như lõi.
 */
export function ngayLich(sd: SolarDate, tz = 7): NgayLich {
  const cc = dayCanChi(sd.day, sd.month, sd.year);
  const tk = tietKhiCuaNgay(sd.day, sd.month, sd.year);
  return {
    duong: sd,
    am: solarToLunar(sd.day, sd.month, sd.year, tz),
    thu: thuTrongTuan(sd),
    canChiNgay: { can: cc.can, chi: cc.chi },
    tietKhi: { ten: tk.ten, tenEn: tk.tenEn, tenZh: TIET_KHI_ZH[tk.index] ?? tk.ten },
  };
}

/** Mùa theo tháng âm, ngả màu nhãn tiết khí như widget trên site. */
export function muaTheoThangAm(thangAm: number): { ten: string; mau: string } {
  if (thangAm >= 1 && thangAm <= 3) return { ten: "xuân", mau: "#6f9c6a" };
  if (thangAm >= 4 && thangAm <= 6) return { ten: "hạ", mau: "#c08a2e" };
  if (thangAm >= 7 && thangAm <= 9) return { ten: "thu", mau: "#b06a3b" };
  return { ten: "đông", mau: "#5a7a92" };
}

// --- giờ hoàng đạo ---

// Bảng của lõi Go (coreengine/hoangdao.go, hoangDaoChiByGroup): sáu cặp chi
// của ngày, mỗi cặp sáu giờ hoàng đạo. Chỉ số chi 0 là Tý.
const HOANG_DAO_THEO_CAP: readonly (readonly number[])[] = [
  [0, 1, 3, 6, 8, 9], // ngày Tý, Ngọ
  [2, 3, 5, 8, 10, 11], // ngày Sửu, Mùi
  [0, 1, 4, 5, 7, 10], // ngày Dần, Thân
  [0, 2, 3, 6, 7, 9], // ngày Mão, Dậu
  [2, 4, 5, 8, 9, 11], // ngày Thìn, Tuất
  [1, 4, 6, 7, 10, 11], // ngày Tỵ, Hợi
];

export interface CanhGio {
  /** Chỉ số chi, 0 là Tý (23h tới 1h). */
  chi: number;
  hoangDao: boolean;
}

/** 12 canh giờ của một ngày dương, theo chi của ngày (không phụ thuộc múi giờ). */
export function gioHoangDao(sd: SolarDate): CanhGio[] {
  const chiNgay = CHI_VI.indexOf(dayCanChi(sd.day, sd.month, sd.year).chi);
  const tot = HOANG_DAO_THEO_CAP[chiNgay % 6];
  return Array.from({ length: 12 }, (_, chi) => ({ chi, hoangDao: tot.includes(chi) }));
}

// --- lịch tháng ---

export interface OLich {
  duong: SolarDate;
  am: LunarDate;
}

/** Các ngày của một tháng dương kèm ngày âm, và số ô trống đầu tuần (tuần từ Thứ Hai). */
export function thangLich(thang: number, nam: number, tz = 7): { dauTuan: number; ngay: OLich[] } {
  const n = soNgayTrongThang(thang, nam);
  const ngay: OLich[] = [];
  for (let d = 1; d <= n; d++) ngay.push({ duong: { day: d, month: thang, year: nam }, am: solarToLunar(d, thang, nam, tz) });
  const dauTuan = (thuTrongTuan({ day: 1, month: thang, year: nam }) + 6) % 7;
  return { dauTuan, ngay };
}

// --- Tết ---

export interface TetSapToi {
  /** Mùng Một Tết sắp tới (hay hôm nay). */
  tet: SolarDate;
  namAm: number;
  canChiNam: { can: string; chi: string };
  /** Chỉ số chi của năm, cho tên con giáp. */
  chiNam: number;
  soNgayConLai: number;
  laMungMot: boolean;
  laGiaoThua: boolean;
}

/** Tết Nguyên Đán sắp tới tính từ `hom` (mùng Một của năm âm kế, hay hôm nay nếu đúng mùng Một). */
export function tetSapToi(hom: SolarDate, tz = 7): TetSapToi {
  const am = solarToLunar(hom.day, hom.month, hom.year, tz);
  const laMungMot = am.day === 1 && am.month === 1 && !am.leap;
  const namAm = laMungMot ? am.year : am.year + 1;
  const tet = lunarToSolar(1, 1, namAm, false, tz).duong;
  const soNgay = jdFromDate(tet.day, tet.month, tet.year) - jdFromDate(hom.day, hom.month, hom.year);
  const cc = yearCanChi(namAm);
  return {
    tet,
    namAm,
    canChiNam: { can: cc.can, chi: cc.chi },
    chiNam: CHI_VI.indexOf(cc.chi),
    soNgayConLai: soNgay,
    laMungMot,
    laGiaoThua: soNgay === 1,
  };
}
