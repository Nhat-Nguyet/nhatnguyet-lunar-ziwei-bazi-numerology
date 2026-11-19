<h1 align="center">Nhat Nguyet</h1>

<p align="center">
  <b>The Vietnamese lunar calendar is not the Chinese one: popular libraries give the wrong Vietnamese lunar date on 2,724 days between 1900 and 2100.</b><br>
  Zi Wei Dou Shu, BaZi, numerology, festivals and auspicious hours on the right calendar, in JavaScript, Python and MCP · 3.6 million open charts whose readings quote the classics by book and chapter · results in English, Tiếng Việt, 中文 · 17,291 shared test vectors
</p>

<p align="center">
  <b>English</b> · <a href="./README.vi.md">Tiếng Việt</a> · <a href="./README.zh.md">中文</a> · <a href="./README.ja.md">日本語</a> · <a href="./README.ko.md">한국어</a> · <a href="./README.fr.md">Français</a> · <a href="./README.th.md">ไทย</a>
  <br>
  <a href="https://nhatnguyet.org/en/ma-nguon-mo/thu">Playground</a> ·
  <a href="https://nhatnguyet.org/en/ma-nguon-mo/tai-lieu">Docs</a> ·
  <a href="./docs/paper/paper.pdf">Paper</a> ·
  <a href="https://huggingface.co/nhatnguyet">Hugging Face</a> ·
  <a href="https://nhatnguyet.org/en/ma-nguon-mo">Project page</a>
</p>

<p align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="./assets/la-so-tu-vi-toi.svg">
    <img src="./assets/la-so-tu-vi.svg" alt="Zi Wei Dou Shu chart drawn by the library" width="720">
  </picture>
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/@nhatnguyet/ziwei"><img alt="npm" src="https://img.shields.io/npm/v/@nhatnguyet/ziwei.svg?label=npm"></a>
  <a href="https://pypi.org/project/nhatnguyet/"><img alt="PyPI" src="https://img.shields.io/pypi/v/nhatnguyet.svg"></a>
  <a href="./ca-kiem"><img alt="Test vectors: 17,291" src="https://img.shields.io/badge/test%20vectors-17%2C291-2e7d32.svg"></a>
  <a href="https://github.com/Nhat-Nguyet/nhatnguyet-lunar-ziwei-bazi-numerology/actions/workflows/kiem.yml"><img alt="Checks" src="https://github.com/Nhat-Nguyet/nhatnguyet-lunar-ziwei-bazi-numerology/actions/workflows/kiem.yml/badge.svg?branch=main"></a>
  <a href="./LICENSE"><img alt="Code: MIT" src="https://img.shields.io/badge/code-MIT-1f6f6b.svg"></a>
  <a href="./DATA-LICENSE"><img alt="Data: CC BY 4.0" src="https://img.shields.io/badge/data-CC%20BY%204.0-1f6f6b.svg"></a>
  <a href="https://doi.org/10.5281/zenodo.24358013"><img alt="DOI" src="https://zenodo.org/badge/DOI/10.5281/zenodo.24358013.svg"></a>
</p>

## Quick start

**JavaScript, TypeScript** (Node 18+, browsers)

```bash
npm i @nhatnguyet/ziwei @nhatnguyet/lunar
```

```js
import { writeFileSync } from "node:fs";
import { castZiWei } from "@nhatnguyet/ziwei";
import { toLunar } from "@nhatnguyet/lunar";

const chart = castZiWei({ name: "Nguyen Van An", date: "1990-09-19", time: "20:00", gender: "male" });
const life = chart.palaces[chart.lifePalace];
console.log(chart.bureau.name, "|", life.name, life.branch, "|", life.stars[0].name, life.stars[0].brightness);
writeFileSync("chart.svg", chart.toSvg());   // the chart image above

// Same day, two calendars: Tết in Vietnam, still the 12th month in China
const vn = toLunar("1985-01-21");
const cn = toLunar("1985-01-21", { country: "CN" });
console.log(vn.day, vn.month, vn.year, vn.yearName, "|", cn.day, cn.month, cn.year, cn.yearName);
```

```text
Earth Five | Life Palace Hai | Moon Exalted
1 1 1985 Yi Chou | 1 12 1984 Jia Zi
```

**Python** (3.9+, standard library only): same results, same SVG byte for byte.

```bash
pip install nhatnguyet
```

<!-- run: same-output -->
```python
from nhatnguyet import cast_zi_wei, to_lunar, zi_wei_svg

chart = cast_zi_wei(name="Nguyen Van An", date="1990-09-19", time="20:00", gender="male")
life = chart["palaces"][chart["lifePalace"]]
print(chart["bureau"]["name"], "|", life["name"], life["branch"], "|", life["stars"][0]["name"], life["stars"][0]["brightness"])
open("chart.svg", "w", encoding="utf-8").write(zi_wei_svg(chart))

vn = to_lunar("1985-01-21")
cn = to_lunar("1985-01-21", country="CN")
print(vn["day"], vn["month"], vn["year"], vn["yearName"], "|", cn["day"], cn["month"], cn["year"], cn["yearName"])
```

