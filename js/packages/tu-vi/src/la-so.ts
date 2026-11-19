// Lập lá số Tử Vi đầy đủ (chuyển ngữ LapLaSoTuVi ở tuvi.go).
//
// Phần luận giải từng sao (dienGiai) của bản Go chưa chuyển ngữ: gói này trả
// phần TÍNH, tên ba thứ tiếng và lời rào.

import { DIA_CHI, THIEN_CAN, mod, nguHanhNapAm, solarToLunar } from "./phu-thuoc.ts";
import {
  CHINH_TINH_DIGNITY,
  CHINH_TINH_NAME_EN,
  DIGNITY_LABEL,
  LOC_TON_VI_TRI,
  PHU_TINH_NAME_EN,
  TEN_CUNG_THEO_OFFSET,
  TEN_VONG_BAC_SY,
  TEN_VONG_THAI_TUE,
  TEN_VONG_TRUONG_SINH,
  THIEN_KHOI_VI_TRI,
  TRANG_SINH_THEO_CUC,
  TRIET_THEO_CAN,
  TU_HOA_THEO_CAN,
  daoHoaViTri,
  thienMaViTri,
} from "./du-lieu.ts";
import { canCungDan, cucTheoCungMenh, viTriChinhTinh, viTriCungMenh, viTriCungThan, viTriTuVi } from "./lap-so.ts";
import {
  TEN_SAO_PHU_MOI,
  tenSaoBaThu,
  viTriAnQuang,
  viTriBatToa,
  viTriDauQuan,
  viTriHuuBat,
  viTriSaoThaiTue,
  viTriTamThai,
  viTriTaPhu,
  viTriThienHu,
  viTriThienKhoc,
  viTriThienPhuc,
  viTriThienQuan,
  viTriThienQuy,
  viTriThienTai,
  viTriThienTho,
  viTriVanKhuc,
  viTriVanXuong,
} from "./sao-phu.ts";
import type { BaNgonNgu, CungTuVi, LaSoTuVi, LoaiSao, SaoTuVi } from "./kieu.ts";

/** Lời rào của lá số, đủ ba bản. */
export const CAVEAT_TU_VI: BaNgonNgu = {
  vi: "Lá số lập theo bản phổ biến ở Việt Nam, phần lớn theo Tử Vi Đẩu Số Tân Biên. " +
    "Tứ Hóa của can Canh, Tân, Nhâm có dị bản giữa các phái. " +
    "Riêng can Canh, lá số này dùng Thiên Đồng hóa Khoa, Thái Âm hóa Kỵ theo Huyền Vi, Thiên Lương và Việt Viêm Tử; Tân Biên và Tử Vi Đẩu Số toàn thư ghi Thái Âm hóa Khoa, Thiên Đồng hóa Kỵ; có sách ghi Thiên Phủ hóa Khoa, Thiên Đồng hóa Kỵ. " +
    "Lá số chưa an một số sao phụ như Hỏa Tinh, Linh Tinh, Hồng Loan, Thiên Hình.",
  en: "This chart follows the version most used in Vietnam, largely after Tử Vi Đẩu Số Tân Biên. " +
    "The Four Transformations for the stems Canh, Tân and Nhâm differ between schools. " +
    "For Canh, this chart uses Thiên Đồng as Hóa Khoa and Thái Âm as Hóa Kỵ, after Huyền Vi, Thiên Lương and Việt Viêm Tử; Tân Biên and the Tử Vi Đẩu Số Toàn Thư give Thái Âm as Hóa Khoa and Thiên Đồng as Hóa Kỵ; others give Thiên Phủ as Hóa Khoa and Thiên Đồng as Hóa Kỵ. " +
    "Some minor stars, such as Hỏa Tinh, Linh Tinh, Hồng Loan and Thiên Hình, are not placed yet.",
  zh: "本命盘按越南最通行的版本排出，大体依《紫微斗数新编》。" +
    "庚、辛、壬三干的四化各派说法不一。" +
    "庚干本命盘取天同化科、太阴化忌，依三位越南作者的紫微书；《紫微斗数新编》与《紫微斗数全书》作太阴化科、天同化忌；也有的书作天府化科、天同化忌。" +
    "火星、铃星、红鸾、天刑等部分辅星尚未排入。",
};

