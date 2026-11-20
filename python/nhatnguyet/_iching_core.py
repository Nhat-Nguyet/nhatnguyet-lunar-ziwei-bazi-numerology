"""Lớp lõi Kinh Dịch: chuyển ngữ lõi tính Go (kinhdich.go, kinhdich_lienquan.go,
luchao.go, luchao_data.go, kinhdich_quaikhi.go, quaikhi_thoidiem.go), cùng
phép với bản TypeScript ``js/packages/iching/src/core.ts``. Đối tượng trả về
dùng ĐÚNG khoá của ca kiểm ``ca-kiem/iching.json``. Mô-đun nội bộ: người dùng
gọi ``nhatnguyet.iching``.

Bảng dữ liệu CHÉP từ lõi Go; chỉ có tên gọi và quy tắc tính, không có Tượng,
không có luận giải.
"""

from typing import Dict, List, Optional, Sequence, Tuple

from . import am_lich

DIA_CHI = am_lich.DIA_CHI
THIEN_CAN = am_lich.THIEN_CAN
mod = am_lich.mod

# Tám quái theo số Tiên Thiên (1 Càn ... 8 Khôn): tên Việt, tên Anh (bính âm
# không dấu), chữ Hán, giản thể, bính âm có dấu, ký hiệu, ba hào từ dưới lên,
# tượng Việt, tượng Anh, tượng Hán Việt, hành, phương Việt, phương Anh.
QUAI = (
    ("", "", "", "", "", "", (0, 0, 0), "", "", "", "", "", ""),
    ("Càn", "Qian", "乾", "乾", "Qián", "☰", (1, 1, 1), "Trời", "Heaven", "Thiên", "Kim", "Tây Bắc", "Northwest"),
    ("Đoài", "Dui", "兌", "兑", "Duì", "☱", (1, 1, 0), "Đầm", "Lake", "Trạch", "Kim", "Tây", "West"),
    ("Ly", "Li", "離", "离", "Lí", "☲", (1, 0, 1), "Lửa", "Fire", "Hỏa", "Hỏa", "Nam", "South"),
    ("Chấn", "Zhen", "震", "震", "Zhèn", "☳", (1, 0, 0), "Sấm", "Thunder", "Lôi", "Mộc", "Đông", "East"),
    ("Tốn", "Xun", "巽", "巽", "Xùn", "☴", (0, 1, 1), "Gió", "Wind", "Phong", "Mộc", "Đông Nam", "Southeast"),
    ("Khảm", "Kan", "坎", "坎", "Kǎn", "☵", (0, 1, 0), "Nước", "Water", "Thủy", "Thủy", "Bắc", "North"),
    ("Cấn", "Gen", "艮", "艮", "Gèn", "☶", (0, 0, 1), "Núi", "Mountain", "Sơn", "Thổ", "Đông Bắc", "Northeast"),
    ("Khôn", "Kun", "坤", "坤", "Kūn", "☷", (0, 0, 0), "Đất", "Earth", "Địa", "Thổ", "Tây Nam", "Southwest"),
)

# Số King Wen theo [quái thượng][quái hạ], số Tiên Thiên 1..8.
KING_WEN = (
    (),
    (0, 1, 10, 13, 25, 44, 6, 33, 12),
    (0, 43, 58, 49, 17, 28, 47, 31, 45),
    (0, 14, 38, 30, 21, 50, 64, 56, 35),
    (0, 34, 54, 55, 51, 32, 40, 62, 16),
    (0, 9, 61, 37, 42, 57, 59, 53, 20),
    (0, 5, 60, 63, 3, 48, 29, 39, 8),
    (0, 26, 41, 22, 27, 18, 4, 52, 23),
    (0, 11, 19, 36, 24, 46, 7, 15, 2),
)

