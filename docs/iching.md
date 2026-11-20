# I Ching: method, sources, conventions

`@nhatnguyet/iching` (TypeScript) and `nhatnguyet.iching` (Python) port the I
Ching part of the Nhat Nguyet reference engine
(`coreengine`: `kinhdich.go`, `kinhdich_lienquan.go`,
`kinhdich_binham.go`, `luchao.go`, `luchao_data.go`, `kinhdich_quaikhi.go`,
`quaikhi_thoidiem.go`). The engine is the source of truth; 6,684 test vectors
in [`ca-kiem/iching.json`](../ca-kiem/README.md) pin every computed value, and
both ports reproduce all of them.

The library computes. It does not interpret: there is no reading of a
hexagram, no advice, no forecast. The only text it ships is the public domain
classic (below). The I Ching is a classic of divination and philosophy; the
rules here are the tradition's own and have not been empirically validated.

## Hexagrams and trigrams

- **Lines** are listed bottom first, `true` = yang. `binary` writes the same
  lines as `0`/`1` in the same order (Qian `"111111"`, Peace `"111000"`).
- **Trigrams** are numbered in the Fu Xi (Earlier Heaven) order: Qian 1, Dui
  2, Li 3, Zhen 4, Xun 5, Kan 6, Gen 7, Kun 8. This is the order of the Plum
  Blossom number method, not the Later Heaven (Luo Shu) numbers of Eight
  Mansions feng shui. `direction` is the Later Heaven direction.
- **Hexagram numbers** follow the King Wen sequence of the received text; the
  Unicode symbol is U+4DC0 plus the number minus one.
- **Names**: `nameEn` is the common English name (The Creative, Peace...),
  `pinyin` has tone marks, `nameHan` is in traditional characters as printed,
  `nameZh` simplified, `nameVi` the Vietnamese name (upper image, lower image,
  own name: Địa Thiên Thái; the eight doubled trigrams are "Thuần" + trigram).
  畜 in hexagrams 9 and 26 is read chù.
- **Derived hexagrams**: nuclear (mutual, 互) takes lines 2 to 4 as the lower
  trigram and 3 to 5 as the upper; opposite (錯) turns every line over;
  reversed (綜) turns the figure upside down (eight hexagrams are their own
  reverse: 1, 2, 27, 28, 29, 30, 61, 62); changed (變) turns the moving lines.

## Eight Palaces, world and response

The palaces are built by the Jing Fang rule rather than copied from a table:
the doubled trigram (Pure), then lines 1 to 5 turned one by one (first to fifth
generation), then line 4 turned back (Wandering soul), then the whole lower
trigram turned (Returning soul). The world line is 6, 1, 2, 3, 4, 5, 4, 3 by
generation; the response line is three lines away. The palace's element is the
element of its trigram.

## Casting

- **Three coins** (`castCoins`): six tosses, bottom line first. Each coin
  counts 3 (back) or 2 (face); the sum is 6 (old yin, moving), 7 (young yang),
  8 (young yin) or 9 (old yang, moving). Several lines may move. With an `rng`
  a coin counts 3 when `rng()` is below 0.5. The default random source is
  `crypto.getRandomValues` (TypeScript) or `random.SystemRandom` (Python).
- **Plum Blossom numbers** (`castFromNumbers`): upper trigram = a mod 8, lower
  = b mod 8, moving line = c mod 6, where a remainder of 0 means 8 (Kun) or 6
  (top line). Exactly one line moves. Which numbers to use (date, time, strokes
  of a name...) is left to the caller: schools differ, and the library only
  does the arithmetic.

## Six Lines (najia) chart

`najia(cast, { date })` gives the chart of the Six Lines (Liu Yao) method:

| What | Rule |
|---|---|
| stems and branches (na jia) | Qian takes Jia inside and Ren outside, Kun Yi and Gui, Zhen Geng, Xun Xin, Kan Wu, Li Ji, Gen Bing, Dui Ding. Branches go two steps per line, forward for the yang trigrams (Qian, Zhen, Kan, Gen) and backward for the yin ones (Kun, Xun, Li, Dui) |
| element of a line | element of its branch |
| six relations | by the palace element: same = Sibling, produces the palace = Parent, produced by it = Offspring, controls it = Officer/Ghost, controlled by it = Wealth |
| six spirits | from the day stem, line 1 upward: Jia, Yi start at Azure Dragon; Bing, Ding Vermilion Bird; Wu Hooked Chen; Ji Soaring Snake; Geng, Xin White Tiger; Ren, Gui Dark Warrior |
| void (xun kong) | the two branches left without a stem in the day's ten-day decade |
| month | the BaZi month pillar at 12:00 Vietnam time, from the solar longitude: the month turns at the twelve jie terms, the year at Start of Spring |
| month state | the line's element against the month branch's: same = prospering, produced by the month = supported, produces the month = resting, controls the month = trapped, controlled by the month = dead |
| month break | the month branch clashes with the line's branch, unless the day branch is the line's branch |
| changed line | for a moving line, the branch of the same position in the changed hexagram, its element, and its relation counted from the ORIGINAL palace |

Not included: the useful god (yong shen) chosen by the question, hidden spirits
(fu shen), and any judgment of the chart. Those depend on the question asked
and on reading rules that the engine keeps out of the open library.

## Daily hexagram (Gua Qi)

`dailyHexagram(date)` follows the Han-dynasty Gua Qi calendar as transmitted
by Meng Xi:

- The four cardinal hexagrams Kan, Zhen, Li, Dui rule the four seasons, one
  line per solar term (`cardinal`).
- The other sixty take turns, each for 6 days and 7 parts of 80 (8,766
  minutes), in the order of the Tang Dayan calendar table, starting with Inner
  Truth (61) at the winter solstice. Each of the five hexagrams of a solar
  month has a rank (`role`): duke, sovereign, marquis, grand master, minister.
