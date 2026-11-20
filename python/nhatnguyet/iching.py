"""I Ching (Yijing): the 64 hexagrams, the eight palaces, nuclear, opposite and
reversed hexagrams, three-coin and Plum Blossom casting, the Six Lines (najia)
chart, the daily hexagram of the Gua Qi calendar, the public domain Zhou Yi text
with James Legge's 1882 translation, and an SVG drawing.

Same keys and values as the TypeScript package ``@nhatnguyet/iching``; every
result carries the core object in ``raw``. Checked against the reference engine
on ``ca-kiem/iching.json``.

>>> from nhatnguyet import iching
>>> iching.hexagram(11)["name"]
'Peace'
>>> iching.najia([9, 8, 7, 6, 7, 8], date="2026-11-19")["lines"][0]["relation"]
'Offspring'
"""

from __future__ import annotations

import json
import os
import random
import re
import unicodedata
from functools import lru_cache
from typing import Any, Callable, Dict, List, Optional, Sequence, Union

from . import am_lich
from . import _iching_core as core
from .en import _element, _iso, _lang, check_terms, parse_date_in_range, stem_branch_name, term, term_name

__all__ = [
    "ENGINE_VERSION", "RELATION_CODES", "MONTH_STATE_CODES", "CLASSICAL_SOURCE",
    "trigram", "hexagram", "hexagram_number", "all_hexagrams", "mutual", "opposite", "reverse", "changed",
    "cast_coins", "cast_from_numbers", "najia", "daily_hexagram", "text", "render_hexagram_svg",
]

#: Version of the reference engine the module is checked against.
ENGINE_VERSION = "2.3.0"

_TUONG_ZH = ("", "天", "泽", "火", "雷", "风", "水", "山", "地")
_PHUONG_ZH = ("", "西北", "西", "南", "东", "东南", "北", "东北", "西南")

#: Codes of the six relations (liu qin), the same in every ``lang``.
RELATION_CODES = {"Phụ Mẫu": "parent", "Huynh Đệ": "sibling", "Tử Tôn": "offspring",
                  "Thê Tài": "wealth", "Quan Quỷ": "officer"}
#: Codes of the five seasonal states of a line under the month branch.
MONTH_STATE_CODES = {"vượng": "prospering", "tướng": "supported", "hưu": "resting",
                     "tù": "trapped", "tử": "dead"}
_LUC_THU_VI = [x[0] for x in core.LUC_THU]

HexagramInput = Union[int, str, Sequence[Any], Dict[str, Any]]


def _opts(lang: Optional[str], terms: Optional[str]) -> tuple:
    lg = _lang(lang)
    return lg, check_terms(terms, lg)


def _ten_quai(so: int, lang: str, terms: str) -> str:
    q = core.QUAI[so]
    if lang == "vi" or terms == "vi":
        return q[0]
    if lang == "zh" or terms == "han":
        return q[3]
    return q[1]


def _trigram_of(so: int, lang: str, terms: str) -> Dict[str, Any]:
    r = core.quai_tho(so)
    return {
        "number": so,
        "name": _ten_quai(so, lang, terms),
        "nameVi": r["nameVi"],
        "nameHan": r["nameHan"],
        "pinyin": r["pinyin"],
        "symbol": r["symbol"],
        "lines": r["lines"],
        "image": r["imageVi"] if lang == "vi" else r["imageEn"] if lang == "en" else _TUONG_ZH[so],
        "element": _element(r["element"], lang),
        "direction": r["direction"] if lang == "vi" else r["directionEn"] if lang == "en" else _PHUONG_ZH[so],
    }


def _gon(s: str) -> str:
    """Gấp chữ để so tên: bỏ dấu, chữ thường, bỏ khoảng trắng và gạch."""
    t = unicodedata.normalize("NFD", s)
    t = "".join(ch for ch in t if not unicodedata.category(ch).startswith("M"))
    t = t.replace("đ", "d").replace("Đ", "D").lower()
    return re.sub(r"[\s\-'’.]", "", t)


