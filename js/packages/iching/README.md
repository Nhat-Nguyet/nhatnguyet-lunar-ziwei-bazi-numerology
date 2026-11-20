# @nhatnguyet/iching

**The I Ching (Yijing, Book of Changes) for JavaScript and TypeScript.** The 64
hexagrams with their names in English, pinyin, Chinese and Vietnamese, the
eight trigrams, the Eight Palaces with world and response lines, the nuclear,
opposite, reversed and changed hexagrams, three-coin and Plum Blossom casting,
the Six Lines (Liu Yao, najia) chart of a day, the daily hexagram of the Han
Gua Qi calendar, the public domain text of the Zhou Yi with James Legge's 1882
translation, and an SVG drawing. No external dependencies (it uses
`@nhatnguyet/am-lich` for the calendar).

[![license: MIT](https://img.shields.io/badge/license-MIT-1f6f6b.svg)](./LICENSE)
[![test cases: 6,684](https://img.shields.io/badge/test%20cases-6%2C684%20passing-2e7d32.svg)](../../../ca-kiem/README.md)

This is the TypeScript port of the I Ching engine behind
[nhatnguyet.org](https://nhatnguyet.org/en/ma-nguon-mo), checked field by field
against 6,684 reference cases (`ca-kiem/iching.json`). The Python twin is
`nhatnguyet.iching`. Method, sources and conventions: [docs/iching.md](../../../docs/iching.md).

## Install

```bash
npm i @nhatnguyet/iching
```

## Quick start

```js
import { hexagram, castCoins, najia, dailyHexagram } from "@nhatnguyet/iching";

const h = hexagram("Peace");
console.log(h.number, h.symbol, h.name, h.pinyin, h.nameHan, h.nameVi);
console.log(h.upper.name, h.upper.image, "over", h.lower.name, h.lower.image);

// a cast recorded by hand: line values bottom first (6 and 9 are moving lines)
const cast = castCoins({ lines: [9, 8, 7, 6, 7, 8] });
console.log(cast.primary.name, "->", cast.changed.name, cast.moving);

const chart = najia(cast, { date: "2026-11-19" });
console.log(chart.day, chart.month, chart.void.join(" "), chart.palace.name, chart.palace.element);
for (const l of [...chart.lines].reverse()) {
  console.log(l.position, l.stem, l.branch, l.element, l.relation, "/", l.spirit, l.world ? "(world)" : l.response ? "(response)" : "");
}

const day = dailyHexagram("2026-11-19");
console.log(day.hexagram.name, day.cycleIndex, day.role, day.rulingLine);
```

```text
11 ䷊ Peace Tài 泰 Địa Thiên Thái
Kun Earth over Qian Heaven
After Completion -> Influence [ 1, 4 ]
Ding You Ji Hai Chen Si Kan Water
6 Wu Zi Water Sibling / Azure Dragon (response)
5 Wu Xu Earth Officer/Ghost / Dark Warrior 
4 Wu Shen Metal Parent / White Tiger 
3 Ji Hai Water Sibling / Soaring Snake (world)
2 Ji Chou Earth Officer/Ghost / Hooked Chen 
1 Ji Mao Wood Offspring / Vermilion Bird 
Biting Through 55 minister 4
```

## Hexagrams

`hexagram(input)` takes a King Wen number (1 to 64), six lines bottom first
(booleans or 0/1, `true` = yang), a binary string in the same order
(`"111000"`), six coin values 6 to 9, or a name: English, pinyin (with or
without tone marks), Chinese (traditional or simplified) or Vietnamese (with or
without diacritics). A name that fits two hexagrams throws: "Lu" (and even
"Lǚ") is both 10 履 and 56 旅.

```ts
import { hexagram, mutual, opposite, reverse, changed, trigram } from "@nhatnguyet/iching";

hexagram(11).palace;    // {"number":8,"name":"Kun","element":"Earth","generation":3,"generationName":"Third generation"}
hexagram(11).world;     // 3
hexagram("泰").binary;  // "111000"
hexagram(11, { lang: "zh" }).name;  // "泰"
hexagram(11, { lang: "vi" }).name;  // "Địa Thiên Thái"
mutual(11).name;        // "The Marrying Maiden"
opposite(11).name;      // "Standstill"
reverse(11).name;       // "Standstill"
changed(11, [5]).name;  // "Waiting"
trigram("Thunder").symbol;  // "☳"
```

`upper` and `lower` are trigrams (`number` in the Fu Xi order, Qian 1 ... Kun
8, with `image`, `element`, `direction`). `palace` is the Eight Palaces (Jing
Fang) palace with its element and the generation of the hexagram in it; `world`
and `response` are the Shi and Ying lines. Every result keeps the core object
in `raw`.

## Casting

```ts
import { castCoins, castFromNumbers } from "@nhatnguyet/iching";

castCoins().lines;                        // six random line values 6 to 9
castCoins({ rng: () => 0.3 }).moving;     // [1,2,3,4,5,6]  (every coin counted 3: all old yang)
castFromNumbers(2026, 11, 19).lines;      // [9,8,7,7,7,8]
castFromNumbers(2026, 11, 19).primary.name;  // "Revolution"
```

- `castCoins({ rng?, lines? })`: three coins, six times, bottom line first. A
  coin counts 3 when `rng()` is below 0.5 and 2 otherwise; the sum is the line
  (6 old yin moving, 7 young yang, 8 young yin, 9 old yang moving). Without
  `rng` it uses `crypto.getRandomValues`. Pass `lines` to record a cast made by
  hand.
- `castFromNumbers(a, b, c)`: Plum Blossom (Mei Hua Yi Shu) numbers: upper
  trigram a mod 8, lower b mod 8, moving line c mod 6 (0 counts as 8 or 6).

## Six Lines (najia) chart

`najia(input, { date })` takes a cast, six coin values, or any hexagram (then
no line moves), and a date from 1900 to 2100. Each line has its stem and
branch, element, six relation by the palace element (`relation`,
`relationCode`), six spirit by the day stem, world and response, `void` (the
branch is empty in the day's decade), `monthState` under the month branch,
`monthBreak`, and for a moving line the branch it changes into. The month is
the BaZi month pillar at noon Vietnam time (it turns at the twelve jie terms).

## Daily hexagram (Gua Qi)

`dailyHexagram(date)` gives the hexagram ruling a day by the Han Gua Qi method
of Meng Xi: sixty hexagrams of 6 7/80 days each, in a fixed order from Inner
Truth at the true winter solstice, read at 12:00 Vietnam time. It is assigned
by the calendar, not cast. `change` gives the time when the next hexagram takes
over inside the day, `nearChange` flags a noon within two minutes of a change.

## Classical text

```ts
import { text } from "@nhatnguyet/iching";

text(1).judgment.zh;   // "乾：元亨。利貞。"
text(1).lines[0].label;  // "初九"
text(1).lines.length;  // 7
```

`text(n)` returns only public domain text: the judgment and the line
statements of the Zhou Yi (traditional characters) and James Legge's 1882
English translation, as OCR of the 1882 printing (old romanization and the
translator's own punctuation kept). Hexagrams 1 and 2 have a seventh statement
(use of nine, use of six). No commentary and no modern reading.

## SVG

```ts
import { castCoins, renderHexagramSvg } from "@nhatnguyet/iching";

renderHexagramSvg(castCoins({ lines: [9, 8, 7, 6, 7, 8] }), { theme: "dark", lang: "en" });
```

Six bars, a circle on a moving yang line, a cross on a moving yin line, and the
changed hexagram on the right. Options: `lang`, `theme` (`light`, `dark`),
`width`. The Python `render_hexagram_svg` gives the same bytes.

## Languages

`lang: "en" | "vi" | "zh"` (default `"en"`) sets every name. With `"en"`,
`terms: "pinyin" | "han" | "vi"` sets how stems, branches and trigram names are
written (pinyin without tone marks by default, so 戊 and 午 are both "Wu"; use
`"han"` when that matters). Relations, spirits, elements and month states have
English names whatever `terms` says. `relationCode`, `spiritIndex` and
`monthStateCode` are the same in every language.

## Python

```python
from nhatnguyet import iching

print(iching.hexagram("Peace")["pinyin"])
print(iching.najia([9, 8, 7, 6, 7, 8], date="2026-11-19")["lines"][0]["relation"])
```

```text
Tài
Offspring
```

## License

MIT. The classical text is in the public domain; its segmentation is from the
Nhat Nguyet `classical-parallel` dataset (CC BY 4.0). Data: Nhat Nguyet
(nhatnguyet.org).
