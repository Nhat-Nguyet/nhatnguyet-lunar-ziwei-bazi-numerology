// Bảng tra của Tử Vi Đẩu Số, chép từ tuvi_data.go của lõi tính Go.
//
// Thuật toán an sao theo lối phổ biến nhất ở Việt Nam (thường gọi Tử Vi Đẩu
// Số Tân Biên). Chỗ các phái khác nhau (Tứ Hóa can Canh, Tân, Nhâm; Khôi Việt
// can Canh) ghi ngay tại bảng. Chỉ số vị trí: 0 là Tý, 11 là Hợi; can 0 là
// Giáp.

import { THIEN_CAN, mod } from "./phu-thuoc.ts";

/** Một chữ có hai bản Việt và Anh. */
export interface ViEn {
  vi: string;
  en: string;
}

/**
 * Tên 12 cung chức năng, offset tính NGHỊCH từ cung Mệnh: 0 là Mệnh, 1 là
 * Huynh Đệ... 11 là Phụ Mẫu.
 */
export const TEN_CUNG_THEO_OFFSET: readonly ViEn[] = [
  { vi: "Mệnh", en: "Life Palace" },
  { vi: "Huynh Đệ", en: "Siblings" },
  { vi: "Phu Thê", en: "Spouse" },
  { vi: "Tử Tức", en: "Children" },
  { vi: "Tài Bạch", en: "Wealth" },
  { vi: "Tật Ách", en: "Health" },
  { vi: "Thiên Di", en: "Travel" },
  { vi: "Nô Bộc", en: "Friends/Subordinates" },
  { vi: "Quan Lộc", en: "Career" },
  { vi: "Điền Trạch", en: "Property" },
  { vi: "Phúc Đức", en: "Fortune/Virtue" },
  { vi: "Phụ Mẫu", en: "Parents" },
];

/** Ngũ hành nạp âm sang số cục và tên cục. */
export const HANH_TO_CUC: Readonly<Record<string, { so: number; ten: string }>> = {
  "Thủy": { so: 2, ten: "Thủy Nhị Cục" },
  "Mộc": { so: 3, ten: "Mộc Tam Cục" },
  "Kim": { so: 4, ten: "Kim Tứ Cục" },
  "Thổ": { so: 5, ten: "Thổ Ngũ Cục" },
  "Hỏa": { so: 6, ten: "Hỏa Lục Cục" },
};

/** Vị trí Lộc Tồn theo can năm (Dần, Mão, Tỵ, Ngọ, Tỵ, Ngọ, Thân, Dậu, Hợi, Tý). */
export const LOC_TON_VI_TRI: readonly number[] = [2, 3, 5, 6, 5, 6, 8, 9, 11, 0];

/**
 * Vị trí Thiên Khôi theo can năm; Thiên Việt đối xứng qua trục Dần Thân (8
 * trừ vị trí Khôi). Giáp Mậu ở Sửu Mùi, Ất Kỷ ở Tý Thân, Bính Đinh ở Hợi Dậu,
 * Canh Tân ở Ngọ Dần, Nhâm Quý ở Mão Tỵ. Dị bản: sách Trung Hoa xếp Canh cùng
 * Giáp Mậu ở Sửu Mùi.
 */
export const THIEN_KHOI_VI_TRI: readonly number[] = [1, 0, 11, 11, 1, 0, 6, 6, 3, 3];

/** Vị trí khởi Tràng Sinh theo số cục. */
export const TRANG_SINH_THEO_CUC: Readonly<Record<number, number>> = {
  6: 2, // Hỏa Lục Cục: Dần
  4: 5, // Kim Tứ Cục: Tỵ
  2: 8, // Thủy Nhị Cục: Thân
  5: 8, // Thổ Ngũ Cục: Thân
  3: 11, // Mộc Tam Cục: Hợi
};

/** 12 sao vòng Tràng Sinh theo thứ tự vòng. */
export const TEN_VONG_TRUONG_SINH: readonly ViEn[] = [
  { vi: "Tràng Sinh", en: "Growth" }, { vi: "Mộc Dục", en: "Bathing" }, { vi: "Quan Đới", en: "Youth" },
  { vi: "Lâm Quan", en: "Prime" }, { vi: "Đế Vượng", en: "Peak" }, { vi: "Suy", en: "Decline" },
  { vi: "Bệnh", en: "Illness" }, { vi: "Tử", en: "Death" }, { vi: "Mộ", en: "Tomb" },
  { vi: "Tuyệt", en: "Extinction" }, { vi: "Thai", en: "Conception" }, { vi: "Dưỡng", en: "Nurture" },
];

