[Nhat Nguyet API reference](../README.md) / @nhatnguyet/than-so-hoc

# @nhatnguyet/than-so-hoc

Pythagorean numerology from a full name and a birth date: life path,
expression, soul urge, personality, personal year and more, SVG and text
output.

```bash
npm i @nhatnguyet/than-so-hoc # or the English-named alias @nhatnguyet/numerology
```

This page lists the English API. The original Vietnamese-named functions
(`tinhHoSoThanSoHocSau`, `soDuongDoi`...) are described in the
[package README](https://github.com/Nhat-Nguyet/nhatnguyet-lunar-ziwei-bazi-numerology/tree/main/js/packages/than-so-hoc#readme).

## Functions

### numerologySvg()

```ts
function numerologySvg(r, opts?): string;
```

Draw a numerology profile (from `numerology`) as a self-contained SVG
string; the personal year is the year of `today`. Wraps `veThanSoHocSvg`
(`renderNumerologySvg`).

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `r` | \| [`NumerologyResult`](#numerologyresult) \| `Omit`\<[`NumerologyResult`](#numerologyresult), `"toSvg"`\> |
| `opts?` | [`NumerologySvgOptions`](#numerologysvgoptions) |

#### Returns

`string`

***

### numerology()

```ts
function numerology(input): NumerologyResult;
```

Pythagorean numerology profile.

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `input` | [`NumerologyInput`](#numerologyinput) |

#### Returns

[`NumerologyResult`](#numerologyresult)

#### Example

```ts
numerology({ name: "Nguyen Van An", birthDate: "1990-09-19", today: "2026-11-19" })
```

***

### chartToText()

```ts
function chartToText(profile, opts?): string;
```

Print a numerology profile (from `numerology` or `tinhHoSoThanSoHocSau`) as
compact markdown for a language model. Only computed numbers; no
interpretation. Ends with the source line.

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `profile` | \| `HoSoThanSoHocSau` \| [`NumerologyResult`](#numerologyresult) \| `Omit`\<[`NumerologyResult`](#numerologyresult), `"toSvg"`\> |
| `opts?` | [`ChartTextOptions`](#charttextoptions) |

#### Returns

`string`

#### Example

```ts
chartToText(numerology({ name: "Nguyen Van An", birthDate: "1990-09-19", today: "2026-11-19" }))
```

## Variables

### NUMEROLOGY\_LABELS

```ts
const NUMEROLOGY_LABELS: Readonly<Record<NumerologyLang, Readonly<Record<string, string>>>>;
```

Labels of every number, in three languages.

***

### SOURCE\_LINE

```ts
const SOURCE_LINE: Readonly<Record<NumerologyLang, string>>;
```

Dòng ghi nguồn cuối mọi văn bản, theo ngôn ngữ.

***

### numerologyToText

```ts
const numerologyToText: (profile, opts) => string = chartToText;
```

Same as `chartToText` (explicit name when several packages are imported together).

Print a numerology profile (from `numerology` or `tinhHoSoThanSoHocSau`) as
compact markdown for a language model. Only computed numbers; no
interpretation. Ends with the source line.

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `profile` | \| `HoSoThanSoHocSau` \| [`NumerologyResult`](#numerologyresult) \| `Omit`\<[`NumerologyResult`](#numerologyresult), `"toSvg"`\> |
| `opts?` | [`ChartTextOptions`](#charttextoptions) |

#### Returns

`string`

#### Example

```ts
chartToText(numerology({ name: "Nguyen Van An", birthDate: "1990-09-19", today: "2026-11-19" }))
```

## Interfaces

### NumerologyInput

Input of `numerology`.

#### Properties

| Property | Type | Description |
| ------ | ------ | ------ |
| <a id="property-name"></a> `name` | `string` | Full name. Vietnamese (and other Latin) diacritics are folded; only A-Z letters count. |
| <a id="property-birthdate"></a> `birthDate` | [`NumerologyDate`](#numerologydate) | - |
| <a id="property-today"></a> `today?` | [`NumerologyDate`](#numerologydate) | Date for the personal year, month and day numbers. Default: today (local). |
| <a id="property-lang"></a> `lang?` | [`NumerologyLang`](#numerologylang) | - |

***

### NumerologyResult

Result of `numerology`. Master numbers 11, 22, 33 are kept.

#### Methods

##### toSvg()

```ts
toSvg(opts?): string;
```

Draw this profile as a self-contained SVG in its `lang` (non-enumerable, not in JSON).

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `opts?` | [`NumerologySvgOptions`](#numerologysvgoptions) |

###### Returns

`string`

#### Properties

| Property | Type | Description |
| ------ | ------ | ------ |
| <a id="property-lang-1"></a> `lang` | [`NumerologyLang`](#numerologylang) | - |
| <a id="property-name-1"></a> `name` | `string` | - |
| <a id="property-birthdate-1"></a> `birthDate` | `string` | - |
| <a id="property-today-1"></a> `today` | `string` | - |
| <a id="property-lifepath"></a> `lifePath` | `number` | - |
| <a id="property-expression"></a> `expression` | `number` | - |
| <a id="property-soulurge"></a> `soulUrge` | `number` | - |
| <a id="property-personality"></a> `personality` | `number` | - |
| <a id="property-attitude"></a> `attitude` | `number` | - |
| <a id="property-birthday"></a> `birthday` | `number` | - |
| <a id="property-maturity"></a> `maturity` | `number` | - |
| <a id="property-personalyear"></a> `personalYear` | `number` | - |
| <a id="property-personalmonth"></a> `personalMonth` | `number` | - |
| <a id="property-personalday"></a> `personalDay` | `number` | - |
| <a id="property-grid"></a> `grid` | `LuoiPythago` | How many times each digit 1-9 appears in the birth date. |
| <a id="property-pinnacles"></a> `pinnacles` | `object`[] | Four pinnacles; the first three end at `toAge`, the last runs for life (null). |
| <a id="property-challenges"></a> `challenges` | `number`[] | - |
| <a id="property-karmicdebt"></a> `karmicDebt` | `number` \| `null` | 13, 14, 16 or 19 when born on that day; otherwise null. |
| <a id="property-labels"></a> `labels` | `Readonly`\<`Record`\<`string`, `string`\>\> | Labels of the fields above in `lang`. |
| <a id="property-raw"></a> `raw` | `HoSoThanSoHocSau` | The original Vietnamese-keyed object from `tinhHoSoThanSoHocSau`. |

***

### NumerologySvgOptions

Options for the numerology SVG drawing.

#### Properties

| Property | Type | Description |
| ------ | ------ | ------ |
| <a id="property-theme"></a> `theme?` | `"light"` \| `"dark"` | - |
| <a id="property-width"></a> `width?` | `number` | Displayed width in px (default 720). |
| <a id="property-lang-2"></a> `lang?` | [`NumerologyLang`](#numerologylang) | Default: the language of the result. |

***

### ChartTextOptions

Options of `chartToText`.

#### Properties

| Property | Type | Description |
| ------ | ------ | ------ |
| <a id="property-lang-3"></a> `lang?` | [`NumerologyLang`](#numerologylang) | Language of the text; default: the profile's `lang` ("en" for a raw profile). |
| <a id="property-detail"></a> `detail?` | [`TextDetail`](#textdetail) | "full" (default): adds personal month and day, pinnacles, challenges and the birth grid. |

## Type Aliases

### NumerologyLang

```ts
type NumerologyLang = "vi" | "en" | "zh";
```

Output language of labels.

***

### NumerologyDate

```ts
type NumerologyDate = 
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

### TextDetail

```ts
type TextDetail = "summary" | "full";
```

How much to print: "summary" (core numbers) or "full" (default).
