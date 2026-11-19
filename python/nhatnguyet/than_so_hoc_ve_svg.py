"""Vẽ hồ sơ thần số học thành một tệp SVG tự chứa (bản Python của
``js/packages/than-so-hoc/src/ve-svg.ts``, ra ĐÚNG TỪNG BYTE như bản ấy).

Số chủ đạo, sáu chỉ số theo tên và ngày sinh, năm cá nhân, bốn đỉnh cao kèm
bốn thử thách, biểu đồ ngày sinh (lưới Pythagoras) và bảng quy đổi chữ.

Ví dụ::

    from nhatnguyet.than_so_hoc_ve_svg import ve_than_so_hoc_svg
    svg = ve_than_so_hoc_svg({"hoTen": "Nguyen Van An", "dd": 19, "mm": 9, "yyyy": 1990, "namXem": 2026}, lang="en")
"""

from __future__ import annotations

import datetime
from typing import Dict, List, Optional

from ._ve_svg_chung import (
    THANG_EN, chon, chu, chuan_lang, dau_nhat_nguyet, do_rong, hop, mo_dau, so, vien,
)
from .than_so_hoc import _GIA_TRI_CHU, strip_diacritics, tinh_ho_so_than_so_hoc_sau

__all__ = ["ve_than_so_hoc_svg", "render_numerology_svg"]

_MAU = {
    "light": {
        "nen": "#ECEEEB", "o": "#FFFFFF", "vien": "#D3D9D5", "chu": "#1B1F1E", "chuMo": "#4F5956",
        "chuNhat": "#7D8783", "chinh": "#1F6F6B", "chinhNen": "#E4F0ED", "vang": "#C9922E", "gach": "#B5402F",
        "chuTrenNhan": "#FFFFFF",
    },
    "dark": {
        "nen": "#0F1E1D", "o": "#182A28", "vien": "#2C423F", "chu": "#E8EEEC", "chuMo": "#B3C2BE",
        "chuNhat": "#7F918C", "chinh": "#7CC7BF", "chinhNen": "#1E3835", "vang": "#E0A53C", "gach": "#EE8D78",
        "chuTrenNhan": "#0F1E1D",
    },
}

_NGUYEN_AM = "aeiou"

_W = 1000
_LE = 16
_DAU = 124
_CHINH = 252
_DINH = 206
_DUOI = 300
_H = _LE + _DAU + 12 + _CHINH + 12 + _DINH + 12 + _DUOI + 44


def _la_so_chu(n: int) -> bool:
    return n in (11, 22, 33)


def _ve_dau(vao: Dict, nam_xem: int, so_nam: int, lang: str, m: Dict) -> str:
    y = _LE
    p: List[str] = [hop(_LE, y, _W - 2 * _LE, _DAU, 14, m["o"], m["vien"], 1)]
    trai = _LE + 26
    p.append(dau_nhat_nguyet(trai + 8, y + 32, trai + 22, y + 36, lang, m["vang"], m["chinh"]))
    p.append(chu(trai, y + 76, chon(lang, "Thần số học", "Numerology", "生命灵数"), 30, m["chu"], dam=True,
                 rong=420, co_min=18)[0])
    if vao.get("hoTen"):
        p.append(chu(trai, y + 104, vao["hoTen"], 18, m["chinh"], dam=True, rong=440, co_min=11)[0])

    phai = _W - _LE - 26
    dd, mm, yyyy = vao["dd"], vao["mm"], vao["yyyy"]
    thang_en = THANG_EN[mm - 1] if 1 <= mm <= 12 else ""
    ngay = chon(lang, "Sinh ngày %d/%d/%d" % (dd, mm, yyyy), "Born %d %s %d" % (dd, thang_en, yyyy),
                "生于%d年%d月%d日" % (yyyy, mm, dd))
    p.append(chu(phai, y + 46, ngay, 18, m["chu"], dam=True, neo="end", rong=440, co_min=11)[0])
    nhan = chon(lang, "Năm cá nhân %d" % nam_xem, "Personal year %d" % nam_xem, "%d个人年数" % nam_xem)
    t_svg, t_rong, _ = chu(phai, y + 92, str(so_nam), 30, m["chinh"], dam=True, neo="end")
    p.append(t_svg)
    p.append(chu(phai - t_rong - 10, y + 88, nhan, 15, m["chuMo"], neo="end", rong=400, co_min=10)[0])
    return "".join(p)


