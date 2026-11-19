// Lớp tương thích iztro: `astro.bySolar(...)` trả đối tượng cùng KHUÔN DỮ LIỆU
// với FunctionalAstrolabe của iztro 2.x (palaces[], majorStars, minorStars,
// adjectiveStars với name, type, scope, brightness, mutagen...), chữ hiển thị
// đúng như iztro ở sáu ngôn ngữ (bảng iztro-nhan.ts), nhưng TÍNH bằng lõi Nhật
// Nguyệt: lịch âm theo giờ Việt Nam (UTC+7) mặc định, nước khác qua tham số.
// Không phụ thuộc iztro lúc chạy, không chép mã iztro.
//
// Chỗ khác cố ý (xem docs/chuyen-tu-iztro.md):
// - lịch theo `country` (mặc định VN, UTC+7); iztro luôn theo giờ Bắc Kinh;
// - Tứ Hóa, độ sáng, an sao theo lõi Nhật Nguyệt (bản phổ biến ở Việt Nam);
// - sao lõi chưa an (Hỏa Tinh, Linh Tinh, Hồng Loan...) và vòng Tướng Tinh
//   (jiangqian12) để trống; chỉ có dữ liệu, không có hàm horoscope(), star()...
//
// iztro compatibility layer: same data shape as iztro's FunctionalAstrolabe,
// computed by the Nhat Nguyet core with the Vietnamese calendar by default.

import { canGioDau, canThangDan, dayCanChi, lunarToSolar, mod, resolveCountry, solarToLunar } from "@nhatnguyet/am-lich";
import type { LunarDate } from "@nhatnguyet/am-lich";
import { lapLaSoTuVi } from "./la-so.ts";
import { daiVan } from "./chieu-sau.ts";
import { chieuTieuVan, khoiTieuVan } from "./luu-nien.ts";
import { IZTRO_LANGUAGES, NHAN_IZTRO } from "./iztro-nhan.ts";
import type { IztroLanguage } from "./iztro-nhan.ts";
import type { CungTuVi, LaSoTuVi, SaoTuVi } from "./kieu.ts";

export { IZTRO_LANGUAGES, IZTRO_VERSION } from "./iztro-nhan.ts";
export type { IztroLanguage } from "./iztro-nhan.ts";

/** Loại sao theo iztro. */
export type StarType = "major" | "soft" | "tough" | "adjective" | "flower" | "helper" | "lucun" | "tianma";

/** Một sao, khuôn của iztro FunctionalStar ở mức dữ liệu. */
export interface Star {
  name: string;
  type: StarType;
  scope: "origin";
  /** Chính tinh và mười hai phụ tinh có khoá này ("" khi không xét sáng tối). */
  brightness?: string;
  /** Chính tinh và Tả Phù, Hữu Bật, Văn Xương, Văn Khúc có khoá này ("" khi không hóa). */
  mutagen?: string;
}

/** Một cung, khuôn của iztro FunctionalPalace ở mức dữ liệu. */
export interface Palace {
  /** 0 là cung Dần (như iztro), 11 là cung Sửu. */
  index: number;
  name: string;
  isBodyPalace: boolean;
  /** Lai nhân cung: can cung trùng can năm, trừ cung Tý, Sửu. */
  isOriginalPalace: boolean;
  heavenlyStem: string;
  earthlyBranch: string;
  majorStars: Star[];
  minorStars: Star[];
  adjectiveStars: Star[];
  changsheng12: string;
  boshi12: string;
  /** Vòng Tướng Tinh: lõi Nhật Nguyệt chưa an, luôn "". */
  jiangqian12: string;
  suiqian12: string;
  decadal: { range: [number, number]; heavenlyStem: string; earthlyBranch: string };
  /** Mười tuổi (tuổi mụ) tiểu hạn đi qua cung này. */
  ages: number[];
}

/** Lá số, khuôn của iztro FunctionalAstrolabe ở mức dữ liệu. */
export interface Astrolabe {
  gender: string;
  solarDate: string;
  lunarDate: string;
  chineseDate: string;
  rawDates: {
    lunarDate: { lunarYear: number; lunarMonth: number; lunarDay: number; isLeap: boolean };
    chineseDate: { yearly: [string, string]; monthly: [string, string]; daily: [string, string]; hourly: [string, string] };
  };
  time: string;
  timeRange: string;
  sign: string;
  zodiac: string;
  earthlyBranchOfBodyPalace: string;
  earthlyBranchOfSoulPalace: string;
  soul: string;
  body: string;
  fiveElementsClass: string;
  palaces: Palace[];
  copyright: string;
  /** Lá số gốc của lõi Nhật Nguyệt (không liệt kê, không vào JSON). */
  readonly raw: LaSoTuVi;
  /** Lịch đã dùng (không liệt kê, không vào JSON). */
  readonly calendar: { country: string; timeZone: number; fixLeap: boolean };
}

