// Vẽ hồ sơ thần số học thành một tệp SVG tự chứa (không phông ngoài, không
// ảnh, không mã chạy), ba thứ tiếng, hai bộ màu sáng tối theo nhận diện của
// Nhật Nguyệt: số chủ đạo, sáu chỉ số theo tên và ngày sinh, năm cá nhân,
// bốn đỉnh cao kèm bốn thử thách, biểu đồ ngày sinh (lưới Pythagoras) và bảng
// quy đổi chữ của họ tên.
//
// Chữ không tràn ô: bề rộng ƯỚC theo loại ký tự rồi co cỡ chữ, co tới cỡ nhỏ
// nhất mà vẫn dài thì ép bằng `textLength` (cùng bộ công cụ với hình lá số
// Tử Vi của gói @nhatnguyet/tu-vi).
//
// Bản Python `nhatnguyet.than_so_hoc_ve_svg` ra ĐÚNG TỪNG BYTE như bản này.

import { GIA_TRI_CHU, stripDiacritics, tinhHoSoThanSoHocSau } from "./index.ts";

/** Ngôn ngữ của chữ trên hình. */
export type NgonNguVe = "vi" | "en" | "zh";

/** Đầu vào: họ tên và ngày sinh dương lịch (cùng khoá với ca kiểm). */
export interface VaoVeThanSoHoc {
  hoTen: string;
  dd: number;
  mm: number;
  yyyy: number;
  /** Năm tính Năm cá nhân; vắng thì lấy năm hiện tại của máy. */
  namXem?: number;
}

/** Tuỳ chọn vẽ hồ sơ thần số học. */
export interface TuyChonVeThanSoHocSvg {
  /** Mặc định "vi". */
  lang?: NgonNguVe;
  /** Mặc định "light". */
  theme?: "light" | "dark";
  /** Bề rộng hiển thị (thuộc tính width), mặc định 720. */
  width?: number;
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
  gach: string;
  chuTrenNhan: string;
}

