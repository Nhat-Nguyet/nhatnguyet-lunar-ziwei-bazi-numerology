"""Lịch lễ hội Việt Nam (bộ dữ liệu mở le-hoi-viet-nam của Nhật Nguyệt, CC BY 4.0)
và phép quy đổi sang ngày dương của từng năm.

Luật quy đổi là luật của lõi tính Go (dulieu.NgayDuongCuaLe), kiểm bằng ca
kiểm le-hoi.json:

- lễ dương lịch giữ ngày tháng; 29/2 của năm không nhuận không có thật nên bỏ;
- lễ âm lịch đổi ở giờ Việt Nam (UTC+7), đặt vào tháng CHÍNH, không tháng nhuận;
- ngày 30 của tháng âm thiếu (29 ngày) không có thật: bỏ năm ấy, không đoán lễ
  dời về ngày nào;
- lễ "theo-nam" do ban tổ chức công bố từng năm: không tính, xem lich_cong_bo.

Dữ liệu là bản chép tệp phát hành (nhatnguyet/du_lieu/le-hoi-viet-nam.json),
mỗi dòng giữ nguyên tên cột của bộ; mô tả cột ở https://nhatnguyet.org/du-lieu.
"""

from __future__ import annotations

import json
import os
from functools import lru_cache
from typing import Dict, List, Optional

from . import am_lich

_THU_MUC = os.path.join(os.path.dirname(os.path.abspath(__file__)), "du_lieu")


@lru_cache(maxsize=1)
def _nap() -> tuple:
    with open(os.path.join(_THU_MUC, "le-hoi-viet-nam.json"), encoding="utf-8") as f:
        ds = json.load(f)
    with open(os.path.join(_THU_MUC, "nguon.json"), encoding="utf-8") as f:
        nguon = json.load(f)
    return tuple(ds), nguon


def danh_sach_le_hoi() -> List[Dict]:
    """Mọi lễ của bộ dữ liệu (bản sao, sửa không ảnh hưởng dữ liệu gốc)."""
    return [dict(x) for x in _nap()[0]]


def nguon_du_lieu() -> Dict:
    """Bộ, phiên bản, mã phát hành, giấy phép của bản dữ liệu đi kèm."""
    return dict(_nap()[1])


def _tach(s: str):
    i = s.find("/")
    if i <= 0:
        return 0, 0
    return int(s[:i]), int(s[i + 1:])


def ngay_duong_cua_le(le: Dict, nam: int) -> Optional[Dict[str, int]]:
    """Ngày dương {day, month, year} của lễ trong năm ``nam``, hoặc None."""
    if le.get("loai_ngay") == "solar":
        d, m = _tach(le.get("ngay_duong", ""))
        if not d or not m:
            return None
        sd = am_lich.jd_to_date(am_lich.jd_from_date(d, m, nam))
        if sd["day"] != d or sd["month"] != m or sd["year"] != nam:
            return None
        return sd
    if le.get("loai_ngay") != "lunar":
        return None
    d, m = _tach(le.get("ngay_am", ""))
    if not d or not m:
        return None
    sd, ok = am_lich.lunar_to_solar(d, m, nam, False, 7.0)
    if not ok:
        return None
    al = am_lich.solar_to_lunar(sd["day"], sd["month"], sd["year"], 7.0)
    if al["day"] != d or al["month"] != m or al["year"] != nam or al["leap"]:
        return None
    return sd


def le_hoi_trong_nam(nam: int) -> List[Dict[str, str]]:
    """Mọi lễ ngày cố định của năm ``nam`` theo thứ tự bộ dữ liệu: [{id, ngay: YYYY-MM-DD}]."""
    out = []
    for le in _nap()[0]:
        sd = ngay_duong_cua_le(le, nam)
        if sd:
            out.append({"id": le["id"], "ngay": "%04d-%02d-%02d" % (sd["year"], sd["month"], sd["day"])})
    return out


def le_hoi_theo_ngay(dd: int, mm: int, yyyy: int) -> List[Dict]:
    """Các lễ rơi đúng vào ngày dương dd/mm/yyyy (chỉ lễ ngày cố định)."""
    out = []
    for le in _nap()[0]:
        sd = ngay_duong_cua_le(le, yyyy)
        if sd and sd["day"] == dd and sd["month"] == mm:
            out.append(dict(le))
    return out
