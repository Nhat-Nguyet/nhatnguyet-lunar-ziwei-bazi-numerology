"""Âm lịch Việt Nam: đổi lịch dương sang âm và ngược lại, can chi, tiết khí,
Nhị Thập Bát Tú, ngũ hành và nạp âm.

Bản chuyển ngữ sang Python của lõi tính Go của Nhật Nguyệt
(lÃµi tÃ­nh Go cá»§a Nháº­t Nguyá»t : lunar.go, canchi.go, tietkhi.go,
nhithapbattu.go, nguhanh.go, bảng nạp âm ở tuvi_data.go). Lõi Go là nguồn sự
thật; bộ ca kiểm ở thu-vien-mo/ca-kiem/am-lich.json bắt mọi chỗ lệch.

Ghi công:

- Công thức thiên văn (điểm sóc trung bình kèm các số hạng hiệu chỉnh, kinh
  độ Mặt Trời, quang sai, chương động, ΔT) theo Jean Meeus, "Astronomical
  Algorithms" (Willmann-Bell, 1991; bản 2, 1998), và đa thức ΔT của Espenak
  và Meeus (NASA, 2006).
- Quy tắc dựng tháng âm (tháng chứa Đông Chí là tháng 11, năm có 13 tháng thì
  tháng đầu tiên không chứa trung khí là tháng nhuận, mọi phép tính theo giờ
  UTC+7) là quy tắc chung của lịch âm dương truyền thống (lịch Thời Hiến),
  không của riêng ai.

Mã ở đây viết lại theo mô tả thuật toán và theo lõi Go của Nhật Nguyệt, không
chép mã nguồn của người khác. Thứ tự các phép tính số thực được giữ đúng như
lõi Go để kết quả khớp từng bit.

Quy ước số học: Go dùng math.Floor trên float64 và chuyển float sang int bằng
cách cắt về 0; ở đây ``_san`` là math.Floor (trả float), ``int()`` là phép
cắt về 0, ``_lam_tron`` là math.Round của Go (nửa đơn vị làm tròn ra xa số 0,
khác round() của Python).
"""

from __future__ import annotations

import math
from functools import lru_cache
from typing import Dict, List, Optional, Tuple

__all__ = [
    # bảng
    "THIEN_CAN", "DIA_CHI", "CON_GIAP", "TIME_ZONE_VN", "NGU_HANH_LIST",
    "CAN_NGU_HANH", "HANH_EN", "HANH_ZH",
    # số học
    "mod",
    # lịch
    "jd_from_date", "jd_to_date", "new_moon", "sun_longitude",
    "get_sun_longitude", "get_new_moon_day", "get_lunar_month_11",
    "get_leap_month_offset", "solar_to_lunar", "doi_am_lich_chi_tiet",
    "lunar_to_solar",
    # can chi
    "year_can_chi", "con_giap_of_year", "con_giap_theo_ngay_sinh",
    "day_can_chi", "chi_of_lunar_month", "lunar_month_can_chi",
    "can_thang_dan", "luc_thap_hoa_giap", "chi_index", "can_index",
    # tiết khí
    "all_tiet_khi", "tiet_khi_theo_index", "kinh_do_mat_troi", "delta_t_giay",
    "tiet_khi_tai_thoi_diem", "tiet_khi_cua_ngay", "ngay_bat_dau_tiet_khi",
    "lich_tiet_khi_nam", "moc_tiet_khi", "moc_tiet_khi_trong_nam",
    "moc_tiet_khi_quanh_ngay",
    # Nhị Thập Bát Tú
    "sao_cua_ngay", "all_nhi_thap_bat_tu",
    # ngũ hành
    "chi_to_ngu_hanh", "can_to_ngu_hanh", "ngu_hanh_nap_am",
    "hanh_sinh_ra", "hanh_khac_lai", "ngu_hanh_sinh_ra", "ngu_hanh_khac_duoc",
    "tuong_sinh_tuong_khac", "xem_ngu_hanh_theo_nam",
    "NGU_HANH_TUONG_SINH", "NGU_HANH_TUONG_KHAC", "NGU_HANH_TUONG_HOA",
]

# ---------------------------------------------------------------------------
# Số học kiểu Go
# ---------------------------------------------------------------------------


def _san(x: float) -> float:
    """math.Floor của Go: làm tròn xuống, trả float."""
    return float(math.floor(x))


def _lam_tron(x: float) -> int:
    """math.Round của Go: nửa đơn vị làm tròn ra xa số 0."""
    t = math.trunc(x)
    if abs(x - t) >= 0.5:
        t += 1 if x > 0 else -1
    return int(t)


def mod(a: int, b: int) -> int:
    """Phần dư luôn không âm (hàm mod của Go). Với b dương, a % b của Python
    đã cho đúng kết quả này."""
    return a % b


# ---------------------------------------------------------------------------
# Ngày Julian và đổi lịch
# ---------------------------------------------------------------------------

# Một độ tính bằng radian (π/180 làm tròn một lần về float64, như hằng của Go).
_DO = math.pi / 180
# Gốc ước điểm sóc: sóc ngày 1/1/1900, và tháng sóc trung bình.
_SOC_GOC = 2415021.076998695
_THANG_SOC = 29.530588853


def jd_from_date(dd: int, mm: int, yy: int) -> int:
    """Số ngày Julian (JDN) của ngày dd/mm/yy; trước 15/10/1582 là lịch Julius."""
    a = _san(float(14 - mm) / 12)
    y = float(yy) + 4800 - a
    m = float(mm) + 12 * a - 3
    jd = float(dd) + _san((153 * m + 2) / 5) + 365 * y + _san(y / 4) - _san(y / 100) + _san(y / 400) - 32045
    if jd < 2299161:
        jd = float(dd) + _san((153 * m + 2) / 5) + 365 * y + _san(y / 4) - 32083
    return int(jd)


def jd_to_date(jd: int) -> Dict[str, int]:
    """Đổi JDN về ngày dương: ``{"day", "month", "year"}``."""
    jdf = float(jd)
    if jdf > 2299160:
        a = jdf + 32044
        b = _san((4 * a + 3) / 146097)
        c = a - _san((b * 146097) / 4)
    else:
        b = 0.0
        c = jdf + 32082
    d = _san((4 * c + 3) / 1461)
    e = c - _san((1461 * d) / 4)
    m = _san((5 * e + 2) / 153)
    ngay = e - _san((153 * m + 2) / 5) + 1
    thang = m + 3 - 12 * _san(m / 10)
    nam = b * 100 + d - 4800 + _san(m / 10)
    return {"day": int(ngay), "month": int(thang), "year": int(nam)}


