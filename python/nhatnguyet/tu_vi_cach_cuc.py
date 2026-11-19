"""Nhận diện cách cục Tử Vi trên lá số gốc.

Bản chuyển ngữ của lõi Go (coreengine: tuvi_cachcuc.go,
tuvi_cachcuc_toan_thu.go). Hai phần:

- Bộ cách cục mà mọi sách chép giống nhau về điều kiện: ba bộ chính tinh
  theo sao toạ Mệnh, Tử Phủ đồng cung, Nhật Nguyệt tịnh minh, Mệnh vô chính
  diệu, Xương Khúc giáp Mệnh, các cặp đồng hội.
- Cách cục theo bốn bảng cuối quyển 1 của Tử Vi Đẩu Số toàn thư (định phú,
  định quý, định bần tiện), mỗi cách mang nhóm và chú văn nguyên văn chữ Hán
  giản thể của sách.

Mỗi cách chỉ nêu DỮ KIỆN (sao nào, điều kiện gì), đủ ba thứ tiếng; không
đoán vận mệnh. Chữ chép đúng từ lõi Go.
"""

from __future__ import annotations

from typing import Dict, List, Set, Tuple

from .am_lich import DIA_CHI, mod
from .tu_vi_du_lieu import CHINH_TINH_DIGNITY, CHINH_TINH_NAME_ZH
from .tu_vi_han import ten_cung_tai_vi_tri, vi_tri_sao
from .tu_vi_lap_so import vi_tri_cung_thu_k

# Ba thứ tiếng: (Việt, Anh, Trung).
Ba = Tuple[str, str, str]

NHOM_DINH_PHU = "dinh-phu"
NHOM_DINH_QUY = "dinh-quy"
NHOM_DINH_BAN_TIEN = "dinh-ban-tien"

# ---------------------------------------------------------------------------
# Tra trên lá số
# ---------------------------------------------------------------------------


def _sao_tai_vi_tri(la_so: Dict, pos: int) -> Set[str]:
    """Tập tên sao ở một cung."""
    return {s["ten"] for s in la_so["cung"][mod(pos, 12)]["sao"]}


def _chinh_tinh_tai_vi_tri(la_so: Dict, pos: int) -> List[str]:
    """Chính tinh ở một cung, theo thứ tự đã an."""
    return [s["ten"] for s in la_so["cung"][mod(pos, 12)]["sao"] if s["loai"] == "chinh-tinh"]


def _sao_tam_phuong_tu_chinh(la_so: Dict, pos: int) -> Set[str]:
    """Sao của cung, cung xung chiếu (+6) và hai cung tam hợp (+4, +8)."""
    out: Set[str] = set()
    for d in (0, 4, 6, 8):
        out |= _sao_tai_vi_tri(la_so, pos + d)
    return out


def _co_du(tap: Set[str], *can: str) -> bool:
    return all(c in tap for c in can)


def _cach_cuc_ba(ten: str, ten_zh: str, ten_han: str, dieu_kien: Ba, mo_ta: Ba) -> Dict:
    return {
        "ten": ten, "tenZh": ten_zh, "tenHan": ten_han,
        "dieuKien": dieu_kien[0], "dieuKienEn": dieu_kien[1], "dieuKienZh": dieu_kien[2],
        "moTa": mo_ta[0], "moTaEn": mo_ta[1], "moTaZh": mo_ta[2],
        "viTri": -1, "tenCung": "", "chiCung": "", "coDiBan": False, "nhom": "", "chuVan": "",
    }


def _xuat(c: Dict) -> Dict:
    """Bỏ các trường rỗng mà lõi Go đánh dấu omitempty."""
    return {k: v for k, v in c.items()
            if not (k in ("tenZh", "tenHan", "tenCung", "chiCung", "nhom", "chuVan") and v == "")
            and not (k == "coDiBan" and v is False)}


def _sao_zh(s: str) -> str:
    return CHINH_TINH_NAME_ZH.get(s, s)


# ---------------------------------------------------------------------------
# Bộ cách cục chung (tuvi_cachcuc.go)
# ---------------------------------------------------------------------------

_MO_TA_SAT_PHA_LANG: Ba = (
    "Bộ ba sao biến động. Ba sao luôn cách nhau đúng bốn cung nên khi một sao toạ Mệnh thì hai sao kia luôn nằm trong tam phương.",
    "The trio of change. The three stars always sit exactly four palaces apart, so when one occupies Mệnh the other two are always in its triangle of influence.",
    "主变动的三星组合。三星永远相隔四宫，所以一星坐命时，另两星必在三方之内。",
)
_MO_TA_CO_NGUYET: Ba = (
    "Bộ sao ôn hoà, sách thường gắn với nếp làm việc có quy củ và ổn định.",
    "A gentle group of stars, which the texts usually link to orderly, steady ways of working.",
    "性质温和的星组，古书多将其与有章法、安稳的做事方式相连。",
)
_MO_TA_TU_PHU: Ba = (
    "Bộ sao chủ về tổ chức và quản trị theo cách gọi của sách. Lá số xếp cả Liêm Trinh, Thái Dương và Cự Môn vào nhóm này để mỗi sao toạ Mệnh thuộc đúng một bộ; Tân Biên xếp Liêm Trinh vào bộ Sát Phá Liêm Tham và tách Cự Môn, Thái Dương thành bộ Cự Nhật.",
    "In the texts' terms, the group that governs organising and managing. The chart also puts Liêm Trinh, Thái Dương and Cự Môn here so that every star in Mệnh belongs to exactly one group; Tân Biên puts Liêm Trinh with Sát Phá Liêm Tham and splits Cự Môn and Thái Dương off as the Cự Nhật pair.",
    "按古书说法，此星组主组织与管理。本命盘把廉贞、太阳、巨门也归入此组，使坐命之星各属一组；《紫微斗数新编》则把廉贞归入杀破廉贪，另立巨门、太阳为巨日一组。",
)

