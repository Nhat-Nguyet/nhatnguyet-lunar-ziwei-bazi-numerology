<h1 align="center">Nhat Nguyet</h1>

<p align="center">
  <b>베트남 음력은 중국 음력이 아닙니다. 널리 쓰이는 라이브러리는 1900~2100년 중 2,724일에 베트남 음력 날짜를 틀리게 냅니다.</b><br>
  올바른 역법 위에서 계산하는 자미두수, 사주팔자, 수비학, 축제, 길한 시진을 JavaScript, Python, MCP로 · 결과는 English, Tiếng Việt, 中文 · 공용 테스트 벡터 17,291개
</p>

<p align="center">
  <a href="./README.md">English</a> · <a href="./README.vi.md">Tiếng Việt</a> · <a href="./README.zh.md">中文</a> · <a href="./README.ja.md">日本語</a> · <b>한국어</b> · <a href="./README.fr.md">Français</a> · <a href="./README.th.md">ไทย</a>
  <br>
  <a href="https://nhatnguyet.org/en/ma-nguon-mo/thu">플레이그라운드</a> ·
  <a href="https://nhatnguyet.org/en/ma-nguon-mo/tai-lieu">문서</a> ·
  <a href="./docs/paper/paper.pdf">논문</a> ·
  <a href="https://huggingface.co/nhatnguyet">Hugging Face</a> ·
  <a href="https://nhatnguyet.org/en/ma-nguon-mo">프로젝트 페이지</a>
</p>

<p align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="./assets/la-so-tu-vi-toi.svg">
    <img src="./assets/la-so-tu-vi.svg" alt="라이브러리로 그린 자미두수 명반" width="720">
  </picture>
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/@nhatnguyet/ziwei"><img alt="npm" src="https://img.shields.io/npm/v/@nhatnguyet/ziwei.svg?label=npm"></a>
  <a href="https://pypi.org/project/nhatnguyet/"><img alt="PyPI" src="https://img.shields.io/pypi/v/nhatnguyet.svg"></a>
  <a href="./ca-kiem"><img alt="테스트 벡터: 17,291개" src="https://img.shields.io/badge/test%20vectors-17%2C291-2e7d32.svg"></a>
  <a href="https://github.com/Nhat-Nguyet/nhatnguyet-lunar-ziwei-bazi-numerology/actions/workflows/kiem.yml"><img alt="자동 검사" src="https://github.com/Nhat-Nguyet/nhatnguyet-lunar-ziwei-bazi-numerology/actions/workflows/kiem.yml/badge.svg?branch=main"></a>
  <a href="./LICENSE"><img alt="코드: MIT" src="https://img.shields.io/badge/code-MIT-1f6f6b.svg"></a>
  <a href="./DATA-LICENSE"><img alt="데이터: CC BY 4.0" src="https://img.shields.io/badge/data-CC%20BY%204.0-1f6f6b.svg"></a>
  <a href="https://doi.org/10.5281/zenodo.24358013"><img alt="DOI" src="https://zenodo.org/badge/DOI/10.5281/zenodo.24358013.svg"></a>
</p>

## 빠른 시작

**JavaScript, TypeScript** (Node 18 이상, 브라우저)

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

**Python** (3.9 이상, 표준 라이브러리만 사용): 결과가 같고, SVG도 바이트 단위까지 똑같습니다.

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

**명령줄**: `npx`를 쓰면 설치가 필요 없고, `pip install nhatnguyet` 후에는 `nhatnguyet ...`로 실행합니다.

<p align="center"><img src="./assets/cli-demo.svg" alt="터미널 녹화: 1985년 1월 21일의 중국 음력 날짜, 이어서 격자로 그린 자미두수 명반" width="640"></p>

```bash
npx @nhatnguyet/cli ziwei 1990-09-19 20:00 male --year 2026
```

<details>
<summary>출력 (12궁을 격자로 보여 준 뒤 유년, 대한, 격국)</summary>

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

다른 명령: `bazi`, `lunar`, `solar`, `terms`, `numerology`, `festivals`(달력 파일은 `--ics`), `hours`. 옵션은 `--lang vi|zh`, `--json`, `--svg chart.svg`, 그리고 아래의 학파 옵션. 모든 옵션을 담은 영문 API 문서: [docs/api-en.md](./docs/api-en.md).

## 목차