def new_moon(k: float) -> float:
    """Thời điểm (JD, giờ quốc tế) của lần sóc thứ k tính từ sóc đầu năm 1900
    (Meeus, chương 47 bản 1: sóc trung bình cộng các số hạng hiệu chỉnh)."""
    T = k / 1236.85
    T2 = T * T
    T3 = T2 * T
    dr = _DO

    jd1 = 2415020.75933 + 29.53058868 * k + 0.0001178 * T2 - 0.000000155 * T3
    jd1 += 0.00033 * math.sin((166.56 + 132.87 * T - 0.009173 * T2) * dr)

    M = 359.2242 + 29.10535608 * k - 0.0000333 * T2 - 0.00000347 * T3
    Mpr = 306.0253 + 385.81691806 * k + 0.0107306 * T2 + 0.00001236 * T3
    F = 21.2964 + 390.67050646 * k - 0.0016528 * T2 - 0.00000239 * T3

    C1 = ((0.1734 - 0.000393 * T) * math.sin(M * dr)
          + 0.0021 * math.sin(2 * dr * M)
          - 0.4068 * math.sin(Mpr * dr)
          + 0.0161 * math.sin(dr * 2 * Mpr)
          - 0.0004 * math.sin(dr * 3 * Mpr)
          + 0.0104 * math.sin(dr * 2 * F)
          - 0.0051 * math.sin(dr * (M + Mpr))
          - 0.0074 * math.sin(dr * (M - Mpr))
          + 0.0004 * math.sin(dr * (2 * F + M))
          - 0.0004 * math.sin(dr * (2 * F - M))
          - 0.0006 * math.sin(dr * (2 * F + Mpr))
          + 0.001 * math.sin(dr * (2 * F - Mpr))
          + 0.0005 * math.sin(dr * (2 * Mpr + M)))

    if T < -11:
        delta_t = 0.001 + 0.000839 * T + 0.0002261 * T2 - 0.00000845 * T3 - 0.000000081 * T * T3
    else:
        delta_t = -0.000278 + 0.000265 * T + 0.000262 * T2
    return jd1 + C1 - delta_t


def sun_longitude(jdn: float) -> float:
    """Kinh độ HÌNH HỌC của Mặt Trời (radian, 0 tới 2π) tại JD jdn."""
    T = (jdn - 2451545.0) / 36525
    T2 = T * T
    dr = _DO
    M = 357.5291 + 35999.0503 * T - 0.0001559 * T2 - 0.00000048 * T * T2
    L0 = 280.46645 + 36000.76983 * T + 0.0003032 * T2
    DL = ((1.9146 - 0.004817 * T - 0.000014 * T2) * math.sin(dr * M)
          + (0.019993 - 0.000101 * T) * math.sin(dr * 2 * M)
          + 0.00029 * math.sin(dr * 3 * M))
    L = (L0 + DL) * dr
    hai_pi = math.pi * 2
    L = L - hai_pi * _san(L / hai_pi)
    return L


def get_sun_longitude(day_number: float, time_zone: float) -> float:
    """Cung 30 độ (0 tới 11) chứa Mặt Trời lúc 0h của ngày day_number theo
    múi giờ time_zone. Dùng để biết tháng âm có chứa trung khí hay không."""
    return _san(sun_longitude(day_number - 0.5 - time_zone / 24) / math.pi * 6)


def get_new_moon_day(k: float, time_zone: float) -> float:
    """JDN của ngày chứa lần sóc thứ k theo múi giờ time_zone."""
    return _san(new_moon(k) + 0.5 + time_zone / 24)


def get_lunar_month_11(yy: int, time_zone: float) -> float:
    """JDN mùng 1 tháng 11 âm (tháng chứa Đông Chí) của năm dương yy."""
    off = float(jd_from_date(31, 12, yy)) - _SOC_GOC
    k = _san(off / _THANG_SOC)
    nm = get_new_moon_day(k, time_zone)
    if get_sun_longitude(nm, time_zone) >= 9:
        nm = get_new_moon_day(k - 1, time_zone)
    return nm


def get_leap_month_offset(a11: float, time_zone: float) -> float:
    """Vị trí tháng nhuận (đếm từ tháng 11 mở đầu kỳ a11): tháng đầu tiên mà
    cung Mặt Trời lúc đầu tháng trùng với tháng trước, tức không có trung khí."""
    k = _san((a11 - _SOC_GOC) / _THANG_SOC + 0.5)
    i = 1.0
    cung = get_sun_longitude(get_new_moon_day(k + i, time_zone), time_zone)
    while True:
        truoc = cung
        i += 1
        cung = get_sun_longitude(get_new_moon_day(k + i, time_zone), time_zone)
        if not (cung != truoc and i < 14):
            break
    return i - 1


def doi_am_lich_chi_tiet(dd: int, mm: int, yy: int, time_zone: float = 7.0) -> Dict:
    """Đổi dương sang âm, trả cả các giá trị trung gian (như buocDoiAmLich
    của Go): jdn, kSoc, ngaySoc, thang11, thang11Sau, soThangTuThang11,
    viTriNhuan, ketQua."""
    ngay = float(jd_from_date(dd, mm, yy))
    k = _san((ngay - _SOC_GOC) / _THANG_SOC)
    k_soc = k + 1
    dau_thang = get_new_moon_day(k + 1, time_zone)
    # Lùi tới khi mùng 1 không sau ngày đang xét (ước theo tháng sóc trung
    # bình có lúc cao hơn thật tới hai tháng).
    while dau_thang > ngay:
        k_soc -= 1
        dau_thang = get_new_moon_day(k_soc, time_zone)
    a11 = get_lunar_month_11(yy, time_zone)
    b11 = a11
    if a11 >= dau_thang:
        nam_am = yy
        a11 = get_lunar_month_11(yy - 1, time_zone)
    else:
        nam_am = yy + 1
        b11 = get_lunar_month_11(yy + 1, time_zone)
    ngay_am = ngay - dau_thang + 1
    chenh = _san((dau_thang - a11) / 29)
    nhuan = False
    thang_am = chenh + 11
    vi_tri_nhuan = 0.0
    if b11 - a11 > 365:
        vi_tri_nhuan = get_leap_month_offset(a11, time_zone)
        if chenh >= vi_tri_nhuan:
            thang_am = chenh + 10
            if chenh == vi_tri_nhuan:
                nhuan = True
    if thang_am > 12:
        thang_am -= 12
    if thang_am >= 11 and chenh < 4:
        nam_am -= 1
    return {
        "jdn": int(ngay),
        "kSoc": k_soc,
        "ngaySoc": int(dau_thang),
        "thang11": int(a11),
        "thang11Sau": int(b11),
        "soThangTuThang11": int(chenh),
        "viTriNhuan": int(vi_tri_nhuan),
        "ketQua": {"day": int(ngay_am), "month": int(thang_am), "year": nam_am, "leap": nhuan},
    }


