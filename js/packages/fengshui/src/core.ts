// Lớp lõi chuyển ngữ của @nhatnguyet/fengshui: bản TypeScript của các hàm phong
// thuỷ trong lõi tính Go (coreengine: battrach.go,
// sonhuong.go, huyenkhong.go, huyenkhong_van.go, loban.go, kinhdich.go). Đối
// tượng trả về dùng ĐÚNG khoá của ca kiểm ca-kiem/fengshui.json để so từng
// trường. Tệp này KHÔNG xuất ra index của gói: người dùng gọi lớp tiếng Anh
// (en.ts). Mọi bảng chép từ Go; ca kiểm bắt chỗ chép sai.

import { DIA_CHI, THIEN_CAN } from "@nhatnguyet/am-lich";
import { BANG_THUOC, TEN_CUNG_NHO, type BangThuoc } from "./thuoc-lo-ban.ts";

/** Chia lấy dư không âm (như hàm mod của lõi Go). */
export function mod(a: number, b: number): number {
  return ((a % b) + b) % b;
}

// ── Bát quái (kinhdich.go, AllBatQuai) ──────────────────────────────────

export interface QueDon {
  so: number;
  ten: string;
  tenEn: string;
  tenHan: string;
  kyHieu: string;
  hao: [boolean, boolean, boolean];
  tuong: string;
  tuongEn: string;
  tuongHan: string;
  nguHanh: string;
  nguHanhEn: string;
  phuongVi: string;
  phuongViEn: string;
}

type DongQue = [string, string, string, string, [boolean, boolean, boolean], string, string, string, string, string, string, string];

// Thứ tự Tiên Thiên (Càn 1 ... Khôn 8), như bảng batQuai của Go.
const BAT_QUAI: readonly DongQue[] = [
  ["Càn", "Qian", "乾", "☰", [true, true, true], "Trời", "Heaven", "Thiên", "Kim", "Metal", "Tây Bắc", "Northwest"],
  ["Đoài", "Dui", "兌", "☱", [true, true, false], "Đầm", "Lake", "Trạch", "Kim", "Metal", "Tây", "West"],
  ["Ly", "Li", "離", "☲", [true, false, true], "Lửa", "Fire", "Hỏa", "Hỏa", "Fire", "Nam", "South"],
  ["Chấn", "Zhen", "震", "☳", [true, false, false], "Sấm", "Thunder", "Lôi", "Mộc", "Wood", "Đông", "East"],
  ["Tốn", "Xun", "巽", "☴", [false, true, true], "Gió", "Wind", "Phong", "Mộc", "Wood", "Đông Nam", "Southeast"],
  ["Khảm", "Kan", "坎", "☵", [false, true, false], "Nước", "Water", "Thủy", "Thủy", "Water", "Bắc", "North"],
  ["Cấn", "Gen", "艮", "☶", [false, false, true], "Núi", "Mountain", "Sơn", "Thổ", "Earth", "Đông Bắc", "Northeast"],
  ["Khôn", "Kun", "坤", "☷", [false, false, false], "Đất", "Earth", "Địa", "Thổ", "Earth", "Tây Nam", "Southwest"],
];

/** Tám quái theo thứ tự Tiên Thiên (AllBatQuai). */
export function allBatQuai(): QueDon[] {
  return BAT_QUAI.map((d, i) => ({
    so: i + 1, ten: d[0], tenEn: d[1], tenHan: d[2], kyHieu: d[3], hao: [d[4][0], d[4][1], d[4][2]],
    tuong: d[5], tuongEn: d[6], tuongHan: d[7], nguHanh: d[8], nguHanhEn: d[9], phuongVi: d[10], phuongViEn: d[11],
  }));
}

/** Quái theo tên Việt ("Khảm"). */
export function queTheoTen(ten: string): QueDon | undefined {
  return allBatQuai().find((q) => q.ten === ten);
}

// ── Bát Trạch (battrach.go) ─────────────────────────────────────────────

/** Năm Giáp Tý mở thượng nguyên gần nhất (Hiệp kỷ biện phương thư). */
const NAM_THUONG_NGUYEN = 1864;

