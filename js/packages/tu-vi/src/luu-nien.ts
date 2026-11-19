// Lưu niên, tiểu vận, lưu tứ hóa, hạn năm và nguyệt hạn (chuyển ngữ
// tuvi_luunien.go). Chỉ tính dữ kiện, không sinh câu luận.
//
// DỊ BẢN: tiểu vận dùng lối phổ biến nhất trong sách Việt, khởi theo nhóm tam
// hợp của chi năm sinh, nam đi thuận, nữ đi nghịch. Nguyệt hạn theo lưu Đẩu
// Quân như Tử Vi Đẩu Số toàn thư; Tân Biên khởi từ cung tiểu hạn.
//
// Dòng công bố cách tính (phepTinh) của bản Go chưa chuyển ngữ.

import { DIA_CHI, THIEN_CAN, mod } from "./phu-thuoc.ts";
import { tenCungBaThu, zhCua } from "./du-lieu.ts";
import { tuHoaTheoPhai } from "./schools.ts";
import { tenSaoTuViBaThu, viTriDauQuan } from "./sao-phu.ts";
import { daiVan } from "./chieu-sau.ts";
import { tenCungTaiViTri, viTriSao } from "./tra-cuu.ts";
import type { LaSoTuVi } from "./kieu.ts";

/** Một trong bốn hóa của năm xem, kèm cung sao ấy đang toạ. */
export interface LuuTuHoaSao {
  hoa: string;
  hoaZh: string;
  sao: string;
  saoEn: string;
  saoZh: string;
  /** 0 tới 11; -1 khi sao không có trên lá số. */
  viTri: number;
  /** Năm trường cung rỗng khi sao không có trên lá số. */
  chiCung: string;
  chiCungZh: string;
  tenCung: string;
  tenCungEn: string;
  tenCungZh: string;
  coTrenLaSo: boolean;
}

/** Cung của một tháng âm trong năm xem. */
export interface ThangHan {
  thang: number;
  viTri: number;
  chi: string;
  chiZh: string;
  tenCung: string;
  tenCungEn: string;
  tenCungZh: string;
}

/** Mười hai tháng hạn của một năm xem. */
export interface NguyetHan {
  /** Cung tháng Giêng của năm xem (lưu Đẩu Quân). */
  luuDauQuanViTri: number;
  luuDauQuanChi: string;
  luuDauQuanChiZh: string;
  thang: ThangHan[];
}

/** Dữ kiện của một năm xem. */
export interface HanNam {
  nam: number;
  canChiNam: string;
  canChiNamZh: string;
  tuoiMu: number;
  luuNienViTri: number;
  luuNienChi: string;
  luuNienChiZh: string;
  luuNienTenCung: string;
  luuNienTenCungEn: string;
  luuNienTenCungZh: string;
  tieuVanViTri: number;
  tieuVanChi: string;
  tieuVanChiZh: string;
  tieuVanTenCung: string;
  tieuVanTenCungEn: string;
  tieuVanTenCungZh: string;
  /** Đại vận đang ở; 0, 0, "" khi tuổi mụ ngoài mười hai chặng. */
  daiVanTuTuoi: number;
  daiVanDenTuoi: number;
  daiVanTenCung: string;
  daiVanTenCungEn: string;
  daiVanTenCungZh: string;
  luuTuHoa: LuuTuHoaSao[];
  nguyetHan: NguyetHan;
}

/**
 * Vị trí tiểu vận lúc 1 tuổi: Thân Tý Thìn khởi Tuất; Dần Ngọ Tuất khởi Thìn;
 * Tỵ Dậu Sửu khởi Mùi; Hợi Mão Mùi khởi Sửu.
 */
export function khoiTieuVan(chiNamIdx: number): number {
  switch (mod(chiNamIdx, 4)) {
    case 0:
      return 10; // Tuất
    case 2:
      return 4; // Thìn
    case 1:
      return 7; // Mùi
    default:
      return 1; // Sửu
  }
}

/** Chiều tiểu vận: nam thuận (+1), nữ nghịch (-1). Khác chiều đại vận. */
export function chieuTieuVan(gioiTinh: string): number {
  return gioiTinh === "Nữ" ? -1 : 1;
}

/**
 * Nguyệt hạn theo lưu Đẩu Quân: từ cung lưu Thái Tuế (chi năm xem) kể là tháng
 * Giêng, đếm nghịch tới tháng sinh, lấy cung ấy làm giờ Tý, đếm thuận tới giờ
 * sinh; cung dừng là tháng Giêng, mỗi tháng sau dời một cung thuận.
 */
