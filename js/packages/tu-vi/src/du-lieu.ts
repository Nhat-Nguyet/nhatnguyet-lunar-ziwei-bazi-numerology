// Bảng tra của Tử Vi Đẩu Số, chép từ tuvi_data.go của lõi tính Go.
//
// Thuật toán an sao theo lối phổ biến nhất ở Việt Nam (thường gọi Tử Vi Đẩu
// Số Tân Biên). Chỗ các phái khác nhau (Tứ Hóa can Canh, Tân, Nhâm; Khôi Việt
// can Canh) ghi ngay tại bảng. Chỉ số vị trí: 0 là Tý, 11 là Hợi; can 0 là
// Giáp.

import { DIA_CHI, THIEN_CAN, mod } from "./phu-thuoc.ts";

/** Một chữ có hai bản Việt và Anh. */
export interface ViEn {
  vi: string;
  en: string;
}

/** Một chữ có ba bản Việt, Anh, Trung (chữ Hán giản thể). */
export interface ViEnZh extends ViEn {
  zh: string;
}

/**
 * Tên 12 cung chức năng, offset tính NGHỊCH từ cung Mệnh: 0 là Mệnh, 1 là
 * Huynh Đệ... 11 là Phụ Mẫu.
 */
export const TEN_CUNG_THEO_OFFSET: readonly ViEnZh[] = [
  { vi: "Mệnh", en: "Life Palace", zh: "命宫" },
  { vi: "Huynh Đệ", en: "Siblings", zh: "兄弟宫" },
  { vi: "Phu Thê", en: "Spouse", zh: "夫妻宫" },
  { vi: "Tử Tức", en: "Children", zh: "子女宫" },
  { vi: "Tài Bạch", en: "Wealth", zh: "财帛宫" },
  { vi: "Tật Ách", en: "Health", zh: "疾厄宫" },
  { vi: "Thiên Di", en: "Travel", zh: "迁移宫" },
  { vi: "Nô Bộc", en: "Friends/Subordinates", zh: "奴仆宫" },
  { vi: "Quan Lộc", en: "Career", zh: "官禄宫" },
  { vi: "Điền Trạch", en: "Property", zh: "田宅宫" },
  { vi: "Phúc Đức", en: "Fortune/Virtue", zh: "福德宫" },
  { vi: "Phụ Mẫu", en: "Parents", zh: "父母宫" },
];

