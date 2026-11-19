// Lá số Bát Tự (Tứ Trụ) đầy đủ: bốn trụ kèm tàng can, thập thần, nạp âm,
// trường sinh, thần sát, thai nguyên, mệnh cung, đại vận. Chuyển ngữ từ
// lõi tính Go của Nhật Nguyệt battu.go (phần lập bốn trụ) và
// battu_laso.go.
//
// Ba quy ước bản Go chọn và nói rõ:
//  1. Trụ THÁNG theo TIẾT KHÍ (kinh độ Mặt Trời), không theo tháng âm lịch.
//  2. Trụ NĂM đổi tại LẬP XUÂN (315 độ), không tại mùng 1 Tết.
//  3. Trụ NGÀY đổi lúc 23h00 (đầu giờ Tý), không tách Tý sớm, Tý muộn.
// Giờ sinh đọc theo giờ Việt Nam UTC+7.
//
// Các chuỗi diễn giải dài của bản Go (cachTinh, quyUoc, ghiChuGioTy) không
// sinh ở gói này; phần luận ngũ hành, dụng thần của LapBatTu cũng không, vì
// lá số không mang chúng. Câu `lyDo` của đại vận thì có, đủ ba thứ tiếng.

import {
  CAN_NGU_HANH,
  DIA_CHI,
  THIEN_CAN,
  TIME_ZONE_VN,
  canGioDau,
  canThangDan,
  chiGioTuGioDongHo,
  chiSoCan,
  chiSoChi,
  chiToNguHanh,
  dayCanChi,
  jdFromDate,
  jdToDate,
  kinhDoMatTroi,
  mocTietKhiTrongNam,
  mod,
  nguHanhNapAm,
  tietKhiTaiThoiDiem,
  yearCanChi,
} from "./am-lich.ts";
import type { SolarDate, ThoiDiemTietKhi } from "./am-lich.ts";
import { thapThanCuaCan } from "./thap-than.ts";
import { enCua, tangCanCuaChi, tietKhiBaThu, truongSinhBaThu, truongSinhCuaCan, zhCua } from "./tang-can.ts";
import type { TangCan } from "./tang-can.ts";
import { tinhThanSat } from "./than-sat.ts";
import type { ThanSatBatTu } from "./than-sat.ts";

/** Một trụ can chi kèm ngũ hành và nạp âm. */
export interface Tru {
  can: string;
  /** Chữ Hán của can; bản Anh giữ tên can tiếng Việt. */
  canZh: string;
  chi: string;
  chiZh: string;
  label: string;
  /** Ví dụ 丙午. */
  labelZh: string;
  canHanh: string;
  canHanhEn: string;
  canHanhZh: string;
  chiHanh: string;
  chiHanhEn: string;
  chiHanhZh: string;
  /** Đúng khi can là can Âm. */
  canAm: boolean;
  /** Hành nạp âm của cặp, ví dụ "Kim". */
  napAm: string;
  napAmEn: string;
  napAmZh: string;
  napAmTen: string;
  /** Ví dụ "Gold in the Sea". */
  napAmTenEn: string;
  /** Ví dụ 海中金. */
  napAmTenZh: string;
}

/** Dựng trụ từ hai chỉ số (tự đưa về vòng): can 0 Giáp, chi 0 Tý. */
export function truTuChiSo(canIdx: number, chiIdx: number): Tru {
  const ci = mod(canIdx, 10);
  const hi = mod(chiIdx, 12);
  const can = THIEN_CAN[ci];
  const chi = DIA_CHI[hi];
  const na = nguHanhNapAm(ci, hi);
  const canHanh = CAN_NGU_HANH[ci];
  const chiHanh = chiToNguHanh(chi).hanh;
  return {
    can,
    canZh: zhCua(can),
    chi,
    chiZh: zhCua(chi),
    label: can + " " + chi,
    labelZh: zhCua(can + " " + chi),
    canHanh,
    canHanhEn: enCua(canHanh),
    canHanhZh: zhCua(canHanh),
    chiHanh,
    chiHanhEn: enCua(chiHanh),
    chiHanhZh: zhCua(chiHanh),
    canAm: ci % 2 === 1,
    napAm: na.hanh,
    napAmEn: enCua(na.hanh),
    napAmZh: zhCua(na.hanh),
    napAmTen: na.ten,
    napAmTenEn: enCua(na.ten),
    napAmTenZh: zhCua(na.ten),
  };
}

