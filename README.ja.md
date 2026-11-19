<h1 align="center">Nhat Nguyet</h1>

<p align="center">
  <b>NASA と IMCCE で検証したベトナム旧暦に基づく紫微斗数、四柱推命、数秘術。古典を引用する命盤解釈 360万件と、どの移植版でも検証に使える共通テストベクター 17,291件を収録。</b><br>
  JavaScript · Python · CLI · MCP サーバー · ウェブウィジェット · English, Tiếng Việt, 中文
</p>

<p align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="./assets/la-so-tu-vi-toi.svg">
    <img src="./assets/la-so-tu-vi.svg" alt="ライブラリで描いた紫微斗数の命盤" width="32%">
  </picture>
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="./assets/la-so-bat-tu-toi.svg">
    <img src="./assets/la-so-bat-tu.svg" alt="ライブラリで描いた四柱推命の命盤" width="32%">
  </picture>
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="./assets/than-so-hoc-toi.svg">
    <img src="./assets/than-so-hoc.svg" alt="ライブラリで描いた数秘術のプロフィール" width="32%">
  </picture>
</p>

<p align="center">
  <a href="./README.md">English</a> · <a href="./README.vi.md">Tiếng Việt</a> · <a href="./README.zh.md">中文</a> · <b>日本語</b> · <a href="./README.ko.md">한국어</a> · <a href="./README.fr.md">Français</a> · <a href="./README.th.md">ไทย</a>
  <br>
  <a href="https://nhatnguyet.org/en/ma-nguon-mo/thu">プレイグラウンド</a> ·
  <a href="https://nhatnguyet.org/en/ma-nguon-mo/tai-lieu">ドキュメント</a> ·
  <a href="https://huggingface.co/nhatnguyet">Hugging Face</a> ·
  <a href="https://nhatnguyet.org/en/ma-nguon-mo">プロジェクトページ</a>
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/@nhatnguyet/tu-vi"><img alt="npm" src="https://img.shields.io/npm/v/@nhatnguyet/tu-vi.svg?label=npm"></a>
  <a href="https://pypi.org/project/nhatnguyet/"><img alt="PyPI" src="https://img.shields.io/pypi/v/nhatnguyet.svg"></a>
  <a href="./ca-kiem"><img alt="テストベクター：17,291件" src="https://img.shields.io/badge/test%20vectors-17%2C291-2e7d32.svg"></a>
  <a href="https://github.com/Nhat-Nguyet/nhatnguyet/actions/workflows/kiem.yml"><img alt="自動チェック" src="https://github.com/Nhat-Nguyet/nhatnguyet/actions/workflows/kiem.yml/badge.svg?branch=main"></a>
  <a href="./LICENSE"><img alt="コード：MIT" src="https://img.shields.io/badge/code-MIT-1f6f6b.svg"></a>
  <a href="./DATA-LICENSE"><img alt="データ：CC BY 4.0" src="https://img.shields.io/badge/data-CC%20BY%204.0-1f6f6b.svg"></a>
  <a href="https://doi.org/10.5281/zenodo.24358014"><img alt="DOI" src="https://zenodo.org/badge/DOI/10.5281/zenodo.24358014.svg"></a>
</p>

## クイックスタート

**JavaScript、TypeScript**（Node 18 以上、ブラウザ）

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

**Python**（3.9 以上、標準ライブラリのみ）：結果は同じで、SVG もバイト単位で一致します。

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

**コマンドライン**：`npx` を使えばインストール不要です。`pip install nhatnguyet` の後なら `nhatnguyet ...` で実行できます。

```bash
npx @nhatnguyet/cli ziwei 1990-09-19 20:00 male --year 2026
```

<details>
<summary>出力（十二宮をグリッドで表示し、続いて流年、大限、格局）</summary>

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

ほかのコマンド：`bazi`、`lunar`、`solar`、`terms`、`numerology`、`festivals`。オプションは `--lang vi|zh`、`--json`、`--svg chart.svg`。すべてのオプションを載せた英語版 API リファレンス：[docs/api-en.md](./docs/api-en.md)。

## 目次