/** Tuỳ chọn thêm, ngoài khuôn tham số của iztro. */
export interface CompatOptions {
  /** Nước của lịch âm: "VN" (mặc định, UTC+7), "CN", "TW", "HK"... (UTC+8), "KR", "JP" (UTC+9). */
  country?: string;
  /** Múi giờ (giờ) thay cho `country`. */
  timeZone?: number;
}

// ── Bảng khoá (mã của iztro, không phải chữ) ─────────────────────────────

const CAN_KHOA = ["jiaHeavenly", "yiHeavenly", "bingHeavenly", "dingHeavenly", "wuHeavenly", "jiHeavenly", "gengHeavenly", "xinHeavenly", "renHeavenly", "guiHeavenly"];
const CHI_KHOA = ["ziEarthly", "chouEarthly", "yinEarthly", "maoEarthly", "chenEarthly", "siEarthly", "wuEarthly", "weiEarthly", "shenEarthly", "youEarthly", "xuEarthly", "haiEarthly"];
const CAN_VI = ["Giáp", "Ất", "Bính", "Đinh", "Mậu", "Kỷ", "Canh", "Tân", "Nhâm", "Quý"];
const CHI_VI = ["Tý", "Sửu", "Dần", "Mão", "Thìn", "Tỵ", "Ngọ", "Mùi", "Thân", "Dậu", "Tuất", "Hợi"];
const CON_GIAP = ["rat", "ox", "tiger", "rabbit", "dragon", "snake", "horse", "sheep", "monkey", "rooster", "dog", "pig"];
const GIO_KHOA = ["earlyRatHour", "oxHour", "tigerHour", "rabbitHour", "dragonHour", "snakeHour", "horseHour", "goatHour", "monkeyHour", "roosterHour", "dogHour", "pigHour", "lateRatHour"];
const GIO_KHOANG = ["00:00~01:00", "01:00~03:00", "03:00~05:00", "05:00~07:00", "07:00~09:00", "09:00~11:00", "11:00~13:00", "13:00~15:00", "15:00~17:00", "17:00~19:00", "19:00~21:00", "21:00~23:00", "23:00~00:00"];

const CUNG_KHOA: Readonly<Record<string, string>> = {
  "Mệnh": "soulPalace", "Huynh Đệ": "siblingsPalace", "Phu Thê": "spousePalace", "Tử Tức": "childrenPalace",
  "Tài Bạch": "wealthPalace", "Tật Ách": "healthPalace", "Thiên Di": "surfacePalace", "Nô Bộc": "friendsPalace",
  "Quan Lộc": "careerPalace", "Điền Trạch": "propertyPalace", "Phúc Đức": "spiritPalace", "Phụ Mẫu": "parentsPalace",
};
const SANG_KHOA: Readonly<Record<string, string>> = { "Miếu": "miao", "Vượng": "wang", "Đắc": "de", "Bình": "ping", "Hãm": "xian" };
const HOA_KHOA: Readonly<Record<string, string>> = { "Hóa Lộc": "sihuaLu", "Hóa Quyền": "sihuaQuan", "Hóa Khoa": "sihuaKe", "Hóa Kỵ": "sihuaJi" };
const CUC_KHOA: Readonly<Record<number, string>> = { 2: "water2nd", 3: "wood3rd", 4: "metal4th", 5: "earth5th", 6: "fire6th" };

/** Sao của lõi: khoá iztro, nhóm (major, minor, adjective) và loại. */
const SAO_KHOA: Readonly<Record<string, [string, "majorStars" | "minorStars" | "adjectiveStars", StarType]>> = {
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
  // Đẩu Quân không có trong khuôn của iztro: bỏ.
};
/** Bốn phụ tinh iztro gắn khoá mutagen. */
const SAO_CO_HOA = new Set(["zuofuMin", "youbiMin", "wenchangMin", "wenquMin"]);