/** Một trụ của lá số kèm mọi thứ đọc được từ nó. */
export interface TruLaSo extends Tru {
  /** Vai của can trụ so với nhật chủ; ở trụ ngày là "Nhật chủ". */
  thapThanCan: string;
  thapThanCanEn: string;
  thapThanCanZh: string;
  tangCan: TangCan[];
  /** Giai đoạn của NHẬT CHỦ tại chi trụ này. */
  truongSinh: string;
  truongSinhEn: string;
  truongSinhZh: string;
  /** Giai đoạn của CAN TRỤ tại chính chi của trụ ấy (tự toạ). */
  tuToa: string;
  tuToaEn: string;
  tuToaZh: string;
  /** Tên các sao trên trụ; ba mảng cùng thứ tự. */
  thanSat: string[];
  thanSatEn: string[];
  thanSatZh: string[];
}

/** Một đại vận mười năm. */
export interface VanBatTu extends Tru {
  /** 1 tới 10. */
  thuTu: number;
  thapThanCan: string;
  thapThanCanEn: string;
  thapThanCanZh: string;
  /** Nhật chủ tại chi của vận. */
  truongSinh: string;
  truongSinhEn: string;
  truongSinhZh: string;
  /** Tuổi thực lúc vào vận. */
  tuoiTu: number;
  /** Năm dương lịch vào vận. */
  namTu: number;
  /** Năm dương lịch cuối vận. */
  namDen: number;
}

/** Mười đại vận và cách tính tuổi khởi vận. */
export interface DaiVanBatTu {
  thuan: boolean;
  /** Tiết dùng để đếm ngày: tiết kế tiếp nếu đi thuận, tiết vừa qua nếu đi nghịch. */
  tietMoc: string;
  /** Rỗng cùng tietMoc. */
  tietMocEn: string;
  tietMocZh: string;
  tietMocNgay: SolarDate;
  tietMocGio: number;
  tietMocPhut: number;
  soNgay: number;
  tuoiKhoiNam: number;
  tuoiKhoiThang: number;
  ngayKhoiVan: SolarDate;
  cacVan: VanBatTu[];
  lyDo: string;
  lyDoEn: string;
  lyDoZh: string;
}

/** Lá số Tứ Trụ đầy đủ. Khoá theo đúng JSON của bản Go. */
export interface LaSoBatTu {
  ngaySinh: SolarDate;
  coGioSinh: boolean;
  /** Giờ đã dùng (12 khi chưa biết giờ sinh). */
  gio: number;
  phut: number;
  gioiTinh: string;
  truNam: TruLaSo;
  truThang: TruLaSo;
  truNgay: TruLaSo;
  /** Vắng khi chưa biết giờ sinh. */
  truGio?: TruLaSo;
  nhatChu: string;
  nhatChuZh: string;
  nhatChuHanh: string;
  nhatChuHanhEn: string;
  nhatChuHanhZh: string;
  /** "Dương" hay "Âm". */
  nhatChuAmDuong: string;
  nhatChuAmDuongEn: string;
  nhatChuAmDuongZh: string;
  /** Tiết khí đang diễn ra lúc sinh (có thể là một khí). */
  tietKhi: string;
  tietKhiEn: string;
  tietKhiZh: string;
  /** Tiết mở đầu tháng sinh, tức mốc đổi trụ tháng gần nhất trước lúc sinh. */
  tietDauThang: string;
  tietDauThangEn: string;
  tietDauThangZh: string;
  /** Năm dương lịch mà trụ năm lấy theo (khác năm sinh khi sinh trước Lập Xuân). */
  namTruNam: number;
  thaiNguyen: Tru;
  /** Vắng khi chưa biết giờ sinh. */
  menhCung?: Tru;
  thanSat: ThanSatBatTu[];
  daiVan: DaiVanBatTu;
  /** School options used, only those that differ from the default (see `BaZiSchools`). */
  schools?: BaZiSchools;
}