def _ve_chinh(hs: Dict, lang: str, m: Dict) -> str:
    y = _LE + _DAU + 12
    p: List[str] = [hop(_LE, y, _W - 2 * _LE, _CHINH, 14, m["o"], m["vien"], 1)]

    # Số chủ đạo: vòng lớn bên trái.
    cx = _LE + 150
    cy = y + _CHINH / 2 - 6
    p.append('<circle cx="%s" cy="%s" r="98" fill="%s" stroke="%s" stroke-width="3"/>' % (so(cx), so(cy), m["chinhNen"], m["chinh"]))
    p.append('<circle cx="%s" cy="%s" r="86" fill="none" stroke="%s" stroke-width="1.5" stroke-dasharray="2 5"/>'
             % (so(cx), so(cy), m["vang"]))
    p.append(chu(cx, cy + 26, str(hs["soDuongDoi"]), 76, m["chinh"], dam=True, neo="middle")[0])
    p.append(chu(cx, cy - 46, chon(lang, "Số chủ đạo", "Life Path", "生命灵数"), 15, m["chuMo"], dam=True, neo="middle",
                 rong=150, co_min=9)[0])
    if _la_so_chu(hs["soDuongDoi"]):
        sc = chon(lang, "Số chủ", "Master number", "卓越数")
        p.append(vien(cx - (do_rong(sc, 11, True) + 11 * 0.9) / 2, cy + 64, sc, 11, m["vang"], m["chuTrenNhan"])[0])

    # Sáu chỉ số, hai hàng ba ô.
    o = [
        (chon(lang, "Sứ mệnh", "Expression", "使命数"), hs["soSuMenh"]),
        (chon(lang, "Linh hồn", "Soul Urge", "灵魂数"), hs["soLinhHon"]),
        (chon(lang, "Nhân cách", "Personality", "人格数"), hs["soNhanCach"]),
        (chon(lang, "Thái độ", "Attitude", "态度数"), hs["soThaiDo"]),
        (chon(lang, "Ngày sinh", "Birthday", "生日数"), hs["soNgaySinh"]),
        (chon(lang, "Trưởng thành", "Maturity", "成熟数"), hs["soTruongThanh"]),
    ]
    x0 = _LE + 300
    rong_vung = _W - _LE - 22 - x0
    w = (rong_vung - 20) / 3
    h = (_CHINH - 44 - 12) / 2
    for i, (nhan, gia_tri) in enumerate(o):
        x = x0 + (i % 3) * (w + 10)
        yo = y + 22 + (i // 3) * (h + 12)
        p.append(hop(x, yo, w, h, 12, m["nen"]))
        p.append(chu(x + 20, yo + 34, nhan, 15, m["chuMo"], rong=w - 40, co_min=9)[0])
        p.append(chu(x + 20, yo + h - 22, str(gia_tri), 40, m["vang"] if _la_so_chu(gia_tri) else m["chu"], dam=True)[0])
    no = hs.get("soNoNghiepNgaySinh")
    if no:
        nn = chon(lang, "Nợ nghiệp %d" % no, "Karmic debt %d" % no, "业力债 %d" % no)
        p.append(vien(cx - (do_rong(nn, 11, True) + 11 * 0.9) / 2, y + _CHINH - 16, nn, 11, m["gach"], m["chuTrenNhan"])[0])
    return "".join(p)


def _ve_dinh(hs: Dict, tuoi_nay: int, lang: str, m: Dict) -> str:
    y = _LE + _DAU + 12 + _CHINH + 12
    p: List[str] = [hop(_LE, y, _W - 2 * _LE, _DINH, 14, m["o"], m["vien"], 1)]
    trai = _LE + 26
    p.append(chu(trai, y + 36, chon(lang, "Đỉnh cao và thử thách", "Pinnacles and challenges", "巅峰数与挑战数"), 19,
                 m["chu"], dam=True, rong=600, co_min=12)[0])

    dc = hs["soDinhCao"]
    tt = hs["soThachThuc"]
    k1, k2, k3 = dc["tuoiKetThucDinh1"], dc["tuoiKetThucDinh2"], dc["tuoiKetThucDinh3"]
    tuoi = ["0-%d" % k1, "%d-%d" % (k1 + 1, k2), "%d-%d" % (k2 + 1, k3), "%d+" % (k3 + 1)]
    dinh = [dc["dinh1"], dc["dinh2"], dc["dinh3"], dc["dinh4"]]
    thu = [tt["thachThuc1"], tt["thachThuc2"], tt["thachThuc3"], tt["thachThuc4"]]
    cot_nhan = 150
    x0 = trai + cot_nhan
    w = (_W - _LE - 26 - x0 - 30) / 4
    y_tuoi = y + 76
    y_dinh = y + 132
    y_thu = y + 182
    p.append(chu(trai, y_tuoi, chon(lang, "Tuổi", "Age", "年龄"), 13, m["chuNhat"], rong=cot_nhan - 10, co_min=8)[0])
    p.append(chu(trai, y_dinh - 8, chon(lang, "Đỉnh cao", "Pinnacle", "巅峰数"), 15, m["chuMo"], dam=True,
                 rong=cot_nhan - 10, co_min=8)[0])
    p.append(chu(trai, y_thu - 4, chon(lang, "Thử thách", "Challenge", "挑战数"), 15, m["chuMo"], dam=True,
                 rong=cot_nhan - 10, co_min=8)[0])
    for i in range(4):
        x = x0 + i * (w + 10)
        cx = x + w / 2
        # Dải thời gian: đoạn chứa tuổi năm đang xem tô đậm.
        tu = 0 if i == 0 else [k1, k2, k3][i - 1] + 1
        den = 999 if i == 3 else [k1, k2, k3][i]
        p.append(hop(x, y + 86, w, 6, 3, m["chinh"] if tu <= tuoi_nay <= den else m["chinhNen"]))
        p.append(chu(cx, y_tuoi, tuoi[i], 14, m["chinh"], dam=True, neo="middle")[0])
        p.append(chu(cx, y_dinh, str(dinh[i]), 36, m["vang"] if _la_so_chu(dinh[i]) else m["chu"], dam=True, neo="middle")[0])
        p.append(chu(cx, y_thu, str(thu[i]), 22, m["chuMo"], dam=True, neo="middle")[0])
    return "".join(p)


def _ve_luoi(hs: Dict, lang: str, m: Dict) -> str:
    y = _LE + _DAU + 12 + _CHINH + 12 + _DINH + 12
    w = 370
    p: List[str] = [hop(_LE, y, w, _DUOI, 14, m["o"], m["vien"], 1)]
    trai = _LE + 26
    p.append(chu(trai, y + 36, chon(lang, "Biểu đồ ngày sinh", "Birth chart", "出生数字图"), 19, m["chu"], dam=True,
                 rong=w - 52, co_min=11)[0])
    thu_tu = [[3, 6, 9], [2, 5, 8], [1, 4, 7]]
    o_w = (w - 52 - 16) / 3
    o_h = 64
    for r in range(3):
        for c in range(3):
            d = thu_tu[r][c]
            dem = hs["luoiPythago"][str(d)]
            x = trai + c * (o_w + 8)
            yo = y + 56 + r * (o_h + 8)
            p.append(hop(x, yo, o_w, o_h, 10, m["chinhNen"] if dem > 0 else m["nen"]))
            s = "%d×%d" % (d, dem) if dem > 4 else str(d) * dem
            if dem == 0:
                p.append(chu(x + o_w / 2, yo + o_h / 2 + 7, str(d), 20, m["vien"], dam=True, neo="middle")[0])
            else:
                p.append(chu(x + o_w / 2, yo + o_h / 2 + 9, s, 26, m["chinh"], dam=True, neo="middle",
                             rong=o_w - 12, co_min=12)[0])
    return "".join(p)


def _ve_bang_ten(vao: Dict, hs: Dict, lang: str, m: Dict) -> str:
    y = _LE + _DAU + 12 + _CHINH + 12 + _DINH + 12
    x0 = _LE + 370 + 12
    w = _W - _LE - x0
    p: List[str] = [hop(x0, y, w, _DUOI, 14, m["o"], m["vien"], 1)]
    trai = x0 + 26
    rong = w - 52
    p.append(chu(trai, y + 36, chon(lang, "Bảng quy đổi họ tên", "Name chart", "姓名数字表"), 19, m["chu"], dam=True,
                 rong=rong, co_min=11)[0])

    tu = [s for s in (strip_diacritics(t) for t in (vao.get("hoTen") or "").split()) if s]
    o_w = 56
    hang: List[List[str]] = []
    while True:
        hang = [[]]
        dung = 0
        for t in tu:
            can = len(t) * o_w + (o_w * 0.6 if dung > 0 else 0)
            if dung > 0 and dung + can > rong:
                hang.append([])
                dung = 0
            hang[-1].append(t)
            dung += len(t) * o_w + (o_w * 0.6 if dung > 0 else 0)
        rong_nhat = 0
        for t in tu:
            if len(t) * o_w > rong_nhat:
                rong_nhat = len(t) * o_w
        if (len(hang) * (o_w * 1.5 + 10) <= _DUOI - 142 and rong_nhat <= rong) or o_w <= 16:
            break
        o_w -= 2
    o_h = o_w * 1.5
    yy = y + 60
    for h in hang:
        xx = trai
        for t in h:
            for c in t:
                nguyen_am = c in _NGUYEN_AM
                gt = _GIA_TRI_CHU.get(c, 0)
                p.append(hop(xx + 1, yy, o_w - 2, o_h, 6, m["chinhNen"] if nguyen_am else m["nen"],
                             m["chinh"] if nguyen_am else "", 1))
                p.append(chu(xx + o_w / 2, yy + o_h * 0.42, c.upper(), o_w * 0.5, m["chinh"] if nguyen_am else m["chu"],
                             dam=True, neo="middle")[0])
                p.append(chu(xx + o_w / 2, yy + o_h * 0.84, str(gt), o_w * 0.42, m["chinh"] if nguyen_am else m["chuMo"],
                             neo="middle")[0])
                xx += o_w
            xx += o_w * 0.6
        yy += o_h + 10

    # Chú giải và ba tổng của tên.
    yc = y + _DUOI - 54
    p.append('<rect x="%s" y="%s" width="14" height="14" rx="3" fill="%s" stroke="%s" stroke-width="1"/>'
             % (so(trai), so(yc - 11), m["chinhNen"], m["chinh"]))
    lh, nc, sm = hs["soLinhHon"], hs["soNhanCach"], hs["soSuMenh"]
    p.append(chu(trai + 22, yc + 1, chon(lang, "Nguyên âm: Linh hồn %d" % lh, "Vowels: Soul Urge %d" % lh, "元音：灵魂数 %d" % lh),
                 13.5, m["chuMo"], rong=rong / 2 - 30, co_min=8)[0])
    xb = trai + rong / 2
    p.append('<rect x="%s" y="%s" width="14" height="14" rx="3" fill="%s"/>' % (so(xb), so(yc - 11), m["nen"]))
    p.append(chu(xb + 22, yc + 1, chon(lang, "Phụ âm: Nhân cách %d" % nc, "Consonants: Personality %d" % nc, "辅音：人格数 %d" % nc),
                 13.5, m["chuMo"], rong=rong / 2 - 22, co_min=8)[0])
    p.append(chu(trai, yc + 30, chon(lang, "Cả tên: Sứ mệnh %d" % sm, "All letters: Expression %d" % sm, "全名：使命数 %d" % sm),
                 13.5, m["chuMo"], rong=rong, co_min=8)[0])
    return "".join(p)


def ve_than_so_hoc_svg(vao: Dict, lang: str = "vi", theme: str = "light", width: Optional[float] = None) -> str:
    """Vẽ hồ sơ thần số học thành chuỗi SVG tự chứa.

    ``vao``: ``{"hoTen", "dd", "mm", "yyyy", "namXem"}`` (cùng khoá với ca
    kiểm); vắng ``namXem`` thì lấy năm hiện tại của máy."""
    lang = chuan_lang(lang)
    m = _MAU["dark" if theme == "dark" else "light"]
    rong_hien = width if width and width > 0 else 720
    nam_xem = vao.get("namXem") or 0
    if nam_xem <= 0:
        nam_xem = datetime.date.today().year
    ho_ten = vao.get("hoTen") or ""
    hs = tinh_ho_so_than_so_hoc_sau(ho_ten, vao["dd"], vao["mm"], vao["yyyy"], nam_xem, 1, 1)

    tieu_de = chon(lang, "Thần số học", "Numerology", "生命灵数") + (": " + ho_ten if ho_ten else "")
    a, b, c, d = hs["soDuongDoi"], hs["soSuMenh"], hs["soLinhHon"], hs["soNhanCach"]
    mo_ta = chon(
        lang,
        "Số chủ đạo %d, sứ mệnh %d, linh hồn %d, nhân cách %d. Vẽ bằng thư viện mở Nhật Nguyệt." % (a, b, c, d),
        "Life Path %d, Expression %d, Soul Urge %d, Personality %d. Drawn with the Nhat Nguyet open library." % (a, b, c, d),
        "生命灵数 %d，使命数 %d，灵魂数 %d，人格数 %d。由 Nhat Nguyet 开源库绘制。" % (a, b, c, d),
    )
    p = [mo_dau(lang, _W, _H, rong_hien, tieu_de, mo_ta), hop(0, 0, _W, _H, 18, m["nen"]),
         _ve_dau(vao, nam_xem, hs["soNamCaNhan"], lang, m), _ve_chinh(hs, lang, m),
         _ve_dinh(hs, nam_xem - vao["yyyy"], lang, m), _ve_luoi(hs, lang, m), _ve_bang_ten(vao, hs, lang, m)]
    y_chan = _H - 16
    p.append(chu(_LE + 4, y_chan, "nhatnguyet.org", 14, m["chinh"], dam=True)[0])
    p.append(chu(_W - _LE - 4, y_chan, chon(lang, "Bảng chữ Pythagoras, tên bỏ dấu",
                                            "Pythagorean letter values, diacritics removed",
                                            "毕达哥拉斯字母表，去除声调符号"),
                 12.5, m["chuNhat"], neo="end", rong=600, co_min=9)[0])
    p.append("</svg>")
    return "".join(p)


#: Bí danh tiếng Anh của ``ve_than_so_hoc_svg``.
render_numerology_svg = ve_than_so_hoc_svg
