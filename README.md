<p align="center">
  <a href="https://nhatnguyet.org/en/ma-nguon-mo">
    <picture>
      <source media="(prefers-color-scheme: dark)" srcset="./assets/banner-toi.svg">
      <img src="./assets/banner-sang.svg" alt="Nhat Nguyet" width="720">
    </picture>
  </a>
</p>

<h1 align="center">Nhat Nguyet: open source Zi Wei Dou Shu, BaZi and numerology library and datasets</h1>

<p align="center">
  <b>Free open source library to cast Zi Wei Dou Shu (Purple Star Astrology) and BaZi (Four Pillars of Destiny) charts, calculate numerology, convert the Vietnamese lunar calendar and the Chinese calendar, and look up Vietnamese ritual prayers, in JavaScript and Python.</b><br>
  3.6 million pre-interpreted charts · 60+ classical texts · Vietnamese lunar calendar checked against NASA
</p>

<p align="center">
  <a href="./LICENSE"><img alt="Code: MIT" src="https://img.shields.io/badge/code-MIT-1f6f6b.svg"></a>
  <a href="./DATA-LICENSE"><img alt="Data: CC BY 4.0" src="https://img.shields.io/badge/data-CC%20BY%204.0-1f6f6b.svg"></a>
  <a href="./ca-kiem"><img alt="Test cases: 17,291 passing" src="https://img.shields.io/badge/test%20cases-17%2C291%20passing-2e7d32.svg"></a>
  <a href="https://github.com/Nhat-Nguyet/nhatnguyet/actions/workflows/kiem.yml"><img alt="Automated checks" src="https://github.com/Nhat-Nguyet/nhatnguyet/actions/workflows/kiem.yml/badge.svg?branch=main"></a>
  <a href="https://doi.org/10.5281/zenodo.24358014"><img alt="DOI" src="https://zenodo.org/badge/DOI/10.5281/zenodo.24358014.svg"></a>
</p>

<p align="center">
  <b>English</b> · <a href="./README.vi.md">Tiếng Việt</a> · <a href="./README.zh.md">中文</a>
  <br>
  <a href="https://nhatnguyet.org/en/ma-nguon-mo">Project page</a> ·
  <a href="https://nhatnguyet.org/en/du-lieu">Open data</a> ·
  <a href="https://huggingface.co/nhatnguyet">Hugging Face</a> ·
  <a href="https://nhatnguyet.org/en/blog">Tutorials</a>
</p>

---

## Contents

