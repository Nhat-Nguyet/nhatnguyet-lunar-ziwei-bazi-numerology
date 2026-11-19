"""Command line: ``nhatnguyet <command> ...``, also ``python -m nhatnguyet
<command> ...`` (same commands and output as the npm package ``@nhatnguyet/cli``).

Lệnh dòng lệnh, bản Python của ``js/packages/cli``: cùng lệnh con, cùng cách
in (lưới Tử Vi 4x4 bằng ký tự khung, màu ANSI khi là TTY và không có NO_COLOR).
"""

from __future__ import annotations

import json
import os
import re
import shutil
import sys
import unicodedata
from typing import Dict, List, Optional, Sequence, Tuple

from . import __version__
from . import en

HELP = """nhatnguyet: Zi Wei Dou Shu, BaZi, lunar calendar, numerology, Vietnamese festivals

Usage:
  nhatnguyet ziwei <YYYY-MM-DD> <HH:MM> <male|female> [--name "..."] [--year 2026] [school options]
  nhatnguyet bazi <YYYY-MM-DD> [HH:MM] <male|female> [--zi-hour ...]
  nhatnguyet lunar <YYYY-MM-DD> [--country VN|CN|KR|JP|...]
  nhatnguyet solar <lunar YYYY-MM-DD> [--leap] [--country ...]
  nhatnguyet terms <year> [--country ...]
  nhatnguyet hours <YYYY-MM-DD>     auspicious and inauspicious double hours of a day
  nhatnguyet numerology "<full name>" <YYYY-MM-DD> [--today YYYY-MM-DD]
  nhatnguyet festivals <year> [--ics]

Options:
  --lang en|vi|zh   language of the result (default en)
  --terms pinyin|han|vi  English only: stems, branches and transformations as
                    pinyin (default, "Geng Wu"), Chinese characters or Sino-Vietnamese
  --json            print JSON instead of text
  --svg <file>      also write the chart as SVG (ziwei, bazi, numerology)
  --ics             festivals: print an iCalendar (.ics) file instead
  --theme dark      dark SVG
  --no-color        no ANSI colours (also when NO_COLOR is set or output is not a terminal)

School options (where the books disagree; default first, sources in docs/schools.md):
  --fire-bell vietnamese|quanshu|swap-for-female|swap-for-yin-male-yang-female
  --leap-month whole|split-at-15|next-month
  --transformations vietnamese|quanshu|zhongzhou   (Geng year row)
  --heavenly-kitchen vietnamese|chinese            (Gui year)
  --injury-messenger standard|zhongzhou
  --zi-hour next-day-from-23|split-at-midnight     (bazi: day pillar from 23:00 to 24:00)

  -h, --help        this help
  -v, --version     version

Times are clock times; the Zi (Rat) double hour runs 23:00 to 00:59. Dates and times
are read as Vietnam time (UTC+7) unless --country says otherwise (lunar, solar,
terms, ziwei). Docs: https://nhatnguyet.org/en/ma-nguon-mo"""

# ── Bề rộng hiển thị ─────────────────────────────────────────────────────


def char_width(ch: str) -> int:
    """Terminal columns of one character: 2 for wide (CJK), 0 for combining marks."""
    if unicodedata.combining(ch) or ch in "​‌‍‎‏️":
        return 0
    return 2 if unicodedata.east_asian_width(ch) in ("W", "F") else 1


def display_width(s: str) -> int:
    return sum(char_width(c) for c in unicodedata.normalize("NFC", s))


def truncate(s: str, width: int) -> str:
    s = unicodedata.normalize("NFC", s)
    if display_width(s) <= width:
        return s
    out, w = "", 0
    for ch in s:
        cw = char_width(ch)
        if w + cw > width - 1:
            break
        out += ch
        w += cw
    return out + "…"


def wrap(s: str, width: int) -> List[str]:
    lines: List[str] = []
    line = ""
    for tok in unicodedata.normalize("NFC", s).split():
        cand = tok if line == "" else line + " " + tok
        if display_width(cand) <= width:
            line = cand
            continue
        if line:
            lines.append(line)
        line = ""
        while display_width(tok) > width:
            head = ""
            for ch in tok:
                if display_width(head + ch) > width:
                    break
                head += ch
            lines.append(head)
            tok = tok[len(head):]
        line = tok
    if line:
        lines.append(line)
    return lines


def wrap_items(items: Sequence[str], sep: str, width: int) -> List[str]:
    duoi = display_width(sep.rstrip())
    lines: List[str] = []
    line = ""
    for raw in items:
        it = truncate(raw, width - duoi)
        if line == "":
            line = it
        elif display_width(line + sep + it) + duoi <= width:
            line += sep + it
        else:
            lines.append(line + sep.rstrip())
            line = it
    if line:
        lines.append(line)
    return lines


