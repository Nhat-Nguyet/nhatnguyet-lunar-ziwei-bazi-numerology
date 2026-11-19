"""English API layer: named arguments, clock times, ``"male"``/``"female"``,
results in ``lang`` (``"vi"``, ``"en"``, ``"zh"``).

Lớp API tiếng Anh, bản Python của ``src/en.ts`` ở các gói TypeScript: mọi
phép tính gọi lại đúng hàm tiếng Việt của gói (``solar_to_lunar``,
``lap_la_so_tu_vi``, ``lap_la_so_bat_tu``...), đối tượng gốc giữ ở khoá
``raw``. Khoá của dict trả về giống hệt bản TypeScript (camelCase), để JSON
của hai bản là một.

Example::

    from nhatnguyet import cast_zi_wei, to_lunar
    chart = cast_zi_wei(date="1990-09-19", time="20:00", gender="male")
    chart["palaces"][chart["lifePalace"]]["name"]   # 'Life Palace'
    to_lunar("2027-02-06", country="CN")["month"]   # 1

Chữ Trung: lấy khoá ``...Zh`` của lõi khi có, không thì bảng TU_VUNG chép từ
lõi Go (``du_lieu/tu-vung.json``), không nữa thì để bản tiếng Anh.
"""

from __future__ import annotations

import datetime as _dt
import json
import os
import re
import unicodedata
from functools import lru_cache
from typing import Any, Callable, Dict, List, Optional, Union

from . import am_lich, bat_tu, le_hoi, than_so_hoc, tu_vi, tu_vi_schools
from ._gio_hoang_dao import AUSPICIOUS_SPIRITS, HOUR_SPIRIT_PINYIN, gio_hoang_dao_kem_than as _gio_hoang_dao_kem_than
from .bat_tu_ve_svg import ve_bat_tu_svg
from .than_so_hoc_ve_svg import ve_than_so_hoc_svg
from .tu_vi_ve_svg import ve_la_so_svg
from .tu_vi_ten_en import PATTERN_EN, PATTERN_HAN_FIX, en_text as _tv_en_text, star_en

__all__ = [
    "parse_date", "parse_time", "hour_branch", "auspicious_hours", "AUSPICIOUS_SPIRITS", "HOUR_SPIRIT_PINYIN", "term", "to_lunar", "to_solar",
    "solar_terms", "solar_term_on", "day_pillar", "year_pillar", "cast_zi_wei", "check_terms",
    "term_name", "transformation_short", "stem_branch_name", "convert_terms", "STEM_PINYIN", "BRANCH_PINYIN",
    "decade_luck", "yearly_luck", "yearly_stars", "find_patterns", "cast_bazi",
    "minor_luck", "numerology", "festivals", "festivals_ics", "festival_places", "NUMEROLOGY_LABELS", "zi_wei_svg", "bazi_svg",
    "numerology_svg", "school_note", "STAR_GROUP_EN", "YEARLY_STAR_CODE_EN",
]

DateInput = Union[str, _dt.date, Dict[str, int], tuple]

_THU_MUC = os.path.join(os.path.dirname(os.path.abspath(__file__)), "du_lieu")


@lru_cache(maxsize=1)
def _tu_vung() -> Dict[str, List[str]]:
    with open(os.path.join(_THU_MUC, "tu-vung.json"), encoding="utf-8") as f:
        return json.load(f)


def _lang(lang: Optional[str]) -> str:
    if lang is None:
        return "en"
    if lang in ("vi", "en", "zh"):
        return lang
    raise ValueError('lang must be "vi", "en" or "zh", got %r' % (lang,))


def term(vi: str, lang: str, fallback: Optional[str] = None) -> str:
    """Translate one Vietnamese domain term with the core's vocabulary; unknown
    terms come back as ``fallback`` (default: the term itself)."""
    if lang == "vi":
        return vi
    t = _tu_vung().get(vi)
    if t:
        return t[0] if lang == "en" else t[1]
    return vi if fallback is None else fallback


def _pick(obj: Dict, key: str, lang: str, fallback: Callable[[], str]) -> str:
    """Khoá ``key`` theo ngôn ngữ: ``key`` (vi), ``keyEn``, ``keyZh``; thiếu thì fallback()."""
    if lang == "vi" and isinstance(obj.get(key), str):
        return obj[key]
    v = obj.get(key + ("En" if lang == "en" else "Zh"))
    return v if isinstance(v, str) and v else fallback()


def check_terms(terms: Optional[str], lang: str) -> str:
    """Check a ``terms`` option ("pinyin", "han", "vi"). With lang "en" the
    default is "pinyin"; lang "vi" is always "vi", "zh" always "han"."""
    if terms is not None and terms not in ("vi", "pinyin", "han"):
        raise ValueError('terms must be "pinyin", "han" or "vi", got %r' % (terms,))
    if lang == "vi":
        return "vi"
    if lang == "zh":
        return "han"
    return terms or "pinyin"


STEM_PINYIN = ["Jia", "Yi", "Bing", "Ding", "Wu", "Ji", "Geng", "Xin", "Ren", "Gui"]
BRANCH_PINYIN = ["Zi", "Chou", "Yin", "Mao", "Chen", "Si", "Wu", "Wei", "Shen", "You", "Xu", "Hai"]

# Tứ Hóa: pinyin, chữ Hán; chữ ngắn Việt, pinyin, Hán.
_TU_HOA_TEN = {
    "Hóa Lộc": ("Hua Lu", "化禄", "Lộc", "Lu", "禄"),
    "Hóa Quyền": ("Hua Quan", "化权", "Quyền", "Quan", "权"),
    "Hóa Khoa": ("Hua Ke", "化科", "Khoa", "Ke", "科"),
    "Hóa Kỵ": ("Hua Ji", "化忌", "Kỵ", "Ji", "忌"),
}


def term_name(vi: str, lang: str, terms: Optional[str] = None) -> str:
    """One stem, branch or Four-Transformation name in ``lang`` and ``terms``;
    any other term goes through ``term``."""
    t = check_terms(terms, lang)
    if vi in am_lich.THIEN_CAN:
        return vi if t == "vi" else STEM_PINYIN[am_lich.THIEN_CAN.index(vi)] if t == "pinyin" else term(vi, "zh")
    if vi in am_lich.DIA_CHI:
        return vi if t == "vi" else BRANCH_PINYIN[am_lich.DIA_CHI.index(vi)] if t == "pinyin" else term(vi, "zh")
    h = _TU_HOA_TEN.get(vi)
    if h:
        return vi if t == "vi" else h[0] if t == "pinyin" else h[1]
    return term(vi, lang)


def transformation_short(vi: str, lang: str, terms: Optional[str] = None) -> str:
    """Short Four-Transformation name: Lộc / Lu / 禄."""
    h = _TU_HOA_TEN.get(vi)
    if not h:
        return vi
    t = check_terms(terms, lang)
    return h[2] if t == "vi" else h[3] if t == "pinyin" else h[4]


def stem_branch_name(label: str, lang: str, terms: Optional[str] = None) -> str:
    """"Bính Ngọ" as "Bing Wu" (en, pinyin), "丙午" (zh or terms "han"),
    "Bính Ngọ" (vi or terms "vi")."""
    t = check_terms(terms, lang)
    p = label.split(" ")
    if len(p) == 2 and p[0] in am_lich.THIEN_CAN and p[1] in am_lich.DIA_CHI:
        if t == "vi":
            return label
        if t == "pinyin":
            return STEM_PINYIN[am_lich.THIEN_CAN.index(p[0])] + " " + BRANCH_PINYIN[am_lich.DIA_CHI.index(p[1])]
        return term(p[0], "zh") + term(p[1], "zh")
    return label if lang == "en" else term(label, lang)


def _stem_branch(label: str, lang: str, terms: Optional[str] = None) -> str:
    return stem_branch_name(label, lang, terms)


_DEM_THAY: Dict[str, tuple] = {}


