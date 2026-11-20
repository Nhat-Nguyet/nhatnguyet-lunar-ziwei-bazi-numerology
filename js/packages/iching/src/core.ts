// Lớp lõi Kinh Dịch: chuyển ngữ từng bước của lõi tính Go (kinhdich.go,
// kinhdich_lienquan.go, luchao.go, luchao_data.go, kinhdich_quaikhi.go,
// quaikhi_thoidiem.go). Đối tượng trả về dùng ĐÚNG khoá của ca kiểm
// ca-kiem/iching.json. Không xuất ra index của gói: người dùng gọi lớp tiếng
// Anh (en.ts).

import {
  DIA_CHI,
  THIEN_CAN,
  TIET_KHI_TABLE,
  chiSoCanNam,
  dayCanChi,
  jdFromDate,
  kinhDoMatTroi,
  mocTietKhi,
  mod,
  tietKhiCuaNgay,
} from "@nhatnguyet/am-lich";
import type { ThoiDiemTietKhi } from "@nhatnguyet/am-lich";
import {
  KHAC,
  KHOI_LUC_THU,
  KING_WEN,
  LUC_THAN,
  LUC_THU,
  MO_HINH_QUAI_KHI,
  NAP_GIAP,
  NGUONG_SAT_GIAO_QUE_PHUT,
  PHUT_MOI_QUE,
  QUAI,
  SINH,
  TEN_QUE,
  THE_THEO_VI_TRI,
  THU_TU_CUNG,
  THU_TU_QUAI_KHI,
  TRANG_THAI,
  TU_CHINH,
  VAI_TRO_QUAI_KHI,
  VI_TRI_CUNG,
} from "./data.ts";

/** Sáu hào từ dưới lên, true là dương. */
export type SauHao = readonly boolean[];

/** Số Tiên Thiên của quái từ ba hào (dưới lên): 8 trừ giá trị nhị phân, hào sơ là bit cao. */
export function soQuaiTuHao(h: readonly boolean[]): number {
  return 8 - ((h[0] ? 4 : 0) + (h[1] ? 2 : 0) + (h[2] ? 1 : 0));
}

/** Hào của quái số so (dưới lên). */
export function haoQuai(so: number): boolean[] {
  return QUAI[so][6].map((x) => x === 1);
}

/** Số King Wen từ sáu hào. */
export function soQueTuHao(h: SauHao): number {
  return KING_WEN[soQuaiTuHao(h.slice(3, 6))][soQuaiTuHao(h.slice(0, 3))];
}

// Bảng ngược: số King Wen -> [thượng, hạ].
const THUONG_HA: readonly (readonly [number, number])[] = (() => {
  const out: [number, number][] = Array.from({ length: 65 }, () => [0, 0] as [number, number]);
  for (let t = 1; t <= 8; t++) for (let h = 1; h <= 8; h++) out[KING_WEN[t][h]] = [t, h];
  return out;
})();

/** Quái thượng và quái hạ (số Tiên Thiên) của quẻ số so. */
export function thuongHa(so: number): readonly [number, number] {
  return THUONG_HA[so];
}

/** Sáu hào của quẻ số so (dưới lên). */
export function haoQue(so: number): boolean[] {
  const [t, h] = THUONG_HA[so];
  return [...haoQuai(h), ...haoQuai(t)];
}

/** Tên Việt của quẻ: hai tượng Hán Việt cộng tên riêng, hoặc "Thuần <quái>". */
export function tenVietQue(so: number): string {
  const [t, h] = THUONG_HA[so];
  if (t === h) return "Thuần " + QUAI[t][0];
  return QUAI[t][9] + " " + QUAI[h][9] + " " + TEN_QUE[so][0];
}

interface Cung {
  soQuaiCung: number;
  hanhCung: string;
  viTri: number;
  the: number;
  ung: number;
}

const khoaHao = (h: SauHao): string => h.map((x) => (x ? "1" : "0")).join("");

