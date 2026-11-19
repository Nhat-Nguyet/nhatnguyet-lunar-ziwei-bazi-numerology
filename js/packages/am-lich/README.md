# @nhatnguyet/am-lich

**Vietnamese lunar calendar for JavaScript and TypeScript**, plus the Chinese,
Korean and Japanese lunisolar calendars: lunar and Gregorian date conversion,
the sexagenary cycle (can chi, 干支), the 24 solar terms to the minute, the 28
lunar mansions and nạp âm. Zero dependencies, runs in the browser and Node.

[![npm](https://img.shields.io/npm/v/@nhatnguyet/am-lich.svg)](https://www.npmjs.com/package/@nhatnguyet/am-lich)
[![license: MIT](https://img.shields.io/badge/license-MIT-1f6f6b.svg)](./LICENSE)
[![test cases: 14,936](https://img.shields.io/badge/test%20cases-14%2C936%20passing-2e7d32.svg)](https://nhatnguyet.org/en/ma-nguon-mo)

- **On Vietnam time (UTC+7) by default.** The Vietnamese and Chinese calendars
  are built with the same rules but in different time zones, so they disagree
  on 2,814 days between 1900 and 2100 and on Tết (Lunar New Year) in 10 years.
  Pass `country` to get the Chinese (UTC+8), Korean or Japanese (UTC+9)
  calendar instead.
- **Checked against astronomy.** Over 1900 to 2100, new moons are 0.9 minutes
  late on average against NASA (3.9 at most), and the 4,824 solar term moments
  are within 0.9 minutes of IMCCE (0.27 on average), every one on the right day.
- **Same answers as nhatnguyet.org.** This is the TypeScript port of the engine
  behind [nhatnguyet.org](https://nhatnguyet.org/en/ma-nguon-mo) and the Nhat
  Nguyet app. It reproduces the reference engine field by field in 14,936 test
  cases.

## Install

```bash
npm i @nhatnguyet/am-lich
```

## Usage

Dates as `"YYYY-MM-DD"`, `{ year, month, day }` or a `Date`; names in English
by default, `lang: "vi"` or `"zh"` for Vietnamese or Chinese. Stems and
branches have no English names: English writes them in pinyin ("Ding Wei"),
or `terms: "han"` (丁未) or `terms: "vi"` (Đinh Mùi).

```ts
import { toLunar, toSolar, solarTerms, solarTermOn, dayPillar, hourBranch } from "@nhatnguyet/am-lich";

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

solarTerms(2027, { country: "CN" })[2];
// {"index":21,"longitude":315,"name":"Start of Spring","nameVi":"Lập Xuân","kind":"jie",
//  "date":"2027-02-04","time":"09:46","timeZone":8}

solarTermOn("2026-11-19").current.name;   // "Start of Winter"

dayPillar("1990-09-19");
// {"label":"Ding Hai","stem":"Ding","branch":"Hai","stemIndex":3,"branchIndex":11,"stemElement":"Fire",
//  "branchElement":"Water","naYin":"Earth on the Roof","naYinElement":"Earth"}

hourBranch("23:30");
// {"index":0,"name":"Zi","animal":"Rat","range":"23:00-00:59"}
```

`country` takes `VN` (default, UTC+7); `CN`, `TW`, `HK`, `MO`, `SG`, `MY`,
`ID`, `PH` (UTC+8); `KR`, `JP` (UTC+9). A lunar date that does not exist (no
such leap month, day 30 of a 29-day month) makes `toSolar` throw a
`RangeError`. Vietnam's fourth zodiac animal is the Cat, everywhere else the
Rabbit. Full reference: [API docs](https://nhatnguyet.org/en/ma-nguon-mo/tai-lieu).

### Original API

The functions of the reference engine, with positional arguments
(day, month, year) and Vietnamese field names:

```ts
import {
  solarToLunar, lunarToSolar, yearCanChi, lunarMonthCanChi, dayCanChi,
  tietKhiCuaNgay, mocTietKhiTrongNam, saoCuaNgay, nguHanhNapAm, MUI_GIO_THEO_NUOC,
} from "@nhatnguyet/am-lich";

// Gregorian to lunar (day, month, year), Vietnam time
solarToLunar(17, 2, 2026);
// { day: 1, month: 1, year: 2026, leap: false }   <- Tết, first day of the Year of the Horse

// Lunar to Gregorian (day, month, year, isLeapMonth)
lunarToSolar(1, 1, 2026, false);
// { duong: { day: 17, month: 2, year: 2026 }, hopLe: true }   (duong: Gregorian date, hopLe: valid)

// Sexagenary cycle (can chi) of the year, lunar month and day
yearCanChi(2026).label;            // "Bính Ngọ"
lunarMonthCanChi(1, 2026).label;   // "Canh Dần"
dayCanChi(17, 2, 2026).label;      // "Nhâm Tuất"

// Solar terms
tietKhiCuaNgay(19, 11, 2026).tenEn;  // "Start of Winter"  (ten: "Lập Đông")
mocTietKhiTrongNam(2026)[0];
// { index: 19, kinhDo: 285, ten: 'Tiểu Hàn', tenEn: 'Minor Cold', yNghia: 'Bắt đầu rét đậm',
//   yNghiaEn: 'Deep cold sets in', yNghiaZh: '严寒来临', laTiet: true,
//   ngay: { day: 5, month: 1, year: 2026 }, gio: 15, phut: 23 }   <- 15:23 Vietnam time

// 28 lunar mansions and nạp âm
saoCuaNgay(21, 9, 2026).tenEn;     // "Heart"  (ten: "Tâm")
nguHanhNapAm(0, 0);                // { hanh: 'Kim', hanhEn: 'Metal', ten: 'Hải Trung Kim' }  (Giáp Tý)

// Same day, two countries: Vietnam celebrates Tết, China is still in the 12th month
solarToLunar(21, 1, 1985);                        // { day: 1, month: 1, year: 1985, leap: false }
solarToLunar(21, 1, 1985, MUI_GIO_THEO_NUOC.CN);  // { day: 1, month: 12, year: 1984, leap: false }
```

`MUI_GIO_THEO_NUOC` maps country codes to the time zone of their calendar:
`VN` 7; `CN`, `TW`, `HK`, `MO`, `SG`, `MY`, `ID`, `PH` 8; `KR`, `JP` 9.


## Conventions

- Calendars are computed on Vietnam time, UTC+7, for every year (the optional
  last argument `timeZone` changes it).
- The year's can chi is the LUNAR year: days before Tết belong to the previous
  lunar year.
- The month can chi is that of the lunar month (the first month is Dần, stems
  by the Ngũ Hổ Độn rule); a leap month takes the can chi of the regular month
  with the same number. The BaZi month pillar follows the solar terms instead,
  see [`@nhatnguyet/bat-tu`](https://www.npmjs.com/package/@nhatnguyet/bat-tu).
- The solar term of a day is taken at noon Vietnam time. Solar term moments are
  solved from the Sun's apparent longitude and rounded to the minute.
- Stem index 0 is Giáp, branch index 0 is Tý.
- Names come in Vietnamese with English (`tenEn`) and Chinese (`...Zh`) fields.

## Related packages

| Package | What it does |
|---|---|
| [`@nhatnguyet/tu-vi`](https://www.npmjs.com/package/@nhatnguyet/tu-vi) | Zi Wei Dou Shu (Purple Star Astrology) charts |
| [`@nhatnguyet/bat-tu`](https://www.npmjs.com/package/@nhatnguyet/bat-tu) | BaZi (Four Pillars of Destiny) charts |
| [`@nhatnguyet/than-so-hoc`](https://www.npmjs.com/package/@nhatnguyet/than-so-hoc) | Pythagorean numerology for Vietnamese names |
| [`@nhatnguyet/le-hoi`](https://www.npmjs.com/package/@nhatnguyet/le-hoi) | 206 Vietnamese festivals, 164 with a fixed date computed for any year |
| [`nhatnguyet`](https://pypi.org/project/nhatnguyet/) (PyPI) | The same engine in Python |

Docs, datasets and the shared test cases: <https://nhatnguyet.org/en/ma-nguon-mo>.
How the calendar is computed and how far off it is:
[nhatnguyet.org/en/blog/co-so-khoa-hoc-am-lich-tiet-khi](https://nhatnguyet.org/en/blog/co-so-khoa-hoc-am-lich-tiet-khi).

## Credits and license

Astronomical formulas after Jean Meeus, *Astronomical Algorithms*; solar
longitude for the solar terms from a truncated VSOP87D (Bretagnon and
Francou, IMCCE); ΔT after Espenak and Meeus (NASA, 2006). The month rules are the common rules of the
traditional lunisolar calendar (the Thời Hiến calendar), applied at UTC+7.
Code: MIT. Please credit `Data: Nhat Nguyet (nhatnguyet.org)` when you show
results to users.

## Tiếng Việt

Âm lịch Việt Nam (và Trung Quốc, Hàn Quốc, Nhật Bản) cho JavaScript,
TypeScript: đổi âm dương, can chi, 24 tiết khí tới phút, Nhị Thập Bát Tú, nạp
âm. Tính theo giờ Việt Nam UTC+7, đối chiếu NASA và IMCCE, khớp lõi tính của
[Nhật Nguyệt](https://nhatnguyet.org/ma-nguon-mo) trong 14.936 ca kiểm. Không
phụ thuộc gói nào. Cài: `npm i @nhatnguyet/am-lich`.

## 中文

越南农历（亦支持中国、韩国、日本农历）、干支、二十四节气精确到分钟，零依赖；详见 <https://nhatnguyet.org/zh/ma-nguon-mo>。
