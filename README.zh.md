<p align="center">
  <a href="https://nhatnguyet.org/zh/ma-nguon-mo">
    <picture>
      <source media="(prefers-color-scheme: dark)" srcset="./assets/banner-toi.svg">
      <img src="./assets/banner-sang.svg" alt="Nhat Nguyet" width="720">
    </picture>
  </a>
</p>

<h1 align="center">Nhat Nguyet：紫微斗数、八字、数字命理开源代码与数据集</h1>

<p align="center">
  <b>免费开源的紫微斗数排盘、八字（四柱）排盘、数字命理（生命灵数）计算、越南农历与中国农历转换，以及越南祭拜祷文查询，支持 JavaScript 和 Python。</b><br>
  360 万份已解读命盘 · 60 多部古籍 · 越南农历经 NASA 核对
</p>

<p align="center">
  <a href="./LICENSE"><img alt="代码：MIT" src="https://img.shields.io/badge/%E4%BB%A3%E7%A0%81-MIT-1f6f6b.svg"></a>
  <a href="./DATA-LICENSE"><img alt="数据：CC BY 4.0" src="https://img.shields.io/badge/%E6%95%B0%E6%8D%AE-CC%20BY%204.0-1f6f6b.svg"></a>
  <a href="./ca-kiem"><img alt="测试用例：17,291 通过" src="https://img.shields.io/badge/%E6%B5%8B%E8%AF%95%E7%94%A8%E4%BE%8B-17%2C291%20%E9%80%9A%E8%BF%87-2e7d32.svg"></a>
  <a href="https://github.com/Nhat-Nguyet/nhatnguyet/actions/workflows/kiem.yml"><img alt="自动检查" src="https://github.com/Nhat-Nguyet/nhatnguyet/actions/workflows/kiem.yml/badge.svg"></a>
</p>

<p align="center">
  <a href="./README.md">English</a> · <a href="./README.vi.md">Tiếng Việt</a> · <b>中文</b>
  <br>
  <a href="https://nhatnguyet.org/zh/ma-nguon-mo">项目介绍</a> ·
  <a href="https://nhatnguyet.org/zh/du-lieu">开放数据</a> ·
  <a href="https://huggingface.co/nhatnguyet">Hugging Face</a> ·
  <a href="https://nhatnguyet.org/zh/blog">教程文章</a>
</p>

---

## 目录