// Bát cung dựng bằng quy tắc lật hào, như dungBangCung của Go.
const BANG_CUNG: ReadonlyMap<string, Cung> = (() => {
  const out = new Map<string, Cung>();
  for (const soQuai of THU_TU_CUNG) {
    const q = haoQuai(soQuai);
    const ghi = (h: boolean[], vi: number) => {
      const the = THE_THEO_VI_TRI[vi];
      let ung = the + 3;
      if (ung > 6) ung -= 6;
      out.set(khoaHao(h), { soQuaiCung: soQuai, hanhCung: QUAI[soQuai][10], viTri: vi, the, ung });
    };
    const cur = [...q, ...q];
    ghi(cur, 0);
    for (let i = 0; i < 5; i++) {
      cur[i] = !cur[i];
      ghi(cur, i + 1);
    }
    cur[3] = !cur[3];
    ghi(cur, 6);
    for (let i = 0; i < 3; i++) cur[i] = !cur[i];
    ghi(cur, 7);
  }
  return out;
})();

/** Cung, vị trí trong cung, Thế, Ứng của một quẻ. */
export function cungCua(h: SauHao): Cung {
  return BANG_CUNG.get(khoaHao(h)) as Cung;
}

/** Quẻ hỗ: hào 2, 3, 4 làm quẻ hạ, hào 3, 4, 5 làm quẻ thượng. */
export function queHo(h: SauHao): number {
  return soQueTuHao([h[1], h[2], h[3], h[2], h[3], h[4]]);
}
/** Quẻ thác: đảo cả sáu hào. */
export function queThac(h: SauHao): number {
  return soQueTuHao(h.map((x) => !x));
}
/** Quẻ tổng: lật quẻ từ trên xuống. */
export function queTong(h: SauHao): number {
  return soQueTuHao([...h].reverse());
}

/** Một quái, khoá theo ca kiểm. */
export function quaiTho(so: number) {
  const q = QUAI[so];
  return {
    number: so,
    nameVi: q[0],
    nameEn: q[1],
    nameHan: q[2],
    nameZh: q[3],
    pinyin: q[4],
    symbol: q[5],
    lines: haoQuai(so),
    imageVi: q[7],
    imageEn: q[8],
    imageHan: q[9],
    element: q[10],
    elementEn: HANH_EN[q[10]],
    direction: q[11],
    directionEn: q[12],
  };
}

const HANH_EN: Readonly<Record<string, string>> = { "Kim": "Metal", "Mộc": "Wood", "Thủy": "Water", "Hỏa": "Fire", "Thổ": "Earth" };

/** Một quẻ, khoá theo ca kiểm. */
export function queTho(so: number) {
  const h = haoQue(so);
  const [t, d] = THUONG_HA[so];
  const c = cungCua(h);
  const vt = VI_TRI_CUNG[c.viTri];
  return {
    number: so,
    symbol: String.fromCodePoint(0x4dc0 + so - 1),
    lines: h,
    binary: khoaHao(h),
    upper: t,
    lower: d,
    nameVi: tenVietQue(so),
    nameEn: TEN_QUE[so][3],
    nameHan: TEN_QUE[so][1],
    nameZh: TEN_QUE[so][2],
    pinyin: TEN_QUE[so][4],
    palace: c.soQuaiCung,
    palaceElement: c.hanhCung,
    generation: c.viTri,
    generationVi: vt[0],
    generationEn: vt[1],
    generationZh: vt[2],
    world: c.the,
    response: c.ung,
    mutual: queHo(h),
    opposite: queThac(h),
    reverse: queTong(h),
  };
}

/** Kiểm sáu số gieo 6..9; ném lỗi khi sai. */
export function kiemGieo(g: readonly number[]): void {
  if (!Array.isArray(g) || g.length !== 6 || !g.every((v) => Number.isInteger(v) && v >= 6 && v <= 9)) {
    throw new RangeError(`coin lines must be six integers from 6 to 9 (bottom line first), got ${JSON.stringify(g)}`);
  }
}

