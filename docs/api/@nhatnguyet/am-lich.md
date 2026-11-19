[Nhat Nguyet API reference](../README.md) / @nhatnguyet/am-lich

# @nhatnguyet/am-lich

Vietnamese, Chinese, Korean and Japanese lunisolar calendars: Gregorian to
lunar and back, the sexagenary cycle (can chi), the 24 solar terms to the
minute, hour branches, auspicious hours.

```bash
npm i @nhatnguyet/am-lich     # or the English-named alias @nhatnguyet/lunar
```

This page lists the English API. The package also exports the original
functions with positional arguments and Vietnamese names (`solarToLunar`,
`lunarToSolar`, `yearCanChi`...), described in the
[package README](https://github.com/Nhat-Nguyet/nhatnguyet-lunar-ziwei-bazi-numerology/tree/main/js/packages/am-lich#original-api).

## Functions

### checkTerms()

```ts
function checkTerms(terms, lang): Terms;
```

Check a `terms` option; the result is "vi" for lang "vi", "han" for "zh", default "pinyin" for "en".

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `terms` | `unknown` |
| `lang` | [`Lang`](#lang) |

#### Returns

[`Terms`](#terms)

***

### checkLang()

```ts
function checkLang(lang): Lang;
```

Check and normalise a `lang` option (default "en").

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `lang` | `unknown` |

#### Returns

[`Lang`](#lang)

***

### parseDate()

```ts
function parseDate(input): YMD;
```

Parse a date input into `{ year, month, day }`. A `Date` object is read in
the runtime's LOCAL time zone (its calendar date as shown to the user);
prefer the "YYYY-MM-DD" string to avoid surprises. Throws on invalid dates.

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `input` | [`DateInput`](#dateinput) |

#### Returns

[`YMD`](#ymd)

***

### checkYear()

```ts
function checkYear(year, what?): void;
```

Throw a RangeError when `year` is outside `YEAR_RANGE` (1900 to 2100).
`what` names the input in the message, e.g. "date 2200-01-01".

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `year` | `number` |
| `what?` | `string` |

#### Returns

`void`

***

### parseDateInRange()

```ts
function parseDateInRange(input, what?): YMD;
```

`parseDate` plus `checkYear`: a valid date in 1900 to 2100.

#### Parameters

| Parameter | Type | Default value |
| ------ | ------ | ------ |
| `input` | [`DateInput`](#dateinput) | `undefined` |
| `what?` | `string` | `"date"` |

#### Returns

[`YMD`](#ymd)

***

### formatDate()

```ts
function formatDate(d): string;
```

Format `{ year, month, day }` as "YYYY-MM-DD".

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `d` | [`YMD`](#ymd) |

#### Returns

`string`

***

### parseTime()

```ts
function parseTime(input): ClockTime | null;
```

Parse a clock time: "20:00", "8:05", "20" or the number 20. `null` and
`undefined` mean "unknown" and return null. Throws on anything else.

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `input` | `string` \| `number` \| `null` \| `undefined` |

#### Returns

[`ClockTime`](#clocktime) \| `null`

***

### formatTime()

```ts
function formatTime(t): string;
```

Format a clock time as "HH:MM".

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `t` | [`ClockTime`](#clocktime) |

#### Returns

`string`

***

### resolveCountry()

```ts
function resolveCountry(opts?): object;
```

Resolve `country` / `timeZone` options to a country code and an hour offset.

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `opts?` | \{ `country?`: `string`; `timeZone?`: `number`; \} |
| `opts.country?` | `string` |
| `opts.timeZone?` | `number` |

#### Returns

`object`

| Name | Type |
| ------ | ------ |
| `country` | `string` |
| `timeZone` | `number` |

***

### term()

```ts
function term(
   vi, 
   lang, 
   fallback?
): string;
```

Translate one Vietnamese domain term (stem, branch, element, palace, star,
na yin...) using the core's three-language vocabulary. Unknown terms come
back as `fallback` (default: the Vietnamese term itself). Stems, branches
and the Four Transformations come back in Sino-Vietnamese for "en"; use
`termName` to follow a `terms` option.

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `vi` | `string` |
| `lang` | [`Lang`](#lang) |
| `fallback?` | `string` |

#### Returns

`string`

***

### pickLang()

```ts
function pickLang(
   obj, 
   key, 
   lang, 
   fallback
): string;
```

Read the `lang` version of field `key` from a core result object: `key`
for "vi", `key + "En"` / `key + "Zh"` otherwise. When the core object has
no such field (older core, or a field never translated), `fallback()`
supplies the value.

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `obj` | `object` |
| `key` | `string` |
| `lang` | [`Lang`](#lang) |
| `fallback` | () => `string` |

#### Returns

`string`

***

### termName()

```ts
function termName(
   vi, 
   lang, 
   terms?
): string;
```

One stem, branch or Four-Transformation name ("Canh", "Ngọ", "Hóa Kỵ") in
`lang` and `terms`; any other term goes through `term`.

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `vi` | `string` |
| `lang` | [`Lang`](#lang) |
| `terms?` | [`Terms`](#terms) |

#### Returns

`string`

***

### transformationShort()

```ts
function transformationShort(
   vi, 
   lang, 
   terms?
): string;
```

Short form of a Four-Transformation name: Lộc / Lu / 禄 (by `lang` and `terms`).

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `vi` | `string` |
| `lang` | [`Lang`](#lang) |
| `terms?` | [`Terms`](#terms) |

#### Returns

`string`

***

### stemBranchName()

```ts
function stemBranchName(
   label, 
   lang, 
   terms?
): string;
```

Translate a stem-branch label such as "Bính Ngọ": "Bing Wu" (en, pinyin),
"丙午" (zh, or en with terms "han"), "Bính Ngọ" (vi, or en with terms "vi").
Anything that is not exactly a stem followed by a branch goes through `term`.

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `label` | `string` |
| `lang` | [`Lang`](#lang) |
| `terms?` | [`Terms`](#terms) |

#### Returns

`string`

***

### convertTerms()

```ts
function convertTerms(
   text, 
   terms, 
   extra?, 
   extraKey?
): string;
```

Rewrite the Vietnamese domain words left inside an English sentence (stem
and branch names, sexagenary pairs, Four Transformations, solar terms) in
`terms`, plus any `extra` phrases (exact Vietnamese phrase to replacement;
longest match wins, whole words only). Used by the packages for the
explanations and notes that the core writes in English.

#### Parameters

| Parameter | Type | Default value |
| ------ | ------ | ------ |
| `text` | `string` | `undefined` |
| `terms` | [`Terms`](#terms) | `undefined` |
| `extra?` | `Readonly`\<`Record`\<`string`, `string`\>\> | `{}` |
| `extraKey?` | `string` | `""` |

#### Returns

`string`

***

### elementName()

```ts
function elementName(vi, lang): string;
```

Name of an element (Kim, Mộc, Thủy, Hỏa, Thổ) in `lang`.

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `vi` | `string` |
| `lang` | [`Lang`](#lang) |

#### Returns

`string`

***

### zodiacName()

```ts
function zodiacName(
   branchIndex, 
   lang, 
   country?
): string;
```

Zodiac animal of a branch index (0 = Tý). Vietnam's fourth animal is the
Cat (Mèo); for every other country it is the Rabbit.

#### Parameters

| Parameter | Type | Default value |
| ------ | ------ | ------ |
| `branchIndex` | `number` | `undefined` |
| `lang` | [`Lang`](#lang) | `undefined` |
| `country?` | `string` | `"VN"` |

#### Returns

`string`

***

### hourBranch()

```ts
function hourBranch(
   time, 
   lang?, 
   terms?
): HourBranch;
```

Map a clock time to its earthly-branch double hour. Convention: the Tý
hour runs from 23:00 to 00:59, so 23:30 is Tý. Uses the package's own
`chiGioTuGioDongHo`.

#### Parameters

| Parameter | Type | Default value |
| ------ | ------ | ------ |
| `time` | `string` \| `number` | `undefined` |
| `lang?` | [`Lang`](#lang) | `"en"` |
| `terms?` | [`Terms`](#terms) | `undefined` |

#### Returns

[`HourBranch`](#hourbranch)

***

### pillarFromIndex()

```ts
function pillarFromIndex(
   stemIndex, 
   branchIndex, 
   lang?, 
   terms?
): Pillar;
```

Build a pillar from stem and branch indexes (0 = Giáp, 0 = Tý).

#### Parameters

| Parameter | Type | Default value |
| ------ | ------ | ------ |
| `stemIndex` | `number` | `undefined` |
| `branchIndex` | `number` | `undefined` |
| `lang?` | [`Lang`](#lang) | `"en"` |
| `terms?` | [`Terms`](#terms) | `undefined` |

#### Returns

[`Pillar`](#pillar)

***

### dayPillar()

```ts
function dayPillar(date, opts?): Pillar;
```

The day pillar (can chi of the day) of a Gregorian date. Independent of time zone.

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `date` | [`DateInput`](#dateinput) |
| `opts?` | \{ `lang?`: [`Lang`](#lang); `terms?`: [`Terms`](#terms); \} |
| `opts.lang?` | [`Lang`](#lang) |
| `opts.terms?` | [`Terms`](#terms) |

#### Returns

[`Pillar`](#pillar)

***

### yearPillar()

```ts
function yearPillar(lunarYear, opts?): Pillar;
```

The pillar of a LUNAR year (2026 is Bính Ngọ).

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `lunarYear` | `number` |
| `opts?` | \{ `lang?`: [`Lang`](#lang); `terms?`: [`Terms`](#terms); \} |
| `opts.lang?` | [`Lang`](#lang) |
| `opts.terms?` | [`Terms`](#terms) |

#### Returns

[`Pillar`](#pillar)

***

### toLunar()

```ts
function toLunar(date, opts?): LunarResult;
```

Convert a Gregorian date to the lunar calendar of a country (default
Vietnam, UTC+7). Wraps `solarToLunar`.

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `date` | [`DateInput`](#dateinput) |
| `opts?` | [`CalendarOptions`](#calendaroptions) |

#### Returns

[`LunarResult`](#lunarresult)

#### Example

```ts
toLunar("2027-02-06") // { year: 2027, month: 1, day: 1, ... }: Tết 2027 in Vietnam
```

***

### toSolar()

```ts
function toSolar(lunar, opts?): SolarResult;
```

Convert a lunar date back to Gregorian. Throws RangeError when the lunar
year is outside 1900 to 2100 or the lunar date does not exist (no such leap
month that year, or day 30 of a 29-day month). Wraps `lunarToSolar`.

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `lunar` | [`LunarInput`](#lunarinput) |
| `opts?` | \{ `country?`: `string`; `timeZone?`: `number`; \} |
| `opts.country?` | `string` |
| `opts.timeZone?` | `number` |

#### Returns

[`SolarResult`](#solarresult)

***

### solarTerms()

```ts
function solarTerms(year, opts?): SolarTerm[];
```

The 24 solar-term moments that fall in a Gregorian year (1900 to 2100), in
time order, local time of the chosen country. Wraps `mocTietKhiTrongNam`
(computed at UTC+7, then shifted by whole hours).

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `year` | `number` |
| `opts?` | [`CalendarOptions`](#calendaroptions) |

#### Returns

[`SolarTerm`](#solarterm)[]

***

### solarTermOn()

```ts
function solarTermOn(date, opts?): object;
```

The solar term in effect on a date (the latest term whose local DATE is
not after it) and the next one.

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `date` | [`DateInput`](#dateinput) |
| `opts?` | [`CalendarOptions`](#calendaroptions) |

#### Returns

`object`

| Name | Type |
| ------ | ------ |
| `current` | [`SolarTerm`](#solarterm) |
| `next` | [`SolarTerm`](#solarterm) |

***

### solarTermNames()

```ts
function solarTermNames(opts?): object[];
```

All 24 solar terms (no dates), from Start of Spring, with meanings in `lang`.

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `opts?` | \{ `lang?`: [`Lang`](#lang); \} |
| `opts.lang?` | [`Lang`](#lang) |

#### Returns

`object`[]

***

### auspiciousHours()

```ts
function auspiciousHours(date, opts?): AuspiciousHoursResult;
```

The twelve double hours of a day with the auspicious (hoàng đạo) or
inauspicious (hắc đạo) flag and the presiding spirit, as Vietnamese
almanacs print them. The six auspicious hours depend only on the branch of
the day; the spirits circle from Qing Long (Thanh Long), which starts at an
hour fixed by the day's branch pair. Hours are Vietnam clock time.

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `date` | [`DateInput`](#dateinput) |
| `opts?` | \{ `lang?`: [`Lang`](#lang); `terms?`: [`Terms`](#terms); \} |
| `opts.lang?` | [`Lang`](#lang) |
| `opts.terms?` | [`Terms`](#terms) |

#### Returns

[`AuspiciousHoursResult`](#auspicioushoursresult)

#### Example

```ts
auspiciousHours("2027-02-06").hours.filter((h) => h.auspicious).map((h) => h.range)
```

## Variables

### YEAR\_RANGE

```ts
const YEAR_RANGE: Readonly<{
  min: number;
  max: number;
}>;
```

Years the English API accepts, inclusive: the span the engine is checked
over (new moons against NASA, solar terms against IMCCE, every test vector).

***

### STEM\_PINYIN

```ts
const STEM_PINYIN: readonly string[];
```

Pinyin (no tone marks) of the ten stems, Giáp ... Quý.

***

### BRANCH\_PINYIN

```ts
const BRANCH_PINYIN: readonly string[];
```

Pinyin (no tone marks) of the twelve branches, Tý ... Hợi.

***

### HOUR\_SPIRIT\_PINYIN

```ts
const HOUR_SPIRIT_PINYIN: readonly string[];
```

Pinyin (no tone marks) of the twelve hour spirits, Qing Long first.

***

### AUSPICIOUS\_SPIRITS

```ts
const AUSPICIOUS_SPIRITS: readonly number[];
```

Positions in the cycle of twelve spirits that make an hour auspicious.

***

### TU\_VUNG

```ts
const TU_VUNG: Readonly<Record<string, readonly [string, string]>>;
```

436 thuật ngữ nghiệp vụ ba thứ tiếng.

## Interfaces

### YMD

A plain calendar date.

#### Extended by

- [`SolarResult`](#solarresult)

#### Properties

| Property | Type |
| ------ | ------ |
| <a id="property-year"></a> `year` | `number` |
| <a id="property-month"></a> `month` | `number` |
| <a id="property-day"></a> `day` | `number` |

***

### CalendarOptions

Calendar options shared by the lunar functions.

#### Properties

| Property | Type | Description |
| ------ | ------ | ------ |
| <a id="property-country"></a> `country?` | `string` | ISO 3166-1 country whose lunar calendar to use: "VN" (default, UTC+7), "CN", "TW", "HK", "MO", "SG", "MY", "ID", "PH" (UTC+8), "KR", "JP" (UTC+9). Same rules everywhere; only the local time used to decide the day differs. |
| <a id="property-timezone"></a> `timeZone?` | `number` | Override the time zone in hours (wins over `country`). |
| <a id="property-lang"></a> `lang?` | [`Lang`](#lang) | Language of names in the result. Default "en". |
| <a id="property-terms"></a> `terms?` | [`Terms`](#terms) | With lang "en": how to write stems and branches ("pinyin" default, "han", "vi"). See `Terms`. |

***

### ClockTime

A clock time.

#### Properties

| Property | Type |
| ------ | ------ |
| <a id="property-hour"></a> `hour` | `number` |
| <a id="property-minute"></a> `minute` | `number` |

***

### HourBranch

The double-hour (canh giờ) of a clock time.

#### Properties

| Property | Type | Description |
| ------ | ------ | ------ |
| <a id="property-index"></a> `index` | `number` | 0 = Tý (23:00 to 00:59), 1 = Sửu (01:00 to 02:59) ... 11 = Hợi (21:00 to 22:59). |
| <a id="property-name"></a> `name` | `string` | Branch name in `lang`. |
| <a id="property-animal"></a> `animal` | `string` | Zodiac animal of the branch in `lang` (the Tuất hour is the Dog hour). |
| <a id="property-range"></a> `range` | `string` | The two clock hours the branch covers, e.g. "19:00-20:59". |

***

### Pillar

A stem-branch pillar with its elements, in `lang`.

#### Extended by

- [`BaZiPillar`](bat-tu.md#bazipillar)
- [`LuckPillar`](bat-tu.md#luckpillar)

#### Properties

| Property | Type | Description |
| ------ | ------ | ------ |
| <a id="property-label"></a> `label` | `string` | e.g. "Geng Wu" (en), "Canh Ngọ" (vi) or "庚午" (zh). |
| <a id="property-stem"></a> `stem` | `string` | - |
| <a id="property-branch"></a> `branch` | `string` | - |
| <a id="property-stemindex"></a> `stemIndex` | `number` | - |
| <a id="property-branchindex"></a> `branchIndex` | `number` | - |
| <a id="property-stemelement"></a> `stemElement` | `string` | - |
| <a id="property-branchelement"></a> `branchElement` | `string` | - |
| <a id="property-nayin"></a> `naYin` | `string` | Na yin (nạp âm) name, e.g. "Lộ Bàng Thổ" / "Earth by the Roadside" / "路旁土". |
| <a id="property-nayinelement"></a> `naYinElement` | `string` | - |

***

### LunarResult

Result of `toLunar`.

#### Properties

| Property | Type | Description |
| ------ | ------ | ------ |
| <a id="property-year-1"></a> `year` | `number` | Lunar year, month (1-12), day (1-30). |
| <a id="property-month-1"></a> `month` | `number` | - |
| <a id="property-day-1"></a> `day` | `number` | - |
| <a id="property-leap"></a> `leap` | `boolean` | True when the month is the intercalary (leap) month. |
| <a id="property-solardate"></a> `solarDate` | `string` | The Gregorian date that was converted, "YYYY-MM-DD". |
| <a id="property-country-1"></a> `country` | `string` | - |
| <a id="property-timezone-1"></a> `timeZone` | `number` | - |
| <a id="property-yearname"></a> `yearName` | `string` | Stem-branch of the lunar year, month and day, in `lang` and `terms` ("Ding Wei" by default in English). |
| <a id="property-monthname"></a> `monthName` | `string` | - |
| <a id="property-dayname"></a> `dayName` | `string` | - |
| <a id="property-zodiac"></a> `zodiac` | `string` | Zodiac animal of the lunar year (Cat in Vietnam, Rabbit elsewhere). |
| <a id="property-solarterm"></a> `solarTerm` | `string` | Solar term in effect on that day (by local date), in `lang`. |
| <a id="property-lang-1"></a> `lang` | [`Lang`](#lang) | - |

***

### LunarInput

A lunar date to convert back.

#### Properties

| Property | Type | Description |
| ------ | ------ | ------ |
| <a id="property-year-2"></a> `year` | `number` | - |
| <a id="property-month-2"></a> `month` | `number` | - |
| <a id="property-day-2"></a> `day` | `number` | - |
| <a id="property-leap-1"></a> `leap?` | `boolean` | The intercalary month of that number. Default false. |

***

### SolarResult

Result of `toSolar`.

#### Extends

- [`YMD`](#ymd)

#### Properties

| Property | Type | Description | Inherited from |
| ------ | ------ | ------ | ------ |
| <a id="property-year-3"></a> `year` | `number` | - | [`YMD`](#ymd).[`year`](#property-year) |
| <a id="property-month-3"></a> `month` | `number` | - | [`YMD`](#ymd).[`month`](#property-month) |
| <a id="property-day-3"></a> `day` | `number` | - | [`YMD`](#ymd).[`day`](#property-day) |
| <a id="property-date"></a> `date` | `string` | "YYYY-MM-DD". | - |

***

### SolarTerm

One of the 24 solar terms with its exact moment.

#### Properties

| Property | Type | Description |
| ------ | ------ | ------ |
| <a id="property-index-1"></a> `index` | `number` | 0-23 by solar longitude: 0 = Vernal Equinox (Xuân Phân), 21 = Start of Spring (Lập Xuân). |
| <a id="property-longitude"></a> `longitude` | `number` | Solar longitude in degrees (index × 15). |
| <a id="property-name-1"></a> `name` | `string` | Name in `lang`. |
| <a id="property-namevi"></a> `nameVi` | `string` | Vietnamese name, always present. |
| <a id="property-kind"></a> `kind` | `"jie"` \| `"qi"` | "jie" for the 12 sectional terms that start a BaZi month, "qi" for the 12 midpoint terms. |
| <a id="property-date-1"></a> `date` | `string` | Local date and time (minute precision) in the chosen country. |
| <a id="property-time"></a> `time` | `string` | - |
| <a id="property-timezone-2"></a> `timeZone` | `number` | - |

***

### AuspiciousHour

One double hour of `auspiciousHours`.

#### Properties

| Property | Type | Description |
| ------ | ------ | ------ |
| <a id="property-index-2"></a> `index` | `number` | Branch index of the hour: 0 = Tý (23:00 to 00:59) ... 11 = Hợi (21:00 to 22:59). |
| <a id="property-branch-1"></a> `branch` | `string` | Branch name in `lang` and `terms` ("Zi", "子", "Tý"). |
| <a id="property-animal-1"></a> `animal` | `string` | Zodiac animal of the branch in `lang` (the Mão hour is the Cat hour in Vietnam). |
| <a id="property-range-1"></a> `range` | `string` | Clock hours the double hour covers, Vietnam time: "23:00-00:59". |
| <a id="property-auspicious"></a> `auspicious` | `boolean` | True for an auspicious hour (giờ hoàng đạo), false for an inauspicious one (giờ hắc đạo). |
| <a id="property-spirit"></a> `spirit` | `string` | The spirit presiding over the hour, in `lang` and `terms`: "Qing Long" (pinyin), "青龙" (han, zh) or "Thanh Long" (vi). The sixth spirit is Bao Guang (宝光) in the hour tables of the books; Vietnamese almanacs call it Kim Đường. |
| <a id="property-spiritindex"></a> `spiritIndex` | `number` | Position of the spirit in the cycle, 0 = Qing Long (Thanh Long) ... 11 = Gou Chen (Câu Trần). |

***

### AuspiciousHoursResult

Result of `auspiciousHours`.

#### Properties

| Property | Type | Description |
| ------ | ------ | ------ |
| <a id="property-date-2"></a> `date` | `string` | The Gregorian date, "YYYY-MM-DD". |
| <a id="property-day-4"></a> `day` | `string` | Stem-branch of the day in `lang` and `terms` ("Bing Chen", "丙辰", "Bính Thìn"). |
| <a id="property-daybranch"></a> `dayBranch` | `string` | Branch of the day, which alone decides the hours. |
| <a id="property-hours"></a> `hours` | [`AuspiciousHour`](#auspicioushour)[] | The twelve double hours, Tý first; six of them are auspicious. |
| <a id="property-lang-2"></a> `lang` | [`Lang`](#lang) | - |

## Type Aliases

### Lang

```ts
type Lang = "vi" | "en" | "zh";
```

Output language: Vietnamese, English or Simplified Chinese.

***

### DateInput

```ts
type DateInput = 
  | Date
  | string
  | {
  year: number;
  month: number;
  day: number;
};
```

A Gregorian date: a `Date` (read in local time), "YYYY-MM-DD", or `{ year, month, day }`.

***

### Terms

```ts
type Terms = "vi" | "pinyin" | "han";
```

How names WITHOUT an established English translation are written when
`lang` is "en": the ten stems, twelve branches, their sexagenary pairs and
the Four Transformations.

- "pinyin" (default): Jia, Zi, "Geng Wu", "Hua Lu". Pinyin without tone
  marks, as English BaZi and Zi Wei books write them (note that 戊 and 午
  are both "Wu", 己 and 忌 both "Ji").
- "han": Chinese characters 庚, 午, "庚午", "化禄".
- "vi": Sino-Vietnamese, as printed in Vietnamese almanacs: Canh, Ngọ,
  "Canh Ngọ", "Hóa Lộc" (the behaviour of version 0.2.0).

Names that have an English translation (elements, zodiac animals, solar
terms, palaces, stars) are English whatever `terms` says. `lang` "vi" is
always Vietnamese and "zh" always Chinese characters; `terms` is ignored.
