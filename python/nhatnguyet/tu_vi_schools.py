"""Lựa chọn phái của lá số Tử Vi (chuyển ngữ coreengine/tuy_chon_phai.go và
js/packages/tu-vi/src/schools.ts).

Khoá và giá trị tiếng Anh (API công khai của thư viện bằng tiếng Anh); mặc
định giữ đúng từng byte lá số cũ. Nguồn của từng lựa chọn ở bản Go và ở
docs/schools.md.

School options of the Zi Wei chart: where the books disagree, as named,
documented parameters. Defaults reproduce the previous output byte for byte.

- ``fireBell``: "vietnamese" (default, Tân Biên 8.6.3), "quanshu" (both count
  forward), "swap-for-female", "swap-for-yin-male-yang-female".
- ``leapMonth``: "whole" (default), "split-at-15", "next-month".
- ``transformations``: "vietnamese" (default), "quanshu", "zhongzhou" (only the
  Canh row differs).
- ``heavenlyKitchen``: "vietnamese" (default, Quý at Tuất), "chinese" (Quý at Hợi).
- ``injuryMessenger``: "standard" (default), "zhongzhou" (swapped for yin-year
  men and yang-year women).
"""

from __future__ import annotations

import json
from typing import Dict, List, Optional, Tuple

from .am_lich import mod
from .tu_vi_du_lieu import TU_HOA_THEO_CAN
from .tu_vi_sao_phu_them import khoi_hoa_linh, vi_tri_hoa_linh, vi_tri_thien_tru

# Thứ tự khoá cố định (như thứ tự trường của struct Go).
ZI_WEI_SCHOOL_KEYS = ("fireBell", "leapMonth", "transformations", "heavenlyKitchen", "injuryMessenger")

# Giá trị nhận được của từng lựa chọn, mặc định đứng đầu.
ZI_WEI_SCHOOL_VALUES: Dict[str, Tuple[str, ...]] = {
    "fireBell": ("vietnamese", "quanshu", "swap-for-female", "swap-for-yin-male-yang-female"),
    "leapMonth": ("whole", "split-at-15", "next-month"),
    "transformations": ("vietnamese", "quanshu", "zhongzhou"),
    "heavenlyKitchen": ("vietnamese", "chinese"),
    "injuryMessenger": ("standard", "zhongzhou"),
}

def _js(v) -> str:
    """Chuỗi như JSON.stringify của bản TS (cho thông điệp lỗi)."""
    return json.dumps(v, ensure_ascii=False)


def normalize_zi_wei_schools(o) -> Optional[Dict[str, str]]:
    """Bỏ giá trị mặc định, ném ValueError khi khoá hay giá trị lạ (thông điệp
    như bản Go, TS). Trả None khi mọi lựa chọn là mặc định."""
    if o is None:
        return None
    if not isinstance(o, dict):
        raise ValueError("schools must be an object")
    for k in o:
        if k not in ZI_WEI_SCHOOL_KEYS:
            raise ValueError("unknown school option %s; use %s" % (_js(k), ", ".join(ZI_WEI_SCHOOL_KEYS)))
    r: Dict[str, str] = {}
    for k in ZI_WEI_SCHOOL_KEYS:
        v = o.get(k)
        if v is None or v == "":
            continue
        hop_le = ZI_WEI_SCHOOL_VALUES[k]
        if not isinstance(v, str) or v not in hop_le:
            raise ValueError("invalid %s %s, expected one of: %s" % (k, _js(v), ", ".join(hop_le)))
        if v != hop_le[0]:
            r[k] = v
    return r or None


# Hàng can Canh theo từng lối (hàng các can khác như TU_HOA_THEO_CAN).
_TU_HOA_CANH = {
    "quanshu": ("Thái Dương", "Vũ Khúc", "Thái Âm", "Thiên Đồng"),
    "zhongzhou": ("Thái Dương", "Vũ Khúc", "Thiên Phủ", "Thiên Đồng"),
}


def tu_hoa_theo_phai(can_idx: int, transformations: Optional[str] = None) -> Tuple[str, str, str, str]:
    """Bốn sao hóa (Lộc, Quyền, Khoa, Kỵ) của can chỉ số can_idx (0 là Giáp)
    theo lựa chọn transformations."""
    if can_idx == 6 and transformations in _TU_HOA_CANH:
        return _TU_HOA_CANH[transformations]
    return TU_HOA_THEO_CAN[mod(can_idx, 10)]


