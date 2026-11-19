# Examples

Ways to try the Nhat Nguyet libraries, from no install at all to ready-to-use
templates. The same birth data (1990-09-19, 20:00, male) gives the same chart
everywhere.

## Quick tries

| Folder | Run | What it shows |
|---|---|---|
| [`cdn.html`](cdn.html) | open the file in a browser | a Zi Wei chart drawn from `https://cdn.jsdelivr.net/npm/@nhatnguyet/tu-vi/+esm`, no build step |
| [`node/`](node) | `cd node && npm install && npm start` | lunar date in Vietnam and China, Zi Wei, BaZi, numerology; writes three SVG files |
| [`python/`](python) | `pip install nhatnguyet && python python/example.py` | the same as `node/`, in pure Python |

Expected output of `node/` and `python/` with version 0.3.0 (0.2.0 writes stems
and branches in Vietnamese: `Hợi`, `Canh Ngọ`; pass `terms: "vi"` for that):

```text
1985-01-21  Vietnam: 1985-1-1  China: 1984-12-1
Zi Wei: Earth Five, Life palace in Hai: Moon
BaZi: Geng Wu | Yi You | Ding Hai | Geng Xu
Numerology: life path 11, expression 3
```

## Templates

Small projects to copy and adapt; each runs in about two minutes and has its
own README and tests.

| Folder | What it is |
|---|---|
| [`nextjs-lunar-calendar/`](nextjs-lunar-calendar) | Next.js (App Router, static export) page: month grid with lunar dates and solar terms, today's sexagenary day, month and year, Tết countdown, Zi Wei chart from a form |
| [`telegram-bot/`](telegram-bot) | grammY bot: `/today`, `/hours`, `/tet`, `/ziwei YYYY-MM-DD HH:MM male\|female`; replies in English, Vietnamese or Chinese |
| [`google-sheets/`](google-sheets) | `=LUNARDATE()`, `=SEXAGENARY()`, `=SOLARTERM()`, `=SOLARDATE()` for Google Sheets: one `Code.gs` file to paste into Apps Script |
| [`jupyter/`](jupyter) | notebook (saved with outputs): Tết, lunar months and leap months in Vietnam vs China, 1900 to 2100, with charts |

The templates use the English API (`castZiWei`, `toLunar`, `toSolar`,
`solarTerms`...) and the English package names `@nhatnguyet/lunar` and
`@nhatnguyet/ziwei`, published from version **0.3.0**. Inside this repository
they install the local packages (`file:../../js/packages/...`); in your own
project use `"^0.3.0"` from npm and `nhatnguyet>=0.3.0` from PyPI, as each
README explains.

To test every template against the local packages (copies them to a
temporary folder, so nothing is written here):

```bash
bash examples/test-all.sh            # or: bash examples/test-all.sh telegram-bot
```

## In the browser, on nhatnguyet.org

- Live playground: <https://nhatnguyet.org/en/ma-nguon-mo/thu> (runs these
  packages in your browser; nothing is sent to a server)
- API reference: <https://nhatnguyet.org/en/ma-nguon-mo/tai-lieu>

## StackBlitz

Open `node/` in StackBlitz:
<https://stackblitz.com/github/Nhat-Nguyet/nhatnguyet-lunar-ziwei-bazi-numerology/tree/main/examples/node>

StackBlitz can only open a public GitHub repository, so this link starts
working once the repository is public.

---

**Tiếng Việt.** Ba cách thử thư viện: `cdn.html` mở thẳng bằng trình duyệt (nạp
gói từ jsDelivr), `node/` và `python/` là ví dụ chạy được, in ngày âm Việt Nam
và Trung Quốc, lá số Tử Vi, Bát Tự, Thần số học và ghi ba tệp SVG. Bốn mẫu dự
án dùng ngay: trang lịch âm Next.js, bot Telegram, hàm Google Sheets
(`=LUNARDATE()`...), sổ Jupyter so Tết Việt Nam và Trung Quốc 1900 tới 2100. Trang thử
trực tiếp: <https://nhatnguyet.org/ma-nguon-mo/thu>, tài liệu API:
<https://nhatnguyet.org/ma-nguon-mo/tai-lieu>. Liên kết StackBlitz chỉ chạy khi
repo đã công khai.

Data: Nhat Nguyet (nhatnguyet.org)