/**
 * When the day pillar of a birth between 23:00 and 24:00 changes.
 * - "next-day-from-23" (default): at 23:00, the start of the Zi (Tý) hour, as
 *   most Zi Ping texts: the birth takes the next day's pillar.
 * - "split-at-midnight": early and late Zi; the day pillar changes at
 *   midnight, so the birth keeps the day pillar of the date entered, and the
 *   hour pillar is the Zi hour of the next day (as lunar-javascript's
 *   EightChar default, sect 2).
 */
export type ZiHourRule = "next-day-from-23" | "split-at-midnight";

/** School options of a BaZi chart. Omitted keys take the default. */
export interface BaZiSchools {
  ziHour?: ZiHourRule;
}

/** Accepted values of each option, the default first. */
export const BAZI_SCHOOL_VALUES = { ziHour: ["next-day-from-23", "split-at-midnight"] } as const;

/** Bỏ giá trị mặc định, ném lỗi giá trị lạ (như bản Go); undefined khi mặc định. */
export function normalizeBaZiSchools(o: unknown): BaZiSchools | undefined {
  if (o === undefined || o === null) return undefined;
  if (typeof o !== "object" || Array.isArray(o)) throw new TypeError("schools must be an object");
  for (const k of Object.keys(o)) {
    if (k !== "ziHour") throw new RangeError(`unknown school option ${JSON.stringify(k)}; use ziHour`);
  }
  const v = (o as Record<string, unknown>).ziHour;
  if (v === undefined || v === null || v === "") return undefined;
  const hopLe: readonly string[] = BAZI_SCHOOL_VALUES.ziHour;
  if (typeof v !== "string" || !hopLe.includes(v)) {
    throw new RangeError(`invalid ziHour ${JSON.stringify(v)}, expected one of: ${hopLe.join(", ")}`);
  }
  return v === hopLe[0] ? undefined : { ziHour: v as ZiHourRule };
}

/** Nhãn thay cho thập thần ở can ngày. */
export const NHAT_CHU_LABEL = "Nhật chủ";

/** Lỗi khi không nhận ra giới tính: đại vận thuận nghịch tuỳ giới tính, nên không đoán. */
export class LoiThieuGioiTinh extends Error {
  constructor() {
    super("thiếu giới tính");
    this.name = "LoiThieuGioiTinh";
  }
}

/** Câu báo lỗi ba thứ tiếng cho người dùng. */
export const LOI_THIEU_GIOI_TINH = {
  vi: "Cần chọn giới tính: đại vận đi thuận hay nghịch tuỳ giới tính và âm dương của can năm, nên thiếu nó thì không lập được lá số.",
  en: "Please choose a gender: the luck pillars run forward or backward depending on gender and the yin or yang of the year stem, so the chart cannot be cast without it.",
  zh: "请选择性别：大运顺排或逆排取决于性别与年干阴阳，缺少性别就无法排盘。",
} as const;

/** Nhận các cách viết giới tính phổ biến; trả "" khi không nhận ra. */
export function chuanHoaGioiTinh(s: string): "Nam" | "Nữ" | "" {
  switch (s) {
    case "Nam":
    case "nam":
    case "male":
    case "m":
    case "M":
      return "Nam";
    case "Nữ":
    case "nữ":
    case "Nu":
    case "nu":
    case "female":
    case "f":
    case "F":
      return "Nữ";
  }
  return "";
}

