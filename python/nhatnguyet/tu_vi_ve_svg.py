"""Vẽ lá số Tử Vi thành một tệp SVG tự chứa (bản Python của
``js/packages/tu-vi/src/ve-svg.ts``, ra ĐÚNG TỪNG BYTE như bản ấy).

Địa bàn 4x4 cổ điển (Tỵ Ngọ Mùi Thân ở hàng trên, Dần Sửu Tý Hợi ở hàng
dưới), ô 2x2 giữa là thiên bàn. Ba thứ tiếng, hai bộ màu sáng tối theo nhận
diện của Nhật Nguyệt.

Ví dụ::

    from nhatnguyet import tu_vi
    from nhatnguyet.tu_vi_ve_svg import ve_la_so_svg
    ls = tu_vi.lap_la_so_tu_vi("Nguyen Van An", "Nam", 19, 9, 1990, 10)
    open("la-so.svg", "w").write(ve_la_so_svg(ls, lang="en", theme="dark"))
"""

from __future__ import annotations

from typing import Dict, List, Optional, Tuple

from ._ve_svg_chung import (
    THANG_EN, chon, chu, chuan_lang, do_rong, duong, hop, mo_dau, so, thoat, vien,
)
from .tu_vi_han import dai_van
from .tu_vi_schools import school_short
from .tu_vi_ten_en import star_en, void_name

__all__ = ["ve_la_so_svg", "render_chart_svg"]

