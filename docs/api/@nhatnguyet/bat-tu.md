[Nhat Nguyet API reference](../README.md) / @nhatnguyet/bat-tu

# @nhatnguyet/bat-tu

BaZi (Four Pillars, Bát Tự): pillars by solar term to the minute, hidden
stems, Ten Gods, symbolic stars, luck pillars, SVG and text output.

```bash
npm i @nhatnguyet/bat-tu      # or the English-named alias @nhatnguyet/bazi
```

This page lists the English API. The original Vietnamese-named functions
(`lapLaSoBatTu`, `tinhTieuVanBatTu`...) are described in the
[package README](https://github.com/Nhat-Nguyet/nhatnguyet-lunar-ziwei-bazi-numerology/tree/main/js/packages/bat-tu#readme).

## Functions

### baZiSvg()

```ts
function baZiSvg(chart, opts?): string;
```

Draw a BaZi chart (from `castBaZi` or `lapLaSoBatTu`) as a self-contained
SVG string. Wraps `veBatTuSvg` (`renderBaziSvg`).

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `chart` | `LaSoBatTu` \| [`BaZiChart`](#bazichart) |
| `opts?` | [`BaZiSvgOptions`](#bazisvgoptions) |

#### Returns

`string`

***

### localizeBaZi()

```ts
function localizeBaZi(
   raw, 
   lang?, 
   terms?
): BaZiChart;
```

Turn a raw `LaSoBatTu` into the English-API shape in `lang`.

#### Parameters

| Parameter | Type | Default value |
| ------ | ------ | ------ |
| `raw` | `LaSoBatTu` | `undefined` |
| `lang?` | [`Lang`](am-lich.md#lang) | `"en"` |
| `terms?` | [`Terms`](am-lich.md#terms) | `undefined` |

#### Returns

[`BaZiChart`](#bazichart)

***

### castBaZi()

```ts
function castBaZi(input): BaZiChart;
```

Cast a BaZi (Four Pillars) chart. The clock time is used as is: the day
pillar turns at 23:00, months follow solar terms, the year turns at Start
of Spring.

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `input` | [`BaZiInput`](#baziinput) |

#### Returns

[`BaZiChart`](#bazichart)

#### Example

```ts
castBaZi({ date: "1990-09-19", time: "20:00", gender: "male" })
```

***

### minorLuck()

```ts
function minorLuck(
   chart, 
   year, 
   opts?
): Pillar & object | null;
```

The minor luck pillar (tiểu vận) of a viewing year; null without a birth time. Wraps `tinhTieuVanBatTu`.

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `chart` | \| `LaSoBatTu` \| [`BaZiChart`](#bazichart) \| `Omit`\<[`BaZiChart`](#bazichart), `"toSvg"`\> |
| `year` | `number` |
| `opts?` | \{ `lang?`: [`Lang`](am-lich.md#lang); `terms?`: [`Terms`](am-lich.md#terms); \} |
| `opts.lang?` | [`Lang`](am-lich.md#lang) |
| `opts.terms?` | [`Terms`](am-lich.md#terms) |

#### Returns

[`Pillar`](am-lich.md#pillar) & `object` \| `null`

***

### chartToText()

```ts
function chartToText(chart, opts?): string;
```

Print a BaZi (Four Pillars) chart as compact markdown for a language model:
the birth data, one block per pillar, the luck pillars and (in "full") the
twelve stages and symbolic stars. Only computed facts; no interpretation.
Ends with the source line.

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `chart` | \| `LaSoBatTu` \| [`BaZiChart`](#bazichart) \| `Omit`\<[`BaZiChart`](#bazichart), `"toSvg"`\> |
| `opts?` | [`ChartTextOptions`](#charttextoptions) |

#### Returns

`string`

#### Example

```ts
chartToText(castBaZi({ date: "1990-09-19", time: "20:00", gender: "male" }))
```

## Variables

### SOURCE\_LINE

```ts
const SOURCE_LINE: Readonly<Record<Lang, string>>;
```

Dòng ghi nguồn cuối mọi văn bản, theo ngôn ngữ.

***

### baZiToText

```ts
const baZiToText: (chart, opts) => string = chartToText;
```

Same as `chartToText` (explicit name when several packages are imported together).

Print a BaZi (Four Pillars) chart as compact markdown for a language model:
the birth data, one block per pillar, the luck pillars and (in "full") the
twelve stages and symbolic stars. Only computed facts; no interpretation.
Ends with the source line.

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `chart` | \| `LaSoBatTu` \| [`BaZiChart`](#bazichart) \| `Omit`\<[`BaZiChart`](#bazichart), `"toSvg"`\> |
| `opts?` | [`ChartTextOptions`](#charttextoptions) |

#### Returns

`string`

#### Example

```ts
chartToText(castBaZi({ date: "1990-09-19", time: "20:00", gender: "male" }))
```

## Interfaces

### BaZiInput

Input of `castBaZi`.

#### Properties

| Property | Type | Description |
| ------ | ------ | ------ |
| <a id="property-date"></a> `date` | [`DateInput`](am-lich.md#dateinput) | Gregorian birth date: "YYYY-MM-DD", a Date (local time) or { year, month, day }. |
| <a id="property-time"></a> `time?` | `string` \| `number` \| `null` | Clock time of birth "HH:MM" (Vietnam time, UTC+7). Omit or null when unknown: the hour pillar is left out and the luck start is computed from noon. The DAY pillar changes at 23:00 (start of the Tý hour) unless `schools.ziHour` is "split-at-midnight". |
| <a id="property-gender"></a> `gender` | `string` | "male" or "female" (also "m", "f", "Nam", "Nữ"). Needed: luck pillars run by gender. |
| <a id="property-lang"></a> `lang?` | [`Lang`](am-lich.md#lang) | Language of names in the result. Default "en". |
| <a id="property-terms"></a> `terms?` | [`Terms`](am-lich.md#terms) | With lang "en": how stems and branches are written: "pinyin" (default, "Geng Wu"), "han" ("庚午") or "vi" ("Canh Ngọ"). See `Terms` in @nhatnguyet/am-lich. |
| <a id="property-schools"></a> `schools?` | `BaZiSchools` | School options. `ziHour`: "next-day-from-23" (default) or "split-at-midnight" (early and late Zi). See `BaZiSchools` and docs/schools.md. **Example** `castBaZi({ date: "2024-01-01", time: "23:30", gender: "male", schools: { ziHour: "split-at-midnight" } })` |

***

### BaZiPillar

A natal pillar with everything read from it.

#### Extends

- [`Pillar`](am-lich.md#pillar)

#### Properties

| Property | Type | Description | Inherited from |
| ------ | ------ | ------ | ------ |
| <a id="property-label"></a> `label` | `string` | e.g. "Geng Wu" (en), "Canh Ngọ" (vi) or "庚午" (zh). | [`Pillar`](am-lich.md#pillar).[`label`](am-lich.md#property-label) |
| <a id="property-stem"></a> `stem` | `string` | - | [`Pillar`](am-lich.md#pillar).[`stem`](am-lich.md#property-stem) |
| <a id="property-branch"></a> `branch` | `string` | - | [`Pillar`](am-lich.md#pillar).[`branch`](am-lich.md#property-branch) |
| <a id="property-stemindex"></a> `stemIndex` | `number` | - | [`Pillar`](am-lich.md#pillar).[`stemIndex`](am-lich.md#property-stemindex) |
| <a id="property-branchindex"></a> `branchIndex` | `number` | - | [`Pillar`](am-lich.md#pillar).[`branchIndex`](am-lich.md#property-branchindex) |
| <a id="property-stemelement"></a> `stemElement` | `string` | - | [`Pillar`](am-lich.md#pillar).[`stemElement`](am-lich.md#property-stemelement) |
| <a id="property-branchelement"></a> `branchElement` | `string` | - | [`Pillar`](am-lich.md#pillar).[`branchElement`](am-lich.md#property-branchelement) |
| <a id="property-nayin"></a> `naYin` | `string` | Na yin (nạp âm) name, e.g. "Lộ Bàng Thổ" / "Earth by the Roadside" / "路旁土". | [`Pillar`](am-lich.md#pillar).[`naYin`](am-lich.md#property-nayin) |
| <a id="property-nayinelement"></a> `naYinElement` | `string` | - | [`Pillar`](am-lich.md#pillar).[`naYinElement`](am-lich.md#property-nayinelement) |
| <a id="property-tengod"></a> `tenGod` | `string` | Ten God of the stem relative to the Day Master ("Day Master" on the day pillar). | - |
| <a id="property-hiddenstems"></a> `hiddenStems` | `object`[] | Stems hidden in the branch, main qi first. | - |
| <a id="property-stage"></a> `stage` | `string` | Twelve-stage position of the Day Master at this branch. | - |
| <a id="property-selfstage"></a> `selfStage` | `string` | Twelve-stage position of this pillar's own stem at its branch. | - |
| <a id="property-stars"></a> `stars` | `string`[] | Symbolic stars (thần sát) on this pillar. | - |

***

### LuckPillar

A ten-year luck pillar (đại vận).

#### Extends

- [`Pillar`](am-lich.md#pillar)

#### Properties

| Property | Type | Description | Inherited from |
| ------ | ------ | ------ | ------ |
| <a id="property-label-1"></a> `label` | `string` | e.g. "Geng Wu" (en), "Canh Ngọ" (vi) or "庚午" (zh). | [`Pillar`](am-lich.md#pillar).[`label`](am-lich.md#property-label) |
| <a id="property-stem-1"></a> `stem` | `string` | - | [`Pillar`](am-lich.md#pillar).[`stem`](am-lich.md#property-stem) |
| <a id="property-branch-1"></a> `branch` | `string` | - | [`Pillar`](am-lich.md#pillar).[`branch`](am-lich.md#property-branch) |
| <a id="property-stemindex-1"></a> `stemIndex` | `number` | - | [`Pillar`](am-lich.md#pillar).[`stemIndex`](am-lich.md#property-stemindex) |
| <a id="property-branchindex-1"></a> `branchIndex` | `number` | - | [`Pillar`](am-lich.md#pillar).[`branchIndex`](am-lich.md#property-branchindex) |
| <a id="property-stemelement-1"></a> `stemElement` | `string` | - | [`Pillar`](am-lich.md#pillar).[`stemElement`](am-lich.md#property-stemelement) |
| <a id="property-branchelement-1"></a> `branchElement` | `string` | - | [`Pillar`](am-lich.md#pillar).[`branchElement`](am-lich.md#property-branchelement) |
| <a id="property-nayin-1"></a> `naYin` | `string` | Na yin (nạp âm) name, e.g. "Lộ Bàng Thổ" / "Earth by the Roadside" / "路旁土". | [`Pillar`](am-lich.md#pillar).[`naYin`](am-lich.md#property-nayin) |
| <a id="property-nayinelement-1"></a> `naYinElement` | `string` | - | [`Pillar`](am-lich.md#pillar).[`naYinElement`](am-lich.md#property-nayinelement) |
| <a id="property-order"></a> `order` | `number` | - | - |
| <a id="property-tengod-1"></a> `tenGod` | `string` | - | - |
| <a id="property-stage-1"></a> `stage` | `string` | Day Master's stage at the luck pillar's branch. | - |
| <a id="property-fromage"></a> `fromAge` | `number` | Exact age (not East Asian age) when the pillar starts. | - |
| <a id="property-fromyear"></a> `fromYear` | `number` | - | - |
| <a id="property-toyear"></a> `toYear` | `number` | - | - |

***

### BaZiChart

A BaZi chart in `lang`.

#### Methods

##### toSvg()

```ts
toSvg(opts?): string;
```

Draw this chart as a self-contained SVG in the chart's `lang` (non-enumerable, not in JSON).

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `opts?` | [`BaZiSvgOptions`](#bazisvgoptions) |

###### Returns

`string`

#### Properties

| Property | Type | Description |
| ------ | ------ | ------ |
| <a id="property-lang-1"></a> `lang` | [`Lang`](am-lich.md#lang) | - |
| <a id="property-terms-1"></a> `terms` | [`Terms`](am-lich.md#terms) | How stems and branches are written (see `BaZiInput.terms`). |
| <a id="property-gender-1"></a> `gender` | `"male"` \| `"female"` | - |
| <a id="property-solardate"></a> `solarDate` | `string` | - |
| <a id="property-time-1"></a> `time` | `string` \| `null` | "HH:MM" or null when the birth time is unknown. |
| <a id="property-pillars"></a> `pillars` | `object` | - |
| `pillars.year` | [`BaZiPillar`](#bazipillar) | - |
| `pillars.month` | [`BaZiPillar`](#bazipillar) | - |
| `pillars.day` | [`BaZiPillar`](#bazipillar) | - |
| `pillars.hour` | [`BaZiPillar`](#bazipillar) \| `null` | - |
| <a id="property-daymaster"></a> `dayMaster` | `object` | - |
| `dayMaster.stem` | `string` | - |
| `dayMaster.element` | `string` | - |
| `dayMaster.yinYang` | `string` | - |
| <a id="property-solarterm"></a> `solarTerm` | `string` | Solar term in effect at birth, and the sectional term that opened the birth month. |
| <a id="property-monthterm"></a> `monthTerm` | `string` | - |
| <a id="property-pillaryear"></a> `pillarYear` | `number` | Gregorian year the year pillar belongs to (the year changes at Start of Spring, not at Tết). |
| <a id="property-conception"></a> `conception` | [`Pillar`](am-lich.md#pillar) | Conception pillar (thai nguyên). |
| <a id="property-lifepalace"></a> `lifePalace` | [`Pillar`](am-lich.md#pillar) \| `null` | Life palace (mệnh cung); null without a birth time. |
| <a id="property-symbolicstars"></a> `symbolicStars` | `object`[] | - |
| <a id="property-luck"></a> `luck` | `object` | - |
| `luck.direction` | `"forward"` \| `"backward"` | - |
| `luck.term` | `object` | Solar term used to count the starting age. |
| `luck.term.name` | `string` | - |
| `luck.term.date` | `string` | - |
| `luck.term.time` | `string` | - |
| `luck.days` | `number` | - |
| `luck.startAge` | `object` | - |
| `luck.startAge.years` | `number` | - |
| `luck.startAge.months` | `number` | - |
| `luck.startDate` | `string` | - |
| `luck.explanation` | `string` | - |
| `luck.pillars` | [`LuckPillar`](#luckpillar)[] | - |
| <a id="property-notes"></a> `notes` | `string`[] | - |
| <a id="property-raw"></a> `raw` | `LaSoBatTu` | The original Vietnamese-keyed object from `lapLaSoBatTu`. |
| <a id="property-schools-1"></a> `schools?` | `BaZiSchools` | School options used, only those that differ from the default; absent for a default chart. |

***

### BaZiSvgOptions

Options for the BaZi SVG drawing.

#### Properties

| Property | Type | Description |
| ------ | ------ | ------ |
| <a id="property-theme"></a> `theme?` | `"light"` \| `"dark"` | - |
| <a id="property-width"></a> `width?` | `number` | Displayed width in px (default 720). |
| <a id="property-lang-2"></a> `lang?` | [`Lang`](am-lich.md#lang) | Default: the language of the chart. |
| <a id="property-terms-2"></a> `terms?` | [`Terms`](am-lich.md#terms) | With lang "en": "pinyin", "han" or "vi"; default: the chart's `terms`. |
| <a id="property-name"></a> `name?` | `string` | Name printed at the top (a BaZi chart carries no name). |

***

### ChartTextOptions

Options of `chartToText`.

#### Properties

| Property | Type | Description |
| ------ | ------ | ------ |
| <a id="property-lang-3"></a> `lang?` | [`Lang`](am-lich.md#lang) | Language of the text; default: the chart's `lang` ("en" for a raw chart). |
| <a id="property-terms-3"></a> `terms?` | [`Terms`](am-lich.md#terms) | With lang "en": "pinyin", "han" or "vi" (see `BaZiInput.terms`); default: the chart's `terms`. |
| <a id="property-detail"></a> `detail?` | [`TextDetail`](#textdetail) | "full" (default): adds twelve stages, symbolic stars, conception pillar, life palace. "summary": pillars and luck pillars. |

## Type Aliases

### TextDetail

```ts
type TextDetail = "summary" | "full";
```

How much to print: "summary" (pillars and luck pillars) or "full" (default).
