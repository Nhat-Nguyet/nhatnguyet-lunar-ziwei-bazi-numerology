# Changelog

All notable changes to the Nhat Nguyet open libraries are documented in this
file: the npm packages `@nhatnguyet/*` and the Python package `nhatnguyet`,
which are released together under one version number.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).
Patch releases (0.x.y) only fix bugs; new features come in a minor release
(0.x.0). While the version is below 1.0.0, breaking changes also come in a
minor release and are listed first in its notes.

The engine version (for example `2.0.1`) is the version of the reference
calculation engine that produced the shared test vectors in `ca-kiem/`. Every
release passes all of them in TypeScript and in Python.

## [Unreleased]

## [0.4.0] - 2026-11-20

Every release passes all 17,291 core test vectors in `ca-kiem/` (28,586
including school options, auspicious hours, I Ching and feng shui) in
TypeScript and in Python.

### Added

- `@nhatnguyet/iching` and the Python module `nhatnguyet.iching`: the 64
  hexagrams with names in English, pinyin, Chinese and Vietnamese, the eight
  trigrams, the Eight Palaces with world and response lines, nuclear,
  opposite, reversed and changed hexagrams, three-coin and Plum Blossom
  casting, the Six Lines (najia) chart of a day, the daily hexagram of the Han
  Gua Qi calendar, the public domain Zhou Yi text with James Legge's 1882
  translation, and an SVG drawing (`renderHexagramSvg`). Checked against the 6,684
  vectors of `ca-kiem/iching.json`; method and sources in
  [docs/iching.md](docs/iching.md).
- `@nhatnguyet/fengshui` and `nhatnguyet.fengshui`: the Eight Mansions life gua
  (Kua number) and house gua, the 24 mountains, Xuan Kong flying star charts
  for periods 1 to 9 with castle gates, annual stars, the three Luban rulers
  (sectors and sub-sectors with pinyin and a literal English gloss), and SVG drawings of the compass and of a flying star chart. These are the
  rules of traditional schools, not verified effects. Checked against the 3,083
  vectors of `ca-kiem/fengshui.json`; where the books disagree:
  [docs/fengshui.md](docs/fengshui.md).
- Python: `hexagram`, `cast_coins`, `cast_from_numbers`, `najia`,
  `daily_hexagram`, `render_hexagram_svg`, `life_gua`, `house_gua`,
  `mountain_at`, `find_mountain`, `flying_star_chart`, `annual_stars`,
  `period_of`, `luban_ruler`, `render_compass_svg` and `render_flying_star_svg`
  import from `nhatnguyet`.
- Command line (npm and Python, the same output byte for byte):
  `nhatnguyet hexagram <number|name>`, `cast` (a three-coin cast, random or
  given with `--lines`, and its Six Lines chart for `--date`),
  `daily-hexagram <date>`, `kua <date|lunar year> <male|female>`,
  `flying-stars` (`--period` or `--year`, `--facing` or `--sitting` as a
  mountain or in degrees) and `luban <cm>` (`--ruler`); `--svg` writes a
  drawing for every one of them except `luban`.
- MCP server: tools `hexagram`, `six_lines_chart`, `daily_hexagram`,
  `life_gua`, `flying_star_chart` and `luban_ruler` (fourteen tools in all).
- Terminology: 241 terms in 15 new categories (the eight trigrams, the 64
  hexagrams, Eight Palaces generations, six relations, six spirits, month
  states, Gua Qi ranks, Eight Mansions stars, east and west groups, the 24
  mountains, the nine stars, star roles, flying star patterns, Luban ruler
  sectors and sub-sectors), 669 terms in all. The check that every name the libraries output
  is in the glossary covers both new packages.
- The Agent Skill (`skills/nhatnguyet`) knows the new tools and commands.

### Changed

