[Nhat Nguyet API reference](../README.md) / @nhatnguyet/cli

# @nhatnguyet/cli

The text renderers behind the `nhatnguyet` command line: Zi Wei grid, BaZi,
lunar date, solar terms, numerology and festival tables, with terminal width
handling for CJK text. Command reference: the
[package README](https://github.com/Nhat-Nguyet/nhatnguyet-lunar-ziwei-bazi-numerology/tree/main/js/packages/cli#readme).

```bash
npx @nhatnguyet/cli ziwei 1990-09-19 20:00 male
```

## Functions

### charWidth()

```ts
function charWidth(cp): number;
```

Terminal columns taken by one code point: 2 for CJK and fullwidth, 0 for combining marks.

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `cp` | `number` |

#### Returns

`number`

***

### displayWidth()

```ts
function displayWidth(s): number;
```

Display width of a string (no ANSI codes inside).

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `s` | `string` |

#### Returns

`number`

***

### truncate()

```ts
function truncate(s, width): string;
```

Cut a string to at most `width` columns, ending with "…" when cut.

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `s` | `string` |
| `width` | `number` |

#### Returns

`string`

***

### wrap()

```ts
function wrap(s, width): string[];
```

Wrap words into lines of at most `width` columns (CJK text breaks anywhere).

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `s` | `string` |
| `width` | `number` |

#### Returns

`string`[]

***

### wrapItems()

```ts
function wrapItems(
   items, 
   sep, 
   width
): string[];
```

Pack items into lines of at most `width` columns, never splitting an item (long items are cut).

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `items` | `string`[] |
| `sep` | `string` |
| `width` | `number` |

#### Returns

`string`[]

***

### renderZiWeiGrid()

```ts
function renderZiWeiGrid(chart, opts?): string;
```

The Zi Wei chart as a 4x4 grid: the twelve palaces around the edge (Tỵ at
the top left, as in printed charts), birth data in the middle.

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `chart` | [`ZiWeiChart`](tu-vi.md#ziweichart) |
| `opts?` | [`RenderOptions`](#renderoptions) |

#### Returns

`string`

***

### renderZiWei()

```ts
function renderZiWei(
   chart, 
   extra, 
   opts?
): string;
```

Grid plus the viewing year, ten-year periods, patterns and notes.

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `chart` | [`ZiWeiChart`](tu-vi.md#ziweichart) |
| `extra` | \{ `decades?`: [`DecadeLuck`](tu-vi.md#decadeluck)[]; `year?`: [`YearlyLuck`](tu-vi.md#yearlyluck); `patterns?`: [`ZiWeiPattern`](tu-vi.md#ziweipattern)[]; \} |
| `extra.decades?` | [`DecadeLuck`](tu-vi.md#decadeluck)[] |
| `extra.year?` | [`YearlyLuck`](tu-vi.md#yearlyluck) |
| `extra.patterns?` | [`ZiWeiPattern`](tu-vi.md#ziweipattern)[] |
| `opts?` | [`RenderOptions`](#renderoptions) |

#### Returns

`string`

***

### renderBaZi()

```ts
function renderBaZi(chart, opts?): string;
```

The four pillars as a table, then the luck pillars.

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `chart` | [`BaZiChart`](bat-tu.md#bazichart) |
| `opts?` | [`RenderOptions`](#renderoptions) |

#### Returns

`string`

***

### renderLunar()

```ts
function renderLunar(r, opts?): string;
```

A lunar date as a small key-value box.

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `r` | [`LunarResult`](am-lich.md#lunarresult) |
| `opts?` | [`RenderOptions`](#renderoptions) |

#### Returns

`string`

***

### renderSolarTerms()

```ts
function renderSolarTerms(
   year, 
   terms, 
   lang, 
   opts?
): string;
```

The 24 solar terms of a year as a table.

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `year` | `number` |
| `terms` | [`SolarTerm`](am-lich.md#solarterm)[] |
| `lang` | `Lang` |
| `opts?` | [`RenderOptions`](#renderoptions) |

#### Returns

`string`

***

### renderHours()

```ts
function renderHours(r, opts?): string;
```

The twelve double hours of a day: branch, clock range, auspicious or not, spirit.

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `r` | [`AuspiciousHoursResult`](am-lich.md#auspicioushoursresult) |
| `opts?` | [`RenderOptions`](#renderoptions) |

#### Returns

`string`

***

### renderNumerology()

```ts
function renderNumerology(r, opts?): string;
```

Numerology numbers, the 3x3 birth-date grid, pinnacles and challenges.

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `r` | [`NumerologyResult`](than-so-hoc.md#numerologyresult) |
| `opts?` | [`RenderOptions`](#renderoptions) |

#### Returns

`string`

***

### renderFestivals()

```ts
function renderFestivals(
   year, 
   list, 
   lang, 
   opts?
): string;
```

Festivals of a year as a table: date, fixed date, name.

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `year` | `number` |
| `list` | [`Festival`](le-hoi.md#festival)[] |
| `lang` | `Lang` |
| `opts?` | [`RenderOptions`](#renderoptions) |

#### Returns

`string`

## Interfaces

### RenderOptions

Rendering options.

#### Properties

| Property | Type | Description |
| ------ | ------ | ------ |
| <a id="property-color"></a> `color?` | `boolean` | Use ANSI colours. Default false. |
| <a id="property-width"></a> `width?` | `number` | Total width available, in terminal columns. Default 88. |
