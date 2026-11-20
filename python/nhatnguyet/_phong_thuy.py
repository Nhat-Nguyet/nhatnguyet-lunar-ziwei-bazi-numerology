"""Lớp lõi chuyển ngữ của ``nhatnguyet.fengshui``: bản Python của các hàm phong
thuỷ trong lõi tính Go (coreengine: battrach.go, sonhuong.go, huyenkhong.go,
huyenkhong_van.go, loban.go, kinhdich.go), cùng thuật toán với
``js/packages/fengshui/src/core.ts``. Đối tượng trả về dùng ĐÚNG khoá của ca
kiểm ca-kiem/fengshui.json. Mô-đun riêng (gạch dưới): người dùng gọi lớp tiếng
Anh ``nhatnguyet.fengshui``. Mọi bảng chép từ Go; ca kiểm bắt chỗ chép sai.
"""

from typing import Any, Dict, List, Optional, Tuple

from . import am_lich
from ._thuoc_lo_ban import BANG_THUOC, TEN_CUNG_NHO

# ── Bát quái (kinhdich.go, AllBatQuai) ───────────────────────────────────

_BAT_QUAI = (
    ("Càn", "Qian", "乾", "☰", (True, True, True), "Trời", "Heaven", "Thiên", "Kim", "Metal", "Tây Bắc", "Northwest"),
    ("Đoài", "Dui", "兌", "☱", (True, True, False), "Đầm", "Lake", "Trạch", "Kim", "Metal", "Tây", "West"),
    ("Ly", "Li", "離", "☲", (True, False, True), "Lửa", "Fire", "Hỏa", "Hỏa", "Fire", "Nam", "South"),
    ("Chấn", "Zhen", "震", "☳", (True, False, False), "Sấm", "Thunder", "Lôi", "Mộc", "Wood", "Đông", "East"),
    ("Tốn", "Xun", "巽", "☴", (False, True, True), "Gió", "Wind", "Phong", "Mộc", "Wood", "Đông Nam", "Southeast"),
    ("Khảm", "Kan", "坎", "☵", (False, True, False), "Nước", "Water", "Thủy", "Thủy", "Water", "Bắc", "North"),
    ("Cấn", "Gen", "艮", "☶", (False, False, True), "Núi", "Mountain", "Sơn", "Thổ", "Earth", "Đông Bắc", "Northeast"),
    ("Khôn", "Kun", "坤", "☷", (False, False, False), "Đất", "Earth", "Địa", "Thổ", "Earth", "Tây Nam", "Southwest"),
)


def all_bat_quai() -> List[Dict[str, Any]]:
    """Tám quái theo thứ tự Tiên Thiên (AllBatQuai)."""
    return [{
        "so": i + 1, "ten": d[0], "tenEn": d[1], "tenHan": d[2], "kyHieu": d[3], "hao": list(d[4]),
        "tuong": d[5], "tuongEn": d[6], "tuongHan": d[7], "nguHanh": d[8], "nguHanhEn": d[9],
        "phuongVi": d[10], "phuongViEn": d[11],
    } for i, d in enumerate(_BAT_QUAI)]


def que_theo_ten(ten: str) -> Optional[Dict[str, Any]]:
    for q in all_bat_quai():
        if q["ten"] == ten:
            return q
    return None


# ── Bát Trạch (battrach.go) ──────────────────────────────────────────────

_NAM_THUONG_NGUYEN = 1864


def kua_number(nam_sinh: int, gioi_tinh: str) -> int:
    """Cung phi theo năm (âm lịch) và giới tính; 5 gửi 2 (nam), 8 (nữ)."""
    n = nam_sinh - _NAM_THUONG_NGUYEN
    if gioi_tinh == "Nữ":
        k = (n + 4) % 9 + 1
        return 8 if k == 5 else k
    k = (-n) % 9 + 1
    return 2 if k == 5 else k


def kua_group(kua: int) -> str:
    return "dong_tu_menh" if kua in (1, 3, 4, 9) else "tay_tu_menh"


