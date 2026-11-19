// Vẽ lá số Bát Tự (Tứ Trụ) thành một tệp SVG tự chứa (không phông ngoài,
// không ảnh, không mã chạy), ba thứ tiếng, hai bộ màu sáng tối theo nhận diện
// của Nhật Nguyệt. Bốn trụ xếp thành bảng (thập thần, thiên can, địa chi, tàng
// can, nạp âm, trường sinh, thần sát), dưới là mười đại vận.
//
// Can, chi tô theo ngũ hành. Chữ không tràn ô: bề rộng ƯỚC theo loại ký tự
// rồi co cỡ chữ, co tới cỡ nhỏ nhất mà vẫn dài thì ép bằng `textLength`
// (cùng bộ công cụ với hình lá số Tử Vi của gói @nhatnguyet/tu-vi).
//
// Bản Python `nhatnguyet.bat_tu_ve_svg` ra ĐÚNG TỪNG BYTE như bản này.

import type { LaSoBatTu, TruLaSo } from "./la-so.ts";

/** Ngôn ngữ của chữ trên hình. */
export type NgonNguVe = "vi" | "en" | "zh";

/** Tuỳ chọn vẽ lá số Bát Tự. */
export interface TuyChonVeBatTuSvg {
  /** Mặc định "vi". */
  lang?: NgonNguVe;
  /** Mặc định "light". */
  theme?: "light" | "dark";
  /** Bề rộng hiển thị (thuộc tính width), mặc định 720. */
  width?: number;
  /** Họ tên in ở đầu hình (lá số Bát Tự không mang tên). */
  hoTen?: string;
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
  vang: string;
  xamNhan: string;
  hanh: Readonly<Record<string, string>>;
}

