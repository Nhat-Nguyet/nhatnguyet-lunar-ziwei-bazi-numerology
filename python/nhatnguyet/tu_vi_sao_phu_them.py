"""Ba mươi mốt phụ tinh, tạp diệu thêm 19/11/2026 (chuyển ngữ
tuvi_saophu_them.go của lõi Go).

Phép an theo Tử Vi Đẩu Số Tân Biên (Vân Đằng Thái Thứ Lang), chương An sao,
mục 8.6.3 tới 8.36; số mục ghi tại từng hàm. Chỗ các sách khác nhau ghi đủ ở
bản Go: Hỏa Tinh, Linh Tinh (Tân Biên đếm Hỏa thuận, Linh nghịch với Dương Nam,
Âm Nữ và ngược lại; Toàn Thư đếm cả hai thuận; Việt Viêm Tử và lá số in trong
Số Tử Vi Kinh Nghiệm đổi cung khởi), Thiên Trù tuổi Quý (Tân Biên ở Tuất, sách
Trung Hoa ở Hợi). Mức sáng tối để trống.

Quy ước chỉ số: vị trí 0 là Tý, 11 là Hợi; tháng âm 1..12; giờ là chỉ số chi
giờ sinh (0 là Tý); can năm 0 là Giáp.
"""

from __future__ import annotations

from typing import Dict, Tuple

from .am_lich import mod

# Tên ba thứ tiếng của nhóm phụ tinh (trường "nhom").
NHAN_NHOM_SAO: Dict[str, Tuple[str, str, str]] = {
    "sat-tinh": ("Sát tinh", "Malefic star", "煞星"),
    "cat-tinh": ("Cát tinh", "Auspicious star", "吉星"),
    "tap-dieu": ("Tạp diệu", "Minor star", "杂曜"),
}

# Nhóm của hai mươi bốn phụ tinh có từ trước; tên không có ở đây là tạp diệu.
_NHOM_PHU_TINH_CU = {
    "Kình Dương": "sat-tinh", "Đà La": "sat-tinh", "Địa Không": "sat-tinh", "Địa Kiếp": "sat-tinh",
    "Tả Phù": "cat-tinh", "Hữu Bật": "cat-tinh", "Văn Xương": "cat-tinh", "Văn Khúc": "cat-tinh",
    "Thiên Khôi": "cat-tinh", "Thiên Việt": "cat-tinh", "Lộc Tồn": "cat-tinh", "Thiên Mã": "cat-tinh",
}

# Ba mươi mốt sao theo thứ tự in (thứ tự mục của Tân Biên): (tên, Anh, Hán, nhóm).
SAO_PHU_THEM = (
    ("Hỏa Tinh", "Fire Star", "火星", "sat-tinh"),
    ("Linh Tinh", "Bell Star", "铃星", "sat-tinh"),
    ("Long Trì", "Dragon Pool", "龙池", "tap-dieu"),
    ("Phượng Các", "Phoenix Pavilion", "凤阁", "tap-dieu"),
    ("Thiên Đức", "Celestial Virtue", "天德", "tap-dieu"),
    ("Nguyệt Đức", "Monthly Virtue", "月德", "tap-dieu"),
    ("Thiên Hình", "Celestial Punishment", "天刑", "tap-dieu"),
    ("Thiên Diêu", "Celestial Charm", "天姚", "tap-dieu"),
    ("Thiên Y", "Celestial Physician", "天医", "tap-dieu"),
    ("Hồng Loan", "Red Phoenix", "红鸾", "tap-dieu"),
    ("Thiên Hỷ", "Celestial Joy", "天喜", "tap-dieu"),
    ("Quốc Ấn", "State Seal", "国印", "tap-dieu"),
    ("Đường Phù", "Court Tally", "唐符", "tap-dieu"),
    ("Thiên Giải", "Celestial Release", "天解", "tap-dieu"),
    ("Địa Giải", "Earthly Release", "地解", "tap-dieu"),
    ("Giải Thần", "Releasing Spirit", "解神", "tap-dieu"),
    ("Thai Phụ", "Terrace Aide", "台辅", "tap-dieu"),
    ("Phong Cáo", "Patent of Honour", "封诰", "tap-dieu"),
    ("Thiên Thương", "Celestial Injury", "天伤", "tap-dieu"),
    ("Thiên Sứ", "Celestial Messenger", "天使", "tap-dieu"),
    ("Thiên La", "Celestial Net", "天罗", "tap-dieu"),
    ("Địa Võng", "Earthly Snare", "地网", "tap-dieu"),
    ("Cô Thần", "Solitary Star", "孤辰", "tap-dieu"),
    ("Quả Tú", "Widow Star", "寡宿", "tap-dieu"),
    ("Kiếp Sát", "Robbery Sha", "劫煞", "tap-dieu"),
    ("Phá Toái", "Shattering Star", "破碎", "tap-dieu"),
    ("Hoa Cái", "Canopy", "华盖", "tap-dieu"),
    ("Lưu Hà", "Flowing Haze", "流霞", "tap-dieu"),
    ("Thiên Trù", "Celestial Kitchen", "天厨", "tap-dieu"),
    ("Lưu Niên Văn Tinh", "Annual Literary Star", "流年文星", "tap-dieu"),
    ("Thiên Không", "Celestial Void", "天空", "tap-dieu"),
)

