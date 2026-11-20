"""Feng shui rules of traditional schools (Python port of ``@nhatnguyet/fengshui``).

Eight Mansions life gua (Kua number) and house gua, the 24 mountains, Xuan Kong
flying star charts for periods 1 to 9, annual stars, Luban rulers, and SVG
drawings of the compass and of a flying star chart::

    from nhatnguyet.fengshui import life_gua, flying_star_chart, luban_ruler
    life_gua("1990-09-19", "female")["number"]            # 8 (Gen)
    flying_star_chart(period=9, facing="wu")["pattern"]     # "double-sitting"
    luban_ruler(82, ruler="clear-opening")["sector"]["name"]  # "Fu Lu"

These are the rules of traditional schools as the Nhat Nguyet engine encodes
them, not verified effects. Results are dicts with the same camelCase keys as
the TypeScript package; ``lang`` is "en" (default), "vi" or "zh" and ``terms``
("pinyin" default, "han", "vi") sets how names without an English translation
are written. The core port (Vietnamese keys, checked against
ca-kiem/fengshui.json) lives in ``nhatnguyet._phong_thuy``.
"""

import math
import unicodedata
from typing import Any, Dict, List, Optional, Union

from . import am_lich
from ._phong_thuy import (
    BAT_TRACH, CACH_HK, CUNG_LAC_THU, HANH_CUU_TINH, KHI, SAO_BAT_TRACH, SAO_TOT, SAO_XAU, SO_NHA_QUAI, TAM_HUONG,
    TEN_CUU_TINH, TEN_SON, all_bat_quai, all_son_huong, bang_thuoc, chin_van, khi_cua_sao, kua_group, kua_number,
    la_duong_hk, lap_tinh_ban_hk, phi_tinh_nam, son_huong_theo_do, thanh_mon, tra_lo_ban, van_cua_nam,
    vi_tri_nguyen_long,
)
from ._thuoc_lo_ban import BANG_THUOC, TEN_CUNG_NHO
from .en import (
    BRANCH_PINYIN, STEM_PINYIN, _element, _iso, _lang, check_terms, check_year, parse_date, term,
)

__all__ = [
    "DIRECTIONS", "LO_SHU_GRID", "STAR_GLOSS", "ENGINE_VERSION", "life_gua", "eight_directions", "house_gua",
    "trigram_of", "mountains24", "mountain_at", "find_mountain", "nine_stars", "star_qi", "period_of", "periods",
    "flying_star_chart", "annual_stars", "luban_ruler", "luban_rulers", "render_compass_svg",
    "render_flying_star_svg",
]

#: Version of the Go engine this module is ported from.
ENGINE_VERSION = "2.3.0"

DIRECTIONS = ("north", "northeast", "east", "southeast", "south", "southwest", "west", "northwest")
_CENTER_NAME = {"vi": "Trung cung", "en": "Center", "zh": "中宫"}


def _opts(lang, terms):
    lang = _lang(lang)
    return lang, check_terms(terms, lang)


def _theo_terms(t, vi, pinyin, han):
    return vi if t == "vi" else pinyin if t == "pinyin" else han


def _han(vi: str) -> str:
    return term(vi, "zh")


def _huong_index(vi: str) -> int:
    for i, h in enumerate(TAM_HUONG):
        if h[0] == vi:
            return i
    return -1


def _direction_name(i: int, lang: str) -> str:
    h = TAM_HUONG[i]
    return h[0] if lang == "vi" else h[1] if lang == "en" else h[2]


def _is_int(x) -> bool:
    return isinstance(x, int) and not isinstance(x, bool)


# ── Trigrams ─────────────────────────────────────────────────────────────

def _trigram(vi: str, lang: str, terms: str) -> Dict[str, Any]:
    q = next(x for x in all_bat_quai() if x["ten"] == vi)
    i = _huong_index(q["phuongVi"])
    return {
        "id": q["tenEn"].lower(), "name": _theo_terms(terms, q["ten"], q["tenEn"], _han(q["ten"])),
        "pinyin": q["tenEn"], "han": _han(q["ten"]), "nameVi": q["ten"], "symbol": q["kyHieu"],
        "image": q["tuong"] if lang == "vi" else q["tuongEn"] if lang == "en" else _han(q["tuongHan"]),
        "element": _element(q["nguHanh"], lang), "number": SO_NHA_QUAI[q["ten"]],
        "direction": DIRECTIONS[i], "directionName": _direction_name(i, lang),
    }


def trigram_of(number: int, lang: Optional[str] = None, terms: Optional[str] = None) -> Dict[str, Any]:
    """The trigram of a Later Heaven (Lo Shu) number: 1 Kan, 2 Kun, 3 Zhen,
    4 Xun, 6 Qian, 7 Dui, 8 Gen, 9 Li (5 has no trigram)."""
    lang, terms = _opts(lang, terms)
    for h in TAM_HUONG:
        if SO_NHA_QUAI[h[3]] == number:
            return _trigram(h[3], lang, terms)
    raise ValueError("trigram number must be 1 to 9 except 5")


# ── Mountains ────────────────────────────────────────────────────────────

_DRAGON = {"Địa": "earth", "Thiên": "heaven", "Nhân": "human"}
_KIND = {"Thiên Can": "stem", "Địa Chi": "branch", "Quái": "trigram"}


