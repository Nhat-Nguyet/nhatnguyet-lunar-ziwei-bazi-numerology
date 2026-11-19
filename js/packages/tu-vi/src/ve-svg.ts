// Vẽ lá số Tử Vi thành một tệp SVG tự chứa (không phông ngoài, không ảnh,
// không mã chạy), ba thứ tiếng, hai bộ màu sáng tối theo nhận diện của Nhật
// Nguyệt (xanh ngọc #1F6F6B, đỏ gạch #B5402F, nền xi măng #ECEEEB; bộ tối
// #0F1E1D, #182A28, #7CC7BF).
//
// Bố cục là địa bàn 4x4 cổ điển: Tỵ Ngọ Mùi Thân ở hàng trên, Dần Sửu Tý Hợi
// ở hàng dưới, đi ngược chiều kim đồng hồ; ô 2x2 ở giữa là thiên bàn.
//
// CHỮ KHÔNG ĐƯỢC TRÀN Ô. SVG không tự ngắt dòng và không đo được chữ trước
// khi vẽ, nên bề rộng được ƯỚC bằng bảng hệ số theo loại ký tự (chữ Hán một
// em, chữ hoa rộng hơn chữ thường...), cố ý ước dư một chút. Chuỗi dài hơn
// chỗ thì co cỡ chữ; co tới cỡ nhỏ nhất mà vẫn dài thì gắn `textLength` để
// trình duyệt ép đúng bề rộng ấy.
//
// Bản Python `nhatnguyet.tu_vi_ve_svg` ra ĐÚNG TỪNG BYTE như bản này (test so
// chuỗi), nên mọi phép tính số đi qua `so()` và giữ cùng thứ tự phép toán.

import { stemBranchName, term, termName, transformationShort } from "@nhatnguyet/am-lich";
import type { Terms } from "@nhatnguyet/am-lich";
import { daiVan } from "./chieu-sau.ts";
import { starEn, voidName } from "./ten-en.ts";
import { schoolShort } from "./schools.ts";
import type { CungTuVi, LaSoTuVi, SaoTuVi } from "./kieu.ts";

/** Ngôn ngữ của chữ trên hình. */
export type NgonNguVe = "vi" | "en" | "zh";

/** Tuỳ chọn vẽ. */
export interface TuyChonVeSvg {
  /** Mặc định "vi". */
  lang?: NgonNguVe;
  /** Mặc định "light". */
  theme?: "light" | "dark";
  /** Bề rộng hiển thị (thuộc tính width), mặc định 720. Hình co giãn theo viewBox. */
  width?: number;
  /** Bản tiếng Anh: can chi, Tứ Hóa, Tuần Triệt viết "pinyin" (mặc định), "han" hay "vi". */
  terms?: Terms;
}

// ── Bộ màu ────────────────────────────────────────────────────────────────

interface BangMau {
  nen: string;
  o: string;
  vien: string;
  chu: string;
  chuMo: string;
  chuNhat: string;
  chinh: string;
  chinhNen: string;
  gach: string;
  vang: string;
  loc: string;
  quyen: string;
  khoa: string;
  ky: string;
  chuTrenNhan: string;
  xamNhan: string;
}

const MAU: Readonly<Record<"light" | "dark", BangMau>> = {
  light: {
    nen: "#ECEEEB", o: "#FFFFFF", vien: "#D3D9D5", chu: "#1B1F1E", chuMo: "#4F5956",
    chuNhat: "#7D8783", chinh: "#1F6F6B", chinhNen: "#E4F0ED", gach: "#B5402F", vang: "#C9922E",
    loc: "#2E7D4F", quyen: "#9A6B1E", khoa: "#2B5A86", ky: "#B5402F", chuTrenNhan: "#FFFFFF",
    xamNhan: "#E3E7E4",
  },
  dark: {
    nen: "#0F1E1D", o: "#182A28", vien: "#2C423F", chu: "#E8EEEC", chuMo: "#B3C2BE",
    chuNhat: "#7F918C", chinh: "#7CC7BF", chinhNen: "#1E3835", gach: "#EE8D78", vang: "#E0A53C",
    loc: "#7CCB98", quyen: "#E6B866", khoa: "#8DB8E6", ky: "#EE8D78", chuTrenNhan: "#0F1E1D",
    xamNhan: "#26403C",
  },
};

const PHONG = "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, 'Noto Sans', 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', 'Noto Sans CJK SC', sans-serif";

// ── Công cụ vẽ chữ (giống hệt bản Python) ─────────────────────────────────

/** Số ra chuỗi, làm tròn một chữ số thập phân, không đuôi ".0". */
function so(n: number): string {
  const k = Math.floor(n * 10 + 0.5);
  const am = k < 0;
  const t = am ? -k : k;
  const nguyen = Math.floor(t / 10);
  const le = t - nguyen * 10;
  return (am ? "-" : "") + String(nguyen) + (le === 0 ? "" : "." + String(le));
}