/** Dòng giải thích cách lấy ngày khi sinh giờ Tý. */
export const GHI_CHU_GIO_TY_TU_VI: BaNgonNgu = {
  vi: "Sinh giờ Tý: lá số lấy ngày âm của đúng ngày dương đã nhập, kể cả khi sinh từ 23h tới 0h. Có sách tính người sinh từ 23h là sinh ngày hôm sau; muốn theo cách ấy thì nhập ngày hôm sau. Lá số Bát Tự của site đổi ngày từ 23h, nên với người sinh từ 23h tới 0h, hai tiện ích có thể ra ngày khác nhau.",
  en: "Born in the Tý hour: the chart takes the lunar date of exactly the Gregorian date entered, even for a birth between 23:00 and midnight. Some texts count a birth from 23:00 as the next day; to follow them, enter the next day's date. The site's Four Pillars chart turns the day at 23:00, so for a birth between 23:00 and midnight the two tools can give different days.",
  zh: "子时出生：本命盘取所输入公历日期对应的农历日，23 时至 0 时出生亦然。有的书把 23 时起出生算作次日出生；如按此法，请输入次日日期。本站八字排盘自 23 时换日，故 23 时至 0 时出生者，两个工具得出的日子可能不同。",
};

const CHINH_TINH = [
  "Tử Vi", "Thiên Cơ", "Thái Dương", "Vũ Khúc", "Thiên Đồng", "Liêm Trinh",
  "Thiên Phủ", "Thái Âm", "Tham Lang", "Cự Môn", "Thiên Tướng", "Thiên Lương", "Thất Sát", "Phá Quân",
];

const PHU_TINH_GOC = [
  "Lộc Tồn", "Kình Dương", "Đà La", "Thiên Khôi", "Thiên Việt",
  "Tả Phù", "Hữu Bật", "Văn Xương", "Văn Khúc", "Địa Không", "Địa Kiếp", "Thiên Mã", "Đào Hoa",
];

/** Nhãn can chi ở góc mỗi cung (can theo Ngũ Hổ Độn từ can tháng Giêng). */
function canChiOfPalace(canThangGieng: number, viTri: number): string {
  const offset = mod(viTri - 2, 12); // so với Dần
  return THIEN_CAN[mod(canThangGieng + offset, 10)] + " " + DIA_CHI[viTri];
}

/**
 * Lập lá số Tử Vi đầy đủ từ ngày sinh dương lịch và giờ sinh.
 *
 * @param gioiTinh "Nam" hoặc "Nữ".
 * @param gioSinhChiIdx chỉ số chi giờ sinh: 0 Tý (23h tới 1h), 1 Sửu... 11 Hợi.
 * @throws Error khi giới tính hay giờ sinh không hợp lệ (bản Go trả error).
 *
 * Ngày âm lấy theo đúng ngày dương đã nhập, giờ Việt Nam UTC+7, kể cả khi sinh
 * từ 23h tới 0h.
 */
