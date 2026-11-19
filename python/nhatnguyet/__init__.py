"""Nhật Nguyệt: lõi tính âm lịch và thần số học (bản Python của lõi Go).

Mô-đun:

- ``nhatnguyet.am_lich``: đổi lịch dương, âm theo giờ Việt Nam (UTC+7), can
  chi, 24 tiết khí, Nhị Thập Bát Tú, ngũ hành, nạp âm.
- ``nhatnguyet.than_so_hoc``: hồ sơ thần số học theo họ tên và ngày sinh.
"""

from . import am_lich, than_so_hoc  # noqa: F401

__version__ = "0.1.0"
# Phiên bản lõi tính Go mà bộ ca kiểm đã sinh ra (phienBanDongCo).
PHIEN_BAN_DONG_CO = "2.0.0"

__all__ = ["am_lich", "than_so_hoc", "__version__", "PHIEN_BAN_DONG_CO"]