function thoat(s: string): string {
  let ra = "";
  for (const c of s) {
    if (c === "&") ra += "&amp;";
    else if (c === "<") ra += "&lt;";
    else if (c === ">") ra += "&gt;";
    else if (c === '"') ra += "&quot;";
    else if (c === "'") ra += "&#39;";
    else ra += c;
  }
  return ra;
}

const HEP = " iljI.,:;'|!·";
const VUA = "frt()[]/-";
const RONG = "mwMW@";
const SO_TU = "0123456789";

/** Bề rộng ước của một ký tự, tính theo em. */
function heSo(c: string): number {
  const m = c.codePointAt(0) ?? 0;
  if (m >= 0x2e80) return 1;
  if (HEP.includes(c)) return 0.3;
  if (VUA.includes(c)) return 0.38;
  if (RONG.includes(c)) return 0.86;
  if (SO_TU.includes(c)) return 0.58;
  if (c !== c.toLowerCase()) return 0.7;
  return 0.56;
}

/** Bề rộng ước của chuỗi ở cỡ chữ `co`. */
function doRong(s: string, co: number, dam: boolean): number {
  let w = 0;
  for (const c of s) w += heSo(c);
  // Phông hệ thống của Apple dùng nét "Text" rộng hơn ở cỡ nhỏ: cộng dần
  // 1,2% mỗi điểm dưới cỡ 20 (đo trên Chrome macOS: cỡ 8 rộng hơn cỡ 100 gần 20%).
  const nho = co < 20 ? (20 - co) * 0.012 : 0;
  return w * co * (dam ? 1.07 : 1) * (1 + nho);
}

/** Cỡ chữ lớn nhất (bước 0,5) không quá `coMax` để chuỗi vừa `rong`. */
function coVua(s: string, coMax: number, coMin: number, rong: number, dam: boolean): number {
  let co = coMax;
  while (co > coMin && doRong(s, co, dam) > rong) co -= 0.5;
  return co < coMin ? coMin : co;
}

interface KieuChu {
  co: number;
  mau: string;
  dam?: boolean;
  neo?: "start" | "middle" | "end";
  /** Bề rộng tối đa; vượt thì co chữ (tới `coMin`), rồi ép bằng textLength. */
  rong?: number;
  coMin?: number;
  nghieng?: boolean;
  gianChu?: number;
}

/** Một thẻ <text>; trả kèm bề rộng ước và cỡ chữ đã dùng. */
function chu(x: number, y: number, s: string, k: KieuChu): { svg: string; rong: number; co: number } {
  const dam = k.dam === true;
  let co = k.co;
  let ep = "";
  let rong = doRong(s, co, dam);
  if (k.rong !== undefined && rong > k.rong) {
    co = coVua(s, k.co, k.coMin ?? k.co, k.rong, dam);
    rong = doRong(s, co, dam);
    if (rong > k.rong) {
      ep = ` textLength="${so(k.rong)}" lengthAdjust="spacingAndGlyphs"`;
      rong = k.rong;
    }
  }
  const neo = k.neo && k.neo !== "start" ? ` text-anchor="${k.neo}"` : "";
  const dd = dam ? ` font-weight="700"` : "";
  const ng = k.nghieng ? ` font-style="italic"` : "";
  const gc = k.gianChu ? ` letter-spacing="${so(k.gianChu)}"` : "";
  const svg = `<text x="${so(x)}" y="${so(y)}" font-size="${so(co)}" fill="${k.mau}"${dd}${ng}${neo}${gc}${ep}>${thoat(s)}</text>`;
  return { svg, rong, co };
}

function hop(x: number, y: number, w: number, h: number, r: number, fill: string, vien = "", day = 0, net = ""): string {
  const v = vien ? ` stroke="${vien}" stroke-width="${so(day)}"` : "";
  const n = net ? ` stroke-dasharray="${net}"` : "";
  return `<rect x="${so(x)}" y="${so(y)}" width="${so(w)}" height="${so(h)}" rx="${so(r)}" fill="${fill}"${v}${n}/>`;
}

/** Viên nhãn có chữ; trả svg và bề rộng. */
function vien(x: number, yGiua: number, s: string, co: number, nen: string, mauChu: string, vienNgoai = ""): { svg: string; rong: number } {
  const w = doRong(s, co, true) + co * 0.9;
  const h = co + 5;
  const r = hop(x, yGiua - h / 2, w, h, h / 2, vienNgoai ? "none" : nen, vienNgoai, 1);
  const t = chu(x + w / 2, yGiua + co * 0.36, s, { co, mau: mauChu, dam: true, neo: "middle" });
  return { svg: r + t.svg, rong: w };
}

// ── Từ vựng ba thứ tiếng ──────────────────────────────────────────────────

function chon(lang: NgonNguVe, vi: string, en: string, zh: string): string {
  return lang === "vi" ? vi : lang === "en" ? en : zh;
}

