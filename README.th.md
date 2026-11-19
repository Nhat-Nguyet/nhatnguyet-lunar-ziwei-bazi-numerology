<h1 align="center">Nhat Nguyet</h1>

<p align="center">
  <b>จื่อเหวยโต่วซู่ ปาจื้อ และศาสตร์ตัวเลข บนปฏิทินจันทรคติเวียดนามที่ตรวจสอบเทียบกับ NASA และ IMCCE พร้อมคำทำนายดวง 3.6 ล้านดวงที่อ้างอิงตำราโบราณ และกรณีทดสอบร่วม 17,291 กรณีที่ทุกพอร์ตนำไปทดสอบได้</b><br>
  JavaScript · Python · CLI · เซิร์ฟเวอร์ MCP · วิดเจ็ตเว็บ · English, Tiếng Việt, 中文
</p>

<p align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="./assets/la-so-tu-vi-toi.svg">
    <img src="./assets/la-so-tu-vi.svg" alt="ดวงจื่อเหวยโต่วซู่ที่วาดโดยไลบรารี" width="32%">
  </picture>
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="./assets/la-so-bat-tu-toi.svg">
    <img src="./assets/la-so-bat-tu.svg" alt="ดวงปาจื้อที่วาดโดยไลบรารี" width="32%">
  </picture>
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="./assets/than-so-hoc-toi.svg">
    <img src="./assets/than-so-hoc.svg" alt="โปรไฟล์ศาสตร์ตัวเลขที่วาดโดยไลบรารี" width="32%">
  </picture>
</p>

<p align="center">
  <a href="./README.md">English</a> · <a href="./README.vi.md">Tiếng Việt</a> · <a href="./README.zh.md">中文</a> · <a href="./README.ja.md">日本語</a> · <a href="./README.ko.md">한국어</a> · <a href="./README.fr.md">Français</a> · <b>ไทย</b>
  <br>
  <a href="https://nhatnguyet.org/en/ma-nguon-mo/thu">ทดลองใช้</a> ·
  <a href="https://nhatnguyet.org/en/ma-nguon-mo/tai-lieu">เอกสาร</a> ·
  <a href="https://huggingface.co/nhatnguyet">Hugging Face</a> ·
  <a href="https://nhatnguyet.org/en/ma-nguon-mo">หน้าโครงการ</a>
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/@nhatnguyet/tu-vi"><img alt="npm" src="https://img.shields.io/npm/v/@nhatnguyet/tu-vi.svg?label=npm"></a>
  <a href="https://pypi.org/project/nhatnguyet/"><img alt="PyPI" src="https://img.shields.io/pypi/v/nhatnguyet.svg"></a>
  <a href="./ca-kiem"><img alt="กรณีทดสอบ: 17,291" src="https://img.shields.io/badge/test%20vectors-17%2C291-2e7d32.svg"></a>
  <a href="https://github.com/Nhat-Nguyet/nhatnguyet/actions/workflows/kiem.yml"><img alt="การตรวจสอบอัตโนมัติ" src="https://github.com/Nhat-Nguyet/nhatnguyet/actions/workflows/kiem.yml/badge.svg?branch=main"></a>
  <a href="./LICENSE"><img alt="โค้ด: MIT" src="https://img.shields.io/badge/code-MIT-1f6f6b.svg"></a>
  <a href="./DATA-LICENSE"><img alt="ข้อมูล: CC BY 4.0" src="https://img.shields.io/badge/data-CC%20BY%204.0-1f6f6b.svg"></a>
  <a href="https://doi.org/10.5281/zenodo.24358014"><img alt="DOI" src="https://zenodo.org/badge/DOI/10.5281/zenodo.24358014.svg"></a>
</p>

## เริ่มต้นอย่างรวดเร็ว

**JavaScript, TypeScript** (Node 18 ขึ้นไป, เบราว์เซอร์)

```bash
npm i @nhatnguyet/tu-vi @nhatnguyet/am-lich
```

```js
import { writeFileSync } from "node:fs";
import { castZiWei } from "@nhatnguyet/tu-vi";
import { toLunar } from "@nhatnguyet/am-lich";

const chart = castZiWei({ name: "Nguyen Van An", date: "1990-09-19", time: "20:00", gender: "male" });
const life = chart.palaces[chart.lifePalace];
console.log(chart.bureau.name, "|", life.name, life.branch, "|", life.stars[0].name, life.stars[0].brightness);
writeFileSync("chart.svg", chart.toSvg());   // the chart image above

// Same day, two calendars: Tết in Vietnam, still the 12th month in China
const vn = toLunar("1985-01-21");
const cn = toLunar("1985-01-21", { country: "CN" });
console.log(vn.day, vn.month, vn.year, vn.yearName, "|", cn.day, cn.month, cn.year, cn.yearName);
```

