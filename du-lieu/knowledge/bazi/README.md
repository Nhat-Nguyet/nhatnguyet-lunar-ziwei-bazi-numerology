---
license: cc-by-nc-4.0
language:
  - en
  - vi
  - zh
pretty_name: "Nhat Nguyet BaZi knowledge units"
size_categories:
  - 1K<n<10K
task_categories:
  - question-answering
  - text-retrieval
  - text-generation
tags:
  - bazi
  - chinese-metaphysics
  - vietnamese
  - classical-chinese
  - multilingual
  - knowledge-base
configs:
  - config_name: day-master
    default: true
    data_files:
      - split: train
        path: data/day-master.parquet
  - config_name: day-master-by-month
    data_files:
      - split: train
        path: data/day-master-by-month.parquet
  - config_name: day-pillar-and-hour
    data_files:
      - split: train
        path: data/day-pillar-and-hour.parquet
  - config_name: pillar-na-yin
    data_files:
      - split: train
        path: data/pillar-na-yin.parquet
  - config_name: ten-god
    data_files:
      - split: train
        path: data/ten-god.parquet
  - config_name: pattern
    data_files:
      - split: train
        path: data/pattern.parquet
  - config_name: symbolic-star
    data_files:
      - split: train
        path: data/symbolic-star.parquet
  - config_name: topic
    data_files:
      - split: train
        path: data/topic.parquet
  - config_name: passages
    data_files:
      - split: train
        path: data/passages.parquet
  - config_name: rules
    data_files:
      - split: train
        path: data/rules.parquet
---

# Nhat Nguyet BaZi knowledge units

