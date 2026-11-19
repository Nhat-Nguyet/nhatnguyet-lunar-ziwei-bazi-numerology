<h1 align="center">Nhat Nguyet</h1>

<p align="center">
  <b>越南农历不是中国农历：常用的库在 1900 至 2100 年间有 2,724 天给出错误的越南农历日期。</b><br>
  在正确的历法上排紫微斗数、八字、数字命理，查节庆与黄道吉时，支持 JavaScript、Python 和 MCP · 360 万份公开命盘，论断引用古籍并注明书名与篇章 · 结果有 English、Tiếng Việt、中文 · 17,291 组共享测试用例
</p>

<p align="center">
  <a href="./README.md">English</a> · <a href="./README.vi.md">Tiếng Việt</a> · <b>中文</b> · <a href="./README.ja.md">日本語</a> · <a href="./README.ko.md">한국어</a> · <a href="./README.fr.md">Français</a> · <a href="./README.th.md">ไทย</a>
  <br>
  <a href="https://nhatnguyet.org/zh/ma-nguon-mo/thu">在线试用</a> ·
  <a href="https://nhatnguyet.org/zh/ma-nguon-mo/tai-lieu">文档</a> ·
  <a href="./docs/paper/paper.pdf">论文</a> ·
  <a href="https://huggingface.co/nhatnguyet">Hugging Face</a> ·
  <a href="https://nhatnguyet.org/zh/ma-nguon-mo">项目介绍</a>
</p>

<p align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="./assets/la-so-tu-vi-zh-toi.svg">
    <img src="./assets/la-so-tu-vi-zh.svg" alt="由本库绘制的紫微斗数命盘" width="720">
  </picture>
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/@nhatnguyet/ziwei"><img alt="npm" src="https://img.shields.io/npm/v/@nhatnguyet/ziwei.svg?label=npm"></a>
  <a href="https://pypi.org/project/nhatnguyet/"><img alt="PyPI" src="https://img.shields.io/pypi/v/nhatnguyet.svg"></a>
  <a href="./ca-kiem"><img alt="测试用例：17,291" src="https://img.shields.io/badge/%E6%B5%8B%E8%AF%95%E7%94%A8%E4%BE%8B-17%2C291-2e7d32.svg"></a>
  <a href="https://github.com/Nhat-Nguyet/nhatnguyet-lunar-ziwei-bazi-numerology/actions/workflows/kiem.yml"><img alt="自动检查" src="https://github.com/Nhat-Nguyet/nhatnguyet-lunar-ziwei-bazi-numerology/actions/workflows/kiem.yml/badge.svg?branch=main"></a>
  <a href="./LICENSE"><img alt="代码：MIT" src="https://img.shields.io/badge/%E4%BB%A3%E7%A0%81-MIT-1f6f6b.svg"></a>
  <a href="./DATA-LICENSE"><img alt="数据：CC BY 4.0" src="https://img.shields.io/badge/%E6%95%B0%E6%8D%AE-CC%20BY%204.0-1f6f6b.svg"></a>
  <a href="https://doi.org/10.5281/zenodo.24358013"><img alt="DOI" src="https://zenodo.org/badge/DOI/10.5281/zenodo.24358013.svg"></a>
</p>

## 快速开始

**JavaScript、TypeScript**（Node 18 及以上、浏览器）

```bash
npm i @nhatnguyet/ziwei @nhatnguyet/lunar
```

```js
import { writeFileSync } from "node:fs";
import { castZiWei } from "@nhatnguyet/ziwei";
import { toLunar } from "@nhatnguyet/lunar";

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
Earth Five | Life Palace Hai | Moon Exalted
1 1 1985 Yi Chou | 1 12 1984 Jia Zi
```

**Python**（3.9 及以上，仅用标准库）：结果相同，生成的 SVG 逐字节相同。

```bash
pip install nhatnguyet
```

<!-- run: same-output -->
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

**命令行**：用 `npx` 免安装运行；`pip install nhatnguyet` 后也可直接用 `nhatnguyet ...`。

<p align="center"><img src="./assets/cli-demo.svg" alt="终端录屏：先显示 1985 年 1 月 21 日的中国农历日期，再以方格画出紫微斗数命盘" width="640"></p>

```bash
npx @nhatnguyet/cli ziwei 1990-09-19 20:00 male --year 2026
```

<details>
<summary>输出（十二宫排成方格，随后是流年、大限、格局）</summary>