# Tên 64 quẻ: tên riêng Việt, chữ Hán, giản thể, tên Anh, bính âm có dấu.
TEN_QUE = (
    ("", "", "", "", ""),
    ("Càn", "乾", "乾", "The Creative", "Qián"),
    ("Khôn", "坤", "坤", "The Receptive", "Kūn"),
    ("Truân", "屯", "屯", "Difficulty at the Beginning", "Zhūn"),
    ("Mông", "蒙", "蒙", "Youthful Folly", "Méng"),
    ("Nhu", "需", "需", "Waiting", "Xū"),
    ("Tụng", "訟", "讼", "Conflict", "Sòng"),
    ("Sư", "師", "师", "The Army", "Shī"),
    ("Tỷ", "比", "比", "Holding Together", "Bǐ"),
    ("Tiểu Súc", "小畜", "小畜", "The Taming Power of the Small", "Xiǎo Chù"),
    ("Lý", "履", "履", "Treading", "Lǚ"),
    ("Thái", "泰", "泰", "Peace", "Tài"),
    ("Bĩ", "否", "否", "Standstill", "Pǐ"),
    ("Đồng Nhân", "同人", "同人", "Fellowship with Others", "Tóng Rén"),
    ("Đại Hữu", "大有", "大有", "Possession in Great Measure", "Dà Yǒu"),
    ("Khiêm", "謙", "谦", "Modesty", "Qiān"),
    ("Dự", "豫", "豫", "Enthusiasm", "Yù"),
    ("Tùy", "隨", "随", "Following", "Suí"),
    ("Cổ", "蠱", "蛊", "Work on What Has Been Spoiled", "Gǔ"),
    ("Lâm", "臨", "临", "Approach", "Lín"),
    ("Quán", "觀", "观", "Contemplation", "Guān"),
    ("Phệ Hạp", "噬嗑", "噬嗑", "Biting Through", "Shì Kè"),
    ("Bí", "賁", "贲", "Grace", "Bì"),
    ("Bác", "剝", "剥", "Splitting Apart", "Bō"),
    ("Phục", "復", "复", "Return", "Fù"),
    ("Vô Vọng", "無妄", "无妄", "Innocence", "Wú Wàng"),
    ("Đại Súc", "大畜", "大畜", "The Taming Power of the Great", "Dà Chù"),
    ("Di", "頤", "颐", "Nourishment", "Yí"),
    ("Đại Quá", "大過", "大过", "Preponderance of the Great", "Dà Guò"),
    ("Khảm", "坎", "坎", "The Abysmal", "Kǎn"),
    ("Ly", "離", "离", "The Clinging", "Lí"),
    ("Hàm", "咸", "咸", "Influence", "Xián"),
    ("Hằng", "恆", "恒", "Duration", "Héng"),
    ("Độn", "遯", "遁", "Retreat", "Dùn"),
    ("Đại Tráng", "大壯", "大壮", "The Power of the Great", "Dà Zhuàng"),
    ("Tấn", "晉", "晋", "Progress", "Jìn"),
    ("Minh Di", "明夷", "明夷", "Darkening of the Light", "Míng Yí"),
    ("Gia Nhân", "家人", "家人", "The Family", "Jiā Rén"),
    ("Khuê", "睽", "睽", "Opposition", "Kuí"),
    ("Kiển", "蹇", "蹇", "Obstruction", "Jiǎn"),
    ("Giải", "解", "解", "Deliverance", "Xiè"),
    ("Tổn", "損", "损", "Decrease", "Sǔn"),
    ("Ích", "益", "益", "Increase", "Yì"),
    ("Quải", "夬", "夬", "Breakthrough", "Guài"),
    ("Cấu", "姤", "姤", "Coming to Meet", "Gòu"),
    ("Tụy", "萃", "萃", "Gathering Together", "Cuì"),
    ("Thăng", "升", "升", "Pushing Upward", "Shēng"),
    ("Khốn", "困", "困", "Oppression", "Kùn"),
    ("Tỉnh", "井", "井", "The Well", "Jǐng"),
    ("Cách", "革", "革", "Revolution", "Gé"),
    ("Đỉnh", "鼎", "鼎", "The Cauldron", "Dǐng"),
    ("Chấn", "震", "震", "The Arousing", "Zhèn"),
    ("Cấn", "艮", "艮", "Keeping Still", "Gèn"),
    ("Tiệm", "漸", "渐", "Gradual Progress", "Jiàn"),
    ("Quy Muội", "歸妹", "归妹", "The Marrying Maiden", "Guī Mèi"),
    ("Phong", "豐", "丰", "Abundance", "Fēng"),
    ("Lữ", "旅", "旅", "The Wanderer", "Lǚ"),
    ("Tốn", "巽", "巽", "The Gentle", "Xùn"),
    ("Đoài", "兌", "兑", "The Joyous", "Duì"),
    ("Hoán", "渙", "涣", "Dispersion", "Huàn"),
    ("Tiết", "節", "节", "Limitation", "Jié"),
    ("Trung Phu", "中孚", "中孚", "Inner Truth", "Zhōng Fú"),
    ("Tiểu Quá", "小過", "小过", "Preponderance of the Small", "Xiǎo Guò"),
    ("Ký Tế", "既濟", "既济", "After Completion", "Jì Jì"),
    ("Vị Tế", "未濟", "未济", "Before Completion", "Wèi Jì"),
)

