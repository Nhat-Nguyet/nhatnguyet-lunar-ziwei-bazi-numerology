# @nhatnguyet/lunar

The Vietnamese lunar calendar (Hanoi time, UTC+7) and the Chinese, Korean and
Japanese ones: lunar and Gregorian dates, stems and branches, the 24 solar
terms to the minute, auspicious hours. No dependencies, TypeScript types,
Node 18+ and browsers.

## Install

```bash
npm i @nhatnguyet/lunar
```

## Quick start

```js
import { toLunar, toSolar, solarTerms, auspiciousHours } from "@nhatnguyet/lunar";

// Same day, two calendars: Tết in Vietnam, still the 12th month in China
const vn = toLunar("1985-01-21");
const cn = toLunar("1985-01-21", { country: "CN" });
console.log(vn.day, vn.month, vn.year, vn.yearName, vn.zodiac, "|", cn.day, cn.month, cn.year, cn.yearName, cn.zodiac);
console.log(toSolar({ year: 2027, month: 1, day: 1 }).date);
const spring = solarTerms(2027)[2];
console.log(spring.name, spring.date, spring.time);
console.log(auspiciousHours("2027-02-06").hours.filter((h) => h.auspicious).map((h) => h.range).join(" "));
```

```text
1 1 1985 Yi Chou Ox | 1 12 1984 Jia Zi Rat
2027-02-06
Start of Spring 2027-02-04 08:46
03:00-04:59 07:00-08:59 09:00-10:59 15:00-16:59 17:00-18:59 21:00-22:59
```

## API

| Function | Returns |
|---|---|
| `toLunar(date, { country, lang, terms })` | lunar day, month, year and leap flag, names of the year, month and day, zodiac animal, solar term |
| `toSolar({ year, month, day, leap })` | the Gregorian date; a lunar date that does not exist throws `RangeError` |
| `solarTerms(year, { country })` | the 24 solar terms of a Gregorian year, date and time to the minute |
| `auspiciousHours(date)` | the twelve double hours of a day: range, auspicious or not, presiding spirit |
| `dayPillar(date)`, `yearPillar(lunarYear)`, `hourBranch(time)` | stem, branch, elements, na yin |

`country`: `VN` (default), `CN`, `TW`, `HK`, `MO`, `SG`, `MY`, `ID`, `PH`,
`KR`, `JP`. `lang`: `en` (default), `vi`, `zh`. Every option and the
full result shapes: [English API](https://github.com/Nhat-Nguyet/nhatnguyet-lunar-ziwei-bazi-numerology/blob/main/docs/api-en.md#lunar-calendar-nhatnguyetam-lich).

This package is the English name of
[`@nhatnguyet/am-lich`](https://www.npmjs.com/package/@nhatnguyet/am-lich), which
holds the implementation; both export the same functions. Results match the
engine behind [nhatnguyet.org](https://nhatnguyet.org/en/ma-nguon-mo) on every
shared test vector. Python: `pip install nhatnguyet`.

Data: Nhat Nguyet (nhatnguyet.org). MIT License.
