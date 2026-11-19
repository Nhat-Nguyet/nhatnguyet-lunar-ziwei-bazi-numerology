# Moving from iztro

`@nhatnguyet/tu-vi/iztro` returns the same data shape as
[iztro](https://github.com/SylarLong/iztro)'s `FunctionalAstrolabe`, with the
same parameters and the same display strings in iztro's six languages, but
computes the chart with the Nhat Nguyet core. The difference that matters for
Vietnamese users: the lunar date is computed for **Vietnam time (UTC+7)** by
default, while iztro always uses Beijing time (UTC+8), even with
`language: "vi-VN"`. Over 1900 to 2100 that changes the Cục, the Life palace or
the 14 major stars on 4.40% of charts (see `doi-chieu/README.md`).

## Change one line

```diff
- import { astro } from "iztro";
+ import { astro } from "@nhatnguyet/tu-vi/iztro";

  const a = astro.bySolar("1985-1-21", 5, "男", true, "vi-VN");
  a.lunarDate;                  // "Âm lịch ngày 1 tháng 1 năm 1985" (iztro: "... tháng 12 năm 1984")
  a.fiveElementsClass;          // "Thủy Nhị Cục"                    (iztro: "Kim Tứ Cục")
  a.earthlyBranchOfSoulPalace;  // "Dậu"                             (iztro: "Thân")
```

No runtime dependency on iztro. Code that reads `palaces[i].majorStars[j].name`,
`brightness`, `mutagen`, `decadal`, `ages`, `fiveElementsClass`... keeps working,
and so does code that calls iztro's methods: `a.palace("命宫")`,
`a.star("紫微").palace()`, `a.surroundedPalaces(...)`, `a.horoscope(date)`,
`palace.fliesTo(...)` (see [Methods](#methods) and [Horoscope](#horoscope)).
The methods are not enumerable, so `JSON.stringify(a)` gives exactly the data
shape below.

## Parameters

```ts
astro.bySolar(solarDateStr, timeIndex, gender, fixLeap = true, language = "zh-CN", options = {})
astro.byLunar(lunarDateStr, timeIndex, gender, isLeapMonth = false, fixLeap = true, language = "zh-CN", options = {})
```

| Parameter | Same as iztro | Notes |
|---|---|---|
| `solarDateStr` | yes | `"YYYY-M-D"` (zero padding optional) or a `Date` (local time) |
| `timeIndex` | yes | 0 early Zi (00:00-01:00, same date), 1 Chou ... 11 Hai, 12 late Zi (23:00-24:00, counted as the next day's Zi hour) |
| `gender` | yes | `"男"` / `"女"`, also `"male"` / `"female"` |
| `fixLeap` | yes | default `true`: days 1-15 of a leap month count as that month, days 16 onward as the next month. `false`: the whole leap month counts as the month it repeats, which is Nhat Nguyet's own rule (`castZiWei`, `lapLaSoTuVi`). It is mapped to the school option `leapMonth` (`true` is `"split-at-15"`, `false` is `"whole"`); an explicit `options.schools.leapMonth` wins |
| `language` | yes | `zh-CN` (default), `zh-TW`, `en-US`, `vi-VN`, `ja-JP`, `ko-KR` |
| `options.country` | new | `"VN"` (default, UTC+7), `"CN"`, `"TW"`, `"HK"`, `"MO"`, `"SG"`, `"MY"`, `"ID"`, `"PH"` (UTC+8), `"KR"`, `"JP"` (UTC+9) |
| `options.timeZone` | new | hours, instead of `country` |
| `options.schools` | new | school options where the books disagree ([schools.md](schools.md)). `{ fireBell: "quanshu", transformations: "quanshu", heavenlyKitchen: "chinese" }` follows iztro on Huoxing and Lingxing, the Geng transformations and the Gui-year Tianchu |

`{ country: "CN" }` gives the calendar iztro uses; adding
`schools: { fireBell: "quanshu", transformations: "quanshu", heavenlyKitchen: "chinese" }`
also gives iztro's rules for those stars (see below).

## Keys

Astrolabe:

| Key | Status |
|---|---|
| `gender`, `solarDate`, `lunarDate`, `chineseDate`, `rawDates`, `time`, `timeRange`, `sign`, `zodiac` | same format as iztro |
| `earthlyBranchOfSoulPalace`, `earthlyBranchOfBodyPalace`, `soul`, `body`, `fiveElementsClass` | same |
| `palaces` (12, index 0 is the Yin palace as in iztro) | same shape, see below |
| `copyright` | present, names Nhat Nguyet as the data source |
| `raw` (not enumerable, not in JSON) | the Nhat Nguyet chart; pass it to `decadeLuck`, `yearlyLuck`, `yearlyStars`, `findPatterns`, `chartToText`, `renderChartSvg` |
| `calendar` (not enumerable) | `{ country, timeZone, fixLeap, schools }` used |
| methods | see [Methods](#methods) |

Palace:

| Key | Status |
|---|---|
| `index`, `name`, `isBodyPalace`, `isOriginalPalace`, `heavenlyStem`, `earthlyBranch` | same |
| `majorStars` | the 14 major stars: `name`, `type: "major"`, `scope`, `brightness`, `mutagen` |
| `minorStars` | all 14 of iztro: Left/Right Assistant, Wenchang, Wenqu, Kui, Yue (`soft`), Lucun (`lucun`), Tianma (`tianma`), Dikong, Dijie, Qingyang, Tuoluo, Huoxing, Lingxing (`tough`) |
| `adjectiveStars` | 33 of iztro's 38: 天官 天福 天哭 天虚 三台 八座 恩光 天贵 天才 天寿 龙池 凤阁 台辅 封诰 华盖 天厨 天德 月德 天空 孤辰 寡宿 破碎 天刑 天使 天伤 旬空 截路 空亡 (`adjective`), 咸池 (the Đào Hoa of Vietnamese books), 红鸾 天喜 天姚 (`flower`), 年解 (`helper`, the Giải Thần of Vietnamese books). 旬空, 截路, 空亡 are built from the core's Tuần and Triệt palaces. **Not placed**: 解神 (by month), 天巫, 天月, 阴煞, 蜚廉, found only in Chinese texts; no Vietnamese book we checked (Tân Biên, Thiên Lương, Việt Viêm Tử, Nguyễn Phát Lộc) places them |
| `changsheng12`, `boshi12`, `suiqian12` | same |
| `jiangqian12` | always `""` (the Jiang Xing ring is not computed) |
| `decadal`, `ages` | same |

## Deliberate differences

Measured on 610 charts (random dates 1900-2100, all 13 time indexes, both
genders, all six languages, `fixLeap` both ways, plus leap-month, Tết 1985 and
late-Zi edge cases), with `{ country: "CN" }` so both use Beijing time:
`doi-chieu/iztro-tuong-thich.test.mjs`.

- **Identical**: every key of the astrolabe, the palaces and the stars; every
  date field (`lunarDate`, `chineseDate`, `rawDates`, `sign`, `zodiac`, `time`),
  palace names, stems, branches, body palace, original palace, Cục, soul and body
  stars, the three rings, `decadal`, `ages`, and the palace of every star listed
  above (37,210 star placements), except:
- **Tiangui (天贵, Thiên Quý)** is placed by the rule of the Vietnamese books
  (500 placements differ).
- **Huoxing and Lingxing (火星, 铃星)** follow Tử Vi Đẩu Số Tân Biên: the same
  starting palaces as iztro, but for a yang-year man or yin-year woman Huoxing
  counts forward and Lingxing backward to the birth hour, the other way round
  for a yin-year man or yang-year woman. iztro, like the 全书, counts both
  forward (484 of 1,220 placements differ).
- **Tianchu (天厨, Thiên Trù)** for the stem Gui (癸, Quý) sits at Tuất (戌) as in
  Tân Biên; iztro puts it at Hợi (亥) (59 placements).
- **Years with stem Geng (庚, Canh)**: Kui and Yue sit where the Vietnamese books
  put them (126), and the Four Transformations follow Huyền Vi, Thiên Lương and
  Việt Viêm Tử (Tiantong 科, Taiyin 忌) where iztro, like the 全书, has Taiyin 科,
  Tiantong 忌 (126). Schools disagree on Geng, Xin and Ren; the chart's `raw.caveat`
  says which version it uses.
- **Brightness** of major stars uses the five levels of the Vietnamese tables
  (Miếu 庙, Vượng 旺, Đắc 得, Bình 平, Hãm 陷); iztro uses seven levels and its own
  table, so 5,638 of 8,540 values differ. Minor stars carry `brightness: ""`.

Three of these are school options: with `options.schools` set to
`{ fireBell: "quanshu", transformations: "quanshu", heavenlyKitchen: "chinese" }`
the same 610 charts give 0 differences for Huoxing and Lingxing, the Geng
transformations and the Gui-year Tianchu; brightness (5,638), Tiangui (500) and
the Geng-year Kui and Yue (126) remain ([schools.md](schools.md#parity-with-iztro)).

With the default `country: "VN"`, the lunar date itself follows the Vietnamese
calendar, so charts born on the days where the two calendars differ change
further (whole Cục, Life palace and star layout).

## Methods

Same names, arguments and return shapes as iztro 2.6.5. Star, palace and
mutagen names are accepted in any of the six languages (or as iztro keys such
as `"ziweiMaj"`, `"soulPalace"`), like iztro's own lookup.

| Object | Methods |
|---|---|
| astrolabe | `palace(indexOrName)` (also `"身宫"`, `"来因"`), `star(name)`, `surroundedPalaces(indexOrName)`, `flankingPalaces(indexOrName)`, `isSurrounded`, `isSurroundedOneOf`, `notSurrounded`, `horoscope(date?, timeIndex?)`, `decadalList()`, `yearlyList(indexOrName)`, `monthlyList(year, fixLeap?)`, `use(plugin)`, `toJSON()` |
| palace | `has`, `notHave`, `hasOneOf`, `hasMutagen`, `notHaveMutagen`, `isEmpty(excludeStars?)`, `astrolabe()`, `fliesTo`, `fliesOneOfTo`, `notFlyTo`, `selfMutaged`, `selfMutagedOneOf`, `notSelfMutaged`, `mutagedPlaces()`, `toJSON()` |
| star | `palace()`, `surroundedPalaces()`, `oppositePalace()`, `withMutagen`, `withBrightness`, `toJSON()` |
| surrounded / flanking palaces | `target`, `opposite`, `wealth`, `career` / `previous`, `next`; `have`, `notHave`, `haveOneOf`, `haveMutagen`, `notHaveMutagen` |
| horoscope | `agePalace()`, `palace(name, scope)`, `surroundPalaces(name, scope)`, `hasHoroscopeStars`, `notHaveHoroscopeStars`, `hasOneOfHoroscopeStars`, `hasHoroscopeMutagen`, `toJSON()`; `astrolabe` (not enumerable) |

```ts
const a = astro.bySolar("1990-9-19", 10, "男", true, "zh-CN", { country: "CN" });
a.star("紫微").palace().name;                          // "疾厄"
a.palace("命宫").fliesTo("迁移", "忌");                // false
a.palace("命宫").selfMutaged("禄");                    // true
a.palace("命宫").mutagedPlaces().map((p) => p?.name); // ["命宫", "福德", "迁移", "福德"]
a.surroundedPalaces("命宫").have(["太阴", "天机"]);    // true
```

`fliesTo`, `selfMutaged`, `mutagedPlaces` use the palace's stem and the Nhat
Nguyet Four Transformations table (the table of the engine's flying-star
paths), so they differ from iztro only on palaces with stem Geng (庚).

## Horoscope

`a.horoscope(date, timeIndex)` returns iztro's `Horoscope` shape. The date is
read in the chart's calendar (`country`), `timeIndex` 12 moves to the next day
as in iztro.

```ts
const h = a.horoscope("2026-11-19", 3);
h.lunarDate;                  // "二〇二六年十月十一"
h.decadal;                    // {"index":0,"name":"大限","heavenlyStem":"戊","earthlyBranch":"寅",
                              //  "palaceNames":["命宫","父母","福德",...],"mutagen":["贪狼","太阴","右弼","天机"]}
h.age;                        // {"index":2,"nominalAge":37,"name":"小限","heavenlyStem":"庚","earthlyBranch":"辰",
                              //  "palaceNames":[...],"mutagen":["太阳","武曲","天同","太阴"]}
h.yearly.mutagen;             // ["天同","天机","文昌","廉贞"]
h.yearly.stars.map((s) => s.map((x) => x.name).join(","));
                              // ["","","流陀","流禄","流羊","","流马","","","","",""]
h.monthly.index;              // 4
h.daily;                      // null
h.palace("命宫", "yearly").name;               // "疾厄"
h.hasHoroscopeStars("命宫", "yearly", ["流羊"]); // true
```

Where each value comes from (all from the engine, nothing guessed):

| Scope | Nhat Nguyet source | Present |
|---|---|---|
| `decadal` | the ten-year periods (`daiVan`): first period at the Life palace from age = Cục | index, stem, branch, `palaceNames`, `mutagen` (stem of the decade palace) |
| `age` (小限) | minor limit of `tinhHanNam` (start by the birth year's triad, men forward, women backward) | all keys |
| `yearly` | year palace, the year's Four Transformations (`tinhHanNam`) and the moving stars (`tinhSaoLuu`) | `stars`: 流禄, 流羊, 流陀, 流马 only |
| `monthly` | month palaces by the Đẩu Quân rule (`tinhNguyetHan`), stem and branch of the month pillar | `mutagen` is `[]` |
| `daily`, `hourly` | none | `null` |

What the engine does not compute, so the layer leaves it empty instead of
inventing a rule:

- **Childhood limit (童限)**: before the first ten-year period, `decadal` is
  `null` (iztro uses 命, 财, 疾, 夫, 福, 官 for ages 1 to 6).
- **Decade and month moving stars** (运魁, 运禄, 月禄...): `decadal.stars`
  and `monthly.stars` are absent. Of the yearly ones, only Lucun, Qingyang,
  Tuoluo and Tianma (流禄 流羊 流陀 流马) are placed; 流魁, 流钺, 流昌, 流曲,
  流鸾, 流喜 and 年解 are not.
- **Monthly, daily and hourly Four Transformations**, the daily and hourly
  palaces: `monthly.mutagen` is `[]`, `daily` and `hourly` are `null`.
- **The year's two rings** (`yearly.yearlyDecStar`): both arrays are empty.
- `hasHoroscopeStars` and its two siblings read the yearly stars only (iztro
  needs decadal stars too and returns `false` without them).

### Measured against iztro

`doi-chieu/iztro-van-han.test.mjs`: 2,006 charts born 1900 to 2080, a random
date up to 100 years later, random time indexes, both genders, `fixLeap` both
ways, six languages, `{ country: "CN" }` so both use Beijing time.

| Field | Result |
|---|---|
| `solarDate`, `lunarDate` | identical except 3 dates in a month where the two UTC+8 calendars differ (2057) |
| `decadal` index, stem, branch, `palaceNames` | identical on all 1,934 dates inside a ten-year period (25 `en-US` stems: the iztro bug below); the other 69 are childhood (`null`) |
| `age` index, `nominalAge`, stem, branch, `palaceNames` | identical (2,003) |
| `yearly` index, stem, branch, `palaceNames`; positions of 流禄 流羊 流陀 流马 | identical (2,003; 8,012 star positions) |
| `monthly` index, stem, branch, `palaceNames` | identical on 1,981; 22 differ by the leap-month rule below |
| `mutagen` of `decadal`, `age`, `yearly` | identical except stem Geng (庚): 648 differ by the school table |
| `decadalList()`, `yearlyList()`, `monthlyList()` (120 charts) | identical except Geng `mutagen` (145), the leap-month rule (25) and 6 month lengths in the 2057 and 2097 UTC+8 edge months |
| palace methods (150 charts, 100,800 calls of `fliesTo`, `selfMutaged`, `isEmpty`, `has`, `surroundedPalaces().have`) | identical except 650 on Geng palaces and 184 where a star sits elsewhere by the Vietnamese books (Huoxing, Lingxing) |

- **Leap months**: the layer reads both the birth month and the target month
  with the chart's `fixLeap`; iztro's monthly limit always counts days 16 to
  the end of a leap month as the next month. With `fixLeap: true` (the default)
  they agree.
- **iztro bug kept out**: in `en-US`, iztro's decadal stem goes through a
  misspelled translation key and the stem 丙 ("bing") prints as "sick" (the 病
  star); the layer prints the decade palace's stem (25 dates).

## Licence

The layer is Nhat Nguyet code (MIT). The display strings (star, palace,
brightness... names in six languages) are copied from iztro 2.6.5's locale
files under iztro's MIT licence, whose notice is kept at the top of
`js/packages/tu-vi/src/iztro-nhan.ts`; `doi-chieu/sinh-nhan-iztro.mjs`
regenerates that file.
