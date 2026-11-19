---
license: cc-by-4.0
language:
  - zh
  - en
  - fr
pretty_name: "Classical Chinese parallel corpus (Nhat Nguyet) · Song ngữ cổ văn"
size_categories:
  - 1K<n<10K
task_categories:
  - translation
tags:
  - classical-chinese
  - literary-chinese
  - parallel-corpus
  - sentence-alignment
  - i-ching
  - public-domain
configs:
  - config_name: default
    data_files:
      - split: train
        path: data/train-*.parquet
---

# Classical Chinese parallel corpus

**1,328 aligned segments** of Classical Chinese with public domain translations: **952 Chinese-English** and
**376 Chinese-French**. The Chinese side is the base text of the 64 hexagram chapters of the I Ching (judgment, line
statements, and the three commentaries printed with them). Every segment was aligned by the structure of the text
(hexagram number, section, line number), never by machine translation, and every published pair passed all the checks
listed below. Pairs that did not pass were left out.

Data: Nhat Nguyet (nhatnguyet.org). Project page: [https://nhatnguyet.org/en/ma-nguon-mo](https://nhatnguyet.org/en/ma-nguon-mo)

## What is in it

One row per aligned pair. The same `unit_id` (for example `h05.small_image.3`) appears once per language pair, so
the English and French rows of a unit can be joined into a three-way parallel text.

| `section` | `zh-en` (published / possible) | `zh-fr` (published / possible) |
|---|---:|---:|
| `judgment` | 64 / 64 | 23 / 30 |
| `line_statement` | 386 / 386 | 169 / 182 |
| `judgment_commentary` | 64 / 64 | 15 / 30 |
| `great_image` | 64 / 64 | 30 / 30 |
| `small_image` | 374 / 386 | 139 / 182 |
| **Total** | **952** / 964 | **376** / 454 |

- `judgment`: Judgment (卦辭): the statement on the whole hexagram.
- `line_statement`: Line statement (爻辭), lines 1 to 6, plus the extra "use of nine / use of six" statement of hexagrams 1 and 2 (line 7).
- `judgment_commentary`: Commentary on the judgment (彖傳), one segment per hexagram.
- `great_image`: Great image (大象): the commentary on the two trigrams.
- `small_image`: Small image (小象): the commentary on each line, numbered like the line.

The French side covers hexagrams 1 to 30 only: the public domain edition in the source set is the first volume of a
two-volume translation. There is no Vietnamese side: no Vietnamese translation of this text in the source set is in
the public domain under the rule below, so none was used.

## Sources

The texts come from the public domain set [`nhatnguyet/sach-co`](https://huggingface.co/datasets/nhatnguyet/sach-co) and
are referred to by its neutral ids. As in that set, titles, authors and source sites are not part of this release;
each source carries the facts its public domain status rests on.

| Code | Side | Language | `pd_basis` | Latest creator death | In book form by | Edition | OCR |
|---|---|---|---|---|---|---|---|
| `sc-0034` | original | Classical Chinese | `ancient-anonymous` | anonymous | pre-modern | retyped pre-modern text | no |
| `sc-0029` | translation | English | `author-died-before-1955` | 1800-1900 | 1800-1900 | translation | yes |
| `sc-0416` | translation | French | `author-died-before-1955` | 1900-1930 | 1800-1900 | printed book | yes |

Both translations are public domain under the same rule as the source set, which holds for both Vietnamese law
(50 years after the author's death) and United States law (published before 1931): every creator died in or before
1955 and the edition was printed before 1931. The French translation was printed during the colonial period; it is
kept as a historical source and may carry the views of its time.

## How the alignment was made

1. **Chinese**: each hexagram chapter is parsed into its judgment, line statements (labeled 初九, 六二 ... 上六,
   用九, 用六), the commentary on the judgment (彖曰), the great image and the small images (象曰). Variant-reading
   notes added by the digital source (`X一作「Y」`, `〈…〉`) are removed. Nothing else is changed.
2. **English**: the translation has a numbered layout (hexagram headings, numbered lines, numbered paragraphs in the
   commentary appendices). The scanned text interleaves the translation with the translator's own notes on every page;
   notes are set in smaller type, so they are separated from the translation by line length, and the running heads
   of each page are removed.
3. **French**: each passage of the base text is a numbered formula, followed by commentary. Formulas are identified by
   their opening words (line number and the word for a yang or yin line, "commentary on the judgment", "symbolic
   commentary") and by the marker of the small-image commentary; the commentary that follows is dropped.

Each candidate pair is then checked; `checks` lists the checks it passed:

- `structure`: found at the expected position in the numbered structure.
- `line_polarity` (line statements): the translation names the line as yang/undivided or yin/divided exactly as the
  Chinese label (九 or 六) does, and the line number matches (`line_ordinal`).
- `count_complete` (small images): the translation has exactly as many small-image paragraphs for the hexagram as the
  Chinese, so the numbering is not shifted.
- `no_embedded_number` (English small images): the segment does not contain the start of the next numbered paragraph.
- `hexagram_boundary` (French): the upper trigram named at the head of the chapter matches the Chinese.
- `length_ratio`: translation characters per Chinese character between 3 and 24 (30 for originals under
  12 characters).
- `relative_length` (French judgments and commentaries): not much shorter than the other segments of the same chapter.
  The French commentary on the judgment is split into several numbered formulas, and a formula whose number was lost
  in OCR would otherwise leave a silent gap.

All published rows have `alignment_confidence = "high"`. 90 candidate pairs failed at least one check and are not
published (mostly French segments where OCR lost a formula number or a line heading, and two English hexagrams whose
small-image numbering is unreadable).

## Known limitations

- Both translations are **OCR of 19th-century printed books**. They keep OCR errors (`Kh ien`, `V arrangement`, stray
  quotation marks) and old romanization of Chinese names. They are not corrected.
- The English translation adds words in parentheses to make the terse Chinese readable, and the French follows the
  reading of the Song commentators. They are translations of their time, not modern scholarly ones.
- The commentary on the judgment is one segment per hexagram; it is not split further into sentences.
- Not covered: the 文言, 繫辭, 說卦, 序卦 and 雜卦 commentaries (their chapter divisions differ between the Chinese base
  text and the translation, so they cannot be aligned by structure alone).

## Files

| Path | Contents |
|---|---|
| `data/train-00000-of-00001.parquet` | one row per aligned pair |
| `segments.jsonl` | the same rows as JSON lines |

Columns: `segment_id`, `unit_id`, `lang_pair`, `hexagram` (1 to 64), `section`, `line` (1 to 7, or null),
`original`, `original_lang`, `translation`, `translation_lang`, `source_code`, `translation_source_code`,
`translation_ocr`, `alignment_method` (`structural`), `alignment_confidence`, `checks`, `length_ratio`.

```python
from datasets import load_dataset

ds = load_dataset("nhatnguyet/classical-parallel", split="train")
print(ds)

en = ds.filter(lambda r: r["lang_pair"] == "zh-en" and r["section"] == "line_statement")
print(en[0]["original"], "->", en[0]["translation"])

# three-way text for the units that have both translations
fr = {r["unit_id"]: r["translation"] for r in ds if r["lang_pair"] == "zh-fr"}
tri = [(r["unit_id"], r["original"], r["translation"], fr[r["unit_id"]])
       for r in ds if r["lang_pair"] == "zh-en" and r["unit_id"] in fr]
print(len(tri))
```

## License and citation

The texts are in the public domain. The segmentation, alignment, checks and metadata are released under
[CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Credit line: **Data: Nhat Nguyet (nhatnguyet.org)**.

This is a text of divination and its classical commentaries. Its statements are the tradition's own; they have not
been empirically validated, and nothing here is a prediction.

## Tiếng Việt

Bộ gồm **1.328 cặp đoạn song ngữ** Hán văn với bản dịch thuộc phạm vi công cộng: **952 cặp Hán-Anh** và
**376 cặp Hán-Pháp** (bản Pháp chỉ có quẻ 1 tới 30). Bên Hán văn là kinh văn 64 quẻ Kinh Dịch: lời quẻ, lời hào,
Thoán truyện, Đại Tượng, Tiểu Tượng. Mỗi cặp được căn theo CẤU TRÚC văn bản (số quẻ, phần, số hào), không dùng dịch
máy, và chỉ phát hành khi qua mọi phép kiểm: đúng vị trí, hào dương/âm của bản dịch khớp chữ 九/六 của bản gốc, đủ số
đoạn Tiểu Tượng, tỉ lệ độ dài hợp lý. 90 cặp không qua bị loại. Hai bản dịch là chữ nhận dạng quang học của
sách in thế kỷ 19, giữ nguyên lỗi OCR. Không có bản tiếng Việt: chưa có bản dịch Việt nào của văn bản này thuộc phạm vi
công cộng theo luật của bộ (người làm mất từ 1955 trở về trước, bản in trước 1931). Nguồn ghi bằng mã trung tính của
bộ `nhatnguyet/sach-co`, không ghi tên sách, tác giả. Phần chia đoạn, căn hàng và siêu dữ liệu theo giấy phép
CC BY 4.0; ghi nguồn: **Dữ liệu: Nhật Nguyệt (nhatnguyet.org)**.