/** Hào chính, hào biến, hào động từ sáu số 6..9 (bảng của GieoLucHao). */
export function haoTuGieo(g: readonly number[]): { chinh: boolean[]; bien: boolean[]; dong: boolean[] } {
  const chinh: boolean[] = [];
  const bien: boolean[] = [];
  const dong: boolean[] = [];
  for (const v of g) {
    chinh.push(v === 7 || v === 9);
    bien.push(v === 6 || v === 7);
    dong.push(v === 6 || v === 9);
  }
  return { chinh, bien, dong };
}

/** Quẻ chính, hào động, quẻ biến từ sáu số 6..9. */
export function gieoTho(g: readonly number[]) {
  kiemGieo(g);
  const { chinh, bien, dong } = haoTuGieo(g);
  const moving: number[] = [];
  dong.forEach((d, i) => d && moving.push(i + 1));
  return { primary: soQueTuHao(chinh), moving, changed: moving.length ? soQueTuHao(bien) : null };
}

/** Chia dư kiểu Mai Hoa: kết quả 1..m (chia hết lấy m). */
function modQue(n: number, m: number): number {
  const r = mod(n, m);
  return r === 0 ? m : r;
}

/** Mai Hoa Dịch Số từ ba số: thượng = a mod 8, hạ = b mod 8, hào động = c mod 6. */
export function maiHoaTho(a: number, b: number, c: number) {
  const t = modQue(a, 8);
  const d = modQue(b, 8);
  const dong = modQue(c, 6);
  const so = KING_WEN[t][d];
  const h = haoQue(so);
  h[dong - 1] = !h[dong - 1];
  return { upper: t, lower: d, primary: so, moving: [dong], changed: soQueTuHao(h) };
}

/** Can, chi của một hào theo nạp giáp; vi 0..2 tính từ hào dưới của quái. */
function chiCuaHao(soQuai: number, vi: number, laNgoai: boolean): [string, string] {
  const ng = NAP_GIAP[soQuai];
  const batDau = laNgoai ? ng[3] : ng[2];
  const buoc = ng[4] ? 2 : -2;
  return [laNgoai ? ng[1] : ng[0], DIA_CHI[mod(batDau + buoc * vi, 12)]];
}

const CHI_HANH: readonly string[] = ["Thủy", "Thổ", "Mộc", "Mộc", "Thổ", "Hỏa", "Hỏa", "Thổ", "Kim", "Kim", "Thổ", "Thủy"];
const hanhCuaChi = (chi: string): string => CHI_HANH[DIA_CHI.indexOf(chi)];

function lucThanCho(hanhHao: string, hanhCung: string): string {
  if (hanhHao === hanhCung) return "Huynh Đệ";
  if (SINH[hanhHao] === hanhCung) return "Phụ Mẫu";
  if (SINH[hanhCung] === hanhHao) return "Tử Tôn";
  if (KHAC[hanhHao] === hanhCung) return "Quan Quỷ";
  if (KHAC[hanhCung] === hanhHao) return "Thê Tài";
  return "";
}

function trangThaiTheoLenh(hanh: string, lenh: string): string {
  if (hanh === lenh) return "vượng";
  if (SINH[lenh] === hanh) return "tướng";
  if (SINH[hanh] === lenh) return "hưu";
  if (KHAC[hanh] === lenh) return "tù";
  if (KHAC[lenh] === hanh) return "tử";
  return "";
}

/** Tuần không của ngày: hai chi không được ghép can trong tuần giáp. */
export function tuanKhong(canIdx: number, chiIdx: number): [string, string] {
  const dau = mod(chiIdx - canIdx, 12);
  return [DIA_CHI[mod(dau + 10, 12)], DIA_CHI[mod(dau + 11, 12)]];
}

/**
 * Trụ tháng lúc 12 giờ trưa giờ Việt Nam theo kinh độ Mặt Trời, như LapBatTu
 * của lõi tính (tháng đổi ở mười hai tiết, năm đổi ở Lập Xuân).
 */