/** 12 sao vòng Thái Tuế, luôn đi thuận từ cung chi năm. */
export const TEN_VONG_THAI_TUE: readonly ViEn[] = [
  { vi: "Thái Tuế", en: "Grand Duke" }, { vi: "Thiếu Dương", en: "Young Yang" }, { vi: "Tang Môn", en: "Mourning" },
  { vi: "Thiếu Âm", en: "Young Yin" }, { vi: "Quan Phù", en: "Official Symbol" }, { vi: "Tử Phù", en: "Death Symbol" },
  { vi: "Tuế Phá", en: "Year Breaker" }, { vi: "Long Đức", en: "Dragon Virtue" }, { vi: "Bạch Hổ", en: "White Tiger" },
  { vi: "Phúc Đức", en: "Blessing Virtue" }, { vi: "Điếu Khách", en: "Mourning Guest" }, { vi: "Trực Phù", en: "Direct Symbol" },
];

/** 12 sao vòng Bác Sỹ, khởi ở cung Lộc Tồn, chiều theo âm dương nam nữ. */
export const TEN_VONG_BAC_SY: readonly ViEn[] = [
  { vi: "Bác Sỹ", en: "Scholar" }, { vi: "Lực Sĩ", en: "Strongman" }, { vi: "Thanh Long", en: "Green Dragon" },
  { vi: "Tiểu Hao", en: "Small Loss" }, { vi: "Tướng Quân", en: "General" }, { vi: "Tấu Thư", en: "Petitioner" },
  { vi: "Phi Liêm", en: "Flying Blade" }, { vi: "Hỷ Thần", en: "Joy Deity" }, { vi: "Bệnh Phù", en: "Illness Symbol" },
  { vi: "Đại Hao", en: "Great Loss" }, { vi: "Phục Binh", en: "Hidden Soldier" }, { vi: "Quan Phủ", en: "Magistrate" },
];

/** Hai cung Triệt Lộ Không Vong theo can năm. */
export const TRIET_THEO_CAN: readonly (readonly [number, number])[] = [
  [8, 9], [6, 7], [4, 5], [2, 3], [0, 1],
  [8, 9], [6, 7], [4, 5], [2, 3], [0, 1],
];

/** Bốn sao hóa của một can. */
export interface TuHoa {
  loc: string;
  quyen: string;
  khoa: string;
  ky: string;
}

/**
 * Tứ Hóa theo can năm. Can Canh có ba bản; bảng giữ Thiên Đồng hóa Khoa,
 * Thái Âm hóa Kỵ (Huyền Vi, Thiên Lương, Việt Viêm Tử); Tân Biên và Tử Vi Đẩu
 * Số toàn thư ghi Thái Âm Khoa, Thiên Đồng Kỵ. Can Tân, Nhâm có dị bản.
 */
export const TU_HOA_THEO_CAN: readonly TuHoa[] = [
  { loc: "Liêm Trinh", quyen: "Phá Quân", khoa: "Vũ Khúc", ky: "Thái Dương" }, // Giáp
  { loc: "Thiên Cơ", quyen: "Thiên Lương", khoa: "Tử Vi", ky: "Thái Âm" }, // Ất
  { loc: "Thiên Đồng", quyen: "Thiên Cơ", khoa: "Văn Xương", ky: "Liêm Trinh" }, // Bính
  { loc: "Thái Âm", quyen: "Thiên Đồng", khoa: "Thiên Cơ", ky: "Cự Môn" }, // Đinh
  { loc: "Tham Lang", quyen: "Thái Âm", khoa: "Hữu Bật", ky: "Thiên Cơ" }, // Mậu
  { loc: "Vũ Khúc", quyen: "Tham Lang", khoa: "Thiên Lương", ky: "Văn Khúc" }, // Kỷ
  { loc: "Thái Dương", quyen: "Vũ Khúc", khoa: "Thiên Đồng", ky: "Thái Âm" }, // Canh (ba bản)
  { loc: "Cự Môn", quyen: "Thái Dương", khoa: "Văn Khúc", ky: "Văn Xương" }, // Tân (dị bản)
  { loc: "Thiên Lương", quyen: "Tử Vi", khoa: "Tả Phù", ky: "Vũ Khúc" }, // Nhâm (dị bản)
  { loc: "Phá Quân", quyen: "Cự Môn", khoa: "Thái Âm", ky: "Tham Lang" }, // Quý
];