```text
┌────────────────────┬────────────────────┬────────────────────┬────────────────────┐
│ Travel             │ Health             │ Wealth · Body      │ Children           │
│ Xin Si             │ Ren Wu Jie Kong    │ Gui Wei Jie Kong   │ Jia Shen           │
│ Celestial Mechanism│ Purple Star Ex     │ Spinning Top,      │ Army Breaker We    │
│   Pr               │ Celestial Leader,  │ Celestial Void     │ Prosperity,        │
│ Celestial Talent,  │ Celestial Fortune, │ Nurture            │ Celestial Horse,   │
│ Bell Star,         │ Celestial Messen…  │                    │ Celestial Charm,   │
│ Shattering Star    │ Conception         │                    │ Celestial Physic…, │
│ Extinction         │                    │                    │ Solitary Star,     │
│                    │                    │                    │ Flowing Haze       │
│                    │                    │                    │ Growth             │
├────────────────────┼────────────────────┴────────────────────┼────────────────────┤
│ Friends/Subordinat…│                                         │ Spouse             │
│ Geng Chen          │                                         │ Yi You             │
│ Seven Killings We  │                                         │ Sword Ram,         │
│ Phoenix Pavilion,  │                                         │ Earthly Robber,    │
│ Celestial Punish…, │                                         │ Dipper Lord,       │
│ State Seal,        │                                         │ Red Phoenix        │
│ Releasing Spirit,  │                                         │ Bathing            │
│ Terrace Aide,      │                                         │                    │
│ Celestial Injury,  │                                         │                    │
│ Celestial Net,     │          ZI WEI DOU SHU CHART           │                    │
│ Widow Star         │       Born 1990-09-19 20:00 (Xu)        │                    │
│ Tomb               │       Lunar 1990-08-01 · Geng Wu        │                    │
├────────────────────┤                Yang Male                ├────────────────────┤
│ Career             │           Bureau: Earth Five            │ Siblings           │
│ Ji Mao             │      Na yin: Earth by the Roadside      │ Bing Xu Xun Kong   │
│ Sun Pr Lu          │          Life: Hai · Body: Wei          │ Purity Ex          │
│ Celestial Beam Pr  │                                         │ Celestial Treasury │
│ Right Assistant,   │                                         │   Pr               │
│ Peach Blossom,     │                                         │ Dragon Pool,       │
│ Eight Seats,       │                                         │ Earthly Snare,     │
│ Celestial Nobili…, │                                         │ Canopy             │
│ Celestial Virtue,  │                                         │ Youth              │
│ Celestial Joy,     │                                         │                    │
│ Celestial Release  │                                         │                    │
│ Death              │                                         │                    │
├────────────────────┼────────────────────┬────────────────────┼────────────────────┤
│ Property           │ Fortune/Virtue     │ Parents            │ Life Palace        │
│ Wu Yin             │ Ji Chou            │ Wu Zi              │ Ding Hai Xun Kong  │
│ Military Song      │ Celestial Blessing │ Greedy Wolf We     │ Moon Ex Ji         │
│   Pr Quan          │   We Ke            │ Literary Glory,    │ Left Assistant,    │
│ Celestial Minister │ Giant Gate We      │ Celestial Weeping, │ Three Terraces,    │
│   Ex               │ Earthly Void,      │ Celestial Emptin…, │ Grace Light,       │
│ Celestial Halberd, │ Celestial Longev…, │ Patent of Honour   │ Celestial Offici…, │
│ Literary Melody,   │ Court Tally        │ Peak               │ Fire Star,         │
│ Earthly Release,   │ Decline            │                    │ Monthly Virtue,    │
│ Celestial Kitchen  │                    │                    │ Robbery Sha,       │
│ Illness            │                    │                    │ Annual Literary …  │
│                    │                    │                    │ Prime              │
└────────────────────┴────────────────────┴────────────────────┴────────────────────┘
Brightness: Ex exalted, Pr prosperous, Fa favorable, Ne neutral, We weak. Ages are East
Asian ages (1 at birth).

Year 2026 (Bing Wu)
  age 37 · Year palace: Health · Minor limit: Friends/Subordinates ·
  Decade: Property (35-44) · Hua Lu: Celestial Blessing → Fortune/Virtue ·
  Hua Quan: Celestial Mechanism → Travel · Hua Ke: Literary Glory → Parents ·
  Hua Ji: Purity → Siblings

Ten-year periods
    5-14  1994-2003  Life Palace (Hai)  Moon
   15-24  2004-2013  Parents (Zi)  Greedy Wolf
   25-34  2014-2023  Fortune/Virtue (Chou)  Celestial Blessing, Giant Gate
   35-44  2024-2033  Property (Yin)  Military Song, Celestial Minister
   45-54  2034-2043  Career (Mao)  Sun, Celestial Beam
   55-64  2044-2053  Friends/Subordinates (Chen)  Seven Killings
   65-74  2054-2063  Travel (Si)  Celestial Mechanism
   75-84  2064-2073  Health (Wu)  Purple Star
   85-94  2074-2083  Wealth (Wei)  -
   95-104 2084-2093  Children (Shen)  Army Breaker
  105-114 2094-2103  Spouse (You)  -
  115-124 2104-2113  Siblings (Xu)  Purity, Celestial Treasury

Patterns
  Mechanism, Moon, Blessing and Beam 機月同梁 · Life Palace
  Left and Right Assistants Meeting 左右同會 · Life Palace
  Sun Rising from Fusang 日出扶桑 · Career
  Moon Setting in the Hai Palace 月落亥宮 · Life Palace

Birth time 20:00 falls in the Xu double hour (19:00-20:59). The lunar date follows the
Vietnamese calendar (UTC+7).
```

</details>

其他命令：`bazi`、`lunar`、`solar`、`terms`、`numerology`、`festivals`（`--ics` 输出日历文件）、`hours`；`--lang vi|zh`、`--json`、`--svg chart.svg`，以及下文的流派选项。英文 API 及全部参数见 [docs/api-en.md](./docs/api-en.md)。

## 目录