/** Bốn trụ và tiết khí lúc sinh (phần lập trụ của LapBatTu bản Go). */
export interface TuTru {
  truNam: Tru;
  truThang: Tru;
  truNgay: Tru;
  truGio: Tru;
  /** Tên tiết khí đang diễn ra lúc sinh. */
  tietKhi: string;
  namTruNam: number;
}

/**
 * Lập bốn trụ từ ngày giờ sinh DƯƠNG LỊCH giờ Việt Nam. `gioSinh` 0 tới 23
 * (ngoài khoảng thì lấy 12), `phut` 0 tới 59 (ngoài khoảng thì lấy 0).
 */
export function lapTuTru(dd: number, mm: number, yyyy: number, gioSinh: number, phut: number, nuaDem = false): TuTru {
  if (gioSinh < 0 || gioSinh > 23) gioSinh = 12;
  if (phut < 0 || phut > 59) phut = 0;
  const gioThapPhan = gioSinh + phut / 60;

  // Trụ NGÀY đổi lúc 23h: sinh từ 23h00 trở đi lấy can chi ngày hôm sau.
  let jdNgay = jdFromDate(dd, mm, yyyy);
  if (gioSinh >= 23) jdNgay++;
  const dNgay = jdToDate(jdNgay);
  const ccNgay = dayCanChi(dNgay.day, dNgay.month, dNgay.year);
  let canNgayIdx = chiSoCan(ccNgay.can);
  let chiNgayIdx = chiSoChi(ccNgay.chi);
  // Can giờ suy từ can của ngày mà giờ Tý ấy mở đầu; lựa chọn "split-at-midnight"
  // (nuaDem) chỉ giữ trụ NGÀY ở ngày đã nhập.
  const canNgayChoGio = canNgayIdx;
  if (nuaDem && gioSinh >= 23) {
    const cc = dayCanChi(dd, mm, yyyy);
    canNgayIdx = chiSoCan(cc.can);
    chiNgayIdx = chiSoChi(cc.chi);
  }

  // Trụ NĂM và trụ THÁNG theo kinh độ Mặt Trời.
  const deg = kinhDoMatTroi(dd, mm, yyyy, gioThapPhan, TIME_ZONE_VN);
  let namTruNam = yyyy;
  if (mm <= 2 && deg < 315) namTruNam = yyyy - 1; // chưa tới Lập Xuân
  const ccNam = yearCanChi(namTruNam);
  const canNamIdx = chiSoCan(ccNam.can);
  const chiNamIdx = chiSoChi(ccNam.chi);

  // Thứ tự tháng tính từ Lập Xuân: 0 là tháng Dần, 1 là Mão...
  const thuTuThang = Math.trunc((Math.trunc(deg - 315 + 360) % 360) / 30);
  const chiThangIdx = (thuTuThang + 2) % 12;
  const canThangIdx = (canThangDan(canNamIdx) + thuTuThang) % 10;

  const chiGioIdx = chiGioTuGioDongHo(gioSinh);
  const canGioIdx = (canGioDau(canNgayChoGio) + chiGioIdx) % 10;

  return {
    truNam: truTuChiSo(canNamIdx, chiNamIdx),
    truThang: truTuChiSo(canThangIdx, chiThangIdx),
    truNgay: truTuChiSo(canNgayIdx, chiNgayIdx),
    truGio: truTuChiSo(canGioIdx, chiGioIdx),
    tietKhi: tietKhiTaiThoiDiem(dd, mm, yyyy, gioThapPhan).ten,
    namTruNam,
  };
}

/** Làm tròn nửa xa số 0, như math.Round của Go. */
function lamTron(x: number): number {
  const t = Math.trunc(x);
  return Math.abs(x - t) >= 0.5 ? t + Math.sign(x) : t;
}

/** Hai chữ số, như %02d. */
const hai = (n: number): string => String(n).padStart(2, "0");