VI_TRI_CUNG = (
    ("Bát thuần", "Pure", "八纯"),
    ("Nhất thế", "First generation", "一世"),
    ("Nhị thế", "Second generation", "二世"),
    ("Tam thế", "Third generation", "三世"),
    ("Tứ thế", "Fourth generation", "四世"),
    ("Ngũ thế", "Fifth generation", "五世"),
    ("Du hồn", "Wandering soul", "游魂"),
    ("Quy hồn", "Returning soul", "归魂"),
)
THE_THEO_VI_TRI = (6, 1, 2, 3, 4, 5, 4, 3)
THU_TU_CUNG = (1, 6, 7, 4, 5, 3, 8, 2)

# Nạp giáp: can nội, can ngoại, chi hào sơ ở nội, chi hào tứ ở ngoại, đi thuận.
NAP_GIAP = (
    ("", "", 0, 0, True),
    ("Giáp", "Nhâm", 0, 6, True),
    ("Đinh", "Đinh", 5, 11, False),
    ("Kỷ", "Kỷ", 3, 9, False),
    ("Canh", "Canh", 0, 6, True),
    ("Tân", "Tân", 1, 7, False),
    ("Mậu", "Mậu", 2, 8, True),
    ("Bính", "Bính", 4, 10, True),
    ("Ất", "Quý", 7, 1, False),
)

LUC_THAN = {
    "Phụ Mẫu": ("Parent", "父母"),
    "Huynh Đệ": ("Sibling", "兄弟"),
    "Tử Tôn": ("Offspring", "子孙"),
    "Thê Tài": ("Wealth", "妻财"),
    "Quan Quỷ": ("Officer/Ghost", "官鬼"),
}
LUC_THU = (
    ("Thanh Long", "Azure Dragon", "青龙"),
    ("Chu Tước", "Vermilion Bird", "朱雀"),
    ("Câu Trần", "Hooked Chen", "勾陈"),
    ("Đằng Xà", "Soaring Snake", "腾蛇"),
    ("Bạch Hổ", "White Tiger", "白虎"),
    ("Huyền Vũ", "Dark Warrior", "玄武"),
)
KHOI_LUC_THU = (0, 0, 1, 1, 2, 3, 4, 4, 5, 5)
TRANG_THAI = {
    "vượng": ("prospering", "旺"),
    "tướng": ("supported", "相"),
    "hưu": ("resting", "休"),
    "tù": ("trapped", "囚"),
    "tử": ("dead", "死"),
}
SINH = {"Mộc": "Hỏa", "Hỏa": "Thổ", "Thổ": "Kim", "Kim": "Thủy", "Thủy": "Mộc"}
KHAC = {"Mộc": "Thổ", "Thổ": "Thủy", "Thủy": "Hỏa", "Hỏa": "Kim", "Kim": "Mộc"}
_HANH_EN = {"Kim": "Metal", "Mộc": "Wood", "Thủy": "Water", "Hỏa": "Fire", "Thổ": "Earth"}
_CHI_HANH = ("Thủy", "Thổ", "Mộc", "Mộc", "Thổ", "Hỏa", "Hỏa", "Thổ", "Kim", "Kim", "Thổ", "Thủy")

