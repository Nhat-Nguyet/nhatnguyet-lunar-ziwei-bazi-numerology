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
from functools import lru_cache
from typing import Any, Callable, Dict, List, Optional, Union

from . import am_lich, bat_tu, le_hoi, than_so_hoc, tu_vi
from .bat_tu_ve_svg import ve_bat_tu_svg
from .than_so_hoc_ve_svg import ve_than_so_hoc_svg
from .tu_vi_ve_svg import ve_la_so_svg

__all__ = [
    "parse_date", "parse_time", "hour_branch", "term", "to_lunar", "to_solar",
    "solar_terms", "solar_term_on", "day_pillar", "year_pillar", "cast_zi_wei",
    "decade_luck", "yearly_luck", "yearly_stars", "find_patterns", "cast_bazi",
    "minor_luck", "numerology", "festivals", "NUMEROLOGY_LABELS", "zi_wei_svg", "bazi_svg",
    "numerology_svg",
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


def _stem_branch(label: str, lang: str) -> str:
    if lang != "zh":
        return label
    p = label.split(" ")
    if len(p) == 2 and p[0] in am_lich.THIEN_CAN and p[1] in am_lich.DIA_CHI:
        return term(p[0], "zh") + term(p[1], "zh")
    return term(label, lang)


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


def hour_branch(time: Union[str, int], lang: str = "en") -> Dict[str, Any]:
    """The double hour (canh giờ) of a clock time. Tý runs 23:00 to 00:59.
    Uses the package's own ``chi_gio_tu_gio_dong_ho``."""
    lang = _lang(lang)
    t = parse_time(time)
    if t is None:
        raise ValueError("hour_branch needs a time")
    i = bat_tu.chi_gio_tu_gio_dong_ho(t["hour"])
    dau = (i * 2 - 1) % 24
    return {"index": i, "name": term(am_lich.DIA_CHI[i], lang), "animal": _zodiac(i, lang),
            "range": "%02d:00-%02d:59" % (dau, (dau + 1) % 24)}


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

def _pillar(stem_index: int, branch_index: int, lang: str) -> Dict[str, Any]:
    s, b = stem_index % 10, branch_index % 12
    hanh, _, ten = am_lich.ngu_hanh_nap_am(s, b)
    return {
        "label": _stem_branch(am_lich.THIEN_CAN[s] + " " + am_lich.DIA_CHI[b], lang),
        "stem": term(am_lich.THIEN_CAN[s], lang),
        "branch": term(am_lich.DIA_CHI[b], lang),
        "stemIndex": s,
        "branchIndex": b,
        "stemElement": _element(am_lich.CAN_NGU_HANH[s], lang),
        "branchElement": _element(am_lich.chi_to_ngu_hanh(am_lich.DIA_CHI[b])[0], lang),
        "naYin": term(ten, lang),
        "naYinElement": _element(hanh, lang),
    }


def day_pillar(date: DateInput, lang: str = "en") -> Dict[str, Any]:
    """The day pillar (can chi of the day); independent of time zone."""
    d = parse_date(date)
    cc = am_lich.day_can_chi(d["day"], d["month"], d["year"])
    return _pillar(am_lich.THIEN_CAN.index(cc["can"]), am_lich.DIA_CHI.index(cc["chi"]), _lang(lang))


def year_pillar(lunar_year: int, lang: str = "en") -> Dict[str, Any]:
    """The pillar of a LUNAR year (2026 is Bính Ngọ)."""
    cc = am_lich.year_can_chi(lunar_year)
    return _pillar(am_lich.THIEN_CAN.index(cc["can"]), am_lich.DIA_CHI.index(cc["chi"]), _lang(lang))


def to_lunar(date: DateInput, country: Optional[str] = None, time_zone: Optional[float] = None,
             lang: str = "en") -> Dict[str, Any]:
    """Gregorian date to the lunar calendar of a country (default Vietnam, UTC+7).
    Wraps ``solar_to_lunar``."""
    lang = _lang(lang)
    d = parse_date(date)
    c, tz = _country(country, time_zone)
    l = am_lich.solar_to_lunar(d["day"], d["month"], d["year"], tz)
    return {
        "year": l["year"], "month": l["month"], "day": l["day"], "leap": l["leap"],
        "solarDate": _iso(d), "country": c, "timeZone": _num(tz),
        "yearName": _stem_branch(am_lich.year_can_chi(l["year"])["label"], lang),
        "monthName": _stem_branch(am_lich.lunar_month_can_chi(l["month"], l["year"])["label"], lang),
        "dayName": _stem_branch(am_lich.day_can_chi(d["day"], d["month"], d["year"])["label"], lang),
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


def _ten_sao(s: Dict, lang: str) -> str:
    if lang == "vi":
        return s["ten"]
    if lang == "en":
        return s.get("tenEn") or term(s["ten"], "en")
    if s.get("tenZh"):
        return s["tenZh"]
    t = _tu_vung().get(s["ten"])
    if t and (not s.get("tenEn") or t[0] == s["tenEn"]):
        return t[1]
    return s.get("tenEn") or s["ten"]  # TODO(zh): lõi chưa có chữ Trung cho sao này.


def _ten_cung(c: Dict, lang: str) -> str:
    return _pick(c, "tenCung", lang, lambda: term(c["tenCung"], lang, c.get("tenCungEn")))


def _localize_zi_wei(raw: Dict, lang: str, time: Optional[str], view_year: Optional[int]) -> Dict[str, Any]:
    chi = am_lich.DIA_CHI.index(raw["gioSinh"])
    h = hour_branch(chi * 2, lang)
    palaces = []
    for c in raw["cung"]:
        stars = []
        for s in c["sao"]:
            r: Dict[str, Any] = {"name": _ten_sao(s, lang), "nameVi": s["ten"], "kind": _KIND[s["loai"]]}
            if s.get("mieuVuong"):
                r["brightness"] = _pick(s, "mieuVuong", lang, lambda s=s: term(s["mieuVuong"], lang, s.get("mieuVuongEn")))
            if s.get("tuHoa"):
                r["transformation"] = _pick(s, "tuHoa", lang, lambda s=s: term(s["tuHoa"], lang))
            stars.append(r)
        palaces.append({
            "index": c["viTri"], "branch": _pick(c, "chi", lang, lambda c=c: term(c["chi"], lang)),
            "stemBranch": _pick(c, "canChi", lang, lambda c=c: _stem_branch(c["canChi"], lang)),
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
    notes = [note] + ([_GIO_TY[lang]] if chi == 0 else [])
    sd, al = raw["ngaySinhDuong"], raw["ngaySinhAm"]
    return {
        "lang": lang, "name": raw["hoTen"], "gender": "female" if raw["gioiTinh"] == "Nữ" else "male",
        "solarDate": "%04d-%02d-%02d" % (sd["nam"], sd["thang"], sd["ngay"]), "time": time, "hour": h,
        "lunar": {"year": al["year"], "month": al["month"], "day": al["day"], "leap": al["leap"]},
        "yearPillar": _pick(raw, "canChiNam", lang, lambda: _stem_branch(raw["canChiNam"], lang)),
        "yinYang": _pick(raw, "amDuongMenh", lang, lambda: term(raw["amDuongMenh"], lang)),
        "bureau": {"number": raw["cuc"], "name": _pick(raw, "tenCuc", lang, lambda: term(raw["tenCuc"], lang))},
        "naYin": _pick(raw, "banMenhNapAm", lang, lambda: term(raw["banMenhNapAm"], lang)),
        "lifePalace": raw["cungMenh"], "bodyPalace": raw["cungThan"], "palaces": palaces,
        "viewYear": view_year if view_year is not None else _dt.date.today().year,
        "notes": notes, "raw": raw,
    }


def cast_zi_wei(date: DateInput, gender: str, time: Union[str, int, None] = None,
                hour_branch_index: Optional[int] = None, name: str = "", lang: str = "en",
                view_year: Optional[int] = None) -> Dict[str, Any]:
    """Cast a Zi Wei Dou Shu (Tử Vi) chart.

    ``time`` is the clock time ``"HH:MM"``, mapped to its double hour (Tý is
    23:00 to 00:59); or give ``hour_branch_index`` (0 = Tý ... 11 = Hợi).
    The keys of the result are the same as the TypeScript ``castZiWei``.
    """
    lang = _lang(lang)
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
    raw = tu_vi.lap_la_so_tu_vi(name or "", "Nữ" if g == "female" else "Nam", d["day"], d["month"], d["year"], chi)
    return _localize_zi_wei(raw, lang, _hhmm(t["hour"], t["minute"]) if t else None, view_year)


def _box(chart: Dict, lang: Optional[str]) -> tuple:
    if "raw" in chart and "palaces" in chart:
        return chart["raw"], _lang(lang or chart["lang"]), chart["viewYear"]
    if "cung" in chart:
        return chart, _lang(lang), _dt.date.today().year
    raise TypeError("expected a chart from cast_zi_wei (or lap_la_so_tu_vi)")


def _cung_tai(raw: Dict, i: int, lang: str) -> str:
    return _ten_cung(raw["cung"][i % 12], lang)


def decade_luck(chart: Dict, lang: Optional[str] = None) -> List[Dict[str, Any]]:
    """The twelve ten-year periods (ages are East Asian ages). Wraps ``dai_van``."""
    raw, lang, _ = _box(chart, lang)
    out = []
    for c in tu_vi.dai_van(raw):
        out.append({
            "order": c["thu"], "palaceIndex": c["viTri"], "branch": term(c["chi"], lang),
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


def yearly_luck(chart: Dict, year: Optional[int] = None, lang: Optional[str] = None) -> Dict[str, Any]:
    """Facts of a viewing year (default: the chart's ``viewYear``). Wraps ``tinh_han_nam``."""
    raw, lang, vy = _box(chart, lang)
    nam = vy if year is None else year
    h = tu_vi.tinh_han_nam(raw, nam)
    dv = None
    if h["daiVanTenCung"]:
        idx = next(c["viTri"] for c in raw["cung"] if c["tenCung"] == h["daiVanTenCung"])
        dv = {"fromAge": h["daiVanTuTuoi"], "toAge": h["daiVanDenTuoi"], "palace": _cung_tai(raw, idx, lang)}
    return {
        "year": h["nam"],
        "yearPillar": _pick(h, "canChiNam", lang, lambda: _stem_branch(h["canChiNam"], lang)),
        "age": h["tuoiMu"],
        "yearPalace": {"index": h["luuNienViTri"], "branch": term(h["luuNienChi"], lang),
                       "palace": _cung_tai(raw, h["luuNienViTri"], lang)},
        "minorLimit": {"index": h["tieuVanViTri"], "branch": term(h["tieuVanChi"], lang),
                       "palace": _cung_tai(raw, h["tieuVanViTri"], lang)},
        "decade": dv,
        "transformations": [{
            "type": _pick(x, "hoa", lang, lambda x=x: term(x["hoa"], lang)),
            "star": _ten_sao_theo_ten(raw, x["sao"], lang),
            "palaceIndex": x["viTri"] if x["coTrenLaSo"] else None,
            "palace": _cung_tai(raw, x["viTri"], lang) if x["coTrenLaSo"] else None,
        } for x in h["luuTuHoa"]],
        "months": [{"month": t["thang"], "index": t["viTri"], "branch": term(t["chi"], lang),
                    "palace": _cung_tai(raw, t["viTri"], lang)} for t in h["nguyetHan"]["thang"]],
    }


_QUAN_HE = {"dong-cung": "same-palace", "xung-chieu": "opposite", "tam-hop": "trine", "": ""}


def yearly_stars(chart: Dict, year: Optional[int] = None, lang: Optional[str] = None) -> List[Dict[str, Any]]:
    """The five yearly moving stars. Wraps ``tinh_sao_luu``."""
    raw, lang, vy = _box(chart, lang)
    nam = vy if year is None else year
    return [{
        "code": s["ma"], "name": s["ten"] if lang == "vi" else s["tenEn"] if lang == "en" else s["tenZh"],
        "byStem": s["theoCan"], "palaceIndex": s["viTri"], "branch": term(s["chi"], lang),
        "palace": _cung_tai(raw, s["viTri"], lang),
        "toYearPalace": _QUAN_HE.get(s["voiLuuNien"], s["voiLuuNien"]),
        "toMinorLimit": _QUAN_HE.get(s["voiTieuVan"], s["voiTieuVan"]),
        "toDecade": _QUAN_HE.get(s["voiDaiVan"], s["voiDaiVan"]),
    } for s in tu_vi.tinh_sao_luu(raw, nam)]


_NHOM = {"dinh-phu": "wealth", "dinh-quy": "rank", "dinh-ban-tien": "hardship"}


def find_patterns(chart: Dict, lang: Optional[str] = None) -> List[Dict[str, Any]]:
    """Recognise named patterns on a chart. Wraps ``nhan_dien_cach_cuc``."""
    raw, lang, _ = _box(chart, lang)
    out = []
    for c in tu_vi.nhan_dien_cach_cuc(raw):
        vt = c.get("viTri", -1)
        p: Dict[str, Any] = {
            "name": (c.get("tenZh") or c["ten"]) if lang == "zh" else c["ten"],
            "nameVi": c["ten"],
            "condition": c["dieuKien"] if lang == "vi" else c["dieuKienEn"] if lang == "en" else c["dieuKienZh"],
            "description": c["moTa"] if lang == "vi" else c["moTaEn"] if lang == "en" else c["moTaZh"],
            "palaceIndex": vt if vt >= 0 else None,
            "palace": _cung_tai(raw, vt, lang) if vt >= 0 else None,
            "hasVariants": c.get("coDiBan") is True,
        }
        if c.get("tenHan"):
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
_KHONG_GIO = {
    "vi": "Chưa biết giờ sinh: không có trụ giờ và mệnh cung; tuổi khởi vận tạm tính từ 12h.",
    "en": "Birth time unknown: no hour pillar or life palace; the luck start is counted from noon.",
    "zh": "出生时辰未知：无时柱与命宫；起运岁数暂按中午计。",
}


def _tieng_tiet(ten: str, lang: str) -> str:
    if lang == "vi" or not ten:
        return ten
    t = next((x for x in am_lich.all_tiet_khi() if x["ten"] == ten), None)
    en = t["tenEn"] if t else ten
    return en if lang == "en" else term(ten, "zh", en)


def _tt(t: Dict, lang: str) -> str:
    return t["thapThanCan"] if lang == "vi" else t["thapThanCanEn"] if lang == "en" else t["thapThanCanZh"]


def _tru_co_ban(t: Dict, lang: str) -> Dict[str, Any]:
    f = _pillar(am_lich.THIEN_CAN.index(t["can"]), am_lich.DIA_CHI.index(t["chi"]), lang)
    p = lambda k, fb: _pick(t, k, lang, lambda: fb)  # noqa: E731
    f.update({"label": p("label", f["label"]), "stem": p("can", f["stem"]), "branch": p("chi", f["branch"]),
              "stemElement": p("canHanh", f["stemElement"]), "branchElement": p("chiHanh", f["branchElement"]),
              "naYin": p("napAmTen", f["naYin"]), "naYinElement": p("napAm", f["naYinElement"])})
    return f


def _mang(t: Dict, k: str, lang: str, fb: List[str]) -> List[str]:
    if lang == "vi":
        return list(fb)
    v = t.get(k + ("En" if lang == "en" else "Zh"))
    return list(v) if isinstance(v, list) and len(v) == len(fb) else [term(x, lang) for x in fb]


def _tru_day_du(t: Dict, lang: str) -> Dict[str, Any]:
    r = _tru_co_ban(t, lang)
    r.update({
        "tenGod": _tt(t, lang),
        "hiddenStems": [{
            "stem": _pick(h, "can", lang, lambda h=h: term(h["can"], lang)),
            "element": _pick(h, "hanh", lang, lambda h=h: _element(h["hanh"], lang)),
            "role": _pick(h, "vaiTro", lang, lambda h=h: term(h["vaiTro"], lang)),
            "tenGod": h["thapThan"] if lang == "vi" else h.get("thapThanEn" if lang == "en" else "thapThanZh", ""),
        } for h in t["tangCan"]],
        "stage": _pick(t, "truongSinh", lang, lambda: term(t["truongSinh"], lang)),
        "selfStage": _pick(t, "tuToa", lang, lambda: term(t["tuToa"], lang)),
        "stars": _mang(t, "thanSat", lang, t["thanSat"]),
    })
    return r


def _localize_bazi(raw: Dict, lang: str) -> Dict[str, Any]:
    dv = raw["daiVan"]
    notes = [_QUY_UOC[lang]]
    time = None
    if raw["coGioSinh"]:
        time = _hhmm(raw["gio"], raw["phut"])
        h = hour_branch(raw["gio"], lang)
        notes.append({"vi": "Giờ %s thuộc giờ %s (%s).", "en": "%s falls in the %s double hour (%s).",
                      "zh": "%s 属%s时（%s）。"}[lang] % (time, h["name"], h["range"]))
    else:
        notes.append(_KHONG_GIO[lang])
    return {
        "lang": lang, "gender": "female" if raw["gioiTinh"] == "Nữ" else "male",
        "solarDate": _iso(raw["ngaySinh"]), "time": time,
        "pillars": {"year": _tru_day_du(raw["truNam"], lang), "month": _tru_day_du(raw["truThang"], lang),
                    "day": _tru_day_du(raw["truNgay"], lang),
                    "hour": _tru_day_du(raw["truGio"], lang) if raw.get("truGio") else None},
        "dayMaster": {"stem": _pick(raw, "nhatChu", lang, lambda: term(raw["nhatChu"], lang)),
                      "element": _pick(raw, "nhatChuHanh", lang, lambda: _element(raw["nhatChuHanh"], lang)),
                      "yinYang": _pick(raw, "nhatChuAmDuong", lang, lambda: term(raw["nhatChuAmDuong"], lang))},
        "solarTerm": _tieng_tiet(raw["tietKhi"], lang),
        "monthTerm": _tieng_tiet(raw["tietDauThang"], lang),
        "pillarYear": raw["namTruNam"],
        "conception": _tru_co_ban(raw["thaiNguyen"], lang),
        "lifePalace": _tru_co_ban(raw["menhCung"], lang) if raw.get("menhCung") else None,
        "symbolicStars": [{
            "name": _pick(s, "ten", lang, lambda s=s: term(s["ten"], lang)),
            "branches": _mang(s, "chiDich", lang, s["chiDich"]),
            "pillars": [_TRU[v] for v in s["viTri"]],
            "lookup": s["traTheo"] if lang == "vi" else s["traTheoEn"] if lang == "en" else s["traTheoZh"],
            "variants": s["loiKhac"] if lang == "vi" else s["loiKhacEn"] if lang == "en" else s["loiKhacZh"],
        } for s in raw["thanSat"]],
        "luck": {
            "direction": "forward" if dv["thuan"] else "backward",
            "term": {"name": _pick(dv, "tietMoc", lang, lambda: _tieng_tiet(dv["tietMoc"], lang)),
                     "date": _iso(dv["tietMocNgay"]) if dv["tietMocNgay"]["year"] else "",
                     "time": _hhmm(dv["tietMocGio"], dv["tietMocPhut"])},
            "days": dv["soNgay"],
            "startAge": {"years": dv["tuoiKhoiNam"], "months": dv["tuoiKhoiThang"]},
            "startDate": _iso(dv["ngayKhoiVan"]) if dv["ngayKhoiVan"]["year"] else "",
            "explanation": dv["lyDo"] if lang == "vi" else dv["lyDoEn"] if lang == "en" else dv["lyDoZh"],
            "pillars": [dict(_tru_co_ban(v, lang), order=v["thuTu"], tenGod=_tt(v, lang),
                             stage=_pick(v, "truongSinh", lang, lambda v=v: term(v["truongSinh"], lang)),
                             fromAge=v["tuoiTu"], fromYear=v["namTu"], toYear=v["namDen"])
                        for v in dv["cacVan"]],
        },
        "notes": notes, "raw": raw,
    }


def cast_bazi(date: DateInput, gender: str, time: Union[str, int, None] = None, lang: str = "en") -> Dict[str, Any]:
    """Cast a BaZi (Four Pillars) chart. ``time`` is the clock time (Vietnam
    time) or None when unknown; the day pillar turns at 23:00."""
    lang = _lang(lang)
    d = parse_date(date)
    g = _gender(gender)
    t = parse_time(time)
    raw = bat_tu.lap_la_so_bat_tu(d["day"], d["month"], d["year"], t["hour"] if t else None,
                                  t["minute"] if t else 0, "Nữ" if g == "female" else "Nam")
    return _localize_bazi(raw, lang)


def minor_luck(chart: Dict, year: int, lang: Optional[str] = None) -> Optional[Dict[str, Any]]:
    """The minor luck pillar (tiểu vận) of a year; None without a birth time."""
    raw = chart["raw"] if "raw" in chart else chart
    lang = _lang(lang or chart.get("lang"))
    tv = bat_tu.tinh_tieu_van_bat_tu(raw, year)
    if not tv:
        return None
    r = _tru_co_ban(tv, lang)
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

def festivals(year: int, lang: str = "en") -> List[Dict[str, Any]]:
    """Festivals with a fixed date (lunar or Gregorian) in a year, sorted by
    date. Festivals announced each year by the organisers are not included."""
    lang = _lang(lang)
    if not isinstance(year, int) or isinstance(year, bool):
        raise TypeError("year must be an integer")
    out = []
    for le in le_hoi.danh_sach_le_hoi():
        sd = le_hoi.ngay_duong_cua_le(le, year)
        if not sd:
            continue
        am = le["loai_ngay"] == "lunar"
        out.append({
            "id": le["id"], "date": _iso(sd),
            "name": le["ten"] if lang == "vi" else (le["ten_en"] or le["ten"]) if lang == "en"
            else (le["ten_zh"] or le["ten_en"] or le["ten"]),
            "description": le["mo_ta"] if lang == "vi" else (le["mo_ta_en"] or le["mo_ta"]) if lang == "en"
            else (le["mo_ta_zh"] or le["mo_ta_en"] or le["mo_ta"]),
            "calendar": "lunar" if am else "solar",
            "fixedDate": le["ngay_am"] if am else le["ngay_duong"],
            "level": le["muc_do"], "group": le["nhom"], "scope": le["pham_vi"],
            "publicHoliday": le["ngay_nghi_le"] == "co", "raw": le,
        })
    out.sort(key=lambda f: f["date"])  # sort của Python ổn định: cùng ngày giữ thứ tự bộ dữ liệu
    return out


# ── Hình SVG ─────────────────────────────────────────────────────────────

def zi_wei_svg(chart: Dict, theme: str = "light", width: Optional[float] = None, lang: Optional[str] = None) -> str:
    """Draw a Zi Wei chart (from ``cast_zi_wei`` or ``lap_la_so_tu_vi``) as a
    self-contained SVG string, in the chart's ``lang`` unless given. Wraps
    ``ve_la_so_svg`` (``render_chart_svg``)."""
    raw, lang, _ = _box(chart, lang)
    return ve_la_so_svg(raw, lang=lang, theme=theme, width=width)


def bazi_svg(chart: Dict, theme: str = "light", width: Optional[float] = None, lang: Optional[str] = None,
             name: str = "") -> str:
    """Draw a BaZi chart (from ``cast_bazi`` or ``lap_la_so_bat_tu``) as SVG.
    ``name`` is printed at the top. Wraps ``ve_bat_tu_svg`` (``render_bazi_svg``)."""
    raw = chart["raw"] if "raw" in chart else chart
    lang = _lang(lang or chart.get("lang"))
    return ve_bat_tu_svg(raw, lang=lang, theme=theme, width=width, ho_ten=name or "")


def numerology_svg(result: Dict, theme: str = "light", width: Optional[float] = None, lang: Optional[str] = None) -> str:
    """Draw a numerology profile (from ``numerology``) as SVG; the personal year
    is the year of ``today``. Wraps ``ve_than_so_hoc_svg`` (``render_numerology_svg``)."""
    y, m, d = (int(x) for x in result["birthDate"].split("-"))
    vao = {"hoTen": result["name"], "dd": d, "mm": m, "yyyy": y, "namXem": int(result["today"][:4])}
    return ve_than_so_hoc_svg(vao, lang=_lang(lang or result["lang"]), theme=theme, width=width)
