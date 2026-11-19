# @nhatnguyet/tu-vi

**Zi Wei Dou Shu (紫微斗数, Purple Star Astrology, Tử Vi) chart calculator for
JavaScript and TypeScript.** Casts the full 12-palace chart from a birth date
and hour: element phase (cục), Life and Body palaces, the 14 major stars and
the minor stars, star brightness, the Four Transformations (四化, Tứ Hóa), Tuần
and Triệt, 10-year periods, yearly periods, transiting stars and the chart
patterns of the classic *Zi Wei Dou Shu Quan Shu* (紫微斗数全书), with the
original Chinese text. Star and palace names in Vietnamese, English and
Chinese.

[![npm](https://img.shields.io/npm/v/@nhatnguyet/tu-vi.svg)](https://www.npmjs.com/package/@nhatnguyet/tu-vi)
[![license: MIT](https://img.shields.io/badge/license-MIT-1f6f6b.svg)](./LICENSE)
[![test cases: 777 charts](https://img.shields.io/badge/test%20cases-777%20charts-2e7d32.svg)](https://nhatnguyet.org/en/ma-nguon-mo)

- **Same answers as nhatnguyet.org.** This is the TypeScript port of the engine
  behind [nhatnguyet.org](https://nhatnguyet.org/en/ma-nguon-mo) and the Nhat
  Nguyet app, checked field by field against 777 reference charts from 1900 to
  2100.
- **Lunar date on Vietnam time (UTC+7)**, from
  [`@nhatnguyet/am-lich`](https://www.npmjs.com/package/@nhatnguyet/am-lich),
  its only dependency. Runs in the browser and Node, no network calls.

## Install

```bash
npm i @nhatnguyet/tu-vi
```

## Usage

```ts
import { castZiWei, decadeLuck, yearlyLuck, findPatterns, chartToText } from "@nhatnguyet/tu-vi";

// clock time (the Tý hour runs 23:00 to 00:59), "male" or "female", lang "en" | "vi" | "zh"
const chart = castZiWei({ date: "1990-09-19", time: "20:00", gender: "male", viewYear: 2026 });

chart.hour;      // {"index":10,"name":"Tuất","animal":"Dog","range":"19:00-20:59"}
chart.lunar;     // {"year":1990,"month":8,"day":1,"leap":false}
chart.bureau;    // {"number":5,"name":"Earth Five"}
chart.yinYang;   // "Yang Male"

const life = chart.palaces[chart.lifePalace];
life.name;       // "Life Palace"
life.stars[0];   // {"name":"Moon","nameVi":"Thái Âm","kind":"major","brightness":"Exalted","transformation":"Hóa Kỵ"}

decadeLuck(chart)[3];
// {"order":4,"palaceIndex":2,"branch":"Dần","palace":"Property","fromAge":35,"toAge":44,
//  "fromYear":2024,"toYear":2033,"majorStars":["Military Song","Celestial General"]}
yearlyLuck(chart).decade;      // {"fromAge":35,"toAge":44,"palace":"Property"}
findPatterns(chart)[0].name;   // "Cơ Nguyệt Đồng Lương"

chart.toSvg();                  // the chart as a self-contained SVG string (below; { theme: "dark" } too)
chartToText(chart);             // the chart as Markdown, for a language model prompt
```

<img src="https://raw.githubusercontent.com/Nhat-Nguyet/nhatnguyet/main/assets/la-so-tu-vi.svg?sanitize=true" alt="Zi Wei chart drawn by chart.toSvg()" width="520">

With `lang: "zh"` the same chart reads 命宫, 太阴, 庙, 化忌, 土五局. `palaces` are
indexed by branch, 0 (Tý) to 11 (Hợi); `kind` is `major`, `minor`, `growth`,
`year-ring` or `scholar`; ages are East Asian ages (1 at birth). The original
object stays in `chart.raw`. All options: [API docs](https://nhatnguyet.org/en/ma-nguon-mo/tai-lieu).

**Moving from iztro?** `import { astro } from "@nhatnguyet/tu-vi/iztro"` returns
iztro's `FunctionalAstrolabe` data shape, computed on the Vietnamese calendar:
`astro.bySolar("1985-1-21", 5, "男", true, "vi-VN").fiveElementsClass` is
`"Thủy Nhị Cục"` (iztro gives `"Kim Tứ Cục"`, from the Chinese calendar).

### Original API

The functions of the reference engine, with positional arguments and
Vietnamese field names:

```ts
import { lapLaSoTuVi, nhanDienCachCuc, daiVan, tinhHanNam, tinhSaoLuu, saoZh } from "@nhatnguyet/tu-vi";

// lapLaSoTuVi(name, gender, day, month, year, hourBranch)
// gender is "Nam" (male) or "Nữ" (female); the birth hour is a branch index:
// 0 Tý (11 pm to 1 am), 1 Sửu (1 to 3 am) ... 10 Tuất (7 to 9 pm), 11 Hợi.
const chart = lapLaSoTuVi("", "Nam", 19, 9, 1990, 10);

chart.canChiNam;     // "Canh Ngọ"   (year of birth in the sexagenary cycle)
chart.ngaySinhAm;    // { day: 1, month: 8, year: 1990, leap: false }   (lunar birth date)
chart.tenCuc;        // "Thổ Ngũ Cục" (Earth 5 phase)

const life = chart.cung[chart.cungMenh];   // the Life palace (Mệnh)
life.tenCungEn;      // "Life Palace"
life.canChi;         // "Đinh Hợi"
life.sao
  .filter((s) => s.loai === "chinh-tinh")  // major stars only
  .map((s) => `${s.ten} (${s.tenEn}, ${saoZh(s.ten)}) ${s.mieuVuongEn} ${s.tuHoa ?? ""}`);
// [ 'Thái Âm (Moon, 太阴) Exalted Hóa Kỵ' ]

nhanDienCachCuc(chart).map((c) => c.ten);
// [ 'Cơ Nguyệt Đồng Lương', 'Tả Hữu đồng hội', 'Nhật xuất Phù Tang', 'Nguyệt lạc Hợi cung' ]
// each pattern also has tenZh, the conditions and a description in three languages,
// and chuVan, the original line of the Quan Shu, e.g. "月在亥守命是也，又名月朗天门。"

daiVan(chart)[0];
// { thu: 1, viTri: 11, chi: 'Hợi', chiZh: '亥', tenCung: 'Mệnh', tenCungEn: 'Life Palace',
//   tenCungZh: '命宫', tuTuoi: 5, denTuoi: 14, chinhTinh: 'Thái Âm', chinhTinhEn: 'Moon',
//   chinhTinhZh: '太阴' }   <- first 10-year period, ages 5 to 14

const y = tinhHanNam(chart, 2026);   // the year 2026
y.canChiNam;         // "Bính Ngọ"
y.tuoiMu;            // 37 (East Asian age)
y.luuNienTenCung;    // "Tật Ách"   (palace of the yearly period)
y.daiVanTenCung;     // "Điền Trạch" (palace of the current 10-year period)

tinhSaoLuu(chart, 2026)[0].tenEn;  // "Yearly Thái Tuế"
```

The gender must be `"Nam"` or `"Nữ"`; invalid input throws an `Error`.


## Conventions

- The lunar date is taken from the Gregorian date as entered, on Vietnam time
  (UTC+7), including births between 11 pm and midnight (some books move those
  to the next day).
- Stars are placed by the method most common in Vietnam (Tử Vi Đẩu Số Tân
  Biên). Four Transformations for the stem Canh: Thiên Đồng gets Hóa Khoa,
  Thái Âm gets Hóa Kỵ; the stems Tân and Nhâm have variant readings.
- Minor periods start from the triad of the birth year branch, forward for men,
  backward for women. Monthly periods follow Đẩu Quân. 10-year periods start at
  the Life palace at the East Asian age equal to the phase number.
- Not placed yet: Hỏa Tinh, Linh Tinh, Hồng Loan, Thiên Hình, yearly Văn
  Xương, yearly Văn Khúc.
- The package returns the calculation and names in three languages; it does not
  include per-star interpretations.

Zi Wei Dou Shu is a traditional system, not a validated science. Do not use it
for health, financial or legal decisions.

## Related packages

| Package | What it does |
|---|---|
| [`@nhatnguyet/am-lich`](https://www.npmjs.com/package/@nhatnguyet/am-lich) | Vietnamese and Chinese lunar calendar, solar terms |
| [`@nhatnguyet/bat-tu`](https://www.npmjs.com/package/@nhatnguyet/bat-tu) | BaZi (Four Pillars of Destiny) charts |
| [`@nhatnguyet/than-so-hoc`](https://www.npmjs.com/package/@nhatnguyet/than-so-hoc) | Pythagorean numerology for Vietnamese names |
| [`@nhatnguyet/le-hoi`](https://www.npmjs.com/package/@nhatnguyet/le-hoi) | 200 Vietnamese festivals with dates for any year |
| [`nhatnguyet`](https://pypi.org/project/nhatnguyet/) (PyPI) | The same engine in Python |

Step by step guide: [Build a Tử Vi chart with JavaScript](https://nhatnguyet.org/en/blog/lap-la-so-tu-vi-bang-javascript).
How a chart follows from the birth date and hour:
[nhatnguyet.org/en/blog/co-so-khoa-hoc-la-so-tu-vi](https://nhatnguyet.org/en/blog/co-so-khoa-hoc-la-so-tu-vi).
Docs, 3,597,286 interpreted charts as open data, and the shared test cases:
<https://nhatnguyet.org/en/ma-nguon-mo>.

## License

Code: MIT. Please credit `Data: Nhat Nguyet (nhatnguyet.org)` when you show
results to users.

## Tiếng Việt

Lập lá số Tử Vi Đẩu Số bằng JavaScript, TypeScript: cục, cung Mệnh, cung Thân,
14 chính tinh và phụ tinh, sáng tối, Tứ Hóa, Tuần Triệt, ba vòng Tràng Sinh,
Thái Tuế, Bác Sỹ; đại vận, hạn năm, sao lưu, cách cục của Tử Vi Đẩu Số Toàn
Thư kèm chú văn. Khớp lõi tính của [Nhật Nguyệt](https://nhatnguyet.org/ma-nguon-mo)
trên 777 lá số kiểm. Cài: `npm i @nhatnguyet/tu-vi`.

## 中文

紫微斗数排盘（安星、四化、大限、流年、《紫微斗数全书》格局及原文），星名三语；详见 <https://nhatnguyet.org/zh/ma-nguon-mo>。