/** Vị trí Đào Hoa theo nhóm tam hợp của chi năm. */
export function daoHoaViTri(chiNamIdx: number): number {
  switch (mod(chiNamIdx, 4)) {
    case 0: // Thân Tý Thìn
      return 9; // Dậu
    case 2: // Dần Ngọ Tuất
      return 3; // Mão
    default:
      switch (chiNamIdx % 12) {
        case 5:
        case 9:
        case 1: // Tỵ Dậu Sửu
          return 6; // Ngọ
        default: // Hợi Mão Mùi
          return 0; // Tý
      }
  }
}

/** Vị trí Thiên Mã theo nhóm tam hợp của chi năm. */
export function thienMaViTri(chiNamIdx: number): number {
  switch (mod(chiNamIdx + 1, 4)) {
    case 1:
      return 2; // Dần
    case 2:
      return 11; // Hợi
    case 3:
      return 8; // Thân
    default:
      return 5; // Tỵ
  }
}

/** Nhãn đầy đủ của ký hiệu miếu, vượng, đắc, bình, hãm. */
export const DIGNITY_LABEL: Readonly<Record<string, ViEn>> = {
  "M": { vi: "Miếu", en: "Exalted" },
  "V": { vi: "Vượng", en: "Prosperous" },
  "Đ": { vi: "Đắc", en: "Favorable" },
  "B": { vi: "Bình", en: "Neutral" },
  "H": { vi: "Hãm", en: "Weak" },
};

/** Bảng miếu vượng đắc bình hãm của 14 chính tinh theo vị trí Tý tới Hợi. */
export const CHINH_TINH_DIGNITY: Readonly<Record<string, readonly string[]>> = {
  "Tử Vi": ["B", "Đ", "M", "B", "V", "M", "M", "Đ", "M", "B", "V", "B"],
  "Liêm Trinh": ["V", "Đ", "V", "H", "M", "H", "V", "Đ", "V", "H", "M", "H"],
  "Thiên Đồng": ["V", "H", "M", "Đ", "H", "Đ", "H", "H", "M", "H", "H", "Đ"],
  "Vũ Khúc": ["V", "M", "V", "Đ", "M", "H", "V", "M", "V", "Đ", "M", "H"],
  "Thái Dương": ["H", "Đ", "V", "V", "V", "M", "M", "Đ", "H", "H", "H", "H"],
  "Thiên Cơ": ["Đ", "Đ", "H", "M", "M", "V", "Đ", "Đ", "V", "M", "M", "H"],
  "Thiên Phủ": ["M", "B", "M", "B", "V", "Đ", "M", "Đ", "M", "B", "V", "Đ"],
  "Thái Âm": ["V", "Đ", "H", "H", "H", "H", "H", "Đ", "V", "M", "M", "M"],
  "Tham Lang": ["H", "M", "Đ", "H", "V", "H", "H", "M", "Đ", "H", "V", "H"],
  "Cự Môn": ["V", "H", "V", "M", "H", "H", "V", "H", "Đ", "M", "H", "Đ"],
  "Thiên Tướng": ["V", "Đ", "M", "H", "V", "Đ", "V", "Đ", "M", "H", "V", "Đ"],
  "Thiên Lương": ["V", "Đ", "V", "V", "M", "H", "M", "Đ", "V", "H", "M", "H"],
  "Thất Sát": ["M", "Đ", "M", "H", "H", "V", "M", "Đ", "M", "H", "H", "V"],
  "Phá Quân": ["M", "V", "H", "H", "Đ", "H", "M", "V", "H", "H", "Đ", "H"],
};

/** Tên tiếng Anh của 14 chính tinh. */
export const CHINH_TINH_NAME_EN: Readonly<Record<string, string>> = {
  "Tử Vi": "Purple Star", "Thiên Cơ": "Celestial Mechanism", "Thái Dương": "Sun",
  "Vũ Khúc": "Military Song", "Thiên Đồng": "Celestial Blessing", "Liêm Trinh": "Purity",
  "Thiên Phủ": "Celestial Treasury", "Thái Âm": "Moon", "Tham Lang": "Greedy Wolf",
  "Cự Môn": "Giant Gate", "Thiên Tướng": "Celestial General", "Thiên Lương": "Celestial Beam",
  "Thất Sát": "Seven Killings", "Phá Quân": "Army Breaker",
};

/** Tên tiếng Anh của 13 phụ tinh gốc. */
export const PHU_TINH_NAME_EN: Readonly<Record<string, string>> = {
  "Lộc Tồn": "Prosperity", "Kình Dương": "Sword Ram", "Đà La": "Spinning Camel",
  "Thiên Khôi": "Celestial Leader", "Thiên Việt": "Celestial Excellence",
  "Tả Phù": "Left Assistant", "Hữu Bật": "Right Assistant",
  "Văn Xương": "Literary Glory", "Văn Khúc": "Literary Melody",
  "Địa Không": "Earthly Void", "Địa Kiếp": "Earthly Robber",
  "Thiên Mã": "Celestial Horse", "Đào Hoa": "Peach Blossom",
};

