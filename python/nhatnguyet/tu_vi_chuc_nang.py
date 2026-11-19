"""Lookup helpers and horoscope for a Zi Wei chart from ``cast_zi_wei``.

Python port of ``js/packages/tu-vi/src/chuc-nang.ts``; for the same input the
JSON of every result is byte-identical to the TypeScript one (checked by
``chuc-nang.test.ts``).

Example::

    from nhatnguyet import cast_zi_wei
    from nhatnguyet.tu_vi_chuc_nang import horoscope, palace_of, surrounding_palaces
    chart = cast_zi_wei(date="1990-09-19", time="20:00", gender="male")
    horoscope(chart, date="2026-11-19")["year"]["palace"]          # 'Health'
    surrounding_palaces(chart, "Life Palace")["career"]["name"]     # 'Career'

Hàm tra cứu trên lá số của API tiếng Anh: cung theo tên, sao, tam phương tứ
chính, hai cung giáp, đường bay Tứ Hóa (phi tinh), vận hạn ở một ngày. Mọi giá
trị lấy từ lõi (đại vận, hạn năm, tiểu vận, lưu Tứ Hóa, nguyệt hạn, sao lưu,
bảng Tứ Hóa áp cho can cung). Lõi không có thì để ``None`` hay mảng rỗng: tứ
hóa của tháng, lưu nhật, lưu thời, đồng hạn (trước đại vận đầu, ``decade`` là
``None``).
"""

from __future__ import annotations

import datetime as _dt
from typing import Any, Dict, List, Optional, Union

from . import am_lich, en, tu_vi
from .tu_vi_schools import tu_hoa_theo_phai
from .tu_vi_han import vi_tri_sao

__all__ = [
    "palace_of", "star_of", "surrounding_palaces", "flanking_palaces", "palace_has", "palace_has_one_of",
    "palace_not_have", "palace_is_empty", "flying_transformations", "flies_to", "self_transformed", "horoscope",
]

PalaceRef = Union[int, str]

_BON_HOA = ("Hóa Lộc", "Hóa Quyền", "Hóa Khoa", "Hóa Kỵ")
_TEN_HOA = (
    ("hóa lộc", "lộc", "hoa loc", "loc", "hua lu", "lu", "化禄", "禄", "化祿", "祿"),
    ("hóa quyền", "quyền", "hoa quyen", "quyen", "hua quan", "quan", "化权", "权", "化權", "權"),
    ("hóa khoa", "khoa", "hoa khoa", "hua ke", "ke", "化科", "科"),
    ("hóa kỵ", "kỵ", "hoa ky", "ky", "hua ji", "ji", "化忌", "忌"),
)


def _chi_so_hoa(ten: Any) -> int:
    if not isinstance(ten, str):
        raise TypeError('transformation must be a string such as "Hua Lu", "lu", "禄"')
    k = ten.strip().lower()
    for i, ds in enumerate(_TEN_HOA):
        if k in ds:
            return i
    raise ValueError("unknown transformation %r: use Lu, Quan, Ke or Ji (or 禄, 权, 科, 忌)" % (ten,))


def _hop(chart: Dict, lang: Optional[str] = None, terms: Optional[str] = None) -> Dict[str, Any]:
    # Như _box của en.py (cùng luật chọn lang, terms).
    if "raw" in chart and "palaces" in chart:
        l = en._lang(lang or chart["lang"])
        tm = terms if terms is not None else (chart.get("terms") if l == chart["lang"] else None)
        raw = chart["raw"]
    elif "cung" in chart:
        l = en._lang(lang)
        tm = terms
        raw = chart
    else:
        raise TypeError("expected a chart from cast_zi_wei (or lap_la_so_tu_vi)")
    tm = en.check_terms(tm, l)
    if "palaces" in chart and l == chart["lang"] and tm == chart.get("terms"):
        # Cùng ngôn ngữ, cùng lối viết: trả chính các cung của lá.
        return {"raw": raw, "lang": l, "terms": tm, "la": chart}
    return {"raw": raw, "lang": l, "terms": tm, "la": en._localize_zi_wei(raw, l, None, 0, tm)}


def _ten_ba_thu(raw: Dict) -> Dict[str, list]:
    ba = [en._localize_zi_wei(raw, l, None, 0) for l in ("vi", "en", "zh")]
    cung = [{x["palaces"][i]["name"].lower() for x in ba} for i in range(12)]
    sao = [[{x["palaces"][i]["stars"][j]["name"].lower() for x in ba} for j in range(len(c["sao"]))]
           for i, c in enumerate(raw["cung"])]
    return {"cung": cung, "sao": sao}


def _vi_tri_cung(raw: Dict, ref: PalaceRef) -> int:
    if isinstance(ref, bool) or not isinstance(ref, (int, str)):
        raise TypeError("palace must be an index (0-11) or a name")
    if isinstance(ref, int):
        if not 0 <= ref <= 11:
            raise ValueError("palace index must be an integer 0 (Tý) to 11 (Hợi)")
        return ref
    k = ref.strip().lower()
    for i, s in enumerate(_ten_ba_thu(raw)["cung"]):
        if k in s:
            return i
    raise ValueError("unknown palace %r" % (ref,))


