<p align="center">
  <a href="https://nhatnguyet.org/en/ma-nguon-mo">
    <picture>
      <source media="(prefers-color-scheme: dark)" srcset="./assets/banner-toi.svg">
      <img src="./assets/banner-sang.svg" alt="Nhat Nguyet" width="720">
    </picture>
  </a>
</p>

<h1 align="center">Nhat Nguyet：紫微斗数、四柱推命、数秘術のオープンソースライブラリとデータセット</h1>

<p align="center">
  <b>紫微斗数（Tử Vi）と四柱推命（Bát Tự、八字）の命盤作成、数秘術の計算、ベトナム旧暦と中国旧暦の変換、ベトナムの祭祀祈祷文の検索ができる無料のオープンソースライブラリ。JavaScript と Python に対応。</b><br>
  解釈済み命盤 360万件 · 古典 60点以上 · ベトナム旧暦は NASA と照合済み
</p>

<p align="center">
  <a href="./LICENSE"><img alt="コード：MIT" src="https://img.shields.io/badge/code-MIT-1f6f6b.svg"></a>
  <a href="./DATA-LICENSE"><img alt="データ：CC BY 4.0" src="https://img.shields.io/badge/data-CC%20BY%204.0-1f6f6b.svg"></a>
  <a href="./ca-kiem"><img alt="テストケース：17,291 件合格" src="https://img.shields.io/badge/test%20cases-17%2C291%20passing-2e7d32.svg"></a>
  <a href="https://github.com/Nhat-Nguyet/nhatnguyet/actions/workflows/kiem.yml"><img alt="自動チェック" src="https://github.com/Nhat-Nguyet/nhatnguyet/actions/workflows/kiem.yml/badge.svg?branch=main"></a>
  <a href="https://doi.org/10.5281/zenodo.24358014"><img alt="DOI" src="https://zenodo.org/badge/DOI/10.5281/zenodo.24358014.svg"></a>
</p>

<p align="center">
  <a href="./README.md">English</a> · <a href="./README.vi.md">Tiếng Việt</a> · <a href="./README.zh.md">中文</a> · <b>日本語</b> · <a href="./README.ko.md">한국어</a> · <a href="./README.fr.md">Français</a> · <a href="./README.th.md">ไทย</a>
  <br>
  <a href="https://nhatnguyet.org/en/ma-nguon-mo">プロジェクトページ</a> ·
  <a href="https://nhatnguyet.org/en/du-lieu">オープンデータ</a> ·
  <a href="https://huggingface.co/nhatnguyet">Hugging Face</a> ·
  <a href="https://nhatnguyet.org/en/blog">チュートリアル</a>
</p>

---

## 目次