**Command line**: no install with `npx`, or `nhatnguyet ...` after `pip install nhatnguyet`.

<p align="center"><img src="./assets/cli-demo.svg" alt="Terminal recording: the Chinese lunar date of 21 January 1985, then a Zi Wei Dou Shu chart drawn as a grid" width="640"></p>

```bash
npx @nhatnguyet/cli ziwei 1990-09-19 20:00 male --year 2026
```

<details>
<summary>Output (the 12 palaces as a grid, then the year, ten-year periods, patterns)</summary>

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
│ Celestial Injury,  │                                         │                    │
│ Celestial Net,     │          ZI WEI DOU SHU CHART           │                    │
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

Year 2026 (Bing Wu)
  age 37 · Year palace: Health · Minor limit: Friends/Subordinates ·
  Decade: Property (35-44) · Hua Lu: Celestial Blessing → Fortune/Virtue ·
  Hua Quan: Celestial Mechanism → Travel · Hua Ke: Literary Glory → Parents ·
  Hua Ji: Purity → Siblings

Ten-year periods
    5-14  1994-2003  Life Palace (Hai)  Moon
   15-24  2004-2013  Parents (Zi)  Greedy Wolf
   25-34  2014-2023  Fortune/Virtue (Chou)  Celestial Blessing, Giant Gate
   35-44  2024-2033  Property (Yin)  Military Song, Celestial Minister
   45-54  2034-2043  Career (Mao)  Sun, Celestial Beam
   55-64  2044-2053  Friends/Subordinates (Chen)  Seven Killings
   65-74  2054-2063  Travel (Si)  Celestial Mechanism
   75-84  2064-2073  Health (Wu)  Purple Star
   85-94  2074-2083  Wealth (Wei)  -
   95-104 2084-2093  Children (Shen)  Army Breaker
  105-114 2094-2103  Spouse (You)  -
  115-124 2104-2113  Siblings (Xu)  Purity, Celestial Treasury

Patterns
  Mechanism, Moon, Blessing and Beam 機月同梁 · Life Palace
  Left and Right Assistants Meeting 左右同會 · Life Palace
  Sun Rising from Fusang 日出扶桑 · Career
  Moon Setting in the Hai Palace 月落亥宮 · Life Palace