1. [概览](#概览)
2. [为什么选择 Nhat Nguyet](#为什么选择-nhat-nguyet)
3. [仓库内容](#仓库内容)
4. [快速上手](#快速上手)
5. [可以用来做什么](#可以用来做什么)
6. [科学依据](#科学依据)
7. [路线图](#路线图)
8. [许可与注明出处](#许可与注明出处)
9. [常见问题](#常见问题)
10. [贡献与联系](#贡献与联系)

## 概览

关于术数与民间信仰的开源代码和数据集，**源自越南，兼顾东西方传统**：紫微斗数、八字、数字命理、易经、塔罗、占星、风水、择日、四国农历、节庆和祭拜祷文。所有结果与驱动 [nhatnguyet.org](https://nhatnguyet.org) 及 Nhat Nguyet iOS、Android 应用的计算核心逐字段一致。

| 已解读命盘 | 古籍 | 知识文章 | 开放数据 | 测试用例 |
|:---:|:---:|:---:|:---:|:---:|
| **360 万份** | **60 多部**<br>730 万字 | **510 篇**<br>摘要、问答 | **33 个数据集**<br>带 DOI | **17,291 个**<br>全部通过 |
| **456 篇**祭拜祷文 | **200 个**节庆 | **4 国**农历 | **3 种**语言 | **0 个**依赖 |

## 为什么选择 Nhat Nguyet

| | |
|---|---|
| **按越南时间计算历法** | 1900 至 2100 年间，有 2,814 天的农历日期与按北京时间计算的历法不同；有 10 年春节日期不同。可按国家选择历法，默认越南。 |
| **可核实** | 朔日与 NASA 平均相差 1.1 分钟；交节时刻与 IMCCE 平均相差 4.2 分钟。TypeScript 与 Python 版本在 17,291 个用例中与原始计算核心逐字段一致。 |
| **言必有据** | 每段古籍引文都注明书名和章节，原文已与印本核对。各派有分歧之处如实说明，不悄悄只选一派。 |
| **三种语言** | 星名、术语、论断均有完整的越南语、英语、中文版本。 |
| **在本机运行** | 无依赖，不联网，不向任何地方发送数据。可在浏览器、Node、Python 中运行。 |

## 仓库内容

### 库

| 门类 | TypeScript（npm） | Python（`pip install nhatnguyet`） | 功能 |
|---|---|---|---|
| 农历 | [`@nhatnguyet/am-lich`](./js/packages/am-lich) | `nhatnguyet.am_lich` | 四国阴阳历转换、干支、二十四节气精确到分钟、二十八宿、纳音 |
| 紫微斗数 | [`@nhatnguyet/tu-vi`](./js/packages/tu-vi) | `nhatnguyet.tu_vi` | 十二宫命盘、庙旺利陷、四化、旬空截空、大限、流年、流曜、格局 |
| 八字 | [`@nhatnguyet/bat-tu`](./js/packages/bat-tu) | `nhatnguyet.bat_tu` | 按节气排四柱、藏干、十神、神煞、大运、小运 |
| 数字命理 | [`@nhatnguyet/than-so-hoc`](./js/packages/than-so-hoc) | `nhatnguyet.than_so_hoc` | 生命灵数、使命数、灵魂数、巅峰数、挑战数、个人年数；支持带声调的越南语姓名 |
| 节庆 | [`@nhatnguyet/le-hoi`](./js/packages/le-hoi) | `nhatnguyet.le_hoi` | 200 个节庆，逐年农历转公历 |

### 数据

| 数据集 | 内容 | 格式 | 大小 |
|---|---|---|---|
| 按命盘的论断 | 1900 至 2100 年每个出生日期的紫微斗数、八字（12 个时辰，2 种性别）；按出生日期的数字命理 | zstd 压缩的 JSON Lines，每个出生年份一个文件 | 压缩后约 11 GB |
| ↳ 结构化命盘 | 星曜位置、四化、四柱、各项数字，附论断编号 | `la-so/<门类>/<年份>` | 约 1.6 GB |
| ↳ 按语言预先拼合 | 每个文件一种语言的完整文字，供 AI 训练 | `ghep-san/<门类>/<vi\|en\|zh>/<年份>` | 约 9 GB |
| ↳ 文字库 | 论断、古籍原文、延伸阅读；每段只存一次，附编号 | `kho/` | < 0.3 GB |
| 古籍 | 60 多部公有领域古籍全文 | 文本 | 约 20 MB |
| 历法、节庆、祭文 | 33 个数据集：1900 至 2100 年阴阳历、六十四卦、78 张塔罗牌、节气、祭拜祷文、仪程…… | CSV、JSON、Parquet | 118 MB |

### 测试用例

[`ca-kiem/`](./ca-kiem)：由原始计算核心生成的 17,291 对输入与答案，涵盖四国农历、节庆、数字命理、八字、紫微斗数。无论用哪种语言编写库，都可以自行检验：读取 `vao`（输入），与 `ra`（答案）比对。

## 快速上手

**TypeScript、JavaScript**

```bash
npm i @nhatnguyet/tu-vi @nhatnguyet/am-lich
```

```ts
import { lapLaSoTuVi, nhanDienCachCuc } from "@nhatnguyet/tu-vi";
import { solarToLunar, MUI_GIO_THEO_NUOC } from "@nhatnguyet/am-lich";

const laSo = lapLaSoTuVi("", "Nam", 19, 9, 1990, 10); // 1990 年 9 月 19 日生，戌时
console.log(laSo.tenCuc, nhanDienCachCuc(laSo).map((c) => c.ten));

solarToLunar(21, 1, 1985);                       // 越南农历：正月初一
solarToLunar(21, 1, 1985, MUI_GIO_THEO_NUOC.CN); // 中国农历：腊月初一
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

**数据**

```python
from datasets import load_dataset
ds = load_dataset("nhatnguyet/loi-luan-tu-vi", data_files="ghep-san/tu-vi/zh/1990.jsonl.zst")
```

## 可以用来做什么

| 用途 | 使用什么 | 教程 |
|---|---|---|
| **开发排盘网站、应用** | 紫微斗数、八字、数字命理库 | [用 JavaScript 排紫微命盘](https://nhatnguyet.org/zh/blog/lap-la-so-tu-vi-bang-javascript) |
| **日历、提醒应用** | 农历、节庆、祭拜祷文 | [为应用加入农历、节庆和忌日提醒](https://nhatnguyet.org/zh/blog/lich-am-le-hoi-cho-ung-dung) |
| **训练 AI** | 按语言预先拼合的论断 | [用紫微命盘数据训练 AI](https://nhatnguyet.org/zh/blog/huan-luyen-ai-voi-du-lieu-tu-vi) |
| **带引用的 AI 助手** | 古籍原文库、延伸阅读 | [能引用古书作答的 AI 助手](https://nhatnguyet.org/zh/blog/tro-ly-ai-trich-dan-sach-co) |
| **数据分析** | 结构化命盘 | [紫微格局有多少见？](https://nhatnguyet.org/zh/blog/phan-tich-du-lieu-la-so-bang-python) |
| **历法、文化研究** | 四国农历、节庆、古籍 | [越南农历与中国农历的不同](https://nhatnguyet.org/zh/blog/am-lich-viet-nam-khac-trung-quoc) |
| **检验自己的库** | 测试用例 | [用通用测试用例检验](https://nhatnguyet.org/zh/blog/kiem-thu-vien-bang-bo-ca-kiem) |

此外还可用于：教育（一步步讲解排盘）、翻译（三语术语对照）、内容与新闻（可核实的数字）。

## 科学依据

**科学在于方法，而不在于断语。** 历法是天文计算，可与 NASA 和 IMCCE 对照。所有结果都是确定的，可用测试用例复核。紫微斗数、八字、数字命理及其他术数是各派的规则，未经科学验证；请勿作为健康、财务或法律决定的依据。

**各国历法**

| 历法 | 计算时区 | 国家、地区 |
|---|---|---|
| 越南（默认） | UTC+7 | 越南 |
| 中国 | UTC+8 | 中国大陆、台湾、香港、澳门；新加坡、马来西亚、印度尼西亚、菲律宾华人的春节 |
| 韩国 | UTC+9 | 韩国 |
| 日本 | UTC+9 | 旧历（kyūreki），用于传统节日 |

蒙古、西藏、泰国、老挝、柬埔寨、缅甸、印度使用规则不同的历法，本库暂未收录。

**深入阅读**

| 数据类别 | 文章 |
|---|---|
| 农历、节气 | [如何推算，误差多大？](https://nhatnguyet.org/zh/blog/co-so-khoa-hoc-am-lich-tiet-khi) |
| 干支、六十甲子、二十八宿 | [如何由儒略日推出？](https://nhatnguyet.org/zh/blog/co-so-khoa-hoc-can-chi-chu-ky) |
| 紫微命盘 | [从出生日时到十二宫](https://nhatnguyet.org/zh/blog/co-so-khoa-hoc-la-so-tu-vi) |
| 紫微斗数全书的格局 | [各格的条件与出现频率](https://nhatnguyet.org/zh/blog/co-so-khoa-hoc-cach-cuc-toan-thu) |
| 八字 | [为何月柱按节气](https://nhatnguyet.org/zh/blog/co-so-khoa-hoc-bat-tu) |
| 数字命理 | [现代体系与越南语姓名](https://nhatnguyet.org/zh/blog/co-so-khoa-hoc-than-so-hoc) |
| 古籍、论断 | [数字化、校对、按命盘拼合](https://nhatnguyet.org/zh/blog/co-so-khoa-hoc-sach-co-loi-luan) |
| 节庆、祭文 | [来源与日期核实方法](https://nhatnguyet.org/zh/blog/co-so-khoa-hoc-le-hoi-van-cung) |
| 总体方法 | [Nhat Nguyet 用哪些方法检验](https://nhatnguyet.org/zh/blog/co-so-khoa-hoc-kiem-chung) |

## 路线图

- [x] 四国农历、干支、二十四节气、二十八宿
- [x] 紫微斗数、八字、数字命理、节庆（TypeScript、Python）
- [x] 1900 至 2100 年命盘论断，三种语言
- [ ] 祭拜祷文：查询仪式、获取祷文、将姓名填入祷文
- [ ] 易经、六爻、梅花易数
- [ ] 风水：八宅、命卦、鲁班尺
- [ ] 择日：黄道吉时、建除十二值日、凶日
- [ ] 星座占星、塔罗
- [ ] 按流派选择（闰月、子时）、真太阳时

## 许可与注明出处

| 部分 | 许可证 | 可以做什么 |
|---|---|---|
| 源代码 | [MIT](./LICENSE) | 使用、修改、出售；保留版权行 `Copyright (c) 2026 Nhat Nguyet (nhatnguyet.org)` |
| 数据、论断 | [CC BY 4.0](./DATA-LICENSE) | 可用于商业用途和 AI 训练，**必须注明出处** |
| 古籍 | 公有领域 | 原文自由使用；数字化、校对部分按 CC BY 4.0 发布 |
| 祭拜祷文 | CC BY 4.0 | 采集自民间，由 Nhat Nguyet 编辑，不主张对祷文文字的作者权 |

**标准出处写法：** `数据：Nhat Nguyet (nhatnguyet.org)`，尽可能附上链接 https://nhatnguyet.org。显示结果的应用在用户看得到的位置注明“据 Nhat Nguyet”。再发布数据时保留 `nguon`（来源）列。

**Nhat Nguyet** 名称与标志属于商标，不在许可范围内。产品命名或呈现方式不得让用户误以为是 Nhat Nguyet 的产品或受其背书。

**引用**

```bibtex
@software{nhatnguyet_2026,
  author = {{Nhat Nguyet}},
  title  = {Nhat Nguyet：紫微斗数、八字、数字命理开源代码与数据集},
  year   = {2026},
  url    = {https://nhatnguyet.org/zh/ma-nguon-mo}
}
```

## 常见问题

<details>
<summary><b>有没有免费的紫微斗数排盘库，支持 JavaScript 或 Python？</b></summary>

有：`npm i @nhatnguyet/tu-vi` 或 `pip install nhatnguyet`。命盘包括五行局、命宫、身宫、14 颗主星与辅星、庙旺利陷、四化、旬空截空、大限、流年、流曜和格局，涵盖紫微斗数全书中的格局。
</details>

<details>
<summary><b>这些数据可以用来训练 AI 吗？</b></summary>

可以，商业产品也可以，遵循 CC BY 4.0 许可。唯一条件是注明“数据：Nhat Nguyet (nhatnguyet.org)”。
</details>

<details>
<summary><b>农历转公历准确吗？</b></summary>

历法依据月球和太阳的真实位置计算。1900 至 2100 年间，朔日与 NASA 平均相差 1.1 分钟；交节时刻与 IMCCE 平均相差 4.2 分钟。仅用 NASA 和 IMCCE 数据重建农历，2,461 个月中有 2,459 个月吻合。
</details>

<details>
<summary><b>八字的月柱按农历月还是按节气？</b></summary>

按节气，符合四柱的方法：年柱以立春为界，月柱以交节时刻为界，而不是以农历初一为界。若以农历月作月柱，约四分之一的日子会出错。
</details>

<details>
<summary><b>数字命理怎么计算带声调的越南语姓名？</b></summary>

先去掉声调和附加符号，再按字母数字对照表计算，“Đ”按“D”计。包括生命灵数、使命数、灵魂数、人格数、态度数、巅峰数、挑战数，以及个人年、月、日数。
</details>

<details>
<summary><b>祭拜祷文从哪里来？</b></summary>

采集自民间，由 Nhat Nguyet 编辑，并按 155 类仪式分类：春节、十五、初一、忌日、婚礼、入宅、开业……
</details>

## 贡献与联系

- 报告错误、提出建议：请开 issue，附上出生日期时间、性别、得到的结果、期望的结果及依据。参见 [CONTRIBUTING.md](./CONTRIBUTING.md)。
- 网站：[nhatnguyet.org](https://nhatnguyet.org) · 邮箱：lienhe@nhatnguyet.org

<p align="center"><sub>数据：Nhat Nguyet (nhatnguyet.org) · 代码 MIT · 数据 CC BY 4.0</sub></p>
