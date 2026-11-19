"""Vietnamese lunar calendar (also Chinese, Korean, Japanese), sexagenary
cycle, 24 solar terms, 28 lunar mansions, auspicious hours. English-named
alias, like the npm package ``@nhatnguyet/lunar``: the English API plus
everything in ``nhatnguyet.am_lich``.

>>> from nhatnguyet.lunar import to_lunar, auspicious_hours
>>> r = to_lunar("2027-02-06")
>>> r["month"], r["day"], r["yearName"]
(1, 1, 'Ding Wei')
>>> [h["branch"] for h in auspicious_hours("2027-02-06")["hours"] if h["auspicious"]][:3]
['Yin', 'Chen', 'Si']
"""

from .am_lich import *  # noqa: F401,F403
from .am_lich import __all__ as _am_lich_all
from .en import (  # noqa: F401
    AUSPICIOUS_SPIRITS, BRANCH_PINYIN, HOUR_SPIRIT_PINYIN, STEM_PINYIN, auspicious_hours, check_terms,
    convert_terms, day_pillar, hour_branch, parse_date, parse_time, solar_term_on, solar_terms, stem_branch_name,
    term, term_name, to_lunar, to_solar, transformation_short, year_pillar,
)

__all__ = [
    "to_lunar", "to_solar", "solar_terms", "solar_term_on", "day_pillar", "year_pillar", "hour_branch",
    "auspicious_hours", "AUSPICIOUS_SPIRITS", "HOUR_SPIRIT_PINYIN", "parse_date", "parse_time", "term",
    "term_name", "stem_branch_name", "transformation_short", "convert_terms", "check_terms", "STEM_PINYIN",
    "BRANCH_PINYIN",
] + list(_am_lich_all)