const MAU: Readonly<Record<"light" | "dark", BangMau>> = {
  light: {
    nen: "#ECEEEB", o: "#FFFFFF", vien: "#D3D9D5", chu: "#1B1F1E", chuMo: "#4F5956",
    chuNhat: "#7D8783", chinh: "#1F6F6B", chinhNen: "#E4F0ED", vang: "#C9922E", gach: "#B5402F",
    chuTrenNhan: "#FFFFFF",
  },
  dark: {
    nen: "#0F1E1D", o: "#182A28", vien: "#2C423F", chu: "#E8EEEC", chuMo: "#B3C2BE",
    chuNhat: "#7F918C", chinh: "#7CC7BF", chinhNen: "#1E3835", vang: "#E0A53C", gach: "#EE8D78",
    chuTrenNhan: "#0F1E1D",
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

const THANG_EN = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const NGUYEN_AM = "aeiou";

function laSoChu(n: number): boolean {
  return n === 11 || n === 22 || n === 33;
}

// ── Bố cục ────────────────────────────────────────────────────────────────

const W = 1000;
const LE = 16;
const DAU = 124;
const CHINH = 252;
const DINH = 206;
const DUOI = 300;
const H = LE + DAU + 12 + CHINH + 12 + DINH + 12 + DUOI + 44;

function veDau(vao: VaoVeThanSoHoc, namXem: number, soNam: number, lang: NgonNguVe, m: BangMau): string {
  const p: string[] = [];
  const y = LE;
  p.push(hop(LE, y, W - 2 * LE, DAU, 14, m.o, m.vien, 1));
  const trai = LE + 26;
  const ten = chon(lang, "NHẬT NGUYỆT", "NHAT NGUYET", "NHAT NGUYET");
  p.push(`<circle cx="${so(trai + 8)}" cy="${so(y + 32)}" r="8" fill="none" stroke="${m.vang}" stroke-width="2.5"/>`);
  p.push(`<circle cx="${so(trai + 8)}" cy="${so(y + 32)}" r="3" fill="${m.vang}"/>`);
  p.push(chu(trai + 22, y + 36, ten, { co: 12, mau: m.chinh, dam: true, gianChu: 2.2 }).svg);
  p.push(chu(trai, y + 76, chon(lang, "Thần số học", "Numerology", "生命灵数"), { co: 30, mau: m.chu, dam: true, rong: 420, coMin: 18 }).svg);
  if (vao.hoTen) p.push(chu(trai, y + 104, vao.hoTen, { co: 18, mau: m.chinh, dam: true, rong: 440, coMin: 11 }).svg);

  const phai = W - LE - 26;
  const ngay = chon(
    lang,
    `Sinh ngày ${vao.dd}/${vao.mm}/${vao.yyyy}`,
    `Born ${vao.dd} ${THANG_EN[vao.mm - 1] ?? ""} ${vao.yyyy}`,
    `生于${vao.yyyy}年${vao.mm}月${vao.dd}日`,
  );
  p.push(chu(phai, y + 46, ngay, { co: 18, mau: m.chu, dam: true, neo: "end", rong: 440, coMin: 11 }).svg);
  const nhan = chon(lang, `Năm cá nhân ${namXem}`, `Personal year ${namXem}`, `${namXem}个人年数`);
  const tSo = chu(phai, y + 92, String(soNam), { co: 30, mau: m.chinh, dam: true, neo: "end" });
  p.push(tSo.svg);
  p.push(chu(phai - tSo.rong - 10, y + 88, nhan, { co: 15, mau: m.chuMo, neo: "end", rong: 400, coMin: 10 }).svg);
  return p.join("");
}

function veChinh(hs: ReturnType<typeof tinhHoSoThanSoHocSau>, lang: NgonNguVe, m: BangMau): string {
  const p: string[] = [];
  const y = LE + DAU + 12;
  p.push(hop(LE, y, W - 2 * LE, CHINH, 14, m.o, m.vien, 1));

  // Số chủ đạo: vòng lớn bên trái.
  const cx = LE + 150;
  const cy = y + CHINH / 2 - 6;
  p.push(`<circle cx="${so(cx)}" cy="${so(cy)}" r="98" fill="${m.chinhNen}" stroke="${m.chinh}" stroke-width="3"/>`);
  p.push(`<circle cx="${so(cx)}" cy="${so(cy)}" r="86" fill="none" stroke="${m.vang}" stroke-width="1.5" stroke-dasharray="2 5"/>`);
  p.push(chu(cx, cy + 26, String(hs.soDuongDoi), { co: 76, mau: m.chinh, dam: true, neo: "middle" }).svg);
  p.push(chu(cx, cy - 46, chon(lang, "Số chủ đạo", "Life Path", "生命灵数"), { co: 15, mau: m.chuMo, dam: true, neo: "middle", rong: 150, coMin: 9 }).svg);
  if (laSoChu(hs.soDuongDoi)) {
    const sc = chon(lang, "Số chủ", "Master number", "卓越数");
    p.push(vien(cx - (doRong(sc, 11, true) + 11 * 0.9) / 2, cy + 64, sc, 11, m.vang, m.chuTrenNhan).svg);
  }

  // Sáu chỉ số, hai hàng ba ô.
  const o: [string, number][] = [
    [chon(lang, "Sứ mệnh", "Expression", "使命数"), hs.soSuMenh],
    [chon(lang, "Linh hồn", "Soul Urge", "灵魂数"), hs.soLinhHon],
    [chon(lang, "Nhân cách", "Personality", "人格数"), hs.soNhanCach],
    [chon(lang, "Thái độ", "Attitude", "态度数"), hs.soThaiDo],
    [chon(lang, "Ngày sinh", "Birthday", "生日数"), hs.soNgaySinh],
    [chon(lang, "Trưởng thành", "Maturity", "成熟数"), hs.soTruongThanh],
  ];
  const x0 = LE + 300;
  const rongVung = W - LE - 22 - x0;
  const w = (rongVung - 20) / 3;
  const h = (CHINH - 44 - 12) / 2;
  for (let i = 0; i < o.length; i++) {
    const [nhan, giaTri] = o[i];
    const x = x0 + (i % 3) * (w + 10);
    const yo = y + 22 + Math.floor(i / 3) * (h + 12);
    p.push(hop(x, yo, w, h, 12, m.nen));
    p.push(chu(x + 20, yo + 34, nhan, { co: 15, mau: m.chuMo, rong: w - 40, coMin: 9 }).svg);
    p.push(chu(x + 20, yo + h - 22, String(giaTri), { co: 40, mau: laSoChu(giaTri) ? m.vang : m.chu, dam: true }).svg);
  }
  if (hs.soNoNghiepNgaySinh) {
    const nn = chon(lang, `Nợ nghiệp ${hs.soNoNghiepNgaySinh}`, `Karmic debt ${hs.soNoNghiepNgaySinh}`, `业力债 ${hs.soNoNghiepNgaySinh}`);
    p.push(vien(cx - (doRong(nn, 11, true) + 11 * 0.9) / 2, y + CHINH - 16, nn, 11, m.gach, m.chuTrenNhan).svg);
  }
  return p.join("");
}

function veDinh(hs: ReturnType<typeof tinhHoSoThanSoHocSau>, tuoiNay: number, lang: NgonNguVe, m: BangMau): string {
  const p: string[] = [];
  const y = LE + DAU + 12 + CHINH + 12;
  p.push(hop(LE, y, W - 2 * LE, DINH, 14, m.o, m.vien, 1));
  const trai = LE + 26;
  p.push(chu(trai, y + 36, chon(lang, "Đỉnh cao và thử thách", "Pinnacles and challenges", "巅峰数与挑战数"), { co: 19, mau: m.chu, dam: true, rong: 600, coMin: 12 }).svg);

  const dc = hs.soDinhCao;
  const tt = hs.soThachThuc;
  const tuoi = [
    `0-${dc.tuoiKetThucDinh1}`,
    `${dc.tuoiKetThucDinh1 + 1}-${dc.tuoiKetThucDinh2}`,
    `${dc.tuoiKetThucDinh2 + 1}-${dc.tuoiKetThucDinh3}`,
    `${dc.tuoiKetThucDinh3 + 1}+`,
  ];
  const dinh = [dc.dinh1, dc.dinh2, dc.dinh3, dc.dinh4];
  const thu = [tt.thachThuc1, tt.thachThuc2, tt.thachThuc3, tt.thachThuc4];
  const cotNhan = 150;
  const x0 = trai + cotNhan;
  const w = (W - LE - 26 - x0 - 30) / 4;
  const yTuoi = y + 76;
  const yDinh = y + 132;
  const yThu = y + 182;
  p.push(chu(trai, yTuoi, chon(lang, "Tuổi", "Age", "年龄"), { co: 13, mau: m.chuNhat, rong: cotNhan - 10, coMin: 8 }).svg);
  p.push(chu(trai, yDinh - 8, chon(lang, "Đỉnh cao", "Pinnacle", "巅峰数"), { co: 15, mau: m.chuMo, dam: true, rong: cotNhan - 10, coMin: 8 }).svg);
  p.push(chu(trai, yThu - 4, chon(lang, "Thử thách", "Challenge", "挑战数"), { co: 15, mau: m.chuMo, dam: true, rong: cotNhan - 10, coMin: 8 }).svg);
  for (let i = 0; i < 4; i++) {
    const x = x0 + i * (w + 10);
    const cx = x + w / 2;
    // Dải thời gian: bốn đoạn nối nhau, đoạn chứa tuổi năm đang xem tô đậm.
    const tu = i === 0 ? 0 : [dc.tuoiKetThucDinh1, dc.tuoiKetThucDinh2, dc.tuoiKetThucDinh3][i - 1] + 1;
    const den = i === 3 ? 999 : [dc.tuoiKetThucDinh1, dc.tuoiKetThucDinh2, dc.tuoiKetThucDinh3][i];
    p.push(hop(x, y + 86, w, 6, 3, tuoiNay >= tu && tuoiNay <= den ? m.chinh : m.chinhNen));
    p.push(chu(cx, yTuoi, tuoi[i], { co: 14, mau: m.chinh, dam: true, neo: "middle" }).svg);
    p.push(chu(cx, yDinh, String(dinh[i]), { co: 36, mau: laSoChu(dinh[i]) ? m.vang : m.chu, dam: true, neo: "middle" }).svg);
    p.push(chu(cx, yThu, String(thu[i]), { co: 22, mau: m.chuMo, dam: true, neo: "middle" }).svg);
  }
  return p.join("");
}

function veLuoi(hs: ReturnType<typeof tinhHoSoThanSoHocSau>, lang: NgonNguVe, m: BangMau): string {
  const p: string[] = [];
  const y = LE + DAU + 12 + CHINH + 12 + DINH + 12;
  const w = 370;
  p.push(hop(LE, y, w, DUOI, 14, m.o, m.vien, 1));
  const trai = LE + 26;
  p.push(chu(trai, y + 36, chon(lang, "Biểu đồ ngày sinh", "Birth chart", "出生数字图"), { co: 19, mau: m.chu, dam: true, rong: w - 52, coMin: 11 }).svg);
  // Lưới Pythagoras: cột 1-2-3, 4-5-6, 7-8-9 từ dưới lên.
  const thuTu = [[3, 6, 9], [2, 5, 8], [1, 4, 7]];
  const oW = (w - 52 - 16) / 3;
  const oH = 64;
  for (let r = 0; r < 3; r++) {
    for (let c = 0; c < 3; c++) {
      const d = thuTu[r][c];
      const dem = hs.luoiPythago[String(d) as keyof typeof hs.luoiPythago];
      const x = trai + c * (oW + 8);
      const yo = y + 56 + r * (oH + 8);
      p.push(hop(x, yo, oW, oH, 10, dem > 0 ? m.chinhNen : m.nen));
      let s = "";
      if (dem > 4) s = `${d}×${dem}`;
      else for (let k = 0; k < dem; k++) s += String(d);
      if (dem === 0) {
        p.push(chu(x + oW / 2, yo + oH / 2 + 7, String(d), { co: 20, mau: m.vien, dam: true, neo: "middle" }).svg);
      } else {
        p.push(chu(x + oW / 2, yo + oH / 2 + 9, s, { co: 26, mau: m.chinh, dam: true, neo: "middle", rong: oW - 12, coMin: 12 }).svg);
      }
    }
  }
  return p.join("");
}

function veBangTen(vao: VaoVeThanSoHoc, hs: ReturnType<typeof tinhHoSoThanSoHocSau>, lang: NgonNguVe, m: BangMau): string {
  const p: string[] = [];
  const y = LE + DAU + 12 + CHINH + 12 + DINH + 12;
  const x0 = LE + 370 + 12;
  const w = W - LE - x0;
  p.push(hop(x0, y, w, DUOI, 14, m.o, m.vien, 1));
  const trai = x0 + 26;
  const rong = w - 52;
  p.push(chu(trai, y + 36, chon(lang, "Bảng quy đổi họ tên", "Name chart", "姓名数字表"), { co: 19, mau: m.chu, dam: true, rong, coMin: 11 }).svg);

  const tu: string[] = [];
  for (const t of vao.hoTen.trim().split(/\s+/)) {
    const s = stripDiacritics(t);
    if (s) tu.push(s);
  }
  // Ô chữ: thử 36 rồi nhỏ dần cho tới khi các từ xếp vừa tối đa ba hàng.
  let oW = 56;
  let hang: string[][] = [];
  while (true) {
    hang = [[]];
    let dung = 0;
    for (const t of tu) {
      const can = t.length * oW + (dung > 0 ? oW * 0.6 : 0);
      if (dung > 0 && dung + can > rong) {
        hang.push([]);
        dung = 0;
      }
      hang[hang.length - 1].push(t);
      dung += t.length * oW + (dung > 0 ? oW * 0.6 : 0);
    }
    let rongNhat = 0;
    for (const t of tu) if (t.length * oW > rongNhat) rongNhat = t.length * oW;
    if ((hang.length * (oW * 1.5 + 10) <= DUOI - 142 && rongNhat <= rong) || oW <= 16) break;
    oW -= 2;
  }
  const oH = oW * 1.5;
  let yy = y + 60;
  for (const h of hang) {
    let xx = trai;
    for (const t of h) {
      for (const c of t) {
        const nguyenAm = NGUYEN_AM.includes(c);
        const gt = GIA_TRI_CHU[c] ?? 0;
        p.push(hop(xx + 1, yy, oW - 2, oH, 6, nguyenAm ? m.chinhNen : m.nen, nguyenAm ? m.chinh : "", 1));
        p.push(chu(xx + oW / 2, yy + oH * 0.42, c.toUpperCase(), { co: oW * 0.5, mau: nguyenAm ? m.chinh : m.chu, dam: true, neo: "middle" }).svg);
        p.push(chu(xx + oW / 2, yy + oH * 0.84, String(gt), { co: oW * 0.42, mau: nguyenAm ? m.chinh : m.chuMo, neo: "middle" }).svg);
        xx += oW;
      }
      xx += oW * 0.6;
    }
    yy += oH + 10;
  }

  // Chú giải và ba tổng của tên.
  const yc = y + DUOI - 54;
  p.push(`<rect x="${so(trai)}" y="${so(yc - 11)}" width="14" height="14" rx="3" fill="${m.chinhNen}" stroke="${m.chinh}" stroke-width="1"/>`);
  const a = chu(trai + 22, yc + 1, chon(lang, `Nguyên âm: Linh hồn ${hs.soLinhHon}`, `Vowels: Soul Urge ${hs.soLinhHon}`, `元音：灵魂数 ${hs.soLinhHon}`), { co: 13.5, mau: m.chuMo, rong: rong / 2 - 30, coMin: 8 });
  p.push(a.svg);
  const xb = trai + rong / 2;
  p.push(`<rect x="${so(xb)}" y="${so(yc - 11)}" width="14" height="14" rx="3" fill="${m.nen}"/>`);
  p.push(chu(xb + 22, yc + 1, chon(lang, `Phụ âm: Nhân cách ${hs.soNhanCach}`, `Consonants: Personality ${hs.soNhanCach}`, `辅音：人格数 ${hs.soNhanCach}`), { co: 13.5, mau: m.chuMo, rong: rong / 2 - 22, coMin: 8 }).svg);
  p.push(chu(trai, yc + 30, chon(lang, `Cả tên: Sứ mệnh ${hs.soSuMenh}`, `All letters: Expression ${hs.soSuMenh}`, `全名：使命数 ${hs.soSuMenh}`), { co: 13.5, mau: m.chuMo, rong, coMin: 8 }).svg);
  return p.join("");
}

/**
 * Vẽ hồ sơ thần số học thành chuỗi SVG tự chứa.
 *
 * ```ts
 * const svg = veThanSoHocSvg({ hoTen: "Nguyen Van An", dd: 19, mm: 9, yyyy: 1990, namXem: 2026 }, { lang: "en" });
 * ```
 */
export function veThanSoHocSvg(vao: VaoVeThanSoHoc, tuyChon: TuyChonVeThanSoHocSvg = {}): string {
  const lang: NgonNguVe = tuyChon.lang === "en" || tuyChon.lang === "zh" ? tuyChon.lang : "vi";
  const m = MAU[tuyChon.theme === "dark" ? "dark" : "light"];
  const rongHien = tuyChon.width && tuyChon.width > 0 ? tuyChon.width : 720;
  const caoHien = (rongHien * H) / W;
  const namXem = vao.namXem && vao.namXem > 0 ? vao.namXem : new Date().getFullYear();
  const hs = tinhHoSoThanSoHocSau(vao.hoTen, vao.dd, vao.mm, vao.yyyy, namXem, 1, 1);

  const tieuDe = chon(lang, "Thần số học", "Numerology", "生命灵数") + (vao.hoTen ? ": " + vao.hoTen : "");
  const moTa = chon(
    lang,
    `Số chủ đạo ${hs.soDuongDoi}, sứ mệnh ${hs.soSuMenh}, linh hồn ${hs.soLinhHon}, nhân cách ${hs.soNhanCach}. Vẽ bằng thư viện mở Nhật Nguyệt.`,
    `Life Path ${hs.soDuongDoi}, Expression ${hs.soSuMenh}, Soul Urge ${hs.soLinhHon}, Personality ${hs.soNhanCach}. Drawn with the Nhat Nguyet open library.`,
    `生命灵数 ${hs.soDuongDoi}，使命数 ${hs.soSuMenh}，灵魂数 ${hs.soLinhHon}，人格数 ${hs.soNhanCach}。由 Nhat Nguyet 开源库绘制。`,
  );

  const p: string[] = [];
  p.push(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${so(rongHien)}" height="${so(caoHien)}" role="img" aria-labelledby="nn-tieu-de nn-mo-ta" lang="${lang}">`);
  p.push(`<title id="nn-tieu-de">${thoat(tieuDe)}</title>`);
  p.push(`<desc id="nn-mo-ta">${thoat(moTa)}</desc>`);
  p.push(`<style>text{font-family:${PHONG};}</style>`);
  p.push(hop(0, 0, W, H, 18, m.nen));
  p.push(veDau(vao, namXem, hs.soNamCaNhan, lang, m));
  p.push(veChinh(hs, lang, m));
  p.push(veDinh(hs, namXem - vao.yyyy, lang, m));
  p.push(veLuoi(hs, lang, m));
  p.push(veBangTen(vao, hs, lang, m));
  const yChan = H - 16;
  p.push(chu(LE + 4, yChan, "nhatnguyet.org", { co: 14, mau: m.chinh, dam: true }).svg);
  p.push(chu(W - LE - 4, yChan, chon(lang, "Bảng chữ Pythagoras, tên bỏ dấu", "Pythagorean letter values, diacritics removed", "毕达哥拉斯字母表，去除声调符号"), {
    co: 12.5, mau: m.chuNhat, neo: "end", rong: 600, coMin: 9,
  }).svg);
  p.push("</svg>");
  return p.join("");
}

/** Bí danh tiếng Anh của `veThanSoHocSvg`. */
export const renderNumerologySvg = veThanSoHocSvg;