def trigram(value: Union[int, str, Sequence[Any]], lang: Optional[str] = None,
            terms: Optional[str] = None) -> Dict[str, Any]:
    """One of the eight trigrams, by number (1 to 8, Fu Xi order), name or three
    lines (bottom first)."""
    lg, tm = _opts(lang, terms)
    so = 0
    if isinstance(value, bool):
        so = 0
    elif isinstance(value, int):
        so = value if 1 <= value <= 8 else 0
    elif isinstance(value, (list, tuple)):
        if len(value) == 3 and all(x is True or x is False or (type(x) is int and x in (0, 1)) for x in value):
            h = [x is True or x == 1 for x in value]
            so = core.so_quai_tu_hao(h)
    elif isinstance(value, str):
        k = _gon(value)
        for i in range(1, 9):
            q = core.QUAI[i]
            if any(_gon(x) == k for x in (q[0], q[1], q[2], q[3], q[4], q[8])):
                so = i
    if not so:
        raise ValueError("no such trigram: %s" % json.dumps(value, ensure_ascii=False))
    out = _trigram_of(so, lg, tm)
    out.update({"lang": lg, "raw": core.quai_tho(so)})
    return out


def _hexagram_of(so: int, lang: str, terms: str) -> Dict[str, Any]:
    r = core.que_tho(so)
    ten = r["nameVi"] if lang == "vi" else r["nameEn"] if lang == "en" else r["nameZh"]
    return {
        "number": so,
        "symbol": r["symbol"],
        "name": ten,
        "nameEn": r["nameEn"],
        "nameVi": r["nameVi"],
        "nameHan": r["nameHan"],
        "nameZh": r["nameZh"],
        "pinyin": r["pinyin"],
        "lines": list(r["lines"]),
        "binary": r["binary"],
        "upper": _trigram_of(r["upper"], lang, terms),
        "lower": _trigram_of(r["lower"], lang, terms),
        "palace": {
            "number": r["palace"],
            "name": _ten_quai(r["palace"], lang, terms),
            "element": _element(r["palaceElement"], lang),
            "generation": r["generation"],
            "generationName": core.VI_TRI_CUNG[r["generation"]][0 if lang == "vi" else 1 if lang == "en" else 2],
        },
        "world": r["world"],
        "response": r["response"],
        "lang": lang,
        "raw": r,
    }


@lru_cache(maxsize=1)
def _ten_tra() -> List[tuple]:
    out = []
    for so in range(1, 65):
        t = core.TEN_QUE[so]
        en = t[3]
        for c in (en, re.sub(r"^The ", "", en), t[4], t[1], t[2], core.ten_viet_que(so), t[0]):
            out.append((so, c))
    return out


def _uniq(xs: List[int]) -> List[int]:
    seen: List[int] = []
    for x in xs:
        if x not in seen:
            seen.append(x)
    return seen


def _so_theo_ten(s: str) -> int:
    nguyen = " ".join(unicodedata.normalize("NFC", s).split()).lower()
    thay = _uniq([so for so, c in _ten_tra() if c.lower() == nguyen])
    if not thay:
        k = _gon(s)
        thay = _uniq([so for so, c in _ten_tra() if _gon(c) == k])
    if len(thay) == 1:
        return thay[0]
    if len(thay) > 1:
        raise ValueError("hexagram name %s is ambiguous: %s; use the number, the tone marks or the characters"
                         % (json.dumps(s, ensure_ascii=False), ", ".join(str(x) for x in thay)))
    raise ValueError("no hexagram named %s" % json.dumps(s, ensure_ascii=False))


def _la_so(x: Any) -> bool:
    return isinstance(x, (int, float)) and not isinstance(x, bool)


def hexagram_number(value: HexagramInput) -> int:
    """King Wen number of a hexagram input (raises on invalid input)."""
    if isinstance(value, bool):
        raise TypeError("hexagram must be a number, lines, a binary string, a name or a hexagram dict")
    if isinstance(value, int):
        if 1 <= value <= 64:
            return value
        raise ValueError("hexagram number must be an integer from 1 to 64, got %d" % value)
    if isinstance(value, str):
        if re.fullmatch(r"[01]{6}", value):
            return core.so_que_tu_hao([c == "1" for c in value])
        return _so_theo_ten(value)
    if isinstance(value, (list, tuple)):
        if len(value) == 6 and all(x is True or x is False or (type(x) is int and x in (0, 1)) for x in value):
            return core.so_que_tu_hao([x is True or x == 1 for x in value])
        if len(value) == 6 and all(_la_so(x) and 6 <= x <= 9 for x in value):
            return core.gieo_tho(list(value))["primary"]
        raise ValueError("hexagram lines must be six booleans (or 0/1) or six coin values 6 to 9, bottom first, got %r"
                         % (value,))
    if isinstance(value, dict) and _la_so(value.get("number")):
        return hexagram_number(value["number"])
    raise TypeError("hexagram must be a number, lines, a binary string, a name or a hexagram dict")