THU_TU_QUAI_KHI = (
    61, 24, 3, 15, 38,
    46, 19, 62, 4, 42,
    53, 11, 5, 17, 35,
    40, 34, 16, 6, 18,
    49, 43, 56, 7, 8,
    9, 1, 14, 37, 48,
    31, 44, 50, 55, 59,
    10, 33, 32, 60, 13,
    41, 12, 57, 45, 26,
    22, 20, 54, 25, 36,
    47, 23, 52, 63, 21,
    28, 2, 64, 39, 27,
)
TU_CHINH = (29, 51, 30, 58)
VAI_TRO_QUAI_KHI = (
    ("công", "duke", "公"),
    ("tích", "sovereign", "辟"),
    ("hầu", "marquis", "侯"),
    ("đại phu", "grand master", "大夫"),
    ("khanh", "minister", "卿"),
)
MO_HINH_QUAI_KHI = "quai-khi-manh-hy-6-ngay-7-phan-v1"
PHUT_MOI_NGAY = 1440
PHUT_MOI_QUE = 6 * 1440 + 7 * 1440 // 80
NGUONG_SAT_GIAO_QUE_PHUT = 2


def so_quai_tu_hao(h: Sequence[bool]) -> int:
    """Số Tiên Thiên của quái từ ba hào (dưới lên)."""
    return 8 - ((4 if h[0] else 0) + (2 if h[1] else 0) + (1 if h[2] else 0))


def hao_quai(so: int) -> List[bool]:
    return [x == 1 for x in QUAI[so][6]]


def so_que_tu_hao(h: Sequence[bool]) -> int:
    return KING_WEN[so_quai_tu_hao(list(h)[3:6])][so_quai_tu_hao(list(h)[0:3])]


_THUONG_HA = [(0, 0)] * 65
for _t in range(1, 9):
    for _h in range(1, 9):
        _THUONG_HA[KING_WEN[_t][_h]] = (_t, _h)


def thuong_ha(so: int) -> Tuple[int, int]:
    return _THUONG_HA[so]


def hao_que(so: int) -> List[bool]:
    t, h = _THUONG_HA[so]
    return hao_quai(h) + hao_quai(t)


def ten_viet_que(so: int) -> str:
    t, h = _THUONG_HA[so]
    if t == h:
        return "Thuần " + QUAI[t][0]
    return QUAI[t][9] + " " + QUAI[h][9] + " " + TEN_QUE[so][0]


def _khoa(h: Sequence[bool]) -> str:
    return "".join("1" if x else "0" for x in h)


def _dung_bang_cung() -> Dict[str, Dict]:
    out = {}
    for so_quai in THU_TU_CUNG:
        q = hao_quai(so_quai)

        def ghi(h, vi, so_quai=so_quai):
            the = THE_THEO_VI_TRI[vi]
            ung = the + 3
            if ung > 6:
                ung -= 6
            out[_khoa(h)] = {"soQuaiCung": so_quai, "hanhCung": QUAI[so_quai][10], "viTri": vi, "the": the, "ung": ung}

        cur = q + q
        ghi(cur, 0)
        for i in range(5):
            cur[i] = not cur[i]
            ghi(cur, i + 1)
        cur[3] = not cur[3]
        ghi(cur, 6)
        for i in range(3):
            cur[i] = not cur[i]
        ghi(cur, 7)
    return out


_BANG_CUNG = _dung_bang_cung()


def cung_cua(h: Sequence[bool]) -> Dict:
    return _BANG_CUNG[_khoa(h)]


def que_ho(h: Sequence[bool]) -> int:
    return so_que_tu_hao([h[1], h[2], h[3], h[2], h[3], h[4]])