def solar_to_lunar(dd: int, mm: int, yy: int, time_zone: float = 7.0) -> Dict:
    """Đổi ngày dương sang ngày âm Việt Nam: ``{"day", "month", "year", "leap"}``."""
    return doi_am_lich_chi_tiet(dd, mm, yy, time_zone)["ketQua"]


def lunar_to_solar(ngay_am: int, thang_am: int, nam_am: int, nhuan: bool,
                   time_zone: float = 7.0) -> Tuple[Dict[str, int], bool]:
    """Đổi ngày âm sang dương. Trả ``(ngày dương, hợp lệ)``; tổ hợp không
    tồn tại (tháng nhuận sai) cho ``({"day": 0, "month": 0, "year": 0}, False)``.
    Ngày 30 của tháng thiếu không bị từ chối: nó rơi sang mùng 1 tháng sau,
    đúng như lõi Go."""
    if thang_am < 11:
        a11 = get_lunar_month_11(nam_am - 1, time_zone)
        b11 = get_lunar_month_11(nam_am, time_zone)
    else:
        a11 = get_lunar_month_11(nam_am, time_zone)
        b11 = get_lunar_month_11(nam_am + 1, time_zone)
    k = _san(0.5 + (a11 - _SOC_GOC) / _THANG_SOC)
    off = float(thang_am - 11)
    if off < 0:
        off += 12
    if b11 - a11 > 365:
        leap_off = get_leap_month_offset(a11, time_zone)
        thang_nhuan = leap_off - 2
        if thang_nhuan < 0:
            thang_nhuan += 12
        if nhuan and float(thang_am) != thang_nhuan:
            return {"day": 0, "month": 0, "year": 0}, False
        elif nhuan or off >= leap_off:
            off += 1
    dau_thang = get_new_moon_day(k + off, time_zone)
    return jd_to_date(int(dau_thang) + ngay_am - 1), True


# ---------------------------------------------------------------------------
# Can chi
# ---------------------------------------------------------------------------

THIEN_CAN = ("Giáp", "Ất", "Bính", "Đinh", "Mậu", "Kỷ", "Canh", "Tân", "Nhâm", "Quý")
DIA_CHI = ("Tý", "Sửu", "Dần", "Mão", "Thìn", "Tỵ", "Ngọ", "Mùi", "Thân", "Dậu", "Tuất", "Hợi")
CON_GIAP = ("Chuột", "Trâu", "Hổ", "Mèo", "Rồng", "Rắn", "Ngựa", "Dê", "Khỉ", "Gà", "Chó", "Lợn")

TIME_ZONE_VN = 7.0

# Múi giờ tính lịch âm của từng nước: cùng quy tắc lịch, chỉ khác giờ địa
# phương dùng để xét ngày. Dùng cho mọi năm; lịch in trong quá khứ của từng
# nước có lúc theo giờ khác.
MUI_GIO_LICH = {
    "viet_nam": 7.0,     # Việt Nam
    "trung_quoc": 8.0,   # Trung Quốc, Đài Loan, Hồng Kông
    "han_quoc": 9.0,     # Hàn Quốc
    "nhat_ban": 9.0,     # âm lịch cũ của Nhật Bản (kyūreki)
}

# Múi giờ lịch âm theo mã nước ISO 3166-1. Cộng đồng người Hoa ở Đông Nam Á
# đón Tết theo lịch Trung Quốc. Nước không có ở đây (Mông Cổ, Tây Tạng, Thái
# Lan, Lào, Campuchia, Myanmar, Ấn Độ...) dùng hệ lịch khác quy tắc.
MUI_GIO_THEO_NUOC = {
    "VN": 7.0,  # Việt Nam (mặc định)
    "CN": 8.0,  # Trung Quốc
    "TW": 8.0,  # Đài Loan
    "HK": 8.0,  # Hồng Kông
    "MO": 8.0,  # Ma Cao
    "SG": 8.0,  # Singapore
    "MY": 8.0,  # Malaysia
    "ID": 8.0,  # Indonesia (Tết Imlek)
    "PH": 8.0,  # Philippines
    "KR": 9.0,  # Hàn Quốc
    "JP": 9.0,  # Nhật Bản, âm lịch cũ (kyūreki)
}


def can_index(can: str) -> int:
    """Chỉ số Thiên Can (Giáp 0 tới Quý 9); -1 khi tên lạ."""
    try:
        return THIEN_CAN.index(can)
    except ValueError:
        return -1


def chi_index(chi: str) -> int:
    """Chỉ số Địa Chi (Tý 0 tới Hợi 11); -1 khi tên lạ."""
    try:
        return DIA_CHI.index(chi)
    except ValueError:
        return -1


def _can_chi(can_idx: int, chi_idx: int) -> Dict[str, str]:
    can, chi = THIEN_CAN[can_idx], DIA_CHI[chi_idx]
    return {"can": can, "chi": chi, "label": can + " " + chi}


def year_can_chi(nam_am: int) -> Dict[str, str]:
    """Can chi của NĂM ÂM LỊCH: ``{"can", "chi", "label"}``."""
    return _can_chi(mod(nam_am - 4, 10), mod(nam_am - 4, 12))