const CAN_ZH: Readonly<Record<string, string>> = {
  "Giáp": "甲", "Ất": "乙", "Bính": "丙", "Đinh": "丁", "Mậu": "戊",
  "Kỷ": "己", "Canh": "庚", "Tân": "辛", "Nhâm": "壬", "Quý": "癸",
};
const CHI_ZH: Readonly<Record<string, string>> = {
  "Tý": "子", "Sửu": "丑", "Dần": "寅", "Mão": "卯", "Thìn": "辰", "Tỵ": "巳",
  "Ngọ": "午", "Mùi": "未", "Thân": "申", "Dậu": "酉", "Tuất": "戌", "Hợi": "亥",
};
const CHI_THU_TU = ["Tý", "Sửu", "Dần", "Mão", "Thìn", "Tỵ", "Ngọ", "Mùi", "Thân", "Dậu", "Tuất", "Hợi"];

/** "Mậu Tý" ra "戊子" ở bản Trung; bản Anh theo cách viết (terms); giữ nguyên ở bản Việt. */
function canChi(s: string, lang: NgonNguVe, terms: Terms = "vi"): string {
  if (lang === "en") return terms === "vi" ? s : stemBranchName(s, "en", terms);
  if (lang !== "zh") return s;
  let ra = "";
  for (const p of s.split(" ")) ra += CAN_ZH[p] ?? CHI_ZH[p] ?? p;
  return ra;
}

// Chép từ từ vựng nghiệp vụ của lõi tính (coreengine/tuvung.go).
const CUNG_ZH: Readonly<Record<string, string>> = {
  "Mệnh": "命宫", "Huynh Đệ": "兄弟宫", "Phu Thê": "夫妻宫", "Tử Tức": "子女宫",
  "Tài Bạch": "财帛宫", "Tật Ách": "疾厄宫", "Thiên Di": "迁移宫", "Nô Bộc": "奴仆宫",
  "Quan Lộc": "官禄宫", "Điền Trạch": "田宅宫", "Phúc Đức": "福德宫", "Phụ Mẫu": "父母宫",
};

const SAO_ZH: Readonly<Record<string, string>> = {
  "Tử Vi": "紫微", "Thiên Cơ": "天机", "Thái Dương": "太阳", "Vũ Khúc": "武曲",
  "Thiên Đồng": "天同", "Liêm Trinh": "廉贞", "Thiên Phủ": "天府", "Thái Âm": "太阴",
  "Tham Lang": "贪狼", "Cự Môn": "巨门", "Thiên Tướng": "天相", "Thiên Lương": "天梁",
  "Thất Sát": "七杀", "Phá Quân": "破军",
  "Văn Xương": "文昌", "Văn Khúc": "文曲", "Tả Phù": "左辅", "Hữu Bật": "右弼",
  "Lộc Tồn": "禄存", "Kình Dương": "擎羊", "Đà La": "陀罗", "Thiên Khôi": "天魁",
  "Thiên Việt": "天钺", "Địa Không": "地空", "Địa Kiếp": "地劫", "Thiên Mã": "天马",
  "Đào Hoa": "桃花", "Tam Thai": "三台", "Bát Tọa": "八座", "Ân Quang": "恩光",
  "Thiên Quý": "天贵", "Thiên Quan": "天官", "Thiên Phúc": "天福", "Thiên Thọ": "天寿",
  "Thiên Khốc": "天哭", "Thiên Hư": "天虚", "Đẩu Quân": "斗君", "Thiên Tài": "天才",
  "Tràng Sinh": "长生", "Mộc Dục": "沐浴", "Quan Đới": "冠带", "Lâm Quan": "临官",
  "Đế Vượng": "帝旺", "Suy": "衰", "Bệnh": "病", "Tử": "死", "Mộ": "墓",
  "Tuyệt": "绝", "Thai": "胎", "Dưỡng": "养",
  "Thái Tuế": "太岁", "Thiếu Dương": "少阳", "Tang Môn": "丧门", "Thiếu Âm": "少阴",
  "Quan Phù": "官符", "Tử Phù": "死符", "Tuế Phá": "岁破", "Long Đức": "龙德",
  "Bạch Hổ": "白虎", "Phúc Đức": "福德", "Điếu Khách": "吊客", "Trực Phù": "直符",
  "Bác Sỹ": "博士", "Lực Sĩ": "力士", "Thanh Long": "青龙", "Tiểu Hao": "小耗",
  "Tướng Quân": "将军", "Tấu Thư": "奏书", "Phi Liêm": "飞廉", "Hỷ Thần": "喜神",
  "Bệnh Phù": "病符", "Đại Hao": "大耗", "Phục Binh": "伏兵", "Quan Phủ": "官府",
};

