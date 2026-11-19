# @nhatnguyet/cli

**Zi Wei Dou Shu, BaZi, numerology and the Vietnamese, Chinese, Korean and
Japanese lunar calendars in your terminal.** Charts print as grids, or as JSON
and SVG. English by default, Vietnamese and Chinese with `--lang`. Runs
locally with the [Nhat Nguyet](https://nhatnguyet.org/en/ma-nguon-mo)
libraries, checked against 17,291 shared test vectors and NASA, IMCCE data.

```bash
npx @nhatnguyet/cli lunar 1985-01-21 --country CN
```

```text
┌────────────┬───────────────┐
│ Gregorian  │ 1985-01-21    │
│ Lunar      │ 1984-12-01    │
│ Year       │ Giáp Tý · Rat │
│ Month      │ Đinh Sửu      │
│ Day        │ Canh Thân     │
│ Solar term │ Major Cold    │
│ Calendar   │ CN (UTC+8)    │
└────────────┴───────────────┘
```

Without `--country CN` the same day is Tết, `1985-01-01`, on the Vietnamese
calendar (UTC+7).

## Install

```bash
npm i -g @nhatnguyet/cli     # then: nhatnguyet ...
```

Node.js 18 or newer. The Python package prints the same text:
`pip install nhatnguyet`, then `nhatnguyet ...` or `python -m nhatnguyet ...`.

## Commands

```text
nhatnguyet ziwei <YYYY-MM-DD> <HH:MM> <male|female> [--name "..."] [--year 2026]
nhatnguyet bazi <YYYY-MM-DD> [HH:MM] <male|female>
nhatnguyet lunar <YYYY-MM-DD> [--country VN|CN|KR|JP|...]
nhatnguyet solar <lunar YYYY-MM-DD> [--leap] [--country ...]
nhatnguyet terms <year> [--country ...]
nhatnguyet numerology "<full name>" <YYYY-MM-DD> [--today YYYY-MM-DD]
nhatnguyet festivals <year>
```

| Option | Meaning |
|---|---|
| `--lang en\|vi\|zh` | language of the result (default `en`) |
| `--json` | print JSON instead of text |
| `--svg <file>` | also write the chart as SVG (`ziwei`, `bazi`, `numerology`) |
| `--theme dark` | dark SVG |
| `--no-color` | no ANSI colours (also when `NO_COLOR` is set or output is not a terminal) |

Times are clock times; the Tý double hour runs 23:00 to 00:59. Dates and times
are read as Vietnam time (UTC+7) unless `--country` says otherwise.

```bash
nhatnguyet ziwei 1990-09-19 20:00 male --year 2026            # 12-palace grid, ten-year periods, patterns
nhatnguyet bazi 1990-09-19 female                             # birth time unknown: three pillars
nhatnguyet solar 2023-02-01 --leap                            # 2023-03-22
nhatnguyet numerology "Nguyen Van An" 1990-09-19 --today 2026-11-19
nhatnguyet ziwei 1990-09-19 20:00 male --svg chart.svg --theme dark
```

A full `ziwei` output is in the
[repository README](https://github.com/Nhat-Nguyet/nhatnguyet#quick-start).
For AI assistants, the same calculations are available as an MCP server:
[`@nhatnguyet/mcp`](https://www.npmjs.com/package/@nhatnguyet/mcp).

## License

MIT. Please credit `Data: Nhat Nguyet (nhatnguyet.org)` when you show results
to users. Zi Wei Dou Shu, BaZi and numerology are traditional systems, not
validated science.