def con_giap_of_year(nam_am: int) -> str:
    """Tên con giáp của năm âm lịch."""
    return CON_GIAP[mod(nam_am - 4, 12)]


def con_giap_theo_ngay_sinh(dd: int, mm: int, yyyy: int) -> str:
    """Con giáp theo năm ÂM của ngày sinh dương (sinh trước Tết thuộc năm
    trước). Thiếu ngày hay tháng thì dùng năm dương."""
    if dd <= 0 or mm <= 0 or yyyy <= 0:
        return con_giap_of_year(yyyy)
    return con_giap_of_year(solar_to_lunar(dd, mm, yyyy, TIME_ZONE_VN)["year"])


def day_can_chi(dd: int, mm: int, yy: int) -> Dict[str, str]:
    """Can chi của một ngày dương lịch: can (jd+9) mod 10, chi (jd+1) mod 12."""
    jd = jd_from_date(dd, mm, yy)
    return _can_chi(mod(jd + 9, 10), mod(jd + 1, 12))


_CHI_THANG_AM = {
    1: "Dần", 2: "Mão", 3: "Thìn", 4: "Tỵ", 5: "Ngọ", 6: "Mùi",
    7: "Thân", 8: "Dậu", 9: "Tuất", 10: "Hợi", 11: "Tý", 12: "Sửu",
}


def chi_of_lunar_month(thang_am: int) -> str:
    """Chi cố định của tháng âm (tháng Giêng là Dần); "?" khi tháng lạ."""
    return _CHI_THANG_AM.get(thang_am, "?")


def can_thang_dan(can_nam_idx: int) -> int:
    """Ngũ Hổ Độn: chỉ số Can của tháng Dần suy từ chỉ số Can năm."""
    return ((can_nam_idx % 5) * 2 + 2) % 10


def lunar_month_can_chi(thang_am: int, nam_am: int) -> Dict[str, str]:
    """Can chi của THÁNG ÂM LỊCH theo lịch vạn niên Việt Nam (tháng nhuận
    mang can chi tháng chính cùng số). Tháng lạ trả can, chi, label rỗng.
    Khác trụ tháng Bát Tự, vốn đổi theo tiết khí."""
    if thang_am < 1 or thang_am > 12:
        return {"can": "", "chi": "", "label": ""}
    can_nam = mod(nam_am - 4, 10)
    can = THIEN_CAN[mod(can_thang_dan(can_nam) + thang_am - 1, 10)]
    chi = chi_of_lunar_month(thang_am)
    return {"can": can, "chi": chi, "label": can + " " + chi}


def luc_thap_hoa_giap(tu_nam: int, den_nam: int) -> List[Dict]:
    """Đủ 60 cặp can chi theo vòng Hoa Giáp, kèm nạp âm và các năm ÂM trong
    khoảng [tu_nam, den_nam] ứng với từng cặp."""
    ra = []
    for i in range(60):
        can_idx, chi_idx = i % 10, i % 12
        hanh, hanh_en, ten = ngu_hanh_nap_am(can_idx, chi_idx)
        can, chi = THIEN_CAN[can_idx], DIA_CHI[chi_idx]
        ra.append({
            "thuTu": i + 1, "can": can, "chi": chi, "label": can + " " + chi,
            "conGiap": CON_GIAP[chi_idx], "hanh": hanh, "hanhEn": hanh_en,
            "tenNapAm": ten,
            "nam": [y for y in range(tu_nam, den_nam + 1) if mod(y - 4, 60) == i],
        })
    return ra


# ---------------------------------------------------------------------------
# 24 tiết khí
# ---------------------------------------------------------------------------

# Xếp theo chỉ số kinh độ: 0 là 0 độ (Xuân Phân), mỗi tiết 15 độ.
# Cột: index, kinhDo, ten, tenEn, yNghia, yNghiaEn, yNghiaZh, laTiet.
_BANG_TIET_KHI = (
    (0, 0, "Xuân Phân", "Vernal Equinox", "Ngày và đêm dài bằng nhau, mặt trời qua xích đạo lên bắc bán cầu", "Day and night are equal as the sun crosses the equator northward", "太阳北越赤道，昼夜等长", False),
    (1, 15, "Thanh Minh", "Clear and Bright", "Trời quang, tiết đi tảo mộ của người Việt", "Clear skies; the traditional Vietnamese grave-tending season", "天气晴朗；越南传统的扫墓时节", True),
    (2, 30, "Cốc Vũ", "Grain Rain", "Mưa rào nuôi ngũ cốc mới gieo", "Rains that nourish newly sown grain", "滋养新播谷物的雨水", False),
    (3, 45, "Lập Hạ", "Start of Summer", "Bắt đầu mùa hè", "Summer begins", "立夏", True),
    (4, 60, "Tiểu Mãn", "Grain Buds", "Hạt ngũ cốc bắt đầu mẩy nhưng chưa chín", "Grain begins to fill out but is not yet ripe", "谷粒渐满尚未成熟", False),
    (5, 75, "Mang Chủng", "Grain in Ear", "Lúa trổ bông, vào vụ gặt chiêm", "Grain forms ears; harvest season opens", "谷穗抽齐，收获季开启", True),
    (6, 90, "Hạ Chí", "Summer Solstice", "Ngày dài nhất năm ở bắc bán cầu", "Longest day of the year in the northern hemisphere", "北半球一年中白昼最长的一天", False),
    (7, 105, "Tiểu Thử", "Minor Heat", "Bắt đầu nóng nhưng chưa gay gắt nhất", "Heat sets in but has not yet peaked", "暑气渐起，尚未到顶", True),
    (8, 120, "Đại Thử", "Major Heat", "Thời điểm nóng nhất trong năm", "The hottest stretch of the year", "一年中最热的时段", False),
    (9, 135, "Lập Thu", "Start of Autumn", "Bắt đầu mùa thu", "Autumn begins", "立秋", True),
    (10, 150, "Xử Thử", "End of Heat", "Cái nóng lui dần", "The heat recedes", "暑气渐退", False),
    (11, 165, "Bạch Lộ", "White Dew", "Sương trắng đọng buổi sớm, trời se lạnh", "White dew gathers at dawn as the air cools", "清晨气温转凉，白露凝结", True),
    (12, 180, "Thu Phân", "Autumnal Equinox", "Ngày và đêm dài bằng nhau, mặt trời qua xích đạo xuống nam bán cầu", "Day and night are equal as the sun crosses the equator southward", "太阳南越赤道，昼夜等长", False),
    (13, 195, "Hàn Lộ", "Cold Dew", "Sương lạnh, rét bắt đầu rõ", "Cold dew; the chill becomes noticeable", "寒露；寒意渐显", True),
    (14, 210, "Sương Giáng", "Frost Descent", "Sương muối xuất hiện ở vùng cao", "Frost appears in the highlands", "高地出现霜冻", False),
    (15, 225, "Lập Đông", "Start of Winter", "Bắt đầu mùa đông", "Winter begins", "立冬", True),
    (16, 240, "Tiểu Tuyết", "Minor Snow", "Bắt đầu có tuyết ở phương bắc", "First snows in the north", "北方初雪", False),
    (17, 255, "Đại Tuyết", "Major Snow", "Tuyết rơi dày ở phương bắc", "Heavy snowfall in the north", "北方大雪", True),
    (18, 270, "Đông Chí", "Winter Solstice", "Ngày ngắn nhất năm ở bắc bán cầu", "Shortest day of the year in the northern hemisphere", "北半球一年中白昼最短的一天", False),
    (19, 285, "Tiểu Hàn", "Minor Cold", "Bắt đầu rét đậm", "Deep cold sets in", "严寒来临", True),
    (20, 300, "Đại Hàn", "Major Cold", "Thời điểm rét nhất trong năm", "The coldest stretch of the year", "一年中最冷的一段", False),
    (21, 315, "Lập Xuân", "Start of Spring", "Bắt đầu mùa xuân, cũng là mốc sang năm mới trong Tứ Trụ", "Spring begins; also the year boundary in Four Pillars astrology", "立春；也是八字命理中一年的分界", True),
    (22, 330, "Vũ Thủy", "Rain Water", "Mưa xuân thay cho tuyết, băng tan", "Spring rain replaces snow as ice melts", "春雨取代雪，冰开始融化", False),
    (23, 345, "Kinh Trập", "Awakening of Insects", "Sâu bọ tỉnh giấc sau mùa đông", "Hibernating insects stir after winter", "冬眠昆虫惊蛰", True),
)


