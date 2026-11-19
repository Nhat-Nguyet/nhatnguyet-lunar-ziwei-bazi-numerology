"""Vẽ lá số Bát Tự (Tứ Trụ) thành một tệp SVG tự chứa (bản Python của
``js/packages/bat-tu/src/ve-svg.ts``, ra ĐÚNG TỪNG BYTE như bản ấy).

Bốn trụ xếp thành bảng (thập thần, thiên can, địa chi, tàng can, nạp âm,
trường sinh, thần sát), dưới là mười đại vận; can, chi tô theo ngũ hành.

Ví dụ::

    from nhatnguyet import bat_tu
    from nhatnguyet.bat_tu_ve_svg import ve_bat_tu_svg
    ls = bat_tu.lap_la_so_bat_tu(19, 9, 1990, 20, 0, "Nam")
    open("bat-tu.svg", "w").write(ve_bat_tu_svg(ls, lang="en", ho_ten="Nguyen Van An"))
"""

from __future__ import annotations

from typing import Dict, List, Optional

from ._ve_svg_chung import (
    THANG_EN, chon, chu, chuan_lang, co_vua, dau_nhat_nguyet, do_rong, duong, hop, mo_dau, so,
)

__all__ = ["ve_bat_tu_svg", "render_bazi_svg"]

_MAU = {
    "light": {
        "nen": "#ECEEEB", "o": "#FFFFFF", "vien": "#D3D9D5", "chu": "#1B1F1E", "chuMo": "#4F5956",
        "chuNhat": "#7D8783", "chinh": "#1F6F6B", "chinhNen": "#E4F0ED", "vang": "#C9922E", "xamNhan": "#E3E7E4",
        "hanh": {"Mộc": "#3E7D45", "Hỏa": "#B5402F", "Thổ": "#96671B", "Kim": "#5B6770", "Thủy": "#2B5A86"},
    },
    "dark": {
        "nen": "#0F1E1D", "o": "#182A28", "vien": "#2C423F", "chu": "#E8EEEC", "chuMo": "#B3C2BE",
        "chuNhat": "#7F918C", "chinh": "#7CC7BF", "chinhNen": "#1E3835", "vang": "#E0A53C", "xamNhan": "#26403C",
        "hanh": {"Mộc": "#86C98C", "Hỏa": "#EE8D78", "Thổ": "#E6B866", "Kim": "#C3CDD2", "Thủy": "#8DB8E6"},
    },
}

_CAN_ZH = {
    "Giáp": "甲", "Ất": "乙", "Bính": "丙", "Đinh": "丁", "Mậu": "戊",
    "Kỷ": "己", "Canh": "庚", "Tân": "辛", "Nhâm": "壬", "Quý": "癸",
}
_CHI_ZH = {
    "Tý": "子", "Sửu": "丑", "Dần": "寅", "Mão": "卯", "Thìn": "辰", "Tỵ": "巳",
    "Ngọ": "午", "Mùi": "未", "Thân": "申", "Dậu": "酉", "Tuất": "戌", "Hợi": "亥",
}
_HANH_EN = {"Kim": "Metal", "Mộc": "Wood", "Thủy": "Water", "Hỏa": "Fire", "Thổ": "Earth"}
_HANH_ZH = {"Kim": "金", "Mộc": "木", "Thủy": "水", "Hỏa": "火", "Thổ": "土"}

# Chép từ từ vựng nghiệp vụ của lõi tính (coreengine/tuvung.go).
_TRUONG_SINH_BA = {
    "Tràng Sinh": ("Growth", "长生"), "Mộc Dục": ("Bathing", "沐浴"), "Quan Đới": ("Youth", "冠带"),
    "Lâm Quan": ("Prime", "临官"), "Đế Vượng": ("Peak", "帝旺"), "Suy": ("Decline", "衰"),
    "Bệnh": ("Illness", "病"), "Tử": ("Death", "死"), "Mộ": ("Tomb", "墓"),
    "Tuyệt": ("Extinction", "绝"), "Thai": ("Conception", "胎"), "Dưỡng": ("Nurture", "养"),
}

