[Nhat Nguyet API reference](../README.md) / @nhatnguyet/fengshui

# @nhatnguyet/fengshui

Feng shui rules of traditional schools: Eight Mansions life gua (Kua
number) and house gua, the 24 mountains, Xuan Kong flying star charts for
periods 1 to 9, annual stars, the three Luban rulers, and SVG drawings of
the compass and of a flying star chart. These are the rules a school
states, not verified effects.

```bash
npm i @nhatnguyet/fengshui
```

Method, sources and where the schools disagree:
[docs/fengshui.md](https://github.com/Nhat-Nguyet/nhatnguyet-lunar-ziwei-bazi-numerology/blob/main/docs/fengshui.md).

## Functions

### trigramOf()

```ts
function trigramOf(number, options?): Trigram;
```

The trigram of a Later Heaven (Lo Shu) number: 1 Kan, 2 Kun, 3 Zhen,
4 Xun, 6 Qian, 7 Dui, 8 Gen, 9 Li (5 has no trigram).

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `number` | `number` |
| `options?` | [`NameOptions`](#nameoptions) |

#### Returns

[`Trigram`](#trigram)

***

### mountains24()

```ts
function mountains24(options?): Mountain[];
```

The 24 mountains in compass order, from Zi (due north).

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `options?` | [`NameOptions`](#nameoptions) |

#### Returns

[`Mountain`](#mountain)[]

***

### mountainAt()

```ts
function mountainAt(degrees, options?): Mountain;
```

The mountain containing a compass bearing in degrees (any real number; it
is normalised to 0 to 360). Each sector includes its lower edge: 7.5 is Gui,
7.4999 is Zi.

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `degrees` | `number` |
| `options?` | [`NameOptions`](#nameoptions) |

#### Returns

[`Mountain`](#mountain)

***

### findMountain()

```ts
function findMountain(m, options?): Mountain;
```

Find a mountain by bearing (number, degrees) or by name: pinyin id ("zi",
"Xun"), Vietnamese ("Tý", "Tốn") or Chinese character ("子", "巽"). Throws
a RangeError for an unknown name.

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `m` | `string` \| `number` |
| `options?` | [`NameOptions`](#nameoptions) |

#### Returns

[`Mountain`](#mountain)

***

### eightDirections()

```ts
function eightDirections(gua, options?): DirectionStar[];
```

The eight directions of a gua number (1 to 9 except 5, or any object with a
`number`, such as a `lifeGua` or `houseGua` result), in the engine's order:
the four favourable stars from Sheng Qi to Fu Wei, then the four
unfavourable ones from Huo Hai to Jue Ming.

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `gua` | \| `number` \| \{ `number`: `number`; \} |
| `options?` | [`NameOptions`](#nameoptions) |

#### Returns

[`DirectionStar`](#directionstar)[]

***

### lifeGua()

```ts
function lifeGua(
   birth, 
   gender, 
   options?
): LifeGua;
```

Eight Mansions life gua (Kua number) of a person: trigram, east or west
group, element and the eight directions. `birth` is a date (the lunar year
is taken from it, the year turning at the lunar New Year as the engine
does) or a lunar year number (pass the year you want if you follow books
that turn the year at the Start of Spring).

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `birth` | `number` \| [`DateInput`](am-lich.md#dateinput) |
| `gender` | `string` |
| `options?` | [`NameOptions`](#nameoptions) |

#### Returns

[`LifeGua`](#lifegua)

#### Example

```ts
lifeGua("1990-09-19", "female").number // 5 -> 8 (Gen)
```

***

### houseGua()

```ts
function houseGua(orientation, options?): HouseGua;
```

Eight Mansions house gua: the trigram of the SITTING side (the back of the
house), as the engine reads it, with its eight directions.

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `orientation` | [`Orientation`](#orientation) |
| `options?` | [`NameOptions`](#nameoptions) |

#### Returns

[`HouseGua`](#housegua)

#### Example

```ts
houseGua({ facing: 180 }).trigram.pinyin // "Kan" (sits north)
```

***

### nineStars()

```ts
function nineStars(options?): NineStar[];
```

The nine stars 1 to 9 with their names and elements.

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `options?` | [`NameOptions`](#nameoptions) |

#### Returns

[`NineStar`](#ninestar)[]

***

### starQi()

```ts
function starQi(
   period, 
   star, 
   options?
): object;
```

Role of star `star` (1 to 9) in period `period` (1 to 9): prosperous (the
period star), growing (the next two), retreating (the last one), killing,
dead. This is the split the engine uses; some books count only one growing
star or call Five Yellow killing in every period.

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `period` | `number` |
| `star` | `number` |
| `options?` | [`NameOptions`](#nameoptions) |

#### Returns

`object`

| Name | Type |
| ------ | ------ |
| `qi` | [`QiId`](#qiid) |
| `name` | `string` |

***

### periodOf()

```ts
function periodOf(year, options?): Period;
```

The period (1 to 9) a year belongs to. Years count from the Start of Spring
(Lập Xuân, about 4 February): a date in January or early February belongs
to the previous year. Period 9 runs 2024 to 2043.

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `year` | `number` |
| `options?` | [`NameOptions`](#nameoptions) |

#### Returns

[`Period`](#period)

***

### periods()

```ts
function periods(year, options?): Period[];
```

The nine periods of the 180-year cycle containing `year`.

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `year` | `number` |
| `options?` | [`NameOptions`](#nameoptions) |

#### Returns

[`Period`](#period)[]

***

### flyingStarChart()

```ts
function flyingStarChart(input, options?): FlyingStarChart;
```

Xuan Kong flying star chart of a house: base (period), mountain and facing
stars in the nine palaces, by the Shen school's rules for the "lower
trigram" (the plain facing). Houses whose facing is within about 3 degrees
of a mountain edge are read with replacement stars in many books; this
engine does not compute them.

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `input` | [`FlyingStarInput`](#flyingstarinput) |
| `options?` | [`NameOptions`](#nameoptions) |

#### Returns

[`FlyingStarChart`](#flyingstarchart)

#### Example

```ts
flyingStarChart({ period: 9, facing: "wu" }).palaces[8] // palace 9 (south)
```

***

### annualStars()

```ts
function annualStars(year, options?): AnnualStars;
```

Annual flying stars (lưu niên): the center star of the year (2026 is One
White, each year one less) flown forward through the nine palaces. The
engine has no monthly stars.

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `year` | `number` |
| `options?` | [`NameOptions`](#nameoptions) |

#### Returns

[`AnnualStars`](#annualstars)

***

### lubanRuler()

```ts
function lubanRuler(length, options?): LubanResult;
```

Read a length on a Luban ruler as the ruler in common use in Vietnam
divides it (equal sectors; a length exactly on an edge belongs to the upper
sector). The length is rounded to 0.1 mm.

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `length` | `number` |
| `options?` | [`LubanOptions`](#lubanoptions) |

#### Returns

[`LubanResult`](#lubanresult)

#### Example

```ts
lubanRuler(82, { ruler: "clear-opening" }).sector.pinyin
```

***

### lubanRulers()

```ts
function lubanRulers(options?): LubanRulerInfo[];
```

The three rulers and their sectors.

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `options?` | [`NameOptions`](#nameoptions) |

#### Returns

[`LubanRulerInfo`](#lubanrulerinfo)[]

***

### renderCompassSvg()

```ts
function renderCompassSvg(options?): string;
```

Draw the 24-mountain compass (with the eight trigrams and, when `gua` is
given, the eight Eight Mansions stars) as a self-contained SVG string.

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `options?` | [`CompassSvgOptions`](#compasssvgoptions) |

#### Returns

`string`

***

### renderFlyingStarSvg()

```ts
function renderFlyingStarSvg(chart, options?): string;
```

Draw a Xuan Kong flying star chart as a 3 x 3 grid, south at the top: in
each palace the mountain star (left), facing star (right) and period star
(below). Pass a `flyingStarChart` result or its input.

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `chart` | \| [`FlyingStarChart`](#flyingstarchart) \| [`FlyingStarInput`](#flyingstarinput) |
| `options?` | [`SvgOptions`](#svgoptions) |

#### Returns

`string`

## Variables

### DIRECTIONS

```ts
const DIRECTIONS: readonly DirectionId[];
```

Direction ids in compass order from north.

***

### STAR\_GLOSS

```ts
const STAR_GLOSS: Readonly<Record<StarId, string>>;
```

Literal English gloss of each star name (what the characters say, not a prediction).

***

### LO\_SHU\_GRID

```ts
const LO_SHU_GRID: readonly (readonly number[])[];
```

Palace numbers as drawn with south on top.

***

### ENGINE\_VERSION

```ts
const ENGINE_VERSION: "2.3.0" = "2.3.0";
```

Version of the Go engine this package is ported from.

## Interfaces

### NameOptions

`lang` and `terms` options shared by every function.

#### Extended by

- [`LubanOptions`](#lubanoptions)
- [`SvgOptions`](#svgoptions)

#### Properties

| Property | Type | Description |
| ------ | ------ | ------ |
| <a id="property-lang"></a> `lang?` | [`Lang`](am-lich.md#lang) | Language of names: "en" (default), "vi" or "zh". |
| <a id="property-terms"></a> `terms?` | [`Terms`](am-lich.md#terms) | With lang "en": how to write names that have no established English translation (mountains, trigrams, Eight Mansions stars, Luban sectors and sub-sectors): "pinyin" (default), "han" (Chinese characters) or "vi" (Sino-Vietnamese). |

***

### Trigram

A trigram of the Later Heaven (King Wen) arrangement used by feng shui.

#### Properties

| Property | Type | Description |
| ------ | ------ | ------ |
| <a id="property-id"></a> `id` | [`TrigramId`](#trigramid) | - |
| <a id="property-name"></a> `name` | `string` | Name in `lang` / `terms`. |
| <a id="property-pinyin"></a> `pinyin` | `string` | - |
| <a id="property-han"></a> `han` | `string` | Chinese character (simplified). |
| <a id="property-namevi"></a> `nameVi` | `string` | - |
| <a id="property-symbol"></a> `symbol` | `string` | - |
| <a id="property-image"></a> `image` | `string` | Nature image in `lang` (Water, Mountain...). |
| <a id="property-element"></a> `element` | `string` | Element in `lang`. |
| <a id="property-number"></a> `number` | `number` | Later Heaven (Lo Shu) number: 1 Kan ... 9 Li; also the Kua number. |
| <a id="property-direction"></a> `direction` | [`DirectionId`](#directionid) | - |
| <a id="property-directionname"></a> `directionName` | `string` | - |

***

### Mountain

One of the 24 mountains (sectors of 15 degrees) of the compass.

#### Properties

| Property | Type | Description |
| ------ | ------ | ------ |
| <a id="property-index"></a> `index` | `number` | 1 (Zi, due north) to 24, clockwise. |
| <a id="property-id-1"></a> `id` | `string` | Lowercase pinyin, e.g. "zi", "xun". |
| <a id="property-name-1"></a> `name` | `string` | Name in `lang` / `terms`. |
| <a id="property-pinyin-1"></a> `pinyin` | `string` | - |
| <a id="property-han-1"></a> `han` | `string` | - |
| <a id="property-namevi-1"></a> `nameVi` | `string` | - |
| <a id="property-kind"></a> `kind` | [`MountainKind`](#mountainkind) | - |
| <a id="property-direction-1"></a> `direction` | [`DirectionId`](#directionid) | - |
| <a id="property-directionname-1"></a> `directionName` | `string` | - |
| <a id="property-trigram"></a> `trigram` | [`TrigramId`](#trigramid) | Trigram governing the 45 degree direction the mountain lies in. |
| <a id="property-trigramname-1"></a> `trigramName` | `string` | - |
| <a id="property-trigramelement-1"></a> `trigramElement` | `string` | Element of that trigram (palace element), in `lang`. |
| <a id="property-from"></a> `from` | `number` | Start of the sector, degrees (Zi starts at 352.5 and wraps through 0). |
| <a id="property-to"></a> `to` | `number` | End of the sector, degrees (exclusive). |
| <a id="property-center"></a> `center` | `number` | Middle of the sector, degrees. |
| <a id="property-dragon"></a> `dragon` | `"earth"` \| `"heaven"` \| `"human"` | Three Cycles dragon (Tam Nguyên Long): earth, heaven or human. |
| <a id="property-xuankongpolarity"></a> `xuanKongPolarity` | `"yin"` \| `"yang"` | Yin or yang as the Xuan Kong flying star school (Shen) assigns it; other schools differ. |

***

### DirectionStar

One direction with its Eight Mansions star.

#### Properties

| Property | Type | Description |
| ------ | ------ | ------ |
| <a id="property-direction-2"></a> `direction` | [`DirectionId`](#directionid) | - |
| <a id="property-directionname-2"></a> `directionName` | `string` | - |
| <a id="property-from-1"></a> `from` | `number` | Start of the 45 degree sector (north runs 337.5 to 22.5). |
| <a id="property-to-1"></a> `to` | `number` | - |
| <a id="property-mountains"></a> `mountains` | `string`[] | Ids of the three mountains in the sector. |
| <a id="property-star"></a> `star` | [`StarId`](#starid) | - |
| <a id="property-starname"></a> `starName` | `string` | Star name in `lang` / `terms`. |
| <a id="property-pinyin-2"></a> `pinyin` | `string` | - |
| <a id="property-han-2"></a> `han` | `string` | - |
| <a id="property-namevi-2"></a> `nameVi` | `string` | - |
| <a id="property-gloss"></a> `gloss` | `string` | Literal English gloss of the name. |
| <a id="property-favorable"></a> `favorable` | `boolean` | The school counts the star among its four favourable stars. |

***

### LifeGua

Result of `lifeGua`.

#### Properties

| Property | Type | Description |
| ------ | ------ | ------ |
| <a id="property-birthdate"></a> `birthDate` | `string` \| `null` | "YYYY-MM-DD", or null when a lunar year was passed. |
| <a id="property-lunaryear"></a> `lunarYear` | `number` | Lunar year the gua is computed from. |
| <a id="property-yearboundary"></a> `yearBoundary` | `"lunar-new-year"` | The engine starts the year at the lunar New Year (Tết), Vietnam time (UTC+7). |
| <a id="property-gender"></a> `gender` | [`Gender`](#gender) | - |
| <a id="property-number-1"></a> `number` | `number` | Kua number 1 to 9; 5 never appears (male 5 becomes 2, female 5 becomes 8). |
| <a id="property-trigram-1"></a> `trigram` | [`Trigram`](#trigram) | - |
| <a id="property-group"></a> `group` | [`Group`](#group) | - |
| <a id="property-groupname"></a> `groupName` | `string` | - |
| <a id="property-element-1"></a> `element` | `string` | Element of the trigram, in `lang`. |
| <a id="property-directions"></a> `directions` | [`DirectionStar`](#directionstar)[] | - |
| <a id="property-note"></a> `note?` | `string` | Present when the Gregorian birth year is not the lunar year. |

***

### HouseGua

Result of `houseGua`.

#### Properties

| Property | Type | Description |
| ------ | ------ | ------ |
| <a id="property-sitting"></a> `sitting` | [`Mountain`](#mountain) | - |
| <a id="property-facing"></a> `facing` | [`Mountain`](#mountain) | - |
| <a id="property-number-2"></a> `number` | `number` | Number of the sitting trigram (the house trigram). |
| <a id="property-trigram-2"></a> `trigram` | [`Trigram`](#trigram) | - |
| <a id="property-group-1"></a> `group` | [`Group`](#group) | - |
| <a id="property-groupname-1"></a> `groupName` | `string` | - |
| <a id="property-directions-1"></a> `directions` | [`DirectionStar`](#directionstar)[] | - |

***

### Orientation

Where a house faces or sits: a bearing in degrees or a mountain name.

#### Extended by

- [`FlyingStarInput`](#flyingstarinput)

#### Properties

| Property | Type | Description |
| ------ | ------ | ------ |
| <a id="property-facing-1"></a> `facing?` | `string` \| `number` | Facing bearing (degrees) or facing mountain. |
| <a id="property-sitting-1"></a> `sitting?` | `string` \| `number` | Sitting bearing (degrees) or sitting mountain; the opposite of facing. |

***

### NineStar

One of the nine stars of Xuan Kong.

#### Properties

| Property | Type | Description |
| ------ | ------ | ------ |
| <a id="property-number-3"></a> `number` | `number` | - |
| <a id="property-name-2"></a> `name` | `string` | Name in `lang`: "One White", 一白, Nhất Bạch. |
| <a id="property-han-3"></a> `han` | `string` | - |
| <a id="property-namevi-3"></a> `nameVi` | `string` | - |
| <a id="property-element-2"></a> `element` | `string` | - |

***

### Period

One 20-year period of the Three Cycles (San Yuan).

#### Properties

| Property | Type | Description |
| ------ | ------ | ------ |
| <a id="property-period"></a> `period` | `number` | - |
| <a id="property-era"></a> `era` | `"middle"` \| `"upper"` \| `"lower"` | - |
| <a id="property-eraname"></a> `eraName` | `string` | - |
| <a id="property-from-2"></a> `from` | `number` | First and last year, years counted from the Start of Spring (about 4 February). |
| <a id="property-to-2"></a> `to` | `number` | - |
| <a id="property-star-1"></a> `star` | [`NineStar`](#ninestar) | - |
| <a id="property-zhengshenpalace"></a> `zhengShenPalace` | `number` \| `null` | Lo Shu palace of the period number (Zheng Shen); null in period 5. |
| <a id="property-lingshenpalace"></a> `lingShenPalace` | `number` \| `null` | The opposite palace (Ling Shen); null in period 5. |

***

### FlyingStarPalace

One palace of a flying star chart.

#### Properties

| Property | Type | Description |
| ------ | ------ | ------ |
| <a id="property-palace"></a> `palace` | `number` | Lo Shu number of the palace: 1 north, 9 south, 5 center. |
| <a id="property-direction-3"></a> `direction` | [`DirectionId`](#directionid) \| `"center"` | - |
| <a id="property-directionname-3"></a> `directionName` | `string` | - |
| <a id="property-trigram-3"></a> `trigram` | [`TrigramId`](#trigramid) \| `null` | - |
| <a id="property-base"></a> `base` | `number` | Period (base) star. |
| <a id="property-mountain"></a> `mountain` | `number` | Mountain (sitting) star. |
| <a id="property-facing-2"></a> `facing` | `number` | Facing (water) star. |
| <a id="property-qi"></a> `qi` | `object` | Role of each star in the chart's period. |
| `qi.base` | [`QiId`](#qiid) | - |
| `qi.mountain` | [`QiId`](#qiid) | - |
| `qi.facing` | [`QiId`](#qiid) | - |

***

### CastleGate

A castle gate (thành môn) candidate beside the facing palace.

#### Properties

| Property | Type | Description |
| ------ | ------ | ------ |
| <a id="property-palace-1"></a> `palace` | `number` | - |
| <a id="property-direction-4"></a> `direction` | [`DirectionId`](#directionid) | - |
| <a id="property-primary"></a> `primary` | `boolean` | The primary gate (its number pairs with the facing palace in the He Tu). |
| <a id="property-basestar"></a> `baseStar` | `number` | Base star of that palace, flown from the center for the test. |
| <a id="property-forward"></a> `forward` | `boolean` | - |
| <a id="property-arrivingstar"></a> `arrivingStar` | `number` | The star that lands back on the palace. |
| <a id="property-usable"></a> `usable` | `boolean` | The period star lands there: the gate can be used. |

***

### FlyingStarChart

Result of `flyingStarChart`.

#### Properties

| Property | Type | Description |
| ------ | ------ | ------ |
| <a id="property-period-1"></a> `period` | `number` | - |
| <a id="property-year"></a> `year` | `number` \| `null` | The year given, or null when the period was given. |
| <a id="property-sitting-2"></a> `sitting` | [`Mountain`](#mountain) | - |
| <a id="property-facing-3"></a> `facing` | [`Mountain`](#mountain) | - |
| <a id="property-sittingpalace"></a> `sittingPalace` | `number` | - |
| <a id="property-facingpalace"></a> `facingPalace` | `number` | - |
| <a id="property-mountainstarforward"></a> `mountainStarForward` | `boolean` | - |
| <a id="property-facingstarforward"></a> `facingStarForward` | `boolean` | - |
| <a id="property-pattern"></a> `pattern` | [`PatternId`](#patternid) \| `null` | - |
| <a id="property-patternname"></a> `patternName` | `string` \| `null` | - |
| <a id="property-palaces"></a> `palaces` | [`FlyingStarPalace`](#flyingstarpalace)[] | Palaces 1 to 9 in Lo Shu order. |
| <a id="property-grid"></a> `grid` | `number`[][] | Palace numbers as drawn in the books, south on top: [[4, 9, 2], [3, 5, 7], [8, 1, 6]]. |
| <a id="property-castlegates"></a> `castleGates` | [`CastleGate`](#castlegate)[] | - |
| <a id="property-replacementstars"></a> `replacementStars` | `false` | Replacement stars (替卦) for houses facing near a mountain edge are not computed. |

***

### FlyingStarInput

Input of `flyingStarChart`: a period or a year, and a facing or sitting.

#### Extends

- [`Orientation`](#orientation)

#### Properties

| Property | Type | Description | Inherited from |
| ------ | ------ | ------ | ------ |
| <a id="property-facing-4"></a> `facing?` | `string` \| `number` | Facing bearing (degrees) or facing mountain. | [`Orientation`](#orientation).[`facing`](#property-facing-1) |
| <a id="property-sitting-3"></a> `sitting?` | `string` \| `number` | Sitting bearing (degrees) or sitting mountain; the opposite of facing. | [`Orientation`](#orientation).[`sitting`](#property-sitting-1) |
| <a id="property-period-2"></a> `period?` | `number` | Period 1 to 9. | - |
| <a id="property-year-1"></a> `year?` | `number` | A year (counted from the Start of Spring); its period is used. | - |

***

### AnnualPalace

One palace of the annual stars.

#### Properties

| Property | Type |
| ------ | ------ |
| <a id="property-palace-2"></a> `palace` | `number` |
| <a id="property-direction-5"></a> `direction` | [`DirectionId`](#directionid) \| `"center"` |
| <a id="property-directionname-4"></a> `directionName` | `string` |
| <a id="property-star-2"></a> `star` | `number` |

***

### AnnualStars

Result of `annualStars`.

#### Properties

| Property | Type | Description |
| ------ | ------ | ------ |
| <a id="property-year-2"></a> `year` | `number` | - |
| <a id="property-yearboundary-1"></a> `yearBoundary` | `"start-of-spring"` | The year counts from the Start of Spring (Lập Xuân, about 4 February). |
| <a id="property-center-1"></a> `center` | `number` | Star in the center palace. |
| <a id="property-palaces-1"></a> `palaces` | [`AnnualPalace`](#annualpalace)[] | Palaces 1 to 9 in Lo Shu order. |

***

### LubanSector

One sector of a Luban ruler.

#### Properties

| Property | Type | Description |
| ------ | ------ | ------ |
| <a id="property-index-1"></a> `index` | `number` | 0-based position on the ruler. |
| <a id="property-name-3"></a> `name` | `string` | Name in `lang` / `terms`. |
| <a id="property-pinyin-3"></a> `pinyin` | `string` | - |
| <a id="property-han-4"></a> `han` | `string` | Characters as engraved (traditional). |
| <a id="property-namezh"></a> `nameZh` | `string` | Simplified characters. |
| <a id="property-namevi-4"></a> `nameVi` | `string` | - |
| <a id="property-auspicious"></a> `auspicious` | `boolean` | The ruler puts the sector in its good group. |
| <a id="property-meaning"></a> `meaning` | `string` | What the characters mean, in `lang`. |

***

### LubanSubSector

A sub-sector name (the 52.2 cm and 42.9 cm rulers split each sector into four or five).

#### Properties

| Property | Type | Description |
| ------ | ------ | ------ |
| <a id="property-name-4"></a> `name` | `string` | Name in `lang` / `terms`: pinyin by default in English, like the sectors. |
| <a id="property-pinyin-4"></a> `pinyin` | `string` | - |
| <a id="property-nameen"></a> `nameEn` | `string` | Short literal English translation of the characters, e.g. "Quarrels" for 口舌. |
| <a id="property-namevi-5"></a> `nameVi` | `string` | - |
| <a id="property-namezh-1"></a> `nameZh` | `string` | Simplified characters. |

***

### LubanResult

Result of `lubanRuler`.

#### Properties

| Property | Type | Description |
| ------ | ------ | ------ |
| <a id="property-lengthmm"></a> `lengthMm` | `number` | - |
| <a id="property-lengthcm"></a> `lengthCm` | `number` | - |
| <a id="property-ruler"></a> `ruler` | [`RulerId`](#rulerid) | - |
| <a id="property-rulername"></a> `rulerName` | `string` | - |
| <a id="property-cyclemm"></a> `cycleMm` | `number` | - |
| <a id="property-use"></a> `use` | `string` | What the ruler is used for, in `lang`. |
| <a id="property-cycle"></a> `cycle` | `number` | Which repeat of the ruler the length reaches (1 = first). |
| <a id="property-positionmm"></a> `positionMm` | `number` | Position inside that repeat, mm (rounded to 0.1). |
| <a id="property-sector"></a> `sector` | [`LubanSector`](#lubansector) | - |
| <a id="property-subsector"></a> `subSector` | [`LubanSubSector`](#lubansubsector) \| `null` | - |
| <a id="property-auspicious-1"></a> `auspicious` | `boolean` | - |
| <a id="property-nearestauspicious"></a> `nearestAuspicious` | `object`[] | For a length in a bad sector: the nearest lengths in a good sector, below then above. |

***

### LubanOptions

Options of `lubanRuler`.

#### Extends

- [`NameOptions`](#nameoptions)

#### Properties

| Property | Type | Description | Inherited from |
| ------ | ------ | ------ | ------ |
| <a id="property-lang-1"></a> `lang?` | [`Lang`](am-lich.md#lang) | Language of names: "en" (default), "vi" or "zh". | [`NameOptions`](#nameoptions).[`lang`](#property-lang) |
| <a id="property-terms-1"></a> `terms?` | [`Terms`](am-lich.md#terms) | With lang "en": how to write names that have no established English translation (mountains, trigrams, Eight Mansions stars, Luban sectors and sub-sectors): "pinyin" (default), "han" (Chinese characters) or "vi" (Sino-Vietnamese). | [`NameOptions`](#nameoptions).[`terms`](#property-terms) |
| <a id="property-ruler-1"></a> `ruler?` | [`RulerId`](#rulerid) \| `"52.2"` \| `"42.9"` \| `"38.8"` | "luban" (42.9 cm, default), "clear-opening" (52.2 cm) or "dinglan" (38.8 cm). | - |
| <a id="property-unit"></a> `unit?` | `"cm"` \| `"mm"` | Unit of `length`: "cm" (default) or "mm". | - |

***

### LubanRulerInfo

One ruler with all its sectors.

#### Properties

| Property | Type |
| ------ | ------ |
| <a id="property-ruler-2"></a> `ruler` | [`RulerId`](#rulerid) |
| <a id="property-name-5"></a> `name` | `string` |
| <a id="property-lengthmm-1"></a> `lengthMm` | `number` |
| <a id="property-use-1"></a> `use` | `string` |
| <a id="property-sectors"></a> `sectors` | ([`LubanSector`](#lubansector) & `object`)[] |

***

### SvgOptions

Options shared by the two drawings.

#### Extends

- [`NameOptions`](#nameoptions)

#### Extended by

- [`CompassSvgOptions`](#compasssvgoptions)

#### Properties

| Property | Type | Description | Inherited from |
| ------ | ------ | ------ | ------ |
| <a id="property-lang-2"></a> `lang?` | [`Lang`](am-lich.md#lang) | Language of names: "en" (default), "vi" or "zh". | [`NameOptions`](#nameoptions).[`lang`](#property-lang) |
| <a id="property-terms-2"></a> `terms?` | [`Terms`](am-lich.md#terms) | With lang "en": how to write names that have no established English translation (mountains, trigrams, Eight Mansions stars, Luban sectors and sub-sectors): "pinyin" (default), "han" (Chinese characters) or "vi" (Sino-Vietnamese). | [`NameOptions`](#nameoptions).[`terms`](#property-terms) |
| <a id="property-theme"></a> `theme?` | `"light"` \| `"dark"` | "light" (default) or "dark". | - |
| <a id="property-width"></a> `width?` | `number` | Display width in px (the `width` attribute); default 480. | - |

***

### CompassSvgOptions

Options of `renderCompassSvg`.

#### Extends

- [`SvgOptions`](#svgoptions)

#### Properties

| Property | Type | Description | Inherited from |
| ------ | ------ | ------ | ------ |
| <a id="property-lang-3"></a> `lang?` | [`Lang`](am-lich.md#lang) | Language of names: "en" (default), "vi" or "zh". | [`SvgOptions`](#svgoptions).[`lang`](#property-lang-2) |
| <a id="property-terms-3"></a> `terms?` | [`Terms`](am-lich.md#terms) | With lang "en": how to write names that have no established English translation (mountains, trigrams, Eight Mansions stars, Luban sectors and sub-sectors): "pinyin" (default), "han" (Chinese characters) or "vi" (Sino-Vietnamese). | [`SvgOptions`](#svgoptions).[`terms`](#property-terms-2) |
| <a id="property-theme-1"></a> `theme?` | `"light"` \| `"dark"` | "light" (default) or "dark". | [`SvgOptions`](#svgoptions).[`theme`](#property-theme) |
| <a id="property-width-1"></a> `width?` | `number` | Display width in px (the `width` attribute); default 480. | [`SvgOptions`](#svgoptions).[`width`](#property-width) |
| <a id="property-gua"></a> `gua?` | \| `number` \| \{ `number`: `number`; \} | Draw the eight Eight Mansions stars of this gua (a number or a `lifeGua` / `houseGua` result). | - |
| <a id="property-facing-5"></a> `facing?` | `string` \| `number` | Mark the facing mountain (bearing in degrees or a mountain name) and its opposite. | - |
| <a id="property-orientation"></a> `orientation?` | `"south-up"` \| `"north-up"` | "south-up" (default, as Chinese and Vietnamese compass books draw it) or "north-up". | - |

## Type Aliases

### DirectionId

```ts
type DirectionId = 
  | "north"
  | "northeast"
  | "east"
  | "southeast"
  | "south"
  | "southwest"
  | "west"
  | "northwest";
```

The eight compass directions, clockwise from north.

***

### TrigramId

```ts
type TrigramId = "qian" | "dui" | "li" | "zhen" | "xun" | "kan" | "gen" | "kun";
```

The eight trigrams by pinyin.

***

### MountainKind

```ts
type MountainKind = "stem" | "branch" | "trigram";
```

Kind of a mountain: one of 8 stems, 12 branches or 4 corner trigrams.

***

### StarId

```ts
type StarId = 
  | "sheng-qi"
  | "tian-yi"
  | "yan-nian"
  | "fu-wei"
  | "huo-hai"
  | "liu-sha"
  | "wu-gui"
  | "jue-ming";
```

The eight wandering stars (du niên) of the Eight Mansions school.

***

### Group

```ts
type Group = "east" | "west";
```

East group (Kan, Zhen, Xun, Li) or west group (Qian, Kun, Gen, Dui).

***

### Gender

```ts
type Gender = "male" | "female";
```

Gender accepted by `lifeGua`.

***

### QiId

```ts
type QiId = "prosperous" | "growing" | "retreating" | "killing" | "dead";
```

Role of a star in a period (the common five-way split; see docs).

***

### PatternId

```ts
type PatternId = 
  | "prosperous-sitting-facing"
  | "reversed"
  | "double-facing"
  | "double-sitting";
```

Chart patterns the engine names (read from where the period star lands).

***

### RulerId

```ts
type RulerId = "clear-opening" | "luban" | "dinglan";
```

The three rulers: 52.2 cm (clear openings), 42.9 cm (solid pieces), 38.8 cm (altars and graves).

## References

### DateInput

Re-exports [DateInput](am-lich.md#dateinput)

***

### Lang

Re-exports [Lang](am-lich.md#lang)

***

### Terms

Re-exports [Terms](am-lich.md#terms)
