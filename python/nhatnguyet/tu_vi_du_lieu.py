"""Bảng dữ liệu của lá số Tử Vi Đẩu Số.

Chép từ lõi tính Go của Nhật Nguyệt (lõi tính Go của Nhật Nguyệt :
tuvi_data.go, tuvi.go, tuvi_saophu.go, và các dòng tên sao của tuvung.go).
Lối an sao là lối phổ biến ở Việt Nam, phần lớn theo Tử Vi Đẩu Số Tân Biên;
chỗ các phái khác nhau được ghi tại bảng (xem ghi chú trong lõi Go).

Quy ước chỉ số như cả lá số: vị trí 0 là Tý, 11 là Hợi; can năm 0 là Giáp.
"""

from __future__ import annotations

from typing import Dict, Tuple

# Tên mười hai cung chức năng, thứ tự đếm NGHỊCH từ cung Mệnh: (Việt, Anh, chữ Hán).
TEN_CUNG_THEO_OFFSET: Tuple[Tuple[str, str, str], ...] = (
    ("Mệnh", "Life Palace", "命宫"),
    ("Huynh Đệ", "Siblings", "兄弟宫"),
    ("Phu Thê", "Spouse", "夫妻宫"),
    ("Tử Tức", "Children", "子女宫"),
    ("Tài Bạch", "Wealth", "财帛宫"),
    ("Tật Ách", "Health", "疾厄宫"),
    ("Thiên Di", "Travel", "迁移宫"),
    ("Nô Bộc", "Friends/Subordinates", "奴仆宫"),
    ("Quan Lộc", "Career", "官禄宫"),
    ("Điền Trạch", "Property", "田宅宫"),
    ("Phúc Đức", "Fortune/Virtue", "福德宫"),
    ("Phụ Mẫu", "Parents", "父母宫"),
)

# Hành nạp âm của can chi cung Mệnh sang số Cục và tên Cục.
HANH_TO_CUC: Dict[str, Tuple[int, str]] = {
    "Thủy": (2, "Thủy Nhị Cục"),
    "Mộc": (3, "Mộc Tam Cục"),
    "Kim": (4, "Kim Tứ Cục"),
    "Thổ": (5, "Thổ Ngũ Cục"),
    "Hỏa": (6, "Hỏa Lục Cục"),
}

# Tên tiếng Anh và chữ Hán của năm cục (TuVung của lõi Go).
TEN_CUC_BA_THU: Dict[str, Tuple[str, str]] = {
    "Thủy Nhị Cục": ("Water Two", "水二局"),
    "Mộc Tam Cục": ("Wood Three", "木三局"),
    "Kim Tứ Cục": ("Metal Four", "金四局"),
    "Thổ Ngũ Cục": ("Earth Five", "土五局"),
    "Hỏa Lục Cục": ("Fire Six", "火六局"),
}

# Vị trí Lộc Tồn theo can năm (Giáp..Quý): Dần, Mão, Tỵ, Ngọ, Tỵ, Ngọ, Thân, Dậu, Hợi, Tý.
LOC_TON_VI_TRI = (2, 3, 5, 6, 5, 6, 8, 9, 11, 0)

# Vị trí Thiên Khôi theo can năm; Thiên Việt đối xứng qua trục Dần Thân (8 trừ vị trí Khôi).
# Lối phổ biến ở Việt Nam: Giáp Mậu Sửu Mùi, Ất Kỷ Tý Thân, Bính Đinh Hợi Dậu,
# Canh Tân Ngọ Dần, Nhâm Quý Mão Tỵ (chi trước là Khôi).
THIEN_KHOI_VI_TRI = (1, 0, 11, 11, 1, 0, 6, 6, 3, 3)

# Vị trí khởi Tràng Sinh theo số Cục.
TRANG_SINH_THEO_CUC = {6: 2, 4: 5, 2: 8, 5: 8, 3: 11}