- Engine 2.3.0 (was 2.2.0 in 0.3.0). Zi Wei recognizes three more patterns of
  the *Zi Wei Dou Shu Quan Shu* tables, which need the stars placed since
  0.3.0: Punishment and Prisoner Flanking the Seal (刑囚夾印), Wolf and Fire
  Meeting (貪火相逢) and Gentleman in the Wilds (君子在野), each with the book's
  line and `hasVariants`; how they read the book is in the `@nhatnguyet/tu-vi`
  README. In `ca-kiem/` only the pattern lists of `tu-vi.json` and
  `tu-vi-phai.json` and the engine version of every file change. The
  terminology adds the three names (672 terms).

## [0.3.0] - 2026-11-19

Engine 2.2.0 (was 2.0.1 in 0.2.0). Every release passes all 17,291 core test
vectors in `ca-kiem/` (18,819 including school options and auspicious hours) in
TypeScript and in Python.

### Changed

- **Breaking for `lang: "vi"` and `lang: "zh"`**: the `group` and `scope` of
  a festival are English codes in every language (`holiday`,
  `folk-religion`, `other`; `national`, `regional`, `local`,
  `representative`). In 0.2.0, `lang` "vi" and "zh" returned the dataset codes
  (`le-tet`, `quoc-gia`...); these stay in `raw`. `scope` gains `regional` and
  `representative`.
- **Breaking for English output**: results with `lang: "en"` (the default)
  write stems, branches, sexagenary pairs and the Four Transformations in
  pinyin (`Geng Wu`, `Hua Lu`) by default. Pass `terms: "vi"` for the 0.2.0
  output (`Canh Ngọ`, `Hóa Lộc`); see "Added" below.
- **Breaking**: `yearlyStars` codes are English: `yearly-taisui`,
  `yearly-lucun`, `yearly-qingyang`, `yearly-tuoluo`, `yearly-tianma` (were
  `luu-thai-tue`...).
- Festivals follow the open dataset `le-hoi-viet-nam` 1.7.0: 206 festivals
  (was 200), 164 with a fixed date.
- Python `lap_la_so_tu_vi` also returns `caveat`, `caveatEn`, `caveatZh` and,
  for a Tý-hour birth, `ghiChuGioTy*`, as the TypeScript `lapLaSoTuVi` does.
- `@nhatnguyet/widgets` computes its auspicious hours with `auspiciousHours`
  of `@nhatnguyet/am-lich` instead of its own table (same output).
- Python package metadata: the license is the SPDX expression `MIT` with
  `license-files`, so building no longer prints the setuptools deprecation
  warning; building from source needs setuptools 77 or newer.
- **Breaking**: the English API refuses years outside 1900 to 2100, the span
  the engine is checked over: `toLunar`, `toSolar`, `solarTerms`,
  `solarTermOn`, `auspiciousHours`, `castZiWei`, `castBaZi`, `numerology` and
  `festivals` throw a `RangeError` (Python `ValueError`) that states the
  range. The core functions (`solarToLunar`, `lapLaSoTuVi`...) are unchanged.
- `festivals()`: `scope` is `null` (Python `None`) for a festival the dataset
  has not classified yet (59 of 164), instead of `""`.
- `@nhatnguyet/widgets`: in English, stem-branch names follow the new `terms`
  attribute (pinyin by default: "Day Ding You", "Year of the Goat (Ding
  Wei)"), and hour ranges read as the `range` of `auspiciousHours`
  (`23:00-00:59`, was `23:00-01:00`).
- CLI: `nhatnguyet terms` in English prints the English name only; `--terms
  han` or `--terms vi` adds the Chinese or Vietnamese name in brackets.
- **Breaking for pages that relied on the Vietnamese default**:
  `@nhatnguyet/widgets` no longer defaults to Vietnamese when an element has
  no `lang` attribute. It now takes the `lang` of the nearest ancestor
  (including `<html lang>`), else the browser language (`navigator.language`),
  when that is `vi`, `en` or `zh` (prefix match, so `en-US` is `en`), and
  falls back to `en`. Add `lang="vi"` to keep the 0.2.0 output on a page
  whose language is not Vietnamese.
