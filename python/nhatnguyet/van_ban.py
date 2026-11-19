"""In lá số Tử Vi, Bát Tự, hồ sơ thần số học thành văn bản markdown gọn cho
mô hình ngôn ngữ đọc: chỉ dữ kiện tính được (không lời luận), ba thứ tiếng,
dòng cuối ghi nguồn. Ra ĐÚNG TỪNG BYTE như ``chartToText`` của ba gói
TypeScript (``tu-vi/src/van-ban.ts``, ``bat-tu/src/van-ban.ts``,
``than-so-hoc/src/van-ban.ts``); test TypeScript gọi bản này để so.

Chart as compact markdown text for language models::

    from nhatnguyet import cast_zi_wei, chart_to_text
    print(chart_to_text(cast_zi_wei(date="1990-09-19", time="20:00", gender="male")))

``chart_to_text`` nhận lá số của ``cast_zi_wei``, ``cast_bazi``, ``numerology``
hoặc kết quả thô (``lap_la_so_tu_vi``, ``lap_la_so_bat_tu``,
``tinh_ho_so_than_so_hoc_sau``) và tự nhận ra loại.
"""

import re
from typing import Any, Dict, List, Optional

from . import en

__all__ = ["chart_to_text", "zi_wei_to_text", "bazi_to_text", "numerology_to_text", "SOURCE_LINE"]

SOURCE_LINE = {
    "vi": "Dữ liệu: Nhật Nguyệt (nhatnguyet.org)",
    "en": "Data: Nhat Nguyet (nhatnguyet.org)",
    "zh": "数据：Nhat Nguyet (nhatnguyet.org)",
}


def _dien(mau: str, vao: Dict[str, Any]) -> str:
    return re.sub(r"\{(\w+)\}", lambda m: _so(vao[m.group(1)]), mau)


def _so(x: Any) -> str:
    """In như String(x) của JavaScript: số thực tròn in không có ".0"."""
    if isinstance(x, bool):
        return "true" if x else "false"
    if isinstance(x, float) and x.is_integer():
        return str(int(x))
    return str(x)


def _detail(detail: Optional[str]) -> bool:
    if detail is None or detail == "full":
        return True
    if detail == "summary":
        return False
    raise TypeError('detail must be "summary" or "full", got %r' % (detail,))


# ── Tử Vi ────────────────────────────────────────────────────────────────