TEN_VONG_TRUONG_SINH = (
    ("Tràng Sinh", "Growth", "长生"), ("Mộc Dục", "Bathing", "沐浴"), ("Quan Đới", "Youth", "冠带"),
    ("Lâm Quan", "Prime", "临官"), ("Đế Vượng", "Peak", "帝旺"), ("Suy", "Decline", "衰"),
    ("Bệnh", "Illness", "病"), ("Tử", "Death", "死"), ("Mộ", "Tomb", "墓"),
    ("Tuyệt", "Extinction", "绝"), ("Thai", "Conception", "胎"), ("Dưỡng", "Nurture", "养"),
)

TEN_VONG_THAI_TUE = (
    ("Thái Tuế", "Grand Duke", "太岁"), ("Thiếu Dương", "Young Yang", "少阳"), ("Tang Môn", "Mourning", "丧门"),
    ("Thiếu Âm", "Young Yin", "少阴"), ("Quan Phù", "Official Symbol", "官符"), ("Tử Phù", "Death Symbol", "死符"),
    ("Tuế Phá", "Year Breaker", "岁破"), ("Long Đức", "Dragon Virtue", "龙德"), ("Bạch Hổ", "White Tiger", "白虎"),
    ("Phúc Đức", "Blessing Virtue", "福德"), ("Điếu Khách", "Mourning Guest", "吊客"), ("Trực Phù", "Direct Symbol", "直符"),
)

TEN_VONG_BAC_SY = (
    ("Bác Sỹ", "Scholar", "博士"), ("Lực Sĩ", "Strongman", "力士"), ("Thanh Long", "Green Dragon", "青龙"),
    ("Tiểu Hao", "Small Loss", "小耗"), ("Tướng Quân", "General", "将军"), ("Tấu Thư", "Petitioner", "奏书"),
    ("Phi Liêm", "Flying Blade", "飞廉"), ("Hỷ Thần", "Joy Deity", "喜神"), ("Bệnh Phù", "Illness Symbol", "病符"),
    ("Đại Hao", "Great Loss", "大耗"), ("Phục Binh", "Hidden Soldier", "伏兵"), ("Quan Phủ", "Magistrate", "官府"),
)

# Hai cung Triệt Lộ Không Vong theo can năm.
TRIET_THEO_CAN = (
    (8, 9), (6, 7), (4, 5), (2, 3), (0, 1),
    (8, 9), (6, 7), (4, 5), (2, 3), (0, 1),
)

# Tứ Hóa theo can năm: (Lộc, Quyền, Khoa, Kỵ). Canh, Tân, Nhâm có dị bản giữa
# các phái; bảng giữ đúng lựa chọn của lõi Go (Canh: Thiên Đồng Khoa, Thái Âm Kỵ).
TU_HOA_THEO_CAN = (
    ("Liêm Trinh", "Phá Quân", "Vũ Khúc", "Thái Dương"),    # Giáp
    ("Thiên Cơ", "Thiên Lương", "Tử Vi", "Thái Âm"),        # Ất
    ("Thiên Đồng", "Thiên Cơ", "Văn Xương", "Liêm Trinh"),  # Bính
    ("Thái Âm", "Thiên Đồng", "Thiên Cơ", "Cự Môn"),        # Đinh
    ("Tham Lang", "Thái Âm", "Hữu Bật", "Thiên Cơ"),        # Mậu
    ("Vũ Khúc", "Tham Lang", "Thiên Lương", "Văn Khúc"),    # Kỷ
    ("Thái Dương", "Vũ Khúc", "Thiên Đồng", "Thái Âm"),     # Canh (có ba bản)
    ("Cự Môn", "Thái Dương", "Văn Khúc", "Văn Xương"),      # Tân (có dị bản)
    ("Thiên Lương", "Tử Vi", "Tả Phù", "Vũ Khúc"),          # Nhâm (có dị bản)
    ("Phá Quân", "Cự Môn", "Thái Âm", "Tham Lang"),         # Quý
)

TEN_HOA = ("Hóa Lộc", "Hóa Quyền", "Hóa Khoa", "Hóa Kỵ")

