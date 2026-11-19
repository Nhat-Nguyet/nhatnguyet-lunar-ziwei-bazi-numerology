# @nhatnguyet/than-so-hoc

**Pythagorean numerology for JavaScript and TypeScript, with proper handling of
Vietnamese names.** Life path, expression (destiny), soul urge, personality,
attitude, birthday and maturity numbers, the Pythagorean birth chart grid,
pinnacles, challenges, and personal year, month and day numbers. Names with
diacritics (Nguyễn, Đặng, Phạm...) are folded correctly, with "Đ" read as "D".
Zero dependencies.

[![npm](https://img.shields.io/npm/v/@nhatnguyet/than-so-hoc.svg)](https://www.npmjs.com/package/@nhatnguyet/than-so-hoc)
[![license: MIT](https://img.shields.io/badge/license-MIT-1f6f6b.svg)](./LICENSE)
[![test cases: 600](https://img.shields.io/badge/test%20cases-600%20passing-2e7d32.svg)](https://nhatnguyet.org/en/ma-nguon-mo)

This is the TypeScript port of the numerology engine behind
[nhatnguyet.org](https://nhatnguyet.org/en/ma-nguon-mo) and the Nhat Nguyet
app, checked field by field against 600 reference profiles.

## Install

```bash
npm i @nhatnguyet/than-so-hoc
```

## Usage

```ts
import { numerology, chartToText } from "@nhatnguyet/than-so-hoc";

// diacritics are folded ("Nguyễn" and "Nguyen" give the same numbers); today sets the personal cycles
const n = numerology({ name: "Nguyen Van An", birthDate: "1990-09-19", today: "2026-11-19" });

n.lifePath;       // 11  (master numbers 11, 22, 33 are kept)
n.expression;     // 3
n.soulUrge;       // 1
n.personality;    // 11
n.personalYear;   // 2   (for 2026)
n.karmicDebt;     // 19
n.pinnacles;      // [{"number":1,"toAge":34},{"number":11,"toAge":43},{"number":3,"toAge":52},{"number":1,"toAge":null}]
n.challenges;     // [8,0,8,8]
n.grid;           // {"1":2,"2":0,"3":0,"4":0,"5":0,"6":0,"7":0,"8":0,"9":4}  (digits of the birth date)
n.labels.lifePath; // "Life Path"  ("生命灵数" with lang: "zh")

n.toSvg();        // the profile as a self-contained SVG string (below)
chartToText(n);   // the profile as Markdown, for a language model prompt
```

<img src="https://nhatnguyet.org/thu-vien-mo/than-so-hoc.svg" alt="Numerology profile drawn by toSvg()" width="520">

The result also has `attitude`, `birthday`, `maturity`, `personalMonth`,
`personalDay` and the original object in `raw`. All options:
[API docs](https://nhatnguyet.org/en/ma-nguon-mo/tai-lieu).

### Original API

The functions of the reference engine, with positional arguments and
Vietnamese field names:

```ts
import { tinhHoSoThanSoHocSau, soDuongDoi, soSuMenh } from "@nhatnguyet/than-so-hoc";

// tinhHoSoThanSoHocSau(fullName, day, month, year, viewYear, viewMonth, viewDay)
const p = tinhHoSoThanSoHocSau("Nguyễn Văn An", 1, 10, 1960, 2026, 1, 1);

p.soDuongDoi;     // 9   life path
p.soSuMenh;       // 3   expression (destiny)
p.soLinhHon;      // 1   soul urge
p.soNhanCach;     // 11  personality (master number kept)
p.soNamCaNhan;    // 3   personal year 2026
p.soThangCaNhan;  // 4   personal month, January 2026
p.soNgayCaNhan;   // 5   personal day, 1 January 2026
p.luoiPythago;    // { '1': 3, '2': 0, '3': 0, '4': 0, '5': 0, '6': 1, '7': 0, '8': 0, '9': 1 }
p.soDinhCao;      // { dinh1: 2, dinh2: 8, dinh3: 1, dinh4: 8,
                  //   tuoiKetThucDinh1: 27, tuoiKetThucDinh2: 36, tuoiKetThucDinh3: 45 }   pinnacles
p.soThachThuc;    // { thachThuc1: 0, thachThuc2: 6, thachThuc3: 6, thachThuc4: 6 }        challenges

soDuongDoi(1, 10, 1960);   // 9
soSuMenh("Nguyễn Văn An"); // 3
```

The profile also has `soThaiDo` (attitude), `soNgaySinh` (birthday) and
`soTruongThanh` (maturity). Functions never read the system clock: personal
month and day are computed for the view date you pass in.


## Conventions

- The life path adds every digit of the day, month and year, then reduces,
  keeping master numbers 11, 22 and 33. This is the modern popular convention;
  L. Dow Balliett's book (1917) reduces each part separately before adding, so
  it can give a different number.
- The soul urge counts only the vowels a, e, i, o, u; "y" counts as a consonant.
- Personal year, month and day numbers and challenge numbers do not keep master
  numbers.
- Numerology is a convention, not a validated science.

## Related packages

| Package | What it does |
|---|---|
| [`@nhatnguyet/am-lich`](https://www.npmjs.com/package/@nhatnguyet/am-lich) | Vietnamese and Chinese lunar calendar, solar terms |
| [`@nhatnguyet/tu-vi`](https://www.npmjs.com/package/@nhatnguyet/tu-vi) | Zi Wei Dou Shu (Purple Star Astrology) charts |
| [`@nhatnguyet/bat-tu`](https://www.npmjs.com/package/@nhatnguyet/bat-tu) | BaZi (Four Pillars of Destiny) charts |
| [`@nhatnguyet/le-hoi`](https://www.npmjs.com/package/@nhatnguyet/le-hoi) | 206 Vietnamese festivals, 164 with a fixed date computed for any year |
| [`nhatnguyet`](https://pypi.org/project/nhatnguyet/) (PyPI) | The same engine in Python |

A modern system, and Vietnamese names:
[nhatnguyet.org/en/blog/co-so-khoa-hoc-than-so-hoc](https://nhatnguyet.org/en/blog/co-so-khoa-hoc-than-so-hoc).
Docs and the shared test cases: <https://nhatnguyet.org/en/ma-nguon-mo>.

## License

Code: MIT. Please credit `Data: Nhat Nguyet (nhatnguyet.org)` when you show
results to users.

## Tiếng Việt

Thần số học theo bảng Pythagoras cho tên tiếng Việt (bỏ dấu, đ thành d): số
chủ đạo, sứ mệnh, linh hồn, nhân cách, thái độ, đỉnh cao, thử thách, năm,
tháng, ngày cá nhân, lưới Pythagoras. Khớp lõi tính của
[Nhật Nguyệt](https://nhatnguyet.org/ma-nguon-mo) trên 600 ca kiểm. Cài:
`npm i @nhatnguyet/than-so-hoc`.

## 中文

毕达哥拉斯数字命理（生命灵数等），正确处理带声调的越南语姓名；详见 <https://nhatnguyet.org/zh/ma-nguon-mo>。
