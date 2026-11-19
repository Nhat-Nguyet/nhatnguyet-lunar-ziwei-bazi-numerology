"""Zi Wei Dou Shu (Purple Star Astrology). English-named alias, like the npm
package ``@nhatnguyet/ziwei``: the English API (``cast_zi_wei``,
``decade_luck``, ``yearly_luck``, ``yearly_stars``, ``find_patterns``,
``horoscope``, ``palace_of``...), SVG and text, plus everything in
``nhatnguyet.tu_vi``.

>>> from nhatnguyet.ziwei import cast_zi_wei, palace_of
>>> chart = cast_zi_wei(date="1990-09-19", time="20:00", gender="male")
>>> palace_of(chart, "Life Palace")["name"]
'Life Palace'
"""

from .en import (  # noqa: F401
    STAR_GROUP_EN, YEARLY_STAR_CODE_EN, cast_zi_wei, decade_luck, find_patterns, school_note, yearly_luck,
    yearly_stars, zi_wei_svg,
)
from .tu_vi import *  # noqa: F401,F403
from .tu_vi import __all__ as _tu_vi_all
from .tu_vi_chuc_nang import *  # noqa: F401,F403
from .tu_vi_chuc_nang import __all__ as _chuc_nang_all
from .tu_vi_ten_en import PATTERN_EN, star_en  # noqa: F401
from .tu_vi_ve_svg import render_chart_svg, ve_la_so_svg  # noqa: F401
from .van_ban import chart_to_text, zi_wei_to_text  # noqa: F401

__all__ = [
    "cast_zi_wei", "decade_luck", "yearly_luck", "yearly_stars", "find_patterns", "zi_wei_svg", "school_note",
    "STAR_GROUP_EN", "YEARLY_STAR_CODE_EN", "PATTERN_EN", "star_en", "render_chart_svg", "ve_la_so_svg",
    "zi_wei_to_text", "chart_to_text",
] + list(_chuc_nang_all) + list(_tu_vi_all)