_TV = {
    "vi": {
        "title": "Lá số Tử Vi", "intro": "Chỉ gồm dữ kiện tính được, không có lời luận.", "colon": ": ", "stop": ". ",
        "name": "Họ tên", "gender": "Giới tính", "male": "Nam", "female": "Nữ",
        "solar": "Ngày sinh dương lịch", "hour": "Giờ sinh", "lunar": "Ngày sinh âm lịch", "leap": "tháng nhuận",
        "year": "Năm can chi", "yinYang": "Âm dương", "bureau": "Cục", "naYin": "Bản mệnh (nạp âm)",
        "life": "Cung Mệnh", "body": "Cung Thân", "calendar": "Lịch", "calendarValue": "âm lịch Việt Nam, UTC+7",
        "palaces": "Mười hai cung", "major": "Chính tinh", "minor": "Phụ tinh", "growth": "Vòng Tràng Sinh",
        "yearRing": "Vòng Thái Tuế", "scholar": "Vòng Bác Sỹ", "transformations": "Tứ Hóa", "none": "không có",
        "opposite": "Cung đối", "tuan": "Tuần", "triet": "Triệt",
        "decades": "Đại vận", "agesNote": "Tuổi tính theo tuổi mụ (sinh ra là 1 tuổi).", "noMajor": "không có chính tinh",
        "patterns": "Cách cục", "noPatterns": "không nhận ra cách nào", "notes": "Ghi chú",
        "yearHead": "Năm {year} ({pillar}), {age} tuổi mụ", "yearPalace": "Cung lưu niên", "minorLimit": "Tiểu vận",
        "decade": "Đại vận", "outside": "ngoài mười hai đại vận", "notOnChart": "không có trên lá số",
    },
    "en": {
        "title": "Zi Wei Dou Shu chart", "intro": "Computed data only, no interpretation.", "colon": ": ", "stop": ". ",
        "name": "Name", "gender": "Gender", "male": "male", "female": "female",
        "solar": "Birth date (Gregorian)", "hour": "Birth hour", "lunar": "Birth date (lunar)", "leap": "leap month",
        "year": "Year pillar", "yinYang": "Yin-yang", "bureau": "Bureau", "naYin": "Na yin of the year",
        "life": "Life palace", "body": "Body palace", "calendar": "Calendar", "calendarValue": "Vietnamese lunar calendar, UTC+7",
        "palaces": "Palaces", "major": "Major stars", "minor": "Minor stars", "growth": "Twelve stages",
        "yearRing": "Year ring (Thái Tuế)", "scholar": "Scholar ring (Bác Sỹ)", "transformations": "Transformations",
        "none": "none", "opposite": "Opposite palace", "tuan": "Tuần void", "triet": "Triệt void",
        "decades": "Ten-year periods", "agesNote": "Ages are East Asian ages (1 at birth).", "noMajor": "no major star",
        "patterns": "Named patterns", "noPatterns": "none found", "notes": "Notes",
        "yearHead": "Year {year} ({pillar}), East Asian age {age}", "yearPalace": "Year palace", "minorLimit": "Minor limit",
        "decade": "Ten-year period", "outside": "outside the twelve periods", "notOnChart": "not on the chart",
    },
    "zh": {
        "title": "紫微斗数命盘", "intro": "仅列可计算的数据，不含论断。", "colon": "：", "stop": "。",
        "name": "姓名", "gender": "性别", "male": "男", "female": "女",
        "solar": "公历生日", "hour": "出生时辰", "lunar": "农历生日", "leap": "闰月",
        "year": "年干支", "yinYang": "阴阳", "bureau": "五行局", "naYin": "年纳音",
        "life": "命宫", "body": "身宫", "calendar": "历法", "calendarValue": "越南农历，UTC+7",
        "palaces": "十二宫", "major": "主星", "minor": "辅星", "growth": "长生十二神",
        "yearRing": "岁前十二神", "scholar": "博士十二神", "transformations": "四化", "none": "无",
        "opposite": "对宫", "tuan": "旬空", "triet": "截空",
        "decades": "大限", "agesNote": "年龄按虚岁计（出生即一岁）。", "noMajor": "无主星",
        "patterns": "格局", "noPatterns": "未识别出格局", "notes": "说明",
        "yearHead": "{year}年（{pillar}），虚岁{age}", "yearPalace": "流年命宫", "minorLimit": "小限",
        "decade": "大限", "outside": "不在十二大限内", "notOnChart": "不在命盘上",
    },
}


def _sao(s: Dict) -> str:
    them = [x for x in (s.get("brightness"), s.get("transformation")) if x]
    return "%s (%s)" % (s["name"], ", ".join(them)) if them else s["name"]


def _ds_sao(ds: List[Dict]) -> str:
    return ", ".join(_sao(s) for s in ds)