1. [Overview](#overview)
2. [Why Nhat Nguyet](#why-nhat-nguyet)
3. [What is in the repo](#what-is-in-the-repo)
4. [Quick start](#quick-start)
5. [What you can build](#what-you-can-build)
6. [Scientific basis](#scientific-basis)
7. [Roadmap](#roadmap)
8. [License and attribution](#license-and-attribution)
9. [FAQ](#faq)
10. [Contributing and contact](#contributing-and-contact)

## Overview

Open source code and datasets on metaphysical traditions and folk belief,
**rooted in Vietnam, covering both Eastern and Western traditions**: Tử Vi (Zi
Wei Dou Shu), Bát Tự (BaZi), numerology, the I Ching, Tarot, astrology, feng
shui, date selection, the lunar calendars of four countries, festivals and
ritual prayers. Every result matches, field by field, the calculation engine
that runs [nhatnguyet.org](https://nhatnguyet.org) and the Nhat Nguyet app on
iOS and Android.

| Pre-interpreted charts | Classical texts | Knowledge articles | Open datasets | Test cases |
|:---:|:---:|:---:|:---:|:---:|
| **3.6 million** | **60+ titles**<br>7.3 million characters | **510 articles**<br>summaries, FAQs | **33 datasets**<br>with DOIs | **17,291**<br>all passing |
| **456** ritual prayers | **200** festivals | **4** national lunar calendars | **3** languages | **0** dependencies |

## Why Nhat Nguyet

| | |
|---|---|
| **Calendar on Vietnam time** | 2,814 days between 1900 and 2100 fall on a different lunar date than in the calendar computed on Beijing time; Lunar New Year (Tết) differs in 10 years. You can pick each country's calendar; Vietnam is the default. |
| **Verifiable** | New moons differ from NASA by 1.1 minutes on average; solar term times differ from IMCCE by 4.2 minutes on average. The TypeScript and Python versions reproduce every field of the reference engine in 17,291 cases. |
| **Backed by sources** | Every classical quote names its book and chapter, with the original text checked against printed editions. Where schools disagree, it says so instead of quietly picking one. |
| **Three languages** | Star names, terminology and interpretations in full Vietnamese, English and Chinese. |
| **Runs on your device** | No dependencies, no network calls, no data sent anywhere. Runs in the browser, Node and Python. |

## What is in the repo

### Libraries

| Topic | TypeScript (npm) | Python (`pip install nhatnguyet`) | What it does |
|---|---|---|---|
| Lunar calendar | [`@nhatnguyet/am-lich`](./js/packages/am-lich) | `nhatnguyet.am_lich` | Lunar and solar conversion for four countries, stems and branches, 24 solar terms to the minute, the 28 lunar mansions (Nhị Thập Bát Tú), nạp âm |
| Zi Wei Dou Shu | [`@nhatnguyet/tu-vi`](./js/packages/tu-vi) | `nhatnguyet.tu_vi` | 12-palace chart, star brightness, Four Transformations (Tứ Hóa), Tuần and Triệt, 10-year periods, yearly periods, transiting stars, chart patterns |
| BaZi | [`@nhatnguyet/bat-tu`](./js/packages/bat-tu) | `nhatnguyet.bat_tu` | Four pillars by solar term, hidden stems, Ten Gods, symbolic stars (thần sát), 10-year luck periods, minor periods (tiểu vận) |
| Numerology | [`@nhatnguyet/than-so-hoc`](./js/packages/than-so-hoc) | `nhatnguyet.than_so_hoc` | Life path, expression, soul urge, pinnacles, challenges, personal year; Vietnamese names with diacritics |
| Festivals | [`@nhatnguyet/le-hoi`](./js/packages/le-hoi) | `nhatnguyet.le_hoi` | 200 festivals, lunar to solar date conversion for every year |

### Datasets

| Dataset | Contents | Format | Size |
|---|---|---|---|
| Interpretations by chart | Zi Wei Dou Shu and BaZi for every birth date from 1900 to 2100 (12 hours, 2 genders); numerology by birth date | zstd-compressed JSON Lines, one file per birth year | ~11 GB compressed |
| ↳ structured charts | star positions, Four Transformations, pillars, numbers, with interpretation IDs | `la-so/<topic>/<year>` | ~1.6 GB |
| ↳ prebuilt by language | full text in one language per file, for AI training | `ghep-san/<topic>/<vi\|en\|zh>/<year>` | ~9 GB |
| ↳ text store | interpretations, classical passages, further reading; each passage stored once, with an ID | `kho/` | < 0.3 GB |
| Classical texts | 60+ public domain titles, full text | plain text | ~20 MB |
| Calendar, festivals, ritual prayers | 33 datasets: lunisolar calendar 1900 to 2100, 64 hexagrams, 78 Tarot cards, solar terms, ritual prayers, rites... | CSV, JSON, Parquet | 118 MB |

### Test cases

[`ca-kiem/`](./ca-kiem): 17,291 input and answer pairs generated from the
reference engine, for the lunar calendars of four countries, festivals,
numerology, BaZi and Zi Wei Dou Shu. Whatever language you write a library in,
you can check it yourself: read `vao` (input), compare with `ra` (expected
output).

## Quick start

**TypeScript, JavaScript**

```bash
npm i @nhatnguyet/tu-vi @nhatnguyet/am-lich
```

```ts
import { lapLaSoTuVi, nhanDienCachCuc } from "@nhatnguyet/tu-vi";
import { solarToLunar, MUI_GIO_THEO_NUOC } from "@nhatnguyet/am-lich";

const laSo = lapLaSoTuVi("", "Nam", 19, 9, 1990, 10); // born September 19, 1990, Tuất hour (7 to 9 pm)
console.log(laSo.tenCuc, nhanDienCachCuc(laSo).map((c) => c.ten));

solarToLunar(21, 1, 1985);                       // Vietnamese calendar: first day of Tết
solarToLunar(21, 1, 1985, MUI_GIO_THEO_NUOC.CN); // Chinese calendar: first day of the 12th lunar month
```

**Python**

```bash
pip install nhatnguyet
```

```python
from nhatnguyet import tu_vi, bat_tu, le_hoi

la_so = tu_vi.lap_la_so_tu_vi("", "Nam", 19, 9, 1990, 10)
bat = bat_tu.lap_la_so_bat_tu(19, 9, 1990, 20, 0, "Nam")
le_hoi.le_hoi_trong_nam(2027)
```

**Datasets**

```python
from datasets import load_dataset
ds = load_dataset("nhatnguyet/loi-luan-tu-vi", data_files="ghep-san/tu-vi/en/1990.jsonl.zst")
```

## What you can build

| Goal | What to use | Guide |
|---|---|---|
| **Chart websites and apps** | Zi Wei Dou Shu, BaZi, numerology libraries | [Build a Tử Vi chart with JavaScript](https://nhatnguyet.org/en/blog/lap-la-so-tu-vi-bang-javascript) |
| **Calendar and reminder apps** | lunar calendar, festivals, ritual prayers | [Lunar calendar, festivals and death anniversaries for your app](https://nhatnguyet.org/en/blog/lich-am-le-hoi-cho-ung-dung) |
| **AI training** | interpretations prebuilt by language | [Train AI on Tử Vi chart data](https://nhatnguyet.org/en/blog/huan-luyen-ai-voi-du-lieu-tu-vi) |
| **AI assistants with citations** | classical passage store, further reading | [An AI assistant that cites classical books](https://nhatnguyet.org/en/blog/tro-ly-ai-trich-dan-sach-co) |
| **Data analysis** | structured charts | [How rare are chart patterns?](https://nhatnguyet.org/en/blog/phan-tich-du-lieu-la-so-bang-python) |
| **Calendar and cultural research** | lunar calendars of four countries, festivals, classical texts | [The Vietnamese lunar calendar is not the Chinese one](https://nhatnguyet.org/en/blog/am-lich-viet-nam-khac-trung-quoc) |
| **Testing your own library** | test cases | [Test against the shared test cases](https://nhatnguyet.org/en/blog/kiem-thu-vien-bang-bo-ca-kiem) |

Also: education (chart casting step by step), translation (terminology in
three languages), content and journalism (verifiable figures).

## Scientific basis

**The science is in the method, not in the predictions.** The calendar is
astronomical calculation, checked against NASA and IMCCE. Every result is
deterministic and can be rechecked with the test cases. Zi Wei Dou Shu, BaZi,
numerology and the other metaphysical arts are the rules of particular schools
and have not been scientifically validated; do not use them as grounds for
health, financial or legal decisions.

**Calendar by country**

| Calendar | Time zone used | Countries and regions |
|---|---|---|
| Vietnam (default) | UTC+7 | Vietnam |
| China | UTC+8 | Mainland China, Taiwan, Hong Kong, Macau; Chinese New Year in Singapore, Malaysia, Indonesia, the Philippines |
| Korea | UTC+9 | South Korea |
| Japan | UTC+9 | Old lunar calendar (kyūreki), used for traditional observances |

Mongolia, Tibet, Thailand, Laos, Cambodia, Myanmar and India follow calendars
with different rules and are not in the library yet.

**Further reading**

| Data | Article |
|---|---|
| Lunar calendar, solar terms | [How is it computed, and how far off is it?](https://nhatnguyet.org/en/blog/co-so-khoa-hoc-am-lich-tiet-khi) |
| Stems and branches, the 60-year cycle, the 28 mansions | [How do they follow from the Julian day?](https://nhatnguyet.org/en/blog/co-so-khoa-hoc-can-chi-chu-ky) |
| Zi Wei Dou Shu chart | [From birth date and hour to the 12 palaces](https://nhatnguyet.org/en/blog/co-so-khoa-hoc-la-so-tu-vi) |
| Patterns of the Tử Vi Đẩu Số Toàn Thư | [Conditions and frequency of each pattern](https://nhatnguyet.org/en/blog/co-so-khoa-hoc-cach-cuc-toan-thu) |
| BaZi | [Why the month pillar follows the solar terms](https://nhatnguyet.org/en/blog/co-so-khoa-hoc-bat-tu) |
| Numerology | [A modern system, and Vietnamese names](https://nhatnguyet.org/en/blog/co-so-khoa-hoc-than-so-hoc) |
| Classical texts, interpretations | [Digitized, collated, linked to charts](https://nhatnguyet.org/en/blog/co-so-khoa-hoc-sach-co-loi-luan) |
| Festivals, ritual prayers | [Sources and how dates are verified](https://nhatnguyet.org/en/blog/co-so-khoa-hoc-le-hoi-van-cung) |
| General method | [How Nhat Nguyet checks its work](https://nhatnguyet.org/en/blog/co-so-khoa-hoc-kiem-chung) |

## Roadmap

- [x] Lunar calendars of four countries, stems and branches, 24 solar terms, 28 lunar mansions
- [x] Zi Wei Dou Shu, BaZi, numerology, festivals (TypeScript, Python)
- [x] Chart interpretations for 1900 to 2100, in three languages
- [ ] Ritual prayers: look up ceremonies, get texts, fill names into the prayer
- [ ] I Ching, Six Lines (Lục Hào), Plum Blossom numerology (Mai Hoa)
- [ ] Feng shui: Eight Mansions (Bát Trạch), personal trigram (cung phi), Lỗ Ban ruler
- [ ] Date selection: auspicious hours, the 12 day officers (12 trực), inauspicious days
- [ ] Western zodiac astrology, Tarot
- [ ] Options by school (leap months, the Rat hour), true solar time

## License and attribution

| Part | License | What you may do |
|---|---|---|
| Source code | [MIT](./LICENSE) | Use, modify, sell; keep the line `Copyright (c) 2026 Nhat Nguyet (nhatnguyet.org)` |
| Data, interpretations | [CC BY 4.0](./DATA-LICENSE) | Use commercially and for AI training, **credit is required** |
| Classical texts | Public domain | Original text is free to use; the digitization and collation are under CC BY 4.0 |
| Ritual prayers | CC BY 4.0 | Collected from folk tradition and edited by Nhat Nguyet, which does not claim authorship of the wording |

**Standard credit line:** `Data: Nhat Nguyet (nhatnguyet.org)`, with a link to
https://nhatnguyet.org where possible. Apps that show results write "According
to Nhat Nguyet" somewhere users can see it. When redistributing the data, keep
the `nguon` (source) column.

The **Nhat Nguyet** name and logo are trademarks and are not covered by the
licenses. Do not name or present a product in a way that suggests it is made
or endorsed by Nhat Nguyet.

**Citation**

```bibtex
@software{nhatnguyet_2026,
  author = {{Nhat Nguyet}},
  title  = {Nhat Nguyet: open source code and data for Zi Wei Dou Shu, BaZi and numerology},
  year   = {2026},
  url    = {https://nhatnguyet.org/en/ma-nguon-mo}
}
```

## FAQ

<details>
<summary><b>Is there a free library to cast Zi Wei Dou Shu charts in JavaScript or Python?</b></summary>

Yes: `npm i @nhatnguyet/tu-vi` or `pip install nhatnguyet`. A chart includes
the element phase (cục), the Life and Body palaces, the 14 major stars and the
minor stars, star brightness, the Four Transformations (Tứ Hóa), Tuần and
Triệt, 10-year periods, yearly periods, transiting stars and chart patterns,
including those of the Tử Vi Đẩu Số Toàn Thư.
</details>

<details>
<summary><b>Can I use this data to train an AI model?</b></summary>

Yes, including for commercial products, under CC BY 4.0. The only condition is
to credit "Data: Nhat Nguyet (nhatnguyet.org)".
</details>

<details>
<summary><b>How accurate is the lunar to Gregorian date conversion?</b></summary>

The calendar is computed from the true positions of the Moon and the Sun. New
moons differ from NASA by 1.1 minutes on average; solar term times differ from
IMCCE by 4.2 minutes on average, over 1900 to 2100. Rebuilding the lunar
calendar from NASA and IMCCE data alone matches 2,459 of 2,461 months.
</details>

<details>
<summary><b>Does the BaZi month pillar follow the lunar month or the solar terms?</b></summary>

The solar terms, as the Four Pillars method requires: the year pillar changes
at Lập Xuân (Start of Spring) and the month pillar at the moment each solar
term begins, not on the first day of the lunar month. Taking the lunar month
as the month pillar is wrong on about a quarter of all days.
</details>

<details>
<summary><b>How does the numerology handle Vietnamese names with diacritics?</b></summary>

Diacritics are stripped, then letters are scored with the letter to number
table, with "Đ" counted as "D". You get the life path, expression, soul urge,
personality, attitude, pinnacle, challenge, and personal year, month and day
numbers.
</details>

<details>
<summary><b>Where do the ritual prayers come from?</b></summary>

They are collected from folk tradition, edited by Nhat Nguyet and sorted into
155 ceremony types: Lunar New Year (Tết), full moon, first day of the lunar
month, death anniversaries, weddings, housewarmings, shop openings...
</details>

## Contributing and contact

- Bug reports and suggestions: open an issue with the birth date and time,
  gender, the result you got, the result you expected and your source. See
  [CONTRIBUTING.md](./CONTRIBUTING.md).
- Website: [nhatnguyet.org](https://nhatnguyet.org) · Email: lienhe@nhatnguyet.org

<p align="center"><sub>Data: Nhat Nguyet (nhatnguyet.org) · Code MIT · Data CC BY 4.0</sub></p>