/** Ngũ hành nạp âm sang số cục và tên cục. */
export const HANH_TO_CUC: Readonly<Record<string, { so: number; ten: string; en: string; zh: string }>> = {
  "Thủy": { so: 2, ten: "Thủy Nhị Cục", en: "Water Two", zh: "水二局" },
  "Mộc": { so: 3, ten: "Mộc Tam Cục", en: "Wood Three", zh: "木三局" },
  "Kim": { so: 4, ten: "Kim Tứ Cục", en: "Metal Four", zh: "金四局" },
  "Thổ": { so: 5, ten: "Thổ Ngũ Cục", en: "Earth Five", zh: "土五局" },
  "Hỏa": { so: 6, ten: "Hỏa Lục Cục", en: "Fire Six", zh: "火六局" },
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
export const TEN_VONG_TRUONG_SINH: readonly ViEnZh[] = [
  { vi: "Tràng Sinh", en: "Growth", zh: "长生" }, { vi: "Mộc Dục", en: "Bathing", zh: "沐浴" }, { vi: "Quan Đới", en: "Youth", zh: "冠带" },
  { vi: "Lâm Quan", en: "Prime", zh: "临官" }, { vi: "Đế Vượng", en: "Peak", zh: "帝旺" }, { vi: "Suy", en: "Decline", zh: "衰" },
  { vi: "Bệnh", en: "Illness", zh: "病" }, { vi: "Tử", en: "Death", zh: "死" }, { vi: "Mộ", en: "Tomb", zh: "墓" },
  { vi: "Tuyệt", en: "Extinction", zh: "绝" }, { vi: "Thai", en: "Conception", zh: "胎" }, { vi: "Dưỡng", en: "Nurture", zh: "养" },
];

/** 12 sao vòng Thái Tuế, luôn đi thuận từ cung chi năm. */
export const TEN_VONG_THAI_TUE: readonly ViEnZh[] = [
  { vi: "Thái Tuế", en: "Grand Duke", zh: "太岁" }, { vi: "Thiếu Dương", en: "Young Yang", zh: "少阳" }, { vi: "Tang Môn", en: "Mourning", zh: "丧门" },
  { vi: "Thiếu Âm", en: "Young Yin", zh: "少阴" }, { vi: "Quan Phù", en: "Official Symbol", zh: "官符" }, { vi: "Tử Phù", en: "Death Symbol", zh: "死符" },
  { vi: "Tuế Phá", en: "Year Breaker", zh: "岁破" }, { vi: "Long Đức", en: "Dragon Virtue", zh: "龙德" }, { vi: "Bạch Hổ", en: "White Tiger", zh: "白虎" },
  { vi: "Phúc Đức", en: "Blessing Virtue", zh: "福德" }, { vi: "Điếu Khách", en: "Mourning Guest", zh: "吊客" }, { vi: "Trực Phù", en: "Direct Symbol", zh: "直符" },
];

/** 12 sao vòng Bác Sỹ, khởi ở cung Lộc Tồn, chiều theo âm dương nam nữ. */
export const TEN_VONG_BAC_SY: readonly ViEnZh[] = [
  { vi: "Bác Sỹ", en: "Scholar", zh: "博士" }, { vi: "Lực Sĩ", en: "Strongman", zh: "力士" }, { vi: "Thanh Long", en: "Green Dragon", zh: "青龙" },
  { vi: "Tiểu Hao", en: "Small Loss", zh: "小耗" }, { vi: "Tướng Quân", en: "General", zh: "将军" }, { vi: "Tấu Thư", en: "Petitioner", zh: "奏书" },
  { vi: "Phi Liêm", en: "Flying Blade", zh: "飞廉" }, { vi: "Hỷ Thần", en: "Joy Deity", zh: "喜神" }, { vi: "Bệnh Phù", en: "Illness Symbol", zh: "病符" },
  { vi: "Đại Hao", en: "Great Loss", zh: "大耗" }, { vi: "Phục Binh", en: "Hidden Soldier", zh: "伏兵" }, { vi: "Quan Phủ", en: "Magistrate", zh: "官府" },
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
export const DIGNITY_LABEL: Readonly<Record<string, ViEnZh>> = {
  "M": { vi: "Miếu", en: "Exalted", zh: "庙" },
  "V": { vi: "Vượng", en: "Prosperous", zh: "旺" },
  "Đ": { vi: "Đắc", en: "Favorable", zh: "得地" },
  "B": { vi: "Bình", en: "Neutral", zh: "平" },
  "H": { vi: "Hãm", en: "Weak", zh: "陷" },
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

/** Chữ Hán của 14 chính tinh (chinhTinhNameZh của Go). */
export const CHINH_TINH_NAME_ZH: Readonly<Record<string, string>> = {
  "Tử Vi": "紫微", "Thiên Cơ": "天机", "Thái Dương": "太阳", "Vũ Khúc": "武曲",
  "Thiên Đồng": "天同", "Liêm Trinh": "廉贞", "Thiên Phủ": "天府", "Thái Âm": "太阴",
  "Tham Lang": "贪狼", "Cự Môn": "巨门", "Thiên Tướng": "天相", "Thiên Lương": "天梁",
  "Thất Sát": "七杀", "Phá Quân": "破军",
};

/** Chữ Hán của 13 phụ tinh gốc (phuTinhNameZh của Go). */
export const PHU_TINH_NAME_ZH: Readonly<Record<string, string>> = {
  "Lộc Tồn": "禄存", "Kình Dương": "擎羊", "Đà La": "陀罗",
  "Thiên Khôi": "天魁", "Thiên Việt": "天钺",
  "Tả Phù": "左辅", "Hữu Bật": "右弼",
  "Văn Xương": "文昌", "Văn Khúc": "文曲",
  "Địa Không": "地空", "Địa Kiếp": "地劫",
  "Thiên Mã": "天马", "Đào Hoa": "桃花",
};

/**
 * Thuật ngữ ba thứ tiếng cần trong kết quả, chép từ TuVung (tuvung.go): can,
 * chi, Tứ Hóa, âm dương nam nữ, 30 nạp âm (hai lối viết Kim Bạch, Kim Bạc).
 * Mỗi mục [tiếng Anh, chữ Hán]. Can, chi, Tứ Hóa giữ tên Hán Việt ở bản Anh.
 */
export const TU_VUNG_KET_QUA: Readonly<Record<string, readonly [string, string]>> = {
  "Giáp": ["Giáp", "甲"], "Ất": ["Ất", "乙"], "Bính": ["Bính", "丙"], "Đinh": ["Đinh", "丁"], "Mậu": ["Mậu", "戊"],
  "Kỷ": ["Kỷ", "己"], "Canh": ["Canh", "庚"], "Tân": ["Tân", "辛"], "Nhâm": ["Nhâm", "壬"], "Quý": ["Quý", "癸"],
  "Tý": ["Tý", "子"], "Sửu": ["Sửu", "丑"], "Dần": ["Dần", "寅"], "Mão": ["Mão", "卯"], "Thìn": ["Thìn", "辰"],
  "Tỵ": ["Tỵ", "巳"], "Ngọ": ["Ngọ", "午"], "Mùi": ["Mùi", "未"], "Thân": ["Thân", "申"], "Dậu": ["Dậu", "酉"],
  "Tuất": ["Tuất", "戌"], "Hợi": ["Hợi", "亥"],
  "Hóa Lộc": ["Hóa Lộc", "化禄"], "Hóa Quyền": ["Hóa Quyền", "化权"], "Hóa Khoa": ["Hóa Khoa", "化科"], "Hóa Kỵ": ["Hóa Kỵ", "化忌"],
  "Dương Nam": ["Yang Male", "阳男"], "Âm Nam": ["Yin Male", "阴男"], "Dương Nữ": ["Yang Female", "阳女"], "Âm Nữ": ["Yin Female", "阴女"],
  "Hải Trung Kim": ["Gold in the Sea", "海中金"], "Lư Trung Hỏa": ["Fire in the Furnace", "炉中火"],
  "Đại Lâm Mộc": ["Wood of the Great Forest", "大林木"], "Lộ Bàng Thổ": ["Earth by the Roadside", "路旁土"],
  "Kiếm Phong Kim": ["Gold of the Sword Edge", "剑锋金"], "Sơn Đầu Hỏa": ["Fire on the Hilltop", "山头火"],
  "Giản Hạ Thủy": ["Water in the Ravine", "涧下水"], "Thành Đầu Thổ": ["Earth of the City Wall", "城头土"],
  "Bạch Lạp Kim": ["Gold of the White Candle", "白蜡金"], "Dương Liễu Mộc": ["Wood of the Willow", "杨柳木"],
  "Tuyền Trung Thủy": ["Water in the Spring", "泉中水"], "Ốc Thượng Thổ": ["Earth on the Roof", "屋上土"],
  "Tích Lịch Hỏa": ["Fire of the Thunderbolt", "霹雳火"], "Tùng Bách Mộc": ["Wood of Pine and Cypress", "松柏木"],
  "Trường Lưu Thủy": ["Water of the Long Stream", "长流水"], "Sa Trung Kim": ["Gold in the Sand", "沙中金"],
  "Sơn Hạ Hỏa": ["Fire at the Foot of the Hill", "山下火"], "Bình Địa Mộc": ["Wood of the Plain", "平地木"],
  "Bích Thượng Thổ": ["Earth on the Wall", "壁上土"], "Kim Bạch Kim": ["Gold of Foil", "金箔金"],
  "Kim Bạc Kim": ["Gold of Foil", "金箔金"], "Phú Đăng Hỏa": ["Fire of the Lamp", "覆灯火"],
  "Thiên Hà Thủy": ["Water of the Milky Way", "天河水"], "Đại Trạch Thổ": ["Earth of the Great Marsh", "大泽土"],
  "Thoa Xuyến Kim": ["Gold of Hairpin and Bracelet", "钗钏金"], "Tang Đố Mộc": ["Wood of the Mulberry", "桑柘木"],
  "Đại Khê Thủy": ["Water of the Great Brook", "大溪水"], "Sa Trung Thổ": ["Earth in the Sand", "沙中土"],
  "Thiên Thượng Hỏa": ["Fire in the Sky", "天上火"], "Thạch Lựu Mộc": ["Wood of the Pomegranate", "石榴木"],
  "Đại Hải Thủy": ["Water of the Great Sea", "大海水"],
};

/** Chữ Hán của một thuật ngữ hay một cặp can chi ("Bính Ngọ" ra 丙午); rỗng khi không có (zhCua của Go). */
export function zhCua(vi: string): string {
  const s = vi.trim();
  if (s === "") return "";
  const phan = s.split(/\s+/);
  if (phan.length === 2 && THIEN_CAN.includes(phan[0]) && DIA_CHI.includes(phan[1])) {
    return TU_VUNG_KET_QUA[phan[0]][1] + TU_VUNG_KET_QUA[phan[1]][1];
  }
  return TU_VUNG_KET_QUA[s]?.[1] ?? "";
}

/** Tên tiếng Anh của một thuật ngữ; rỗng khi không có (enCua của Go). */
export function enCua(vi: string): string {
  return TU_VUNG_KET_QUA[vi.trim()]?.[0] ?? "";
}

/** Tên tiếng Anh và chữ Hán của một cung theo tên Việt; rỗng khi không phải tên cung. */
export function tenCungBaThu(vi: string): { en: string; zh: string } {
  const c = TEN_CUNG_THEO_OFFSET.find((x) => x.vi === vi);
  return c ? { en: c.en, zh: c.zh } : { en: "", zh: "" };
}

/** Tên tiếng Anh và chữ Hán của một cục ("Kim Tứ Cục"); rỗng khi không phải tên cục. */
export function tenCucBaThu(ten: string): { en: string; zh: string } {
  const c = Object.values(HANH_TO_CUC).find((x) => x.ten === ten);
  return c ? { en: c.en, zh: c.zh } : { en: "", zh: "" };
}

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