export function truThang(dd: number, mm: number, yyyy: number): { can: string; chi: string; label: string } {
  const deg = kinhDoMatTroi(dd, mm, yyyy, 12, 7);
  let nam = yyyy;
  if (mm <= 2 && deg < 315) nam = yyyy - 1;
  const canNam = chiSoCanNam(nam);
  const thuTu = Math.floor(Math.trunc(deg - 315 + 360) % 360 / 30);
  const chi = DIA_CHI[(thuTu + 2) % 12];
  const can = THIEN_CAN[((((canNam % 5) * 2 + 2) % 10) + thuTu) % 10];
  return { can, chi, label: can + " " + chi };
}

/** Bảng Lục Hào của sáu số 6..9 vào ngày dd/mm/yyyy, khoá theo ca kiểm. */
export function najiaTho(g: readonly number[], dd: number, mm: number, yyyy: number) {
  kiemGieo(g);
  const { chinh, bien, dong } = haoTuGieo(g);
  const so = soQueTuHao(chinh);
  const coDong = dong.some((x) => x);
  const soBien = coDong ? soQueTuHao(bien) : null;
  const cung = cungCua(chinh);
  const nhat = dayCanChi(dd, mm, yyyy);
  const canNgay = THIEN_CAN.indexOf(nhat.can);
  const khong = tuanKhong(canNgay, DIA_CHI.indexOf(nhat.chi));
  const thang = truThang(dd, mm, yyyy);
  const lenh = hanhCuaChi(thang.chi);
  const [qThuong, qHa] = THUONG_HA[so];
  const [bThuong, bHa] = soBien ? THUONG_HA[soBien] : [0, 0];
  const khoi = KHOI_LUC_THU[canNgay];
  const lines = [];
  for (let i = 0; i < 6; i++) {
    const ngoai = i >= 3;
    const [can, chi] = chiCuaHao(ngoai ? qThuong : qHa, ngoai ? i - 3 : i, ngoai);
    const hanh = hanhCuaChi(chi);
    const lt = lucThanCho(hanh, cung.hanhCung);
    const thu = LUC_THU[(khoi + i) % 6];
    const tt = trangThaiTheoLenh(hanh, lenh);
    let changed = null;
    if (dong[i] && soBien) {
      const [, bchi] = chiCuaHao(ngoai ? bThuong : bHa, ngoai ? i - 3 : i, ngoai);
      const bhanh = hanhCuaChi(bchi);
      const blt = lucThanCho(bhanh, cung.hanhCung);
      changed = { branch: bchi, element: bhanh, relation: blt, relationEn: LUC_THAN[blt][0], relationZh: LUC_THAN[blt][1] };
    }
    lines.push({
      position: i + 1,
      yang: chinh[i],
      moving: dong[i],
      stem: can,
      branch: chi,
      element: hanh,
      relation: lt,
      relationEn: LUC_THAN[lt][0],
      relationZh: LUC_THAN[lt][1],
      spirit: thu[0],
      spiritEn: thu[1],
      spiritZh: thu[2],
      world: i + 1 === cung.the,
      response: i + 1 === cung.ung,
      void: chi === khong[0] || chi === khong[1],
      monthState: tt,
      monthStateEn: TRANG_THAI[tt][0],
      monthStateZh: TRANG_THAI[tt][1],
      monthBreak: chi !== nhat.chi && mod(DIA_CHI.indexOf(chi) - DIA_CHI.indexOf(thang.chi), 12) === 6,
      changed,
    });
  }
  return {
    number: so,
    changed: soBien,
    day: nhat.label,
    month: thang.label,
    void: khong,
    palace: cung.soQuaiCung,
    palaceElement: cung.hanhCung,
    generation: cung.viTri,
    world: cung.the,
    response: cung.ung,
    lines,
  };
}

// --- Quái khí ---

const PHUT_MOI_NGAY = 1440;