# Nhãn miếu, vượng, đắc, bình, hãm: (Việt, Anh, chữ Hán).
DIGNITY_LABEL = {
    "M": ("Miếu", "Exalted", "庙"),
    "V": ("Vượng", "Prosperous", "旺"),
    "Đ": ("Đắc", "Favorable", "得地"),
    "B": ("Bình", "Neutral", "平"),
    "H": ("Hãm", "Weak", "陷"),
}

# Bảng miếu vượng đắc bình hãm của 14 chính tinh theo vị trí Tý..Hợi.
CHINH_TINH_DIGNITY: Dict[str, Tuple[str, ...]] = {
    "Tử Vi": ("B", "Đ", "M", "B", "V", "M", "M", "Đ", "M", "B", "V", "B"),
    "Liêm Trinh": ("V", "Đ", "V", "H", "M", "H", "V", "Đ", "V", "H", "M", "H"),
    "Thiên Đồng": ("V", "H", "M", "Đ", "H", "Đ", "H", "H", "M", "H", "H", "Đ"),
    "Vũ Khúc": ("V", "M", "V", "Đ", "M", "H", "V", "M", "V", "Đ", "M", "H"),
    "Thái Dương": ("H", "Đ", "V", "V", "V", "M", "M", "Đ", "H", "H", "H", "H"),
    "Thiên Cơ": ("Đ", "Đ", "H", "M", "M", "V", "Đ", "Đ", "V", "M", "M", "H"),
    "Thiên Phủ": ("M", "B", "M", "B", "V", "Đ", "M", "Đ", "M", "B", "V", "Đ"),
    "Thái Âm": ("V", "Đ", "H", "H", "H", "H", "H", "Đ", "V", "M", "M", "M"),
    "Tham Lang": ("H", "M", "Đ", "H", "V", "H", "H", "M", "Đ", "H", "V", "H"),
    "Cự Môn": ("V", "H", "V", "M", "H", "H", "V", "H", "Đ", "M", "H", "Đ"),
    "Thiên Tướng": ("V", "Đ", "M", "H", "V", "Đ", "V", "Đ", "M", "H", "V", "Đ"),
    "Thiên Lương": ("V", "Đ", "V", "V", "M", "H", "M", "Đ", "V", "H", "M", "H"),
    "Thất Sát": ("M", "Đ", "M", "H", "H", "V", "M", "Đ", "M", "H", "H", "V"),
    "Phá Quân": ("M", "V", "H", "H", "Đ", "H", "M", "V", "H", "H", "Đ", "H"),
}

# Mười bốn chính tinh theo thứ tự an trên lá số.
TEN_CHINH_TINH = (
    "Tử Vi", "Thiên Cơ", "Thái Dương", "Vũ Khúc", "Thiên Đồng", "Liêm Trinh",
    "Thiên Phủ", "Thái Âm", "Tham Lang", "Cự Môn", "Thiên Tướng", "Thiên Lương",
    "Thất Sát", "Phá Quân",
)

# Chòm Tử Vi đi NGHỊCH từ Tử Vi; chòm Thiên Phủ đi THUẬN từ Thiên Phủ: (tên, số bước).
CHOM_TU_VI = (
    ("Tử Vi", 0), ("Thiên Cơ", -1), ("Thái Dương", -3),
    ("Vũ Khúc", -4), ("Thiên Đồng", -5), ("Liêm Trinh", -8),
)
CHOM_THIEN_PHU = (
    ("Thiên Phủ", 0), ("Thái Âm", 1), ("Tham Lang", 2), ("Cự Môn", 3),
    ("Thiên Tướng", 4), ("Thiên Lương", 5), ("Thất Sát", 6), ("Phá Quân", 10),
)

