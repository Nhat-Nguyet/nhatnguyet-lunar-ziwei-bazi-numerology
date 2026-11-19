---
license: cc-by-4.0
language:
  - en
  - vi
  - zh
pretty_name: "Nhat Nguyet numerology knowledge units"
size_categories:
  - n<1K
task_categories:
  - question-answering
  - text-retrieval
  - text-generation
tags:
  - numerology
  - chinese-metaphysics
  - vietnamese
  - classical-chinese
  - multilingual
  - knowledge-base
configs:
  - config_name: core-number
    default: true
    data_files:
      - split: train
        path: data/core-number.parquet
  - config_name: cycle-number
    data_files:
      - split: train
        path: data/cycle-number.parquet
  - config_name: life-topic
    data_files:
      - split: train
        path: data/life-topic.parquet
  - config_name: passages
    data_files:
      - split: train
        path: data/passages.parquet
  - config_name: rules
    data_files:
      - split: train
        path: data/rules.parquet
---

# Nhat Nguyet numerology knowledge units

A compact knowledge base of numerology (Pythagorean, by birth date) for developers and AI: **one row per atomic unit of knowledge** (a core number and its value, a Pinnacle, Challenge, Personal Year or Karmic Debt number, a grid digit count, an arrow, a life topic), not one row per chart. Each row carries the interpretation text that nhatnguyet.org writes for that unit in Vietnamese, English and Chinese, the public domain classical passages (original text, book, author, chapter) that the site's reading engine looks up for it, and the ids of the rules it rests on.

Data: Nhat Nguyet (nhatnguyet.org). License: CC BY 4.0. Project page: https://nhatnguyet.org/en/ma-nguon-mo

**These are the rules of one traditional school, not verified predictions.** Numerology has not been empirically validated. A row says what the school's rules and books say about a unit; it does not say that it is true of any person.

## Tables and coverage

| Config | Rows | With site text | With classical passages | Passage links | Distinct passages |
|---|---:|---:|---:|---:|---:|
| `core-number` | 31 | 31 | 31 | 183 | 159 |
| `cycle-number` | 34 | 30 | 32 | 302 | 96 |
| `life-topic` | 78 | 0 | 28 | 64 | 64 |
| `passages` | 195 | | | | |
| `rules` | 1 | | | | |

- `core-number`: One row per core number (Life Path, Birthday, Attitude) and value: what the index means, the strengths and weaknesses the site writes for the number, life-area notes for the Life Path, and the classical passages on the number.
- `cycle-number`: One row per Karmic Debt, Pinnacle, Challenge and Personal Year number: the site's meaning of the number in that role and the classical passages on it.
- `life-topic`: One row per life topic of the numerology classics (work, money, marriage...) for each Life Path number, plus one general row per topic, with the passages.
- `passages`: every classical passage linked from a unit, once, with book, author (`author_vi`, `author_en`), chapter, the passage's own key in English (`passage_key`). The same passage has the same id, `passage_key` and text in `store/passages` of the chart-reading datasets (`nhatnguyet/ziwei-readings`, `bazi-readings`, `numerology-readings`), where `passage_id` is `id`.
- `rules`: the rules referenced in `rule_ids`, with names in three languages, the school and whether the site has collated the rule with a printed edition.

105 distinct site texts. 195 distinct classical passages from 8 books link to the units; they cover 195 of the 239 public domain passages of this discipline in the site's classical store (82%). The rest are passages the reading engine only reaches through yearly luck or other chart-wide keys that are not atomic units here.

Not included because no unit of that kind has a site text or a public domain passage: `birth-day`, `grid`, `arrow`. The classical store has passages for them only in books that are still under copyright.

Books (passages linked):

- Numerology Made Plain: The Science of Names and Numbers and the Law of Vibration (Thần số học giảng rõ, Taylor, 1926), Ariel Yvon Taylor: 50
- What's in Your Name? The Science of Letters and Numbers (Tên của bạn chứa gì?, Cheasley, 1916), Clifford W. Cheasley (1890-?): 49
- Cheiro's Book of Numbers (Sách về các con số của Cheiro, 1926), Cheiro (William John Warner, 1866-1936): 32
- The Kabala of Numbers: A Handbook of Interpretation (Kabala của các con số, Sepharial, 1911), Sepharial (Walter Gorn Old, 1864-1929): 20
- How to Attain Success Through the Strength of Vibration (Đạt thành công nhờ sức mạnh của rung động, Balliett, 1905), Mrs. L. Dow Balliett (1847-1929): 13
- Names, Dates, and Numbers: What They Mean to You (Tên, ngày và số, Walton, 1914), Roy Page Walton: 13
- The Philosophy of Numbers; Their Tone and Colors (Triết học về các con số, âm và màu của chúng, Balliett, 1908), Mrs. L. Dow Balliett (1847-1929): 13
- Numbers: Their Occult Power and Mystic Virtues (Các con số: quyền năng huyền bí và đức tính thần bí, Westcott, 1890; bản 1911), W. Wynn Westcott (1848-1925): 5