/** Phút kể từ trưa ngày Julius 0, theo giờ địa phương (Việt Nam). */
function phutDiaPhuong(d: { day: number; month: number; year: number }, phutTrongNgay: number): number {
  return jdFromDate(d.day, d.month, d.year) * PHUT_MOI_NGAY - PHUT_MOI_NGAY / 2 + phutTrongNgay;
}

function dongChiTruoc(t: number, nam: number): ThoiDiemTietKhi {
  for (const n of [nam, nam - 1]) {
    const m = mocTietKhi(TIET_KHI_TABLE[18], n);
    if (phutDiaPhuong(m.ngay, m.gio * 60 + m.phut) <= t) return m;
  }
  return mocTietKhi(TIET_KHI_TABLE[18], nam - 2);
}

const p2 = (n: number) => String(n).padStart(2, "0");

/** Quẻ trị ngày dd/mm/yyyy theo Quái khí (12 giờ trưa giờ Việt Nam), khoá theo ca kiểm. */
export function queNgayTho(dd: number, mm: number, yyyy: number) {
  const trua = jdFromDate(dd, mm, yyyy) * PHUT_MOI_NGAY;
  const dc = dongChiTruoc(trua, yyyy);
  const daQua = trua - phutDiaPhuong(dc.ngay, dc.gio * 60 + dc.phut);
  const dq = daQua < 0 ? 0 : daQua;
  let iQue = Math.floor(dq / PHUT_MOI_QUE);
  if (iQue > 59) iQue = 59;
  let iNgay = Math.floor((dq - iQue * PHUT_MOI_QUE) / PHUT_MOI_NGAY);
  if (iNgay > 6) iNgay = 6;
  const du = daQua - iQue * PHUT_MOI_QUE;
  const toi = Math.min(du, PHUT_MOI_QUE - du);
  const hao = Math.min(iNgay, 5) + 1;
  const tk = tietKhiCuaNgay(dd, mm, yyyy);
  const k = (tk.index - 18 + 24) % 24;
  const vai = VAI_TRO_QUAI_KHI[iQue % 5];

  // Chỗ giao quẻ trong ngày (TimGiaoQueTrongNgay).
  let change = null;
  const dau = trua - PHUT_MOI_NGAY / 2;
  const cuoi = trua + PHUT_MOI_NGAY / 2;
  const dc2 = dongChiTruoc(cuoi - 1, yyyy);
  const goc = phutDiaPhuong(dc2.ngay, dc2.gio * 60 + dc2.phut);
  for (let j = 0; j < 60; j++) {
    const b = goc + j * PHUT_MOI_QUE;
    if (b >= cuoi) break;
    if (b <= dau) continue;
    const truoc = j === 0 ? 59 : j - 1;
    const phut = b - dau;
    change = {
      time: `${p2(Math.floor(phut / 60))}:${p2(phut % 60)}`,
      before: { number: THU_TU_QUAI_KHI[truoc], cycleIndex: truoc + 1 },
      after: { number: THU_TU_QUAI_KHI[j], cycleIndex: j + 1 },
    };
    break;
  }
  return {
    number: THU_TU_QUAI_KHI[iQue],
    cycleIndex: iQue + 1,
    dayInHexagram: iNgay + 1,
    rulingLine: hao,
    role: vai[0],
    roleEn: vai[1],
    roleZh: vai[2],
    solstice: {
      date: `${String(dc.ngay.year).padStart(4, "0")}-${p2(dc.ngay.month)}-${p2(dc.ngay.day)}`,
      time: `${p2(dc.gio)}:${p2(dc.phut)}`,
    },
    minutesSinceSolstice: daQua,
    minutesToChange: toi,
    nearChange: toi < NGUONG_SAT_GIAO_QUE_PHUT,
    solarTerm: tk.index,
    cardinal: { number: TU_CHINH[Math.floor(k / 6)], line: (k % 6) + 1 },
    change,
    model: MO_HINH_QUAI_KHI,
  };
}
