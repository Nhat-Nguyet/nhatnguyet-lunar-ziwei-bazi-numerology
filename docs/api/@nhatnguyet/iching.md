[Nhat Nguyet API reference](../README.md) / @nhatnguyet/iching

# @nhatnguyet/iching

The I Ching (Yijing, Book of Changes): the 64 hexagrams with names in
English, pinyin, Chinese and Vietnamese, the eight trigrams, the Eight
Palaces, nuclear, opposite, reversed and changed hexagrams, three-coin and
Plum Blossom casting, the Six Lines (najia) chart, the daily hexagram of the
Gua Qi calendar, the public domain Zhou Yi text with James Legge's 1882
translation, and an SVG drawing.

```bash
npm i @nhatnguyet/iching
```

Method, sources and conventions:
[docs/iching.md](https://github.com/Nhat-Nguyet/nhatnguyet-lunar-ziwei-bazi-numerology/blob/main/docs/iching.md).

## Functions

### trigram()

```ts
function trigram(input, o?): TrigramResult;
```

One of the eight trigrams, by number (1 to 8, Fu Xi order), name or three lines (bottom first).

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `input` | `string` \| `number` \| readonly (`number` \| `boolean`)[] |
| `o?` | [`NameOptions`](#nameoptions) |

#### Returns

[`TrigramResult`](#trigramresult)

***

### hexagramNumber()

```ts
function hexagramNumber(input): number;
```

Số King Wen của một đầu vào quẻ (ném lỗi khi không hợp lệ).

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `input` | [`HexagramInput`](#hexagraminput) |

#### Returns

`number`

***

### hexagram()

```ts
function hexagram(input, o?): Hexagram;
```

One of the 64 hexagrams, by number, lines, binary string or name (English, pinyin, Chinese, Vietnamese).

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `input` | [`HexagramInput`](#hexagraminput) |
| `o?` | [`NameOptions`](#nameoptions) |

#### Returns

[`Hexagram`](#hexagram)

***

### allHexagrams()

```ts
function allHexagrams(o?): Hexagram[];
```

All 64 hexagrams in King Wen order.

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `o?` | [`NameOptions`](#nameoptions) |

#### Returns

[`Hexagram`](#hexagram)[]

***

### mutual()

```ts
function mutual(input, o?): Hexagram;
```

The nuclear (mutual) hexagram: lines 2 to 4 below, 3 to 5 above.

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `input` | [`HexagramInput`](#hexagraminput) |
| `o?` | [`NameOptions`](#nameoptions) |

#### Returns

[`Hexagram`](#hexagram)

***

### opposite()

```ts
function opposite(input, o?): Hexagram;
```

The opposite hexagram: every line turned yin to yang and yang to yin.

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `input` | [`HexagramInput`](#hexagraminput) |
| `o?` | [`NameOptions`](#nameoptions) |

#### Returns

[`Hexagram`](#hexagram)

***

### reverse()

```ts
function reverse(input, o?): Hexagram;
```

The reversed hexagram: the figure turned upside down. Eight hexagrams are their own reverse.

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `input` | [`HexagramInput`](#hexagraminput) |
| `o?` | [`NameOptions`](#nameoptions) |

#### Returns

[`Hexagram`](#hexagram)

***

### changed()

```ts
function changed(
   input, 
   moving, 
   o?
): Hexagram;
```

The changed hexagram: the given moving lines (1 = bottom ... 6 = top) turned over.

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `input` | [`HexagramInput`](#hexagraminput) |
| `moving` | readonly `number`[] |
| `o?` | [`NameOptions`](#nameoptions) |

#### Returns

[`Hexagram`](#hexagram)

***

### castCoins()

```ts
function castCoins(o?): Cast;
```

Three-coin method: six tosses of three coins, bottom line first. A coin
counts 3 when `rng()` is below 0.5 (the back, 背) and 2 otherwise (the
face, 字); the sum 6 to 9 is the line. Pass `lines` (six values 6 to 9) to
record a cast made by hand, or `rng` (a function returning [0, 1)) for a
reproducible cast. Without either, a cryptographic random source is used
when the runtime has one.

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `o?` | [`NameOptions`](#nameoptions) & `object` |

#### Returns

[`Cast`](#cast)

***

### castFromNumbers()

```ts
function castFromNumbers(
   a, 
   b, 
   c, 
   o?
): NumberCast;
```

Plum Blossom (Mei Hua Yi Shu) number method: upper trigram = a mod 8, lower
trigram = b mod 8, moving line = c mod 6, a remainder of 0 counting as 8
(Kun) or 6 (top line). Trigram numbers are in the Fu Xi order (Qian 1 ...
Kun 8). Any integers, negative ones too. `lines` gives the same cast as
coin values, so it can be passed to `najia`.

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `a` | `number` |
| `b` | `number` |
| `c` | `number` |
| `o?` | [`NameOptions`](#nameoptions) |

#### Returns

[`NumberCast`](#numbercast)

***

### najia()

```ts
function najia(input, o): SixLinesChart;
```

The Six Lines chart of a hexagram on a date (1900 to 2100): stem and
branch of every line (na jia), its element, six relation by the element of
the palace, world and response lines, six spirits from the day stem, the
void branches of the day, the seasonal state under the month branch and
month break, and for moving lines the branch they change into. `input` is a
Cast (from `castCoins` or `castFromNumbers`), six coin values 6 to 9, or
any hexagram input (no moving line).

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `input` | [`HexagramInput`](#hexagraminput) \| [`Cast`](#cast) |
| `o` | [`NameOptions`](#nameoptions) & `object` |

#### Returns

[`SixLinesChart`](#sixlineschart)

***

### dailyHexagram()

```ts
function dailyHexagram(date, o?): DailyHexagram;
```

The hexagram ruling a day (1900 to 2100) by the Han-dynasty Gua Qi method
as transmitted by Meng Xi: the sixty hexagrams other than Kan, Zhen, Li,
Dui each rule 6 7/80 days (8,766 minutes) in a fixed order, starting with
Inner Truth at the true winter solstice (to the minute, Vietnam time); the
day's hexagram is the one ruling at 12:00 UTC+7. It is assigned by the
calendar, not cast: there is no moving line.

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `date` | [`DateInput`](am-lich.md#dateinput) |
| `o?` | [`NameOptions`](#nameoptions) |

#### Returns

[`DailyHexagram`](#dailyhexagram)

***

### renderHexagramSvg()

```ts
function renderHexagramSvg(input, opts?): string;
```

Draw a hexagram as a self-contained SVG. Given a cast (or six coin values
6 to 9) with moving lines, moving lines are marked (a circle on a moving
yang line, a cross on a moving yin line) and the changed hexagram is drawn
on the right.

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `input` | [`HexagramInput`](#hexagraminput) \| [`Cast`](#cast) |
| `opts?` | [`HexagramSvgOptions`](#hexagramsvgoptions) |

#### Returns

`string`

***

### text()

```ts
function text(input): HexagramText;
```

The public domain text of a hexagram: the judgment and the line statements
of the Zhou Yi, with James Legge's 1882 English translation. The English
is OCR of the 1882 printing and is given as printed (old romanization,
the translator's words in parentheses). Nothing else: no commentary, no
modern reading.

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `input` | [`HexagramInput`](#hexagraminput) |

#### Returns

[`HexagramText`](#hexagramtext)

## Variables

### RELATION\_CODES

```ts
const RELATION_CODES: Readonly<Record<string, string>>;
```

Codes of the six relations (liu qin), the same in every `lang`.

***

### MONTH\_STATE\_CODES

```ts
const MONTH_STATE_CODES: Readonly<Record<string, string>>;
```

Codes of the five seasonal states of a line under the month branch.

***

### ENGINE\_VERSION

```ts
const ENGINE_VERSION: "2.3.0" = "2.3.0";
```

Version of the reference engine the package is checked against.

***

### CLASSICAL\_SOURCE

```ts
const CLASSICAL_SOURCE: object;
```

Where the text comes from.

#### Type Declaration

| Name | Type | Default value |
| ------ | ------ | ------ |
| <a id="property-zh-1"></a> `zh` | `"Zhou Yi (周易), received text, public domain"` | `"Zhou Yi (周易), received text, public domain"` |
| <a id="property-en-1"></a> `en` | `"James Legge (1882) translation, public domain, OCR text as printed"` | `"James Legge (1882) translation, public domain, OCR text as printed"` |
| <a id="property-dataset"></a> `dataset` | `"nhatnguyet/classical-parallel"` | `"nhatnguyet/classical-parallel"` |
| <a id="property-sha256"></a> `sha256` | `"94a35e62568be82fcf15e09799e0620b1eb49f4fd33644de8ba3cee20bc6daf9"` | `"94a35e62568be82fcf15e09799e0620b1eb49f4fd33644de8ba3cee20bc6daf9"` |

## Interfaces

### NameOptions

Options shared by every function: language of names, and how stems and branches are written in English.

#### Properties

| Property | Type | Description |
| ------ | ------ | ------ |
| <a id="property-lang"></a> `lang?` | [`Lang`](am-lich.md#lang) | "en" (default), "vi" or "zh". |
| <a id="property-terms"></a> `terms?` | [`Terms`](am-lich.md#terms) | With lang "en": "pinyin" (default), "han" or "vi" for stems, branches and trigram names. |

***

### Trigram

A trigram (one of the eight). `number` is the Fu Xi (Earlier Heaven) order: 1 Qian ... 8 Kun.

#### Extended by

- [`TrigramResult`](#trigramresult)

#### Properties

| Property | Type | Description |
| ------ | ------ | ------ |
| <a id="property-number"></a> `number` | `number` | - |
| <a id="property-name"></a> `name` | `string` | - |
| <a id="property-namevi"></a> `nameVi` | `string` | - |
| <a id="property-namehan"></a> `nameHan` | `string` | - |
| <a id="property-pinyin"></a> `pinyin` | `string` | - |
| <a id="property-symbol"></a> `symbol` | `string` | - |
| <a id="property-lines"></a> `lines` | `boolean`[] | Bottom line first, true = yang. |
| <a id="property-image"></a> `image` | `string` | The natural image: Heaven, Lake, Fire, Thunder, Wind, Water, Mountain, Earth. |
| <a id="property-element"></a> `element` | `string` | - |
| <a id="property-direction"></a> `direction` | `string` | Direction in the Later Heaven (King Wen) arrangement. |

***

### Palace

The palace of a hexagram in the Eight Palaces (Jing Fang) order.

#### Properties

| Property | Type | Description |
| ------ | ------ | ------ |
| <a id="property-number-1"></a> `number` | `number` | Trigram number of the palace (Fu Xi order). |
| <a id="property-name-1"></a> `name` | `string` | - |
| <a id="property-element-1"></a> `element` | `string` | - |
| <a id="property-generation"></a> `generation` | `number` | 0 Pure, 1 to 5 first to fifth generation, 6 Wandering soul, 7 Returning soul. |
| <a id="property-generationname"></a> `generationName` | `string` | - |

***

### Hexagram

One of the 64 hexagrams.

#### Properties

| Property | Type | Description |
| ------ | ------ | ------ |
| <a id="property-number-2"></a> `number` | `number` | - |
| <a id="property-symbol-1"></a> `symbol` | `string` | Unicode hexagram symbol (U+4DC0 to U+4DFF, King Wen order). |
| <a id="property-name-2"></a> `name` | `string` | In `lang`: English name, Vietnamese name, or Chinese characters (simplified). |
| <a id="property-nameen"></a> `nameEn` | `string` | - |
| <a id="property-namevi-1"></a> `nameVi` | `string` | - |
| <a id="property-namehan-1"></a> `nameHan` | `string` | Traditional characters, as printed in the classic. |
| <a id="property-namezh"></a> `nameZh` | `string` | - |
| <a id="property-pinyin-1"></a> `pinyin` | `string` | Pinyin with tone marks. |
| <a id="property-lines-1"></a> `lines` | `boolean`[] | Bottom line first, true = yang. |
| <a id="property-binary"></a> `binary` | `string` | The same lines as "0"/"1", bottom line first. |
| <a id="property-upper"></a> `upper` | [`Trigram`](#trigram) | - |
| <a id="property-lower"></a> `lower` | [`Trigram`](#trigram) | - |
| <a id="property-palace"></a> `palace` | [`Palace`](#palace) | - |
| <a id="property-world"></a> `world` | `number` | World (Shi) line, 1 to 6. |
| <a id="property-response"></a> `response` | `number` | Response (Ying) line, 1 to 6. |
| <a id="property-lang-1"></a> `lang` | [`Lang`](am-lich.md#lang) | - |
| <a id="property-raw"></a> `raw` | `object` | - |
| `raw.number` | `number` | - |
| `raw.symbol` | `string` | - |
| `raw.lines` | `boolean`[] | - |
| `raw.binary` | `string` | - |
| `raw.upper` | `number` | - |
| `raw.lower` | `number` | - |
| `raw.nameVi` | `string` | - |
| `raw.nameEn` | `string` | - |
| `raw.nameHan` | `string` | - |
| `raw.nameZh` | `string` | - |
| `raw.pinyin` | `string` | - |
| `raw.palace` | `number` | - |
| `raw.palaceElement` | `string` | - |
| `raw.generation` | `number` | - |
| `raw.generationVi` | `string` | - |
| `raw.generationEn` | `string` | - |
| `raw.generationZh` | `string` | - |
| `raw.world` | `number` | - |
| `raw.response` | `number` | - |
| `raw.mutual` | `number` | - |
| `raw.opposite` | `number` | - |
| `raw.reverse` | `number` | - |

***

### TrigramResult

A trigram returned by `trigram()`: the core object in `raw`.

#### Extends

- [`Trigram`](#trigram)

#### Properties

| Property | Type | Description | Inherited from |
| ------ | ------ | ------ | ------ |
| <a id="property-number-3"></a> `number` | `number` | - | [`Trigram`](#trigram).[`number`](#property-number) |
| <a id="property-name-3"></a> `name` | `string` | - | [`Trigram`](#trigram).[`name`](#property-name) |
| <a id="property-namevi-2"></a> `nameVi` | `string` | - | [`Trigram`](#trigram).[`nameVi`](#property-namevi) |
| <a id="property-namehan-2"></a> `nameHan` | `string` | - | [`Trigram`](#trigram).[`nameHan`](#property-namehan) |
| <a id="property-pinyin-2"></a> `pinyin` | `string` | - | [`Trigram`](#trigram).[`pinyin`](#property-pinyin) |
| <a id="property-symbol-2"></a> `symbol` | `string` | - | [`Trigram`](#trigram).[`symbol`](#property-symbol) |
| <a id="property-lines-2"></a> `lines` | `boolean`[] | Bottom line first, true = yang. | [`Trigram`](#trigram).[`lines`](#property-lines) |
| <a id="property-image-1"></a> `image` | `string` | The natural image: Heaven, Lake, Fire, Thunder, Wind, Water, Mountain, Earth. | [`Trigram`](#trigram).[`image`](#property-image) |
| <a id="property-element-2"></a> `element` | `string` | - | [`Trigram`](#trigram).[`element`](#property-element) |
| <a id="property-direction-1"></a> `direction` | `string` | Direction in the Later Heaven (King Wen) arrangement. | [`Trigram`](#trigram).[`direction`](#property-direction) |
| <a id="property-lang-2"></a> `lang` | [`Lang`](am-lich.md#lang) | - | - |
| <a id="property-raw-1"></a> `raw` | `object` | - | - |
| `raw.number` | `number` | - | - |
| `raw.nameVi` | `string` | - | - |
| `raw.nameEn` | `string` | - | - |
| `raw.nameHan` | `string` | - | - |
| `raw.nameZh` | `string` | - | - |
| `raw.pinyin` | `string` | - | - |
| `raw.symbol` | `string` | - | - |
| `raw.lines` | `boolean`[] | - | - |
| `raw.imageVi` | `string` | - | - |
| `raw.imageEn` | `string` | - | - |
| `raw.imageHan` | `string` | - | - |
| `raw.element` | `string` | - | - |
| `raw.elementEn` | `string` | - | - |
| `raw.direction` | `string` | - | - |
| `raw.directionEn` | `string` | - | - |

***

### Cast

A cast: six line values (6 old yin moving, 7 young yang, 8 young yin, 9 old yang moving), bottom first.

#### Extended by

- [`NumberCast`](#numbercast)

#### Properties

| Property | Type | Description |
| ------ | ------ | ------ |
| <a id="property-method"></a> `method` | `"three-coins"` \| `"plum-blossom"` | - |
| <a id="property-lines-3"></a> `lines` | `number`[] | Line values 6 to 9, bottom first. |
| <a id="property-moving"></a> `moving` | `number`[] | Moving lines, 1 = bottom. |
| <a id="property-primary"></a> `primary` | [`Hexagram`](#hexagram) | - |
| <a id="property-changed"></a> `changed` | [`Hexagram`](#hexagram) \| `null` | null when no line moves. |
| <a id="property-lang-3"></a> `lang` | [`Lang`](am-lich.md#lang) | - |
| <a id="property-raw-2"></a> `raw` | `Record`\<`string`, `unknown`\> | - |

***

### NumberCast

Plum Blossom cast: the three numbers and the two trigrams they give.

#### Extends

- [`Cast`](#cast)

#### Properties

| Property | Type | Description | Overrides | Inherited from |
| ------ | ------ | ------ | ------ | ------ |
| <a id="property-lines-4"></a> `lines` | `number`[] | Line values 6 to 9, bottom first. | - | [`Cast`](#cast).[`lines`](#property-lines-3) |
| <a id="property-moving-1"></a> `moving` | `number`[] | Moving lines, 1 = bottom. | - | [`Cast`](#cast).[`moving`](#property-moving) |
| <a id="property-primary-1"></a> `primary` | [`Hexagram`](#hexagram) | - | - | [`Cast`](#cast).[`primary`](#property-primary) |
| <a id="property-changed-1"></a> `changed` | [`Hexagram`](#hexagram) \| `null` | null when no line moves. | - | [`Cast`](#cast).[`changed`](#property-changed) |
| <a id="property-lang-4"></a> `lang` | [`Lang`](am-lich.md#lang) | - | - | [`Cast`](#cast).[`lang`](#property-lang-3) |
| <a id="property-raw-3"></a> `raw` | `Record`\<`string`, `unknown`\> | - | - | [`Cast`](#cast).[`raw`](#property-raw-2) |
| <a id="property-method-1"></a> `method` | `"plum-blossom"` | - | [`Cast`](#cast).[`method`](#property-method) | - |
| <a id="property-numbers"></a> `numbers` | \[`number`, `number`, `number`\] | - | - | - |
| <a id="property-upper-1"></a> `upper` | [`Trigram`](#trigram) | - | - | - |
| <a id="property-lower-1"></a> `lower` | [`Trigram`](#trigram) | - | - | - |

***

### SixLinesLine

One line of a Six Lines chart.

#### Properties

| Property | Type | Description |
| ------ | ------ | ------ |
| <a id="property-position"></a> `position` | `number` | 1 = bottom. |
| <a id="property-yang"></a> `yang` | `boolean` | - |
| <a id="property-moving-2"></a> `moving` | `boolean` | - |
| <a id="property-stem"></a> `stem` | `string` | - |
| <a id="property-branch"></a> `branch` | `string` | - |
| <a id="property-element-3"></a> `element` | `string` | - |
| <a id="property-relation"></a> `relation` | `string` | Six relation by the palace element, in `lang`. |
| <a id="property-relationcode"></a> `relationCode` | `string` | "parent", "sibling", "offspring", "wealth", "officer". |
| <a id="property-spirit"></a> `spirit` | `string` | Six spirit by the day stem, in `lang`. |
| <a id="property-spiritindex"></a> `spiritIndex` | `number` | 0 Azure Dragon ... 5 Dark Warrior. |
| <a id="property-world-1"></a> `world` | `boolean` | - |
| <a id="property-response-1"></a> `response` | `boolean` | - |
| <a id="property-void"></a> `void` | `boolean` | The branch is void (xun kong) on this day. |
| <a id="property-monthstate"></a> `monthState` | `string` | Seasonal state of the line's element under the month branch, in `lang`. |
| <a id="property-monthstatecode"></a> `monthStateCode` | `string` | - |
| <a id="property-monthbreak"></a> `monthBreak` | `boolean` | The month branch clashes with the line's branch (and the day branch does not equal it). |
| <a id="property-changed-2"></a> `changed` | \| \{ `branch`: `string`; `element`: `string`; `relation`: `string`; `relationCode`: `string`; \} \| `null` | For a moving line: the line it turns into (branch, element, relation by the original palace). |

***

### SixLinesChart

A Six Lines (Liu Yao, najia) chart.

#### Properties

| Property | Type | Description |
| ------ | ------ | ------ |
| <a id="property-date"></a> `date` | `string` | - |
| <a id="property-day"></a> `day` | `string` | Day pillar. |
| <a id="property-month"></a> `month` | `string` | Month pillar, by the solar term at noon Vietnam time (the month turns at the twelve jie terms). |
| <a id="property-void-1"></a> `void` | \[`string`, `string`\] | The two void branches of the day's decade. |
| <a id="property-hexagram"></a> `hexagram` | [`Hexagram`](#hexagram) | - |
| <a id="property-changed-3"></a> `changed` | [`Hexagram`](#hexagram) \| `null` | - |
| <a id="property-palace-1"></a> `palace` | [`Palace`](#palace) | - |
| <a id="property-world-2"></a> `world` | `number` | - |
| <a id="property-response-2"></a> `response` | `number` | - |
| <a id="property-lines-5"></a> `lines` | [`SixLinesLine`](#sixlinesline)[] | - |
| <a id="property-lang-5"></a> `lang` | [`Lang`](am-lich.md#lang) | - |
| <a id="property-raw-4"></a> `raw` | `object` | - |
| `raw.number` | `number` | - |
| `raw.changed` | `number` \| `null` | - |
| `raw.day` | `string` | - |
| `raw.month` | `string` | - |
| `raw.void` | \[`string`, `string`\] | - |
| `raw.palace` | `number` | - |
| `raw.palaceElement` | `string` | - |
| `raw.generation` | `number` | - |
| `raw.world` | `number` | - |
| `raw.response` | `number` | - |
| `raw.lines` | `object`[] | - |

***

### DailyHexagram

The hexagram that rules a day in the Gua Qi calendar.

#### Properties

| Property | Type | Description |
| ------ | ------ | ------ |
| <a id="property-date-1"></a> `date` | `string` | - |
| <a id="property-hexagram-1"></a> `hexagram` | [`Hexagram`](#hexagram) | - |
| <a id="property-cycleindex"></a> `cycleIndex` | `number` | 1 to 60 in the Gua Qi cycle (1 = Inner Truth at the winter solstice). |
| <a id="property-role"></a> `role` | `string` | Rank of the hexagram in its solar month: duke, sovereign, marquis, grand master, minister (in `lang`). |
| <a id="property-rulingline"></a> `rulingLine` | `number` | The line that rules this day (one line per day; the 7/80-day remainder goes to the top line). |
| <a id="property-dayinhexagram"></a> `dayInHexagram` | `number` | 1 to 7: which noon since the hexagram began. |
| <a id="property-solstice"></a> `solstice` | `object` | The winter solstice the count starts from, Vietnam time (UTC+7). |
| `solstice.date` | `string` | - |
| `solstice.time` | `string` | - |
| <a id="property-minutessincesolstice"></a> `minutesSinceSolstice` | `number` | - |
| <a id="property-minutestochange"></a> `minutesToChange` | `number` | Minutes from noon to the nearest change of hexagram. |
| <a id="property-nearchange"></a> `nearChange` | `boolean` | Noon is within 2 minutes of a change: the neighbouring hexagram is within the solar-term error. |
| <a id="property-change"></a> `change` | \| \{ `time`: `string`; `before`: [`Hexagram`](#hexagram); `after`: [`Hexagram`](#hexagram); \} \| `null` | The change of hexagram inside this day (Vietnam time), or null. |
| <a id="property-solarterm"></a> `solarTerm` | `string` | - |
| <a id="property-cardinal"></a> `cardinal` | `object` | The cardinal hexagram (Kan, Zhen, Li, Dui) and its line that rule the solar term. |
| `cardinal.hexagram` | [`Hexagram`](#hexagram) | - |
| `cardinal.line` | `number` | - |
| <a id="property-model"></a> `model` | `string` | Code of the method (Meng Xi, 6 days 7 parts each, anchored at the true winter solstice, read at noon UTC+7). |
| <a id="property-lang-6"></a> `lang` | [`Lang`](am-lich.md#lang) | - |
| <a id="property-raw-5"></a> `raw` | `object` | - |
| `raw.number` | `number` | - |
| `raw.cycleIndex` | `number` | - |
| `raw.dayInHexagram` | `number` | - |
| `raw.rulingLine` | `number` | - |
| `raw.role` | `string` | - |
| `raw.roleEn` | `string` | - |
| `raw.roleZh` | `string` | - |
| `raw.solstice` | `object` | - |
| `raw.solstice.date` | `string` | - |
| `raw.solstice.time` | `string` | - |
| `raw.minutesSinceSolstice` | `number` | - |
| `raw.minutesToChange` | `number` | - |
| `raw.nearChange` | `boolean` | - |
| `raw.solarTerm` | `number` | - |
| `raw.cardinal` | `object` | - |
| `raw.cardinal.number` | `number` | - |
| `raw.cardinal.line` | `number` | - |
| `raw.change` | \| \{ `time`: `string`; `before`: \{ `number`: `number`; `cycleIndex`: `number`; \}; `after`: \{ `number`: `number`; `cycleIndex`: `number`; \}; \} \| `null` | - |
| `raw.model` | `string` | - |

***

### HexagramSvgOptions

Options of `renderHexagramSvg`.

#### Properties

| Property | Type | Description |
| ------ | ------ | ------ |
| <a id="property-lang-7"></a> `lang?` | [`Lang`](am-lich.md#lang) | Language of the names: "en" (default), "vi", "zh". |
| <a id="property-theme"></a> `theme?` | `"light"` \| `"dark"` | "light" (default) or "dark". |
| <a id="property-width"></a> `width?` | `number` | Width in pixels; the height follows the aspect ratio. Default: natural size. |

***

### LineStatement

One line statement.

#### Properties

| Property | Type | Description |
| ------ | ------ | ------ |
| <a id="property-line"></a> `line` | `number` | 1 = bottom line ... 6 = top; 7 is the extra statement of hexagrams 1 and 2 (use of nine, use of six). |
| <a id="property-label"></a> `label` | `string` | The line's name in the classic (its first two characters): 初九, 六二 ... 上六, 用九, 用六. |
| <a id="property-zh"></a> `zh` | `string` | Classical Chinese, traditional characters, as in the received text. |
| <a id="property-en"></a> `en` | `string` \| `null` | James Legge's 1882 translation, OCR text as printed; null if missing. |

***

### HexagramText

The classical text of a hexagram.

#### Properties

| Property | Type | Description |
| ------ | ------ | ------ |
| <a id="property-number-4"></a> `number` | `number` | - |
| <a id="property-judgment"></a> `judgment` | `object` | The judgment (卦辭) on the whole hexagram. |
| `judgment.zh` | `string` | - |
| `judgment.en` | `string` \| `null` | - |
| <a id="property-lines-6"></a> `lines` | [`LineStatement`](#linestatement)[] | - |
| <a id="property-source"></a> `source` | `object` | - |
| `source.zh` | `string` | - |
| `source.en` | `string` | - |
| `source.dataset` | `string` | - |

## Type Aliases

### HexagramInput

```ts
type HexagramInput = 
  | number
  | string
  | readonly (boolean | number)[]
  | {
  number: number;
};
```

A hexagram: its King Wen number (1 to 64), six lines (bottom line first,
`true` = yang), a binary string of the same lines ("111111" = Qian), a
name, a Hexagram object (anything with `number`), or the six coin values
6, 7, 8, 9 (the primary hexagram is used).

## References

### DateInput

Re-exports [DateInput](am-lich.md#dateinput)

***

### Lang

Re-exports [Lang](am-lich.md#lang)

***

### Terms

Re-exports [Terms](am-lich.md#terms)
