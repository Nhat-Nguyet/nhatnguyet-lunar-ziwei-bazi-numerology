<p align="center">
  <a href="https://nhatnguyet.org/en/ma-nguon-mo">
    <picture>
      <source media="(prefers-color-scheme: dark)" srcset="./assets/banner-toi.svg">
      <img src="./assets/banner-sang.svg" alt="Nhat Nguyet" width="720">
    </picture>
  </a>
</p>

<h1 align="center">Nhat Nguyet: 자미두수, 사주팔자, 수비학 오픈소스 라이브러리와 데이터셋</h1>

<p align="center">
  <b>자미두수(Tử Vi, 紫微斗數)와 사주팔자(Bát Tự, 四柱八字) 명반 작성, 수비학 계산, 베트남 음력과 중국 음력 변환, 베트남 제례 기도문 조회를 지원하는 무료 오픈소스 JavaScript, Python 라이브러리.</b><br>
  해석이 담긴 명반 360만 건 · 고전 60여 종 · NASA 데이터로 검증한 베트남 음력
</p>

<p align="center">
  <a href="./LICENSE"><img alt="코드: MIT" src="https://img.shields.io/badge/code-MIT-1f6f6b.svg"></a>
  <a href="./DATA-LICENSE"><img alt="데이터: CC BY 4.0" src="https://img.shields.io/badge/data-CC%20BY%204.0-1f6f6b.svg"></a>
  <a href="./ca-kiem"><img alt="테스트 케이스: 17,291개 통과" src="https://img.shields.io/badge/test%20cases-17%2C291%20passing-2e7d32.svg"></a>
  <a href="https://github.com/Nhat-Nguyet/nhatnguyet/actions/workflows/kiem.yml"><img alt="자동 검사" src="https://github.com/Nhat-Nguyet/nhatnguyet/actions/workflows/kiem.yml/badge.svg?branch=main"></a>
  <a href="https://doi.org/10.5281/zenodo.24358014"><img alt="DOI" src="https://zenodo.org/badge/DOI/10.5281/zenodo.24358014.svg"></a>
</p>

<p align="center">
  <a href="./README.md">English</a> · <a href="./README.vi.md">Tiếng Việt</a> · <a href="./README.zh.md">中文</a> · <a href="./README.ja.md">日本語</a> · <b>한국어</b> · <a href="./README.fr.md">Français</a> · <a href="./README.th.md">ไทย</a>
  <br>
  <a href="https://nhatnguyet.org/en/ma-nguon-mo">프로젝트 페이지</a> ·
  <a href="https://nhatnguyet.org/en/du-lieu">오픈 데이터</a> ·
  <a href="https://huggingface.co/nhatnguyet">Hugging Face</a> ·
  <a href="https://nhatnguyet.org/en/blog">튜토리얼</a>
</p>

---

## 목차

