"""Bảng dữ liệu của lá số Tử Vi Đẩu Số.

Chép từ lõi tính Go của Nhật Nguyệt (lÃµi tÃ­nh Go cá»§a Nháº­t Nguyá»t :
tuvi_data.go, tuvi.go, tuvi_saophu.go, và các dòng tên sao của tuvung.go).
Lối an sao là lối phổ biến ở Việt Nam, phần lớn theo Tử Vi Đẩu Số Tân Biên;
chỗ các phái khác nhau được ghi tại bảng (xem ghi chú trong lõi Go).

Quy ước chỉ số như cả lá số: vị trí 0 là Tý, 11 là Hợi; can năm 0 là Giáp.
"""

from __future__ import annotations

from typing import Dict, Tuple

# Tên mười hai cung chức năng, thứ tự đếm NGHỊCH từ cung Mệnh: (Việt, Anh).
TEN_CUNG_THEO_OFFSET: Tuple[Tuple[str, str], ...] = (
    ("Mệnh", "Life Palace"),
    ("Huynh Đệ", "Siblings"),
    ("Phu Thê", "Spouse"),
    ("Tử Tức", "Children"),
    ("Tài Bạch", "Wealth"),
    ("Tật Ách", "Health"),
    ("Thiên Di", "Travel"),
    ("Nô Bộc", "Friends/Subordinates"),
    ("Quan Lộc", "Career"),
    ("Điền Trạch", "Property"),
    ("Phúc Đức", "Fortune/Virtue"),
    ("Phụ Mẫu", "Parents"),
)

# Hành nạp âm của can chi cung Mệnh sang số Cục và tên Cục.
HANH_TO_CUC: Dict[str, Tuple[int, str]] = {
    "Thủy": (2, "Thủy Nhị Cục"),
    "Mộc": (3, "Mộc Tam Cục"),
    "Kim": (4, "Kim Tứ Cục"),
    "Thổ": (5, "Thổ Ngũ Cục"),
    "Hỏa": (6, "Hỏa Lục Cục"),
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
    ("Tràng Sinh", "Growth"), ("Mộc Dục", "Bathing"), ("Quan Đới", "Youth"),
    ("Lâm Quan", "Prime"), ("Đế Vượng", "Peak"), ("Suy", "Decline"),
    ("Bệnh", "Illness"), ("Tử", "Death"), ("Mộ", "Tomb"),
    ("Tuyệt", "Extinction"), ("Thai", "Conception"), ("Dưỡng", "Nurture"),
)

TEN_VONG_THAI_TUE = (
    ("Thái Tuế", "Grand Duke"), ("Thiếu Dương", "Young Yang"), ("Tang Môn", "Mourning"),
    ("Thiếu Âm", "Young Yin"), ("Quan Phù", "Official Symbol"), ("Tử Phù", "Death Symbol"),
    ("Tuế Phá", "Year Breaker"), ("Long Đức", "Dragon Virtue"), ("Bạch Hổ", "White Tiger"),
    ("Phúc Đức", "Blessing Virtue"), ("Điếu Khách", "Mourning Guest"), ("Trực Phù", "Direct Symbol"),
)

TEN_VONG_BAC_SY = (
    ("Bác Sỹ", "Scholar"), ("Lực Sĩ", "Strongman"), ("Thanh Long", "Green Dragon"),
    ("Tiểu Hao", "Small Loss"), ("Tướng Quân", "General"), ("Tấu Thư", "Petitioner"),
    ("Phi Liêm", "Flying Blade"), ("Hỷ Thần", "Joy Deity"), ("Bệnh Phù", "Illness Symbol"),
    ("Đại Hao", "Great Loss"), ("Phục Binh", "Hidden Soldier"), ("Quan Phủ", "Magistrate"),
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

# Nhãn miếu, vượng, đắc, bình, hãm: (Việt, Anh).
DIGNITY_LABEL = {
    "M": ("Miếu", "Exalted"),
    "V": ("Vượng", "Prosperous"),
    "Đ": ("Đắc", "Favorable"),
    "B": ("Bình", "Neutral"),
    "H": ("Hãm", "Weak"),
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
