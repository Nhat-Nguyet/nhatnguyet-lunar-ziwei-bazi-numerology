# English API

Every package keeps its original Vietnamese-named functions (`lapLaSoTuVi`,
`solarToLunar`...) and adds a parallel English layer with named options:

- dates as `"YYYY-MM-DD"`, `{ year, month, day }` or a `Date` (read in local time);
- clock times as `"HH:MM"` (24 h); the package maps them to the double hour
  itself (the **Tý hour runs 23:00 to 00:59**);
- gender as `"male"` / `"female"`;
- `lang: "en" | "vi" | "zh"` (default `"en"`) for every name in the result;
- the untouched original object in `raw`, so nothing is lost.

TypeScript and Python return the same keys (camelCase) and the command lines
print the same bytes. Every output below was produced by running the code.

## Lunar calendar: `@nhatnguyet/am-lich`

```ts
import { toLunar, toSolar, solarTerms, dayPillar, hourBranch } from "@nhatnguyet/am-lich";

toLunar("2027-02-06");
// {"year":2027,"month":1,"day":1,"leap":false,"solarDate":"2027-02-06","country":"VN","timeZone":7,
//  "yearName":"Đinh Mùi","monthName":"Nhâm Dần","dayName":"Bính Thìn","zodiac":"Goat",
//  "solarTerm":"Start of Spring","lang":"en"}

toLunar("1985-01-21", { country: "CN", lang: "zh" });   // Tết 1985: Vietnam and China differ
// {"year":1984,"month":12,"day":1,"leap":false,"solarDate":"1985-01-21","country":"CN","timeZone":8,
//  "yearName":"甲子","monthName":"丁丑","dayName":"庚申","zodiac":"鼠","solarTerm":"大寒","lang":"zh"}

toSolar({ year: 2023, month: 2, day: 1, leap: true });
// {"day":22,"month":3,"year":2023,"date":"2023-03-22"}
// A lunar date that does not exist (no such leap month, day 30 of a 29-day month) throws RangeError.

solarTerms(2027, { country: "CN" })[2];
// {"index":21,"longitude":315,"name":"Start of Spring","nameVi":"Lập Xuân","kind":"jie",
//  "date":"2027-02-04","time":"09:46","timeZone":8}

dayPillar("1990-09-19");
// {"label":"Đinh Hợi","stem":"Đinh","branch":"Hợi","stemIndex":3,"branchIndex":11,"stemElement":"Fire",
//  "branchElement":"Water","naYin":"Earth on the Roof","naYinElement":"Earth"}

hourBranch("23:30");
// {"index":0,"name":"Tý","animal":"Rat","range":"23:00-00:59"}
```

`country` takes VN (default, UTC+7), CN, TW, HK, MO, SG, MY, ID, PH (UTC+8),
KR, JP (UTC+9); same rules, only the local time that decides the day differs.
`timeZone` overrides it. Vietnam's fourth zodiac animal is the Cat, everywhere
else the Rabbit. Also: `solarTermOn(date)`, `yearPillar(lunarYear)`,
`solarTermNames()`, `parseDate`, `parseTime`.

## Zi Wei Dou Shu: `@nhatnguyet/tu-vi`

```ts
import { castZiWei, decadeLuck, yearlyLuck, yearlyStars, findPatterns, ziWeiSvg } from "@nhatnguyet/tu-vi";

const chart = castZiWei({ date: "1990-09-19", time: "20:00", gender: "male", viewYear: 2026 });
chart.hour;     // {"index":10,"name":"Tuất","animal":"Dog","range":"19:00-20:59"}
chart.lunar;    // {"year":1990,"month":8,"day":1,"leap":false}
chart.bureau;   // {"number":5,"name":"Earth Five"}
chart.yinYang;  // "Yang Male"
chart.palaces[chart.lifePalace];
// {"index":11,"branch":"Hợi","stemBranch":"Đinh Hợi","name":"Life Palace","nameVi":"Mệnh","isLife":true,
//  "isBody":false,"tuan":true,"triet":false,"stars":[{"name":"Moon","nameVi":"Thái Âm","kind":"major",
//  "brightness":"Exalted","transformation":"Hóa Kỵ"},{"name":"Left Assistant","nameVi":"Tả Phù","kind":"minor"}, ...]}

decadeLuck(chart)[3];
// {"order":4,"palaceIndex":2,"branch":"Dần","palace":"Property","fromAge":35,"toAge":44,
//  "fromYear":2024,"toYear":2033,"majorStars":["Military Song","Celestial General"]}
yearlyLuck(chart).decade;       // {"fromAge":35,"toAge":44,"palace":"Property"}
findPatterns(chart)[0].name;    // "Cơ Nguyệt Đồng Lương"
chart.toSvg({ theme: "dark" }); // "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 1000 10..."
```

