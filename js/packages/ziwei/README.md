# @nhatnguyet/ziwei

Zi Wei Dou Shu (Purple Star Astrology, 紫微斗数) charts on the Vietnamese or
Chinese calendar: twelve palaces, star brightness, Four Transformations,
ten-year and yearly periods, patterns with the original classical line, SVG,
and an iztro-compatible layer. No external dependencies, TypeScript types, Node 18+ and
browsers.

## Install

```bash
npm i @nhatnguyet/ziwei
```

## Quick start

```js
import { castZiWei, decadeLuck } from "@nhatnguyet/ziwei";

const chart = castZiWei({ date: "1990-09-19", time: "20:00", gender: "male" });
const life = chart.palaces[chart.lifePalace];
console.log(chart.bureau.name, "|", life.name, life.stemBranch, "|", life.stars.filter((s) => s.kind === "major").map((s) => `${s.name} ${s.brightness}`).join(", "));
const d = decadeLuck(chart)[3];
console.log(`${d.fromAge}-${d.toAge}`, d.palace, d.majorStars.join(", "));
console.log(chart.star("Purple Star").palace.name);
```

```text
Earth Five | Life Palace Ding Hai | Moon Exalted
35-44 Property Military Song, Celestial Minister
Health
```

## API

| Function | Returns |
|---|---|
| `castZiWei({ date, time, gender, viewYear, lang, terms, schools })` | the chart: palaces with their stars, bureau, Life and Body palaces, notes; `chart.toSvg()` draws it |
| `decadeLuck(chart)`, `yearlyLuck(chart)`, `yearlyStars(chart)` | ten-year periods, the viewed year, transiting stars |
| `findPatterns(chart)` | named patterns with the classical line in `nameHan` |
| `chart.palace()`, `chart.star()`, `chart.horoscope()`, `fliesTo()` | lookups and the horoscope of a date |
| `chartToText(chart)` | compact Markdown of the chart for a language model |
| `astro` from `@nhatnguyet/ziwei/iztro` | iztro's `bySolar` and `byLunar` on the Vietnamese calendar (`{ country: "CN" }` for Beijing time) |

Every option, the school options and the full result shapes:
[English API](https://github.com/Nhat-Nguyet/nhatnguyet-lunar-ziwei-bazi-numerology/blob/main/docs/api-en.md#zi-wei-dou-shu-nhatnguyettu-vi) ·
[school options](https://github.com/Nhat-Nguyet/nhatnguyet-lunar-ziwei-bazi-numerology/blob/main/docs/schools.md) · [moving from iztro](https://github.com/Nhat-Nguyet/nhatnguyet-lunar-ziwei-bazi-numerology/blob/main/docs/chuyen-tu-iztro.md).

This package is the English name of
[`@nhatnguyet/tu-vi`](https://www.npmjs.com/package/@nhatnguyet/tu-vi), which
holds the implementation; both export the same functions. Results match the
engine behind [nhatnguyet.org](https://nhatnguyet.org/en/ma-nguon-mo) on every
shared test vector. Python: `pip install nhatnguyet`.

Data: Nhat Nguyet (nhatnguyet.org). MIT License.