const CUC_BA: Readonly<Record<string, readonly [string, string]>> = {
  "Thủy Nhị Cục": ["Water Two", "水二局"], "Mộc Tam Cục": ["Wood Three", "木三局"],
  "Kim Tứ Cục": ["Metal Four", "金四局"], "Thổ Ngũ Cục": ["Earth Five", "土五局"],
  "Hỏa Lục Cục": ["Fire Six", "火六局"],
};

const AM_DUONG_BA: Readonly<Record<string, readonly [string, string]>> = {
  "Dương Nam": ["Yang Male", "阳男"], "Âm Nam": ["Yin Male", "阴男"],
  "Dương Nữ": ["Yang Female", "阳女"], "Âm Nữ": ["Yin Female", "阴女"],
};

const NAP_AM_ZH: Readonly<Record<string, string>> = {
  "Hải Trung Kim": "海中金", "Lư Trung Hỏa": "炉中火", "Đại Lâm Mộc": "大林木",
  "Lộ Bàng Thổ": "路旁土", "Kiếm Phong Kim": "剑锋金", "Sơn Đầu Hỏa": "山头火",
  "Giản Hạ Thủy": "涧下水", "Thành Đầu Thổ": "城头土", "Bạch Lạp Kim": "白蜡金",
  "Dương Liễu Mộc": "杨柳木", "Tuyền Trung Thủy": "泉中水", "Ốc Thượng Thổ": "屋上土",
  "Tích Lịch Hỏa": "霹雳火", "Tùng Bách Mộc": "松柏木", "Trường Lưu Thủy": "长流水",
  "Sa Trung Kim": "沙中金", "Sơn Hạ Hỏa": "山下火", "Bình Địa Mộc": "平地木",
  "Bích Thượng Thổ": "壁上土", "Kim Bạc Kim": "金箔金", "Phú Đăng Hỏa": "覆灯火",
  "Thiên Hà Thủy": "天河水", "Đại Trạch Thổ": "大驿土", "Thoa Xuyến Kim": "钗钏金",
  "Tang Đố Mộc": "桑柘木", "Đại Khê Thủy": "大溪水", "Sa Trung Thổ": "沙中土",
  "Thiên Thượng Hỏa": "天上火", "Thạch Lựu Mộc": "石榴木", "Đại Hải Thủy": "大海水",
};


/** Mức sáng tối: chữ tắt và nhóm (0 sáng, 1 vừa, 2 tối). */
const SANG_TOI: Readonly<Record<string, readonly [string, string, string, number]>> = {
  "Miếu": ["M", "E", "庙", 0], "Vượng": ["V", "P", "旺", 0],
  "Đắc": ["Đ", "F", "得", 1], "Bình": ["B", "N", "平", 1], "Hãm": ["H", "W", "陷", 2],
};

const TU_HOA: Readonly<Record<string, readonly [string, string, string]>> = {
  "Hóa Lộc": ["Lộc", "Lộc", "禄"], "Hóa Quyền": ["Quyền", "Quyền", "权"],
  "Hóa Khoa": ["Khoa", "Khoa", "科"], "Hóa Kỵ": ["Kỵ", "Kỵ", "忌"],
};

const SAT_TINH = ["Kình Dương", "Đà La", "Địa Không", "Địa Kiếp", "Hỏa Tinh", "Linh Tinh"];

const THANG_EN = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function tenSao(s: SaoTuVi, lang: NgonNguVe): string {
  if (lang === "vi") return s.ten;
  if (lang === "en") return starEn(s.ten, s.tenEn);
  return s.tenZh || SAO_ZH[s.ten] || s.tenEn;
}

function tenCung(c: CungTuVi, lang: NgonNguVe): string {
  const z = (c as unknown as { tenCungZh?: string }).tenCungZh;
  return chon(lang, c.tenCung, c.tenCungEn, z || CUNG_ZH[c.tenCung] || c.tenCungEn);
}

function mauHoa(hoa: string, m: BangMau): string {
  if (hoa === "Hóa Lộc") return m.loc;
  if (hoa === "Hóa Quyền") return m.quyen;
  if (hoa === "Hóa Khoa") return m.khoa;
  return m.ky;
}

// ── Bố cục ────────────────────────────────────────────────────────────────

const W = 1000;
const LE = 16;
const KHE = 8;
const O = 236;
const CHAN = 44;
const H = LE + 4 * O + 3 * KHE + CHAN;

/** Hàng, cột (0 tới 3) của từng chi trên địa bàn. */
const VI_TRI_O: Readonly<Record<number, readonly [number, number]>> = {
  5: [0, 0], 6: [0, 1], 7: [0, 2], 8: [0, 3],
  4: [1, 0], 9: [1, 3],
  3: [2, 0], 10: [2, 3],
  2: [3, 0], 1: [3, 1], 0: [3, 2], 11: [3, 3],
};

/** Chữ ngắn của Tứ Hóa trên hình: Lộc / Lu / 禄 (bản Anh theo terms). */
function hoaNgan(hoa: string, lang: NgonNguVe, terms: Terms): string {
  const h = TU_HOA[hoa];
  if (!h) return "";
  return lang === "en" && terms !== "vi" ? transformationShort(hoa, "en", terms) : chon(lang, h[0], h[1], h[2]);
}