const VONG_KHOA: Readonly<Record<string, string>> = {
  // Tràng Sinh
  "Tràng Sinh": "changsheng", "Mộc Dục": "muyu", "Quan Đới": "guandai", "Lâm Quan": "linguan", "Đế Vượng": "diwang",
  "Suy": "shuai", "Bệnh": "bing", "Tử": "si", "Mộ": "mu", "Tuyệt": "jue", "Thai": "tai", "Dưỡng": "yang",
  // Bác Sỹ
  "Bác Sỹ": "boshi", "Lực Sĩ": "lishi", "Thanh Long": "qinglong", "Tiểu Hao": "xiaohao", "Tướng Quân": "jiangjun",
  "Tấu Thư": "zhoushu", "Phi Liêm": "faylian", "Hỷ Thần": "xishen", "Bệnh Phù": "bingfu", "Đại Hao": "dahao",
  "Phục Binh": "fubing", "Quan Phủ": "guanfu",
};
/** Vòng Thái Tuế của sách Việt, đúng vị trí với Tuế tiền thập nhị tinh của iztro (theo thứ tự từ cung Thái Tuế). */
const THAI_TUE_KHOA: Readonly<Record<string, string>> = {
  "Thái Tuế": "suijian", "Thiếu Dương": "huiqi", "Tang Môn": "sangmen", "Thiếu Âm": "guansuo", "Quan Phù": "gwanfu",
  "Tử Phù": "xiaohao", "Tuế Phá": "dahao", "Long Đức": "longde", "Bạch Hổ": "baihu", "Phúc Đức": "tiande",
  "Điếu Khách": "diaoke", "Trực Phù": "bingfu",
};

/** Mệnh chủ theo chi cung Mệnh, Thân chủ theo chi năm (bảng truyền thống). */
const MENH_CHU = ["tanlangMaj", "jumenMaj", "lucunMin", "wenquMin", "lianzhenMaj", "wuquMaj", "pojunMaj", "wuquMaj", "lianzhenMaj", "wenquMin", "lucunMin", "jumenMaj"];
const THAN_CHU = ["huoxingMin", "tianxiangMaj", "tianliangMaj", "tiantongMaj", "wenchangMin", "tianjiMaj", "huoxingMin", "tianxiangMaj", "tianliangMaj", "tiantongMaj", "wenchangMin", "tianjiMaj"];

/** Mười hai cung hoàng đạo: ngày bắt đầu (tháng, ngày) theo lunar-typescript. */
const CUNG_HOANG_DAO: readonly [number, number, string][] = [
  [1, 20, "aquarius"], [2, 19, "pisces"], [3, 21, "aries"], [4, 20, "taurus"], [5, 21, "gemini"], [6, 22, "cancer"],
  [7, 23, "leo"], [8, 23, "virgo"], [9, 23, "libra"], [10, 24, "scorpio"], [11, 23, "sagittarius"], [12, 22, "capricorn"],
];

const SO_HAN = ["〇", "一", "二", "三", "四", "五", "六", "七", "八", "九"];
const THANG_HAN = ["", "正", "二", "三", "四", "五", "六", "七", "八", "九", "十", "冬", "腊"];

// ── Tiện ích ─────────────────────────────────────────────────────────────