def _ten_son(vi: str, terms: str) -> Dict[str, str]:
    if vi in am_lich.THIEN_CAN:
        pinyin = STEM_PINYIN[am_lich.THIEN_CAN.index(vi)]
    elif vi in am_lich.DIA_CHI:
        pinyin = BRANCH_PINYIN[am_lich.DIA_CHI.index(vi)]
    else:
        pinyin = term(vi, "en")
    return {"name": _theo_terms(terms, vi, pinyin, _han(vi)), "pinyin": pinyin, "han": _han(vi)}


def _mountain(s: Dict[str, Any], lang: str, terms: str) -> Dict[str, Any]:
    t = _ten_son(s["ten"], terms)
    i = _huong_index(s["huong"])
    q = next(x for x in all_bat_quai() if x["ten"] == s["quai"])
    return {
        "index": s["so"], "id": t["pinyin"].lower(), "name": t["name"], "pinyin": t["pinyin"], "han": t["han"],
        "nameVi": s["ten"], "kind": _KIND[s["loai"]], "direction": DIRECTIONS[i], "directionName": _direction_name(i, lang),
        "trigram": q["tenEn"].lower(), "trigramName": _theo_terms(terms, s["quai"], q["tenEn"], _han(s["quai"])),
        "trigramElement": _element(q["nguHanh"], lang), "from": s["tuDo"], "to": s["denDo"],
        "center": (s["so"] - 1) * 15, "dragon": _DRAGON[s["nguyenLong"]],
        "xuanKongPolarity": "yang" if la_duong_hk(SO_NHA_QUAI[s["quai"]], vi_tri_nguyen_long(s["nguyenLong"])) else "yin",
    }


def mountains24(lang: Optional[str] = None, terms: Optional[str] = None) -> List[Dict[str, Any]]:
    """The 24 mountains in compass order, from Zi (due north)."""
    lang, terms = _opts(lang, terms)
    return [_mountain(s, lang, terms) for s in all_son_huong()]


def mountain_at(degrees: float, lang: Optional[str] = None, terms: Optional[str] = None) -> Dict[str, Any]:
    """The mountain containing a compass bearing (degrees, normalised to 0 to
    360). Each sector includes its lower edge: 7.5 is Gui, 7.4999 is Zi."""
    if isinstance(degrees, bool) or not isinstance(degrees, (int, float)) or not math.isfinite(degrees):
        raise TypeError("degrees must be a finite number")
    lang, terms = _opts(lang, terms)
    return _mountain(son_huong_theo_do(degrees), lang, terms)


def find_mountain(m: Union[float, str], lang: Optional[str] = None, terms: Optional[str] = None) -> Dict[str, Any]:
    """A mountain by bearing (number) or by name: pinyin id ("zi"), Vietnamese
    ("Tý") or Chinese ("子")."""
    if isinstance(m, (int, float)) and not isinstance(m, bool):
        return mountain_at(m, lang, terms)
    if not isinstance(m, str):
        raise TypeError("mountain must be a bearing in degrees or a name")
    lang, terms = _opts(lang, terms)
    k = unicodedata.normalize("NFC", m).strip()
    for s in all_son_huong():
        t = _ten_son(s["ten"], "pinyin")
        if t["pinyin"].lower() == k.lower() or s["ten"] == k or t["han"] == k:
            return _mountain(s, lang, terms)
    raise ValueError('unknown mountain %r: use a bearing in degrees, a pinyin id ("zi"), Vietnamese ("Tý") '
                     'or Chinese ("子")' % (m,))


# ── Eight Mansions ───────────────────────────────────────────────────────

_STAR_ID = {"sinh_khi": "sheng-qi", "thien_y": "tian-yi", "dien_nien": "yan-nian", "phuc_vi": "fu-wei",
            "hoa_hai": "huo-hai", "luc_sat": "liu-sha", "ngu_quy": "wu-gui", "tuyet_menh": "jue-ming"}

#: Literal English gloss of each star name (what the characters say, not a prediction).
STAR_GLOSS = {"sheng-qi": "Generating Qi", "tian-yi": "Heavenly Doctor", "yan-nian": "Extended Years",
              "fu-wei": "Hidden Position", "huo-hai": "Mishap", "liu-sha": "Six Shas", "wu-gui": "Five Ghosts",
              "jue-ming": "Severed Life"}


def _son_cua_huong(i: int) -> List[str]:
    return [_ten_son(v, "pinyin")["pinyin"].lower() for v in (TEN_SON[(3 * i + 23) % 24], TEN_SON[3 * i], TEN_SON[3 * i + 1])]


def _direction_stars(kua: int, lang: str, terms: str) -> List[Dict[str, Any]]:
    bang = BAT_TRACH.get(kua)
    if bang is None:
        raise ValueError("gua number must be 1 to 9 except 5")
    ra = []
    for s in SAO_TOT + SAO_XAU:
        i = _huong_index(bang[s])
        t = SAO_BAT_TRACH[s]
        sid = _STAR_ID[s]
        ra.append({
            "direction": DIRECTIONS[i], "directionName": _direction_name(i, lang),
            "from": (i * 45 + 337.5) % 360, "to": i * 45 + 22.5, "mountains": _son_cua_huong(i),
            "star": sid, "starName": _theo_terms(terms, t[0], t[1], t[2]), "pinyin": t[1], "han": t[2],
            "nameVi": t[0], "gloss": STAR_GLOSS[sid], "favorable": t[3],
        })
    return ra