def thang_an_theo_phai(am: Dict, leap_month: Optional[str] = None) -> int:
    """Tháng âm dùng để an sao theo lựa chọn leapMonth (tháng thường: chính nó)."""
    if not am.get("leap"):
        return am["month"]
    sau = am["month"] % 12 + 1
    if leap_month == "next-month":
        return sau
    if leap_month == "split-at-15" and am["day"] > 15:
        return sau
    return am["month"]


def vi_tri_hoa_linh_theo_phai(chi_nam: int, gio: int, am_duong_nam_nu: int, nu: bool,
                              fire_bell: Optional[str] = None) -> Tuple[int, int]:
    """Hỏa Tinh, Linh Tinh theo lựa chọn fireBell (None: lối Tân Biên)."""
    kh, kl = khoi_hoa_linh(chi_nam)
    if fire_bell == "quanshu":
        pass
    elif fire_bell == "swap-for-female":
        if nu:
            kh, kl = kl, kh
    elif fire_bell == "swap-for-yin-male-yang-female":
        if am_duong_nam_nu < 0:
            kh, kl = kl, kh
    else:
        return vi_tri_hoa_linh(chi_nam, gio, am_duong_nam_nu)
    return mod(kh + gio, 12), mod(kl + gio, 12)


def vi_tri_thien_tru_theo_phai(can_nam: int, heavenly_kitchen: Optional[str] = None) -> int:
    """Thiên Trù theo lựa chọn heavenlyKitchen ("chinese": can Quý ở Hợi)."""
    if heavenly_kitchen == "chinese" and mod(can_nam, 10) == 9:
        return 11
    return vi_tri_thien_tru(can_nam)


# ── Lời rào ghép theo lựa chọn (chép từ bản Go) ──────────────────────────

_DAU = {
    "vi": "Lá số lập theo bản phổ biến ở Việt Nam, phần lớn theo Tử Vi Đẩu Số Tân Biên. "
          "Tứ Hóa của can Canh, Tân, Nhâm có dị bản giữa các phái. ",
    "en": "This chart follows the version most used in Vietnam, largely after Tử Vi Đẩu Số Tân Biên. "
          "The Four Transformations for the stems Canh, Tân and Nhâm differ between schools. ",
    "zh": "本命盘按越南最通行的版本排出，大体依《紫微斗数新编》。"
          "庚、辛、壬三干的四化各派说法不一。",
}

_TU_HOA = {
    "": {
        "vi": "Riêng can Canh, lá số này dùng Thiên Đồng hóa Khoa, Thái Âm hóa Kỵ theo Huyền Vi, Thiên Lương và Việt Viêm Tử; Tân Biên và Tử Vi Đẩu Số toàn thư ghi Thái Âm hóa Khoa, Thiên Đồng hóa Kỵ; có sách ghi Thiên Phủ hóa Khoa, Thiên Đồng hóa Kỵ. ",
        "en": "For Canh, this chart uses Thiên Đồng as Hóa Khoa and Thái Âm as Hóa Kỵ, after Huyền Vi, Thiên Lương and Việt Viêm Tử; Tân Biên and the Tử Vi Đẩu Số Toàn Thư give Thái Âm as Hóa Khoa and Thiên Đồng as Hóa Kỵ; others give Thiên Phủ as Hóa Khoa and Thiên Đồng as Hóa Kỵ. ",
        "zh": "庚干本命盘取天同化科、太阴化忌，依三位越南作者的紫微书；《紫微斗数新编》与《紫微斗数全书》作太阴化科、天同化忌；也有的书作天府化科、天同化忌。",
    },
    "quanshu": {
        "vi": "Riêng can Canh, lá số này dùng Thái Âm hóa Khoa, Thiên Đồng hóa Kỵ theo Tân Biên và Tử Vi Đẩu Số toàn thư; Huyền Vi, Thiên Lương và Việt Viêm Tử ghi Thiên Đồng hóa Khoa, Thái Âm hóa Kỵ; Vương Đình Chi ghi Thiên Phủ hóa Khoa, Thiên Đồng hóa Kỵ. ",
        "en": "For Canh, this chart uses Thái Âm as Hóa Khoa and Thiên Đồng as Hóa Kỵ, after Tân Biên and the Tử Vi Đẩu Số Toàn Thư; Huyền Vi, Thiên Lương and Việt Viêm Tử give Thiên Đồng as Hóa Khoa and Thái Âm as Hóa Kỵ; Wang Tingzhi gives Thiên Phủ as Hóa Khoa and Thiên Đồng as Hóa Kỵ. ",
        "zh": "庚干本命盘取太阴化科、天同化忌，依《紫微斗数新编》与《紫微斗数全书》；三位越南作者的紫微书作天同化科、太阴化忌；王亭之作天府化科、天同化忌。",
    },
    "zhongzhou": {
        "vi": "Riêng can Canh, lá số này dùng Thiên Phủ hóa Khoa, Thiên Đồng hóa Kỵ theo Vương Đình Chi (phái Trung Châu); Tân Biên và Tử Vi Đẩu Số toàn thư ghi Thái Âm hóa Khoa, Thiên Đồng hóa Kỵ; Huyền Vi, Thiên Lương và Việt Viêm Tử ghi Thiên Đồng hóa Khoa, Thái Âm hóa Kỵ. ",
        "en": "For Canh, this chart uses Thiên Phủ as Hóa Khoa and Thiên Đồng as Hóa Kỵ, after Wang Tingzhi (Zhongzhou school); Tân Biên and the Tử Vi Đẩu Số Toàn Thư give Thái Âm as Hóa Khoa and Thiên Đồng as Hóa Kỵ; Huyền Vi, Thiên Lương and Việt Viêm Tử give Thiên Đồng as Hóa Khoa and Thái Âm as Hóa Kỵ. ",
        "zh": "庚干本命盘取天府化科、天同化忌，依王亭之（中州派）；《紫微斗数新编》与《紫微斗数全书》作太阴化科、天同化忌；三位越南作者的紫微书作天同化科、太阴化忌。",
    },
}

