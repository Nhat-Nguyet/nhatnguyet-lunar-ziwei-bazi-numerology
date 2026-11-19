"""Phép đo ba thứ tiếng của KẾT QUẢ (Tử Vi, Bát Tự), dùng trong test.

Cùng luật với TestKetQuaTuViBatTuDuBaThuTieng của lõi Go
(coreengine/tuvi_bangonngu_test.go) và js/kiem/ba-ngon-ngu.ts:

- mọi trường tên (chuỗi, hay mảng chuỗi) mang ``<khoá>Zh`` có chữ Hán và không
  còn chữ Latin có dấu;
- mang ``<khoá>En`` khác rỗng, trừ tên mà bản Anh giữ nguyên Hán Việt (can,
  chi, can chi, Tứ Hóa, tên cách cục);
- bỏ qua khoá không phải tên: mã máy (loai, ma, nhom, voi*), tiếng vọng đầu
  vào (hoTen, gioiTinh), chú văn đã là chữ Hán (chuVan).

Trường rỗng (đại vận chưa tới, sao không có trên lá số) không tính.
"""

import re
from collections import OrderedDict
from typing import Any, Dict, List

KHOA_KHONG_PHAI_TEN = {
    "hoTen", "gioiTinh", "loai", "ma", "nhom", "voiLuuNien", "voiTieuVan", "voiDaiVan", "chuVan",
    "dienGiai", "caveat", "cachTinh", "quyUoc", "ghiChuGioTy", "phepTinh",
}
KHOA_GIU_TEN_GOC = {
    "can", "chi", "canChi", "label", "canChiNam", "gioSinh", "menhCungChi", "chiCung",
    "luuNienChi", "tieuVanChi", "luuDauQuanChi", "tuHoa", "hoa", "nhatChu", "chiDich",
}
DUONG_GIU_TEN_GOC = {".cachCuc[].ten"}

_LATIN_CO_DAU = re.compile("[À-ɏḀ-ỿ]")
_CHU_HAN = re.compile("[㐀-鿿]")


def _lay_phan(v: Any, i: int) -> str:
    if isinstance(v, str):
        return v
    if isinstance(v, list) and i < len(v) and isinstance(v[i], str):
        return v[i]
    return ""


def do_ba_ngon_ngu(v: Any, dem: Dict, duong: str = "") -> None:
    """Quét một kết quả, cộng vào ``dem`` (``{"tong": int, "thieu": [(đường, chữ Việt, "en"|"zh")]}``)."""
    if isinstance(v, list):
        for x in v:
            do_ba_ngon_ngu(x, dem, duong + "[]")
        return
    if not isinstance(v, dict):
        return
    for k, x in v.items():
        d = duong + "." + k
        if k.endswith(("En", "Zh", "Han")) or k in KHOA_KHONG_PHAI_TEN:
            continue
        if isinstance(x, str):
            vi = [x]
        elif isinstance(x, list) and all(isinstance(p, str) for p in x):
            vi = x
        else:
            do_ba_ngon_ngu(x, dem, d)
            continue
        can_en = k not in KHOA_GIU_TEN_GOC and d not in DUONG_GIU_TEN_GOC
        for i, s in enumerate(vi):
            if not s:
                continue
            dem["tong"] += 1
            zh = _lay_phan(v.get(k + "Zh"), i)
            if not _CHU_HAN.search(zh) or _LATIN_CO_DAU.search(zh):
                dem["thieu"].append((d, s, "zh"))
            if can_en and not _lay_phan(v.get(k + "En"), i):
                dem["thieu"].append((d, s, "en"))


def tom_tat_thieu(dem: Dict, toi_da: int = 20) -> str:
    """Tóm tắt các chỗ thiếu theo đường, để in khi test đỏ."""
    theo: "OrderedDict[str, List]" = OrderedDict()
    for d, s, t in dem["thieu"]:
        khoa = "%s (thiếu %s)" % (d, t)
        if khoa in theo:
            theo[khoa][0] += 1
        else:
            theo[khoa] = [1, s]
    dong = ['%s: %d chỗ, ví dụ "%s"' % (k, n, vd) for k, (n, vd) in list(theo.items())[:toi_da]]
    return "%d chỗ thiếu trên %d tên\n" % (len(dem["thieu"]), dem["tong"]) + "\n".join(dong)
