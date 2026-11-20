# @nhatnguyet/mcp

An [MCP](https://modelcontextprotocol.io) server that gives AI assistants a
deterministic calculator for the Chinese, Korean, Japanese and Vietnamese
lunisolar calendars, the 24 solar terms, Zi Wei Dou Shu (Tử Vi), BaZi (Four
Pillars), Pythagorean numerology, Vietnamese festivals, the I Ching (hexagrams,
the Six Lines najia chart, the Gua Qi daily hexagram) and the feng shui rules
of traditional schools (Eight Mansions life gua, Xuan Kong flying stars, Luban
rulers).

Language models should not compute lunar dates, stem-branch pillars or star
positions in their heads: these depend on new-moon and solar-term instants to
the minute and on conventions (time zone, leap months, the Tý hour). This server
runs the [Nhat Nguyet](https://nhatnguyet.org) libraries locally, checked
against 17,291 core test vectors (28,586 including school options, auspicious hours, I Ching and feng shui) and NASA / IMCCE data. No network access, no
API key.

- **Vietnam time (UTC+7) by default.** Pass `country` for the Chinese (`CN`,
  UTC+8), Korean (`KR`) or Japanese (`JP`) calendar. They differ on some days:
  Tết 1985 is 1985-01-21 in Vietnam and 1985-02-20 in China.
- **The Tý hour runs 23:00 to 00:59.** For Zi Wei a birth from 23:00 to midnight
  keeps the date entered; for BaZi the day pillar turns at 23:00.
- **Facts, not readings.** Results are computed data; the assistant writes any
  interpretation itself. The I Ching and feng shui tools give the rules of
  traditional schools, not predictions. Each result names its source:
  `Data: Nhat Nguyet (nhatnguyet.org)`.

## Install

Requires Node.js 18 or newer. The server speaks MCP over stdio:

```bash
npx -y @nhatnguyet/mcp
```

### Claude Desktop

Settings, Developer, Edit Config (`claude_desktop_config.json`):

```json
{
  "mcpServers": {
    "nhatnguyet": {
      "command": "npx",
      "args": ["-y", "@nhatnguyet/mcp"]
    }
  }
}
```

### Claude Code

```bash
claude mcp add nhatnguyet -- npx -y @nhatnguyet/mcp
# for every project: claude mcp add --scope user nhatnguyet -- npx -y @nhatnguyet/mcp
```

### Cursor

`~/.cursor/mcp.json` (all projects) or `.cursor/mcp.json` (one project):

```json
{
  "mcpServers": {
    "nhatnguyet": {
      "command": "npx",
      "args": ["-y", "@nhatnguyet/mcp"]
    }
  }
}
```

### VS Code

`.vscode/mcp.json`:

```json
{
  "servers": {
    "nhatnguyet": {
      "type": "stdio",
      "command": "npx",
      "args": ["-y", "@nhatnguyet/mcp"]
    }
  }
}
```

or from a terminal:
`code --add-mcp '{"name":"nhatnguyet","command":"npx","args":["-y","@nhatnguyet/mcp"]}'`.

## Tools

Fourteen tools, all read-only. `lang` is `en` (default), `vi` or `zh` (simplified
Chinese); dates are `YYYY-MM-DD`, times `HH:MM` (24 h). With `lang` `en`,
`terms` says how to write stems, branches and the Four Transformations:
`pinyin` (default, `Geng Wu`, `Hua Ji`), `han` (`庚午`, `化忌`) or `vi`
(`Canh Ngọ`, `Hóa Kỵ`). Tool names match the command line (`nhatnguyet ziwei`
is `cast_ziwei`, `nhatnguyet kua` is `life_gua`); the older name `cast_zi_wei`
still works as an alias.

| Tool | Input | Output |
|---|---|---|
| `lunar_convert` | `date`, `direction` (`solar_to_lunar` default, `lunar_to_solar`), `leap`, `country`, `lang`, `terms` | lunar date, leap flag, stem-branch of year, month and day, zodiac animal, solar term (JSON) |
| `solar_terms` | `year`, `country`, `lang` | the 24 solar terms with local date and time (JSON) |
| `cast_ziwei` (alias `cast_zi_wei`) | `date`, `time` or `hour_branch` (0 Zi to 11 Hai), `gender`, `name`, `lang`, `terms`, `detail` (`full`, `summary`), `year` | markdown chart (12 palaces, stars, brightness, Four Transformations, ten-year periods, patterns, a viewing year), then compact JSON |
| `cast_bazi` | `date`, `time` (omit when unknown), `gender`, `lang`, `terms`, `detail` | markdown chart (four pillars, ten gods, hidden stems, na yin, stages, symbolic stars, luck pillars), then JSON |
| `numerology` | `name`, `birth_date`, `today`, `lang`, `detail` | markdown profile (core numbers, personal cycles, pinnacles, challenges, grid), then JSON |
| `festivals` | `year`, `month`, `lang` | Vietnamese festivals with a fixed lunar or Gregorian date and their Gregorian dates that year (JSON) |
| `render_chart_svg` | `kind` (`ziwei`, `bazi`, `numerology`; `zi_wei` also accepted) and the inputs of that tool, `theme` (`light`, `dark`) | a self-contained SVG string |
| `hexagram` | `hexagram` (King Wen number or a name in English, pinyin, Chinese or Vietnamese), `lang`, `terms` | names, trigrams, Eight Palaces palace, world and response lines, nuclear, opposite and reversed hexagrams, the Zhou Yi text with Legge's 1882 translation (JSON) |
| `six_lines_chart` | `lines` (six values 6 to 9, bottom first; omit for a random three-coin cast), `date`, `lang`, `terms` | the cast and its Six Lines (najia) chart: stems, branches, elements, six relations, six spirits, world and response, void, month state (JSON) |
| `daily_hexagram` | `date`, `lang`, `terms` | the Gua Qi hexagram of the day, its ruling line, the cardinal hexagram, a change of hexagram during the day (JSON) |
| `life_gua` | `birth_date` or `lunar_year`, `gender`, `lang`, `terms` | Eight Mansions Kua number, trigram, group, element, the eight directions and their stars (JSON) |
| `flying_star_chart` | `period` (1 to 9) or `year`, `facing` or `sitting` (degrees or one of the 24 mountains), `lang`, `terms` | Xuan Kong mountain, facing and period stars of the nine palaces, their roles, the pattern, castle gates (JSON) |
| `luban_ruler` | `length`, `unit` (`cm` default, `mm`), `ruler` (`clear-opening`, `luban`, `dinglan`; default all three), `lang`, `terms` | sector, sub-sector, good or bad group, nearest good lengths (JSON) |

Example: asked "what is my Zi Wei chart, born 19 September 1990 at 8 pm, male?",
an assistant calls `cast_ziwei` with `{"date": "1990-09-19", "time": "20:00",
"gender": "male"}` and reads, among other lines:

```text
- Birth date (lunar): 1990-08-01
- Year pillar: Geng Wu
- Bureau: Earth Five (5)
- Life palace: Hai

### Life Palace (Hai, Ding Hai) · Xun Kong void
- Major stars: Moon (Exalted, Hua Ji)
- Minor stars: Left Assistant, Three Terraces, Grace Light, Celestial Official, Fire Star, Monthly Virtue, Robbery Sha, Annual Literary Star
```

The same text comes from `chartToText` in `@nhatnguyet/tu-vi` (and
`chart_to_text` in the Python package `nhatnguyet`), if you call the libraries
directly instead of through MCP.

## In your own server

```ts
import { createServer } from "@nhatnguyet/mcp";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";

await createServer().connect(new StdioServerTransport());
```

## License

MIT. Festival data from the open dataset `le-hoi-viet-nam` (CC BY 4.0); the
Zhou Yi text and Legge's translation are in the public domain.
Source: <https://github.com/Nhat-Nguyet/nhatnguyet-lunar-ziwei-bazi-numerology>.