def zi_wei_to_text(chart: Dict, lang: Optional[str] = None, detail: Optional[str] = None,
                   year: Optional[int] = None) -> str:
    """Print a Zi Wei Dou Shu chart (from ``cast_zi_wei`` or ``lap_la_so_tu_vi``)
    as compact markdown for a language model. ``detail`` is ``"full"``
    (default) or ``"summary"``; ``year`` adds the facts of a viewing year."""
    day = _detail(detail)
    if "raw" in chart and "palaces" in chart:
        c = en._localize_zi_wei(chart["raw"], en._lang(lang or chart["lang"]), chart["time"], chart["viewYear"])
    elif "cung" in chart:
        c = en._localize_zi_wei(chart, en._lang(lang or "en"), None, 0)
    else:
        raise TypeError("chart_to_text expects a chart from cast_zi_wei or lap_la_so_tu_vi")
    t = _TV[c["lang"]]
    d: List[str] = []

    def dong(nhan: str, gia_tri: Any) -> None:
        d.append("- %s%s%s" % (nhan, t["colon"], _so(gia_tri)))

    d += ["# " + t["title"], "", t["intro"], ""]
    if c["name"]:
        dong(t["name"], c["name"])
    dong(t["gender"], t["female"] if c["gender"] == "female" else t["male"])
    dong(t["solar"], "%s %s" % (c["solarDate"], c["time"]) if c["time"] else c["solarDate"])
    dong(t["hour"], "%s (%s)" % (c["hour"]["name"], c["hour"]["range"]))
    lu = c["lunar"]
    am = "%04d-%02d-%02d" % (lu["year"], lu["month"], lu["day"])
    dong(t["lunar"], "%s (%s)" % (am, t["leap"]) if lu["leap"] else am)
    dong(t["year"], c["yearPillar"])
    dong(t["yinYang"], c["yinYang"])
    dong(t["bureau"], "%s (%d)" % (c["bureau"]["name"], c["bureau"]["number"]))
    dong(t["naYin"], c["naYin"])
    menh = c["palaces"][c["lifePalace"]]
    than = c["palaces"][c["bodyPalace"]]
    dong(t["life"], menh["branch"])
    dong(t["body"], "%s (%s)" % (than["branch"], than["name"]))
    dong(t["calendar"], t["calendarValue"])

    d += ["", "## " + t["palaces"]]
    for k in range(12):
        cung = c["palaces"][(c["lifePalace"] - k) % 12]
        dau = ["%s (%s, %s)" % (cung["name"], cung["branch"], cung["stemBranch"])]
        if cung["isBody"] and not cung["isLife"]:
            dau.append(t["body"])
        if cung["tuan"]:
            dau.append(t["tuan"])
        if cung["triet"]:
            dau.append(t["triet"])
        d += ["", "### " + " · ".join(dau)]
        chinh = [s for s in cung["stars"] if s["kind"] == "major"]
        if chinh:
            dong(t["major"], _ds_sao(chinh))
        else:
            doi = c["palaces"][(cung["index"] + 6) % 12]
            muon = [s for s in doi["stars"] if s["kind"] == "major"]
            dong(t["major"], "%s%s%s (%s, %s)%s%s" % (t["none"], t["stop"], t["opposite"], doi["name"], doi["branch"],
                                                      t["colon"], _ds_sao(muon) if muon else t["none"]))
        if day:
            phu = [s for s in cung["stars"] if s["kind"] == "minor"]
            if phu:
                dong(t["minor"], _ds_sao(phu))
            for kind, nhan in (("growth", t["growth"]), ("year-ring", t["yearRing"]), ("scholar", t["scholar"])):
                v = [s for s in cung["stars"] if s["kind"] == kind]
                if v:
                    dong(nhan, _ds_sao(v))
        else:
            hoa = [s for s in cung["stars"] if s["kind"] != "major" and s.get("transformation")]
            if hoa:
                dong(t["transformations"], _ds_sao(hoa))

    if day:
        d += ["", "## " + t["decades"], "", t["agesNote"]]
        for v in en.decade_luck(c):
            d.append("- %d-%d (%d-%d)%s%s (%s)%s%s" % (
                v["fromAge"], v["toAge"], v["fromYear"], v["toYear"], t["colon"], v["palace"], v["branch"], t["colon"],
                ", ".join(v["majorStars"]) if v["majorStars"] else t["noMajor"]))
        d += ["", "## " + t["patterns"]]
        cc = en.find_patterns(c)
        if not cc:
            d.append("- " + t["noPatterns"])
        for p in cc:
            d.append("- %s (%s)" % (p["name"], p["palace"]) if p["palace"] else "- " + p["name"])

    if year is not None:
        if not isinstance(year, int) or isinstance(year, bool):
            raise TypeError("year must be an integer")
        y = en.yearly_luck(c, year)
        d += ["", "## " + _dien(t["yearHead"], {"year": y["year"], "pillar": y["yearPillar"], "age": y["age"]})]
        dong(t["yearPalace"], "%s (%s)" % (y["yearPalace"]["branch"], y["yearPalace"]["palace"]))
        dong(t["minorLimit"], "%s (%s)" % (y["minorLimit"]["branch"], y["minorLimit"]["palace"]))
        dv = y["decade"]
        dong(t["decade"], "%d-%d (%s)" % (dv["fromAge"], dv["toAge"], dv["palace"]) if dv else t["outside"])
        for h in y["transformations"]:
            dong(h["type"], "%s (%s)" % (h["star"], h["palace"] if h["palace"] is not None else t["notOnChart"]))

    d += ["", "## " + t["notes"]]
    d += ["- " + n for n in c["notes"]]
    d += ["", SOURCE_LINE[c["lang"]]]
    return "\n".join(d) + "\n"


