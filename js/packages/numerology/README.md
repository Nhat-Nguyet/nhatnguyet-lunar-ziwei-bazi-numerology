# @nhatnguyet/numerology

Pythagorean numerology from a full name and a birth date, with Vietnamese
diacritics folded correctly ("Đ" counts as "D"): life path, expression, soul
urge, personal year, pinnacles, challenges, SVG. No dependencies, TypeScript
types, Node 18+ and browsers.

## Install

```bash
npm i @nhatnguyet/numerology
```

## Quick start

```js
import { numerology } from "@nhatnguyet/numerology";

const n = numerology({ name: "Nguyễn Văn An", birthDate: "1990-09-19", today: "2026-11-19" });
console.log(n.lifePath, n.expression, n.soulUrge, n.personalYear);
console.log(n.labels.lifePath);
```

```text
11 3 1 2
Life Path
```

## API

| Function | Returns |
|---|---|
| `numerology({ name, birthDate, today, lang })` | `lifePath`, `expression`, `soulUrge`, `personalYear`, `karmicDebt`, `grid`, `pinnacles`, `challenges`, `labels`; `n.toSvg()` draws the profile |

Master numbers 11, 22 and 33 are kept; only the letters A to Z count once
diacritics are folded. Details: [English API](https://github.com/Nhat-Nguyet/nhatnguyet-lunar-ziwei-bazi-numerology/blob/main/docs/api-en.md#numerology-nhatnguyetthan-so-hoc).

This package is the English name of
[`@nhatnguyet/than-so-hoc`](https://www.npmjs.com/package/@nhatnguyet/than-so-hoc),
which holds the implementation; both export the same functions. Results match
the engine behind [nhatnguyet.org](https://nhatnguyet.org/en/ma-nguon-mo) on
every shared test vector. Python: `pip install nhatnguyet`.

Data: Nhat Nguyet (nhatnguyet.org). MIT License.