def hexagram(value: HexagramInput, lang: Optional[str] = None, terms: Optional[str] = None) -> Dict[str, Any]:
    """One of the 64 hexagrams, by number, lines (bottom first), binary string or
    name (English, pinyin, Chinese, Vietnamese)."""
    lg, tm = _opts(lang, terms)
    return _hexagram_of(hexagram_number(value), lg, tm)


def all_hexagrams(lang: Optional[str] = None, terms: Optional[str] = None) -> List[Dict[str, Any]]:
    """All 64 hexagrams in King Wen order."""
    lg, tm = _opts(lang, terms)
    return [_hexagram_of(i, lg, tm) for i in range(1, 65)]


def mutual(value: HexagramInput, lang: Optional[str] = None, terms: Optional[str] = None) -> Dict[str, Any]:
    """The nuclear (mutual) hexagram: lines 2 to 4 below, 3 to 5 above."""
    lg, tm = _opts(lang, terms)
    return _hexagram_of(core.que_tho(hexagram_number(value))["mutual"], lg, tm)


def opposite(value: HexagramInput, lang: Optional[str] = None, terms: Optional[str] = None) -> Dict[str, Any]:
    """The opposite hexagram: every line turned over."""
    lg, tm = _opts(lang, terms)
    return _hexagram_of(core.que_tho(hexagram_number(value))["opposite"], lg, tm)


def reverse(value: HexagramInput, lang: Optional[str] = None, terms: Optional[str] = None) -> Dict[str, Any]:
    """The reversed hexagram: the figure turned upside down."""
    lg, tm = _opts(lang, terms)
    return _hexagram_of(core.que_tho(hexagram_number(value))["reverse"], lg, tm)


def changed(value: HexagramInput, moving: Sequence[int], lang: Optional[str] = None,
            terms: Optional[str] = None) -> Dict[str, Any]:
    """The changed hexagram: the given moving lines (1 = bottom ... 6 = top) turned over."""
    lg, tm = _opts(lang, terms)
    if not isinstance(moving, (list, tuple)) or not all(type(m) is int and 1 <= m <= 6 for m in moving):
        raise ValueError("moving lines must be integers from 1 (bottom) to 6, got %r" % (moving,))
    h = core.hao_que(hexagram_number(value))
    for m in sorted(set(moving)):
        h[m - 1] = not h[m - 1]
    return _hexagram_of(core.so_que_tu_hao(h), lg, tm)


def _cast(g: List[int], lang: str, terms: str) -> Dict[str, Any]:
    r = core.gieo_tho(g)
    return {
        "method": "three-coins",
        "lines": list(g),
        "moving": r["moving"],
        "primary": _hexagram_of(r["primary"], lang, terms),
        "changed": None if r["changed"] is None else _hexagram_of(r["changed"], lang, terms),
        "lang": lang,
        "raw": r,
    }


_HE_THONG = random.SystemRandom()


def cast_coins(rng: Optional[Callable[[], float]] = None, lines: Optional[Sequence[int]] = None,
               lang: Optional[str] = None, terms: Optional[str] = None) -> Dict[str, Any]:
    """Three-coin method: six tosses of three coins, bottom line first. A coin
    counts 3 when ``rng()`` is below 0.5 (the back) and 2 otherwise (the face);
    the sum 6 to 9 is the line. ``lines`` records a cast made by hand; ``rng``
    (a function returning [0, 1)) makes a cast reproducible. Default:
    ``random.SystemRandom``."""
    lg, tm = _opts(lang, terms)
    if lines is not None:
        core.kiem_gieo(list(lines) if isinstance(lines, tuple) else lines)
        g = list(lines)
    else:
        f = rng if rng is not None else _HE_THONG.random
        if not callable(f):
            raise TypeError("rng must be a function returning a number in [0, 1)")
        g = []
        for _ in range(6):
            tong = 0
            for _ in range(3):
                x = f()
                if not (_la_so(x) and 0 <= x < 1):
                    raise ValueError("rng() must return a number in [0, 1), got %r" % (x,))
                tong += 3 if x < 0.5 else 2
            g.append(tong)
    return _cast(g, lg, tm)


