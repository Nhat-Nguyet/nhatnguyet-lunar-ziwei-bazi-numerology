// Bảng khoá và tiện ích dùng chung của lớp tương thích iztro (iztro.ts) và
// phần hàm của nó (iztro-chuc-nang.ts). Tệp nội bộ: không xuất ra ngoài gói.

import type { LunarDate } from "@nhatnguyet/am-lich";

/** Loại sao theo iztro. */
export type StarType = "major" | "soft" | "tough" | "adjective" | "flower" | "helper" | "lucun" | "tianma";

// ── Bảng khoá (mã của iztro, không phải chữ) ─────────────────────────────

export const CAN_KHOA = ["jiaHeavenly", "yiHeavenly", "bingHeavenly", "dingHeavenly", "wuHeavenly", "jiHeavenly", "gengHeavenly", "xinHeavenly", "renHeavenly", "guiHeavenly"];
export const CHI_KHOA = ["ziEarthly", "chouEarthly", "yinEarthly", "maoEarthly", "chenEarthly", "siEarthly", "wuEarthly", "weiEarthly", "shenEarthly", "youEarthly", "xuEarthly", "haiEarthly"];
export const CAN_VI = ["Giáp", "Ất", "Bính", "Đinh", "Mậu", "Kỷ", "Canh", "Tân", "Nhâm", "Quý"];
export const CHI_VI = ["Tý", "Sửu", "Dần", "Mão", "Thìn", "Tỵ", "Ngọ", "Mùi", "Thân", "Dậu", "Tuất", "Hợi"];
export const CON_GIAP = ["rat", "ox", "tiger", "rabbit", "dragon", "snake", "horse", "sheep", "monkey", "rooster", "dog", "pig"];
export const GIO_KHOA = ["earlyRatHour", "oxHour", "tigerHour", "rabbitHour", "dragonHour", "snakeHour", "horseHour", "goatHour", "monkeyHour", "roosterHour", "dogHour", "pigHour", "lateRatHour"];
export const GIO_KHOANG = ["00:00~01:00", "01:00~03:00", "03:00~05:00", "05:00~07:00", "07:00~09:00", "09:00~11:00", "11:00~13:00", "13:00~15:00", "15:00~17:00", "17:00~19:00", "19:00~21:00", "21:00~23:00", "23:00~00:00"];

export const CUNG_KHOA: Readonly<Record<string, string>> = {
  "Mệnh": "soulPalace", "Huynh Đệ": "siblingsPalace", "Phu Thê": "spousePalace", "Tử Tức": "childrenPalace",
  "Tài Bạch": "wealthPalace", "Tật Ách": "healthPalace", "Thiên Di": "surfacePalace", "Nô Bộc": "friendsPalace",
  "Quan Lộc": "careerPalace", "Điền Trạch": "propertyPalace", "Phúc Đức": "spiritPalace", "Phụ Mẫu": "parentsPalace",
};
export const SANG_KHOA: Readonly<Record<string, string>> = { "Miếu": "miao", "Vượng": "wang", "Đắc": "de", "Bình": "ping", "Hãm": "xian" };
export const HOA_KHOA: Readonly<Record<string, string>> = { "Hóa Lộc": "sihuaLu", "Hóa Quyền": "sihuaQuan", "Hóa Khoa": "sihuaKe", "Hóa Kỵ": "sihuaJi" };
export const CUC_KHOA: Readonly<Record<number, string>> = { 2: "water2nd", 3: "wood3rd", 4: "metal4th", 5: "earth5th", 6: "fire6th" };