_THAN_SAT_ZH = {
    "Thiên Ất Quý Nhân": "天乙贵人", "Văn Xương": "文昌", "Lộc Thần": "禄神", "Dương Nhận": "羊刃",
    "Đào Hoa": "桃花", "Dịch Mã": "驿马", "Hoa Cái": "华盖", "Kiếp Sát": "劫煞", "Vong Thần": "亡神",
}

_TIET_KHI_ZH = {
    "Lập Xuân": "立春", "Vũ Thủy": "雨水", "Kinh Trập": "惊蛰", "Xuân Phân": "春分",
    "Thanh Minh": "清明", "Cốc Vũ": "谷雨", "Lập Hạ": "立夏", "Tiểu Mãn": "小满",
    "Mang Chủng": "芒种", "Hạ Chí": "夏至", "Tiểu Thử": "小暑", "Đại Thử": "大暑",
    "Lập Thu": "立秋", "Xử Thử": "处暑", "Bạch Lộ": "白露", "Thu Phân": "秋分",
    "Hàn Lộ": "寒露", "Sương Giáng": "霜降", "Lập Đông": "立冬", "Tiểu Tuyết": "小雪",
    "Đại Tuyết": "大雪", "Đông Chí": "冬至", "Tiểu Hàn": "小寒", "Đại Hàn": "大寒",
}

_NAP_AM_ZH = {
    "Hải Trung Kim": "海中金", "Lư Trung Hỏa": "炉中火", "Đại Lâm Mộc": "大林木",
    "Lộ Bàng Thổ": "路旁土", "Kiếm Phong Kim": "剑锋金", "Sơn Đầu Hỏa": "山头火",
    "Giản Hạ Thủy": "涧下水", "Thành Đầu Thổ": "城头土", "Bạch Lạp Kim": "白蜡金",
    "Dương Liễu Mộc": "杨柳木", "Tuyền Trung Thủy": "泉中水", "Ốc Thượng Thổ": "屋上土",
    "Tích Lịch Hỏa": "霹雳火", "Tùng Bách Mộc": "松柏木", "Trường Lưu Thủy": "长流水",
    "Sa Trung Kim": "沙中金", "Sơn Hạ Hỏa": "山下火", "Bình Địa Mộc": "平地木",
    "Bích Thượng Thổ": "壁上土", "Kim Bạc Kim": "金箔金", "Phú Đăng Hỏa": "覆灯火",
    "Thiên Hà Thủy": "天河水", "Đại Trạch Thổ": "大驿土", "Thoa Xuyến Kim": "钗钏金",
    "Tang Đố Mộc": "桑柘木", "Đại Khê Thủy": "大溪水", "Sa Trung Thổ": "沙中土",
    "Thiên Thượng Hỏa": "天上火", "Thạch Lựu Mộc": "石榴木", "Đại Hải Thủy": "大海水",
}

_W = 1000
_LE = 16
_DAU = 124
_BANG = 474
_VAN = 214
_H = _LE + _DAU + 12 + _BANG + 12 + _VAN + 44
_COT_NHAN = 132
_RONG_COT = (_W - 2 * _LE - _COT_NHAN - 12) / 4


def _hanh_chu(h: str, lang: str) -> str:
    return chon(lang, h, _HANH_EN.get(h, h), _HANH_ZH.get(h, h))


def _hai(n: int) -> str:
    return "0" + str(n) if n < 10 else str(n)


