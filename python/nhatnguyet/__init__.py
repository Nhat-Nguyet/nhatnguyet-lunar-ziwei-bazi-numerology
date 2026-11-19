"""Nhat Nguyet: Zi Wei Dou Shu, BaZi, numerology, Vietnamese/Chinese/Korean/
Japanese lunar calendar and Vietnamese festivals (Python port of the Go core).

English API (named arguments, clock times, results in ``lang``)::

    from nhatnguyet import cast_zi_wei, cast_bazi, to_lunar, numerology, festivals
    chart = cast_zi_wei(date="1990-09-19", time="20:00", gender="male")

SVG: ``zi_wei_svg(chart)``, ``bazi_svg(chart)``, ``numerology_svg(result)``
(or ``render_chart_svg`` and friends on the raw Vietnamese-keyed objects).

Command line: ``python -m nhatnguyet --help``.

Mô-đun tiếng Việt (khoá đúng như ca kiểm của lõi Go):

- ``nhatnguyet.am_lich``: đổi lịch dương, âm theo giờ Việt Nam (UTC+7), can
  chi, 24 tiết khí, Nhị Thập Bát Tú, ngũ hành, nạp âm.
- ``nhatnguyet.than_so_hoc``: hồ sơ thần số học theo họ tên và ngày sinh.
- ``nhatnguyet.tu_vi``, ``nhatnguyet.bat_tu``, ``nhatnguyet.le_hoi``.
- ``nhatnguyet.en``: lớp API tiếng Anh ở trên.
"""

from . import am_lich, bat_tu, en, le_hoi, than_so_hoc, tu_vi  # noqa: F401
from . import bat_tu_ve_svg, than_so_hoc_ve_svg, tu_vi_ve_svg  # noqa: F401
from .tu_vi_ve_svg import render_chart_svg, ve_la_so_svg  # noqa: F401
from .bat_tu_ve_svg import render_bazi_svg, ve_bat_tu_svg  # noqa: F401
from .than_so_hoc_ve_svg import render_numerology_svg, ve_than_so_hoc_svg  # noqa: F401
from .en import (  # noqa: F401
    bazi_svg, cast_bazi, cast_zi_wei, day_pillar, decade_luck, festivals, find_patterns, hour_branch,
    minor_luck, numerology, numerology_svg, solar_term_on, solar_terms, to_lunar, to_solar, year_pillar,
    yearly_luck, yearly_stars, zi_wei_svg,
)

from .van_ban import bazi_to_text, chart_to_text, numerology_to_text, zi_wei_to_text  # noqa: F401

__version__ = "0.1.0"
# Phiên bản lõi tính Go mà bộ ca kiểm đã sinh ra (phienBanDongCo).
PHIEN_BAN_DONG_CO = "2.0.1"

__all__ = [
    "am_lich", "than_so_hoc", "tu_vi", "bat_tu", "le_hoi", "en", "__version__", "PHIEN_BAN_DONG_CO",
    "cast_zi_wei", "decade_luck", "yearly_luck", "yearly_stars", "find_patterns",
    "cast_bazi", "minor_luck", "to_lunar", "to_solar", "solar_terms", "solar_term_on",
    "day_pillar", "year_pillar", "hour_branch", "numerology", "festivals",
    "zi_wei_svg", "bazi_svg", "numerology_svg",
    "bat_tu_ve_svg", "than_so_hoc_ve_svg", "tu_vi_ve_svg",
    "render_chart_svg", "ve_la_so_svg", "render_bazi_svg", "ve_bat_tu_svg",
    "render_numerology_svg", "ve_than_so_hoc_svg",
]