def convert_terms(text: str, terms: str, extra: Optional[Dict[str, str]] = None, extra_key: str = "") -> str:
    """Rewrite the Vietnamese domain words left in an English sentence (stems,
    branches, sexagenary pairs, Four Transformations, solar terms, plus
    ``extra`` phrases) in ``terms``; longest match wins, whole words only."""
    khoa = terms + "|" + extra_key
    b = _DEM_THAY.get(khoa)
    if b is None:
        bang: Dict[str, str] = {}
        for t in am_lich.all_tiet_khi():
            bang[t["ten"]] = t["tenEn"]
        for vi, h in _TU_HOA_TEN.items():
            bang[vi] = vi if terms == "vi" else h[0] if terms == "pinyin" else h[1]
        for i, c in enumerate(am_lich.THIEN_CAN):
            bang[c] = c if terms == "vi" else STEM_PINYIN[i] if terms == "pinyin" else term(c, "zh")
            for j, z in enumerate(am_lich.DIA_CHI):
                if i % 2 == j % 2:
                    bang[c + " " + z] = stem_branch_name(c + " " + z, "en", terms)
        for j, z in enumerate(am_lich.DIA_CHI):
            bang[z] = z if terms == "vi" else BRANCH_PINYIN[j] if terms == "pinyin" else term(z, "zh")
        for k, v in (extra or {}).items():
            bang[k] = v
        keys = sorted(bang, key=lambda k: (-len(k), k))
        rx = re.compile(r"(?<![^\W_])(?:" + "|".join(re.escape(k) for k in keys) + r")(?![^\W_])")
        b = (rx, bang)
        if len(_DEM_THAY) > 32:
            _DEM_THAY.clear()
        _DEM_THAY[khoa] = b
    rx, bang = b
    return rx.sub(lambda m: bang.get(m.group(0), m.group(0)), unicodedata.normalize("NFC", text))


def _element(vi: str, lang: str) -> str:
    if lang == "vi" or not vi:
        return vi
    return (am_lich.HANH_EN if lang == "en" else am_lich.HANH_ZH).get(vi) or term(vi, lang)


def _zodiac(branch_index: int, lang: str, country: str = "VN") -> str:
    i = branch_index % 12
    if i == 3 and country != "VN":
        return {"vi": "Thỏ", "en": "Rabbit", "zh": "兔"}[lang]
    return term(am_lich.CON_GIAP[i], lang)


# ── Ngày giờ ─────────────────────────────────────────────────────────────

def _ngay_hop_le(y: int, m: int, d: int) -> bool:
    if not (1 <= m <= 12 and 1 <= d <= 31):
        return False
    sd = am_lich.jd_to_date(am_lich.jd_from_date(d, m, y))
    return (sd["day"], sd["month"], sd["year"]) == (d, m, y)


def parse_date(value: DateInput) -> Dict[str, int]:
    """Parse ``"YYYY-MM-DD"``, a ``datetime.date``/``datetime``, ``{"year", "month",
    "day"}`` or a ``(year, month, day)`` tuple. Raises ValueError on bad dates."""
    if isinstance(value, _dt.datetime):
        y, m, d = value.year, value.month, value.day
    elif isinstance(value, _dt.date):
        y, m, d = value.year, value.month, value.day
    elif isinstance(value, str):
        k = re.match(r"^\s*(-?\d{1,4})-(\d{1,2})-(\d{1,2})\s*$", value)
        if not k:
            raise ValueError('date must look like "YYYY-MM-DD", got %r' % (value,))
        y, m, d = int(k.group(1)), int(k.group(2)), int(k.group(3))
    elif isinstance(value, dict):
        y, m, d = value.get("year"), value.get("month"), value.get("day")
    elif isinstance(value, (tuple, list)) and len(value) == 3:
        y, m, d = value
    else:
        raise TypeError('date must be "YYYY-MM-DD", a date, a dict or a (y, m, d) tuple')
    if not all(isinstance(x, int) and not isinstance(x, bool) for x in (y, m, d)):
        raise TypeError("date needs integer year, month and day")
    if not _ngay_hop_le(y, m, d):
        raise ValueError("no such date: %s-%s-%s" % (y, m, d))
    return {"year": y, "month": m, "day": d}


def _iso(d: Dict[str, int]) -> str:
    return "%04d-%02d-%02d" % (d["year"], d["month"], d["day"])


def parse_time(value: Union[str, int, None]) -> Optional[Dict[str, int]]:
    """Parse ``"20:00"``, ``"8:05"``, ``"20"`` or ``20``; ``None`` means unknown."""
    if value is None or value == "":
        return None
    if isinstance(value, bool):
        raise TypeError("time must be \"HH:MM\", an hour number, or None")
    if isinstance(value, int):
        h, mi = value, 0
    elif isinstance(value, str):
        k = re.match(r"^\s*(\d{1,2})(?::(\d{2}))?(?::\d{2})?\s*$", value)
        if not k:
            raise ValueError('time must look like "HH:MM", got %r' % (value,))
        h, mi = int(k.group(1)), int(k.group(2) or 0)
    else:
        raise TypeError("time must be \"HH:MM\", an hour number, or None")
    if not (0 <= h <= 23 and 0 <= mi <= 59):
        raise ValueError("time out of range: %r" % (value,))
    return {"hour": h, "minute": mi}


def _hhmm(h: int, m: int) -> str:
    return "%02d:%02d" % (h, m)


def hour_branch(time: Union[str, int], lang: str = "en", terms: Optional[str] = None) -> Dict[str, Any]:
    """The double hour (canh giờ) of a clock time. Tý runs 23:00 to 00:59.
    Uses the package's own ``chi_gio_tu_gio_dong_ho``."""
    lang = _lang(lang)
    t = parse_time(time)
    if t is None:
        raise ValueError("hour_branch needs a time")
    i = bat_tu.chi_gio_tu_gio_dong_ho(t["hour"])
    dau = (i * 2 - 1) % 24
    return {"index": i, "name": term_name(am_lich.DIA_CHI[i], lang, terms), "animal": _zodiac(i, lang),
            "range": "%02d:00-%02d:59" % (dau, (dau + 1) % 24)}


def auspicious_hours(date: DateInput, lang: str = "en", terms: Optional[str] = None) -> Dict[str, Any]:
    """The twelve double hours of a day with the auspicious (hoàng đạo) or
    inauspicious (hắc đạo) flag and the presiding spirit, as Vietnamese
    almanacs print them. The hours depend only on the branch of the day;
    clock ranges are Vietnam time. Same keys as the TypeScript
    ``auspiciousHours``.

    >>> r = auspicious_hours("2027-02-06")
    >>> r["day"], [h["range"] for h in r["hours"] if h["auspicious"]][:2]
    ('Bing Chen', ['03:00-04:59', '07:00-08:59'])
    >>> r["hours"][4]["spirit"], auspicious_hours("2027-02-06", lang="vi")["hours"][4]["spirit"]
    ('Qing Long', 'Thanh Long')
    """
    lang = _lang(lang)
    t = check_terms(terms, lang)
    d = parse_date(date)
    raw = _gio_hoang_dao_kem_than(d["day"], d["month"], d["year"])
    hours = []
    for i, g in enumerate(raw["gio"]):
        dau = (i * 2 - 1) % 24
        hours.append({
            "index": i,
            "branch": term_name(g["chi"], lang, t),
            "animal": _zodiac(i, lang),
            "range": "%02d:00-%02d:59" % (dau, (dau + 1) % 24),
            "auspicious": g["hoangDao"],
            "spirit": g["than"] if t == "vi" else HOUR_SPIRIT_PINYIN[g["thuTuThan"]] if t == "pinyin" else g["thanZh"],
            "spiritIndex": g["thuTuThan"],
        })
    return {"date": _iso(d), "day": stem_branch_name(raw["canChiNgay"], lang, t),
            "dayBranch": term_name(raw["chiNgay"], lang, t), "hours": hours, "lang": lang}


def _country(country: Optional[str], time_zone: Optional[float]) -> tuple:
    c = (country or "VN").upper()
    if time_zone is not None:
        return c, float(time_zone)
    tz = am_lich.MUI_GIO_THEO_NUOC.get(c)
    if tz is None:
        raise ValueError("unsupported country %r; use one of %s or pass time_zone"
                         % (country, ", ".join(am_lich.MUI_GIO_THEO_NUOC)))
    return c, tz


def _num(x: float) -> Union[int, float]:
    return int(x) if float(x).is_integer() else x


# ── Âm lịch ──────────────────────────────────────────────────────────────

