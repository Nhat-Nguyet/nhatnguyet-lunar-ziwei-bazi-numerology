"""Lá số Tử Vi theo lịch âm của một múi giờ khác UTC+7 (bản Python của
``js/packages/tu-vi/src/theo-mui-gio.ts``).

Lõi ``lap_la_so_tu_vi`` đổi ngày dương sang âm theo UTC+7; mọi sao chỉ phụ
thuộc can chi năm, tháng âm, ngày âm, giờ và giới, nên ở múi giờ khác (lịch
Trung Quốc UTC+8, Hàn Quốc, Nhật Bản UTC+9...) ta đổi âm theo đúng múi ấy rồi
dựng lá từ ngày âm.
"""

from __future__ import annotations

from typing import Dict, Optional

from .am_lich import lunar_to_solar, solar_to_lunar
from .tu_vi_lap_so import lap_la_so_tu_vi
from .tu_vi_schools import normalize_zi_wei_schools, thang_an_theo_phai


def la_so_theo_ngay_am(gioi_tinh: str, nam: int, thang: int, ngay: int, chi: int,
                       schools: Optional[Dict] = None, ho_ten: str = "") -> Dict:
    """Lá số lõi cho một ngày âm bất kỳ: tìm một ngày dương ở UTC+7 cho ra đúng
    (năm cùng can chi, tháng, ngày), thử năm cách nhau 60 năm khi tháng ấy ở
    UTC+7 thiếu ngày 30."""
    for k in (0, -1, 1, -2, 2, -3, 3, -4, 4, -5, 5):
        y = nam + 60 * k
        duong, hop_le = lunar_to_solar(ngay, thang, y, False, 7.0)
        if not hop_le:
            continue
        back = solar_to_lunar(duong["day"], duong["month"], duong["year"], 7.0)
        if back["year"] == y and back["month"] == thang and back["day"] == ngay and not back["leap"]:
            return lap_la_so_tu_vi(ho_ten, gioi_tinh, duong["day"], duong["month"], duong["year"], chi, schools)
    raise ValueError("no chart for lunar %d-%d-%d" % (nam, thang, ngay))


def lap_la_so_tu_vi_theo_mui_gio(ho_ten: str, gioi_tinh: str, dd: int, mm: int, yyyy: int, chi: int,
                                 schools: Optional[Dict], time_zone: float) -> Dict:
    """Như ``lap_la_so_tu_vi`` nhưng đổi ngày dương sang âm theo ``time_zone``
    (giờ). Ở UTC+7 là đúng ``lap_la_so_tu_vi``; ở múi khác, lá số giữ ngày dương
    đã nhập, ngày âm của múi ấy, lựa chọn phái và tháng an sao."""
    if time_zone == 7:
        return lap_la_so_tu_vi(ho_ten, gioi_tinh, dd, mm, yyyy, chi, schools)
    tc = normalize_zi_wei_schools(schools) or {}
    am = solar_to_lunar(dd, mm, yyyy, time_zone)
    thang_an = thang_an_theo_phai(am, tc.get("leapMonth"))
    con_lai = {k: v for k, v in tc.items() if k != "leapMonth"}
    raw = la_so_theo_ngay_am(gioi_tinh, am["year"], thang_an, am["day"], chi, con_lai, ho_ten)
    if tc:
        raw["schools"] = dict(tc)
    else:
        raw.pop("schools", None)
    if thang_an != am["month"]:
        raw["placementMonth"] = thang_an
    raw["ngaySinhDuong"] = {"ngay": dd, "thang": mm, "nam": yyyy}
    raw["ngaySinhAm"] = dict(am)
    return raw
