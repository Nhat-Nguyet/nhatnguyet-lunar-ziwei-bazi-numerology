"""Chữ tiếng Anh của lớp API tiếng Anh Tử Vi (bản Python của
``js/packages/tu-vi/src/ten-en.ts``): tên tiếng Anh của cách cục, vài tên sao
tiếng Anh sửa theo cách sách tiếng Anh gọi, tên chữ Hán bị cắt cụt của hai
cách cục, bảng thay chữ Việt còn sót trong câu tiếng Anh của lõi. Bảng của lõi
không đổi (ca kiểm so đúng bảng ấy); đây chỉ là lớp trình bày.
"""

from __future__ import annotations

from typing import Dict, Tuple

from .tu_vi_du_lieu import CHINH_TINH_NAME_EN, PHU_TINH_NAME_EN, TEN_CUNG_THEO_OFFSET, TEN_SAO_PHU_MOI_BA_THU

# Đà La 陀羅 "Spinning Top" (lõi: Spinning Camel); Thiên Tướng 天相 "Celestial
# Minister" (lõi: Celestial General); Thiên Việt 天鉞 "Celestial Halberd"
# (lõi: Celestial Excellence).
STAR_EN_FIX: Dict[str, str] = {
    "Đà La": "Spinning Top",
    "Thiên Tướng": "Celestial Minister",
    "Thiên Việt": "Celestial Halberd",
}


def star_en(vi: str, core_en: str) -> str:
    """English name of a star: the fixed name above, else the core's name."""
    return STAR_EN_FIX.get(vi, core_en)


PATTERN_EN: Dict[str, str] = {
    "Sát Phá Lang": "Killings, Breaker and Wolf",
    "Cơ Nguyệt Đồng Lương": "Mechanism, Moon, Blessing and Beam",
    "Tử Phủ Vũ Tướng": "Purple Star, Treasury, Military and Minister",
    "Tử Phủ đồng cung": "Purple Star and Treasury in One Palace",
    "Nhật Nguyệt tịnh minh": "Sun and Moon Both Bright",
    "Mệnh vô chính diệu": "Life Palace Without a Major Star",
    "Xương Khúc giáp Mệnh": "Literary Stars Flanking the Life Palace",
    "Xương Khúc đồng hội": "Literary Stars Meeting",
    "Tả Hữu đồng hội": "Left and Right Assistants Meeting",
    "Không Kiếp đồng hội": "Void and Robber Meeting",
    "Nhật Nguyệt giáp Tài": "Sun and Moon Flanking Wealth",
    "Tài Lộc giáp Mã": "Wealth and Prosperity Flanking the Horse",
    "Nhật Nguyệt chiếu bích": "Sun and Moon Shining on the Jade Disc",
    "Kim xán quang huy": "Brilliant Golden Radiance",
    "Nhật Nguyệt giáp Mệnh": "Sun and Moon Flanking the Life Palace",
    "Nhật xuất Phù Tang": "Sun Rising from Fusang",
    "Nguyệt lạc Hợi cung": "Moon Setting in the Hai Palace",
    "Nguyệt sinh thương hải": "Moon Rising over the Vast Sea",
    "Phụ Bật củng chủ": "Assistants Supporting the Sovereign",
    "Quân thần khánh hội": "Sovereign and Ministers Meeting in Celebration",
    "Toạ quý hướng quý": "Seated with Nobility, Facing Nobility",
    "Thất Sát triều Đẩu": "Seven Killings Facing the Dipper",
    "Nhật Nguyệt đồng lâm": "Sun and Moon Arriving Together",
    "Khoa Quyền Lộc củng": "Fame, Power and Prosperity Converging",
    "Vũ Khúc thủ viên": "Military Song Guarding Its Seat",
    "Phủ Tướng triều viên": "Treasury and Minister Facing the Seat",
    "Quyền Lộc sinh phùng": "Power and Prosperity Met at Birth",
    "Dương Nhận nhập miếu": "Sword Ram in Its Temple",
    "Cự Cơ cư Mão": "Giant Gate and Mechanism at Mao",
    "Sinh bất phùng thời": "Born at the Wrong Time",
    "Lộc phùng lưỡng sát": "Prosperity Meeting Two Killers",
    "Mã lạc không vong": "Horse Falling into the Void",
    "Nhất sinh cô bần": "Lonely and Poor All Life",
    "Lưỡng trùng Hoa Cái": "Double Canopy",
}

# Tên chữ Hán (giản thể, phồn thể) của hai cách cục mà lõi trước kia ghi cụt
# "左右", "空劫". Nay lõi trả tên đủ; bảng chỉ nhắc lại, giữ cho tương thích
# (deprecated, bỏ ở 1.0).
PATTERN_HAN_FIX: Dict[str, Tuple[str, str]] = {
    "Tả Hữu đồng hội": ("左右同会", "左右同會"),
    "Không Kiếp đồng hội": ("空劫同会", "空劫同會"),
}


def _bang_sao() -> Dict[str, str]:
    b: Dict[str, str] = {}
    for vi, en in CHINH_TINH_NAME_EN.items():
        b[vi] = star_en(vi, en)
    for vi, en in PHU_TINH_NAME_EN.items():
        b[vi] = star_en(vi, en)
    # Như TU_VUNG_SAO của bản TS: 14 chính tinh và phụ tinh mới, trừ "Thiên Tài".
    for vi, v in TEN_SAO_PHU_MOI_BA_THU.items():
        if vi != "Thiên Tài":
            b[vi] = star_en(vi, v[0])
    b["Thái Tuế"] = "Grand Duke"
    return b


def _bang_thay(terms: str) -> Dict[str, str]:
    def t3(vi: str, py: str, han: str) -> str:
        return vi if terms == "vi" else py if terms == "pinyin" else han

    b = _bang_sao()
    for vi, en, _ in TEN_CUNG_THEO_OFFSET:
        b[vi] = en
    b["Mệnh"] = "Life"
    b["in Mệnh"] = "in the Life palace"
    b["occupies Mệnh"] = "occupies the Life palace"
    b["of Mệnh"] = "of the Life palace"
    b["Tử Vi Đẩu Số Toàn Thư"] = "Zi Wei Dou Shu Quan Shu"
    b["Tân Biên"] = "the Xin Bian"
    b["Sát Phá Liêm Tham"] = "the Killings-Breaker-Purity-Wolf group"
    b["the Cự Nhật pair"] = "a Gate and Sun pair"
    b["Lộc"] = t3("Lộc", "Lu", "禄")
    b["Quyền"] = t3("Quyền", "Quan", "权")
    b["Khoa"] = t3("Khoa", "Ke", "科")
    b["Kỵ"] = t3("Kỵ", "Ji", "忌")
    b["Tuần"] = t3("Tuần", "Xun Kong", "旬空")
    b["Triệt"] = t3("Triệt", "Jie Kong", "截空")
    return b


_DEM: Dict[str, Dict[str, str]] = {}


def en_text(text: str, terms: str) -> str:
    """Rewrite the Vietnamese words left in an English sentence of the Zi Wei core."""
    from .en import convert_terms

    b = _DEM.get(terms)
    if b is None:
        b = _DEM[terms] = _bang_thay(terms)
    return convert_terms(text, terms, b, "tu-vi")


def void_name(which: str, terms: str) -> str:
    """Tuần, Triệt (void markers) in ``terms``."""
    if which == "tuan":
        return "Tuần" if terms == "vi" else "Xun Kong" if terms == "pinyin" else "旬空"
    return "Triệt" if terms == "vi" else "Jie Kong" if terms == "pinyin" else "截空"
