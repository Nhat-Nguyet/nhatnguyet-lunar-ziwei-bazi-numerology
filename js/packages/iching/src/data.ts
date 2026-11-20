// Bảng dữ liệu Kinh Dịch, CHÉP từ lõi tính Go (coreengine:
// kinhdich.go, kinhdich_binham.go, luchao_data.go, luchao.go,
// kinhdich_quaikhi.go). Ca kiểm ca-kiem/iching.json bắt chỗ chép sai.
//
// Chỉ có TÊN GỌI và quy tắc tính. Không có Tượng, không có luận giải: đó là
// lời của site, không phát hành.

/**
 * Tám quái theo số Tiên Thiên (1 Càn ... 8 Khôn), index 0 bỏ trống:
 * [tên Việt, tên Anh (bính âm không dấu), chữ Hán, chữ Hán giản thể, bính âm có
 * dấu, ký hiệu, ba hào từ dưới lên (1 dương), tượng Việt, tượng Anh, tượng Hán
 * Việt dùng ghép tên quẻ, hành, phương Việt, phương Anh].
 */
export const QUAI: readonly (readonly [string, string, string, string, string, string, readonly [number, number, number], string, string, string, string, string, string])[] = [
  ["", "", "", "", "", "", [0, 0, 0], "", "", "", "", "", ""],
  ["Càn", "Qian", "乾", "乾", "Qián", "☰", [1, 1, 1], "Trời", "Heaven", "Thiên", "Kim", "Tây Bắc", "Northwest"],
  ["Đoài", "Dui", "兌", "兑", "Duì", "☱", [1, 1, 0], "Đầm", "Lake", "Trạch", "Kim", "Tây", "West"],
  ["Ly", "Li", "離", "离", "Lí", "☲", [1, 0, 1], "Lửa", "Fire", "Hỏa", "Hỏa", "Nam", "South"],
  ["Chấn", "Zhen", "震", "震", "Zhèn", "☳", [1, 0, 0], "Sấm", "Thunder", "Lôi", "Mộc", "Đông", "East"],
  ["Tốn", "Xun", "巽", "巽", "Xùn", "☴", [0, 1, 1], "Gió", "Wind", "Phong", "Mộc", "Đông Nam", "Southeast"],
  ["Khảm", "Kan", "坎", "坎", "Kǎn", "☵", [0, 1, 0], "Nước", "Water", "Thủy", "Thủy", "Bắc", "North"],
  ["Cấn", "Gen", "艮", "艮", "Gèn", "☶", [0, 0, 1], "Núi", "Mountain", "Sơn", "Thổ", "Đông Bắc", "Northeast"],
  ["Khôn", "Kun", "坤", "坤", "Kūn", "☷", [0, 0, 0], "Đất", "Earth", "Địa", "Thổ", "Tây Nam", "Southwest"],
];

/** Số King Wen theo [số quái thượng][số quái hạ], cả hai là số Tiên Thiên 1..8. */
export const KING_WEN: readonly (readonly number[])[] = [
  [],
  [0, 1, 10, 13, 25, 44, 6, 33, 12],
  [0, 43, 58, 49, 17, 28, 47, 31, 45],
  [0, 14, 38, 30, 21, 50, 64, 56, 35],
  [0, 34, 54, 55, 51, 32, 40, 62, 16],
  [0, 9, 61, 37, 42, 57, 59, 53, 20],
  [0, 5, 60, 63, 3, 48, 29, 39, 8],
  [0, 26, 41, 22, 27, 18, 4, 52, 23],
  [0, 11, 19, 36, 24, 46, 7, 15, 2],
];

/**
 * Tên 64 quẻ theo số King Wen, index 0 bỏ trống: [tên riêng Việt (ghép sau
 * hai tượng), chữ Hán, chữ Hán giản thể, tên Anh, bính âm có dấu].
 */