KUA_QUE = {1: ("Khảm", "Kan"), 2: ("Khôn", "Kun"), 3: ("Chấn", "Zhen"), 4: ("Tốn", "Xun"),
           6: ("Càn", "Qian"), 7: ("Đoài", "Dui"), 8: ("Cấn", "Gen"), 9: ("Ly", "Li")}

SAO_BAT_TRACH = {
    "sinh_khi": ("Sinh Khí", "Sheng Qi", "生气", True),
    "thien_y": ("Thiên Y", "Tian Yi", "天医", True),
    "dien_nien": ("Diên Niên", "Yan Nian", "延年", True),
    "phuc_vi": ("Phục Vị", "Fu Wei", "伏位", True),
    "hoa_hai": ("Họa Hại", "Huo Hai", "祸害", False),
    "luc_sat": ("Lục Sát", "Liu Sha", "六煞", False),
    "ngu_quy": ("Ngũ Quỷ", "Wu Gui", "五鬼", False),
    "tuyet_menh": ("Tuyệt Mệnh", "Jue Ming", "绝命", False),
}
SAO_TOT = ("sinh_khi", "thien_y", "dien_nien", "phuc_vi")
SAO_XAU = ("hoa_hai", "luc_sat", "ngu_quy", "tuyet_menh")

BAT_TRACH = {
    1: {"sinh_khi": "Đông Nam", "thien_y": "Đông", "dien_nien": "Nam", "phuc_vi": "Bắc", "hoa_hai": "Tây", "luc_sat": "Tây Bắc", "ngu_quy": "Đông Bắc", "tuyet_menh": "Tây Nam"},
    2: {"sinh_khi": "Đông Bắc", "thien_y": "Tây", "dien_nien": "Tây Bắc", "phuc_vi": "Tây Nam", "hoa_hai": "Đông", "luc_sat": "Nam", "ngu_quy": "Đông Nam", "tuyet_menh": "Bắc"},
    3: {"sinh_khi": "Nam", "thien_y": "Bắc", "dien_nien": "Đông Nam", "phuc_vi": "Đông", "hoa_hai": "Tây Nam", "luc_sat": "Đông Bắc", "ngu_quy": "Tây Bắc", "tuyet_menh": "Tây"},
    4: {"sinh_khi": "Bắc", "thien_y": "Nam", "dien_nien": "Đông", "phuc_vi": "Đông Nam", "hoa_hai": "Tây Bắc", "luc_sat": "Tây", "ngu_quy": "Tây Nam", "tuyet_menh": "Đông Bắc"},
    6: {"sinh_khi": "Tây", "thien_y": "Đông Bắc", "dien_nien": "Tây Nam", "phuc_vi": "Tây Bắc", "hoa_hai": "Đông Nam", "luc_sat": "Bắc", "ngu_quy": "Đông", "tuyet_menh": "Nam"},
    7: {"sinh_khi": "Tây Bắc", "thien_y": "Tây Nam", "dien_nien": "Đông Bắc", "phuc_vi": "Tây", "hoa_hai": "Bắc", "luc_sat": "Đông Nam", "ngu_quy": "Nam", "tuyet_menh": "Đông"},
    8: {"sinh_khi": "Tây Nam", "thien_y": "Tây Bắc", "dien_nien": "Tây", "phuc_vi": "Đông Bắc", "hoa_hai": "Nam", "luc_sat": "Đông", "ngu_quy": "Bắc", "tuyet_menh": "Đông Nam"},
    9: {"sinh_khi": "Đông", "thien_y": "Đông Nam", "dien_nien": "Bắc", "phuc_vi": "Nam", "hoa_hai": "Đông Bắc", "luc_sat": "Tây Nam", "ngu_quy": "Tây", "tuyet_menh": "Tây Bắc"},
}