def _pillar(stem_index: int, branch_index: int, lang: str, terms: Optional[str] = None) -> Dict[str, Any]:
    s, b = stem_index % 10, branch_index % 12
    hanh, _, ten = am_lich.ngu_hanh_nap_am(s, b)
    return {
        "label": _stem_branch(am_lich.THIEN_CAN[s] + " " + am_lich.DIA_CHI[b], lang, terms),
        "stem": term_name(am_lich.THIEN_CAN[s], lang, terms),
        "branch": term_name(am_lich.DIA_CHI[b], lang, terms),
        "stemIndex": s,
        "branchIndex": b,
        "stemElement": _element(am_lich.CAN_NGU_HANH[s], lang),
        "branchElement": _element(am_lich.chi_to_ngu_hanh(am_lich.DIA_CHI[b])[0], lang),
        "naYin": term(ten, lang),
        "naYinElement": _element(hanh, lang),
    }


def day_pillar(date: DateInput, lang: str = "en", terms: Optional[str] = None) -> Dict[str, Any]:
    """The day pillar (can chi of the day); independent of time zone."""
    d = parse_date(date)
    cc = am_lich.day_can_chi(d["day"], d["month"], d["year"])
    return _pillar(am_lich.THIEN_CAN.index(cc["can"]), am_lich.DIA_CHI.index(cc["chi"]), _lang(lang), terms)


def year_pillar(lunar_year: int, lang: str = "en", terms: Optional[str] = None) -> Dict[str, Any]:
    """The pillar of a LUNAR year (2026 is Bính Ngọ)."""
    cc = am_lich.year_can_chi(lunar_year)
    return _pillar(am_lich.THIEN_CAN.index(cc["can"]), am_lich.DIA_CHI.index(cc["chi"]), _lang(lang), terms)


def to_lunar(date: DateInput, country: Optional[str] = None, time_zone: Optional[float] = None,
             lang: str = "en", terms: Optional[str] = None) -> Dict[str, Any]:
    """Gregorian date to the lunar calendar of a country (default Vietnam, UTC+7).
    Wraps ``solar_to_lunar``. ``terms`` ("pinyin" default, "han", "vi") sets how
    stem-branch names are written in English."""
    lang = _lang(lang)
    terms = check_terms(terms, lang)
    d = parse_date(date)
    c, tz = _country(country, time_zone)
    l = am_lich.solar_to_lunar(d["day"], d["month"], d["year"], tz)
    return {
        "year": l["year"], "month": l["month"], "day": l["day"], "leap": l["leap"],
        "solarDate": _iso(d), "country": c, "timeZone": _num(tz),
        "yearName": _stem_branch(am_lich.year_can_chi(l["year"])["label"], lang, terms),
        "monthName": _stem_branch(am_lich.lunar_month_can_chi(l["month"], l["year"])["label"], lang, terms),
        "dayName": _stem_branch(am_lich.day_can_chi(d["day"], d["month"], d["year"])["label"], lang, terms),
        "zodiac": _zodiac((l["year"] - 4) % 12, lang, c),
        "solarTerm": solar_term_on(d, country=c, time_zone=tz, lang=lang)["current"]["name"],
        "lang": lang,
    }


def to_solar(year: int, month: int, day: int, leap: bool = False, country: Optional[str] = None,
             time_zone: Optional[float] = None) -> Dict[str, Any]:
    """Lunar date back to Gregorian. Raises ValueError when the lunar date does
    not exist (no such leap month, or day 30 of a 29-day month)."""
    _, tz = _country(country, time_zone)
    ten = "%s-%s%s-%s" % (year, month, " (leap)" if leap else "", day)
    if not (1 <= month <= 12 and 1 <= day <= 30):
        raise ValueError("no such lunar date: " + ten)
    sd, ok = am_lich.lunar_to_solar(day, month, year, bool(leap), tz)
    if not ok:
        raise ValueError("no such lunar date: %s (that year has no such leap month)" % ten)
    k = am_lich.solar_to_lunar(sd["day"], sd["month"], sd["year"], tz)
    if (k["day"], k["month"], k["year"], k["leap"]) != (day, month, year, bool(leap)):
        raise ValueError("no such lunar date: %s (the month has only 29 days)" % ten)
    return {"day": sd["day"], "month": sd["month"], "year": sd["year"], "date": _iso(sd)}


@lru_cache(maxsize=512)
def _moc_nam(year: int) -> tuple:
    return tuple(am_lich.moc_tiet_khi_trong_nam(year))


def _ten_tiet(ten: str, ten_en: str, lang: str) -> str:
    if lang == "vi":
        return ten
    if lang == "en":
        return ten_en
    return term(ten, "zh", ten_en)