# ── Bát Tự ───────────────────────────────────────────────────────────────

_BT = {
    "vi": {
        "title": "Lá số Bát Tự (Tứ Trụ)", "intro": "Chỉ gồm dữ kiện tính được, không có lời luận.", "colon": ": ",
        "gender": "Giới tính", "male": "Nam", "female": "Nữ", "solar": "Ngày sinh dương lịch", "unknownTime": "chưa biết giờ",
        "dayMaster": "Nhật chủ", "solarTerm": "Tiết khí lúc sinh", "monthTerm": "Tiết mở tháng sinh", "pillarYear": "Năm của trụ năm",
        "calendar": "Giờ", "calendarValue": "giờ Việt Nam, UTC+7",
        "pillars": "Bốn trụ", "year": "Trụ năm", "month": "Trụ tháng", "day": "Trụ ngày", "hour": "Trụ giờ",
        "stem": "Thiên can", "branch": "Địa chi", "tenGod": "thập thần", "hidden": "Tàng can", "naYin": "Nạp âm",
        "stage": "Trường sinh của nhật chủ", "selfStage": "Tự tọa", "stars": "Thần sát", "none": "không có",
        "other": "Trụ phụ", "conception": "Thai nguyên", "lifePalace": "Mệnh cung",
        "luck": "Đại vận", "direction": "Chiều", "forward": "thuận", "backward": "nghịch",
        "start": "Khởi vận", "startValue": "{years} năm {months} tháng, ngày {date}", "counted": "Tính từ tiết",
        "countedValue": "{term} {date} {time}, cách {days} ngày", "luckLine": "{label}, từ {age} tuổi ({from}-{to})",
        "symbolic": "Thần sát theo trụ", "notes": "Ghi chú", "semi": "; ", "stageShort": "trường sinh của nhật chủ",
    },
    "en": {
        "title": "BaZi (Four Pillars) chart", "intro": "Computed data only, no interpretation.", "colon": ": ",
        "gender": "Gender", "male": "male", "female": "female", "solar": "Birth date (Gregorian)", "unknownTime": "time unknown",
        "dayMaster": "Day Master", "solarTerm": "Solar term at birth", "monthTerm": "Term that opened the birth month",
        "pillarYear": "Year of the year pillar", "calendar": "Time", "calendarValue": "Vietnam time, UTC+7",
        "pillars": "Four pillars", "year": "Year pillar", "month": "Month pillar", "day": "Day pillar", "hour": "Hour pillar",
        "stem": "Stem", "branch": "Branch", "tenGod": "Ten God", "hidden": "Hidden stems", "naYin": "Na yin",
        "stage": "Day Master's stage here", "selfStage": "Own stage", "stars": "Symbolic stars", "none": "none",
        "other": "Other pillars", "conception": "Conception pillar", "lifePalace": "Life palace",
        "luck": "Luck pillars", "direction": "Direction", "forward": "forward", "backward": "backward",
        "start": "Luck starts", "startValue": "at {years} years {months} months, on {date}", "counted": "Counted from",
        "countedValue": "{term} {date} {time}, {days} days", "luckLine": "{label}, from age {age} ({from}-{to})",
        "symbolic": "Symbolic stars by pillar", "notes": "Notes", "semi": "; ", "stageShort": "Day Master's stage",
    },
    "zh": {
        "title": "八字命盘（四柱）", "intro": "仅列可计算的数据，不含论断。", "colon": "：",
        "gender": "性别", "male": "男", "female": "女", "solar": "公历生日", "unknownTime": "时辰未知",
        "dayMaster": "日主", "solarTerm": "出生节气", "monthTerm": "月令所起之节", "pillarYear": "年柱所属年",
        "calendar": "时间", "calendarValue": "越南时间，UTC+7",
        "pillars": "四柱", "year": "年柱", "month": "月柱", "day": "日柱", "hour": "时柱",
        "stem": "天干", "branch": "地支", "tenGod": "十神", "hidden": "藏干", "naYin": "纳音",
        "stage": "日主十二长生", "selfStage": "自坐", "stars": "神煞", "none": "无",
        "other": "其他", "conception": "胎元", "lifePalace": "命宫",
        "luck": "大运", "direction": "顺逆", "forward": "顺行", "backward": "逆行",
        "start": "起运", "startValue": "{years}年{months}个月，{date}", "counted": "起算节气",
        "countedValue": "{term} {date} {time}，相距{days}天", "luckLine": "{label}，{age}岁起（{from}-{to}）",
        "symbolic": "各柱神煞", "notes": "说明", "semi": "；", "stageShort": "日主十二长生",
    },
}