`author_en` is filled for 195 of 195 passages.

## Columns

Key columns come first and differ by config. Enumerated values are English or toneless pinyin (`star = "zi-wei"`, `palace = "life"`, `brightness = "exalted"`); `*_vi`, `*_en`, `*_zh` give the Vietnamese name, the English name and the simplified Chinese name from the library's terminology table (`du-lieu/terminology` in the GitHub repository). Then:

- `texts`: list of `{kind, text_id, text_vi, text_en, text_zh, in_chart_readings}`. `kind` says what the text is (`interpretation`, `placement`, `description`, `reading`, `lookup-rule`, `other-books`, `index-description`, `strengths`, `weaknesses`, `career`, `love`, `money`, `health`, `advice`, `meaning`). `text_id` uses the id scheme of the chart-reading datasets (`l` + 16 hex digits of SHA-256 of vi, en, zh); `in_chart_readings` is true when the same sentence is used verbatim in those readings.
- `classical`: list of `{passage_id, lookup_key, passage_key, applies_to, book_title, book_title_original, book_title_vi, author_vi, author_en, chapter, language, classical_text}`. `lookup_key` is the query that returned the passage, in English (`pattern-annotation` for the Toàn Thư note on a pattern); `passage_key` is the passage's own key in English: it matches `passage_key` of `store/passages` in the chart-reading datasets. `applies_to` is `all`, `male` or `female`: the engine filters passages written for one sex (and softens harsh lines) by the sex of the chart, so a passage may reach only male or only female charts.
- `author_vi` is the author note of the site's book catalog, in Vietnamese with names in Chinese characters; `author_en` renders it in English (pinyin names, dynasty, attribution type) through a closed phrase table, and is empty when a part of the note does not match the table.
- `lookup_keys`: every query made for the unit, even those that returned nothing, in English.

Keys are written `kind=...;field=value` with English field names and the codes of the key columns (`kind=star-in-palace;palace=life;star=zi-wei`). `not_<field>=v` excludes passages with that value, `without_<field>=true` excludes passages that have the field at all, `exact_match=true` asks for no extra fields. A field ending in `_zh` carries a Chinese heading for which no code exists (a section title of a classic).
- `rule_ids`: ids in the `rules` config.
- `attribution`: "Data: Nhat Nguyet (nhatnguyet.org)".

The CSV files are flat: texts joined by line breaks, passages as ids only (`passage_ids`); the full passage text is in `passages`.

## How it was built

Generated by the knowledge exporter of the Nhat Nguyet engine (deterministic, no AI model) from calculation engine **2.2.0**. The units and their store keys are the ones the site's reading engine uses when it writes a reading, so a unit's passages are exactly those a chart containing that unit can receive (per key, up to the engine's cap of 16 passages for Zi Wei and 10 for the others). Site texts were collected by computing charts for every birth date from 1900 to 2100 (73414 birth dates); the generator stops if a key ever yields two different texts. Only rows met on real charts are kept.

Classical passages come only from books marked public domain in the site's classical store and shown to readers. The text is the original wording, with lines the engine filters out replaced by an ellipsis, exactly as in the chart-reading datasets (`store/passages` of `nhatnguyet/*-readings`), where `id` equals `passage_id` here and points to the same passage.

## Read it

```python
from datasets import load_dataset

ds = load_dataset("nhatnguyet/numerology-knowledge", "core-number", split="train")
row = ds[0]
print(row["unit_id"])
for t in row["texts"]:
    print(t["kind"], t["text_en"])
for p in row["classical"][:3]:
    print(p["book_title"], p["chapter"], p["classical_text"][:80])
```

## Citation

```
Nhat Nguyet. numerology knowledge units. Hugging Face dataset nhatnguyet/numerology-knowledge. https://nhatnguyet.org
```

## Tiếng Việt

Bộ tri thức Thần số học của Nhật Nguyệt: mỗi dòng là một đơn vị tri thức (chỉ số gốc theo con số, đỉnh cao, thách thức, năm cá nhân, nợ nghiệp, lưới ngày sinh, mũi tên, chủ đề đời sống), không phải một lá số. Mỗi dòng có lời luận của Nhật Nguyệt ba thứ tiếng (Việt, Anh, Trung), các đoạn sách cổ phạm vi công cộng mà bộ soạn bản luận tra cho đơn vị ấy (nguyên văn, tên sách, tác giả, chương) và mã luật.

Đây là quy tắc của một trường phái, không phải lời đoán đã được kiểm chứng. Giấy phép CC BY 4.0, ghi nguồn: "Dữ liệu: Nhật Nguyệt (nhatnguyet.org)". Tên cột và giá trị mã bằng tiếng Anh hay bính âm; tên tiếng Việt ở các cột `*_vi`.