def solar_terms(year: int, country: Optional[str] = None, time_zone: Optional[float] = None,
                lang: str = "en") -> List[Dict[str, Any]]:
    """The 24 solar-term moments that fall in a Gregorian year, local time of
    the chosen country. Wraps ``moc_tiet_khi_trong_nam`` (UTC+7, shifted)."""
    lang = _lang(lang)
    _, tz = _country(country, time_zone)
    lech = int(round((tz - am_lich.TIME_ZONE_VN) * 60))
    out = []
    for m in _moc_nam(year):
        phut = m["gio"] * 60 + m["phut"] + lech
        jd = am_lich.jd_from_date(m["ngay"]["day"], m["ngay"]["month"], m["ngay"]["year"]) + phut // 1440
        phut %= 1440
        out.append({
            "index": m["index"], "longitude": m["kinhDo"], "name": _ten_tiet(m["ten"], m["tenEn"], lang),
            "nameVi": m["ten"], "kind": "jie" if m["laTiet"] else "qi",
            "date": _iso(am_lich.jd_to_date(jd)), "time": _hhmm(phut // 60, phut % 60), "timeZone": _num(tz),
        })
    return out


def solar_term_on(date: DateInput, country: Optional[str] = None, time_zone: Optional[float] = None,
                  lang: str = "en") -> Dict[str, Dict[str, Any]]:
    """The solar term in effect on a date (by local date) and the next one."""
    d = _iso(parse_date(date))
    y = int(d[:4])
    ds = solar_terms(y - 1, country, time_zone, lang) + solar_terms(y, country, time_zone, lang) \
        + solar_terms(y + 1, country, time_zone, lang)
    i = max(k for k, t in enumerate(ds) if t["date"] <= d)
    return {"current": ds[i], "next": ds[i + 1]}


# ── Tử Vi ────────────────────────────────────────────────────────────────

def _gender(g: Any) -> str:
    if g in ("male", "Male", "m", "M", "Nam", "nam"):
        return "male"
    if g in ("female", "Female", "f", "F", "Nữ", "nữ", "Nu", "nu"):
        return "female"
    raise ValueError('gender must be "male" or "female", got %r' % (g,))


# English codes of the core's minor-star groups (``nhom`` of the raw chart):
# "malefic" the six malefic stars, "auspicious" the six auspicious stars plus
# Lộc Tồn and Thiên Mã, "miscellaneous" every other minor star.
STAR_GROUP_EN = {"sat-tinh": "malefic", "cat-tinh": "auspicious", "tap-dieu": "miscellaneous"}

# English codes of the five yearly moving stars (the core's ``ma``).
YEARLY_STAR_CODE_EN = {
    "luu-thai-tue": "yearly-taisui", "luu-loc-ton": "yearly-lucun", "luu-kinh-duong": "yearly-qingyang",
    "luu-da-la": "yearly-tuoluo", "luu-thien-ma": "yearly-tianma",
}

_KIND = {"chinh-tinh": "major", "phu-tinh": "minor", "truong-sinh": "growth",
         "thai-tue": "year-ring", "bac-sy": "scholar"}

_GIO_TY = {
    "vi": "Sinh giờ Tý (23h tới 0h59): lá số giữ đúng ngày dương đã nhập kể cả sau 23h; có sách tính sang ngày hôm sau, muốn theo cách ấy thì nhập ngày hôm sau.",
    "en": "Born in the Tý hour (23:00 to 00:59): the chart keeps the date you entered even after 23:00. Some texts count a birth after 23:00 as the next day; to follow them, enter the next day's date.",
    "zh": "子时（23 时至 0 时 59 分）出生：本命盘保留所输入的日期，23 时后出生亦然。有的书把 23 时后出生算作次日，如按此法，请输入次日日期。",
}
_LICH_VN = {"vi": "Ngày âm theo lịch Việt Nam (UTC+7).",
            "en": "The lunar date follows the Vietnamese calendar (UTC+7).",
            "zh": "农历日期按越南历（UTC+7）。"}
_PHAI_DAU = {"vi": "Lựa chọn phái khác mặc định: ",
             "en": "School options (not the default): ",
             "zh": "非默认的流派选项："}

# Khoá snake_case của lựa chọn phái (Python) và khoá camelCase (như bản TS).
_SCHOOLS_ZI_WEI = {"fire_bell": "fireBell", "leap_month": "leapMonth", "heavenly_kitchen": "heavenlyKitchen",
                   "injury_messenger": "injuryMessenger"}
_SCHOOLS_BAZI = {"zi_hour": "ziHour"}


def _schools_camel(schools: Optional[Dict], snake: Dict[str, str]) -> Optional[Dict]:
    """Nhận khoá camelCase (fireBell) hay snake_case (fire_bell), trả camelCase."""
    if not isinstance(schools, dict):
        return schools
    return {snake.get(k, k): v for k, v in schools.items()}


def school_note(schools: Optional[Dict], lang: str) -> str:
    """Sentence listing the non-default school options ("" for a default chart)."""
    ds = tu_vi_schools.school_lines(schools, lang)
    if not ds:
        return ""
    return _PHAI_DAU["zh"] + "；".join(ds) + "。" if lang == "zh" else _PHAI_DAU[lang] + "; ".join(ds) + "."


def _ten_sao(s: Dict, lang: str) -> str:
    if lang == "vi":
        return s["ten"]
    if lang == "en":
        return star_en(s["ten"], s.get("tenEn") or term(s["ten"], "en"))
    if s.get("tenZh"):
        return s["tenZh"]
    t = _tu_vung().get(s["ten"])
    if t and (not s.get("tenEn") or t[0] == s["tenEn"]):
        return t[1]
    return s.get("tenEn") or s["ten"]  # TODO(zh): lõi chưa có chữ Trung cho sao này.


def _ten_cung(c: Dict, lang: str) -> str:
    return _pick(c, "tenCung", lang, lambda: term(c["tenCung"], lang, c.get("tenCungEn")))


def _localize_zi_wei(raw: Dict, lang: str, time: Optional[str], view_year: Optional[int],
                     terms: Optional[str] = None) -> Dict[str, Any]:
    tm = check_terms(terms, lang)
    en = lang == "en"
    chi = am_lich.DIA_CHI.index(raw["gioSinh"])
    h = hour_branch(chi * 2, lang, tm)
    palaces = []
    for c in raw["cung"]:
        stars = []
        for s in c["sao"]:
            r: Dict[str, Any] = {"name": _ten_sao(s, lang), "nameVi": s["ten"], "kind": _KIND[s["loai"]]}
            if s.get("nhom"):
                r["group"] = STAR_GROUP_EN[s["nhom"]]
            if s.get("mieuVuong"):
                r["brightness"] = _pick(s, "mieuVuong", lang, lambda s=s: term(s["mieuVuong"], lang, s.get("mieuVuongEn")))
            if s.get("tuHoa"):
                r["transformation"] = term_name(s["tuHoa"], lang, tm) if en else \
                    _pick(s, "tuHoa", lang, lambda s=s: term(s["tuHoa"], lang))
            stars.append(r)
        palaces.append({
            "index": c["viTri"],
            "branch": term_name(c["chi"], lang, tm) if en else _pick(c, "chi", lang, lambda c=c: term(c["chi"], lang)),
            "stemBranch": _stem_branch(c["canChi"], lang, tm) if en else
            _pick(c, "canChi", lang, lambda c=c: _stem_branch(c["canChi"], lang)),
            "name": _ten_cung(c, lang), "nameVi": c["tenCung"],
            "isLife": c["viTri"] == raw["cungMenh"], "isBody": c["laThan"],
            "tuan": c["tuanTrung"], "triet": c["trietLo"], "stars": stars,
        })
    if time is None:
        note = _LICH_VN[lang]
    elif lang == "vi":
        note = "Giờ sinh %s thuộc giờ %s (%s). %s" % (time, h["name"], h["range"], _LICH_VN[lang])
    elif lang == "en":
        note = "Birth time %s falls in the %s double hour (%s). %s" % (time, h["name"], h["range"], _LICH_VN[lang])
    else:
        note = "出生时间 %s 属%s时（%s）。%s" % (time, h["name"], h["range"], _LICH_VN[lang])
    notes = [note] + ([_tv_en_text(_GIO_TY["en"], tm) if en else _GIO_TY[lang]] if chi == 0 else [])
    phai = school_note(raw.get("schools"), lang)
    if phai:
        notes.append(phai)
    sd, al = raw["ngaySinhDuong"], raw["ngaySinhAm"]
    chart = {
        "lang": lang, "terms": tm, "name": raw["hoTen"], "gender": "female" if raw["gioiTinh"] == "Nữ" else "male",
        "solarDate": "%04d-%02d-%02d" % (sd["nam"], sd["thang"], sd["ngay"]), "time": time, "hour": h,
        "lunar": {"year": al["year"], "month": al["month"], "day": al["day"], "leap": al["leap"]},
        "yearPillar": _stem_branch(raw["canChiNam"], lang, tm) if en else
        _pick(raw, "canChiNam", lang, lambda: _stem_branch(raw["canChiNam"], lang)),
        "yinYang": _pick(raw, "amDuongMenh", lang, lambda: term(raw["amDuongMenh"], lang)),
        "bureau": {"number": raw["cuc"], "name": _pick(raw, "tenCuc", lang, lambda: term(raw["tenCuc"], lang))},
        "naYin": _pick(raw, "banMenhNapAm", lang, lambda: term(raw["banMenhNapAm"], lang)),
        "lifePalace": raw["cungMenh"], "bodyPalace": raw["cungThan"], "palaces": palaces,
        "viewYear": view_year if view_year is not None else _dt.date.today().year,
        "notes": notes, "raw": raw,
    }
    if raw.get("schools"):
        chart["schools"] = dict(raw["schools"])
    return chart


def cast_zi_wei(date: DateInput, gender: str, time: Union[str, int, None] = None,
                hour_branch_index: Optional[int] = None, name: str = "", lang: str = "en",
                view_year: Optional[int] = None, terms: Optional[str] = None,
                schools: Optional[Dict[str, str]] = None) -> Dict[str, Any]:
    """Cast a Zi Wei Dou Shu (Tử Vi) chart.

    ``time`` is the clock time ``"HH:MM"``, mapped to its double hour (Tý is
    23:00 to 00:59); or give ``hour_branch_index`` (0 = Tý ... 11 = Hợi).
    With ``lang="en"``, ``terms`` sets how stems, branches, the Four
    Transformations and the voids are written: "pinyin" (default), "han", "vi".
    The keys of the result are the same as the TypeScript ``castZiWei``.

    ``schools``: school options where the books disagree, keys camelCase or
    snake_case: ``fireBell`` / ``fire_bell`` (vietnamese, quanshu,
    swap-for-female, swap-for-yin-male-yang-female), ``leapMonth`` (whole,
    split-at-15, next-month), ``transformations`` (vietnamese, quanshu,
    zhongzhou), ``heavenlyKitchen`` (vietnamese, chinese), ``injuryMessenger``
    (standard, zhongzhou). Omitted: the default chart. An unknown key or value
    raises ValueError. See docs/schools.md.

    Example: ``cast_zi_wei("1990-09-19", "male", time="20:00", schools={"fire_bell": "quanshu"})``
    """
    lang = _lang(lang)
    terms = check_terms(terms, lang)
    d = parse_date(date)
    g = _gender(gender)
    t = parse_time(time)
    if t is not None:
        chi = bat_tu.chi_gio_tu_gio_dong_ho(t["hour"])
        if hour_branch_index is not None and hour_branch_index != chi:
            raise ValueError("time %s is branch %d, but hour_branch_index %d was given"
                             % (_hhmm(t["hour"], t["minute"]), chi, hour_branch_index))
    elif hour_branch_index is not None:
        chi = hour_branch_index
        if not isinstance(chi, int) or not 0 <= chi <= 11:
            raise ValueError("hour_branch_index must be an integer 0 (Tý) to 11 (Hợi)")
    else:
        raise ValueError('Zi Wei needs the birth hour: pass time ("HH:MM") or hour_branch_index (0-11)')
    raw = tu_vi.lap_la_so_tu_vi(name or "", "Nữ" if g == "female" else "Nam", d["day"], d["month"], d["year"], chi,
                                _schools_camel(schools, _SCHOOLS_ZI_WEI))
    return _localize_zi_wei(raw, lang, _hhmm(t["hour"], t["minute"]) if t else None, view_year, terms)


def _box(chart: Dict, lang: Optional[str], terms: Optional[str] = None) -> tuple:
    if "raw" in chart and "palaces" in chart:
        l = _lang(lang or chart["lang"])
        tm = terms if terms is not None else (chart.get("terms") if l == chart["lang"] else None)
        return chart["raw"], l, chart["viewYear"], check_terms(tm, l)
    if "cung" in chart:
        l = _lang(lang)
        return chart, l, _dt.date.today().year, check_terms(terms, l)
    raise TypeError("expected a chart from cast_zi_wei (or lap_la_so_tu_vi)")


def _cung_tai(raw: Dict, i: int, lang: str) -> str:
    return _ten_cung(raw["cung"][i % 12], lang)


def decade_luck(chart: Dict, lang: Optional[str] = None, terms: Optional[str] = None) -> List[Dict[str, Any]]:
    """The twelve ten-year periods (ages are East Asian ages). Wraps ``dai_van``."""
    raw, lang, _, terms = _box(chart, lang, terms)
    out = []
    for c in tu_vi.dai_van(raw):
        out.append({
            "order": c["thu"], "palaceIndex": c["viTri"], "branch": term_name(c["chi"], lang, terms),
            "palace": _cung_tai(raw, c["viTri"], lang), "fromAge": c["tuTuoi"], "toAge": c["denTuoi"],
            "fromYear": raw["ngaySinhAm"]["year"] + c["tuTuoi"] - 1,
            "toYear": raw["ngaySinhAm"]["year"] + c["denTuoi"] - 1,
            "majorStars": [_ten_sao(s, lang) for s in raw["cung"][c["viTri"]]["sao"] if s["loai"] == "chinh-tinh"],
        })
    return out


def _ten_sao_theo_ten(raw: Dict, ten: str, lang: str) -> str:
    for c in raw["cung"]:
        for s in c["sao"]:
            if s["ten"] == ten:
                return _ten_sao(s, lang)
    return term(ten, lang)


def yearly_luck(chart: Dict, year: Optional[int] = None, lang: Optional[str] = None,
                terms: Optional[str] = None) -> Dict[str, Any]:
    """Facts of a viewing year (default: the chart's ``viewYear``). Wraps ``tinh_han_nam``."""
    raw, lang, vy, terms = _box(chart, lang, terms)
    nam = vy if year is None else year
    h = tu_vi.tinh_han_nam(raw, nam)
    dv = None
    if h["daiVanTenCung"]:
        idx = next(c["viTri"] for c in raw["cung"] if c["tenCung"] == h["daiVanTenCung"])
        dv = {"fromAge": h["daiVanTuTuoi"], "toAge": h["daiVanDenTuoi"], "palace": _cung_tai(raw, idx, lang)}
    return {
        "year": h["nam"],
        "yearPillar": _stem_branch(h["canChiNam"], lang, terms),
        "age": h["tuoiMu"],
        "yearPalace": {"index": h["luuNienViTri"], "branch": term_name(h["luuNienChi"], lang, terms),
                       "palace": _cung_tai(raw, h["luuNienViTri"], lang)},
        "minorLimit": {"index": h["tieuVanViTri"], "branch": term_name(h["tieuVanChi"], lang, terms),
                       "palace": _cung_tai(raw, h["tieuVanViTri"], lang)},
        "decade": dv,
        "transformations": [{
            "type": term_name(x["hoa"], lang, terms),
            "star": _ten_sao_theo_ten(raw, x["sao"], lang),
            "palaceIndex": x["viTri"] if x["coTrenLaSo"] else None,
            "palace": _cung_tai(raw, x["viTri"], lang) if x["coTrenLaSo"] else None,
        } for x in h["luuTuHoa"]],
        "months": [{"month": t["thang"], "index": t["viTri"], "branch": term_name(t["chi"], lang, terms),
                    "palace": _cung_tai(raw, t["viTri"], lang)} for t in h["nguyetHan"]["thang"]],
    }


_QUAN_HE = {"dong-cung": "same-palace", "xung-chieu": "opposite", "tam-hop": "trine", "": ""}


def yearly_stars(chart: Dict, year: Optional[int] = None, lang: Optional[str] = None,
                 terms: Optional[str] = None) -> List[Dict[str, Any]]:
    """The five yearly moving stars. Wraps ``tinh_sao_luu``."""
    raw, lang, vy, terms = _box(chart, lang, terms)
    nam = vy if year is None else year
    return [{
        "code": YEARLY_STAR_CODE_EN.get(s["ma"], s["ma"]),
        "name": s["ten"] if lang == "vi" else _tv_en_text(s["tenEn"], terms) if lang == "en" else s["tenZh"],
        "byStem": s["theoCan"], "palaceIndex": s["viTri"], "branch": term_name(s["chi"], lang, terms),
        "palace": _cung_tai(raw, s["viTri"], lang),
        "toYearPalace": _QUAN_HE.get(s["voiLuuNien"], s["voiLuuNien"]),
        "toMinorLimit": _QUAN_HE.get(s["voiTieuVan"], s["voiTieuVan"]),
        "toDecade": _QUAN_HE.get(s["voiDaiVan"], s["voiDaiVan"]),
    } for s in tu_vi.tinh_sao_luu(raw, nam)]


_NHOM = {"dinh-phu": "wealth", "dinh-quy": "rank", "dinh-ban-tien": "hardship"}


def find_patterns(chart: Dict, lang: Optional[str] = None, terms: Optional[str] = None) -> List[Dict[str, Any]]:
    """Recognise named patterns on a chart. Wraps ``nhan_dien_cach_cuc``."""
    raw, lang, _, terms = _box(chart, lang, terms)
    out = []
    for c in tu_vi.nhan_dien_cach_cuc(raw):
        vt = c.get("viTri", -1)
        sua = PATTERN_HAN_FIX.get(c["ten"])
        ten_zh = sua[0] if sua else c.get("tenZh")
        if lang == "zh":
            ten = ten_zh or c["ten"]
        elif lang == "en" and terms != "vi":
            ten = PATTERN_EN.get(c["ten"], c["ten"])
        else:
            ten = c["ten"]
        p: Dict[str, Any] = {
            "name": ten,
            "nameVi": c["ten"],
            "condition": c["dieuKien"] if lang == "vi" else _tv_en_text(c["dieuKienEn"], terms) if lang == "en"
            else c["dieuKienZh"],
            "description": c["moTa"] if lang == "vi" else _tv_en_text(c["moTaEn"], terms) if lang == "en"
            else c["moTaZh"],
            "palaceIndex": vt if vt >= 0 else None,
            "palace": _cung_tai(raw, vt, lang) if vt >= 0 else None,
            "hasVariants": c.get("coDiBan") is True,
        }
        if sua:
            p["nameHan"] = sua[1]
        elif c.get("tenHan"):
            p["nameHan"] = c["tenHan"]
        if c.get("nhom"):
            p["group"] = _NHOM.get(c["nhom"], c["nhom"])
        if c.get("chuVan"):
            p["quote"] = c["chuVan"]
        out.append(p)
    return out


# ── Bát Tự ───────────────────────────────────────────────────────────────

_TRU = ("year", "month", "day", "hour")
_QUY_UOC = {
    "vi": "Giờ sinh đọc theo giờ Việt Nam (UTC+7). Trụ năm đổi ở Lập Xuân, trụ tháng theo tiết khí, trụ ngày đổi lúc 23h (đầu giờ Tý).",
    "en": "Birth time is read as Vietnam time (UTC+7). The year pillar changes at Start of Spring, the month pillar at each sectional solar term, and the day pillar at 23:00 (start of the Tý hour).",
    "zh": "出生时间按越南时间（UTC+7）。年柱以立春为界，月柱按节气，日柱于 23 时（子时起点）换日。",
}
# _QUY_UOC của lá số theo lựa chọn ziHour "split-at-midnight".
_QUY_UOC_NUA_DEM = {
    "vi": "Giờ sinh đọc theo giờ Việt Nam (UTC+7). Trụ năm đổi ở Lập Xuân, trụ tháng theo tiết khí, trụ ngày đổi lúc nửa đêm (tách Tý sớm, Tý muộn: sinh từ 23h tới 24h giữ ngày đã nhập, trụ giờ là giờ Tý của ngày hôm sau).",
    "en": "Birth time is read as Vietnam time (UTC+7). The year pillar changes at Start of Spring, the month pillar at each sectional solar term, and the day pillar at midnight (early and late Tý: a birth from 23:00 to 24:00 keeps the date entered, and the hour pillar is the Tý hour of the next day).",
    "zh": "出生时间按越南时间（UTC+7）。年柱以立春为界，月柱按节气，日柱于午夜换日（分早晚子时：23 时至 24 时出生者仍用所输入的日期，时柱取次日的子时）。",
}
_KHONG_GIO = {
    "vi": "Chưa biết giờ sinh: không có trụ giờ và mệnh cung; tuổi khởi vận tạm tính từ 12h.",
    "en": "Birth time unknown: no hour pillar or life palace; the luck start is counted from noon.",
    "zh": "出生时辰未知：无时柱与命宫；起运岁数暂按中午计。",
}


# Chữ Việt còn trong câu tiếng Anh của lõi Bát Tự (thần sát, sách, phái).
_THAY_BAT_TU = {
    "The Bát Tự Văn Xương": "The BaZi Literary Glory",
    "the Tử Vi star of the same name": "the Zi Wei Dou Shu star of the same name",
    "Tử Bình": "Zi Ping",
    "Dương Nhận": "Yang Blade",
    "the Lộc": "the Prosperity Star",
}


def _bt_en_text(text: str, terms: str) -> str:
    return convert_terms(text, terms, _THAY_BAT_TU, "bat-tu")


def _tieng_tiet(ten: str, lang: str) -> str:
    if lang == "vi" or not ten:
        return ten
    t = next((x for x in am_lich.all_tiet_khi() if x["ten"] == ten), None)
    en = t["tenEn"] if t else ten
    return en if lang == "en" else term(ten, "zh", en)


def _tt(t: Dict, lang: str) -> str:
    return t["thapThanCan"] if lang == "vi" else t["thapThanCanEn"] if lang == "en" else t["thapThanCanZh"]


def _tru_co_ban(t: Dict, lang: str, terms: str) -> Dict[str, Any]:
    f = _pillar(am_lich.THIEN_CAN.index(t["can"]), am_lich.DIA_CHI.index(t["chi"]), lang, terms)
    p = lambda k, fb: _pick(t, k, lang, lambda: fb)  # noqa: E731
    # Bản Anh: can chi theo terms (lõi giữ tên Hán Việt), không lấy trường của lõi.
    en = lang == "en"
    f.update({"label": f["label"] if en else p("label", f["label"]), "stem": f["stem"] if en else p("can", f["stem"]),
              "branch": f["branch"] if en else p("chi", f["branch"]),
              "stemElement": p("canHanh", f["stemElement"]), "branchElement": p("chiHanh", f["branchElement"]),
              "naYin": p("napAmTen", f["naYin"]), "naYinElement": p("napAm", f["naYinElement"])})
    return f


def _mang(t: Dict, k: str, lang: str, fb: List[str]) -> List[str]:
    if lang == "vi":
        return list(fb)
    v = t.get(k + ("En" if lang == "en" else "Zh"))
    return list(v) if isinstance(v, list) and len(v) == len(fb) else [term(x, lang) for x in fb]


def _tru_day_du(t: Dict, lang: str, terms: str) -> Dict[str, Any]:
    r = _tru_co_ban(t, lang, terms)
    r.update({
        "tenGod": _tt(t, lang),
        "hiddenStems": [{
            "stem": term_name(h["can"], lang, terms) if lang == "en" else _pick(h, "can", lang, lambda h=h: term(h["can"], lang)),
            "element": _pick(h, "hanh", lang, lambda h=h: _element(h["hanh"], lang)),
            "role": _pick(h, "vaiTro", lang, lambda h=h: term(h["vaiTro"], lang)),
            "tenGod": h["thapThan"] if lang == "vi" else h.get("thapThanEn" if lang == "en" else "thapThanZh", ""),
        } for h in t["tangCan"]],
        "stage": _pick(t, "truongSinh", lang, lambda: term(t["truongSinh"], lang)),
        "selfStage": _pick(t, "tuToa", lang, lambda: term(t["tuToa"], lang)),
        "stars": _mang(t, "thanSat", lang, t["thanSat"]),
    })
    return r


def _localize_bazi(raw: Dict, lang: str, terms: Optional[str] = None) -> Dict[str, Any]:
    tm = check_terms(terms, lang)
    en = lang == "en"
    dv = raw["daiVan"]
    qu = _QUY_UOC_NUA_DEM if (raw.get("schools") or {}).get("ziHour") == "split-at-midnight" else _QUY_UOC
    notes = [_bt_en_text(qu["en"], tm) if en else qu[lang]]
    time = None
    if raw["coGioSinh"]:
        time = _hhmm(raw["gio"], raw["phut"])
        h = hour_branch(raw["gio"], lang, tm)
        notes.append({"vi": "Giờ %s thuộc giờ %s (%s).", "en": "%s falls in the %s double hour (%s).",
                      "zh": "%s 属%s时（%s）。"}[lang] % (time, h["name"], h["range"]))
    else:
        notes.append(_KHONG_GIO[lang])
    chart = {
        "lang": lang, "terms": tm, "gender": "female" if raw["gioiTinh"] == "Nữ" else "male",
        "solarDate": _iso(raw["ngaySinh"]), "time": time,
        "pillars": {"year": _tru_day_du(raw["truNam"], lang, tm), "month": _tru_day_du(raw["truThang"], lang, tm),
                    "day": _tru_day_du(raw["truNgay"], lang, tm),
                    "hour": _tru_day_du(raw["truGio"], lang, tm) if raw.get("truGio") else None},
        "dayMaster": {"stem": term_name(raw["nhatChu"], lang, tm) if en else
                      _pick(raw, "nhatChu", lang, lambda: term(raw["nhatChu"], lang)),
                      "element": _pick(raw, "nhatChuHanh", lang, lambda: _element(raw["nhatChuHanh"], lang)),
                      "yinYang": _pick(raw, "nhatChuAmDuong", lang, lambda: term(raw["nhatChuAmDuong"], lang))},
        "solarTerm": _tieng_tiet(raw["tietKhi"], lang),
        "monthTerm": _tieng_tiet(raw["tietDauThang"], lang),
        "pillarYear": raw["namTruNam"],
        "conception": _tru_co_ban(raw["thaiNguyen"], lang, tm),
        "lifePalace": _tru_co_ban(raw["menhCung"], lang, tm) if raw.get("menhCung") else None,
        "symbolicStars": [{
            "name": _pick(s, "ten", lang, lambda s=s: term(s["ten"], lang)),
            "branches": [term_name(x, lang, tm) for x in s["chiDich"]] if en else _mang(s, "chiDich", lang, s["chiDich"]),
            "pillars": [_TRU[v] for v in s["viTri"]],
            "lookup": s["traTheo"] if lang == "vi" else _bt_en_text(s["traTheoEn"], tm) if en else s["traTheoZh"],
            "variants": s["loiKhac"] if lang == "vi" else _bt_en_text(s["loiKhacEn"], tm) if en else s["loiKhacZh"],
        } for s in raw["thanSat"]],
        "luck": {
            "direction": "forward" if dv["thuan"] else "backward",
            "term": {"name": _pick(dv, "tietMoc", lang, lambda: _tieng_tiet(dv["tietMoc"], lang)),
                     "date": _iso(dv["tietMocNgay"]) if dv["tietMocNgay"]["year"] else "",
                     "time": _hhmm(dv["tietMocGio"], dv["tietMocPhut"])},
            "days": dv["soNgay"],
            "startAge": {"years": dv["tuoiKhoiNam"], "months": dv["tuoiKhoiThang"]},
            "startDate": _iso(dv["ngayKhoiVan"]) if dv["ngayKhoiVan"]["year"] else "",
            "explanation": dv["lyDo"] if lang == "vi" else _bt_en_text(dv["lyDoEn"], tm) if en else dv["lyDoZh"],
            "pillars": [dict(_tru_co_ban(v, lang, tm), order=v["thuTu"], tenGod=_tt(v, lang),
                             stage=_pick(v, "truongSinh", lang, lambda v=v: term(v["truongSinh"], lang)),
                             fromAge=v["tuoiTu"], fromYear=v["namTu"], toYear=v["namDen"])
                        for v in dv["cacVan"]],
        },
        "notes": notes, "raw": raw,
    }
    if raw.get("schools"):
        chart["schools"] = dict(raw["schools"])
    return chart


def cast_bazi(date: DateInput, gender: str, time: Union[str, int, None] = None, lang: str = "en",
              terms: Optional[str] = None, schools: Optional[Dict[str, str]] = None) -> Dict[str, Any]:
    """Cast a BaZi (Four Pillars) chart. ``time`` is the clock time (Vietnam
    time) or None when unknown; the day pillar turns at 23:00 unless
    ``schools`` is ``{"ziHour": "split-at-midnight"}`` (also ``zi_hour``):
    early and late Zi, the day pillar turns at midnight. With
    ``lang="en"``, ``terms`` is "pinyin" (default), "han" or "vi"."""
    lang = _lang(lang)
    terms = check_terms(terms, lang)
    d = parse_date(date)
    g = _gender(gender)
    t = parse_time(time)
    raw = bat_tu.lap_la_so_bat_tu(d["day"], d["month"], d["year"], t["hour"] if t else None,
                                  t["minute"] if t else 0, "Nữ" if g == "female" else "Nam",
                                  _schools_camel(schools, _SCHOOLS_BAZI))
    return _localize_bazi(raw, lang, terms)


def minor_luck(chart: Dict, year: int, lang: Optional[str] = None, terms: Optional[str] = None) -> Optional[Dict[str, Any]]:
    """The minor luck pillar (tiểu vận) of a year; None without a birth time."""
    co_raw = "raw" in chart
    raw = chart["raw"] if co_raw else chart
    lang = _lang(lang or (chart.get("lang") if co_raw else None))
    tm = check_terms(terms if terms is not None else (chart.get("terms") if co_raw and chart.get("lang") == lang else None), lang)
    tv = bat_tu.tinh_tieu_van_bat_tu(raw, year)
    if not tv:
        return None
    r = _tru_co_ban(tv, lang, tm)
    r.update({"year": tv["nam"], "age": tv["tuoiMu"], "tenGod": _tt(tv, lang)})
    return r


# ── Thần số học ──────────────────────────────────────────────────────────

NUMEROLOGY_LABELS = {
    "vi": {"lifePath": "Số chủ đạo", "expression": "Số sứ mệnh", "soulUrge": "Số linh hồn",
           "personality": "Số nhân cách", "attitude": "Số thái độ", "birthday": "Số ngày sinh",
           "maturity": "Số trưởng thành", "personalYear": "Năm cá nhân", "personalMonth": "Tháng cá nhân",
           "personalDay": "Ngày cá nhân", "pinnacles": "Đỉnh cao", "challenges": "Thách thức",
           "karmicDebt": "Nợ nghiệp", "grid": "Biểu đồ ngày sinh"},
    "en": {"lifePath": "Life Path", "expression": "Expression (Destiny)", "soulUrge": "Soul Urge",
           "personality": "Personality", "attitude": "Attitude", "birthday": "Birthday",
           "maturity": "Maturity", "personalYear": "Personal Year", "personalMonth": "Personal Month",
           "personalDay": "Personal Day", "pinnacles": "Pinnacles", "challenges": "Challenges",
           "karmicDebt": "Karmic Debt", "grid": "Birth chart grid"},
    "zh": {"lifePath": "生命灵数", "expression": "使命数", "soulUrge": "灵魂数", "personality": "人格数",
           "attitude": "态度数", "birthday": "生日数", "maturity": "成熟数", "personalYear": "个人年数",
           "personalMonth": "个人月数", "personalDay": "个人日数", "pinnacles": "巅峰数",
           "challenges": "挑战数", "karmicDebt": "业力债数", "grid": "出生日期九宫格"},
}


def numerology(name: str, birth_date: DateInput, today: Optional[DateInput] = None, lang: str = "en") -> Dict[str, Any]:
    """Pythagorean numerology profile (master numbers 11, 22, 33 kept).
    ``today`` (default: today) sets the personal year, month and day."""
    lang = _lang(lang)
    if not isinstance(name, str) or not name.strip():
        raise ValueError("name must be a non-empty string")
    b = parse_date(birth_date)
    t = parse_date(today if today is not None else _dt.date.today())
    r = than_so_hoc.tinh_ho_so_than_so_hoc_sau(name, b["day"], b["month"], b["year"], t["year"], t["month"], t["day"])
    p, c = r["soDinhCao"], r["soThachThuc"]
    return {
        "lang": lang, "name": name, "birthDate": _iso(b), "today": _iso(t),
        "lifePath": r["soDuongDoi"], "expression": r["soSuMenh"], "soulUrge": r["soLinhHon"],
        "personality": r["soNhanCach"], "attitude": r["soThaiDo"], "birthday": r["soNgaySinh"],
        "maturity": r["soTruongThanh"], "personalYear": r["soNamCaNhan"], "personalMonth": r["soThangCaNhan"],
        "personalDay": r["soNgayCaNhan"], "grid": dict(r["luoiPythago"]),
        "pinnacles": [{"number": p["dinh1"], "toAge": p["tuoiKetThucDinh1"]},
                      {"number": p["dinh2"], "toAge": p["tuoiKetThucDinh2"]},
                      {"number": p["dinh3"], "toAge": p["tuoiKetThucDinh3"]},
                      {"number": p["dinh4"], "toAge": None}],
        "challenges": [c["thachThuc1"], c["thachThuc2"], c["thachThuc3"], c["thachThuc4"]],
        "karmicDebt": r.get("soNoNghiepNgaySinh"),
        "labels": NUMEROLOGY_LABELS[lang], "raw": r,
    }


# ── Lễ hội ───────────────────────────────────────────────────────────────

FESTIVAL_GROUP_EN = {"le-tet": "holiday", "tin-nguong": "folk-religion", "khac": "other"}
FESTIVAL_SCOPE_EN = {"quoc-gia": "national", "vung": "regional", "dia-phuong": "local", "dai-dien": "representative", "": ""}


def _o_ds(s: str) -> List[str]:
    """Split one list cell of the dataset ("a; b; c"); an empty cell gives []."""
    return s.split("; ") if s else []


def festival_places(le: Dict, lang: str = "en") -> Dict[str, Any]:
    """Provinces, nationwide flag, ethnic groups and venues of one dataset row,
    in ``lang`` (the ``provinces``, ``nationwide``, ``ethnicGroups`` and
    ``venues`` of ``festivals``)."""
    lang = _lang(lang)
    tinh = {p["code"]: p for p in le_hoi.provinces()}
    provinces = [{"code": c, "name": tinh[c][lang] if c in tinh else c} for c in _o_ds(le.get("tinh", ""))]
    ethnic = _o_ds(le.get("dan_toc", "") if lang == "vi" else (le.get("dan_toc_en") or le.get("dan_toc", "")) if lang == "en"
                   else (le.get("dan_toc_zh") or le.get("dan_toc", "")))
    vi = _o_ds(le.get("noi_to_chuc", ""))
    local = _o_ds(le.get("noi_to_chuc", "") if lang == "vi" else le.get("noi_to_chuc_%s" % lang, ""))
    coords, sources = _o_ds(le.get("toa_do", "")), _o_ds(le.get("toa_do_nguon", ""))
    venues = []
    for i, name in enumerate(vi):
        c = (coords[i] if i < len(coords) else "").split(",")
        src = sources[i] if i < len(sources) else ""
        ok = len(c) == 2 and c[0] != "" and bool(src)
        venues.append({"name": (local[i] if i < len(local) and local[i] else name),
                       "coordinates": {"lat": float(c[0]), "lon": float(c[1])} if ok else None,
                       "sourceUrl": src if ok else None})
    return {"provinces": provinces, "nationwide": le.get("toan_quoc") == "co", "ethnicGroups": ethnic, "venues": venues}


def festivals(year: int, lang: str = "en") -> List[Dict[str, Any]]:
    """Festivals with a fixed date (lunar or Gregorian) in a year, sorted by
    date. The dataset holds 206 festivals: 164 have a fixed lunar or Gregorian
    date and are returned for every year; the other 42 are dated by their
    organisers each year and are not included (see ``lich_cong_bo``).
    ``group`` ("holiday", "folk-religion", "other") and ``scope`` ("national",
    "regional", "local", "representative", "") are English codes in every
    ``lang``; the dataset codes stay in ``raw``. ``provinces``,
    ``nationwide``, ``ethnicGroups`` and ``venues`` come from ``festival_places``."""
    lang = _lang(lang)
    if not isinstance(year, int) or isinstance(year, bool):
        raise TypeError("year must be an integer")
    out = []
    for le in le_hoi.danh_sach_le_hoi():
        sd = le_hoi.ngay_duong_cua_le(le, year)
        if not sd:
            continue
        am = le["loai_ngay"] == "lunar"
        f = {
            "id": le["id"], "date": _iso(sd),
            "name": le["ten"] if lang == "vi" else (le["ten_en"] or le["ten"]) if lang == "en"
            else (le["ten_zh"] or le["ten_en"] or le["ten"]),
            "description": le["mo_ta"] if lang == "vi" else (le["mo_ta_en"] or le["mo_ta"]) if lang == "en"
            else (le["mo_ta_zh"] or le["mo_ta_en"] or le["mo_ta"]),
            "calendar": "lunar" if am else "solar",
            "fixedDate": le["ngay_am"] if am else le["ngay_duong"],
            "level": le["muc_do"],
            "group": FESTIVAL_GROUP_EN.get(le["nhom"], "other"),
            "scope": FESTIVAL_SCOPE_EN.get(le["pham_vi"], ""),
            "publicHoliday": le["ngay_nghi_le"] == "co",
            "daysBefore": int(le.get("ngay_truoc") or 0), "daysAfter": int(le.get("ngay_sau") or 0),
        }
        f.update(festival_places(le, lang))
        f["raw"] = le
        out.append(f)
    out.sort(key=lambda f: f["date"])  # sort của Python ổn định: cùng ngày giữ thứ tự bộ dữ liệu
    return out


_ICS_TEN = {"vi": "Lễ hội Việt Nam", "en": "Vietnamese festivals", "zh": "越南节庆"}
_ICS_NGUON = {"vi": "Dữ liệu: Nhật Nguyệt (nhatnguyet.org), bộ dữ liệu mở le-hoi-viet-nam",
              "en": "Data: Nhat Nguyet (nhatnguyet.org), open dataset le-hoi-viet-nam",
              "zh": "数据：Nhat Nguyet (nhatnguyet.org)，开放数据集 le-hoi-viet-nam"}
_ICS_CHINH = {"vi": "Chính hội", "en": "Main day", "zh": "正日"}


def _ics_text(s: str) -> str:
    return s.replace("\\", "\\\\").replace(";", "\\;").replace(",", "\\,").replace("\r\n", "\\n").replace("\n", "\\n")


def _ics_fold(line: str) -> str:
    out, cur, n = [], "", 0
    for ch in line:
        k = len(ch.encode("utf-8"))
        if n + k > (75 if not out else 74):
            out.append(cur)
            cur, n = "", 0
        cur += ch
        n += k
    out.append(cur)
    return "\r\n ".join(out)


def _ics_ngay(iso: str, days: int) -> str:
    import datetime
    d = datetime.date(*(int(x) for x in iso.split("-"))) + datetime.timedelta(days=days)
    return "%04d%02d%02d" % (d.year, d.month, d.day)


def festivals_ics(year: int, lang: str = "en") -> str:
    """Festivals of a year (the same list as ``festivals``) as an iCalendar
    file (RFC 5545): one all-day event per festival spanning its customary
    season, stable UID ``<id>-<year>@nhatnguyet.org``, attribution in
    X-WR-CALDESC, CRLF lines folded at 75 octets. Byte for byte the output of
    ``festivalsIcs`` in @nhatnguyet/le-hoi."""
    lang = _lang(lang)
    ds = festivals(year, lang=lang)
    nguon = le_hoi.nguon_du_lieu()
    dtstamp = nguon.get("capNhat", "").replace("-", "") + "T000000Z"
    lines = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Nhat Nguyet//le-hoi-viet-nam//EN", "CALSCALE:GREGORIAN",
             "METHOD:PUBLISH", "X-WR-CALNAME:" + _ics_text("%s %d" % (_ICS_TEN[lang], year)),
             "X-WR-CALDESC:" + _ics_text("%s %s, CC BY 4.0" % (_ICS_NGUON[lang], nguon["phienBan"])),
             "X-WR-TIMEZONE:Asia/Ho_Chi_Minh"]
    for f in ds:
        desc = [f["description"]]
        if f["daysBefore"] or f["daysAfter"]:
            desc.append("%s: %s" % (_ICS_CHINH[lang], f["date"]))
        lines += ["BEGIN:VEVENT", "UID:%s-%d@nhatnguyet.org" % (f["id"], year), "DTSTAMP:" + dtstamp,
                  "DTSTART;VALUE=DATE:" + _ics_ngay(f["date"], -f["daysBefore"]),
                  "DTEND;VALUE=DATE:" + _ics_ngay(f["date"], f["daysAfter"] + 1),
                  "SUMMARY:" + _ics_text(f["name"])]
        if "".join(desc).strip():
            lines.append("DESCRIPTION:" + _ics_text("\n".join(x for x in desc if x)))
        where = [v["name"] for v in f["venues"]] or [p["name"] for p in f["provinces"]]
        if where:
            lines.append("LOCATION:" + _ics_text("; ".join(where)))
        coords, sources = _o_ds(f["raw"].get("toa_do", "")), _o_ds(f["raw"].get("toa_do_nguon", ""))
        for i, c in enumerate(coords):
            p = c.split(",")
            if len(p) == 2 and p[0] and i < len(sources) and sources[i]:
                lines.append("GEO:%s;%s" % (p[0], p[1]))
                break
        lines.append("CATEGORIES:" + ",".join(_ics_text(x) for x in [f["group"]] + (["public-holiday"] if f["publicHoliday"] else [])))
        lines += ["TRANSP:TRANSPARENT", "END:VEVENT"]
    lines.append("END:VCALENDAR")
    return "\r\n".join(_ics_fold(x) for x in lines) + "\r\n"