def tiet_khi_theo_index(index: int) -> Dict:
    """Tiết khí theo chỉ số kinh độ (0 Xuân Phân tới 23 Kinh Trập), dạng dict
    với các khoá index, kinhDo, ten, tenEn, yNghia, yNghiaEn, yNghiaZh, laTiet."""
    i, kd, ten, ten_en, yn, yn_en, yn_zh, la_tiet = _BANG_TIET_KHI[index % 24]
    return {"index": i, "kinhDo": kd, "ten": ten, "tenEn": ten_en,
            "yNghia": yn, "yNghiaEn": yn_en, "yNghiaZh": yn_zh, "laTiet": la_tiet}


def all_tiet_khi() -> List[Dict]:
    """24 tiết khí theo thứ tự lịch, bắt đầu từ Lập Xuân."""
    return [tiet_khi_theo_index((21 + i) % 24) for i in range(24)]


# Hiệu chỉnh quang sai và hệ số chương động (độ), Meeus chương 25.
_QUANG_SAI_DO = -0.00569
_CHUONG_DONG_HE_SO_DO = -0.00478


def delta_t_giay(nam: int) -> float:
    """ΔT = TT - UT (giây), đa thức của Espenak và Meeus (NASA, 2006)."""
    y = float(nam) + 0.5
    if 2005 <= nam <= 2050:
        t = y - 2000
        return 62.92 + 0.32217 * t + 0.005589 * t * t
    if 1986 <= nam < 2005:
        t = y - 2000
        return (63.86 + 0.3345 * t - 0.060374 * t * t + 0.0017275 * t * t * t
                + 0.000651814 * t * t * t * t + 0.00002373599 * t * t * t * t * t)
    if 1961 <= nam < 1986:
        t = y - 1975
        return 45.45 + 1.067 * t - t * t / 260 - t * t * t / 718
    if 1941 <= nam < 1961:
        t = y - 1950
        return 29.07 + 0.407 * t - t * t / 233 + t * t * t / 2547
    u = (y - 1820) / 100
    return -20 + 32 * u * u


def kinh_do_mat_troi(dd: int, mm: int, yy: int, gio_local: float, time_zone: float) -> float:
    """Kinh độ BIỂU KIẾN của Mặt Trời (độ, 0 tới 360) lúc gio_local giờ (thập
    phân) của ngày dd/mm/yy theo múi giờ time_zone: kinh độ hình học tại giờ
    động lực TT, cộng quang sai và chương động (Meeus chương 25)."""
    jd_ut = float(jd_from_date(dd, mm, yy)) - 0.5 + gio_local / 24 - time_zone / 24
    jde = jd_ut + delta_t_giay(yy) / 86400
    T = (jde - 2451545.0) / 36525
    omega = (125.04 - 1934.136 * T) * math.pi / 180
    deg = sun_longitude(jde) * 180 / math.pi + _QUANG_SAI_DO + _CHUONG_DONG_HE_SO_DO * math.sin(omega)
    deg = math.fmod(deg, 360)
    if deg < 0:
        deg += 360
    return deg


def tiet_khi_tai_thoi_diem(dd: int, mm: int, yy: int, gio_local: float) -> Dict:
    """Tiết khí đang diễn ra tại một thời điểm giờ Việt Nam."""
    deg = kinh_do_mat_troi(dd, mm, yy, gio_local, TIME_ZONE_VN)
    return tiet_khi_theo_index(int(math.floor(deg / 15)) % 24)


def tiet_khi_cua_ngay(dd: int, mm: int, yy: int) -> Dict:
    """Tiết khí của một ngày, xét lúc 12h trưa giờ Việt Nam."""
    return tiet_khi_tai_thoi_diem(dd, mm, yy, 12)


def _moc_roi_vao_ngay(dau_ngay: float, dau_ngay_sau: float, moc: float) -> bool:
    """Mốc kinh độ có nằm trong nửa khoảng [dau_ngay, dau_ngay_sau) không, có
    xét chỗ quay vòng 360 về 0."""
    if dau_ngay_sau < dau_ngay:
        return moc >= dau_ngay or moc < dau_ngay_sau
    return dau_ngay <= moc < dau_ngay_sau