Birth time 20:00 falls in the Xu double hour (19:00-20:59). The lunar date follows the
Vietnamese calendar (UTC+7).
```

</details>

Other commands: `bazi`, `lunar`, `solar`, `terms`, `numerology`, `festivals` (`--ics` for a calendar file), `hours`; `--lang vi|zh`, `--json`, `--svg chart.svg`, and the school options below. Full English API with every option: [docs/api-en.md](./docs/api-en.md).

## Contents

1. [Why trust it](#why-trust-it)
2. [Install](#install)
3. [Features](#features)
4. [Datasets](#datasets)
5. [For AI](#for-ai)
6. [Widgets](#widgets)
7. [Examples and docs](#examples-and-docs)
8. [Migrating from iztro](#migrating-from-iztro)
9. [FAQ](#faq)
10. [Contributing](#contributing)
11. [Citation and license](#citation-and-license)

## Why trust it

**The science is in the method, not in the predictions.** The calendar is
astronomy, checked against NASA and IMCCE over 1900 to 2100:

| Check | Result |
|---|---|
| New moons vs NASA (2,474) | 0.9 min late on average, 3.9 min at most |
| Lunar months rebuilt from NASA new moons and IMCCE solar terms | 2,459 of 2,461 match (the other two: new moon within a minute of midnight) |
| Solar terms vs IMCCE (4,824) | 0.27 min off on average, 0.9 min at most (rounded to the minute), every term on the right day |
| Vietnam (UTC+7) vs China (UTC+8), same rules | 2,814 days and 10 Tết dates differ |

- **Technical paper**: [Computing the Vietnamese lunisolar calendar](./docs/paper/paper.pdf)
  (PDF) gives the method, the error budget, the verification against NASA,
  IMCCE and JPL DE440, and an explanation for each day the Vietnamese and
  Chinese calendars differ. Every number in it is recomputed by
  `docs/paper/reproduce.sh`.
- **Shared test vectors**: [`ca-kiem/`](./ca-kiem) holds **17,291 core cases**
  (input `vao`, expected output `ra`) generated by the reference engine that
  runs [nhatnguyet.org](https://nhatnguyet.org): 14,936 calendar cases, 777 Zi
  Wei charts, 777 BaZi charts, 600 numerology profiles and 201 festival years,
  plus 432 cases for the school options and 1,096 days of auspicious hours
  (18,819 in all). TypeScript and Python pass all of them on every push.
- **Tết history**: [`history/`](./history/README.md) lists Tết for every year
  1900 to 2100 at UTC+7 and UTC+8, with the calendar Vietnam actually used and
  a source for each documented year.
- **Honest scope**: Zi Wei Dou Shu, BaZi and numerology are the rules of
  traditional schools, not validated science; do not use them for health,
  money or legal decisions. Where schools disagree, the library says which
  rule it follows and lets you switch ([school options](#school-options)).

### How it compares

[iztro](https://github.com/SylarLong/iztro) and
[lunar-javascript](https://github.com/6tail/lunar-javascript) are careful,
widely used libraries, and both are correct for what they implement: the
Chinese calendar on Beijing time (UTC+8). Vietnam uses the same rules on Hanoi
time (UTC+7). Comparing every day from 1900 to 2100
([doi-chieu/](./doi-chieu/README.md), reproducible with `node chay.mjs`):

| | Result |
|---|---:|
| Days whose lunar date differs from lunar-javascript | 2,724 of 73,414 |
| Years whose Tết differs from lunar-javascript | 9 of 201 |
| Years whose leap month differs from lunar-javascript | 6 of 201 |
| Days that still differ from lunar-javascript with `country: "CN"` | 150 (5 months) |
| Zi Wei charts (every day × 12 hours) whose Cục, Life palace or a major star differs from iztro | 38,752 of 880,968 (4.40%) |
| of which from the time zone (iztro uses Beijing time even with `vi-VN`) | 26,602 (3.02%) |
| of which from the leap-month rule (iztro `fixLeap`, an option) | 11,818 (1.34%) |
| of which neither | 332 (0.04%) |
| Solar terms vs IMCCE, largest difference: Nhat Nguyet / lunar-javascript | 0.9 min / 0.28 min |

**Two numbers, two questions.** 2,724 days and 9 Tết years compare Nhat
Nguyet (Vietnam, UTC+7) with lunar-javascript. The 2,814 days and 10 Tết years
in the table above compare the Nhat Nguyet engine with itself, at UTC+7 and at
UTC+8. They are not the same because `country: "CN"` is not identical to
lunar-javascript: 150 days still differ, one month each in 1914, 1916, 1920,
2057 and 2097. In 1914, 1916 and 1920 lunar-javascript deliberately corrects
dates before 1960 to match historical Chinese almanacs; in 2057 and 2097 the
new moon falls at exactly midnight in Beijing (16:00 UT), too close to call.

**The 332 charts that are neither** all fall in one month, the 30 days from 28
September 2057. Its new moon is at 16:00 UT: Nhat Nguyet puts it just before
Beijing midnight and starts the month on the 28th in both time zones;
lunar-javascript (and so iztro) puts it just after and starts on the 29th. It
is the same midnight tie as above, and no time zone or leap rule changes it.

Example: born 21 January 1985, Tỵ hour. iztro gives the 1st day of the 12th
month of Giáp Tý, Kim Tứ Cục, Life palace in Thân. Nhat Nguyet gives Tết, the
1st day of Ất Sửu, Thủy Nhị Cục, Life palace in Dậu. Pass `country: "CN"` and
Nhat Nguyet gives the Chinese calendar too.

## Install

Version 0.3.0. The JavaScript packages are ESM with TypeScript types and no
dependencies; the Python package uses the standard library only.

```bash
npm i @nhatnguyet/lunar @nhatnguyet/ziwei @nhatnguyet/bazi @nhatnguyet/numerology @nhatnguyet/festivals
pip install nhatnguyet
```

| Package | Also published as | What it does |
|---|---|---|
| [`@nhatnguyet/lunar`](./js/packages/am-lich) | `@nhatnguyet/am-lich` | Lunar and Gregorian conversion for Vietnam, China, Korea, Japan and 7 more regions; stems and branches; 24 solar terms to the minute; 28 lunar mansions; na yin; auspicious hours |
| [`@nhatnguyet/ziwei`](./js/packages/tu-vi) | `@nhatnguyet/tu-vi` | Zi Wei Dou Shu: 12 palaces, star brightness, Four Transformations, Tuần and Triệt, ten-year and yearly periods, transiting stars, patterns with the original classical line, school options; SVG; text for LLMs; iztro-compatible layer |
| [`@nhatnguyet/bazi`](./js/packages/bat-tu) | `@nhatnguyet/bat-tu` | BaZi: four pillars by solar term, hidden stems, Ten Gods, symbolic stars, luck pillars, minor luck; SVG |
| [`@nhatnguyet/numerology`](./js/packages/than-so-hoc) | `@nhatnguyet/than-so-hoc` | Pythagorean numerology (life path, expression, soul urge, pinnacles, challenges, personal year), Vietnamese names with diacritics; SVG |
| [`@nhatnguyet/festivals`](./js/packages/le-hoi) | `@nhatnguyet/le-hoi` | 206 Vietnamese festivals with their dates in any year, provinces, ethnic groups, venues; iCalendar export |
| [`@nhatnguyet/cli`](./js/packages/cli) | | Charts as terminal grids, JSON, SVG or iCalendar; the same commands as `nhatnguyet` in Python |
| [`@nhatnguyet/mcp`](./js/packages/mcp) | | MCP server for AI assistants |
| [`@nhatnguyet/widgets`](./js/packages/widgets) | | 5 web components |
| [`nhatnguyet`](./python) (PyPI) | | All of the above in one Python package, same results field by field |

The Vietnamese-named packages are the same code under their original names;
existing imports keep working.

## Features

Every library reproduces, field by field, the engine that runs
[nhatnguyet.org](https://nhatnguyet.org) and the Nhat Nguyet app. No network
calls. Results come in English (`lang: "en"`, default), Vietnamese (`"vi"`) or
Chinese (`"zh"`); in English, stems and branches are pinyin by default
(`terms: "han"` or `"vi"` for Chinese characters or Sino-Vietnamese).

<table>
  <tr>
    <td align="center" width="33%"><a href="./assets/la-so-tu-vi.svg"><picture><source media="(prefers-color-scheme: dark)" srcset="./assets/la-so-tu-vi-toi.svg"><img src="./assets/la-so-tu-vi.svg" alt="Zi Wei Dou Shu chart drawn by the library" width="260"></picture></a><br><sub>Zi Wei Dou Shu · <code>castZiWei().toSvg()</code></sub></td>
    <td align="center" width="33%"><a href="./assets/la-so-bat-tu.svg"><picture><source media="(prefers-color-scheme: dark)" srcset="./assets/la-so-bat-tu-toi.svg"><img src="./assets/la-so-bat-tu.svg" alt="BaZi chart drawn by the library" width="260"></picture></a><br><sub>BaZi · <code>castBaZi().toSvg()</code></sub></td>
    <td align="center" width="33%"><a href="./assets/than-so-hoc.svg"><picture><source media="(prefers-color-scheme: dark)" srcset="./assets/than-so-hoc-toi.svg"><img src="./assets/than-so-hoc.svg" alt="Numerology profile drawn by the library" width="260"></picture></a><br><sub>Numerology · <code>numerology().toSvg()</code></sub></td>
  </tr>
</table>

<p align="center"><sub>Every image is an SVG drawn by the library; click one to open it full size.</sub></p>

### Lunar calendar and auspicious hours

`toLunar`, `toSolar`, `solarTerms` and `auspiciousHours` in
`@nhatnguyet/lunar` (`to_lunar`, `to_solar`, `solar_terms`,
`auspicious_hours` in Python). The calendar is Vietnam's (UTC+7) unless you
pass `country`: China, Taiwan, Hong Kong, Macau, Singapore, Malaysia,
Indonesia, the Philippines (UTC+8); Korea, Japan (UTC+9).

`auspiciousHours` gives the twelve double hours of a day with the auspicious
(hoàng đạo) or inauspicious (hắc đạo) flag and the presiding spirit, as
Vietnamese almanacs print them (command line `nhatnguyet hours`, MCP tool
`auspicious_hours`):

```js
import { auspiciousHours } from "@nhatnguyet/lunar";

