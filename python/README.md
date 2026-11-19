# nhatnguyet

**Vietnamese lunar calendar, Zi Wei Dou Shu (紫微斗数, Purple Star Astrology),
BaZi (八字, Four Pillars of Destiny), Pythagorean numerology and Vietnamese
festivals in pure Python.** Standard library only, no dependencies, Python 3.9
or later.

- **Lunar calendar** for Vietnam (UTC+7) and China, Korea, Japan: lunar and
  Gregorian conversion, sexagenary cycle (can chi, 干支), 24 solar terms to the
  minute, 28 lunar mansions, nạp âm. Over 1900 to 2100, new moons are 0.9
  minutes late on average against NASA, and solar terms are within 0.9
  minutes of IMCCE.
- **Zi Wei Dou Shu**: 12 palaces, major and minor stars, brightness, Four
  Transformations, 10-year and yearly periods, transiting stars, the patterns
  with the original classical line.
- **BaZi**: four pillars by solar term, hidden stems, Ten Gods, symbolic stars,
  luck pillars, minor periods.
- **Numerology** for Vietnamese names with diacritics.
- **206 Vietnamese festivals** in three languages; the 164 with a fixed lunar
  or Gregorian date are computed for any year, with province, ethnic group,
  sourced venue coordinates and iCalendar export (`festivals_ics`).