# ── Màu ──────────────────────────────────────────────────────────────────

_ANSI = {"bold": "\x1b[1m", "dim": "\x1b[2m", "red": "\x1b[31m", "green": "\x1b[32m", "yellow": "\x1b[33m",
         "blue": "\x1b[34m", "magenta": "\x1b[35m", "cyan": "\x1b[36m", "title": "\x1b[1;33m"}

Seg = Tuple[str, str]


def paint(text: str, style: str, color: bool) -> str:
    if not color or not style or not text:
        return text
    return _ANSI[style] + text + "\x1b[0m"


def fit_line(line: Sequence[Seg], width: int, color: bool, align: str = "left") -> str:
    plain = "".join(t for t, _ in line)
    if display_width(plain) > width:
        out, used = "", 0
        for t, st in line:
            con = width - used
            if con <= 0:
                break
            w = display_width(t)
            if w < con:
                out += paint(t, st, color)
                used += w
                continue
            c = truncate(t + " " if w == con else t, con)
            out += paint(c, st, color)
            used += display_width(c)
            break
        return out + " " * max(0, width - used)
    pad = width - display_width(plain)
    left = pad // 2 if align == "center" else 0
    return " " * left + "".join(paint(t, st, color) for t, st in line) + " " * (pad - left)


# ── Chữ giao diện ────────────────────────────────────────────────────────

UI: Dict[str, Dict[str, str]] = {
    "vi": {
        "zwTitle": "LÁ SỐ TỬ VI", "body": "Thân", "life": "Mệnh", "tuan": "Tuần", "triet": "Triệt", "born": "Sinh",
        "lunar": "Âm lịch", "leap": "nhuận", "year": "Năm", "bureau": "Cục", "naYin": "Bản mệnh", "view": "Năm xem",
        "age": "tuổi", "decades": "Đại vận", "patterns": "Cách cục",
        "legend": "Sáng tối: M miếu, V vượng, Đ đắc, B bình, H hãm. Tuổi tính theo tuổi mụ.",
        "yearPalace": "Lưu niên", "minorLimit": "Tiểu vận", "decade": "Đại vận",
        "bzTitle": "LÁ SỐ BÁT TỰ", "pYear": "Năm", "pMonth": "Tháng", "pDay": "Ngày", "pHour": "Giờ",
        "tenGod": "Thập thần", "stem": "Can", "branch": "Chi", "hidden": "Tàng can", "stage": "Trường sinh",
        "stars": "Thần sát", "dayMaster": "Nhật chủ", "luck": "Đại vận", "forward": "thuận", "backward": "nghịch",
        "startAt": "khởi vận lúc", "years": "năm", "months": "tháng", "term": "Tiết khí", "gregorian": "Dương lịch",
        "month": "Tháng", "day": "Ngày", "solarTerm": "Tiết khí", "country": "Lịch", "nmTitle": "THẦN SỐ HỌC",
        "until": "tới", "fest": "LỄ HỘI", "terms": "TIẾT KHÍ", "unknown": "chưa biết giờ", "male": "Nam",
        "female": "Nữ", "hrsTitle": "GIỜ HOÀNG ĐẠO", "good": "hoàng đạo", "bad": "hắc đạo",
    },
    "en": {
        "zwTitle": "ZI WEI DOU SHU CHART", "body": "Body", "life": "Life", "tuan": "Tuần", "triet": "Triệt",
        "born": "Born", "lunar": "Lunar", "leap": "leap", "year": "Year", "bureau": "Bureau", "naYin": "Na yin",
        "view": "Year", "age": "age", "decades": "Ten-year periods", "patterns": "Patterns",
        "legend": "Brightness: Ex exalted, Pr prosperous, Fa favorable, Ne neutral, We weak. Ages are East Asian ages (1 at birth).",
        "yearPalace": "Year palace", "minorLimit": "Minor limit", "decade": "Decade",
        "bzTitle": "BAZI (FOUR PILLARS)", "pYear": "Year", "pMonth": "Month", "pDay": "Day", "pHour": "Hour",
        "tenGod": "Ten God", "stem": "Stem", "branch": "Branch", "hidden": "Hidden stems", "stage": "Stage",
        "stars": "Stars", "dayMaster": "Day Master", "luck": "Luck pillars", "forward": "forward",
        "backward": "backward", "startAt": "starting at", "years": "y", "months": "m", "term": "Solar term",
        "gregorian": "Gregorian", "month": "Month", "day": "Day", "solarTerm": "Solar term", "country": "Calendar",
        "nmTitle": "NUMEROLOGY", "until": "to age", "fest": "FESTIVALS", "terms": "SOLAR TERMS",
        "unknown": "time unknown", "male": "male", "female": "female",
        "hrsTitle": "AUSPICIOUS HOURS", "good": "auspicious", "bad": "inauspicious",
    },
    "zh": {
        "zwTitle": "紫微斗数命盘", "body": "身", "life": "命", "tuan": "旬空", "triet": "截空", "born": "出生",
        "lunar": "农历", "leap": "闰", "year": "年", "bureau": "五行局", "naYin": "纳音", "view": "流年",
        "age": "虚岁", "decades": "大限", "patterns": "格局", "legend": "亮度：庙、旺、得地、平、陷。年龄按虚岁计。",
        "yearPalace": "流年命宫", "minorLimit": "小限", "decade": "大限",
        "bzTitle": "八字命盘", "pYear": "年柱", "pMonth": "月柱", "pDay": "日柱", "pHour": "时柱", "tenGod": "十神",
        "stem": "天干", "branch": "地支", "hidden": "藏干", "stage": "十二长生", "stars": "神煞", "dayMaster": "日主",
        "luck": "大运", "forward": "顺排", "backward": "逆排", "startAt": "起运", "years": "岁", "months": "个月",
        "term": "节气", "gregorian": "公历", "month": "月", "day": "日", "solarTerm": "节气", "country": "历法",
        "nmTitle": "生命灵数", "until": "至", "fest": "节日", "terms": "二十四节气", "unknown": "时辰未知",
        "male": "男", "female": "女", "hrsTitle": "黄道吉时", "good": "黄道", "bad": "黑道",
    },
}