def que_thac(h: Sequence[bool]) -> int:
    return so_que_tu_hao([not x for x in h])


def que_tong(h: Sequence[bool]) -> int:
    return so_que_tu_hao(list(reversed(list(h))))


def quai_tho(so: int) -> Dict:
    q = QUAI[so]
    return {
        "number": so, "nameVi": q[0], "nameEn": q[1], "nameHan": q[2], "nameZh": q[3], "pinyin": q[4],
        "symbol": q[5], "lines": hao_quai(so), "imageVi": q[7], "imageEn": q[8], "imageHan": q[9],
        "element": q[10], "elementEn": _HANH_EN[q[10]], "direction": q[11], "directionEn": q[12],
    }


def que_tho(so: int) -> Dict:
    h = hao_que(so)
    t, d = _THUONG_HA[so]
    c = cung_cua(h)
    vt = VI_TRI_CUNG[c["viTri"]]
    return {
        "number": so, "symbol": chr(0x4DC0 + so - 1), "lines": h, "binary": _khoa(h),
        "upper": t, "lower": d,
        "nameVi": ten_viet_que(so), "nameEn": TEN_QUE[so][3], "nameHan": TEN_QUE[so][1],
        "nameZh": TEN_QUE[so][2], "pinyin": TEN_QUE[so][4],
        "palace": c["soQuaiCung"], "palaceElement": c["hanhCung"], "generation": c["viTri"],
        "generationVi": vt[0], "generationEn": vt[1], "generationZh": vt[2],
        "world": c["the"], "response": c["ung"],
        "mutual": que_ho(h), "opposite": que_thac(h), "reverse": que_tong(h),
    }


def kiem_gieo(g) -> None:
    ok = isinstance(g, (list, tuple)) and len(g) == 6 and all(
        isinstance(v, int) and not isinstance(v, bool) and 6 <= v <= 9 for v in g)
    if not ok:
        raise ValueError("coin lines must be six integers from 6 to 9 (bottom line first), got %r" % (g,))


def hao_tu_gieo(g: Sequence[int]) -> Tuple[List[bool], List[bool], List[bool]]:
    chinh = [v in (7, 9) for v in g]
    bien = [v in (6, 7) for v in g]
    dong = [v in (6, 9) for v in g]
    return chinh, bien, dong


def gieo_tho(g: Sequence[int]) -> Dict:
    kiem_gieo(g)
    chinh, bien, dong = hao_tu_gieo(g)
    moving = [i + 1 for i, d in enumerate(dong) if d]
    return {"primary": so_que_tu_hao(chinh), "moving": moving, "changed": so_que_tu_hao(bien) if moving else None}


def _mod_que(n: int, m: int) -> int:
    r = mod(n, m)
    return m if r == 0 else r


def mai_hoa_tho(a: int, b: int, c: int) -> Dict:
    t = _mod_que(a, 8)
    d = _mod_que(b, 8)
    dong = _mod_que(c, 6)
    so = KING_WEN[t][d]
    h = hao_que(so)
    h[dong - 1] = not h[dong - 1]
    return {"upper": t, "lower": d, "primary": so, "moving": [dong], "changed": so_que_tu_hao(h)}


def _chi_cua_hao(so_quai: int, vi: int, la_ngoai: bool) -> Tuple[str, str]:
    ng = NAP_GIAP[so_quai]
    bat_dau = ng[3] if la_ngoai else ng[2]
    buoc = 2 if ng[4] else -2
    return (ng[1] if la_ngoai else ng[0]), DIA_CHI[mod(bat_dau + buoc * vi, 12)]


def _hanh_cua_chi(chi: str) -> str:
    return _CHI_HANH[DIA_CHI.index(chi)]


def _luc_than(hanh_hao: str, hanh_cung: str) -> str:
    if hanh_hao == hanh_cung:
        return "Huynh Đệ"
    if SINH[hanh_hao] == hanh_cung:
        return "Phụ Mẫu"
    if SINH[hanh_cung] == hanh_hao:
        return "Tử Tôn"
    if KHAC[hanh_hao] == hanh_cung:
        return "Quan Quỷ"
    if KHAC[hanh_cung] == hanh_hao:
        return "Thê Tài"
    return ""


