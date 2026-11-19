---
license: cc-by-4.0
language:
  - en
  - vi
  - zh
pretty_name: "Nhat Nguyet Zi Wei Dou Shu knowledge units"
size_categories:
  - 1K<n<10K
task_categories:
  - question-answering
  - text-retrieval
  - text-generation
tags:
  - ziwei
  - chinese-metaphysics
  - vietnamese
  - classical-chinese
  - multilingual
  - knowledge-base
configs:
  - config_name: major-star-in-palace
    default: true
    data_files:
      - split: train
        path: data/major-star-in-palace.parquet
  - config_name: minor-star-in-palace
    data_files:
      - split: train
        path: data/minor-star-in-palace.parquet
  - config_name: star
    data_files:
      - split: train
        path: data/star.parquet
  - config_name: four-transformations
    data_files:
      - split: train
        path: data/four-transformations.parquet
  - config_name: pattern
    data_files:
      - split: train
        path: data/pattern.parquet
  - config_name: passages
    data_files:
      - split: train
        path: data/passages.parquet
  - config_name: rules
    data_files:
      - split: train
        path: data/rules.parquet
---

# Nhat Nguyet Zi Wei Dou Shu knowledge units

A compact knowledge base of Zi Wei Dou Shu (Tử Vi) for developers and AI: **one row per atomic unit of knowledge** (a major star in a palace at a given branch and brightness, a minor star in a palace, a star, a transformation, a named pattern), not one row per chart. Each row carries the interpretation text that nhatnguyet.org writes for that unit in Vietnamese, English and Chinese, the public domain classical passages (original text, book, author, chapter) that the site's reading engine looks up for it, and the ids of the rules it rests on.

Data: Nhat Nguyet (nhatnguyet.org). License: CC BY 4.0. Project page: https://nhatnguyet.org/en/ma-nguon-mo

**These are the rules of one traditional school, not verified predictions.** Zi Wei Dou Shu has not been empirically validated. A row says what the school's rules and books say about a unit; it does not say that it is true of any person.

## Tables and coverage

| Config | Rows | With site text | With classical passages | Passage links | Distinct passages |
|---|---:|---:|---:|---:|---:|
| `major-star-in-palace` | 2,016 | 2,016 | 1,656 | 2,188 | 362 |
| `minor-star-in-palace` | 662 | 0 | 107 | 135 | 135 |
| `star` | 71 | 11 | 36 | 292 | 292 |
| `four-transformations` | 4 | 0 | 4 | 19 | 19 |
| `pattern` | 34 | 34 | 28 | 77 | 77 |
| `passages` | 885 | | | | |
| `rules` | 3 | | | | |

- `major-star-in-palace`: One row per major star, palace and earthly branch: the brightness the star has at that branch and the site's reading of the star in that palace, with the classical passages the reading engine looks up for it.
- `minor-star-in-palace`: One row per minor star (or the void markers Tuần and Triệt) and palace, as met on real charts, with the classical passages looked up for the star in that palace.
- `star`: One row per star: how the site places it (minor stars) and the classical passages about the star itself.
- `four-transformations`: One row per transformation (Hóa Lộc, Hóa Quyền, Hóa Khoa, Hóa Kỵ) with the classical passages about it.
- `pattern`: One row per named chart pattern the engine recognises: the site's description, the annotation of the Tử Vi Đẩu Số Toàn Thư where it lists the pattern, and the classical passages under the pattern's name.
- `passages`: every classical passage linked from a unit, once, with book, author (`author_vi`, `author_en`), chapter, the passage's own key in English (`passage_key`). The same passage has the same id, `passage_key` and text in `store/passages` of the chart-reading datasets (`nhatnguyet/ziwei-readings`, `bazi-readings`, `numerology-readings`), where `passage_id` is `id`.
- `rules`: the rules referenced in `rule_ids`, with names in three languages, the school and whether the site has collated the rule with a printed edition.

696 distinct site texts. 885 distinct classical passages from 2 books link to the units; they cover 847 of the 1,502 public domain passages of this discipline in the site's classical store (56%). The rest are passages the reading engine only reaches through yearly luck or other chart-wide keys that are not atomic units here.

Books (passages linked):

- 紫微斗数全书 (Tử Vi Đẩu Số Toàn Thư), traditionally attributed to Chen Tuan (Chen Xiyi); preface (Jiajing gengxu year, 1550) and editing by Luo Hongxian: 874
- 新鋟希夷陈先生紫微斗数全书（明南阳堂刊本） (Tử Vi Đẩu Số Toàn Thư, bản khắc Minh Nam Dương Đường: lời chú Cốt Tủy Phú và các bài luận cách), traditionally attributed to Chen Tuan; supplemented by Pan Xiyin: 11