// Tên chữ Hán của mười thiên can và mười hai tiết (bảng TuVung bản Go).
const CAN_ZH: Readonly<Record<string, string>> = {
  Giáp: "甲", Ất: "乙", Bính: "丙", Đinh: "丁", Mậu: "戊",
  Kỷ: "己", Canh: "庚", Tân: "辛", Nhâm: "壬", Quý: "癸",
};
const TIET_ZH: Readonly<Record<string, string>> = {
  "Lập Xuân": "立春", "Kinh Trập": "惊蛰", "Thanh Minh": "清明", "Lập Hạ": "立夏",
  "Mang Chủng": "芒种", "Tiểu Thử": "小暑", "Lập Thu": "立秋", "Bạch Lộ": "白露",
  "Hàn Lộ": "寒露", "Lập Đông": "立冬", "Đại Tuyết": "大雪", "Tiểu Hàn": "小寒",
};

/** Ngày Julius kèm phần lẻ của giờ Việt Nam; chỉ dùng để trừ hai mốc cùng hệ. */
function jdLocal(d: SolarDate, gio: number, phut: number): number {
  return jdFromDate(d.day, d.month, d.year) + (gio * 60 + phut) / 1440;
}

const NGAY_RONG: SolarDate = { day: 0, month: 0, year: 0 };

// Đệm 24 mốc tiết khí theo năm: phép dò là hàm thuần, mỗi lá số hỏi ba năm.
// Chỉ đọc, không sửa phần tử nào của mảng đệm.
const DEM_MOC = new Map<number, readonly ThoiDiemTietKhi[]>();
function mocNam(nam: number): readonly ThoiDiemTietKhi[] {
  let ds = DEM_MOC.get(nam);
  if (!ds) {
    ds = mocTietKhiTrongNam(nam);
    DEM_MOC.set(nam, ds);
  }
  return ds;
}

/**
 * Mười đại vận. Nam sinh năm can dương, nữ sinh năm can âm đi THUẬN, hai ca
 * kia NGHỊCH. Tuổi khởi vận: đếm từ lúc sinh tới tiết kế tiếp (thuận) hay
 * tiết vừa qua (nghịch), ba ngày là một năm, tính tới phút. Trả kèm tên tiết
 * mở đầu tháng sinh.
 */