export function tinhNguyetHan(ls: LaSoTuVi, chiNamXem: number): NguyetHan {
  let gio = 0;
  DIA_CHI.forEach((c, i) => {
    if (c === ls.gioSinh) gio = i;
  });
  const dq = viTriDauQuan(chiNamXem, ls.placementMonth ?? ls.ngaySinhAm.month, gio);
  const thang: ThangHan[] = [];
  for (let t = 1; t <= 12; t++) {
    const p = mod(dq + t - 1, 12);
    thang.push({
      thang: t, viTri: p, chi: DIA_CHI[p], chiZh: zhCua(DIA_CHI[p]),
      tenCung: ls.cung[p].tenCung, tenCungEn: ls.cung[p].tenCungEn, tenCungZh: tenCungBaThu(ls.cung[p].tenCung).zh,
    });
  }
  return { luuDauQuanViTri: dq, luuDauQuanChi: DIA_CHI[dq], luuDauQuanChiZh: zhCua(DIA_CHI[dq]), thang };
}

/**
 * Dữ kiện của một năm xem cho một lá số. namXem là năm DƯƠNG lịch, hiểu là
 * năm âm cùng số; tuổi mụ tính theo năm âm của lá số (sinh ra đã 1 tuổi).
 */
export function tinhHanNam(laSo: LaSoTuVi, namXem: number): HanNam {
  const tuoiMu = Math.max(1, namXem - laSo.ngaySinhAm.year + 1);
  const canIdx = mod(namXem - 4, 10);
  const chiIdx = mod(namXem - 4, 12);

  const chiNamSinhIdx = mod(laSo.ngaySinhAm.year - 4, 12);
  const khoi = khoiTieuVan(chiNamSinhIdx);
  const chieu = chieuTieuVan(laSo.gioiTinh);
  const tv = mod(khoi + chieu * (tuoiMu - 1), 12);

  let daiVanTuTuoi = 0;
  let daiVanDenTuoi = 0;
  let daiVanTenCung = "";
  for (const c of daiVan(laSo)) {
    if (tuoiMu >= c.tuTuoi && tuoiMu <= c.denTuoi) {
      daiVanTuTuoi = c.tuTuoi;
      daiVanDenTuoi = c.denTuoi;
      daiVanTenCung = c.tenCung;
      break;
    }
  }

  const th = tuHoaTheoPhai(canIdx, laSo.schools?.transformations);
  const luuTuHoa: LuuTuHoaSao[] = [
    ["Hóa Lộc", th.loc], ["Hóa Quyền", th.quyen], ["Hóa Khoa", th.khoa], ["Hóa Kỵ", th.ky],
  ].map(([hoa, sao]) => {
    const tenSao = tenSaoTuViBaThu(sao);
    const item: LuuTuHoaSao = {
      hoa, hoaZh: zhCua(hoa), sao, saoEn: tenSao.en, saoZh: tenSao.zh, viTri: -1,
      chiCung: "", chiCungZh: "", tenCung: "", tenCungEn: "", tenCungZh: "", coTrenLaSo: false,
    };
    const p = viTriSao(laSo, sao);
    if (p >= 0) {
      item.viTri = p;
      item.coTrenLaSo = true;
      item.chiCung = DIA_CHI[p];
      item.chiCungZh = zhCua(item.chiCung);
      item.tenCung = tenCungTaiViTri(laSo, p);
      const cb = tenCungBaThu(item.tenCung);
      item.tenCungEn = cb.en;
      item.tenCungZh = cb.zh;
    }
    return item;
  });

  const canChiNam = THIEN_CAN[canIdx] + " " + DIA_CHI[chiIdx];
  const luuNienTenCung = tenCungTaiViTri(laSo, chiIdx);
  const tieuVanTenCung = tenCungTaiViTri(laSo, tv);
  const ln = tenCungBaThu(luuNienTenCung);
  const tvc = tenCungBaThu(tieuVanTenCung);
  const dvc = tenCungBaThu(daiVanTenCung);
  return {
    nam: namXem,
    canChiNam,
    canChiNamZh: zhCua(canChiNam),
    tuoiMu,
    luuNienViTri: chiIdx,
    luuNienChi: DIA_CHI[chiIdx],
    luuNienChiZh: zhCua(DIA_CHI[chiIdx]),
    luuNienTenCung,
    luuNienTenCungEn: ln.en,
    luuNienTenCungZh: ln.zh,
    tieuVanViTri: tv,
    tieuVanChi: DIA_CHI[tv],
    tieuVanChiZh: zhCua(DIA_CHI[tv]),
    tieuVanTenCung,
    tieuVanTenCungEn: tvc.en,
    tieuVanTenCungZh: tvc.zh,
    daiVanTuTuoi,
    daiVanDenTuoi,
    daiVanTenCung,
    daiVanTenCungEn: dvc.en,
    daiVanTenCungZh: dvc.zh,
    luuTuHoa,
    nguyetHan: tinhNguyetHan(laSo, chiIdx),
  };
}