_HOA_LINH = {
    "": {
        "vi": "Hỏa Tinh, Linh Tinh an theo Tân Biên: Dương Nam, Âm Nữ đếm Hỏa thuận, Linh nghịch; Âm Nam, Dương Nữ ngược lại. Tử Vi Đẩu Số toàn thư đếm cả hai sao thuận.",
        "en": "Hỏa Tinh and Linh Tinh follow Tân Biên: for a yang-year man or yin-year woman Hỏa Tinh counts forward and Linh Tinh backward, the other way round for a yin-year man or yang-year woman. The Tử Vi Đẩu Số Toàn Thư counts both forward.",
        "zh": "火星、铃星依《紫微斗数新编》安：阳男阴女火星顺数、铃星逆数，阴男阳女相反。《紫微斗数全书》二星皆顺数。",
    },
    "quanshu": {
        "vi": "Hỏa Tinh, Linh Tinh an theo Tử Vi Đẩu Số toàn thư: cả hai sao đếm thuận, không xét âm dương nam nữ. Tân Biên đếm Hỏa thuận, Linh nghịch với Dương Nam, Âm Nữ và ngược lại với Âm Nam, Dương Nữ.",
        "en": "Hỏa Tinh and Linh Tinh follow the Tử Vi Đẩu Số Toàn Thư: both count forward whatever the sex and year polarity. Tân Biên counts Hỏa Tinh forward and Linh Tinh backward for a yang-year man or yin-year woman, the other way round for a yin-year man or yang-year woman.",
        "zh": "火星、铃星依《紫微斗数全书》安：二星皆顺数，不分阴阳男女。《紫微斗数新编》阳男阴女火星顺数、铃星逆数，阴男阳女相反。",
    },
    "swap-for-female": {
        "vi": "Hỏa Tinh, Linh Tinh an theo Việt Viêm Tử (Tử Vi áo bí biện chứng học): cả hai sao đếm thuận, người nữ đổi cung khởi của hai sao cho nhau. Tân Biên đếm Hỏa thuận, Linh nghịch với Dương Nam, Âm Nữ và ngược lại với Âm Nam, Dương Nữ.",
        "en": "Hỏa Tinh and Linh Tinh follow Việt Viêm Tử (Tử Vi áo bí biện chứng học): both count forward, and for a woman the two starting palaces are swapped. Tân Biên counts Hỏa Tinh forward and Linh Tinh backward for a yang-year man or yin-year woman, the other way round for a yin-year man or yang-year woman.",
        "zh": "火星、铃星依 Việt Viêm Tử（《Tử Vi áo bí biện chứng học》）安：二星皆顺数，女命二星起宫互换。《紫微斗数新编》阳男阴女火星顺数、铃星逆数，阴男阳女相反。",
    },
    "swap-for-yin-male-yang-female": {
        "vi": "Hỏa Tinh, Linh Tinh an như ba lá số in trong Số Tử Vi Kinh Nghiệm (Quan Xuân Thịnh): cả hai sao đếm thuận, Âm Nam, Dương Nữ đổi cung khởi của hai sao cho nhau. Tân Biên đếm Hỏa thuận, Linh nghịch với Dương Nam, Âm Nữ và ngược lại với Âm Nam, Dương Nữ.",
        "en": "Hỏa Tinh and Linh Tinh are placed as in the three charts printed in Số Tử Vi Kinh Nghiệm (Quan Xuân Thịnh): both count forward, and for a yin-year man or yang-year woman the two starting palaces are swapped. Tân Biên counts Hỏa Tinh forward and Linh Tinh backward for a yang-year man or yin-year woman, the other way round for a yin-year man or yang-year woman.",
        "zh": "火星、铃星依 Quan Xuân Thịnh《Số Tử Vi Kinh Nghiệm》所载三张命盘安：二星皆顺数，阴男阳女二星起宫互换。《紫微斗数新编》阳男阴女火星顺数、铃星逆数，阴男阳女相反。",
    },
}