function veO(c: CungTuVi, laSo: LaSoTuVi, tuoi: readonly [number, number] | undefined, lang: NgonNguVe, m: BangMau, terms: Terms): string {
  const [hang, cot] = VI_TRI_O[c.viTri];
  const x = LE + cot * (O + KHE);
  const y = LE + hang * (O + KHE);
  const laMenh = c.viTri === laSo.cungMenh;
  const p: string[] = [];
  p.push(hop(x, y, O, O, 10, laMenh ? m.chinhNen : m.o, laMenh ? m.chinh : m.vien, laMenh ? 2 : 1));
  const trai = x + 12;
  const phai = x + O - 12;
  const rongTrong = O - 24;

  // Hàng đầu: tên cung bên trái, can chi bên phải.
  // Tên cung dài (Friends/Subordinates) thì can chi xuống hàng nhãn bên dưới.
  const chuCc = canChi(c.canChi, lang, terms);
  const rongCc = doRong(chuCc, 13, false);
  const ten = tenCung(c, lang);
  const ccXuong = doRong(ten, 14, true) > rongTrong - rongCc - 8;
  p.push(chu(phai, ccXuong ? y + 49.5 : y + 25, chuCc, { co: 13, mau: m.chuNhat, neo: "end" }).svg);
  p.push(chu(trai, y + 26, ten, {
    co: 17, mau: laMenh ? m.chinh : m.chu, dam: true, rong: ccXuong ? rongTrong : rongTrong - rongCc - 8, coMin: 10,
  }).svg);

  // Hàng nhãn: Thân, Tuần, Triệt.
  let xn = trai;
  if (c.laThan) {
    const v = vien(xn, y + 45, chon(lang, "Thân", "Body", "身宫"), 10.5, m.chinh, m.chinh, m.chinh);
    p.push(v.svg);
    xn += v.rong + 5;
  }
  if (c.tuanTrung) {
    const v = vien(xn, y + 45, chon(lang, "Tuần", voidName("tuan", terms), "旬空"), 10.5, m.xamNhan, m.chuMo);
    p.push(v.svg);
    xn += v.rong + 5;
  }
  if (c.trietLo) {
    const v = vien(xn, y + 45, chon(lang, "Triệt", voidName("triet", terms), "截空"), 10.5, m.xamNhan, m.chuMo);
    p.push(v.svg);
    xn += v.rong + 5;
  }

  // Chính tinh: màu theo sáng tối, chữ tắt mức sáng tối, viên Tứ Hóa.
  let yd = y + 76;
  const chinh = c.sao.filter((s) => s.loai === "chinh-tinh");
  if (chinh.length === 0) {
    p.push(chu(trai, yd, chon(lang, "Vô chính diệu", "No major star", "无主星"), {
      co: 15, mau: m.chuNhat, nghieng: true, rong: rongTrong, coMin: 10,
    }).svg);
    yd += 24;
  }
  for (const s of chinh) {
    const st = SANG_TOI[s.mieuVuong ?? ""];
    const nhom = st ? st[3] : 1;
    const mau = nhom === 0 ? m.chinh : nhom === 1 ? m.chu : m.chuNhat;
    const tat = st ? chon(lang, st[0], st[1], st[2]) : "";
    const hoa = s.tuHoa ? TU_HOA[s.tuHoa] : undefined;
    const chuHoa = hoa ? hoaNgan(s.tuHoa ?? "", lang, terms) : "";
    const rongTat = tat ? doRong(tat, 11.5, true) + 3 : 0;
    const rongHoa = hoa ? doRong(chuHoa, 11, true) + 11 * 0.9 + 6 : 0;
    // Chữ tắt sáng tối là <tspan> nối liền tên sao, nên đứng sát chữ thật.
    const t = chu(trai, yd, tenSao(s, lang), { co: 18, mau, dam: true, rong: rongTrong - rongTat - rongHoa, coMin: 10 });
    p.push(tat ? t.svg.replace("</text>", `<tspan dx="3" dy="-7" font-size="11.5">${thoat(tat)}</tspan></text>`) : t.svg);
    let xs = trai + t.rong + 3;
    if (tat) xs += rongTat;
    if (hoa) p.push(vien(xs + 3, yd - 6, chuHoa, 11, mauHoa(s.tuHoa ?? "", m), m.chuTrenNhan).svg);
    yd += 24;
  }

  // Phụ tinh rồi sao vòng Thái Tuế, Bác Sỹ (nhạt hơn): chảy từ trái sang,
  // xuống dòng khi hết chỗ, co chữ cả khối nếu vượt đáy ô.
  const muc: [SaoTuVi, boolean][] = [];
  for (const s of c.sao) if (s.loai === "phu-tinh") muc.push([s, false]);
  for (const loai of ["thai-tue", "bac-sy"]) for (const s of c.sao) if (s.loai === loai) muc.push([s, true]);
  const day = y + O - 36;
  const batDau = yd + 4;
  // Cỡ 9, 8 thêm 19/11/2026: lá số an đủ bộ sao Tân Biên, ô đông nhất có tới
  // mười sáu phụ tinh và sao vòng, tên tiếng Anh dài.
  const coThu = [14, 13, 12, 11, 10, 9, 8];
  let chon1: string[] = [];
  for (let i = 0; i < coThu.length; i++) {
    const coGoc = coThu[i];
    const ra: string[] = [];
    let xx = trai;
    let yy = batDau + coGoc;
    for (const [s, vong] of muc) {
      const co = vong ? coGoc - 1.5 : coGoc;
      const ten = tenSao(s, lang);
      const hoa = s.tuHoa ? TU_HOA[s.tuHoa] : undefined;
      const chuHoa = hoa ? hoaNgan(s.tuHoa ?? "", lang, terms) : "";
      const coHoa = co - 2.5;
      const wHoa = hoa ? doRong(chuHoa, coHoa, true) + coHoa * 0.9 + 3 : 0;
      const w = doRong(ten, co, false) + wHoa;
      if (xx > trai && xx + w > phai) {
        xx = trai;
        yy += coGoc + 5;
      }
      const sat = SAT_TINH.includes(s.ten);
      const t = chu(xx, yy, ten, { co, mau: sat ? m.gach : vong ? m.chuNhat : m.chuMo, rong: rongTrong - wHoa, coMin: 8 });
      ra.push(t.svg);
      if (hoa) ra.push(vien(xx + t.rong + 3, yy - co * 0.34, chuHoa, coHoa, mauHoa(s.tuHoa ?? "", m), m.chuTrenNhan).svg);
      xx += t.rong + wHoa + co * 0.8;
    }
    chon1 = ra;
    if (yy + 3 <= day || i === coThu.length - 1) break;
  }
  p.push(...chon1);

  // Chân ô: giai đoạn vòng Tràng Sinh bên trái, tuổi đại vận bên phải.
  p.push(`<line x1="${so(trai)}" y1="${so(y + O - 30)}" x2="${so(phai)}" y2="${so(y + O - 30)}" stroke="${m.vien}" stroke-width="1"/>`);
  let rongTuoi = 0;
  if (tuoi) {
    const t = chu(phai, y + O - 10, `${tuoi[0]}-${tuoi[1]}`, { co: 14, mau: m.chinh, dam: true, neo: "end" });
    p.push(t.svg);
    rongTuoi = t.rong + 8;
  }
  for (const s of c.sao) {
    if (s.loai === "truong-sinh") {
      p.push(chu(trai, y + O - 10, tenSao(s, lang), { co: 13, mau: m.chuMo, rong: rongTrong - rongTuoi, coMin: 9 }).svg);
    }
  }
  return p.join("");
}