Results carry Vietnamese, English and Chinese names. Every result matches,
field by field, the engine behind [nhatnguyet.org](https://nhatnguyet.org/en/ma-nguon-mo)
and the Nhat Nguyet app, in 17,291 core test vectors (18,819 including school
options and auspicious hours).

## Install

```bash
pip install nhatnguyet
```

## Usage

Named arguments, dates as `"YYYY-MM-DD"` (or `datetime.date`), clock times as
`"HH:MM"` (the Tý hour runs 23:00 to 00:59), `lang="en" | "vi" | "zh"`, and in
English `terms="pinyin"` (default: "Geng Wu", "Hua Ji"), `"han"` (庚午, 化忌) or
`"vi"` (Canh Ngọ, Hóa Kỵ) for the stems, branches and Four Transformations.
Results are plain `dict`s with the same keys as the TypeScript packages.

```python
>>> from nhatnguyet import cast_zi_wei, decade_luck, cast_bazi, minor_luck, to_lunar, to_solar, numerology, festivals
>>> chart = cast_zi_wei(date="1990-09-19", time="20:00", gender="male", view_year=2026)
>>> chart["bureau"]
{'number': 5, 'name': 'Earth Five'}
>>> life = chart["palaces"][chart["lifePalace"]]
>>> life["name"], life["stars"][0]
('Life Palace', {'name': 'Moon', 'nameVi': 'Thái Âm', 'kind': 'major', 'brightness': 'Exalted', 'transformation': 'Hua Ji'})
>>> decade_luck(chart)[3]
{'order': 4, 'palaceIndex': 2, 'branch': 'Yin', 'palace': 'Property', 'fromAge': 35, 'toAge': 44, 'fromYear': 2024, 'toYear': 2033, 'majorStars': ['Military Song', 'Celestial Minister']}
>>> han = cast_zi_wei(date="1990-09-19", time="20:00", gender="male", terms="han")
>>> han["palaces"][han["lifePalace"]]["stemBranch"], han["palaces"][han["lifePalace"]]["stars"][0]["transformation"]
('丁亥', '化忌')
>>> zh = cast_zi_wei(date="1990-09-19", time="20:00", gender="male", lang="zh")
>>> zh["palaces"][zh["lifePalace"]]["name"], zh["bureau"]["name"]
('命宫', '土五局')

>>> bz = cast_bazi(date="1990-09-19", time="20:00", gender="male")
>>> [bz["pillars"][k]["label"] for k in ("year", "month", "day", "hour")]
['Geng Wu', 'Yi You', 'Ding Hai', 'Geng Xu']
>>> bz["dayMaster"], bz["luck"]["startAge"], minor_luck(bz, 2026)["label"]
({'stem': 'Ding', 'element': 'Fire', 'yinYang': 'Yin'}, {'years': 6, 'months': 4}, 'Ding Hai')
>>> cast_bazi(date="1990-09-19", time="20:00", gender="male", terms="vi")["pillars"]["day"]["label"]
'Đinh Hợi'

>>> to_lunar("2027-02-06")
{'year': 2027, 'month': 1, 'day': 1, 'leap': False, 'solarDate': '2027-02-06', 'country': 'VN', 'timeZone': 7, 'yearName': 'Ding Wei', 'monthName': 'Ren Yin', 'dayName': 'Bing Chen', 'zodiac': 'Goat', 'solarTerm': 'Start of Spring', 'lang': 'en'}
>>> to_lunar("1985-01-21")["month"], to_lunar("1985-01-21", country="CN")["month"]   # Tết in Vietnam, 12th month in China
(1, 12)
>>> to_solar(2023, 2, 1, leap=True)
{'day': 22, 'month': 3, 'year': 2023, 'date': '2023-03-22'}

>>> n = numerology("Nguyen Van An", "1990-09-19", today="2026-11-19")
>>> n["lifePath"], n["expression"], n["soulUrge"], n["personalYear"]
(11, 3, 1, 2)
>>> len(festivals(2027)), festivals(2027, lang="zh")[2]["name"]   # 164 of the 206 have a fixed date
(164, '越南春节')

```

Also `solar_terms`, `solar_term_on`, `day_pillar`, `year_pillar`,
`hour_branch`, `yearly_luck`, `yearly_stars`, `find_patterns`. Drawing and text
for language models:

```python
>>> from nhatnguyet import zi_wei_svg, chart_to_text
>>> zi_wei_svg(chart, theme="dark")[:40]
'<svg xmlns="http://www.w3.org/2000/svg" '
>>> print(chart_to_text(chart, detail="summary").splitlines()[0])
# Zi Wei Dou Shu chart

```

`zi_wei_svg`, `bazi_svg` and `numerology_svg` give the same SVG, byte for byte,
as the TypeScript packages. The command line prints the same text too:

```bash
nhatnguyet ziwei 1990-09-19 20:00 male --year 2026
nhatnguyet lunar 2027-02-06 --country CN
nhatnguyet bazi 1990-09-19 20:00 male --json
```

All options: [API docs](https://nhatnguyet.org/en/ma-nguon-mo/tai-lieu).

## Original API

The functions of the reference engine, with positional arguments and
Vietnamese field names.

### Lunar calendar

```python
>>> from nhatnguyet import am_lich
>>> am_lich.solar_to_lunar(17, 2, 2026)          # day, month, year -> Tết 2026
{'day': 1, 'month': 1, 'year': 2026, 'leap': False}
>>> am_lich.lunar_to_solar(1, 1, 2026, False)    # lunar day, month, year, leap month?
({'day': 17, 'month': 2, 'year': 2026}, True)
>>> am_lich.year_can_chi(2026)["label"], am_lich.day_can_chi(17, 2, 2026)["label"]
('Bính Ngọ', 'Nhâm Tuất')
>>> am_lich.tiet_khi_cua_ngay(19, 11, 2026)["tenEn"]
'Start of Winter'
>>> am_lich.moc_tiet_khi_trong_nam(2026)[0]      # first solar term of 2026, Vietnam time
{'index': 19, 'kinhDo': 285, 'ten': 'Tiểu Hàn', 'tenEn': 'Minor Cold', 'yNghia': 'Bắt đầu rét đậm', 'yNghiaEn': 'Deep cold sets in', 'yNghiaZh': '严寒来临', 'laTiet': True, 'ngay': {'day': 5, 'month': 1, 'year': 2026}, 'gio': 15, 'phut': 23}

>>> # Same day, two calendars: Tết in Vietnam, still the 12th month in China
>>> am_lich.solar_to_lunar(21, 1, 1985)
{'day': 1, 'month': 1, 'year': 1985, 'leap': False}
>>> am_lich.solar_to_lunar(21, 1, 1985, am_lich.MUI_GIO_THEO_NUOC["CN"])
{'day': 1, 'month': 12, 'year': 1984, 'leap': False}

```

### Zi Wei Dou Shu

```python
>>> from nhatnguyet import tu_vi
>>> # name, gender ("Nam" male, "Nữ" female), day, month, year, hour branch index
>>> # (0 Tý 11 pm to 1 am ... 10 Tuất 7 to 9 pm, 11 Hợi)
>>> chart = tu_vi.lap_la_so_tu_vi("", "Nam", 19, 9, 1990, 10)
>>> chart["canChiNam"], chart["tenCuc"], chart["ngaySinhAm"]
('Canh Ngọ', 'Thổ Ngũ Cục', {'day': 1, 'month': 8, 'year': 1990, 'leap': False})
>>> life = chart["cung"][chart["cungMenh"]]
>>> [(s["ten"], s["tenEn"], s["mieuVuongEn"], s["tuHoa"]) for s in life["sao"] if s["loai"] == "chinh-tinh"]
[('Thái Âm', 'Moon', 'Exalted', 'Hóa Kỵ')]
>>> [c["ten"] for c in tu_vi.nhan_dien_cach_cuc(chart)]
['Cơ Nguyệt Đồng Lương', 'Tả Hữu đồng hội', 'Nhật xuất Phù Tang', 'Nguyệt lạc Hợi cung']
>>> tu_vi.dai_van(chart)[0]                      # first 10-year period
{'thu': 1, 'viTri': 11, 'chi': 'Hợi', 'chiZh': '亥', 'tenCung': 'Mệnh', 'tenCungEn': 'Life Palace', 'tenCungZh': '命宫', 'tuTuoi': 5, 'denTuoi': 14, 'chinhTinh': 'Thái Âm', 'chinhTinhEn': 'Moon', 'chinhTinhZh': '太阴'}
>>> year = tu_vi.tinh_han_nam(chart, 2026)
>>> year["tuoiMu"], year["luuNienTenCung"], year["daiVanTenCung"]
(37, 'Tật Ách', 'Điền Trạch')

```

### BaZi

```python
>>> from nhatnguyet import bat_tu
>>> # day, month, year, hour, minute (Vietnam time), gender; hour None if unknown
>>> chart = bat_tu.lap_la_so_bat_tu(19, 9, 1990, 20, 0, "Nam")
>>> [chart[k]["label"] for k in ("truNam", "truThang", "truNgay", "truGio")]
['Canh Ngọ', 'Ất Dậu', 'Đinh Hợi', 'Canh Tuất']
>>> chart["nhatChu"], chart["tietKhi"], chart["truThang"]["thapThanCanEn"]
('Đinh', 'Bạch Lộ', 'Indirect Resource')
>>> [f'{v["label"]} {v["namTu"]}-{v["namDen"]}' for v in chart["daiVan"]["cacVan"][:3]]
['Bính Tuất 1996-2005', 'Đinh Hợi 2006-2015', 'Mậu Tý 2016-2025']
>>> bat_tu.tinh_tieu_van_bat_tu(chart, 2026)["label"]
'Đinh Hợi'

```

### Numerology and festivals

```python
>>> from nhatnguyet import than_so_hoc, le_hoi
>>> # full name, day, month, year of birth, then the view year, month, day
>>> p = than_so_hoc.tinh_ho_so_than_so_hoc_sau("Nguyễn Văn An", 1, 10, 1960, 2026, 1, 1)
>>> p["soDuongDoi"], p["soSuMenh"], p["soLinhHon"], p["soNamCaNhan"]   # life path, expression, soul urge, personal year
(9, 3, 1, 3)
>>> len(le_hoi.danh_sach_le_hoi()), le_hoi.le_hoi_trong_nam(2027)[:2]
(206, [{'id': 'cho-vieng', 'ngay': '2027-02-13'}, {'id': 'dai-le-hoi-yen-dieu-tri-cung', 'ngay': '2027-09-15'}])
>>> [l["ten_en"] for l in le_hoi.le_hoi_theo_ngay(25, 9, 2026)]
['Diêu Trì Cung Banquet Festival (Cao Đài Mid-Autumn Grand Ceremony)', 'Trần Thương Temple Traditional Festival', 'Mid-Autumn Festival']

```


## Conventions

- Function names are the reference engine's names in snake_case:
  `solar_to_lunar` (Gregorian to lunar), `lunar_to_solar` (lunar to Gregorian),
  `lap_la_so_tu_vi` (cast a Zi Wei chart), `lap_la_so_bat_tu` (cast a BaZi
  chart), `tinh_ho_so_than_so_hoc_sau` (full numerology profile).
- Results are plain `dict`s with the camelCase keys of the shared test cases
  (`soDuongDoi`, `canChiNam`, `kinhDo`...). Gregorian dates are
  `{"day", "month", "year"}`; lunar dates add `"leap"`.
- All calendar calculations use Vietnam time, UTC+7, for every year, unless you
  pass another time zone.
- Numerology never reads the system clock: personal month and day use the view
  date you pass in. Vietnamese names are folded like the reference engine
  ("đ" becomes "d").
- Zi Wei Dou Shu, BaZi and numerology are traditional or conventional systems,
  not validated science. Do not use them for health, financial or legal
  decisions.

## Tests

The package is checked against the shared test cases generated by the
reference engine (14,936 calendar cases, 777 Zi Wei charts, 777 BaZi charts,
600 numerology profiles, 201 festival years). Any port in any language can use
the same cases; see <https://nhatnguyet.org/en/ma-nguon-mo>.

## Related

- JavaScript and TypeScript: [`@nhatnguyet/am-lich`](https://www.npmjs.com/package/@nhatnguyet/am-lich),
  [`@nhatnguyet/tu-vi`](https://www.npmjs.com/package/@nhatnguyet/tu-vi),
  [`@nhatnguyet/bat-tu`](https://www.npmjs.com/package/@nhatnguyet/bat-tu),
  [`@nhatnguyet/than-so-hoc`](https://www.npmjs.com/package/@nhatnguyet/than-so-hoc),
  [`@nhatnguyet/le-hoi`](https://www.npmjs.com/package/@nhatnguyet/le-hoi) on npm.
- Open datasets (3,597,286 interpreted charts, 412 public domain classical
  texts, 33 calendar and culture datasets): <https://nhatnguyet.org/en/du-lieu> and
  [Hugging Face](https://huggingface.co/nhatnguyet).
- Guide: [How rare are chart patterns? Data analysis with Python](https://nhatnguyet.org/en/blog/phan-tich-du-lieu-la-so-bang-python).

## Credits and license

Astronomical formulas after Jean Meeus, *Astronomical Algorithms*; solar
longitude for the solar terms from a truncated VSOP87D (Bretagnon and
Francou, IMCCE); ΔT after Espenak and Meeus (NASA, 2006). The month rules are the common rules of the
traditional lunisolar calendar (the Thời Hiến calendar), applied at UTC+7.
Code: MIT. Festival data: CC BY 4.0. Please credit
`Data: Nhat Nguyet (nhatnguyet.org)` when you show results to users.

## Tiếng Việt

Bản Python của lõi tính Nhật Nguyệt: âm lịch Việt Nam (giờ UTC+7), can chi, 24
tiết khí tới phút, Nhị Thập Bát Tú, nạp âm; lá số Tử Vi, Bát Tự; thần số học
cho tên tiếng Việt; 206 lễ hội, xuất iCalendar. Chỉ dùng thư viện chuẩn, Python 3.9 trở lên,
khớp lõi tính gốc trong 17.291 ca kiểm lõi (18.819 ca nếu tính cả tuỳ chọn
trường phái và giờ hoàng đạo). Cài: `pip install nhatnguyet`. Tài
liệu: <https://nhatnguyet.org/ma-nguon-mo>.

## 中文

纯 Python 实现的越南农历、紫微斗数、八字、数字命理与越南节庆，零依赖；详见 <https://nhatnguyet.org/zh/ma-nguon-mo>。