def _ve_dau(ls: Dict, ho_ten: str, lang: str, m: Dict) -> str:
    y = _LE
    p: List[str] = [hop(_LE, y, _W - 2 * _LE, _DAU, 14, m["o"], m["vien"], 1)]
    trai = _LE + 26
    p.append(dau_nhat_nguyet(trai + 8, y + 32, trai + 22, y + 36, lang, m["vang"], m["chinh"]))
    p.append(chu(trai, y + 76, chon(lang, "Lá số Bát Tự", "Bát Tự Chart", "八字命盘"), 30, m["chu"], dam=True,
                 rong=420, co_min=18)[0])
    if ho_ten:
        p.append(chu(trai, y + 104, ho_ten, 18, m["chinh"], dam=True, rong=420, co_min=11)[0])

    phai = _W - _LE - 26
    d = ls["ngaySinh"]
    gio = "%s:%s" % (_hai(ls["gio"]), _hai(ls["phut"])) if ls["coGioSinh"] else ""
    ngay = chon(
        lang,
        "%d/%d/%d" % (d["day"], d["month"], d["year"]) + (", " + gio if gio else ", chưa rõ giờ"),
        "%d %s %d" % (d["day"], THANG_EN[d["month"] - 1], d["year"]) + (", " + gio if gio else ", hour unknown"),
        "%d年%d月%d日" % (d["year"], d["month"], d["day"]) + (" " + gio if gio else "，时辰未知"),
    )
    am = ls["nhatChuAmDuong"] == "Âm"
    nu = ls["gioiTinh"] == "Nữ"
    gt = chon(lang, ls["gioiTinh"], "Female" if nu else "Male", "女" if nu else "男")
    nc = chon(
        lang,
        "%s · Nhật chủ %s (%s %s)" % (gt, ls["nhatChu"], "Âm" if am else "Dương", ls["nhatChuHanh"]),
        "%s · Day Master %s (%s %s)" % (gt, ls["nhatChu"], "Yin" if am else "Yang", _HANH_EN.get(ls["nhatChuHanh"], "")),
        "%s · 日主 %s（%s%s）" % (gt, _CAN_ZH.get(ls["nhatChu"], ls["nhatChu"]), "阴" if am else "阳",
                               _HANH_ZH.get(ls["nhatChuHanh"], "")),
    )
    tk = ls["tietKhi"]
    tiet = chon(lang, "Sinh trong tiết %s" % tk, "Born in the solar term %s" % tk, "生于%s" % _TIET_KHI_ZH.get(tk, tk))
    p.append(chu(phai, y + 42, ngay, 18, m["chu"], dam=True, neo="end", rong=470, co_min=11)[0])
    p.append(chu(phai, y + 72, nc, 15, m["chuMo"], neo="end", rong=470, co_min=10)[0])
    p.append(chu(phai, y + 100, tiet, 15, m["chuMo"], neo="end", rong=470, co_min=10)[0])
    return "".join(p)


def _chu_cot(cx: float, y: float, s: str, co: float, mau: str, rong: float, dam: bool = False) -> str:
    """Dòng chữ co vừa cột; quá dài thì bẻ hai dòng tại khoảng trắng cuối."""
    if do_rong(s, co - 2, dam) <= rong or " " not in s:
        return chu(cx, y, s, co, mau, dam=dam, neo="middle", rong=rong, co_min=7)[0]
    i = s.rfind(" ")
    a = s[:i]
    b = s[i + 1:]
    co2 = co - 1
    return (chu(cx, y - co2 * 0.55, a, co2, mau, dam=dam, neo="middle", rong=rong, co_min=7)[0]
            + chu(cx, y + co2 * 0.6, b, co2, mau, dam=dam, neo="middle", rong=rong, co_min=7)[0])