def eight_directions(gua: Union[int, Dict[str, Any]], lang: Optional[str] = None,
                     terms: Optional[str] = None) -> List[Dict[str, Any]]:
    """The eight directions of a gua number (1 to 9 except 5, or a ``life_gua`` /
    ``house_gua`` result): four favourable stars Sheng Qi to Fu Wei, then four
    unfavourable ones Huo Hai to Jue Ming, as the engine orders them."""
    lang, terms = _opts(lang, terms)
    n = gua.get("number") if isinstance(gua, dict) else gua
    if not _is_int(n):
        raise TypeError("gua must be a number 1 to 9 (not 5) or a dict with 'number'")
    return _direction_stars(n, lang, terms)


_GROUP_NAME = {"east": {"vi": "Đông tứ mệnh", "en": "East group", "zh": "东四命"},
               "west": {"vi": "Tây tứ mệnh", "en": "West group", "zh": "西四命"}}
_HOUSE_GROUP_NAME = {"east": {"vi": "Đông tứ trạch", "en": "East group", "zh": "东四宅"},
                     "west": {"vi": "Tây tứ trạch", "en": "West group", "zh": "西四宅"}}


def _gender(g: Any) -> str:
    if g in ("male", "Male", "m", "M", "Nam", "nam"):
        return "male"
    if g in ("female", "Female", "f", "F", "Nữ", "nữ", "Nu", "nu"):
        return "female"
    raise ValueError('gender must be "male" or "female", got %r' % (g,))


def life_gua(birth: Any, gender: str, lang: Optional[str] = None, terms: Optional[str] = None) -> Dict[str, Any]:
    """Eight Mansions life gua (Kua number) of a person. ``birth`` is a date
    (the lunar year is taken from it, turning at the lunar New Year as the
    engine does) or a lunar year number."""
    lang, terms = _opts(lang, terms)
    g = _gender(gender)
    birth_date = None
    greg = 0
    if _is_int(birth):
        check_year(birth, "lunar year %d" % birth)
        lunar_year = birth
    else:
        d = parse_date(birth)
        check_year(d["year"], "date %s" % _iso(d))
        birth_date = _iso(d)
        greg = d["year"]
        lunar_year = am_lich.solar_to_lunar(d["day"], d["month"], d["year"], 7.0)["year"]
    kua = kua_number(lunar_year, "Nam" if g == "male" else "Nữ")
    group = "east" if kua_group(kua) == "dong_tu_menh" else "west"
    tri = _trigram(next(h[3] for h in TAM_HUONG if SO_NHA_QUAI[h[3]] == kua), lang, terms)
    r = {"birthDate": birth_date, "lunarYear": lunar_year, "yearBoundary": "lunar-new-year", "gender": g,
         "number": kua, "trigram": tri, "group": group, "groupName": _GROUP_NAME[group][lang],
         "element": tri["element"], "directions": _direction_stars(kua, lang, terms)}
    if birth_date and greg != lunar_year:
        r["note"] = ("Sinh trước Tết nên năm âm lịch là %d." % lunar_year if lang == "vi"
                     else "Born before the lunar New Year, so the lunar year is %d." % lunar_year if lang == "en"
                     else "生于春节之前，故农历年为 %d 年。" % lunar_year)
    return r


def _toa_huong(facing, sitting) -> Dict[str, Any]:
    co_f, co_s = facing is not None, sitting is not None
    if co_f == co_s:
        raise TypeError("give exactly one of facing or sitting")
    m = find_mountain(facing if co_f else sitting, lang="vi")
    ds = all_son_huong()
    i = m["index"] - 1
    return ds[(i + 12) % 24] if co_f else ds[i]


def house_gua(facing: Union[float, str, None] = None, sitting: Union[float, str, None] = None,
              lang: Optional[str] = None, terms: Optional[str] = None) -> Dict[str, Any]:
    """Eight Mansions house gua: the trigram of the SITTING side, with its eight
    directions. Give ``facing`` or ``sitting`` (degrees or a mountain name)."""
    lang, terms = _opts(lang, terms)
    s_toa = _toa_huong(facing, sitting)
    s_huong = all_son_huong()[(s_toa["so"] - 1 + 12) % 24]
    kua = SO_NHA_QUAI[s_toa["quai"]]
    group = "east" if kua_group(kua) == "dong_tu_menh" else "west"
    return {"sitting": _mountain(s_toa, lang, terms), "facing": _mountain(s_huong, lang, terms), "number": kua,
            "trigram": _trigram(s_toa["quai"], lang, terms), "group": group,
            "groupName": _HOUSE_GROUP_NAME[group][lang], "directions": _direction_stars(kua, lang, terms)}


# ── Xuan Kong ────────────────────────────────────────────────────────────

def _nine_star(n: int, lang: str) -> Dict[str, Any]:
    vi = TEN_CUU_TINH[n]
    return {"number": n, "name": vi if lang == "vi" else term(vi, lang), "han": term(vi, "zh"), "nameVi": vi,
            "element": _element(HANH_CUU_TINH[n], lang)}


def nine_stars(lang: Optional[str] = None, terms: Optional[str] = None) -> List[Dict[str, Any]]:
    """The nine stars 1 to 9 with their names and elements."""
    lang, _ = _opts(lang, terms)
    return [_nine_star(n, lang) for n in range(1, 10)]