```text
Earth Five | Life Palace Hợi | Moon Exalted
1 1 1985 Ất Sửu | 1 12 1984 Giáp Tý
```

**Python** (3.9 ขึ้นไป ใช้เพียงไลบรารีมาตรฐาน): ได้ผลลัพธ์เหมือนกัน และได้ SVG ที่ตรงกันทุกไบต์

```bash
pip install nhatnguyet
```

```python
from nhatnguyet import cast_zi_wei, to_lunar, zi_wei_svg

chart = cast_zi_wei(name="Nguyen Van An", date="1990-09-19", time="20:00", gender="male")
life = chart["palaces"][chart["lifePalace"]]
print(chart["bureau"]["name"], "|", life["name"], life["branch"], "|", life["stars"][0]["name"], life["stars"][0]["brightness"])
open("chart.svg", "w", encoding="utf-8").write(zi_wei_svg(chart))

vn = to_lunar("1985-01-21")
cn = to_lunar("1985-01-21", country="CN")
print(vn["day"], vn["month"], vn["year"], vn["yearName"], "|", cn["day"], cn["month"], cn["year"], cn["yearName"])
```

**บรรทัดคำสั่ง**: ใช้ได้โดยไม่ต้องติดตั้งผ่าน `npx` หรือใช้ `nhatnguyet ...` หลังจาก `pip install nhatnguyet`

```bash
npx @nhatnguyet/cli ziwei 1990-09-19 20:00 male --year 2026
```

<details>
<summary>ผลลัพธ์ (12 เรือนในรูปตาราง ตามด้วยดวงรายปี วัยจร 10 ปี และรูปแบบดวง)</summary>

```text
┌────────────────────┬────────────────────┬────────────────────┬────────────────────┐
│ Travel             │ Health             │ Wealth · Body      │ Children           │
│ Tân Tỵ             │ Nhâm Ngọ Triệt     │ Quý Mùi Triệt      │ Giáp Thân          │
│ Celestial Mechanism│ Purple Star Ex     │ Spinning Camel     │ Army Breaker We    │
│   Pr               │ Celestial Leader,  │ Nurture            │ Prosperity,        │
│ Celestial Talent   │ Celestial Fortune  │                    │ Celestial Horse    │
│ Extinction         │ Conception         │                    │ Growth             │
├────────────────────┼────────────────────┴────────────────────┼────────────────────┤
│ Friends/Subordinat…│                                         │ Spouse             │
│ Canh Thìn          │                                         │ Ất Dậu             │
│ Seven Killings We  │                                         │ Sword Ram,         │
│ Tomb               │                                         │ Earthly Robber,    │
│                    │          ZI WEI DOU SHU CHART           │ Dipper Lord        │
│                    │      Born 1990-09-19 20:00 (Tuất)       │ Bathing            │
├────────────────────┤       Lunar 1990-08-01 · Canh Ngọ       ├────────────────────┤
│ Career             │                Yang Male                │ Siblings           │
│ Kỷ Mão             │           Bureau: Earth Five            │ Bính Tuất Tuần     │
│ Sun Pr Lộc         │      Na yin: Earth by the Roadside      │ Purity Ex          │
│ Celestial Beam Pr  │          Life: Hợi · Body: Mùi          │ Celestial Treasury │
│ Right Assistant,   │                                         │   Pr               │
│ Peach Blossom,     │                                         │ Youth              │
│ Eight Seats,       │                                         │                    │
│ Celestial Nobili…  │                                         │                    │
│ Death              │                                         │                    │
├────────────────────┼────────────────────┬────────────────────┼────────────────────┤
│ Property           │ Fortune/Virtue     │ Parents            │ Life Palace        │
│ Mậu Dần            │ Kỷ Sửu             │ Mậu Tý             │ Đinh Hợi Tuần      │
│ Military Song      │ Celestial Blessing │ Greedy Wolf We     │ Moon Ex Kỵ         │
│   Pr Quyền         │   We Khoa          │ Literary Glory,    │ Left Assistant,    │
│ Celestial General  │ Giant Gate We      │ Celestial Weeping, │ Three Terraces,    │
│   Ex               │ Earthly Void,      │ Celestial Emptin…  │ Grace Light,       │
│ Celestial Excell…, │ Celestial Longev…  │ Peak               │ Celestial Offici…  │
│ Literary Melody    │ Decline            │                    │ Prime              │
│ Illness            │                    │                    │                    │
└────────────────────┴────────────────────┴────────────────────┴────────────────────┘
Brightness: Ex exalted, Pr prosperous, Fa favorable, Ne neutral, We weak. Ages are East
Asian ages (1 at birth).

Year 2026 (Bính Ngọ)
  age 37 · Year palace: Health · Minor limit: Friends/Subordinates ·
  Decade: Property (35-44) · Hóa Lộc: Celestial Blessing → Fortune/Virtue ·
  Hóa Quyền: Celestial Mechanism → Travel · Hóa Khoa: Literary Glory → Parents ·
  Hóa Kỵ: Purity → Siblings

Ten-year periods
    5-14  1994-2003  Life Palace (Hợi)  Moon
   15-24  2004-2013  Parents (Tý)  Greedy Wolf
   25-34  2014-2023  Fortune/Virtue (Sửu)  Celestial Blessing, Giant Gate
   35-44  2024-2033  Property (Dần)  Military Song, Celestial General
   45-54  2034-2043  Career (Mão)  Sun, Celestial Beam
   55-64  2044-2053  Friends/Subordinates (Thìn)  Seven Killings
   65-74  2054-2063  Travel (Tỵ)  Celestial Mechanism
   75-84  2064-2073  Health (Ngọ)  Purple Star
   85-94  2074-2083  Wealth (Mùi)  -
   95-104 2084-2093  Children (Thân)  Army Breaker
  105-114 2094-2103  Spouse (Dậu)  -
  115-124 2104-2113  Siblings (Tuất)  Purity, Celestial Treasury

Patterns
  Cơ Nguyệt Đồng Lương 機月同梁 · Life Palace
  Tả Hữu đồng hội 左右 · Life Palace
  Nhật xuất Phù Tang 日出扶桑 · Career
  Nguyệt lạc Hợi cung 月落亥宮 · Life Palace

Birth time 20:00 falls in the Tuất double hour (19:00-20:59). The lunar date follows the
Vietnamese calendar (UTC+7).
```

