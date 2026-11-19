[Nhat Nguyet API reference](../README.md) / @nhatnguyet/tu-vi

# @nhatnguyet/tu-vi

Zi Wei Dou Shu (Purple Star Astrology, Tử Vi): the twelve palaces and their
stars, ten-year and yearly periods, yearly stars, chart patterns, SVG and
text output.

```bash
npm i @nhatnguyet/tu-vi       # or the English-named alias @nhatnguyet/ziwei
```

This page lists the English API. The original Vietnamese-named functions
(`lapLaSoTuVi`, `daiVan`, `tinhHanNam`...) and the iztro-compatible entry
point `@nhatnguyet/tu-vi/iztro` are described in the
[package README](https://github.com/Nhat-Nguyet/nhatnguyet-lunar-ziwei-bazi-numerology/tree/main/js/packages/tu-vi#readme)
and in [Migrating from iztro](https://github.com/Nhat-Nguyet/nhatnguyet-lunar-ziwei-bazi-numerology/blob/main/docs/chuyen-tu-iztro.md).

## Functions

### palaceOf()

```ts
function palaceOf(
   chart, 
   ref, 
   opts?
): ZiWeiPalace | undefined;
```

A palace by index (0 = Tý) or name in any of the three languages; undefined when the name is unknown.

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `chart` | `ChartLike` |
| `ref` | [`PalaceRef`](#palaceref) |
| `opts?` | [`LookupOptions`](#lookupoptions) |

#### Returns

[`ZiWeiPalace`](#ziweipalace) \| `undefined`

***

### starOf()

```ts
function starOf(
   chart, 
   name, 
   opts?
): 
  | {
  star: ZiWeiStar;
  palace: ZiWeiPalace;
}
  | undefined;
```

A star by name in any of the three languages, with the palace it sits in; undefined when absent.

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `chart` | `ChartLike` |
| `name` | `string` |
| `opts?` | [`LookupOptions`](#lookupoptions) |

#### Returns

  \| \{
  `star`: [`ZiWeiStar`](#ziweistar);
  `palace`: [`ZiWeiPalace`](#ziweipalace);
\}
  \| `undefined`

***

### surroundingPalaces()

```ts
function surroundingPalaces(
   chart, 
   ref, 
   opts?
): SurroundingPalaces;
```

The three harmonies and the opposite palace (三方四正, tam phương tứ chính) of a palace.

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `chart` | `ChartLike` |
| `ref` | [`PalaceRef`](#palaceref) |
| `opts?` | [`LookupOptions`](#lookupoptions) |

#### Returns

[`SurroundingPalaces`](#surroundingpalaces)

***

### flankingPalaces()

```ts
function flankingPalaces(
   chart, 
   ref, 
   opts?
): FlankingPalaces;
```

The two palaces flanking a palace (giáp cung): index -1 and +1.

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `chart` | `ChartLike` |
| `ref` | [`PalaceRef`](#palaceref) |
| `opts?` | [`LookupOptions`](#lookupoptions) |

#### Returns

[`FlankingPalaces`](#flankingpalaces)

***

### palaceHas()

```ts
function palaceHas(
   chart, 
   ref, 
   stars
): boolean;
```

The palace holds every star in `stars` (names in any of the three languages).

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `chart` | `ChartLike` |
| `ref` | [`PalaceRef`](#palaceref) |
| `stars` | `string`[] |

#### Returns

`boolean`

***

### palaceHasOneOf()

```ts
function palaceHasOneOf(
   chart, 
   ref, 
   stars
): boolean;
```

The palace holds at least one star in `stars`.

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `chart` | `ChartLike` |
| `ref` | [`PalaceRef`](#palaceref) |
| `stars` | `string`[] |

#### Returns

`boolean`

***

### palaceNotHave()

```ts
function palaceNotHave(
   chart, 
   ref, 
   stars
): boolean;
```

The palace holds none of `stars`.

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `chart` | `ChartLike` |
| `ref` | [`PalaceRef`](#palaceref) |
| `stars` | `string`[] |

#### Returns

`boolean`

***

### palaceIsEmpty()

```ts
function palaceIsEmpty(
   chart, 
   ref, 
   exceptStars?
): boolean;
```

No major star in the palace (vô chính diệu), unless one of `exceptStars` is there.

#### Parameters

| Parameter | Type | Default value |
| ------ | ------ | ------ |
| `chart` | `ChartLike` | `undefined` |
| `ref` | [`PalaceRef`](#palaceref) | `undefined` |
| `exceptStars?` | `string`[] | `[]` |

#### Returns

`boolean`

***

### flyingTransformations()

```ts
function flyingTransformations(
   chart, 
   ref, 
   opts?
): FlyingTransformation[];
```

The four flying transformations of a palace: its stem transforms four stars
(the engine's Four Transformations table), and each lands where that star sits.

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `chart` | `ChartLike` |
| `ref` | [`PalaceRef`](#palaceref) |
| `opts?` | [`LookupOptions`](#lookupoptions) |

#### Returns

[`FlyingTransformation`](#flyingtransformation)[]

***

### fliesTo()

```ts
function fliesTo(
   chart, 
   from, 
   to, 
   types
): boolean;
```

The stem of `from` transforms, with every type in `types`, a star sitting in `to`.

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `chart` | `ChartLike` |
| `from` | [`PalaceRef`](#palaceref) |
| `to` | [`PalaceRef`](#palaceref) |
| `types` | `string` \| `string`[] |

#### Returns

`boolean`

***

### selfTransformed()

```ts
function selfTransformed(
   chart, 
   ref, 
   types?
): boolean;
```

Self-transformation (自化): the palace stem transforms, with every type in `types` (default: any of the four), a star in the same palace.

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `chart` | `ChartLike` |
| `ref` | [`PalaceRef`](#palaceref) |
| `types?` | `string` \| `string`[] |

#### Returns

`boolean`

***

### horoscope()

```ts
function horoscope(chart, opts?): ZiWeiHoroscope;
```

Horoscope of a date (default: today): the decade (đại vận), minor limit
(tiểu vận), year (lưu niên, with its Four Transformations and moving stars)
and month (nguyệt hạn, by the engine's Đẩu Quân rule). The lunar date is
read in the Vietnamese calendar, like the chart.

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `chart` | `ChartLike` |
| `opts?` | `object` & [`LookupOptions`](#lookupoptions) |

#### Returns

[`ZiWeiHoroscope`](#ziweihoroscope)

#### Example

```ts
horoscope(castZiWei({ date: "1990-09-19", time: "20:00", gender: "male" }), { date: "2026-11-19" }).year.palace
```

***

### withZiWeiMethods()

```ts
function withZiWeiMethods(chart): FunctionalZiWeiChart;
```

Attach the lookup methods to a chart from `castZiWei` (non-enumerable: JSON is unchanged).

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `chart` | [`ZiWeiChart`](#ziweichart) |

#### Returns

[`FunctionalZiWeiChart`](#functionalziweichart)

***

### castZiWei()

```ts
function castZiWei(input): FunctionalZiWeiChart;
```

Cast a Zi Wei Dou Shu (Tử Vi) chart, with lookup methods: `horoscope({ date })`,
`palace(ref)`, `star(name)`, `surroundingPalaces(ref)`, `flankingPalaces(ref)`,
`flyingTransformations(ref)`. Same data as the plain chart (methods are not in JSON).

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `input` | [`ZiWeiInput`](#ziweiinput) |

#### Returns

[`FunctionalZiWeiChart`](#functionalziweichart)

#### Example

```ts
castZiWei({ date: "1990-09-19", time: "20:00", gender: "male" }).horoscope({ date: "2026-11-19" }).year.palace
```

***

### parseGender()

```ts
function parseGender(g): Gender;
```

Normalise a gender option to "male" / "female"; throws on anything else.

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `g` | `unknown` |

#### Returns

[`Gender`](#gender)

***

### schoolNote()

```ts
function schoolNote(schools, lang): string;
```

Câu ghi chú nêu các lựa chọn phái khác mặc định (rỗng khi lá số mặc định).

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `schools` | `ZiWeiSchools` \| `undefined` |
| `lang` | [`Lang`](am-lich.md#lang) |

#### Returns

`string`

***

### localizeZiWei()

```ts
function localizeZiWei(
   raw, 
   lang?, 
   extra?
): ZiWeiChart;
```

Turn a raw `LaSoTuVi` into the English-API shape in `lang`.

#### Parameters

| Parameter | Type | Default value |
| ------ | ------ | ------ |
| `raw` | `LaSoTuVi` | `undefined` |
| `lang?` | [`Lang`](am-lich.md#lang) | `"en"` |
| `extra?` | \{ `time?`: `string` \| `null`; `viewYear?`: `number`; `terms?`: [`Terms`](am-lich.md#terms); `timeZone?`: `number`; `country?`: `string` \| `null`; \} | `{}` |
| `extra.time?` | `string` \| `null` | `undefined` |
| `extra.viewYear?` | `number` | `undefined` |
| `extra.terms?` | [`Terms`](am-lich.md#terms) | `undefined` |
| `extra.timeZone?` | `number` | `undefined` |
| `extra.country?` | `string` \| `null` | `undefined` |

#### Returns

[`ZiWeiChart`](#ziweichart)

***

### ziWeiSvg()

```ts
function ziWeiSvg(chart, opts?): string;
```

Draw a Zi Wei chart (from `castZiWei` or `lapLaSoTuVi`) as a self-contained
SVG string. Wraps `veLaSoSvg` (`renderChartSvg`).

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `chart` | `LaSoTuVi` \| [`ZiWeiChart`](#ziweichart) |
| `opts?` | [`SvgOptions`](#svgoptions) |

#### Returns

`string`

#### Example

```ts
writeFileSync("chart.svg", ziWeiSvg(castZiWei({ date: "1990-09-19", time: "20:00", gender: "male" }), { theme: "dark" }))
```

***

### decadeLuck()

```ts
function decadeLuck(chart, opts?): DecadeLuck[];
```

The twelve ten-year periods. Wraps `daiVan`.

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `chart` | `ChartLike` |
| `opts?` | \{ `lang?`: [`Lang`](am-lich.md#lang); `terms?`: [`Terms`](am-lich.md#terms); \} |
| `opts.lang?` | [`Lang`](am-lich.md#lang) |
| `opts.terms?` | [`Terms`](am-lich.md#terms) |

#### Returns

[`DecadeLuck`](#decadeluck)[]

***

### yearlyLuck()

```ts
function yearlyLuck(
   chart, 
   year?, 
   opts?
): YearlyLuck;
```

Facts of a viewing year. Wraps `tinhHanNam`. `year` defaults to the chart's `viewYear`.

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `chart` | `ChartLike` |
| `year?` | `number` |
| `opts?` | \{ `lang?`: [`Lang`](am-lich.md#lang); `terms?`: [`Terms`](am-lich.md#terms); \} |
| `opts.lang?` | [`Lang`](am-lich.md#lang) |
| `opts.terms?` | [`Terms`](am-lich.md#terms) |

#### Returns

[`YearlyLuck`](#yearlyluck)

***

### yearlyStars()

```ts
function yearlyStars(
   chart, 
   year?, 
   opts?
): YearlyStar[];
```

The five yearly moving stars. Wraps `tinhSaoLuu`.

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `chart` | `ChartLike` |
| `year?` | `number` |
| `opts?` | \{ `lang?`: [`Lang`](am-lich.md#lang); `terms?`: [`Terms`](am-lich.md#terms); \} |
| `opts.lang?` | [`Lang`](am-lich.md#lang) |
| `opts.terms?` | [`Terms`](am-lich.md#terms) |

#### Returns

[`YearlyStar`](#yearlystar)[]

***

### findPatterns()

```ts
function findPatterns(chart, opts?): ZiWeiPattern[];
```

Recognise named patterns on a chart. Wraps `nhanDienCachCuc`.

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `chart` | `ChartLike` |
| `opts?` | \{ `lang?`: [`Lang`](am-lich.md#lang); `terms?`: [`Terms`](am-lich.md#terms); \} |
| `opts.lang?` | [`Lang`](am-lich.md#lang) |
| `opts.terms?` | [`Terms`](am-lich.md#terms) |

#### Returns

[`ZiWeiPattern`](#ziweipattern)[]

***

### chartToText()

```ts
function chartToText(chart, opts?): string;
```

Print a Zi Wei Dou Shu chart as compact markdown for a language model: the
birth data, then one block per palace (from the Life palace, in the usual
order), optionally the ten-year periods, named patterns and a viewing year.
Only computed facts; no interpretation. Ends with the source line.

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `chart` | \| `LaSoTuVi` \| [`ZiWeiChart`](#ziweichart) \| `Omit`\<[`ZiWeiChart`](#ziweichart), `"toSvg"`\> |
| `opts?` | [`ChartTextOptions`](#charttextoptions) |

#### Returns

`string`

#### Example

```ts
chartToText(castZiWei({ date: "1990-09-19", time: "20:00", gender: "male" }), { lang: "en" })
```

## Variables

### STAR\_GROUP\_EN

```ts
const STAR_GROUP_EN: Readonly<Record<string, StarGroup>>;
```

English codes of the core's minor-star groups (`nhom` of the raw chart):
"malefic" are the six malefic stars (Kình Dương, Đà La, Địa Không, Địa Kiếp,
Hỏa Tinh, Linh Tinh), "auspicious" the six auspicious stars plus Lộc Tồn and
Thiên Mã, "miscellaneous" every other minor star.

***

### YEARLY\_STAR\_CODE\_EN

```ts
const YEARLY_STAR_CODE_EN: Readonly<Record<string, string>>;
```

English codes of the five yearly moving stars (the core's `ma`).

***

### SOURCE\_LINE

```ts
const SOURCE_LINE: Readonly<Record<Lang, string>>;
```

Dòng ghi nguồn cuối mọi văn bản, theo ngôn ngữ.

***

### ziWeiToText

```ts
const ziWeiToText: (chart, opts) => string = chartToText;
```

Same as `chartToText` (explicit name when several packages are imported together).

Print a Zi Wei Dou Shu chart as compact markdown for a language model: the
birth data, then one block per palace (from the Life palace, in the usual
order), optionally the ten-year periods, named patterns and a viewing year.
Only computed facts; no interpretation. Ends with the source line.

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `chart` | \| `LaSoTuVi` \| [`ZiWeiChart`](#ziweichart) \| `Omit`\<[`ZiWeiChart`](#ziweichart), `"toSvg"`\> |
| `opts?` | [`ChartTextOptions`](#charttextoptions) |

#### Returns

`string`

#### Example

```ts
chartToText(castZiWei({ date: "1990-09-19", time: "20:00", gender: "male" }), { lang: "en" })
```

## Interfaces

### LookupOptions

Options shared by the helpers.

#### Properties

| Property | Type |
| ------ | ------ |
| <a id="property-lang"></a> `lang?` | [`Lang`](am-lich.md#lang) |
| <a id="property-terms"></a> `terms?` | [`Terms`](am-lich.md#terms) |

***

### ZiWeiTransformation

Where a transformed star sits.

#### Extended by

- [`FlyingTransformation`](#flyingtransformation)

#### Properties

| Property | Type | Description |
| ------ | ------ | ------ |
| <a id="property-type"></a> `type` | `string` | "Hua Lu", "Hua Quan", "Hua Ke", "Hua Ji" (en, pinyin), 化禄... (zh), Hóa Lộc... (vi). |
| <a id="property-star"></a> `star` | `string` | - |
| <a id="property-palaceindex"></a> `palaceIndex` | `number` \| `null` | Palace holding the star, or null when the star is not on the chart. |
| <a id="property-palace"></a> `palace` | `string` \| `null` | - |

***

### FlyingTransformation

A flying transformation of one palace (phi tinh): the palace stem transforms a star, wherever it sits.

#### Extends

- [`ZiWeiTransformation`](#ziweitransformation)

#### Properties

| Property | Type | Description | Inherited from |
| ------ | ------ | ------ | ------ |
| <a id="property-type-1"></a> `type` | `string` | "Hua Lu", "Hua Quan", "Hua Ke", "Hua Ji" (en, pinyin), 化禄... (zh), Hóa Lộc... (vi). | [`ZiWeiTransformation`](#ziweitransformation).[`type`](#property-type) |
| <a id="property-star-1"></a> `star` | `string` | - | [`ZiWeiTransformation`](#ziweitransformation).[`star`](#property-star) |
| <a id="property-palaceindex-1"></a> `palaceIndex` | `number` \| `null` | Palace holding the star, or null when the star is not on the chart. | [`ZiWeiTransformation`](#ziweitransformation).[`palaceIndex`](#property-palaceindex) |
| <a id="property-palace-1"></a> `palace` | `string` \| `null` | - | [`ZiWeiTransformation`](#ziweitransformation).[`palace`](#property-palace) |
| <a id="property-self"></a> `self` | `boolean` | The star sits in the source palace itself (self-transformation, 自化). | - |

***

### HoroscopeScope

One scope of a horoscope.

#### Properties

| Property | Type | Description |
| ------ | ------ | ------ |
| <a id="property-palaceindex-2"></a> `palaceIndex` | `number` | - |
| <a id="property-branch"></a> `branch` | `string` | - |
| <a id="property-palace-2"></a> `palace` | `string` | Natal name of the palace the scope falls on. |
| <a id="property-stembranch"></a> `stemBranch` | `string` | Decade and minor limit: the palace's stem-branch. Year and month: the year and month pillars. |
| <a id="property-palacenames"></a> `palaceNames` | `string`[] | The twelve palace names (index 0 = Tý) when this scope's palace is taken as the Life palace. |
| <a id="property-transformations"></a> `transformations` | [`ZiWeiTransformation`](#ziweitransformation)[] | Decade and minor limit: the transformations of the palace stem; year: of the year stem; month: [] (not computed by the engine). |

***

### ZiWeiHoroscope

Horoscope of one date. `day` and `hour` are null: the engine has no daily or hourly limits.

#### Properties

| Property | Type | Description |
| ------ | ------ | ------ |
| <a id="property-date"></a> `date` | `string` | Gregorian date, "YYYY-MM-DD". |
| <a id="property-lunar"></a> `lunar` | `object` | Lunar date (Vietnamese calendar, UTC+7). The leap month counts as the month it repeats. |
| `lunar.year` | `number` | - |
| `lunar.month` | `number` | - |
| `lunar.day` | `number` | - |
| `lunar.leap` | `boolean` | - |
| <a id="property-age"></a> `age` | `number` | East Asian age (1 at birth) in that lunar year. |
| <a id="property-decade"></a> `decade` | [`HoroscopeScope`](#horoscopescope) & `object` \| `null` | The ten-year period, or null before the first period (the engine has no childhood-limit rule) or after the twelfth. |
| <a id="property-minorlimit"></a> `minorLimit` | [`HoroscopeScope`](#horoscopescope) | - |
| <a id="property-year"></a> `year` | [`HoroscopeScope`](#horoscopescope) & `object` | - |
| <a id="property-month"></a> `month` | [`HoroscopeScope`](#horoscopescope) & `object` | - |
| <a id="property-day"></a> `day` | `null` | - |
| <a id="property-hour"></a> `hour` | `null` | - |

***

### SurroundingPalaces

The target palace with its opposite (+6) and its two trines (wealth +8, career +4).

#### Properties

| Property | Type |
| ------ | ------ |
| <a id="property-target"></a> `target` | [`ZiWeiPalace`](#ziweipalace) |
| <a id="property-opposite"></a> `opposite` | [`ZiWeiPalace`](#ziweipalace) |
| <a id="property-wealth"></a> `wealth` | [`ZiWeiPalace`](#ziweipalace) |
| <a id="property-career"></a> `career` | [`ZiWeiPalace`](#ziweipalace) |

***

### FlankingPalaces

The two palaces next to a palace (index -1 and +1).

#### Properties

| Property | Type |
| ------ | ------ |
| <a id="property-previous"></a> `previous` | [`ZiWeiPalace`](#ziweipalace) |
| <a id="property-next"></a> `next` | [`ZiWeiPalace`](#ziweipalace) |

***

### FunctionalZiWeiChart

A chart from `castZiWei` with lookup methods (non-enumerable; JSON is unchanged).

#### Extends

- [`ZiWeiChart`](#ziweichart)

#### Methods

##### horoscope()

```ts
horoscope(opts?): ZiWeiHoroscope;
```

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `opts?` | `object` & [`LookupOptions`](#lookupoptions) |

###### Returns

[`ZiWeiHoroscope`](#ziweihoroscope)

##### palace()

```ts
palace(ref): ZiWeiPalace | undefined;
```

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `ref` | [`PalaceRef`](#palaceref) |

###### Returns

[`ZiWeiPalace`](#ziweipalace) \| `undefined`

##### star()

```ts
star(name): 
  | {
  star: ZiWeiStar;
  palace: ZiWeiPalace;
}
  | undefined;
```

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `name` | `string` |

###### Returns

  \| \{
  `star`: [`ZiWeiStar`](#ziweistar);
  `palace`: [`ZiWeiPalace`](#ziweipalace);
\}
  \| `undefined`

##### surroundingPalaces()

```ts
surroundingPalaces(ref): SurroundingPalaces;
```

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `ref` | [`PalaceRef`](#palaceref) |

###### Returns

[`SurroundingPalaces`](#surroundingpalaces)

##### flankingPalaces()

```ts
flankingPalaces(ref): FlankingPalaces;
```

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `ref` | [`PalaceRef`](#palaceref) |

###### Returns

[`FlankingPalaces`](#flankingpalaces)

##### flyingTransformations()

```ts
flyingTransformations(ref, opts?): FlyingTransformation[];
```

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `ref` | [`PalaceRef`](#palaceref) |
| `opts?` | [`LookupOptions`](#lookupoptions) |

###### Returns

[`FlyingTransformation`](#flyingtransformation)[]

##### toSvg()

```ts
toSvg(opts?): string;
```

Draw this chart as a self-contained SVG in the chart's `lang` (non-enumerable, not in JSON).

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `opts?` | [`SvgOptions`](#svgoptions) |

###### Returns

`string`

###### Inherited from

[`ZiWeiChart`](#ziweichart).[`toSvg`](#tosvg-1)

#### Properties

| Property | Type | Description | Inherited from |
| ------ | ------ | ------ | ------ |
| <a id="property-lang-1"></a> `lang` | [`Lang`](am-lich.md#lang) | - | [`ZiWeiChart`](#ziweichart).[`lang`](#property-lang-3) |
| <a id="property-terms-1"></a> `terms` | [`Terms`](am-lich.md#terms) | How stems, branches and transformations are written (see `ZiWeiInput.terms`). | [`ZiWeiChart`](#ziweichart).[`terms`](#property-terms-3) |
| <a id="property-name"></a> `name` | `string` | - | [`ZiWeiChart`](#ziweichart).[`name`](#property-name-4) |
| <a id="property-gender"></a> `gender` | [`Gender`](#gender) | - | [`ZiWeiChart`](#ziweichart).[`gender`](#property-gender-2) |
| <a id="property-solardate"></a> `solarDate` | `string` | Birth date as entered, "YYYY-MM-DD". | [`ZiWeiChart`](#ziweichart).[`solarDate`](#property-solardate-1) |
| <a id="property-time"></a> `time` | `string` \| `null` | Birth time as entered, "HH:MM", or null when only `hourBranch` was given. | [`ZiWeiChart`](#ziweichart).[`time`](#property-time-2) |
| <a id="property-hour-1"></a> `hour` | [`HourBranch`](am-lich.md#hourbranch) | - | [`ZiWeiChart`](#ziweichart).[`hour`](#property-hour-2) |
| <a id="property-lunar-1"></a> `lunar` | `object` | Lunar birth date (Vietnamese calendar, UTC+7, unless `country` or `timeZone` says otherwise). | [`ZiWeiChart`](#ziweichart).[`lunar`](#property-lunar-2) |
| `lunar.year` | `number` | - | - |
| `lunar.month` | `number` | - | - |
| `lunar.day` | `number` | - | - |
| `lunar.leap` | `boolean` | - | - |
| <a id="property-timezone"></a> `timeZone?` | `number` | Time zone of the lunar calendar used, only when it is not UTC+7 (`country` or `timeZone` of the input). | [`ZiWeiChart`](#ziweichart).[`timeZone`](#property-timezone-2) |
| <a id="property-yearpillar"></a> `yearPillar` | `string` | Stem-branch of the lunar birth year. | [`ZiWeiChart`](#ziweichart).[`yearPillar`](#property-yearpillar-1) |
| <a id="property-yinyang"></a> `yinYang` | `string` | Yin/Yang and gender, e.g. "Yang Male". | [`ZiWeiChart`](#ziweichart).[`yinYang`](#property-yinyang-1) |
| <a id="property-bureau"></a> `bureau` | `object` | Element bureau (cục): number and name, e.g. 4, "Metal Four". | [`ZiWeiChart`](#ziweichart).[`bureau`](#property-bureau-1) |
| `bureau.number` | `number` | - | - |
| `bureau.name` | `string` | - | - |
| <a id="property-nayin"></a> `naYin` | `string` | Na yin of the birth year (bản mệnh). | [`ZiWeiChart`](#ziweichart).[`naYin`](#property-nayin-1) |
| <a id="property-lifepalace"></a> `lifePalace` | `number` | Palace index (0 = Tý) of the Life and Body palaces. | [`ZiWeiChart`](#ziweichart).[`lifePalace`](#property-lifepalace-1) |
| <a id="property-bodypalace"></a> `bodyPalace` | `number` | - | [`ZiWeiChart`](#ziweichart).[`bodyPalace`](#property-bodypalace-1) |
| <a id="property-palaces"></a> `palaces` | [`ZiWeiPalace`](#ziweipalace)[] | Twelve palaces, index 0 (Tý) to 11 (Hợi). | [`ZiWeiChart`](#ziweichart).[`palaces`](#property-palaces-1) |
| <a id="property-viewyear"></a> `viewYear` | `number` | - | [`ZiWeiChart`](#ziweichart).[`viewYear`](#property-viewyear-2) |
| <a id="property-notes"></a> `notes` | `string`[] | Conventions used (hour mapping, calendar), in `lang`. | [`ZiWeiChart`](#ziweichart).[`notes`](#property-notes-1) |
| <a id="property-raw"></a> `raw` | `LaSoTuVi` | The original Vietnamese-keyed object from `lapLaSoTuVi`. | [`ZiWeiChart`](#ziweichart).[`raw`](#property-raw-1) |
| <a id="property-schools"></a> `schools?` | `ZiWeiSchools` | School options used, only those that differ from the default; absent for a default chart. | [`ZiWeiChart`](#ziweichart).[`schools`](#property-schools-2) |

***

### ZiWeiInput

Input of `castZiWei`.

#### Properties

| Property | Type | Description |
| ------ | ------ | ------ |
| <a id="property-date-1"></a> `date` | [`DateInput`](am-lich.md#dateinput) | Gregorian birth date: "YYYY-MM-DD", a Date (local time) or { year, month, day }. |
| <a id="property-time-1"></a> `time?` | `string` \| `number` | Clock time of birth, "HH:MM" (24 h). Mapped to its double hour by the package's own rule: Tý is 23:00 to 00:59, Sửu 01:00 to 02:59, and so on. Give either `time` or `hourBranch`. |
| <a id="property-hourbranch"></a> `hourBranch?` | `number` | Alternative to `time`: branch index of the birth hour, 0 = Tý ... 11 = Hợi. |
| <a id="property-gender-1"></a> `gender` | `string` | - |
| <a id="property-name-1"></a> `name?` | `string` | - |
| <a id="property-lang-2"></a> `lang?` | [`Lang`](am-lich.md#lang) | Language of names in the result. Default "en". |
| <a id="property-terms-2"></a> `terms?` | [`Terms`](am-lich.md#terms) | With lang "en": how stems, branches, the Four Transformations and the Tuần/Triệt voids are written: "pinyin" (default: "Geng Wu", "Hua Ji", "Xun Kong"), "han" ("庚午", "化忌", "旬空") or "vi" ("Canh Ngọ", "Hóa Kỵ", "Tuần"). With "vi" the pattern names also stay Sino-Vietnamese. |
| <a id="property-viewyear-1"></a> `viewYear?` | `number` | Year used by `yearlyLuck` / `yearlyStars` when no year is passed. Default: current year. |
| <a id="property-schools-1"></a> `schools?` | `ZiWeiSchools` | School options where the books disagree (Fire and Bell stars, leap month, Geng transformations, Celestial Kitchen, Celestial Injury and Messenger). Omitted: the default chart. See `ZiWeiSchools` and docs/schools.md. **Example** `castZiWei({ date: "1990-09-19", time: "20:00", gender: "male", schools: { fireBell: "quanshu" } })` |
| <a id="property-country"></a> `country?` | `string` | Whose lunar calendar turns the birth date into the lunar date the chart is built on: "VN" (default, UTC+7), "CN", "TW", "HK", "MO", "SG", "MY", "ID", "PH" (UTC+8), "KR", "JP" (UTC+9), as `toLunar`. The calendars differ on some days (Tết 1985, 2007, 2030...), and so does the chart. **Example** `castZiWei({ date: "1985-01-21", time: "10:00", gender: "male", country: "CN" })` |
| <a id="property-timezone-1"></a> `timeZone?` | `number` | Time zone in hours, instead of `country`. |

***

### ZiWeiStar

A star placed in a palace.

#### Properties

| Property | Type | Description |
| ------ | ------ | ------ |
| <a id="property-name-2"></a> `name` | `string` | Name in `lang`. |
| <a id="property-namevi"></a> `nameVi` | `string` | Vietnamese name (stable key). |
| <a id="property-kind"></a> `kind` | [`StarKind`](#starkind) | "major" (14 main stars), "minor", "growth" (Tràng Sinh ring), "year-ring" (Thái Tuế ring), "scholar" (Bác Sỹ ring). |
| <a id="property-group"></a> `group?` | [`StarGroup`](#stargroup) | Minor stars only: "malefic", "auspicious" or "miscellaneous" (see `STAR_GROUP_EN`). |
| <a id="property-brightness"></a> `brightness?` | `string` | Brightness of a major star: Exalted, Prosperous, Favorable, Neutral, Weak (in `lang`). |
| <a id="property-transformation"></a> `transformation?` | `string` | One of the Four Transformations: "Hua Lu", "Hua Quan", "Hua Ke", "Hua Ji" (en, pinyin), 化禄... (zh), Hóa Lộc... (vi). |

***

### ZiWeiPalace

One of the twelve palaces, fixed to an earthly branch.

#### Properties

| Property | Type | Description |
| ------ | ------ | ------ |
| <a id="property-index"></a> `index` | `number` | 0 = Tý ... 11 = Hợi. |
| <a id="property-branch-1"></a> `branch` | `string` | - |
| <a id="property-stembranch-1"></a> `stemBranch` | `string` | Stem-branch label of the palace. |
| <a id="property-name-3"></a> `name` | `string` | Palace name in `lang` (Life Palace, Siblings, Spouse...). |
| <a id="property-namevi-1"></a> `nameVi` | `string` | - |
| <a id="property-islife"></a> `isLife` | `boolean` | - |
| <a id="property-isbody"></a> `isBody` | `boolean` | - |
| <a id="property-tuan"></a> `tuan` | `boolean` | Xun Kong (旬空, Tuần) void marker. |
| <a id="property-triet"></a> `triet` | `boolean` | Jie Kong (截空, Triệt) void marker. |
| <a id="property-stars"></a> `stars` | [`ZiWeiStar`](#ziweistar)[] | - |

***

### ZiWeiChart

A Zi Wei Dou Shu chart in `lang`.

#### Extended by

- [`FunctionalZiWeiChart`](#functionalziweichart)

#### Methods

##### toSvg()

```ts
toSvg(opts?): string;
```

Draw this chart as a self-contained SVG in the chart's `lang` (non-enumerable, not in JSON).

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `opts?` | [`SvgOptions`](#svgoptions) |

###### Returns

`string`

#### Properties

| Property | Type | Description |
| ------ | ------ | ------ |
| <a id="property-lang-3"></a> `lang` | [`Lang`](am-lich.md#lang) | - |
| <a id="property-terms-3"></a> `terms` | [`Terms`](am-lich.md#terms) | How stems, branches and transformations are written (see `ZiWeiInput.terms`). |
| <a id="property-name-4"></a> `name` | `string` | - |
| <a id="property-gender-2"></a> `gender` | [`Gender`](#gender) | - |
| <a id="property-solardate-1"></a> `solarDate` | `string` | Birth date as entered, "YYYY-MM-DD". |
| <a id="property-time-2"></a> `time` | `string` \| `null` | Birth time as entered, "HH:MM", or null when only `hourBranch` was given. |
| <a id="property-hour-2"></a> `hour` | [`HourBranch`](am-lich.md#hourbranch) | - |
| <a id="property-lunar-2"></a> `lunar` | `object` | Lunar birth date (Vietnamese calendar, UTC+7, unless `country` or `timeZone` says otherwise). |
| `lunar.year` | `number` | - |
| `lunar.month` | `number` | - |
| `lunar.day` | `number` | - |
| `lunar.leap` | `boolean` | - |
| <a id="property-timezone-2"></a> `timeZone?` | `number` | Time zone of the lunar calendar used, only when it is not UTC+7 (`country` or `timeZone` of the input). |
| <a id="property-yearpillar-1"></a> `yearPillar` | `string` | Stem-branch of the lunar birth year. |
| <a id="property-yinyang-1"></a> `yinYang` | `string` | Yin/Yang and gender, e.g. "Yang Male". |
| <a id="property-bureau-1"></a> `bureau` | `object` | Element bureau (cục): number and name, e.g. 4, "Metal Four". |
| `bureau.number` | `number` | - |
| `bureau.name` | `string` | - |
| <a id="property-nayin-1"></a> `naYin` | `string` | Na yin of the birth year (bản mệnh). |
| <a id="property-lifepalace-1"></a> `lifePalace` | `number` | Palace index (0 = Tý) of the Life and Body palaces. |
| <a id="property-bodypalace-1"></a> `bodyPalace` | `number` | - |
| <a id="property-palaces-1"></a> `palaces` | [`ZiWeiPalace`](#ziweipalace)[] | Twelve palaces, index 0 (Tý) to 11 (Hợi). |
| <a id="property-viewyear-2"></a> `viewYear` | `number` | - |
| <a id="property-notes-1"></a> `notes` | `string`[] | Conventions used (hour mapping, calendar), in `lang`. |
| <a id="property-raw-1"></a> `raw` | `LaSoTuVi` | The original Vietnamese-keyed object from `lapLaSoTuVi`. |
| <a id="property-schools-2"></a> `schools?` | `ZiWeiSchools` | School options used, only those that differ from the default; absent for a default chart. |

***

### SvgOptions

Options for the SVG drawings.

#### Properties

| Property | Type | Description |
| ------ | ------ | ------ |
| <a id="property-theme"></a> `theme?` | `"light"` \| `"dark"` | "light" (default) or "dark". |
| <a id="property-width"></a> `width?` | `number` | Displayed width in px (default 720); the drawing scales by its viewBox. |
| <a id="property-lang-4"></a> `lang?` | [`Lang`](am-lich.md#lang) | Language of the drawing; default: the language of the chart. |
| <a id="property-terms-4"></a> `terms?` | [`Terms`](am-lich.md#terms) | With lang "en": "pinyin", "han" or "vi"; default: the chart's `terms`. |

***

### DecadeLuck

One ten-year period (đại vận).

#### Properties

| Property | Type | Description |
| ------ | ------ | ------ |
| <a id="property-order"></a> `order` | `number` | - |
| <a id="property-palaceindex-3"></a> `palaceIndex` | `number` | - |
| <a id="property-branch-2"></a> `branch` | `string` | - |
| <a id="property-palace-3"></a> `palace` | `string` | - |
| <a id="property-fromage"></a> `fromAge` | `number` | East Asian age (1 at birth), as the Tử Vi books count. |
| <a id="property-toage"></a> `toAge` | `number` | - |
| <a id="property-fromyear"></a> `fromYear` | `number` | Lunar years covered (birth lunar year + age - 1). |
| <a id="property-toyear"></a> `toYear` | `number` | - |
| <a id="property-majorstars"></a> `majorStars` | `string`[] | Major stars sitting in the palace (empty: no major star). |

***

### YearlyLuck

Facts of one viewing year (hạn năm).

#### Properties

| Property | Type | Description |
| ------ | ------ | ------ |
| <a id="property-year-1"></a> `year` | `number` | - |
| <a id="property-yearpillar-2"></a> `yearPillar` | `string` | - |
| <a id="property-age-1"></a> `age` | `number` | East Asian age in that year. |
| <a id="property-yearpalace"></a> `yearPalace` | `object` | Palace of the year branch (lưu niên). |
| `yearPalace.index` | `number` | - |
| `yearPalace.branch` | `string` | - |
| `yearPalace.palace` | `string` | - |
| <a id="property-minorlimit-1"></a> `minorLimit` | `object` | Minor limit (tiểu vận) palace. |
| `minorLimit.index` | `number` | - |
| `minorLimit.branch` | `string` | - |
| `minorLimit.palace` | `string` | - |
| <a id="property-decade-1"></a> `decade` | \| \{ `fromAge`: `number`; `toAge`: `number`; `palace`: `string`; \} \| `null` | The decade in effect, or null outside the twelve periods. |
| <a id="property-transformations-1"></a> `transformations` | `object`[] | The year's Four Transformations and where their stars sit (palace null when the star is not on the chart). |
| <a id="property-months"></a> `months` | `object`[] | Twelve lunar months and their palaces (nguyệt hạn). |

***

### YearlyStar

A yearly moving star (sao lưu).

#### Properties

| Property | Type | Description |
| ------ | ------ | ------ |
| <a id="property-code"></a> `code` | `string` | Stable identifier (English, not translated by `lang`): "yearly-taisui", "yearly-lucun", "yearly-qingyang", "yearly-tuoluo", "yearly-tianma". |
| <a id="property-name-5"></a> `name` | `string` | - |
| <a id="property-bystem"></a> `byStem` | `boolean` | Placed by the year STEM (false: by the year branch). |
| <a id="property-palaceindex-4"></a> `palaceIndex` | `number` | - |
| <a id="property-branch-3"></a> `branch` | `string` | - |
| <a id="property-palace-4"></a> `palace` | `string` | - |
| <a id="property-toyearpalace"></a> `toYearPalace` | `string` | Relation to the year palace, the minor limit and the decade palace: "same-palace", "opposite", "trine" or "". |
| <a id="property-tominorlimit"></a> `toMinorLimit` | `string` | - |
| <a id="property-todecade"></a> `toDecade` | `string` | - |

***

### ZiWeiPattern

A named chart pattern (cách cục).

#### Properties

| Property | Type | Description |
| ------ | ------ | ------ |
| <a id="property-name-6"></a> `name` | `string` | Name in `lang`: an English name translated from the Chinese one (Sino-Vietnamese with terms "vi"). |
| <a id="property-namevi-2"></a> `nameVi` | `string` | - |
| <a id="property-namehan"></a> `nameHan?` | `string` | Traditional Chinese name as in the source book. |
| <a id="property-condition"></a> `condition` | `string` | - |
| <a id="property-description"></a> `description` | `string` | - |
| <a id="property-palaceindex-5"></a> `palaceIndex` | `number` \| `null` | Palace the pattern applies to, or null. |
| <a id="property-palace-5"></a> `palace` | `string` \| `null` | - |
| <a id="property-group-1"></a> `group?` | `string` | Table of the Tử Vi Đẩu Số Toàn Thư it comes from: "wealth", "rank", "hardship"; absent otherwise. |
| <a id="property-hasvariants"></a> `hasVariants` | `boolean` | Schools word the condition differently. |
| <a id="property-quote"></a> `quote?` | `string` | Commentary from the book, original Chinese. |

***

### ChartTextOptions

Options of `chartToText`.

#### Properties

| Property | Type | Description |
| ------ | ------ | ------ |
| <a id="property-lang-5"></a> `lang?` | [`Lang`](am-lich.md#lang) | Language of the text; default: the chart's `lang` ("en" for a raw chart). |
| <a id="property-terms-5"></a> `terms?` | [`Terms`](am-lich.md#terms) | With lang "en": "pinyin", "han" or "vi" (see `ZiWeiInput.terms`); default: the chart's `terms`. |
| <a id="property-detail"></a> `detail?` | [`TextDetail`](#textdetail) | "full" (default): every star, the ten-year periods and named patterns. "summary": major stars and transformations. |
| <a id="property-year-2"></a> `year?` | `number` | Also print the facts of this viewing year (year palace, minor limit, yearly transformations). |

## Type Aliases

### PalaceRef

```ts
type PalaceRef = number | string;
```

A palace given by index (0 = Tý ... 11 = Hợi) or by name in Vietnamese, English or Chinese (case-insensitive).

***

### TransformationName

```ts
type TransformationName = string;
```

One of the Four Transformations: "Hua Lu" / "Lu" / "lu", "Hóa Lộc" / "Lộc", "化禄" / "禄"...

***

### Gender

```ts
type Gender = "male" | "female";
```

"male" or "female" (also accepted: "m", "f", "Nam", "Nữ").

***

### StarKind

```ts
type StarKind = "major" | "minor" | "growth" | "year-ring" | "scholar";
```

Kind of star on the chart.

***

### StarGroup

```ts
type StarGroup = "malefic" | "auspicious" | "miscellaneous";
```

Group of a minor star.

***

### TextDetail

```ts
type TextDetail = "summary" | "full";
```

How much to print: "summary" (major stars and transformations) or "full" (default).
