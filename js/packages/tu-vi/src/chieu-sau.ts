// Chiều sâu lá số: hội sao, liên cung, đại vận (chuyển ngữ tuvi_chieusau.go).
// Chỉ tính toán và tra hình học trên lá số, không sinh câu diễn giải.

import { mod } from "./phu-thuoc.ts";
import { chinhTinhCuaCung } from "./tra-cuu.ts";
import type { LaSoTuVi, SaoTuVi } from "./kieu.ts";

/** Một sao chiếu tới cung đang xét, kèm cung nó đang toạ. */
export interface SaoChieu {
  ten: string;
  tenEn: string;
  tenZh?: string;
  loai: string;
  mieuVuong?: string;
  tuHoa?: string;
  /** Chi của cung mà sao đang toạ. */
  tuCung: string;
}

/** Bộ sao tam phương tứ chính của một cung. */
export interface HoiSaoCung {
  viTri: number;
  chi: string;
  tenCung: string;
  tenCungEn: string;
  toaThu: SaoChieu[];
  xungChieu: SaoChieu[];
  tamHop: SaoChieu[];
}

/** Một cặp cung đọc cùng nhau. */
export interface CapLienCung {
  loai: "doi-xung" | "menh-than";
  a: string;
  b: string;
  chiA: string;
  chiB: string;
  viTriA: number;
  viTriB: number;
  chinhA: string;
  chinhB: string;
}

/** Một chặng đại vận 10 năm. */
export interface ChangDaiVan {
  thu: number;
  viTri: number;
  chi: string;
  tenCung: string;
  tenCungEn: string;
  /** Tuổi mụ. */
  tuTuoi: number;
  denTuoi: number;
  /** Vắng khi cung vô chính diệu. */
  chinhTinh?: string;
}

function saoToChieu(s: SaoTuVi, chiCung: string): SaoChieu {
  const r: SaoChieu = { ten: s.ten, tenEn: s.tenEn, loai: s.loai, tuCung: chiCung };
  if (s.tenZh) r.tenZh = s.tenZh;
  if (s.mieuVuong) r.mieuVuong = s.mieuVuong;
  if (s.tuHoa) r.tuHoa = s.tuHoa;
  return r;
}

function saoCuaCung(ls: LaSoTuVi, pos: number): SaoChieu[] {
  const c = ls.cung[mod(pos, 12)];
  return c.sao.map((s) => saoToChieu(s, c.chi));
}

/** Bộ tam phương tứ chính cho cả 12 cung (đối diện +6, tam hợp +4 và +8). */
export function hoiSao(ls: LaSoTuVi): HoiSaoCung[] {
  const out: HoiSaoCung[] = [];
  for (let i = 0; i < 12; i++) {
    const c = ls.cung[i];
    out.push({
      viTri: c.viTri, chi: c.chi, tenCung: c.tenCung, tenCungEn: c.tenCungEn,
      toaThu: saoCuaCung(ls, i),
      xungChieu: saoCuaCung(ls, i + 6),
      tamHop: [...saoCuaCung(ls, i + 4), ...saoCuaCung(ls, i + 8)],
    });
  }
  return out;
}

/** Sáu cặp đối xung và cặp Mệnh Thân. */
export function lienCung(ls: LaSoTuVi): CapLienCung[] {
  const out: CapLienCung[] = [];
  for (let i = 0; i < 6; i++) {
    const j = mod(i + 6, 12);
    const a = ls.cung[i];
    const b = ls.cung[j];
    out.push({
      loai: "doi-xung",
      a: a.tenCung, b: b.tenCung,
      chiA: a.chi, chiB: b.chi,
      viTriA: a.viTri, viTriB: b.viTri,
      chinhA: chinhTinhCuaCung(ls, i), chinhB: chinhTinhCuaCung(ls, j),
    });
  }
  const m = ls.cungMenh;
  const t = ls.cungThan;
  out.push({
    loai: "menh-than",
    a: ls.cung[m].tenCung, b: ls.cung[t].tenCung,
    chiA: ls.cung[m].chi, chiB: ls.cung[t].chi,
    viTriA: m, viTriB: t,
    chinhA: chinhTinhCuaCung(ls, m), chinhB: chinhTinhCuaCung(ls, t),
  });
  return out;
}

/** Chiều đại vận: +1 thuận (Dương Nam, Âm Nữ), -1 nghịch (Âm Nam, Dương Nữ). */
export function chieuDaiVan(amDuongMenh: string): number {
  return amDuongMenh === "Dương Nam" || amDuongMenh === "Âm Nữ" ? 1 : -1;
}

/**
 * 12 chặng đại vận, mỗi chặng 10 năm. Chặng đầu khởi ở cung Mệnh, từ tuổi mụ
 * bằng số cục (lối thứ nhất của Tân Biên; Tử Vi Đẩu Số toàn thư khởi ở cung
 * kề Mệnh theo chiều đi).
 */
export function daiVan(laSo: LaSoTuVi): ChangDaiVan[] {
  const chieu = chieuDaiVan(laSo.amDuongMenh);
  const out: ChangDaiVan[] = [];
  for (let k = 0; k < 12; k++) {
    const pos = mod(laSo.cungMenh + chieu * k, 12);
    const c = laSo.cung[pos];
    const tu = laSo.cuc + k * 10;
    const chang: ChangDaiVan = {
      thu: k + 1, viTri: c.viTri, chi: c.chi,
      tenCung: c.tenCung, tenCungEn: c.tenCungEn,
      tuTuoi: tu, denTuoi: tu + 9,
    };
    const ct = chinhTinhCuaCung(laSo, pos);
    if (ct) chang.chinhTinh = ct;
    out.push(chang);
  }
  return out;
}