def _ve_tru(t: Optional[Dict], cot: int, y: float, la_ngay: bool, lang: str, m: Dict) -> str:
    p: List[str] = []
    x = _LE + _COT_NHAN + cot * _RONG_COT
    cx = x + _RONG_COT / 2
    rong = _RONG_COT - 20
    if la_ngay:
        p.append(hop(x + 4, y + 10, _RONG_COT - 8, _BANG - 20, 10, m["chinhNen"], m["chinh"], 1.5))
    ten_tru = [
        chon(lang, "Trụ năm", "Year", "年柱"), chon(lang, "Trụ tháng", "Month", "月柱"),
        chon(lang, "Trụ ngày", "Day", "日柱"), chon(lang, "Trụ giờ", "Hour", "时柱"),
    ][cot]
    p.append(chu(cx, y + 38, ten_tru, 15, m["chinh"] if la_ngay else m["chuMo"], dam=True, neo="middle",
                 rong=rong, co_min=9)[0])
    if not t:
        p.append(chu(cx, y + 170, "?", 44, m["chuNhat"], dam=True, neo="middle")[0])
        p.append(chu(cx, y + 206, chon(lang, "Chưa rõ giờ", "Hour unknown", "时辰未知"), 13, m["chuNhat"],
                     neo="middle", rong=rong, co_min=8)[0])
        return "".join(p)
    tt = chon(lang, t["thapThanCan"], t["thapThanCanEn"], t.get("thapThanCanZh") or t["thapThanCanEn"])
    p.append(_chu_cot(cx, y + 70, tt, 15, m["chinh"] if la_ngay else m["chu"], rong, la_ngay))

    co_lon = 52 if lang == "zh" else 40
    mau_can = m["hanh"].get(t["canHanh"], m["chu"])
    mau_chi = m["hanh"].get(t["chiHanh"], m["chu"])
    p.append(chu(cx, y + 130, chon(lang, t["can"], t["can"], _CAN_ZH.get(t["can"], t["can"])), co_lon, mau_can,
                 dam=True, neo="middle", rong=rong, co_min=20)[0])
    am_duong = chon(lang, "Âm" if t["canAm"] else "Dương", "Yin" if t["canAm"] else "Yang", "阴" if t["canAm"] else "阳")
    p.append(chu(cx, y + 152, am_duong + ("" if lang == "zh" else " ") + _hanh_chu(t["canHanh"], lang), 13,
                 m["chuNhat"], neo="middle", rong=rong, co_min=8)[0])
    p.append(chu(cx, y + 210, chon(lang, t["chi"], t["chi"], _CHI_ZH.get(t["chi"], t["chi"])), co_lon, mau_chi,
                 dam=True, neo="middle", rong=rong, co_min=20)[0])
    p.append(chu(cx, y + 232, _hanh_chu(t["chiHanh"], lang), 13, m["chuNhat"], neo="middle", rong=rong, co_min=8)[0])

    # Tàng can: can tô theo hành, kèm thập thần.
    yt = y + 274
    for tc in t["tangCan"]:
        can = chon(lang, tc["can"], tc["can"], _CAN_ZH.get(tc["can"], tc["can"]))
        ttc = chon(lang, tc["thapThan"], tc.get("thapThanEn", tc["thapThan"]),
                   tc.get("thapThanZh") or tc.get("thapThanEn") or tc["thapThan"])
        w_can = do_rong(can, 15, True)
        co_tt = co_vua(ttc, 13, 8, rong - w_can - 8, False)
        w_tt = do_rong(ttc, co_tt, False)
        x0 = cx - (w_can + 8 + w_tt) / 2
        p.append(chu(x0, yt, can, 15, m["hanh"].get(tc["hanh"], m["chu"]), dam=True)[0])
        p.append(chu(x0 + w_can + 8, yt, ttc, co_tt, m["chuMo"], rong=rong - w_can - 8, co_min=8)[0])
        yt += 22

    nap_am = chon(lang, t["napAmTen"], t["napAmTen"], _NAP_AM_ZH.get(t["napAmTen"], t["napAmTen"]))
    p.append(chu(cx, y + 356, nap_am, 14, m["hanh"].get(t["napAm"], m["chu"]), dam=True, neo="middle",
                 rong=rong, co_min=8)[0])
    ts = _TRUONG_SINH_BA.get(t["truongSinh"])
    p.append(chu(cx, y + 390, chon(lang, t["truongSinh"], ts[0] if ts else t["truongSinh"],
                                   ts[1] if ts else t["truongSinh"]),
                 14, m["chu"], neo="middle", rong=rong, co_min=8)[0])

    # Thần sát: mỗi sao một dòng.
    sao = [chon(lang, s, s, _THAN_SAT_ZH.get(s, s)) for s in t["thanSat"]]
    co_sao = 11 if len(sao) > 3 else 12.5
    ys = y + 424
    for s in sao:
        p.append(chu(cx, ys, s, co_sao, m["chinh"], neo="middle", rong=rong, co_min=7)[0])
        ys += co_sao + 3
    if not sao:
        p.append(chu(cx, ys, "·", 14, m["chuNhat"], neo="middle")[0])
    return "".join(p)