function tinhDaiVan(
  dd: number,
  mm: number,
  yyyy: number,
  gio: number,
  phut: number,
  gioiTinh: string,
  canNam: number,
  canThang: number,
  chiThang: number,
  canNgay: number,
  coGio: boolean,
): { dv: DaiVanBatTu; tietDauThang: string } {
  const namDuong = canNam % 2 === 0;
  const thuan = (gioiTinh === "Nam") === namDuong;

  const sinh = jdLocal({ day: dd, month: mm, year: yyyy }, gio, phut);
  let truoc: ThoiDiemTietKhi | null = null;
  let sau: ThoiDiemTietKhi | null = null;
  let jdTruoc = 0;
  let jdSau = 0;
  for (let nam = yyyy - 1; nam <= yyyy + 1; nam++) {
    for (const m of mocNam(nam)) {
      if (!m.laTiet) continue;
      const j = jdLocal(m.ngay, m.gio, m.phut);
      if (j <= sinh && (truoc === null || j > jdTruoc)) {
        truoc = m;
        jdTruoc = j;
      }
      if (j > sinh && (sau === null || j < jdSau)) {
        sau = m;
        jdSau = j;
      }
    }
  }

  const dv: DaiVanBatTu = {
    thuan,
    tietMoc: "",
    tietMocEn: "",
    tietMocZh: "",
    tietMocNgay: { ...NGAY_RONG },
    tietMocGio: 0,
    tietMocPhut: 0,
    soNgay: 0,
    tuoiKhoiNam: 0,
    tuoiKhoiThang: 0,
    ngayKhoiVan: { ...NGAY_RONG },
    cacVan: [],
    lyDo: "",
    lyDoEn: "",
    lyDoZh: "",
  };
  const tietDauThang = truoc ? truoc.ten : "";
  const moc = thuan ? sau : truoc;
  const jdMoc = thuan ? jdSau : jdTruoc;
  if (moc === null) return { dv, tietDauThang };

  dv.tietMoc = moc.ten;
  const tm = tietKhiBaThu(moc.ten);
  dv.tietMocEn = tm.en;
  dv.tietMocZh = tm.zh;
  dv.tietMocNgay = { day: moc.ngay.day, month: moc.ngay.month, year: moc.ngay.year };
  dv.tietMocGio = moc.gio;
  dv.tietMocPhut = moc.phut;
  const soNgay = Math.abs(jdMoc - sinh);
  dv.soNgay = lamTron(soNgay * 100) / 100;
  const tongThang = soNgay * 4;
  dv.tuoiKhoiNam = Math.trunc(Math.trunc(tongThang) / 12);
  dv.tuoiKhoiThang = Math.trunc(tongThang) % 12;
  dv.ngayKhoiVan = jdToDate(Math.floor(sinh + soNgay * 120));

  const buoc = thuan ? 1 : -1;
  const nc = THIEN_CAN[canNgay];
  for (let i = 0; i < 10; i++) {
    const ci = canThang + buoc * (i + 1);
    const hi = chiThang + buoc * (i + 1);
    const t = truTuChiSo(ci, hi);
    const tt = thapThanCuaCan(nc, t.can);
    const ts = truongSinhCuaCan(canNgay, mod(hi, 12));
    const tsBa = truongSinhBaThu(ts);
    dv.cacVan.push({
      thuTu: i + 1,
      ...t,
      thapThanCan: tt ? tt.ten : "",
      thapThanCanEn: tt ? tt.tenEn : "",
      thapThanCanZh: tt ? tt.tenZh : "",
      truongSinh: ts,
      truongSinhEn: tsBa.en,
      truongSinhZh: tsBa.zh,
      tuoiTu: dv.tuoiKhoiNam + 10 * i,
      namTu: dv.ngayKhoiVan.year + 10 * i,
      namDen: dv.ngayKhoiVan.year + 10 * i + 9,
    });
  }

  const tietZh = TIET_ZH[moc.ten] ?? moc.ten;
  const canNamTen = THIEN_CAN[canNam];
  const canNamZh = CAN_ZH[canNamTen];
  const gtEn = gioiTinh === "Nữ" ? "female" : "male";
  const gtZh = gioiTinh === "Nữ" ? "女" : "男";
  const [adVi, adEn, adZh] = namDuong ? ["dương", "yang", "阳"] : ["âm", "yin", "阴"];
  // Số thập phân bản Việt viết dấu phẩy (21,01 ngày), bản Anh, Trung dấu chấm.
  const soNgay2 = dv.soNgay.toFixed(2);
  const soNgayVi = soNgay2.replace(".", ",");
  const gioMoc = `${hai(moc.gio)}:${hai(moc.phut)}`;
  const ngayMoc = `${moc.ngay.day}/${moc.ngay.month}/${moc.ngay.year}`;
  const ngayMocZh = `${moc.ngay.year}年${moc.ngay.month}月${moc.ngay.day}日`;
  const tuoi = [dv.tuoiKhoiNam, dv.tuoiKhoiThang] as const;
  let vi: string;
  let en: string;
  let zh: string;
  if (thuan) {
    vi = `${gioiTinh} sinh năm can ${canNamTen} (${adVi}) nên đại vận đi thuận từ trụ tháng. Từ lúc sinh tới tiết ${moc.ten} kế tiếp (${gioMoc} ngày ${ngayMoc}) là ${soNgayVi} ngày; ba ngày tính một năm nên khởi vận lúc ${tuoi[0]} tuổi ${tuoi[1]} tháng.`;
    en = `A ${gtEn} born in a ${adEn} year (stem ${canNamTen}), so the luck pillars run forward from the month pillar. From birth to the next solar term, ${moc.ten} (${gioMoc} on ${ngayMoc}), is ${soNgay2} days; at three days to a year, luck begins at ${tuoi[0]} years ${tuoi[1]} months.`;
    zh = `${gtZh}命，年干${canNamZh}属${adZh}，大运自月柱顺排。出生至下一个节${tietZh}（${ngayMocZh} ${gioMoc}）共 ${soNgay2} 天，三天折一年，${tuoi[0]}岁${tuoi[1]}个月起运。`;
  } else {
    vi = `${gioiTinh} sinh năm can ${canNamTen} (${adVi}) nên đại vận đi nghịch từ trụ tháng. Từ tiết ${moc.ten} vừa qua (${gioMoc} ngày ${ngayMoc}) tới lúc sinh là ${soNgayVi} ngày; ba ngày tính một năm nên khởi vận lúc ${tuoi[0]} tuổi ${tuoi[1]} tháng.`;
    en = `A ${gtEn} born in a ${adEn} year (stem ${canNamTen}), so the luck pillars run backward from the month pillar. From the last solar term, ${moc.ten} (${gioMoc} on ${ngayMoc}), to birth is ${soNgay2} days; at three days to a year, luck begins at ${tuoi[0]} years ${tuoi[1]} months.`;
    zh = `${gtZh}命，年干${canNamZh}属${adZh}，大运自月柱逆排。上一个节${tietZh}（${ngayMocZh} ${gioMoc}）至出生共 ${soNgay2} 天，三天折一年，${tuoi[0]}岁${tuoi[1]}个月起运。`;
  }
  if (!coGio) {
    vi += " Chưa biết giờ sinh nên tạm tính từ 12h00; tuổi khởi vận có thể lệch tới bốn tháng.";
    en += " The birth hour is unknown, so noon is assumed; the starting age may be off by up to four months.";
    zh += "出生时辰未知，暂按中午十二时计，起运岁数可能相差至多四个月。";
  }
  dv.lyDo = vi;
  dv.lyDoEn = en;
  dv.lyDoZh = zh;
  return { dv, tietDauThang };
}