export function lapLaSoTuVi(hoTen: string, gioiTinh: string, dd: number, mm: number, yyyy: number, gioSinhChiIdx: number): LaSoTuVi {
  if (gioiTinh !== "Nam" && gioiTinh !== "Nữ") {
    throw new Error('gioiTinh phải là "Nam" hoặc "Nữ"');
  }
  if (!Number.isInteger(gioSinhChiIdx) || gioSinhChiIdx < 0 || gioSinhChiIdx > 11) {
    throw new Error("gioSinhChiIdx phải trong khoảng 0-11");
  }

  const lunar = solarToLunar(dd, mm, yyyy, 7);
  const amNam = lunar.year;
  const amThang = lunar.month;
  const amNgay = lunar.day;

  const canNamIdx = mod(amNam - 4, 10);
  const chiNamIdx = mod(amNam - 4, 12);

  const gioiTinhSign = gioiTinh === "Nữ" ? -1 : 1;
  const amDuongCanNamSign = canNamIdx % 2 !== 0 ? -1 : 1;
  // +1: Dương Nam, Âm Nữ (thuận); -1: Âm Nam, Dương Nữ (nghịch)
  const amDuongNamNu = gioiTinhSign * amDuongCanNamSign;
  const amDuongMenh = (amDuongCanNamSign < 0 ? "Âm" : "Dương") + " " + gioiTinh;

  const cungMenh = viTriCungMenh(amThang, gioSinhChiIdx);
  const cungThan = viTriCungThan(amThang, gioSinhChiIdx);

  const canThangGieng = canCungDan(canNamIdx);
  const cuc = cucTheoCungMenh(canNamIdx, cungMenh);
  if (!cuc) {
    throw new Error(`không xác định được Cục (cung Mệnh ${DIA_CHI[cungMenh]})`);
  }
  const cucSo = cuc.so;

  const banMenhTen = nguHanhNapAm(canNamIdx, chiNamIdx).ten;

  // 14 chính tinh
  const starPos = viTriChinhTinh(viTriTuVi(cucSo, amNgay));

  // Vòng Lộc Tồn
  const viTriLocTon = LOC_TON_VI_TRI[canNamIdx];
  starPos["Lộc Tồn"] = viTriLocTon;
  starPos["Kình Dương"] = mod(viTriLocTon + 1, 12);
  starPos["Đà La"] = mod(viTriLocTon - 1, 12);

  const viTriTrangSinh = TRANG_SINH_THEO_CUC[cucSo];

  const viTriThienKhoi = THIEN_KHOI_VI_TRI[canNamIdx];
  starPos["Thiên Khôi"] = viTriThienKhoi;
  starPos["Thiên Việt"] = mod(8 - viTriThienKhoi, 12);

  starPos["Tả Phù"] = viTriTaPhu(amThang);
  starPos["Hữu Bật"] = viTriHuuBat(amThang);

  starPos["Văn Khúc"] = viTriVanKhuc(gioSinhChiIdx);
  starPos["Văn Xương"] = viTriVanXuong(gioSinhChiIdx);

  const viTriDiaKiep = mod(11 + gioSinhChiIdx, 12);
  starPos["Địa Kiếp"] = viTriDiaKiep;
  starPos["Địa Không"] = mod(10 - viTriDiaKiep, 12);

  starPos["Thiên Mã"] = thienMaViTri(chiNamIdx);
  starPos["Đào Hoa"] = daoHoaViTri(chiNamIdx);

  starPos["Tam Thai"] = viTriTamThai(amThang, amNgay);
  starPos["Bát Tọa"] = viTriBatToa(amThang, amNgay);
  starPos["Ân Quang"] = viTriAnQuang(gioSinhChiIdx, amNgay);
  starPos["Thiên Quý"] = viTriThienQuy(gioSinhChiIdx, amNgay);
  starPos["Thiên Quan"] = viTriThienQuan(canNamIdx);
  starPos["Thiên Phúc"] = viTriThienPhuc(canNamIdx);
  starPos["Thiên Tài"] = viTriThienTai(cungMenh, chiNamIdx);
  starPos["Thiên Thọ"] = viTriThienTho(cungThan, chiNamIdx);
  starPos["Thiên Khốc"] = viTriThienKhoc(chiNamIdx);
  starPos["Thiên Hư"] = viTriThienHu(chiNamIdx);
  starPos["Đẩu Quân"] = viTriDauQuan(chiNamIdx, amThang, gioSinhChiIdx);

  // Tứ Hóa
  const th = TU_HOA_THEO_CAN[canNamIdx];
  const tuHoaOf: Record<string, string> = {
    [th.loc]: "Hóa Lộc",
    [th.quyen]: "Hóa Quyền",
    [th.khoa]: "Hóa Khoa",
    [th.ky]: "Hóa Kỵ",
  };

  // Tuần, Triệt
  const trietCungs = TRIET_THEO_CAN[canNamIdx];
  const tuanStartChi = mod(chiNamIdx - canNamIdx, 12);
  const tuanCungs = [mod(tuanStartChi + 10, 12), mod(tuanStartChi + 11, 12)];

  // Dựng 12 cung
  const cung: CungTuVi[] = [];
  for (let i = 0; i < 12; i++) {
    const names = TEN_CUNG_THEO_OFFSET[mod(cungMenh - i, 12)];
    cung.push({
      viTri: i,
      chi: DIA_CHI[i],
      canChi: canChiOfPalace(canThangGieng, i),
      tenCung: names.vi,
      tenCungEn: names.en,
      laThan: i === cungThan,
      tuanTrung: i === tuanCungs[0] || i === tuanCungs[1],
      trietLo: i === trietCungs[0] || i === trietCungs[1],
      sao: [],
    });
  }

  const addSao = (pos: number, ten: string, tenEn: string, loai: LoaiSao, tenZh?: string): void => {
    const s: SaoTuVi = { ten, tenEn, loai };
    if (tenZh) s.tenZh = tenZh;
    const dig = CHINH_TINH_DIGNITY[ten];
    if (dig) {
      const lbl = DIGNITY_LABEL[dig[pos]];
      s.mieuVuong = lbl.vi;
      s.mieuVuongEn = lbl.en;
    }
    const hoa = Object.prototype.hasOwnProperty.call(tuHoaOf, ten) ? tuHoaOf[ten] : undefined;
    if (hoa) s.tuHoa = hoa;
    cung[pos].sao.push(s);
  };

  for (const name of CHINH_TINH) addSao(starPos[name], name, CHINH_TINH_NAME_EN[name], "chinh-tinh");
  for (const name of PHU_TINH_GOC) addSao(starPos[name], name, PHU_TINH_NAME_EN[name], "phu-tinh");
  for (const name of TEN_SAO_PHU_MOI) {
    const { en, zh } = tenSaoBaThu(name);
    addSao(starPos[name], name, en, "phu-tinh", zh);
  }
  // Vòng Tràng Sinh theo âm dương năm và giới (Dương Nam, Âm Nữ thuận).
  for (let i = 0; i < 12; i++) {
    const n = TEN_VONG_TRUONG_SINH[i];
    addSao(mod(viTriTrangSinh + amDuongNamNu * i, 12), n.vi, n.en, "truong-sinh");
  }
  // Vòng Thái Tuế luôn thuận.
  for (let i = 0; i < 12; i++) {
    const n = TEN_VONG_THAI_TUE[i];
    addSao(viTriSaoThaiTue(chiNamIdx, i), n.vi, n.en, "thai-tue");
  }
  for (let i = 0; i < 12; i++) {
    const n = TEN_VONG_BAC_SY[i];
    addSao(mod(viTriLocTon + amDuongNamNu * i, 12), n.vi, n.en, "bac-sy");
  }

  const laSo: LaSoTuVi = {
    hoTen,
    gioiTinh,
    ngaySinhDuong: { ngay: dd, thang: mm, nam: yyyy },
    ngaySinhAm: lunar,
    gioSinh: DIA_CHI[gioSinhChiIdx],
    canChiNam: THIEN_CAN[canNamIdx] + " " + DIA_CHI[chiNamIdx],
    amDuongMenh,
    cuc: cucSo,
    tenCuc: cuc.ten,
    banMenhNapAm: banMenhTen,
    cungMenh,
    cungThan,
    menhCungChi: DIA_CHI[cungMenh],
    cung,
    caveat: CAVEAT_TU_VI.vi,
    caveatEn: CAVEAT_TU_VI.en,
    caveatZh: CAVEAT_TU_VI.zh,
  };
  if (gioSinhChiIdx === 0) {
    laSo.ghiChuGioTy = GHI_CHU_GIO_TY_TU_VI.vi;
    laSo.ghiChuGioTyEn = GHI_CHU_GIO_TY_TU_VI.en;
    laSo.ghiChuGioTyZh = GHI_CHU_GIO_TY_TU_VI.zh;
  }
  return laSo;
}
