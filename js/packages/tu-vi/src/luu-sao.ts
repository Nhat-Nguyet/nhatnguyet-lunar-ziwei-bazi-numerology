// Sao lưu của năm xem (chuyển ngữ tuvi_luusao.go).
//
// Lưu Lộc Tồn, Kình Dương, Đà La: phép an lá số gốc áp cho CAN năm xem (Tử Vi
// Đẩu Số toàn thư, mục 论羊陀迭并). Lưu Thiên Mã: phép an Thiên Mã áp cho CHI
// năm xem. Lưu Thái Tuế: cung mang chi năm xem. Chưa an Lưu Văn Xương, Lưu Văn
// Khúc (bài ca có hai cách đọc, chưa chốt).

import { DIA_CHI, mod } from "./phu-thuoc.ts";
import { LOC_TON_VI_TRI, tenCungBaThu, thienMaViTri, zhCua } from "./du-lieu.ts";
import { daiVan } from "./chieu-sau.ts";
import { tinhHanNam } from "./luu-nien.ts";
import { tenCungTaiViTri } from "./tra-cuu.ts";
import type { BaNgonNgu, LaSoTuVi } from "./kieu.ts";

/** Mã các sao lưu. */
export const LUU_LOC_TON = "luu-loc-ton";
export const LUU_KINH_DUONG = "luu-kinh-duong";
export const LUU_DA_LA = "luu-da-la";
export const LUU_THIEN_MA = "luu-thien-ma";
export const LUU_THAI_TUE = "luu-thai-tue";

/** Quan hệ vị trí giữa hai cung trên địa bàn. */
export const CUNG_DONG_CUNG = "dong-cung";
export const CUNG_XUNG_CHIEU = "xung-chieu";
export const CUNG_TAM_HOP = "tam-hop";

/** Một sao lưu của năm xem và chỗ nó rơi trên lá số. */
export interface SaoLuu {
  ma: string;
  ten: string;
  tenEn: string;
  tenZh: string;
  /** An theo CAN năm xem (false là theo CHI). */
  theoCan: boolean;
  viTri: number;
  chi: string;
  chiZh: string;
  tenCung: string;
  tenCungEn: string;
  tenCungZh: string;
  /** "", "dong-cung", "xung-chieu" hay "tam-hop". */
  voiLuuNien: string;
  voiTieuVan: string;
  /** Rỗng cả khi năm xem nằm ngoài mười hai chặng đại vận. */
  voiDaiVan: string;
}

/** Quan hệ tam phương tứ chính của hai vị trí; rỗng khi không liên quan. */
export function quanHeHaiCung(a: number, b: number): string {
  switch (mod(a - b, 12)) {
    case 0:
      return CUNG_DONG_CUNG;
    case 6:
      return CUNG_XUNG_CHIEU;
    case 4:
    case 8:
      return CUNG_TAM_HOP;
  }
  return "";
}

/** Vị trí năm sao lưu theo chỉ số can, chi của một năm. */
export function viTriSaoLuu(canIdx: number, chiIdx: number): Record<string, number> {
  const loc = LOC_TON_VI_TRI[mod(canIdx, 10)];
  return {
    [LUU_LOC_TON]: loc,
    [LUU_KINH_DUONG]: mod(loc + 1, 12),
    [LUU_DA_LA]: mod(loc - 1, 12),
    [LUU_THIEN_MA]: thienMaViTri(mod(chiIdx, 12)),
    [LUU_THAI_TUE]: mod(chiIdx, 12),
  };
}

// Cột `en` chép nguyên lõi Go (tuvi_luusao.go) và nằm trong ca kiểm, nên giữ
// tên sao Hán Việt; lớp tiếng Anh (`yearlyStars`) đổi tên sao qua `enText`
// thành "Yearly Grand Duke", "Yearly Prosperity"..., không in cột này.
const TEN_SAO_LUU: readonly { ma: string; ten: BaNgonNgu; theoCan: boolean }[] = [
  { ma: LUU_THAI_TUE, ten: { vi: "Lưu Thái Tuế", en: "Yearly Thái Tuế", zh: "流年太岁" }, theoCan: false },
  { ma: LUU_LOC_TON, ten: { vi: "Lưu Lộc Tồn", en: "Yearly Lộc Tồn", zh: "流禄" }, theoCan: true },
  { ma: LUU_KINH_DUONG, ten: { vi: "Lưu Kình Dương", en: "Yearly Kình Dương", zh: "流羊" }, theoCan: true },
  { ma: LUU_DA_LA, ten: { vi: "Lưu Đà La", en: "Yearly Đà La", zh: "流陀" }, theoCan: true },
  { ma: LUU_THIEN_MA, ten: { vi: "Lưu Thiên Mã", en: "Yearly Thiên Mã", zh: "流马" }, theoCan: false },
];

/**
 * An năm sao lưu của năm xem lên lá số, thứ tự cố định: Thái Tuế, Lộc Tồn,
 * Kình Dương, Đà La, Thiên Mã. namXem là năm dương lịch, hiểu là năm âm cùng số.
 */
export function tinhSaoLuu(laSo: LaSoTuVi, namXem: number): SaoLuu[] {
  const canIdx = mod(namXem - 4, 10);
  const chiIdx = mod(namXem - 4, 12);
  const viTri = viTriSaoLuu(canIdx, chiIdx);
  const hn = tinhHanNam(laSo, namXem);
  let cungDaiVan = -1;
  for (const c of daiVan(laSo)) {
    if (hn.tuoiMu >= c.tuTuoi && hn.tuoiMu <= c.denTuoi) {
      cungDaiVan = c.viTri;
      break;
    }
  }
  return TEN_SAO_LUU.map((t) => {
    const p = viTri[t.ma];
    const tenCung = tenCungTaiViTri(laSo, p);
    const cb = tenCungBaThu(tenCung);
    return {
      ma: t.ma, ten: t.ten.vi, tenEn: t.ten.en, tenZh: t.ten.zh, theoCan: t.theoCan,
      viTri: p, chi: DIA_CHI[p], chiZh: zhCua(DIA_CHI[p]),
      tenCung, tenCungEn: cb.en, tenCungZh: cb.zh,
      voiLuuNien: quanHeHaiCung(p, hn.luuNienViTri),
      voiTieuVan: quanHeHaiCung(p, hn.tieuVanViTri),
      voiDaiVan: cungDaiVan >= 0 ? quanHeHaiCung(p, cungDaiVan) : "",
    };
  });
}