def _trang_thai(hanh: str, lenh: str) -> str:
    if hanh == lenh:
        return "vượng"
    if SINH[lenh] == hanh:
        return "tướng"
    if SINH[hanh] == lenh:
        return "hưu"
    if KHAC[hanh] == lenh:
        return "tù"
    if KHAC[lenh] == hanh:
        return "tử"
    return ""


def tuan_khong(can_idx: int, chi_idx: int) -> List[str]:
    dau = mod(chi_idx - can_idx, 12)
    return [DIA_CHI[mod(dau + 10, 12)], DIA_CHI[mod(dau + 11, 12)]]


def tru_thang(dd: int, mm: int, yyyy: int) -> Dict[str, str]:
    """Trụ tháng lúc 12 giờ trưa giờ Việt Nam theo kinh độ Mặt Trời (như LapBatTu)."""
    deg = am_lich.kinh_do_mat_troi(dd, mm, yyyy, 12.0, 7.0)
    nam = yyyy
    if mm <= 2 and deg < 315:
        nam = yyyy - 1
    can_nam = mod(nam - 4, 10)
    thu_tu = int(deg - 315 + 360) % 360 // 30
    chi = DIA_CHI[(thu_tu + 2) % 12]
    can = THIEN_CAN[(((can_nam % 5) * 2 + 2) % 10 + thu_tu) % 10]
    return {"can": can, "chi": chi, "label": can + " " + chi}


def najia_tho(g: Sequence[int], dd: int, mm: int, yyyy: int) -> Dict:
    kiem_gieo(g)
    chinh, bien, dong = hao_tu_gieo(g)
    so = so_que_tu_hao(chinh)
    so_bien = so_que_tu_hao(bien) if any(dong) else None
    cung = cung_cua(chinh)
    nhat = am_lich.day_can_chi(dd, mm, yyyy)
    can_ngay = THIEN_CAN.index(nhat["can"])
    khong = tuan_khong(can_ngay, DIA_CHI.index(nhat["chi"]))
    thang = tru_thang(dd, mm, yyyy)
    lenh = _hanh_cua_chi(thang["chi"])
    q_thuong, q_ha = _THUONG_HA[so]
    b_thuong, b_ha = _THUONG_HA[so_bien] if so_bien else (0, 0)
    khoi = KHOI_LUC_THU[can_ngay]
    lines = []
    for i in range(6):
        ngoai = i >= 3
        can, chi = _chi_cua_hao(q_thuong if ngoai else q_ha, i - 3 if ngoai else i, ngoai)
        hanh = _hanh_cua_chi(chi)
        lt = _luc_than(hanh, cung["hanhCung"])
        thu = LUC_THU[(khoi + i) % 6]
        tt = _trang_thai(hanh, lenh)
        changed = None
        if dong[i] and so_bien:
            _, bchi = _chi_cua_hao(b_thuong if ngoai else b_ha, i - 3 if ngoai else i, ngoai)
            bhanh = _hanh_cua_chi(bchi)
            blt = _luc_than(bhanh, cung["hanhCung"])
            changed = {"branch": bchi, "element": bhanh, "relation": blt,
                       "relationEn": LUC_THAN[blt][0], "relationZh": LUC_THAN[blt][1]}
        lines.append({
            "position": i + 1, "yang": chinh[i], "moving": dong[i], "stem": can, "branch": chi,
            "element": hanh, "relation": lt, "relationEn": LUC_THAN[lt][0], "relationZh": LUC_THAN[lt][1],
            "spirit": thu[0], "spiritEn": thu[1], "spiritZh": thu[2],
            "world": i + 1 == cung["the"], "response": i + 1 == cung["ung"],
            "void": chi in khong, "monthState": tt, "monthStateEn": TRANG_THAI[tt][0],
            "monthStateZh": TRANG_THAI[tt][1],
            "monthBreak": chi != nhat["chi"] and mod(DIA_CHI.index(chi) - DIA_CHI.index(thang["chi"]), 12) == 6,
            "changed": changed,
        })
    return {
        "number": so, "changed": so_bien, "day": nhat["label"], "month": thang["label"], "void": khong,
        "palace": cung["soQuaiCung"], "palaceElement": cung["hanhCung"], "generation": cung["viTri"],
        "world": cung["the"], "response": cung["ung"], "lines": lines,
    }