const day = auspiciousHours("2027-02-06");   // Tết 2027
console.log(day.day, "|", day.hours.filter((h) => h.auspicious).map((h) => `${h.branch} ${h.range} ${h.spirit}`).join(", "));
```

```text
Bing Chen | Yin 03:00-04:59 Si Ming, Chen 07:00-08:59 Qing Long, Si 09:00-10:59 Ming Tang, Shen 15:00-16:59 Jin Kui, You 17:00-18:59 Bao Guang, Hai 21:00-22:59 Yu Tang
```

<!-- run: same-output -->
```python
from nhatnguyet import auspicious_hours

day = auspicious_hours("2027-02-06")   # Tết 2027
print(day["day"], "|", ", ".join(f"{h['branch']} {h['range']} {h['spirit']}" for h in day["hours"] if h["auspicious"]))
```

### Zi Wei Dou Shu

`castZiWei` builds the full chart: Life and Body palaces, bureau, the 14 major
stars and 55 minor stars with brightness, the Four Transformations, Tuần and
Triệt, ten-year periods, a viewing year with its transiting stars, and the
patterns of the Zi Wei Dou Shu Quan Shu with the original classical line.
`chart.toSvg()` draws it; `chartToText` turns it into compact Markdown for a
language model. The iztro-compatible layer has the lookups and the horoscope:
`palace()`, `star()`, `surroundedPalaces()`, `horoscope()`, `fliesTo()`
([Migrating from iztro](#migrating-from-iztro)).

### School options

Where the books disagree, the library picks a default, names the book it
follows and lets you switch to the rule another named source gives
([docs/schools.md](./docs/schools.md)). Defaults never change, and every
option has its own test vectors.

| Option | Values (default first) | What changes |
|---|---|---|
| `fireBell` | `vietnamese`, `quanshu`, `swap-for-female`, `swap-for-yin-male-yang-female` | Fire Star and Bell Star |
| `leapMonth` | `whole`, `split-at-15`, `next-month` | the month used for a birth in a leap month |
| `transformations` | `vietnamese`, `quanshu`, `zhongzhou` | the Four Transformations of the Geng stem |
| `heavenlyKitchen` | `vietnamese`, `chinese` | Celestial Kitchen in a Gui year |
| `injuryMessenger` | `standard`, `zhongzhou` | Celestial Injury and Messenger |
| `ziHour` (BaZi) | `next-day-from-23`, `split-at-midnight` | the day pillar of a birth from 23:00 to 24:00 |

```js
import { castZiWei } from "@nhatnguyet/ziwei";