function docNgay(s: string | Date): { y: number; m: number; d: number } {
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

function ngayKe(n: { y: number; m: number; d: number }): { y: number; m: number; d: number } {
  const t = new Date(Date.UTC(2000, n.m - 1, n.d));
  t.setUTCFullYear(n.y);
  t.setUTCDate(t.getUTCDate() + 1);
  return { y: t.getUTCFullYear(), m: t.getUTCMonth() + 1, d: t.getUTCDate() };
}

function docGioiTinh(g: unknown): "male" | "female" {
  switch (g) {
    case "男": case "male": case "Male": case "m": case "M": case "Nam": case "nam": case "남성": case "남":
      return "male";
    case "女": case "female": case "Female": case "f": case "F": case "Nữ": case "nữ": case "Nu": case "nu": case "여성": case "여":
      return "female";
  }
  throw new Error(`invalid gender ${JSON.stringify(g)}: expected "男" or "女" (or "male", "female")`);
}

/** Ngày âm kiểu Trung: 一九九〇年闰二月初一 (như lunar-typescript). */
function ngayAmChuHan(a: LunarDate): string {
  const nam = String(a.year).split("").map((c) => SO_HAN[Number(c)]).join("");
  const d = a.day;
  const ngay = d === 10 ? "初十" : d === 20 ? "二十" : d === 30 ? "三十"
    : (d < 10 ? "初" : d < 20 ? "十" : d < 30 ? "廿" : "三") + SO_HAN[d % 10];
  return `${nam}年${a.leap ? "闰" : ""}${THANG_HAN[a.month]}月${ngay}`;
}

/**
 * Lá số lõi cho một ngày âm bất kỳ: lapLaSoTuVi nhận ngày dương và đổi âm theo
 * UTC+7, nên tìm một ngày dương cho ra đúng (năm cùng can chi, tháng, ngày),
 * thử năm cách nhau 60 năm khi tháng ấy ở UTC+7 thiếu ngày 30. Mọi sao chỉ phụ
 * thuộc can chi năm, tháng âm, ngày âm, giờ và giới, nên lá số không đổi.
 */
function laSoTheoNgayAm(gioiTinh: string, nam: number, thang: number, ngay: number, chi: number): LaSoTuVi {
  for (const k of [0, -1, 1, -2, 2, -3, 3, -4, 4, -5, 5]) {
    const y = nam + 60 * k;
    const r = lunarToSolar(ngay, thang, y, false, 7);
    if (!r.hopLe) continue;
    const back = solarToLunar(r.duong.day, r.duong.month, r.duong.year, 7);
    if (back.year === y && back.month === thang && back.day === ngay && !back.leap) {
      return lapLaSoTuVi("", gioiTinh, r.duong.day, r.duong.month, r.duong.year, chi);
    }
  }
  throw new Error(`no chart for lunar ${nam}-${thang}-${ngay}`);
}

function an<T extends object>(o: T, k: string, v: unknown): void {
  Object.defineProperty(o, k, { value: v, enumerable: false, writable: false, configurable: true });
}

// ── Hàm chính ────────────────────────────────────────────────────────────

/**
 * Build a chart from a Gregorian date, with iztro's parameters and iztro's
 * output shape, computed by the Nhat Nguyet core.
 *
 * @param solarDateStr "YYYY-M-D" (or a Date, read in local time).
 * @param timeIndex 0 = early Zi (00:00-01:00), 1 = Chou ... 11 = Hai, 12 = late Zi (23:00-24:00, counted as the next day, like iztro).
 * @param gender "男" / "女" (also "male" / "female").
 * @param fixLeap Like iztro (default true): days 1-15 of a leap month count as that month, days 16 onward as the next month. false: the whole leap month counts as the month it repeats (Nhat Nguyet's native rule).
 * @param language iztro language code, default "zh-CN".
 * @param options `country` ("VN" default, UTC+7; "CN" for Beijing time like iztro) or `timeZone`.
 *
 * @example
 * import { astro } from "@nhatnguyet/tu-vi/iztro";
 * const a = astro.bySolar("1990-9-19", 10, "男", true, "vi-VN");
 * a.palaces.find((p) => p.name === "Mệnh").majorStars.map((s) => s.name); // ["Thái Âm"]
 */
export function bySolar(
  solarDateStr: string | Date,
  timeIndex: number,
  gender: string,
  fixLeap = true,
  language: IztroLanguage = "zh-CN",
  options: CompatOptions = {},
): Astrolabe {
  if (!IZTRO_LANGUAGES.includes(language)) throw new Error(`unsupported language ${JSON.stringify(language)}; use one of ${IZTRO_LANGUAGES.join(", ")}`);
  if (!Number.isInteger(timeIndex) || timeIndex < 0 || timeIndex > 12) throw new Error("timeIndex must be an integer 0 to 12");
  if (typeof fixLeap !== "boolean") throw new Error("fixLeap must be a boolean");
  const T = NHAN_IZTRO[language];
  const t = (k: string) => T[k] ?? "";
  const gt = docGioiTinh(gender);
  const { country, timeZone } = resolveCountry(options);
  const nhap = docNgay(solarDateStr);
  // Giờ Tý muộn (12) tính sang ngày hôm sau, giờ Tý (như iztro).
  const ngay = timeIndex === 12 ? ngayKe(nhap) : nhap;
  const chi = timeIndex === 12 ? 0 : timeIndex;
  const am = solarToLunar(ngay.d, ngay.m, ngay.y, timeZone);
  let thangAn = am.month + (am.leap && fixLeap && am.day > 15 ? 1 : 0);
  if (thangAn > 12) thangAn = 1;
  const gioiTinh = gt === "female" ? "Nữ" : "Nam";
  const raw = timeZone === 7 && thangAn === am.month
    ? lapLaSoTuVi("", gioiTinh, ngay.d, ngay.m, ngay.y, chi)
    : laSoTheoNgayAm(gioiTinh, am.year, thangAn, am.day, chi);
  raw.ngaySinhDuong = { ngay: ngay.d, thang: ngay.m, nam: ngay.y };
  raw.ngaySinhAm = am;

  const canNam = CAN_VI.indexOf(raw.canChiNam.split(" ")[0]);
  const chiNam = CHI_VI.indexOf(raw.canChiNam.split(" ")[1]);
  const vanTheoCung = new Map(daiVan(raw).map((v) => [v.viTri, v]));
  const khoiTieu = khoiTieuVan(chiNam);
  const chieuTieu = chieuTieuVan(raw.gioiTinh);

  const sao = (s: SaoTuVi): [string, Star] | null => {
    const m = SAO_KHOA[s.ten];
    if (!m) return null;
    const [khoa, nhom, loai] = m;
    const r: Star = { name: t(khoa), type: loai, scope: "origin" };
    if (nhom !== "adjectiveStars") r.brightness = s.mieuVuong ? t(SANG_KHOA[s.mieuVuong]) : "";
    if (nhom === "majorStars" || SAO_CO_HOA.has(khoa)) r.mutagen = s.tuHoa ? t(HOA_KHOA[s.tuHoa]) : "";
    return [nhom, r];
  };

  const palaces: Palace[] = [];
  for (let i = 0; i < 12; i++) {
    const vt = mod(i + 2, 12);
    const c: CungTuVi = raw.cung[vt];
    const [canCung, chiCung] = c.canChi.split(" ");
    const canIdx = CAN_VI.indexOf(canCung);
    const p: Palace = {
      index: i,
      name: t(CUNG_KHOA[c.tenCung]),
      isBodyPalace: c.laThan,
      isOriginalPalace: vt !== 0 && vt !== 1 && canIdx === canNam,
      heavenlyStem: t(CAN_KHOA[canIdx]),
      earthlyBranch: t(CHI_KHOA[CHI_VI.indexOf(chiCung)]),
      majorStars: [],
      minorStars: [],
      adjectiveStars: [],
      changsheng12: "",
      boshi12: "",
      jiangqian12: "",
      suiqian12: "",
      decadal: { range: [0, 0], heavenlyStem: "", earthlyBranch: "" },
      ages: [],
    };
    for (const s of c.sao) {
      if (s.loai === "truong-sinh") p.changsheng12 = t(VONG_KHOA[s.ten]);
      else if (s.loai === "bac-sy") p.boshi12 = t(VONG_KHOA[s.ten]);
      else if (s.loai === "thai-tue") p.suiqian12 = t(THAI_TUE_KHOA[s.ten]);
      else {
        const r = sao(s);
        if (r) p[r[0] as "majorStars" | "minorStars" | "adjectiveStars"].push(r[1]);
      }
    }
    const v = vanTheoCung.get(vt);
    if (v) p.decadal = { range: [v.tuTuoi, v.denTuoi], heavenlyStem: p.heavenlyStem, earthlyBranch: p.earthlyBranch };
    const tuoiDau = mod(chieuTieu * (vt - khoiTieu), 12) + 1;
    for (let j = 0; j < 10; j++) p.ages.push(tuoiDau + 12 * j);
    palaces.push(p);
  }

  // Bốn trụ kiểu iztro: năm theo năm âm, tháng theo tháng âm (nửa sau tháng
  // nhuận tính tháng sau), ngày, giờ theo ngày đã chuẩn hoá.
  const thangTru = am.month - 1 + (am.leap && am.day > 15 ? 1 : 0);
  const canThang = mod(canThangDan(canNam) + thangTru, 10);
  const chiThang = mod(2 + thangTru, 12);
  const cn = dayCanChi(ngay.d, ngay.m, ngay.y);
  const canNgay = CAN_VI.indexOf(cn.can);
  const chiNgay = CHI_VI.indexOf(cn.chi);
  const canGio = mod(canGioDau(canNgay) + chi, 10);
  const tru: [number, number][] = [[canNam, chiNam], [canThang, chiThang], [canNgay, chiNgay], [canGio, chi]];
  const han = NHAN_IZTRO["zh-CN"];
  const [yearly, monthly, daily, hourly] = tru.map(([a, b]) => [han[CAN_KHOA[a]], han[CHI_KHOA[b]]] as [string, string]);
  const dich = tru.map(([a, b]) => [t(CAN_KHOA[a]), t(CHI_KHOA[b])]);
  const chineseDate = dich.some((x) => x[0].length > 1 || x[1].length > 1)
    ? dich.map((x) => x.join(" ")).join(" - ")
    : dich.map((x) => x.join("")).join(" ");

  const lunarDate = language === "zh-CN" || language === "zh-TW"
    ? ngayAmChuHan(am)
    : t("lunarDate")
      .replace("{{year}}", String(am.year))
      .replace("{{month}}", String(am.month))
      .replace("{{day}}", String(am.day))
      .replace("{{leapMonth}}", am.leap ? t("leapMonth") : "");

  let hoangDao = "capricorn";
  for (const [m, d, k] of CUNG_HOANG_DAO) if (nhap.m > m || (nhap.m === m && nhap.d >= d)) hoangDao = k;

  const a = {
    gender: t(gt),
    solarDate: typeof solarDateStr === "string" ? solarDateStr : `${nhap.y}-${nhap.m}-${nhap.d}`,
    lunarDate,
    chineseDate,
    rawDates: {
      lunarDate: { lunarYear: am.year, lunarMonth: am.month, lunarDay: am.day, isLeap: am.leap },
      chineseDate: { yearly, monthly, daily, hourly },
    },
    time: t(GIO_KHOA[timeIndex]),
    timeRange: GIO_KHOANG[timeIndex],
    sign: t(hoangDao),
    zodiac: t(CON_GIAP[chiNam]),
    earthlyBranchOfBodyPalace: t(CHI_KHOA[raw.cungThan]),
    earthlyBranchOfSoulPalace: t(CHI_KHOA[raw.cungMenh]),
    soul: t(MENH_CHU[raw.cungMenh]),
    body: t(THAN_CHU[chiNam]),
    fiveElementsClass: t(CUC_KHOA[raw.cuc]),
    palaces,
    copyright: "data: Nhat Nguyet (https://nhatnguyet.org), iztro-compatible layout",
  } as Astrolabe;
  an(a, "raw", raw);
  an(a, "calendar", { country, timeZone, fixLeap });
  return a;
}

/**
 * Build a chart from a lunar date, like iztro's `astro.byLunar`. The lunar
 * date is read in the calendar of `options.country` (Vietnam by default).
 *
 * @param lunarDateStr "YYYY-M-D" of the lunar calendar.
 * @param isLeapMonth The month is the leap month (ignored if that year has no such leap month, like iztro).
 */
export function byLunar(
  lunarDateStr: string,
  timeIndex: number,
  gender: string,
  isLeapMonth = false,
  fixLeap = true,
  language: IztroLanguage = "zh-CN",
  options: CompatOptions = {},
): Astrolabe {
  const { timeZone } = resolveCountry(options);
  const n = docNgayAm(lunarDateStr);
  let r = lunarToSolar(n.d, n.m, n.y, isLeapMonth, timeZone);
  if (!r.hopLe && isLeapMonth) r = lunarToSolar(n.d, n.m, n.y, false, timeZone);
  if (!r.hopLe) throw new Error(`invalid lunar date ${JSON.stringify(lunarDateStr)}`);
  return bySolar(`${r.duong.year}-${r.duong.month}-${r.duong.day}`, timeIndex, gender, fixLeap, language, options);
}

function docNgayAm(s: string): { y: number; m: number; d: number } {
  const k = typeof s === "string" ? /^\s*(\d{1,4})[-/.](\d{1,2})[-/.](\d{1,2})\s*$/.exec(s) : null;
  if (!k) throw new Error(`invalid lunar date ${JSON.stringify(s)}: expected "YYYY-M-D"`);
  const y = Number(k[1]);
  const m = Number(k[2]);
  const d = Number(k[3]);
  if (m < 1 || m > 12 || d < 1 || d > 30) throw new Error(`invalid lunar date ${JSON.stringify(s)}`);
  return { y, m, d };
}

/** Drop-in for `import { astro } from "iztro"` (data only). */
export const astro = { bySolar, byLunar, astrolabeBySolarDate: bySolar, astrolabeByLunarDate: byLunar };

export default { astro };