/**
 * Lập lá số Bát Tự từ ngày giờ sinh DƯƠNG LỊCH giờ Việt Nam.
 *
 * `gio` là giờ đồng hồ 0 tới 23; null (hay ngoài khoảng) nghĩa là chưa biết
 * giờ sinh: bỏ trụ giờ và mệnh cung, ba trụ còn lại và đại vận tạm tính từ
 * 12h00. `gioiTinh` nhận "Nam", "Nữ" và vài cách viết khác; không nhận ra
 * thì ném `LoiThieuGioiTinh`.
 */
export function lapLaSoBatTu(
  dd: number,
  mm: number,
  yyyy: number,
  gio: number | null,
  phut: number,
  gioiTinh: string,
  schools?: BaZiSchools,
): LaSoBatTu {
  const tc = normalizeBaZiSchools(schools);
  const gt = chuanHoaGioiTinh(gioiTinh);
  if (gt === "") throw new LoiThieuGioiTinh();
  const coGio = gio !== null && gio !== undefined && gio >= 0 && gio <= 23;
  const h = coGio ? (gio as number) : 12;
  if (phut < 0 || phut > 59 || !coGio) phut = 0;
  const bt = coGio ? lapTuTru(dd, mm, yyyy, h, phut, tc?.ziHour === "split-at-midnight") : lapTuTru(dd, mm, yyyy, 12, 0);

  const nc = bt.truNgay.can;
  const canNgay = chiSoCan(nc);
  const canNam = chiSoCan(bt.truNam.can);
  const chiNam = chiSoChi(bt.truNam.chi);
  const canThang = chiSoCan(bt.truThang.can);
  const chiThang = chiSoChi(bt.truThang.chi);
  const chiNgay = chiSoChi(bt.truNgay.chi);
  const chiGio = coGio ? chiSoChi(bt.truGio.chi) : -1;

  const dungTru = (t: Tru): TruLaSo => {
    const ci = chiSoCan(t.can);
    const hi = chiSoChi(t.chi);
    const tt = thapThanCuaCan(nc, t.can);
    const ts = truongSinhCuaCan(canNgay, hi);
    const tuToa = truongSinhCuaCan(ci, hi);
    return {
      ...t,
      thapThanCan: tt ? tt.ten : "",
      thapThanCanEn: tt ? tt.tenEn : "",
      thapThanCanZh: tt ? tt.tenZh : "",
      tangCan: tangCanCuaChi(hi, nc),
      truongSinh: ts,
      truongSinhEn: truongSinhBaThu(ts).en,
      truongSinhZh: truongSinhBaThu(ts).zh,
      tuToa,
      tuToaEn: truongSinhBaThu(tuToa).en,
      tuToaZh: truongSinhBaThu(tuToa).zh,
      thanSat: [],
      thanSatEn: [],
      thanSatZh: [],
    };
  };

  const { dv, tietDauThang } = tinhDaiVan(dd, mm, yyyy, h, phut, gt, canNam, canThang, chiThang, canNgay, coGio);

  const truNgay = dungTru(bt.truNgay);
  truNgay.thapThanCan = NHAT_CHU_LABEL;
  truNgay.thapThanCanEn = "Day Master";
  truNgay.thapThanCanZh = "日主";

  const ls: LaSoBatTu = {
    ngaySinh: { day: dd, month: mm, year: yyyy },
    coGioSinh: coGio,
    gio: h,
    phut,
    gioiTinh: gt,
    truNam: dungTru(bt.truNam),
    truThang: dungTru(bt.truThang),
    truNgay,
    nhatChu: nc,
    nhatChuZh: zhCua(nc),
    nhatChuHanh: bt.truNgay.canHanh,
    nhatChuHanhEn: enCua(bt.truNgay.canHanh),
    nhatChuHanhZh: zhCua(bt.truNgay.canHanh),
    nhatChuAmDuong: canNgay % 2 === 0 ? "Dương" : "Âm",
    nhatChuAmDuongEn: canNgay % 2 === 0 ? "Yang" : "Yin",
    nhatChuAmDuongZh: canNgay % 2 === 0 ? "阳" : "阴",
    tietKhi: bt.tietKhi,
    tietKhiEn: tietKhiBaThu(bt.tietKhi).en,
    tietKhiZh: tietKhiBaThu(bt.tietKhi).zh,
    tietDauThang,
    tietDauThangEn: tietKhiBaThu(tietDauThang).en,
    tietDauThangZh: tietKhiBaThu(tietDauThang).zh,
    namTruNam: bt.namTruNam,
    // Thai nguyên: can tháng tiến một, chi tháng tiến ba (lối phổ biến).
    thaiNguyen: truTuChiSo(canThang + 1, chiThang + 3),
    thanSat: [],
    daiVan: dv,
  };
  if (coGio) ls.truGio = dungTru(bt.truGio);
  if (tc) ls.schools = tc;

  // Mệnh cung theo Tử Bình: chi (Tý = 0) là (5 - chi tháng - chi giờ) mod 12,
  // can theo Ngũ Hổ Độn từ can năm. Tháng lấy theo tiết như trụ tháng.
  if (coGio) {
    const chiMenh = mod(5 - chiThang - chiGio, 12);
    const canMenh = mod(canThangDan(canNam) + mod(chiMenh - 2, 12), 10);
    ls.menhCung = truTuChiSo(canMenh, chiMenh);
  }

  // Thần sát, rồi gắn tên sao lên từng trụ mang nó.
  ls.thanSat = tinhThanSat(canNgay, canNam, chiNam, chiNgay, [chiNam, chiThang, chiNgay, chiGio]);
  const truTheoViTri: Array<TruLaSo | undefined> = [ls.truNam, ls.truThang, ls.truNgay, ls.truGio];
  for (const ts of ls.thanSat) {
    for (const v of ts.viTri) {
      const t = truTheoViTri[v];
      if (!t) continue;
      t.thanSat.push(ts.ten);
      t.thanSatEn.push(ts.tenEn);
      t.thanSatZh.push(ts.tenZh);
    }
  }
  return ls;
}
