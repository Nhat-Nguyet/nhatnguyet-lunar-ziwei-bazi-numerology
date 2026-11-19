"""Thần số học theo bảng chữ Pythagoras, tên tiếng Việt bỏ dấu.

Bản chuyển ngữ sang Python của lõi tính Go của Nhật Nguyệt
(lÃµi tÃ­nh Go cá»§a Nháº­t Nguyá»t : numerology.go, numerology_deep.go,
numerology_dinhcao.go), phần TÍNH SỐ. Các bảng ý nghĩa dài của bản Go không
chép sang đây.

Quy ước số chủ (11, 22, 33) và cách cộng gộp của Số Đường Đời là quy ước thần
số học đại chúng hiện đại, như lõi Go; tháng và ngày cá nhân tính theo tháng,
ngày xem truyền vào, không đọc đồng hồ máy.
"""

from __future__ import annotations

from typing import Dict, Tuple

__all__ = [
    "MASTER_NUMBERS", "sum_digits", "reduce_number", "reduce_to_single_digit",
    "strip_diacritics", "fold_vietnamese",
    "so_duong_doi", "so_su_menh", "so_linh_hon", "so_nhan_cach",
    "tinh_ho_so_than_so_hoc",
    "so_thai_do", "so_ngay_sinh", "so_truong_thanh", "so_nam_ca_nhan",
    "so_thang_ca_nhan", "so_ngay_ca_nhan", "luoi_pythago",
    "tinh_so_dinh_cao", "tinh_so_thach_thuc", "so_no_nghiep_ngay_sinh",
    "tinh_ho_so_than_so_hoc_sau", "so_to_ngu_hanh",
]

MASTER_NUMBERS = frozenset((11, 22, 33))


def sum_digits(n: int) -> int:
    """Tổng các chữ số (bỏ dấu âm)."""
    return sum(int(c) for c in str(abs(n)))


def reduce_number(n: int) -> int:
    """Rút gọn về một chữ số, dừng khi gặp số chủ 11, 22, 33."""
    r = n
    while r > 9 and r not in MASTER_NUMBERS:
        r = sum_digits(r)
    return r


def reduce_to_single_digit(n: int) -> int:
    """Rút gọn về đúng một chữ số, không giữ số chủ."""
    while n > 9:
        n = sum_digits(n)
    return n


# Giá trị chữ cái theo bảng Pythagoras.
_GIA_TRI_CHU = {}
for _so, _cac_chu in enumerate(("ajs", "bkt", "clu", "dmv", "enw", "fox", "gpy", "hqz", "ir"), start=1):
    for _c in _cac_chu:
        _GIA_TRI_CHU[_c] = _so

_NGUYEN_AM = frozenset("aeiou")

# Bỏ dấu tiếng Việt (chữ thường), như diacriticsMap của Go.
_BO_DAU = {}
for _goc, _cac in (
    ("a", "àáạảãâầấậẩẫăằắặẳẵ"),
    ("e", "èéẹẻẽêềếệểễ"),
    ("i", "ìíịỉĩ"),
    ("o", "òóọỏõôồốộổỗơờớợởỡ"),
    ("u", "ùúụủũưừứựửữ"),
    ("y", "ỳýỵỷỹ"),
    ("d", "đ"),
):
    for _c in _cac:
        _BO_DAU[_c] = _goc


def _ha_chu(s: str):
    """Hạ chữ thường TỪNG ký tự như unicode.ToLower của Go (một ký tự ra
    một ký tự; ký tự mà Python hạ thành nhiều ký tự, như "İ", lấy ký tự đầu)."""
    for c in s:
        t = c.lower()
        yield t[0] if t else c


def strip_diacritics(chuoi: str) -> str:
    """Bỏ dấu, hạ chữ thường, CHỈ giữ a tới z (bỏ khoảng trắng, số, ký tự khác):
    đầu vào của phép quy đổi Pythagoras."""
    ra = []
    for c in _ha_chu(chuoi):
        if c in _BO_DAU:
            ra.append(_BO_DAU[c])
        elif "a" <= c <= "z":
            ra.append(c)
    return "".join(ra)


def fold_vietnamese(chuoi: str) -> str:
    """Bỏ dấu tiếng Việt và hạ chữ thường, GIỮ khoảng trắng, số, ký tự khác."""
    return "".join(_BO_DAU.get(c, c) for c in _ha_chu(chuoi))


