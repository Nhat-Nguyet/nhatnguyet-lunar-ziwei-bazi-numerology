"""Tiện ích so ca kiểm dùng chung cho mọi môn.

Đọc thu-vien-mo/ca-kiem/<mon>.json (đường tương đối từ tệp này), bỏ các khoá
trong ``khoaBo`` ở mọi tầng của cả đáp án Go lẫn kết quả Python, rồi so sâu:
thứ tự khoá không tính, mảng so theo thứ tự, số thực lệch tối đa 1e-9, khoá
có ở bên này mà thiếu ở bên kia là lệch.
"""

import json
import math
import os
from typing import Any, Callable, Dict, List, Optional, Tuple

THU_MUC_CA_KIEM = os.path.normpath(os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "..", "ca-kiem"))
SAI_SO = 1e-9


def doc_ca_kiem(mon: str) -> Dict[str, Any]:
    """Đọc tệp ca kiểm của một môn."""
    with open(os.path.join(THU_MUC_CA_KIEM, mon + ".json"), encoding="utf-8") as f:
        return json.load(f)


def bo_khoa(v: Any, khoa_bo) -> Any:
    """Bỏ các khoá trong khoa_bo ở mọi tầng (trả bản mới)."""
    if isinstance(v, dict):
        return {k: bo_khoa(x, khoa_bo) for k, x in v.items() if k not in khoa_bo}
    if isinstance(v, (list, tuple)):
        return [bo_khoa(x, khoa_bo) for x in v]
    return v


def cho_lech(mong: Any, that: Any, duong: str = "$") -> Optional[str]:
    """Đường dẫn khoá ĐẦU TIÊN lệch kèm hai giá trị; None khi khớp."""
    if isinstance(mong, bool) or isinstance(that, bool):
        if mong is that:
            return None
        return "%s: chờ %r, ra %r" % (duong, mong, that)
    if isinstance(mong, (int, float)) and isinstance(that, (int, float)):
        if isinstance(mong, float) or isinstance(that, float):
            if math.isfinite(mong) and math.isfinite(that) and abs(mong - that) <= SAI_SO:
                return None
        elif mong == that:
            return None
        return "%s: chờ %r, ra %r" % (duong, mong, that)
    if isinstance(mong, dict) and isinstance(that, dict):
        for k in sorted(set(mong) | set(that)):
            if k not in that:
                return "%s.%s: thiếu khoá (chờ %r)" % (duong, k, mong[k])
            if k not in mong:
                return "%s.%s: thừa khoá (ra %r)" % (duong, k, that[k])
            r = cho_lech(mong[k], that[k], "%s.%s" % (duong, k))
            if r:
                return r
        return None
    if isinstance(mong, list) and isinstance(that, list):
        if len(mong) != len(that):
            return "%s: độ dài chờ %d, ra %d" % (duong, len(mong), len(that))
        for i, (a, b) in enumerate(zip(mong, that)):
            r = cho_lech(a, b, "%s[%d]" % (duong, i))
            if r:
                return r
        return None
    if mong == that and type(mong) is type(that):
        return None
    return "%s: chờ %r, ra %r" % (duong, mong, that)


def so_mon(mon: str, tinh: Callable[[Dict[str, Any]], Any], loc: Optional[Callable[[Dict[str, Any]], bool]] = None,
           in_toi_da: int = 5) -> Tuple[int, int, List[str]]:
    """Chạy ``tinh(vao)`` trên mọi ca (qua bộ lọc ``loc`` nếu có), so với ``ra``.
    Trả (số ca đạt, số ca đã chạy, danh sách mô tả tối đa in_toi_da ca lệch)."""
    tep = doc_ca_kiem(mon)
    khoa_bo = frozenset(tep.get("khoaBo", []))
    dat, tong, lech = 0, 0, []
    for i, ca in enumerate(tep["ca"]):
        if loc is not None and not loc(ca["vao"]):
            continue
        tong += 1
        mong = bo_khoa(ca["ra"], khoa_bo)
        try:
            that = bo_khoa(json.loads(json.dumps(tinh(ca["vao"]), ensure_ascii=False)), khoa_bo)
            r = cho_lech(mong, that)
        except Exception as e:  # lỗi lúc tính cũng là một ca lệch
            r = "lỗi %s: %s" % (type(e).__name__, e)
        if r is None:
            dat += 1
        elif len(lech) < in_toi_da:
            lech.append("ca %d %s\n    %s" % (i, json.dumps(ca["vao"], ensure_ascii=False), r))
    return dat, tong, lech