const MAU: Readonly<Record<"light" | "dark", BangMau>> = {
  light: {
    nen: "#ECEEEB", o: "#FFFFFF", vien: "#D3D9D5", chu: "#1B1F1E", chuMo: "#4F5956",
    chuNhat: "#7D8783", chinh: "#1F6F6B", chinhNen: "#E4F0ED", vang: "#C9922E", xamNhan: "#E3E7E4",
    hanh: { "Mộc": "#3E7D45", "Hỏa": "#B5402F", "Thổ": "#96671B", "Kim": "#5B6770", "Thủy": "#2B5A86" },
  },
  dark: {
    nen: "#0F1E1D", o: "#182A28", vien: "#2C423F", chu: "#E8EEEC", chuMo: "#B3C2BE",
    chuNhat: "#7F918C", chinh: "#7CC7BF", chinhNen: "#1E3835", vang: "#E0A53C", xamNhan: "#26403C",
    hanh: { "Mộc": "#86C98C", "Hỏa": "#EE8D78", "Thổ": "#E6B866", "Kim": "#C3CDD2", "Thủy": "#8DB8E6" },
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
const HANH_EN: Readonly<Record<string, string>> = {
  "Kim": "Metal", "Mộc": "Wood", "Thủy": "Water", "Hỏa": "Fire", "Thổ": "Earth",
};
const HANH_ZH: Readonly<Record<string, string>> = {
  "Kim": "金", "Mộc": "木", "Thủy": "水", "Hỏa": "火", "Thổ": "土",
};

// Chép từ từ vựng nghiệp vụ của lõi tính (coreengine/tuvung.go).
const TRUONG_SINH_BA: Readonly<Record<string, readonly [string, string]>> = {
  "Tràng Sinh": ["Growth", "长生"], "Mộc Dục": ["Bathing", "沐浴"], "Quan Đới": ["Youth", "冠带"],
  "Lâm Quan": ["Prime", "临官"], "Đế Vượng": ["Peak", "帝旺"], "Suy": ["Decline", "衰"],
  "Bệnh": ["Illness", "病"], "Tử": ["Death", "死"], "Mộ": ["Tomb", "墓"],
  "Tuyệt": ["Extinction", "绝"], "Thai": ["Conception", "胎"], "Dưỡng": ["Nurture", "养"],
};

const THAN_SAT_ZH: Readonly<Record<string, string>> = {
  "Thiên Ất Quý Nhân": "天乙贵人", "Văn Xương": "文昌", "Lộc Thần": "禄神", "Dương Nhận": "羊刃",
  "Đào Hoa": "桃花", "Dịch Mã": "驿马", "Hoa Cái": "华盖", "Kiếp Sát": "劫煞", "Vong Thần": "亡神",
};

const TIET_KHI_ZH: Readonly<Record<string, string>> = {
  "Lập Xuân": "立春", "Vũ Thủy": "雨水", "Kinh Trập": "惊蛰", "Xuân Phân": "春分",
  "Thanh Minh": "清明", "Cốc Vũ": "谷雨", "Lập Hạ": "立夏", "Tiểu Mãn": "小满",
  "Mang Chủng": "芒种", "Hạ Chí": "夏至", "Tiểu Thử": "小暑", "Đại Thử": "大暑",
  "Lập Thu": "立秋", "Xử Thử": "处暑", "Bạch Lộ": "白露", "Thu Phân": "秋分",
  "Hàn Lộ": "寒露", "Sương Giáng": "霜降", "Lập Đông": "立冬", "Tiểu Tuyết": "小雪",
  "Đại Tuyết": "大雪", "Đông Chí": "冬至", "Tiểu Hàn": "小寒", "Đại Hàn": "大寒",
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

const THANG_EN = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function hanhChu(h: string, lang: NgonNguVe): string {
  return chon(lang, h, HANH_EN[h] ?? h, HANH_ZH[h] ?? h);
}

function hai(n: number): string {
  return n < 10 ? "0" + String(n) : String(n);
}

// ── Bố cục ────────────────────────────────────────────────────────────────

const W = 1000;
const LE = 16;
const DAU = 124;
const BANG = 474;
const VAN = 214;
const H = LE + DAU + 12 + BANG + 12 + VAN + 44;
const COT_NHAN = 132;
const RONG_COT = (W - 2 * LE - COT_NHAN - 12) / 4;

function veDau(ls: LaSoBatTu, hoTen: string, lang: NgonNguVe, m: BangMau): string {
  const p: string[] = [];
  const y = LE;
  p.push(hop(LE, y, W - 2 * LE, DAU, 14, m.o, m.vien, 1));
  const trai = LE + 26;
  const ten = chon(lang, "NHẬT NGUYỆT", "NHAT NGUYET", "NHAT NGUYET");
  p.push(`<circle cx="${so(trai + 8)}" cy="${so(y + 32)}" r="8" fill="none" stroke="${m.vang}" stroke-width="2.5"/>`);
  p.push(`<circle cx="${so(trai + 8)}" cy="${so(y + 32)}" r="3" fill="${m.vang}"/>`);
  p.push(chu(trai + 22, y + 36, ten, { co: 12, mau: m.chinh, dam: true, gianChu: 2.2 }).svg);
  p.push(chu(trai, y + 76, chon(lang, "Lá số Bát Tự", "Bát Tự Chart", "八字命盘"), { co: 30, mau: m.chu, dam: true, rong: 420, coMin: 18 }).svg);
  if (hoTen) p.push(chu(trai, y + 104, hoTen, { co: 18, mau: m.chinh, dam: true, rong: 420, coMin: 11 }).svg);

  const phai = W - LE - 26;
  const d = ls.ngaySinh;
  const gio = ls.coGioSinh ? `${hai(ls.gio)}:${hai(ls.phut)}` : "";
  const ngay = chon(
    lang,
    `${d.day}/${d.month}/${d.year}` + (gio ? ", " + gio : ", chưa rõ giờ"),
    `${d.day} ${THANG_EN[d.month - 1]} ${d.year}` + (gio ? ", " + gio : ", hour unknown"),
    `${d.year}年${d.month}月${d.day}日` + (gio ? " " + gio : "，时辰未知"),
  );
  const am = ls.nhatChuAmDuong === "Âm";
  const gt = chon(lang, ls.gioiTinh, ls.gioiTinh === "Nữ" ? "Female" : "Male", ls.gioiTinh === "Nữ" ? "女" : "男");
  const nc = chon(
    lang,
    `${gt} · Nhật chủ ${ls.nhatChu} (${am ? "Âm" : "Dương"} ${ls.nhatChuHanh})`,
    `${gt} · Day Master ${ls.nhatChu} (${am ? "Yin" : "Yang"} ${HANH_EN[ls.nhatChuHanh] ?? ""})`,
    `${gt} · 日主 ${CAN_ZH[ls.nhatChu] ?? ls.nhatChu}（${am ? "阴" : "阳"}${HANH_ZH[ls.nhatChuHanh] ?? ""}）`,
  );
  const tiet = chon(lang, `Sinh trong tiết ${ls.tietKhi}`, `Born in the solar term ${ls.tietKhi}`, `生于${TIET_KHI_ZH[ls.tietKhi] ?? ls.tietKhi}`);
  p.push(chu(phai, y + 42, ngay, { co: 18, mau: m.chu, dam: true, neo: "end", rong: 470, coMin: 11 }).svg);
  p.push(chu(phai, y + 72, nc, { co: 15, mau: m.chuMo, neo: "end", rong: 470, coMin: 10 }).svg);
  p.push(chu(phai, y + 100, tiet, { co: 15, mau: m.chuMo, neo: "end", rong: 470, coMin: 10 }).svg);
  return p.join("");
}

/** Dòng chữ co vừa cột; quá dài ở cỡ `coMin2` thì bẻ hai dòng tại khoảng trắng cuối. */
function chuCot(cx: number, y: number, s: string, co: number, mau: string, rong: number, dam = false): string {
  if (doRong(s, co - 2, dam) <= rong || !s.includes(" ")) {
    return chu(cx, y, s, { co, mau, dam, neo: "middle", rong, coMin: 7 }).svg;
  }
  const i = s.lastIndexOf(" ");
  const a = s.slice(0, i);
  const b = s.slice(i + 1);
  const co2 = co - 1;
  return chu(cx, y - co2 * 0.55, a, { co: co2, mau, dam, neo: "middle", rong, coMin: 7 }).svg
    + chu(cx, y + co2 * 0.6, b, { co: co2, mau, dam, neo: "middle", rong, coMin: 7 }).svg;
}

function veTru(t: TruLaSo | undefined, cot: number, y: number, laNgay: boolean, lang: NgonNguVe, m: BangMau): string {
  const p: string[] = [];
  const x = LE + COT_NHAN + cot * RONG_COT;
  const cx = x + RONG_COT / 2;
  const rong = RONG_COT - 20;
  if (laNgay) p.push(hop(x + 4, y + 10, RONG_COT - 8, BANG - 20, 10, m.chinhNen, m.chinh, 1.5));
  const tenTru = [
    chon(lang, "Trụ năm", "Year", "年柱"), chon(lang, "Trụ tháng", "Month", "月柱"),
    chon(lang, "Trụ ngày", "Day", "日柱"), chon(lang, "Trụ giờ", "Hour", "时柱"),
  ][cot];
  p.push(chu(cx, y + 38, tenTru, { co: 15, mau: laNgay ? m.chinh : m.chuMo, dam: true, neo: "middle", rong, coMin: 9 }).svg);
  if (!t) {
    p.push(chu(cx, y + 170, "?", { co: 44, mau: m.chuNhat, dam: true, neo: "middle" }).svg);
    p.push(chu(cx, y + 206, chon(lang, "Chưa rõ giờ", "Hour unknown", "时辰未知"), { co: 13, mau: m.chuNhat, neo: "middle", rong, coMin: 8 }).svg);
    return p.join("");
  }
  const tt = chon(lang, t.thapThanCan, t.thapThanCanEn, t.thapThanCanZh || t.thapThanCanEn);
  p.push(chuCot(cx, y + 70, tt, 15, laNgay ? m.chinh : m.chu, rong, laNgay));

  const coLon = lang === "zh" ? 52 : 40;
  const mauCan = m.hanh[t.canHanh] ?? m.chu;
  const mauChi = m.hanh[t.chiHanh] ?? m.chu;
  p.push(chu(cx, y + 130, chon(lang, t.can, t.can, CAN_ZH[t.can] ?? t.can), { co: coLon, mau: mauCan, dam: true, neo: "middle", rong, coMin: 20 }).svg);
  const amDuong = chon(lang, t.canAm ? "Âm" : "Dương", t.canAm ? "Yin" : "Yang", t.canAm ? "阴" : "阳");
  p.push(chu(cx, y + 152, amDuong + (lang === "zh" ? "" : " ") + hanhChu(t.canHanh, lang), { co: 13, mau: m.chuNhat, neo: "middle", rong, coMin: 8 }).svg);
  p.push(chu(cx, y + 210, chon(lang, t.chi, t.chi, CHI_ZH[t.chi] ?? t.chi), { co: coLon, mau: mauChi, dam: true, neo: "middle", rong, coMin: 20 }).svg);
  p.push(chu(cx, y + 232, hanhChu(t.chiHanh, lang), { co: 13, mau: m.chuNhat, neo: "middle", rong, coMin: 8 }).svg);

  // Tàng can: can tô theo hành, kèm thập thần.
  let yt = y + 274;
  for (const tc of t.tangCan) {
    const can = chon(lang, tc.can, tc.can, CAN_ZH[tc.can] ?? tc.can);
    const ttc = chon(lang, tc.thapThan, tc.thapThanEn ?? tc.thapThan, tc.thapThanZh || tc.thapThanEn || tc.thapThan);
    const wCan = doRong(can, 15, true);
    const coTt = coVua(ttc, 13, 8, rong - wCan - 8, false);
    const wTt = doRong(ttc, coTt, false);
    const x0 = cx - (wCan + 8 + wTt) / 2;
    p.push(chu(x0, yt, can, { co: 15, mau: m.hanh[tc.hanh] ?? m.chu, dam: true }).svg);
    p.push(chu(x0 + wCan + 8, yt, ttc, { co: coTt, mau: m.chuMo, rong: rong - wCan - 8, coMin: 8 }).svg);
    yt += 22;
  }

  const napAm = chon(lang, t.napAmTen, t.napAmTen, NAP_AM_ZH[t.napAmTen] ?? t.napAmTen);
  p.push(chu(cx, y + 356, napAm, { co: 14, mau: m.hanh[t.napAm] ?? m.chu, dam: true, neo: "middle", rong, coMin: 8 }).svg);
  const ts = TRUONG_SINH_BA[t.truongSinh];
  p.push(chu(cx, y + 390, chon(lang, t.truongSinh, ts ? ts[0] : t.truongSinh, ts ? ts[1] : t.truongSinh), { co: 14, mau: m.chu, neo: "middle", rong, coMin: 8 }).svg);

  // Thần sát: mỗi sao một dòng, co chữ cả khối khi nhiều sao.
  const sao = t.thanSat.map((s) => chon(lang, s, s, THAN_SAT_ZH[s] ?? s));
  const coSao = sao.length > 3 ? 11 : 12.5;
  let ys = y + 424;
  for (const s of sao) {
    p.push(chu(cx, ys, s, { co: coSao, mau: m.chinh, neo: "middle", rong, coMin: 7 }).svg);
    ys += coSao + 3;
  }
  if (sao.length === 0) p.push(chu(cx, ys, "·", { co: 14, mau: m.chuNhat, neo: "middle" }).svg);
  return p.join("");
}

function veBang(ls: LaSoBatTu, lang: NgonNguVe, m: BangMau): string {
  const p: string[] = [];
  const y = LE + DAU + 12;
  p.push(hop(LE, y, W - 2 * LE, BANG, 14, m.o, m.vien, 1));
  const nhan: [string, number][] = [
    [chon(lang, "Thập thần", "Ten Gods", "十神"), 70],
    [chon(lang, "Thiên can", "Stem", "天干"), 122],
    [chon(lang, "Địa chi", "Branch", "地支"), 202],
    [chon(lang, "Tàng can", "Hidden stems", "藏干"), 274],
    [chon(lang, "Nạp âm", "Nạp âm", "纳音"), 356],
    [chon(lang, "Trường sinh", "Life stage", "长生"), 390],
    [chon(lang, "Thần sát", "Symbolic stars", "神煞"), 424],
  ];
  for (const [s, dy] of nhan) {
    p.push(chu(LE + 22, y + dy, s, { co: 13, mau: m.chuNhat, rong: COT_NHAN - 26, coMin: 8 }).svg);
  }
  for (const dy of [88, 246, 334, 370, 404]) {
    p.push(`<line x1="${so(LE + 18)}" y1="${so(y + dy)}" x2="${so(W - LE - 18)}" y2="${so(y + dy)}" stroke="${m.vien}" stroke-width="1"/>`);
  }
  const tru = [ls.truNam, ls.truThang, ls.truNgay, ls.truGio];
  for (let i = 0; i < 4; i++) p.push(veTru(tru[i], i, y, i === 2, lang, m));
  return p.join("");
}

function veDaiVan(ls: LaSoBatTu, lang: NgonNguVe, m: BangMau): string {
  const p: string[] = [];
  const y = LE + DAU + 12 + BANG + 12;
  p.push(hop(LE, y, W - 2 * LE, VAN, 14, m.o, m.vien, 1));
  const dv = ls.daiVan;
  const trai = LE + 22;
  const phai = W - LE - 22;
  const tieuDe = chu(trai, y + 34, chon(lang, "Đại vận", "Luck pillars", "大运"), { co: 19, mau: m.chu, dam: true });
  p.push(tieuDe.svg);
  const thang = dv.tuoiKhoiThang > 0;
  const khoi = chon(
    lang,
    `Khởi vận ${dv.tuoiKhoiNam} tuổi${thang ? ` ${dv.tuoiKhoiThang} tháng` : ""}, đi ${dv.thuan ? "thuận" : "nghịch"}`,
    `Starts at age ${dv.tuoiKhoiNam}${thang ? ` and ${dv.tuoiKhoiThang} months` : ""}, ${dv.thuan ? "forward" : "backward"}`,
    `${dv.tuoiKhoiNam}岁${thang ? `${dv.tuoiKhoiThang}个月` : ""}起运，${dv.thuan ? "顺行" : "逆行"}`,
  );
  p.push(chu(phai, y + 34, khoi, { co: 14, mau: m.chuMo, neo: "end", rong: phai - trai - tieuDe.rong - 24, coMin: 9 }).svg);

  const n = dv.cacVan.length;
  if (n === 0) return p.join("");
  const khe = 6;
  const w = (phai - trai - (n - 1) * khe) / n;
  for (let i = 0; i < n; i++) {
    const v = dv.cacVan[i];
    const x = trai + i * (w + khe);
    const cx = x + w / 2;
    const r = w - 10;
    p.push(hop(x, y + 50, w, 148, 9, m.nen));
    p.push(chu(cx, y + 74, chon(lang, `${v.tuoiTu} tuổi`, `Age ${v.tuoiTu}`, `${v.tuoiTu}岁`), { co: 13.5, mau: m.chinh, dam: true, neo: "middle", rong: r, coMin: 8 }).svg);
    p.push(chu(cx, y + 92, String(v.namTu), { co: 12, mau: m.chuNhat, neo: "middle", rong: r, coMin: 8 }).svg);
    const coLon = lang === "zh" ? 26 : 20;
    p.push(chu(cx, y + 124, chon(lang, v.can, v.can, CAN_ZH[v.can] ?? v.can), { co: coLon, mau: m.hanh[v.canHanh] ?? m.chu, dam: true, neo: "middle", rong: r, coMin: 10 }).svg);
    p.push(chu(cx, y + 152, chon(lang, v.chi, v.chi, CHI_ZH[v.chi] ?? v.chi), { co: coLon, mau: m.hanh[v.chiHanh] ?? m.chu, dam: true, neo: "middle", rong: r, coMin: 10 }).svg);
    const tt = chon(lang, v.thapThanCan, v.thapThanCanEn, v.thapThanCanZh || v.thapThanCanEn);
    p.push(chuCot(cx, y + 180, tt, 11.5, m.chuMo, r));
  }
  return p.join("");
}

/**
 * Vẽ lá số Bát Tự thành chuỗi SVG tự chứa.
 *
 * ```ts
 * const laSo = lapLaSoBatTu(19, 9, 1990, 20, 0, "Nam");
 * const svg = veBatTuSvg(laSo, { lang: "en", hoTen: "Nguyen Van An" });
 * ```
 */
export function veBatTuSvg(laSo: LaSoBatTu, tuyChon: TuyChonVeBatTuSvg = {}): string {
  const lang: NgonNguVe = tuyChon.lang === "en" || tuyChon.lang === "zh" ? tuyChon.lang : "vi";
  const m = MAU[tuyChon.theme === "dark" ? "dark" : "light"];
  const rongHien = tuyChon.width && tuyChon.width > 0 ? tuyChon.width : 720;
  const caoHien = (rongHien * H) / W;
  const hoTen = tuyChon.hoTen ?? "";
  const tru = [laSo.truNam, laSo.truThang, laSo.truNgay, laSo.truGio].filter((t) => t).map((t) => (t as TruLaSo).label);

  const tieuDe = chon(lang, "Lá số Bát Tự", "Bát Tự chart", "八字命盘") + (hoTen ? ": " + hoTen : "");
  const moTa = chon(
    lang,
    `Bốn trụ ${tru.join(", ")}; nhật chủ ${laSo.nhatChu} ${laSo.nhatChuHanh}. Vẽ bằng thư viện mở Nhật Nguyệt.`,
    `Four pillars ${tru.join(", ")}; day master ${laSo.nhatChu} (${HANH_EN[laSo.nhatChuHanh] ?? ""}). Drawn with the Nhat Nguyet open library.`,
    `四柱 ${tru.map((s) => s.split(" ").map((x) => CAN_ZH[x] ?? CHI_ZH[x] ?? x).join("")).join("、")}；日主${CAN_ZH[laSo.nhatChu] ?? ""}${HANH_ZH[laSo.nhatChuHanh] ?? ""}。由 Nhat Nguyet 开源库绘制。`,
  );

  const p: string[] = [];
  p.push(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${so(rongHien)}" height="${so(caoHien)}" role="img" aria-labelledby="nn-tieu-de nn-mo-ta" lang="${lang}">`);
  p.push(`<title id="nn-tieu-de">${thoat(tieuDe)}</title>`);
  p.push(`<desc id="nn-mo-ta">${thoat(moTa)}</desc>`);
  p.push(`<style>text{font-family:${PHONG};}</style>`);
  p.push(hop(0, 0, W, H, 18, m.nen));
  p.push(veDau(laSo, hoTen, lang, m));
  p.push(veBang(laSo, lang, m));
  p.push(veDaiVan(laSo, lang, m));

  // Chân hình: tên miền bên trái, chú giải màu ngũ hành bên phải.
  const yChan = H - 16;
  p.push(chu(LE + 4, yChan, "nhatnguyet.org", { co: 14, mau: m.chinh, dam: true }).svg);
  let xc = W - LE - 4;
  for (const h of ["Thủy", "Kim", "Thổ", "Hỏa", "Mộc"]) {
    const t = chu(xc, yChan, hanhChu(h, lang), { co: 13, mau: m.chuMo, neo: "end" });
    p.push(t.svg);
    p.push(`<circle cx="${so(xc - t.rong - 9)}" cy="${so(yChan - 4.5)}" r="5" fill="${m.hanh[h]}"/>`);
    xc -= t.rong + 30;
  }
  p.push("</svg>");
  return p.join("");
}

/** Bí danh tiếng Anh của `veBatTuSvg`. */
export const renderBaziSvg = veBatTuSvg;
