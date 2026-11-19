// 24 tiết khí: mốc chia năm theo kinh độ biểu kiến của Mặt Trời. Chuyển
// ngữ từ lÃµi tÃ­nh Go cá»§a Nháº­t Nguyá»t tietkhi.go.
//
// Kinh độ biểu kiến của Mặt Trời ở mat-troi.ts: VSOP87D rút gọn theo cách
// tính của Jean Meeus, cộng FK5, chương động IAU 1980, quang sai và ΔT của
// Espenak và Meeus (NASA 2006). Bộ đổi âm lịch (lich.ts) giữ sunLongitude
// rút gọn của thuật toán Hồ Ngọc Đức, không dùng hàm ở đây.

import { jdFromDate, jdToDate, TIME_ZONE_VN } from "./lich.ts";
import type { SolarDate } from "./lich.ts";
import { kinhDoMatTroiUT, QUANG_SAI_K_GIAY } from "./mat-troi.ts";

export { chuongDongKinhDoGiay, deltaTGiay, kinhDoBieuKienTT, kinhDoMatTroiUT, namThapPhan } from "./mat-troi.ts";

/** Một trong 24 tiết khí. */
export interface TietKhi {
  /** 0 tới 23 theo kinh độ: index = kinhDo / 15; 0 là Xuân Phân, Lập Xuân là 21. */
  index: number;
  /** Kinh độ Mặt Trời (độ) lúc tiết khí bắt đầu. */
  kinhDo: number;
  ten: string;
  tenEn: string;
  yNghia: string;
  yNghiaEn: string;
  yNghiaZh: string;
  /** Đúng với 12 "tiết" (mốc đổi trụ tháng Bát Tự), sai với 12 "khí". */
  laTiet: boolean;
}

type Dong = readonly [string, string, string, string, string];

// Xếp theo index kinh độ (0 là Xuân Phân). Tiết và khí xen kẽ: index lẻ là tiết.
const DU_LIEU: readonly Dong[] = [
  ["Xuân Phân", "Vernal Equinox", "Ngày và đêm dài bằng nhau, mặt trời qua xích đạo lên bắc bán cầu", "Day and night are equal as the sun crosses the equator northward", "太阳北越赤道，昼夜等长"],
  ["Thanh Minh", "Clear and Bright", "Trời quang, tiết đi tảo mộ của người Việt", "Clear skies; the traditional Vietnamese grave-tending season", "天气晴朗；越南传统的扫墓时节"],
  ["Cốc Vũ", "Grain Rain", "Mưa rào nuôi ngũ cốc mới gieo", "Rains that nourish newly sown grain", "滋养新播谷物的雨水"],
  ["Lập Hạ", "Start of Summer", "Bắt đầu mùa hè", "Summer begins", "立夏"],
  ["Tiểu Mãn", "Grain Buds", "Hạt ngũ cốc bắt đầu mẩy nhưng chưa chín", "Grain begins to fill out but is not yet ripe", "谷粒渐满尚未成熟"],
  ["Mang Chủng", "Grain in Ear", "Lúa trổ bông, vào vụ gặt chiêm", "Grain forms ears; harvest season opens", "谷穗抽齐，收获季开启"],
  ["Hạ Chí", "Summer Solstice", "Ngày dài nhất năm ở bắc bán cầu", "Longest day of the year in the northern hemisphere", "北半球一年中白昼最长的一天"],
  ["Tiểu Thử", "Minor Heat", "Bắt đầu nóng nhưng chưa gay gắt nhất", "Heat sets in but has not yet peaked", "暑气渐起，尚未到顶"],
  ["Đại Thử", "Major Heat", "Thời điểm nóng nhất trong năm", "The hottest stretch of the year", "一年中最热的时段"],
  ["Lập Thu", "Start of Autumn", "Bắt đầu mùa thu", "Autumn begins", "立秋"],
  ["Xử Thử", "End of Heat", "Cái nóng lui dần", "The heat recedes", "暑气渐退"],
  ["Bạch Lộ", "White Dew", "Sương trắng đọng buổi sớm, trời se lạnh", "White dew gathers at dawn as the air cools", "清晨气温转凉，白露凝结"],
  ["Thu Phân", "Autumnal Equinox", "Ngày và đêm dài bằng nhau, mặt trời qua xích đạo xuống nam bán cầu", "Day and night are equal as the sun crosses the equator southward", "太阳南越赤道，昼夜等长"],
  ["Hàn Lộ", "Cold Dew", "Sương lạnh, rét bắt đầu rõ", "Cold dew; the chill becomes noticeable", "寒露；寒意渐显"],
  ["Sương Giáng", "Frost Descent", "Sương muối xuất hiện ở vùng cao", "Frost appears in the highlands", "高地出现霜冻"],
  ["Lập Đông", "Start of Winter", "Bắt đầu mùa đông", "Winter begins", "立冬"],
  ["Tiểu Tuyết", "Minor Snow", "Bắt đầu có tuyết ở phương bắc", "First snows in the north", "北方初雪"],
  ["Đại Tuyết", "Major Snow", "Tuyết rơi dày ở phương bắc", "Heavy snowfall in the north", "北方大雪"],
  ["Đông Chí", "Winter Solstice", "Ngày ngắn nhất năm ở bắc bán cầu", "Shortest day of the year in the northern hemisphere", "北半球一年中白昼最短的一天"],
  ["Tiểu Hàn", "Minor Cold", "Bắt đầu rét đậm", "Deep cold sets in", "严寒来临"],
  ["Đại Hàn", "Major Cold", "Thời điểm rét nhất trong năm", "The coldest stretch of the year", "一年中最冷的一段"],
  ["Lập Xuân", "Start of Spring", "Bắt đầu mùa xuân, cũng là mốc sang năm mới trong Tứ Trụ", "Spring begins; also the year boundary in Four Pillars astrology", "立春；也是八字命理中一年的分界"],
  ["Vũ Thủy", "Rain Water", "Mưa xuân thay cho tuyết, băng tan", "Spring rain replaces snow as ice melts", "春雨取代雪，冰开始融化"],
  ["Kinh Trập", "Awakening of Insects", "Sâu bọ tỉnh giấc sau mùa đông", "Hibernating insects stir after winter", "冬眠昆虫惊蛰"],
];