function ngayDuong(laSo: LaSoTuVi, lang: NgonNguVe): string {
  const d = laSo.ngaySinhDuong;
  return chon(lang, `${d.ngay}/${d.thang}/${d.nam}`, `${d.ngay} ${THANG_EN[d.thang - 1]} ${d.nam}`, `${d.nam}年${d.thang}月${d.ngay}日`);
}

function ngayAm(laSo: LaSoTuVi, lang: NgonNguVe, terms: Terms): string {
  const a = laSo.ngaySinhAm;
  const nhuan = a.leap === true;
  const nam = canChi(laSo.canChiNam, lang, terms);
  return chon(
    lang,
    `${a.day}/${a.month}${nhuan ? " nhuận" : ""}, năm ${nam}`,
    `Day ${a.day}, ${nhuan ? "leap " : ""}month ${a.month}, ${nam} year`,
    `${nam}年${nhuan ? "闰" : ""}${a.month}月${a.day}日`,
  );
}

/** Tên chi theo ngôn ngữ (bản Anh theo terms). */
function tenChi(chi: string, lang: NgonNguVe, terms: Terms): string {
  return lang === "en" ? termName(chi, "en", terms) : chon(lang, chi, chi, CHI_ZH[chi] ?? chi);
}

function gioSinh(laSo: LaSoTuVi, lang: NgonNguVe, terms: Terms): string {
  const i = CHI_THU_TU.indexOf(laSo.gioSinh);
  const tu = (i * 2 + 23) % 24;
  const den = (i * 2 + 1) % 24;
  return chon(lang, `${laSo.gioSinh} (${tu}h-${den}h)`, `${tenChi(laSo.gioSinh, lang, terms)} (${tu}:00-${den}:00)`, `${CHI_ZH[laSo.gioSinh] ?? laSo.gioSinh}时 (${tu}-${den}点)`);
}