_THEO_TEN = {t[0]: t for t in SAO_PHU_THEM}


def nhom_cua_phu_tinh(ten: str) -> str:
    """Nhóm của một phụ tinh theo tên."""
    if ten in _NHOM_PHU_TINH_CU:
        return _NHOM_PHU_TINH_CU[ten]
    t = _THEO_TEN.get(ten)
    return t[3] if t else "tap-dieu"


def ten_sao_phu_them_ba_thu(ten: str) -> Tuple[str, str]:
    """(tiếng Anh, chữ Hán) của một sao thêm; rỗng khi không phải."""
    t = _THEO_TEN.get(ten)
    return (t[1], t[2]) if t else ("", "")


def khoi_hoa_linh(chi_nam: int) -> Tuple[int, int]:
    """Cung khởi (kể là giờ Tý) của Hỏa Tinh, Linh Tinh theo nhóm tam hợp của
    chi năm: Dần Ngọ Tuất Sửu, Mão; Thân Tý Thìn Dần, Tuất; Tỵ Dậu Sửu Mão,
    Tuất; Hợi Mão Mùi Dậu, Tuất (Tân Biên 8.6.3)."""
    r = mod(chi_nam, 4)
    if r == 2:
        return 1, 3
    if r == 0:
        return 2, 10
    if r == 1:
        return 3, 10
    return 9, 10


def vi_tri_hoa_linh(chi_nam: int, gio: int, am_duong_nam_nu: int) -> Tuple[int, int]:
    """Hỏa Tinh, Linh Tinh (lối Tân Biên): +1 (Dương Nam, Âm Nữ) đếm Hỏa thuận,
    Linh nghịch tới giờ sinh; -1 (Âm Nam, Dương Nữ) ngược lại."""
    kh, kl = khoi_hoa_linh(chi_nam)
    s = -1 if am_duong_nam_nu < 0 else 1
    return mod(kh + s * gio, 12), mod(kl - s * gio, 12)


def vi_tri_long_tri(chi_nam: int) -> int:
    """Năm Tý ở Thìn, đếm thuận (8.9)."""
    return mod(4 + chi_nam, 12)


def vi_tri_phuong_cac(chi_nam: int) -> int:
    """Năm Tý ở Tuất, đếm nghịch (8.9)."""
    return mod(10 - chi_nam, 12)


def vi_tri_giai_than(chi_nam: int) -> int:
    """Cùng cung Phượng Các (8.18)."""
    return vi_tri_phuong_cac(chi_nam)


def vi_tri_thien_duc(chi_nam: int) -> int:
    """Năm Tý ở Dậu, đếm thuận (8.14)."""
    return mod(9 + chi_nam, 12)