export const TEN_QUE: readonly (readonly [string, string, string, string, string])[] = [
  ["", "", "", "", ""],
  ["Càn", "乾", "乾", "The Creative", "Qián"],
  ["Khôn", "坤", "坤", "The Receptive", "Kūn"],
  ["Truân", "屯", "屯", "Difficulty at the Beginning", "Zhūn"],
  ["Mông", "蒙", "蒙", "Youthful Folly", "Méng"],
  ["Nhu", "需", "需", "Waiting", "Xū"],
  ["Tụng", "訟", "讼", "Conflict", "Sòng"],
  ["Sư", "師", "师", "The Army", "Shī"],
  ["Tỷ", "比", "比", "Holding Together", "Bǐ"],
  ["Tiểu Súc", "小畜", "小畜", "The Taming Power of the Small", "Xiǎo Chù"],
  ["Lý", "履", "履", "Treading", "Lǚ"],
  ["Thái", "泰", "泰", "Peace", "Tài"],
  ["Bĩ", "否", "否", "Standstill", "Pǐ"],
  ["Đồng Nhân", "同人", "同人", "Fellowship with Others", "Tóng Rén"],
  ["Đại Hữu", "大有", "大有", "Possession in Great Measure", "Dà Yǒu"],
  ["Khiêm", "謙", "谦", "Modesty", "Qiān"],
  ["Dự", "豫", "豫", "Enthusiasm", "Yù"],
  ["Tùy", "隨", "随", "Following", "Suí"],
  ["Cổ", "蠱", "蛊", "Work on What Has Been Spoiled", "Gǔ"],
  ["Lâm", "臨", "临", "Approach", "Lín"],
  ["Quán", "觀", "观", "Contemplation", "Guān"],
  ["Phệ Hạp", "噬嗑", "噬嗑", "Biting Through", "Shì Kè"],
  ["Bí", "賁", "贲", "Grace", "Bì"],
  ["Bác", "剝", "剥", "Splitting Apart", "Bō"],
  ["Phục", "復", "复", "Return", "Fù"],
  ["Vô Vọng", "無妄", "无妄", "Innocence", "Wú Wàng"],
  ["Đại Súc", "大畜", "大畜", "The Taming Power of the Great", "Dà Chù"],
  ["Di", "頤", "颐", "Nourishment", "Yí"],
  ["Đại Quá", "大過", "大过", "Preponderance of the Great", "Dà Guò"],
  ["Khảm", "坎", "坎", "The Abysmal", "Kǎn"],
  ["Ly", "離", "离", "The Clinging", "Lí"],
  ["Hàm", "咸", "咸", "Influence", "Xián"],
  ["Hằng", "恆", "恒", "Duration", "Héng"],
  ["Độn", "遯", "遁", "Retreat", "Dùn"],
  ["Đại Tráng", "大壯", "大壮", "The Power of the Great", "Dà Zhuàng"],
  ["Tấn", "晉", "晋", "Progress", "Jìn"],
  ["Minh Di", "明夷", "明夷", "Darkening of the Light", "Míng Yí"],
  ["Gia Nhân", "家人", "家人", "The Family", "Jiā Rén"],
  ["Khuê", "睽", "睽", "Opposition", "Kuí"],
  ["Kiển", "蹇", "蹇", "Obstruction", "Jiǎn"],
  ["Giải", "解", "解", "Deliverance", "Xiè"],
  ["Tổn", "損", "损", "Decrease", "Sǔn"],
  ["Ích", "益", "益", "Increase", "Yì"],
  ["Quải", "夬", "夬", "Breakthrough", "Guài"],
  ["Cấu", "姤", "姤", "Coming to Meet", "Gòu"],
  ["Tụy", "萃", "萃", "Gathering Together", "Cuì"],
  ["Thăng", "升", "升", "Pushing Upward", "Shēng"],
  ["Khốn", "困", "困", "Oppression", "Kùn"],
  ["Tỉnh", "井", "井", "The Well", "Jǐng"],
  ["Cách", "革", "革", "Revolution", "Gé"],
  ["Đỉnh", "鼎", "鼎", "The Cauldron", "Dǐng"],
  ["Chấn", "震", "震", "The Arousing", "Zhèn"],
  ["Cấn", "艮", "艮", "Keeping Still", "Gèn"],
  ["Tiệm", "漸", "渐", "Gradual Progress", "Jiàn"],
  ["Quy Muội", "歸妹", "归妹", "The Marrying Maiden", "Guī Mèi"],
  ["Phong", "豐", "丰", "Abundance", "Fēng"],
  ["Lữ", "旅", "旅", "The Wanderer", "Lǚ"],
  ["Tốn", "巽", "巽", "The Gentle", "Xùn"],
  ["Đoài", "兌", "兑", "The Joyous", "Duì"],
  ["Hoán", "渙", "涣", "Dispersion", "Huàn"],
  ["Tiết", "節", "节", "Limitation", "Jié"],
  ["Trung Phu", "中孚", "中孚", "Inner Truth", "Zhōng Fú"],
  ["Tiểu Quá", "小過", "小过", "Preponderance of the Small", "Xiǎo Guò"],
  ["Ký Tế", "既濟", "既济", "After Completion", "Jì Jì"],
  ["Vị Tế", "未濟", "未济", "Before Completion", "Wèi Jì"],
];

/** Tám vị trí trong một cung (bát cung Kinh Phòng): [Việt, Anh, Trung]. */
export const VI_TRI_CUNG: readonly (readonly [string, string, string])[] = [
  ["Bát thuần", "Pure", "八纯"],
  ["Nhất thế", "First generation", "一世"],
  ["Nhị thế", "Second generation", "二世"],
  ["Tam thế", "Third generation", "三世"],
  ["Tứ thế", "Fourth generation", "四世"],
  ["Ngũ thế", "Fifth generation", "五世"],
  ["Du hồn", "Wandering soul", "游魂"],
  ["Quy hồn", "Returning soul", "归魂"],
];

/** Hào Thế theo vị trí trong cung; hào Ứng cách Thế ba hào. */
export const THE_THEO_VI_TRI: readonly number[] = [6, 1, 2, 3, 4, 5, 4, 3];

/** Thứ tự tám cung (số Tiên Thiên): Càn Khảm Cấn Chấn Tốn Ly Khôn Đoài. */
export const THU_TU_CUNG: readonly number[] = [1, 6, 7, 4, 5, 3, 8, 2];