const opts = { date: "1990-09-19", time: "20:00", gender: "male" };
const where = (chart, star) => chart.palaces.find((p) => p.stars.some((s) => s.name === star)).branch;
const viet = castZiWei(opts);
const quanshu = castZiWei({ ...opts, schools: { fireBell: "quanshu" } });
console.log("Bell Star:", where(viet, "Bell Star"), "|", where(quanshu, "Bell Star"));
console.log(quanshu.notes.at(-1));
```

```text
Bell Star: Si | Chou
School options (not the default): Fire and Bell stars: both forward (Quan Shu).
```

<!-- run: same-output -->
```python
from nhatnguyet import cast_zi_wei

opts = dict(date="1990-09-19", time="20:00", gender="male")
where = lambda chart, star: next(p["branch"] for p in chart["palaces"] if any(s["name"] == star for s in p["stars"]))
viet = cast_zi_wei(**opts)
quanshu = cast_zi_wei(**opts, schools={"fire_bell": "quanshu"})
print("Bell Star:", where(viet, "Bell Star"), "|", where(quanshu, "Bell Star"))
print(quanshu["notes"][-1])
```

On the command line: `--fire-bell quanshu`, `--leap-month split-at-15`,
`--zi-hour split-at-midnight`... Compared with iztro 2.6.5 on 610 charts,
`{ fireBell: "quanshu", transformations: "quanshu", heavenlyKitchen: "chinese" }`
brings the Fire and Bell positions (484 differences), the Geng-year
transformations (126) and the Gui-year Celestial Kitchen (59) to 0.

### BaZi and numerology

`castBaZi` takes the year at Lập Xuân (Start of Spring) and the month at each
sectional term, to the minute; it gives hidden stems, Ten Gods, the twelve
stages, symbolic stars, luck pillars and minor luck. `numerology` follows the
Pythagorean method and folds Vietnamese diacritics ("Đ" counts as "D"),
keeping master numbers 11, 22 and 33.

### Festivals

`festivals(year)` in `@nhatnguyet/festivals` gives the 164 festivals with a
fixed lunar or Gregorian date for any year from 1900 to 2100, out of 206 in
the dataset (the other 42 are dated by their organizers each year). Each one
has its province on the 2025 map of 34 provinces, the ethnic group whose
festival it is where the description says so, and its venues, with
coordinates only where a source gives them. `group`, `scope` and `level` are
English codes in every language. `festivalsIcs(year)` writes an iCalendar
(RFC 5545) file with one all-day event per festival.

```js
import { writeFileSync } from "node:fs";
import { festivals, festivalsIcs } from "@nhatnguyet/festivals";

const f = festivals(2027).find((x) => x.id === "khai-hoi-chua-bai-dinh");
const venue = f.venues[0];
console.log(f.date, f.name, "|", f.provinces[0].name, "|", venue.name, venue.coordinates.lat, venue.coordinates.lon);
writeFileSync("vietnam-festivals-2027.ics", festivalsIcs(2027));
```

```text
2027-02-11 Bái Đính Pagoda Festival Opening | Ninh Bình | Bái Đính Pagoda 20.276944 105.862778
```

<!-- run: same-output -->
```python
from nhatnguyet import festivals
from nhatnguyet.en import festivals_ics