1. [概要](#概要)
2. [Nhat Nguyet を選ぶ理由](#nhat-nguyet-を選ぶ理由)
3. [リポジトリの内容](#リポジトリの内容)
4. [クイックスタート](#クイックスタート)
5. [活用例](#活用例)
6. [科学的根拠](#科学的根拠)
7. [ロードマップ](#ロードマップ)
8. [ライセンスとクレジット表記](#ライセンスとクレジット表記)
9. [よくある質問](#よくある質問)
10. [貢献と連絡先](#貢献と連絡先)

## 概要

術数と民間信仰に関するオープンソースのコードとデータセットです。**ベトナムに根ざし、東洋と西洋の両方の伝統を扱います**：紫微斗数（Tử Vi）、四柱推命（Bát Tự）、数秘術、易経、タロット、占星術、風水、日選び、4か国の旧暦、祭礼、祭祀祈祷文。すべての結果は、[nhatnguyet.org](https://nhatnguyet.org) と iOS、Android 版 Nhat Nguyet アプリを動かす計算エンジンとフィールド単位で一致します。

| 解釈済み命盤 | 古典 | 解説記事 | オープンデータセット | テストケース |
|:---:|:---:|:---:|:---:|:---:|
| **360万件** | **60点以上**<br>730万字 | **510本**<br>要約、FAQ | **33件**<br>DOI 付き | **17,291件**<br>すべて合格 |
| 祭祀祈祷文 **456篇** | 祭礼 **200件** | 旧暦 **4か国** | **3**言語 | 依存関係 **0** |

## Nhat Nguyet を選ぶ理由

| | |
|---|---|
| **ベトナム時間で計算する暦** | 1900年から2100年のうち 2,814日は、北京時間で計算した暦と旧暦の日付が異なります。テト（Tết、旧正月）の日付は 10年で異なります。国ごとの暦を選択でき、既定はベトナムです。 |
| **検証可能** | 朔の時刻は NASA との差が平均 1.1分、二十四節気の時刻は IMCCE との差が平均 4.2分です。TypeScript 版と Python 版は、17,291件のケースで参照エンジンの全フィールドを再現します。 |
| **出典に基づく** | 古典の引用にはすべて書名と章を明記し、原文は刊本と照合しています。流派によって説が分かれる箇所は、黙って一方を選ばずにその旨を記します。 |
| **3言語** | 星名、用語、解釈をベトナム語、英語、中国語で完全収録しています。 |
| **端末内で動作** | 依存関係なし、ネットワーク通信なし、データの外部送信なし。ブラウザ、Node、Python で動作します。 |

## リポジトリの内容

### ライブラリ

| 分野 | TypeScript（npm） | Python（`pip install nhatnguyet`） | 機能 |
|---|---|---|---|
| 旧暦 | [`@nhatnguyet/am-lich`](./js/packages/am-lich) | `nhatnguyet.am_lich` | 4か国の旧暦と新暦の変換、干支、分単位の二十四節気、二十八宿（Nhị Thập Bát Tú）、納音（nạp âm） |
| 紫微斗数 | [`@nhatnguyet/tu-vi`](./js/packages/tu-vi) | `nhatnguyet.tu_vi` | 十二宮の命盤、星の廟旺利陥、四化（Tứ Hóa）、旬空と截空（Tuần、Triệt）、大限、流年、流曜、格局 |
| 四柱推命 | [`@nhatnguyet/bat-tu`](./js/packages/bat-tu) | `nhatnguyet.bat_tu` | 節気による四柱、蔵干、通変星（十神）、神殺（thần sát）、大運、小運（tiểu vận） |
| 数秘術 | [`@nhatnguyet/than-so-hoc`](./js/packages/than-so-hoc) | `nhatnguyet.than_so_hoc` | ライフパス数、ディスティニー数、ソウル数、ピナクル、チャレンジ、パーソナルイヤー。声調記号付きのベトナム語氏名に対応 |
| 祭礼 | [`@nhatnguyet/le-hoi`](./js/packages/le-hoi) | `nhatnguyet.le_hoi` | 200件の祭礼、毎年の旧暦から新暦への日付変換 |

### データセット

| データセット | 内容 | 形式 | サイズ |
|---|---|---|---|
| 命盤ごとの解釈 | 1900年から2100年のすべての生年月日に対する紫微斗数と四柱推命（12の時辰、2つの性別）。生年月日ごとの数秘術 | zstd 圧縮の JSON Lines、生まれ年ごとに1ファイル | 圧縮後 約11 GB |
| ↳ 構造化命盤 | 星の配置、四化、四柱、各種の数、解釈 ID 付き | `la-so/<topic>/<year>` | 約1.6 GB |
| ↳ 言語別の結合済みテキスト | 1ファイル1言語の全文、AI 学習向け | `ghep-san/<topic>/<vi\|en\|zh>/<year>` | 約9 GB |
| ↳ テキストストア | 解釈、古典の原文、関連資料。各段落は ID 付きで1回だけ格納 | `kho/` | < 0.3 GB |
| 古典 | パブリックドメインの 60点以上、全文 | プレーンテキスト | 約20 MB |
| 暦、祭礼、祭祀祈祷文 | 33件のデータセット：1900年から2100年の太陰太陽暦、六十四卦、タロット78枚、節気、祭祀祈祷文、儀礼など | CSV、JSON、Parquet | 118 MB |

### テストケース

[`ca-kiem/`](./ca-kiem)：参照エンジンから生成した入力と正解の組 17,291件。4か国の旧暦、祭礼、数秘術、四柱推命、紫微斗数を対象とします。どの言語でライブラリを書いても自分で検証できます：`vao`（入力）を読み込み、`ra`（期待される出力）と比較してください。

## クイックスタート

**TypeScript、JavaScript**

```bash
npm i @nhatnguyet/tu-vi @nhatnguyet/am-lich
```

```ts
import { lapLaSoTuVi, nhanDienCachCuc } from "@nhatnguyet/tu-vi";
import { solarToLunar, MUI_GIO_THEO_NUOC } from "@nhatnguyet/am-lich";

const laSo = lapLaSoTuVi("", "Nam", 19, 9, 1990, 10); // 1990年9月19日生まれ、戌の刻（19時から21時）
console.log(laSo.tenCuc, nhanDienCachCuc(laSo).map((c) => c.ten));

solarToLunar(21, 1, 1985);                       // ベトナム暦：テトの元日
solarToLunar(21, 1, 1985, MUI_GIO_THEO_NUOC.CN); // 中国暦：旧暦12月1日
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

**データセット**

```python
from datasets import load_dataset
ds = load_dataset("nhatnguyet/loi-luan-tu-vi", data_files="ghep-san/tu-vi/en/1990.jsonl.zst")
```

## 活用例

| 目的 | 使うもの | ガイド |
|---|---|---|
| **命盤のウェブサイトとアプリ** | 紫微斗数、四柱推命、数秘術のライブラリ | [JavaScript で紫微斗数の命盤を作る](https://nhatnguyet.org/en/blog/lap-la-so-tu-vi-bang-javascript) |
| **カレンダーとリマインダーのアプリ** | 旧暦、祭礼、祭祀祈祷文 | [アプリに旧暦、祭礼、命日を組み込む](https://nhatnguyet.org/en/blog/lich-am-le-hoi-cho-ung-dung) |
| **AI 学習** | 言語別の結合済み解釈 | [紫微斗数の命盤データで AI を学習させる](https://nhatnguyet.org/en/blog/huan-luyen-ai-voi-du-lieu-tu-vi) |
| **出典を示す AI アシスタント** | 古典原文ストア、関連資料 | [古典を引用する AI アシスタント](https://nhatnguyet.org/en/blog/tro-ly-ai-trich-dan-sach-co) |
| **データ分析** | 構造化命盤 | [格局はどれほど珍しいか](https://nhatnguyet.org/en/blog/phan-tich-du-lieu-la-so-bang-python) |
| **暦と文化の研究** | 4か国の旧暦、祭礼、古典 | [ベトナム旧暦は中国の旧暦と同じではない](https://nhatnguyet.org/en/blog/am-lich-viet-nam-khac-trung-quoc) |
| **自作ライブラリのテスト** | テストケース | [共通テストケースで検証する](https://nhatnguyet.org/en/blog/kiem-thu-vien-bang-bo-ca-kiem) |

ほかにも：教育（命盤作成を一歩ずつ解説）、翻訳（3言語の用語対照）、コンテンツと報道（検証可能な数値）に使えます。

## 科学的根拠

**科学性は方法にあり、予測にはありません。** 暦は天文計算であり、NASA と IMCCE に照合しています。すべての結果は決定的で、テストケースで再検証できます。紫微斗数、四柱推命、数秘術、その他の術数は特定の流派の規則であり、科学的に検証されたものではありません。健康、金銭、法律に関する判断の根拠には使わないでください。

**国別の暦**

| 暦 | 計算に使うタイムゾーン | 国と地域 |
|---|---|---|
| ベトナム（既定） | UTC+7 | ベトナム |
| 中国 | UTC+8 | 中国本土、台湾、香港、マカオ。シンガポール、マレーシア、インドネシア、フィリピンの春節 |
| 韓国 | UTC+9 | 韓国 |
| 日本 | UTC+9 | 旧暦（kyūreki）、伝統行事に使用 |

モンゴル、チベット、タイ、ラオス、カンボジア、ミャンマー、インドは規則の異なる暦を用いており、現時点ではライブラリに含まれていません。

**さらに詳しく**

| データ | 記事 |
|---|---|
| 旧暦、二十四節気 | [どう計算し、誤差はどれほどか](https://nhatnguyet.org/en/blog/co-so-khoa-hoc-am-lich-tiet-khi) |
| 干支、六十干支の周期、二十八宿 | [ユリウス日からどう導くか](https://nhatnguyet.org/en/blog/co-so-khoa-hoc-can-chi-chu-ky) |
| 紫微斗数の命盤 | [生年月日と時刻から十二宮へ](https://nhatnguyet.org/en/blog/co-so-khoa-hoc-la-so-tu-vi) |
| 『紫微斗数全書』（Tử Vi Đẩu Số Toàn Thư）の格局 | [各格局の条件と出現頻度](https://nhatnguyet.org/en/blog/co-so-khoa-hoc-cach-cuc-toan-thu) |
| 四柱推命 | [月柱が節気に従う理由](https://nhatnguyet.org/en/blog/co-so-khoa-hoc-bat-tu) |
| 数秘術 | [近代の体系とベトナム語の氏名](https://nhatnguyet.org/en/blog/co-so-khoa-hoc-than-so-hoc) |
| 古典、解釈 | [デジタル化、校訂、命盤との結合](https://nhatnguyet.org/en/blog/co-so-khoa-hoc-sach-co-loi-luan) |
| 祭礼、祭祀祈祷文 | [出典と日付の検証方法](https://nhatnguyet.org/en/blog/co-so-khoa-hoc-le-hoi-van-cung) |
| 全体の方法 | [Nhat Nguyet の検証方法](https://nhatnguyet.org/en/blog/co-so-khoa-hoc-kiem-chung) |

## ロードマップ

- [x] 4か国の旧暦、干支、二十四節気、二十八宿
- [x] 紫微斗数、四柱推命、数秘術、祭礼（TypeScript、Python）
- [x] 1900年から2100年の命盤解釈、3言語
- [ ] 祭祀祈祷文：儀礼の検索、本文の取得、祈祷文への氏名の差し込み
- [ ] 易経、六爻（Lục Hào）、梅花易数（Mai Hoa）
- [ ] 風水：八宅（Bát Trạch）、本命卦（cung phi）、魯班尺（Lỗ Ban）
- [ ] 日選び：吉時、十二直（12 trực）、凶日
- [ ] 西洋の星座占星術、タロット
- [ ] 流派ごとのオプション（閏月、子の刻）、真太陽時

## ライセンスとクレジット表記

| 対象 | ライセンス | できること |
|---|---|---|
| ソースコード | [MIT](./LICENSE) | 利用、改変、販売が可能。`Copyright (c) 2026 Nhat Nguyet (nhatnguyet.org)` の行を残すこと |
| データ、解釈 | [CC BY 4.0](./DATA-LICENSE) | 商用利用と AI 学習が可能。**クレジット表記が必須** |
| 古典 | パブリックドメイン | 原文は自由に利用可能。デジタル化と校訂は CC BY 4.0 |
| 祭祀祈祷文 | CC BY 4.0 | 民間の伝承から収集し Nhat Nguyet が編集。文言の著作者であるとは主張しません |

**標準のクレジット表記：** `Data: Nhat Nguyet (nhatnguyet.org)`（日本語表記では「データ：Nhat Nguyet (nhatnguyet.org)」）。可能であれば https://nhatnguyet.org へのリンクを添えてください。結果を表示するアプリは、利用者から見える場所に「Nhat Nguyet による」と記載してください。データを再配布する場合は `nguon`（出典）列を残してください。

**Nhat Nguyet** の名称とロゴは商標であり、上記ライセンスの対象外です。Nhat Nguyet が制作または推奨していると誤解させるような製品名や表示は避けてください。

**引用**

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
<summary><b>JavaScript や Python で紫微斗数の命盤を作れる無料ライブラリはありますか？</b></summary>

あります：`npm i @nhatnguyet/tu-vi` または `pip install nhatnguyet`。命盤には五行局（cục）、命宮と身宮、14主星と副星、星の廟旺利陥、四化（Tứ Hóa）、旬空と截空（Tuần、Triệt）、大限、流年、流曜、格局が含まれ、『紫微斗数全書』（Tử Vi Đẩu Số Toàn Thư）の格局も扱います。
</details>

<details>
<summary><b>このデータを AI モデルの学習に使えますか？</b></summary>

はい、商用製品を含めて CC BY 4.0 のもとで利用できます。条件は「Data: Nhat Nguyet (nhatnguyet.org)」（日本語では「データ：Nhat Nguyet (nhatnguyet.org)」）とクレジットを表記することだけです。
</details>

<details>
<summary><b>旧暦と西暦の日付変換はどれくらい正確ですか？</b></summary>

暦は月と太陽の真の位置から計算しています。1900年から2100年にわたり、朔の時刻は NASA との差が平均 1.1分、二十四節気の時刻は IMCCE との差が平均 4.2分です。NASA と IMCCE のデータだけから旧暦を再構築すると、2,461か月のうち 2,459か月が一致します。
</details>

<details>
<summary><b>四柱推命の月柱は旧暦の月と節気のどちらに従いますか？</b></summary>

四柱推命の方法どおり節気に従います：年柱は立春（Lập Xuân）で、月柱は各節気に入る時刻で切り替わり、旧暦の月の1日では切り替わりません。旧暦の月を月柱とすると、全日数のおよそ4分の1で誤りになります。
</details>

<details>
<summary><b>声調記号付きのベトナム語氏名は数秘術でどう扱われますか？</b></summary>

声調記号などを取り除いたうえで、文字と数の対応表で計算し、「Đ」は「D」として数えます。ライフパス数、ディスティニー数、ソウル数、パーソナリティ数、アティテュード数、ピナクル数、チャレンジ数、パーソナルイヤー、パーソナルマンス、パーソナルデイの数が得られます。
</details>

<details>
<summary><b>祭祀祈祷文の出典はどこですか？</b></summary>

民間の伝承から収集し、Nhat Nguyet が編集して 155種類の儀礼に分類しています：テト（Tết、旧正月）、満月の日、旧暦の朔日、命日、婚礼、新居祝い、開店祝いなど。
</details>

## 貢献と連絡先

- 不具合報告と提案：生年月日と時刻、性別、得られた結果、期待した結果、その根拠を添えて issue を作成してください。[CONTRIBUTING.md](./CONTRIBUTING.md) も参照してください。
- ウェブサイト：[nhatnguyet.org](https://nhatnguyet.org) · メール：lienhe@nhatnguyet.org

<p align="center"><sub>データ：Nhat Nguyet (nhatnguyet.org) · コード MIT · データ CC BY 4.0</sub></p>