_TEN_TRU = ("year", "month", "day", "hour")


def bazi_to_text(chart: Dict, lang: Optional[str] = None, detail: Optional[str] = None) -> str:
    """Print a BaZi chart (from ``cast_bazi`` or ``lap_la_so_bat_tu``) as compact
    markdown for a language model. ``detail`` is ``"full"`` (default) or ``"summary"``."""
    day = _detail(detail)
    if "raw" in chart and "pillars" in chart:
        c = en._localize_bazi(chart["raw"], en._lang(lang or chart["lang"]))
    elif "truNgay" in chart:
        c = en._localize_bazi(chart, en._lang(lang or "en"))
    else:
        raise TypeError("chart_to_text expects a chart from cast_bazi or lap_la_so_bat_tu")
    t = _BT[c["lang"]]
    d: List[str] = []

    def dong(nhan: str, gia_tri: Any) -> None:
        d.append("- %s%s%s" % (nhan, t["colon"], _so(gia_tri)))

    d += ["# " + t["title"], "", t["intro"], ""]
    dong(t["gender"], t["female"] if c["gender"] == "female" else t["male"])
    dong(t["solar"], "%s %s" % (c["solarDate"], c["time"]) if c["time"] else "%s (%s)" % (c["solarDate"], t["unknownTime"]))
    dm = c["dayMaster"]
    dong(t["dayMaster"], "%s (%s, %s)" % (dm["stem"], dm["element"], dm["yinYang"]))
    dong(t["solarTerm"], c["solarTerm"])
    dong(t["monthTerm"], c["monthTerm"])
    dong(t["pillarYear"], c["pillarYear"])
    dong(t["calendar"], t["calendarValue"])

    d += ["", "## " + t["pillars"]]
    for k in _TEN_TRU:
        p = c["pillars"][k]
        if not p:
            d += ["", "### %s%s%s" % (t[k], t["colon"], t["unknownTime"])]
            continue
        d += ["", "### %s%s%s" % (t[k], t["colon"], p["label"])]
        dong(t["stem"], "%s (%s), %s%s%s" % (p["stem"], p["stemElement"], t["tenGod"], t["colon"], p["tenGod"]))
        dong(t["branch"], "%s (%s)" % (p["branch"], p["branchElement"]))
        dong(t["hidden"], ", ".join("%s (%s, %s, %s)" % (h["stem"], h["element"], h["role"], h["tenGod"])
                                    for h in p["hiddenStems"]))
        dong(t["naYin"], p["naYin"])
        if day:
            dong(t["stage"], p["stage"])
            dong(t["selfStage"], p["selfStage"])
            dong(t["stars"], ", ".join(p["stars"]) if p["stars"] else t["none"])

    if day:
        d += ["", "## " + t["other"]]
        dong(t["conception"], "%s (%s)" % (c["conception"]["label"], c["conception"]["naYin"]))
        lp = c["lifePalace"]
        dong(t["lifePalace"], "%s (%s)" % (lp["label"], lp["naYin"]) if lp else t["unknownTime"])

    lk = c["luck"]
    d += ["", "## " + t["luck"]]
    dong(t["direction"], t["forward"] if lk["direction"] == "forward" else t["backward"])
    dong(t["start"], _dien(t["startValue"], {"years": lk["startAge"]["years"], "months": lk["startAge"]["months"],
                                             "date": lk["startDate"]}))
    if day:
        dong(t["counted"], _dien(t["countedValue"], {"term": lk["term"]["name"], "date": lk["term"]["date"],
                                                     "time": lk["term"]["time"], "days": lk["days"]}))
    for v in lk["pillars"]:
        dau = _dien(t["luckLine"], {"label": v["label"], "age": v["fromAge"], "from": v["fromYear"], "to": v["toYear"]})
        duoi = "%s%s%s%s" % (t["semi"], t["stageShort"], t["colon"], v["stage"]) if day else ""
        d.append("- %s. %s%s%s%s%s%s" % (_so(v["order"]), dau, t["semi"], t["tenGod"], t["colon"], v["tenGod"], duoi))

    co_sao = [s for s in c["symbolicStars"] if s["pillars"]]
    if day and co_sao:
        d += ["", "## " + t["symbolic"]]
        for s in co_sao:
            d.append("- %s%s%s" % (s["name"], t["colon"], ", ".join(t[x] for x in s["pillars"])))

    d += ["", "## " + t["notes"]]
    d += ["- " + n for n in c["notes"]]
    d += ["", SOURCE_LINE[c["lang"]]]
    return "\n".join(d) + "\n"