def _phut_dia_phuong(d: Dict[str, int], phut_trong_ngay: int) -> int:
    return am_lich.jd_from_date(d["day"], d["month"], d["year"]) * PHUT_MOI_NGAY - PHUT_MOI_NGAY // 2 + phut_trong_ngay


def _dong_chi_truoc(t: int, nam: int) -> Dict:
    dong_chi = am_lich.tiet_khi_theo_index(18)
    for n in (nam, nam - 1):
        m = am_lich.moc_tiet_khi(dong_chi, n)
        if _phut_dia_phuong(m["ngay"], m["gio"] * 60 + m["phut"]) <= t:
            return m
    return am_lich.moc_tiet_khi(dong_chi, nam - 2)


def que_ngay_tho(dd: int, mm: int, yyyy: int) -> Dict:
    """Quẻ trị ngày theo Quái khí (12 giờ trưa giờ Việt Nam), khoá theo ca kiểm."""
    trua = am_lich.jd_from_date(dd, mm, yyyy) * PHUT_MOI_NGAY
    dc = _dong_chi_truoc(trua, yyyy)
    da_qua = trua - _phut_dia_phuong(dc["ngay"], dc["gio"] * 60 + dc["phut"])
    dq = max(da_qua, 0)
    i_que = min(dq // PHUT_MOI_QUE, 59)
    i_ngay = min((dq - i_que * PHUT_MOI_QUE) // PHUT_MOI_NGAY, 6)
    du = da_qua - i_que * PHUT_MOI_QUE
    toi = min(du, PHUT_MOI_QUE - du)
    hao = min(i_ngay, 5) + 1
    tk = am_lich.tiet_khi_cua_ngay(dd, mm, yyyy)
    k = (tk["index"] - 18 + 24) % 24
    vai = VAI_TRO_QUAI_KHI[i_que % 5]

    change: Optional[Dict] = None
    dau = trua - PHUT_MOI_NGAY // 2
    cuoi = trua + PHUT_MOI_NGAY // 2
    dc2 = _dong_chi_truoc(cuoi - 1, yyyy)
    goc = _phut_dia_phuong(dc2["ngay"], dc2["gio"] * 60 + dc2["phut"])
    for j in range(60):
        b = goc + j * PHUT_MOI_QUE
        if b >= cuoi:
            break
        if b <= dau:
            continue
        truoc = 59 if j == 0 else j - 1
        phut = b - dau
        change = {
            "time": "%02d:%02d" % (phut // 60, phut % 60),
            "before": {"number": THU_TU_QUAI_KHI[truoc], "cycleIndex": truoc + 1},
            "after": {"number": THU_TU_QUAI_KHI[j], "cycleIndex": j + 1},
        }
        break
    n = dc["ngay"]
    return {
        "number": THU_TU_QUAI_KHI[i_que], "cycleIndex": i_que + 1, "dayInHexagram": i_ngay + 1,
        "rulingLine": hao, "role": vai[0], "roleEn": vai[1], "roleZh": vai[2],
        "solstice": {"date": "%04d-%02d-%02d" % (n["year"], n["month"], n["day"]),
                     "time": "%02d:%02d" % (dc["gio"], dc["phut"])},
        "minutesSinceSolstice": da_qua, "minutesToChange": toi,
        "nearChange": toi < NGUONG_SAT_GIAO_QUE_PHUT, "solarTerm": tk["index"],
        "cardinal": {"number": TU_CHINH[k // 6], "line": k % 6 + 1},
        "change": change, "model": MO_HINH_QUAI_KHI,
    }
