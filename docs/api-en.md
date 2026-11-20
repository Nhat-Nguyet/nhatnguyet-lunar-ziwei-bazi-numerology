# English API

Every package keeps its original Vietnamese-named functions (`lapLaSoTuVi`,
`solarToLunar`...) and adds a parallel English layer with named options:

- dates as `"YYYY-MM-DD"`, `{ year, month, day }` or a `Date` (read in local time);
- clock times as `"HH:MM"` (24 h); the package maps them to the double hour
  itself (the **Tý hour runs 23:00 to 00:59**);
- gender as `"male"` / `"female"`;
- `lang: "en" | "vi" | "zh"` (default `"en"`) for every name in the result;
- `terms: "pinyin" | "han" | "vi"` (English only, see below);
- the untouched original object in `raw`, so nothing is lost.

### Stems, branches and the Four Transformations: `terms`

The ten stems, twelve branches, their sexagenary pairs, the Four
Transformations and the two void markers have no English translation. With
`lang: "en"` the `terms` option says how to write them:

| `terms` | stem, branch | pair | transformation | voids |
|---|---|---|---|---|
| `"pinyin"` (default) | Geng, Wu | Geng Wu | Hua Lu, Hua Quan, Hua Ke, Hua Ji | Xun Kong, Jie Kong |
| `"han"` | 庚, 午 | 庚午 | 化禄, 化权, 化科, 化忌 | 旬空, 截空 |
| `"vi"` | Canh, Ngọ | Canh Ngọ | Hóa Lộc, Hóa Quyền, Hóa Khoa, Hóa Kỵ | Tuần, Triệt |

Pinyin is written without tone marks, as English BaZi and Zi Wei books do, so
戊 and 午 are both "Wu", 己 and 忌 both "Ji"; pick `"han"` when that matters.
`"vi"` gives the Sino-Vietnamese names printed in Vietnamese almanacs (the
output of version 0.2.0). Everything that has an English name (elements,
animals, solar terms, palaces, stars, pattern names, ten gods, stages) is
English whatever `terms` says, and English text never carries a Vietnamese
word (a test scans every test case for Vietnamese letters). `lang: "vi"` is
always Vietnamese and `lang: "zh"` always Chinese characters. Codes stay
stable whatever the language: `nameVi`, `code` (yearly stars), `id`
(festivals). Enumerated values are English codes in every `lang` as well:
`gender` (`male`, `female`), a Zi Wei star's `kind` and `group`, a yearly
star's `toYearPalace`, `toMinorLimit` and `toDecade` (`same-palace`,
`opposite`, `trine`, or `""`), BaZi `luck.direction` (`forward`, `backward`)
and `symbolicStars[].pillars` (`year`, `month`, `day`, `hour`), a solar term's
`kind` (`jie`, `qi`), and a festival's `calendar`, `group` and `scope`.

TypeScript and Python return the same keys (camelCase) and the command lines
print the same bytes. Every output below was produced by running the code.

## Lunar calendar: `@nhatnguyet/am-lich`

```ts
import { toLunar, toSolar, solarTerms, dayPillar, hourBranch } from "@nhatnguyet/am-lich";

toLunar("2027-02-06");
// {"year":2027,"month":1,"day":1,"leap":false,"solarDate":"2027-02-06","country":"VN","timeZone":7,
//  "yearName":"Ding Wei","monthName":"Ren Yin","dayName":"Bing Chen","zodiac":"Goat",
//  "solarTerm":"Start of Spring","lang":"en"}
toLunar("2027-02-06", { terms: "han" }).yearName;   // "丁未"

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
// {"label":"Ding Hai","stem":"Ding","branch":"Hai","stemIndex":3,"branchIndex":11,"stemElement":"Fire",
//  "branchElement":"Water","naYin":"Earth on the Roof","naYinElement":"Earth"}

hourBranch("23:30");
// {"index":0,"name":"Zi","animal":"Rat","range":"23:00-00:59"}
```

### Auspicious hours: `auspiciousHours`