# Thứ tự ưu tiên cố định của ba bộ, kèm (tên, chữ Hán giản thể, phồn thể, mô tả).
_UU_TIEN_BO = (
    (("Thất Sát", "Phá Quân", "Tham Lang"), ("Sát Phá Lang", "杀破狼", "殺破狼", _MO_TA_SAT_PHA_LANG)),
    (("Thiên Cơ", "Thái Âm", "Thiên Đồng", "Thiên Lương"), ("Cơ Nguyệt Đồng Lương", "机月同梁", "機月同梁", _MO_TA_CO_NGUYET)),
    (("Tử Vi", "Thiên Phủ", "Vũ Khúc", "Thiên Tướng", "Liêm Trinh", "Thái Dương", "Cự Môn"),
     ("Tử Phủ Vũ Tướng", "紫府武相", "紫府武相", _MO_TA_TU_PHU)),
)


def nhan_dien_cach_cuc(la_so: Dict) -> List[Dict]:
    """Rà lá số và trả các cách cục nhận ra được (dict khoá camelCase)."""
    out: List[Dict] = []
    menh = la_so["cungMenh"]
    ten_menh = ten_cung_tai_vi_tri(la_so, menh)
    chi_menh = DIA_CHI[mod(menh, 12)]

    tai_menh = _sao_tai_vi_tri(la_so, menh)
    hoi_menh = _sao_tam_phuong_tu_chinh(la_so, menh)

    def them(c: Dict) -> None:
        c["viTri"], c["tenCung"], c["chiCung"] = menh, ten_menh, chi_menh
        out.append(c)

    # --- Ba bộ chính tinh, xét sao toạ thủ tại Mệnh (Mệnh trống thì cung xung chiếu) ---
    nguon, giai_tiep = menh, False
    if not _chinh_tinh_tai_vi_tri(la_so, menh):
        nguon, giai_tiep = menh + 6, True
    tai_nguon = set(_chinh_tinh_tai_vi_tri(la_so, nguon))
    xong = False
    for nhom, (ten, zh, han, mo_ta) in _UU_TIEN_BO:
        for s in nhom:
            if s not in tai_nguon:
                continue
            if giai_tiep:
                dk = (
                    "Cung Mệnh vô chính diệu, lấy theo " + s + " ở cung xung chiếu",
                    "The Mệnh palace has no major star, so it is read from " + s + " in the opposite palace",
                    "命宫无正曜，借对宫的" + _sao_zh(s) + "论",
                )
            else:
                dk = (
                    "Sao " + s + " toạ thủ tại cung Mệnh",
                    s + " sits in the Mệnh palace",
                    _sao_zh(s) + "坐守命宫",
                )
            them(_cach_cuc_ba(ten, zh, han, dk, mo_ta))
            xong = True
            break
        if xong:
            break

    # --- Tử Phủ đồng cung ---
    if _co_du(tai_menh, "Tử Vi", "Thiên Phủ"):
        them(_cach_cuc_ba("Tử Phủ đồng cung", "紫府同宫", "紫府同宮", (
            "Tử Vi và Thiên Phủ cùng toạ thủ tại cung Mệnh (chỉ xảy ra ở Dần hoặc Thân)",
            "Tử Vi and Thiên Phủ both sit in the Mệnh palace (possible only at Dần or Thân)",
            "紫微、天府同坐命宫（只出现在寅或申）",
        ), (
            "Hai sao đứng đầu hai chùm chính tinh cùng nằm một cung.",
            "The two stars that head the two clusters of major stars share one palace.",
            "两组正曜的首星同居一宫。",
        )))

    # --- Nhật Nguyệt tịnh minh: chỉ ở vị trí sách định ---
    pos_nhat, pos_nguyet = vi_tri_sao(la_so, "Thái Dương"), vi_tri_sao(la_so, "Thái Âm")
    sang_nhat = pos_nhat >= 0 and CHINH_TINH_DIGNITY["Thái Dương"][pos_nhat] != "H"
    sang_nguyet = pos_nguyet >= 0 and CHINH_TINH_DIGNITY["Thái Âm"][pos_nguyet] != "H"
    if sang_nhat and sang_nguyet:
        for kc_pos, cung in ((menh, ("Mệnh", "Mệnh", "命宫")), (menh + 4, ("Quan Lộc", "Quan Lộc", "官禄宫"))):
            p = mod(kc_pos, 12)
            if p == 1 and pos_nhat == 5 and pos_nguyet == 9:
                dk = (
                    "Cung " + cung[0] + " an tại Sửu, Thái Dương ở Tỵ và Thái Âm ở Dậu hợp chiếu, cả hai đều sáng",
                    "The " + cung[1] + " palace sits at Sửu, with Thái Dương at Tỵ and Thái Âm at Dậu shining on it from the triangle, both bright",
                    cung[2] + "在丑，太阳在巳、太阴在酉合照，二曜皆明",
                )
            elif p == 7 and pos_nhat == 3 and pos_nguyet == 11:
                dk = (
                    "Cung " + cung[0] + " an tại Mùi, Thái Dương ở Mão và Thái Âm ở Hợi hợp chiếu, cả hai đều sáng",
                    "The " + cung[1] + " palace sits at Mùi, with Thái Dương at Mão and Thái Âm at Hợi shining on it from the triangle, both bright",
                    cung[2] + "在未，太阳在卯、太阴在亥合照，二曜皆明",
                )
            else:
                continue
            c = _cach_cuc_ba("Nhật Nguyệt tịnh minh", "日月并明", "日月並明", dk, (
                "Hai sao mặt trời và mặt trăng cùng ở chỗ sáng và cùng chiếu về một cung.",
                "The sun and moon stars both sit in bright positions and shine on the same palace.",
                "日月二星同处明亮之位，同照一宫。",
            ))
            c["coDiBan"] = True
            c["viTri"], c["tenCung"], c["chiCung"] = p, ten_cung_tai_vi_tri(la_so, p), DIA_CHI[p]
            out.append(c)
            break

    # --- Mệnh vô chính diệu ---
    if not _chinh_tinh_tai_vi_tri(la_so, menh):
        them(_cach_cuc_ba("Mệnh vô chính diệu", "命无正曜", "命無正曜", (
            "Cung Mệnh không có chính tinh nào toạ thủ",
            "No major star sits in the Mệnh palace",
            "命宫无正曜坐守",
        ), (
            "Luận theo sao ở cung xung chiếu, lối gọi trong sách là tá tinh an cung.",
            "Read from the stars in the opposite palace, which the texts call borrowing stars to settle the palace.",
            "以对宫之星论断，古书称为借星安宫。",
        )))

    # --- Xương Khúc giáp Mệnh (kẹp hai cung kề) và đồng hội (tam phương) ---
    truoc, sau = _sao_tai_vi_tri(la_so, menh - 1), _sao_tai_vi_tri(la_so, menh + 1)
    if ("Văn Xương" in truoc and "Văn Khúc" in sau) or ("Văn Khúc" in truoc and "Văn Xương" in sau):
        them(_cach_cuc_ba("Xương Khúc giáp Mệnh", "昌曲夹命", "昌曲夾命", (
            "Văn Xương và Văn Khúc ở hai cung kề hai bên cung Mệnh",
            "Văn Xương and Văn Khúc sit in the two palaces on either side of the Mệnh palace",
            "文昌、文曲分居命宫左右两邻宫",
        ), (
            "Cặp sao văn chương kẹp cung Mệnh, sách gắn với học vấn và thi cử.",
            "The pair of literary stars flanks the Mệnh palace, which the texts link to learning and examinations.",
            "文星之对夹命宫，古书将其与学问、考试相连。",
        )))
    if _co_du(hoi_menh, "Văn Xương", "Văn Khúc"):
        c = _cach_cuc_ba("Xương Khúc đồng hội", "昌曲同会", "昌曲同會", (
            "Văn Xương và Văn Khúc cùng hội về tam phương tứ chính của cung Mệnh",
            "Văn Xương and Văn Khúc both gather in the triangle and opposite of the Mệnh palace",
            "文昌、文曲同会于命宫的三方四正",
        ), (
            "Cặp sao văn chương, sách gắn với học vấn và thi cử.",
            "The pair of literary stars, which the texts link to learning and examinations.",
            "文星之对，古书将其与学问、考试相连。",
        ))
        c["coDiBan"] = True
        them(c)
    if _co_du(hoi_menh, "Tả Phù", "Hữu Bật"):
        them(_cach_cuc_ba("Tả Hữu đồng hội", "左右", "左右", (
            "Tả Phù và Hữu Bật cùng hội về tam phương tứ chính của cung Mệnh",
            "Tả Phù and Hữu Bật both gather in the triangle and opposite of the Mệnh palace",
            "左辅、右弼同会于命宫的三方四正",
        ), (
            "Cặp sao phụ trợ, sách gắn với việc được người khác giúp đỡ.",
            "The pair of assisting stars, which the texts link to receiving help from others.",
            "辅佐之星对，古书将其与得人相助相连。",
        )))
    if _co_du(hoi_menh, "Địa Không", "Địa Kiếp"):
        them(_cach_cuc_ba("Không Kiếp đồng hội", "空劫", "空劫", (
            "Địa Không và Địa Kiếp cùng hội về tam phương tứ chính của cung Mệnh",
            "Địa Không and Địa Kiếp both gather in the triangle and opposite of the Mệnh palace",
            "地空、地劫同会于命宫的三方四正",
        ), (
            "Cặp sao hao tán. Sách xem đây là cách cục cần lưu ý chứ không phải điềm dữ tất định.",
            "The pair of dispersing stars. The texts treat this as a pattern to watch, not a certain ill omen.",
            "耗散之星对。古书视之为需留意的格局，而非必然的凶兆。",
        )))

    out.extend(_cach_cuc_toan_thu(la_so))
    return [_xuat(c) for c in out]