def _ve_bang(ls: Dict, lang: str, m: Dict) -> str:
    y = _LE + _DAU + 12
    p: List[str] = [hop(_LE, y, _W - 2 * _LE, _BANG, 14, m["o"], m["vien"], 1)]
    nhan = [
        (chon(lang, "Thập thần", "Ten Gods", "十神"), 70),
        (chon(lang, "Thiên can", "Stem", "天干"), 122),
        (chon(lang, "Địa chi", "Branch", "地支"), 202),
        (chon(lang, "Tàng can", "Hidden stems", "藏干"), 274),
        (chon(lang, "Nạp âm", "Nạp âm", "纳音"), 356),
        (chon(lang, "Trường sinh", "Life stage", "长生"), 390),
        (chon(lang, "Thần sát", "Symbolic stars", "神煞"), 424),
    ]
    for s, dy in nhan:
        p.append(chu(_LE + 22, y + dy, s, 13, m["chuNhat"], rong=_COT_NHAN - 26, co_min=8)[0])
    for dy in (88, 246, 334, 370, 404):
        p.append(duong(_LE + 18, y + dy, _W - _LE - 18, y + dy, m["vien"]))
    tru = [ls.get("truNam"), ls.get("truThang"), ls.get("truNgay"), ls.get("truGio")]
    for i in range(4):
        p.append(_ve_tru(tru[i], i, y, i == 2, lang, m))
    return "".join(p)


def _ve_dai_van(ls: Dict, lang: str, m: Dict) -> str:
    y = _LE + _DAU + 12 + _BANG + 12
    p: List[str] = [hop(_LE, y, _W - 2 * _LE, _VAN, 14, m["o"], m["vien"], 1)]
    dv = ls["daiVan"]
    trai = _LE + 22
    phai = _W - _LE - 22
    td_svg, td_rong, _ = chu(trai, y + 34, chon(lang, "Đại vận", "Luck pillars", "大运"), 19, m["chu"], dam=True)
    p.append(td_svg)
    thang = dv["tuoiKhoiThang"] > 0
    tn = dv["tuoiKhoiNam"]
    tt = dv["tuoiKhoiThang"]
    khoi = chon(
        lang,
        "Khởi vận %d tuổi%s, đi %s" % (tn, " %d tháng" % tt if thang else "", "thuận" if dv["thuan"] else "nghịch"),
        "Starts at age %d%s, %s" % (tn, " and %d months" % tt if thang else "", "forward" if dv["thuan"] else "backward"),
        "%d岁%s起运，%s" % (tn, "%d个月" % tt if thang else "", "顺行" if dv["thuan"] else "逆行"),
    )
    p.append(chu(phai, y + 34, khoi, 14, m["chuMo"], neo="end", rong=phai - trai - td_rong - 24, co_min=9)[0])

    cac = dv["cacVan"]
    n = len(cac)
    if n == 0:
        return "".join(p)
    khe = 6
    w = (phai - trai - (n - 1) * khe) / n
    for i, v in enumerate(cac):
        x = trai + i * (w + khe)
        cx = x + w / 2
        r = w - 10
        p.append(hop(x, y + 50, w, 148, 9, m["nen"]))
        p.append(chu(cx, y + 74, chon(lang, "%d tuổi" % v["tuoiTu"], "Age %d" % v["tuoiTu"], "%d岁" % v["tuoiTu"]),
                     13.5, m["chinh"], dam=True, neo="middle", rong=r, co_min=8)[0])
        p.append(chu(cx, y + 92, str(v["namTu"]), 12, m["chuNhat"], neo="middle", rong=r, co_min=8)[0])
        co_lon = 26 if lang == "zh" else 20
        p.append(chu(cx, y + 124, chon(lang, v["can"], v["can"], _CAN_ZH.get(v["can"], v["can"])), co_lon,
                     m["hanh"].get(v["canHanh"], m["chu"]), dam=True, neo="middle", rong=r, co_min=10)[0])
        p.append(chu(cx, y + 152, chon(lang, v["chi"], v["chi"], _CHI_ZH.get(v["chi"], v["chi"])), co_lon,
                     m["hanh"].get(v["chiHanh"], m["chu"]), dam=True, neo="middle", rong=r, co_min=10)[0])
        tt_v = chon(lang, v["thapThanCan"], v["thapThanCanEn"], v.get("thapThanCanZh") or v["thapThanCanEn"])
        p.append(_chu_cot(cx, y + 180, tt_v, 11.5, m["chuMo"], r))
    return "".join(p)


