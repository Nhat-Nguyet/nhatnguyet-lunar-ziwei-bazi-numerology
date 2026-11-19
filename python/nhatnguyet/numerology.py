"""Pythagorean numerology with correct handling of Vietnamese names.
English-named alias, like the npm package ``@nhatnguyet/numerology``: the
English API (``numerology``), SVG and text, plus everything in
``nhatnguyet.than_so_hoc``.

The module itself is callable, so ``nhatnguyet.numerology(...)`` works whether
it names the function or this module.

>>> from nhatnguyet.numerology import numerology
>>> numerology("Nguyen Van An", "1990-09-19", today="2026-01-01")["lifePath"]
11
"""

from . import en as _en
from ._bi_danh import goi_duoc as _goi_duoc
from .en import NUMEROLOGY_LABELS, numerology, numerology_svg  # noqa: F401
from .than_so_hoc import *  # noqa: F401,F403
from .than_so_hoc import __all__ as _than_so_hoc_all
from .than_so_hoc_ve_svg import render_numerology_svg, ve_than_so_hoc_svg  # noqa: F401
from .van_ban import numerology_to_text  # noqa: F401

__all__ = ["numerology", "numerology_svg", "numerology_to_text", "NUMEROLOGY_LABELS", "render_numerology_svg",
           "ve_than_so_hoc_svg"] + list(_than_so_hoc_all)

_goi_duoc(__name__, _en.numerology)