def cast_from_numbers(a: int, b: int, c: int, lang: Optional[str] = None,
                      terms: Optional[str] = None) -> Dict[str, Any]:
    """Plum Blossom (Mei Hua Yi Shu) number method: upper trigram = a mod 8, lower
    = b mod 8, moving line = c mod 6 (a remainder of 0 counts as 8 or 6)."""
    lg, tm = _opts(lang, terms)
    for x in (a, b, c):
        if type(x) is not int:
            raise ValueError("cast_from_numbers takes three integers, got %r" % (x,))
    r = core.mai_hoa_tho(a, b, c)
    g = [(9 if y else 6) if i == r["moving"][0] - 1 else (7 if y else 8) for i, y in enumerate(core.hao_que(r["primary"]))]
    return {
        "method": "plum-blossom",
        "numbers": [a, b, c],
        "upper": _trigram_of(r["upper"], lg, tm),
        "lower": _trigram_of(r["lower"], lg, tm),
        "lines": g,
        "moving": list(r["moving"]),
        "primary": _hexagram_of(r["primary"], lg, tm),
        "changed": _hexagram_of(r["changed"], lg, tm),
        "lang": lg,
        "raw": r,
    }


def _gia_tri_gieo(value: Any) -> List[int]:
    """Sáu giá trị gieo 6..9 của một đầu vào (quẻ tĩnh cho 7, 8)."""
    if isinstance(value, dict) and isinstance(value.get("lines"), list) and len(value["lines"]) == 6 \
            and _la_so(value["lines"][0]):
        g = list(value["lines"])
        core.kiem_gieo(g)
        return g
    if isinstance(value, (list, tuple)) and len(value) == 6 and all(_la_so(x) and 6 <= x <= 9 for x in value):
        g = list(value)
        core.kiem_gieo(g)
        return g
    return [7 if y else 8 for y in core.hao_que(hexagram_number(value))]


def najia(value: Any, date: Any = None, lang: Optional[str] = None, terms: Optional[str] = None) -> Dict[str, Any]:
    """The Six Lines (Liu Yao, najia) chart of a hexagram on a date (1900 to
    2100). ``value`` is a cast, six coin values 6 to 9, or any hexagram input."""
    lg, tm = _opts(lang, terms)
    if date is None:
        raise TypeError("najia needs date")
    d = parse_date_in_range(date)
    g = _gia_tri_gieo(value)
    r = core.najia_tho(g, d["day"], d["month"], d["year"])
    hx = _hexagram_of(r["number"], lg, tm)

    def ten3(vi: str, en: str, zh: str) -> str:
        return vi if lg == "vi" else en if lg == "en" else zh

    lines = []
    for h in r["lines"]:
        c = h["changed"]
        lines.append({
            "position": h["position"],
            "yang": h["yang"],
            "moving": h["moving"],
            "stem": term_name(h["stem"], lg, tm),
            "branch": term_name(h["branch"], lg, tm),
            "element": _element(h["element"], lg),
            "relation": ten3(h["relation"], h["relationEn"], h["relationZh"]),
            "relationCode": RELATION_CODES[h["relation"]],
            "spirit": ten3(h["spirit"], h["spiritEn"], h["spiritZh"]),
            "spiritIndex": _LUC_THU_VI.index(h["spirit"]),
            "world": h["world"],
            "response": h["response"],
            "void": h["void"],
            "monthState": ten3(h["monthState"], h["monthStateEn"], h["monthStateZh"]),
            "monthStateCode": MONTH_STATE_CODES[h["monthState"]],
            "monthBreak": h["monthBreak"],
            "changed": None if c is None else {
                "branch": term_name(c["branch"], lg, tm),
                "element": _element(c["element"], lg),
                "relation": ten3(c["relation"], c["relationEn"], c["relationZh"]),
                "relationCode": RELATION_CODES[c["relation"]],
            },
        })
    return {
        "date": _iso(d),
        "day": stem_branch_name(r["day"], lg, tm),
        "month": stem_branch_name(r["month"], lg, tm),
        "void": [term_name(r["void"][0], lg, tm), term_name(r["void"][1], lg, tm)],
        "hexagram": hx,
        "changed": None if r["changed"] is None else _hexagram_of(r["changed"], lg, tm),
        "palace": hx["palace"],
        "world": r["world"],
        "response": r["response"],
        "lines": lines,
        "lang": lg,
        "raw": r,
    }