- BaZi `luck.explanation` with `lang: "en"` writes the solar term moment as an
  ISO date and time, "White Dew (1990-09-08 04:37)", instead of the
  day/month/year order "04:37 on 8/9/1990". Vietnamese and Chinese are
  unchanged; the raw `lyDoEn` keeps the engine's text.
- Python CLI: `--help` and the unknown-command error name the command
  `nhatnguyet`, as the npm CLI does, so both print the same bytes
  (`python -m nhatnguyet` runs the same command).

### Added

- `auspiciousHours(date, { lang, terms })` in `@nhatnguyet/am-lich` (and
  `@nhatnguyet/lunar`), Python `auspicious_hours`: the twelve double hours of
  a day, each auspicious (giờ hoàng đạo) or inauspicious (giờ hắc đạo), with
  its presiding spirit (Qing Long, Ming Tang...; `spirit` follows `terms`),
  plus `AUSPICIOUS_SPIRITS` and `HOUR_SPIRIT_PINYIN`. Checked against the
  engine on the new test vectors `ca-kiem/auspicious-hours.json` (1,096 days).
  CLI `nhatnguyet hours 2027-02-06`, MCP tool `auspicious_hours` (the server
  now has eight tools).
- English-named npm packages that re-export the Vietnamese-named ones with the
  same API: `@nhatnguyet/lunar` (`am-lich`), `@nhatnguyet/ziwei` (`tu-vi`,
  including `@nhatnguyet/ziwei/iztro`), `@nhatnguyet/bazi` (`bat-tu`),
  `@nhatnguyet/numerology` (`than-so-hoc`) and `@nhatnguyet/festivals`
  (`le-hoi`). They are published with the other packages.
- Python: the whole English API is importable from `nhatnguyet` (including
  `auspicious_hours`, `festivals_ics`, `festival_places`, `horoscope`,
  `palace_of` and the other lookups), and English-named modules mirror the npm
  packages: `nhatnguyet.lunar`, `nhatnguyet.ziwei`, `nhatnguyet.bazi`,
  `nhatnguyet.numerology`, `nhatnguyet.festivals`. The last two are callable,
  so `nhatnguyet.numerology(...)` and `nhatnguyet.festivals(2027)` work
  whether the name refers to the function or to the module.
- A `terms` option for English results: `"pinyin"` (default: Geng Wu, Hua
  Lu), `"han"` (庚午, 化禄) or `"vi"` (Canh Ngọ, Hóa Lộc) for stems,
  branches and the other Chinese terms that have no English translation. A
  test scans every test vector for Vietnamese letters in English output.
- School options where the books disagree, each with its source
  ([docs/schools.md](docs/schools.md)), engine 2.2.0: Zi Wei `schools.fireBell`
  (`vietnamese`, `quanshu`, `swap-for-female`, `swap-for-yin-male-yang-female`),
  `leapMonth` (`whole`, `split-at-15`, `next-month`), `transformations` (Geng
  row: `vietnamese`, `quanshu`, `zhongzhou`), `heavenlyKitchen`
  (`vietnamese`, `chinese`), `injuryMessenger` (`standard`, `zhongzhou`);
  BaZi `schools.ziHour` (`next-day-from-23`, `split-at-midnight`). In
  `castZiWei`, `castBaZi`, the raw functions, Python (`schools=`), the CLI
  (`--fire-bell`... `--zi-hour`), the MCP tools (`fire_bell`... `zi_hour`), and
  the iztro layer (`options.schools`; `fixLeap` maps to `leapMonth`). Defaults
  are unchanged byte for byte. New test vectors `ca-kiem/tu-vi-phai.json`
  (352) and `ca-kiem/bat-tu-phai.json` (80).