/** Sao của lõi: khoá iztro, nhóm (major, minor, adjective) và loại. */
export const SAO_KHOA: Readonly<Record<string, [string, "majorStars" | "minorStars" | "adjectiveStars", StarType]>> = {
  "Tử Vi": ["ziweiMaj", "majorStars", "major"], "Thiên Cơ": ["tianjiMaj", "majorStars", "major"],
  "Thái Dương": ["taiyangMaj", "majorStars", "major"], "Vũ Khúc": ["wuquMaj", "majorStars", "major"],
  "Thiên Đồng": ["tiantongMaj", "majorStars", "major"], "Liêm Trinh": ["lianzhenMaj", "majorStars", "major"],
  "Thiên Phủ": ["tianfuMaj", "majorStars", "major"], "Thái Âm": ["taiyinMaj", "majorStars", "major"],
  "Tham Lang": ["tanlangMaj", "majorStars", "major"], "Cự Môn": ["jumenMaj", "majorStars", "major"],
  "Thiên Tướng": ["tianxiangMaj", "majorStars", "major"], "Thiên Lương": ["tianliangMaj", "majorStars", "major"],
  "Thất Sát": ["qishaMaj", "majorStars", "major"], "Phá Quân": ["pojunMaj", "majorStars", "major"],
  "Tả Phù": ["zuofuMin", "minorStars", "soft"], "Hữu Bật": ["youbiMin", "minorStars", "soft"],
  "Văn Xương": ["wenchangMin", "minorStars", "soft"], "Văn Khúc": ["wenquMin", "minorStars", "soft"],
  "Thiên Khôi": ["tiankuiMin", "minorStars", "soft"], "Thiên Việt": ["tianyueMin", "minorStars", "soft"],
  "Lộc Tồn": ["lucunMin", "minorStars", "lucun"], "Thiên Mã": ["tianmaMin", "minorStars", "tianma"],
  "Địa Không": ["dikongMin", "minorStars", "tough"], "Địa Kiếp": ["dijieMin", "minorStars", "tough"],
  "Kình Dương": ["qingyangMin", "minorStars", "tough"], "Đà La": ["tuoluoMin", "minorStars", "tough"],
  "Thiên Quan": ["tianguan", "adjectiveStars", "adjective"], "Thiên Phúc": ["tianfu", "adjectiveStars", "adjective"],
  "Thiên Khốc": ["tianku", "adjectiveStars", "adjective"], "Thiên Hư": ["tianxu", "adjectiveStars", "adjective"],
  "Tam Thai": ["santai", "adjectiveStars", "adjective"], "Bát Tọa": ["bazuo", "adjectiveStars", "adjective"],
  "Ân Quang": ["engguang", "adjectiveStars", "adjective"], "Thiên Quý": ["tiangui", "adjectiveStars", "adjective"],
  "Thiên Tài": ["tiancai", "adjectiveStars", "adjective"], "Thiên Thọ": ["tianshou", "adjectiveStars", "adjective"],
  // Đào Hoa của sách Việt là Hàm Trì (咸池) của iztro.
  "Đào Hoa": ["xianchi", "adjectiveStars", "flower"],
  // Bộ sao Tân Biên thêm 19/11/2026. Giải Thần của sách Việt (cùng cung Phượng
  // Các) là Niên Giải (年解) của iztro; 解神 của iztro an theo tháng, lõi không an.
  "Hỏa Tinh": ["huoxingMin", "minorStars", "tough"], "Linh Tinh": ["lingxingMin", "minorStars", "tough"],
  "Hồng Loan": ["hongluan", "adjectiveStars", "flower"], "Thiên Hỷ": ["tianxi", "adjectiveStars", "flower"],
  "Thiên Diêu": ["tianyao", "adjectiveStars", "flower"],
  "Long Trì": ["longchi", "adjectiveStars", "adjective"], "Phượng Các": ["fengge", "adjectiveStars", "adjective"],
  "Thai Phụ": ["taifu", "adjectiveStars", "adjective"], "Phong Cáo": ["fenggao", "adjectiveStars", "adjective"],
  "Hoa Cái": ["huagai", "adjectiveStars", "adjective"], "Thiên Trù": ["tianchu", "adjectiveStars", "adjective"],
  "Thiên Đức": ["tiande", "adjectiveStars", "adjective"], "Nguyệt Đức": ["yuede", "adjectiveStars", "adjective"],
  "Thiên Không": ["tiankong", "adjectiveStars", "adjective"],
  "Cô Thần": ["guchen", "adjectiveStars", "adjective"], "Quả Tú": ["guasu", "adjectiveStars", "adjective"],
  "Phá Toái": ["posui", "adjectiveStars", "adjective"], "Thiên Hình": ["tianxing", "adjectiveStars", "adjective"],
  "Thiên Sứ": ["tianshi", "adjectiveStars", "adjective"], "Thiên Thương": ["tianshang", "adjectiveStars", "adjective"],
  "Giải Thần": ["nianjie", "adjectiveStars", "helper"],
  // Đẩu Quân, Thiên Y, Thiên Giải, Địa Giải, Quốc Ấn, Đường Phù, Thiên La,
  // Địa Võng, Kiếp Sát, Lưu Hà, Lưu Niên Văn Tinh không có trong khuôn của iztro: bỏ.
};
/** Bốn phụ tinh iztro gắn khoá mutagen. */
export const SAO_CO_HOA = new Set(["zuofuMin", "youbiMin", "wenchangMin", "wenquMin"]);

export const SO_HAN = ["〇", "一", "二", "三", "四", "五", "六", "七", "八", "九"];
export const THANG_HAN = ["", "正", "二", "三", "四", "五", "六", "七", "八", "九", "十", "冬", "腊"];

export function docNgay(s: string | Date): { y: number; m: number; d: number } {
  if (s instanceof Date) {
    if (Number.isNaN(s.getTime())) throw new Error("invalid date");
    return { y: s.getFullYear(), m: s.getMonth() + 1, d: s.getDate() };
  }
  const k = typeof s === "string" ? /^\s*(\d{1,4})[-/.](\d{1,2})[-/.](\d{1,2})\s*$/.exec(s) : null;
  if (!k) throw new Error(`invalid date ${JSON.stringify(s)}: expected "YYYY-M-D"`);
  const y = Number(k[1]);
  const m = Number(k[2]);
  const d = Number(k[3]);
  const t = new Date(Date.UTC(2000, m - 1, d));
  t.setUTCFullYear(y);
  if (t.getUTCFullYear() !== y || t.getUTCMonth() !== m - 1 || t.getUTCDate() !== d) throw new Error(`invalid date ${JSON.stringify(s)}`);
  return { y, m, d };
}

export function ngayKe(n: { y: number; m: number; d: number }): { y: number; m: number; d: number } {
  const t = new Date(Date.UTC(2000, n.m - 1, n.d));
  t.setUTCFullYear(n.y);
  t.setUTCDate(t.getUTCDate() + 1);
  return { y: t.getUTCFullYear(), m: t.getUTCMonth() + 1, d: t.getUTCDate() };
}

/** Ngày âm kiểu Trung: 一九九〇年闰二月初一 (như lunar-typescript). */
export function ngayAmChuHan(a: LunarDate): string {
  const nam = String(a.year).split("").map((c) => SO_HAN[Number(c)]).join("");
  const d = a.day;
  const ngay = d === 10 ? "初十" : d === 20 ? "二十" : d === 30 ? "三十"
    : (d < 10 ? "初" : d < 20 ? "十" : d < 30 ? "廿" : "三") + SO_HAN[d % 10];
  return `${nam}年${a.leap ? "闰" : ""}${THANG_HAN[a.month]}月${ngay}`;
}