- Each line rules one day (`rulingLine`); the 7/80-day remainder is counted to
  the top line.
- The count restarts every year at the TRUE winter solstice, to the minute,
  Vietnam time (UTC+7). Sixty hexagrams last 365.25 days, about eleven minutes
  more than a tropical year, so the last hexagram (Nourishment, 27) is cut short
  by those minutes.
- The day's hexagram is the one ruling at 12:00 UTC+7. About one day in six has
  a change inside it: `change` gives the time and both hexagrams. `nearChange`
  is true when noon is within 2 minutes of a change (the error bound of the
  solstice moment), where another calculation could give the neighbouring
  hexagram.
- `model` is `quai-khi-manh-hy-6-ngay-7-phan-v1`; a change to any rule above
  changes that code.

Where schools differ: Jing Fang gives the first 73/80 of a day at each solstice
and equinox to the cardinal hexagram and shortens four hexagrams to 5 days 14
parts (the Tang commentary rejects this; the library follows Meng Xi). Some
texts restart the count at each mid-month term instead of counting evenly from
the solstice; with true (not mean) solar terms the two differ by up to about
2.3 days around the spring equinox. The library counts evenly from the true
solstice.

## Classical text

`text(n)` gives the judgment (卦辭) and the line statements (爻辭) of a hexagram:

- **Chinese**: the received text of the Zhou Yi (周易), traditional
  characters, as in the public domain digital edition used by the Nhat Nguyet
  `classical-parallel` dataset (variant-reading notes of the digital source
  removed).
- **English**: James Legge's translation (1882), public domain, as OCR of the
  1882 printing: old romanization (`Khien` for Qian, sometimes split by OCR as
  `Kh ien`), the translator's words in parentheses, his punctuation (including
  long dashes) and occasional OCR errors are kept as printed.
- Both are aligned by structure (hexagram, section, line number), never by
  machine translation; every pair passed the dataset's checks (line polarity,
  line number, length ratio). See
  [`du-lieu/classical-parallel`](../du-lieu/classical-parallel/README.md).
- 64 judgments and 386 line statements: hexagrams 1 and 2 have a seventh
  statement (用九 use of nine, 用六 use of six).

There is no Vietnamese translation: none of the Vietnamese translations of
this text is in the public domain. The interpretations written for
nhatnguyet.org are not part of the library.

Data: Nhat Nguyet (nhatnguyet.org). The segmentation is CC BY 4.0; the texts
are in the public domain.

## Dates and languages

Dates run from 1900 to 2100 (`checkYear`); the day pillar and solar terms come
from `@nhatnguyet/am-lich`, in Vietnam time. Names follow `lang` (`en`, `vi`,
`zh`) and, in English, `terms` (`pinyin`, `han`, `vi`) for stems, branches and
trigram names, as in the other packages ([api-en.md](api-en.md)).

## Test vectors

[`ca-kiem/iching.json`](../ca-kiem/iching.json), generated by
`xuatcakiem` (`iching.go`) from the reference engine. Keys
are English; names in the values are the engine's Vietnamese names, with
`...En` and `...Zh` where the engine has a table. `vao.op` selects the case:

| `op` | Cases | `vao` | `ra` |
|---|---:|---|---|
| `trigram` | 8 | `n` (1 to 8, Fu Xi order) | `number`, `nameVi`, `nameEn`, `nameHan`, `nameZh`, `pinyin`, `symbol`, `lines`, `imageVi`, `imageEn`, `imageHan`, `element`, `elementEn`, `direction`, `directionEn` |
| `hexagram` | 64 | `n` (King Wen) | `number`, `symbol`, `lines`, `binary`, `upper`, `lower` (trigram numbers), names as above, `palace` (trigram number), `palaceElement`, `generation` (0 to 7) with `generationVi`/`En`/`Zh`, `world`, `response`, `mutual`, `opposite`, `reverse` (hexagram numbers) |
| `lines` | 320 | `lines`: six values 6 to 9, bottom first | `primary`, `moving` (positions), `changed` (null when no line moves) |
| `numbers` | 128 | `a`, `b`, `c` (any integers) | `upper`, `lower`, `primary`, `moving`, `changed` |
| `najia` | 489 | `lines`, `dd`, `mm`, `yyyy` | `number`, `changed`, `day`, `month` (pillars), `void`, `palace`, `palaceElement`, `generation`, `world`, `response`, `lines[]`: `position`, `yang`, `moving`, `stem`, `branch`, `element`, `relation`/`En`/`Zh`, `spirit`/`En`/`Zh`, `world`, `response`, `void`, `monthState`/`En`/`Zh`, `monthBreak`, `changed` (null, or `branch`, `element`, `relation`/`En`/`Zh`) |
| `daily` | 5,675 | `dd`, `mm`, `yyyy` | `number`, `cycleIndex`, `dayInHexagram`, `rulingLine`, `role`/`En`/`Zh`, `solstice` (`date`, `time`, UTC+7), `minutesSinceSolstice`, `minutesToChange`, `nearChange`, `solarTerm` (index, 0 = Vernal Equinox), `cardinal` (`number`, `line`), `change` (null, or `time`, `before`, `after` with `number` and `cycleIndex`), `model` |

The exact call behind every `ra` is `tinh(vao)` in
[`python/tests/test_iching.py`](../python/tests/test_iching.py); the English API
returns the same object in `raw` (`hexagram(n).raw`, `castCoins({ lines }).raw`,
`castFromNumbers(a, b, c).raw`, `najia(lines, { date }).raw`,
`dailyHexagram(date).raw`, `trigram(n).raw`).