/** Cung phi (số Kua) theo năm (âm lịch) và giới tính "Nam" | "Nữ"; 5 gửi 2 (nam), 8 (nữ). */
export function kuaNumber(namSinh: number, gioiTinh: string): number {
  const n = namSinh - NAM_THUONG_NGUYEN;
  if (gioiTinh === "Nữ") {
    const k = mod(n + 4, 9) + 1;
    return k === 5 ? 8 : k;
  }
  const k = mod(-n, 9) + 1;
  return k === 5 ? 2 : k;
}

export type NhomMenhQuai = "dong_tu_menh" | "tay_tu_menh";

export function kuaGroup(kua: number): NhomMenhQuai {
  return kua === 1 || kua === 3 || kua === 4 || kua === 9 ? "dong_tu_menh" : "tay_tu_menh";
}

/** Tên quẻ (Việt, bính âm) theo Kua. */
export const KUA_QUE: Readonly<Record<number, readonly [string, string]>> = {
  1: ["Khảm", "Kan"], 2: ["Khôn", "Kun"], 3: ["Chấn", "Zhen"], 4: ["Tốn", "Xun"],
  6: ["Càn", "Qian"], 7: ["Đoài", "Dui"], 8: ["Cấn", "Gen"], 9: ["Ly", "Li"],
};

export type LoaiSao = "sinh_khi" | "thien_y" | "dien_nien" | "phuc_vi" | "hoa_hai" | "luc_sat" | "ngu_quy" | "tuyet_menh";

/** Tám du niên: tên Việt, bính âm (TenEn của Go), chữ Hán giản thể, sao tốt. */
export const SAO_BAT_TRACH: Readonly<Record<LoaiSao, readonly [string, string, string, boolean]>> = {
  sinh_khi: ["Sinh Khí", "Sheng Qi", "生气", true],
  thien_y: ["Thiên Y", "Tian Yi", "天医", true],
  dien_nien: ["Diên Niên", "Yan Nian", "延年", true],
  phuc_vi: ["Phục Vị", "Fu Wei", "伏位", true],
  hoa_hai: ["Họa Hại", "Huo Hai", "祸害", false],
  luc_sat: ["Lục Sát", "Liu Sha", "六煞", false],
  ngu_quy: ["Ngũ Quỷ", "Wu Gui", "五鬼", false],
  tuyet_menh: ["Tuyệt Mệnh", "Jue Ming", "绝命", false],
};

/** Thứ tự của lõi: tốt từ Sinh Khí tới Phục Vị, xấu từ Họa Hại tới Tuyệt Mệnh. */
export const SAO_TOT: readonly LoaiSao[] = ["sinh_khi", "thien_y", "dien_nien", "phuc_vi"];
export const SAO_XAU: readonly LoaiSao[] = ["hoa_hai", "luc_sat", "ngu_quy", "tuyet_menh"];

