// Thập Thần: mười quan hệ giữa Nhật Chủ và một Thiên Can khác. Chuyển ngữ
// từ lÃµi tÃ­nh Go cá»§a Nháº­t Nguyá»t thapthan.go.
//
// Bảng được SUY RA, không gõ tay một bảng 10 x 10: năm quan hệ ngũ hành
// (cùng hành, mình sinh, mình khắc, khắc mình, sinh mình) nhân hai trạng thái
// âm dương (cùng hay khác) là đúng mười thần. "Chính" là KHÁC âm dương,
// "Thiên, Thực, Tỷ, Thất Sát" là CÙNG âm dương.

import { canToNguHanh, nguHanhKhacDuoc, nguHanhSinhRa } from "./am-lich.ts";

/** Một trong mười thần. */
export interface ThapThanEntry {
  ten: string;
  tenEn: string;
  /** Chữ Hán phồn thể như bản Go (比肩, 劫財...). */
  tenHan: string;
  /** Chữ Hán giản thể (bản Go đổi bằng GianThe khi xuất tiếng Trung). */
  tenZh: string;
  /** Năm cặp: Tỷ Kiếp, Thực Thương, Tài, Quan Sát, Ấn. */
  nhom: string;
  /** Quan hệ ngũ hành, viết từ góc nhìn của Nhật Chủ. */
  quanHe: string;
  /** Đúng khi can kia cùng âm dương với Nhật Chủ. */
  cungAmDuong: boolean;
}

type LoaiQuanHe = 0 | 1 | 2 | 3 | 4;
const QH_CUNG_HANH = 0; // hai can cùng hành
const QH_MINH_SINH = 1; // hành Nhật Chủ sinh ra hành kia
const QH_MINH_KHAC = 2; // hành Nhật Chủ khắc hành kia
const QH_KHAC_MINH = 3; // hành kia khắc hành Nhật Chủ
const QH_SINH_MINH = 4; // hành kia sinh ra hành Nhật Chủ

function tt(
  ten: string,
  tenEn: string,
  tenHan: string,
  tenZh: string,
  nhom: string,
  quanHe: string,
  cungAmDuong: boolean,
): ThapThanEntry {
  return { ten, tenEn, tenHan, tenZh, nhom, quanHe, cungAmDuong };
}

// BANG[quan hệ] = [cùng âm dương, khác âm dương].
const BANG: ReadonlyArray<readonly [ThapThanEntry, ThapThanEntry]> = [
  [
    tt("Tỷ Kiên", "Friend", "比肩", "比肩", "Tỷ Kiếp", "cùng hành với Nhật Chủ", true),
    tt("Kiếp Tài", "Rob Wealth", "劫財", "劫财", "Tỷ Kiếp", "cùng hành với Nhật Chủ", false),
  ],
  [
    tt("Thực Thần", "Eating God", "食神", "食神", "Thực Thương", "Nhật Chủ sinh ra hành này", true),
    tt("Thương Quan", "Hurting Officer", "傷官", "伤官", "Thực Thương", "Nhật Chủ sinh ra hành này", false),
  ],
  [
    tt("Thiên Tài", "Indirect Wealth", "偏財", "偏财", "Tài", "Nhật Chủ khắc hành này", true),
    tt("Chính Tài", "Direct Wealth", "正財", "正财", "Tài", "Nhật Chủ khắc hành này", false),
  ],
  [
    tt("Thất Sát", "Seven Killings", "七殺", "七杀", "Quan Sát", "hành này khắc Nhật Chủ", true),
    tt("Chính Quan", "Direct Officer", "正官", "正官", "Quan Sát", "hành này khắc Nhật Chủ", false),
  ],
  [
    tt("Thiên Ấn", "Indirect Resource", "偏印", "偏印", "Ấn", "hành này sinh ra Nhật Chủ", true),
    tt("Chính Ấn", "Direct Resource", "正印", "正印", "Ấn", "hành này sinh ra Nhật Chủ", false),
  ],
];

function quanHeHanh(minh: string, khac: string): LoaiQuanHe | -1 {
  if (minh === khac) return QH_CUNG_HANH;
  if (nguHanhSinhRa(minh) === khac) return QH_MINH_SINH;
  if (nguHanhKhacDuoc(minh) === khac) return QH_MINH_KHAC;
  if (nguHanhKhacDuoc(khac) === minh) return QH_KHAC_MINH;
  if (nguHanhSinhRa(khac) === minh) return QH_SINH_MINH;
  return -1;
}

/**
 * Thần mà `can` đóng vai đối với `nhatChu` (tên can tiếng Việt). Trả null
 * khi một trong hai không phải tên thiên can: đừng coi null là "Tỷ Kiên".
 */
export function thapThanCuaCan(nhatChu: string, can: string): ThapThanEntry | null {
  const a = canToNguHanh(nhatChu);
  const b = canToNguHanh(can);
  if (!a.ok || !b.ok) return null;
  const qh = quanHeHanh(a.hanh, b.hanh);
  if (qh < 0) return null;
  return { ...BANG[qh][a.duong === b.duong ? 0 : 1] };
}

/** Đủ mười thần, từng cặp liền nhau (cùng âm dương trước), theo vòng cùng hành, mình sinh, mình khắc, khắc mình, sinh mình. */
export function allThapThan(): ThapThanEntry[] {
  const ra: ThapThanEntry[] = [];
  for (const [cung, khac] of BANG) ra.push({ ...cung }, { ...khac });
  return ra;
}
