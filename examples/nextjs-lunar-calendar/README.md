# Vietnamese lunar calendar with Next.js

A one-page Next.js app (App Router) built on the Nhat Nguyet libraries:

- a month grid with the lunar date under every day and the solar terms marked;
- today's lunar date, day, month and year in the sexagenary cycle (can chi), zodiac animal and solar term;
- a countdown to the next Tết (Lunar New Year);
- a Zi Wei Dou Shu chart (SVG) drawn from a birth date, time and gender.

Everything is computed in the browser: no server, no API call. `npm run build`
writes a static site to `out/` that you can host anywhere (GitHub Pages,
Netlify, Cloudflare Pages, any web server).

## Run it (about 2 minutes)

Inside this repository the example uses the local packages, so build them once:

```bash
cd ../../js && npm install && npm run build && cd -   # local packages, once
npm install
npm run dev            # http://localhost:3000
npm run build          # static site in out/
npm test               # the calendar functions in lib/calendar.js
```

## In your own project

From version 0.3.0 the packages are on npm under English names. Replace the
four `file:` dependencies in `package.json` with:

```json
"@nhatnguyet/lunar": "^0.3.0",
"@nhatnguyet/ziwei": "^0.3.0"
```

and delete `.npmrc`. `@nhatnguyet/lunar` and `@nhatnguyet/ziwei` are the
English-named aliases of `@nhatnguyet/am-lich` and `@nhatnguyet/tu-vi`
(same code, same API).

## Files

| File | What it does |
|---|---|
| `lib/calendar.js` | `monthGrid`, `dayInfo`, `nextTet`: plain functions, tested in Node |
| `app/Calendar.jsx` | today card and month grid (client component: "today" is the viewer's date) |
| `app/ZiWeiForm.jsx` | the form and the chart, `castZiWei(...).toSvg()` |
| `next.config.mjs` | `output: "export"` for a static site |

## Changing it

- **Language**: every function takes `lang: "en" | "vi" | "zh"`, for example
  `toLunar(date, { lang: "vi" })` gives "Đinh Mùi" instead of "Ding Wei".
  English stems and branches can also be written in Chinese characters with
  `terms: "han"`.
- **Another country's calendar**: `{ country: "CN" }` (or `KR`, `JP`, `TW`...)
  in `monthGrid`, `dayInfo` and `nextTet`. Vietnam and China disagree on 2,814
  days between 1900 and 2100, Tết 1985 among them.
- **GitHub Pages under a sub-path**: add `basePath: "/<repo>"` to `next.config.mjs`.

Zi Wei Dou Shu is a traditional system, not a validated science; the chart is
computed data, not advice.

Data: Nhat Nguyet (nhatnguyet.org)