def ve_bat_tu_svg(la_so: Dict, lang: str = "vi", theme: str = "light", width: Optional[float] = None,
                  ho_ten: str = "") -> str:
    """Vẽ lá số Bát Tự (kết quả của ``lap_la_so_bat_tu``) thành chuỗi SVG tự chứa.

    ``ho_ten`` in ở đầu hình (lá số Bát Tự không mang tên)."""
    lang = chuan_lang(lang)
    m = _MAU["dark" if theme == "dark" else "light"]
    rong_hien = width if width and width > 0 else 720
    ho_ten = ho_ten or ""
    tru = [t["label"] for t in (la_so.get("truNam"), la_so.get("truThang"), la_so.get("truNgay"), la_so.get("truGio")) if t]

    tieu_de = chon(lang, "Lá số Bát Tự", "Bát Tự chart", "八字命盘") + (": " + ho_ten if ho_ten else "")
    tru_zh = "、".join("".join(_CAN_ZH.get(x) or _CHI_ZH.get(x) or x for x in s.split(" ")) for s in tru)
    mo_ta = chon(
        lang,
        "Bốn trụ %s; nhật chủ %s %s. Vẽ bằng thư viện mở Nhật Nguyệt." % (", ".join(tru), la_so["nhatChu"], la_so["nhatChuHanh"]),
        "Four pillars %s; day master %s (%s). Drawn with the Nhat Nguyet open library."
        % (", ".join(tru), la_so["nhatChu"], _HANH_EN.get(la_so["nhatChuHanh"], "")),
        "四柱 %s；日主%s%s。由 Nhat Nguyet 开源库绘制。"
        % (tru_zh, _CAN_ZH.get(la_so["nhatChu"], ""), _HANH_ZH.get(la_so["nhatChuHanh"], "")),
    )

    p = [mo_dau(lang, _W, _H, rong_hien, tieu_de, mo_ta), hop(0, 0, _W, _H, 18, m["nen"]),
         _ve_dau(la_so, ho_ten, lang, m), _ve_bang(la_so, lang, m), _ve_dai_van(la_so, lang, m)]

    # Chân hình: tên miền bên trái, chú giải màu ngũ hành bên phải.
    y_chan = _H - 16
    p.append(chu(_LE + 4, y_chan, "nhatnguyet.org", 14, m["chinh"], dam=True)[0])
    xc = _W - _LE - 4
    for h in ("Thủy", "Kim", "Thổ", "Hỏa", "Mộc"):
        t_svg, t_rong, _ = chu(xc, y_chan, _hanh_chu(h, lang), 13, m["chuMo"], neo="end")
        p.append(t_svg)
        p.append('<circle cx="%s" cy="%s" r="5" fill="%s"/>' % (so(xc - t_rong - 9), so(y_chan - 4.5), m["hanh"][h]))
        xc -= t_rong + 30
    p.append("</svg>")
    return "".join(p)


#: Bí danh tiếng Anh của ``ve_bat_tu_svg``.
render_bazi_svg = ve_bat_tu_svg