def tom_tat_cach_cuc(cs: List[Dict]) -> str:
    """Một dòng liệt kê tên các cách cục."""
    return ", ".join(c["ten"] for c in cs)


# ---------------------------------------------------------------------------
# Bốn bảng của Tử Vi Đẩu Số toàn thư (tuvi_cachcuc_toan_thu.go)
# ---------------------------------------------------------------------------

_MO_TA_NHOM: Dict[str, Ba] = {
    NHOM_DINH_PHU: (
        "Tử Vi Đẩu Số toàn thư xếp cách này vào bảng định phú cục, nhóm cách sách gắn với của cải.",
        "The Tử Vi Đẩu Số Toàn Thư lists this pattern in its table of wealth patterns, which the book links to material means.",
        "《紫微斗数全书》将此格列入定富局，书中将其与财富相连。",
    ),
    NHOM_DINH_QUY: (
        "Tử Vi Đẩu Số toàn thư xếp cách này vào bảng định quý cục, nhóm cách sách gắn với địa vị và danh tiếng.",
        "The Tử Vi Đẩu Số Toàn Thư lists this pattern in its table of rank patterns, which the book links to position and reputation.",
        "《紫微斗数全书》将此格列入定贵局，书中将其与地位、声名相连。",
    ),
    NHOM_DINH_BAN_TIEN: (
        "Tử Vi Đẩu Số toàn thư xếp cách này vào bảng định bần tiện cục, nhóm cách sách gắn với thiếu thốn, vất vả. Đó là quy tắc của một sách cổ, không phải điều tất định.",
        "The Tử Vi Đẩu Số Toàn Thư lists this pattern in its table of hardship patterns, which the book links to want and toil. That is an old book's rule, not a certainty.",
        "《紫微斗数全书》将此格列入定贫贱局，书中将其与匮乏、劳苦相连。这是古书的规则，并非定数。",
    ),
}