/** Hướng của từng du niên theo Kua (batTrachTable). */
export const BAT_TRACH: Readonly<Record<number, Readonly<Record<LoaiSao, string>>>> = {
  1: { sinh_khi: "Đông Nam", thien_y: "Đông", dien_nien: "Nam", phuc_vi: "Bắc", hoa_hai: "Tây", luc_sat: "Tây Bắc", ngu_quy: "Đông Bắc", tuyet_menh: "Tây Nam" },
  2: { sinh_khi: "Đông Bắc", thien_y: "Tây", dien_nien: "Tây Bắc", phuc_vi: "Tây Nam", hoa_hai: "Đông", luc_sat: "Nam", ngu_quy: "Đông Nam", tuyet_menh: "Bắc" },
  3: { sinh_khi: "Nam", thien_y: "Bắc", dien_nien: "Đông Nam", phuc_vi: "Đông", hoa_hai: "Tây Nam", luc_sat: "Đông Bắc", ngu_quy: "Tây Bắc", tuyet_menh: "Tây" },
  4: { sinh_khi: "Bắc", thien_y: "Nam", dien_nien: "Đông", phuc_vi: "Đông Nam", hoa_hai: "Tây Bắc", luc_sat: "Tây", ngu_quy: "Tây Nam", tuyet_menh: "Đông Bắc" },
  6: { sinh_khi: "Tây", thien_y: "Đông Bắc", dien_nien: "Tây Nam", phuc_vi: "Tây Bắc", hoa_hai: "Đông Nam", luc_sat: "Bắc", ngu_quy: "Đông", tuyet_menh: "Nam" },
  7: { sinh_khi: "Tây Bắc", thien_y: "Tây Nam", dien_nien: "Đông Bắc", phuc_vi: "Tây", hoa_hai: "Bắc", luc_sat: "Đông Nam", ngu_quy: "Nam", tuyet_menh: "Đông" },
  8: { sinh_khi: "Tây Nam", thien_y: "Tây Bắc", dien_nien: "Tây", phuc_vi: "Đông Bắc", hoa_hai: "Nam", luc_sat: "Đông", ngu_quy: "Bắc", tuyet_menh: "Đông Nam" },
  9: { sinh_khi: "Đông", thien_y: "Đông Nam", dien_nien: "Bắc", phuc_vi: "Nam", hoa_hai: "Đông Bắc", luc_sat: "Tây Nam", ngu_quy: "Tây", tuyet_menh: "Tây Bắc" },
};

/** Tám hướng theo vòng từ Bắc: tên Việt, Anh, chữ Hán; quái Hậu Thiên của hướng. */
export const TAM_HUONG: readonly (readonly [string, string, string, string])[] = [
  ["Bắc", "North", "北", "Khảm"],
  ["Đông Bắc", "Northeast", "东北", "Cấn"],
  ["Đông", "East", "东", "Chấn"],
  ["Đông Nam", "Southeast", "东南", "Tốn"],
  ["Nam", "South", "南", "Ly"],
  ["Tây Nam", "Southwest", "西南", "Khôn"],
  ["Tây", "West", "西", "Đoài"],
  ["Tây Bắc", "Northwest", "西北", "Càn"],
];

function huongDong(vi: string): readonly [string, string, string, string] {
  const d = TAM_HUONG.find((h) => h[0] === vi);
  if (!d) throw new Error("hướng lạ: " + vi);
  return d;
}

export interface HuongInfo {
  huong: string;
  huongEn: string;
  huongZh: string;
  sao: LoaiSao;
  tenSao: string;
  tenSaoEn: string;
  tenSaoZh: string;
}

export interface BatTrachKetQua {
  kua: number;
  que: string;
  queEn: string;
  nhomMenh: NhomMenhQuai;
  huongTot: HuongInfo[];
  huongXau: HuongInfo[];
}

/** Tám du niên của một Kua (phần bảng của XemHuongNhaDat). */
export function batTrachTheoKua(kua: number): BatTrachKetQua {
  const que = KUA_QUE[kua];
  const bang = BAT_TRACH[kua];
  if (!que || !bang) throw new RangeError("Kua phải là 1 tới 9, trừ 5");
  const dung = (thuTu: readonly LoaiSao[]): HuongInfo[] =>
    thuTu.map((s) => {
      const h = huongDong(bang[s]);
      const t = SAO_BAT_TRACH[s];
      return { huong: h[0], huongEn: h[1], huongZh: h[2], sao: s, tenSao: t[0], tenSaoEn: t[1], tenSaoZh: t[2] };
    });
  return { kua, que: que[0], queEn: que[1], nhomMenh: kuaGroup(kua), huongTot: dung(SAO_TOT), huongXau: dung(SAO_XAU) };
}

/** XemHuongNhaDat: cung phi và tám hướng của một người (năm âm lịch). */
export function xemHuongNhaDat(namSinh: number, gioiTinh: string): BatTrachKetQua {
  return batTrachTheoKua(kuaNumber(namSinh, gioiTinh));
}

export interface TrachBangTra {
  kua: number;
  que: string;
  queEn: string;
  nhom: string;
  nhomEn: string;
  huongTot: { sao: string; saoEn: string; huong: string; huongEn: string }[];
  huongXau: { sao: string; saoEn: string; huong: string; huongEn: string }[];
}

