"""Lá số Bát Tự (Tứ Trụ): bốn trụ, tàng can, thập thần, vòng trường sinh, thần
sát, thai nguyên, mệnh cung, đại vận và tiểu vận.

Bản chuyển ngữ sang Python của lõi tính Go của Nhật Nguyệt
(battu.go, battu_laso.go, battu_tangcan.go,
battu_thansat.go, battu_loc.go, battu_tieuvan.go, thapthan.go, cùng các bảng
Lộc, vòng Tràng Sinh, Đào Hoa, Thiên Mã ở tuvi_data.go, tuvi.go). Lõi Go là
nguồn sự thật; bộ ca kiểm ở thu-vien-mo/ca-kiem/bat-tu.json bắt mọi chỗ lệch.

Ba quy ước lõi tính đã chọn (các phái khác nhau ở đây):

1. Trụ THÁNG theo tiết khí (kinh độ Mặt Trời), không theo tháng âm lịch.
2. Trụ NĂM đổi tại Lập Xuân (kinh độ 315 độ), không tại mùng 1 Tết.
3. Trụ NGÀY đổi lúc 23h00 (đầu giờ Tý), không tách Tý sớm, Tý muộn.

Mọi giờ là giờ Việt Nam UTC+7. Lịch, tiết khí, can chi, nạp âm dùng lại mô-đun
``nhatnguyet.am_lich``; tệp này chỉ thêm phần riêng của Bát Tự.

Quy ước số học như am_lich: ``int()`` là phép cắt về 0 của Go, ``math.floor``
là math.Floor, ``_lam_tron`` là math.Round của Go.

Chữ diễn giải dài (các bước tính, quy ước, ghi chú giờ Tý) chưa trả ở đây,
khớp với danh sách ``khoaBo`` của bộ ca kiểm. Lời giải thích đại vận
(``lyDo``, ``lyDoEn``, ``lyDoZh``) thì có, vì nó mang con số tính được.
"""

from __future__ import annotations

import json
import math
from typing import Dict, List, Optional, Tuple

from .am_lich import (
    CAN_NGU_HANH,
    DIA_CHI,
    THIEN_CAN,
    TIME_ZONE_VN,
    _lam_tron,
    _moc_tiet_khi_nam_dem,
    can_index,
    can_to_ngu_hanh,
    chi_index,
    chi_to_ngu_hanh,
    day_can_chi,
    jd_from_date,
    jd_to_date,
    kinh_do_mat_troi,
    mod,
    ngu_hanh_khac_duoc,
    ngu_hanh_nap_am,
    ngu_hanh_sinh_ra,
    tiet_khi_tai_thoi_diem,
    all_tiet_khi,
    tiet_khi_theo_index,
    year_can_chi,
)

__all__ = [
    # hàm chính
    "lap_la_so_bat_tu", "tinh_tieu_van_bat_tu",
    # lựa chọn phái (school options)
    "normalize_bazi_schools", "BAZI_SCHOOL_VALUES",
    # bốn trụ và các phép tra
    "lap_tu_tru", "tru_tu_index", "chi_gio_tu_gio_dong_ho",
    "thap_than_cua_can", "all_thap_than", "tang_can_cua_chi",
    "truong_sinh_cua_can", "loc_cua_can", "duong_nhan_cua_can",
    "quan_he_hai_can", "thien_khac_dia_xung",
    # hằng
    "NHAT_CHU_LABEL", "VAI_TRO_BAN_KHI", "VAI_TRO_TRUNG_KHI", "VAI_TRO_DU_KHI",
    "CAN_NGU_HOP", "CAN_KHAC", "CAN_BI_KHAC", "CAN_SINH", "CAN_DUOC_SINH", "CAN_DONG_HANH",
]


# ---------------------------------------------------------------------------
# Tên ba thứ tiếng (tuvi_bangonngu.go của lõi Go)
# ---------------------------------------------------------------------------