# Tên tiếng Anh và chữ Hán (giản thể) của 14 chính tinh.
CHINH_TINH_NAME_EN = {
    "Tử Vi": "Purple Star", "Thiên Cơ": "Celestial Mechanism", "Thái Dương": "Sun",
    "Vũ Khúc": "Military Song", "Thiên Đồng": "Celestial Blessing", "Liêm Trinh": "Purity",
    "Thiên Phủ": "Celestial Treasury", "Thái Âm": "Moon", "Tham Lang": "Greedy Wolf",
    "Cự Môn": "Giant Gate", "Thiên Tướng": "Celestial General", "Thiên Lương": "Celestial Beam",
    "Thất Sát": "Seven Killings", "Phá Quân": "Army Breaker",
}
CHINH_TINH_NAME_ZH = {
    "Tử Vi": "紫微", "Thiên Cơ": "天机", "Thái Dương": "太阳", "Vũ Khúc": "武曲",
    "Thiên Đồng": "天同", "Liêm Trinh": "廉贞", "Thiên Phủ": "天府", "Thái Âm": "太阴",
    "Tham Lang": "贪狼", "Cự Môn": "巨门", "Thiên Tướng": "天相", "Thiên Lương": "天梁",
    "Thất Sát": "七杀", "Phá Quân": "破军",
}

# Mười ba phụ tinh an từ đầu, theo thứ tự an trên lá số.
TEN_PHU_TINH = (
    "Lộc Tồn", "Kình Dương", "Đà La", "Thiên Khôi", "Thiên Việt",
    "Tả Phù", "Hữu Bật", "Văn Xương", "Văn Khúc", "Địa Không", "Địa Kiếp", "Thiên Mã", "Đào Hoa",
)
PHU_TINH_NAME_EN = {
    "Lộc Tồn": "Prosperity", "Kình Dương": "Sword Ram", "Đà La": "Spinning Camel",
    "Thiên Khôi": "Celestial Leader", "Thiên Việt": "Celestial Excellence",
    "Tả Phù": "Left Assistant", "Hữu Bật": "Right Assistant",
    "Văn Xương": "Literary Glory", "Văn Khúc": "Literary Melody",
    "Địa Không": "Earthly Void", "Địa Kiếp": "Earthly Robber",
    "Thiên Mã": "Celestial Horse", "Đào Hoa": "Peach Blossom",
}

PHU_TINH_NAME_ZH = {
    "Lộc Tồn": "禄存", "Kình Dương": "擎羊", "Đà La": "陀罗",
    "Thiên Khôi": "天魁", "Thiên Việt": "天钺",
    "Tả Phù": "左辅", "Hữu Bật": "右弼",
    "Văn Xương": "文昌", "Văn Khúc": "文曲",
    "Địa Không": "地空", "Địa Kiếp": "地劫",
    "Thiên Mã": "天马", "Đào Hoa": "桃花",
}

# Mười một phụ tinh thêm 26/09/2026, theo thứ tự in, kèm (tên Anh, chữ Hán).
TEN_SAO_PHU_MOI = (
    "Tam Thai", "Bát Tọa", "Ân Quang", "Thiên Quý", "Thiên Quan", "Thiên Phúc",
    "Thiên Tài", "Thiên Thọ", "Thiên Khốc", "Thiên Hư", "Đẩu Quân",
)
TEN_SAO_PHU_MOI_BA_THU = {
    "Tam Thai": ("Three Terraces", "三台"),
    "Bát Tọa": ("Eight Seats", "八座"),
    "Ân Quang": ("Grace Light", "恩光"),
    "Thiên Quý": ("Celestial Nobility", "天贵"),
    "Thiên Quan": ("Celestial Official", "天官"),
    "Thiên Phúc": ("Celestial Fortune", "天福"),
    # "Thiên Tài" của Tử Vi là 天才, khác "Thiên Tài" của Bát Tự và thước Lỗ Ban.
    "Thiên Tài": ("Celestial Talent", "天才"),
    "Thiên Thọ": ("Celestial Longevity", "天寿"),
    "Thiên Khốc": ("Celestial Weeping", "天哭"),
    "Thiên Hư": ("Celestial Emptiness", "天虚"),
    "Đẩu Quân": ("Dipper Lord", "斗君"),
}