- Zi Wei Dou Shu: 31 more minor stars placed as in the Tân Biên (Fire Star,
  Bell Star, Red Phoenix, Celestial Joy, Celestial Charm, Celestial
  Punishment, Canopy, Solitary Star, Widow Star...), engine 2.1.0; minor stars
  carry `group` (`malefic`, `auspicious`, `miscellaneous`).
- Zi Wei lookups and horoscope in the English API: `horoscope`, `palaceOf`,
  `starOf`, `surroundingPalaces`, `flankingPalaces`, `palaceHas`,
  `palaceHasOneOf`, `palaceNotHave`, `palaceIsEmpty`,
  `flyingTransformations`, `fliesTo`, `selfTransformed` (Python
  `nhatnguyet.tu_vi_chuc_nang`, same JSON byte for byte), and the matching
  methods on the iztro layer (`palace`, `star`, `surroundedPalaces`,
  `horoscope`, `fliesTo`...), compared with iztro on 2,006 horoscopes.
- Festivals: each festival has `provinces` (34-province map of 2025, codes in
  `PROVINCES`), `nationwide`, `ethnicGroups` (official list of 54, only where
  the description says so), `venues` with `coordinates` and `sourceUrl` (only
  sourced coordinates), `daysBefore` and `daysAfter`.
- iCalendar export of a year's festivals: `festivalsIcs(year, { lang })`,
  Python `festivals_ics`, CLI `nhatnguyet festivals 2027 --ics` (RFC 5545,
  all-day events, stable UIDs, dataset credit in X-WR-CALDESC).
- Terminology dataset (`du-lieu/terminology`, CC BY 4.0): 428 terms in 30
  categories with Vietnamese, traditional and simplified Chinese, tone-marked
  pinyin and English names, generated from the library tables; a test checks
  that every name the libraries output is in it. It now includes the twelve
  hour spirits.
- AI evaluation set (`ai-eval`, CC BY 4.0): 1,520 engine-computed questions in
  English, Vietnamese and Chinese (lunar dates, Tết, stem-branches, solar
  terms to the minute, Zi Wei and BaZi positions, numerology), with hard cases
  where the Vietnamese and Chinese calendars differ, and `score.py`.
- Knowledge datasets on Hugging Face, one row per unit of knowledge with the
  site's texts in three languages, the public domain classical passages the
  reading engine looks up and rule ids: `nhatnguyet/ziwei-knowledge`,
  `nhatnguyet/bazi-knowledge`, `nhatnguyet/numerology-knowledge`.
- `nhatnguyet/classical-parallel`: 1,328 aligned pairs of classical Chinese
  with English (952) and French (376) translations, checked against the
  structure of the 64 hexagrams.
- `history/`: the dates on which Vietnam celebrated Tết from 1900 to 2100,
  compared with the dates computed at UTC+7 and UTC+8, with a source for every
  row, the generating script and tests.
- A technical report, `docs/paper/paper.pdf`: method of the calendar (new
  moons, VSOP87D solar terms, ΔT) and its verification against NASA, IMCCE and
  JPL DE440 from 1900 to 2100, the error budget of the truncated VSOP87D
  series, and the differences from the Chinese calendar; every number is
  reproduced by the scripts next to it.
- Project templates in `examples/` (Next.js static lunar calendar page,
  Telegram bot with `/today`, `/hours`, `/tet` and `/ziwei`, Google Sheets
  custom functions, a Jupyter notebook comparing Tết in Vietnam and China),
  each built and tested against the local packages by `examples/test-all.sh`.
- `CHANGELOG.md`, `SECURITY.md`, `CODE_OF_CONDUCT.md`, `RELEASING.md`, Zenodo
  metadata (`.zenodo.json`) and the API reference generated from the
  TypeScript sources in `docs/api/`.
- Continuous integration runs every README example against the local packages
  and, weekly and after each release, against the packages published on npm
  and PyPI.