/** Bảng 24 tiết khí xếp theo index kinh độ (0 là Xuân Phân). */
export const TIET_KHI_TABLE: readonly TietKhi[] = DU_LIEU.map(([ten, tenEn, yNghia, yNghiaEn, yNghiaZh], i) => ({
  index: i,
  kinhDo: i * 15,
  ten,
  tenEn,
  yNghia,
  yNghiaEn,
  yNghiaZh,
  laTiet: i % 2 === 1,
}));

function banSao(tk: TietKhi): TietKhi {
  return { ...tk };
}

/** 24 tiết khí theo thứ tự lịch, bắt đầu từ Lập Xuân. */
export function allTietKhi(): TietKhi[] {
  const out: TietKhi[] = [];
  for (let i = 0; i < 24; i++) out.push(banSao(TIET_KHI_TABLE[(21 + i) % 24]));
  return out;
}

/** Hệ số quang sai (độ): -20,4898 giây cung; quang sai thật là hệ số này chia khoảng cách Mặt Trời R. */
export const QUANG_SAI_DO = QUANG_SAI_K_GIAY / 3600;
/**
 * Số hạng chính của chương động theo kinh độ (độ, nhân sin Ω).
 * @deprecated Không còn dùng: từ lõi tính 2.0.1 chương động tính đủ 63 số
 * hạng IAU 1980 (chuongDongKinhDoGiay).
 */
export const CHUONG_DONG_HE_SO_DO = -0.00478;

/**
 * Kinh độ biểu kiến của Mặt Trời (độ, 0 tới 360) tại một thời điểm giờ địa
 * phương; `gioLocal` là giờ thập phân 0 tới 24 (13h30 là 13.5).
 */
export function kinhDoMatTroi(dd: number, mm: number, yy: number, gioLocal: number, timeZone: number = TIME_ZONE_VN): number {
  const jdUT = jdFromDate(dd, mm, yy) - 0.5 + gioLocal / 24 - timeZone / 24;
  return kinhDoMatTroiUT(jdUT);
}

/** Tiết khí ĐANG diễn ra tại một thời điểm giờ Việt Nam. */
export function tietKhiTaiThoiDiem(dd: number, mm: number, yy: number, gioLocal: number): TietKhi {
  const deg = kinhDoMatTroi(dd, mm, yy, gioLocal, TIME_ZONE_VN);
  return banSao(TIET_KHI_TABLE[Math.floor(deg / 15) % 24]);
}