- `time` or `hourBranch` (0 = Tý ... 11 = Hợi) is required; a mismatch between the two throws.
- A birth from 23:00 to midnight keeps the date you entered (some texts move it
  to the next day; enter the next date to follow them). The chart says so in `notes`.
- Ages are East Asian ages (1 at birth); `fromYear`/`toYear` give the years.
- `palaces` are indexed by branch, 0 (Tý) to 11 (Hợi); `kind` is `major`,
  `minor`, `growth` (Tràng Sinh ring), `year-ring` (Thái Tuế ring) or `scholar` (Bác Sỹ ring).
- English keeps Sino-Vietnamese names where the books do (stems, branches,
  Hóa Lộc, pattern names); `lang: "zh"` gives 命宫, 太阴, 化忌, 土五局.
- `ziWeiSvg(chart, { theme, width, lang })` and `chart.toSvg()` draw the same
  SVG as `renderChartSvg(chart.raw)`. `toSvg` is not enumerable, so it never
  shows up in JSON.

## BaZi: `@nhatnguyet/bat-tu`

```ts
import { castBaZi, minorLuck, baZiSvg } from "@nhatnguyet/bat-tu";

const bz = castBaZi({ date: "1990-09-19", time: "20:00", gender: "male" });
bz.pillars.day.label;     // "Đinh Hợi"
bz.dayMaster;             // {"stem":"Đinh","element":"Fire","yinYang":"Yin"}
bz.luck.startAge;         // {"years":6,"months":4}
bz.luck.pillars[0].label; // "Bính Tuất"
bz.toSvg({ name: "An" }); // same as renderBaziSvg(bz.raw, { hoTen: "An" })
```

`time` may be omitted (`null`): no hour pillar, the luck start is counted from
noon. Conventions: Vietnam time (UTC+7); the year turns at Start of Spring,
the month at each sectional term, the **day at 23:00**. Each pillar has
`tenGod`, `hiddenStems`, `naYin`, `stage`, `selfStage`, `stars`;
`minorLuck(bz, 2026)` gives the minor luck pillar of a year.

## Numerology: `@nhatnguyet/than-so-hoc`

```ts
import { numerology } from "@nhatnguyet/than-so-hoc";

const n = numerology({ name: "Nguyen Van An", birthDate: "1990-09-19", today: "2026-11-19" });
// lifePath 11, expression 3, soulUrge 1, personalYear 2, karmicDebt 19
n.labels.lifePath;   // "Life Path"  ("生命灵数" with lang: "zh")
n.toSvg();           // same as renderNumerologySvg(...)
```

Master numbers 11, 22, 33 are kept. Diacritics in the name are folded; only
A-Z letters count. Also `grid` (digits 1-9 of the birth date), `pinnacles`
(with `toAge`), `challenges`.

## Festivals: `@nhatnguyet/le-hoi`

```ts
import { festivals } from "@nhatnguyet/le-hoi";

festivals(2027)[2];
// {"id":"tet-nguyen-dan","date":"2027-02-06","name":"Lunar New Year (Tết)","calendar":"lunar","fixedDate":"1/1", ...}
```

Sorted by date; festivals whose dates the organisers announce each year are
not included (see `raw.lich_cong_bo`). `lang: "zh"` gives 越南春节.

## Python

Same functions in snake_case, keyword arguments, same result keys:

```python
from nhatnguyet import cast_zi_wei, cast_bazi, to_lunar, numerology, festivals, decade_luck, zi_wei_svg

c = cast_zi_wei(date="1990-09-19", time="20:00", gender="male", lang="zh", view_year=2026)
c["palaces"][c["lifePalace"]]["name"]   # '命宫'
c["bureau"]                             # {'number': 5, 'name': '土五局'}
decade_luck(c)[3]["palace"]             # '田宅宫'
cast_bazi(date="1990-09-19", time="20:00", gender="male")["pillars"]["day"]["label"]   # 'Đinh Hợi'
to_lunar("2027-02-06", country="KR")["month"]                                         # 12
numerology("Nguyen Van An", "1990-09-19", today="2026-11-19")["lifePath"]              # 11
festivals(2027, lang="zh")[2]["name"]                                                  # '越南春节'
svg = zi_wei_svg(c, theme="dark")
```

Also `to_solar(year, month, day, leap=False, country=...)`, `solar_terms`,
`solar_term_on`, `day_pillar`, `year_pillar`, `hour_branch`, `yearly_luck`,
`yearly_stars`, `find_patterns`, `minor_luck`, `bazi_svg`, `numerology_svg`.
Dates also accept `datetime.date` and `(year, month, day)` tuples.