# Lục cát tinh cộng Lộc Tồn: tập "吉星" của các chú văn nói "遇吉".
_CAT_TINH = ("Tả Phù", "Hữu Bật", "Văn Xương", "Văn Khúc", "Thiên Khôi", "Thiên Việt", "Lộc Tồn")

# Cung theo thứ tự đếm nghịch từ Mệnh, kèm tên ba thứ tiếng.
_GOI_MENH = (0, ("Mệnh", "Mệnh", "命宫"))
_GOI_TAI_BACH = (4, ("Tài Bạch", "Tài Bạch", "财帛宫"))
_GOI_QUAN_LOC = (8, ("Quan Lộc", "Quan Lộc", "官禄宫"))
_GOI_DIEN_TRACH = (9, ("Điền Trạch", "Điền Trạch", "田宅宫"))


def _co_hoa_tai(la_so: Dict, pos: int, hoa: str) -> bool:
    return any(s.get("tuHoa", "") == hoa for s in la_so["cung"][mod(pos, 12)]["sao"])


def _khong_vong_tai(la_so: Dict, pos: int) -> bool:
    c = la_so["cung"][mod(pos, 12)]
    return c["tuanTrung"] or c["trietLo"]


def _co_cat_tinh_tai(la_so: Dict, pos: int) -> bool:
    tai = _sao_tai_vi_tri(la_so, pos)
    if any(s in tai for s in _CAT_TINH):
        return True
    return (_co_hoa_tai(la_so, pos, "Hóa Lộc") or _co_hoa_tai(la_so, pos, "Hóa Quyền")
            or _co_hoa_tai(la_so, pos, "Hóa Khoa"))


def _co_loc_tai(la_so: Dict, pos: int) -> bool:
    return "Lộc Tồn" in _sao_tai_vi_tri(la_so, pos) or _co_hoa_tai(la_so, pos, "Hóa Lộc")


def _giap_cung(la_so: Dict, pos: int, a: str, b: str) -> bool:
    """Hai sao ở hai cung KỀ hai bên pos."""
    truoc, sau = _sao_tai_vi_tri(la_so, pos - 1), _sao_tai_vi_tri(la_so, pos + 1)
    return (a in truoc and b in sau) or (b in truoc and a in sau)


def _sang_mieu_vuong(ten: str, pos: int) -> bool:
    dig = CHINH_TINH_DIGNITY.get(ten)
    if dig is None:
        return False
    return dig[mod(pos, 12)] in ("M", "V")


def _tam_phuong_co(la_so: Dict, pos: int, ten: str) -> bool:
    return ten in _sao_tam_phuong_tu_chinh(la_so, pos)


def _tam_phuong_co_hoa(la_so: Dict, pos: int, hoa: str) -> bool:
    return any(_co_hoa_tai(la_so, pos + d, hoa) for d in (0, 4, 6, 8))