# Tám hướng theo vòng từ Bắc: tên Việt, Anh, chữ Hán; quái Hậu Thiên của hướng.
TAM_HUONG = (
    ("Bắc", "North", "北", "Khảm"),
    ("Đông Bắc", "Northeast", "东北", "Cấn"),
    ("Đông", "East", "东", "Chấn"),
    ("Đông Nam", "Southeast", "东南", "Tốn"),
    ("Nam", "South", "南", "Ly"),
    ("Tây Nam", "Southwest", "西南", "Khôn"),
    ("Tây", "West", "西", "Đoài"),
    ("Tây Bắc", "Northwest", "西北", "Càn"),
)


def _huong_dong(vi: str) -> Tuple[str, str, str, str]:
    for h in TAM_HUONG:
        if h[0] == vi:
            return h
    raise ValueError("hướng lạ: " + vi)


def bat_trach_theo_kua(kua: int) -> Dict[str, Any]:
    """Tám du niên của một Kua (phần bảng của XemHuongNhaDat)."""
    if kua not in KUA_QUE:
        raise ValueError("Kua phải là 1 tới 9, trừ 5")
    bang = BAT_TRACH[kua]

    def dung(thu_tu):
        ra = []
        for s in thu_tu:
            h = _huong_dong(bang[s])
            t = SAO_BAT_TRACH[s]
            ra.append({"huong": h[0], "huongEn": h[1], "huongZh": h[2], "sao": s,
                       "tenSao": t[0], "tenSaoEn": t[1], "tenSaoZh": t[2]})
        return ra
    q = KUA_QUE[kua]
    return {"kua": kua, "que": q[0], "queEn": q[1], "nhomMenh": kua_group(kua),
            "huongTot": dung(SAO_TOT), "huongXau": dung(SAO_XAU)}


def xem_huong_nha_dat(nam_sinh: int, gioi_tinh: str) -> Dict[str, Any]:
    return bat_trach_theo_kua(kua_number(nam_sinh, gioi_tinh))


def all_trach_bat_trach() -> List[Dict[str, Any]]:
    ra = []
    for kua in (1, 2, 3, 4, 6, 7, 8, 9):
        q = KUA_QUE[kua]
        tay = kua_group(kua) == "tay_tu_menh"

        def dong(s, kua=kua):
            return {"sao": SAO_BAT_TRACH[s][0], "saoEn": SAO_BAT_TRACH[s][1],
                    "huong": BAT_TRACH[kua][s], "huongEn": _huong_dong(BAT_TRACH[kua][s])[1]}
        ra.append({"kua": kua, "que": q[0], "queEn": q[1],
                   "nhom": "Tây Tứ Mệnh" if tay else "Đông Tứ Mệnh", "nhomEn": "West Group" if tay else "East Group",
                   "huongTot": [dong(s) for s in SAO_TOT], "huongXau": [dong(s) for s in SAO_XAU]})
    return ra


# ── 24 sơn (sonhuong.go) ─────────────────────────────────────────────────

TEN_SON = (
    "Tý", "Quý", "Sửu", "Cấn", "Dần", "Giáp",
    "Mão", "Ất", "Thìn", "Tốn", "Tỵ", "Bính",
    "Ngọ", "Đinh", "Mùi", "Khôn", "Thân", "Canh",
    "Dậu", "Tân", "Tuất", "Càn", "Hợi", "Nhâm",
)
NGUYEN_LONG = ("Địa", "Thiên", "Nhân")


def chuan_hoa_do(d: float) -> float:
    while d < 0:
        d += 360
    while d >= 360:
        d -= 360
    return d


def _loai_son(ten: str) -> str:
    if ten in am_lich.THIEN_CAN:
        return "Thiên Can"
    if ten in am_lich.DIA_CHI:
        return "Địa Chi"
    return "Quái"


def all_son_huong() -> List[Dict[str, Any]]:
    """AllSonHuong (bản mới mỗi lần gọi)."""
    ra = []
    for i, ten in enumerate(TEN_SON):
        vi_tri = (i + 1) % 24
        nhom = vi_tri // 3
        ra.append({"so": i + 1, "ten": ten, "loai": _loai_son(ten), "huong": TAM_HUONG[nhom][0],
                   "quai": TAM_HUONG[nhom][3], "tuDo": chuan_hoa_do(i * 15 - 7.5),
                   "denDo": chuan_hoa_do(i * 15 + 7.5), "nguyenLong": NGUYEN_LONG[vi_tri % 3]})
    return ra