The twelve double hours of a day, each marked auspicious (giờ hoàng đạo) or
inauspicious (giờ hắc đạo), with the spirit that presides over it, as
Vietnamese almanacs print them. Six hours of every day are auspicious; which
six depends only on the branch of the day. The spirits circle from Qing Long
(Thanh Long), which starts at an hour fixed by the day's branch pair; the
auspicious ones are numbers 0, 1, 4, 5, 7 and 10 of the cycle
(`AUSPICIOUS_SPIRITS`). Clock ranges are Vietnam time. `spirit` follows
`terms` like stems and branches: pinyin by default, `"han"` for characters,
`"vi"` for the Vietnamese name (the sixth spirit, 宝光 Bao Guang in the hour
tables of the books, is Kim Đường in Vietnamese almanacs).

```ts
import { auspiciousHours } from "@nhatnguyet/am-lich";

auspiciousHours("2027-02-06").day;   // "Bing Chen"
auspiciousHours("2027-02-06").hours[4];
// {"index":4,"branch":"Chen","animal":"Dragon","range":"07:00-08:59","auspicious":true,
//  "spirit":"Qing Long","spiritIndex":0}
auspiciousHours("2027-02-06").hours.filter((h) => h.auspicious).map((h) => h.range);
// ["03:00-04:59","07:00-08:59","09:00-10:59","15:00-16:59","17:00-18:59","21:00-22:59"]
auspiciousHours("2027-02-06", { lang: "zh" }).hours[9].spirit;   // "宝光"
```

The result is checked against the reference engine on 1,096 test vectors
(`ca-kiem/auspicious-hours.json`). Python `auspicious_hours(date, lang=...,
terms=...)`, CLI `nhatnguyet hours 2027-02-06`, MCP tool `auspicious_hours`.

`country` takes VN (default, UTC+7), CN, TW, HK, MO, SG, MY, ID, PH (UTC+8),
KR, JP (UTC+9); same rules, only the local time that decides the day differs.
`timeZone` overrides it. Vietnam's fourth zodiac animal is the Cat, everywhere
else the Rabbit. Also: `solarTermOn(date)`, `yearPillar(lunarYear)`,
`solarTermNames()`, `parseDate`, `parseTime`, `stemBranchName(label, lang, terms)`,
`termName(vi, lang, terms)`.

## Zi Wei Dou Shu: `@nhatnguyet/tu-vi`

```ts
import { castZiWei, decadeLuck, yearlyLuck, yearlyStars, findPatterns, ziWeiSvg } from "@nhatnguyet/tu-vi";

const chart = castZiWei({ date: "1990-09-19", time: "20:00", gender: "male", viewYear: 2026 });
chart.hour;     // {"index":10,"name":"Xu","animal":"Dog","range":"19:00-20:59"}
chart.lunar;    // {"year":1990,"month":8,"day":1,"leap":false}
chart.bureau;   // {"number":5,"name":"Earth Five"}
chart.yinYang;  // "Yang Male"
chart.palaces[chart.lifePalace];
// {"index":11,"branch":"Hai","stemBranch":"Ding Hai","name":"Life Palace","nameVi":"Mệnh","isLife":true,
//  "isBody":false,"tuan":true,"triet":false,"stars":[{"name":"Moon","nameVi":"Thái Âm","kind":"major",
//  "brightness":"Exalted","transformation":"Hua Ji"},{"name":"Left Assistant","nameVi":"Tả Phù","kind":"minor",
//  "group":"auspicious"}, ...]}

decadeLuck(chart)[3];
// {"order":4,"palaceIndex":2,"branch":"Yin","palace":"Property","fromAge":35,"toAge":44,
//  "fromYear":2024,"toYear":2033,"majorStars":["Military Song","Celestial Minister"]}
yearlyLuck(chart).decade;       // {"fromAge":35,"toAge":44,"palace":"Property"}
findPatterns(chart)[1];
// {"name":"Left and Right Assistants Meeting","nameVi":"Tả Hữu đồng hội","condition":"Left Assistant and
//  Right Assistant both gather in the triangle and opposite of the Life palace", ...,"nameHan":"左右同會"}
chart.toSvg({ theme: "dark" }); // "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 1000 10..."

const han = castZiWei({ date: "1990-09-19", time: "20:00", gender: "male", terms: "han" });
han.palaces[han.lifePalace].stemBranch;                // "丁亥"
han.palaces[han.lifePalace].stars[0].transformation;   // "化忌"
```

