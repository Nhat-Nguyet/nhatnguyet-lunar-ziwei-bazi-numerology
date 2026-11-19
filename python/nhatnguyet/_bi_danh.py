"""Phần chung của năm mô-đun bí danh tiếng Anh (lunar, ziwei, bazi, numerology,
festivals), bản Python của năm gói npm @nhatnguyet/lunar, ziwei, bazi,
numerology, festivals.

Hai mô-đun trùng tên một hàm của gói: ``nhatnguyet.numerology`` (hàm
``numerology``) và ``nhatnguyet.festivals`` (hàm ``festivals``). Khi Python nạp
mô-đun con, nó gắn mô-đun vào thuộc tính cùng tên của gói, đè lên hàm. Để
``from nhatnguyet import numerology; numerology("An", "1990-01-01")`` vẫn chạy
dù mô-đun đã nạp hay chưa, hai mô-đun ấy GỌI ĐƯỢC: gọi mô-đun là gọi hàm.
"""

import inspect
import sys
import types
from typing import Any, Callable


def goi_duoc(ten_mo_dun: str, ham: Callable[..., Any]) -> None:
    """Cho mô-đun ``ten_mo_dun`` gọi được như ``ham`` (cùng chữ ký, cùng doc của hàm ở ``__call__``)."""

    class _MoDunGoiDuoc(types.ModuleType):
        def __call__(self, *args: Any, **kwargs: Any) -> Any:
            return ham(*args, **kwargs)

    _MoDunGoiDuoc.__call__.__doc__ = ham.__doc__
    m = sys.modules[ten_mo_dun]
    m.__class__ = _MoDunGoiDuoc
    m.__signature__ = inspect.signature(ham)  # type: ignore[attr-defined]