def so_duong_doi(dd: int, mm: int, yyyy: int) -> int:
    """Số Đường Đời: cộng mọi chữ số ngày, tháng, năm sinh rồi rút gọn."""
    return reduce_number(sum_digits(dd) + sum_digits(mm) + sum_digits(yyyy))


def so_su_menh(ho_ten: str) -> int:
    """Số Sứ Mệnh: tổng giá trị mọi chữ cái của họ tên."""
    return reduce_number(sum(_GIA_TRI_CHU.get(c, 0) for c in strip_diacritics(ho_ten)))


def so_linh_hon(ho_ten: str) -> int:
    """Số Linh Hồn: tổng giá trị các nguyên âm a, e, i, o, u."""
    return reduce_number(sum(_GIA_TRI_CHU[c] for c in strip_diacritics(ho_ten) if c in _NGUYEN_AM))


def so_nhan_cach(ho_ten: str) -> int:
    """Số Nhân Cách: tổng giá trị các phụ âm (y tính là phụ âm)."""
    return reduce_number(sum(_GIA_TRI_CHU.get(c, 0) for c in strip_diacritics(ho_ten) if c not in _NGUYEN_AM))


def tinh_ho_so_than_so_hoc(ho_ten: str, dd: int, mm: int, yyyy: int) -> Dict[str, int]:
    """Bốn chỉ số gốc: soDuongDoi, soSuMenh, soLinhHon, soNhanCach."""
    return {
        "soDuongDoi": so_duong_doi(dd, mm, yyyy),
        "soSuMenh": so_su_menh(ho_ten),
        "soLinhHon": so_linh_hon(ho_ten),
        "soNhanCach": so_nhan_cach(ho_ten),
    }


def so_thai_do(dd: int, mm: int) -> int:
    """Số Thái Độ: ngày cộng tháng sinh, rút gọn giữ số chủ."""
    return reduce_number(sum_digits(dd) + sum_digits(mm))


def so_ngay_sinh(dd: int) -> int:
    """Số Ngày Sinh: ngày sinh rút gọn hẳn về một chữ số."""
    return reduce_to_single_digit(dd)


def so_truong_thanh(so_duong_doi_: int, so_su_menh_: int) -> int:
    """Số Trưởng Thành: Số Đường Đời cộng Số Sứ Mệnh, rút gọn giữ số chủ."""
    return reduce_number(so_duong_doi_ + so_su_menh_)


def so_nam_ca_nhan(dd: int, mm: int, nam_xem: int) -> int:
    """Số Năm Cá Nhân của năm nam_xem (không giữ số chủ)."""
    return reduce_to_single_digit(sum_digits(dd) + sum_digits(mm) + sum_digits(nam_xem))


def so_thang_ca_nhan(dd: int, mm: int, nam_xem: int, thang_xem: int) -> int:
    """Số Tháng Cá Nhân: Số Năm Cá Nhân cộng tháng xem (không giữ số chủ)."""
    return reduce_to_single_digit(so_nam_ca_nhan(dd, mm, nam_xem) + sum_digits(thang_xem))


def so_ngay_ca_nhan(dd: int, mm: int, nam_xem: int, thang_xem: int, ngay_xem: int) -> int:
    """Số Ngày Cá Nhân: Số Tháng Cá Nhân cộng ngày xem (không giữ số chủ)."""
    return reduce_to_single_digit(so_thang_ca_nhan(dd, mm, nam_xem, thang_xem) + sum_digits(ngay_xem))


def luoi_pythago(dd: int, mm: int, yyyy: int) -> Dict[str, int]:
    """Số lần mỗi chữ số 1 tới 9 xuất hiện trong ngày, tháng, năm sinh viết
    liền (không đệm số 0); khoá "1" tới "9"."""
    chu_so = str(dd) + str(mm) + str(yyyy)
    dem = {str(i): 0 for i in range(1, 10)}
    for c in chu_so:
        if "1" <= c <= "9":
            dem[c] += 1
    return dem