</details>

คำสั่งอื่น: `bazi`, `lunar`, `solar`, `terms`, `numerology`, `festivals` และตัวเลือก `--lang vi|zh`, `--json`, `--svg chart.svg` เอกสาร API ฉบับภาษาอังกฤษพร้อมตัวเลือกทั้งหมด: [docs/api-en.md](./docs/api-en.md)

## สารบัญ

1. [มีอะไรใน repo](#มีอะไรใน-repo)
2. [ชุดข้อมูล](#ชุดข้อมูล)
3. [เปรียบเทียบกับไลบรารีอื่น](#เปรียบเทียบกับไลบรารีอื่น)
4. [สำหรับ AI](#สำหรับ-ai)
5. [วิดเจ็ต](#วิดเจ็ต)
6. [พื้นฐานทางวิทยาศาสตร์](#พื้นฐานทางวิทยาศาสตร์)
7. [ทดลองใช้และเอกสาร](#ทดลองใช้และเอกสาร)
8. [ย้ายมาจาก iztro](#ย้ายมาจาก-iztro)
9. [สัญญาอนุญาตและการระบุแหล่งที่มา](#สัญญาอนุญาตและการระบุแหล่งที่มา)
10. [คำถามที่พบบ่อย](#คำถามที่พบบ่อย)
11. [การมีส่วนร่วม](#การมีส่วนร่วม)

## มีอะไรใน repo

ทุกไลบรารีให้ผลตรงกันทีละฟิลด์กับเอนจินที่ขับเคลื่อน
[nhatnguyet.org](https://nhatnguyet.org) และแอป Nhat Nguyet ไม่มีการเรียกเครือข่าย
และไลบรารีไม่มี dependency จากภายนอกเลย

| แพ็กเกจ | Python | ทำอะไรได้ |
|---|---|---|
| [`@nhatnguyet/am-lich`](./js/packages/am-lich) | `nhatnguyet` | แปลงระหว่างปฏิทินจันทรคติกับปฏิทินเกรกอเรียนสำหรับเวียดนาม จีน เกาหลี ญี่ปุ่น และอีก 7 ภูมิภาค ก้านฟ้ากิ่งดิน 24 ฤดูกาลย่อยละเอียดถึงนาที 28 กลุ่มดาวฤกษ์ และ na yin |
| [`@nhatnguyet/tu-vi`](./js/packages/tu-vi) | `nhatnguyet` | จื่อเหวยโต่วซู่: 12 เรือน ความสว่างของดาว สี่การแปรเปลี่ยน Tuần และ Triệt วัยจร 10 ปีและดวงรายปี ดาวจร รูปแบบดวงพร้อมข้อความต้นฉบับจากตำรา SVG ข้อความสำหรับ LLM และชั้นที่เข้ากันได้กับ iztro |
| [`@nhatnguyet/bat-tu`](./js/packages/bat-tu) | `nhatnguyet` | ปาจื้อ: สี่เสาตามฤดูกาลย่อย ก้านแฝง สิบเทพ ดาวสัญลักษณ์ เสาวัยจร วัยจรย่อย และ SVG |
| [`@nhatnguyet/than-so-hoc`](./js/packages/than-so-hoc) | `nhatnguyet` | ศาสตร์ตัวเลขแบบพีทาโกรัส (เลขเส้นทางชีวิต เลขการแสดงออก เลขแรงปรารถนาของจิตวิญญาณ จุดสูงสุด ความท้าทาย เลขปีส่วนตัว) รองรับชื่อเวียดนามที่มีวรรณยุกต์ และ SVG |
| [`@nhatnguyet/le-hoi`](./js/packages/le-hoi) | `nhatnguyet` | เทศกาลเวียดนาม 200 งาน พร้อมวันที่ตามปฏิทินเกรกอเรียนของปีใดก็ได้ |
| [`@nhatnguyet/cli`](./js/packages/cli) | คำสั่ง `nhatnguyet` | แสดงดวงเป็นตารางในเทอร์มินัล หรือเป็น JSON หรือ SVG |
| [`@nhatnguyet/mcp`](./js/packages/mcp) | | เซิร์ฟเวอร์ MCP พร้อมเครื่องมือ 7 ตัวสำหรับผู้ช่วย AI |
| [`@nhatnguyet/widgets`](./js/packages/widgets) | | เว็บคอมโพเนนต์ 5 ตัว (ปฏิทิน ตารางรายเดือน ยามมงคล นับถอยหลังสู่ Tết ตัวแปลงวันที่) |

[`ca-kiem/`](./ca-kiem) เก็บ **กรณีทดสอบ 17,291 กรณี** (อินพุต `vao`
ผลลัพธ์ที่คาดหวัง `ra`) ที่สร้างจากเอนจินอ้างอิง ได้แก่ กรณีปฏิทิน 14,936 กรณี
ดวงจื่อเหวย 777 ดวง ดวงปาจื้อ 777 ดวง โปรไฟล์ศาสตร์ตัวเลข 600 รายการ
และเทศกาล 201 ปี ทั้ง TypeScript และ Python ผ่านครบทุกกรณีในทุกครั้งที่ push

## ชุดข้อมูล

ทั้งหมดอยู่บน [Hugging Face](https://huggingface.co/nhatnguyet) ภายใต้ CC BY 4.0
ใช้ในผลิตภัณฑ์เชิงพาณิชย์และใช้ฝึก AI ได้ โดยต้องระบุแหล่งที่มา

| ชุดข้อมูล | เนื้อหา | ขนาดหลังบีบอัด |
|---|---|---:|
| [`nhatnguyet/loi-luan-tu-vi`](https://huggingface.co/datasets/nhatnguyet/loi-luan-tu-vi) | ดวงจื่อเหวย 1,761,936 ดวงพร้อมคำทำนาย: ทุกวันตั้งแต่ปี 1900 ถึง 2100 × 12 ชั่วยาม × 2 เพศ | 9.20 GB |
| [`nhatnguyet/loi-luan-bat-tu`](https://huggingface.co/datasets/nhatnguyet/loi-luan-bat-tu) | ดวงปาจื้อ 1,761,936 ดวงพร้อมคำทำนาย ในช่วงเดียวกัน | 1.57 GB |
| [`nhatnguyet/loi-luan-than-so-hoc`](https://huggingface.co/datasets/nhatnguyet/loi-luan-than-so-hoc) | โปรไฟล์ศาสตร์ตัวเลข 73,414 รายการ หนึ่งรายการต่อหนึ่งวันเกิด | 0.08 GB |
| [`nhatnguyet/sach-co`](https://huggingface.co/datasets/nhatnguyet/sach-co) | ตำราโบราณที่เป็นสาธารณสมบัติ 412 ฉบับ (ราว 390 ผลงาน) 70.1 ล้านตัวอักษร ฉบับเต็ม | ข้อความ 151 MB, Parquet 69 MB |
| [ชุดข้อมูลปฏิทินและวัฒนธรรม 33 ชุด](https://nhatnguyet.org/en/du-lieu) | ปฏิทินจันทรคติสุริยคติปี 1900 ถึง 2100, ฤดูกาลย่อย, 64 เฮกซะแกรม, ไพ่ทาโรต์ 78 ใบ, เทศกาล 200 งาน, บทสวดบูชา 456 บท... ในรูปแบบ CSV, JSON, Parquet พร้อม [DOI](https://doi.org/10.5281/zenodo.23009396) | |

ชุดข้อมูลคำทำนายทั้งสามชุดรวมกันได้ **3,597,286 ดวง 10.85 GB หลังบีบอัด**
แบ่งเป็นสามส่วน ได้แก่ ดวงแบบมีโครงสร้างพร้อม ID ของคำทำนาย (`la-so/`, 1.50 GB)
ข้อความเต็มที่ประกอบสำเร็จแยกตามภาษา (`ghep-san/<vi|en|zh>/`, 9.31 GB)
และคลังข้อความที่เก็บคำทำนาย ข้อความจากตำราโบราณ และบทความแต่ละรายการไว้เพียงครั้งเดียว
(`kho/`, 0.04 GB) คำทำนายอ้างอิงตำราโบราณโดยระบุชื่อเล่มและบท แต่ละไฟล์คือหนึ่งปีเกิด
**เมื่อคลายการบีบอัดแล้วจะมีขนาดใหญ่มาก** (ข้อความซ้ำกันข้ามดวง
ข้อความจื่อเหวยแบบประกอบสำเร็จของปีเดียวมีขนาดราว 2.6 GB ต่อภาษา)
จึงควรอ่านแบบสตรีมหรือดาวน์โหลดทีละปี

ตำราโบราณแบ่งตามภาษา ได้แก่ ภาษาจีนคลาสสิก 337 ฉบับ ภาษาอังกฤษ 44 ฉบับ
ภาษาเวียดนาม 30 ฉบับ และภาษาเยอรมัน 1 ฉบับ แบ่งตามหัวข้อ ได้แก่
คัมภีร์อี้จิงและการพยากรณ์ 201 ศาสตร์ตัวเลข 28 ประวัติศาสตร์และวัฒนธรรมเวียดนาม 26
สามศาสตร์ (Three Arts) 26 ฮวงจุ้ย 22 ปาจื้อและโชคชะตา 20 พุทธศาสนา 20
ความเชื่อและพิธีกรรม 20 ปฏิทินและการเลือกฤกษ์ 19 โหงวเฮ้ง 14 จื่อเหวย 8
โหราศาสตร์และไพ่ทาโรต์ 6 และอื่น ๆ 2 ในจำนวนนี้ 28 ฉบับเป็นข้อความจาก OCR
และมีแฟล็ก `ocr`

```python
from datasets import load_dataset

# one birth year of Zi Wei readings in English, streamed
ds = load_dataset("nhatnguyet/loi-luan-tu-vi", data_files="ghep-san/tu-vi/en/1990.jsonl.zst", split="train", streaming=True)
row = next(iter(ds))
print(row["k"])
print(row["van"].splitlines()[0])

books = load_dataset("nhatnguyet/sach-co", split="train")
print(len(books), sum(books["characters"]))
```

```text
1990-01-01-0-nam
# Tử Vi chart | Male | Born 01/01/1990, hour Tý
412 70092009
```

## เปรียบเทียบกับไลบรารีอื่น

[iztro](https://github.com/SylarLong/iztro) และ
[lunar-javascript](https://github.com/6tail/lunar-javascript) เป็นไลบรารีที่พัฒนาอย่างพิถีพิถัน
และมีผู้ใช้อย่างแพร่หลาย ทั้งสองถูกต้องสำหรับสิ่งที่ตั้งใจทำ คือปฏิทินจีนตามเวลาปักกิ่ง (UTC+8)
ส่วนเวียดนามใช้กฎเดียวกันแต่ตามเวลาฮานอย (UTC+7) เมื่อเปรียบเทียบทุกวันตั้งแต่ปี 1900 ถึง 2100
([doi-chieu/](./doi-chieu/README.md) ทำซ้ำได้ด้วย `node chay.mjs`):

| | ผลลัพธ์ |
|---|---:|
| วันที่วันทางจันทรคติต่างจาก lunar-javascript | 2,724 จาก 73,414 |
| ปีที่วัน Tết ต่างกัน | 9 จาก 201 |
| ปีที่เดือนอธิกมาสต่างกัน | 6 จาก 201 |
| ดวงจื่อเหวย (ทุกวัน × 12 ชั่วยาม) ที่ Cục เรือนชะตา หรือดาวหลักดวงใดดวงหนึ่งต่างจาก iztro | 38,752 จาก 880,968 (4.40%) |
| ในจำนวนนี้ เกิดจากเขตเวลา (iztro ใช้เวลาปักกิ่งแม้จะตั้ง `vi-VN`) | 3.02% |
| ในจำนวนนี้ เกิดจากกฎเดือนอธิกมาส (`fixLeap` ของ iztro ซึ่งเป็นตัวเลือก) | 1.34% |
| ฤดูกาลย่อยเทียบกับ IMCCE ค่าต่างมากที่สุด: Nhat Nguyet / lunar-javascript | 0.9 นาที / 0.28 นาที |

ตัวอย่าง: เกิดวันที่ 21 มกราคม 1985 ยาม Tỵ iztro ให้ผลเป็นวันที่ 1 เดือน 12
ของปี Giáp Tý, Kim Tứ Cục, เรือนชะตาอยู่ที่ Thân ส่วน Nhat Nguyet ให้ผลเป็นวัน Tết
คือวันที่ 1 ของปี Ất Sửu, Thủy Nhị Cục, เรือนชะตาอยู่ที่ Dậu หากส่ง `country: "CN"`
Nhat Nguyet ก็ให้ผลตามปฏิทินจีนได้เช่นกัน

## สำหรับ AI

โมเดลภาษาไม่ควรคิดวันทางจันทรคติหรือตำแหน่งดาวเอาเองในหัว
มีสี่วิธีส่งตัวเลขที่ถูกต้องให้โมเดล:

- **เซิร์ฟเวอร์ MCP** พร้อมเครื่องมือ 7 ตัว (`lunar_convert`, `solar_terms`, `cast_zi_wei`,
  `cast_bazi`, `numerology`, `festivals`, `render_chart_svg`) ทำงานบนเครื่องของคุณ:
  `claude mcp add nhatnguyet -- npx -y @nhatnguyet/mcp` วิธีตั้งค่าสำหรับ Claude
  Desktop, Cursor และ VS Code: [js/packages/mcp](./js/packages/mcp/README.md)
- **Agent Skill** ที่บอกผู้ช่วยให้เรียกใช้เครื่องมือแทนการเดา: [skills/](./skills/README.md)
- **`chartToText`** (`chart_to_text` ใน Python) แปลงดวงเป็น Markdown แบบกระชับ
  สำหรับใส่ในพรอมต์:

  ```js
  import { castZiWei, chartToText } from "@nhatnguyet/tu-vi";

  const chart = castZiWei({ date: "1990-09-19", time: "20:00", gender: "male" });
  console.log(chartToText(chart, { detail: "summary" }));
  ```

  ```text
  # Zi Wei Dou Shu chart

  Computed data only, no interpretation.

  - Gender: male
  - Birth date (Gregorian): 1990-09-19 20:00
  - Birth hour: Tuất (19:00-20:59)
  - Birth date (lunar): 1990-08-01
  - Year pillar: Canh Ngọ
  - Yin-yang: Yang Male
  - Bureau: Earth Five (5)
  ...
  ```

- **ชุดข้อมูล** สำหรับการฝึกและการค้นคืนข้อมูล: [ด้านบน](#ชุดข้อมูล)

## วิดเจ็ต

<p align="center"><img src="./assets/widgets/tong-hop.png" alt="วิดเจ็ตปฏิทินของ Nhat Nguyet" width="720"></p>

โฮสต์บน nhatnguyet.org (14 วิดเจ็ต เลือกตัวเลือกได้ที่
[nhatnguyet.org/widget](https://nhatnguyet.org/widget?lang=en)):

```html
<div data-widget="lich-hom-nay" data-lang="en" data-theme="auto"></div>
<script async src="https://nhatnguyet.org/embed/w.js"></script>
```

`data-country` (ค่าเริ่มต้นคือ `VN` หรือ `CN`, `KR`, `JP`...) เปลี่ยนวิดเจ็ตปฏิทิน
ให้ใช้ปฏิทินจันทรคติของประเทศอื่น หรือจะรันวิดเจ็ต 5 ตัวในหน้าเว็บเองโดยไม่ต้องมีเซิร์ฟเวอร์ก็ได้:

```html
<script type="module" src="https://cdn.jsdelivr.net/npm/@nhatnguyet/widgets/dist/nn-widgets.js"></script>
<nn-lich-thang lang="en" theme="auto" country="VN"></nn-lich-thang>
```

วิดเจ็ตและแอตทริบิวต์ทั้งหมด: [widgets/](./widgets/README.md)

## พื้นฐานทางวิทยาศาสตร์

**วิทยาศาสตร์อยู่ที่วิธีการ ไม่ได้อยู่ที่คำทำนาย** ปฏิทินเป็นเรื่องของดาราศาสตร์
และตรวจสอบเทียบกับ NASA และ IMCCE ตลอดช่วงปี 1900 ถึง 2100:

| การตรวจสอบ | ผลลัพธ์ |
|---|---|
| จันทร์ดับเทียบกับ NASA (2,474) | ช้ากว่าเฉลี่ย 0.9 นาที มากที่สุด 3.9 นาที |
| เดือนจันทรคติที่สร้างขึ้นใหม่จากจันทร์ดับของ NASA และฤดูกาลย่อยของ IMCCE | ตรงกัน 2,459 จาก 2,461 เดือน (อีกสองเดือนคือจันทร์ดับห่างจากเที่ยงคืนไม่ถึงหนึ่งนาที) |
| ฤดูกาลย่อยเทียบกับ IMCCE (4,824) | ต่างกันเฉลี่ย 0.27 นาที มากที่สุด 0.9 นาที (ปัดเป็นนาที) และทุกฤดูกาลย่อยตรงวัน |
| เวียดนาม (UTC+7) เทียบกับจีน (UTC+8) ด้วยกฎเดียวกัน | ต่างกัน 2,814 วัน และวัน Tết ต่างกัน 10 ครั้ง |

ปฏิทินตามประเทศ: เวียดนาม UTC+7 (ค่าเริ่มต้น) จีน ไต้หวัน ฮ่องกง มาเก๊า สิงคโปร์
มาเลเซีย อินโดนีเซีย และฟิลิปปินส์ UTC+8 เกาหลีและญี่ปุ่น UTC+9 ทุกผลลัพธ์เป็นแบบ
deterministic และตรวจซ้ำได้ด้วยกรณีทดสอบ จื่อเหวยโต่วซู่ ปาจื้อ และศาสตร์ตัวเลข
เป็นกฎของสำนักดั้งเดิม ไม่ใช่วิทยาศาสตร์ที่ผ่านการพิสูจน์ อย่าใช้ประกอบการตัดสินใจ
เรื่องสุขภาพ การเงิน หรือกฎหมาย เมื่อสำนักต่าง ๆ เห็นไม่ตรงกัน (เดือนอธิกมาส
ยาม Tý ที่เริ่มตั้งแต่ 23:00) เอกสารจะระบุว่าใช้กฎใด

อ่านเพิ่มเติม: [ปฏิทินจันทรคติและฤดูกาลย่อย](https://nhatnguyet.org/en/blog/co-so-khoa-hoc-am-lich-tiet-khi) ·
[ดวงจื่อเหวย](https://nhatnguyet.org/en/blog/co-so-khoa-hoc-la-so-tu-vi) ·
[ปาจื้อ](https://nhatnguyet.org/en/blog/co-so-khoa-hoc-bat-tu) ·
[ศาสตร์ตัวเลข](https://nhatnguyet.org/en/blog/co-so-khoa-hoc-than-so-hoc) ·
[ตำราโบราณและคำทำนาย](https://nhatnguyet.org/en/blog/co-so-khoa-hoc-sach-co-loi-luan) ·
[Nhat Nguyet ตรวจสอบงานของตัวเองอย่างไร](https://nhatnguyet.org/en/blog/co-so-khoa-hoc-kiem-chung)

## ทดลองใช้และเอกสาร

- **ทดลองใช้**: [nhatnguyet.org/en/ma-nguon-mo/thu](https://nhatnguyet.org/en/ma-nguon-mo/thu) รันแพ็กเกจในเบราว์เซอร์ของคุณ
- **เอกสาร API**: [nhatnguyet.org/en/ma-nguon-mo/tai-lieu](https://nhatnguyet.org/en/ma-nguon-mo/tai-lieu) และ [docs/api-en.md](./docs/api-en.md)
- **ตัวอย่าง**: [examples/](./examples/README.md) (หน้า HTML ที่ไม่ต้อง build, Node, Python)
- **คู่มือ**: [ผูกดวง Tử Vi ด้วย JavaScript](https://nhatnguyet.org/en/blog/lap-la-so-tu-vi-bang-javascript) · [ปฏิทินจันทรคติและเทศกาลสำหรับแอปของคุณ](https://nhatnguyet.org/en/blog/lich-am-le-hoi-cho-ung-dung) · [ผู้ช่วย AI ที่อ้างอิงตำราโบราณ](https://nhatnguyet.org/en/blog/tro-ly-ai-trich-dan-sach-co) · [วิเคราะห์ข้อมูลดวงด้วย Python](https://nhatnguyet.org/en/blog/phan-tich-du-lieu-la-so-bang-python)

## ย้ายมาจาก iztro

เปลี่ยน import เพียงบรรทัดเดียว ผลลัพธ์ยังคงโครงสร้าง `FunctionalAstrolabe`
และภาษาแสดงผลทั้งหกภาษาของ iztro แต่คำนวณบนปฏิทินเวียดนาม:

```diff
- import { astro } from "iztro";
+ import { astro } from "@nhatnguyet/tu-vi/iztro";
```

ไม่มีเมธอดอย่าง `astrolabe.palace()` ให้ใช้ (ชั้นนี้มีเฉพาะข้อมูล)
รายละเอียด: [docs/chuyen-tu-iztro.md](./docs/chuyen-tu-iztro.md)

## สัญญาอนุญาตและการระบุแหล่งที่มา

| ส่วน | สัญญาอนุญาต |
|---|---|
| โค้ด | [MIT](./LICENSE) |
| ข้อมูล คำทำนาย กรณีทดสอบ | [CC BY 4.0](./DATA-LICENSE): ใช้เชิงพาณิชย์และใช้ฝึก AI ได้ โดยต้องระบุแหล่งที่มา |
| ตำราโบราณ | ต้นฉบับเป็นสาธารณสมบัติ ส่วนการแปลงเป็นดิจิทัลและการทำความสะอาดข้อความอยู่ภายใต้ CC BY 4.0 |

ข้อความระบุแหล่งที่มา: `Data: Nhat Nguyet (nhatnguyet.org)` พร้อมลิงก์เมื่อทำได้
ชื่อและโลโก้ Nhat Nguyet ไม่อยู่ภายใต้สัญญาอนุญาตเหล่านี้

```bibtex
@software{nhatnguyet_2026,
  author = {{Nhat Nguyet}},
  title  = {Nhat Nguyet: open source code and data for Zi Wei Dou Shu, BaZi and numerology},
  year   = {2026},
  url    = {https://nhatnguyet.org/en/ma-nguon-mo},
  doi    = {10.5281/zenodo.24358014}
}
```

## คำถามที่พบบ่อย

<details>
<summary><b>ทำไมปฏิทินจันทรคติเวียดนามจึงต่างจากปฏิทินจีน</b></summary>

กฎเดียวกัน แต่นาฬิกาต่างกัน เดือนใหม่เริ่มในวันที่เกิดจันทร์ดับ และวันนั้นตัดสินตามเวลาท้องถิ่น
เมื่อจันทร์ดับเกิดระหว่าง 16:00 ถึง 17:00 UT ที่ฮานอยยังไม่ถึงเที่ยงคืน แต่ที่ปักกิ่งเลยเที่ยงคืนไปแล้ว
เดือนจึงเริ่มที่เวียดนามเร็วกว่าหนึ่งวัน Tết ปี 1985 ห่างกันถึงหนึ่งเดือนเต็ม (21 มกราคมที่เวียดนาม
และ 20 กุมภาพันธ์ที่จีน) เพราะเดือนอธิกมาสตกอยู่คนละปี
</details>

<details>
<summary><b>ยาม Tý คือช่วงไหน และคนที่เกิดเวลา 23:30 ใช้วันที่ใด</b></summary>

ยาม Tý คือ 23:00 ถึง 00:59 จื่อเหวยใช้วันที่ตามที่คุณป้อน (ตำราบางเล่มเลื่อนไปเป็นวันถัดไป
หากต้องการทำตามตำราเหล่านั้นให้ป้อนวันถัดไป) ส่วนปาจื้อเปลี่ยนเสาวันตอน 23:00
ทั้งสองกฎระบุไว้ใน `notes` ของดวง
</details>

<details>
<summary><b>เสาเดือนของปาจื้อยึดตามเดือนจันทรคติหรือฤดูกาลย่อย</b></summary>

ยึดตามฤดูกาลย่อย ปีเปลี่ยนที่ Lập Xuân (เริ่มฤดูใบไม้ผลิ) และเดือนเปลี่ยนที่ฤดูกาลย่อยต้นเดือนแต่ละช่วง
หากใช้เดือนจันทรคติแทน เสาเดือนจะต่างออกไปในราวหนึ่งในสี่ของทุกวัน (24.3% ในช่วงปี 1900 ถึง 2100)
</details>

<details>
<summary><b>นำข้อมูลไปฝึกโมเดล AI ได้ไหม</b></summary>

ได้ รวมถึงการใช้เชิงพาณิชย์ ภายใต้ CC BY 4.0 โดยระบุแหล่งที่มาว่า "Data: Nhat Nguyet
(nhatnguyet.org)"
</details>

<details>
<summary><b>ศาสตร์ตัวเลขจัดการชื่อภาษาเวียดนามอย่างไร</b></summary>

ตัดวรรณยุกต์และเครื่องหมายกำกับเสียงออกก่อน ("Đ" นับเป็น "D") แล้วจึงใช้ตารางตัวอักษรแบบพีทาโกรัส
เลขมาสเตอร์ 11, 22 และ 33 คงไว้ตามเดิม
</details>

## การมีส่วนร่วม

รายงานบั๊กที่มีแหล่งอ้างอิง (ชื่อตำราและบท หรือข้อมูลดาราศาสตร์) มีประโยชน์ที่สุด
ดู [CONTRIBUTING.md](./CONTRIBUTING.md)

**ความท้าทายในการพอร์ต**: เขียนเอนจินด้วยภาษาอื่น (Go, Rust, Dart, Swift, C#...)
และผ่านกรณีทดสอบทั้ง 17,291 กรณีใน [`ca-kiem/`](./ca-kiem) อ่าน `vao` แล้วเทียบกับ `ra`
กติกาอยู่ใน [CONTRIBUTING.md](./CONTRIBUTING.md#port-challenge)

เว็บไซต์: [nhatnguyet.org](https://nhatnguyet.org) · อีเมล: lienhe@nhatnguyet.org

<p align="center"><sub>ข้อมูล: Nhat Nguyet (nhatnguyet.org) · โค้ด MIT · ข้อมูล CC BY 4.0</sub></p>