/** AllTrachBatTrach: tám trạch (không có Kua 5). */
export function allTrachBatTrach(): TrachBangTra[] {
  return [1, 2, 3, 4, 6, 7, 8, 9].map((kua) => {
    const q = KUA_QUE[kua];
    const tay = kuaGroup(kua) === "tay_tu_menh";
    const dong = (s: LoaiSao) => ({ sao: SAO_BAT_TRACH[s][0], saoEn: SAO_BAT_TRACH[s][1], huong: BAT_TRACH[kua][s], huongEn: huongDong(BAT_TRACH[kua][s])[1] });
    return {
      kua, que: q[0], queEn: q[1],
      nhom: tay ? "Tây Tứ Mệnh" : "Đông Tứ Mệnh", nhomEn: tay ? "West Group" : "East Group",
      huongTot: SAO_TOT.map(dong), huongXau: SAO_XAU.map(dong),
    };
  });
}

// ── 24 sơn (sonhuong.go) ────────────────────────────────────────────────

export interface SonHuong {
  so: number;
  ten: string;
  loai: "Thiên Can" | "Địa Chi" | "Quái";
  huong: string;
  quai: string;
  tuDo: number;
  denDo: number;
  nguyenLong: "Địa" | "Thiên" | "Nhân";
}

/** 24 sơn theo vòng la bàn, từ Tý ở chính Bắc. */
export const TEN_SON: readonly string[] = [
  "Tý", "Quý", "Sửu", "Cấn", "Dần", "Giáp",
  "Mão", "Ất", "Thìn", "Tốn", "Tỵ", "Bính",
  "Ngọ", "Đinh", "Mùi", "Khôn", "Thân", "Canh",
  "Dậu", "Tân", "Tuất", "Càn", "Hợi", "Nhâm",
];

const NGUYEN_LONG = ["Địa", "Thiên", "Nhân"] as const;

export function chuanHoaDo(d: number): number {
  while (d < 0) d += 360;
  while (d >= 360) d -= 360;
  return d;
}

function loaiSon(ten: string): SonHuong["loai"] {
  if (THIEN_CAN.includes(ten)) return "Thiên Can";
  if (DIA_CHI.includes(ten)) return "Địa Chi";
  return "Quái";
}

let DS_SON: readonly SonHuong[] | null = null;

/** AllSonHuong (bản sao mới mỗi lần gọi). */
export function allSonHuong(): SonHuong[] {
  if (!DS_SON) {
    DS_SON = TEN_SON.map((ten, i) => {
      const viTri = (i + 1) % 24;
      const nhom = Math.trunc(viTri / 3);
      return {
        so: i + 1, ten, loai: loaiSon(ten), huong: TAM_HUONG[nhom][0], quai: TAM_HUONG[nhom][3],
        tuDo: chuanHoaDo(i * 15 - 7.5), denDo: chuanHoaDo(i * 15 + 7.5), nguyenLong: NGUYEN_LONG[viTri % 3],
      };
    });
  }
  return DS_SON.map((s) => ({ ...s }));
}

/** SonHuongTheoDo: sơn chứa một góc la bàn. */
export function sonHuongTheoDo(doLaBan: number): SonHuong {
  const d = chuanHoaDo(doLaBan);
  const idx = Math.trunc(chuanHoaDo(d + 7.5) / 15) % 24;
  return allSonHuong()[idx];
}

// ── Huyền Không (huyenkhong.go, huyenkhong_van.go) ───────────────────────

/** Số nhà Lạc Thư của mỗi quái. */
export const SO_NHA_QUAI: Readonly<Record<string, number>> = {
  "Khảm": 1, "Khôn": 2, "Chấn": 3, "Tốn": 4, "Càn": 6, "Đoài": 7, "Cấn": 8, "Ly": 9,
};

const DUONG_BAY = [5, 6, 7, 8, 9, 1, 2, 3, 4];

/** Âm dương phái Huyền Không phi tinh (Thẩm thị) của sơn ở vị trí nguyên long pos trong quái số `so`. */
export function laDuongHK(so: number, pos: number): boolean {
  return so === 1 || so === 3 || so === 7 || so === 9 ? pos === 0 : pos !== 0;
}