# Bảng tra theo can năm (Giáp..Quý) của Thiên Quan, Thiên Phúc (Đẩu số tinh thành tr. 39).
THIEN_QUAN_VI_TRI = (7, 4, 5, 2, 3, 9, 11, 9, 10, 6)
THIEN_PHUC_VI_TRI = (9, 8, 0, 11, 3, 2, 6, 5, 6, 5)


# Thuật ngữ ba thứ tiếng cần trong kết quả, chép từ TuVung (tuvung.go): can, chi,
# Tứ Hóa, âm dương nam nữ, 30 nạp âm (hai lối viết Kim Bạch, Kim Bạc). Mỗi mục
# (tiếng Anh, chữ Hán). Can, chi, Tứ Hóa giữ tên Hán Việt ở bản Anh.
TU_VUNG_KET_QUA: Dict[str, Tuple[str, str]] = {
    "Giáp": ("Giáp", "甲"), "Ất": ("Ất", "乙"), "Bính": ("Bính", "丙"), "Đinh": ("Đinh", "丁"), "Mậu": ("Mậu", "戊"),
    "Kỷ": ("Kỷ", "己"), "Canh": ("Canh", "庚"), "Tân": ("Tân", "辛"), "Nhâm": ("Nhâm", "壬"), "Quý": ("Quý", "癸"),
    "Tý": ("Tý", "子"), "Sửu": ("Sửu", "丑"), "Dần": ("Dần", "寅"), "Mão": ("Mão", "卯"), "Thìn": ("Thìn", "辰"),
    "Tỵ": ("Tỵ", "巳"), "Ngọ": ("Ngọ", "午"), "Mùi": ("Mùi", "未"), "Thân": ("Thân", "申"), "Dậu": ("Dậu", "酉"),
    "Tuất": ("Tuất", "戌"), "Hợi": ("Hợi", "亥"),
    "Hóa Lộc": ("Hóa Lộc", "化禄"), "Hóa Quyền": ("Hóa Quyền", "化权"),
    "Hóa Khoa": ("Hóa Khoa", "化科"), "Hóa Kỵ": ("Hóa Kỵ", "化忌"),
    "Dương Nam": ("Yang Male", "阳男"), "Âm Nam": ("Yin Male", "阴男"),
    "Dương Nữ": ("Yang Female", "阳女"), "Âm Nữ": ("Yin Female", "阴女"),
    "Hải Trung Kim": ("Gold in the Sea", "海中金"), "Lư Trung Hỏa": ("Fire in the Furnace", "炉中火"),
    "Đại Lâm Mộc": ("Wood of the Great Forest", "大林木"), "Lộ Bàng Thổ": ("Earth by the Roadside", "路旁土"),
    "Kiếm Phong Kim": ("Gold of the Sword Edge", "剑锋金"), "Sơn Đầu Hỏa": ("Fire on the Hilltop", "山头火"),
    "Giản Hạ Thủy": ("Water in the Ravine", "涧下水"), "Thành Đầu Thổ": ("Earth of the City Wall", "城头土"),
    "Bạch Lạp Kim": ("Gold of the White Candle", "白蜡金"), "Dương Liễu Mộc": ("Wood of the Willow", "杨柳木"),
    "Tuyền Trung Thủy": ("Water in the Spring", "泉中水"), "Ốc Thượng Thổ": ("Earth on the Roof", "屋上土"),
    "Tích Lịch Hỏa": ("Fire of the Thunderbolt", "霹雳火"), "Tùng Bách Mộc": ("Wood of Pine and Cypress", "松柏木"),
    "Trường Lưu Thủy": ("Water of the Long Stream", "长流水"), "Sa Trung Kim": ("Gold in the Sand", "沙中金"),
    "Sơn Hạ Hỏa": ("Fire at the Foot of the Hill", "山下火"), "Bình Địa Mộc": ("Wood of the Plain", "平地木"),
    "Bích Thượng Thổ": ("Earth on the Wall", "壁上土"), "Kim Bạch Kim": ("Gold of Foil", "金箔金"),
    "Kim Bạc Kim": ("Gold of Foil", "金箔金"), "Phú Đăng Hỏa": ("Fire of the Lamp", "覆灯火"),
    "Thiên Hà Thủy": ("Water of the Milky Way", "天河水"), "Đại Trạch Thổ": ("Earth of the Great Marsh", "大泽土"),
    "Thoa Xuyến Kim": ("Gold of Hairpin and Bracelet", "钗钏金"), "Tang Đố Mộc": ("Wood of the Mulberry", "桑柘木"),
    "Đại Khê Thủy": ("Water of the Great Brook", "大溪水"), "Sa Trung Thổ": ("Earth in the Sand", "沙中土"),
    "Thiên Thượng Hỏa": ("Fire in the Sky", "天上火"), "Thạch Lựu Mộc": ("Wood of the Pomegranate", "石榴木"),
    "Đại Hải Thủy": ("Water of the Great Sea", "大海水"),
}