def _brightness(b: str, lang: str) -> str:
    return b if lang == "zh" else b[:1] if lang == "vi" else b[:2]


def _hoa(t: str, lang: str) -> str:
    return t.replace("化", "", 1) if lang == "zh" or t.startswith("化") else re.sub(r"^(?:Hóa|Hua)\s+", "", t)


def _chu_khong(chart: Dict, u: Dict[str, str]) -> Tuple[str, str]:
    """Tuần, Triệt theo cách viết của lá số (bản Anh: pinyin, chữ Hán hay Hán Việt)."""
    if chart["lang"] != "en" or chart.get("terms") == "vi":
        return u["tuan"], u["triet"]
    return ("旬空", "截空") if chart.get("terms") == "han" else ("Xun Kong", "Jie Kong")


# ── Lưới Tử Vi ───────────────────────────────────────────────────────────

_GRID = [(3, 2), (3, 1), (3, 0), (2, 0), (1, 0), (0, 0), (0, 1), (0, 2), (0, 3), (1, 3), (2, 3), (3, 3)]


def _palace_lines(p: Dict, lang: str, w: int, khong: Tuple[str, str]) -> List[List[Seg]]:
    u = UI[lang]
    lines: List[List[Seg]] = []
    head: List[Seg] = [(p["name"], "title" if p["isLife"] else "bold")]
    if p["isBody"]:
        head.append((" · " + u["body"], "yellow"))
    lines.append(head)
    h2: List[Seg] = [(p["stemBranch"], "dim")]
    if p["tuan"]:
        h2.append((" " + khong[0], "blue"))
    if p["triet"]:
        h2.append((" " + khong[1], "blue"))
    lines.append(h2)
    for s in p["stars"]:
        if s["kind"] != "major":
            continue
        tail: List[Seg] = []
        if s.get("brightness"):
            tail.append((" " + _brightness(s["brightness"], lang), "dim"))
        if s.get("transformation"):
            tail.append((" " + _hoa(s["transformation"], lang), "green"))
        if display_width(s["name"]) + sum(display_width(t) for t, _ in tail) <= w:
            lines.append([(s["name"], "red")] + tail)
        else:
            lines.append([(s["name"], "red")])
            if tail:
                lines.append([(" ", "")] + tail)
    minor = [s["name"] + (" " + _hoa(s["transformation"], lang) if s.get("transformation") else "")
             for s in p["stars"] if s["kind"] == "minor"]
    for x in wrap_items(minor, "、" if lang == "zh" else ", ", w):
        lines.append([(x, "cyan")])
    for s in p["stars"]:
        if s["kind"] == "growth":
            lines.append([(s["name"], "dim")])
            break
    return lines


