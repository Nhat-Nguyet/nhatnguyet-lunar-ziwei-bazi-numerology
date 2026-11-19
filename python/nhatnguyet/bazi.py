"""BaZi (Four Pillars of Destiny). English-named alias, like the npm package
``@nhatnguyet/bazi``: the English API (``cast_bazi``, ``minor_luck``), SVG and
text, plus everything in ``nhatnguyet.bat_tu``.

>>> from nhatnguyet.bazi import cast_bazi
>>> cast_bazi(date="1990-09-19", time="20:00", gender="male")["pillars"]["day"]["label"]
'Ding Hai'
"""

from .bat_tu import *  # noqa: F401,F403
from .bat_tu import __all__ as _bat_tu_all
from .bat_tu_ve_svg import render_bazi_svg, ve_bat_tu_svg  # noqa: F401
from .en import bazi_svg, cast_bazi, minor_luck  # noqa: F401
from .van_ban import bazi_to_text  # noqa: F401

__all__ = ["cast_bazi", "minor_luck", "bazi_svg", "bazi_to_text", "render_bazi_svg", "ve_bat_tu_svg"] + list(_bat_tu_all)