def ngay_bat_dau_tiet_khi(tk: Dict, nam_duong: int) -> Dict[str, int]:
    """NGÀY dương mà tiết khí tk bắt đầu trong năm nam_duong (quét từng ngày
    quanh ngày ước theo khoảng cách đều)."""
    jd_xuan_phan = jd_from_date(20, 3, nam_duong)
    offset = float(tk["index"]) * 365.2422 / 24
    if tk["index"] >= 19:
        offset -= 365.2422
    guess = float(jd_xuan_phan) + offset
    start = int(guess) - 20
    for jd in range(start, start + 41):
        d = jd_to_date(jd)
        sau = jd_to_date(jd + 1)
        a = kinh_do_mat_troi(d["day"], d["month"], d["year"], 0, TIME_ZONE_VN)
        b = kinh_do_mat_troi(sau["day"], sau["month"], sau["year"], 0, TIME_ZONE_VN)
        if _moc_roi_vao_ngay(a, b, float(tk["kinhDo"])):
            return d
    return jd_to_date(int(guess))


def _jd_cua(ngay: Dict[str, int]) -> int:
    return jd_from_date(ngay["day"], ngay["month"], ngay["year"])


def lich_tiet_khi_nam(nam_duong: int) -> List[Dict]:
    """24 tiết khí rơi vào năm dương, mỗi mục là tiết khí kèm khoá ``ngay``,
    xếp theo ngày."""
    ra = []
    for i in range(24):
        tk = tiet_khi_theo_index(i)
        tk["ngay"] = ngay_bat_dau_tiet_khi(tk, nam_duong)
        ra.append(tk)
    ra.sort(key=lambda m: _jd_cua(m["ngay"]))
    return ra


_NGUONG_CHIA_DOI_PHUT = 1.0