function banMenh(laSo: LaSoTuVi, lang: NgonNguVe): string {
  const ten = laSo.banMenhNapAm;
  return chon(lang, ten, term(ten, "en"), NAP_AM_ZH[ten] || ten);
}

function veGiua(laSo: LaSoTuVi, lang: NgonNguVe, m: BangMau, terms: Terms): string {
  const x = LE + O + KHE;
  const y = LE + O + KHE;
  const w = 2 * O + KHE;
  const p: string[] = [];
  p.push(hop(x, y, w, w, 14, m.o, m.vien, 1));
  const cx = x + w / 2;
  const trai = x + 32;
  const rong = w - 64;

  // Dấu: vòng trống đồng giản lược, cạnh tên Nhật Nguyệt.
  const yDau = y + 40;
  const ten = chon(lang, "NHẬT NGUYỆT", "NHAT NGUYET", "NHAT NGUYET");
  const rongTen = doRong(ten, 12, true) + 12 * 2.2 * 0.5;
  const xDau = cx - (rongTen + 22) / 2;
  p.push(`<circle cx="${so(xDau + 8)}" cy="${so(yDau - 4)}" r="8" fill="none" stroke="${m.vang}" stroke-width="2.5"/>`);
  p.push(`<circle cx="${so(xDau + 8)}" cy="${so(yDau - 4)}" r="3" fill="${m.vang}"/>`);
  p.push(chu(xDau + 22, yDau, ten, { co: 12, mau: m.chinh, dam: true, gianChu: 2.2 }).svg);

  p.push(chu(cx, y + 80, chon(lang, "Lá số Tử Vi", "Zi Wei Chart", "紫微斗数命盘"), {
    co: 28, mau: m.chu, dam: true, neo: "middle", rong, coMin: 16,
  }).svg);
  let yy = y + 108;
  if (laSo.hoTen) {
    p.push(chu(cx, yy, laSo.hoTen, { co: 18, mau: m.chinh, dam: true, neo: "middle", rong, coMin: 11 }).svg);
    yy += 12;
  }
  yy += 18;
  p.push(`<line x1="${so(trai)}" y1="${so(yy)}" x2="${so(trai + rong)}" y2="${so(yy)}" stroke="${m.vien}" stroke-width="1"/>`);
  yy += 30;

  const ad = AM_DUONG_BA[laSo.amDuongMenh];
  const cuc = CUC_BA[laSo.tenCuc];
  const than = laSo.cung[laSo.cungThan]?.chi ?? "";
  const dong: [string, string][] = [
    [chon(lang, "Dương lịch", "Solar date", "公历"), ngayDuong(laSo, lang)],
    [chon(lang, "Âm lịch", "Lunar date", "农历"), ngayAm(laSo, lang, terms)],
    [chon(lang, "Giờ sinh", "Birth hour", "时辰"), gioSinh(laSo, lang, terms)],
    [chon(lang, "Âm dương", "Yin-yang", "阴阳"), chon(lang, laSo.amDuongMenh, ad ? ad[0] : laSo.amDuongMenh, ad ? ad[1] : laSo.amDuongMenh)],
    [chon(lang, "Bản mệnh", "Na yin", "纳音"), banMenh(laSo, lang)],
    [chon(lang, "Cục", "Bureau", "五行局"), chon(lang, laSo.tenCuc, cuc ? cuc[0] : laSo.tenCuc, cuc ? cuc[1] : laSo.tenCuc)],
    [
      chon(lang, "Mệnh, Thân", "Life, Body", "命宫, 身宫"),
      chon(
        lang,
        `Mệnh ở ${laSo.menhCungChi}, Thân ở ${than}`,
        `Life at ${tenChi(laSo.menhCungChi, lang, terms)}, Body at ${tenChi(than, lang, terms)}`,
        `命宫在${CHI_ZH[laSo.menhCungChi] ?? ""}，身宫在${CHI_ZH[than] ?? ""}`,
      ),
    ],
  ];
  // Lựa chọn phái khác mặc định (schools.ts): thêm một hàng, các hàng khít lại.
  const phai = schoolShort(laSo.schools, lang);
  if (phai) dong.push([chon(lang, "Phái", "Schools", "流派"), phai]);
  const buoc = phai ? 27 : 31;
  const rongNhan = 132;
  for (const [nhan, gt] of dong) {
    p.push(chu(trai, yy, nhan, { co: 14, mau: m.chuNhat, rong: rongNhan - 10, coMin: 10 }).svg);
    p.push(chu(trai + rongNhan, yy, gt, { co: 16, mau: m.chu, dam: true, rong: rong - rongNhan, coMin: phai && gt === phai ? 8 : 10 }).svg);
    yy += buoc;
  }

  // Chú giải: sáng tối và Tứ Hóa.
  let yc = y + w - 62;
  p.push(`<line x1="${so(trai)}" y1="${so(yc - 24)}" x2="${so(trai + rong)}" y2="${so(yc - 24)}" stroke="${m.vien}" stroke-width="1"/>`);
  const nhom: [string, string][] = [
    [m.chinh, chon(lang, "M, V: Miếu, Vượng", "E, P: exalted, prosperous", "庙, 旺")],
    [m.chu, chon(lang, "Đ, B: Đắc, Bình", "F, N: favorable, neutral", "得, 平")],
    [m.chuNhat, chon(lang, "H: Hãm", "W: weak", "陷")],
  ];
  let xc = trai;
  const coCg = lang === "en" ? 12 : 13;
  for (const [mau, s] of nhom) {
    p.push(`<circle cx="${so(xc + 5)}" cy="${so(yc - 4.5)}" r="5" fill="${mau}"/>`);
    const t = chu(xc + 15, yc, s, { co: coCg, mau: m.chuMo });
    p.push(t.svg);
    xc += 15 + t.rong + 16;
  }
  yc += 30;
  const t0 = chu(trai, yc, chon(lang, "Tứ Hóa", "Four Transformations", "四化"), { co: 13, mau: m.chuMo });
  p.push(t0.svg);
  xc = trai + t0.rong + 12;
  for (const k of ["Hóa Lộc", "Hóa Quyền", "Hóa Khoa", "Hóa Kỵ"]) {
    const v = vien(xc, yc - 4.5, hoaNgan(k, lang, terms), 11.5, mauHoa(k, m), m.chuTrenNhan);
    p.push(v.svg);
    xc += v.rong + 7;
  }
  return p.join("");
}