def _cach_cuc_toan_thu(la_so: Dict) -> List[Dict]:
    out: List[Dict] = []
    menh = la_so["cungMenh"]

    def vi_tri_cung(g) -> int:
        return vi_tri_cung_thu_k(menh, g[0])

    def them(nhom: str, ten: str, zh: str, han: str, chu_van: str, pos: int, di_ban: bool, dk: Ba) -> None:
        c = _cach_cuc_ba(ten, zh, han, dk, _MO_TA_NHOM[nhom])
        c["nhom"], c["chuVan"], c["coDiBan"] = nhom, chu_van, di_ban
        p = mod(pos, 12)
        c["viTri"], c["tenCung"], c["chiCung"] = p, ten_cung_tai_vi_tri(la_so, p), DIA_CHI[p]
        out.append(c)

    tai = _sao_tai_vi_tri(la_so, menh)
    p_menh = mod(menh, 12)

    # ── 定富局 ──

    # 日月夾財：武守命日月來夾是也，財帛宮亦然。
    for g in (_GOI_MENH, _GOI_TAI_BACH):
        p = vi_tri_cung(g)
        if "Vũ Khúc" in _sao_tai_vi_tri(la_so, p) and _giap_cung(la_so, p, "Thái Dương", "Thái Âm"):
            them(NHOM_DINH_PHU, "Nhật Nguyệt giáp Tài", "日月夹财", "日月夾財", "武守命日月来夹是也，财帛宫亦然。", p, False, (
                "Vũ Khúc toạ thủ cung " + g[1][0] + ", Thái Dương và Thái Âm ở hai cung kề hai bên",
                "Vũ Khúc sits in the " + g[1][1] + " palace, with Thái Dương and Thái Âm in the two palaces on either side",
                "武曲坐守" + g[1][2] + "，太阳、太阴分居左右两邻宫",
            ))
    # 財祿夾馬：馬守命武祿來夾是也，逢生旺尤妙。
    if "Thiên Mã" in tai:
        truoc, sau = menh - 1, menh + 1
        if (("Vũ Khúc" in _sao_tai_vi_tri(la_so, truoc) and _co_loc_tai(la_so, sau))
                or ("Vũ Khúc" in _sao_tai_vi_tri(la_so, sau) and _co_loc_tai(la_so, truoc))):
            them(NHOM_DINH_PHU, "Tài Lộc giáp Mã", "财禄夹马", "財祿夾馬", "马守命武禄来夹是也，逢生旺尤妙。", menh, True, (
                "Thiên Mã toạ thủ cung Mệnh, Vũ Khúc và sao Lộc (Lộc Tồn hay sao mang Hóa Lộc) ở hai cung kề hai bên",
                "Thiên Mã sits in the Mệnh palace, with Vũ Khúc and a Lộc star (Lộc Tồn or the star carrying Hóa Lộc) in the two palaces on either side",
                "天马坐守命宫，武曲与禄星（禄存或化禄之星）分居左右两邻宫",
            ))
    # 日月照璧：日月臨田宅宮是也，喜居墓庫。
    p_dt = vi_tri_cung(_GOI_DIEN_TRACH)
    if _co_du(_sao_tai_vi_tri(la_so, p_dt), "Thái Dương", "Thái Âm"):
        them(NHOM_DINH_PHU, "Nhật Nguyệt chiếu bích", "日月照璧", "日月照璧", "日月临田宅宫是也，喜居墓库。", p_dt, False, (
            "Thái Dương và Thái Âm cùng ở cung Điền Trạch (chỉ xảy ra ở Sửu hoặc Mùi)",
            "Thái Dương and Thái Âm both sit in the Điền Trạch palace (possible only at Sửu or Mùi)",
            "太阳、太阴同在田宅宫（只出现在丑或未）",
        ))
    # 金燦光輝：太陽單守，命在午宮是也。
    if p_menh == 6:
        ct = _chinh_tinh_tai_vi_tri(la_so, menh)
        if len(ct) == 1 and ct[0] == "Thái Dương":
            them(NHOM_DINH_PHU, "Kim xán quang huy", "金灿光辉", "金燦光輝", "太阳单守，命在午宫是也。", menh, False, (
                "Cung Mệnh an tại Ngọ, Thái Dương là chính tinh duy nhất toạ thủ",
                "The Mệnh palace sits at Ngọ, with Thái Dương as its only major star",
                "命宫在午，太阳独坐为唯一正曜",
            ))

    # ── 定貴局 ──

    # 日月夾命：不坐空亡，遇逢本宮有吉星是也。
    if (_giap_cung(la_so, menh, "Thái Dương", "Thái Âm") and not _khong_vong_tai(la_so, menh)
            and _co_cat_tinh_tai(la_so, menh)):
        them(NHOM_DINH_QUY, "Nhật Nguyệt giáp Mệnh", "日月夹命", "日月夾命", "不坐空亡遇逢本宫有吉星是也。", menh, True, (
            "Thái Dương và Thái Âm ở hai cung kề hai bên cung Mệnh; cung Mệnh không có Tuần, Triệt và có cát tinh (lục cát tinh, Lộc Tồn hay sao mang Hóa Lộc, Quyền, Khoa)",
            "Thái Dương and Thái Âm sit in the two palaces on either side of Mệnh; the Mệnh palace has no Tuần or Triệt and holds an auspicious star (one of the six auspicious stars, Lộc Tồn, or a star carrying Hóa Lộc, Quyền or Khoa)",
            "太阳、太阴分居命宫左右两邻宫；命宫不坐旬空、截空，且有吉星（六吉星、禄存或化禄权科之星）",
        ))
    # 日出扶桑：日在卯守命是也，守官祿宮亦然。
    if vi_tri_sao(la_so, "Thái Dương") == 3:
        for g in (_GOI_MENH, _GOI_QUAN_LOC):
            if mod(vi_tri_cung(g), 12) == 3:
                them(NHOM_DINH_QUY, "Nhật xuất Phù Tang", "日出扶桑", "日出扶桑", "日在卯守命是也，守官禄宫亦然。", 3, False, (
                    "Thái Dương ở Mão, toạ thủ cung " + g[1][0],
                    "Thái Dương at Mão, sitting in the " + g[1][1] + " palace",
                    "太阳在卯，坐守" + g[1][2],
                ))
    # 月落亥宮：月在亥守命是也，又名月朗天門。
    if p_menh == 11 and "Thái Âm" in tai:
        them(NHOM_DINH_QUY, "Nguyệt lạc Hợi cung", "月落亥宫", "月落亥宮", "月在亥守命是也，又名月朗天门。", menh, False, (
            "Thái Âm toạ thủ cung Mệnh an tại Hợi",
            "Thái Âm sits in the Mệnh palace at Hợi",
            "太阴坐守亥宫命宫",
        ))
    # 月生滄海：月在子宮守田宅是也。
    p_dt = vi_tri_cung(_GOI_DIEN_TRACH)
    if mod(p_dt, 12) == 0 and "Thái Âm" in _sao_tai_vi_tri(la_so, p_dt):
        them(NHOM_DINH_QUY, "Nguyệt sinh thương hải", "月生沧海", "月生滄海", "月在子宫守田宅是也。", p_dt, False, (
            "Thái Âm ở Tý, toạ thủ cung Điền Trạch",
            "Thái Âm at Tý, sitting in the Điền Trạch palace",
            "太阴在子，坐守田宅宫",
        ))
    # 輔弼拱主：紫微守命二星來拱是也，夾之亦然。
    if "Tử Vi" in tai:
        def tam_phuong(ten: str) -> bool:
            return any(ten in _sao_tai_vi_tri(la_so, menh + d) for d in (4, 6, 8))

        if (tam_phuong("Tả Phù") and tam_phuong("Hữu Bật")) or _giap_cung(la_so, menh, "Tả Phù", "Hữu Bật"):
            them(NHOM_DINH_QUY, "Phụ Bật củng chủ", "辅弼拱主", "輔弼拱主", "紫微守命二星来拱是也，夹之亦然。", menh, True, (
                "Tử Vi toạ thủ cung Mệnh; Tả Phù và Hữu Bật cùng chiếu từ tam phương tứ chính, hoặc ở hai cung kề hai bên",
                "Tử Vi sits in the Mệnh palace; Tả Phù and Hữu Bật both shine on it from its triangle and opposite, or sit in the two palaces on either side",
                "紫微坐守命宫；左辅、右弼同自三方四正来拱，或分居左右两邻宫",
            ))
    # 君臣慶會：紫微左右同守命是也，更會相武陰妙上。
    if _co_du(tai, "Tử Vi", "Tả Phù", "Hữu Bật"):
        them(NHOM_DINH_QUY, "Quân thần khánh hội", "君臣庆会", "君臣慶會", "紫微左右同守命是也，更会相武阴妙上。", menh, False, (
            "Tử Vi, Tả Phù và Hữu Bật cùng toạ thủ cung Mệnh",
            "Tử Vi, Tả Phù and Hữu Bật all sit in the Mệnh palace",
            "紫微、左辅、右弼同坐命宫",
        ))
    # 坐貴向貴：謂魁鉞在命迭相坐拱是也。
    doi = _sao_tai_vi_tri(la_so, menh + 6)
    if ("Thiên Khôi" in tai and "Thiên Việt" in doi) or ("Thiên Việt" in tai and "Thiên Khôi" in doi):
        them(NHOM_DINH_QUY, "Toạ quý hướng quý", "坐贵向贵", "坐貴向貴", "谓魁钺在命迭相坐拱是也。", menh, True, (
            "Một trong hai sao Thiên Khôi, Thiên Việt toạ thủ cung Mệnh, sao kia ở cung xung chiếu",
            "One of Thiên Khôi and Thiên Việt sits in the Mệnh palace and the other in the opposite palace",
            "天魁、天钺一坐命宫，一在对宫",
        ))
    # 七殺朝斗：前批注「七殺寅申子午一生爵祿榮昌，為七殺朝斗格。」
    if "Thất Sát" in tai and p_menh in (0, 2, 6, 8):
        them(NHOM_DINH_QUY, "Thất Sát triều Đẩu", "七杀朝斗", "七殺朝斗", "七杀寅申子午一生爵禄荣昌 为七杀朝斗格。", menh, False, (
            "Thất Sát toạ thủ cung Mệnh an tại Dần, Thân, Tý hoặc Ngọ",
            "Thất Sát sits in the Mệnh palace at Dần, Thân, Tý or Ngọ",
            "七杀坐守命宫，命在寅、申、子或午",
        ))
    # 日月同臨：前批注「日月同未命安丑侯伯之材。」
    if p_menh == 1 and _co_du(_sao_tai_vi_tri(la_so, 7), "Thái Dương", "Thái Âm"):
        them(NHOM_DINH_QUY, "Nhật Nguyệt đồng lâm", "日月同临", "日月同臨", "日月同未命安丑侯伯之材", menh, True, (
            "Cung Mệnh an tại Sửu, Thái Dương và Thái Âm cùng ở Mùi chiếu sang",
            "The Mệnh palace sits at Sửu, with Thái Dương and Thái Âm together at Mùi facing it",
            "命安丑宫，太阳、太阴同在未宫来照",
        ))
    # 科權祿拱：ba hóa ở tam phương tứ chính (mục 文職論 của Toàn thư).
    if (_tam_phuong_co_hoa(la_so, menh, "Hóa Khoa") and _tam_phuong_co_hoa(la_so, menh, "Hóa Quyền")
            and _tam_phuong_co_hoa(la_so, menh, "Hóa Lộc")):
        them(NHOM_DINH_QUY, "Khoa Quyền Lộc củng", "科权禄拱", "科權祿拱", "又得三方四正科权禄拱", menh, True, (
            "Hóa Khoa, Hóa Quyền và Hóa Lộc đều ở cung Mệnh hay tam phương tứ chính của nó",
            "Hóa Khoa, Hóa Quyền and Hóa Lộc all sit in the Mệnh palace or its triangle and opposite",
            "化科、化权、化禄皆在命宫或其三方四正",
        ))
    # 武曲守垣：武守命卯宮是也，餘不是。
    if p_menh == 3 and "Vũ Khúc" in tai:
        them(NHOM_DINH_QUY, "Vũ Khúc thủ viên", "武曲守垣", "武曲守垣", "武守命卯宫是也，余不是。", menh, False, (
            "Vũ Khúc toạ thủ cung Mệnh an tại Mão",
            "Vũ Khúc sits in the Mệnh palace at Mão",
            "武曲坐守卯宫命宫",
        ))
    # 府相朝垣：前批注「命寅申，府相在財帛宮，祿官朝者，上格別宮次之。」
    if p_menh in (2, 8):
        phu, tuong = vi_tri_sao(la_so, "Thiên Phủ"), vi_tri_sao(la_so, "Thiên Tướng")
        tb, ql = mod(vi_tri_cung(_GOI_TAI_BACH), 12), mod(vi_tri_cung(_GOI_QUAN_LOC), 12)
        if (phu == tb and tuong == ql) or (phu == ql and tuong == tb):
            them(NHOM_DINH_QUY, "Phủ Tướng triều viên", "府相朝垣", "府相朝垣", "命寅申，府相在财帛宫，禄官朝者，上格别宫次之。", menh, True, (
                "Cung Mệnh an tại Dần hoặc Thân; Thiên Phủ và Thiên Tướng chia nhau ở cung Tài Bạch và cung Quan Lộc",
                "The Mệnh palace sits at Dần or Thân; Thiên Phủ and Thiên Tướng occupy the Tài Bạch and Quan Lộc palaces, one each",
                "命在寅或申；天府、天相分居财帛宫与官禄宫",
            ))
    # 權祿生逢：二星守命廟旺是也，陷不是。
    if _co_hoa_tai(la_so, menh, "Hóa Quyền") and _co_hoa_tai(la_so, menh, "Hóa Lộc"):
        sang = True
        for s in la_so["cung"][p_menh]["sao"]:
            if s.get("tuHoa", "") in ("Hóa Quyền", "Hóa Lộc") and not _sang_mieu_vuong(s["ten"], p_menh):
                sang = False
        if sang:
            them(NHOM_DINH_QUY, "Quyền Lộc sinh phùng", "权禄生逢", "權祿生逢", "二星守命庙旺是也，陷不是。", menh, False, (
                "Hai sao mang Hóa Quyền và Hóa Lộc cùng toạ thủ cung Mệnh, cả hai ở mức miếu hay vượng",
                "The stars carrying Hóa Quyền and Hóa Lộc both sit in the Mệnh palace, both at the exalted or strong grade",
                "化权、化禄二星同坐命宫，且皆庙旺",
            ))
    # 羊刃入廟：辰戌丑未守命遇吉是也。
    if "Kình Dương" in tai and p_menh in (1, 4, 7, 10) and _co_cat_tinh_tai(la_so, menh):
        them(NHOM_DINH_QUY, "Dương Nhận nhập miếu", "羊刃入庙", "羊刃入廟", "辰戌丑未守命遇吉是也。", menh, True, (
            "Kình Dương toạ thủ cung Mệnh an tại Thìn, Tuất, Sửu hoặc Mùi, cung Mệnh có cát tinh (lục cát tinh, Lộc Tồn hay sao mang Hóa Lộc, Quyền, Khoa)",
            "Kình Dương sits in the Mệnh palace at Thìn, Tuất, Sửu or Mùi, and the Mệnh palace holds an auspicious star (one of the six auspicious stars, Lộc Tồn, or a star carrying Hóa Lộc, Quyền or Khoa)",
            "擎羊坐守命宫，命在辰、戌、丑或未，且命宫有吉星（六吉星、禄存或化禄权科之星）",
        ))
    # 巨機居卯：前批注「巨機居卯乙辛己丙至公卿，不貴即富，甲人平常何也，因甲祿到寅卯宮有擎羊破格耳。」
    if p_menh == 3 and _co_du(tai, "Cự Môn", "Thiên Cơ") and not la_so["canChiNam"].startswith("Giáp"):
        them(NHOM_DINH_QUY, "Cự Cơ cư Mão", "巨机居卯", "巨機居卯", "巨机居卯乙辛己丙至公卿 不贵即富，甲人平常何也，因甲禄到寅卯宫有擎羊破格耳。", menh, False, (
            "Cự Môn và Thiên Cơ cùng toạ thủ cung Mệnh an tại Mão; người sinh năm can Giáp không tính vì sách ghi Kình Dương ở Mão phá cách",
            "Cự Môn and Thiên Cơ both sit in the Mệnh palace at Mão; people born in a Giáp year are excluded, since the book says Kình Dương at Mão breaks the pattern",
            "巨门、天机同坐卯宫命宫；甲年生人不计，书云擎羊在卯破格",
        ))

    # ── 定貧賤局 ──

    # 生不逢時：命坐空亡逢廉貞是也。
    if "Liêm Trinh" in tai and _khong_vong_tai(la_so, menh):
        them(NHOM_DINH_BAN_TIEN, "Sinh bất phùng thời", "生不逢时", "生不逢時", "命坐空亡逢廉贞是也。", menh, True, (
            "Liêm Trinh toạ thủ cung Mệnh, cung Mệnh có Tuần hoặc Triệt",
            "Liêm Trinh sits in the Mệnh palace, and the Mệnh palace has Tuần or Triệt",
            "廉贞坐守命宫，命宫坐旬空或截空",
        ))
    # 祿逢兩殺：祿坐空亡又逢空劫殺星是也。
    if (_co_loc_tai(la_so, menh) and _khong_vong_tai(la_so, menh)
            and _tam_phuong_co(la_so, menh, "Địa Không") and _tam_phuong_co(la_so, menh, "Địa Kiếp")):
        them(NHOM_DINH_BAN_TIEN, "Lộc phùng lưỡng sát", "禄逢两杀", "祿逢兩殺", "禄坐空亡又逢空劫杀星是也。", menh, True, (
            "Sao Lộc (Lộc Tồn hay sao mang Hóa Lộc) ở cung Mệnh có Tuần hoặc Triệt, Địa Không và Địa Kiếp cùng ở tam phương tứ chính",
            "A Lộc star (Lộc Tồn or the star carrying Hóa Lộc) is in a Mệnh palace that has Tuần or Triệt, with Địa Không and Địa Kiếp both in its triangle and opposite",
            "禄星（禄存或化禄之星）在命宫而命宫坐旬空或截空，地空、地劫同在三方四正",
        ))
    # 馬落空亡：馬既落亡，雖祿沖會無用，主奔波。
    if "Thiên Mã" in tai and _khong_vong_tai(la_so, menh):
        them(NHOM_DINH_BAN_TIEN, "Mã lạc không vong", "马落空亡", "馬落空亡", "马既落亡虽禄冲会无用主奔波。", menh, True, (
            "Thiên Mã toạ thủ cung Mệnh, cung Mệnh có Tuần hoặc Triệt",
            "Thiên Mã sits in the Mệnh palace, and the Mệnh palace has Tuần or Triệt",
            "天马坐守命宫，命宫坐旬空或截空",
        ))
    # 一生孤貧：謂破守命星陷地是也。
    if "Phá Quân" in tai and CHINH_TINH_DIGNITY["Phá Quân"][p_menh] == "H":
        them(NHOM_DINH_BAN_TIEN, "Nhất sinh cô bần", "一生孤贫", "一生孤貧", "谓破守命星陷地是也。", menh, True, (
            "Phá Quân toạ thủ cung Mệnh ở vị trí hãm theo bảng miếu hãm của lá số",
            "Phá Quân sits in the Mệnh palace at a weak position by the chart's strength table",
            "破军坐守命宫，按本命盘的庙陷表落陷",
        ))
    # 兩重華蓋：謂祿存化祿坐命遇空劫是也。
    if ("Lộc Tồn" in tai and _co_hoa_tai(la_so, menh, "Hóa Lộc")
            and _tam_phuong_co(la_so, menh, "Địa Không") and _tam_phuong_co(la_so, menh, "Địa Kiếp")):
        them(NHOM_DINH_BAN_TIEN, "Lưỡng trùng Hoa Cái", "两重华盖", "兩重華蓋", "谓禄存化禄坐命遇空劫是也。", menh, True, (
            "Lộc Tồn và sao mang Hóa Lộc cùng toạ thủ cung Mệnh, Địa Không và Địa Kiếp cùng ở tam phương tứ chính",
            "Lộc Tồn and the star carrying Hóa Lộc both sit in the Mệnh palace, with Địa Không and Địa Kiếp both in its triangle and opposite",
            "禄存与化禄之星同坐命宫，地空、地劫同在三方四正",
        ))
    return out