def son_huong_theo_do(do: float) -> Dict[str, Any]:
    d = chuan_hoa_do(do)
    idx = int(chuan_hoa_do(d + 7.5) / 15) % 24
    return all_son_huong()[idx]


# ── Huyền Không (huyenkhong.go, huyenkhong_van.go) ───────────────────────

SO_NHA_QUAI = {"Khảm": 1, "Khôn": 2, "Chấn": 3, "Tốn": 4, "Càn": 6, "Đoài": 7, "Cấn": 8, "Ly": 9}
_DUONG_BAY = (5, 6, 7, 8, 9, 1, 2, 3, 4)


def la_duong_hk(so: int, pos: int) -> bool:
    """Âm dương phái Huyền Không phi tinh (Thẩm thị)."""
    if so in (1, 3, 7, 9):
        return pos == 0
    return pos != 0


def vi_tri_nguyen_long(nl: str) -> int:
    return NGUYEN_LONG.index(nl) if nl in NGUYEN_LONG else 0


def bay(s: int, thuan: bool) -> List[int]:
    ra = [0] * 10
    for k, cung in enumerate(_DUONG_BAY):
        d = k if thuan else -k
        ra[cung] = (s - 1 + d) % 9 + 1
    return ra


CACH_HK = ("Vượng sơn vượng hướng", "Thượng sơn hạ thủy", "Song tinh đáo hướng", "Song tinh đáo tọa")


def lap_tinh_ban_hk(van: int, toa: str) -> Dict[str, Any]:
    """LapTinhBanHK; ValueError khi vận ngoài 1..9 hay không có sơn toạ."""
    if not isinstance(van, int) or isinstance(van, bool) or not 1 <= van <= 9:
        raise ValueError("vận phải từ 1 tới 9")
    ds = all_son_huong()
    i = next((k for k, s in enumerate(ds) if s["ten"] == toa), -1)
    if i < 0:
        raise ValueError("không có sơn %r" % (toa,))
    s_toa, s_huong = ds[i], ds[(i + 12) % 24]
    cung_toa, cung_huong = SO_NHA_QUAI[s_toa["quai"]], SO_NHA_QUAI[s_huong["quai"]]
    van_ban = bay(van, True)

    def chieu(sao, son):
        pos = vi_tri_nguyen_long(son["nguyenLong"])
        return la_duong_hk(SO_NHA_QUAI[son["quai"]], pos) if sao == 5 else la_duong_hk(sao, pos)
    st, ht = van_ban[cung_toa], van_ban[cung_huong]
    son_tinh = bay(st, chieu(st, s_toa))
    huong_tinh = bay(ht, chieu(ht, s_huong))
    son_o, huong_o = 0, 0
    for c in range(1, 10):
        if c == 5:
            continue
        if son_tinh[c] == van:
            son_o = c
        if huong_tinh[c] == van:
            huong_o = c
    cach = ""
    if son_o == cung_toa and huong_o == cung_huong:
        cach = CACH_HK[0]
    elif son_o == cung_huong and huong_o == cung_toa:
        cach = CACH_HK[1]
    elif son_o == cung_huong and huong_o == cung_huong:
        cach = CACH_HK[2]
    elif son_o == cung_toa and huong_o == cung_toa:
        cach = CACH_HK[3]
    return {"van": van, "toa": s_toa["ten"], "huong": s_huong["ten"], "vanBan": van_ban, "sonTinh": son_tinh,
            "huongTinh": huong_tinh, "cungToa": cung_toa, "cungHuong": cung_huong, "cach": cach}


KHI = ("Vượng khí", "Sinh khí", "Thoái khí", "Sát khí", "Tử khí")