def _sao_hoa_cua_cung(raw: Dict, vi_tri: int) -> List[str]:
    can = am_lich.THIEN_CAN.index(raw["cung"][vi_tri]["canChi"].split(" ")[0])
    return list(tu_hoa_theo_phai(can, (raw.get("schools") or {}).get("transformations")))


def _ten_sao(h: Dict, ten: str) -> str:
    for p in h["la"]["palaces"]:
        for s in p["stars"]:
            if s["nameVi"] == ten:
                return s["name"]
    return en.term(ten, h["lang"])


def _hoa_cua_cung(h: Dict, vi_tri: int) -> List[Dict[str, Any]]:
    out = []
    for i, sao in enumerate(_sao_hoa_cua_cung(h["raw"], vi_tri)):
        p = vi_tri_sao(h["raw"], sao)
        out.append({
            "type": en.term_name(_BON_HOA[i], h["lang"], h["terms"]),
            "star": _ten_sao(h, sao),
            "palaceIndex": p if p >= 0 else None,
            "palace": h["la"]["palaces"][p]["name"] if p >= 0 else None,
            "self": p == vi_tri,
        })
    return out


def _bo_self(x: Dict[str, Any]) -> Dict[str, Any]:
    return {"type": x["type"], "star": x["star"], "palaceIndex": x["palaceIndex"], "palace": x["palace"]}


def _ten_xoay(h: Dict, tu: int) -> List[str]:
    m = h["raw"]["cungMenh"]
    return [h["la"]["palaces"][(m + i - tu) % 12]["name"] for i in range(12)]


def _pham_vi(h: Dict, vi_tri: int, stem_branch: str, transformations: List[Dict]) -> Dict[str, Any]:
    p = h["la"]["palaces"][vi_tri]
    return {"palaceIndex": vi_tri, "branch": en.term_name(am_lich.DIA_CHI[vi_tri], h["lang"], h["terms"]),
            "palace": p["name"], "stemBranch": stem_branch, "palaceNames": _ten_xoay(h, vi_tri),
            "transformations": transformations}


def palace_of(chart: Dict, ref: PalaceRef, lang: Optional[str] = None,
              terms: Optional[str] = None) -> Optional[Dict[str, Any]]:
    """A palace by index (0 = Tý) or name in any of the three languages; ``None`` when the name is unknown."""
    h = _hop(chart, lang, terms)
    try:
        return h["la"]["palaces"][_vi_tri_cung(h["raw"], ref)]
    except ValueError:
        if isinstance(ref, str):
            return None
        raise


def star_of(chart: Dict, name: str, lang: Optional[str] = None,
            terms: Optional[str] = None) -> Optional[Dict[str, Any]]:
    """A star by name in any of the three languages, with its palace: ``{"star", "palace"}``; ``None`` when absent."""
    h = _hop(chart, lang, terms)
    k = str(name).strip().lower()
    sao = _ten_ba_thu(h["raw"])["sao"]
    for i in range(12):
        for j, s in enumerate(sao[i]):
            if k in s:
                return {"star": h["la"]["palaces"][i]["stars"][j], "palace": h["la"]["palaces"][i]}
    return None


def surrounding_palaces(chart: Dict, ref: PalaceRef, lang: Optional[str] = None,
                        terms: Optional[str] = None) -> Dict[str, Any]:
    """The three harmonies and the opposite palace (三方四正): target, opposite (+6), wealth (+8), career (+4)."""
    h = _hop(chart, lang, terms)
    i = _vi_tri_cung(h["raw"], ref)
    p = h["la"]["palaces"]
    return {"target": p[i], "opposite": p[(i + 6) % 12], "wealth": p[(i + 8) % 12], "career": p[(i + 4) % 12]}


def flanking_palaces(chart: Dict, ref: PalaceRef, lang: Optional[str] = None,
                     terms: Optional[str] = None) -> Dict[str, Any]:
    """The two palaces flanking a palace (giáp cung): previous (-1) and next (+1)."""
    h = _hop(chart, lang, terms)
    i = _vi_tri_cung(h["raw"], ref)
    p = h["la"]["palaces"]
    return {"previous": p[(i - 1) % 12], "next": p[(i + 1) % 12]}


def _co_sao(raw: Dict, vi_tri: int, ten: str) -> bool:
    k = str(ten).strip().lower()
    return any(k in s for s in _ten_ba_thu(raw)["sao"][vi_tri])


def palace_has(chart: Dict, ref: PalaceRef, stars: List[str]) -> bool:
    """The palace holds every star in ``stars`` (names in any of the three languages)."""
    raw = _hop(chart)["raw"]
    i = _vi_tri_cung(raw, ref)
    return all(_co_sao(raw, i, s) for s in stars)


def palace_has_one_of(chart: Dict, ref: PalaceRef, stars: List[str]) -> bool:
    """The palace holds at least one star in ``stars``."""
    raw = _hop(chart)["raw"]
    i = _vi_tri_cung(raw, ref)
    return any(_co_sao(raw, i, s) for s in stars)


