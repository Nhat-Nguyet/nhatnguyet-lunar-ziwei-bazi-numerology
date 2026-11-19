# Nhat Nguyet vs iztro and lunar-javascript

A reproducible, day-by-day comparison of the Nhat Nguyet libraries with the two
most used JavaScript libraries in this space:

- [`lunar-javascript`](https://github.com/6tail/lunar-javascript) by 6tail, the
  reference Chinese lunisolar calendar in JavaScript;
- [`iztro`](https://github.com/SylarLong/iztro), the most used Zi Wei Dou Shu
  (Tử Vi) library, which computes its calendar with `lunar-typescript` (also by
  6tail).

Both are careful, well maintained libraries, and both are correct for what they
implement: the **Chinese** calendar, computed for Beijing time (UTC+8). The
Vietnamese lunar calendar uses the same rules computed for Hanoi time (UTC+7).
On most days the two calendars agree. This page counts the days where they do
not, and what that does to a Tử Vi chart. Different is not wrong: the question
is only which calendar the user lives by.

Every number below comes from `ket-qua.json`, written by `node chay.mjs`.
Range: every day from 1900-01-01 to 2100-12-31 (73,414 days).

## Versions

| Library | Version |
|---|---|
| Nhat Nguyet (`@nhatnguyet/am-lich`, `@nhatnguyet/tu-vi`, from source) | commit `e2e5027722c1`, engine 2.2.0 |
| iztro | 2.6.5 (with lunar-typescript 1.8.7, lunar-lite 0.2.9) |
| lunar-javascript | 1.7.8 |
| Node.js | 24.22 |

## Summary

| Measure | Result |
|---|---:|
| Days whose lunar date differs (Nhat Nguyet UTC+7 vs lunar-javascript) | **2,724 of 73,414 (3.71%)**, in 83 runs |
| of which the lunar day number differs | 2,340 |
| of which the lunar month or leap flag differs | 462 |
| of which the lunar year differs | 38 |
| Same comparison with Nhat Nguyet switched to UTC+8 | 150 days (5 months, see below) |
| lunar-typescript (iztro's engine) vs lunar-javascript | 0 days |
| Years whose Tết (lunar new year) differs | **9 of 201** |
| Years whose leap month differs | **6 of 201** (0 at UTC+8) |
| Tử Vi charts compared (every day × 12 hours) | 880,968 |
| Charts whose Cục, Mệnh palace or any of the 14 major stars differ | **38,752 (4.40%)** |
| of which explained by the time zone | 26,602 (3.02%) |
| of which explained by the leap-month rule (iztro `fixLeap`) | 11,818 (1.34%) |
| other (one UTC+8 edge-case month, from 2057-09-28) | 332 (0.04%) |

## 1. Lunar calendar

Tết dates that differ (Nhat Nguyet UTC+7 / lunar-javascript):

| Lunar year | Nhat Nguyet | lunar-javascript | New moon (NASA, UT) |
|---|---|---|---|
| 1903 | 1903-01-28 | 1903-01-29 | 1903-01-28 16:39 |
| 1935 | 1935-02-03 | 1935-02-04 | 1935-02-03 16:27 |
| 1965 | 1965-02-01 | 1965-02-02 | 1965-02-01 16:36 |
| 1968 | 1968-01-29 | 1968-01-30 | 1968-01-29 16:29 |
| 1969 | 1969-02-16 | 1969-02-17 | 1969-02-16 16:25 |
| 1985 | 1985-01-21 | 1985-02-20 | leap month placed differently, see below |
| 2007 | 2007-02-17 | 2007-02-18 | 2007-02-17 16:14 |
| 2030 | 2030-02-02 | 2030-02-03 | 2030-02-02 16:07 |
| 2053 | 2053-02-18 | 2053-02-19 | 2053-02-18 16:31 |

The pattern is always the same: the new moon falls between 16:00 and 17:00 UT,
that is before midnight in Hanoi and after midnight in Beijing, so the month
starts one day earlier in Vietnam.

Leap months that differ (number of the leap month; 0 is none):

| Lunar year | Nhat Nguyet UTC+7 | lunar-javascript |
|---|---:|---:|
| 1917 | 3 | 2 |
| 1922 | 6 | 5 |
| 1938 | 8 | 7 |
| 1984 | 0 | 10 |
| 1985 | 2 | 0 |
| 1987 | 7 | 6 |

1984 and 1985 are the largest case: at UTC+7 the leap month falls in 1985
instead of 1984, and Vietnamese Tết 1985 is a whole month earlier than Chinese
New Year (21 January vs 20 February). `khac-ngay-am.csv` lists every day that
differs.

**History.** North Vietnam computed its almanac for UTC+7 from 1968 (which is
why Tết Mậu Thân 1968 fell on 29 January in the North and 30 January in the
South); the South kept UTC+8 until 1975. Nhat Nguyet applies UTC+7 to every
year, so for earlier years (and the South before 1975) a printed Vietnamese
almanac may agree with lunar-javascript instead, for example Tết 1965 and 1969.

**Same time zone, still different: 5 months.** With Nhat Nguyet set to UTC+8
(`MUI_GIO_THEO_NUOC.CN`), 150 days still differ: one month each in 1914, 1916,
1920, 2057 and 2097. In all five the NASA new moon is between 16:00 and 16:05 UT,
within five minutes of Beijing midnight.

- 1914, 1916, 1920: lunar-javascript starts the month one day earlier than a
  plain UTC+8 computation. Before 1960 (JD 2436935) its `ShouXingUtil.calcShuo`
  applies a correction string (`SB`) so that it reproduces historical Chinese
  almanacs; these months fall in that range. This is a deliberate feature on
  their side.
- 2057, 2097: the new moon is at 16:00 UT, exactly midnight in Beijing, inside
  the error of any short series. Nhat Nguyet does not claim minute precision at
  UTC+8; at UTC+7 both new moons are at 23:00 and unambiguous.

## 2. Solar terms against IMCCE

4,824 solar terms (24 per year, 1900 to 2100) compared with the apparent
geocentric solar longitude from IMCCE Miriade (Paris Observatory, INPOP),
interpolated to each 15° crossing (`du-lieu/imcce-tiet-khi-1900-2100.tsv`).
Error is library minus IMCCE, in minutes.

| | mean | mean abs | median abs | P99 abs | max abs | > 1 min | > 2 min | civil day differs |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| Nhat Nguyet | -0.04 | 0.27 | 0.25 | 0.67 | 0.90 | 0 | 0 | 0 (at UTC+7) |
| lunar-javascript | +0.07 | 0.07 | 0.02 | 0.27 | 0.28 | 0 | 0 | 0 (at UTC+8) |
| lunar-typescript (iztro) | +0.07 | 0.07 | 0.02 | 0.27 | 0.28 | 0 | 0 | 0 (at UTC+8) |

All three are within a minute of IMCCE, and every term falls on the same civil
day as IMCCE's. lunar-javascript is closer (within 17 seconds, consistent with
the ~16 s discussed in lunar-javascript issue #56) because it keeps the second;
Nhat Nguyet solves each instant from a truncated VSOP87D series and then rounds
it to the minute, which accounts for most of its 0.27-minute mean difference.
Before engine 2.0.1, Nhat Nguyet used a shorter Meeus series that ran about 3
minutes early on average (14.5 minutes at most, 10 terms on the neighbouring
day). The lunar months do not depend on this: Nhat Nguyet's month boundaries
are checked separately against NASA new moons and a calendar rebuilt from NASA
and IMCCE in its core test suite.

## 3. Tử Vi charts

Each chart is built twice, by `iztro.astro.bySolar(date, hour, "男", true, "zh-CN")`
and by `@nhatnguyet/tu-vi` `lapLaSoTuVi`, for every day and each of the 12 hours
(Tý to Hợi), and compared on: lunar date, year stem-branch, Cục (five-element
bureau), Mệnh (life palace) and the palace of each of the 14 major stars.

When a field differs, it is classified as:

- **time zone**: rebuilding the Nhat Nguyet chart from the UTC+8 lunar date
  (same Nhat Nguyet rules) gives iztro's value;
- **leap-month rule**: still different at UTC+8, but equal to iztro with
  `fixLeap: false`;
- **other**: neither.

| Field | Differ | % of charts | Time zone | Leap-month rule | Other |
|---|---:|---:|---:|---:|---:|
| Lunar date | 32,688 | 3.71% | 32,328 | n/a | 360 |
| Year stem-branch | 456 | 0.05% | 456 | n/a | 0 |
| Cục | 7,484 | 0.85% | 1,574 | 5,904 | 6 |
| Mệnh palace | 14,664 | 1.66% | 2,844 | 11,808 | 12 |
| 14 major stars (any) | 31,510 | 3.58% | 25,801 | 5,380 | 329 |
| **Chart (Cục, Mệnh or stars)** | **38,752** | **4.40%** | **26,602** | **11,818** | **332** |

**Leap-month rule.** iztro's `fixLeap` (default `true`) counts days 1 to 15 of a
leap month as the previous month and days 16 onwards as the next month
(`lib/utils/index.js`, `fixLunarMonthIndex`; documented on `astro.bySolar`:
"闰月的前半个月算上个月，后半个月算下个月"). Nhat Nguyet counts the whole leap
month as the month it repeats (`lapLaSoTuVi` places Mệnh from the lunar month
number). Both conventions are used by Tử Vi practitioners; iztro users who
prefer the second can pass `fixLeap: false`. The "other" charts all fall in one
of the five UTC+8 edge-case months of section 1: the 30 days from 2057-09-28,
whose new moon is at 16:00 UT. Nhat Nguyet starts that month on the 28th at
both UTC+7 and UTC+8, lunar-javascript (and so iztro) on the 29th, so neither
the time zone nor the leap-month rule explains them (360 chart dates differ in
that month, 332 of those charts differ in Cục, Mệnh or stars). In the other
four months (1914, 1916, 1920, 2097) Nhat Nguyet at UTC+7 already agrees with
lunar-javascript, so no chart differs.

The time zone part is the one a Vietnamese user cannot fix with an option:
iztro's calendar is always Beijing time, including with `language: "vi-VN"`
(the language only changes labels).

## 4. Examples

Hour given as the earthly branch; Nhat Nguyet at UTC+7, iztro 2.6.5 defaults.

| Solar date, hour | Nhat Nguyet | iztro | Why |
|---|---|---|---|
| 1985-01-21, Tỵ | 1/1/1985 (Tết), Ất Sửu, Thủy Nhị Cục (水二局), Mệnh in Dậu, Tử Vi in Sửu | 1/12/1984, Giáp Tý, Kim Tứ Cục (金四局), Mệnh in Thân, Tử Vi in Hợi | leap month in 1985 at UTC+7, in 1984 at UTC+8 |
| 2007-02-17, Ngọ | 1/1/2007, Đinh Hợi, Thổ Ngũ Cục (土五局), Mệnh in Thân, Tử Vi in Ngọ | 30/12/2006, Bính Tuất, Kim Tứ Cục (金四局), Mệnh in Mùi, Tử Vi in Hợi | new moon 16:14 UT: 17 Feb in Hanoi, 18 Feb in Beijing |
| 1968-01-29, Ngọ | 1/1/1968, Mậu Thân, Mộc Tam Cục (木三局), Mệnh in Thân | 30/12/1967, Đinh Mùi, Thủy Nhị Cục (水二局), Mệnh in Mùi | new moon 16:29 UT |
| 2030-02-03, Tỵ | 2/1/2030, Canh Tuất, Thủy Nhị Cục, Mệnh in Dậu, Tử Vi in Dần | 1/1/2030, Canh Tuất, Thủy Nhị Cục, Mệnh in Dậu, Tử Vi in Sửu | one day apart: same Cục and Mệnh, all 14 major stars shift |
| 1900-10-09, Tý | 16/8 leap/1900, Thủy Nhị Cục, Mệnh in Dậu | 16/8 leap/1900, Thổ Ngũ Cục (土五局), Mệnh in Tuất | same date, leap-month rule (`fixLeap`) |
| 2057-09-28, Tý | 1/9/2057, Kim Tứ Cục, Mệnh in Tuất | 30/8/2057, Thổ Ngũ Cục, Mệnh in Dậu | new moon at 16:00 UT, Beijing midnight (UTC+8 edge case) |
| 1990-09-19, Tỵ | 1/8/1990, Canh Ngọ, Kim Tứ Cục, Mệnh in Thìn | identical | control: calendars agree |

The full records are in `ket-qua.json` (`viDu`).

## Method notes

- **Hours.** iztro `timeIndex` 0 is the early Zi hour (00:00 to 01:00) and keeps
  the entered date; Nhat Nguyet's Tý hour also keeps the entered date (including
  23:00 to 24:00). Index 0 to 11 is passed unchanged to both. iztro's late Zi
  (`timeIndex` 12, next day) is not used.
- **Gender.** None of the compared fields depends on gender. Checked on 348
  charts for both libraries (`kiem.gioiTinh`); the run uses male charts.
- **UTC+8 counterfactual.** Built with the same public functions `lapLaSoTuVi`
  uses (`viTriCungMenh`, `cucTheoCungMenh`, `viTriTuVi`, `viTriChinhTinh`) fed
  with `solarToLunar(d, m, y, 8)`. At UTC+7 this reduced builder equals
  `lapLaSoTuVi` on all 17,616 charts checked (`kiem.dungRutGonKhopLapLaSoTuVi`).
- **iztro speed.** About 95% of iztro's time goes into reverse translation
  lookups (`kot`) and `i18next.t`, roughly 200 ms per chart. Both are pure, so
  `nap.mjs` memoizes them; this does not change any output (full chart JSON
  compared on 12 charts before and after, `kiem.ghiNhoIztro`) and makes the run
  about 25 times faster.
- **Solar terms.** lunar-javascript terms are read from `getJieQiTable()` (Beijing
  time, to the second); Nhat Nguyet terms from `mocTietKhiTrongNam` (Hanoi time, to
  the minute). Both converted to UT.

## Run it yourself

Node.js 22.18 or newer (it runs the TypeScript sources of the Nhat Nguyet
packages directly, no build step):

```bash
cd doi-chieu
npm ci
node chay.mjs                      # every day x 12 hours: about 5 min on 10 cores
node chay.mjs --gio=0,6            # Tý and Ngọ hours only
node chay.mjs --tu=1984 --den=1986 # a shorter range
```

Options: `--tu=` and `--den=` (years), `--gio=` (comma separated hour indexes,
0 is Tý), `--luong=` (worker threads, default all cores). Outputs:
`ket-qua.json` (all numbers, versions, examples, self-checks) and
`khac-ngay-am.csv` (2,844 rows: every day where Nhat Nguyet at UTC+7 or at UTC+8
differs from lunar-javascript). Dependencies are pinned in `package.json` and
`package-lock.json`. This folder is not part of the npm workspaces, so the
published Nhat Nguyet packages keep zero dependencies.

## Tóm tắt tiếng Việt

Bảng này đối chiếu thư viện Nhật Nguyệt với hai thư viện phổ biến nhất:
`lunar-javascript` (lịch âm Trung Quốc của 6tail) và `iztro` (Tử Vi, dùng
`lunar-typescript` cùng tác giả). Hai thư viện ấy đúng với lịch Trung Quốc, tính
theo giờ Bắc Kinh (UTC+8). Lịch âm Việt Nam theo cùng quy tắc nhưng tính theo
giờ Hà Nội (UTC+7), nên lệch ở một số ngày.

- Quét mọi ngày 1900 tới 2100 (73.414 ngày): **2.724 ngày khác ngày âm** (3,71%),
  83 đợt; **9 năm khác ngày Tết** (1903, 1935, 1965, 1968, 1969, 1985, 2007, 2030,
  2053); **6 năm khác tháng nhuận** (1917, 1922, 1938, 1984, 1985, 1987). Đổi
  Nhật Nguyệt sang giờ Trung Quốc thì còn 150 ngày (5 tháng có điểm sóc cách nửa
  đêm Bắc Kinh dưới năm phút; ba tháng 1914, 1916, 1920 do lunar-javascript cố ý
  hiệu chỉnh theo lịch in Trung Quốc trước 1960).
- **Tử Vi**: 880.968 lá (mọi ngày, 12 giờ). **38.752 lá (4,40%) khác cục, cung
  Mệnh hay vị trí chính tinh**: 26.602 lá do múi giờ (iztro luôn tính theo giờ
  Bắc Kinh, kể cả khi chọn `vi-VN`), 11.818 lá do quy tắc tháng nhuận (iztro mặc
  định tính nửa đầu tháng nhuận theo tháng trước, nửa sau theo tháng sau; Nhật
  Nguyệt tính cả tháng nhuận theo tháng nó lặp lại), 332 lá còn lại đều nằm trong
  30 ngày từ 28/09/2057 (điểm sóc 16:00 UT, đúng nửa đêm Bắc Kinh: Nhật Nguyệt
  bắt đầu tháng ngày 28 ở cả UTC+7 lẫn UTC+8, lunar-javascript và iztro ngày 29).
- Ví dụ 21/01/1985 giờ Tỵ: iztro ra ngày 1 tháng Chạp năm Giáp Tý, Kim Tứ Cục,
  Mệnh ở Thân; Nhật Nguyệt ra mùng 1 Tết Ất Sửu, Thủy Nhị Cục, Mệnh ở Dậu.
- **Tiết khí so với IMCCE** (4.824 mốc): cả ba thư viện lệch dưới một phút và
  mọi mốc đúng ngày. lunar-javascript sát hơn (tối đa 17 giây) vì giữ tới giây;
  Nhật Nguyệt lệch trung bình 0,27 phút, tối đa 0,9 phút do làm tròn tới phút
  (trước động cơ 2.0.1: sớm trung bình 3,2 phút, tối đa 14,5 phút).
- Lịch Việt Nam: miền Bắc tính lịch theo UTC+7 từ 1968, miền Nam theo UTC+8 tới
  1975. Nhật Nguyệt áp UTC+7 cho mọi năm.

Chạy lại: `cd doi-chieu && npm ci && node chay.mjs`.