def daily_hexagram(date: Any, lang: Optional[str] = None, terms: Optional[str] = None) -> Dict[str, Any]:
    """The hexagram ruling a day (1900 to 2100) by the Gua Qi method of Meng Xi:
    sixty hexagrams of 6 7/80 days each from Inner Truth at the true winter
    solstice, read at 12:00 Vietnam time (UTC+7). No moving line."""
    lg, tm = _opts(lang, terms)
    d = parse_date_in_range(date)
    r = core.que_ngay_tho(d["day"], d["month"], d["year"])
    tk = am_lich.tiet_khi_theo_index(r["solarTerm"])
    ch = r["change"]
    return {
        "date": _iso(d),
        "hexagram": _hexagram_of(r["number"], lg, tm),
        "cycleIndex": r["cycleIndex"],
        "role": core.VAI_TRO_QUAI_KHI[(r["cycleIndex"] - 1) % 5][0 if lg == "vi" else 1 if lg == "en" else 2],
        "rulingLine": r["rulingLine"],
        "dayInHexagram": r["dayInHexagram"],
        "solstice": dict(r["solstice"]),
        "minutesSinceSolstice": r["minutesSinceSolstice"],
        "minutesToChange": r["minutesToChange"],
        "nearChange": r["nearChange"],
        "change": None if ch is None else {
            "time": ch["time"],
            "before": _hexagram_of(ch["before"]["number"], lg, tm),
            "after": _hexagram_of(ch["after"]["number"], lg, tm),
        },
        "solarTerm": tk["ten"] if lg == "vi" else tk["tenEn"] if lg == "en" else term(tk["ten"], "zh", tk["tenEn"]),
        "cardinal": {"hexagram": _hexagram_of(r["cardinal"]["number"], lg, tm), "line": r["cardinal"]["line"]},
        "model": r["model"],
        "lang": lg,
        "raw": r,
    }


# ── Văn bản cổ ───────────────────────────────────────────────────────────

@lru_cache(maxsize=1)
def _van_ban() -> Dict[str, Any]:
    p = os.path.join(os.path.dirname(os.path.abspath(__file__)), "du_lieu", "iching-text.json")
    with open(p, encoding="utf-8") as f:
        return json.load(f)


def _nguon() -> Dict[str, str]:
    v = _van_ban()
    return {"zh": v["zh"], "en": v["en"], "dataset": "nhatnguyet/classical-parallel", "sha256": v["sha256"]}


CLASSICAL_SOURCE = _nguon()


def text(value: HexagramInput) -> Dict[str, Any]:
    """The public domain text of a hexagram: the judgment and line statements of
    the Zhou Yi with James Legge's 1882 English translation (OCR text as
    printed). No commentary, no modern reading."""
    n = hexagram_number(value)
    jz, je, ls = _van_ban()["hexagrams"][n - 1]
    return {
        "number": n,
        "judgment": {"zh": jz, "en": je},
        "lines": [{"line": i + 1, "label": zh[:2], "zh": zh, "en": en} for i, (zh, en) in enumerate(ls)],
        "source": {"zh": CLASSICAL_SOURCE["zh"], "en": CLASSICAL_SOURCE["en"], "dataset": CLASSICAL_SOURCE["dataset"]},
    }


# ── Hình SVG (ra đúng từng byte như bản TypeScript) ──────────────────────

_MAU = {
    "light": {"nen": "#ECEEEB", "o": "#FFFFFF", "vien": "#D3D9D5", "chu": "#1B1F1E", "chuMo": "#4F5956", "gach": "#B5402F"},
    "dark": {"nen": "#0F1E1D", "o": "#182A28", "vien": "#2C423F", "chu": "#E8EEEC", "chuMo": "#B3C2BE", "gach": "#EE8D78"},
}
_RONG_O = 200
_CAO = 232
_KHE = 40
_RONG_CHU = 184


def _thoat(s: str) -> str:
    return s.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;").replace('"', "&quot;")


def _rong_uoc(s: str) -> int:
    w = 0
    for ch in s:
        c = ord(ch)
        if 0x41 <= c <= 0x5A:
            w += 9
        elif c >= 0x2E80:
            w += 14
        else:
            w += 8
    return w


def _tieu_de(q: Dict[str, Any], lang: str) -> tuple:
    if lang == "zh":
        return "%d. %s" % (q["number"], q["nameZh"]), q["pinyin"]
    return "%d. %s" % (q["number"], q["name"]), "%s %s" % (q["nameHan"], q["pinyin"])