def palace_not_have(chart: Dict, ref: PalaceRef, stars: List[str]) -> bool:
    """The palace holds none of ``stars``."""
    raw = _hop(chart)["raw"]
    i = _vi_tri_cung(raw, ref)
    return all(not _co_sao(raw, i, s) for s in stars)


def palace_is_empty(chart: Dict, ref: PalaceRef, except_stars: Optional[List[str]] = None) -> bool:
    """No major star in the palace (vô chính diệu), unless one of ``except_stars`` is there."""
    raw = _hop(chart)["raw"]
    i = _vi_tri_cung(raw, ref)
    if any(s["loai"] == "chinh-tinh" for s in raw["cung"][i]["sao"]):
        return False
    return not any(_co_sao(raw, i, s) for s in (except_stars or []))


def flying_transformations(chart: Dict, ref: PalaceRef, lang: Optional[str] = None,
                           terms: Optional[str] = None) -> List[Dict[str, Any]]:
    """The four flying transformations of a palace (its stem, the engine's Four
    Transformations table), each with where the star sits and ``self``."""
    h = _hop(chart, lang, terms)
    return _hoa_cua_cung(h, _vi_tri_cung(h["raw"], ref))


def flies_to(chart: Dict, from_: PalaceRef, to: PalaceRef, types: Union[str, List[str]]) -> bool:
    """The stem of ``from_`` transforms, with every type in ``types``, a star sitting in ``to``."""
    raw = _hop(chart)["raw"]
    a = _vi_tri_cung(raw, from_)
    b = _vi_tri_cung(raw, to)
    sao = _sao_hoa_cua_cung(raw, a)
    ds = types if isinstance(types, list) else [types]
    return len(ds) > 0 and all(vi_tri_sao(raw, sao[_chi_so_hoa(t)]) == b for t in ds)


def self_transformed(chart: Dict, ref: PalaceRef, types: Union[str, List[str], None] = None) -> bool:
    """Self-transformation (自化): the palace stem transforms, with every type in
    ``types`` (default: any of the four), a star in the same palace."""
    raw = _hop(chart)["raw"]
    i = _vi_tri_cung(raw, ref)
    sao = _sao_hoa_cua_cung(raw, i)
    if types is None or (isinstance(types, list) and not types):
        return any(vi_tri_sao(raw, s) == i for s in sao)
    ds = types if isinstance(types, list) else [types]
    return all(vi_tri_sao(raw, sao[_chi_so_hoa(t)]) == i for t in ds)


def horoscope(chart: Dict, date: Optional[en.DateInput] = None, lang: Optional[str] = None,
              terms: Optional[str] = None) -> Dict[str, Any]:
    """Horoscope of a date (default: today): ``decade`` (None before the first
    period), ``minorLimit``, ``year`` (with transformations and moving stars),
    ``month`` (Đẩu Quân rule); ``day`` and ``hour`` are None (not computed)."""
    h = _hop(chart, lang, terms)
    raw = h["raw"]
    if date is None:
        t = _dt.date.today()
        d = {"year": t.year, "month": t.month, "day": t.day}
    else:
        d = en.parse_date(date)
    am = am_lich.solar_to_lunar(d["day"], d["month"], d["year"])
    hn = tu_vi.tinh_han_nam(raw, am["year"])
    yl = en.yearly_luck(raw, am["year"], lang=h["lang"], terms=h["terms"])
    dv = next((c for c in tu_vi.dai_van(raw) if c["tuTuoi"] <= hn["tuoiMu"] <= c["denTuoi"]), None)
    can_nam = (am["year"] - 4) % 10
    can_thang = (am_lich.can_thang_dan(can_nam) + am["month"] - 1) % 10
    chi_thang = (2 + am["month"] - 1) % 12
    thang = yl["months"][am["month"] - 1]
    pal = h["la"]["palaces"]
    decade = None
    if dv is not None:
        decade = _pham_vi(h, dv["viTri"], pal[dv["viTri"]]["stemBranch"],
                          [_bo_self(x) for x in _hoa_cua_cung(h, dv["viTri"])])
        decade["fromAge"] = dv["tuTuoi"]
        decade["toAge"] = dv["denTuoi"]
    tv = hn["tieuVanViTri"]
    year = _pham_vi(h, hn["luuNienViTri"], yl["yearPillar"], yl["transformations"])
    year["year"] = am["year"]
    year["stars"] = en.yearly_stars(raw, am["year"], lang=h["lang"], terms=h["terms"])
    month = _pham_vi(h, thang["index"], en.stem_branch_name(
        "%s %s" % (am_lich.THIEN_CAN[can_thang], am_lich.DIA_CHI[chi_thang]), h["lang"], h["terms"]), [])
    month["month"] = am["month"]
    return {
        "date": en._iso(d),
        "lunar": {"year": am["year"], "month": am["month"], "day": am["day"], "leap": am["leap"]},
        "age": hn["tuoiMu"],
        "decade": decade,
        "minorLimit": _pham_vi(h, tv, pal[tv]["stemBranch"], [_bo_self(x) for x in _hoa_cua_cung(h, tv)]),
        "year": year,
        "month": month,
        "day": None,
        "hour": None,
    }