export function viTriNguyenLong(nl: string): number {
  const i = (NGUYEN_LONG as readonly string[]).indexOf(nl);
  return i < 0 ? 0 : i;
}

/** Sao s nhập trung cung rồi bay; mảng theo số nhà 1..9 (chỉ số 0 là 0). */
export function bay(s: number, thuan: boolean): number[] {
  const ra = new Array<number>(10).fill(0);
  DUONG_BAY.forEach((cung, k) => {
    const d = thuan ? k : -k;
    ra[cung] = ((((s - 1 + d) % 9) + 9) % 9) + 1;
  });
  return ra;
}

export const CACH_HK = {
  vuongSonVuongHuong: "Vượng sơn vượng hướng",
  thuongSonHaThuy: "Thượng sơn hạ thủy",
  songTinhDaoHuong: "Song tinh đáo hướng",
  songTinhDaoToa: "Song tinh đáo tọa",
} as const;

export interface TinhBanHK {
  van: number;
  toa: string;
  huong: string;
  vanBan: number[];
  sonTinh: number[];
  huongTinh: number[];
  cungToa: number;
  cungHuong: number;
  cach: string;
}

/** LapTinhBanHK; ném lỗi khi vận ngoài 1..9 hay không có sơn toạ. */
export function lapTinhBanHK(van: number, toa: string): TinhBanHK {
  if (!Number.isInteger(van) || van < 1 || van > 9) throw new RangeError("vận phải từ 1 tới 9");
  const ds = allSonHuong();
  const i = ds.findIndex((s) => s.ten === toa);
  if (i < 0) throw new RangeError(`không có sơn "${toa}"`);
  const sToa = ds[i];
  const sHuong = ds[(i + 12) % 24];
  const cungToa = SO_NHA_QUAI[sToa.quai];
  const cungHuong = SO_NHA_QUAI[sHuong.quai];
  const vanBan = bay(van, true);
  const chieu = (sao: number, son: SonHuong) => {
    const pos = viTriNguyenLong(son.nguyenLong);
    return sao === 5 ? laDuongHK(SO_NHA_QUAI[son.quai], pos) : laDuongHK(sao, pos);
  };
  const st = vanBan[cungToa];
  const ht = vanBan[cungHuong];
  const sonTinh = bay(st, chieu(st, sToa));
  const huongTinh = bay(ht, chieu(ht, sHuong));
  let sonODau = 0;
  let huongODau = 0;
  for (let c = 1; c <= 9; c++) {
    if (c === 5) continue;
    if (sonTinh[c] === van) sonODau = c;
    if (huongTinh[c] === van) huongODau = c;
  }
  let cach = "";
  if (sonODau === cungToa && huongODau === cungHuong) cach = CACH_HK.vuongSonVuongHuong;
  else if (sonODau === cungHuong && huongODau === cungToa) cach = CACH_HK.thuongSonHaThuy;
  else if (sonODau === cungHuong && huongODau === cungHuong) cach = CACH_HK.songTinhDaoHuong;
  else if (sonODau === cungToa && huongODau === cungToa) cach = CACH_HK.songTinhDaoToa;
  return { van, toa: sToa.ten, huong: sHuong.ten, vanBan, sonTinh, huongTinh, cungToa, cungHuong, cach };
}

export const KHI = { vuong: "Vượng khí", sinh: "Sinh khí", thoai: "Thoái khí", sat: "Sát khí", tu: "Tử khí" } as const;

/** KhiCuaSao: vai của sao trong vận. */
export function khiCuaSao(van: number, sao: number): string {
  switch (mod(sao - van, 9)) {
    case 0:
      return KHI.vuong;
    case 1:
    case 2:
      return KHI.sinh;
    case 8:
      return KHI.thoai;
    case 5:
    case 6:
    case 7:
      return KHI.sat;
    default:
      return KHI.tu;
  }
}

const VONG_TAM_PHUONG = [1, 8, 3, 4, 9, 2, 7, 6];