_THANG_NHUAN = {
    "split-at-15": {
        "vi": " Sinh tháng nhuận: từ mùng 1 tới 15 an như tháng cùng số, từ ngày 16 an như tháng sau, theo Đẩu số tinh thành; lá số mặc định an cả tháng nhuận như tháng cùng số.",
        "en": " Born in a leap month: days 1 to 15 are placed as the month with the same number, from day 16 as the following month, after Đẩu Số Tinh Thành; the default chart places the whole leap month as the month with the same number.",
        "zh": "闰月出生：初一至十五按同数之月安，十六以后按下一月安，依《Đẩu số tinh thành》；默认命盘整个闰月按同数之月安。",
    },
    "next-month": {
        "vi": " Sinh tháng nhuận: an như tháng sau, theo Tử Vi Đẩu Số toàn thư; lá số mặc định an cả tháng nhuận như tháng cùng số.",
        "en": " Born in a leap month: placed as the following month, after the Tử Vi Đẩu Số Toàn Thư; the default chart places the whole leap month as the month with the same number.",
        "zh": "闰月出生：按下一月安，依《紫微斗数全书》；默认命盘整个闰月按同数之月安。",
    },
}

_THIEN_TRU = {
    "vi": " Thiên Trù tuổi Quý an ở Hợi theo sách Trung Hoa; Tân Biên an ở Tuất.",
    "en": " For the stem Quý, Thiên Trù sits at Hợi as in Chinese texts; Tân Biên puts it at Tuất.",
    "zh": "癸干天厨依中国典籍安于亥；《紫微斗数新编》安于戌。",
}

_THUONG_SU = {
    "vi": " Thiên Thương, Thiên Sứ đổi chỗ cho Âm Nam, Dương Nữ theo phái Trung Châu (Vương Đình Chi): Thiên Thương ở Tật Ách, Thiên Sứ ở Nô Bộc; Tân Biên và Tử Vi Đẩu Số toàn thư không đổi.",
    "en": " Thiên Thương and Thiên Sứ swap places for a yin-year man or yang-year woman, after the Zhongzhou school (Wang Tingzhi): Thiên Thương in Health, Thiên Sứ in Friends; Tân Biên and the Tử Vi Đẩu Số Toàn Thư do not swap.",
    "zh": "阴男阳女天伤、天使互换，依中州派（王亭之）：天伤在疾厄，天使在仆役；《紫微斗数新编》与《紫微斗数全书》不换。",
}


def caveat_theo_phai(o: Optional[Dict], thang_nhuan: bool, tuoi_quy: bool, am_nam_duong_nu: bool) -> Dict[str, str]:
    """Lời rào ghép theo lựa chọn (như caveatTheoPhai của bản Go), dict
    {vi, en, zh}. Câu tháng nhuận, Thiên Trù, Thiên Thương chỉ thêm khi lựa
    chọn ấy đổi được chính lá số này. ``o`` None hay rỗng: lời rào mặc định."""
    o = o or {}
    th = _TU_HOA[o.get("transformations", "")]
    hl = _HOA_LINH[o.get("fireBell", "")]
    r = {k: _DAU[k] + th[k] + hl[k] for k in ("vi", "en", "zh")}

    def them(b: Dict[str, str]) -> None:
        for k in ("vi", "en", "zh"):
            r[k] += b[k]

    tn = _THANG_NHUAN.get(o.get("leapMonth", ""))
    if tn and thang_nhuan:
        them(tn)
    if o.get("heavenlyKitchen") == "chinese" and tuoi_quy:
        them(_THIEN_TRU)
    if o.get("injuryMessenger") == "zhongzhou" and am_nam_duong_nu:
        them(_THUONG_SU)
    return r


# Lời rào của lá số mặc định (bằng caveat_theo_phai(None, ...)).
CAVEAT_TU_VI = caveat_theo_phai(None, False, False, False)