1. [収録内容](#収録内容)
2. [データセット](#データセット)
3. [他のライブラリとの比較](#他のライブラリとの比較)
4. [AI での利用](#ai-での利用)
5. [ウィジェット](#ウィジェット)
6. [科学的根拠](#科学的根拠)
7. [プレイグラウンドとドキュメント](#プレイグラウンドとドキュメント)
8. [iztro からの移行](#iztro-からの移行)
9. [ライセンスとクレジット表記](#ライセンスとクレジット表記)
10. [よくある質問](#よくある質問)
11. [貢献](#貢献)

## 収録内容

どのライブラリも、[nhatnguyet.org](https://nhatnguyet.org) と Nhat Nguyet アプリを動かすエンジンをフィールド単位で再現します。ネットワーク通信は行わず、サードパーティの依存関係もありません。

| パッケージ | Python | 機能 |
|---|---|---|
| [`@nhatnguyet/am-lich`](./js/packages/am-lich) | `nhatnguyet` | ベトナム、中国、韓国、日本ほか7地域の旧暦と新暦の変換、干支、分単位の二十四節気、二十八宿、納音 |
| [`@nhatnguyet/tu-vi`](./js/packages/tu-vi) | `nhatnguyet` | 紫微斗数：十二宮、星の廟旺利陥、四化、Tuần と Triệt（旬空と截空）、大限と流年、流曜、古典の原文を添えた格局、SVG、LLM 向けテキスト、iztro 互換レイヤー |
| [`@nhatnguyet/bat-tu`](./js/packages/bat-tu) | `nhatnguyet` | 四柱推命：節気による四柱、蔵干、通変星（十神）、神殺、大運、小運、SVG |
| [`@nhatnguyet/than-so-hoc`](./js/packages/than-so-hoc) | `nhatnguyet` | ピタゴラス式数秘術（ライフパス数、ディスティニー数、ソウル数、ピナクル、チャレンジ、パーソナルイヤー）、声調記号付きのベトナム語氏名に対応、SVG |
| [`@nhatnguyet/le-hoi`](./js/packages/le-hoi) | `nhatnguyet` | ベトナムの祭礼 200件と、任意の年の新暦の日付 |
| [`@nhatnguyet/cli`](./js/packages/cli) | `nhatnguyet` コマンド | 命盤をターミナルのグリッド、JSON、SVG で出力 |
| [`@nhatnguyet/mcp`](./js/packages/mcp) | | AI アシスタント向けのツール 7個を備えた MCP サーバー |
| [`@nhatnguyet/widgets`](./js/packages/widgets) | | ウェブコンポーネント 5個（カレンダー、月表示、吉時、テトのカウントダウン、日付変換） |

[`ca-kiem/`](./ca-kiem) には、参照エンジンが生成した **テストベクター 17,291件**（入力 `vao`、期待される出力 `ra`）が入っています。内訳は暦 14,936件、紫微斗数の命盤 777件、四柱推命の命盤 777件、数秘術のプロフィール 600件、祭礼の年 201件です。TypeScript 版と Python 版は、プッシュのたびにそのすべてに合格しています。

## データセット

すべて [Hugging Face](https://huggingface.co/nhatnguyet) で CC BY 4.0 として公開しています。クレジットを表記すれば、商用製品にも AI の学習にも使えます。

| データセット | 内容 | 圧縮後のサイズ |
|---|---|---:|
| [`nhatnguyet/loi-luan-tu-vi`](https://huggingface.co/datasets/nhatnguyet/loi-luan-tu-vi) | 解釈付きの紫微斗数の命盤 1,761,936件：1900年から2100年の毎日 × 12時辰 × 2つの性別 | 9.20 GB |
| [`nhatnguyet/loi-luan-bat-tu`](https://huggingface.co/datasets/nhatnguyet/loi-luan-bat-tu) | 解釈付きの四柱推命の命盤 1,761,936件、範囲は同じ | 1.57 GB |
| [`nhatnguyet/loi-luan-than-so-hoc`](https://huggingface.co/datasets/nhatnguyet/loi-luan-than-so-hoc) | 数秘術のプロフィール 73,414件、生年月日ごとに1件 | 0.08 GB |
| [`nhatnguyet/sach-co`](https://huggingface.co/datasets/nhatnguyet/sach-co) | パブリックドメインの古典 412点（約390作品）、7,010万字、全文 | テキスト 151 MB、Parquet 69 MB |
| [暦と文化のデータセット 33件](https://nhatnguyet.org/en/du-lieu) | 1900年から2100年の太陰太陽暦、節気、六十四卦、タロット78枚、祭礼200件、祭祀祈祷文456篇など。CSV、JSON、Parquet、[DOI](https://doi.org/10.5281/zenodo.23009396) 付き | |

3つの解釈データセットは合計 **3,597,286件の命盤、圧縮後 10.85 GB** で、3つの部分からなります。解釈 ID 付きの構造化命盤（`la-so/`、1.50 GB）、言語ごとに組み立て済みの全文（`ghep-san/<vi|en|zh>/`、9.31 GB）、そして各解釈、古典の引用、記事を1回だけ格納するテキストストア（`kho/`、0.04 GB）です。解釈は書名と章を明記して古典を引用します。ファイルは生まれ年ごとに1つです。**展開するとかなり大きくなります**（テキストが命盤をまたいで繰り返されるためで、紫微斗数の組み立て済みテキストは 1年分で1言語あたり約 2.6 GB）。ストリーミングで読むか、1年ずつダウンロードしてください。

古典の内訳は、漢文 337点、英語 44点、ベトナム語 30点、ドイツ語 1点です。分野別では易経と占術 201点、数秘術 28点、ベトナムの歴史と文化 26点、三式 26点、風水 22点、四柱推命と命理 20点、仏教 20点、信仰と儀礼 20点、暦と日選び 19点、人相 14点、紫微斗数 8点、占星術とタロット 6点、その他 2点。うち 28点は OCR テキストで、`ocr` フラグが付いています。

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

## 他のライブラリとの比較

[iztro](https://github.com/SylarLong/iztro) と [lunar-javascript](https://github.com/6tail/lunar-javascript) は丁寧に作られ、広く使われているライブラリです。どちらも実装している範囲、つまり北京時間（UTC+8）による中国の暦としては正確です。ベトナムは同じ規則をハノイ時間（UTC+7）で使います。1900年から2100年の毎日を比較した結果は次のとおりです（[doi-chieu/](./doi-chieu/README.md)、`node chay.mjs` で再現できます）。

| | 結果 |
|---|---:|
| lunar-javascript と旧暦の日付が異なる日 | 73,414日中 2,724日 |
| テトの日付が異なる年 | 201年中 9年 |
| 閏月が異なる年 | 201年中 6年 |
| iztro と Cục、命宮、主星のいずれかが異なる紫微斗数の命盤（毎日 × 12時辰） | 880,968件中 38,752件（4.40%） |
| うちタイムゾーンによるもの（iztro は `vi-VN` でも北京時間を使う） | 3.02% |
| うち閏月の規則によるもの（iztro の `fixLeap`、オプション） | 1.34% |
| IMCCE と比べた節気の最大差：Nhat Nguyet / lunar-javascript | 0.9分 / 0.28分 |

例：1985年1月21日、Tỵ の刻（巳の刻）生まれ。iztro では Giáp Tý 年の12月1日、Kim Tứ Cục、命宮は Thân になります。Nhat Nguyet ではテト（Tết）、つまり Ất Sửu 年の元日で、Thủy Nhị Cục、命宮は Dậu です。`country: "CN"` を渡せば、Nhat Nguyet でも中国の暦で計算できます。

## AI での利用

言語モデルに旧暦の日付や星の位置を頭の中で割り出させるべきではありません。数値を渡す方法は4つあります。

- **MCP サーバー**：ツール 7個（`lunar_convert`、`solar_terms`、`cast_zi_wei`、`cast_bazi`、`numerology`、`festivals`、`render_chart_svg`）を備え、ローカルで動作します。`claude mcp add nhatnguyet -- npx -y @nhatnguyet/mcp`。Claude Desktop、Cursor、VS Code での設定方法：[js/packages/mcp](./js/packages/mcp/README.md)。
- **Agent Skill**：推測せずにツールを呼び出すようアシスタントに指示します：[skills/](./skills/README.md)。
- **`chartToText`**（Python では `chart_to_text`）：命盤をプロンプト用の簡潔な Markdown に変換します。

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

- **データセット**：学習と検索拡張に。[上記](#データセット)を参照してください。

## ウィジェット

<p align="center"><img src="./assets/widgets/tong-hop.png" alt="Nhat Nguyet のカレンダーウィジェット" width="720"></p>

nhatnguyet.org でホストしています（ウィジェット 14種。オプションは [nhatnguyet.org/widget](https://nhatnguyet.org/widget?lang=en) で選べます）。

```html
<div data-widget="lich-hom-nay" data-lang="en" data-theme="auto"></div>
<script async src="https://nhatnguyet.org/embed/w.js"></script>
```

`data-country`（既定は `VN`、ほかに `CN`、`KR`、`JP` など）を指定すると、カレンダー系のウィジェットが他国の旧暦に切り替わります。サーバーを使わず、そのうち 5種をページ内で直接動かすこともできます。

```html
<script type="module" src="https://cdn.jsdelivr.net/npm/@nhatnguyet/widgets/dist/nn-widgets.js"></script>
<nn-lich-thang lang="en" theme="auto" country="VN"></nn-lich-thang>
```

すべてのウィジェットと属性：[widgets/](./widgets/README.md)。

## 科学的根拠

**科学性は方法にあり、予測にはありません。** 暦は天文学であり、1900年から2100年にわたって NASA と IMCCE に照合しています。

| 検証項目 | 結果 |
|---|---|
| NASA と比べた朔（2,474回） | 平均 0.9分遅れ、最大 3.9分 |
| NASA の朔と IMCCE の節気から再構築した旧暦の月 | 2,461か月中 2,459か月が一致（残る2か月は朔が真夜中から1分以内） |
| IMCCE と比べた節気（4,824回） | 平均 0.27分のずれ、最大 0.9分（分単位に丸め）、すべての節気が正しい日付 |
| ベトナム（UTC+7）と中国（UTC+8）、同じ規則 | 2,814日とテトの日付 10回が異なる |

国別の暦：ベトナムは UTC+7（既定）。中国、台湾、香港、マカオ、シンガポール、マレーシア、インドネシア、フィリピンは UTC+8。韓国と日本は UTC+9。すべての結果は決定的で、テストベクターで再検証できます。紫微斗数、四柱推命、数秘術は伝統的な流派の規則であり、科学的に検証されたものではありません。健康、金銭、法律に関する判断には使わないでください。流派によって説が分かれる箇所（閏月、23時から始まる Tý の刻）は、どの規則を使っているかをドキュメントに明記しています。

さらに詳しく：[旧暦と二十四節気](https://nhatnguyet.org/en/blog/co-so-khoa-hoc-am-lich-tiet-khi) · [紫微斗数の命盤](https://nhatnguyet.org/en/blog/co-so-khoa-hoc-la-so-tu-vi) · [四柱推命](https://nhatnguyet.org/en/blog/co-so-khoa-hoc-bat-tu) · [数秘術](https://nhatnguyet.org/en/blog/co-so-khoa-hoc-than-so-hoc) · [古典と解釈](https://nhatnguyet.org/en/blog/co-so-khoa-hoc-sach-co-loi-luan) · [Nhat Nguyet の検証方法](https://nhatnguyet.org/en/blog/co-so-khoa-hoc-kiem-chung)。

## プレイグラウンドとドキュメント

- **プレイグラウンド**：[nhatnguyet.org/en/ma-nguon-mo/thu](https://nhatnguyet.org/en/ma-nguon-mo/thu)。ブラウザ上でパッケージを動かせます。
- **API ドキュメント**：[nhatnguyet.org/en/ma-nguon-mo/tai-lieu](https://nhatnguyet.org/en/ma-nguon-mo/tai-lieu) と [docs/api-en.md](./docs/api-en.md)。
- **サンプル**：[examples/](./examples/README.md)（ビルド不要の HTML ページ、Node、Python）。
- **ガイド**：[JavaScript で Tử Vi の命盤を作る](https://nhatnguyet.org/en/blog/lap-la-so-tu-vi-bang-javascript) · [アプリのための旧暦と祭礼](https://nhatnguyet.org/en/blog/lich-am-le-hoi-cho-ung-dung) · [古典を引用する AI アシスタント](https://nhatnguyet.org/en/blog/tro-ly-ai-trich-dan-sach-co) · [Python で命盤データを分析する](https://nhatnguyet.org/en/blog/phan-tich-du-lieu-la-so-bang-python)。

## iztro からの移行

import を1行変えるだけです。結果は iztro の `FunctionalAstrolabe` の形と6つの表示言語をそのまま保ち、ベトナム暦で計算されます。

```diff
- import { astro } from "iztro";
+ import { astro } from "@nhatnguyet/tu-vi/iztro";
```

`astrolabe.palace()` などのメソッドは提供していません（このレイヤーはデータのみです）。詳細：[docs/chuyen-tu-iztro.md](./docs/chuyen-tu-iztro.md)。

## ライセンスとクレジット表記

| 対象 | ライセンス |
|---|---|
| コード | [MIT](./LICENSE) |
| データ、解釈、テストベクター | [CC BY 4.0](./DATA-LICENSE)：商用利用と AI 学習が可能、クレジット表記が必須 |
| 古典 | 原文はパブリックドメイン。デジタル化と校訂は CC BY 4.0 |

クレジット表記：`Data: Nhat Nguyet (nhatnguyet.org)`。可能であればリンクを添えてください。Nhat Nguyet の名称とロゴは、これらのライセンスの対象外です。

```bibtex
@software{nhatnguyet_2026,
  author = {{Nhat Nguyet}},
  title  = {Nhat Nguyet: open source code and data for Zi Wei Dou Shu, BaZi and numerology},
  year   = {2026},
  url    = {https://nhatnguyet.org/en/ma-nguon-mo},
  doi    = {10.5281/zenodo.24358014}
}
```

## よくある質問

<details>
<summary><b>ベトナムの旧暦はなぜ中国の旧暦と違うのですか？</b></summary>

規則は同じで、時計が違います。月は朔の日に始まり、その日付は現地時間で決まります。朔が世界時（UT）の16時から17時の間に起きると、ハノイでは真夜中前、北京では真夜中過ぎになるため、ベトナムでは月が1日早く始まります。1985年のテトは丸1か月ずれています（ベトナムは1月21日、中国は2月20日）。閏月の入る年が異なるためです。
</details>

<details>
<summary><b>Tý の刻とは何時で、23時30分生まれはどの日付を使いますか？</b></summary>

Tý の刻は 23:00 から 00:59 までです。紫微斗数では入力した日付をそのまま使います（翌日に移す書物もあり、それに従う場合は翌日の日付を入力してください）。四柱推命では日柱が 23:00 で切り替わります。どちらも命盤の `notes` に記載されます。
</details>

<details>
<summary><b>四柱推命の月柱は旧暦の月と節気のどちらに従いますか？</b></summary>

節気に従います。年は Lập Xuân（立春）で、月は各節気の節入りで切り替わります。代わりに旧暦の月を使うと、全日数のおよそ4分の1（1900年から2100年で 24.3%）で月柱が変わります。
</details>

<details>
<summary><b>このデータを AI モデルの学習に使えますか？</b></summary>

はい、商用を含めて CC BY 4.0 のもとで使えます。「Data: Nhat Nguyet (nhatnguyet.org)」とクレジットを表記してください。
</details>

<details>
<summary><b>数秘術ではベトナム語の氏名をどう扱いますか？</b></summary>

声調記号などを取り除き（「Đ」は「D」として数えます）、そのうえでピタゴラス式の文字表を当てはめます。マスターナンバー 11、22、33 はそのまま残します。
</details>

## 貢献

出典（書名と章、または天文データ）を添えた不具合報告が最も役立ちます。[CONTRIBUTING.md](./CONTRIBUTING.md) を参照してください。

**移植チャレンジ**：エンジンを別の言語（Go、Rust、Dart、Swift、C# など）で書き、[`ca-kiem/`](./ca-kiem) のテストベクター 17,291件すべてに合格させてください。`vao` を読み込み、`ra` と比較します。ルールは [CONTRIBUTING.md](./CONTRIBUTING.md#port-challenge) にあります。

ウェブサイト：[nhatnguyet.org](https://nhatnguyet.org) · メール：lienhe@nhatnguyet.org

<p align="center"><sub>データ：Nhat Nguyet (nhatnguyet.org) · コード MIT · データ CC BY 4.0</sub></p>