f = next(x for x in festivals(2027) if x["id"] == "khai-hoi-chua-bai-dinh")
venue = f["venues"][0]
print(f["date"], f["name"], "|", f["provinces"][0]["name"], "|", venue["name"], venue["coordinates"]["lat"], venue["coordinates"]["lon"])
open("vietnam-festivals-2027.ics", "w", encoding="utf-8", newline="").write(festivals_ics(2027))
```

The same file from the command line: `nhatnguyet festivals 2027 --ics > vn.ics`.

## Datasets

CC BY 4.0, usable for commercial products and AI training with credit.

| Dataset | Contents | Size |
|---|---|---:|
| [`nhatnguyet/ziwei-readings`](https://huggingface.co/datasets/nhatnguyet/ziwei-readings) | 1,761,936 Zi Wei charts with readings: every day 1900 to 2100 × 12 hours × 2 genders | 10.37 GB |
| [`nhatnguyet/bazi-readings`](https://huggingface.co/datasets/nhatnguyet/bazi-readings) | 1,761,936 BaZi charts with readings, same range | 1.56 GB |
| [`nhatnguyet/numerology-readings`](https://huggingface.co/datasets/nhatnguyet/numerology-readings) | 73,414 numerology profiles, one per birth date | 0.08 GB |
| [`nhatnguyet/ziwei-knowledge`](https://huggingface.co/datasets/nhatnguyet/ziwei-knowledge) | 2,787 knowledge units (a star in a palace, a pattern...) with the site's text in three languages and 885 classical passages | |
| [`nhatnguyet/bazi-knowledge`](https://huggingface.co/datasets/nhatnguyet/bazi-knowledge) | 973 units (day master by month, day pillar and hour, Ten Gods...), 1,589 classical passages | |
| [`nhatnguyet/numerology-knowledge`](https://huggingface.co/datasets/nhatnguyet/numerology-knowledge) | 143 units (core numbers, cycle numbers, life topics), 195 passages | |
| [`nhatnguyet/sach-co`](https://huggingface.co/datasets/nhatnguyet/sach-co) | 373 public domain classical texts (about 350 works), 72.7 million characters, full text | 147 MB text, 70 MB Parquet |
| [`nhatnguyet/classical-parallel`](https://huggingface.co/datasets/nhatnguyet/classical-parallel) | 1,328 aligned segments of the I Ching: Classical Chinese with public domain English (952) and French (376) translations | |
| [Terminology](./du-lieu/terminology/README.md) | 428 terms in Vietnamese, traditional and simplified Chinese, pinyin and English, every name the libraries output | |
| [AI evaluation set](./ai-eval/README.md) | 1,520 computed questions in English, Vietnamese and Chinese (lunar dates, Tết, pillars, charts), 626 of them (41%) hard cases | |
| [Tết 1900 to 2100](./history/README.md) | Tết at UTC+7 and UTC+8 for 201 years, with the calendar actually used and sources | |
| [33 calendar and culture datasets](https://nhatnguyet.org/en/du-lieu) | lunisolar calendar 1900 to 2100, solar terms, 64 hexagrams, 78 Tarot cards, 206 festivals, 456 ritual prayers... CSV, JSON, Parquet, with a [DOI](https://doi.org/10.5281/zenodo.23009396) | |

The three reading datasets total **3,597,286 charts, 12.02 GB compressed**, in
three parts: structured charts with reading IDs (`charts/`, 1.55 GB), full text
prebuilt per language (`assembled/<system>/<en|vi|zh>/`, 10.42 GB) and the text store
where each reading, classical quote and article is kept once (`store/`,
0.04 GB). Readings quote the classics with book and chapter. Files are one per
birth year. **Uncompressed they are very large** (the text repeats across
charts: one year of prebuilt Zi Wei text is about 2.7 GB per language), so
stream them or download a year at a time.

The knowledge datasets are the compact version: one row per unit, with the
same text ids as the readings, the public domain passages the reading engine
looks up for that unit, and rule ids. The classical texts: 306 in Classical
Chinese, 36 in English, 20 in French, 11 in Vietnamese; by topic, 192 on the I
Ching and divination, 24 beliefs and rites, 22 Vietnamese history and culture,
21 numerology, 20 the Three Arts, 19 calendar and date selection, 17 BaZi and
destiny, 16 feng shui, 14 Buddhism, 13 physiognomy, 7 astrology and Tarot, 6
Zi Wei, 2 other. 38 are OCR text and carry an `ocr` flag. Each text has a
`pd_basis` field saying why it is in the public domain. By the owner's choice,
`sach-co` names each text by a neutral code (`sc-0416`) rather than its title
and author; the knowledge datasets and the readings store give the title and
author of every passage they quote.

```python
from datasets import load_dataset

units = load_dataset("nhatnguyet/ziwei-knowledge", "major-star-in-palace", split="train")
row = units[0]
print(len(units), row["unit_id"])
print(row["classical"][0]["book_title_original"], "|", row["classical"][0]["classical_text"][:20])