def _o(x0: int, q: Dict[str, Any], g: Optional[List[int]], lang: str, m: Dict[str, str]) -> str:
    s = ""
    for i in range(1, 7):
        y = 28 + (6 - i) * 24
        v = g[i - 1] if g else (7 if q["lines"][i - 1] else 8)
        if v in (7, 9):
            s += '<rect x="%d" y="%d" width="120" height="14" rx="2" fill="%s"/>' % (x0 + 40, y, m["chu"])
        else:
            s += ('<rect x="%d" y="%d" width="52" height="14" rx="2" fill="%s"/>'
                  '<rect x="%d" y="%d" width="52" height="14" rx="2" fill="%s"/>'
                  % (x0 + 40, y, m["chu"], x0 + 108, y, m["chu"]))
        x = x0 + 178
        cy = y + 7
        if v == 9:
            s += '<circle cx="%d" cy="%d" r="6" fill="none" stroke="%s" stroke-width="2"/>' % (x, cy, m["gach"])
        if v == 6:
            s += ('<path d="M%d %dL%d %dM%d %dL%d %d" stroke="%s" stroke-width="2"/>'
                  % (x - 5, cy - 5, x + 5, cy + 5, x + 5, cy - 5, x - 5, cy + 5, m["gach"]))
    t1, t2 = _tieu_de(q, lang)
    ep = ' textLength="%d" lengthAdjust="spacingAndGlyphs"' % _RONG_CHU if _rong_uoc(t1) > _RONG_CHU else ""
    s += '<text x="%d" y="192" text-anchor="middle" font-size="14" font-weight="600" fill="%s"%s>%s</text>' % (
        x0 + 100, m["chu"], ep, _thoat(t1))
    s += '<text x="%d" y="212" text-anchor="middle" font-size="12" fill="%s">%s</text>' % (x0 + 100, m["chuMo"], _thoat(t2))
    return s


def render_hexagram_svg(value: Any, lang: Optional[str] = None, theme: str = "light",
                        width: Optional[int] = None) -> str:
    """Draw a hexagram (or a cast, or six coin values) as a self-contained SVG;
    moving lines are marked and the changed hexagram is drawn on the right.
    Byte for byte the same as the TypeScript ``renderHexagramSvg``."""
    lg = _lang(lang)
    if theme not in ("light", "dark"):
        raise TypeError('theme must be "light" or "dark", got %r' % (theme,))
    if width is not None and not (type(width) is int and width > 0):
        raise ValueError("width must be a positive integer, got %r" % (width,))
    m = _MAU[theme]
    g = _gia_tri_gieo(value)
    r = core.gieo_tho(g)
    chinh = hexagram(r["primary"], lang=lg)
    bien = None if r["changed"] is None else hexagram(r["changed"], lang=lg)
    rong = _RONG_O * 2 + _KHE if bien else _RONG_O
    nhan = _tieu_de(chinh, lg)[0] + (" → " + _tieu_de(bien, lg)[0] if bien else "")
    kho = ' width="%d"' % width if width is not None else ' width="%d" height="%d"' % (rong, _CAO)
    s = ('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 %d %d"%s role="img" aria-label="%s" '
         "font-family=\"system-ui, -apple-system, 'Segoe UI', Roboto, 'Noto Sans', 'Noto Sans CJK SC', sans-serif\">"
         % (rong, _CAO, kho, _thoat(nhan)))
    s += "<title>%s</title>" % _thoat(nhan)
    s += '<rect width="%d" height="%d" rx="16" fill="%s"/>' % (rong, _CAO, m["nen"])
    s += '<rect x="8" y="8" width="%d" height="%d" rx="12" fill="%s" stroke="%s"/>' % (rong - 16, _CAO - 16, m["o"], m["vien"])
    s += _o(0, chinh, g, lg, m)
    if bien:
        s += ('<path d="M%d 95H%dM%d 89L%d 95L%d 101" fill="none" stroke="%s" stroke-width="2"/>'
              % (_RONG_O + 6, _RONG_O + _KHE - 8, _RONG_O + _KHE - 14, _RONG_O + _KHE - 8, _RONG_O + _KHE - 14, m["chuMo"]))
        s += _o(_RONG_O + _KHE, bien, None, lg, m)
    return s + "</svg>"
