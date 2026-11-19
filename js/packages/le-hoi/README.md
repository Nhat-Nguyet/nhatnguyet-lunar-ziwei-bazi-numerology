# @nhatnguyet/le-hoi

**Vietnamese festival and holiday calendar for JavaScript and TypeScript**, in
Vietnamese, English and Chinese: 200 festivals (Tết, the Hùng Kings'
Commemoration, Mid-Autumn, temple and pagoda festivals, festivals of ethnic
minorities, festivals with dates announced each year), with lunar to Gregorian
date conversion for any year from 1900 to 2100, on Vietnam time.

[![npm](https://img.shields.io/npm/v/@nhatnguyet/le-hoi.svg)](https://www.npmjs.com/package/@nhatnguyet/le-hoi)
[![code: MIT](https://img.shields.io/badge/code-MIT-1f6f6b.svg)](./LICENSE)
[![data: CC BY 4.0](https://img.shields.io/badge/data-CC%20BY%204.0-1f6f6b.svg)](https://nhatnguyet.org/en/du-lieu)

The data is the open dataset `le-hoi-viet-nam` (version 1.5.0) of
[Nhat Nguyet](https://nhatnguyet.org/en/ma-nguon-mo); the dates are checked
against the reference engine for every year from 1900 to 2100 (201 test cases).

## Install

```bash
npm i @nhatnguyet/le-hoi
```

## Usage

```ts
import { festivals } from "@nhatnguyet/le-hoi";

const list = festivals(2027);   // sorted by date; lang "en" (default), "vi" or "zh"
list.length;                    // 158
list.slice(0, 4).map((f) => [f.date, f.name]);
// [ [ '2027-01-01', "New Year's Day" ],
//   [ '2027-02-03', 'Founding Anniversary of the Communist Party of Vietnam' ],
//   [ '2027-02-06', 'Lunar New Year (Tết)' ],
//   [ '2027-02-09', 'Chùa Keo Spring Festival' ] ]

const tet = list[2];
[tet.calendar, tet.fixedDate, tet.level, tet.publicHoliday];   // [ 'lunar', '1/1', 'major', true ]
festivals(2027, { lang: "zh" })[2].name;   // "越南春节"
festivals(2027, { lang: "vi" })[2].name;   // "Tết Nguyên Đán"
```

Each item also has `id`, `description`, `group`, `scope` and the full dataset
row in `raw`.

### Original API

The functions of the reference engine and the dataset rows:

```ts
import { leHoiTrongNam, leHoiTheoNgay, ngayDuongCuaLe, DANH_SACH_LE_HOI } from "@nhatnguyet/le-hoi";

DANH_SACH_LE_HOI.length;   // 200

// Every festival with a computable date in 2027, in dataset order
const y = leHoiTrongNam(2027);
y.length;          // 158
y.slice(0, 3);
// [ { id: 'cho-vieng', ngay: '2027-02-13' },
//   { id: 'dai-le-hoi-yen-dieu-tri-cung', ngay: '2027-09-15' },
//   { id: 'gio-to-hung-vuong', ngay: '2027-04-16' } ]

// Festivals on a given Gregorian date (day, month, year)
leHoiTheoNgay(25, 9, 2026).map((l) => l.ten_en);
// [ 'Diêu Trì Cung Banquet Festival (Cao Đài Mid-Autumn Grand Ceremony)',
//   'Trần Thương Temple Traditional Festival',
//   'Mid-Autumn Festival' ]

// One festival, one year
const hung = DANH_SACH_LE_HOI.find((l) => l.id === "gio-to-hung-vuong");
[hung.ten, hung.ten_en, hung.ten_zh, hung.ngay_am];
// [ 'Giỗ Tổ Hùng Vương', "Hùng Kings' Commemoration Day", '雄王祭祖日', '10/3' ]   (10th day, 3rd lunar month)
ngayDuongCuaLe(hung, 2027);   // { day: 16, month: 4, year: 2027 }
```

Each festival carries the dataset columns: `ten`, `ten_en`, `ten_zh` (name),
`mo_ta`, `mo_ta_en`, `mo_ta_zh` (description), `loai_ngay` (`lunar`, `solar`
or `theo-nam`), `ngay_am`, `ngay_duong`, `nhom`, `muc_do`, `pham_vi`, `nguon`
and more. Column descriptions: <https://nhatnguyet.org/en/du-lieu>.


## Conventions

- Lunar festivals fall in the regular month, never the leap month. In a year
  where the lunar month has only 29 days, a festival on day 30 of that month
  has no Gregorian date.
- Festivals whose dates are announced each year by their organisers (42 of
  200) cannot be computed: see the `lich_cong_bo` column.
- Dates are computed on Vietnam time (UTC+7) with
  [`@nhatnguyet/am-lich`](https://www.npmjs.com/package/@nhatnguyet/am-lich).

## Related packages

| Package | What it does |
|---|---|
| [`@nhatnguyet/am-lich`](https://www.npmjs.com/package/@nhatnguyet/am-lich) | Vietnamese and Chinese lunar calendar, solar terms |
| [`@nhatnguyet/tu-vi`](https://www.npmjs.com/package/@nhatnguyet/tu-vi) | Zi Wei Dou Shu (Purple Star Astrology) charts |
| [`@nhatnguyet/bat-tu`](https://www.npmjs.com/package/@nhatnguyet/bat-tu) | BaZi (Four Pillars of Destiny) charts |
| [`@nhatnguyet/than-so-hoc`](https://www.npmjs.com/package/@nhatnguyet/than-so-hoc) | Pythagorean numerology for Vietnamese names |
| [`nhatnguyet`](https://pypi.org/project/nhatnguyet/) (PyPI) | The same engine in Python |

Guide: [Lunar calendar, festivals and death anniversaries for your app](https://nhatnguyet.org/en/blog/lich-am-le-hoi-cho-ung-dung).
Sources and how dates are verified:
[nhatnguyet.org/en/blog/co-so-khoa-hoc-le-hoi-van-cung](https://nhatnguyet.org/en/blog/co-so-khoa-hoc-le-hoi-van-cung).

## License

Code: MIT. Data: CC BY 4.0, credit `Data: Nhat Nguyet (nhatnguyet.org)`.

## Tiếng Việt

Lịch lễ hội Việt Nam ba thứ tiếng (200 lễ: Tết, giỗ Tổ, Trung thu, lễ hội đình
chùa, lễ của các dân tộc, lễ theo lịch công bố từng năm) và phép quy đổi ngày
âm sang dương từng năm 1900 tới 2100, theo giờ Việt Nam. Dữ liệu là bộ mở
`le-hoi-viet-nam` của [Nhật Nguyệt](https://nhatnguyet.org/du-lieu), giấy phép
CC BY 4.0. Cài: `npm i @nhatnguyet/le-hoi`.

## 中文

越南节庆日历（200 个节日，越、英、中三语），按越南时间换算任意年份的公历日期；详见 <https://nhatnguyet.org/zh/ma-nguon-mo>。
