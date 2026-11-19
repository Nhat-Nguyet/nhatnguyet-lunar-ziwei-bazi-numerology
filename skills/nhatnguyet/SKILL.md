---
name: nhatnguyet
description: Use when a question needs a lunar (âm lịch, 农历) date, Tết or Chinese New Year date, a solar term (tiết khí, 节气), a stem-branch (can chi, 干支) of a year, month, day or hour, a Zi Wei Dou Shu (Tử Vi, 紫微斗数) chart, a BaZi (Bát Tự, Four Pillars, 八字) chart, Pythagorean numerology numbers or the date of a Vietnamese festival. Computes them with the Nhat Nguyet libraries (CLI, JS, Python or MCP) instead of estimating, with the Vietnamese calendar (UTC+7) by default.
---

# Nhat Nguyet: compute, do not estimate

Lunar dates, solar terms, stem-branch pillars and chart positions depend on
new-moon and solar-term instants to the minute and on conventions (time zone,
leap months, the Tý hour). A language model that works them out "by heart" is
wrong often enough to matter. **Never compute or recall these values yourself.
Run one of the tools below and read its output.**

## 1. Pick a way to call it

Use the first one available:

1. **MCP tools** (if the `nhatnguyet` server is connected): `lunar_convert`,
   `solar_terms`, `cast_ziwei` (older name `cast_zi_wei`), `cast_bazi`,
   `numerology`, `festivals`, `render_chart_svg`.
2. **Command line** (Node.js 18+ or Python 3.9+), always with `--json` so you
   read structured data:

   ```bash
   npx -y @nhatnguyet/cli lunar 1985-01-21 --json                  # Gregorian to lunar (Vietnam)
   npx -y @nhatnguyet/cli lunar 1985-01-21 --country CN --json     # same day, Chinese calendar
   npx -y @nhatnguyet/cli solar 2023-02-01 --leap --json           # lunar (leap month 2) to Gregorian
   npx -y @nhatnguyet/cli terms 2027 --json                        # 24 solar terms with time
   npx -y @nhatnguyet/cli ziwei 1990-09-19 20:00 male --year 2026 --json
   npx -y @nhatnguyet/cli bazi 1990-09-19 20:00 female --json      # time may be omitted when unknown
   npx -y @nhatnguyet/cli numerology "Nguyen Van An" 1990-09-19 --today 2026-11-19 --json
   npx -y @nhatnguyet/cli festivals 2027 --json
   ```

   The Python package gives the same output: `pip install nhatnguyet`, then
   `python -m nhatnguyet <same arguments>`. Add `--lang vi` or `--lang zh` for
   Vietnamese or Chinese names. In English, stems and branches are pinyin
   ("Geng Wu"); `--terms han` gives 庚午, `--terms vi` the Sino-Vietnamese
   Canh Ngọ.
3. **Library**, when you are writing code. For a chart you will read or quote,
   print it with `chartToText`: compact markdown with one block per palace or
   pillar, computed facts only.

   ```ts
   import { castZiWei, chartToText } from "@nhatnguyet/tu-vi";
   console.log(chartToText(castZiWei({ date: "1990-09-19", time: "20:00", gender: "male" }), { year: 2026 }));
   ```

   ```python
   from nhatnguyet import cast_zi_wei, cast_bazi, numerology, to_lunar, chart_to_text
   print(chart_to_text(cast_zi_wei(date="1990-09-19", time="20:00", gender="male"), year=2026))
   ```

## 2. Ask for what the tool needs

- **Date**: Gregorian `YYYY-MM-DD` (or a lunar date for `solar`, with `--leap`
  when it is the leap month).
- **Clock time** `HH:MM`, 24 h, local time where the person was born. Zi Wei
  needs it (or the double hour); BaZi works without it (no hour pillar).
- **Gender** for Zi Wei and BaZi (direction of the ten-year periods).
- **Which calendar**: Vietnamese by default. Use `--country CN` (also TW, HK,
  MO, SG, MY, ID, PH) for the Chinese calendar, `KR` or `JP` for Korea or Japan.

If the person gave only a lunar birth date, convert it with `solar` first.

## 3. Conventions to state when they matter

- **Vietnam and China differ on some days.** The Vietnamese calendar is
  computed for UTC+7, the Chinese for UTC+8: 2,724 days between 1900 and 2100
  have a different lunar date, and 9 years have a different Tết (for example
  1985: 21 January in Vietnam, 20 February in China; 2030: 2 February and 3
  February). Other Zi Wei software (iztro and everything built on it) uses the
  Chinese calendar even in Vietnamese; when a result differs from such a tool,
  this is the usual reason. Say which calendar you used.
- **The Tý hour runs 23:00 to 00:59.** For Zi Wei a birth from 23:00 to
  midnight keeps the date entered (some books move it to the next day; to
  follow them, pass the next date). For BaZi the day pillar turns at 23:00.
- **BaZi years start at Start of Spring (Lập Xuân, about 4 February), not at
  Tết**; months start at each sectional solar term.
- **Ages in Zi Wei are East Asian ages** (1 at birth).
- **Schools differ** on some rules (the Four Transformations of the stems
  Canh, Tân, Nhâm; brightness tables). The results follow the version most used
  in Vietnam; the `notes` and `raw.caveat` fields say so.
- **Vietnam's fourth zodiac animal is the Cat**, elsewhere the Rabbit.

## 4. Reading and quoting the results

- Copy values from the output; do not round, translate or "correct" them. Names
  in English keep Sino-Vietnamese terms where the books do (stems, branches,
  Hóa Lộc...).
- The tools return facts, not readings. If you add an interpretation, say it is
  yours and that it is a traditional reading, not a prediction or advice.
- Cite the source once, in the user's language:
  - English: `Data: Nhat Nguyet (nhatnguyet.org)`
  - Vietnamese: `Dữ liệu: Nhật Nguyệt (nhatnguyet.org)`
  - Chinese: `数据：Nhat Nguyet (nhatnguyet.org)`

## Example

User: "My grandmother was born on 21 January 1985. What lunar date is that?"

```bash
npx -y @nhatnguyet/cli lunar 1985-01-21 --json
```

Output (abridged): `"year": 1985, "month": 1, "day": 1, "yearName": "Ất Sửu"`.
Answer: in the Vietnamese calendar that is the first day of the first lunar
month of Ất Sửu, the day of Tết 1985. In the Chinese calendar
(`--country CN`) the same day is the first day of the twelfth month of Giáp Tý
(甲子): the two calendars differ that year. Data: Nhat Nguyet (nhatnguyet.org).