/**
 * Vẽ lá số Tử Vi thành chuỗi SVG tự chứa.
 *
 * ```ts
 * const laSo = lapLaSoTuVi("Nguyen Van An", "Nam", 19, 9, 1990, 10);
 * const svg = veLaSoSvg(laSo, { lang: "en", theme: "dark" });
 * ```
 */
export function veLaSoSvg(laSo: LaSoTuVi, tuyChon: TuyChonVeSvg = {}): string {
  const lang: NgonNguVe = tuyChon.lang === "en" || tuyChon.lang === "zh" ? tuyChon.lang : "vi";
  const terms: Terms = lang !== "en" ? "vi" : tuyChon.terms === "vi" || tuyChon.terms === "han" ? tuyChon.terms : "pinyin";
  const m = MAU[tuyChon.theme === "dark" ? "dark" : "light"];
  const rongHien = tuyChon.width && tuyChon.width > 0 ? tuyChon.width : 720;
  const caoHien = (rongHien * H) / W;

  const tuoi = new Map<number, readonly [number, number]>();
  for (const d of daiVan(laSo)) tuoi.set(d.viTri, [d.tuTuoi, d.denTuoi]);

  const tieuDe = chon(lang, "Lá số Tử Vi", "Zi Wei chart", "紫微斗数命盘") + (laSo.hoTen ? ": " + laSo.hoTen : "");
  const moTa = chon(
    lang,
    `Lá số Tử Vi sinh ngày ${ngayDuong(laSo, "vi")}, giờ ${laSo.gioSinh}, ${laSo.amDuongMenh}, ${laSo.tenCuc}. Vẽ bằng thư viện mở Nhật Nguyệt.`,
    `Zi Wei chart for ${ngayDuong(laSo, "en")}, hour ${tenChi(laSo.gioSinh, lang, terms)}. Drawn with the Nhat Nguyet open library.`,
    `紫微斗数命盘，公历${ngayDuong(laSo, "zh")}，${CHI_ZH[laSo.gioSinh] ?? ""}时。由 Nhat Nguyet 开源库绘制。`,
  );

  const p: string[] = [];
  p.push(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${so(rongHien)}" height="${so(caoHien)}" role="img" aria-labelledby="nn-tieu-de nn-mo-ta" lang="${lang}">`);
  p.push(`<title id="nn-tieu-de">${thoat(tieuDe)}</title>`);
  p.push(`<desc id="nn-mo-ta">${thoat(moTa)}</desc>`);
  p.push(`<style>text{font-family:${PHONG};}</style>`);
  p.push(hop(0, 0, W, H, 18, m.nen));
  for (const c of laSo.cung) p.push(veO(c, laSo, tuoi.get(c.viTri), lang, m, terms));
  p.push(veGiua(laSo, lang, m, terms));
  const yChan = H - 16;
  p.push(chu(LE + 4, yChan, "nhatnguyet.org", { co: 14, mau: m.chinh, dam: true }).svg);
  p.push(chu(W - LE - 4, yChan, chon(lang, "Đại vận: tuổi mụ ở góc dưới mỗi cung", "Decade luck: East Asian age at the foot of each palace", "大限：各宫右下角为虚岁"), {
    co: 12.5, mau: m.chuNhat, neo: "end", rong: 560, coMin: 9,
  }).svg);
  p.push("</svg>");
  return p.join("");
}

/** Bí danh tiếng Anh của `veLaSoSvg`. */
export const renderChartSvg = veLaSoSvg;
