"""Bộ công cụ vẽ chữ dùng chung cho ba hình SVG (Tử Vi, Bát Tự, Thần số học).

Chuyển ngữ ĐÚNG TỪNG PHÉP TÍNH của khối "Công cụ vẽ chữ" trong các tệp
``js/packages/*/src/ve-svg.ts``: test so chuỗi SVG của hai bản, nên thứ tự
phép toán, cách làm tròn và thứ tự thuộc tính phải giữ y hệt.

Bề rộng chữ là ƯỚC (SVG không đo chữ trước khi vẽ): bảng hệ số theo loại ký
tự, cố ý ước dư; chuỗi dài hơn chỗ thì co cỡ chữ, co tới cỡ nhỏ nhất mà vẫn
dài thì gắn ``textLength`` để trình duyệt ép đúng bề rộng.
"""

from __future__ import annotations

import math
from typing import Optional, Tuple

PHONG = ("-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, "
         "'Noto Sans', 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', 'Noto Sans CJK SC', sans-serif")

THANG_EN = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]


def so(n: float) -> str:
    """Số ra chuỗi, làm tròn một chữ số thập phân (nửa lên), không đuôi ".0"."""
    k = math.floor(n * 10 + 0.5)
    am = k < 0
    t = -k if am else k
    nguyen = t // 10
    le = t - nguyen * 10
    return ("-" if am else "") + str(nguyen) + ("" if le == 0 else "." + str(le))


def thoat(s: str) -> str:
    """Thoát năm ký tự đặc biệt của XML."""
    ra = []
    for c in s:
        if c == "&":
            ra.append("&amp;")
        elif c == "<":
            ra.append("&lt;")
        elif c == ">":
            ra.append("&gt;")
        elif c == '"':
            ra.append("&quot;")
        elif c == "'":
            ra.append("&#39;")
        else:
            ra.append(c)
    return "".join(ra)


_HEP = " iljI.,:;'|!·"
_VUA = "frt()[]/-"
_RONG = "mwMW@"
_SO_TU = "0123456789"


def _he_so(c: str) -> float:
    if ord(c) >= 0x2E80:
        return 1
    if c in _HEP:
        return 0.3
    if c in _VUA:
        return 0.38
    if c in _RONG:
        return 0.86
    if c in _SO_TU:
        return 0.58
    if c != c.lower():
        return 0.7
    return 0.56


def do_rong(s: str, co: float, dam: bool) -> float:
    """Bề rộng ước của chuỗi ở cỡ chữ ``co``."""
    w = 0
    for c in s:
        w += _he_so(c)
    # Phông hệ thống của Apple dùng nét "Text" rộng hơn ở cỡ nhỏ.
    nho = (20 - co) * 0.012 if co < 20 else 0
    return w * co * (1.07 if dam else 1) * (1 + nho)


def co_vua(s: str, co_max: float, co_min: float, rong: float, dam: bool) -> float:
    """Cỡ chữ lớn nhất (bước 0,5) không quá ``co_max`` để chuỗi vừa ``rong``."""
    co = co_max
    while co > co_min and do_rong(s, co, dam) > rong:
        co -= 0.5
    return co_min if co < co_min else co


def chu(x: float, y: float, s: str, co: float, mau: str, dam: bool = False, neo: str = "start",
        rong: Optional[float] = None, co_min: Optional[float] = None, nghieng: bool = False,
        gian_chu: float = 0) -> Tuple[str, float, float]:
    """Một thẻ <text>; trả (svg, bề rộng ước, cỡ chữ đã dùng)."""
    co_dung = co
    ep = ""
    r = do_rong(s, co_dung, dam)
    if rong is not None and r > rong:
        co_dung = co_vua(s, co, co if co_min is None else co_min, rong, dam)
        r = do_rong(s, co_dung, dam)
        if r > rong:
            ep = ' textLength="%s" lengthAdjust="spacingAndGlyphs"' % so(rong)
            r = rong
    n = ' text-anchor="%s"' % neo if neo and neo != "start" else ""
    dd = ' font-weight="700"' if dam else ""
    ng = ' font-style="italic"' if nghieng else ""
    gc = ' letter-spacing="%s"' % so(gian_chu) if gian_chu else ""
    svg = '<text x="%s" y="%s" font-size="%s" fill="%s"%s%s%s%s%s>%s</text>' % (
        so(x), so(y), so(co_dung), mau, dd, ng, n, gc, ep, thoat(s))
    return svg, r, co_dung


def hop(x: float, y: float, w: float, h: float, r: float, fill: str, vien: str = "", day: float = 0,
        net: str = "") -> str:
    """Một hình chữ nhật bo góc."""
    v = ' stroke="%s" stroke-width="%s"' % (vien, so(day)) if vien else ""
    n = ' stroke-dasharray="%s"' % net if net else ""
    return '<rect x="%s" y="%s" width="%s" height="%s" rx="%s" fill="%s"%s%s/>' % (
        so(x), so(y), so(w), so(h), so(r), fill, v, n)


def vien(x: float, y_giua: float, s: str, co: float, nen: str, mau_chu: str,
         vien_ngoai: str = "") -> Tuple[str, float]:
    """Viên nhãn có chữ; trả (svg, bề rộng)."""
    w = do_rong(s, co, True) + co * 0.9
    h = co + 5
    r = hop(x, y_giua - h / 2, w, h, h / 2, "none" if vien_ngoai else nen, vien_ngoai, 1)
    t = chu(x + w / 2, y_giua + co * 0.36, s, co, mau_chu, dam=True, neo="middle")[0]
    return r + t, w


def chon(lang: str, vi: str, en: str, zh: str) -> str:
    return vi if lang == "vi" else en if lang == "en" else zh


def chuan_lang(lang: Optional[str]) -> str:
    return lang if lang in ("en", "zh") else "vi"


def mo_dau(lang: str, w: int, h: int, rong_hien: float, tieu_de: str, mo_ta: str) -> str:
    """Thẻ mở <svg>, <title>, <desc> và <style> phông chữ."""
    cao_hien = (rong_hien * h) / w
    return "".join([
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 %d %d" width="%s" height="%s" role="img" '
        'aria-labelledby="nn-tieu-de nn-mo-ta" lang="%s">' % (w, h, so(rong_hien), so(cao_hien), lang),
        '<title id="nn-tieu-de">%s</title>' % thoat(tieu_de),
        '<desc id="nn-mo-ta">%s</desc>' % thoat(mo_ta),
        "<style>text{font-family:%s;}</style>" % PHONG,
    ])


def dau_nhat_nguyet(cx_vong: float, cy_vong: float, x_chu: float, y_chu: float, lang: str,
                    mau_vang: str, mau_chu: str) -> str:
    """Dấu trống đồng giản lược và chữ NHẬT NGUYỆT."""
    ten = chon(lang, "NHẬT NGUYỆT", "NHAT NGUYET", "NHAT NGUYET")
    return "".join([
        '<circle cx="%s" cy="%s" r="8" fill="none" stroke="%s" stroke-width="2.5"/>' % (so(cx_vong), so(cy_vong), mau_vang),
        '<circle cx="%s" cy="%s" r="3" fill="%s"/>' % (so(cx_vong), so(cy_vong), mau_vang),
        chu(x_chu, y_chu, ten, 12, mau_chu, dam=True, gian_chu=2.2)[0],
    ])


def duong(x1: float, y1: float, x2: float, y2: float, mau: str) -> str:
    return '<line x1="%s" y1="%s" x2="%s" y2="%s" stroke="%s" stroke-width="1"/>' % (so(x1), so(y1), so(x2), so(y2), mau)