# ── Thần số học ──────────────────────────────────────────────────────────

_TSH = {
    "vi": {
        "title": "Hồ sơ thần số học (Pythagoras)", "intro": "Chỉ gồm con số tính được, không có lời luận.", "colon": ": ",
        "name": "Họ tên", "birth": "Ngày sinh", "today": "Ngày xem", "core": "Chỉ số chính", "cycles": "Chu kỳ cá nhân",
        "none": "không có", "toAge": "tới {age} tuổi", "life": "trọn đời",
        "master": "Giữ nguyên số chủ 11, 22, 33. Họ tên bỏ dấu, chỉ tính chữ A tới Z.",
    },
    "en": {
        "title": "Numerology profile (Pythagorean)", "intro": "Computed numbers only, no interpretation.", "colon": ": ",
        "name": "Name", "birth": "Birth date", "today": "Reference date", "core": "Core numbers", "cycles": "Personal cycles",
        "none": "none", "toAge": "to age {age}", "life": "for life",
        "master": "Master numbers 11, 22, 33 are kept. Diacritics are folded; only letters A to Z count.",
    },
    "zh": {
        "title": "数字命理档案（毕达哥拉斯）", "intro": "仅列可计算的数字，不含论断。", "colon": "：",
        "name": "姓名", "birth": "出生日期", "today": "参照日期", "core": "核心数字", "cycles": "个人周期",
        "none": "无", "toAge": "至{age}岁", "life": "终身",
        "master": "保留大师数 11、22、33。姓名去掉声调符号，只计 A 至 Z 字母。",
    },
}