- Releases are published from GitHub Actions with npm provenance and PyPI
  trusted publishing.
- `YEAR_RANGE`, `checkYear` and `parseDateInRange` in `@nhatnguyet/am-lich`
  (Python `YEAR_RANGE`, `check_year`, `parse_date_in_range`).
- CI runs every test vector on the built packages under Node 18, 20, 22 and
  24 (`.github/scripts/check-dist.mjs`), locally and against npm after each
  release; `js/package-lock.json` pins the workspace, installed with `npm ci`.
- `castZiWei` takes `country` (as `toLunar`: `"VN"` by default, `"CN"`,
  `"KR"`, `"JP"`...) or `timeZone`, the calendar that turns the birth date
  into the lunar date (born 1985-01-21: 1st day of the 1st month in Vietnam,
  of the 12th month in China, two different charts). Python `cast_zi_wei(...,
  country=, time_zone=)`, CLI `nhatnguyet ziwei ... --country CN`. The default
  chart is unchanged; a chart off UTC+7 carries `timeZone` and says so in
  `notes`. Same placement as the iztro layer's `country` option.

### Fixed

- Zi Wei patterns: the Chinese names of "Tả Hữu đồng hội" and "Không Kiếp
  đồng hội" are `左右同会` (`左右同會`) and `空劫同会` (`空劫同會`) in the
  result of the engine and of `nhanDienCachCuc` (they were cut to `左右` and
  `空劫`). The English layer already returned the full names;
  `PATTERN_HAN_FIX` now only repeats them and is deprecated.
- `nhatnguyet --version` and the MCP server reported 0.1.0 in 0.2.0; the
  version constants now follow `package.json` (a test checks it).
- `toSolar` with a leap month the year does not have names the year's real
  leap month ("2025 has no leap month 2; the leap month of 2025 is month 6")
  instead of "the month has only 29 days".
- `@nhatnguyet/widgets`: the inauspicious hour cells and the Rooster cell of
  `<nn-gio-hoang-dao>` reach a 4.5:1 contrast in light and dark themes.
- Both command lines end quietly with exit code 0 when the reader closes the
  pipe early (`nhatnguyet festivals 2027 --ics | head`) instead of printing an
  uncaught EPIPE (Node) or BrokenPipeError (Python) and exiting with 1.

## [0.2.0] - 2026-11-19

### Added

- English API with named options, in TypeScript and Python:
  `castZiWei` / `cast_zi_wei`, `castBaZi` / `cast_bazi`, `numerology`,
  `toLunar` / `to_lunar`, `toSolar` / `to_solar`, `solarTerms`,
  `solarTermOn`, `dayPillar`, `hourBranch`, `festivals`, plus `decadeLuck`,
  `yearlyLuck`, `yearlyStars`, `findPatterns` and `minorLuck`. Dates as
  `"YYYY-MM-DD"`, clock times as `"HH:MM"`, `gender: "male" | "female"`,
  `lang: "en" | "vi" | "zh"`. The original Vietnamese-named functions are
  unchanged and the original result stays in `raw`.
- SVG renderers for Zi Wei, BaZi and numerology charts (`toSvg()`,
  `ziWeiSvg`, `baZiSvg`, `numerologySvg`, light and dark themes). TypeScript
  and Python produce the same SVG byte for byte.
- `chartToText` / `chart_to_text`: a chart as compact Markdown for a language
  model prompt.