function cungKe(c: number): [number, number] {
  const i = VONG_TAM_PHUONG.indexOf(c);
  if (i < 0) return [0, 0];
  return [VONG_TAM_PHUONG[(i + 7) % 8], VONG_TAM_PHUONG[(i + 1) % 8]];
}

const hopHaDo = (a: number, b: number) => a % 5 === b % 5 && a !== b;

export interface ThanhMonCung {
  cung: number;
  laChinh: boolean;
  soVanBan: number;
  thuan: boolean;
  saoDen: number;
  dungDuoc: boolean;
}

export interface ThanhMonHK {
  van: number;
  toa: string;
  huong: string;
  cung: ThanhMonCung[];
}

/** ThanhMon: hai cung kề hướng, chính thành môn trước. */
export function thanhMon(van: number, toa: string): ThanhMonHK {
  const tb = lapTinhBanHK(van, toa);
  const sHuong = allSonHuong().find((s) => s.ten === tb.huong) as SonHuong;
  const pos = viTriNguyenLong(sHuong.nguyenLong);
  let [a, b] = cungKe(tb.cungHuong);
  if (hopHaDo(b, tb.cungHuong)) [a, b] = [b, a];
  const tm: ThanhMonHK = { van, toa: tb.toa, huong: tb.huong, cung: [] };
  [a, b].forEach((c, i) => {
    const so = tb.vanBan[c];
    const quai = so === 5 ? c : so;
    const thuan = laDuongHK(quai, pos);
    const den = bay(so, thuan)[c];
    tm.cung.push({ cung: c, laChinh: i === 0 && hopHaDo(c, tb.cungHuong), soVanBan: so, thuan, saoDen: den, dungDuoc: den === van });
  });
  return tm;
}

/** Tên chín sao (chỉ số 0 trống) và hành. */
export const TEN_CUU_TINH = ["", "Nhất Bạch", "Nhị Hắc", "Tam Bích", "Tứ Lục", "Ngũ Hoàng", "Lục Bạch", "Thất Xích", "Bát Bạch", "Cửu Tử"];
export const HANH_CUU_TINH = ["", "Thủy", "Thổ", "Mộc", "Mộc", "Thổ", "Kim", "Kim", "Thổ", "Hỏa"];

/** Quái và phương của chín cung theo số nhà (trung cung không có quái). */
export const CUNG_LAC_THU: readonly (readonly [string, string])[] = [
  ["", ""], ["Khảm", "Bắc"], ["Khôn", "Tây Nam"], ["Chấn", "Đông"], ["Tốn", "Đông Nam"],
  ["", "Trung cung"], ["Càn", "Tây Bắc"], ["Đoài", "Tây"], ["Cấn", "Đông Bắc"], ["Ly", "Nam"],
];

const TAM_NGUYEN: readonly (readonly [string, string, string])[] = [
  ["Thượng nguyên", "Upper Era", "上元"],
  ["Trung nguyên", "Middle Era", "中元"],
  ["Hạ nguyên", "Lower Era", "下元"],
];

export interface VanHK {
  so: number;
  nguyen: string;
  nguyenEn: string;
  nguyenZh: string;
  tuNam: number;
  denNam: number;
  sao: string;
  hanhSao: string;
  chinhThan: number;
  linhThan: number;
}

function floorDiv(a: number, b: number): number {
  return Math.floor(a / b);
}

/** ChinVan: chín vận của chu kỳ ba nguyên chứa năm `nam` (năm tính từ Lập Xuân). */
export function chinVan(nam: number): VanHK[] {
  const goc = NAM_THUONG_NGUYEN + 180 * floorDiv(nam - NAM_THUONG_NGUYEN, 180);
  const out: VanHK[] = [];
  for (let so = 1; so <= 9; so++) {
    const ng = TAM_NGUYEN[Math.trunc((so - 1) / 3)];
    out.push({
      so, nguyen: ng[0], nguyenEn: ng[1], nguyenZh: ng[2],
      tuNam: goc + 20 * (so - 1), denNam: goc + 20 * so - 1,
      sao: TEN_CUU_TINH[so], hanhSao: HANH_CUU_TINH[so],
      chinhThan: so === 5 ? 0 : so, linhThan: so === 5 ? 0 : 10 - so,
    });
  }
  return out;
}