books = load_dataset("nhatnguyet/sach-co", split="train")
print(len(books), sum(books["characters"]))
```

```text
2016 major-star-in-palace/zi-wei.life.zi
紫微斗数全书 | 子宫喜丁己庚生人贵格，壬癸生人不耐久。
373 72650969
```

## For AI

Language models should not work out lunar dates or star positions in their
heads. Four ways to give them the numbers:

- **MCP server**, runs locally, tools `lunar_convert`, `solar_terms`,
  `auspicious_hours`, `cast_ziwei`, `cast_bazi`, `numerology`, `festivals`,
  `render_chart_svg` (school options included):
  `claude mcp add nhatnguyet -- npx -y @nhatnguyet/mcp`. Setup for Claude
  Desktop, Cursor and VS Code: [js/packages/mcp](./js/packages/mcp/README.md).
- **Agent Skill** that tells an assistant to call the tools instead of
  guessing: [skills/](./skills/README.md).
- **`chartToText`** (`chart_to_text` in Python) turns a chart into compact
  Markdown for a prompt:

  ```js
  import { castZiWei, chartToText } from "@nhatnguyet/ziwei";

  const chart = castZiWei({ date: "1990-09-19", time: "20:00", gender: "male" });
  console.log(chartToText(chart, { detail: "summary" }));
  ```

  ```text
  # Zi Wei Dou Shu chart

  Computed data only, no interpretation.

  - Gender: male
  - Birth date (Gregorian): 1990-09-19 20:00
  - Birth hour: Xu (19:00-20:59)
  - Birth date (lunar): 1990-08-01
  - Year pillar: Geng Wu
  - Yin-yang: Yang Male
  - Bureau: Earth Five (5)
  ...
  ```

- **Data**: the [AI evaluation set](./ai-eval/README.md) measures how often a
  model gets these facts right with and without the tools
  (`ai-eval/score.py`); the [terminology](./du-lieu/terminology/README.md)
  maps every term between Vietnamese, Chinese and English; the
  [datasets](#datasets) serve training and retrieval.

## Widgets

<p align="center"><img src="./assets/widgets/web-components.png" alt="The five Nhat Nguyet web components" width="720"></p>

[`@nhatnguyet/widgets`](./js/packages/widgets) is 5 web components (today's
date, month grid, auspicious hours, Tết countdown, date converter) that run in
the reader's browser: open code in this repo, no server, no network calls,
light and dark themes, English, Vietnamese and Chinese.

```html
<script type="module" src="https://cdn.jsdelivr.net/npm/@nhatnguyet/widgets/dist/nn-widgets.js"></script>
<nn-lich-thang lang="en" theme="auto" country="VN"></nn-lich-thang>
```

`country` (`VN` default, `CN`, `KR`, `JP`...) switches to another country's
lunar calendar. Attributes and previews: [widgets/](./widgets/README.md).

nhatnguyet.org also hosts 14 iframe widgets (glossary, good dates, lottery
results...); they are a service of the website, not open code in this repo:
[nhatnguyet.org/widget](https://nhatnguyet.org/en/widget).

## Examples and docs

- **Playground**: [nhatnguyet.org/en/ma-nguon-mo/thu](https://nhatnguyet.org/en/ma-nguon-mo/thu), runs the packages in your browser.
- **API docs**: [nhatnguyet.org/en/ma-nguon-mo/tai-lieu](https://nhatnguyet.org/en/ma-nguon-mo/tai-lieu) and [docs/api-en.md](./docs/api-en.md).
- **Guides**: [build a Tử Vi chart with JavaScript](https://nhatnguyet.org/en/blog/lap-la-so-tu-vi-bang-javascript) · [lunar calendar and festivals for your app](https://nhatnguyet.org/en/blog/lich-am-le-hoi-cho-ung-dung) · [an AI assistant that cites the classics](https://nhatnguyet.org/en/blog/tro-ly-ai-trich-dan-sach-co) · [analyze chart data with Python](https://nhatnguyet.org/en/blog/phan-tich-du-lieu-la-so-bang-python).
- **Background**: [lunar calendar and solar terms](https://nhatnguyet.org/en/blog/co-so-khoa-hoc-am-lich-tiet-khi) ·
  [Zi Wei chart](https://nhatnguyet.org/en/blog/co-so-khoa-hoc-la-so-tu-vi) ·
  [BaZi](https://nhatnguyet.org/en/blog/co-so-khoa-hoc-bat-tu) ·
  [numerology](https://nhatnguyet.org/en/blog/co-so-khoa-hoc-than-so-hoc) ·
  [classical texts and readings](https://nhatnguyet.org/en/blog/co-so-khoa-hoc-sach-co-loi-luan) ·
  [how Nhat Nguyet checks its work](https://nhatnguyet.org/en/blog/co-so-khoa-hoc-kiem-chung).

[`examples/`](./examples/README.md) has quick tries (an HTML page with no
build step, Node, Python) and four templates to copy:

| Template | What it is |
|---|---|
| [`nextjs-lunar-calendar`](./examples/nextjs-lunar-calendar) | Next.js page (static export): month grid with lunar dates and solar terms, Tết countdown, Zi Wei chart from a form |
| [`telegram-bot`](./examples/telegram-bot) | grammY bot: `/today`, `/tet`, `/ziwei`, replies in English, Vietnamese or Chinese |
| [`google-sheets`](./examples/google-sheets) | `=LUNARDATE()`, `=SEXAGENARY()`, `=SOLARTERM()`, `=SOLARDATE()` in one `Code.gs` file |
| [`jupyter`](./examples/jupyter) | notebook: Tết, lunar months and leap months in Vietnam and China, 1900 to 2100, with charts |

## Migrating from iztro

`@nhatnguyet/ziwei/iztro` is **compatible** with iztro: `astro.bySolar` and
`astro.byLunar` take the same parameters and return the same JSON shape as
iztro's `FunctionalAstrolabe`, with its six display languages and its methods
(`palace()`, `star()`, `surroundedPalaces()`, `horoscope()`, `fliesTo()`,
`use()`...), computed on the Vietnamese calendar (`{ country: "CN" }` for
Beijing time).

```diff
- import { astro } from "iztro";
+ import { astro } from "@nhatnguyet/ziwei/iztro";
```

Measured against iztro on 2,006 horoscopes, the decade, age and year palaces
and the yearly star positions match; every remaining difference (the Geng-year
transformations, the leap-month rule, two months with a new moon at Beijing
midnight) is counted and explained. A few placements deliberately
follow the Vietnamese books: major star brightness on five levels (iztro has seven),
Tiangui, and Kui and Yue in Geng years. Not placed: five adjective stars found
only in Chinese texts, the Jiang Xing ring, and the decade and month moving
stars. Pass the school options above to follow iztro on Fire and Bell, the
Geng transformations and the Celestial Kitchen. Full list:
[docs/chuyen-tu-iztro.md](./docs/chuyen-tu-iztro.md).

## FAQ

<details>
<summary><b>Why is the Vietnamese lunar calendar different from the Chinese one?</b></summary>

Same rules, different clock. A month starts on the day of the new moon, and
the day is decided in local time. When a new moon falls between 16:00 and
17:00 UT it is before midnight in Hanoi and after midnight in Beijing, so the
month starts a day earlier in Vietnam. Tết 1985 is a whole month apart (21
January in Vietnam, 20 February in China) because the leap month falls in a
different year.
</details>

<details>
<summary><b>Which hour is the Tý hour, and what date does a birth at 23:30 use?</b></summary>

Tý runs 23:00 to 00:59. Zi Wei keeps the date you entered (some books move it
to the next day; enter the next date to follow them). BaZi turns the day pillar
at 23:00, or at midnight with `schools: { ziHour: "split-at-midnight" }`. Both
are stated in the chart's `notes`.
</details>

<details>
<summary><b>Does the BaZi month pillar follow the lunar month or the solar terms?</b></summary>

The solar terms: the year turns at Lập Xuân (Start of Spring), the month at
each sectional term. Using the lunar month instead gives a different month
pillar on about a quarter of all days (24.3% from 1900 to 2100).
</details>

<details>
<summary><b>Can I use the data to train an AI model?</b></summary>

Yes, including commercially, under CC BY 4.0. Credit "Data: Nhat Nguyet
(nhatnguyet.org)".
</details>

<details>
<summary><b>How are Vietnamese names handled in numerology?</b></summary>

Diacritics are folded ("Đ" counts as "D"), then the Pythagorean letter table
is applied. Master numbers 11, 22 and 33 are kept.
</details>

## Contributing

Bug reports with a source (a book and chapter, or astronomical data) are the
most useful; see [CONTRIBUTING.md](./CONTRIBUTING.md).

**Port challenge**: write the engine in another language (Go, Rust, Dart,
Swift, C#...) and pass all 17,291 test vectors in [`ca-kiem/`](./ca-kiem).
Read `vao`, compare with `ra`; the rules are in
[CONTRIBUTING.md](./CONTRIBUTING.md#port-challenge).

## Citation and license

| Part | License |
|---|---|
| Code | [MIT](./LICENSE) |
| Data, readings, test vectors | [CC BY 4.0](./DATA-LICENSE): commercial use and AI training allowed, credit required |
| Classical texts | Public domain originals; the digitization and cleaning are CC BY 4.0 |

Credit line: `Data: Nhat Nguyet (nhatnguyet.org)`, with a link where possible.
The Nhat Nguyet name and logo are not covered by these licenses. To cite the
software (the calendar method is in the [technical paper](./docs/paper/paper.pdf)):

```bibtex
@software{nhatnguyet_2026,
  author = {{Nhat Nguyet}},
  title  = {Nhat Nguyet: open source code and data for Zi Wei Dou Shu, BaZi and numerology},
  year   = {2026},
  url    = {https://nhatnguyet.org/en/ma-nguon-mo},
  doi    = {10.5281/zenodo.24358013}
}
```

Website: [nhatnguyet.org](https://nhatnguyet.org) · Email: lienhe@nhatnguyet.org

<p align="center"><sub>Data: Nhat Nguyet (nhatnguyet.org) · Code MIT · Data CC BY 4.0</sub></p>