# ── Hình SVG ─────────────────────────────────────────────────────────────

def zi_wei_svg(chart: Dict, theme: str = "light", width: Optional[float] = None, lang: Optional[str] = None,
               terms: Optional[str] = None) -> str:
    """Draw a Zi Wei chart (from ``cast_zi_wei`` or ``lap_la_so_tu_vi``) as a
    self-contained SVG string, in the chart's ``lang`` (and ``terms``) unless
    given. Wraps ``ve_la_so_svg`` (``render_chart_svg``)."""
    raw, lang, _, terms = _box(chart, lang, terms)
    return ve_la_so_svg(raw, lang=lang, theme=theme, width=width, terms=terms)


def bazi_svg(chart: Dict, theme: str = "light", width: Optional[float] = None, lang: Optional[str] = None,
             name: str = "", terms: Optional[str] = None) -> str:
    """Draw a BaZi chart (from ``cast_bazi`` or ``lap_la_so_bat_tu``) as SVG.
    ``name`` is printed at the top. Wraps ``ve_bat_tu_svg`` (``render_bazi_svg``)."""
    co_raw = "raw" in chart
    raw = chart["raw"] if co_raw else chart
    lang = _lang(lang or (chart.get("lang") if co_raw else None))
    tm = terms if terms is not None else (chart.get("terms") if co_raw and chart.get("lang") == lang else None)
    return ve_bat_tu_svg(raw, lang=lang, theme=theme, width=width, ho_ten=name or "", terms=check_terms(tm, lang))


def numerology_svg(result: Dict, theme: str = "light", width: Optional[float] = None, lang: Optional[str] = None) -> str:
    """Draw a numerology profile (from ``numerology``) as SVG; the personal year
    is the year of ``today``. Wraps ``ve_than_so_hoc_svg`` (``render_numerology_svg``)."""
    y, m, d = (int(x) for x in result["birthDate"].split("-"))
    vao = {"hoTen": result["name"], "dd": d, "mm": m, "yyyy": y, "namXem": int(result["today"][:4])}
    return ve_than_so_hoc_svg(vao, lang=_lang(lang or result["lang"]), theme=theme, width=width)