_CAN = ("Giáp", "Ất", "Bính", "Đinh", "Mậu", "Kỷ", "Canh", "Tân", "Nhâm", "Quý")
_CHI = ("Tý", "Sửu", "Dần", "Mão", "Thìn", "Tỵ", "Ngọ", "Mùi", "Thân", "Dậu", "Tuất", "Hợi")


def zh_cua(vi: str) -> str:
    """Chữ Hán của một thuật ngữ hay một cặp can chi ("Bính Ngọ" ra 丙午);
    rỗng khi không có (zhCua của lõi Go)."""
    s = vi.strip()
    if not s:
        return ""
    phan = s.split()
    if len(phan) == 2 and phan[0] in _CAN and phan[1] in _CHI:
        return TU_VUNG_KET_QUA[phan[0]][1] + TU_VUNG_KET_QUA[phan[1]][1]
    t = TU_VUNG_KET_QUA.get(s)
    return t[1] if t else ""


def en_cua(vi: str) -> str:
    """Tên tiếng Anh của một thuật ngữ; rỗng khi không có (enCua của lõi Go)."""
    t = TU_VUNG_KET_QUA.get(vi.strip())
    return t[0] if t else ""


def ten_cung_ba_thu(vi: str) -> Tuple[str, str]:
    """(tiếng Anh, chữ Hán) của một cung theo tên Việt; rỗng khi không phải tên cung."""
    for c_vi, c_en, c_zh in TEN_CUNG_THEO_OFFSET:
        if c_vi == vi:
            return c_en, c_zh
    return "", ""


def ten_sao_tu_vi_ba_thu(ten: str) -> Tuple[str, str]:
    """(tiếng Anh, chữ Hán) của một sao Tử Vi, tra đúng các bảng an sao."""
    if ten in CHINH_TINH_NAME_EN:
        return CHINH_TINH_NAME_EN[ten], CHINH_TINH_NAME_ZH[ten]
    if ten in PHU_TINH_NAME_EN:
        return PHU_TINH_NAME_EN[ten], PHU_TINH_NAME_ZH[ten]
    if ten in TEN_SAO_PHU_MOI_BA_THU:
        return TEN_SAO_PHU_MOI_BA_THU[ten]
    for bang in (TEN_VONG_TRUONG_SINH, TEN_VONG_THAI_TUE, TEN_VONG_BAC_SY):
        for vi, en, zh in bang:
            if vi == ten:
                return en, zh
    return "", ""


def noi_ten_sao(vi: str) -> Tuple[str, str]:
    """Nối tên sao ba thứ tiếng theo chuỗi Việt "A, B": Anh nối ", ", Trung nối "、"."""
    if not vi:
        return "", ""
    phan = [ten_sao_tu_vi_ba_thu(p) for p in vi.split(", ")]
    return ", ".join(p[0] for p in phan), "、".join(p[1] for p in phan)