def moc_tiet_khi(tk: Dict, nam_duong: int) -> Dict:
    """Thời điểm bắt đầu tiết khí tk trong năm nam_duong, giờ Việt Nam, tới
    phút: tiết khí kèm khoá ``ngay``, ``gio``, ``phut``. Dò nghiệm bằng chia
    đôi trên hiệu kinh độ đã đưa về [-180, 180)."""
    muc = float(tk["kinhDo"])

    def lech(jd: float) -> float:
        sd = jd_to_date(int(math.floor(jd + 0.5)))
        gio = (jd + 0.5 - math.floor(jd + 0.5)) * 24
        d = kinh_do_mat_troi(sd["day"], sd["month"], sd["year"], gio, TIME_ZONE_VN) - muc
        while d >= 180:
            d -= 360
        while d < -180:
            d += 360
        return d

    uoc = ngay_bat_dau_tiet_khi(tk, nam_duong)
    giua = float(_jd_cua(uoc))
    lo, hi = giua - 10, giua + 10
    if lech(lo) > 0 or lech(hi) < 0:
        lo, hi = giua - 20, giua + 20
    i = 0
    while i < 40 and hi - lo > _NGUONG_CHIA_DOI_PHUT / 1440:
        mid = (lo + hi) / 2
        if lech(mid) < 0:
            lo = mid
        else:
            hi = mid
        i += 1

    jd = (lo + hi) / 2
    ngay_jd = int(math.floor(jd + 0.5))
    sd = jd_to_date(ngay_jd)
    phut_trong_ngay = _lam_tron((jd + 0.5 - float(ngay_jd)) * 1440)
    if phut_trong_ngay >= 1440:
        phut_trong_ngay -= 1440
        sd = jd_to_date(ngay_jd + 1)
    if phut_trong_ngay < 0:
        phut_trong_ngay += 1440
        sd = jd_to_date(ngay_jd - 1)
    ra = dict(tk)
    ra.pop("ngay", None)
    ra.update({"ngay": sd, "gio": phut_trong_ngay // 60, "phut": phut_trong_ngay % 60})
    return ra


def moc_tiet_khi_trong_nam(nam_duong: int) -> List[Dict]:
    """24 mốc tiết khí của một năm dương lịch, xếp theo thời gian thật."""
    ra = [moc_tiet_khi(tk, nam_duong) for tk in all_tiet_khi()]
    ra.sort(key=lambda m: (_jd_cua(m["ngay"]), m["gio"] * 60 + m["phut"]))
    return ra


@lru_cache(maxsize=512)
def _moc_tiet_khi_nam_dem(nam: int) -> tuple:
    return tuple(moc_tiet_khi_trong_nam(nam))


def moc_tiet_khi_quanh_ngay(dd: int, mm: int, yy: int) -> Tuple[Dict, Dict]:
    """Hai mốc giao tiết quanh một ngày: (đang chứa, kế tiếp), xét theo NGÀY
    (ngày giao tiết thuộc tiết mới)."""
    jd = jd_from_date(dd, mm, yy)
    ds = _moc_tiet_khi_nam_dem(yy)
    i_truoc, i_sau = -1, -1
    for i, m in enumerate(ds):
        if _jd_cua(m["ngay"]) <= jd:
            i_truoc = i
        elif i_sau < 0:
            i_sau = i
    dang_chua = ds[i_truoc] if i_truoc >= 0 else _moc_tiet_khi_nam_dem(yy - 1)[-1]
    ke_tiep = ds[i_sau] if i_sau >= 0 else _moc_tiet_khi_nam_dem(yy + 1)[0]
    return dict(dang_chua), dict(ke_tiep)


# ---------------------------------------------------------------------------
# Nhị Thập Bát Tú
# ---------------------------------------------------------------------------

# Mốc: ngày 21/9/2026 là sao Tâm (vị trí 4).
_MOC_SAO_JD = jd_from_date(21, 9, 2026)
_MOC_SAO_INDEX = 4

_BANG_SAO = (
    ("Giác", "Horn", "Thanh Long (Đông)", "Azure Dragon (East)", "Mộc"),
    ("Cang", "Neck", "Thanh Long (Đông)", "Azure Dragon (East)", "Kim"),
    ("Đê", "Root", "Thanh Long (Đông)", "Azure Dragon (East)", "Thổ"),
    ("Phòng", "Room", "Thanh Long (Đông)", "Azure Dragon (East)", "Nhật"),
    ("Tâm", "Heart", "Thanh Long (Đông)", "Azure Dragon (East)", "Nguyệt"),
    ("Vĩ", "Tail", "Thanh Long (Đông)", "Azure Dragon (East)", "Hỏa"),
    ("Cơ", "Winnowing Basket", "Thanh Long (Đông)", "Azure Dragon (East)", "Thủy"),
    ("Đẩu", "Dipper", "Huyền Vũ (Bắc)", "Black Tortoise (North)", "Mộc"),
    ("Ngưu", "Ox", "Huyền Vũ (Bắc)", "Black Tortoise (North)", "Kim"),
    ("Nữ", "Girl", "Huyền Vũ (Bắc)", "Black Tortoise (North)", "Thổ"),
    ("Hư", "Emptiness", "Huyền Vũ (Bắc)", "Black Tortoise (North)", "Nhật"),
    ("Nguy", "Rooftop", "Huyền Vũ (Bắc)", "Black Tortoise (North)", "Nguyệt"),
    ("Thất", "Encampment", "Huyền Vũ (Bắc)", "Black Tortoise (North)", "Hỏa"),
    ("Bích", "Wall", "Huyền Vũ (Bắc)", "Black Tortoise (North)", "Thủy"),
    ("Khuê", "Legs", "Bạch Hổ (Tây)", "White Tiger (West)", "Mộc"),
    ("Lâu", "Bond", "Bạch Hổ (Tây)", "White Tiger (West)", "Kim"),
    ("Vị", "Stomach", "Bạch Hổ (Tây)", "White Tiger (West)", "Thổ"),
    ("Mão", "Hairy Head", "Bạch Hổ (Tây)", "White Tiger (West)", "Nhật"),
    ("Tất", "Net", "Bạch Hổ (Tây)", "White Tiger (West)", "Nguyệt"),
    ("Chủy", "Turtle Beak", "Bạch Hổ (Tây)", "White Tiger (West)", "Hỏa"),
    ("Sâm", "Three Stars", "Bạch Hổ (Tây)", "White Tiger (West)", "Thủy"),
    ("Tỉnh", "Well", "Chu Tước (Nam)", "Vermilion Bird (South)", "Mộc"),
    ("Quỷ", "Ghost", "Chu Tước (Nam)", "Vermilion Bird (South)", "Kim"),
    ("Liễu", "Willow", "Chu Tước (Nam)", "Vermilion Bird (South)", "Thổ"),
    ("Tinh", "Star", "Chu Tước (Nam)", "Vermilion Bird (South)", "Nhật"),
    ("Trương", "Extended Net", "Chu Tước (Nam)", "Vermilion Bird (South)", "Nguyệt"),
    ("Dực", "Wings", "Chu Tước (Nam)", "Vermilion Bird (South)", "Hỏa"),
    ("Chẩn", "Chariot", "Chu Tước (Nam)", "Vermilion Bird (South)", "Thủy"),
)

# Mỗi diệu ứng một thứ trong tuần, Chủ Nhật là 0.
_DIEU_SANG_THU = {"Nhật": 0, "Nguyệt": 1, "Hỏa": 2, "Thủy": 3, "Mộc": 4, "Kim": 5, "Thổ": 6}


def _sao_theo_vi_tri(i: int) -> Dict:
    ten, ten_en, chom, chom_en, dieu = _BANG_SAO[i]
    return {"viTri": i, "ten": ten, "tenEn": ten_en, "chom": chom,
            "chomEn": chom_en, "dieu": dieu, "thu": _DIEU_SANG_THU[dieu]}


def sao_cua_ngay(dd: int, mm: int, yy: int) -> Dict:
    """Sao Nhị Thập Bát Tú của một ngày dương lịch."""
    return _sao_theo_vi_tri((jd_from_date(dd, mm, yy) - _MOC_SAO_JD + _MOC_SAO_INDEX) % 28)


def all_nhi_thap_bat_tu() -> List[Dict]:
    """Cả 28 sao theo thứ tự vòng (Giác là 0)."""
    return [_sao_theo_vi_tri(i) for i in range(28)]


# ---------------------------------------------------------------------------
# Ngũ hành và nạp âm
# ---------------------------------------------------------------------------

NGU_HANH_LIST = ("Kim", "Thủy", "Mộc", "Hỏa", "Thổ")
# Ngũ hành của 10 Thiên Can (Giáp Ất Mộc, Bính Đinh Hỏa, Mậu Kỷ Thổ, Canh Tân Kim, Nhâm Quý Thủy).
CAN_NGU_HANH = ("Mộc", "Mộc", "Hỏa", "Hỏa", "Thổ", "Thổ", "Kim", "Kim", "Thủy", "Thủy")
HANH_EN = {"Kim": "Metal", "Mộc": "Wood", "Thủy": "Water", "Hỏa": "Fire", "Thổ": "Earth"}
HANH_ZH = {"Kim": "金", "Mộc": "木", "Thủy": "水", "Hỏa": "火", "Thổ": "土"}

_CHI_NGU_HANH = {
    "Tý": "Thủy", "Hợi": "Thủy", "Dần": "Mộc", "Mão": "Mộc",
    "Tỵ": "Hỏa", "Ngọ": "Hỏa", "Thân": "Kim", "Dậu": "Kim",
    "Thìn": "Thổ", "Tuất": "Thổ", "Sửu": "Thổ", "Mùi": "Thổ",
}


def chi_to_ngu_hanh(chi: str) -> Tuple[str, str]:
    """Ngũ hành của một Địa Chi: (tên Việt, tên Anh); rỗng khi tên lạ."""
    h = _CHI_NGU_HANH.get(chi)
    if h is None:
        return "", ""
    return h, HANH_EN[h]


def can_to_ngu_hanh(can: str) -> Tuple[str, str, bool, bool]:
    """Ngũ hành và âm dương của một Thiên Can: (hành, hành tiếng Anh, là
    dương, hợp lệ). Can chỉ số chẵn là Dương."""
    i = can_index(can)
    if i < 0:
        return "", "", False, False
    h = CAN_NGU_HANH[i]
    return h, HANH_EN[h], i % 2 == 0, True


# 30 cặp gốc của Nạp Âm Lục Thập Hoa Giáp: mỗi cặp áp cho chính nó và cặp
# (can+1, chi+1) kế tiếp.
_NAP_AM_GOC = (
    (0, 0, "Kim", "Metal", "Hải Trung Kim"),
    (2, 2, "Hỏa", "Fire", "Lư Trung Hỏa"),
    (4, 4, "Mộc", "Wood", "Đại Lâm Mộc"),
    (6, 6, "Thổ", "Earth", "Lộ Bàng Thổ"),
    (8, 8, "Kim", "Metal", "Kiếm Phong Kim"),
    (0, 10, "Hỏa", "Fire", "Sơn Đầu Hỏa"),
    (2, 0, "Thủy", "Water", "Giản Hạ Thủy"),
    (4, 2, "Thổ", "Earth", "Thành Đầu Thổ"),
    (6, 4, "Kim", "Metal", "Bạch Lạp Kim"),
    (8, 6, "Mộc", "Wood", "Dương Liễu Mộc"),
    (0, 8, "Thủy", "Water", "Tuyền Trung Thủy"),
    (2, 10, "Thổ", "Earth", "Ốc Thượng Thổ"),
    (4, 0, "Hỏa", "Fire", "Tích Lịch Hỏa"),
    (6, 2, "Mộc", "Wood", "Tùng Bách Mộc"),
    (8, 4, "Thủy", "Water", "Trường Lưu Thủy"),
    (0, 6, "Kim", "Metal", "Sa Trung Kim"),
    (2, 8, "Hỏa", "Fire", "Sơn Hạ Hỏa"),
    (4, 10, "Mộc", "Wood", "Bình Địa Mộc"),
    (6, 0, "Thổ", "Earth", "Bích Thượng Thổ"),
    (8, 2, "Kim", "Metal", "Kim Bạc Kim"),
    (0, 4, "Hỏa", "Fire", "Phú Đăng Hỏa"),
    (2, 6, "Thủy", "Water", "Thiên Hà Thủy"),
    (4, 8, "Thổ", "Earth", "Đại Trạch Thổ"),
    (6, 10, "Kim", "Metal", "Thoa Xuyến Kim"),
    (8, 0, "Mộc", "Wood", "Tang Đố Mộc"),
    (0, 2, "Thủy", "Water", "Đại Khê Thủy"),
    (2, 4, "Thổ", "Earth", "Sa Trung Thổ"),
    (4, 6, "Hỏa", "Fire", "Thiên Thượng Hỏa"),
    (6, 8, "Mộc", "Wood", "Thạch Lựu Mộc"),
    (8, 10, "Thủy", "Water", "Đại Hải Thủy"),
)


def _dung_bang_nap_am() -> Dict[Tuple[int, int], Tuple[str, str, str]]:
    bang = {}
    for can, chi, hanh, hanh_en, ten in _NAP_AM_GOC:
        bang[(can, chi)] = (hanh, hanh_en, ten)
        bang[(mod(can + 1, 10), mod(chi + 1, 12))] = (hanh, hanh_en, ten)
    return bang


_BANG_NAP_AM = _dung_bang_nap_am()


def ngu_hanh_nap_am(can_idx: int, chi_idx: int) -> Tuple[str, str, str]:
    """Nạp âm của cặp can chi theo chỉ số: (hành, hành tiếng Anh, tên nạp âm).
    Cặp không thuộc vòng 60 (can, chi khác tính chẵn lẻ) trả ba chuỗi rỗng."""
    return _BANG_NAP_AM.get((mod(can_idx, 10), mod(chi_idx, 12)), ("", "", ""))


# Vòng tương sinh Mộc, Hỏa, Thổ, Kim, Thủy và vòng tương khắc.
_SINH = {"Mộc": "Hỏa", "Hỏa": "Thổ", "Thổ": "Kim", "Kim": "Thủy", "Thủy": "Mộc"}
_KHAC = {"Mộc": "Thổ", "Thổ": "Thủy", "Thủy": "Hỏa", "Hỏa": "Kim", "Kim": "Mộc"}

NGU_HANH_TUONG_SINH = "tuong_sinh"
NGU_HANH_TUONG_KHAC = "tuong_khac"
NGU_HANH_TUONG_HOA = "tuong_hoa"


def ngu_hanh_sinh_ra(hanh: str) -> str:
    """Hành mà hanh sinh ra (Mộc sinh Hỏa); rỗng khi tên lạ."""
    return _SINH.get(hanh, "")


def ngu_hanh_khac_duoc(hanh: str) -> str:
    """Hành mà hanh khắc (Mộc khắc Thổ); rỗng khi tên lạ."""
    return _KHAC.get(hanh, "")


def hanh_sinh_ra(h: str) -> str:
    """Hành SINH RA h (hanh_sinh_ra("Kim") là "Thổ"); rỗng khi tên lạ."""
    for me, con in _SINH.items():
        if con == h:
            return me
    return ""


def hanh_khac_lai(h: str) -> str:
    """Hành KHẮC h (hanh_khac_lai("Kim") là "Hỏa"); rỗng khi tên lạ."""
    for k, bi in _KHAC.items():
        if bi == h:
            return k
    return ""


def tuong_sinh_tuong_khac(hanh1: str, hanh2: str) -> str:
    """Quan hệ hai hành, không phân hướng: tuong_hoa, tuong_sinh, tuong_khac."""
    if hanh1 == hanh2:
        return NGU_HANH_TUONG_HOA
    if _SINH.get(hanh1) == hanh2 or _SINH.get(hanh2) == hanh1:
        return NGU_HANH_TUONG_SINH
    return NGU_HANH_TUONG_KHAC


def xem_ngu_hanh_theo_nam(nam_am_1: int, nam_am_2: int) -> Dict[str, str]:
    """So ngũ hành của Chi năm sinh (năm âm) giữa hai người."""
    chi1 = year_can_chi(nam_am_1)["chi"]
    chi2 = year_can_chi(nam_am_2)["chi"]
    h1, _ = chi_to_ngu_hanh(chi1)
    h2, _ = chi_to_ngu_hanh(chi2)
    return {"chiNam1": chi1, "chiNam2": chi2, "hanhNam1": h1, "hanhNam2": h2,
            "quanHe": tuong_sinh_tuong_khac(h1, h2)}
