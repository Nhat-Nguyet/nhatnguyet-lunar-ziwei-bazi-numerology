# @nhatnguyet/bazi

BaZi (Four Pillars of Destiny, 八字) by solar term, to the minute: pillars,
hidden stems, Ten Gods, symbolic stars, luck pillars, minor luck, SVG. No
dependencies, TypeScript types, Node 18+ and browsers.

## Install

```bash
npm i @nhatnguyet/bazi
```

## Quick start

```js
import { castBaZi, minorLuck } from "@nhatnguyet/bazi";

const bz = castBaZi({ date: "1990-09-19", time: "20:00", gender: "male" });
const { year, month, day, hour } = bz.pillars;
console.log(year.label, "|", month.label, "|", day.label, "|", hour.label);
console.log(bz.dayMaster.stem, bz.dayMaster.element, bz.dayMaster.yinYang);
console.log(bz.luck.startAge.years, bz.luck.pillars.slice(0, 3).map((p) => p.label).join(", "));
console.log(minorLuck(bz, 2026).label);
```

```text
Geng Wu | Yi You | Ding Hai | Geng Xu
Ding Fire Yin
6 Bing Xu, Ding Hai, Wu Zi
Ding Hai
```

## API

| Function | Returns |
|---|---|
| `castBaZi({ date, time, gender, lang, terms, schools })` | the four pillars with `tenGod`, `hiddenStems`, `naYin`, `stage`, `stars`; `dayMaster`; `luck` (start age and luck pillars); `bz.toSvg()` draws it |
| `minorLuck(bz, year)` | the minor luck pillar of a year |
| `baZiSvg(bz, { theme, width, lang, name })` | the SVG chart |

`time` may be `null` (no hour pillar). The year turns at Start of Spring, the
month at each sectional term, the day at 23:00 (`schools: { ziHour:
"split-at-midnight" }` to keep the entered date). Every option:
[English API](https://github.com/Nhat-Nguyet/nhatnguyet-lunar-ziwei-bazi-numerology/blob/main/docs/api-en.md#bazi-nhatnguyetbat-tu).

This package is the English name of
[`@nhatnguyet/bat-tu`](https://www.npmjs.com/package/@nhatnguyet/bat-tu), which
holds the implementation; both export the same functions. Results match the
engine behind [nhatnguyet.org](https://nhatnguyet.org/en/ma-nguon-mo) on every
shared test vector. Python: `pip install nhatnguyet`.

Data: Nhat Nguyet (nhatnguyet.org). MIT License.
