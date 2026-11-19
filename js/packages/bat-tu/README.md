# @nhatnguyet/bat-tu

**BaZi (八字, Four Pillars of Destiny, Bát Tự, Tứ Trụ) chart calculator for
JavaScript and TypeScript.** Builds the four pillars from a birth date and
time, with the month pillar changing at the solar terms (not at the lunar
month), hidden stems, the Ten Gods (十神), the twelve life stages, nine
symbolic stars (神煞) with the variant readings of different books, the
conception pillar, the life palace, 10-year luck pillars and minor periods.
Names in Vietnamese, English and Chinese.

[![npm](https://img.shields.io/npm/v/@nhatnguyet/bat-tu.svg)](https://www.npmjs.com/package/@nhatnguyet/bat-tu)
[![license: MIT](https://img.shields.io/badge/license-MIT-1f6f6b.svg)](./LICENSE)
[![test cases: 777 charts](https://img.shields.io/badge/test%20cases-777%20charts-2e7d32.svg)](https://nhatnguyet.org/en/ma-nguon-mo)

- **Pillars by solar term, to the minute.** The year pillar changes at Start
  of Spring (立春) and the month pillar at the exact moment of each of the 12
  jié terms. Using the lunar month as the month pillar is wrong on about a
  quarter of all days (24.3% from 1900 to 2100).
- **Same answers as nhatnguyet.org.** This is the TypeScript port of the engine
  behind [nhatnguyet.org](https://nhatnguyet.org/en/ma-nguon-mo) and the Nhat
  Nguyet app, checked field by field against 777 reference charts (with and
  without a birth hour) from 1900 to 2100.
- Calendar, solar terms and nạp âm come from
  [`@nhatnguyet/am-lich`](https://www.npmjs.com/package/@nhatnguyet/am-lich),
  its only dependency. Runs in the browser and Node.

## Install

```bash
npm i @nhatnguyet/bat-tu
```

## Usage

```ts
import { castBaZi, minorLuck, chartToText } from "@nhatnguyet/bat-tu";

// clock time read as Vietnam time (UTC+7); "male" or "female"; lang "en" | "vi" | "zh"
const bz = castBaZi({ date: "1990-09-19", time: "20:00", gender: "male" });

["year", "month", "day", "hour"].map((k) => bz.pillars[k].label);
// [ 'Canh Ngọ', 'Ất Dậu', 'Đinh Hợi', 'Canh Tuất' ]
bz.dayMaster;              // {"stem":"Đinh","element":"Fire","yinYang":"Yin"}
bz.pillars.month;
// {"label":"Ất Dậu","stem":"Ất","branch":"Dậu","stemIndex":1,"branchIndex":9,"stemElement":"Wood",
//  "branchElement":"Metal","naYin":"Water in the Spring","naYinElement":"Water","tenGod":"Indirect Resource",
//  "hiddenStems":[{"stem":"Tân","element":"Metal","role":"main qi","tenGod":"Indirect Wealth"}],
//  "stage":"Growth","selfStage":"Extinction","stars":["Heavenly Noble","Literary Glory"]}
bz.luck.startAge;          // {"years":6,"months":4}
bz.luck.pillars[0].label;  // "Bính Tuất"  (1996 to 2005)
minorLuck(bz, 2026).label; // "Đinh Hợi"

bz.toSvg({ name: "Nguyen Van An" });   // the chart as a self-contained SVG string (below)
chartToText(bz);                       // the chart as Markdown, for a language model prompt

castBaZi({ date: "1990-09-19", gender: "female" }).pillars.hour;   // null (birth time unknown)
```

<img src="https://raw.githubusercontent.com/Nhat-Nguyet/nhatnguyet/main/assets/la-so-bat-tu.svg?sanitize=true" alt="BaZi chart drawn by toSvg()" width="520">

With `lang: "zh"` the month pillar's Ten God reads 偏印 and the day master
`{"stem":"丁","element":"火","yinYang":"阴"}`. The original object stays in
`bz.raw`. All options: [API docs](https://nhatnguyet.org/en/ma-nguon-mo/tai-lieu).

### Original API

The functions of the reference engine, with positional arguments and
Vietnamese field names:

```ts
import { lapLaSoBatTu, tinhTieuVanBatTu } from "@nhatnguyet/bat-tu";

// lapLaSoBatTu(day, month, year, hour, minute, gender)
// Born 19 September 1990 at 20:00 Vietnam time (UTC+7); gender "Nam" (male) or "Nữ" (female)
const chart = lapLaSoBatTu(19, 9, 1990, 20, 0, "Nam");

[chart.truNam, chart.truThang, chart.truNgay, chart.truGio].map((p) => p.label);
// [ 'Canh Ngọ', 'Ất Dậu', 'Đinh Hợi', 'Canh Tuất' ]   (year, month, day, hour: 庚午 乙酉 丁亥 庚戌)

chart.nhatChu;       // "Đinh"   (day master, 丁)
chart.nhatChuHanh;   // "Hỏa"    (Fire)
chart.tietKhi;       // "Bạch Lộ" (White Dew, the solar term in force)

const m = chart.truThang;   // month pillar
[m.thapThanCan, m.thapThanCanEn, m.thapThanCanZh];
// [ 'Thiên Ấn', 'Indirect Resource', '偏印' ]   <- Ten God of the month stem
m.tangCan;
// [ { can: 'Tân', canZh: '辛', hanh: 'Kim', hanhEn: 'Metal', hanhZh: '金', vaiTro: 'Bản khí',
//     vaiTroEn: 'main qi', vaiTroZh: '本气', thapThan: 'Thiên Tài', thapThanEn: 'Indirect Wealth',
//     thapThanZh: '偏财' } ]   <- hidden stem of Dậu

chart.daiVan.thuan;          // true  (luck pillars run forward)
chart.daiVan.tuoiKhoiNam;    // 6     (first luck pillar starts at 6 years ...
chart.daiVan.tuoiKhoiThang;  // 4     ... and 4 months)
chart.daiVan.cacVan.slice(0, 3).map((v) => `${v.label} ${v.namTu}-${v.namDen}`);
// [ 'Bính Tuất 1996-2005', 'Đinh Hợi 2006-2015', 'Mậu Tý 2016-2025' ]

chart.thanSat.filter((s) => s.viTri.length > 0).map((s) => s.ten);
// [ 'Thiên Ất Quý Nhân', 'Văn Xương', 'Lộc Thần', 'Hoa Cái', 'Kiếp Sát' ]
// viTri lists the pillars that carry the star (0 year, 1 month, 2 day, 3 hour);
// loiKhac, loiKhacEn, loiKhacZh describe how other books differ

tinhTieuVanBatTu(chart, 2026)?.label;   // "Đinh Hợi"  (minor period of 2026)

// Unknown birth hour: pass null, you get three pillars and no life palace
lapLaSoBatTu(19, 9, 1990, null, 0, "Nữ").coGioSinh;   // false
```

If the gender is not recognised, `lapLaSoBatTu` throws `LoiThieuGioiTinh`: the
luck pillars run forward or backward depending on gender, so the package does
not guess.

Other functions: `thapThanCuaCan`, `allThapThan`, `tangCanCuaChi`,
`truongSinhCuaCan`, `locCuaCan`, `duongNhanCuaCan`, `allNguyetLenh`,
`quanHeHaiCan`, `thienKhacDiaXung`, `lapTuTru`, `truTuChiSo`.


## Conventions

- Birth time is read as Vietnam time, UTC+7.
- The year pillar changes at Lập Xuân (Start of Spring); the month pillar
  changes at the twelve jié terms (solar longitude), not at the lunar month.
- The day pillar changes at 23:00, the start of the Rat hour (Tý); some schools
  keep the old day until midnight.
- Hidden stems follow the *Zi Ping Zhen Quan* (子平真诠) reading; the twelve
  life stages run forward for yang stems and backward for yin stems, Mậu
  follows Bính and Kỷ follows Đinh.
- The starting age of the luck pillars is the real age, counted to the minute
  from birth to the solar term, three days to one year. Minor periods start
  from the hour pillar, with East Asian age by the year pillar.
- Stem index 0 is Giáp, branch index 0 is Tý.

The package returns the CALCULATION and names in three languages; the long
explanatory text of the reference engine is not included. BaZi is a
traditional system, not a validated science. Do not use it for health,
financial or legal decisions.

## Related packages

| Package | What it does |
|---|---|
| [`@nhatnguyet/am-lich`](https://www.npmjs.com/package/@nhatnguyet/am-lich) | Vietnamese and Chinese lunar calendar, solar terms |
| [`@nhatnguyet/tu-vi`](https://www.npmjs.com/package/@nhatnguyet/tu-vi) | Zi Wei Dou Shu (Purple Star Astrology) charts |
| [`@nhatnguyet/than-so-hoc`](https://www.npmjs.com/package/@nhatnguyet/than-so-hoc) | Pythagorean numerology for Vietnamese names |
| [`@nhatnguyet/le-hoi`](https://www.npmjs.com/package/@nhatnguyet/le-hoi) | 200 Vietnamese festivals with dates for any year |
| [`nhatnguyet`](https://pypi.org/project/nhatnguyet/) (PyPI) | The same engine in Python |

Why the month pillar follows the solar terms:
[nhatnguyet.org/en/blog/co-so-khoa-hoc-bat-tu](https://nhatnguyet.org/en/blog/co-so-khoa-hoc-bat-tu).
Docs, open datasets and the shared test cases: <https://nhatnguyet.org/en/ma-nguon-mo>.

## License

Code: MIT. Please credit `Data: Nhat Nguyet (nhatnguyet.org)` when you show
results to users.

## Tiếng Việt

Lập lá số Bát Tự (Tứ Trụ) bằng JavaScript, TypeScript: bốn trụ theo tiết khí
tới phút, tàng can, thập thần, vòng trường sinh, chín thần sát kèm chỗ các sách
khác nhau, thai nguyên, mệnh cung, đại vận, tiểu vận. Khớp lõi tính của
[Nhật Nguyệt](https://nhatnguyet.org/ma-nguon-mo) trên 777 lá số kiểm. Cài:
`npm i @nhatnguyet/bat-tu`.

## 中文

八字排盘：按节气换月柱（精确到分钟）、藏干、十神、神煞、大运、小运，名称三语；详见 <https://nhatnguyet.org/zh/ma-nguon-mo>。
