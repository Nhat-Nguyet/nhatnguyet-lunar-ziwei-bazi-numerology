"""Giờ hoàng đạo kèm thần trực giờ: chuyển ngữ của coreengine.GioHoangDaoKemThan
(gio_hoang_dao_than.go, hoangdao.go, truc_ngay.go). Đáp án kiểm bằng
ca-kiem/auspicious-hours.json. Mô-đun nội bộ; người dùng gọi
``nhatnguyet.auspicious_hours``.

Một hệ duy nhất: bảng sáu giờ hoàng đạo theo cặp chi ngày, và vòng mười hai
thần khởi từ Thanh Long, chỗ khởi giải ngược từ chính bảng ấy.
"""

from typing import Any, Dict, List

from . import am_lich

# Sáu giờ hoàng đạo (chỉ số chi) theo chi ngày mod 6; chép từ hoangDaoChiByGroup.
_HOANG_DAO_THEO_CAP = [
    [0, 1, 3, 6, 8, 9],
    [2, 3, 5, 8, 10, 11],
    [0, 1, 4, 5, 7, 10],
    [0, 2, 3, 6, 7, 9],
    [2, 4, 5, 8, 9, 11],
    [1, 4, 6, 7, 10, 11],
]

_THAN_VI = [
    "Thanh Long", "Minh Đường", "Thiên Hình", "Chu Tước",
    "Kim Quỹ", "Kim Đường", "Bạch Hổ", "Ngọc Đường",
    "Thiên Lao", "Nguyên Vũ", "Tư Mệnh", "Câu Trần",
]
# Chữ Hán theo bảng GIỜ của sách: thần thứ sáu là 宝光.
_THAN_ZH = ["青龙", "明堂", "天刑", "朱雀", "金匮", "宝光", "白虎", "玉堂", "天牢", "元武", "司命", "勾陈"]

HOUR_SPIRIT_PINYIN = [
    "Qing Long", "Ming Tang", "Tian Xing", "Zhu Que", "Jin Kui", "Bao Guang",
    "Bai Hu", "Yu Tang", "Tian Lao", "Yuan Wu", "Si Ming", "Gou Chen",
]
AUSPICIOUS_SPIRITS = [0, 1, 4, 5, 7, 10]

_KHUNG_GIO = ["23h-1h", "1h-3h", "3h-5h", "5h-7h", "7h-9h", "9h-11h", "11h-13h", "13h-15h",
              "15h-17h", "17h-19h", "19h-21h", "21h-23h"]
_CHI_ZH = ["子", "丑", "寅", "卯", "辰", "巳", "午", "未", "申", "酉", "戌", "亥"]
_CAN_ZH = {"Giáp": "甲", "Ất": "乙", "Bính": "丙", "Đinh": "丁", "Mậu": "戊", "Kỷ": "己",
           "Canh": "庚", "Tân": "辛", "Nhâm": "壬", "Quý": "癸"}


def _khoi(tot: List[int]) -> int:
    for s in range(12):
        if all((s + v) % 12 in tot for v in AUSPICIOUS_SPIRITS):
            return s
    raise ValueError("bảng giờ hoàng đạo không giải ra chỗ khởi của Thanh Long")


_KHOI = [_khoi(t) for t in _HOANG_DAO_THEO_CAP]


def gio_hoang_dao_kem_than(dd: int, mm: int, yy: int) -> Dict[str, Any]:
    """Lớp lõi (khoá theo Go) cho ca kiểm."""
    cc = am_lich.day_can_chi(dd, mm, yy)
    i_ngay = am_lich.DIA_CHI.index(cc["chi"])
    tot = _HOANG_DAO_THEO_CAP[i_ngay % 6]
    s = _KHOI[i_ngay % 6]
    gio = []
    for i, chi in enumerate(am_lich.DIA_CHI):
        v = (i - s) % 12
        gio.append({"chi": chi, "chiZh": _CHI_ZH[i], "khungGio": _KHUNG_GIO[i], "hoangDao": i in tot,
                    "thuTuThan": v, "than": _THAN_VI[v], "thanZh": _THAN_ZH[v]})
    return {"canChiNgay": cc["label"], "canChiNgayZh": _CAN_ZH.get(cc["can"], cc["can"]) + _CHI_ZH[i_ngay],
            "chiNgay": cc["chi"], "gio": gio}
