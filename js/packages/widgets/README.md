# @nhatnguyet/widgets

> **English:** Vietnamese lunar calendar web components that run entirely in the browser: today's date, a month grid, auspicious hours, a Tết countdown and a date converter. No server, no framework, no tracking. By Nhat Nguyet ([nhatnguyet.org](https://nhatnguyet.org)).

Five Custom Elements with their own Shadow DOM styles. The numbers come from
[`@nhatnguyet/am-lich`](https://www.npmjs.com/package/@nhatnguyet/am-lich), the
TypeScript port of the engine behind nhatnguyet.org, so the lunar dates match
the embeddable widgets on the site.

## Use from a CDN

```html
<script type="module" src="https://cdn.jsdelivr.net/npm/@nhatnguyet/widgets/dist/nn-widgets.js"></script>

<nn-lich-hom-nay lang="en" theme="auto"></nn-lich-hom-nay>
<nn-lich-thang lang="en"></nn-lich-thang>
<nn-gio-hoang-dao lang="en"></nn-gio-hoang-dao>
<nn-dem-nguoc-tet lang="en"></nn-dem-nguoc-tet>
<nn-doi-lich lang="en"></nn-doi-lich>
```

`dist/nn-widgets.js` is one self-contained ES module (about 30 KB, 12 KB gzipped).

## Use from npm

```sh
npm install @nhatnguyet/widgets
```

```js
import "@nhatnguyet/widgets"; // registers the five tags
```

Importing in Node (server rendering, tests) does not throw; the tags are only
registered where `customElements` exists. The pure calculation layer is
available on its own:

```js
import { ngayLich, gioHoangDao, tetSapToi } from "@nhatnguyet/widgets/tinh";

ngayLich({ day: 19, month: 11, year: 2026 }).am;   // { day: 11, month: 10, year: 2026, leap: false }
tetSapToi({ day: 19, month: 11, year: 2026 }).tet;  // { day: 6, month: 2, year: 2027 }
```

## Elements

| Tag | Shows |
|---|---|
| `<nn-lich-hom-nay>` | Today's solar date, weekday, lunar date, day stem-branch, solar term |
| `<nn-lich-thang>` | Month grid with lunar days; previous and next month; tap a day for details |
| `<nn-gio-hoang-dao>` | The 12 two-hour periods of the day, auspicious ones highlighted |
| `<nn-dem-nguoc-tet>` | Days until the Lunar New Year (Tết), with the year's sign |
| `<nn-doi-lich>` | Pick a solar date, read the lunar date and that day's auspicious hours |

## Attributes

| Attribute | Values | Default |
|---|---|---|
| `lang` | `vi`, `en`, `zh` | `vi` |
| `theme` | `light`, `dark`, `auto` (follows the reader's device) | `light` |
| `accent` | 6-digit hex colour, e.g. `#1f6f6b` | brick red `#b5402f` |
| `country` | `VN`, `CN`, `TW`, `HK`, `MO`, `SG`, `MY`, `ID`, `PH`, `KR`, `JP` (time zone used for the lunar calendar) | `VN` |
| `date` | `YYYY-MM-DD`, pins the day shown | the reader's local today |
| `month` | `YYYY-MM`, first month shown by `<nn-lich-thang>` | current month |

The layout adapts to the width you give it (container queries): the 12 hour
cells fold into two rows of six below 600 px. Styles live in the Shadow DOM and
do not leak into your page; the outer frame is exposed as `::part(frame)`.

## Conventions

- Lunar dates use Vietnam time (UTC+7) for every year unless `country` says otherwise; the Tết of 2030 is 2 February in Vietnam and 3 February in China.
- The day's solar term is taken at noon Vietnam time, as in the engine.
- Stem-branch names stay in Sino-Vietnamese in English (as on nhatnguyet.org) and appear in Chinese characters in `zh`.
- Auspicious hours follow the folk table used by Vietnamese almanacs; they are a convention, not a measurement.

## Try it locally

```sh
npm run build                       # dist/ (tsc) and dist/nn-widgets.js (esbuild)
npx serve ..                        # any static server, from js/packages
# open http://localhost:3000/widgets/examples/index.html?lang=en&theme=auto&rong=300
```

`npm test` checks the calculation layer against 50 dates answered by the
nhatnguyet.org API (lunar date, day stem-branch, solar term, auspicious hours,
next Tết).

## Credit

Every widget shows a one-line "Source: Nhat Nguyet" credit linking to
nhatnguyet.org. Please keep it.

MIT licence.