/** VanCuaNam: vận của năm `nam`. */
export function vanCuaNam(nam: number): VanHK {
  return chinVan(nam)[Math.trunc(mod(nam - NAM_THUONG_NGUYEN, 180) / 20)];
}

/** Sao nhập trung cung của năm (2026 Nhất Bạch, mỗi năm lùi một số). */
export function saoNhapTrungNam(nam: number): number {
  const s = mod(1 - (nam - 2026), 9);
  return s === 0 ? 9 : s;
}

export interface PhiTinhNamHK {
  nam: number;
  saoTrung: number;
  sao: number[];
}

/** PhiTinhNam: cửu tinh của năm, luôn bay thuận. */
export function phiTinhNam(nam: number): PhiTinhNamHK {
  const s = saoNhapTrungNam(nam);
  return { nam, saoTrung: s, sao: bay(s, true) };
}

// ── Thước Lỗ Ban (loban.go) ─────────────────────────────────────────────

export interface KichThuocDep {
  mm: number;
  cm: number;
  cung: string;
  cungEn: string;
  cungZh: string;
  cungNho?: string;
  cungNhoZh?: string;
  lechMm?: number;
}

export interface KetQuaLoBan {
  kichThuocMm: number;
  loaiThuoc: string;
  tenThuoc: string;
  tenThuocEn: string;
  tenThuocZh: string;
  dungDe: string;
  dungDeEn: string;
  dungDeZh: string;
  chuKyThu: number;
  viTriMm: number;
  cung: string;
  cungEn: string;
  cungZh: string;
  cungHan: string;
  tot: boolean;
  nghia: string;
  nghiaEn: string;
  nghiaZh: string;
  cungNho?: string;
  cungNhoZh?: string;
  ganNhatTot?: KichThuocDep[];
}

/** Bảng thước theo mã của lõi ("THONG_THUY", "DUONG_TRACH", "AM_PHAN"). */
export function bangThuoc(loai: string): BangThuoc | undefined {
  return BANG_THUOC.find((b) => b.loai === loai);
}

export function mod64(a: number, m: number): number {
  let r = a - m * Math.trunc(a / m);
  if (r < 0) r += m;
  return r;
}

export function lamTron1(v: number): number {
  return Math.trunc(v * 10 + 0.5) / 10;
}

function lamTron2(v: number): number {
  return Math.trunc(v * 100 + 0.5) / 100;
}

/** Chỉ số cung lớn, chỉ số cung nhỏ (-1 khi thước không có cung nhỏ) tại một vị trí. */
export function cungTaiViTri(b: BangThuoc, viTri: number): [number, number] {
  const dai = b.doDaiMm / b.cung.length;
  let idx = Math.trunc(viTri / dai);
  if (idx >= b.cung.length) idx = b.cung.length - 1;
  const nho = b.cung[idx][8];
  if (nho.length === 0) return [idx, -1];
  const daiNho = dai / nho.length;
  let j = Math.trunc((viTri - idx * dai) / daiNho);
  if (j >= nho.length) j = nho.length - 1;
  return [idx, j];
}

function dep(b: BangThuoc, mm: number, lech: number | null): KichThuocDep {
  const [idx, j] = cungTaiViTri(b, mod64(mm, b.doDaiMm));
  const c = b.cung[idx];
  const k: KichThuocDep = { mm, cm: lamTron1(mm / 10), cung: c[0], cungEn: c[2], cungZh: c[3] };
  if (j >= 0) {
    k.cungNho = c[8][j];
    k.cungNhoZh = c[9][j];
  }
  if (lech !== null) k.lechMm = lech;
  return k;
}