1. [为何可信](#为何可信)
2. [安装](#安装)
3. [功能](#功能)
4. [数据集](#数据集)
5. [面向 AI](#面向-ai)
6. [网页小组件](#网页小组件)
7. [示例与文档](#示例与文档)
8. [从 iztro 迁移](#从-iztro-迁移)
9. [常见问题](#常见问题)
10. [参与贡献](#参与贡献)
11. [引用与许可](#引用与许可)

## 为何可信

**科学性在于方法，而不在于预测。** 历法是天文计算，在 1900 至 2100 年范围内与 NASA 和 IMCCE 核对：

| 检验 | 结果 |
|---|---|
| 朔与 NASA 对比（2,474 次） | 平均晚 0.9 分钟，最多 3.9 分钟 |
| 用 NASA 朔与 IMCCE 节气重建的农历月 | 2,461 个月中 2,459 个一致（其余两个的朔在午夜前后一分钟内） |
| 节气与 IMCCE 对比（4,824 个） | 平均偏差 0.27 分钟，最多 0.9 分钟（取整到分钟），日期全部正确 |
| 越南（UTC+7）与中国（UTC+8），规则相同 | 2,814 天、10 个春节日期不同 |

- **技术论文**：[越南阴阳历的计算](./docs/paper/paper.pdf)（PDF）给出方法、误差预算、与 NASA、IMCCE 和 JPL DE440 的核对，并逐一解释越南与中国农历不同的每一天。文中每个数字都由 `docs/paper/reproduce.sh` 重新计算。
- **共享测试用例**：[`ca-kiem/`](./ca-kiem) 收录 **17,291 组核心测试用例**（输入 `vao`，期望输出 `ra`），由驱动 [nhatnguyet.org](https://nhatnguyet.org) 的参考引擎生成：历法 14,936 组、紫微命盘 777 个、八字命盘 777 个、数字命理档案 600 份、节庆年份 201 个，另有流派选项 432 组与黄道吉时 1,096 天（共 18,819 组）。TypeScript 与 Python 版本每次推送都全部通过。
- **春节史**：[`history/`](./history/README.md) 列出 1900 至 2100 年每一年在 UTC+7 与 UTC+8 下的春节，注明越南当年实际使用的历法，有文献记载的年份均附出处。
- **如实说明范围**：紫微斗数、八字与数字命理是传统流派的规则，未经科学验证；请勿用于健康、财务或法律决定。各派有分歧之处，本库写明所依规则，并允许切换（[流派选项](#流派选项)）。

### 与其他库对比

[iztro](https://github.com/SylarLong/iztro) 和 [lunar-javascript](https://github.com/6tail/lunar-javascript) 都是严谨、广泛使用的库，对于它们所实现的内容也都正确：按北京时间（UTC+8）计算的中国农历。越南采用相同规则，但按河内时间（UTC+7）计算。逐日对比 1900 至 2100 年（[doi-chieu/](./doi-chieu/README.md)，可用 `node chay.mjs` 复现）：

| | 结果 |
|---|---:|
| 农历日期与 lunar-javascript 不同的天数 | 73,414 天中 2,724 天 |
| 春节日期与 lunar-javascript 不同的年份 | 201 年中 9 年 |
| 闰月与 lunar-javascript 不同的年份 | 201 年中 6 年 |
| 设 `country: "CN"` 后仍与 lunar-javascript 不同的天数 | 150 天（5 个月） |
| 局数、命宫或任一主星与 iztro 不同的紫微命盘（每天 × 12 时辰） | 880,968 个中 38,752 个（4.40%） |
| 其中因时区（iztro 即使选 `vi-VN` 也用北京时间） | 26,602 个（3.02%） |
| 其中因闰月规则（iztro 的 `fixLeap`，可选项） | 11,818 个（1.34%） |
| 其中两者都不是 | 332 个（0.04%） |
| 节气与 IMCCE 的最大偏差：Nhat Nguyet / lunar-javascript | 0.9 分钟 / 0.28 分钟 |

**两个数字衡量的是两件事。** 2,724 天、9 个春节年份是 Nhat Nguyet（越南，UTC+7）与 lunar-javascript 的比较；上文表中的 2,814 天、10 个春节年份是 Nhat Nguyet 计算核心自身在 UTC+7 与 UTC+8 之间的比较。两者不相等，是因为 `country: "CN"` 并不完全等同于 lunar-javascript：仍有 150 天不同，即 1914、1916、1920、2057、2097 年各一个月。1914、1916、1920 年是 lunar-javascript 为对齐中国旧历书而有意修正 1960 年以前的日期；2057 和 2097 年的朔恰好落在北京时间午夜（16:00 UT），近到无法判定。

**既非时区也非闰月规则造成的 332 个命盘**全部落在同一个月：2057 年 9 月 28 日起的 30 天。该月的朔在 16:00 UT：Nhat Nguyet 算在北京午夜之前，因此在两个时区都从 28 日开始该月；lunar-javascript（以及 iztro）算在午夜之后，从 29 日开始。这正是上面说的午夜临界情形，改时区或闰月规则都不会改变它。

例：1985 年 1 月 21 日巳时出生。iztro 得出甲子年腊月初一、金四局、命宫在申；Nhat Nguyet 得出乙丑年正月初一（越南春节）、水二局、命宫在酉。传入 `country: "CN"`，Nhat Nguyet 也给出中国农历的结果。

## 安装

版本 0.3.0。JavaScript 包为 ESM，附 TypeScript 类型，无外部依赖（仅 MCP 服务器需要其 SDK 与 zod）；Python 包仅用标准库。

```bash
npm i @nhatnguyet/lunar @nhatnguyet/ziwei @nhatnguyet/bazi @nhatnguyet/numerology @nhatnguyet/festivals
pip install nhatnguyet
```

| 包 | 另以此名发布 | 功能 |
|---|---|---|
| [`@nhatnguyet/lunar`](./js/packages/am-lich) | `@nhatnguyet/am-lich` | 越南、中国、韩国、日本及另外 7 个地区的公农历互换；干支；二十四节气精确到分钟；二十八宿；纳音；黄道吉时 |
| [`@nhatnguyet/ziwei`](./js/packages/tu-vi) | `@nhatnguyet/tu-vi` | 紫微斗数：十二宫、星曜庙旺、四化、旬空截空、大限与流年、流曜、附古籍原句的格局、流派选项；SVG 绘图；供大语言模型使用的文本；iztro 兼容层 |
| [`@nhatnguyet/bazi`](./js/packages/bat-tu) | `@nhatnguyet/bat-tu` | 八字：按节气排四柱、藏干、十神、神煞、大运、小运；SVG 绘图 |
| [`@nhatnguyet/numerology`](./js/packages/than-so-hoc) | `@nhatnguyet/than-so-hoc` | 毕达哥拉斯数字命理（生命灵数、天赋数、灵魂数、巅峰数、挑战数、个人年），支持带声调的越南语姓名；SVG 绘图 |
| [`@nhatnguyet/festivals`](./js/packages/le-hoi) | `@nhatnguyet/le-hoi` | 206 个越南节庆及其任意年份的日期、所在省份、民族、举办地点；导出 iCalendar |
| [`@nhatnguyet/cli`](./js/packages/cli) | | 在终端以方格显示命盘，或输出 JSON、SVG、iCalendar；命令与 Python 版的 `nhatnguyet` 相同 |
| [`@nhatnguyet/mcp`](./js/packages/mcp) | | 供 AI 助手使用的 MCP 服务器 |
| [`@nhatnguyet/widgets`](./js/packages/widgets) | | 5 个网页组件 |
| [`nhatnguyet`](./python)（PyPI） | | 以上全部功能集于一个 Python 包，结果逐字段相同 |

以越南语命名的包是同一份代码，沿用原来的名称；现有的 import 照常可用。

## 功能

每个库都与驱动 [nhatnguyet.org](https://nhatnguyet.org) 和 Nhat Nguyet 应用的计算引擎逐字段一致。不联网。结果可以是英文（`lang: "en"`，默认）、越南文（`"vi"`）或中文（`"zh"`）；英文结果中的干支默认用拼音（设 `terms: "han"` 或 `"vi"` 则用汉字或汉越音）。

<table>
  <tr>
    <td align="center" width="33%"><a href="./assets/la-so-tu-vi-zh.svg"><picture><source media="(prefers-color-scheme: dark)" srcset="./assets/la-so-tu-vi-zh-toi.svg"><img src="./assets/la-so-tu-vi-zh.svg" alt="由本库绘制的紫微斗数命盘" width="260"></picture></a><br><sub>紫微斗数 · <code>castZiWei().toSvg()</code></sub></td>
    <td align="center" width="33%"><a href="./assets/la-so-bat-tu-zh.svg"><picture><source media="(prefers-color-scheme: dark)" srcset="./assets/la-so-bat-tu-zh-toi.svg"><img src="./assets/la-so-bat-tu-zh.svg" alt="由本库绘制的八字命盘" width="260"></picture></a><br><sub>八字 · <code>castBaZi().toSvg()</code></sub></td>
    <td align="center" width="33%"><a href="./assets/than-so-hoc-zh.svg"><picture><source media="(prefers-color-scheme: dark)" srcset="./assets/than-so-hoc-zh-toi.svg"><img src="./assets/than-so-hoc-zh.svg" alt="由本库绘制的数字命理档案" width="260"></picture></a><br><sub>数字命理 · <code>numerology().toSvg()</code></sub></td>
  </tr>
</table>

<p align="center"><sub>每张图都是本库绘制的 SVG；点击可查看原尺寸。</sub></p>

### 农历与黄道吉时

`@nhatnguyet/lunar` 中的 `toLunar`、`toSolar`、`solarTerms` 与 `auspiciousHours`（Python 为 `to_lunar`、`to_solar`、`solar_terms`、`auspicious_hours`）。默认使用越南历法（UTC+7），也可传 `country`：中国、台湾、香港、澳门、新加坡、马来西亚、印度尼西亚、菲律宾（UTC+8）；韩国、日本（UTC+9）。

`auspiciousHours` 按越南历书的印法给出一天的十二时辰，标明黄道（hoàng đạo）或黑道（hắc đạo）及值神（命令行 `nhatnguyet hours`，MCP 工具 `auspicious_hours`）：

```js
import { auspiciousHours } from "@nhatnguyet/lunar";

const day = auspiciousHours("2027-02-06");   // Tết 2027
console.log(day.day, "|", day.hours.filter((h) => h.auspicious).map((h) => `${h.branch} ${h.range} ${h.spirit}`).join(", "));
```

```text
Bing Chen | Yin 03:00-04:59 Si Ming, Chen 07:00-08:59 Qing Long, Si 09:00-10:59 Ming Tang, Shen 15:00-16:59 Jin Kui, You 17:00-18:59 Bao Guang, Hai 21:00-22:59 Yu Tang
```

<!-- run: same-output -->
```python
from nhatnguyet import auspicious_hours

day = auspicious_hours("2027-02-06")   # Tết 2027
print(day["day"], "|", ", ".join(f"{h['branch']} {h['range']} {h['spirit']}" for h in day["hours"] if h["auspicious"]))
```

### 紫微斗数

`castZiWei` 排出完整命盘：命宫与身宫、五行局、14 颗主星与 55 颗辅星及其庙旺、四化、旬空截空、大限、所选流年及其流曜，以及《紫微斗数全书》的格局并附古籍原句。`chart.toSvg()` 绘图；`chartToText` 把命盘转成供语言模型使用的简洁 Markdown。iztro 兼容层提供查询与运限：`palace()`、`star()`、`surroundedPalaces()`、`horoscope()`、`fliesTo()`（[从 iztro 迁移](#从-iztro-迁移)）。

### 流派选项

古籍有分歧之处，本库选定一个默认值，写明所依的书，并允许切换到另一具名来源给出的规则（[docs/schools.md](./docs/schools.md)）。默认值永不改变，每个选项都有自己的测试用例。

| 选项 | 取值（默认在前） | 影响 |
|---|---|---|
| `fireBell` | `vietnamese`、`quanshu`、`swap-for-female`、`swap-for-yin-male-yang-female` | 火星与铃星 |
| `leapMonth` | `whole`、`split-at-15`、`next-month` | 闰月出生时采用的月份 |
| `transformations` | `vietnamese`、`quanshu`、`zhongzhou` | 庚干的四化 |
| `heavenlyKitchen` | `vietnamese`、`chinese` | 癸年的天厨 |
| `injuryMessenger` | `standard`、`zhongzhou` | 天伤与天使 |
| `ziHour`（八字） | `next-day-from-23`、`split-at-midnight` | 23:00 至 24:00 出生者的日柱 |

```js
import { castZiWei } from "@nhatnguyet/ziwei";

const opts = { date: "1990-09-19", time: "20:00", gender: "male" };
const where = (chart, star) => chart.palaces.find((p) => p.stars.some((s) => s.name === star)).branch;
const viet = castZiWei(opts);
const quanshu = castZiWei({ ...opts, schools: { fireBell: "quanshu" } });
console.log("Bell Star:", where(viet, "Bell Star"), "|", where(quanshu, "Bell Star"));
console.log(quanshu.notes.at(-1));
```

```text
Bell Star: Si | Chou
School options (not the default): Fire and Bell stars: both forward (Quan Shu).
```

<!-- run: same-output -->
```python
from nhatnguyet import cast_zi_wei

opts = dict(date="1990-09-19", time="20:00", gender="male")
where = lambda chart, star: next(p["branch"] for p in chart["palaces"] if any(s["name"] == star for s in p["stars"]))
viet = cast_zi_wei(**opts)
quanshu = cast_zi_wei(**opts, schools={"fire_bell": "quanshu"})
print("Bell Star:", where(viet, "Bell Star"), "|", where(quanshu, "Bell Star"))
print(quanshu["notes"][-1])
```

命令行：`--fire-bell quanshu`、`--leap-month split-at-15`、`--zi-hour split-at-midnight`……与 iztro 2.6.5 在 610 个命盘上对比，`{ fireBell: "quanshu", transformations: "quanshu", heavenlyKitchen: "chinese" }` 使火铃位置（484 处差异）、庚年四化（126 处）和癸年天厨（59 处）的差异都降为 0。

### 八字与数字命理

`castBaZi` 以立春换年、以每个节换月，精确到分钟；给出藏干、十神、十二长生、神煞、大运与小运。`numerology` 采用毕达哥拉斯方法，去掉越南语声调符号（"Đ" 按 "D" 计），保留卓越数 11、22、33。

### 节庆

`@nhatnguyet/festivals` 中的 `festivals(year)` 给出数据集 206 个节庆里日期固定（农历或公历）的 164 个在 1900 至 2100 年任意一年的日期（其余 42 个由主办方逐年定日）。每个节庆都附所在省份（按 2025 年的 34 个省级行政区）、描述中写明时的所属民族，以及举办地点，仅在有来源给出时附坐标。`group`、`scope`、`level` 在各语言中都是英文代码。`festivalsIcs(year)` 生成 iCalendar（RFC 5545）文件，每个节庆一个全天事件。

```js
import { writeFileSync } from "node:fs";
import { festivals, festivalsIcs } from "@nhatnguyet/festivals";

const f = festivals(2027).find((x) => x.id === "khai-hoi-chua-bai-dinh");
const venue = f.venues[0];
console.log(f.date, f.name, "|", f.provinces[0].name, "|", venue.name, venue.coordinates.lat, venue.coordinates.lon);
writeFileSync("vietnam-festivals-2027.ics", festivalsIcs(2027));
```

```text
2027-02-11 Bái Đính Pagoda Festival Opening | Ninh Bình | Bái Đính Pagoda 20.276944 105.862778
```

<!-- run: same-output -->
```python
from nhatnguyet import festivals
from nhatnguyet.en import festivals_ics

f = next(x for x in festivals(2027) if x["id"] == "khai-hoi-chua-bai-dinh")
venue = f["venues"][0]
print(f["date"], f["name"], "|", f["provinces"][0]["name"], "|", venue["name"], venue["coordinates"]["lat"], venue["coordinates"]["lon"])
open("vietnam-festivals-2027.ics", "w", encoding="utf-8", newline="").write(festivals_ics(2027))
```

同一个文件也可用命令行生成：`nhatnguyet festivals 2027 --ics > vn.ics`。

## 数据集

CC BY 4.0 许可，注明出处即可用于商业产品和 AI 训练。

| 数据集 | 内容 | 大小 |
|---|---|---:|
| [`nhatnguyet/ziwei-readings`](https://huggingface.co/datasets/nhatnguyet/ziwei-readings) | 1,761,936 个附论断的紫微命盘：1900 至 2100 年每一天 × 12 时辰 × 2 种性别 | 10.37 GB |
| [`nhatnguyet/bazi-readings`](https://huggingface.co/datasets/nhatnguyet/bazi-readings) | 1,761,936 个附论断的八字命盘，范围相同 | 1.56 GB |
| [`nhatnguyet/numerology-readings`](https://huggingface.co/datasets/nhatnguyet/numerology-readings) | 73,414 份数字命理档案，每个出生日期一份 | 0.08 GB |
| [`nhatnguyet/ziwei-knowledge`](https://huggingface.co/datasets/nhatnguyet/ziwei-knowledge) | 2,787 个知识单元（某星在某宫、某个格局……），附本站三种语言的文字与 885 段古籍原文 | |
| [`nhatnguyet/bazi-knowledge`](https://huggingface.co/datasets/nhatnguyet/bazi-knowledge) | 973 个单元（按月论日主、日柱与时辰、十神……），1,589 段古籍原文 | |
| [`nhatnguyet/numerology-knowledge`](https://huggingface.co/datasets/nhatnguyet/numerology-knowledge) | 143 个单元（核心数字、周期数字、人生主题），195 段原文 | |
| [`nhatnguyet/sach-co`](https://huggingface.co/datasets/nhatnguyet/sach-co) | 373 篇公有领域古籍全文（约 350 部作品），7,265 万字符 | 纯文本 147 MB，Parquet 70 MB |
| [`nhatnguyet/classical-parallel`](https://huggingface.co/datasets/nhatnguyet/classical-parallel) | 1,328 段对齐的《易经》文本：文言原文配公有领域的英文（952 段）与法文（376 段）译文 | |
| [术语表](./du-lieu/terminology/README.md) | 428 个术语，含越南文、繁体与简体中文、拼音和英文，涵盖各库输出的全部名称 | |
| [AI 评测集](./ai-eval/README.md) | 1,520 道计算题，有英文、越南文、中文（农历日期、春节、四柱、命盘），其中 626 道（41%）为难题 | |
| [1900 至 2100 年春节](./history/README.md) | 201 年在 UTC+7 与 UTC+8 下的春节，附实际使用的历法与出处 | |
| [33 个历法与文化数据集](https://nhatnguyet.org/zh/du-lieu) | 1900 至 2100 年阴阳历、节气、六十四卦、78 张塔罗牌、206 个节庆、456 篇祭文……CSV、JSON、Parquet 格式，附 [DOI](https://doi.org/10.5281/zenodo.23009396) | |

三个论断数据集合计 **3,597,286 个命盘，压缩后 12.02 GB**，分为三部分：附论断编号的结构化命盘（`charts/`，1.55 GB）、按语言预先拼好的全文（`assembled/<system>/<en|vi|zh>/`，10.42 GB），以及每条论断、古籍引文、文章只存一次的文本库（`store/`，0.04 GB）。论断引用古籍时注明书名与章节。每个出生年份一个文件。**解压后体积非常大**（命盘之间文字重复：紫微一年的预拼全文每种语言约 2.7 GB），请用流式读取或按年下载。

知识数据集是精简版：每个单元一行，文本编号与论断数据集相同，附论断引擎为该单元查找的公有领域古籍段落，以及规则编号。古籍：文言 306 篇、英文 36 篇、法文 20 篇、越南文 11 篇；按主题：易经与卜筮 192、信仰与礼俗 24、越南历史与文化 22、数字命理 21、三式 20、历法与择日 19、八字与命理 17、风水 16、佛教 14、相术 13、占星与塔罗 7、紫微 6、其他 2。其中 38 篇为光学字符识别文本，带 `ocr` 标记。每篇均有 `pd_basis` 字段，说明其属于公有领域的依据。按项目方的选择，`sach-co` 用中性编号（`sc-0416`）而非书名与作者标识每篇文本；知识数据集与论断文本库则为引用的每段文字注明书名与作者。

```python
from datasets import load_dataset

units = load_dataset("nhatnguyet/ziwei-knowledge", "major-star-in-palace", split="train")
row = units[0]
print(len(units), row["unit_id"])
print(row["classical"][0]["book_title_original"], "|", row["classical"][0]["classical_text"][:20])

books = load_dataset("nhatnguyet/sach-co", split="train")
print(len(books), sum(books["characters"]))
```

```text
2016 major-star-in-palace/zi-wei.life.zi
紫微斗数全书 | 子宫喜丁己庚生人贵格，壬癸生人不耐久。
373 72650969
```

## 面向 AI

大语言模型不应心算农历日期或星曜位置。以下四种方式可以把真实数据交给它们：

- **MCP 服务器**，本地运行，工具有 `lunar_convert`、`solar_terms`、`auspicious_hours`、`cast_ziwei`、`cast_bazi`、`numerology`、`festivals`、`render_chart_svg`（含流派选项）：`claude mcp add nhatnguyet -- npx -y @nhatnguyet/mcp`。Claude Desktop、Cursor、VS Code 的配置见 [js/packages/mcp](./js/packages/mcp/README.md)。
- **Agent Skill**，让助手调用工具而不是猜测：[skills/](./skills/README.md)。
- **`chartToText`**（Python 中为 `chart_to_text`）把命盘转成简洁的 Markdown，便于放进提示词：

  ```js
  import { castZiWei, chartToText } from "@nhatnguyet/ziwei";

  const chart = castZiWei({ date: "1990-09-19", time: "20:00", gender: "male" });
  console.log(chartToText(chart, { detail: "summary" }));
  ```

  ```text
  # Zi Wei Dou Shu chart

  Computed data only, no interpretation.

  - Gender: male
  - Birth date (Gregorian): 1990-09-19 20:00
  - Birth hour: Xu (19:00-20:59)
  - Birth date (lunar): 1990-08-01
  - Year pillar: Geng Wu
  - Yin-yang: Yang Male
  - Bureau: Earth Five (5)
  ...
  ```

- **数据**：[AI 评测集](./ai-eval/README.md) 衡量模型在使用与不使用工具时答对这些事实的比例（`ai-eval/score.py`）；[术语表](./du-lieu/terminology/README.md) 把每个术语在越南文、中文和英文之间一一对应；[数据集](#数据集) 用于训练与检索。

## 网页小组件

<p align="center"><img src="./assets/widgets/tong-hop.png" alt="Nhat Nguyet 的五个网页组件" width="720"></p>

[`@nhatnguyet/widgets`](./js/packages/widgets) 是 5 个网页组件（今日日期、月历、黄道吉时、春节倒计时、日期换算），直接在读者的浏览器中运行：代码开源并收录在本仓库，无需服务器，不发网络请求，支持浅色与深色主题，文字有英文、越南文、中文。

```html
<script type="module" src="https://cdn.jsdelivr.net/npm/@nhatnguyet/widgets/dist/nn-widgets.js"></script>
<nn-lich-thang lang="en" theme="auto" country="VN"></nn-lich-thang>
```

`country`（默认 `VN`，也可设 `CN`、`KR`、`JP` 等）切换到其他国家的农历。属性与各组件预览：[widgets/](./widgets/README.md)。

nhatnguyet.org 另有 14 个以 iframe 嵌入的小组件（术语、吉日、彩票结果等）；它们是网站提供的服务，不是本仓库的开源代码：[nhatnguyet.org/widget](https://nhatnguyet.org/zh/widget)。

## 示例与文档

- **在线试用**：[nhatnguyet.org/zh/ma-nguon-mo/thu](https://nhatnguyet.org/zh/ma-nguon-mo/thu)，在浏览器中直接运行各个包。
- **API 文档**：[nhatnguyet.org/zh/ma-nguon-mo/tai-lieu](https://nhatnguyet.org/zh/ma-nguon-mo/tai-lieu) 与 [docs/api-en.md](./docs/api-en.md)。
- **教程**：[用 JavaScript 排紫微命盘](https://nhatnguyet.org/zh/blog/lap-la-so-tu-vi-bang-javascript) · [为应用加入农历与节庆](https://nhatnguyet.org/zh/blog/lich-am-le-hoi-cho-ung-dung) · [能引用古籍的 AI 助手](https://nhatnguyet.org/zh/blog/tro-ly-ai-trich-dan-sach-co) · [用 Python 分析命盘数据](https://nhatnguyet.org/zh/blog/phan-tich-du-lieu-la-so-bang-python)。
- **背景知识**：[农历与节气](https://nhatnguyet.org/zh/blog/co-so-khoa-hoc-am-lich-tiet-khi) ·
  [紫微命盘](https://nhatnguyet.org/zh/blog/co-so-khoa-hoc-la-so-tu-vi) ·
  [八字](https://nhatnguyet.org/zh/blog/co-so-khoa-hoc-bat-tu) ·
  [数字命理](https://nhatnguyet.org/zh/blog/co-so-khoa-hoc-than-so-hoc) ·
  [古籍与论断](https://nhatnguyet.org/zh/blog/co-so-khoa-hoc-sach-co-loi-luan) ·
  [Nhat Nguyet 如何核验](https://nhatnguyet.org/zh/blog/co-so-khoa-hoc-kiem-chung)。

[`examples/`](./examples/README.md) 提供快速试用（免构建的 HTML 页面、Node、Python）和四个可直接复制的模板：

| 模板 | 内容 |
|---|---|
| [`nextjs-lunar-calendar`](./examples/nextjs-lunar-calendar) | Next.js 页面（静态导出）：带农历日期与节气的月历、春节倒计时、通过表单排紫微命盘 |
| [`telegram-bot`](./examples/telegram-bot) | grammY 机器人：`/today`、`/tet`、`/ziwei`，用英文、越南文或中文回复 |
| [`google-sheets`](./examples/google-sheets) | 一个 `Code.gs` 文件提供 `=LUNARDATE()`、`=SEXAGENARY()`、`=SOLARTERM()`、`=SOLARDATE()` |
| [`jupyter`](./examples/jupyter) | 笔记本：1900 至 2100 年越南与中国的春节、农历月与闰月，附图表 |

## 从 iztro 迁移

`@nhatnguyet/ziwei/iztro` 与 iztro **兼容**：`astro.bySolar` 和 `astro.byLunar` 接受相同参数，返回与 iztro 的 `FunctionalAstrolabe` 结构相同的 JSON，保留六种显示语言及其方法（`palace()`、`star()`、`surroundedPalaces()`、`horoscope()`、`fliesTo()`、`use()`……），但按越南农历计算（传 `{ country: "CN" }` 则用北京时间）。

```diff
- import { astro } from "iztro";
+ import { astro } from "@nhatnguyet/ziwei/iztro";
```

在 2,006 个运限上与 iztro 对比，大限宫、小限宫、流年宫及流年星曜位置都一致；其余每一处差异（庚年四化、闰月规则、两个朔落在北京午夜的月份）都已计数并说明。少数位置有意依照越南古籍：主星亮度分五级（iztro 为七级）、天贵，以及庚年的魁钺。未安放：仅见于中文典籍的五颗杂曜、将前诸星，以及大限与流月的流曜。传入上文的流派选项，即可在火铃、庚年四化与天厨上与 iztro 一致。完整清单：[docs/chuyen-tu-iztro.md](./docs/chuyen-tu-iztro.md)。

## 常见问题

<details>
<summary><b>为什么越南农历与中国农历不同？</b></summary>

规则相同，钟表不同。农历月从朔所在的那一天开始，而"哪一天"按当地时间判断。朔落在世界时 16 点到 17 点之间时，河内尚未过午夜，北京已过午夜，于是越南的月份早一天开始。1985 年春节相差整整一个月（越南 1 月 21 日，中国 2 月 20 日），因为闰月落在不同的年份。
</details>

<details>
<summary><b>子时是几点？23:30 出生用哪一天？</b></summary>

子时为 23:00 至 00:59。紫微保留输入的日期（有些书改算到次日；想按那些书，就输入次日日期）。八字的日柱在 23:00 换日，设 `schools: { ziHour: "split-at-midnight" }` 则在午夜换日。两者都会写在命盘的 `notes` 中。
</details>

<details>
<summary><b>八字月柱按农历月还是按节气？</b></summary>

按节气：年在立春交替，月在每个节交替。若用农历月作月柱，约四分之一的日子月柱会不同（1900 至 2100 年为 24.3%）。
</details>

<details>
<summary><b>可以用这些数据训练 AI 模型吗？</b></summary>

可以，包括商业用途，按 CC BY 4.0。只需注明"数据：Nhat Nguyet (nhatnguyet.org)"。
</details>

<details>
<summary><b>数字命理如何处理带声调的越南语姓名？</b></summary>

先去掉声调符号（"Đ" 按 "D" 计），再用毕达哥拉斯字母数字表计算。保留卓越数 11、22、33。
</details>

## 参与贡献

最有用的是附带出处（书名与章节，或天文数据）的错误报告；见 [CONTRIBUTING.md](./CONTRIBUTING.md)。

**移植挑战**：用另一种语言（Go、Rust、Dart、Swift、C#……）重写引擎，并通过 [`ca-kiem/`](./ca-kiem) 中全部 17,291 组测试用例。读取 `vao`，与 `ra` 比对；规则见 [CONTRIBUTING.md](./CONTRIBUTING.md#port-challenge)。

## 引用与许可

| 部分 | 许可 |
|---|---|
| 代码 | [MIT](./LICENSE) |
| 数据、论断、测试用例 | [CC BY 4.0](./DATA-LICENSE)：允许商业使用与 AI 训练，须注明出处 |
| 古籍 | 原文属公有领域；数字化与清理部分采用 CC BY 4.0 |

署名格式：`数据：Nhat Nguyet (nhatnguyet.org)`，尽可能附上链接。Nhat Nguyet 的名称与标志不在上述许可范围内。引用本软件（历法方法见[技术论文](./docs/paper/paper.pdf)）：

```bibtex
@software{nhatnguyet_2026,
  author = {{Nhat Nguyet}},
  title  = {Nhat Nguyet: open source code and data for Zi Wei Dou Shu, BaZi and numerology},
  year   = {2026},
  url    = {https://nhatnguyet.org/en/ma-nguon-mo},
  doi    = {10.5281/zenodo.24358013}
}
```

网站：[nhatnguyet.org](https://nhatnguyet.org) · 邮箱：lienhe@nhatnguyet.org

<p align="center"><sub>数据：Nhat Nguyet (nhatnguyet.org) · 代码 MIT · 数据 CC BY 4.0</sub></p>