- `@nhatnguyet/tu-vi/iztro`: a data-compatibility layer for
  [iztro](https://github.com/SylarLong/iztro). `astro.bySolar` and
  `astro.byLunar` take the same parameters and return the same JSON shape as
  iztro's `FunctionalAstrolabe`, computed on the Vietnamese calendar.
- `@nhatnguyet/cli`: Zi Wei chart as a 4x4 grid, BaZi, lunar and solar
  conversion, solar terms, numerology and festivals in the terminal, with
  `--lang`, `--country`, `--json` and `--svg`. The Python package installs the
  same command (`nhatnguyet`, or `python -m nhatnguyet`) and prints the same
  text.
- `@nhatnguyet/mcp`: a Model Context Protocol server with seven tools
  (`lunar_convert`, `solar_terms`, `cast_zi_wei`, `cast_bazi`, `numerology`,
  `festivals`, `render_chart_svg`) that runs locally over stdio.
- `@nhatnguyet/widgets`: five web components that run in the browser without
  a server (today's date, month grid, auspicious hours, Tết countdown, date
  converter), with a `data-country` attribute and a single-file CDN build.
- Names in three languages: every star, palace, bureau, brightness, na yin,
  element, growth stage, solar term, symbolic star and stem-branch in a Zi Wei
  or BaZi result carries a Chinese (`...Zh`) and, where it applies, an English
  (`...En`) form next to the Vietnamese one.
- An Agent Skill (`skills/nhatnguyet`) that tells AI assistants to call the
  library, the CLI or the MCP server instead of computing calendar dates
  themselves.

### Changed

- Solar terms are computed with the VSOP87D planetary theory and are within
  1 minute of IMCCE (Paris Observatory) for 1900 to 2100. Engine 2.0.1; the
  test vectors were regenerated.
- The repository is now
  [Nhat-Nguyet/nhatnguyet-lunar-ziwei-bazi-numerology](https://github.com/Nhat-Nguyet/nhatnguyet-lunar-ziwei-bazi-numerology).
- Package descriptions, keywords and READMEs are in English.

## [0.1.0] - 2026-11-19

First release.

### Added

- `@nhatnguyet/am-lich` and `nhatnguyet.am_lich`: Vietnamese lunar calendar
  (UTC+7), and the Chinese (UTC+8), Korean and Japanese (UTC+9) lunisolar
  calendars; lunar to Gregorian and back, sexagenary cycle (can chi) of year,
  month, day and hour, 24 solar terms to the minute, 28 lunar mansions, na yin.
- `@nhatnguyet/tu-vi` and `nhatnguyet.tu_vi`: Zi Wei Dou Shu (Tử Vi) charts,
  ten-year and yearly periods, yearly stars, chart patterns.
- `@nhatnguyet/bat-tu` and `nhatnguyet.bat_tu`: BaZi (Four Pillars) by solar
  term, hidden stems, Ten Gods, symbolic stars, luck pillars.
- `@nhatnguyet/than-so-hoc` and `nhatnguyet.than_so_hoc`: Pythagorean
  numerology from a full name and a birth date.
- `@nhatnguyet/le-hoi` and `nhatnguyet.le_hoi`: 200 Vietnamese festivals with
  their Gregorian dates for any year from 1900 to 2100 (data under CC BY 4.0).
- 17,291 shared test vectors in `ca-kiem/`, generated by the reference engine
  (engine 2.0.0); the TypeScript and Python ports pass all of them.
- Zero runtime dependencies; TypeScript runs in Node.js and browsers, Python
  needs only the standard library (3.9 or newer).

[Unreleased]: https://github.com/Nhat-Nguyet/nhatnguyet-lunar-ziwei-bazi-numerology/compare/v0.4.0...HEAD
[0.4.0]: https://github.com/Nhat-Nguyet/nhatnguyet-lunar-ziwei-bazi-numerology/compare/v0.3.0...v0.4.0
[0.3.0]: https://github.com/Nhat-Nguyet/nhatnguyet-lunar-ziwei-bazi-numerology/compare/v0.2.0...v0.3.0
[0.2.0]: https://github.com/Nhat-Nguyet/nhatnguyet-lunar-ziwei-bazi-numerology/compare/v0.1.0...v0.2.0
[0.1.0]: https://github.com/Nhat-Nguyet/nhatnguyet-lunar-ziwei-bazi-numerology/releases/tag/v0.1.0