/** Tiết khí của một ngày, xét lúc 12h trưa giờ Việt Nam. */
export function tietKhiCuaNgay(dd: number, mm: number, yy: number): TietKhi {
  return tietKhiTaiThoiDiem(dd, mm, yy, 12);
}

/** Mốc kinh độ `moc` có nằm trong nửa khoảng [dauNgay, dauNgaySau) không, xét cả chỗ quay vòng 360 về 0. */
function mocRoiVaoNgay(dauNgay: number, dauNgaySau: number, moc: number): boolean {
  if (dauNgaySau < dauNgay) return moc >= dauNgay || moc < dauNgaySau;
  return moc >= dauNgay && moc < dauNgaySau;
}

/**
 * NGÀY dương lịch mà một tiết khí bắt đầu trong năm dương cho trước: quét
 * từng ngày quanh ngày trung bình, tìm ngày mà mốc kinh độ rơi vào giữa 0h
 * đầu ngày và 0h ngày kế tiếp (giờ Việt Nam).
 */
export function ngayBatDauTietKhi(tk: TietKhi, namDuongLich: number): SolarDate {
  const jdXuanPhan = jdFromDate(20, 3, namDuongLich);
  let offset = (tk.index * 365.2422) / 24;
  // Tiểu Hàn tới Kinh Trập (index 19 tới 23) rơi trước Xuân Phân trong cùng năm dương.
  if (tk.index >= 19) offset -= 365.2422;
  const guess = jdXuanPhan + offset;
  const start = Math.trunc(guess) - 20;
  // Kinh độ lúc 0h giờ Việt Nam của ngày số Julius jd; mỗi ngày tính một lần.
  const dauNgay = (jd: number): number => kinhDoMatTroiUT(jd - 0.5 - TIME_ZONE_VN / 24);
  let dau = dauNgay(start);
  for (let jd = start; jd <= start + 40; jd++) {
    const dauSau = dauNgay(jd + 1);
    if (mocRoiVaoNgay(dau, dauSau, tk.kinhDo)) return jdToDate(jd);
    dau = dauSau;
  }
  return jdToDate(Math.trunc(guess));
}

/** Một tiết khí kèm ngày dương nó bắt đầu. */
export interface TietKhiTrongNam extends TietKhi {
  ngay: SolarDate;
}

function jdCuaNgay(n: SolarDate): number {
  return jdFromDate(n.day, n.month, n.year);
}

/** 24 tiết khí rơi vào một năm dương, xếp theo thời gian (Tiểu Hàn đứng đầu). */
export function lichTietKhiNam(namDuongLich: number): TietKhiTrongNam[] {
  const out: TietKhiTrongNam[] = TIET_KHI_TABLE.map((tk) => ({ ...tk, ngay: ngayBatDauTietKhi(tk, namDuongLich) }));
  out.sort((a, b) => jdCuaNgay(a.ngay) - jdCuaNgay(b.ngay));
  return out;
}

/** Mốc bắt đầu một tiết khí, chính xác tới phút, giờ Việt Nam. */
export interface ThoiDiemTietKhi extends TietKhi {
  ngay: SolarDate;
  /** 0 tới 23. */
  gio: number;
  /** 0 tới 59. */
  phut: number;
}

/** Làm tròn nửa xa số 0, như math.Round của Go. */
function lamTron(x: number): number {
  const t = Math.trunc(x);
  return Math.abs(x - t) >= 0.5 ? t + Math.sign(x) : t;
}

/** Phép lặp dừng khi bước hiệu chỉnh còn dưới ngưỡng này (phút), rồi làm tròn tới phút. */
const NGUONG_DUNG_GIAI_PHUT = 0.001;
/** Tốc độ trung bình của kinh độ Mặt Trời (độ mỗi ngày), đạo hàm cố định của phép lặp Newton. */
const TOC_DO_TRUNG_BINH_DO_NGAY = 360 / 365.2422;

// Đệm theo (năm, kinh độ): hàm thuần, Bát Tự và Quái khí gọi lại nhiều lần.
const DEM_MOC_TIET = new Map<string, ThoiDiemTietKhi>();

/**
 * Thời điểm kinh độ Mặt Trời chạm mốc của tiết khí trong năm dương cho
 * trước, giải bằng lặp Newton (đạo hàm là tốc độ trung bình) tới dưới 0,06
 * giây, làm tròn tới phút giờ Việt Nam; mốc trong nửa phút cuối của một ngày
 * ghi 23:59 của ngày ấy.
 */
