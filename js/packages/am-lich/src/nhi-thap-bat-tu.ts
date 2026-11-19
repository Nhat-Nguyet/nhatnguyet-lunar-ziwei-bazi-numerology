// Nhị Thập Bát Tú: hai mươi tám sao gắn vào từng ngày. Chuyển ngữ từ
// lÃµi tÃ­nh Go cá»§a Nháº­t Nguyá»t nhithapbattu.go.
//
// Mốc khởi tính: ngày 21/9/2026 (thứ Hai) là sao Tâm, vị trí 4. Vòng 28 sao
// khoá cứng với tuần bảy ngày (28 chia hết cho 7): thứ của sao suy từ diệu.
// Không khai tốt xấu và con vật vì các nguồn bất đồng ở hai mục ấy.

import { jdFromDate } from "./lich.ts";

/** Một trong hai mươi tám sao. */
export interface SaoNhiThapBatTu {
  /** 0 tới 27, Giác là 0. */
  viTri: number;
  ten: string;
  tenEn: string;
  /** Một trong bốn phương, mỗi phương bảy sao. */
  chom: string;
  chomEn: string;
  /** Một trong thất diệu. */
  dieu: string;
  /** Thứ trong tuần, 0 là Chủ Nhật. */
  thu: number;
}

const DONG: readonly [string, string] = ["Thanh Long (Đông)", "Azure Dragon (East)"];
const BAC: readonly [string, string] = ["Huyền Vũ (Bắc)", "Black Tortoise (North)"];
const TAY: readonly [string, string] = ["Bạch Hổ (Tây)", "White Tiger (West)"];
const NAM: readonly [string, string] = ["Chu Tước (Nam)", "Vermilion Bird (South)"];

const BANG: ReadonlyArray<readonly [string, string, readonly [string, string], string]> = [
  ["Giác", "Horn", DONG, "Mộc"],
  ["Cang", "Neck", DONG, "Kim"],
  ["Đê", "Root", DONG, "Thổ"],
  ["Phòng", "Room", DONG, "Nhật"],
  ["Tâm", "Heart", DONG, "Nguyệt"],
  ["Vĩ", "Tail", DONG, "Hỏa"],
  ["Cơ", "Winnowing Basket", DONG, "Thủy"],
  ["Đẩu", "Dipper", BAC, "Mộc"],
  ["Ngưu", "Ox", BAC, "Kim"],
  ["Nữ", "Girl", BAC, "Thổ"],
  ["Hư", "Emptiness", BAC, "Nhật"],
  ["Nguy", "Rooftop", BAC, "Nguyệt"],
  ["Thất", "Encampment", BAC, "Hỏa"],
  ["Bích", "Wall", BAC, "Thủy"],
  ["Khuê", "Legs", TAY, "Mộc"],
  ["Lâu", "Bond", TAY, "Kim"],
  ["Vị", "Stomach", TAY, "Thổ"],
  ["Mão", "Hairy Head", TAY, "Nhật"],
  ["Tất", "Net", TAY, "Nguyệt"],
  ["Chủy", "Turtle Beak", TAY, "Hỏa"],
  ["Sâm", "Three Stars", TAY, "Thủy"],
  ["Tỉnh", "Well", NAM, "Mộc"],
  ["Quỷ", "Ghost", NAM, "Kim"],
  ["Liễu", "Willow", NAM, "Thổ"],
  ["Tinh", "Star", NAM, "Nhật"],
  ["Trương", "Extended Net", NAM, "Nguyệt"],
  ["Dực", "Wings", NAM, "Hỏa"],
  ["Chẩn", "Chariot", NAM, "Thủy"],
];

/** Mỗi diệu ứng một thứ cố định trong tuần, Chủ Nhật là 0. */
const DIEU_SANG_THU: Readonly<Record<string, number>> = {
  Nhật: 0,
  Nguyệt: 1,
  Hỏa: 2,
  Thủy: 3,
  Mộc: 4,
  Kim: 5,
  Thổ: 6,
};

const MOC_SAO_JD = jdFromDate(21, 9, 2026);
const MOC_SAO_INDEX = 4; // Tâm

/** Sao ở vị trí i (0 tới 27) của vòng. */
export function saoTheoViTri(i: number): SaoNhiThapBatTu {
  const [ten, tenEn, [chom, chomEn], dieu] = BANG[i];
  return { viTri: i, ten, tenEn, chom, chomEn, dieu, thu: DIEU_SANG_THU[dieu] };
}

/** Sao Nhị Thập Bát Tú của một ngày dương lịch. */
export function saoCuaNgay(dd: number, mm: number, yy: number): SaoNhiThapBatTu {
  const i = (((jdFromDate(dd, mm, yy) - MOC_SAO_JD + MOC_SAO_INDEX) % 28) + 28) % 28;
  return saoTheoViTri(i);
}

/** Cả hai mươi tám sao theo thứ tự vòng. */
export function allNhiThapBatTu(): SaoNhiThapBatTu[] {
  return BANG.map((_, i) => saoTheoViTri(i));
}