function ganNhatTot(goc: number, b: BangThuoc): KichThuocDep[] {
  const ra: KichThuocDep[] = [];
  const chuKy = Math.trunc(b.doDaiMm) + 1;
  for (let d = 1; d <= chuKy; d++) {
    const mm = goc - d;
    if (mm <= 0) break;
    if (b.cung[cungTaiViTri(b, mod64(mm, b.doDaiMm))[0]][4]) {
      ra.push(dep(b, mm, -d));
      break;
    }
  }
  for (let d = 1; d <= chuKy; d++) {
    const mm = goc + d;
    if (b.cung[cungTaiViTri(b, mod64(mm, b.doDaiMm))[0]][4]) {
      ra.push(dep(b, mm, d));
      break;
    }
  }
  return ra;
}

/** TraLoBan: tra một kích thước (mm) trên một thước. */
export function traLoBan(kichThuocMm: number, loai: string): KetQuaLoBan {
  const b = bangThuoc(loai);
  const rong: KetQuaLoBan = {
    kichThuocMm, loaiThuoc: loai, tenThuoc: "", tenThuocEn: "", tenThuocZh: "", dungDe: "", dungDeEn: "", dungDeZh: "",
    chuKyThu: 0, viTriMm: 0, cung: "", cungEn: "", cungZh: "", cungHan: "", tot: false, nghia: "", nghiaEn: "", nghiaZh: "",
  };
  if (!b || !(kichThuocMm > 0)) return rong;
  const viTri = mod64(kichThuocMm, b.doDaiMm);
  const [idx, j] = cungTaiViTri(b, viTri);
  const c = b.cung[idx];
  const kq: KetQuaLoBan = {
    ...rong,
    tenThuoc: b.ten, tenThuocEn: b.tenEn, tenThuocZh: b.tenZh, dungDe: b.dungDe, dungDeEn: b.dungDeEn, dungDeZh: b.dungDeZh,
    chuKyThu: Math.trunc(kichThuocMm / b.doDaiMm) + 1, viTriMm: lamTron1(viTri),
    cung: c[0], cungEn: c[2], cungZh: c[3], cungHan: c[1], tot: c[4], nghia: c[5], nghiaEn: c[6], nghiaZh: c[7],
  };
  if (j >= 0) {
    kq.cungNho = c[8][j];
    kq.cungNhoZh = c[9][j];
  }
  if (!c[4]) {
    const g = ganNhatTot(kichThuocMm, b);
    if (g.length) kq.ganNhatTot = g;
  }
  return kq;
}

/** CacLoaiThuoc: mô tả ba thước. */
export function cacLoaiThuoc(): Record<string, unknown>[] {
  return BANG_THUOC.map((b) => ({
    loai: b.loai, ten: b.ten, tenEn: b.tenEn, tenZh: b.tenZh, doDaiMm: b.doDaiMm,
    dungDe: b.dungDe, dungDeEn: b.dungDeEn, dungDeZh: b.dungDeZh,
    soCung: b.cung.length, daiMoiCungMm: lamTron2(b.doDaiMm / b.cung.length),
    cung: b.cung.map((c) => {
      const m: Record<string, unknown> = {
        ten: c[0], tenEn: c[2], tenZh: c[3], tenHan: c[1], tot: c[4], nghia: c[5], nghiaEn: c[6], nghiaZh: c[7], cungNho: [...c[8]],
      };
      if (c[8].length) m.cungNhoZh = [...c[9]];
      return m;
    }),
  }));
}

/** CacTenCungNho: tên ba thứ tiếng của mọi cung nhỏ, theo thứ tự xuất hiện trên ba thước, mỗi tên một lần. */
export function cacTenCungNho(): { ten: string; binhAm: string; tenEn: string; tenZh: string }[] {
  const ra: { ten: string; binhAm: string; tenEn: string; tenZh: string }[] = [];
  const daCo = new Set<string>();
  for (const b of BANG_THUOC) {
    for (const c of b.cung) {
      c[8].forEach((n, j) => {
        if (daCo.has(n)) return;
        daCo.add(n);
        const t = TEN_CUNG_NHO[n];
        if (!t) throw new Error("missing sub-sector name: " + n);
        ra.push({ ten: n, binhAm: t[0], tenEn: t[1], tenZh: c[9][j] });
      });
    }
  }
  return ra;
}