- `time` or `hourBranch` (0 = Tý ... 11 = Hợi) is required; a mismatch between the two throws.
- A birth from 23:00 to midnight keeps the date you entered (some texts move it
  to the next day; enter the next date to follow them). The chart says so in `notes`.
- Ages are East Asian ages (1 at birth); `fromYear`/`toYear` give the years.
- `palaces` are indexed by branch, 0 (Tý) to 11 (Hợi); `kind` is `major`,
  `minor`, `growth` (Tràng Sinh ring), `year-ring` (Thái Tuế ring) or `scholar` (Bác Sỹ ring).
- Minor stars carry `group`: `malefic` (the six malefic stars: Kình Dương, Đà
  La, Địa Không, Địa Kiếp, Hỏa Tinh, Linh Tinh), `auspicious` (the six
  auspicious stars plus Lộc Tồn and Thiên Mã) or `miscellaneous` (every other
  minor star). The raw chart keeps the core's codes in `nhom`; the mapping is
  `STAR_GROUP_EN`.
- `yearlyStars` codes are `yearly-taisui`, `yearly-lucun`, `yearly-qingyang`,
  `yearly-tuoluo`, `yearly-tianma` (`YEARLY_STAR_CODE_EN`; the raw `ma` keeps
  the core's codes).
- `schools` switches the rules where the books disagree (Fire and Bell stars,
  leap month, Geng transformations, Celestial Kitchen, Celestial Injury and
  Messenger); the default is unchanged. See [schools.md](schools.md):
  `castZiWei({ ..., schools: { fireBell: "quanshu", leapMonth: "split-at-15" } })`.
  The chart then carries `schools` (non-default options only) and one line in `notes`.
- `country` (as in `toLunar`: `"VN"` by default, `"CN"`, `"KR"`, `"JP"`...) or
  `timeZone` (hours) says whose lunar calendar turns the birth date into the
  lunar date the chart is built on. The calendars differ on some days: born
  1985-01-21, the Vietnamese calendar gives the 1st day of the 1st month of
  the Yi Chou year, `country: "CN"` the 1st day of the 12th month of the Jia
  Zi year, and so a different chart. A chart off UTC+7 carries `timeZone` and says so
  in `notes`; Python `cast_zi_wei(..., country="CN")` or `time_zone=8`, CLI
  `nhatnguyet ziwei 1985-01-21 10:00 male --country CN`.
- Pattern names are English names translated from the Chinese one, with the
  book's name in `nameHan` (`terms: "vi"` keeps the Sino-Vietnamese name);
  `lang: "zh"` gives 命宫, 太阴, 化忌, 土五局.
- Star names follow English Zi Wei usage; three differ from the Go engine's
  table: 陀羅 Spinning Top, 天相 Celestial Minister, 天鉞 Celestial Halberd
  (`STAR_EN_FIX`).
- `ziWeiSvg(chart, { theme, width, lang })` and `chart.toSvg()` draw the same
  SVG as `renderChartSvg(chart.raw)`. `toSvg` is not enumerable, so it never
  shows up in JSON.

### Lookups and horoscope

`castZiWei` returns the chart with lookup methods (not enumerable, so JSON is
unchanged); the same functions exist standalone and take a chart from
`castZiWei` or `lapLaSoTuVi`. Palaces are given by index (0 = Tý) or by name in
English, Vietnamese or Chinese (case-insensitive); stars by name in any of the
three.

```ts
import { castZiWei, horoscope, surroundingPalaces, flyingTransformations, fliesTo, selfTransformed, palaceIsEmpty } from "@nhatnguyet/tu-vi";

const chart = castZiWei({ date: "1990-09-19", time: "20:00", gender: "male" });
chart.palace("命宫").name;              // "Life Palace"
chart.star("Purple Star").palace.name;  // "Health"
surroundingPalaces(chart, "Life Palace");
// target "Life Palace", opposite "Travel", wealth "Wealth", career "Career"
flyingTransformations(chart, "Life Palace")[0];
// {"type":"Hua Lu","star":"Moon","palaceIndex":11,"palace":"Life Palace","self":true}
fliesTo(chart, "Life Palace", "Travel", "ji");  // false
selfTransformed(chart, "Life Palace");          // true
palaceIsEmpty(chart, "Spouse");                 // true (no major star)

const h = chart.horoscope({ date: "2026-11-19" });   // same as horoscope(chart, { date })
h.lunar;  // {"year":2026,"month":10,"day":11,"leap":false}
h.age;    // 37
h.decade;
// {"palaceIndex":2,"branch":"Yin","palace":"Property","stemBranch":"Wu Yin","palaceNames":[...],
//  "transformations":[{"type":"Hua Lu","star":"Greedy Wolf","palaceIndex":0,"palace":"Parents"}, ...],
//  "fromAge":35,"toAge":44}
h.minorLimit;  // {"palaceIndex":4,"branch":"Chen","palace":"Friends/Subordinates","stemBranch":"Geng Chen", ...}
h.year;
// {"palaceIndex":6,"branch":"Wu","palace":"Health","stemBranch":"Bing Wu","palaceNames":[...],
//  "transformations":[..., {"type":"Hua Ji","star":"Purity","palaceIndex":10,"palace":"Siblings"}],
//  "year":2026,"stars":[{"code":"yearly-taisui", ...}, {"code":"yearly-lucun","name":"Yearly Prosperity",
//  "byStem":true,"palaceIndex":5,"branch":"Si","palace":"Travel", ...}, ...]}
h.month;  // {"palaceIndex":6,"branch":"Wu","palace":"Health","stemBranch":"Ji Hai","palaceNames":[...],"transformations":[],"month":10}
h.year.palaceNames.slice(4, 8);  // ["Spouse","Siblings","Life Palace","Parents"]: index 6 (Ngọ) is the year's Life palace
h.day;    // null
h.hour;   // null
chart.horoscope({ date: "1991-03-01" }).decade;  // null: before the first ten-year period
```

- Every value comes from the engine: `decade` from the ten-year periods
  (`decadeLuck`), `minorLimit`, `year` and `month` from `yearlyLuck` (minor
  limit, year palace, the year's Four Transformations, the month palaces by the
  Đẩu Quân rule), `year.stars` from `yearlyStars`.
- `transformations` of the decade and the minor limit are those of the
  palace's stem, from the engine's Four Transformations table, the same table
  as the flying-star (phi tinh) paths of `flyingTransformations`, `fliesTo`,
  `selfTransformed`. `month.transformations` is empty: the engine has no
  monthly transformations.
- `palaceNames` (index 0 = Tý) renames the twelve palaces with the scope's
  palace as the Life palace, in the chart's own order.
- `decade` is null before the first period (the engine has no childhood-limit
  rule, 童限) and after the twelfth; `day` and `hour` are null (no daily or
  hourly limits in the engine).
- The date is read in the Vietnamese calendar (UTC+7), like the chart; a leap
  month counts as the month it repeats.
- Also: `palaceOf`, `starOf`, `flankingPalaces`, `palaceHas`,
  `palaceHasOneOf`, `palaceNotHave`, `withZiWeiMethods(chart)` (adds the
  methods to a chart from `localizeZiWei`). For iztro's method names
  (`astrolabe.horoscope()`, `palace.fliesTo()`...), see
  [Moving from iztro](chuyen-tu-iztro.md).

## BaZi: `@nhatnguyet/bat-tu`

```ts
import { castBaZi, minorLuck, baZiSvg } from "@nhatnguyet/bat-tu";

const bz = castBaZi({ date: "1990-09-19", time: "20:00", gender: "male" });
bz.pillars.day.label;     // "Ding Hai"
bz.dayMaster;             // {"stem":"Ding","element":"Fire","yinYang":"Yin"}
bz.luck.startAge;         // {"years":6,"months":4}
bz.luck.pillars[0].label; // "Bing Xu"
castBaZi({ date: "1990-09-19", time: "20:00", gender: "male", terms: "han" }).pillars.day.label; // "丁亥"
bz.toSvg({ name: "An" }); // same as renderBaziSvg(bz.raw, { hoTen: "An" })
```

`time` may be omitted (`null`): no hour pillar, the luck start is counted from
noon. Conventions: Vietnam time (UTC+7); the year turns at Start of Spring,
the month at each sectional term, the **day at 23:00** (`schools: { ziHour:
"split-at-midnight" }` keeps the entered date's day pillar from 23:00 to 24:00,
see [schools.md](schools.md)). Each pillar has
`tenGod`, `hiddenStems`, `naYin`, `stage`, `selfStage`, `stars`;
`minorLuck(bz, 2026)` gives the minor luck pillar of a year ("Ding Hai").

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
import { festivals, festivalsIcs } from "@nhatnguyet/le-hoi";

festivals(2027)[2];
// {"id":"tet-nguyen-dan","date":"2027-02-06","name":"Lunar New Year (Tết)",...,"calendar":"lunar",
//  "fixedDate":"1/1","level":"major","group":"holiday","scope":"national","publicHoliday":true, ...}
festivals(2027).length;   // 164
festivalsIcs(2027);       // iCalendar (RFC 5545) text of the same list
```

The dataset holds 206 festivals. `festivals(year)` returns the 164 that have a
fixed lunar or Gregorian date (the same 164 for every year from 1900 to
2100), sorted by date; the other 42 are dated by their organizers each year
and are listed in `DANH_SACH_LE_HOI` with their announced schedule in
`lich_cong_bo`. Vietnamese place and person names keep their diacritics in
English. `group` is `holiday`, `folk-religion` or `other` and `scope`
`national`, `regional`, `local`, `representative`, or `null` when the dataset has not classified the festival yet; English codes in
every `lang` (the dataset codes stay in `raw`).
`lang: "zh"` gives 越南春节.

Each festival also carries, with the same English keys in every language:
`provinces` (`[{ code, name }]`, the 34-province map of 2025; codes listed in
`PROVINCES`), `nationwide` (boolean), `ethnicGroups` (names from the official
list of 54, only where the description says whose festival it is), `venues`
(`[{ name, coordinates: { lat, lon } | null, sourceUrl: string | null }]`,
coordinates only with a source) and `daysBefore`, `daysAfter` (the customary
season around `date`). `festivalsIcs(year, { lang })` (Python
`festivals_ics(year, lang=...)`, CLI `nhatnguyet festivals 2027 --ics`) writes
the same list as iCalendar: all-day events over the season, stable UIDs
`<id>-<year>@nhatnguyet.org`, the dataset credit in X-WR-CALDESC.

## I Ching: `@nhatnguyet/iching`

```ts
import { hexagram, mutual, castCoins, najia, dailyHexagram, text } from "@nhatnguyet/iching";

hexagram(11).name;                         // "Peace"
hexagram("泰", { lang: "vi" }).name;       // "Địa Thiên Thái"
mutual("Peace").name;                      // "The Marrying Maiden"
const cast = castCoins({ lines: [9, 8, 7, 6, 7, 8] });
cast.moving;                               // [1, 4]
najia(cast, { date: "2026-11-19" }).lines[0].relation;   // "Offspring"
dailyHexagram("2026-11-19").hexagram.name;               // "Biting Through"
text(11).judgment.zh;                      // "泰：小往大來，吉亨。"
```

A hexagram is a King Wen number, six lines bottom first, or a name in English,
pinyin, Chinese or Vietnamese. Casting, the Six Lines (najia) chart, the Gua Qi
daily hexagram and the public domain Zhou Yi text with Legge's 1882
translation are described in [iching.md](iching.md). Python
`nhatnguyet.iching` (`hexagram`, `cast_coins`, `najia`, `daily_hexagram`), CLI
`nhatnguyet hexagram`, `cast`, `daily-hexagram`, MCP tools `hexagram`,
`six_lines_chart`, `daily_hexagram`.

## Feng shui: `@nhatnguyet/fengshui`

```ts
import { lifeGua, flyingStarChart, annualStars, lubanRuler } from "@nhatnguyet/fengshui";

lifeGua("1990-09-19", "female").number;                   // 8
lifeGua("1990-09-19", "female").directions[0].starName;   // "Sheng Qi"
flyingStarChart({ period: 9, facing: "wu" }).pattern;     // "double-sitting"
annualStars(2026).center;                                 // 1
lubanRuler(80).nearestAuspicious.map((x) => x.lengthCm);  // [69.7, 80.5]
```

These are the rules of traditional schools (Eight Mansions, Xuan Kong flying
stars of the Shen school, the Luban rulers), not verified effects. The life gua
turns at the lunar New Year, Vietnam time; where the schools disagree, see
[fengshui.md](fengshui.md). Python `nhatnguyet.fengshui` (`life_gua`,
`flying_star_chart`, `luban_ruler`...), CLI `nhatnguyet kua`, `flying-stars`,
`luban`, MCP tools `life_gua`, `flying_star_chart`, `luban_ruler`.

## Python

Same functions in snake_case, keyword arguments, same result keys:

```python
from nhatnguyet import cast_zi_wei, cast_bazi, to_lunar, numerology, festivals, decade_luck, zi_wei_svg

c = cast_zi_wei(date="1990-09-19", time="20:00", gender="male", lang="zh", view_year=2026)
c["palaces"][c["lifePalace"]]["name"]   # '命宫'
c["bureau"]                             # {'number': 5, 'name': '土五局'}
decade_luck(c)[3]["palace"]             # '田宅宫'
cast_bazi(date="1990-09-19", time="20:00", gender="male")["pillars"]["day"]["label"]   # 'Ding Hai'
cast_bazi(date="1990-09-19", time="20:00", gender="male", terms="vi")["pillars"]["day"]["label"]  # 'Đinh Hợi'
to_lunar("2027-02-06", country="KR")["month"]                                         # 12
numerology("Nguyen Van An", "1990-09-19", today="2026-11-19")["lifePath"]              # 11
festivals(2027, lang="zh")[2]["name"]                                                  # '越南春节'
svg = zi_wei_svg(c, theme="dark")
```

Lookups and horoscope (also importable from `nhatnguyet` and
`nhatnguyet.ziwei`) are in `nhatnguyet.tu_vi_chuc_nang` (same JSON as
TypeScript, byte for byte):

```python
from nhatnguyet import cast_zi_wei
from nhatnguyet.tu_vi_chuc_nang import horoscope, palace_of, surrounding_palaces, flying_transformations, flies_to

c = cast_zi_wei(date="1990-09-19", time="20:00", gender="male")
horoscope(c, date="2026-11-19")["year"]["palace"]            # 'Health'
surrounding_palaces(c, "Life Palace")["career"]["name"]       # 'Career'
flies_to(c, "Life Palace", "Travel", "ji")                    # False
```

Also `to_solar(year, month, day, leap=False, country=...)`, `solar_terms`,
`solar_term_on`, `day_pillar`, `year_pillar`, `hour_branch`, `auspicious_hours`,
`yearly_luck`, `yearly_stars`, `find_patterns`, `minor_luck`, `bazi_svg`,
`numerology_svg`, all importable from `nhatnguyet`. Dates also accept
`datetime.date` and `(year, month, day)` tuples.

The English-named modules mirror the npm packages: `nhatnguyet.lunar`,
`nhatnguyet.ziwei` (with the lookups and `horoscope`), `nhatnguyet.bazi`,
`nhatnguyet.numerology` and `nhatnguyet.festivals`, each with the English
functions plus everything of the Vietnamese-named module. The last two are
also callable, so `nhatnguyet.festivals(2027)` and
`nhatnguyet.numerology(...)` keep working whether the name refers to the
function or the module.

```python
>>> from nhatnguyet.lunar import auspicious_hours
>>> [h["branch"] for h in auspicious_hours("2027-02-06")["hours"] if h["auspicious"]]
['Yin', 'Chen', 'Si', 'Shen', 'You', 'Hai']
>>> from nhatnguyet.festivals import festivals
>>> [f["date"] for f in festivals(2027) if f["id"] == "tet-nguyen-dan"]
['2027-02-06']
```

## Command line

An excerpt: the block below shows only the first part of the output, the
12-palace grid and its legend.

```bash
npx @nhatnguyet/cli ziwei 1990-09-19 20:00 male --name "Nguyen Van An" --year 2026
python -m nhatnguyet ziwei 1990-09-19 20:00 male --name "Nguyen Van An" --year 2026
```

```text
┌────────────────────┬────────────────────┬────────────────────┬────────────────────┐
│ Travel             │ Health             │ Wealth · Body      │ Children           │
│ Xin Si             │ Ren Wu Jie Kong    │ Gui Wei Jie Kong   │ Jia Shen           │
│ Celestial Mechanism│ Purple Star Ex     │ Spinning Top,      │ Army Breaker We    │
│   Pr               │ Celestial Leader,  │ Celestial Void     │ Prosperity,        │
│ Celestial Talent,  │ Celestial Fortune, │ Nurture            │ Celestial Horse,   │
│ Bell Star,         │ Celestial Messen…  │                    │ Celestial Charm,   │
│ Shattering Star    │ Conception         │                    │ Celestial Physic…, │
│ Extinction         │                    │                    │ Solitary Star,     │
│                    │                    │                    │ Flowing Haze       │
│                    │                    │                    │ Growth             │
├────────────────────┼────────────────────┴────────────────────┼────────────────────┤
│ Friends/Subordinat…│                                         │ Spouse             │
│ Geng Chen          │                                         │ Yi You             │
│ Seven Killings We  │                                         │ Sword Ram,         │
│ Phoenix Pavilion,  │                                         │ Earthly Robber,    │
│ Celestial Punish…, │                                         │ Dipper Lord,       │
│ State Seal,        │                                         │ Red Phoenix        │
│ Releasing Spirit,  │                                         │ Bathing            │
│ Terrace Aide,      │                                         │                    │
│ Celestial Injury,  │          ZI WEI DOU SHU CHART           │                    │
│ Celestial Net,     │              Nguyen Van An              │                    │
│ Widow Star         │       Born 1990-09-19 20:00 (Xu)        │                    │
│ Tomb               │       Lunar 1990-08-01 · Geng Wu        │                    │
├────────────────────┤                Yang Male                ├────────────────────┤
│ Career             │           Bureau: Earth Five            │ Siblings           │
│ Ji Mao             │      Na yin: Earth by the Roadside      │ Bing Xu Xun Kong   │
│ Sun Pr Lu          │          Life: Hai · Body: Wei          │ Purity Ex          │
│ Celestial Beam Pr  │                                         │ Celestial Treasury │
│ Right Assistant,   │                                         │   Pr               │
│ Peach Blossom,     │                                         │ Dragon Pool,       │
│ Eight Seats,       │                                         │ Earthly Snare,     │
│ Celestial Nobili…, │                                         │ Canopy             │
│ Celestial Virtue,  │                                         │ Youth              │
│ Celestial Joy,     │                                         │                    │
│ Celestial Release  │                                         │                    │
│ Death              │                                         │                    │
├────────────────────┼────────────────────┬────────────────────┼────────────────────┤
│ Property           │ Fortune/Virtue     │ Parents            │ Life Palace        │
│ Wu Yin             │ Ji Chou            │ Wu Zi              │ Ding Hai Xun Kong  │
│ Military Song      │ Celestial Blessing │ Greedy Wolf We     │ Moon Ex Ji         │
│   Pr Quan          │   We Ke            │ Literary Glory,    │ Left Assistant,    │
│ Celestial Minister │ Giant Gate We      │ Celestial Weeping, │ Three Terraces,    │
│   Ex               │ Earthly Void,      │ Celestial Emptin…, │ Grace Light,       │
│ Celestial Halberd, │ Celestial Longev…, │ Patent of Honour   │ Celestial Offici…, │
│ Literary Melody,   │ Court Tally        │ Peak               │ Fire Star,         │
│ Earthly Release,   │ Decline            │                    │ Monthly Virtue,    │
│ Celestial Kitchen  │                    │                    │ Robbery Sha,       │
│ Illness            │                    │                    │ Annual Literary …  │
│                    │                    │                    │ Prime              │
└────────────────────┴────────────────────┴────────────────────┴────────────────────┘
Brightness: Ex exalted, Pr prosperous, Fa favorable, Ne neutral, We weak. Ages are East
Asian ages (1 at birth).
```

After the grid (cut from the excerpt above) it prints the viewing year, the
twelve ten-year periods, the patterns and the notes. Other commands:

```bash
nhatnguyet bazi 1990-09-19 20:00 male --lang zh
nhatnguyet bazi 1990-09-19 female --terms han  # birth time unknown; stems and branches as 庚午
nhatnguyet lunar 2027-02-06 --country CN
nhatnguyet solar 2023-02-01 --leap             # lunar to Gregorian: 2023-03-22
nhatnguyet terms 2027 --country KR
nhatnguyet hours 2027-02-06                    # auspicious and inauspicious double hours
nhatnguyet numerology "Nguyen Van An" 1990-09-19 --today 2026-11-19
nhatnguyet festivals 2027 --lang vi
nhatnguyet ziwei 1990-09-19 20:00 male --svg chart.svg --theme dark
nhatnguyet hexagram Peace
nhatnguyet cast --lines 987678 --date 2026-11-19  # a cast made by hand and its Six Lines chart
nhatnguyet kua 1990-09-19 female --svg compass.svg
nhatnguyet flying-stars --period 9 --facing wu
nhatnguyet luban 80
```

```text
$ nhatnguyet lunar 2027-02-06 --country CN
┌────────────┬─────────────────┐
│ Gregorian  │ 2027-02-06      │
│ Lunar      │ 2027-01-01      │
│ Year       │ Ding Wei · Goat │
│ Month      │ Ren Yin         │
│ Day        │ Bing Chen       │
│ Solar term │ Start of Spring │
│ Calendar   │ CN (UTC+8)      │
└────────────┴─────────────────┘

$ nhatnguyet solar 2023-02-01 --leap
┌────────────┬───────────────────┐
│ Gregorian  │ 2023-03-22        │
│ Lunar      │ 2023-02 (leap)-01 │
│ Year       │ Gui Mao · Cat     │
│ Month      │ Yi Mao            │
│ Day        │ Ji Mao            │
│ Solar term │ Vernal Equinox    │
│ Calendar   │ VN (UTC+7)        │
└────────────┴───────────────────┘

$ nhatnguyet hours 2027-02-06
AUSPICIOUS HOURS  2027-02-06 · Day Bing Chen
┌───────────────┬─────────────┬──────────────┬───────────┐
│ Zi (Rat)      │ 23:00-00:59 │ inauspicious │ Tian Lao  │
│ Chou (Ox)     │ 01:00-02:59 │ inauspicious │ Yuan Wu   │
│ Yin (Tiger)   │ 03:00-04:59 │ auspicious   │ Si Ming   │
│ Mao (Cat)     │ 05:00-06:59 │ inauspicious │ Gou Chen  │
│ Chen (Dragon) │ 07:00-08:59 │ auspicious   │ Qing Long │
│ Si (Snake)    │ 09:00-10:59 │ auspicious   │ Ming Tang │
│ Wu (Horse)    │ 11:00-12:59 │ inauspicious │ Tian Xing │
│ Wei (Goat)    │ 13:00-14:59 │ inauspicious │ Zhu Que   │
│ Shen (Monkey) │ 15:00-16:59 │ auspicious   │ Jin Kui   │
│ You (Rooster) │ 17:00-18:59 │ auspicious   │ Bao Guang │
│ Xu (Dog)      │ 19:00-20:59 │ inauspicious │ Bai Hu    │
│ Hai (Pig)     │ 21:00-22:59 │ auspicious   │ Yu Tang   │
└───────────────┴─────────────┴──────────────┴───────────┘
```

`--json` prints JSON (without `raw`), `--lang en|vi|zh` picks the language,
`--terms pinyin|han|vi` how English writes stems and branches, `--svg <file>`
also writes the chart as SVG (ziwei, bazi, numerology, hexagram, cast,
daily-hexagram, kua, flying-stars). The MCP tool names work as command aliases
too (`cast_ziwei`, `cast_bazi`, `lunar_convert`, `solar_terms`,
`auspicious_hours`, `six_lines_chart`, `daily_hexagram`, `life_gua`,
`flying_star_chart`, `luban_ruler`; the older `cast_zi_wei`, `zi_wei` as well).
Colors are used only on a terminal and are turned off by `NO_COLOR` or
`--no-color`.
