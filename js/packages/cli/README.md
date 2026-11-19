# @nhatnguyet/cli

**Zi Wei Dou Shu, BaZi, numerology and the Vietnamese, Chinese, Korean and
Japanese lunar calendars in your terminal.** Charts print as grids, or as JSON
and SVG. English by default, Vietnamese and Chinese with `--lang`. Runs
locally with the [Nhat Nguyet](https://nhatnguyet.org/en/ma-nguon-mo)
libraries, checked against 17,291 core test vectors (18,819 including school options and
auspicious hours) and NASA, IMCCE data.

```bash
npx @nhatnguyet/cli lunar 1985-01-21 --country CN
```

```text
┌────────────┬──────────────┐
│ Gregorian  │ 1985-01-21   │
│ Lunar      │ 1984-12-01   │
│ Year       │ Jia Zi · Rat │
│ Month      │ Ding Chou    │
│ Day        │ Geng Shen    │
│ Solar term │ Major Cold   │
│ Calendar   │ CN (UTC+8)   │
└────────────┴──────────────┘
```

Without `--country CN` the same day is Tết, `1985-01-01`, on the Vietnamese
calendar (UTC+7). Stems and branches print in pinyin; `--terms han` prints
甲子, `--terms vi` the Sino-Vietnamese Giáp Tý.

## Install

```bash
npm i -g @nhatnguyet/cli     # then: nhatnguyet ...
```

Node.js 18 or newer. The Python package prints the same text:
`pip install nhatnguyet`, then `nhatnguyet ...` or `python -m nhatnguyet ...`.

## Commands

```text
nhatnguyet ziwei <YYYY-MM-DD> <HH:MM> <male|female> [--name "..."] [--year 2026] [school options]
nhatnguyet bazi <YYYY-MM-DD> [HH:MM] <male|female> [--zi-hour ...]
nhatnguyet lunar <YYYY-MM-DD> [--country VN|CN|KR|JP|...]
nhatnguyet solar <lunar YYYY-MM-DD> [--leap] [--country ...]
nhatnguyet terms <year> [--country ...]
nhatnguyet hours <YYYY-MM-DD>     auspicious and inauspicious double hours of a day
nhatnguyet numerology "<full name>" <YYYY-MM-DD> [--today YYYY-MM-DD]
nhatnguyet festivals <year> [--ics]
```

Each command also answers to the name of the matching MCP tool: `cast_ziwei`
(and the older `cast_zi_wei`, `zi_wei`), `cast_bazi`, `lunar_convert`,
`solar_terms`.

| Option | Meaning |
|---|---|
| `--lang en\|vi\|zh` | language of the result (default `en`) |
| `--terms pinyin\|han\|vi` | English only: stems, branches, the Four Transformations as pinyin (default, `Geng Wu`, `Hua Ji`), Chinese characters or Sino-Vietnamese |
| `--json` | print JSON instead of text |
| `--svg <file>` | also write the chart as SVG (`ziwei`, `bazi`, `numerology`) |
| `--ics` | `festivals`: print an iCalendar (`.ics`) file instead |
| `--theme dark` | dark SVG |
| `--no-color` | no ANSI colors (also when `NO_COLOR` is set or output is not a terminal) |

School options (`--fire-bell`, `--leap-month`, `--transformations`,
`--heavenly-kitchen`, `--injury-messenger`, `--zi-hour`) switch to the rule of
another named book where the books disagree; `nhatnguyet --help` lists their
values and
[docs/schools.md](https://github.com/Nhat-Nguyet/nhatnguyet-lunar-ziwei-bazi-numerology/blob/main/docs/schools.md)
names the sources.

Times are clock times; the Zi (Rat) double hour runs 23:00 to 00:59. Dates and times
are read as Vietnam time (UTC+7) unless `--country` says otherwise.

```bash
nhatnguyet ziwei 1990-09-19 20:00 male --year 2026            # 12-palace grid, ten-year periods, patterns
nhatnguyet bazi 1990-09-19 female                             # birth time unknown: three pillars
nhatnguyet solar 2023-02-01 --leap                            # table for 2023-03-22, like lunar
nhatnguyet numerology "Nguyen Van An" 1990-09-19 --today 2026-11-19
nhatnguyet hours 2027-02-06                                   # the twelve double hours of Tết 2027
nhatnguyet festivals 2027 --ics > festivals-2027.ics          # the year's festivals for a calendar app
nhatnguyet ziwei 1990-09-19 20:00 male --svg chart.svg --theme dark
```

A full `ziwei` output is in the
[repository README](https://github.com/Nhat-Nguyet/nhatnguyet-lunar-ziwei-bazi-numerology#quick-start).
For AI assistants, the same calculations are available as an MCP server:
[`@nhatnguyet/mcp`](https://www.npmjs.com/package/@nhatnguyet/mcp).

## License

MIT. Please credit `Data: Nhat Nguyet (nhatnguyet.org)` when you show results
to users. Zi Wei Dou Shu, BaZi and numerology are traditional systems, not
validated science.