1. [개요](#개요)
2. [왜 Nhat Nguyet인가](#왜-nhat-nguyet인가)
3. [저장소 구성](#저장소-구성)
4. [빠른 시작](#빠른-시작)
5. [활용 사례](#활용-사례)
6. [과학적 근거](#과학적-근거)
7. [로드맵](#로드맵)
8. [라이선스와 출처 표기](#라이선스와-출처-표기)
9. [자주 묻는 질문](#자주-묻는-질문)
10. [기여 및 문의](#기여-및-문의)

## 개요

역학·술수 전통과 민간 신앙을 다루는 오픈소스 코드와 데이터셋으로,
**베트남에 뿌리를 두고 동양과 서양의 전통을 함께 아우릅니다**: Tử Vi(자미두수),
Bát Tự(사주팔자), 수비학, 주역, 타로, 점성술, 풍수, 택일, 4개국 음력, 축제와
제례 기도문. 모든 결과는 [nhatnguyet.org](https://nhatnguyet.org)와 iOS, Android용
Nhat Nguyet 앱을 구동하는 계산 엔진과 필드 단위로 일치합니다.

| 해석이 담긴 명반 | 고전 문헌 | 지식 아티클 | 오픈 데이터셋 | 테스트 케이스 |
|:---:|:---:|:---:|:---:|:---:|
| **360만 건** | **60여 종**<br>730만 자 | **510편**<br>요약, FAQ | **33종**<br>DOI 부여 | **17,291개**<br>전부 통과 |
| 제례 기도문 **456**편 | 축제 **200**개 | 국가별 음력 **4**종 | 언어 **3**개 | 의존성 **0**개 |

## 왜 Nhat Nguyet인가

| | |
|---|---|
| **베트남 시간 기준 역법** | 1900~2100년 사이 2,814일은 베이징 시간으로 계산한 역법과 음력 날짜가 다르며, 설날(Tết)은 10개 연도에서 다릅니다. 국가별 역법을 고를 수 있고 기본값은 베트남입니다. |
| **검증 가능** | 합삭 시각은 NASA와 평균 1.1분, 절기 시각은 IMCCE와 평균 4.2분 차이입니다. TypeScript와 Python 버전은 17,291개 케이스에서 기준 엔진의 모든 필드를 그대로 재현합니다. |
| **출처 기반** | 모든 고전 인용에 서명과 편명을 밝히고, 원문은 인쇄본과 대조했습니다. 학파마다 견해가 다르면 하나를 조용히 고르지 않고 그 차이를 밝힙니다. |
| **3개 언어** | 별 이름, 용어, 해석을 베트남어, 영어, 중국어로 모두 제공합니다. |
| **기기에서 실행** | 의존성 없음, 네트워크 호출 없음, 데이터를 어디에도 보내지 않습니다. 브라우저, Node, Python에서 실행됩니다. |

## 저장소 구성

### 라이브러리

| 주제 | TypeScript (npm) | Python (`pip install nhatnguyet`) | 기능 |
|---|---|---|---|
| 음력 | [`@nhatnguyet/am-lich`](./js/packages/am-lich) | `nhatnguyet.am_lich` | 4개국 음력과 양력 변환, 간지, 분 단위 24절기, 28수(Nhị Thập Bát Tú), 납음(nạp âm) |
| 자미두수 | [`@nhatnguyet/tu-vi`](./js/packages/tu-vi) | `nhatnguyet.tu_vi` | 12궁 명반, 별의 밝기, 사화(Tứ Hóa), 순공과 절공(Tuần, Triệt), 대한(10년 운), 유년, 유성, 격국 |
| 사주팔자 | [`@nhatnguyet/bat-tu`](./js/packages/bat-tu) | `nhatnguyet.bat_tu` | 절기 기준 사주, 지장간, 십신, 신살(thần sát), 대운(10년 운), 소운(tiểu vận) |
| 수비학 | [`@nhatnguyet/than-so-hoc`](./js/packages/than-so-hoc) | `nhatnguyet.than_so_hoc` | 생명수(라이프 패스), 표현수, 영혼수, 정점수(피너클), 도전수(챌린지), 개인년수; 성조 부호가 있는 베트남어 이름 지원 |
| 축제 | [`@nhatnguyet/le-hoi`](./js/packages/le-hoi) | `nhatnguyet.le_hoi` | 축제 200개, 모든 연도의 음력에서 양력 날짜 변환 |

### 데이터셋

| 데이터셋 | 내용 | 형식 | 크기 |
|---|---|---|---|
| 명반별 해석 | 1900~2100년 모든 생년월일(12시진, 2개 성별)의 자미두수와 사주팔자; 생년월일별 수비학 | zstd 압축 JSON Lines, 출생 연도별 파일 1개 | 압축 시 약 11 GB |
| ↳ 구조화된 명반 | 별 위치, 사화, 사주, 숫자와 해석 ID | `la-so/<topic>/<year>` | 약 1.6 GB |
| ↳ 언어별 결합본 | 파일마다 한 언어의 전체 텍스트, AI 학습용 | `ghep-san/<topic>/<vi\|en\|zh>/<year>` | 약 9 GB |
| ↳ 텍스트 저장소 | 해석, 고전 구절, 더 읽을거리; 각 구절은 ID와 함께 한 번만 저장 | `kho/` | < 0.3 GB |
| 고전 문헌 | 퍼블릭 도메인 60여 종, 전문 | 일반 텍스트 | 약 20 MB |
| 역법, 축제, 제례 기도문 | 데이터셋 33종: 1900~2100년 음양력, 64괘, 타로 78장, 절기, 제례 기도문, 의례... | CSV, JSON, Parquet | 118 MB |

### 테스트 케이스

[`ca-kiem/`](./ca-kiem): 기준 엔진에서 생성한 입력과 정답 쌍 17,291개로,
4개국 음력, 축제, 수비학, 사주팔자, 자미두수를 다룹니다. 어떤 언어로
라이브러리를 작성하든 직접 검증할 수 있습니다. `vao`(입력)를 읽고 `ra`(기대
출력)와 비교하면 됩니다.

## 빠른 시작

**TypeScript, JavaScript**

```bash
npm i @nhatnguyet/tu-vi @nhatnguyet/am-lich
```

```ts
import { lapLaSoTuVi, nhanDienCachCuc } from "@nhatnguyet/tu-vi";
import { solarToLunar, MUI_GIO_THEO_NUOC } from "@nhatnguyet/am-lich";

const laSo = lapLaSoTuVi("", "Nam", 19, 9, 1990, 10); // 1990년 9월 19일 술시(Tuất, 오후 7~9시) 출생
console.log(laSo.tenCuc, nhanDienCachCuc(laSo).map((c) => c.ten));

solarToLunar(21, 1, 1985);                       // 베트남 음력: 설날(Tết) 첫날
solarToLunar(21, 1, 1985, MUI_GIO_THEO_NUOC.CN); // 중국 음력: 음력 12월 1일
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

**데이터셋**

```python
from datasets import load_dataset
ds = load_dataset("nhatnguyet/loi-luan-tu-vi", data_files="ghep-san/tu-vi/en/1990.jsonl.zst")
```

## 활용 사례

| 목표 | 사용할 것 | 가이드 |
|---|---|---|
| **명반 웹사이트와 앱** | 자미두수, 사주팔자, 수비학 라이브러리 | [JavaScript로 Tử Vi 명반 만들기](https://nhatnguyet.org/en/blog/lap-la-so-tu-vi-bang-javascript) |
| **달력과 알림 앱** | 음력, 축제, 제례 기도문 | [앱을 위한 음력, 축제, 기일](https://nhatnguyet.org/en/blog/lich-am-le-hoi-cho-ung-dung) |
| **AI 학습** | 언어별로 결합한 해석 | [Tử Vi 명반 데이터로 AI 학습하기](https://nhatnguyet.org/en/blog/huan-luyen-ai-voi-du-lieu-tu-vi) |
| **출처를 인용하는 AI 어시스턴트** | 고전 구절 저장소, 더 읽을거리 | [고전을 인용하는 AI 어시스턴트](https://nhatnguyet.org/en/blog/tro-ly-ai-trich-dan-sach-co) |
| **데이터 분석** | 구조화된 명반 | [격국은 얼마나 드물까?](https://nhatnguyet.org/en/blog/phan-tich-du-lieu-la-so-bang-python) |
| **역법과 문화 연구** | 4개국 음력, 축제, 고전 문헌 | [베트남 음력은 중국 음력과 다르다](https://nhatnguyet.org/en/blog/am-lich-viet-nam-khac-trung-quoc) |
| **자체 라이브러리 테스트** | 테스트 케이스 | [공용 테스트 케이스로 검증하기](https://nhatnguyet.org/en/blog/kiem-thu-vien-bang-bo-ca-kiem) |

그 밖에: 교육(단계별 명반 작성), 번역(3개 언어 용어), 콘텐츠와 저널리즘(검증
가능한 수치).

## 과학적 근거

**과학은 예측이 아니라 방법에 있습니다.** 역법은 천문 계산이며 NASA와 IMCCE로
검증했습니다. 모든 결과는 결정론적이며 테스트 케이스로 다시 확인할 수 있습니다.
자미두수, 사주팔자, 수비학을 비롯한 술수는 특정 학파의 규칙이며 과학적으로
검증되지 않았습니다. 건강, 재정, 법률 결정의 근거로 사용하지 마십시오.

**국가별 역법**

| 역법 | 사용 시간대 | 국가 및 지역 |
|---|---|---|
| 베트남(기본값) | UTC+7 | 베트남 |
| 중국 | UTC+8 | 중국 본토, 대만, 홍콩, 마카오; 싱가포르, 말레이시아, 인도네시아, 필리핀의 춘절 |
| 한국 | UTC+9 | 대한민국 |
| 일본 | UTC+9 | 구력(kyūreki), 전통 행사에 사용 |

몽골, 티베트, 태국, 라오스, 캄보디아, 미얀마, 인도는 규칙이 다른 역법을 따르며
아직 라이브러리에 포함되지 않았습니다.

**더 읽을거리**

| 데이터 | 아티클 |
|---|---|
| 음력, 절기 | [어떻게 계산하며 오차는 얼마인가?](https://nhatnguyet.org/en/blog/co-so-khoa-hoc-am-lich-tiet-khi) |
| 간지, 60갑자, 28수 | [율리우스일에서 어떻게 도출되는가?](https://nhatnguyet.org/en/blog/co-so-khoa-hoc-can-chi-chu-ky) |
| 자미두수 명반 | [생년월일시에서 12궁까지](https://nhatnguyet.org/en/blog/co-so-khoa-hoc-la-so-tu-vi) |
| Tử Vi Đẩu Số Toàn Thư의 격국 | [격국별 성립 조건과 빈도](https://nhatnguyet.org/en/blog/co-so-khoa-hoc-cach-cuc-toan-thu) |
| 사주팔자 | [월주가 절기를 따르는 이유](https://nhatnguyet.org/en/blog/co-so-khoa-hoc-bat-tu) |
| 수비학 | [근대에 생긴 체계와 베트남어 이름](https://nhatnguyet.org/en/blog/co-so-khoa-hoc-than-so-hoc) |
| 고전 문헌, 해석 | [디지털화, 교감, 명반과의 연결](https://nhatnguyet.org/en/blog/co-so-khoa-hoc-sach-co-loi-luan) |
| 축제, 제례 기도문 | [출처와 날짜 검증 방법](https://nhatnguyet.org/en/blog/co-so-khoa-hoc-le-hoi-van-cung) |
| 전반적 방법론 | [Nhat Nguyet의 검증 방식](https://nhatnguyet.org/en/blog/co-so-khoa-hoc-kiem-chung) |

## 로드맵

- [x] 4개국 음력, 간지, 24절기, 28수
- [x] 자미두수, 사주팔자, 수비학, 축제 (TypeScript, Python)
- [x] 1900~2100년 명반 해석, 3개 언어
- [ ] 제례 기도문: 의례 조회, 기도문 가져오기, 기도문에 이름 채워 넣기
- [ ] 주역, 육효(Lục Hào), 매화역수(Mai Hoa)
- [ ] 풍수: 팔택(Bát Trạch), 본명괘(cung phi), 노반척(Lỗ Ban)
- [ ] 택일: 길한 시간, 12직(12 trực), 흉일
- [ ] 서양 별자리 점성술, 타로
- [ ] 학파별 옵션(윤달, 자시), 진태양시

## 라이선스와 출처 표기

| 구분 | 라이선스 | 허용 범위 |
|---|---|---|
| 소스 코드 | [MIT](./LICENSE) | 사용, 수정, 판매 가능; `Copyright (c) 2026 Nhat Nguyet (nhatnguyet.org)` 문구 유지 |
| 데이터, 해석 | [CC BY 4.0](./DATA-LICENSE) | 상업적 이용과 AI 학습 가능, **출처 표기 필수** |
| 고전 문헌 | 퍼블릭 도메인 | 원문은 자유롭게 사용 가능; 디지털화와 교감 작업은 CC BY 4.0 |
| 제례 기도문 | CC BY 4.0 | 민간 전승에서 수집해 Nhat Nguyet이 편집했으며, 문구의 저작자임을 주장하지 않음 |

**표준 출처 표기:** `Data: Nhat Nguyet (nhatnguyet.org)` (한국어: 데이터: Nhat Nguyet
(nhatnguyet.org)), 가능하면 https://nhatnguyet.org 링크를 함께 답니다. 결과를
보여 주는 앱은 사용자가 볼 수 있는 곳에 "According to Nhat Nguyet"(Nhat Nguyet
기준)이라고 표기합니다. 데이터를 재배포할 때는 `nguon`(출처) 열을 유지하세요.

**Nhat Nguyet** 이름과 로고는 상표이며 라이선스 대상이 아닙니다. Nhat Nguyet이
만들었거나 보증한 것처럼 보이도록 제품 이름을 짓거나 소개하지 마십시오.

**인용**

```bibtex
@software{nhatnguyet_2026,
  author = {{Nhat Nguyet}},
  title  = {Nhat Nguyet: open source code and data for Zi Wei Dou Shu, BaZi and numerology},
  year   = {2026},
  url    = {https://nhatnguyet.org/en/ma-nguon-mo},
  doi    = {10.5281/zenodo.24358014}
}
```

## 자주 묻는 질문

<details>
<summary><b>JavaScript나 Python으로 자미두수 명반을 작성하는 무료 라이브러리가 있나요?</b></summary>

네. `npm i @nhatnguyet/tu-vi` 또는 `pip install nhatnguyet`을 사용하세요. 명반에는
오행국(cục), 명궁과 신궁, 14주성과 보조성, 별의 밝기, 사화(Tứ Hóa), 순공과
절공(Tuần, Triệt), 대한, 유년, 유성, 그리고 Tử Vi Đẩu Số Toàn Thư의 격국을 포함한
격국이 들어 있습니다.
</details>

<details>
<summary><b>이 데이터로 AI 모델을 학습시켜도 되나요?</b></summary>

네. 상업용 제품을 포함해 CC BY 4.0에 따라 가능합니다. 유일한 조건은
"Data: Nhat Nguyet (nhatnguyet.org)"(데이터: Nhat Nguyet (nhatnguyet.org))로
출처를 표기하는 것입니다.
</details>

<details>
<summary><b>음력과 양력 날짜 변환은 얼마나 정확한가요?</b></summary>

역법은 달과 태양의 실제 위치로 계산합니다. 1900~2100년 구간에서 합삭 시각은
NASA와 평균 1.1분, 절기 시각은 IMCCE와 평균 4.2분 차이입니다. NASA와 IMCCE
데이터만으로 음력을 재구성하면 2,461개월 중 2,459개월이 일치합니다.
</details>

<details>
<summary><b>사주팔자의 월주는 음력 월을 따르나요, 절기를 따르나요?</b></summary>

사주 방법론이 요구하는 대로 절기를 따릅니다. 연주는 입춘(Lập Xuân)에, 월주는
각 절기가 시작되는 시각에 바뀌며, 음력 초하루에 바뀌지 않습니다. 음력 월을
월주로 삼으면 전체 날짜의 약 4분의 1에서 틀립니다.
</details>

<details>
<summary><b>수비학은 성조 부호가 있는 베트남어 이름을 어떻게 처리하나요?</b></summary>

성조 부호를 없앤 뒤 문자와 숫자 대응표로 점수를 매기며, "Đ"는 "D"로 셉니다.
생명수, 표현수, 영혼수, 인격수, 태도수, 정점수, 도전수, 그리고 개인년수,
개인월수, 개인일수를 얻을 수 있습니다.
</details>

<details>
<summary><b>제례 기도문은 어디에서 왔나요?</b></summary>

민간 전승에서 수집해 Nhat Nguyet이 편집했으며, 155가지 의례 유형으로
분류했습니다: 설날(Tết), 보름, 음력 초하루, 기일, 결혼, 집들이, 개업...
</details>

## 기여 및 문의

- 버그 신고와 제안: 생년월일과 출생 시각, 성별, 얻은 결과, 기대한 결과, 근거
  자료를 담아 이슈를 열어 주세요. [CONTRIBUTING.md](./CONTRIBUTING.md)를
  참고하세요.
- 웹사이트: [nhatnguyet.org](https://nhatnguyet.org) · 이메일: lienhe@nhatnguyet.org

<p align="center"><sub>데이터: Nhat Nguyet (nhatnguyet.org) · 코드 MIT · 데이터 CC BY 4.0</sub></p>