_QI = ((KHI[0], "prosperous", "Prosperous", "旺气"), (KHI[1], "growing", "Growing", "生气"),
       (KHI[2], "retreating", "Retreating", "退气"), (KHI[3], "killing", "Killing", "煞气"), (KHI[4], "dead", "Dead", "死气"))


def _qi(period: int, star: int):
    return next(x for x in _QI if x[0] == khi_cua_sao(period, star))


def star_qi(period: int, star: int, lang: Optional[str] = None) -> Dict[str, str]:
    """Role of star ``star`` in period ``period``: prosperous, growing, retreating, killing, dead."""
    lang = _lang(lang)
    if not _is_int(period) or not 1 <= period <= 9:
        raise ValueError("period must be 1 to 9")
    if not _is_int(star) or not 1 <= star <= 9:
        raise ValueError("star must be 1 to 9")
    q = _qi(period, star)
    return {"qi": q[1], "name": q[0] if lang == "vi" else q[2] if lang == "en" else q[3]}


_ERA = ("upper", "middle", "lower")


def _period(v: Dict[str, Any], lang: str) -> Dict[str, Any]:
    return {"period": v["so"], "era": _ERA[(v["so"] - 1) // 3],
            "eraName": v["nguyen"] if lang == "vi" else v["nguyenEn"] if lang == "en" else v["nguyenZh"],
            "from": v["tuNam"], "to": v["denNam"], "star": _nine_star(v["so"], lang),
            "zhengShenPalace": v["chinhThan"] or None, "lingShenPalace": v["linhThan"] or None}


def _check_int_year(year) -> None:
    if not _is_int(year):
        raise TypeError("year must be an integer")
    check_year(year)


def period_of(year: int, lang: Optional[str] = None) -> Dict[str, Any]:
    """The period (1 to 9) of a year counted from the Start of Spring (about
    4 February). Period 9 runs 2024 to 2043."""
    lang = _lang(lang)
    _check_int_year(year)
    return _period(van_cua_nam(year), lang)


def periods(year: int, lang: Optional[str] = None) -> List[Dict[str, Any]]:
    """The nine periods of the 180-year cycle containing ``year``."""
    lang = _lang(lang)
    _check_int_year(year)
    return [_period(v, lang) for v in chin_van(year)]


_PATTERN = ((CACH_HK[0], "prosperous-sitting-facing", "Prosperous Sitting and Facing", "旺山旺向"),
            (CACH_HK[1], "reversed", "Up the Mountain, Down the Water", "上山下水"),
            (CACH_HK[2], "double-facing", "Double Stars at Facing", "双星到向"),
            (CACH_HK[3], "double-sitting", "Double Stars at Sitting", "双星到坐"))

#: Palace numbers as drawn with south on top.
LO_SHU_GRID = ((4, 9, 2), (3, 5, 7), (8, 1, 6))


def _cung_info(c: int, lang: str) -> Dict[str, Any]:
    quai, huong = CUNG_LAC_THU[c]
    if not quai:
        return {"direction": "center", "directionName": _CENTER_NAME[lang], "trigram": None}
    i = _huong_index(huong)
    q = next(x for x in all_bat_quai() if x["ten"] == quai)
    return {"direction": DIRECTIONS[i], "directionName": _direction_name(i, lang), "trigram": q["tenEn"].lower()}


def flying_star_chart(period: Optional[int] = None, year: Optional[int] = None, facing: Union[float, str, None] = None,
                      sitting: Union[float, str, None] = None, lang: Optional[str] = None,
                      terms: Optional[str] = None) -> Dict[str, Any]:
    """Xuan Kong flying star chart (Shen school, plain facing; replacement
    stars are not computed). Give ``period`` or ``year`` and ``facing`` or ``sitting``."""
    lang, terms = _opts(lang, terms)
    if (period is None) == (year is None):
        raise TypeError("give exactly one of period or year")
    if year is not None:
        _check_int_year(year)
        period = van_cua_nam(year)["so"]
    elif not _is_int(period) or not 1 <= period <= 9:
        raise ValueError("period must be an integer 1 to 9")
    s_toa = _toa_huong(facing, sitting)
    tb = lap_tinh_ban_hk(period, s_toa["ten"])
    s_huong = next(s for s in all_son_huong() if s["ten"] == tb["huong"])
    palaces = []
    for c in range(1, 10):
        p = {"palace": c}
        p.update(_cung_info(c, lang))
        p.update({"base": tb["vanBan"][c], "mountain": tb["sonTinh"][c], "facing": tb["huongTinh"][c],
                  "qi": {"base": _qi(period, tb["vanBan"][c])[1], "mountain": _qi(period, tb["sonTinh"][c])[1],
                         "facing": _qi(period, tb["huongTinh"][c])[1]}})
        palaces.append(p)
    pat = next((x for x in _PATTERN if x[0] == tb["cach"]), None)
    tm = thanh_mon(period, s_toa["ten"])
    return {
        "period": period, "year": year, "sitting": _mountain(s_toa, lang, terms), "facing": _mountain(s_huong, lang, terms),
        "sittingPalace": tb["cungToa"], "facingPalace": tb["cungHuong"],
        "mountainStarForward": tb["sonTinh"][6] == tb["sonTinh"][5] % 9 + 1,
        "facingStarForward": tb["huongTinh"][6] == tb["huongTinh"][5] % 9 + 1,
        "pattern": pat[1] if pat else None,
        "patternName": (pat[0] if lang == "vi" else pat[2] if lang == "en" else pat[3]) if pat else None,
        "palaces": palaces, "grid": [list(r) for r in LO_SHU_GRID],
        "castleGates": [{"palace": g["cung"], "direction": _cung_info(g["cung"], lang)["direction"],
                         "primary": g["laChinh"], "baseStar": g["soVanBan"], "forward": g["thuan"],
                         "arrivingStar": g["saoDen"], "usable": g["dungDuoc"]} for g in tm["cung"]],
        "replacementStars": False,
    }


def annual_stars(year: int, lang: Optional[str] = None) -> Dict[str, Any]:
    """Annual flying stars: the center star of the year (2026 One White, each
    year one less) flown forward. The year counts from the Start of Spring."""
    lang = _lang(lang)
    _check_int_year(year)
    p = phi_tinh_nam(year)
    palaces = []
    for c in range(1, 10):
        i = _cung_info(c, lang)
        palaces.append({"palace": c, "direction": i["direction"], "directionName": i["directionName"], "star": p["sao"][c]})
    return {"year": year, "yearBoundary": "start-of-spring", "center": p["saoTrung"], "palaces": palaces}


# ── Luban rulers ─────────────────────────────────────────────────────────

_RULER = {"clear-opening": "THONG_THUY", "luban": "DUONG_TRACH", "dinglan": "AM_PHAN"}
_RULER_ALIAS = {"clear-opening": "clear-opening", "52.2": "clear-opening", "luban": "luban", "42.9": "luban",
                "dinglan": "dinglan", "38.8": "dinglan"}


def _check_ruler(r) -> str:
    if r is None:
        return "luban"
    rid = _RULER_ALIAS.get(str(r))
    if rid is None:
        raise ValueError('ruler must be "clear-opening" (52.2), "luban" (42.9) or "dinglan" (38.8), got %r' % (r,))
    return rid


def _sector(b, idx, lang, terms):
    c = b["cung"][idx]
    return {"index": idx, "name": _theo_terms(terms, c[0], c[2], c[3]), "pinyin": c[2], "han": c[1], "nameZh": c[3],
            "nameVi": c[0], "auspicious": c[4], "meaning": c[5] if lang == "vi" else c[6] if lang == "en" else c[7]}


def _sub(vi, zh, terms):
    if not vi:
        return None
    t = TEN_CUNG_NHO.get(vi)
    if t is None:
        raise ValueError("missing sub-sector name: " + vi)
    return {"name": _theo_terms(terms, vi, t[0], zh), "pinyin": t[0], "nameEn": t[1], "nameVi": vi, "nameZh": zh}


def luban_ruler(length: float, ruler: Optional[str] = None, unit: str = "cm", lang: Optional[str] = None,
                terms: Optional[str] = None) -> Dict[str, Any]:
    """Read a length on a Luban ruler ("luban" 42.9 cm default, "clear-opening"
    52.2 cm, "dinglan" 38.8 cm). Equal sectors; a length exactly on an edge
    belongs to the upper sector. The length is rounded to 0.1 mm."""
    lang, terms = _opts(lang, terms)
    rid = _check_ruler(ruler)
    if unit not in ("cm", "mm"):
        raise ValueError('unit must be "cm" or "mm", got %r' % (unit,))
    if isinstance(length, bool) or not isinstance(length, (int, float)) or not math.isfinite(length) or length <= 0:
        raise ValueError("length must be a positive number")
    mm = math.floor(length * (100 if unit == "cm" else 10) + 0.5) / 10
    if not mm > 0:
        raise ValueError("length rounds to 0 mm")
    b = bang_thuoc(_RULER[rid])
    k = tra_lo_ban(mm, b["loai"])
    idx = next(i for i, c in enumerate(b["cung"]) if c[0] == k["cung"])
    return {
        "lengthMm": _so_gon(mm), "lengthCm": _so_gon(mm / 10), "ruler": rid,
        "rulerName": b["ten"] if lang == "vi" else b["tenEn"] if lang == "en" else b["tenZh"],
        "cycleMm": _so_gon(b["doDaiMm"]),
        "use": b["dungDe"] if lang == "vi" else b["dungDeEn"] if lang == "en" else b["dungDeZh"],
        "cycle": k["chuKyThu"], "positionMm": _so_gon(k["viTriMm"]), "sector": _sector(b, idx, lang, terms),
        "subSector": _sub(k.get("cungNho"), k.get("cungNhoZh"), terms), "auspicious": k["tot"],
        "nearestAuspicious": [{"lengthMm": _so_gon(g["mm"]), "lengthCm": _so_gon(g["cm"]), "offsetMm": g.get("lechMm", 0),
                               "sector": _theo_terms(terms, g["cung"], g["cungEn"], g["cungZh"]),
                               "subSector": _sub(g.get("cungNho"), g.get("cungNhoZh"), terms)}
                              for g in k.get("ganNhatTot", [])],
    }


def _so_gon(x: float) -> Union[int, float]:
    """820.0 thành 820 (như số JSON của bản TypeScript)."""
    return int(x) if float(x).is_integer() else x


def luban_rulers(lang: Optional[str] = None, terms: Optional[str] = None) -> List[Dict[str, Any]]:
    """The three rulers and their sectors."""
    lang, terms = _opts(lang, terms)
    ra = []
    for rid in ("clear-opening", "luban", "dinglan"):
        b = next(x for x in BANG_THUOC if x["loai"] == _RULER[rid])
        sectors = []
        for i, c in enumerate(b["cung"]):
            s = _sector(b, i, lang, terms)
            s["subSectors"] = [_sub(vi, c[9][j], terms) for j, vi in enumerate(c[8])]
            sectors.append(s)
        ra.append({"ruler": rid, "name": b["ten"] if lang == "vi" else b["tenEn"] if lang == "en" else b["tenZh"],
                   "lengthMm": _so_gon(b["doDaiMm"]),
                   "use": b["dungDe"] if lang == "vi" else b["dungDeEn"] if lang == "en" else b["dungDeZh"],
                   "sectors": sectors})
    return ra


# ── SVG (đúng từng byte như js/packages/fengshui/src/svg.ts) ──────────────

_MAU = {
    "light": {"nen": "#ECEEEB", "o": "#FFFFFF", "vien": "#D3D9D5", "chu": "#1B1F1E", "chuMo": "#4F5956",
              "chinh": "#1F6F6B", "chinhNen": "#E4F0ED", "vang": "#C9922E", "gach": "#B5402F", "gachNen": "#F6E4DF",
              "chuTrenNhan": "#FFFFFF"},
    "dark": {"nen": "#0F1E1D", "o": "#182A28", "vien": "#2C423F", "chu": "#E8EEEC", "chuMo": "#B3C2BE",
             "chinh": "#7CC7BF", "chinhNen": "#1E3835", "vang": "#E0A53C", "gach": "#EE8D78", "gachNen": "#3A2622",
             "chuTrenNhan": "#0F1E1D"},
}
_PHONG = ("-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, 'Noto Sans', "
          "'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', 'Noto Sans CJK SC', sans-serif")
_SIN_GOC = (0, 0.13052619222005157, 0.25881904510252074, 0.3826834323650898, 0.5, 0.6087614290087207,
            0.7071067811865476, 0.7933533402912352, 0.8660254037844386, 0.9238795325112867, 0.9659258262890683,
            0.9914448613738104, 1)


def _sin_k(k: int) -> float:
    j = k % 48
    if j <= 12:
        return _SIN_GOC[j]
    if j <= 24:
        return _SIN_GOC[24 - j]
    if j <= 36:
        return -_SIN_GOC[j - 24]
    return -_SIN_GOC[48 - j]


def _cos_k(k: int) -> float:
    return _sin_k(k + 12)


def _so(n: float) -> str:
    k = math.floor(n * 10 + 0.5)
    am = k < 0
    t = -k if am else k
    nguyen = t // 10
    le = t - nguyen * 10
    return ("-" if am else "") + str(nguyen) + ("" if le == 0 else "." + str(le))


def _thoat(s: str) -> str:
    return s.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;").replace('"', "&quot;")


def _chu(x, y, noi_dung, co, mau, them=""):
    return '<text x="%s" y="%s" font-size="%s" fill="%s" text-anchor="middle" dominant-baseline="central"%s>%s</text>' % (
        _so(x), _so(y), co, mau, them, _thoat(noi_dung))


_MO_TA = {
    "vi": "Quy tắc của các phái phong thuỷ truyền thống, chưa được kiểm chứng; nhatnguyet.org",
    "en": "Rules of traditional feng shui schools, not verified effects; nhatnguyet.org",
    "zh": "传统风水流派的规则，未经验证；nhatnguyet.org",
}


def _mo_dau(w, h, width, m, title, lang):
    return ('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 %d %d" width="%s" height="%s" role="img" '
            'aria-labelledby="nn-tieu-de nn-mo-ta" lang="%s" font-family="%s">' % (w, h, _so(width), _so(width * h / w), lang, _PHONG)
            + '<title id="nn-tieu-de">%s</title><desc id="nn-mo-ta">%s</desc><rect width="%d" height="%d" fill="%s"/>'
            % (_thoat(title), _thoat(_MO_TA[lang]), w, h, m["nen"]))


def _check_theme(t) -> str:
    if t is None:
        return "light"
    if t in ("light", "dark"):
        return t
    raise ValueError('theme must be "light" or "dark", got %r' % (t,))


def _check_width(w) -> float:
    if w is None:
        return 480
    if isinstance(w, bool) or not isinstance(w, (int, float)) or not math.isfinite(w) or w <= 0:
        raise ValueError("width must be a positive number")
    return w


def _theo_lang(lang, vi, en, zh):
    return vi if lang == "vi" else en if lang == "en" else zh


_TEN_HUONG = {"vi": ("B", "ĐB", "Đ", "ĐN", "N", "TN", "T", "TB"), "en": ("N", "NE", "E", "SE", "S", "SW", "W", "NW"),
              "zh": ("北", "东北", "东", "东南", "南", "西南", "西", "西北")}
_CX, _CY = 240, 280


def render_compass_svg(gua: Union[int, Dict[str, Any], None] = None, facing: Union[float, str, None] = None,
                       orientation: Optional[str] = None, lang: Optional[str] = None, terms: Optional[str] = None,
                       theme: Optional[str] = None, width: Optional[float] = None) -> str:
    """The 24-mountain compass with the eight trigrams and, with ``gua`` (a
    number or a ``life_gua`` / ``house_gua`` result), the eight stars; ``facing``
    marks the facing mountain and its opposite. South at the top by default."""
    lang = _lang(lang)
    terms = check_terms(terms, lang)
    m = _MAU[_check_theme(theme)]
    width = _check_width(width)
    if orientation is not None and orientation not in ("south-up", "north-up"):
        raise ValueError('orientation must be "south-up" or "north-up", got %r' % (orientation,))
    nam = (orientation or "south-up") == "south-up"

    def px(r, k):
        return _CX - r * _sin_k(k) if nam else _CX + r * _sin_k(k)

    def py(r, k):
        return _CY + r * _cos_k(k) if nam else _CY - r * _cos_k(k)

    def quat(r1, r2, k1, k2):
        return ("M%s %sA%s %s 0 0 1 %s %sL%s %sA%s %s 0 0 0 %s %sZ"
                % (_so(px(r2, k1)), _so(py(r2, k1)), r2, r2, _so(px(r2, k2)), _so(py(r2, k2)),
                   _so(px(r1, k2)), _so(py(r1, k2)), r1, r1, _so(px(r1, k1)), _so(py(r1, k1))))

    son = mountains24(lang, terms)
    co_gua = gua is not None
    huong_sao = eight_directions(gua, lang, terms) if co_gua else []
    i_huong = i_toa = -1
    if facing is not None:
        i_huong = find_mountain(facing)["index"] - 1
        i_toa = (i_huong + 12) % 24
    so_gua = gua if isinstance(gua, int) else gua.get("number") if isinstance(gua, dict) else None
    tieu_de = _theo_lang(lang, "La bàn 24 sơn", "24-mountain compass", "二十四山罗盘")
    if co_gua:
        if isinstance(gua, dict) and "gender" in gua:
            loai = _theo_lang(lang, "Cung phi", "Life gua", "命卦")
        elif isinstance(gua, dict) and "sitting" in gua:
            loai = _theo_lang(lang, "Trạch", "House gua", "宅卦")
        else:
            loai = _theo_lang(lang, "Quái", "Gua", "卦")
        tieu_de = "%s %s · %s" % (loai, so_gua, trigram_of(so_gua, lang, terms)["name"])
    # Bán kính các vòng. Vòng quái và vòng du niên đủ rộng cho nhãn hai dòng ở
    # khổ 320px; mọi hình vẽ trước, chữ vẽ sau cùng để không hình nào đè chữ.
    r0, r1, r2, r3 = 200, 168, 122, 78
    s = _mo_dau(480, 520, width, m, tieu_de, lang)
    s += _chu(240, 26, tieu_de, 18, m["chu"], ' font-weight="600"')
    for i, x in enumerate(son):
        la_huong, la_toa = i == i_huong, i == i_toa
        nen = m["chinh"] if la_huong else m["vang"] if la_toa else m["chinhNen"] if x["kind"] == "trigram" else m["o"]
        mau_chu = m["chuTrenNhan"] if la_huong or la_toa else m["chu"]
        s += '<path d="%s" fill="%s" stroke="%s" stroke-width="1"/>' % (quat(r1, r0, 2 * i - 1, 2 * i + 1), nen, m["vien"])
        s += _chu(px((r0 + r1) / 2, 2 * i), py((r0 + r1) / 2, 2 * i), x["name"], 13, mau_chu,
                  ' font-weight="600"' if la_huong or la_toa else "")
    # Vòng tám quái: quẻ phía trong, nhãn (tên và phương) phía ngoài, nơi cung dài hơn.
    chu_sau = ""
    quai = all_bat_quai()
    for h in range(8):
        q = next(x for x in quai if x["ten"] == TAM_HUONG[h][3])
        ten = trigram_of(SO_NHA_QUAI[q["ten"]], lang, terms)["name"]
        s += '<path d="%s" fill="%s" stroke="%s" stroke-width="1"/>' % (quat(r2, r1, 6 * h - 3, 6 * h + 3), m["o"], m["vien"])
        x, y = px(142, 6 * h), py(142, 6 * h)
        tren = y < _CY - 1
        chu_sau += _chu(x, y + 8 if tren else y - 8, q["kyHieu"], 16, m["chu"])
        chu_sau += _chu(x, y - 10 if tren else y + 10, ten + " " + _TEN_HUONG[lang][h], 10, m["chuMo"])
    # Vòng tám du niên: tên hai chữ trở lên (có dấu cách) xuống hai dòng.
    if co_gua:
        for d in huong_sao:
            h = next(i for i, x in enumerate(TAM_HUONG) if x[1].lower() == d["direction"])
            r = (r2 + r3) / 2
            s += '<path d="%s" fill="%s" stroke="%s" stroke-width="1"/>' % (
                quat(r3, r2, 6 * h - 3, 6 * h + 3), m["chinhNen"] if d["favorable"] else m["gachNen"], m["vien"])
            dong = d["starName"].split(" ")
            mau = m["chinh"] if d["favorable"] else m["gach"]
            if len(dong) == 2:
                chu_sau += _chu(px(r, 6 * h), py(r, 6 * h) - 6.5, dong[0], 11, mau, ' font-weight="600"')
                chu_sau += _chu(px(r, 6 * h), py(r, 6 * h) + 6.5, dong[1], 11, mau, ' font-weight="600"')
            else:
                chu_sau += _chu(px(r, 6 * h), py(r, 6 * h), d["starName"], 11, mau, ' font-weight="600"')
    r_tam = r3 if co_gua else r2
    s += '<circle cx="%d" cy="%d" r="%d" fill="%s" stroke="%s" stroke-width="1"/>' % (_CX, _CY, r_tam, m["o"], m["vien"])
    s += chu_sau
    if co_gua:
        s += _chu(_CX, _CY - 10, str(so_gua), 34, m["chinh"], ' font-weight="700"')
        s += _chu(_CX, _CY + 22, _theo_lang(lang, "cung phi", "gua number", "卦数"), 11, m["chuMo"])
    else:
        s += _chu(_CX, _CY, _theo_lang(lang, "La bàn", "Compass", "罗盘"), 16, m["chuMo"])
    for k in (0, 12, 24, 36):
        s += _chu(px(214, k), py(214, k), str(k * 15 // 2) + "°", 11, m["chuMo"])
    s += _chu(240, 506, _theo_lang(lang, "Nam ở trên, như sách la bàn cổ", "South at the top, as compass books draw it",
                                   "南在上，依罗盘古书画法") if nam else _theo_lang(lang, "Bắc ở trên", "North at the top", "北在上"),
              11, m["chuMo"])
    return s + "</svg>"


def render_flying_star_svg(chart: Dict[str, Any], lang: Optional[str] = None, terms: Optional[str] = None,
                           theme: Optional[str] = None, width: Optional[float] = None) -> str:
    """A flying star chart as a 3 x 3 grid, south at the top: mountain star
    (left), facing star (right), period star (below). ``chart`` is a
    ``flying_star_chart`` result or its keyword arguments as a dict."""
    lang = _lang(lang)
    terms = check_terms(terms, lang)
    m = _MAU[_check_theme(theme)]
    width = _check_width(width)
    if isinstance(chart, dict) and isinstance(chart.get("palaces"), list) and chart.get("sitting"):
        tb = flying_star_chart(period=chart["period"], sitting=chart["sitting"]["nameVi"], lang=lang, terms=terms)
    elif isinstance(chart, dict):
        tb = flying_star_chart(period=chart.get("period"), year=chart.get("year"), facing=chart.get("facing"),
                               sitting=chart.get("sitting"), lang=lang, terms=terms)
    else:
        raise TypeError("chart must be a flying_star_chart result or a dict of its arguments")
    if lang == "vi":
        tieu_de = "Vận %d · Tọa %s, hướng %s" % (tb["period"], tb["sitting"]["name"], tb["facing"]["name"])
    elif lang == "en":
        tieu_de = "Period %d · Sitting %s, facing %s" % (tb["period"], tb["sitting"]["name"], tb["facing"]["name"])
    else:
        tieu_de = "%d运 · 坐%s向%s" % (tb["period"], tb["sitting"]["name"], tb["facing"]["name"])
    s = _mo_dau(480, 560, width, m, tieu_de, lang)
    s += _chu(240, 26, tieu_de, 17, m["chu"], ' font-weight="600"')
    if tb["patternName"]:
        s += _chu(240, 50, tb["patternName"], 13, m["chinh"])
    x0, y0, o0 = 30, 70, 140
    for r, hang in enumerate(tb["grid"]):
        for j, cung in enumerate(hang):
            p = tb["palaces"][cung - 1]
            x, y = x0 + j * o0, y0 + r * o0
            la_toa, la_huong = cung == tb["sittingPalace"], cung == tb["facingPalace"]
            vien = m["chinh"] if la_huong else m["vang"] if la_toa else m["vien"]
            day = 3 if la_huong or la_toa else 1
            s += '<rect x="%d" y="%d" width="%d" height="%d" fill="%s" stroke="%s" stroke-width="%d"/>' % (
                x, y, o0, o0, m["chinhNen"] if cung == 5 else m["o"], vien, day)
            s += _chu(x + 70, y + 20, p["directionName"], 12, m["chuMo"])

            def mau_sao(q):
                return m["chinh"] if q in ("prosperous", "growing") else m["chu"]
            s += _chu(x + 38, y + 66, str(p["mountain"]), 30, mau_sao(p["qi"]["mountain"]), ' font-weight="700"')
            s += _chu(x + 102, y + 66, str(p["facing"]), 30, mau_sao(p["qi"]["facing"]), ' font-weight="700"')
            s += _chu(x + 70, y + 106, str(p["base"]), 18, m["chuMo"])
            if la_toa:
                s += _chu(x + 70, y + 127, _theo_lang(lang, "Tọa", "Sitting", "坐"), 10, m["vang"], ' font-weight="600"')
            if la_huong:
                s += _chu(x + 70, y + 127, _theo_lang(lang, "Hướng", "Facing", "向"), 10, m["chinh"], ' font-weight="600"')
    s += _chu(240, 514, _theo_lang(lang, "Trái: sơn tinh · Phải: hướng tinh · Dưới: vận tinh",
                                   "Left: mountain star · Right: facing star · Below: period star",
                                   "左：山星 · 右：向星 · 下：运星"), 11, m["chuMo"])
    s += _chu(240, 536, _theo_lang(lang, "Nam ở trên, như sách cổ", "South at the top, as the books draw it",
                                   "南在上，依古书画法"), 11, m["chuMo"])
    return s + "</svg>"