/**
 * Tên tiếng Anh và chữ Hán giản thể của các sao cần trong gói, chép từ từ
 * vựng nghiệp vụ (tuvung.go). "Thiên Tài" không ở đây: chữ ấy trùng thuật
 * ngữ Bát Tự nên có tên riêng (xem sao-phu.ts).
 */
export const TU_VUNG_SAO: Readonly<Record<string, { en: string; zh: string }>> = {
  "Tử Vi": { en: "Purple Star", zh: "紫微" },
  "Thiên Cơ": { en: "Celestial Mechanism", zh: "天机" },
  "Thái Dương": { en: "Sun", zh: "太阳" },
  "Vũ Khúc": { en: "Military Song", zh: "武曲" },
  "Thiên Đồng": { en: "Celestial Blessing", zh: "天同" },
  "Liêm Trinh": { en: "Purity", zh: "廉贞" },
  "Thiên Phủ": { en: "Celestial Treasury", zh: "天府" },
  "Thái Âm": { en: "Moon", zh: "太阴" },
  "Tham Lang": { en: "Greedy Wolf", zh: "贪狼" },
  "Cự Môn": { en: "Giant Gate", zh: "巨门" },
  "Thiên Tướng": { en: "Celestial General", zh: "天相" },
  "Thiên Lương": { en: "Celestial Beam", zh: "天梁" },
  "Thất Sát": { en: "Seven Killings", zh: "七杀" },
  "Phá Quân": { en: "Army Breaker", zh: "破军" },
  "Tam Thai": { en: "Three Terraces", zh: "三台" },
  "Bát Tọa": { en: "Eight Seats", zh: "八座" },
  "Ân Quang": { en: "Grace Light", zh: "恩光" },
  "Thiên Quý": { en: "Celestial Nobility", zh: "天贵" },
  "Thiên Quan": { en: "Celestial Official", zh: "天官" },
  "Thiên Phúc": { en: "Celestial Fortune", zh: "天福" },
  "Thiên Thọ": { en: "Celestial Longevity", zh: "天寿" },
  "Thiên Khốc": { en: "Celestial Weeping", zh: "天哭" },
  "Thiên Hư": { en: "Celestial Emptiness", zh: "天虚" },
  "Đẩu Quân": { en: "Dipper Lord", zh: "斗君" },
};

/** Tên chữ Hán của một sao; không có trong bảng thì trả nguyên tên Việt (như DichTu của Go). */
export function saoZh(ten: string): string {
  return TU_VUNG_SAO[ten.trim()]?.zh || TU_VUNG_SAO[ten.trim()]?.en || ten;
}

/** Tên 12 cung theo thứ tự từ Mệnh, mỗi mục [Việt, Anh]. */
export function tenMuoiHaiCung(): [string, string][] {
  return TEN_CUNG_THEO_OFFSET.map((c) => [c.vi, c.en]);
}

/** 12 sao vòng Tràng Sinh theo thứ tự vòng, mỗi mục [Việt, Anh]. */
export function tenVongTruongSinh(): [string, string][] {
  return TEN_VONG_TRUONG_SINH.map((c) => [c.vi, c.en]);
}

/** Bốn sao hóa (Lộc, Quyền, Khoa, Kỵ) của một tên can; null khi không phải tên can. */
export function tuHoaCuaCan(can: string): TuHoa | null {
  const i = THIEN_CAN.indexOf(can);
  return i < 0 ? null : { ...TU_HOA_THEO_CAN[i] };
}

/** 14 chính tinh theo thứ tự chữ ổn định (như sort.Strings của Go). */
export function tenChinhTinh(): string[] {
  return Object.keys(CHINH_TINH_DIGNITY).sort((a, b) => (a < b ? -1 : a > b ? 1 : 0));
}

/** Mức sáng tối của một chính tinh ở 12 vị trí Tý tới Hợi, mỗi mục [Việt, Anh]; null khi không phải chính tinh. */
export function sangToiChinhTinh(tenSao: string): [string, string][] | null {
  const dig = CHINH_TINH_DIGNITY[tenSao];
  if (!dig) return null;
  return dig.map((k) => [DIGNITY_LABEL[k].vi, DIGNITY_LABEL[k].en]);
}