def khi_cua_sao(van: int, sao: int) -> str:
    r = (sao - van) % 9
    if r == 0:
        return KHI[0]
    if r in (1, 2):
        return KHI[1]
    if r == 8:
        return KHI[2]
    if r in (5, 6, 7):
        return KHI[3]
    return KHI[4]


_VONG_TAM_PHUONG = (1, 8, 3, 4, 9, 2, 7, 6)


def _cung_ke(c: int) -> Tuple[int, int]:
    if c not in _VONG_TAM_PHUONG:
        return 0, 0
    i = _VONG_TAM_PHUONG.index(c)
    return _VONG_TAM_PHUONG[(i + 7) % 8], _VONG_TAM_PHUONG[(i + 1) % 8]


def _hop_ha_do(a: int, b: int) -> bool:
    return a % 5 == b % 5 and a != b


def thanh_mon(van: int, toa: str) -> Dict[str, Any]:
    tb = lap_tinh_ban_hk(van, toa)
    s_huong = next(s for s in all_son_huong() if s["ten"] == tb["huong"])
    pos = vi_tri_nguyen_long(s_huong["nguyenLong"])
    a, b = _cung_ke(tb["cungHuong"])
    if _hop_ha_do(b, tb["cungHuong"]):
        a, b = b, a
    cung = []
    for i, c in enumerate((a, b)):
        so = tb["vanBan"][c]
        quai = c if so == 5 else so
        thuan = la_duong_hk(quai, pos)
        den = bay(so, thuan)[c]
        cung.append({"cung": c, "laChinh": i == 0 and _hop_ha_do(c, tb["cungHuong"]), "soVanBan": so,
                     "thuan": thuan, "saoDen": den, "dungDuoc": den == van})
    return {"van": van, "toa": tb["toa"], "huong": tb["huong"], "cung": cung}


TEN_CUU_TINH = ("", "Nhất Bạch", "Nhị Hắc", "Tam Bích", "Tứ Lục", "Ngũ Hoàng", "Lục Bạch", "Thất Xích", "Bát Bạch", "Cửu Tử")
HANH_CUU_TINH = ("", "Thủy", "Thổ", "Mộc", "Mộc", "Thổ", "Kim", "Kim", "Thổ", "Hỏa")
CUNG_LAC_THU = (("", ""), ("Khảm", "Bắc"), ("Khôn", "Tây Nam"), ("Chấn", "Đông"), ("Tốn", "Đông Nam"),
                ("", "Trung cung"), ("Càn", "Tây Bắc"), ("Đoài", "Tây"), ("Cấn", "Đông Bắc"), ("Ly", "Nam"))
_TAM_NGUYEN = (("Thượng nguyên", "Upper Era", "上元"), ("Trung nguyên", "Middle Era", "中元"),
               ("Hạ nguyên", "Lower Era", "下元"))