export function mocTietKhi(tk: TietKhi, namDuongLich: number): ThoiDiemTietKhi {
  const khoa = `${namDuongLich}/${tk.kinhDo}`;
  let m = DEM_MOC_TIET.get(khoa);
  if (!m) {
    m = tinhMocTietKhi(tk, namDuongLich);
    DEM_MOC_TIET.set(khoa, m);
  }
  return { ...tk, ngay: { ...m.ngay }, gio: m.gio, phut: m.phut };
}

function tinhMocTietKhi(tk: TietKhi, namDuongLich: number): ThoiDiemTietKhi {
  const muc = tk.kinhDo;
  // jd là ngày Julius theo giờ Việt Nam; chênh lệch có dấu đưa về [-180, 180).
  const lech = (jd: number): number => {
    let d = kinhDoMatTroiUT(jd - TIME_ZONE_VN / 24) - muc;
    while (d >= 180) d -= 360;
    while (d < -180) d += 360;
    return d;
  };

  let jd = jdFromDate(20, 3, namDuongLich) + (tk.index * 365.2422) / 24;
  if (tk.index >= 19) jd -= 365.2422;
  for (let i = 0; i < 30; i++) {
    const buoc = lech(jd) / TOC_DO_TRUNG_BINH_DO_NGAY;
    jd -= buoc;
    if (Math.abs(buoc) * 1440 < NGUONG_DUNG_GIAI_PHUT) break;
  }

  const ngayJD = Math.floor(jd + 0.5);
  const sd = jdToDate(ngayJD);
  let phutTrongNgay = Math.trunc(lamTron((jd + 0.5 - ngayJD) * 1440));
  if (phutTrongNgay > 1439) phutTrongNgay = 1439;
  return { ...tk, ngay: sd, gio: Math.trunc(phutTrongNgay / 60), phut: phutTrongNgay % 60 };
}

function thuTuMoc(a: ThoiDiemTietKhi, b: ThoiDiemTietKhi): number {
  const ja = jdCuaNgay(a.ngay);
  const jb = jdCuaNgay(b.ngay);
  if (ja !== jb) return ja - jb;
  return a.gio * 60 + a.phut - (b.gio * 60 + b.phut);
}

/** 24 mốc tiết khí của một năm dương, xếp theo thời gian thật. */
export function mocTietKhiTrongNam(namDuongLich: number): ThoiDiemTietKhi[] {
  const ra = allTietKhi().map((tk) => mocTietKhi(tk, namDuongLich));
  ra.sort(thuTuMoc);
  return ra;
}

// Đệm theo năm: phép dò 24 mốc là hàm thuần, mocTietKhiQuanhNgay gọi lại nhiều lần.
const DEM_MOC = new Map<number, readonly ThoiDiemTietKhi[]>();

function mocNamDem(nam: number): readonly ThoiDiemTietKhi[] {
  let ds = DEM_MOC.get(nam);
  if (!ds) {
    ds = mocTietKhiTrongNam(nam);
    DEM_MOC.set(nam, ds);
  }
  return ds;
}

/**
 * Hai mốc giao tiết quanh một ngày dương (giờ Việt Nam): `dangChua` là mốc
 * gần nhất có NGÀY không sau ngày hỏi, `keTiep` là mốc sớm nhất có ngày sau
 * ngày hỏi. Xét theo ngày: ngày giao tiết thuộc tiết mới dù mốc rơi buổi chiều.
 */
export function mocTietKhiQuanhNgay(dd: number, mm: number, yy: number): { dangChua: ThoiDiemTietKhi; keTiep: ThoiDiemTietKhi } {
  const jd = jdFromDate(dd, mm, yy);
  const ds = mocNamDem(yy);
  let iTruoc = -1;
  let iSau = -1;
  ds.forEach((m, i) => {
    if (jdCuaNgay(m.ngay) <= jd) iTruoc = i;
    else if (iSau < 0) iSau = i;
  });
  let dangChua: ThoiDiemTietKhi;
  if (iTruoc >= 0) {
    dangChua = ds[iTruoc];
  } else {
    const truoc = mocNamDem(yy - 1);
    dangChua = truoc[truoc.length - 1];
  }
  const keTiep = iSau >= 0 ? ds[iSau] : mocNamDem(yy + 1)[0];
  return { dangChua: { ...dangChua, ngay: { ...dangChua.ngay } }, keTiep: { ...keTiep, ngay: { ...keTiep.ngay } } };
}