`author_en` is filled for 885 of 885 passages.

## Columns

Key columns come first and differ by config. Enumerated values are English or toneless pinyin (`star = "zi-wei"`, `palace = "life"`, `brightness = "exalted"`); `*_vi`, `*_en`, `*_zh` give the Vietnamese name, the English name and the simplified Chinese name from the library's terminology table (`du-lieu/terminology` in the GitHub repository). Then:

- `texts`: list of `{kind, text_id, text_vi, text_en, text_zh, in_chart_readings}`. `kind` says what the text is (`interpretation`, `placement`, `description`, `reading`, `lookup-rule`, `other-books`, `index-description`, `strengths`, `weaknesses`, `career`, `love`, `money`, `health`, `advice`, `meaning`). `text_id` uses the id scheme of the chart-reading datasets (`l` + 16 hex digits of SHA-256 of vi, en, zh); `in_chart_readings` is true when the same sentence is used verbatim in those readings.
- `classical`: list of `{passage_id, lookup_key, passage_key, applies_to, book_title, book_title_original, book_title_vi, author_vi, author_en, chapter, language, classical_text}`. `lookup_key` is the query that returned the passage, in English (`pattern-annotation` for the Toàn Thư note on a pattern); `passage_key` is the passage's own key in English: it matches `passage_key` of `store/passages` in the chart-reading datasets. `applies_to` is `all`, `male` or `female`: the engine filters passages written for one sex (and softens harsh lines) by the sex of the chart, so a passage may reach only male or only female charts.
- `author_vi` is the author note of the site's book catalogue, in Vietnamese with names in Chinese characters; `author_en` renders it in English (pinyin names, dynasty, attribution type) through a closed phrase table, and is empty when a part of the note does not match the table.
- `lookup_keys`: every query made for the unit, even those that returned nothing, in English.

Keys are written `kind=...;field=value` with English field names and the codes of the key columns (`kind=star-in-palace;palace=life;star=zi-wei`). `not_<field>=v` excludes passages with that value, `without_<field>=true` excludes passages that have the field at all, `exact_match=true` asks for no extra fields. A field ending in `_zh` carries a Chinese heading for which no code exists (a section title of a classic).
- `rule_ids`: ids in the `rules` config.
- `attribution`: "Data: Nhat Nguyet (nhatnguyet.org)".

The CSV files are flat: texts joined by line breaks, passages as ids only (`passage_ids`); the full passage text is in `passages`.

## How it was built

Generated by the knowledge exporter of the Nhat Nguyet engine (deterministic, no AI model) from calculation engine **2.2.0**. The units and their store keys are the ones the site's reading engine uses when it writes a reading, so a unit's passages are exactly those a chart containing that unit can receive (per key, up to the engine's cap of 16 passages for Zi Wei and 10 for the others). Site texts were collected by computing charts for every birth date from 1900 to 2100 (1761936 charts); the generator stops if a key ever yields two different texts. Only rows met on real charts are kept.

Classical passages come only from books marked public domain in the site's classical store and shown to readers. The text is the original wording, with lines the engine filters out replaced by an ellipsis, exactly as in the chart-reading datasets (`store/passages` of `nhatnguyet/*-readings`), where `id` equals `passage_id` here and points to the same passage.

## Read it

```python
from datasets import load_dataset

ds = load_dataset("nhatnguyet/ziwei-knowledge", "major-star-in-palace", split="train")
row = ds[0]
print(row["unit_id"])
for t in row["texts"]:
    print(t["kind"], t["text_en"])
for p in row["classical"][:3]:
    print(p["book_title"], p["chapter"], p["classical_text"][:80])
```

## Citation

```
Nhat Nguyet. Zi Wei Dou Shu knowledge units. Hugging Face dataset nhatnguyet/ziwei-knowledge. https://nhatnguyet.org
```

## Tiếng Việt

Bộ tri thức Tử Vi của Nhật Nguyệt: mỗi dòng là một đơn vị tri thức (chính tinh tại một cung theo chi và mức sáng, phụ tinh tại cung, từng sao, Tứ Hóa, cách cục), không phải một lá số. Mỗi dòng có lời luận của Nhật Nguyệt ba thứ tiếng (Việt, Anh, Trung), các đoạn sách cổ phạm vi công cộng mà bộ soạn bản luận tra cho đơn vị ấy (nguyên văn, tên sách, tác giả, chương) và mã luật.

Đây là quy tắc của một trường phái, không phải lời đoán đã được kiểm chứng. Giấy phép CC BY 4.0, ghi nguồn: "Dữ liệu: Nhật Nguyệt (nhatnguyet.org)". Tên cột và giá trị mã bằng tiếng Anh hay bính âm; tên tiếng Việt ở các cột `*_vi`.