def vi_tri_nguyet_duc(chi_nam: int) -> int:
    """Năm Tý ở Tỵ, đếm thuận (8.14)."""
    return mod(5 + chi_nam, 12)


def vi_tri_hong_loan(chi_nam: int) -> int:
    """Năm Tý ở Mão, đếm nghịch (8.16)."""
    return mod(3 - chi_nam, 12)


def vi_tri_thien_hy(chi_nam: int) -> int:
    """Cung đối của Hồng Loan (8.16)."""
    return mod(vi_tri_hong_loan(chi_nam) + 6, 12)


def vi_tri_co_than(chi_nam: int) -> int:
    """Hợi Tý Sửu Dần, Dần Mão Thìn Tỵ, Tỵ Ngọ Mùi Thân, Thân Dậu Tuất Hợi (8.25)."""
    return mod(2 + 3 * (mod(chi_nam + 1, 12) // 3), 12)


def vi_tri_qua_tu(chi_nam: int) -> int:
    """Hợi Tý Sửu Tuất, Dần Mão Thìn Sửu, Tỵ Ngọ Mùi Thìn, Thân Dậu Tuất Mùi (8.25)."""
    return mod(10 + 3 * (mod(chi_nam + 1, 12) // 3), 12)


def vi_tri_kiep_sat(chi_nam: int) -> int:
    """Thân Tý Thìn Tỵ, Tỵ Dậu Sửu Dần, Dần Ngọ Tuất Hợi, Hợi Mão Mùi Thân (8.28)."""
    return (5, 2, 11, 8)[mod(chi_nam, 4)]


def vi_tri_pha_toai(chi_nam: int) -> int:
    """Tý Ngọ Mão Dậu Tỵ, Thìn Tuất Sửu Mùi Sửu, Dần Thân Tỵ Hợi Dậu (8.29)."""
    return (5, 1, 9)[mod(chi_nam, 3)]


def vi_tri_hoa_cai(chi_nam: int) -> int:
    """Thân Tý Thìn Thìn, Tỵ Dậu Sửu Sửu, Dần Ngọ Tuất Tuất, Hợi Mão Mùi Mùi (8.30)."""
    return (4, 1, 10, 7)[mod(chi_nam, 4)]


def vi_tri_thien_khong(chi_nam: int) -> int:
    """Cung ngay trước Thái Tuế (8.36)."""
    return mod(chi_nam + 1, 12)


def vi_tri_thien_hinh(thang: int) -> int:
    """Tháng Giêng ở Dậu, đếm thuận (8.15)."""
    return mod(9 + (thang - 1), 12)


def vi_tri_thien_dieu(thang: int) -> int:
    """Tháng Giêng ở Sửu, đếm thuận (8.15, sách viết Thiên Riêu); Thiên Y cùng cung."""
    return mod(1 + (thang - 1), 12)


def vi_tri_thien_giai(thang: int) -> int:
    """Tháng Giêng ở Thân, đếm thuận (8.18)."""
    return mod(8 + (thang - 1), 12)


def vi_tri_dia_giai(thang: int) -> int:
    """Tháng Giêng ở Mùi, đếm thuận (8.18)."""
    return mod(7 + (thang - 1), 12)


def vi_tri_thai_phu(gio: int) -> int:
    """Giờ Tý ở Ngọ, đếm thuận (8.19)."""
    return mod(6 + gio, 12)


def vi_tri_phong_cao(gio: int) -> int:
    """Giờ Tý ở Dần, đếm thuận (8.19)."""
    return mod(2 + gio, 12)


def vi_tri_quoc_an(vi_tri_loc_ton: int) -> int:
    """Từ Lộc Tồn đếm thuận tới cung thứ chín (8.17)."""
    return mod(vi_tri_loc_ton + 8, 12)


def vi_tri_duong_phu(vi_tri_loc_ton: int) -> int:
    """Từ Lộc Tồn đếm nghịch tới cung thứ tám (8.17)."""
    return mod(vi_tri_loc_ton - 7, 12)


# Theo can năm Giáp..Quý (Tân Biên 8.31, 8.32, 8.33).
LUU_HA_VI_TRI = (9, 10, 7, 4, 5, 6, 8, 3, 11, 2)
THIEN_TRU_VI_TRI = (5, 6, 0, 5, 6, 8, 2, 6, 9, 10)
LUU_NIEN_VAN_TINH_VI_TRI = (5, 6, 8, 9, 8, 9, 11, 0, 2, 3)


def vi_tri_luu_ha(can_nam: int) -> int:
    return LUU_HA_VI_TRI[mod(can_nam, 10)]


def vi_tri_thien_tru(can_nam: int) -> int:
    return THIEN_TRU_VI_TRI[mod(can_nam, 10)]


def vi_tri_luu_nien_van_tinh(can_nam: int) -> int:
    return LUU_NIEN_VAN_TINH_VI_TRI[mod(can_nam, 10)]


def vi_tri_thien_thuong(cung_menh: int) -> int:
    """Luôn ở cung Nô Bộc (8.21)."""
    return mod(cung_menh + 5, 12)


def vi_tri_thien_su(cung_menh: int) -> int:
    """Luôn ở cung Tật Ách (8.21)."""
    return mod(cung_menh + 7, 12)


# Thiên La luôn ở Thìn, Địa Võng luôn ở Tuất (8.22).
VI_TRI_THIEN_LA = 4
VI_TRI_DIA_VONG = 10


def vi_tri_sao_phu_them(can_nam: int, chi_nam: int, thang: int, gio: int, am_duong_nam_nu: int,
                        cung_menh: int, vi_tri_loc_ton: int) -> Dict[str, int]:
    """Vị trí của cả ba mươi mốt sao cho một lá số."""
    hoa, linh = vi_tri_hoa_linh(chi_nam, gio, am_duong_nam_nu)
    return {
        "Hỏa Tinh": hoa, "Linh Tinh": linh,
        "Long Trì": vi_tri_long_tri(chi_nam), "Phượng Các": vi_tri_phuong_cac(chi_nam),
        "Thiên Đức": vi_tri_thien_duc(chi_nam), "Nguyệt Đức": vi_tri_nguyet_duc(chi_nam),
        "Thiên Hình": vi_tri_thien_hinh(thang), "Thiên Diêu": vi_tri_thien_dieu(thang),
        "Thiên Y": vi_tri_thien_dieu(thang),
        "Hồng Loan": vi_tri_hong_loan(chi_nam), "Thiên Hỷ": vi_tri_thien_hy(chi_nam),
        "Quốc Ấn": vi_tri_quoc_an(vi_tri_loc_ton), "Đường Phù": vi_tri_duong_phu(vi_tri_loc_ton),
        "Thiên Giải": vi_tri_thien_giai(thang), "Địa Giải": vi_tri_dia_giai(thang),
        "Giải Thần": vi_tri_giai_than(chi_nam),
        "Thai Phụ": vi_tri_thai_phu(gio), "Phong Cáo": vi_tri_phong_cao(gio),
        "Thiên Thương": vi_tri_thien_thuong(cung_menh), "Thiên Sứ": vi_tri_thien_su(cung_menh),
        "Thiên La": VI_TRI_THIEN_LA, "Địa Võng": VI_TRI_DIA_VONG,
        "Cô Thần": vi_tri_co_than(chi_nam), "Quả Tú": vi_tri_qua_tu(chi_nam),
        "Kiếp Sát": vi_tri_kiep_sat(chi_nam), "Phá Toái": vi_tri_pha_toai(chi_nam),
        "Hoa Cái": vi_tri_hoa_cai(chi_nam),
        "Lưu Hà": vi_tri_luu_ha(can_nam), "Thiên Trù": vi_tri_thien_tru(can_nam),
        "Lưu Niên Văn Tinh": vi_tri_luu_nien_van_tinh(can_nam),
        "Thiên Không": vi_tri_thien_khong(chi_nam),
    }