# Dòng giải thích cách lấy ngày khi sinh giờ Tý.
GHI_CHU_GIO_TY_TU_VI = {
    "vi": "Sinh giờ Tý: lá số lấy ngày âm của đúng ngày dương đã nhập, kể cả khi sinh từ 23h tới 0h. Có sách tính người sinh từ 23h là sinh ngày hôm sau; muốn theo cách ấy thì nhập ngày hôm sau. Lá số Bát Tự của site đổi ngày từ 23h, nên với người sinh từ 23h tới 0h, hai tiện ích có thể ra ngày khác nhau.",
    "en": "Born in the Tý hour: the chart takes the lunar date of exactly the Gregorian date entered, even for a birth between 23:00 and midnight. Some texts count a birth from 23:00 as the next day; to follow them, enter the next day's date. The site's Four Pillars chart turns the day at 23:00, so for a birth between 23:00 and midnight the two tools can give different days.",
    "zh": "子时出生：本命盘取所输入公历日期对应的农历日，23 时至 0 时出生亦然。有的书把 23 时起出生算作次日出生；如按此法，请输入次日日期。本站八字排盘自 23 时换日，故 23 时至 0 时出生者，两个工具得出的日子可能不同。",
}

# ── Nhãn hiển thị (văn bản, SVG) ─────────────────────────────────────────

# Nhãn ba thứ tiếng của từng lựa chọn và từng giá trị khác mặc định.
ZI_WEI_SCHOOL_LABELS = {
    "fireBell": {
        "label": {"vi": "Hỏa Tinh, Linh Tinh", "en": "Fire and Bell stars", "zh": "火星、铃星"},
        "values": {
            "quanshu": {"vi": "cả hai đếm thuận (Toàn Thư)", "en": "both forward (Quan Shu)", "zh": "二星皆顺数（《全书》）"},
            "swap-for-female": {"vi": "nữ đổi cung khởi (Việt Viêm Tử)", "en": "starts swapped for women", "zh": "女命起宫互换"},
            "swap-for-yin-male-yang-female": {"vi": "Âm Nam, Dương Nữ đổi cung khởi", "en": "starts swapped for yin men and yang women", "zh": "阴男阳女起宫互换"},
        },
    },
    "leapMonth": {
        "label": {"vi": "Tháng nhuận", "en": "Leap month", "zh": "闰月"},
        "values": {
            "split-at-15": {"vi": "chia ở ngày 15", "en": "split at day 15", "zh": "以十五日为界"},
            "next-month": {"vi": "như tháng sau", "en": "as the next month", "zh": "按下一月"},
        },
    },
    "transformations": {
        "label": {"vi": "Tứ Hóa can Canh", "en": "Four Transformations", "zh": "庚干四化"},
        "values": {
            "quanshu": {"vi": "theo Toàn Thư", "en": "Quan Shu", "zh": "依《全书》"},
            "zhongzhou": {"vi": "Trung Châu", "en": "Zhongzhou", "zh": "中州派"},
        },
    },
    "heavenlyKitchen": {
        "label": {"vi": "Thiên Trù", "en": "Celestial Kitchen", "zh": "天厨"},
        "values": {"chinese": {"vi": "theo sách Trung Hoa", "en": "Chinese texts", "zh": "依中国典籍"}},
    },
    "injuryMessenger": {
        "label": {"vi": "Thiên Thương, Thiên Sứ", "en": "Celestial Injury and Messenger", "zh": "天伤、天使"},
        "values": {"zhongzhou": {"vi": "Trung Châu", "en": "Zhongzhou", "zh": "中州派"}},
    },
}


def _gia_tri(k: str, v: str, lang: str) -> str:
    t = ZI_WEI_SCHOOL_LABELS[k]["values"].get(v)
    return t[lang] if t else v


def school_lines(schools: Optional[Dict], lang: str) -> List[str]:
    """Các lựa chọn khác mặc định thành chuỗi "nhãn: giá trị" theo ngôn ngữ."""
    if not schools:
        return []
    colon = "：" if lang == "zh" else ": "
    ra = []
    for k in ZI_WEI_SCHOOL_KEYS:
        v = schools.get(k)
        if not v:
            continue
        ra.append(ZI_WEI_SCHOOL_LABELS[k]["label"][lang] + colon + _gia_tri(k, v, lang))
    return ra


def school_short(schools: Optional[Dict], lang: str) -> str:
    """Chỉ phần giá trị của các lựa chọn khác mặc định, nối gọn (cho hình SVG)."""
    if not schools:
        return ""
    ra = [_gia_tri(k, schools[k], lang) for k in ZI_WEI_SCHOOL_KEYS if schools.get(k)]
    return ("；" if lang == "zh" else "; ").join(ra)
