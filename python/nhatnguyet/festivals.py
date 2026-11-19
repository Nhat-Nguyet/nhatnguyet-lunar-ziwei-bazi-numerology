"""Vietnamese festivals and holidays with their Gregorian dates for any year
1900 to 2100 (206 festivals, CC BY 4.0 data). English-named alias, like the
npm package ``@nhatnguyet/festivals``: the English API (``festivals``,
``festivals_ics``, ``festival_places``) plus the functions of
``nhatnguyet.le_hoi``.

The module itself is callable, so ``nhatnguyet.festivals(2027)`` works whether
it names the function or this module.

>>> from nhatnguyet.festivals import festivals
>>> [f["date"] for f in festivals(2027) if f["id"] == "tet-nguyen-dan"]
['2027-02-06']
"""

from . import en as _en
from ._bi_danh import goi_duoc as _goi_duoc
from .en import FESTIVAL_GROUP_EN, FESTIVAL_SCOPE_EN, festival_places, festivals, festivals_ics  # noqa: F401
from .le_hoi import (  # noqa: F401
    danh_sach_le_hoi, le_hoi_theo_ngay, le_hoi_trong_nam, ngay_duong_cua_le, nguon_du_lieu, provinces,
)

__all__ = [
    "festivals", "festivals_ics", "festival_places", "provinces", "FESTIVAL_GROUP_EN", "FESTIVAL_SCOPE_EN",
    "danh_sach_le_hoi", "nguon_du_lieu", "ngay_duong_cua_le", "le_hoi_trong_nam", "le_hoi_theo_ngay",
]

_goi_duoc(__name__, _en.festivals)