/**
 * Nạp giáp theo số quái: [can nội, can ngoại, chi hào sơ khi ở nội, chi hào tứ
 * khi ở ngoại, đi thuận]. Chi đi bước 2: quái dương thuận, quái âm nghịch.
 */
export const NAP_GIAP: readonly (readonly [string, string, number, number, boolean])[] = [
  ["", "", 0, 0, true],
  ["Giáp", "Nhâm", 0, 6, true],
  ["Đinh", "Đinh", 5, 11, false],
  ["Kỷ", "Kỷ", 3, 9, false],
  ["Canh", "Canh", 0, 6, true],
  ["Tân", "Tân", 1, 7, false],
  ["Mậu", "Mậu", 2, 8, true],
  ["Bính", "Bính", 4, 10, true],
  ["Ất", "Quý", 7, 1, false],
];

/** Lục thân: tên Việt, Anh, Trung. */
export const LUC_THAN: Readonly<Record<string, readonly [string, string]>> = {
  "Phụ Mẫu": ["Parent", "父母"],
  "Huynh Đệ": ["Sibling", "兄弟"],
  "Tử Tôn": ["Offspring", "子孙"],
  "Thê Tài": ["Wealth", "妻财"],
  "Quan Quỷ": ["Officer/Ghost", "官鬼"],
};

/** Lục thú theo vòng từ Thanh Long: [Việt, Anh, Trung]. */
export const LUC_THU: readonly (readonly [string, string, string])[] = [
  ["Thanh Long", "Azure Dragon", "青龙"],
  ["Chu Tước", "Vermilion Bird", "朱雀"],
  ["Câu Trần", "Hooked Chen", "勾陈"],
  ["Đằng Xà", "Soaring Snake", "腾蛇"],
  ["Bạch Hổ", "White Tiger", "白虎"],
  ["Huyền Vũ", "Dark Warrior", "玄武"],
];

/** Khởi lục thú ở hào sơ theo chỉ số can ngày (Giáp 0 ... Quý 9). */
export const KHOI_LUC_THU: readonly number[] = [0, 0, 1, 1, 2, 3, 4, 4, 5, 5];

/** Trạng thái theo nguyệt lệnh: mã Việt, Anh, Trung. */
export const TRANG_THAI: Readonly<Record<string, readonly [string, string]>> = {
  "vượng": ["prospering", "旺"],
  "tướng": ["supported", "相"],
  "hưu": ["resting", "休"],
  "tù": ["trapped", "囚"],
  "tử": ["dead", "死"],
};

/** Ngũ hành sinh: hành ở khoá sinh ra hành ở giá trị. */
export const SINH: Readonly<Record<string, string>> = { "Mộc": "Hỏa", "Hỏa": "Thổ", "Thổ": "Kim", "Kim": "Thủy", "Thủy": "Mộc" };
/** Ngũ hành khắc: hành ở khoá khắc hành ở giá trị. */
export const KHAC: Readonly<Record<string, string>> = { "Mộc": "Thổ", "Thổ": "Thủy", "Thủy": "Hỏa", "Hỏa": "Kim", "Kim": "Mộc" };

/**
 * Sáu mươi quẻ luân trị theo phép Quái khí (Mạnh Hỷ), số King Wen, từ Trung
 * Phu lúc Đông chí; mỗi dòng năm quẻ của một tháng khí.
 */
export const THU_TU_QUAI_KHI: readonly number[] = [
  61, 24, 3, 15, 38,
  46, 19, 62, 4, 42,
  53, 11, 5, 17, 35,
  40, 34, 16, 6, 18,
  49, 43, 56, 7, 8,
  9, 1, 14, 37, 48,
  31, 44, 50, 55, 59,
  10, 33, 32, 60, 13,
  41, 12, 57, 45, 26,
  22, 20, 54, 25, 36,
  47, 23, 52, 63, 21,
  28, 2, 64, 39, 27,
];

/** Bốn quẻ tứ chính theo thứ tự trị mùa từ Đông chí: Khảm, Chấn, Ly, Đoài. */
export const TU_CHINH: readonly number[] = [29, 51, 30, 58];

/** Vai của năm quẻ trong một tháng khí: [Việt, Anh, Trung]. */
export const VAI_TRO_QUAI_KHI: readonly (readonly [string, string, string])[] = [
  ["công", "duke", "公"],
  ["tích", "sovereign", "辟"],
  ["hầu", "marquis", "侯"],
  ["đại phu", "grand master", "大夫"],
  ["khanh", "minister", "卿"],
];

/** Mã phép xếp quẻ trị ngày (MoHinhQuaiKhi của lõi tính). */
export const MO_HINH_QUAI_KHI = "quai-khi-manh-hy-6-ngay-7-phan-v1";
/** Một quẻ trị 6 ngày 7 phần, một ngày 80 phần: 8.766 phút. */
export const PHUT_MOI_QUE = 6 * 1440 + (7 * 1440) / 80;
/** Biên sai số mốc Đông chí (phút) cộng một: dưới ngưỡng này là sát giao quẻ. */
export const NGUONG_SAT_GIAO_QUE_PHUT = 2;