# Thuật ngữ ba thứ tiếng của lá số, chép từ TuVung (tuvung.go): can, chi, hành,
# vai tàng can, âm dương, chín thần sát, 30 nạp âm (hai lối viết Kim Bạch, Kim
# Bạc). Mỗi mục (tiếng Anh, chữ Hán). Can, chi giữ tên Hán Việt ở bản Anh nên
# kết quả chỉ mang bản chữ Hán của chúng.
TU_VUNG_BAT_TU: Dict[str, Tuple[str, str]] = {
    "Giáp": ("Giáp", "甲"), "Ất": ("Ất", "乙"), "Bính": ("Bính", "丙"), "Đinh": ("Đinh", "丁"), "Mậu": ("Mậu", "戊"),
    "Kỷ": ("Kỷ", "己"), "Canh": ("Canh", "庚"), "Tân": ("Tân", "辛"), "Nhâm": ("Nhâm", "壬"), "Quý": ("Quý", "癸"),
    "Tý": ("Tý", "子"), "Sửu": ("Sửu", "丑"), "Dần": ("Dần", "寅"), "Mão": ("Mão", "卯"), "Thìn": ("Thìn", "辰"),
    "Tỵ": ("Tỵ", "巳"), "Ngọ": ("Ngọ", "午"), "Mùi": ("Mùi", "未"), "Thân": ("Thân", "申"), "Dậu": ("Dậu", "酉"),
    "Tuất": ("Tuất", "戌"), "Hợi": ("Hợi", "亥"),
    "Kim": ("Metal", "金"), "Mộc": ("Wood", "木"), "Thủy": ("Water", "水"), "Hỏa": ("Fire", "火"), "Thổ": ("Earth", "土"),
    "Bản khí": ("main qi", "本气"), "Trung khí": ("middle qi", "中气"), "Dư khí": ("residual qi", "余气"),
    "Dương": ("Yang", "阳"), "Âm": ("Yin", "阴"),
    "Thiên Ất Quý Nhân": ("Heavenly Noble", "天乙贵人"), "Văn Xương": ("Literary Glory", "文昌"),
    "Lộc Thần": ("Prosperity Star", "禄神"), "Dương Nhận": ("Yang Blade", "羊刃"), "Đào Hoa": ("Peach Blossom", "桃花"),
    "Dịch Mã": ("Travelling Horse", "驿马"), "Hoa Cái": ("Canopy", "华盖"), "Kiếp Sát": ("Robbery Sha", "劫煞"),
    "Vong Thần": ("Lost Spirit", "亡神"),
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

# Chữ Hán của 24 tiết khí (TuVung).
_TIET_KHI_ZH = {
    "Lập Xuân": "立春", "Vũ Thủy": "雨水", "Kinh Trập": "惊蛰", "Xuân Phân": "春分", "Thanh Minh": "清明",
    "Cốc Vũ": "谷雨", "Lập Hạ": "立夏", "Tiểu Mãn": "小满", "Mang Chủng": "芒种", "Hạ Chí": "夏至",
    "Tiểu Thử": "小暑", "Đại Thử": "大暑", "Lập Thu": "立秋", "Xử Thử": "处暑", "Bạch Lộ": "白露",
    "Thu Phân": "秋分", "Hàn Lộ": "寒露", "Sương Giáng": "霜降", "Lập Đông": "立冬", "Tiểu Tuyết": "小雪",
    "Đại Tuyết": "大雪", "Đông Chí": "冬至", "Tiểu Hàn": "小寒", "Đại Hàn": "大寒",
}


def zh_cua(vi: str) -> str:
    """Chữ Hán của một thuật ngữ hay một cặp can chi ("Bính Ngọ" ra 丙午);
    rỗng khi không có (zhCua của lõi Go)."""
    s = vi.strip()
    if not s:
        return ""
    phan = s.split()
    if len(phan) == 2 and phan[0] in THIEN_CAN and phan[1] in DIA_CHI:
        return TU_VUNG_BAT_TU[phan[0]][1] + TU_VUNG_BAT_TU[phan[1]][1]
    t = TU_VUNG_BAT_TU.get(s)
    return t[1] if t else ""


def en_cua(vi: str) -> str:
    """Tên tiếng Anh của một thuật ngữ; rỗng khi không có (enCua của lõi Go)."""
    t = TU_VUNG_BAT_TU.get(vi.strip())
    return t[0] if t else ""


def tiet_khi_ba_thu(vi: str) -> Tuple[str, str]:
    """(tiếng Anh theo bảng tiết khí, chữ Hán) của một tiết khí; rỗng khi không phải tên tiết."""
    if not vi:
        return "", ""
    for t in all_tiet_khi():
        if t["ten"] == vi:
            return t["tenEn"], _TIET_KHI_ZH.get(vi, "")
    return "", ""


def truong_sinh_ba_thu(vi: str) -> Tuple[str, str]:
    """(tiếng Anh, chữ Hán) của một giai đoạn vòng trường sinh."""
    for v, en, zh in _VONG_TRUONG_SINH:
        if v == vi:
            return en, zh
    return "", ""


# ---------------------------------------------------------------------------
# Tiện ích chỉ số (indexOfCan, indexOfChi của Go: tên lạ thì 0)
# ---------------------------------------------------------------------------


def _idx_can(can: str) -> int:
    i = can_index(can)
    return i if i >= 0 else 0


def _idx_chi(chi: str) -> int:
    i = chi_index(chi)
    return i if i >= 0 else 0


# ---------------------------------------------------------------------------
# Trụ
# ---------------------------------------------------------------------------


def tru_tu_index(can_idx: int, chi_idx: int) -> Dict:
    """Một trụ từ chỉ số can và chi (tự đưa về vòng): ``{can, chi, label,
    canHanh, chiHanh, canAm, napAm, napAmTen}``."""
    ci, hi = mod(can_idx, 10), mod(chi_idx, 12)
    can, chi = THIEN_CAN[ci], DIA_CHI[hi]
    chi_hanh, _ = chi_to_ngu_hanh(chi)
    nap_am, _, nap_am_ten = ngu_hanh_nap_am(ci, hi)
    can_hanh = CAN_NGU_HANH[ci]
    return {
        "can": can, "canZh": zh_cua(can), "chi": chi, "chiZh": zh_cua(chi),
        "label": can + " " + chi, "labelZh": zh_cua(can + " " + chi),
        "canHanh": can_hanh, "canHanhEn": en_cua(can_hanh), "canHanhZh": zh_cua(can_hanh),
        "chiHanh": chi_hanh, "chiHanhEn": en_cua(chi_hanh), "chiHanhZh": zh_cua(chi_hanh),
        "canAm": ci % 2 == 1,
        "napAm": nap_am, "napAmEn": en_cua(nap_am), "napAmZh": zh_cua(nap_am),
        "napAmTen": nap_am_ten, "napAmTenEn": en_cua(nap_am_ten), "napAmTenZh": zh_cua(nap_am_ten),
    }


def chi_gio_tu_gio_dong_ho(gio: int) -> int:
    """Đổi giờ đồng hồ (0 tới 23) sang chỉ số chi giờ; giờ Tý từ 23h tới 1h."""
    return ((gio + 1) // 2) % 12


def _can_gio_dau(can_ngay_idx: int) -> int:
    """Ngũ Thử Độn: can của giờ Tý suy từ can ngày."""
    return (can_ngay_idx % 5) * 2 % 10


def _can_thang_dan(can_nam_idx: int) -> int:
    """Ngũ Hổ Độn: can của tháng Dần suy từ can năm."""
    return ((can_nam_idx % 5) * 2 + 2) % 10


def lap_tu_tru(dd: int, mm: int, yyyy: int, gio_sinh: int, phut: int, nua_dem: bool = False) -> Dict:
    """Bốn trụ từ ngày giờ sinh DƯƠNG LỊCH (giờ Việt Nam), như LapBatTu của Go,
    chỉ phần lập trụ (không có phần đếm ngũ hành). Trả ``{truNam, truThang,
    truNgay, truGio, nhatChu, nhatChuHanh, tietKhi, namTruNam, tietDauThang}``,
    trong đó ``tietKhi``, ``tietDauThang`` là dict tiết khí."""
    if gio_sinh < 0 or gio_sinh > 23:
        gio_sinh = 12
    if phut < 0 or phut > 59:
        phut = 0
    gio_thap_phan = float(gio_sinh) + float(phut) / 60

    # Trụ ngày đổi lúc 23h: sinh từ 23h00 thuộc can chi ngày hôm sau.
    ngay_cho_tru_ngay = jd_from_date(dd, mm, yyyy)
    if gio_sinh >= 23:
        ngay_cho_tru_ngay += 1
    d_ngay = jd_to_date(ngay_cho_tru_ngay)
    cc_ngay = day_can_chi(d_ngay["day"], d_ngay["month"], d_ngay["year"])
    can_ngay_idx = _idx_can(cc_ngay["can"])
    chi_ngay_idx = _idx_chi(cc_ngay["chi"])
    # Can giờ suy từ can của ngày mà giờ Tý ấy mở đầu; lựa chọn "split-at-midnight"
    # (nua_dem) chỉ giữ trụ NGÀY ở ngày đã nhập.
    can_ngay_cho_gio = can_ngay_idx
    if nua_dem and gio_sinh >= 23:
        cc = day_can_chi(dd, mm, yyyy)
        can_ngay_idx = _idx_can(cc["can"])
        chi_ngay_idx = _idx_chi(cc["chi"])

    # Trụ năm và trụ tháng theo kinh độ Mặt Trời.
    deg = kinh_do_mat_troi(dd, mm, yyyy, gio_thap_phan, TIME_ZONE_VN)
    nam_tru_nam = yyyy
    if mm <= 2 and deg < 315:
        nam_tru_nam = yyyy - 1  # chưa tới Lập Xuân
    cc_nam = year_can_chi(nam_tru_nam)
    can_nam_idx = _idx_can(cc_nam["can"])
    chi_nam_idx = _idx_chi(cc_nam["chi"])

    # Thứ tự tháng tính từ Lập Xuân: 0 là tháng Dần.
    thu_tu_thang = int(deg - 315 + 360) % 360 // 30
    chi_thang_idx = (thu_tu_thang + 2) % 12
    tiet_dau_thang = tiet_khi_theo_index(((315 + 30 * thu_tu_thang) % 360) // 15)
    can_thang_idx = (_can_thang_dan(can_nam_idx) + thu_tu_thang) % 10

    chi_gio_idx = chi_gio_tu_gio_dong_ho(gio_sinh)
    can_gio_idx = (_can_gio_dau(can_ngay_cho_gio) + chi_gio_idx) % 10

    tru_ngay = tru_tu_index(can_ngay_idx, chi_ngay_idx)
    return {
        "truNam": tru_tu_index(can_nam_idx, chi_nam_idx),
        "truThang": tru_tu_index(can_thang_idx, chi_thang_idx),
        "truNgay": tru_ngay,
        "truGio": tru_tu_index(can_gio_idx, chi_gio_idx),
        "nhatChu": tru_ngay["can"],
        "nhatChuHanh": tru_ngay["canHanh"],
        "tietKhi": tiet_khi_tai_thoi_diem(dd, mm, yyyy, gio_thap_phan),
        "namTruNam": nam_tru_nam,
        "tietDauThang": tiet_dau_thang,
    }


# ---------------------------------------------------------------------------
# Thập thần (thapthan.go): suy từ quan hệ ngũ hành và âm dương
# ---------------------------------------------------------------------------

# Năm quan hệ ngũ hành, nhìn từ nhật chủ.
_QH_CUNG_HANH, _QH_MINH_SINH, _QH_MINH_KHAC, _QH_KHAC_MINH, _QH_SINH_MINH = range(5)

# (quan hệ, cùng âm dương) -> (tên, tên Anh, tên Hán phồn thể, tên Hán giản
# thể, nhóm, quan hệ, cùng âm dương). "Chính" là KHÁC âm dương; "Thiên",
# "Thực", "Tỷ" là CÙNG âm dương. Tên giản thể là GianThe của tên phồn thể.
_BANG_THAP_THAN = {
    (_QH_CUNG_HANH, True): ("Tỷ Kiên", "Friend", "比肩", "比肩", "Tỷ Kiếp", "cùng hành với Nhật Chủ"),
    (_QH_CUNG_HANH, False): ("Kiếp Tài", "Rob Wealth", "劫財", "劫财", "Tỷ Kiếp", "cùng hành với Nhật Chủ"),
    (_QH_MINH_SINH, True): ("Thực Thần", "Eating God", "食神", "食神", "Thực Thương", "Nhật Chủ sinh ra hành này"),
    (_QH_MINH_SINH, False): ("Thương Quan", "Hurting Officer", "傷官", "伤官", "Thực Thương", "Nhật Chủ sinh ra hành này"),
    (_QH_MINH_KHAC, True): ("Thiên Tài", "Indirect Wealth", "偏財", "偏财", "Tài", "Nhật Chủ khắc hành này"),
    (_QH_MINH_KHAC, False): ("Chính Tài", "Direct Wealth", "正財", "正财", "Tài", "Nhật Chủ khắc hành này"),
    (_QH_KHAC_MINH, True): ("Thất Sát", "Seven Killings", "七殺", "七杀", "Quan Sát", "hành này khắc Nhật Chủ"),
    (_QH_KHAC_MINH, False): ("Chính Quan", "Direct Officer", "正官", "正官", "Quan Sát", "hành này khắc Nhật Chủ"),
    (_QH_SINH_MINH, True): ("Thiên Ấn", "Indirect Resource", "偏印", "偏印", "Ấn", "hành này sinh ra Nhật Chủ"),
    (_QH_SINH_MINH, False): ("Chính Ấn", "Direct Resource", "正印", "正印", "Ấn", "hành này sinh ra Nhật Chủ"),
}


def _thap_than_dict(khoa: Tuple[int, bool]) -> Dict:
    ten, en, han, zh, nhom, quan_he = _BANG_THAP_THAN[khoa]
    return {"ten": ten, "tenEn": en, "tenHan": han, "tenZh": zh, "nhom": nhom,
            "quanHe": quan_he, "cungAmDuong": khoa[1]}


def _quan_he_hanh(minh: str, khac: str) -> Optional[int]:
    if minh == khac:
        return _QH_CUNG_HANH
    if ngu_hanh_sinh_ra(minh) == khac:
        return _QH_MINH_SINH
    if ngu_hanh_khac_duoc(minh) == khac:
        return _QH_MINH_KHAC
    if ngu_hanh_khac_duoc(khac) == minh:
        return _QH_KHAC_MINH
    if ngu_hanh_sinh_ra(khac) == minh:
        return _QH_SINH_MINH
    return None


def thap_than_cua_can(nhat_chu: str, can: str) -> Optional[Dict]:
    """Thần mà ``can`` đóng vai đối với ``nhat_chu``: dict ``{ten, tenEn,
    tenHan, tenZh, nhom, quanHe, cungAmDuong}`` (tenHan phồn thể như Go,
    tenZh giản thể); None khi một trong hai không phải thiên can."""
    hanh_chu, _, duong_chu, ok1 = can_to_ngu_hanh(nhat_chu)
    hanh_can, _, duong_can, ok2 = can_to_ngu_hanh(can)
    if not ok1 or not ok2:
        return None
    qh = _quan_he_hanh(hanh_chu, hanh_can)
    if qh is None:
        return None
    return _thap_than_dict((qh, duong_chu == duong_can))


def all_thap_than() -> List[Dict]:
    """Đủ mười thần theo thứ tự cố định: từng cặp, cùng âm dương trước."""
    return [_thap_than_dict((qh, cung)) for qh in range(5) for cung in (True, False)]


# ---------------------------------------------------------------------------
# Lộc, Dương Nhận (battu_loc.go), vòng Trường Sinh, tàng can (battu_tangcan.go)
# ---------------------------------------------------------------------------

# Bảng "Lộc thập Can", dùng chung với sao Lộc Tồn của Tử Vi:
# Dần, Mão, Tỵ, Ngọ, Tỵ, Ngọ, Thân, Dậu, Hợi, Tý.
_LOC_VI_TRI = (2, 3, 5, 6, 5, 6, 8, 9, 11, 0)

# Mười hai giai đoạn vòng Tràng Sinh (tên Việt, tên Anh, chữ Hán).
_VONG_TRUONG_SINH = (
    ("Tràng Sinh", "Growth", "长生"), ("Mộc Dục", "Bathing", "沐浴"), ("Quan Đới", "Youth", "冠带"),
    ("Lâm Quan", "Prime", "临官"), ("Đế Vượng", "Peak", "帝旺"), ("Suy", "Decline", "衰"),
    ("Bệnh", "Illness", "病"), ("Tử", "Death", "死"), ("Mộ", "Tomb", "墓"),
    ("Tuyệt", "Extinction", "绝"), ("Thai", "Conception", "胎"), ("Dưỡng", "Nurture", "养"),
)


def loc_cua_can(can_idx: int) -> str:
    """Địa chi là Lộc (Lâm Quan) của thiên can (Giáp 0 tới Quý 9)."""
    return DIA_CHI[_LOC_VI_TRI[can_idx]]


def duong_nhan_cua_can(can_idx: int) -> Dict:
    """Dương Nhận theo từng cách tính: ``{can, laDuong, truocLoc, deVuong}``.
    Can dương: mọi cách cùng một chi. Can âm: ``truocLoc`` là ngôi ngay sau
    Lộc, ``deVuong`` là ngôi Đế Vượng (lùi một ngôi từ Lộc)."""
    loc = _LOC_VI_TRI[can_idx]
    la_duong = can_idx % 2 == 0
    truoc_loc = DIA_CHI[mod(loc + 1, 12)]
    return {
        "can": THIEN_CAN[can_idx], "laDuong": la_duong, "truocLoc": truoc_loc,
        "deVuong": truoc_loc if la_duong else DIA_CHI[mod(loc - 1, 12)],
    }


def _truong_sinh_khoi(can_idx: int) -> int:
    """Chi khởi Trường Sinh: can dương lùi ba ngôi từ Lộc, can âm tiến ba."""
    loc = _LOC_VI_TRI[mod(can_idx, 10)]
    if can_idx % 2 == 0:
        return mod(loc - 3, 12)
    return mod(loc + 3, 12)


def truong_sinh_cua_can(can_idx: int, chi_idx: int) -> str:
    """Giai đoạn trường sinh của can tại địa chi (dương thuận, âm nghịch, Mậu
    theo Bính, Kỷ theo Đinh)."""
    khoi = _truong_sinh_khoi(can_idx)
    if can_idx % 2 == 0:
        buoc = mod(chi_idx - khoi, 12)
    else:
        buoc = mod(khoi - chi_idx, 12)
    return _VONG_TRUONG_SINH[buoc][0]


VAI_TRO_BAN_KHI = "Bản khí"
VAI_TRO_TRUNG_KHI = "Trung khí"
VAI_TRO_DU_KHI = "Dư khí"
_TEN_VAI_TRO = (VAI_TRO_BAN_KHI, VAI_TRO_TRUNG_KHI, VAI_TRO_DU_KHI)

# Tàng can theo lối nhân nguyên tư lệnh của Tử Bình chân thuyên:
# {bản khí, trung khí, dư khí}, chỉ số can, -1 khi không có.
_TANG_CAN = (
    (9, -1, -1),  # Tý: Quý
    (5, 7, 9),    # Sửu: Kỷ, Tân, Quý
    (0, 2, 4),    # Dần: Giáp, Bính, Mậu
    (1, -1, -1),  # Mão: Ất
    (4, 9, 1),    # Thìn: Mậu, Quý, Ất
    (2, 6, 4),    # Tỵ: Bính, Canh, Mậu
    (3, 5, -1),   # Ngọ: Đinh, Kỷ
    (5, 1, 3),    # Mùi: Kỷ, Ất, Đinh
    (6, 8, 4),    # Thân: Canh, Nhâm, Mậu
    (7, -1, -1),  # Dậu: Tân
    (4, 3, 7),    # Tuất: Mậu, Đinh, Tân
    (8, 0, -1),   # Hợi: Nhâm, Giáp
)


def tang_can_cua_chi(chi_idx: int, nhat_chu: str = "") -> List[Dict]:
    """Các can ẩn trong địa chi, bản khí trước: ``{can, hanh, vaiTro,
    thapThan[, thapThanEn, thapThanZh]}``. Không có nhật chủ thì thapThan
    rỗng và không có hai khoá En, Zh (như omitempty của Go)."""
    ra = []
    for i, c in enumerate(_TANG_CAN[mod(chi_idx, 12)]):
        if c < 0:
            continue
        h, vt = CAN_NGU_HANH[c], _TEN_VAI_TRO[i]
        tc = {"can": THIEN_CAN[c], "canZh": zh_cua(THIEN_CAN[c]),
              "hanh": h, "hanhEn": en_cua(h), "hanhZh": zh_cua(h),
              "vaiTro": vt, "vaiTroEn": en_cua(vt), "vaiTroZh": zh_cua(vt), "thapThan": ""}
        if nhat_chu:
            tt = thap_than_cua_can(nhat_chu, tc["can"])
            if tt is not None:
                tc["thapThan"] = tt["ten"]
                tc["thapThanEn"] = tt["tenEn"]
                tc["thapThanZh"] = tt["tenZh"]
        ra.append(tc)
    return ra


# ---------------------------------------------------------------------------
# Thần sát (battu_thansat.go)
# ---------------------------------------------------------------------------

# Thiên Ất Quý Nhân theo câu quyết "Giáp Mậu Canh Ngưu Dương...".
_THIEN_AT_QUY_NHAN = (
    (1, 7), (0, 8), (11, 9), (11, 9), (1, 7),
    (0, 8), (1, 7), (6, 2), (3, 5), (3, 5),
)

# Văn Xương của Bát Tự (tra theo can, khác Văn Xương Tử Vi).
_VAN_XUONG = (5, 6, 8, 9, 8, 9, 11, 0, 2, 3)

TEN_THIEN_AT_QUY_NHAN = "Thiên Ất Quý Nhân"
TEN_VAN_XUONG = "Văn Xương"
TEN_LOC_THAN = "Lộc Thần"
TEN_DUONG_NHAN = "Dương Nhận"
TEN_DAO_HOA = "Đào Hoa"
TEN_DICH_MA = "Dịch Mã"
TEN_HOA_CAI = "Hoa Cái"
TEN_KIEP_SAT = "Kiếp Sát"
TEN_VONG_THAN = "Vong Thần"


def _dao_hoa_vi_tri(chi_idx: int) -> int:
    """Đào Hoa theo nhóm tam hợp (daoHoaViTri của Tử Vi)."""
    nhom = mod(chi_idx, 4)
    if nhom == 0:
        return 9  # Dậu
    if nhom == 2:
        return 3  # Mão
    if chi_idx % 12 in (5, 9, 1):
        return 6  # Ngọ
    return 0  # Tý


def _thien_ma_vi_tri(chi_idx: int) -> int:
    """Dịch Mã (Thiên Mã) theo nhóm tam hợp."""
    r = mod(chi_idx + 1, 4)
    return {1: 2, 2: 11, 3: 8}.get(r, 5)


def _truong_sinh_tam_hop(chi_idx: int) -> int:
    return mod(8 - 3 * mod(chi_idx, 4), 12)


def _hoa_cai_vi_tri(chi_idx: int) -> int:
    return mod(_truong_sinh_tam_hop(chi_idx) + 8, 12)


def _kiep_sat_vi_tri(chi_idx: int) -> int:
    return mod(_truong_sinh_tam_hop(chi_idx) + 9, 12)


def _vong_than_vi_tri(chi_idx: int) -> int:
    return mod(_truong_sinh_tam_hop(chi_idx) + 3, 12)


_THEO_CAN_NGAY_NAM = (
    "Tra theo can ngày (nhật chủ) và can năm.",
    "Looked up from the day stem (day master) and the year stem.",
    "以日干（日主）与年干查。",
)
_THEO_CAN_NGAY = (
    "Tra theo can ngày (nhật chủ).",
    "Looked up from the day stem (day master).",
    "以日干（日主）查。",
)
_THEO_CHI_NAM_NGAY = (
    "Tra theo nhóm tam hợp của chi năm và chi ngày.",
    "Looked up from the Three Harmony group of the year branch and the day branch.",
    "以年支与日支所属三合局查。",
)
_LOI_KHAC_CHI_NAM_NGAY = (
    "Có sách chỉ tra theo chi năm, có sách chỉ tra theo chi ngày, nên một trụ có thể mang sao ở sách này mà không mang ở sách kia.",
    "Some books look this up from the year branch only, others from the day branch only, so a pillar may carry the star in one book and not in another.",
    "有的书只以年支查，有的只以日支查，因此同一柱在此书有此星、在彼书则无。",
)
_LOI_KHAC_QUY_NHAN = (
    "Lối chọn theo câu quyết \"Giáp Mậu Canh Ngưu Dương\". Có sách xếp Canh cùng Tân ở Ngọ Dần (\"Canh Tân phùng Mã Hổ\"), và có sách chỉ tra theo can ngày.",
    "This follows the rhyme that puts Giáp, Mậu and Canh at Sửu and Mùi. Some books put Canh with Tân at Ngọ and Dần instead, and some look it up from the day stem only.",
    "此处依\"甲戊庚牛羊\"之诀。另有书以庚辛同在午寅（\"庚辛逢马虎\"），也有书只以日干查。",
)
_LOI_KHAC_VAN_XUONG = (
    "Sao Văn Xương của Bát Tự tra theo can, khác sao Văn Xương của Tử Vi vốn an theo giờ sinh. Có sách chỉ tra theo can ngày. Can Tân ở đây theo câu quyết \"Tân Thử\" (ở Tý); Trương Quả tinh tông ghi can Tân ở Tuất.",
    "The Bát Tự Văn Xương is looked up from a stem, unlike the Tử Vi star of the same name, which is placed by birth hour. Some books use the day stem only. For the stem Tân this follows the rhyme that puts it at Tý; the Zhang Guo Xingzong puts Tân at Tuất.",
    "八字之文昌以天干查，与紫微斗数按时辰安的文昌不同。也有书只以日干查。辛干此处依\"辛鼠\"之诀（在子）；《张果星宗》作辛在戌（\"辛犬\"）。",
)
_LOI_KHAC_DUONG_NHAN = (
    "Với can âm các phái không thống nhất. Ở đây lấy ngôi ngay sau Lộc như can dương. Có phái lấy ngôi Đế Vượng của can âm (lùi một ngôi từ Lộc). Tam Mệnh Thông Hội ghi rằng Tử Bình cho năm can dương có Dương Nhận, còn năm can âm thì không.",
    "For yin stems the schools disagree. Here it is the branch right after the Lộc, as for yang stems. One school takes the yin stem's Peak position (one branch before the Lộc). The Sanming Tonghui records that Tử Bình gives a Dương Nhận to the five yang stems and none to the five yin stems.",
    "阴干羊刃各派不一。此处与阳干同，取禄前一位。有派取阴干帝旺之位（禄后一位）。《三命通会》记子平以甲丙戊庚壬五阳干有刃，乙丁己辛癸五阴干无刃。",
)
_KHONG_LOI_KHAC = ("", "", "")


def _them(ds: List[int], *xs: int) -> List[int]:
    """Thêm phần tử chưa có, giữ thứ tự."""
    ds = list(ds)
    for x in xs:
        if x not in ds:
            ds.append(x)
    return ds


def _tinh_than_sat(can_ngay: int, can_nam: int, chi_nam: int, chi_ngay: int, chi_tru: List[int]) -> List[Dict]:
    """Dò chín sao trên các trụ; chi_tru[i] = -1 là trụ i không có."""
    q = _THIEN_AT_QUY_NHAN
    ds = [
        (TEN_THIEN_AT_QUY_NHAN, _them([], q[can_ngay][0], q[can_ngay][1], q[can_nam][0], q[can_nam][1]),
         _THEO_CAN_NGAY_NAM, _LOI_KHAC_QUY_NHAN),
        (TEN_VAN_XUONG, _them([], _VAN_XUONG[can_ngay], _VAN_XUONG[can_nam]),
         _THEO_CAN_NGAY_NAM, _LOI_KHAC_VAN_XUONG),
        (TEN_LOC_THAN, [_idx_chi(loc_cua_can(can_ngay))], _THEO_CAN_NGAY, _KHONG_LOI_KHAC),
        (TEN_DUONG_NHAN, [_idx_chi(duong_nhan_cua_can(can_ngay)["truocLoc"])], _THEO_CAN_NGAY, _LOI_KHAC_DUONG_NHAN),
        (TEN_DAO_HOA, _them([], _dao_hoa_vi_tri(chi_nam), _dao_hoa_vi_tri(chi_ngay)),
         _THEO_CHI_NAM_NGAY, _LOI_KHAC_CHI_NAM_NGAY),
        (TEN_DICH_MA, _them([], _thien_ma_vi_tri(chi_nam), _thien_ma_vi_tri(chi_ngay)),
         _THEO_CHI_NAM_NGAY, _LOI_KHAC_CHI_NAM_NGAY),
        (TEN_HOA_CAI, _them([], _hoa_cai_vi_tri(chi_nam), _hoa_cai_vi_tri(chi_ngay)),
         _THEO_CHI_NAM_NGAY, _LOI_KHAC_CHI_NAM_NGAY),
        (TEN_KIEP_SAT, _them([], _kiep_sat_vi_tri(chi_nam), _kiep_sat_vi_tri(chi_ngay)),
         _THEO_CHI_NAM_NGAY, _LOI_KHAC_CHI_NAM_NGAY),
        (TEN_VONG_THAN, _them([], _vong_than_vi_tri(chi_nam), _vong_than_vi_tri(chi_ngay)),
         _THEO_CHI_NAM_NGAY, _LOI_KHAC_CHI_NAM_NGAY),
    ]
    ra = []
    for ten, dich, tra_theo, loi_khac in ds:
        vi_tri = [i for i, c in enumerate(chi_tru) if c >= 0 and c in dich]
        ra.append({
            "ten": ten, "tenEn": en_cua(ten), "tenZh": zh_cua(ten),
            "chiDich": [DIA_CHI[c] for c in dich],
            "chiDichZh": [zh_cua(DIA_CHI[c]) for c in dich],
            "viTri": vi_tri,
            "traTheo": tra_theo[0], "traTheoEn": tra_theo[1], "traTheoZh": tra_theo[2],
            "loiKhac": loi_khac[0], "loiKhacEn": loi_khac[1], "loiKhacZh": loi_khac[2],
        })
    return ra


# ---------------------------------------------------------------------------
# Đại vận (tinhDaiVan của battu_laso.go)
# ---------------------------------------------------------------------------

# Tên chữ Hán (giản thể) của mười can và mười hai tiết, cho câu lyDoZh.
_CAN_ZH = {
    "Giáp": "甲", "Ất": "乙", "Bính": "丙", "Đinh": "丁", "Mậu": "戊",
    "Kỷ": "己", "Canh": "庚", "Tân": "辛", "Nhâm": "壬", "Quý": "癸",
}
_TIET_ZH = {
    "Lập Xuân": "立春", "Kinh Trập": "惊蛰", "Thanh Minh": "清明", "Lập Hạ": "立夏",
    "Mang Chủng": "芒种", "Tiểu Thử": "小暑", "Lập Thu": "立秋", "Bạch Lộ": "白露",
    "Hàn Lộ": "寒露", "Lập Đông": "立冬", "Đại Tuyết": "大雪", "Tiểu Hàn": "小寒",
}


def _jd_local(ngay: Dict, gio: int, phut: int) -> float:
    """Ngày Julius kèm phần lẻ giờ đồng hồ Việt Nam (chỉ dùng để trừ nhau)."""
    return float(jd_from_date(ngay["day"], ngay["month"], ngay["year"])) + float(gio * 60 + phut) / 1440


def _thap_than_can_ba(nhat_chu: str, can: str) -> Tuple[str, str, str]:
    tt = thap_than_cua_can(nhat_chu, can)
    if tt is None:
        return "", "", ""
    return tt["ten"], tt["tenEn"], tt["tenZh"]


def _tinh_dai_van(dd: int, mm: int, yyyy: int, gio: int, phut: int, gioi_tinh: str,
                  can_nam: int, can_thang: int, chi_thang: int, can_ngay: int,
                  co_gio: bool) -> Tuple[Dict, str]:
    """Mười đại vận và tiết mở tháng sinh. Chiều: nam năm dương, nữ năm âm đi
    thuận; còn lại nghịch. Tuổi khởi vận: ba ngày tính một năm, tới phút."""
    nam_duong = can_nam % 2 == 0
    thuan = (gioi_tinh == "Nam") == nam_duong

    sinh = _jd_local({"day": dd, "month": mm, "year": yyyy}, gio, phut)
    truoc = sau = None
    jd_truoc = jd_sau = 0.0
    for nam in range(yyyy - 1, yyyy + 2):
        for m in _moc_tiet_khi_nam_dem(nam):
            if not m["laTiet"]:
                continue
            j = _jd_local(m["ngay"], m["gio"], m["phut"])
            if j <= sinh and (truoc is None or j > jd_truoc):
                truoc, jd_truoc = m, j
            if j > sinh and (sau is None or j < jd_sau):
                sau, jd_sau = m, j

    dv: Dict = {
        "thuan": thuan, "tietMoc": "", "tietMocEn": "", "tietMocZh": "", "tietMocNgay": {"day": 0, "month": 0, "year": 0},
        "tietMocGio": 0, "tietMocPhut": 0, "soNgay": 0.0, "tuoiKhoiNam": 0,
        "tuoiKhoiThang": 0, "ngayKhoiVan": {"day": 0, "month": 0, "year": 0},
        "cacVan": [], "lyDo": "", "lyDoEn": "", "lyDoZh": "",
    }
    tiet_dau_thang = truoc["ten"] if truoc is not None else ""
    moc, jd_moc = (sau, jd_sau) if thuan else (truoc, jd_truoc)
    if moc is None:
        return dv, tiet_dau_thang

    ngay_moc = moc["ngay"]
    dv["tietMoc"] = moc["ten"]
    dv["tietMocEn"], dv["tietMocZh"] = tiet_khi_ba_thu(moc["ten"])
    dv["tietMocNgay"] = {"day": ngay_moc["day"], "month": ngay_moc["month"], "year": ngay_moc["year"]}
    dv["tietMocGio"], dv["tietMocPhut"] = moc["gio"], moc["phut"]
    so_ngay = abs(jd_moc - sinh)
    dv["soNgay"] = _lam_tron(so_ngay * 100) / 100
    tong_thang = so_ngay * 4
    dv["tuoiKhoiNam"] = int(tong_thang) // 12
    dv["tuoiKhoiThang"] = int(tong_thang) % 12
    jd_khoi = int(math.floor(sinh + so_ngay * 120))
    dv["ngayKhoiVan"] = jd_to_date(jd_khoi)

    buoc = 1 if thuan else -1
    nc = THIEN_CAN[can_ngay]
    for i in range(10):
        ci, hi = can_thang + buoc * (i + 1), chi_thang + buoc * (i + 1)
        t = tru_tu_index(ci, hi)
        ten, en, zh = _thap_than_can_ba(nc, t["can"])
        ts = truong_sinh_cua_can(can_ngay, mod(hi, 12))
        ts_en, ts_zh = truong_sinh_ba_thu(ts)
        v = {"thuTu": i + 1}
        v.update(t)
        v.update({
            "thapThanCan": ten, "thapThanCanEn": en, "thapThanCanZh": zh,
            "truongSinh": ts, "truongSinhEn": ts_en, "truongSinhZh": ts_zh,
            "tuoiTu": dv["tuoiKhoiNam"] + 10 * i,
            "namTu": dv["ngayKhoiVan"]["year"] + 10 * i,
            "namDen": dv["ngayKhoiVan"]["year"] + 10 * i + 9,
        })
        dv["cacVan"].append(v)

    tiet_zh = _TIET_ZH.get(moc["ten"], moc["ten"])
    can_nam_ten = THIEN_CAN[can_nam]
    can_nam_zh = _CAN_ZH[can_nam_ten]
    gt_en, gt_zh = ("female", "女") if gioi_tinh == "Nữ" else ("male", "男")
    ad_vi, ad_en, ad_zh = ("dương", "yang", "阳") if nam_duong else ("âm", "yin", "阴")
    sn = "%.2f" % dv["soNgay"]
    so_ngay_vi = sn.replace(".", ",", 1)  # bản Việt viết dấu phẩy thập phân
    g, p = moc["gio"], moc["phut"]
    d, th, y = ngay_moc["day"], ngay_moc["month"], ngay_moc["year"]
    tn, tt = dv["tuoiKhoiNam"], dv["tuoiKhoiThang"]
    ten_tiet = moc["ten"]
    if thuan:
        ly_vi = ("%s sinh năm can %s (%s) nên đại vận đi thuận từ trụ tháng. Từ lúc sinh tới tiết %s kế tiếp "
                 "(%02d:%02d ngày %d/%d/%d) là %s ngày; ba ngày tính một năm nên khởi vận lúc %d tuổi %d tháng."
                 % (gioi_tinh, can_nam_ten, ad_vi, ten_tiet, g, p, d, th, y, so_ngay_vi, tn, tt))
        ly_en = ("A %s born in a %s year (stem %s), so the luck pillars run forward from the month pillar. "
                 "From birth to the next solar term, %s (%02d:%02d on %d/%d/%d), is %s days; at three days to a "
                 "year, luck begins at %d years %d months."
                 % (gt_en, ad_en, can_nam_ten, ten_tiet, g, p, d, th, y, sn, tn, tt))
        ly_zh = ("%s命，年干%s属%s，大运自月柱顺排。出生至下一个节%s（%d年%d月%d日 %02d:%02d）共 %s 天，三天折一年，%d岁%d个月起运。"
                 % (gt_zh, can_nam_zh, ad_zh, tiet_zh, y, th, d, g, p, sn, tn, tt))
    else:
        ly_vi = ("%s sinh năm can %s (%s) nên đại vận đi nghịch từ trụ tháng. Từ tiết %s vừa qua "
                 "(%02d:%02d ngày %d/%d/%d) tới lúc sinh là %s ngày; ba ngày tính một năm nên khởi vận lúc %d tuổi %d tháng."
                 % (gioi_tinh, can_nam_ten, ad_vi, ten_tiet, g, p, d, th, y, so_ngay_vi, tn, tt))
        ly_en = ("A %s born in a %s year (stem %s), so the luck pillars run backward from the month pillar. "
                 "From the last solar term, %s (%02d:%02d on %d/%d/%d), to birth is %s days; at three days to a "
                 "year, luck begins at %d years %d months."
                 % (gt_en, ad_en, can_nam_ten, ten_tiet, g, p, d, th, y, sn, tn, tt))
        ly_zh = ("%s命，年干%s属%s，大运自月柱逆排。上一个节%s（%d年%d月%d日 %02d:%02d）至出生共 %s 天，三天折一年，%d岁%d个月起运。"
                 % (gt_zh, can_nam_zh, ad_zh, tiet_zh, y, th, d, g, p, sn, tn, tt))
    if not co_gio:
        ly_vi += " Chưa biết giờ sinh nên tạm tính từ 12h00; tuổi khởi vận có thể lệch tới bốn tháng."
        ly_en += " The birth hour is unknown, so noon is assumed; the starting age may be off by up to four months."
        ly_zh += "出生时辰未知，暂按中午十二时计，起运岁数可能相差至多四个月。"
    dv["lyDo"], dv["lyDoEn"], dv["lyDoZh"] = ly_vi, ly_en, ly_zh
    return dv, tiet_dau_thang


# ---------------------------------------------------------------------------
# Lá số đầy đủ (LapLaSoBatTu)
# ---------------------------------------------------------------------------

NHAT_CHU_LABEL = "Nhật chủ"


def _chuan_hoa_gioi_tinh(s: str) -> str:
    if s in ("Nam", "nam", "male", "m", "M"):
        return "Nam"
    if s in ("Nữ", "nữ", "Nu", "nu", "female", "f", "F"):
        return "Nữ"
    return ""


# Lựa chọn phái của lá số Bát Tự (BaZi school options), khoá và giá trị
# tiếng Anh như bản TS (BaZiSchools). Mặc định đứng đầu.
BAZI_SCHOOL_VALUES = {"ziHour": ("next-day-from-23", "split-at-midnight")}


def normalize_bazi_schools(o) -> Optional[Dict[str, str]]:
    """Bỏ giá trị mặc định, ném ValueError khi khoá hay giá trị lạ (như bản
    Go, TS); None khi mặc định."""
    if o is None:
        return None
    if not isinstance(o, dict):
        raise ValueError("schools must be an object")
    for k in o:
        if k != "ziHour":
            raise ValueError("unknown school option %s; use ziHour" % json.dumps(k, ensure_ascii=False))
    v = o.get("ziHour")
    if v is None or v == "":
        return None
    hop_le = BAZI_SCHOOL_VALUES["ziHour"]
    if not isinstance(v, str) or v not in hop_le:
        raise ValueError("invalid ziHour %s, expected one of: %s" % (json.dumps(v, ensure_ascii=False), ", ".join(hop_le)))
    return None if v == hop_le[0] else {"ziHour": v}


def lap_la_so_bat_tu(dd: int, mm: int, yyyy: int, gio: Optional[int], phut: int, gioi_tinh: str,
                     schools: Optional[Dict] = None) -> Dict:
    """Lập lá số Bát Tự từ ngày giờ sinh DƯƠNG LỊCH theo giờ Việt Nam.

    ``gio`` là giờ đồng hồ 0 tới 23; None (hay ngoài khoảng) là chưa biết giờ
    sinh: bỏ trụ giờ và mệnh cung, đại vận tạm lấy 12h00 để đếm ngày.
    ``gioi_tinh`` nhận "Nam", "Nữ" và vài cách viết phổ biến; không nhận ra
    thì ném ValueError (đại vận cần giới tính, không đoán).

    Trả dict mang đúng khoá camelCase của lõi Go: ngaySinh, coGioSinh, gio,
    phut, gioiTinh, truNam, truThang, truNgay, truGio (vắng khi chưa biết
    giờ), nhatChu, nhatChuHanh, nhatChuAmDuong, tietKhi, tietDauThang,
    namTruNam, thaiNguyen, menhCung (vắng khi chưa biết giờ), thanSat, daiVan,
    schools (chỉ khi lựa chọn khác mặc định).

    ``schools``: lựa chọn phái (school options), khoá ``ziHour``:
    "next-day-from-23" (mặc định, trụ ngày đổi lúc 23h) hoặc "split-at-midnight"
    (tách Tý sớm, Tý muộn: sinh 23h tới 24h giữ trụ ngày của ngày đã nhập, trụ
    giờ là giờ Tý của ngày hôm sau). Giá trị lạ ném ValueError.
    """
    tc = normalize_bazi_schools(schools)
    gt = _chuan_hoa_gioi_tinh(gioi_tinh)
    if not gt:
        raise ValueError("thiếu giới tính")
    co_gio = gio is not None and 0 <= gio <= 23
    h = gio if co_gio else 12
    if phut < 0 or phut > 59 or not co_gio:
        phut = 0
    # Không biết giờ thì Go lập trụ với 12h00 rồi bỏ trụ giờ; trụ như nhau.
    bt = lap_tu_tru(dd, mm, yyyy, h, phut, bool(tc) and tc.get("ziHour") == "split-at-midnight") \
        if co_gio else lap_tu_tru(dd, mm, yyyy, 12, 0)

    nc = bt["nhatChu"]
    can_ngay = _idx_can(nc)
    can_nam, chi_nam = _idx_can(bt["truNam"]["can"]), _idx_chi(bt["truNam"]["chi"])
    can_thang, chi_thang = _idx_can(bt["truThang"]["can"]), _idx_chi(bt["truThang"]["chi"])
    chi_ngay = _idx_chi(bt["truNgay"]["chi"])
    chi_gio = _idx_chi(bt["truGio"]["chi"]) if co_gio else -1

    def dung_tru(t: Dict) -> Dict:
        ci, hi = _idx_can(t["can"]), _idx_chi(t["chi"])
        ten, en, zh = _thap_than_can_ba(nc, t["can"])
        tl = dict(t)
        tl.update({
            "thapThanCan": ten, "thapThanCanEn": en, "thapThanCanZh": zh,
            "tangCan": tang_can_cua_chi(hi, nc),
            "truongSinh": truong_sinh_cua_can(can_ngay, hi),
            "tuToa": truong_sinh_cua_can(ci, hi),
            "thanSat": [], "thanSatEn": [], "thanSatZh": [],
        })
        tl["truongSinhEn"], tl["truongSinhZh"] = truong_sinh_ba_thu(tl["truongSinh"])
        tl["tuToaEn"], tl["tuToaZh"] = truong_sinh_ba_thu(tl["tuToa"])
        return tl

    ls: Dict = {
        "ngaySinh": {"day": dd, "month": mm, "year": yyyy},
        "coGioSinh": co_gio, "gio": h, "phut": phut, "gioiTinh": gt,
        "truNam": dung_tru(bt["truNam"]),
        "truThang": dung_tru(bt["truThang"]),
        "truNgay": dung_tru(bt["truNgay"]),
        "nhatChu": nc, "nhatChuZh": zh_cua(nc),
        "nhatChuHanh": bt["nhatChuHanh"],
        "nhatChuHanhEn": en_cua(bt["nhatChuHanh"]), "nhatChuHanhZh": zh_cua(bt["nhatChuHanh"]),
        "nhatChuAmDuong": "Dương" if can_ngay % 2 == 0 else "Âm",
        "nhatChuAmDuongEn": "Yang" if can_ngay % 2 == 0 else "Yin",
        "nhatChuAmDuongZh": "阳" if can_ngay % 2 == 0 else "阴",
        "tietKhi": bt["tietKhi"]["ten"],
        "namTruNam": bt["namTruNam"],
    }
    ls["truNgay"].update({"thapThanCan": NHAT_CHU_LABEL, "thapThanCanEn": "Day Master", "thapThanCanZh": "日主"})
    if co_gio:
        ls["truGio"] = dung_tru(bt["truGio"])
    if tc:
        ls["schools"] = tc

    # Thai nguyên: can tháng tiến một, chi tháng tiến ba.
    ls["thaiNguyen"] = tru_tu_index(can_thang + 1, chi_thang + 3)

    # Mệnh cung theo Tử Bình: chi (5 - chi tháng - chi giờ) mod 12, can theo
    # Ngũ Hổ Độn từ can năm. Tháng lấy theo tiết như trụ tháng.
    if co_gio:
        chi_menh = mod(5 - chi_thang - chi_gio, 12)
        can_menh = mod(_can_thang_dan(can_nam) + mod(chi_menh - 2, 12), 10)
        ls["menhCung"] = tru_tu_index(can_menh, chi_menh)

    # Thần sát, rồi gắn tên sao lên từng trụ.
    chi_tru = [chi_nam, chi_thang, chi_ngay, chi_gio]
    ls["thanSat"] = _tinh_than_sat(can_ngay, can_nam, chi_nam, chi_ngay, chi_tru)
    tru_theo_vi_tri = [ls["truNam"], ls["truThang"], ls["truNgay"], ls.get("truGio")]
    for ts in ls["thanSat"]:
        for v in ts["viTri"]:
            t = tru_theo_vi_tri[v]
            if t is not None:
                t["thanSat"].append(ts["ten"])
                t["thanSatEn"].append(ts["tenEn"])
                t["thanSatZh"].append(ts["tenZh"])

    ls["daiVan"], ls["tietDauThang"] = _tinh_dai_van(
        dd, mm, yyyy, h, phut, gt, can_nam, can_thang, chi_thang, can_ngay, co_gio)
    ls["tietKhiEn"], ls["tietKhiZh"] = tiet_khi_ba_thu(ls["tietKhi"])
    ls["tietDauThangEn"], ls["tietDauThangZh"] = tiet_khi_ba_thu(ls["tietDauThang"])
    return ls


# ---------------------------------------------------------------------------
# Tiểu vận (battu_tieuvan.go)
# ---------------------------------------------------------------------------


def tinh_tieu_van_bat_tu(la_so: Dict, nam_xem: int) -> Optional[Dict]:
    """Tiểu vận của năm xem theo lối khởi từ trụ giờ: một tuổi (tuổi mụ theo
    trụ năm) là trụ liền sau (thuận) hay liền trước (nghịch) trụ giờ, mỗi năm
    một trụ, chiều như đại vận. None khi lá số không có giờ sinh hay năm xem
    đứng trước năm của trụ năm."""
    if la_so is None or la_so.get("truGio") is None or not la_so.get("coGioSinh"):
        return None
    tuoi = nam_xem - la_so["namTruNam"] + 1
    if tuoi < 1:
        return None
    tg = la_so["truGio"]
    can, chi = can_index(tg["can"]), chi_index(tg["chi"])
    if can < 0 or chi < 0:
        return None
    thuan = la_so["daiVan"]["thuan"]
    buoc = tuoi if thuan else -tuoi
    tru = tru_tu_index(can + buoc, chi + buoc)
    ten, en, zh = _thap_than_can_ba(la_so["nhatChu"], tru["can"])
    ra = {"nam": nam_xem, "tuoiMu": tuoi}
    ra.update(tru)
    ra.update({"thapThanCan": ten, "thapThanCanEn": en, "thapThanCanZh": zh, "thuan": thuan})
    return ra


# Quan hệ giữa hai thiên can.
CAN_NGU_HOP = "ngu-hop"
CAN_KHAC = "khac"
CAN_BI_KHAC = "bi-khac"
CAN_SINH = "sinh"
CAN_DUOC_SINH = "duoc-sinh"
CAN_DONG_HANH = "dong-hanh"


def quan_he_hai_can(a: str, b: str) -> str:
    """Quan hệ của can a với can b; ngũ hợp xét trước khắc. Rỗng khi tên lạ."""
    ia, ib = can_index(a), can_index(b)
    if ia < 0 or ib < 0:
        return ""
    if mod(ia - ib, 10) == 5:
        return CAN_NGU_HOP
    ha = can_to_ngu_hanh(a)[0]
    hb = can_to_ngu_hanh(b)[0]
    if ha == hb:
        return CAN_DONG_HANH
    if ngu_hanh_khac_duoc(ha) == hb:
        return CAN_KHAC
    if ngu_hanh_khac_duoc(hb) == ha:
        return CAN_BI_KHAC
    if ngu_hanh_sinh_ra(ha) == hb:
        return CAN_SINH
    if ngu_hanh_sinh_ra(hb) == ha:
        return CAN_DUOC_SINH
    return ""


def thien_khac_dia_xung(can_a: str, chi_a: str, can_b: str, chi_b: str) -> bool:
    """Hai trụ có can khắc nhau (không tính ngũ hợp) và chi lục xung."""
    q = quan_he_hai_can(can_a, can_b)
    if q not in (CAN_KHAC, CAN_BI_KHAC):
        return False
    ia, ib = chi_index(chi_a), chi_index(chi_b)
    return ia >= 0 and ib >= 0 and mod(ia - ib, 12) == 6

