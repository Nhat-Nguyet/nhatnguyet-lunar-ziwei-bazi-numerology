"""Nhat Nguyet: Zi Wei Dou Shu, BaZi, numerology, Vietnamese/Chinese/Korean/
Japanese lunar calendar and Vietnamese festivals (Python port of the Go core).

English API (named arguments, clock times, results in ``lang``)::

    from nhatnguyet import cast_zi_wei, cast_bazi, to_lunar, numerology, festivals
    chart = cast_zi_wei(date="1990-09-19", time="20:00", gender="male")

Other English functions: ``auspicious_hours``, ``solar_terms``, ``day_pillar``,
``festivals_ics``, ``horoscope``, ``palace_of`` and the rest of ``__all__``.
English-named modules mirror the npm packages: ``nhatnguyet.lunar``,
``nhatnguyet.ziwei``, ``nhatnguyet.bazi``, ``nhatnguyet.numerology``,
``nhatnguyet.festivals`` (the last two are also callable as the function of
the same name).

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
    AUSPICIOUS_SPIRITS, BRANCH_PINYIN, FESTIVAL_GROUP_EN, FESTIVAL_SCOPE_EN, HOUR_SPIRIT_PINYIN, NUMEROLOGY_LABELS,
    STAR_GROUP_EN, STEM_PINYIN, YEARLY_STAR_CODE_EN, auspicious_hours, bazi_svg, cast_bazi, cast_zi_wei,
    check_terms, convert_terms, day_pillar, decade_luck, festival_places, festivals, festivals_ics, find_patterns,
    YEAR_RANGE, check_year, hour_branch, minor_luck, numerology, numerology_svg, parse_date, parse_date_in_range,
    parse_time, school_note, solar_term_on,
    solar_terms, stem_branch_name, term, term_name, to_lunar, to_solar, transformation_short, year_pillar,
    yearly_luck, yearly_stars, zi_wei_svg,
)
from .tu_vi_chuc_nang import (  # noqa: F401
    flanking_palaces, flies_to, flying_transformations, horoscope, palace_has, palace_has_one_of, palace_is_empty,
    palace_not_have, palace_of, self_transformed, star_of, surrounding_palaces,
)
from .van_ban import bazi_to_text, chart_to_text, numerology_to_text, zi_wei_to_text  # noqa: F401

# Năm mô-đun bí danh tiếng Anh, như năm gói npm @nhatnguyet/lunar, ziwei, bazi,
# numerology, festivals. Nạp ở đây để ``nhatnguyet.numerology`` và
# ``nhatnguyet.festivals`` luôn là MỘT thứ: mô-đun gọi được, gọi là chạy hàm
# cùng tên (xem _bi_danh.py).
from . import bazi, festivals, lunar, numerology, ziwei  # noqa: F401,E402

__version__ = "0.3.0"
# Phiên bản lõi tính Go mà bộ ca kiểm đã sinh ra (phienBanDongCo).
PHIEN_BAN_DONG_CO = "2.2.0"

__all__ = [
    "am_lich", "than_so_hoc", "tu_vi", "bat_tu", "le_hoi", "en", "__version__", "PHIEN_BAN_DONG_CO",
    # bí danh tiếng Anh (mô-đun)
    "lunar", "ziwei", "bazi",
    # Zi Wei
    "cast_zi_wei", "decade_luck", "yearly_luck", "yearly_stars", "find_patterns", "school_note",
    "horoscope", "palace_of", "star_of", "surrounding_palaces", "flanking_palaces", "palace_has",
    "palace_has_one_of", "palace_not_have", "palace_is_empty", "flying_transformations", "flies_to",
    "self_transformed", "STAR_GROUP_EN", "YEARLY_STAR_CODE_EN",
    # BaZi
    "cast_bazi", "minor_luck",
    # lịch
    "to_lunar", "to_solar", "solar_terms", "solar_term_on", "day_pillar", "year_pillar", "hour_branch",
    "auspicious_hours", "AUSPICIOUS_SPIRITS", "HOUR_SPIRIT_PINYIN", "parse_date", "parse_time",
    "parse_date_in_range", "check_year", "YEAR_RANGE",
    "term", "term_name", "stem_branch_name", "transformation_short", "convert_terms", "check_terms",
    "STEM_PINYIN", "BRANCH_PINYIN",
    # thần số học, lễ hội (cũng là mô-đun bí danh gọi được)
    "numerology", "NUMEROLOGY_LABELS", "festivals", "festivals_ics", "festival_places",
    "FESTIVAL_GROUP_EN", "FESTIVAL_SCOPE_EN",
    # SVG, chữ
    "zi_wei_svg", "bazi_svg", "numerology_svg", "chart_to_text", "zi_wei_to_text", "bazi_to_text",
    "numerology_to_text",
    "bat_tu_ve_svg", "than_so_hoc_ve_svg", "tu_vi_ve_svg",
    "render_chart_svg", "ve_la_so_svg", "render_bazi_svg", "ve_bat_tu_svg",
    "render_numerology_svg", "ve_than_so_hoc_svg",
]
