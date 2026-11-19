// Phép tra trên lá số đã lập, dùng chung cho hạn năm, sao lưu và cách cục
// (các hàm nhỏ rải ở tuvi_luunien.go và tuvi_cachcuc.go của bản Go).

import { mod } from "./phu-thuoc.ts";
import type { LaSoTuVi } from "./kieu.ts";

/** Tên cung (Mệnh, Phụ Mẫu...) tại một vị trí địa bàn. */
export function tenCungTaiViTri(ls: LaSoTuVi, pos: number): string {
  return ls.cung[mod(pos, 12)].tenCung;
}

/** Vị trí của một sao trên lá số; -1 khi không có. */
export function viTriSao(ls: LaSoTuVi, ten: string): number {
  for (const c of ls.cung) {
    for (const s of c.sao) {
      if (s.ten === ten) return c.viTri;
    }
  }
  return -1;
}

/** Tập tên sao ở một cung. */
export function saoTaiViTri(ls: LaSoTuVi, pos: number): Set<string> {
  const out = new Set<string>();
  const p = mod(pos, 12);
  for (const c of ls.cung) {
    if (c.viTri !== p) continue;
    for (const s of c.sao) out.add(s.ten);
  }
  return out;
}

/** Các chính tinh ở một cung, theo đúng thứ tự đã an. */
export function chinhTinhTaiViTri(ls: LaSoTuVi, pos: number): string[] {
  const p = mod(pos, 12);
  const out: string[] = [];
  for (const c of ls.cung) {
    if (c.viTri !== p) continue;
    for (const s of c.sao) {
      if (s.loai === "chinh-tinh") out.push(s.ten);
    }
  }
  return out;
}

/** Sao của cung, cung xung chiếu (+6) và hai cung tam hợp (+4, +8). */
export function saoTamPhuongTuChinh(ls: LaSoTuVi, pos: number): Set<string> {
  const out = new Set<string>();
  for (const d of [0, 4, 6, 8]) {
    for (const k of saoTaiViTri(ls, pos + d)) out.add(k);
  }
  return out;
}

/** Đúng khi tập có đủ mọi sao cần. */
export function coDu(tap: Set<string>, ...can: string[]): boolean {
  return can.every((c) => tap.has(c));
}

/**
 * Tên các chính tinh toạ thủ, nối bằng dấu phẩy. Rỗng là cung vô chính diệu.
 */
export function chinhTinhCuaCung(ls: LaSoTuVi, pos: number): string {
  return ls.cung[mod(pos, 12)].sao
    .filter((s) => s.loai === "chinh-tinh")
    .map((s) => s.ten)
    .join(", ");
}