1. [믿을 수 있는 이유](#믿을-수-있는-이유)
2. [설치](#설치)
3. [기능](#기능)
4. [데이터셋](#데이터셋)
5. [AI 활용](#ai-활용)
6. [위젯](#위젯)
7. [예제와 문서](#예제와-문서)
8. [iztro에서 옮겨 오기](#iztro에서-옮겨-오기)
9. [자주 묻는 질문](#자주-묻는-질문)
10. [기여하기](#기여하기)
11. [인용과 라이선스](#인용과-라이선스)

## 믿을 수 있는 이유

**과학은 예측이 아니라 방법에 있습니다.** 역법은 천문학이며, 1900~2100년에 걸쳐
NASA와 IMCCE로 검증했습니다.

| 검증 항목 | 결과 |
|---|---|
| NASA 대비 합삭(2,474회) | 평균 0.9분 늦음, 최대 3.9분 |
| NASA 합삭과 IMCCE 절기로 재구성한 음력 월 | 2,461개월 중 2,459개월 일치(나머지 둘은 합삭이 자정에서 1분 이내) |
| IMCCE 대비 절기(4,824회) | 평균 0.27분 차이, 최대 0.9분(분 단위 반올림), 모든 절기가 올바른 날짜 |
| 베트남(UTC+7)과 중국(UTC+8), 같은 규칙 | 2,814일과 설날 10번이 다름 |

- **기술 논문**: [베트남 음양력 계산](./docs/paper/paper.pdf)(PDF)은 계산 방법, 오차
  예산, NASA, IMCCE, JPL DE440 대비 검증, 그리고 베트남과 중국 역법이 다른 날
  하나하나에 대한 설명을 담고 있습니다. 논문의 모든 수치는
  `docs/paper/reproduce.sh`로 다시 계산됩니다.
- **공용 테스트 벡터**: [`ca-kiem/`](./ca-kiem)에는
  [nhatnguyet.org](https://nhatnguyet.org)를 구동하는 기준 엔진이 생성한 **케이스
  17,291개**(입력 `vao`, 기대 출력 `ra`)가 들어 있습니다. 역법 케이스 14,936개,
  자미두수 명반 777개, 사주팔자 명반 777개, 수비학 프로필 600개, 축제 연도 201개,
  그리고 학파 옵션 케이스 432개입니다. TypeScript와 Python은 푸시할 때마다 이 모두를
  통과합니다.
- **설날의 역사**: [`history/`](./history/README.md)에는 1900~2100년 모든 해의
  UTC+7과 UTC+8 기준 설날이, 베트남이 실제로 쓴 역법, 그리고 문서로 확인되는 해마다의
  출처와 함께 실려 있습니다.
- **정직한 범위**: 자미두수, 사주팔자, 수비학은 전통 학파의 규칙이며 과학적으로
  검증되지 않았습니다. 건강, 재정, 법률 결정에 사용하지 마십시오. 학파마다 견해가
  갈리는 부분은 어떤 규칙을 따르는지 밝히고, 바꿔 쓸 수 있게 했습니다
  ([학파 옵션](#학파-옵션)).

### 다른 라이브러리와 비교

[iztro](https://github.com/SylarLong/iztro)와
[lunar-javascript](https://github.com/6tail/lunar-javascript)는 꼼꼼하게 만들어져 널리
쓰이는 라이브러리이며, 둘 다 구현한 범위, 즉 베이징 시간(UTC+8) 기준 중국 역법으로는
정확합니다. 베트남은 같은 규칙을 하노이 시간(UTC+7)으로 적용합니다. 1900~2100년의
모든 날을 비교한 결과입니다([doi-chieu/](./doi-chieu/README.md), `node chay.mjs`로
재현 가능).

| | 결과 |
|---|---:|
| lunar-javascript와 음력 날짜가 다른 날 | 73,414일 중 2,724일 |
| lunar-javascript와 설날이 다른 해 | 201년 중 9년 |
| lunar-javascript와 윤달이 다른 해 | 201년 중 6년 |
| `country: "CN"`으로 해도 lunar-javascript와 다른 날 | 150일(5개월) |
| iztro와 Cục, 명궁, 주성 중 하나라도 다른 자미두수 명반(모든 날 × 12시진) | 880,968건 중 38,752건(4.40%) |
| 그중 시간대 때문인 것(iztro는 `vi-VN`에서도 베이징 시간 사용) | 26,602건(3.02%) |
| 그중 윤달 규칙 때문인 것(iztro `fixLeap`, 옵션) | 11,818건(1.34%) |
| 그중 둘 다 아닌 것 | 332건(0.04%) |
| IMCCE 대비 절기 최대 오차: Nhat Nguyet / lunar-javascript | 0.9분 / 0.28분 |

**두 숫자는 서로 다른 것을 잽니다.** 2,724일과 설날 9년은 Nhat Nguyet(베트남,
UTC+7)과 lunar-javascript의 비교입니다. 위 표의 2,814일과 설날 10년은 Nhat Nguyet
계산 엔진 자체를 UTC+7과 UTC+8로 비교한 숫자입니다. 둘이 다른 까닭은
`country: "CN"`이 lunar-javascript와 완전히 같지 않기 때문입니다. 1914, 1916, 1920,
2057, 2097년에 한 달씩, 모두 150일이 여전히 다릅니다. 1914, 1916, 1920년은
lunar-javascript가 중국의 옛 역서에 맞추려고 1960년 이전 날짜를 일부러 보정한
부분이고, 2057년과 2097년은 합삭이 정확히 베이징 자정(16:00 UT)에 걸려 어느 쪽으로도
판정하기 어려운 경우입니다.

**시간대도 윤달 규칙도 아닌 332건의 명반**은 모두 한 달, 곧 2057년 9월 28일부터의
30일에 몰려 있습니다. 이 달의 합삭은 16:00 UT입니다. Nhat Nguyet은 베이징 자정
직전으로 계산해 두 시간대 모두에서 28일에 달이 시작되고, lunar-javascript(따라서
iztro)는 직후로 계산해 29일에 시작됩니다. 위에서 말한 자정 경계 사례와 같은 것으로,
시간대나 윤달 규칙을 바꿔도 달라지지 않습니다.

예: 1985년 1월 21일 Tỵ시(사시) 출생. iztro는 Giáp Tý년 음력 12월 1일, Kim Tứ Cục,
명궁 Thân으로 계산합니다. Nhat Nguyet은 설날(Tết), 곧 Ất Sửu년 첫날, Thủy Nhị Cục,
명궁 Dậu로 계산합니다. `country: "CN"`을 넘기면 Nhat Nguyet도 중국 역법으로
계산합니다.

## 설치

버전 0.3.0. JavaScript 패키지는 TypeScript 타입을 갖춘 ESM이며 의존성이 없고,
Python 패키지는 표준 라이브러리만 사용합니다.

```bash
npm i @nhatnguyet/lunar @nhatnguyet/ziwei @nhatnguyet/bazi @nhatnguyet/numerology @nhatnguyet/festivals
pip install nhatnguyet
```

| 패키지 | 다른 이름 | 기능 |
|---|---|---|
| [`@nhatnguyet/lunar`](./js/packages/am-lich) | `@nhatnguyet/am-lich` | 베트남, 중국, 한국, 일본 외 7개 지역의 음력과 양력 변환, 간지, 분 단위 24절기, 28수, 납음, 길한 시진 |
| [`@nhatnguyet/ziwei`](./js/packages/tu-vi) | `@nhatnguyet/tu-vi` | 자미두수: 12궁, 별의 밝기, 사화, Tuần과 Triệt(순공과 절공), 대한과 유년, 유성, 고전 원문을 곁들인 격국, 학파 옵션, SVG, LLM용 텍스트, iztro 호환 계층 |
| [`@nhatnguyet/bazi`](./js/packages/bat-tu) | `@nhatnguyet/bat-tu` | 사주팔자: 절기 기준 사주, 지장간, 십신, 신살, 대운, 소운, SVG |
| [`@nhatnguyet/numerology`](./js/packages/than-so-hoc) | `@nhatnguyet/than-so-hoc` | 피타고라스 수비학(생명수, 표현수, 영혼수, 정점수, 도전수, 개인년수), 성조 부호가 있는 베트남어 이름 지원, SVG |
| [`@nhatnguyet/festivals`](./js/packages/le-hoi) | `@nhatnguyet/le-hoi` | 베트남 축제 206개와 어느 해든 그 해의 날짜, 성(省), 민족, 개최 장소, iCalendar 내보내기 |
| [`@nhatnguyet/cli`](./js/packages/cli) | | 명반을 터미널 격자, JSON, SVG, iCalendar로 출력, Python의 `nhatnguyet`와 같은 명령 |
| [`@nhatnguyet/mcp`](./js/packages/mcp) | | AI 어시스턴트용 MCP 서버 |
| [`@nhatnguyet/widgets`](./js/packages/widgets) | | 웹 컴포넌트 5개 |
| [`nhatnguyet`](./python) (PyPI) | | 위의 모든 기능을 담은 하나의 Python 패키지, 필드 단위까지 같은 결과 |

베트남어 이름의 패키지는 원래 이름으로 배포되는 같은 코드이며, 기존 import는 그대로
동작합니다.

## 기능

모든 라이브러리는 [nhatnguyet.org](https://nhatnguyet.org)와 Nhat Nguyet 앱을 구동하는
엔진을 필드 단위까지 그대로 재현합니다. 네트워크 호출이 없습니다. 결과는 영어
(`lang: "en"`, 기본값), 베트남어(`"vi"`), 중국어(`"zh"`)로 나옵니다. 영어 결과에서
간지는 기본적으로 병음이며, 한자나 한월음(Sino-Vietnamese)으로 쓰려면
`terms: "han"` 또는 `"vi"`를 지정합니다.

<table>
  <tr>
    <td align="center" width="33%"><a href="./assets/la-so-tu-vi.svg"><picture><source media="(prefers-color-scheme: dark)" srcset="./assets/la-so-tu-vi-toi.svg"><img src="./assets/la-so-tu-vi.svg" alt="라이브러리로 그린 자미두수 명반" width="260"></picture></a><br><sub>자미두수 · <code>castZiWei().toSvg()</code></sub></td>
    <td align="center" width="33%"><a href="./assets/la-so-bat-tu.svg"><picture><source media="(prefers-color-scheme: dark)" srcset="./assets/la-so-bat-tu-toi.svg"><img src="./assets/la-so-bat-tu.svg" alt="라이브러리로 그린 사주팔자 명반" width="260"></picture></a><br><sub>사주팔자 · <code>castBaZi().toSvg()</code></sub></td>
    <td align="center" width="33%"><a href="./assets/than-so-hoc.svg"><picture><source media="(prefers-color-scheme: dark)" srcset="./assets/than-so-hoc-toi.svg"><img src="./assets/than-so-hoc.svg" alt="라이브러리로 그린 수비학 프로필" width="260"></picture></a><br><sub>수비학 · <code>numerology().toSvg()</code></sub></td>
  </tr>
</table>

<p align="center"><sub>모든 그림은 라이브러리가 그린 SVG입니다. 클릭하면 원래 크기로 열립니다.</sub></p>

### 음력과 길한 시진

`@nhatnguyet/lunar`의 `toLunar`, `toSolar`, `solarTerms`, `auspiciousHours`(Python은
`to_lunar`, `to_solar`, `solar_terms`, `auspicious_hours`). `country`를 넘기지 않으면
베트남 역법(UTC+7)입니다. 그 밖에 중국, 대만, 홍콩, 마카오, 싱가포르, 말레이시아,
인도네시아, 필리핀(UTC+8), 한국, 일본(UTC+9)을 지원합니다.

`auspiciousHours`는 하루의 12시진을 길한 시진(hoàng đạo, 황도) 또는 흉한 시진(hắc đạo,
흑도) 표시와 그 시진을 맡은 신(神)과 함께, 베트남 역서에 인쇄되는 그대로 돌려줍니다
(명령줄은 `nhatnguyet hours`, MCP 도구는 `auspicious_hours`).

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

### 자미두수

`castZiWei`는 명반 전체를 만듭니다. 명궁과 신궁, 국(局), 주성 14개와 보조성 55개 및
그 밝기, 사화, Tuần과 Triệt, 대한, 보려는 해와 그 해의 유성, 그리고 자미두수전서
(紫微斗數全書)의 격국과 그 고전 원문입니다. `chart.toSvg()`가 명반을 그리고,
`chartToText`는 언어 모델용 간결한 Markdown으로 바꿉니다. iztro 호환 계층에는 조회
메서드와 운세 계산이 있습니다: `palace()`, `star()`, `surroundedPalaces()`,
`horoscope()`, `fliesTo()`([iztro에서 옮겨 오기](#iztro에서-옮겨-오기)).

### 학파 옵션

책마다 견해가 다른 곳에서는 라이브러리가 기본값을 고르고, 따르는 책의 이름을 밝히며,
이름이 밝혀진 다른 출처의 규칙으로 바꿀 수 있게 합니다
([docs/schools.md](./docs/schools.md)). 기본값은 바뀌지 않으며, 옵션마다 전용
테스트 벡터가 있습니다.

| 옵션 | 값(기본값이 먼저) | 바뀌는 것 |
|---|---|---|
| `fireBell` | `vietnamese`, `quanshu`, `swap-for-female`, `swap-for-yin-male-yang-female` | 화성과 영성 |
| `leapMonth` | `whole`, `split-at-15`, `next-month` | 윤달에 태어난 경우 쓰는 달 |
| `transformations` | `vietnamese`, `quanshu`, `zhongzhou` | 경(庚)간의 사화 |
| `heavenlyKitchen` | `vietnamese`, `chinese` | 계(癸)년의 천주(天廚) |
| `injuryMessenger` | `standard`, `zhongzhou` | 천상(天傷)과 천사(天使) |
| `ziHour` (BaZi) | `next-day-from-23`, `split-at-midnight` | 23:00~24:00에 태어난 경우의 일주 |

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

명령줄에서는 `--fire-bell quanshu`, `--leap-month split-at-15`,
`--zi-hour split-at-midnight` 등을 씁니다. iztro 2.6.5와 명반 610개를 비교하면,
`{ fireBell: "quanshu", transformations: "quanshu", heavenlyKitchen: "chinese" }`로
화성과 영성의 위치(차이 484건), 경년의 사화(126건), 계년의 천주(59건)가 모두 0이
됩니다.

### 사주팔자와 수비학

`castBaZi`는 해를 Lập Xuân(입춘)에, 달을 각 절(節)에 분 단위로 바꿉니다. 지장간,
십신, 12운성, 신살, 대운, 소운을 냅니다. `numerology`는 피타고라스 방식을 따르며,
베트남어 성조 부호를 없애고("Đ"는 "D"로 셉니다) 마스터 넘버 11, 22, 33을
유지합니다.

### 축제

`@nhatnguyet/festivals`의 `festivals(year)`는 데이터셋의 축제 206개 가운데 음력이나
양력으로 날짜가 고정된 164개를 1900~2100년의 어느 해에 대해서든 돌려줍니다(나머지
42개는 주최 측이 해마다 날짜를 정합니다). 각 축제에는 2025년 기준 34개 성(省) 지도상의
성, 설명에 나와 있는 경우 그 축제를 지내는 민족, 그리고 개최 장소가 있으며, 좌표는
출처가 있는 경우에만 붙습니다. `group`, `scope`, `level`은 어느 언어에서나 영어
코드입니다. `festivalsIcs(year)`는 축제마다 종일 일정 하나를 담은 iCalendar
(RFC 5545) 파일을 씁니다.

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

명령줄에서 같은 파일 만들기: `nhatnguyet festivals 2027 --ics > vn.ics`.

## 데이터셋

CC BY 4.0이며, 출처를 표기하면 상업용 제품과 AI 학습에 쓸 수 있습니다.

| 데이터셋 | 내용 | 크기 |
|---|---|---:|
| [`nhatnguyet/ziwei-readings`](https://huggingface.co/datasets/nhatnguyet/ziwei-readings) | 해석이 담긴 자미두수 명반 1,761,936건: 1900~2100년의 모든 날 × 12시진 × 2개 성별 | 10.37 GB |
| [`nhatnguyet/bazi-readings`](https://huggingface.co/datasets/nhatnguyet/bazi-readings) | 해석이 담긴 사주팔자 명반 1,761,936건, 같은 범위 | 1.56 GB |
| [`nhatnguyet/numerology-readings`](https://huggingface.co/datasets/nhatnguyet/numerology-readings) | 수비학 프로필 73,414건, 생년월일마다 1건 | 0.08 GB |
| [`nhatnguyet/ziwei-knowledge`](https://huggingface.co/datasets/nhatnguyet/ziwei-knowledge) | 지식 단위 2,787개(궁에 든 별, 격국 등)와 3개 언어로 된 사이트 텍스트, 고전 구절 885개 | |
| [`nhatnguyet/bazi-knowledge`](https://huggingface.co/datasets/nhatnguyet/bazi-knowledge) | 단위 973개(월별 일간, 일주와 시, 십신 등), 고전 구절 1,589개 | |
| [`nhatnguyet/numerology-knowledge`](https://huggingface.co/datasets/nhatnguyet/numerology-knowledge) | 단위 143개(핵심 수, 주기 수, 삶의 주제), 구절 195개 | |
| [`nhatnguyet/sach-co`](https://huggingface.co/datasets/nhatnguyet/sach-co) | 퍼블릭 도메인 고전 373종(약 350개 작품), 7,265만 자, 전문 | 텍스트 147 MB, Parquet 70 MB |
| [`nhatnguyet/classical-parallel`](https://huggingface.co/datasets/nhatnguyet/classical-parallel) | 역경의 정렬된 구간 1,328개: 한문 원문과 퍼블릭 도메인 영어 번역(952개), 프랑스어 번역(376개) | |
| [용어집](./du-lieu/terminology/README.md) | 베트남어, 번체와 간체 중국어, 병음, 영어로 된 용어 416개, 라이브러리가 출력하는 모든 이름 | |
| [AI 평가 세트](./ai-eval/README.md) | 영어, 베트남어, 중국어로 된 계산 문제 1,520개(음력 날짜, 설날, 사주, 명반), 그중 절반은 어려운 사례 | |
| [설날 1900~2100](./history/README.md) | 201년 동안의 UTC+7과 UTC+8 기준 설날, 실제로 쓰인 역법과 출처 포함 | |
| [역법과 문화 데이터셋 33종](https://nhatnguyet.org/en/du-lieu) | 1900~2100년 음양력, 절기, 64괘, 타로 78장, 축제 206개, 제례 기도문 456편... CSV, JSON, Parquet, [DOI](https://doi.org/10.5281/zenodo.23009396) 부여 | |

세 해석 데이터셋은 모두 합쳐 **명반 3,597,286건, 압축 시 12.02 GB**이며 세 부분으로
나뉩니다. 해석 ID가 붙은 구조화된 명반(`charts/`, 1.55 GB), 언어별로 미리 결합한
전문(`assembled/<system>/<en|vi|zh>/`, 10.42 GB), 그리고 각 해석, 고전 인용, 아티클을 한 번씩만
저장하는 텍스트 저장소(`store/`, 0.04 GB)입니다. 해석은 서명과 편명을 밝혀 고전을
인용합니다. 파일은 출생 연도마다 하나입니다. **압축을 풀면 매우 큽니다**(텍스트가
명반마다 반복되기 때문으로, 자미두수 결합본 텍스트는 1년치가 언어당 약 2.7 GB). 스트리밍으로
읽거나 한 해씩 내려받으세요.

지식 데이터셋은 압축판입니다. 단위마다 한 행이며, 해석과 같은 텍스트 ID, 해석 엔진이 그
단위에 대해 찾아보는 퍼블릭 도메인 구절, 규칙 ID를 담습니다. 고전 문헌의 구성은 한문
306종, 영어 36종, 프랑스어 20종, 베트남어 11종입니다. 주제별로는 역경과 점술 192종,
신앙과 의례 24종, 베트남 역사와 문화 22종, 수비학 21종, 삼식 20종, 역법과 택일 19종,
사주와 명리 17종, 풍수 16종, 불교 14종, 관상 13종, 점성술과 타로 7종, 자미두수 6종,
기타 2종입니다. 이 가운데 38종은 OCR 텍스트이며 `ocr` 플래그가 붙어 있습니다. 각
문헌에는 퍼블릭 도메인인 근거를 밝힌 `pd_basis` 필드가 있습니다.

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

## AI 활용

언어 모델이 음력 날짜나 별의 위치를 머릿속으로 셈하게 해서는 안 됩니다. 정확한 수치를
건네는 방법은 네 가지입니다.

- **MCP 서버**: 로컬에서 실행되며, 도구는 `lunar_convert`, `solar_terms`,
  `auspicious_hours`, `cast_ziwei`, `cast_bazi`, `numerology`, `festivals`,
  `render_chart_svg`입니다(학파 옵션 포함).
  `claude mcp add nhatnguyet -- npx -y @nhatnguyet/mcp`. Claude Desktop, Cursor,
  VS Code 설정 방법: [js/packages/mcp](./js/packages/mcp/README.md).
- **Agent Skill**: 어시스턴트가 추측하지 말고 도구를 호출하도록 안내합니다:
  [skills/](./skills/README.md).
- **`chartToText`**(Python은 `chart_to_text`): 명반을 프롬프트에 넣기 좋은 간결한
  Markdown으로 바꿉니다.

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

- **데이터**: [AI 평가 세트](./ai-eval/README.md)는 모델이 도구를 쓸 때와 쓰지 않을
  때 이런 사실을 얼마나 자주 맞히는지 잽니다(`ai-eval/score.py`).
  [용어집](./du-lieu/terminology/README.md)은 모든 용어를 베트남어, 중국어, 영어 사이에
  대응시킵니다. [데이터셋](#데이터셋)은 학습과 검색에 쓰입니다.

## 위젯

<p align="center"><img src="./assets/widgets/web-components.png" alt="Nhat Nguyet 웹 컴포넌트 5종" width="720"></p>

[`@nhatnguyet/widgets`](./js/packages/widgets)는 독자의 브라우저 안에서 실행되는 웹
컴포넌트 5종(오늘의 달력, 월간 달력, 길한 시진, 설날 카운트다운, 날짜 변환)입니다.
코드는 이 저장소에 공개되어 있고, 서버가 필요 없으며 네트워크 요청을 하지 않습니다.
밝은 테마와 어두운 테마, 영어, 베트남어, 중국어를 지원합니다.

```html
<script type="module" src="https://cdn.jsdelivr.net/npm/@nhatnguyet/widgets/dist/nn-widgets.js"></script>
<nn-lich-thang lang="en" theme="auto" country="VN"></nn-lich-thang>
```

`country`(기본값 `VN`, 그 밖에 `CN`, `KR`, `JP`...)로 다른 나라의 음력으로 바꿀 수
있습니다. 속성과 미리보기: [widgets/](./widgets/README.md).

nhatnguyet.org는 iframe으로 삽입하는 위젯 14종(용어, 길일, 복권 결과 등)도
제공하지만, 이는 웹사이트의 서비스이며 이 저장소의 공개 코드가 아닙니다:
[nhatnguyet.org/widget](https://nhatnguyet.org/widget?lang=en).

## 예제와 문서

- **플레이그라운드**: [nhatnguyet.org/en/ma-nguon-mo/thu](https://nhatnguyet.org/en/ma-nguon-mo/thu), 브라우저에서 패키지를 직접 실행합니다.
- **API 문서**: [nhatnguyet.org/en/ma-nguon-mo/tai-lieu](https://nhatnguyet.org/en/ma-nguon-mo/tai-lieu)와 [docs/api-en.md](./docs/api-en.md).
- **가이드**: [JavaScript로 Tử Vi 명반 만들기](https://nhatnguyet.org/en/blog/lap-la-so-tu-vi-bang-javascript) · [앱을 위한 음력과 축제](https://nhatnguyet.org/en/blog/lich-am-le-hoi-cho-ung-dung) · [고전을 인용하는 AI 어시스턴트](https://nhatnguyet.org/en/blog/tro-ly-ai-trich-dan-sach-co) · [Python으로 명반 데이터 분석하기](https://nhatnguyet.org/en/blog/phan-tich-du-lieu-la-so-bang-python).
- **배경 지식**: [음력과 절기](https://nhatnguyet.org/en/blog/co-so-khoa-hoc-am-lich-tiet-khi) ·
  [자미두수 명반](https://nhatnguyet.org/en/blog/co-so-khoa-hoc-la-so-tu-vi) ·
  [사주팔자](https://nhatnguyet.org/en/blog/co-so-khoa-hoc-bat-tu) ·
  [수비학](https://nhatnguyet.org/en/blog/co-so-khoa-hoc-than-so-hoc) ·
  [고전 문헌과 해석](https://nhatnguyet.org/en/blog/co-so-khoa-hoc-sach-co-loi-luan) ·
  [Nhat Nguyet의 검증 방식](https://nhatnguyet.org/en/blog/co-so-khoa-hoc-kiem-chung).

[`examples/`](./examples/README.md)에는 바로 해 볼 수 있는 예제(빌드 과정이 필요 없는
HTML 페이지, Node, Python)와 복사해 쓰는 템플릿 4개가 있습니다.

| 템플릿 | 내용 |
|---|---|
| [`nextjs-lunar-calendar`](./examples/nextjs-lunar-calendar) | Next.js 페이지(정적 내보내기): 음력 날짜와 절기를 담은 월 달력, 설날 카운트다운, 폼으로 만드는 자미두수 명반 |
| [`telegram-bot`](./examples/telegram-bot) | grammY 봇: `/today`, `/tet`, `/ziwei`, 영어, 베트남어, 중국어로 답변 |
| [`google-sheets`](./examples/google-sheets) | `Code.gs` 파일 하나에 담은 `=LUNARDATE()`, `=SEXAGENARY()`, `=SOLARTERM()`, `=SOLARDATE()` |
| [`jupyter`](./examples/jupyter) | 노트북: 1900~2100년 베트남과 중국의 설날, 음력 월, 윤달을 차트와 함께 |

## iztro에서 옮겨 오기

`@nhatnguyet/ziwei/iztro`는 iztro와 **호환**됩니다. `astro.bySolar`와
`astro.byLunar`는 같은 매개변수를 받아 iztro의 `FunctionalAstrolabe`와 같은 구조의
JSON을 돌려주며, 여섯 가지 표시 언어와 메서드(`palace()`, `star()`,
`surroundedPalaces()`, `horoscope()`, `fliesTo()`, `use()`...)도 갖추고 있습니다.
계산은 베트남 역법으로 합니다(`{ country: "CN" }`이면 베이징 시간).

```diff
- import { astro } from "iztro";
+ import { astro } from "@nhatnguyet/ziwei/iztro";
```

iztro와 운세 2,006건을 비교하면 대한, 나이, 유년의 궁과 유년 별의 위치가 일치합니다.
남은 차이(경년의 사화, 윤달 규칙, 합삭이 베이징 자정에 걸린 두 달)는 모두 세어
설명해 두었습니다. 몇몇 배치는 일부러 베트남 고서를 따릅니다: 주성 밝기 5단계(iztro는
7단계), 천귀, 경(庚)년의 괴월. 배치하지 않은 것: 중국 문헌에만 나오는 잡성 5개, 장성
(將星) 계열, 대한과 월의 유성. 화성과 영성, 경년의 사화, 천주에서 iztro를 따르려면 위의
학파 옵션을 넘기세요. 전체 목록: [docs/chuyen-tu-iztro.md](./docs/chuyen-tu-iztro.md).

## 자주 묻는 질문

<details>
<summary><b>베트남 음력은 왜 중국 음력과 다른가요?</b></summary>

규칙은 같고 시계가 다릅니다. 한 달은 합삭이 있는 날에 시작하며, 그 날짜는 현지
시간으로 정합니다. 합삭이 세계시(UT) 16시에서 17시 사이에 일어나면 하노이에서는 자정
전, 베이징에서는 자정 후가 되므로 베트남에서는 달이 하루 일찍 시작합니다. 1985년
설날은 꼬박 한 달 차이가 납니다(베트남 1월 21일, 중국 2월 20일). 윤달이 드는 해가
다르기 때문입니다.
</details>

<details>
<summary><b>Tý시는 몇 시이며, 23시 30분에 태어나면 어느 날짜를 쓰나요?</b></summary>

Tý시는 23:00부터 00:59까지입니다. 자미두수는 입력한 날짜를 그대로 씁니다(다음 날로
넘기는 책도 있으니, 그 방식을 따르려면 다음 날 날짜를 입력하세요). 사주팔자는 23:00에
일주가 바뀌며, `schools: { ziHour: "split-at-midnight" }`를 주면 자정에 바뀝니다. 두
경우 모두 명반의 `notes`에 적혀 있습니다.
</details>

<details>
<summary><b>사주팔자의 월주는 음력 월을 따르나요, 절기를 따르나요?</b></summary>

절기를 따릅니다. 해는 Lập Xuân(입춘)에, 달은 각 절(節)이 드는 때에 바뀝니다. 음력
월을 대신 쓰면 전체 날짜의 약 4분의 1(1900~2100년 기준 24.3%)에서 월주가
달라집니다.
</details>

<details>
<summary><b>이 데이터로 AI 모델을 학습시켜도 되나요?</b></summary>

네, 상업적 용도를 포함해 CC BY 4.0에 따라 가능합니다. "Data: Nhat Nguyet
(nhatnguyet.org)"으로 출처를 표기해 주세요.
</details>

<details>
<summary><b>수비학은 베트남어 이름을 어떻게 처리하나요?</b></summary>

성조 부호를 없앤 뒤("Đ"는 "D"로 셉니다) 피타고라스 문자표를 적용합니다. 마스터
넘버 11, 22, 33은 그대로 유지합니다.
</details>

## 기여하기

출처(책과 편명, 또는 천문 데이터)를 곁들인 버그 신고가 가장 큰 도움이 됩니다.
[CONTRIBUTING.md](./CONTRIBUTING.md)를 참고하세요.

**포팅 챌린지**: 엔진을 다른 언어(Go, Rust, Dart, Swift, C#...)로 작성해
[`ca-kiem/`](./ca-kiem)의 테스트 벡터 17,291개를 모두 통과해 보세요. `vao`를 읽고 `ra`와
비교하면 됩니다. 규칙은 [CONTRIBUTING.md](./CONTRIBUTING.md#port-challenge)에 있습니다.

## 인용과 라이선스

| 구분 | 라이선스 |
|---|---|
| 코드 | [MIT](./LICENSE) |
| 데이터, 해석, 테스트 벡터 | [CC BY 4.0](./DATA-LICENSE): 상업적 이용과 AI 학습 가능, 출처 표기 필수 |
| 고전 문헌 | 원문은 퍼블릭 도메인, 디지털화와 교감 작업은 CC BY 4.0 |

출처 표기 문구: `Data: Nhat Nguyet (nhatnguyet.org)`, 가능하면 링크를 함께 답니다.
Nhat Nguyet 이름과 로고는 이 라이선스들의 대상이 아닙니다. 소프트웨어를 인용하려면
(역법 계산 방법은 [기술 논문](./docs/paper/paper.pdf)에 있습니다):

```bibtex
@software{nhatnguyet_2026,
  author = {{Nhat Nguyet}},
  title  = {Nhat Nguyet: open source code and data for Zi Wei Dou Shu, BaZi and numerology},
  year   = {2026},
  url    = {https://nhatnguyet.org/en/ma-nguon-mo},
  doi    = {10.5281/zenodo.24358013}
}
```

웹사이트: [nhatnguyet.org](https://nhatnguyet.org) · 이메일: lienhe@nhatnguyet.org

<p align="center"><sub>데이터: Nhat Nguyet (nhatnguyet.org) · 코드 MIT · 데이터 CC BY 4.0</sub></p>