A compact knowledge base of BaZi (Bát Tự, Four Pillars) for developers and AI: **one row per atomic unit of knowledge** (a day master, a day master by birth month, a day pillar by hour, a pillar's na yin, a Ten God, a month-command pattern, a symbolic star, a topic of the classics), not one row per chart. Each row carries the interpretation text that nhatnguyet.org writes for that unit in Vietnamese, English and Chinese, the public domain classical passages (original text, book, author, chapter) that the site's reading engine looks up for it, and the ids of the rules it rests on.

Data: Nhat Nguyet (nhatnguyet.org). License: CC BY-NC 4.0 (non-commercial use with attribution; for commercial use, ask at lienhe@nhatnguyet.org). Releases before 20 November 2026 were published under CC BY 4.0 and keep that license; the classical passages remain in the public domain. A small number of sentences are worded differently from the same text on nhatnguyet.org, so that copies can be recognized; they say the same thing. Project page: https://nhatnguyet.org/en/ma-nguon-mo

**These are the rules of one traditional school, not verified predictions.** BaZi has not been empirically validated. A row says what the school's rules and books say about a unit; it does not say that it is true of any person.

## Tables and coverage

| Config | Rows | With site text | With classical passages | Passage links | Distinct passages |
|---|---:|---:|---:|---:|---:|
| `day-master` | 10 | 10 | 10 | 21 | 21 |
| `day-master-by-month` | 120 | 120 | 120 | 307 | 199 |
| `day-pillar-and-hour` | 720 | 0 | 720 | 1,749 | 914 |
| `pillar-na-yin` | 60 | 0 | 60 | 119 | 119 |
| `ten-god` | 10 | 0 | 10 | 59 | 59 |
| `pattern` | 10 | 0 | 10 | 86 | 86 |
| `symbolic-star` | 9 | 9 | 9 | 21 | 18 |
| `topic` | 34 | 0 | 34 | 173 | 173 |
| `passages` | 1,589 | | | | |
| `rules` | 4 | | | | |

- `day-master`: One row per day stem (the day master): the site's one-line reading of it and the classical passages on that stem.
- `day-master-by-month`: One row per day stem and month branch: the site's reading of being born in that month (in or out of season) and the classical passages on climate balance (tiao hou) for that pair.
- `day-pillar-and-hour`: One row per day pillar and hour branch, with the classical passages on a day stem born at that hour.
- `pillar-na-yin`: One row per stem-branch pillar with its na yin element and the classical passages on that pillar's na yin.
- `ten-god`: One row per Ten God with the classical passages on it.
- `pattern`: One row per chart pattern taken from the month command (as met on real charts), with the classical passages on the pattern and on choosing luck pillars for it.
- `symbolic-star`: One row per symbolic star (shen sha): how the site looks it up, how other books differ, and the classical passages on it.
- `topic`: One row per topic heading of the BaZi classics that the reading engine looks up (temperament, family, wealth, luck...), with its passages. topic_en is a working label, not a reviewed translation.
- `passages`: every classical passage linked from a unit, once, with book, author (`author_vi`, `author_en`), chapter, the passage's own key in English (`passage_key`). The same passage has the same id, `passage_key` and text in `store/passages` of the chart-reading datasets (`nhatnguyet/ziwei-readings`, `bazi-readings`, `numerology-readings`), where `passage_id` is `id`.
- `rules`: the rules referenced in `rule_ids`, with names in three languages, the school and whether the site has collated the rule with a printed edition.

77 distinct site texts. 1,589 distinct classical passages from 7 books link to the units; they cover 1,372 of the 1,685 public domain passages of this discipline in the site's classical store (81%). The rest are passages the reading engine only reaches through yearly luck or other chart-wide keys that are not atomic units here.

Books (passages linked):

- 三命通会 (Tam Mệnh Thông Hội), Wan Minying (Yuwu Shanren): 1,121
- 穷通宝鉴 (Cùng Thông Bảo Giám), anonymous, Ming dynasty (original title Lanjiang Wang); re-edited and titled Qiongtong Baojian by Yu Chuntai: 187
- 神峰通考 (Thần Phong Thông Khảo), Zhang Nan (Zhang Shenfeng): 80
- 命理约言 (Mệnh Lý Ước Ngôn), Chen Su'an (Chen Zhilin, 1605-1666); circulating edition selected and reprinted by Wei Qianli: 74
- 滴天髓阐微 (Trích Thiên Tủy), original text traditionally attributed to Jing Tu (Song dynasty), original notes attributed to Liu Ji (Ming dynasty); Chanwei commentary by Ren Tieqiao (Qing dynasty): 55
- 渊海子平 (Uyên Hải Tử Bình), compiled by Xu Sheng (Xu Dasheng, Song dynasty); Yang Cong (Ming dynasty) merged Yuanhai and Yuanyuan into one work and enlarged it: 39
- 子平真诠 (Tử Bình Chân Thuyên), Shen Xiaozhan (Shen Yifan): 33

`author_en` is filled for 1,589 of 1,589 passages.

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

Generated by the knowledge exporter of the Nhat Nguyet engine (deterministic, no AI model) from calculation engine **2.3.0**. The units and their store keys are the ones the site's reading engine uses when it writes a reading, so a unit's passages are exactly those a chart containing that unit can receive (per key, up to the engine's cap of 16 passages for Zi Wei and 10 for the others). Site texts were collected by computing charts for every birth date from 1900 to 2100 (73414 charts); the generator stops if a key ever yields two different texts. Only rows met on real charts are kept.

Classical passages come only from books marked public domain in the site's classical store and shown to readers. The text is the original wording, with lines the engine filters out replaced by an ellipsis, exactly as in the chart-reading datasets (`store/passages` of `nhatnguyet/*-readings`), where `id` equals `passage_id` here and points to the same passage.

## Read it

```python
from datasets import load_dataset

ds = load_dataset("nhatnguyet/bazi-knowledge", "day-master", split="train")
row = ds[0]
print(row["unit_id"])
for t in row["texts"]:
    print(t["kind"], t["text_en"])
for p in row["classical"][:3]:
    print(p["book_title"], p["chapter"], p["classical_text"][:80])
```

## Citation

```
Nhat Nguyet. BaZi knowledge units. Hugging Face dataset nhatnguyet/bazi-knowledge. https://nhatnguyet.org
```

## Tiếng Việt

Bộ tri thức Bát Tự của Nhật Nguyệt: mỗi dòng là một đơn vị tri thức (nhật chủ, nhật chủ theo tháng sinh, trụ ngày theo giờ, nạp âm của trụ, thập thần, cách cục theo nguyệt lệnh, thần sát, chủ đề sách), không phải một lá số. Mỗi dòng có lời luận của Nhật Nguyệt ba thứ tiếng (Việt, Anh, Trung), các đoạn sách cổ phạm vi công cộng mà bộ soạn bản luận tra cho đơn vị ấy (nguyên văn, tên sách, tác giả, chương) và mã luật.

Đây là quy tắc của một trường phái, không phải lời đoán đã được kiểm chứng. Giấy phép CC BY-NC 4.0 (dùng phi thương mại, ghi nguồn "Dữ liệu: Nhật Nguyệt (nhatnguyet.org)"; dùng thương mại xin phép qua lienhe@nhatnguyet.org). Bản phát hành trước 20/11/2026 giữ giấy phép CC BY 4.0. Vài câu được viết khác chữ so với câu cùng nghĩa trên nhatnguyet.org để nhận ra bản chép. Tên cột và giá trị mã bằng tiếng Anh hay bính âm; tên tiếng Việt ở các cột `*_vi`.