def chin_van(nam: int) -> List[Dict[str, Any]]:
    goc = _NAM_THUONG_NGUYEN + 180 * ((nam - _NAM_THUONG_NGUYEN) // 180)
    ra = []
    for so in range(1, 10):
        ng = _TAM_NGUYEN[(so - 1) // 3]
        ra.append({"so": so, "nguyen": ng[0], "nguyenEn": ng[1], "nguyenZh": ng[2],
                   "tuNam": goc + 20 * (so - 1), "denNam": goc + 20 * so - 1,
                   "sao": TEN_CUU_TINH[so], "hanhSao": HANH_CUU_TINH[so],
                   "chinhThan": 0 if so == 5 else so, "linhThan": 0 if so == 5 else 10 - so})
    return ra


def van_cua_nam(nam: int) -> Dict[str, Any]:
    return chin_van(nam)[((nam - _NAM_THUONG_NGUYEN) % 180) // 20]


def sao_nhap_trung_nam(nam: int) -> int:
    s = (1 - (nam - 2026)) % 9
    return 9 if s == 0 else s


def phi_tinh_nam(nam: int) -> Dict[str, Any]:
    s = sao_nhap_trung_nam(nam)
    return {"nam": nam, "saoTrung": s, "sao": bay(s, True)}


# ── Thước Lỗ Ban (loban.go) ──────────────────────────────────────────────

def bang_thuoc(loai: str) -> Optional[Dict[str, Any]]:
    for b in BANG_THUOC:
        if b["loai"] == loai:
            return b
    return None


def mod64(a: float, m: float) -> float:
    r = a - m * int(a / m)
    if r < 0:
        r += m
    return r


def lam_tron1(v: float) -> float:
    return int(v * 10 + 0.5) / 10


def _lam_tron2(v: float) -> float:
    return int(v * 100 + 0.5) / 100


def cung_tai_vi_tri(b: Dict[str, Any], vi_tri: float) -> Tuple[int, int]:
    """Chỉ số cung lớn, chỉ số cung nhỏ (-1 khi thước không có cung nhỏ)."""
    n = len(b["cung"])
    dai = b["doDaiMm"] / n
    idx = int(vi_tri / dai)
    if idx >= n:
        idx = n - 1
    nho = b["cung"][idx][8]
    if not nho:
        return idx, -1
    dai_nho = dai / len(nho)
    j = int((vi_tri - idx * dai) / dai_nho)
    if j >= len(nho):
        j = len(nho) - 1
    return idx, j


def _dep(b, mm, lech):
    idx, j = cung_tai_vi_tri(b, mod64(mm, b["doDaiMm"]))
    c = b["cung"][idx]
    k = {"mm": mm, "cm": lam_tron1(mm / 10), "cung": c[0], "cungEn": c[2], "cungZh": c[3]}
    if j >= 0:
        k["cungNho"] = c[8][j]
        k["cungNhoZh"] = c[9][j]
    if lech is not None:
        k["lechMm"] = lech
    return k


def _gan_nhat_tot(goc, b):
    ra = []
    chu_ky = int(b["doDaiMm"]) + 1
    for d in range(1, chu_ky + 1):
        mm = goc - d
        if mm <= 0:
            break
        if b["cung"][cung_tai_vi_tri(b, mod64(mm, b["doDaiMm"]))[0]][4]:
            ra.append(_dep(b, mm, -d))
            break
    for d in range(1, chu_ky + 1):
        mm = goc + d
        if b["cung"][cung_tai_vi_tri(b, mod64(mm, b["doDaiMm"]))[0]][4]:
            ra.append(_dep(b, mm, d))
            break
    return ra


def tra_lo_ban(kich_thuoc_mm: float, loai: str) -> Dict[str, Any]:
    """TraLoBan: tra một kích thước (mm) trên một thước."""
    b = bang_thuoc(loai)
    kq: Dict[str, Any] = {
        "kichThuocMm": kich_thuoc_mm, "loaiThuoc": loai, "tenThuoc": "", "tenThuocEn": "", "tenThuocZh": "",
        "dungDe": "", "dungDeEn": "", "dungDeZh": "", "chuKyThu": 0, "viTriMm": 0, "cung": "", "cungEn": "",
        "cungZh": "", "cungHan": "", "tot": False, "nghia": "", "nghiaEn": "", "nghiaZh": "",
    }
    if b is None or not kich_thuoc_mm > 0:
        return kq
    vi_tri = mod64(kich_thuoc_mm, b["doDaiMm"])
    idx, j = cung_tai_vi_tri(b, vi_tri)
    c = b["cung"][idx]
    kq.update({
        "tenThuoc": b["ten"], "tenThuocEn": b["tenEn"], "tenThuocZh": b["tenZh"], "dungDe": b["dungDe"],
        "dungDeEn": b["dungDeEn"], "dungDeZh": b["dungDeZh"], "chuKyThu": int(kich_thuoc_mm / b["doDaiMm"]) + 1,
        "viTriMm": lam_tron1(vi_tri), "cung": c[0], "cungEn": c[2], "cungZh": c[3], "cungHan": c[1], "tot": c[4],
        "nghia": c[5], "nghiaEn": c[6], "nghiaZh": c[7],
    })
    if j >= 0:
        kq["cungNho"] = c[8][j]
        kq["cungNhoZh"] = c[9][j]
    if not c[4]:
        g = _gan_nhat_tot(kich_thuoc_mm, b)
        if g:
            kq["ganNhatTot"] = g
    return kq


def cac_loai_thuoc() -> List[Dict[str, Any]]:
    ra = []
    for b in BANG_THUOC:
        cung = []
        for c in b["cung"]:
            m = {"ten": c[0], "tenEn": c[2], "tenZh": c[3], "tenHan": c[1], "tot": c[4], "nghia": c[5],
                 "nghiaEn": c[6], "nghiaZh": c[7], "cungNho": list(c[8])}
            if c[8]:
                m["cungNhoZh"] = list(c[9])
            cung.append(m)
        ra.append({"loai": b["loai"], "ten": b["ten"], "tenEn": b["tenEn"], "tenZh": b["tenZh"],
                   "doDaiMm": b["doDaiMm"], "dungDe": b["dungDe"], "dungDeEn": b["dungDeEn"],
                   "dungDeZh": b["dungDeZh"], "soCung": len(b["cung"]),
                   "daiMoiCungMm": _lam_tron2(b["doDaiMm"] / len(b["cung"])), "cung": cung})
    return ra


def cac_ten_cung_nho() -> List[Dict[str, str]]:
    """CacTenCungNho: tên ba thứ tiếng của mọi cung nhỏ, theo thứ tự xuất hiện
    trên ba thước, mỗi tên một lần."""
    ra = []
    da_co = set()
    for b in BANG_THUOC:
        for c in b["cung"]:
            for j, n in enumerate(c[8]):
                if n in da_co:
                    continue
                da_co.add(n)
                t = TEN_CUNG_NHO.get(n)
                if t is None:
                    raise ValueError("missing sub-sector name: " + n)
                ra.append({"ten": n, "binhAm": t[0], "tenEn": t[1], "tenZh": c[9][j]})
    return ra


# ── Ca kiểm ──────────────────────────────────────────────────────────────

def tinh_ca_kiem(vao: Dict[str, Any]) -> Any:
    """Đáp án của một ca ca-kiem/fengshui.json (cùng phép với ca-kiem.ts)."""
    p = vao["phep"]
    if p == "cung-phi":
        gt = vao["gioiTinh"]
        if gt not in ("Nam", "Nữ"):
            return {"loi": True}
        nam_am = am_lich.solar_to_lunar(vao["dd"], vao["mm"], vao["yyyy"], 7.0)["year"]
        return {"namAm": nam_am, "ketQua": xem_huong_nha_dat(nam_am, gt)}
    if p == "bat-quai":
        return all_bat_quai()
    if p == "son":
        return all_son_huong()
    if p == "son-theo-do":
        return son_huong_theo_do(vao["do"])
    if p == "trach":
        son = next((s for s in all_son_huong() if s["ten"] == vao["toa"]), None)
        trach = next((d for d in all_trach_bat_trach() if son and d["que"] == son["quai"]), None)
        return {"son": son, "trach": trach}
    if p == "tinh-ban":
        try:
            tb = lap_tinh_ban_hk(vao["van"], vao["toa"])
        except ValueError:
            return {"loi": True}
        return {"tinhBan": tb, "thanhMon": thanh_mon(vao["van"], vao["toa"]),
                "khi": [""] + [khi_cua_sao(vao["van"], s) for s in range(1, 10)]}
    if p == "van":
        return van_cua_nam(vao["nam"])
    if p == "chin-van":
        return chin_van(vao["nam"])
    if p == "phi-tinh-nam":
        return phi_tinh_nam(vao["nam"])
    if p == "cac-loai-thuoc":
        return cac_loai_thuoc()
    if p == "ten-cung-nho":
        return cac_ten_cung_nho()
    if p == "lo-ban":
        return tra_lo_ban(vao["kichThuocMm"], vao["loaiThuoc"])
    raise ValueError("unknown phep %r" % (p,))
