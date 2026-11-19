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
`brightness`, `mutagen`, `decadal`, `ages`, `fiveElementsClass`... keeps working.
Code that calls methods (`a.palace("命宫")`, `a.star(...)`, `a.horoscope(...)`)
does not: this layer is data only (see below).

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
| `fixLeap` | yes | default `true`: days 1-15 of a leap month count as that month, days 16 onward as the next month. `false`: the whole leap month counts as the month it repeats, which is Nhat Nguyet's own rule (`castZiWei`, `lapLaSoTuVi`) |
| `language` | yes | `zh-CN` (default), `zh-TW`, `en-US`, `vi-VN`, `ja-JP`, `ko-KR` |
| `options.country` | new | `"VN"` (default, UTC+7), `"CN"`, `"TW"`, `"HK"`, `"MO"`, `"SG"`, `"MY"`, `"ID"`, `"PH"` (UTC+8), `"KR"`, `"JP"` (UTC+9) |
| `options.timeZone` | new | hours, instead of `country` |

`{ country: "CN" }` gives the calendar iztro uses.

## Keys

Astrolabe:

| Key | Status |
|---|---|
| `gender`, `solarDate`, `lunarDate`, `chineseDate`, `rawDates`, `time`, `timeRange`, `sign`, `zodiac` | same format as iztro |
| `earthlyBranchOfSoulPalace`, `earthlyBranchOfBodyPalace`, `soul`, `body`, `fiveElementsClass` | same |
| `palaces` (12, index 0 is the Yin palace as in iztro) | same shape, see below |
| `copyright` | present, names Nhat Nguyet as the data source |
| `raw` (not enumerable, not in JSON) | the Nhat Nguyet chart; pass it to `decadeLuck`, `yearlyLuck`, `yearlyStars`, `findPatterns`, `chartToText`, `renderChartSvg` |
| `calendar` (not enumerable) | `{ country, timeZone, fixLeap }` used |
| methods `palace()`, `star()`, `horoscope()`, `surroundedPalaces()`, `use()`... | **not provided** |

Palace:

| Key | Status |
|---|---|
| `index`, `name`, `isBodyPalace`, `isOriginalPalace`, `heavenlyStem`, `earthlyBranch` | same |
| `majorStars` | the 14 major stars: `name`, `type: "major"`, `scope`, `brightness`, `mutagen` |
| `minorStars` | 12 of iztro's 14: Left/Right Assistant, Wenchang, Wenqu, Kui, Yue (`soft`), Lucun (`lucun`), Tianma (`tianma`), Dikong, Dijie, Qingyang, Tuoluo (`tough`). **Huoxing and Lingxing are not placed yet** |
| `adjectiveStars` | 11 of iztro's: 天官 天福 天哭 天虚 三台 八座 恩光 天贵 天才 天寿 (`adjective`), 咸池 (`flower`, the Đào Hoa of Vietnamese books). Not placed yet: 红鸾 天喜 天姚 解神 龙池 凤阁 台辅 封诰 天巫 华盖 天厨 天月 天德 月德 天空 旬空 截路 空亡 孤辰 寡宿 蜚廉 破碎 天刑 阴煞 天使 天伤 年解 |
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
  above (22,570 star placements), except:
- **Tiangui (天贵, Thiên Quý)** is placed by the rule of the Vietnamese books
  (500 placements differ).
- **Years with stem Geng (庚, Canh)**: Kui and Yue sit where the Vietnamese books
  put them (126), and the Four Transformations follow Huyền Vi, Thiên Lương and
  Việt Viêm Tử (Tiantong 科, Taiyin 忌) where iztro, like the 全书, has Taiyin 科,
  Tiantong 忌 (126). Schools disagree on Geng, Xin and Ren; the chart's `raw.caveat`
  says which version it uses.
- **Brightness** of major stars uses the five levels of the Vietnamese tables
  (Miếu 庙, Vượng 旺, Đắc 得, Bình 平, Hãm 陷); iztro uses seven levels and its own
  table, so 5,638 of 8,540 values differ. Minor stars carry `brightness: ""`.

With the default `country: "VN"`, the lunar date itself follows the Vietnamese
calendar, so charts born on the days where the two calendars differ change
further (whole Cục, Life palace and star layout).

## Licence

The layer is Nhat Nguyet code (MIT). The display strings (star, palace,
brightness... names in six languages) are copied from iztro 2.6.5's locale
files under iztro's MIT licence, whose notice is kept at the top of
`js/packages/tu-vi/src/iztro-nhan.ts`; `doi-chieu/sinh-nhan-iztro.mjs`
regenerates that file.