## Command line

```bash
npx @nhatnguyet/cli ziwei 1990-09-19 20:00 male --name "Nguyen Van An" --year 2026
python -m nhatnguyet ziwei 1990-09-19 20:00 male --name "Nguyen Van An" --year 2026
```

```text
┌────────────────────┬────────────────────┬────────────────────┬────────────────────┐
│ Travel             │ Health             │ Wealth · Body      │ Children           │
│ Tân Tỵ             │ Nhâm Ngọ Triệt     │ Quý Mùi Triệt      │ Giáp Thân          │
│ Celestial Mechanism│ Purple Star Ex     │ Spinning Camel     │ Army Breaker We    │
│   Pr               │ Celestial Leader,  │ Nurture            │ Prosperity,        │
│ Celestial Talent   │ Celestial Fortune  │                    │ Celestial Horse    │
│ Extinction         │ Conception         │                    │ Growth             │
├────────────────────┼────────────────────┴────────────────────┼────────────────────┤
│ Friends/Subordinat…│                                         │ Spouse             │
│ Canh Thìn          │                                         │ Ất Dậu             │
│ Seven Killings We  │                                         │ Sword Ram,         │
│ Tomb               │                                         │ Earthly Robber,    │
│                    │          ZI WEI DOU SHU CHART           │ Dipper Lord        │
│                    │              Nguyen Van An              │ Bathing            │
├────────────────────┤      Born 1990-09-19 20:00 (Tuất)       ├────────────────────┤
│ Career             │       Lunar 1990-08-01 · Canh Ngọ       │ Siblings           │
│ Kỷ Mão             │                Yang Male                │ Bính Tuất Tuần     │
│ Sun Pr Lộc         │           Bureau: Earth Five            │ Purity Ex          │
│ Celestial Beam Pr  │      Na yin: Earth by the Roadside      │ Celestial Treasury │
│ Right Assistant,   │          Life: Hợi · Body: Mùi          │   Pr               │
│ Peach Blossom,     │                                         │ Youth              │
│ Eight Seats,       │                                         │                    │
│ Celestial Nobili…  │                                         │                    │
│ Death              │                                         │                    │
├────────────────────┼────────────────────┬────────────────────┼────────────────────┤
│ Property           │ Fortune/Virtue     │ Parents            │ Life Palace        │
│ Mậu Dần            │ Kỷ Sửu             │ Mậu Tý             │ Đinh Hợi Tuần      │
│ Military Song      │ Celestial Blessing │ Greedy Wolf We     │ Moon Ex Kỵ         │
│   Pr Quyền         │   We Khoa          │ Literary Glory,    │ Left Assistant,    │
│ Celestial General  │ Giant Gate We      │ Celestial Weeping, │ Three Terraces,    │
│   Ex               │ Earthly Void,      │ Celestial Emptin…  │ Grace Light,       │
│ Celestial Excell…, │ Celestial Longev…  │ Peak               │ Celestial Offici…  │
│ Literary Melody    │ Decline            │                    │ Prime              │
│ Illness            │                    │                    │                    │
└────────────────────┴────────────────────┴────────────────────┴────────────────────┘
Brightness: Ex exalted, Pr prosperous, Fa favorable, Ne neutral, We weak. Ages are East
Asian ages (1 at birth).
```

Below the grid it prints the viewing year, the twelve ten-year periods, the
patterns and the notes. Other commands:

```bash
nhatnguyet bazi 1990-09-19 20:00 male --lang zh
nhatnguyet bazi 1990-09-19 female              # birth time unknown
nhatnguyet lunar 2027-02-06 --country CN
nhatnguyet solar 2023-02-01 --leap             # lunar to Gregorian: 2023-03-22
nhatnguyet terms 2027 --country KR
nhatnguyet numerology "Nguyen Van An" 1990-09-19 --today 2026-11-19
nhatnguyet festivals 2027 --lang vi
nhatnguyet ziwei 1990-09-19 20:00 male --svg chart.svg --theme dark
```

```text
$ nhatnguyet lunar 2027-02-06 --country CN
┌────────────┬─────────────────┐
│ Gregorian  │ 2027-02-06      │
│ Lunar      │ 2027-01-01      │
│ Year       │ Đinh Mùi · Goat │
│ Month      │ Nhâm Dần        │
│ Day        │ Bính Thìn       │
│ Solar term │ Start of Spring │
│ Calendar   │ CN (UTC+8)      │
└────────────┴─────────────────┘
```

`--json` prints JSON (without `raw`), `--lang en|vi|zh` picks the language,
`--svg <file>` also writes the chart as SVG (ziwei, bazi, numerology).
Colours are used only on a terminal and are turned off by `NO_COLOR` or
`--no-color`.