def tinh_so_dinh_cao(dd: int, mm: int, yyyy: int, so_duong_doi_: int) -> Dict[str, int]:
    """Bốn Số Đỉnh Cao (giữ số chủ) và tuổi kết thúc ba đỉnh đầu. Đỉnh 1 kết
    thúc ở 36 trừ Số Đường Đời đã rút về một chữ số."""
    d1 = reduce_number(sum_digits(mm) + sum_digits(dd))
    d2 = reduce_number(sum_digits(dd) + sum_digits(yyyy))
    d3 = reduce_number(d1 + d2)
    d4 = reduce_number(sum_digits(mm) + sum_digits(yyyy))
    het1 = 36 - reduce_to_single_digit(so_duong_doi_)
    return {
        "dinh1": d1, "dinh2": d2, "dinh3": d3, "dinh4": d4,
        "tuoiKetThucDinh1": het1,
        "tuoiKetThucDinh2": het1 + 9,
        "tuoiKetThucDinh3": het1 + 18,
    }


def tinh_so_thach_thuc(dd: int, mm: int, yyyy: int) -> Dict[str, int]:
    """Bốn Số Thách Thức (0 tới 8): rút riêng tháng, ngày, năm về một chữ số
    rồi lấy hiệu tuyệt đối từng cặp."""
    m = reduce_to_single_digit(sum_digits(mm))
    d = reduce_to_single_digit(sum_digits(dd))
    y = reduce_to_single_digit(sum_digits(yyyy))
    t1 = abs(m - d)
    t2 = abs(d - y)
    return {"thachThuc1": t1, "thachThuc2": t2, "thachThuc3": abs(t1 - t2), "thachThuc4": abs(m - y)}


def so_no_nghiep_ngay_sinh(dd: int) -> int:
    """Nợ Nghiệp trên ngày sinh: 13, 14, 16, 19; còn lại là 0."""
    return dd if dd in (13, 14, 16, 19) else 0


def tinh_ho_so_than_so_hoc_sau(ho_ten: str, dd: int, mm: int, yyyy: int,
                               nam_xem: int, thang_xem: int, ngay_xem: int) -> Dict:
    """Hồ sơ thần số học đầy đủ, đúng khoá của ca kiểm.

    nam_xem bằng 0 thì soNamCaNhan là 0. soThangCaNhan và soNgayCaNhan tính
    cho ngày ngay_xem/thang_xem/nam_xem truyền vào (bản Go tính theo hôm nay).
    soNoNghiepNgaySinh chỉ có mặt khi khác 0 (như omitempty của Go)."""
    goc = tinh_ho_so_than_so_hoc(ho_ten, dd, mm, yyyy)
    ra = dict(goc)
    ra.update({
        "soThaiDo": so_thai_do(dd, mm),
        "soNgaySinh": so_ngay_sinh(dd),
        "soTruongThanh": so_truong_thanh(goc["soDuongDoi"], goc["soSuMenh"]),
        "soNamCaNhan": so_nam_ca_nhan(dd, mm, nam_xem) if nam_xem > 0 else 0,
        "soThangCaNhan": so_thang_ca_nhan(dd, mm, nam_xem, thang_xem),
        "soNgayCaNhan": so_ngay_ca_nhan(dd, mm, nam_xem, thang_xem, ngay_xem),
        "luoiPythago": luoi_pythago(dd, mm, yyyy),
        "soDinhCao": tinh_so_dinh_cao(dd, mm, yyyy, goc["soDuongDoi"]),
        "soThachThuc": tinh_so_thach_thuc(dd, mm, yyyy),
    })
    no = so_no_nghiep_ngay_sinh(dd)
    if no:
        ra["soNoNghiepNgaySinh"] = no
    return ra


# Hà Đồ, Lạc Thư: 1, 6 Thủy; 2, 7 Hỏa; 3, 8 Mộc; 4, 9 Kim; 5, 0 Thổ.
_SO_NGU_HANH = {
    1: ("Thủy", "Water"), 6: ("Thủy", "Water"),
    2: ("Hỏa", "Fire"), 7: ("Hỏa", "Fire"),
    3: ("Mộc", "Wood"), 8: ("Mộc", "Wood"),
    4: ("Kim", "Metal"), 9: ("Kim", "Metal"),
    5: ("Thổ", "Earth"), 0: ("Thổ", "Earth"),
}


def so_to_ngu_hanh(so: int) -> Tuple[str, str]:
    """Ngũ hành của một con số thần số học (số chủ rút thêm một lần: 11 ra 2,
    22 ra 4, 33 ra 6); rỗng khi không tra được."""
    tra = reduce_number(sum_digits(so)) if so in MASTER_NUMBERS else so
    return _SO_NGU_HANH.get(tra, ("", ""))