_MAU = {
    "light": {
        "nen": "#ECEEEB", "o": "#FFFFFF", "vien": "#D3D9D5", "chu": "#1B1F1E", "chuMo": "#4F5956",
        "chuNhat": "#7D8783", "chinh": "#1F6F6B", "chinhNen": "#E4F0ED", "gach": "#B5402F", "vang": "#C9922E",
        "loc": "#2E7D4F", "quyen": "#9A6B1E", "khoa": "#2B5A86", "ky": "#B5402F", "chuTrenNhan": "#FFFFFF",
        "xamNhan": "#E3E7E4",
    },
    "dark": {
        "nen": "#0F1E1D", "o": "#182A28", "vien": "#2C423F", "chu": "#E8EEEC", "chuMo": "#B3C2BE",
        "chuNhat": "#7F918C", "chinh": "#7CC7BF", "chinhNen": "#1E3835", "gach": "#EE8D78", "vang": "#E0A53C",
        "loc": "#7CCB98", "quyen": "#E6B866", "khoa": "#8DB8E6", "ky": "#EE8D78", "chuTrenNhan": "#0F1E1D",
        "xamNhan": "#26403C",
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
_CHI_THU_TU = ["Tý", "Sửu", "Dần", "Mão", "Thìn", "Tỵ", "Ngọ", "Mùi", "Thân", "Dậu", "Tuất", "Hợi"]

# Chép từ từ vựng nghiệp vụ của lõi tính (coreengine/tuvung.go).
_CUNG_ZH = {
    "Mệnh": "命宫", "Huynh Đệ": "兄弟宫", "Phu Thê": "夫妻宫", "Tử Tức": "子女宫",
    "Tài Bạch": "财帛宫", "Tật Ách": "疾厄宫", "Thiên Di": "迁移宫", "Nô Bộc": "奴仆宫",
    "Quan Lộc": "官禄宫", "Điền Trạch": "田宅宫", "Phúc Đức": "福德宫", "Phụ Mẫu": "父母宫",
}

_SAO_ZH = {
    "Tử Vi": "紫微", "Thiên Cơ": "天机", "Thái Dương": "太阳", "Vũ Khúc": "武曲",
    "Thiên Đồng": "天同", "Liêm Trinh": "廉贞", "Thiên Phủ": "天府", "Thái Âm": "太阴",
    "Tham Lang": "贪狼", "Cự Môn": "巨门", "Thiên Tướng": "天相", "Thiên Lương": "天梁",
    "Thất Sát": "七杀", "Phá Quân": "破军",
    "Văn Xương": "文昌", "Văn Khúc": "文曲", "Tả Phù": "左辅", "Hữu Bật": "右弼",
    "Lộc Tồn": "禄存", "Kình Dương": "擎羊", "Đà La": "陀罗", "Thiên Khôi": "天魁",
    "Thiên Việt": "天钺", "Địa Không": "地空", "Địa Kiếp": "地劫", "Thiên Mã": "天马",
    "Đào Hoa": "桃花", "Tam Thai": "三台", "Bát Tọa": "八座", "Ân Quang": "恩光",
    "Thiên Quý": "天贵", "Thiên Quan": "天官", "Thiên Phúc": "天福", "Thiên Thọ": "天寿",
    "Thiên Khốc": "天哭", "Thiên Hư": "天虚", "Đẩu Quân": "斗君", "Thiên Tài": "天才",
    "Tràng Sinh": "长生", "Mộc Dục": "沐浴", "Quan Đới": "冠带", "Lâm Quan": "临官",
    "Đế Vượng": "帝旺", "Suy": "衰", "Bệnh": "病", "Tử": "死", "Mộ": "墓",
    "Tuyệt": "绝", "Thai": "胎", "Dưỡng": "养",
    "Thái Tuế": "太岁", "Thiếu Dương": "少阳", "Tang Môn": "丧门", "Thiếu Âm": "少阴",
    "Quan Phù": "官符", "Tử Phù": "死符", "Tuế Phá": "岁破", "Long Đức": "龙德",
    "Bạch Hổ": "白虎", "Phúc Đức": "福德", "Điếu Khách": "吊客", "Trực Phù": "直符",
    "Bác Sỹ": "博士", "Lực Sĩ": "力士", "Thanh Long": "青龙", "Tiểu Hao": "小耗",
    "Tướng Quân": "将军", "Tấu Thư": "奏书", "Phi Liêm": "飞廉", "Hỷ Thần": "喜神",
    "Bệnh Phù": "病符", "Đại Hao": "大耗", "Phục Binh": "伏兵", "Quan Phủ": "官府",
}

_CUC_BA = {
    "Thủy Nhị Cục": ("Water Two", "水二局"), "Mộc Tam Cục": ("Wood Three", "木三局"),
    "Kim Tứ Cục": ("Metal Four", "金四局"), "Thổ Ngũ Cục": ("Earth Five", "土五局"),
    "Hỏa Lục Cục": ("Fire Six", "火六局"),
}

_AM_DUONG_BA = {
    "Dương Nam": ("Yang Male", "阳男"), "Âm Nam": ("Yin Male", "阴男"),
    "Dương Nữ": ("Yang Female", "阳女"), "Âm Nữ": ("Yin Female", "阴女"),
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

# Mức sáng tối: chữ tắt ba thứ tiếng và nhóm (0 sáng, 1 vừa, 2 tối).
_SANG_TOI = {
    "Miếu": ("M", "E", "庙", 0), "Vượng": ("V", "P", "旺", 0),
    "Đắc": ("Đ", "F", "得", 1), "Bình": ("B", "N", "平", 1), "Hãm": ("H", "W", "陷", 2),
}

_TU_HOA = {
    "Hóa Lộc": ("Lộc", "Lộc", "禄"), "Hóa Quyền": ("Quyền", "Quyền", "权"),
    "Hóa Khoa": ("Khoa", "Khoa", "科"), "Hóa Kỵ": ("Kỵ", "Kỵ", "忌"),
}

_SAT_TINH = ["Kình Dương", "Đà La", "Địa Không", "Địa Kiếp", "Hỏa Tinh", "Linh Tinh"]

_W = 1000
_LE = 16
_KHE = 8
_O = 236
_CHAN = 44
_H = _LE + 4 * _O + 3 * _KHE + _CHAN

_VI_TRI_O = {
    5: (0, 0), 6: (0, 1), 7: (0, 2), 8: (0, 3),
    4: (1, 0), 9: (1, 3),
    3: (2, 0), 10: (2, 3),
    2: (3, 0), 1: (3, 1), 0: (3, 2), 11: (3, 3),
}


def _en():
    from . import en  # nhập muộn: en nhập mô-đun này
    return en


def _can_chi(s: str, lang: str, terms: str = "vi") -> str:
    if lang == "en":
        return s if terms == "vi" else _en().stem_branch_name(s, "en", terms)
    if lang != "zh":
        return s
    return "".join(_CAN_ZH.get(p) or _CHI_ZH.get(p) or p for p in s.split(" "))


def _ten_sao(s: Dict, lang: str) -> str:
    if lang == "vi":
        return s["ten"]
    if lang == "en":
        return star_en(s["ten"], s["tenEn"])
    return s.get("tenZh") or _SAO_ZH.get(s["ten"]) or s["tenEn"]


def _ten_cung(c: Dict, lang: str) -> str:
    return chon(lang, c["tenCung"], c["tenCungEn"], c.get("tenCungZh") or _CUNG_ZH.get(c["tenCung"]) or c["tenCungEn"])


def _mau_hoa(hoa: str, m: Dict) -> str:
    if hoa == "Hóa Lộc":
        return m["loc"]
    if hoa == "Hóa Quyền":
        return m["quyen"]
    if hoa == "Hóa Khoa":
        return m["khoa"]
    return m["ky"]


def _hoa_ngan(hoa: str, lang: str, terms: str) -> str:
    h = _TU_HOA.get(hoa)
    if not h:
        return ""
    if lang == "en" and terms != "vi":
        return _en().transformation_short(hoa, "en", terms)
    return chon(lang, h[0], h[1], h[2])


def _ve_o(c: Dict, la_so: Dict, tuoi: Optional[Tuple[int, int]], lang: str, m: Dict, terms: str) -> str:
    hang, cot = _VI_TRI_O[c["viTri"]]
    x = _LE + cot * (_O + _KHE)
    y = _LE + hang * (_O + _KHE)
    la_menh = c["viTri"] == la_so["cungMenh"]
    p: List[str] = []
    p.append(hop(x, y, _O, _O, 10, m["chinhNen"] if la_menh else m["o"], m["chinh"] if la_menh else m["vien"],
                 2 if la_menh else 1))
    trai = x + 12
    phai = x + _O - 12
    rong_trong = _O - 24

    # Hàng đầu: tên cung trái, can chi phải (tên dài thì can chi xuống hàng nhãn).
    chu_cc = _can_chi(c["canChi"], lang, terms)
    rong_cc = do_rong(chu_cc, 13, False)
    ten = _ten_cung(c, lang)
    cc_xuong = do_rong(ten, 14, True) > rong_trong - rong_cc - 8
    p.append(chu(phai, y + 49.5 if cc_xuong else y + 25, chu_cc, 13, m["chuNhat"], neo="end")[0])
    p.append(chu(trai, y + 26, ten, 17, m["chinh"] if la_menh else m["chu"], dam=True,
                 rong=rong_trong if cc_xuong else rong_trong - rong_cc - 8, co_min=10)[0])

    # Hàng nhãn: Thân, Tuần, Triệt.
    xn = trai
    if c["laThan"]:
        v = vien(xn, y + 45, chon(lang, "Thân", "Body", "身宫"), 10.5, m["chinh"], m["chinh"], m["chinh"])
        p.append(v[0])
        xn += v[1] + 5
    if c["tuanTrung"]:
        v = vien(xn, y + 45, chon(lang, "Tuần", void_name("tuan", terms), "旬空"), 10.5, m["xamNhan"], m["chuMo"])
        p.append(v[0])
        xn += v[1] + 5
    if c["trietLo"]:
        v = vien(xn, y + 45, chon(lang, "Triệt", void_name("triet", terms), "截空"), 10.5, m["xamNhan"], m["chuMo"])
        p.append(v[0])
        xn += v[1] + 5

    # Chính tinh: màu theo sáng tối, chữ tắt mức sáng tối, viên Tứ Hóa.
    yd = y + 76
    chinh = [s for s in c["sao"] if s["loai"] == "chinh-tinh"]
    if not chinh:
        p.append(chu(trai, yd, chon(lang, "Vô chính diệu", "No major star", "无主星"), 15, m["chuNhat"],
                     nghieng=True, rong=rong_trong, co_min=10)[0])
        yd += 24
    for s in chinh:
        st = _SANG_TOI.get(s.get("mieuVuong") or "")
        nhom = st[3] if st else 1
        mau = m["chinh"] if nhom == 0 else m["chu"] if nhom == 1 else m["chuNhat"]
        tat = chon(lang, st[0], st[1], st[2]) if st else ""
        hoa = _TU_HOA.get(s["tuHoa"]) if s.get("tuHoa") else None
        chu_hoa = _hoa_ngan(s.get("tuHoa") or "", lang, terms) if hoa else ""
        rong_tat = do_rong(tat, 11.5, True) + 3 if tat else 0
        rong_hoa = do_rong(chu_hoa, 11, True) + 11 * 0.9 + 6 if hoa else 0
        t_svg, t_rong, _ = chu(trai, yd, _ten_sao(s, lang), 18, mau, dam=True,
                               rong=rong_trong - rong_tat - rong_hoa, co_min=10)
        if tat:
            t_svg = t_svg.replace("</text>", '<tspan dx="3" dy="-7" font-size="11.5">%s</tspan></text>' % thoat(tat), 1)
        p.append(t_svg)
        xs = trai + t_rong + 3
        if tat:
            xs += rong_tat
        if hoa:
            p.append(vien(xs + 3, yd - 6, chu_hoa, 11, _mau_hoa(s.get("tuHoa") or "", m), m["chuTrenNhan"])[0])
        yd += 24

    # Phụ tinh rồi sao vòng Thái Tuế, Bác Sỹ (nhạt hơn), chảy từ trái sang.
    muc = [(s, False) for s in c["sao"] if s["loai"] == "phu-tinh"]
    for loai in ("thai-tue", "bac-sy"):
        muc += [(s, True) for s in c["sao"] if s["loai"] == loai]
    day = y + _O - 36
    bat_dau = yd + 4
    # Cỡ 9, 8 thêm 19/11/2026: lá số an đủ bộ sao Tân Biên, ô đông nhất có tới
    # mười sáu phụ tinh và sao vòng, tên tiếng Anh dài.
    co_thu = [14, 13, 12, 11, 10, 9, 8]
    chon1: List[str] = []
    for i, co_goc in enumerate(co_thu):
        ra: List[str] = []
        xx = trai
        yy = bat_dau + co_goc
        for s, vong in muc:
            co = co_goc - 1.5 if vong else co_goc
            ten_s = _ten_sao(s, lang)
            hoa = _TU_HOA.get(s["tuHoa"]) if s.get("tuHoa") else None
            chu_hoa = _hoa_ngan(s.get("tuHoa") or "", lang, terms) if hoa else ""
            co_hoa = co - 2.5
            w_hoa = do_rong(chu_hoa, co_hoa, True) + co_hoa * 0.9 + 3 if hoa else 0
            w = do_rong(ten_s, co, False) + w_hoa
            if xx > trai and xx + w > phai:
                xx = trai
                yy += co_goc + 5
            sat = s["ten"] in _SAT_TINH
            t_svg, t_rong, _ = chu(xx, yy, ten_s, co, m["gach"] if sat else m["chuNhat"] if vong else m["chuMo"],
                                   rong=rong_trong - w_hoa, co_min=8)
            ra.append(t_svg)
            if hoa:
                ra.append(vien(xx + t_rong + 3, yy - co * 0.34, chu_hoa, co_hoa, _mau_hoa(s.get("tuHoa") or "", m),
                               m["chuTrenNhan"])[0])
            xx += t_rong + w_hoa + co * 0.8
        chon1 = ra
        if yy + 3 <= day or i == len(co_thu) - 1:
            break
    p.extend(chon1)

    # Chân ô: giai đoạn vòng Tràng Sinh bên trái, tuổi đại vận bên phải.
    p.append(duong(trai, y + _O - 30, phai, y + _O - 30, m["vien"]))
    rong_tuoi = 0
    if tuoi:
        t_svg, t_rong, _ = chu(phai, y + _O - 10, "%d-%d" % (tuoi[0], tuoi[1]), 14, m["chinh"], dam=True, neo="end")
        p.append(t_svg)
        rong_tuoi = t_rong + 8
    for s in c["sao"]:
        if s["loai"] == "truong-sinh":
            p.append(chu(trai, y + _O - 10, _ten_sao(s, lang), 13, m["chuMo"], rong=rong_trong - rong_tuoi, co_min=9)[0])
    return "".join(p)


def _ngay_duong(la_so: Dict, lang: str) -> str:
    d = la_so["ngaySinhDuong"]
    return chon(lang, "%d/%d/%d" % (d["ngay"], d["thang"], d["nam"]),
                "%d %s %d" % (d["ngay"], THANG_EN[d["thang"] - 1], d["nam"]),
                "%d年%d月%d日" % (d["nam"], d["thang"], d["ngay"]))


def _ngay_am(la_so: Dict, lang: str, terms: str) -> str:
    a = la_so["ngaySinhAm"]
    nhuan = a.get("leap") is True
    nam = _can_chi(la_so["canChiNam"], lang, terms)
    return chon(
        lang,
        "%d/%d%s, năm %s" % (a["day"], a["month"], " nhuận" if nhuan else "", nam),
        "Day %d, %smonth %d, %s year" % (a["day"], "leap " if nhuan else "", a["month"], nam),
        "%s年%s%d月%d日" % (nam, "闰" if nhuan else "", a["month"], a["day"]),
    )


def _ten_chi(chi: str, lang: str, terms: str) -> str:
    if lang == "en":
        return _en().term_name(chi, "en", terms)
    return chon(lang, chi, chi, _CHI_ZH.get(chi, chi))


def _gio_sinh(la_so: Dict, lang: str, terms: str) -> str:
    g = la_so["gioSinh"]
    i = _CHI_THU_TU.index(g) if g in _CHI_THU_TU else -1
    tu = (i * 2 + 23) % 24
    den = (i * 2 + 1) % 24
    return chon(lang, "%s (%dh-%dh)" % (g, tu, den), "%s (%d:00-%d:00)" % (_ten_chi(g, lang, terms), tu, den),
                "%s时 (%d-%d点)" % (_CHI_ZH.get(g, g), tu, den))


def _ban_menh(la_so: Dict, lang: str) -> str:
    ten = la_so["banMenhNapAm"]
    return chon(lang, ten, _en().term(ten, "en"), _NAP_AM_ZH.get(ten) or ten)


def _ve_giua(la_so: Dict, lang: str, m: Dict, terms: str) -> str:
    x = _LE + _O + _KHE
    y = _LE + _O + _KHE
    w = 2 * _O + _KHE
    p: List[str] = [hop(x, y, w, w, 14, m["o"], m["vien"], 1)]
    cx = x + w / 2
    trai = x + 32
    rong = w - 64

    y_dau = y + 40
    ten = chon(lang, "NHẬT NGUYỆT", "NHAT NGUYET", "NHAT NGUYET")
    rong_ten = do_rong(ten, 12, True) + 12 * 2.2 * 0.5
    x_dau = cx - (rong_ten + 22) / 2
    p.append('<circle cx="%s" cy="%s" r="8" fill="none" stroke="%s" stroke-width="2.5"/>' % (so(x_dau + 8), so(y_dau - 4), m["vang"]))
    p.append('<circle cx="%s" cy="%s" r="3" fill="%s"/>' % (so(x_dau + 8), so(y_dau - 4), m["vang"]))
    p.append(chu(x_dau + 22, y_dau, ten, 12, m["chinh"], dam=True, gian_chu=2.2)[0])

    p.append(chu(cx, y + 80, chon(lang, "Lá số Tử Vi", "Zi Wei Chart", "紫微斗数命盘"), 28, m["chu"], dam=True,
                 neo="middle", rong=rong, co_min=16)[0])
    yy = y + 108
    if la_so.get("hoTen"):
        p.append(chu(cx, yy, la_so["hoTen"], 18, m["chinh"], dam=True, neo="middle", rong=rong, co_min=11)[0])
        yy += 12
    yy += 18
    p.append(duong(trai, yy, trai + rong, yy, m["vien"]))
    yy += 30

    ad = _AM_DUONG_BA.get(la_so["amDuongMenh"])
    cuc = _CUC_BA.get(la_so["tenCuc"])
    cung_than = la_so["cung"][la_so["cungThan"]] if 0 <= la_so["cungThan"] < len(la_so["cung"]) else None
    than = cung_than["chi"] if cung_than else ""
    adm = la_so["amDuongMenh"]
    dong = [
        (chon(lang, "Dương lịch", "Solar date", "公历"), _ngay_duong(la_so, lang)),
        (chon(lang, "Âm lịch", "Lunar date", "农历"), _ngay_am(la_so, lang, terms)),
        (chon(lang, "Giờ sinh", "Birth hour", "时辰"), _gio_sinh(la_so, lang, terms)),
        (chon(lang, "Âm dương", "Yin-yang", "阴阳"), chon(lang, adm, ad[0] if ad else adm, ad[1] if ad else adm)),
        (chon(lang, "Bản mệnh", "Na yin", "纳音"), _ban_menh(la_so, lang)),
        (chon(lang, "Cục", "Bureau", "五行局"),
         chon(lang, la_so["tenCuc"], cuc[0] if cuc else la_so["tenCuc"], cuc[1] if cuc else la_so["tenCuc"])),
        (chon(lang, "Mệnh, Thân", "Life, Body", "命宫, 身宫"),
         chon(lang, "Mệnh ở %s, Thân ở %s" % (la_so["menhCungChi"], than),
              "Life at %s, Body at %s" % (_ten_chi(la_so["menhCungChi"], lang, terms), _ten_chi(than, lang, terms)),
              "命宫在%s，身宫在%s" % (_CHI_ZH.get(la_so["menhCungChi"], ""), _CHI_ZH.get(than, "")))),
    ]
    # Lựa chọn phái khác mặc định (tu_vi_schools): thêm một hàng, các hàng khít lại.
    phai = school_short(la_so.get("schools"), lang)
    if phai:
        dong.append((chon(lang, "Phái", "Schools", "流派"), phai))
    buoc = 27 if phai else 31
    rong_nhan = 132
    for nhan, gt in dong:
        p.append(chu(trai, yy, nhan, 14, m["chuNhat"], rong=rong_nhan - 10, co_min=10)[0])
        p.append(chu(trai + rong_nhan, yy, gt, 16, m["chu"], dam=True, rong=rong - rong_nhan,
                     co_min=8 if phai and gt == phai else 10)[0])
        yy += buoc

    # Chú giải: sáng tối và Tứ Hóa.
    yc = y + w - 62
    p.append(duong(trai, yc - 24, trai + rong, yc - 24, m["vien"]))
    nhom = [
        (m["chinh"], chon(lang, "M, V: Miếu, Vượng", "E, P: exalted, prosperous", "庙, 旺")),
        (m["chu"], chon(lang, "Đ, B: Đắc, Bình", "F, N: favorable, neutral", "得, 平")),
        (m["chuNhat"], chon(lang, "H: Hãm", "W: weak", "陷")),
    ]
    xc = trai
    co_cg = 12 if lang == "en" else 13
    for mau, s in nhom:
        p.append('<circle cx="%s" cy="%s" r="5" fill="%s"/>' % (so(xc + 5), so(yc - 4.5), mau))
        t_svg, t_rong, _ = chu(xc + 15, yc, s, co_cg, m["chuMo"])
        p.append(t_svg)
        xc += 15 + t_rong + 16
    yc += 30
    t_svg, t_rong, _ = chu(trai, yc, chon(lang, "Tứ Hóa", "Four Transformations", "四化"), 13, m["chuMo"])
    p.append(t_svg)
    xc = trai + t_rong + 12
    for k in ("Hóa Lộc", "Hóa Quyền", "Hóa Khoa", "Hóa Kỵ"):
        v = vien(xc, yc - 4.5, _hoa_ngan(k, lang, terms), 11.5, _mau_hoa(k, m), m["chuTrenNhan"])
        p.append(v[0])
        xc += v[1] + 7
    return "".join(p)


def ve_la_so_svg(la_so: Dict, lang: str = "vi", theme: str = "light", width: Optional[float] = None,
                 terms: Optional[str] = None) -> str:
    """Vẽ lá số Tử Vi (kết quả của ``lap_la_so_tu_vi``) thành chuỗi SVG tự chứa.

    ``lang``: "vi", "en", "zh". ``theme``: "light", "dark". ``width``: bề rộng
    hiển thị, mặc định 720 (hình co giãn theo viewBox). ``terms`` (bản Anh):
    can chi, Tứ Hóa, Tuần Triệt viết "pinyin" (mặc định), "han" hay "vi"."""
    lang = chuan_lang(lang)
    terms = "vi" if lang != "en" else terms if terms in ("vi", "han") else "pinyin"
    m = _MAU["dark" if theme == "dark" else "light"]
    rong_hien = width if width and width > 0 else 720

    tuoi = {d["viTri"]: (d["tuTuoi"], d["denTuoi"]) for d in dai_van(la_so)}

    ho_ten = la_so.get("hoTen") or ""
    tieu_de = chon(lang, "Lá số Tử Vi", "Zi Wei chart", "紫微斗数命盘") + (": " + ho_ten if ho_ten else "")
    mo_ta = chon(
        lang,
        "Lá số Tử Vi sinh ngày %s, giờ %s, %s, %s. Vẽ bằng thư viện mở Nhật Nguyệt."
        % (_ngay_duong(la_so, "vi"), la_so["gioSinh"], la_so["amDuongMenh"], la_so["tenCuc"]),
        "Zi Wei chart for %s, hour %s. Drawn with the Nhat Nguyet open library."
        % (_ngay_duong(la_so, "en"), _ten_chi(la_so["gioSinh"], lang, terms)),
        "紫微斗数命盘，公历%s，%s时。由 Nhat Nguyet 开源库绘制。" % (_ngay_duong(la_so, "zh"), _CHI_ZH.get(la_so["gioSinh"], "")),
    )

    p = [mo_dau(lang, _W, _H, rong_hien, tieu_de, mo_ta), hop(0, 0, _W, _H, 18, m["nen"])]
    for c in la_so["cung"]:
        p.append(_ve_o(c, la_so, tuoi.get(c["viTri"]), lang, m, terms))
    p.append(_ve_giua(la_so, lang, m, terms))
    y_chan = _H - 16
    p.append(chu(_LE + 4, y_chan, "nhatnguyet.org", 14, m["chinh"], dam=True)[0])
    p.append(chu(_W - _LE - 4, y_chan, chon(lang, "Đại vận: tuổi mụ ở góc dưới mỗi cung",
                                            "Decade luck: East Asian age at the foot of each palace",
                                            "大限：各宫右下角为虚岁"),
                 12.5, m["chuNhat"], neo="end", rong=560, co_min=9)[0])
    p.append("</svg>")
    return "".join(p)


#: Bí danh tiếng Anh của ``ve_la_so_svg``.
render_chart_svg = ve_la_so_svg