def render_zi_wei_grid(chart: Dict, color: bool = False, width: int = 88) -> str:
    lang = chart["lang"]
    u = UI[lang]
    W = max(16, min(30, (width - 5) // 4))
    C = 2 * W + 1
    o: List[List[List[List[Seg]]]] = [[[] for _ in range(4)] for _ in range(4)]
    for p in chart["palaces"]:
        r, c = _GRID[p["index"]]
        o[r][c] = _palace_lines(p, lang, W - 2, _chu_khong(chart, u))
    h = [max(len(o[r][c]) for c in range(4)) for r in range(4)]
    l = chart["lunar"]
    born = re.sub(r"\s+", " ", "%s %s %s (%s)" % (u["born"], chart["solarDate"], chart["time"] or "", chart["hour"]["name"]))
    center: List[List[Seg]] = [x for x in [
        [(u["zwTitle"], "title")],
        [(chart["name"] or "", "bold")],
        [(born, "")],
        [("%s %d-%02d%s-%02d · %s" % (u["lunar"], l["year"], l["month"], " " + u["leap"] if l["leap"] else "", l["day"],
                                      chart["yearPillar"]), "")],
        [(chart["yinYang"], "yellow")],
        [("%s: %s" % (u["bureau"], chart["bureau"]["name"]), "")],
        [("%s: %s" % (u["naYin"], chart["naYin"]), "")],
        [("%s: %s · %s: %s" % (u["life"], chart["palaces"][chart["lifePalace"]]["branch"], u["body"],
                               chart["palaces"][chart["bodyPalace"]]["branch"]), "dim")],
    ] if x[0][0] != ""]
    if len(center) > h[1] + 1 + h[2]:
        h[2] += len(center) - (h[1] + 1 + h[2])
    off = (h[1] + 1 + h[2] - len(center)) // 2

    def mid(i: int) -> str:
        j = i - off
        return fit_line(center[j] if 0 <= j < len(center) else [("", "")], C, color, "center")

    def k(s: str) -> str:
        return paint(s, "dim", color)

    def border(a: str, joins: str, z: str) -> str:
        return k(a + joins[0].join(["─" * W] * 2) + joins[1] + joins[2].join(["─" * W] * 2) + z)

    def cell(r: int, c: int, i: int) -> str:
        return " " + fit_line(o[r][c][i] if i < len(o[r][c]) else [], W - 1, color)

    out = [border("┌", "┬┬┬", "┐")]
    for i in range(h[0]):
        out.append(k("│") + k("│").join(cell(0, c, i) for c in range(4)) + k("│"))
    out.append(border("├", "┼┴┼", "┤"))
    for i in range(h[1]):
        out.append(k("│") + cell(1, 0, i) + k("│") + mid(i) + k("│") + cell(1, 3, i) + k("│"))
    out.append(k("├" + "─" * W + "┤") + mid(h[1]) + k("├" + "─" * W + "┤"))
    for i in range(h[2]):
        out.append(k("│") + cell(2, 0, i) + k("│") + mid(h[1] + 1 + i) + k("│") + cell(2, 3, i) + k("│"))
    out.append(border("├", "┼┬┼", "┤"))
    for i in range(h[3]):
        out.append(k("│") + k("│").join(cell(3, c, i) for c in range(4)) + k("│"))
    out.append(border("└", "┴┴┴", "┘"))
    return "\n".join(out)


def render_zi_wei(chart: Dict, decades: Optional[List[Dict]] = None, year: Optional[Dict] = None,
                  patterns: Optional[List[Dict]] = None, color: bool = False, width: int = 88) -> str:
    lang = chart["lang"]
    u = UI[lang]
    out = [render_zi_wei_grid(chart, color, width)] + [paint(x, "dim", color) for x in wrap(u["legend"], width)]
    if year:
        out += ["", paint("%s %d (%s)" % (u["view"], year["year"], year["yearPillar"]), "bold", color)]
        items = ["%s %d" % (u["age"], year["age"]), "%s: %s" % (u["yearPalace"], year["yearPalace"]["palace"]),
                 "%s: %s" % (u["minorLimit"], year["minorLimit"]["palace"])]
        if year["decade"]:
            d = year["decade"]
            items.append("%s: %s (%d-%d)" % (u["decade"], d["palace"], d["fromAge"], d["toAge"]))
        items += ["%s: %s%s" % (t["type"], t["star"], " → " + t["palace"] if t["palace"] else "")
                  for t in year["transformations"]]
        out += ["  " + x for x in wrap_items(items, " · ", width - 2)]
    if decades:
        out += ["", paint(u["decades"], "bold", color)]
        for d in decades:
            out.append(truncate("  %3d-%-3d %d-%d  %s (%s)  %s" % (d["fromAge"], d["toAge"], d["fromYear"], d["toYear"],
                                                                 d["palace"], d["branch"], ", ".join(d["majorStars"]) or "-"), width))
    if patterns:
        out += ["", paint(u["patterns"], "bold", color)]
        for p in patterns:
            han = " " + p["nameHan"] if p.get("nameHan") and lang != "zh" else ""
            out.append(truncate("  %s%s%s" % (p["name"], han, " · " + p["palace"] if p["palace"] else ""), width))
    if chart["notes"]:
        out.append("")
        for n in chart["notes"]:
            out += [paint(x, "dim", color) for x in wrap(n, width)]
    return "\n".join(out)


# ── Bảng ─────────────────────────────────────────────────────────────────

def table(header: Optional[List[str]], rows: List[List[List[str]]], color: bool,
          widths: Optional[List[int]] = None) -> str:
    n = len(header) if header else len(rows[0]) if rows else 0
    if widths is None:
        widths = [max([display_width(header[c]) if header else 0]
                      + [display_width(x) for r in rows for x in r[c]]) for c in range(n)]

    def k(s: str) -> str:
        return paint(s, "dim", color)

    def border(a: str, m: str, z: str) -> str:
        return k(a + m.join("─" * (x + 2) for x in widths) + z)

    out = [border("┌", "┬", "┐")]
    if header:
        out.append(k("│") + k("│").join(" " + fit_line([(header[c], "bold")], widths[c], color) + " " for c in range(n)) + k("│"))
        out.append(border("├", "┼", "┤"))
    for r in rows:
        hgt = max(1, max(len(x) for x in r))
        for i in range(hgt):
            out.append(k("│") + k("│").join(
                " " + fit_line([(r[c][i] if i < len(r[c]) else "", "dim" if c == 0 else "")], widths[c], color) + " "
                for c in range(n)) + k("│"))
    out.append(border("└", "┴", "┘"))
    return "\n".join(out)


def render_bazi(chart: Dict, color: bool = False, width: int = 88) -> str:
    lang = chart["lang"]
    u = UI[lang]
    tru = [chart["pillars"][k] for k in ("year", "month", "day", "hour")]

    def col(f):
        return [f(p) if p else ["-"] for p in tru]

    rows_def = [
        (u["tenGod"], col(lambda p: [p["tenGod"]])),
        (u["stem"], col(lambda p: ["%s %s" % (p["stem"], p["stemElement"])])),
        (u["branch"], col(lambda p: ["%s %s" % (p["branch"], p["branchElement"])])),
        (u["hidden"], col(lambda p: ["%s %s" % (x["stem"], x["tenGod"]) for x in p["hiddenStems"]])),
        (u["naYin"], col(lambda p: [p["naYin"]])),
        (u["stage"], col(lambda p: [p["stage"]])),
        (u["stars"], col(lambda p: p["stars"] or ["-"])),
    ]
    nhan = max(display_width(x[0]) for x in rows_def)
    cw = max(12, min(24, (width - nhan - 3 - 4 * 3 - 1) // 4))
    rows = [[[nh]] + [[w for x in cell for w in wrap(x, cw)] for cell in cells] for nh, cells in rows_def]
    head = ["", "%s %s" % (u["pYear"], tru[0]["label"]), "%s %s" % (u["pMonth"], tru[1]["label"]),
            "%s %s" % (u["pDay"], tru[2]["label"]), "%s %s" % (u["pHour"], tru[3]["label"] if tru[3] else u["unknown"])]
    out = [paint(u["bzTitle"], "title", color) + "  %s %s · %s" % (chart["solarDate"], chart["time"] or u["unknown"], u[chart["gender"]])]
    dm = chart["dayMaster"]
    out.append("%s: %s · %s: %s" % (u["dayMaster"], paint("%s (%s %s)" % (dm["stem"], dm["yinYang"], dm["element"]), "yellow", color),
                                    u["term"], chart["solarTerm"]))
    out.append(table(head, rows, color, [nhan, cw, cw, cw, cw]))
    lk = chart["luck"]
    out += ["", paint(u["luck"], "bold", color) + " (%s, %s %d%s %d%s, %s)" % (
        u["forward"] if lk["direction"] == "forward" else u["backward"], u["startAt"], lk["startAge"]["years"], u["years"],
        lk["startAge"]["months"], u["months"], lk["startDate"])]
    for v in lk["pillars"]:
        out.append(truncate("  %3d  %d-%d  %s  %s · %s" % (v["fromAge"], v["fromYear"], v["toYear"], v["label"], v["tenGod"], v["stage"]), width))
    out.append("")
    for n in [lk["explanation"]] + chart["notes"]:
        out += [paint(x, "dim", color) for x in wrap(n, width)]
    return "\n".join(out)


def render_lunar(r: Dict, color: bool = False) -> str:
    u = UI[r["lang"]]
    mon = "%02d (%s)" % (r["month"], u["leap"]) if r["leap"] else "%02d" % r["month"]
    tz = r["timeZone"]
    rows = [[[u["gregorian"]], [r["solarDate"]]], [[u["lunar"]], ["%d-%s-%02d" % (r["year"], mon, r["day"])]],
            [[u["year"]], ["%s · %s" % (r["yearName"], r["zodiac"])]], [[u["month"]], [r["monthName"]]],
            [[u["day"]], [r["dayName"]]], [[u["solarTerm"]], [r["solarTerm"]]],
            [[u["country"]], ["%s (UTC%s%s)" % (r["country"], "+" if tz >= 0 else "", tz)]]]
    return table(None, rows, color)


def render_solar_terms(year: int, terms: List[Dict], lang: str, color: bool = False, name_terms: str = "pinyin") -> str:
    """Bảng 24 tiết khí. Tên theo `lang`; chỉ ở tiếng Anh, name_terms "han" hay
    "vi" thêm tên chữ Hán hay tên Việt trong ngoặc, "pinyin" không thêm gì."""
    def kem(t: Dict) -> str:
        if lang != "en" or name_terms == "pinyin":
            return ""
        return " (%s)" % (t["nameVi"] if name_terms == "vi" else en.term(t["nameVi"], "zh"))
    rows = [[[t["date"]], [t["time"]], [t["name"] + kem(t)], ["%d°" % t["longitude"]]]
            for t in terms]
    return paint("%s %d" % (UI[lang]["terms"], year), "title", color) + "\n" + table(None, rows, color)


def render_hours(r: Dict, color: bool = False) -> str:
    u = UI[r["lang"]]
    rows = [[["%s (%s)" % (h["branch"], h["animal"])], [h["range"]], [u["good"] if h["auspicious"] else u["bad"]],
             [h["spirit"]]] for h in r["hours"]]
    return paint(u["hrsTitle"], "title", color) + "  %s · %s %s" % (r["date"], u["day"], r["day"]) + "\n" + table(None, rows, color)


def render_numerology(r: Dict, color: bool = False) -> str:
    L = r["labels"]
    u = UI[r["lang"]]
    keys = ["lifePath", "expression", "soulUrge", "personality", "attitude", "birthday", "maturity",
            "personalYear", "personalMonth", "personalDay"]
    nhan = max(display_width(L[k]) for k in keys)
    out = [paint(u["nmTitle"], "title", color) + "  %s · %s" % (r["name"], r["birthDate"])]
    for k in keys:
        v = r[k]
        so = paint(str(v), "magenta" if v in (11, 22, 33) else "bold", color)
        out.append("  %s%s  %s" % (L[k], " " * (nhan - display_width(L[k])), so))
    if r["karmicDebt"]:
        out.append("  %s%s  %s" % (L["karmicDebt"], " " * max(1, nhan - display_width(L["karmicDebt"])), r["karmicDebt"]))
    out.append("  %s: %s" % (L["pinnacles"], ", ".join(
        "%d%s" % (p["number"], " (%s %d)" % (u["until"], p["toAge"]) if p["toAge"] else "") for p in r["pinnacles"])))
    out.append("  %s: %s" % (L["challenges"], ", ".join(str(x) for x in r["challenges"])))

    def o(d: int) -> str:
        n = r["grid"][str(d)]
        return str(d) * n if n else "-"

    out += ["", "  " + L["grid"]]
    out += ["  " + x for x in table(None, [[[o(3)], [o(6)], [o(9)]], [[o(2)], [o(5)], [o(8)]], [[o(1)], [o(4)], [o(7)]]],
                                     color, [5, 5, 5]).split("\n")]
    return "\n".join(out)


def render_festivals(year: int, items: List[Dict], lang: str, color: bool = False, width: int = 88) -> str:
    u = UI[lang]
    ten = max(20, width - 12 - 14 - 8)
    rows = [[[f["date"]], [("%s %s" % (f["fixedDate"], ("lunar" if lang == "en" else u["lunar"]) if f["calendar"] == "lunar" else "")).strip()],
             [truncate(f["name"], ten)]] for f in items]
    return paint("%s %d (%d)" % (u["fest"], year, len(items)), "title", color) + "\n" + table(None, rows, color)


# ── Chạy lệnh ────────────────────────────────────────────────────────────

# Mọi tên công cụ MCP cũng là bí danh của lệnh tương ứng (cast_ziwei, solar_terms...).
ALIAS = {"ziwei": "ziwei", "zi-wei": "ziwei", "zi_wei": "ziwei", "cast_ziwei": "ziwei", "cast_zi_wei": "ziwei",
         "tuvi": "ziwei", "tu-vi": "ziwei", "bazi": "bazi", "ba-zi": "bazi", "cast_bazi": "bazi",
         "battu": "bazi", "bat-tu": "bazi", "lunar": "lunar", "lunar_convert": "lunar", "amlich": "lunar",
         "am-lich": "lunar", "solar": "solar", "duong": "solar", "terms": "terms", "solar-terms": "terms",
         "solar_terms": "terms", "tietkhi": "terms", "hours": "hours", "auspicious_hours": "hours",
         "auspicious-hours": "hours", "gio-hoang-dao": "hours", "numerology": "numerology",
         "than-so-hoc": "numerology", "festivals": "festivals", "le-hoi": "festivals", "lehoi": "festivals"}
# Cờ lựa chọn phái: tên cờ (kebab-case) và khoá của schools.
_SCHOOL_FLAGS = ("fire-bell", "leap-month", "transformations", "heavenly-kitchen", "injury-messenger", "zi-hour")
_CO_GIA_TRI = {"lang", "country", "name", "year", "today", "tz", "svg", "theme", "terms", *_SCHOOL_FLAGS}


def _schools_from(flags: Dict[str, object], keys: Sequence[str]) -> Optional[Dict[str, str]]:
    """Lựa chọn phái từ các cờ (chỉ những cờ có mặt); None khi không có cờ nào."""
    r: Dict[str, str] = {}
    for f in keys:
        v = flags.get(f)
        if v is None:
            continue
        if not isinstance(v, str):
            raise ValueError("--%s needs a value" % f)
        r[re.sub(r"-(\w)", lambda m: m.group(1).upper(), f)] = v
    return r or None
_GIOI = re.compile(r"^(male|female|m|f|nam|nữ|nu)$", re.I)


def parse_args(argv: Sequence[str]) -> Tuple[str, List[str], Dict[str, object]]:
    pos: List[str] = []
    flags: Dict[str, object] = {}
    i = 0
    while i < len(argv):
        a = argv[i]
        if a == "-h":
            flags["help"] = True
        elif a == "-v":
            flags["version"] = True
        elif a.startswith("--"):
            k, eq, v = a[2:].partition("=")
            if eq:
                flags[k] = v
            elif k in _CO_GIA_TRI:
                if i + 1 >= len(argv):
                    raise ValueError("--%s needs a value" % k)
                i += 1
                flags[k] = argv[i]
            else:
                flags[k] = True
        else:
            pos.append(a)
        i += 1
    cmd = pos.pop(0) if pos else ""
    return ALIAS.get(cmd.lower(), cmd), pos, flags


def _dump(x: object) -> str:
    def bo(v):
        if isinstance(v, dict):
            return {k: bo(w) for k, w in v.items() if k != "raw"}
        if isinstance(v, list):
            return [bo(w) for w in v]
        return v
    return json.dumps(bo(x), ensure_ascii=False, indent=2)


def _ghi_tep(path: str, data: str) -> None:
    with open(path, "w", encoding="utf-8", newline="") as f:
        f.write(data)


def run(argv: Sequence[str], color: bool = False, width: int = 88, write_file=None) -> str:
    """Run one command and return the text to print. ``--svg`` writes through
    ``write_file(path, data)`` (default: a UTF-8 file)."""
    cmd, p, flags = parse_args(argv)
    if flags.get("version"):
        return __version__
    if flags.get("help") or cmd in ("", "help"):
        return HELP
    lang = flags["lang"] if isinstance(flags.get("lang"), str) else "en"
    terms = en.check_terms(flags["terms"] if isinstance(flags.get("terms"), str) else None,
                           lang if lang in ("vi", "zh") else "en")
    js = flags.get("json") is True
    color = color and flags.get("no-color") is not True
    country = flags["country"] if isinstance(flags.get("country"), str) else None

    theme = "dark" if flags.get("theme") == "dark" else "light"

    def ghi_svg(ve) -> None:
        if isinstance(flags.get("svg"), str):
            (write_file or _ghi_tep)(flags["svg"], ve() + "\n")

    def can(n: int, usage: str) -> None:
        if len(p) < n:
            raise ValueError("usage: nhatnguyet " + usage)

    if cmd == "ziwei":
        can(3, "ziwei <YYYY-MM-DD> <HH:MM> <male|female>")
        year = int(flags["year"]) if isinstance(flags.get("year"), str) else None
        name = flags["name"] if isinstance(flags.get("name"), str) else ""
        chart = en.cast_zi_wei(p[0], p[2], time=p[1], name=name, lang=lang, view_year=year, terms=terms,
                               schools=_schools_from(flags, _SCHOOL_FLAGS[:5]), country=country)
        extra = {"decades": en.decade_luck(chart), "year": en.yearly_luck(chart), "patterns": en.find_patterns(chart)}
        ghi_svg(lambda: en.zi_wei_svg(chart, theme=theme))
        if js:
            return _dump(dict(chart=chart, **extra))
        return render_zi_wei(chart, color=color, width=width, **extra)
    if cmd == "bazi":
        can(2, "bazi <YYYY-MM-DD> [HH:MM] <male|female>")
        co_gio = len(p) >= 3 or not _GIOI.match(p[1])
        if co_gio:
            can(3, "bazi <YYYY-MM-DD> [HH:MM] <male|female>")
        chart = en.cast_bazi(p[0], p[2] if co_gio else p[1], time=p[1] if co_gio else None, lang=lang, terms=terms,
                             schools=_schools_from(flags, ["zi-hour"]))
        ghi_svg(lambda: en.bazi_svg(chart, theme=theme, name=flags["name"] if isinstance(flags.get("name"), str) else ""))
        return _dump(chart) if js else render_bazi(chart, color, width)
    if cmd == "lunar":
        can(1, "lunar <YYYY-MM-DD> [--country CN]")
        r = en.to_lunar(p[0], country=country, lang=lang, terms=terms)
        return _dump(r) if js else render_lunar(r, color)
    if cmd == "solar":
        can(1, "solar <lunar YYYY-MM-DD> [--leap]")
        k = re.match(r"^(-?\d+)-(\d+)-(\d+)$", p[0])
        if not k:
            raise ValueError("lunar date must look like YYYY-MM-DD")
        r = en.to_solar(int(k.group(1)), int(k.group(2)), int(k.group(3)), leap=flags.get("leap") is True, country=country)
        # Bảng như lệnh lunar, dựng từ ngày dương vừa đổi được.
        return _dump(r) if js else render_lunar(en.to_lunar(r["date"], country=country, lang=lang, terms=terms), color)
    if cmd == "terms":
        can(1, "terms <year>")
        t = en.solar_terms(int(p[0]), country=country, lang=lang)
        return _dump(t) if js else render_solar_terms(int(p[0]), t, lang, color, terms)
    if cmd == "hours":
        can(1, "hours <YYYY-MM-DD>")
        r = en.auspicious_hours(p[0], lang=lang, terms=terms)
        return _dump(r) if js else render_hours(r, color)
    if cmd == "numerology":
        can(2, 'numerology "<full name>" <YYYY-MM-DD>')
        today = flags["today"] if isinstance(flags.get("today"), str) else None
        r = en.numerology(p[0], p[1], today=today, lang=lang)
        ghi_svg(lambda: en.numerology_svg(r, theme=theme))
        return _dump(r) if js else render_numerology(r, color)
    if cmd == "festivals":
        can(1, "festivals <year>")
        if flags.get("ics") is True:
            # Tệp kết thúc bằng CRLF; main() thêm "\n" nên bỏ "\n" cuối ở đây.
            return en.festivals_ics(int(p[0]), lang=lang)[:-1]
        items = en.festivals(int(p[0]), lang=lang)
        return _dump(items) if js else render_festivals(int(p[0]), items, lang, color, width)
    raise ValueError('unknown command "%s". Try: nhatnguyet --help' % cmd)


def main(argv: Optional[Sequence[str]] = None) -> int:
    out = sys.stdout
    env = os.environ
    ep = env.get("FORCE_COLOR") not in (None, "0")
    color = env.get("NO_COLOR") is None and (ep or (out.isatty() and env.get("TERM") != "dumb"))
    width = min(shutil.get_terminal_size((88, 24)).columns, 140) if out.isatty() else 88
    try:
        text = run(sys.argv[1:] if argv is None else argv, color=color, width=width)
    except (ValueError, TypeError) as e:
        sys.stderr.write("nhatnguyet: %s\n" % e)
        return 1
    try:
        try:
            out.write(text + "\n")
        except UnicodeEncodeError:
            out.buffer.write((text + "\n").encode("utf-8"))
        out.flush()
    except BrokenPipeError:
        # Người đọc đóng ống sớm (``nhatnguyet festivals 2027 --ics | head``):
        # thoát êm với mã 0 như lệnh Unix thường. Trỏ stdout vào devnull để lần
        # flush lúc tắt trình thông dịch không ném lỗi lần nữa.
        try:
            devnull = os.open(os.devnull, os.O_WRONLY)
            os.dup2(devnull, out.fileno())
        except (OSError, ValueError, AttributeError):
            pass
        return 0
    return 0


if __name__ == "__main__":
    sys.exit(main())