def _tu_tho(r: Dict) -> Dict[str, Any]:
    p, c = r["soDinhCao"], r["soThachThuc"]
    return {
        "name": "", "birthDate": "", "today": "",
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
    }


def numerology_to_text(profile: Dict, lang: Optional[str] = None, detail: Optional[str] = None) -> str:
    """Print a numerology profile (from ``numerology`` or
    ``tinh_ho_so_than_so_hoc_sau``) as compact markdown for a language model."""
    day = _detail(detail)
    if "lifePath" in profile:
        r = profile
        lang = en._lang(lang or profile["lang"])
    elif "soDuongDoi" in profile:
        r = _tu_tho(profile)
        lang = en._lang(lang or "en")
    else:
        raise TypeError("chart_to_text expects a profile from numerology or tinh_ho_so_than_so_hoc_sau")
    t = _TSH[lang]
    n = en.NUMEROLOGY_LABELS[lang]
    d: List[str] = []

    def dong(nhan: str, gia_tri: Any) -> None:
        d.append("- %s%s%s" % (nhan, t["colon"], _so(gia_tri)))

    d += ["# " + t["title"], "", t["intro"]]
    if r["name"] or r["birthDate"] or r["today"]:
        d.append("")
    if r["name"]:
        dong(t["name"], r["name"])
    if r["birthDate"]:
        dong(t["birth"], r["birthDate"])
    if r["today"]:
        dong(t["today"], r["today"])

    d += ["", "## " + t["core"]]
    dong(n["lifePath"], r["lifePath"])
    dong(n["expression"], r["expression"])
    dong(n["soulUrge"], r["soulUrge"])
    dong(n["personality"], r["personality"])
    dong(n["birthday"], r["birthday"])
    if day:
        dong(n["attitude"], r["attitude"])
        dong(n["maturity"], r["maturity"])
    dong(n["karmicDebt"], r["karmicDebt"] if r["karmicDebt"] is not None else t["none"])

    d += ["", "## " + t["cycles"]]
    dong("%s (%s)" % (n["personalYear"], r["today"][:4]) if r["today"] else n["personalYear"], r["personalYear"])
    if day:
        dong(n["personalMonth"], r["personalMonth"])
        dong(n["personalDay"], r["personalDay"])
        d += ["", "## " + n["pinnacles"]]
        for i, p in enumerate(r["pinnacles"]):
            dong(str(i + 1), "%s (%s)" % (_so(p["number"]), t["life"] if p["toAge"] is None
                                          else t["toAge"].replace("{age}", _so(p["toAge"]))))
        d += ["", "## " + n["challenges"]]
        for i, x in enumerate(r["challenges"]):
            dong(str(i + 1), x)
        d += ["", "## " + n["grid"]]
        g = r["grid"]
        d.append(", ".join("%s%s%s" % (k, t["colon"], _so(g[k])) for k in "123456789"))

    d += ["", t["master"], "", SOURCE_LINE[lang]]
    return "\n".join(d) + "\n"


# ── Chung ────────────────────────────────────────────────────────────────

def chart_to_text(chart: Dict, lang: Optional[str] = None, detail: Optional[str] = None,
                  year: Optional[int] = None) -> str:
    """Print a Zi Wei, BaZi or numerology result as compact markdown for a
    language model (computed facts only, ends with the source line). The kind
    is detected from the keys. ``year`` applies to Zi Wei charts only."""
    if not isinstance(chart, dict):
        raise TypeError("chart_to_text expects a dict")
    if "palaces" in chart or "cung" in chart:
        return zi_wei_to_text(chart, lang=lang, detail=detail, year=year)
    if year is not None:
        raise TypeError("year applies to Zi Wei charts only")
    if "pillars" in chart or "truNgay" in chart:
        return bazi_to_text(chart, lang=lang, detail=detail)
    if "lifePath" in chart or "soDuongDoi" in chart:
        return numerology_to_text(chart, lang=lang, detail=detail)
    raise TypeError("chart_to_text: not a Zi Wei, BaZi or numerology result")
