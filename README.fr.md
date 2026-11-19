<h1 align="center">Nhat Nguyet</h1>

<p align="center">
  <b>Zi Wei Dou Shu, BaZi et numérologie sur un calendrier lunaire vietnamien vérifié par rapport à la NASA et à l'IMCCE, avec 3,6 millions d'interprétations de thèmes qui citent les classiques et 17 291 vecteurs de test partagés que tout portage peut passer.</b><br>
  JavaScript · Python · CLI · serveur MCP · widgets web · English, Tiếng Việt, 中文
</p>

<p align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="./assets/la-so-tu-vi-toi.svg">
    <img src="./assets/la-so-tu-vi.svg" alt="Thème Zi Wei Dou Shu dessiné par la bibliothèque" width="32%">
  </picture>
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="./assets/la-so-bat-tu-toi.svg">
    <img src="./assets/la-so-bat-tu.svg" alt="Thème BaZi dessiné par la bibliothèque" width="32%">
  </picture>
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="./assets/than-so-hoc-toi.svg">
    <img src="./assets/than-so-hoc.svg" alt="Profil numérologique dessiné par la bibliothèque" width="32%">
  </picture>
</p>

<p align="center">
  <a href="./README.md">English</a> · <a href="./README.vi.md">Tiếng Việt</a> · <a href="./README.zh.md">中文</a> · <a href="./README.ja.md">日本語</a> · <a href="./README.ko.md">한국어</a> · <b>Français</b> · <a href="./README.th.md">ไทย</a>
  <br>
  <a href="https://nhatnguyet.org/en/ma-nguon-mo/thu">Bac à sable</a> ·
  <a href="https://nhatnguyet.org/en/ma-nguon-mo/tai-lieu">Documentation</a> ·
  <a href="https://huggingface.co/nhatnguyet">Hugging Face</a> ·
  <a href="https://nhatnguyet.org/en/ma-nguon-mo">Page du projet</a>
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/@nhatnguyet/tu-vi"><img alt="npm" src="https://img.shields.io/npm/v/@nhatnguyet/tu-vi.svg?label=npm"></a>
  <a href="https://pypi.org/project/nhatnguyet/"><img alt="PyPI" src="https://img.shields.io/pypi/v/nhatnguyet.svg"></a>
  <a href="./ca-kiem"><img alt="Vecteurs de test : 17 291" src="https://img.shields.io/badge/test%20vectors-17%2C291-2e7d32.svg"></a>
  <a href="https://github.com/Nhat-Nguyet/nhatnguyet/actions/workflows/kiem.yml"><img alt="Vérifications" src="https://github.com/Nhat-Nguyet/nhatnguyet/actions/workflows/kiem.yml/badge.svg?branch=main"></a>
  <a href="./LICENSE"><img alt="Code : MIT" src="https://img.shields.io/badge/code-MIT-1f6f6b.svg"></a>
  <a href="./DATA-LICENSE"><img alt="Données : CC BY 4.0" src="https://img.shields.io/badge/data-CC%20BY%204.0-1f6f6b.svg"></a>
  <a href="https://doi.org/10.5281/zenodo.24358014"><img alt="DOI" src="https://zenodo.org/badge/DOI/10.5281/zenodo.24358014.svg"></a>
</p>

## Démarrage rapide

**JavaScript, TypeScript** (Node 18+, navigateurs)

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

**Python** (3.9+, bibliothèque standard uniquement) : mêmes résultats, même SVG à l'octet près.

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

**Ligne de commande** : sans installation avec `npx`, ou `nhatnguyet ...` après `pip install nhatnguyet`.

```bash
npx @nhatnguyet/cli ziwei 1990-09-19 20:00 male --year 2026
```

<details>
<summary>Sortie (les 12 palais sous forme de grille, puis l'année, les périodes décennales, les configurations)</summary>

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

Autres commandes : `bazi`, `lunar`, `solar`, `terms`, `numerology`, `festivals` ; `--lang vi|zh`, `--json`, `--svg chart.svg`. API complète en anglais, avec toutes les options : [docs/api-en.md](./docs/api-en.md).

## Sommaire

1. [Contenu du dépôt](#contenu-du-dépôt)
2. [Jeux de données](#jeux-de-données)
3. [Comparaison avec les autres bibliothèques](#comparaison-avec-les-autres-bibliothèques)
4. [Pour les IA](#pour-les-ia)
5. [Widgets](#widgets)
6. [Fondements scientifiques](#fondements-scientifiques)
7. [Bac à sable et documentation](#bac-à-sable-et-documentation)
8. [Migrer depuis iztro](#migrer-depuis-iztro)
9. [Licence et attribution](#licence-et-attribution)
10. [FAQ](#faq)
11. [Contribuer](#contribuer)

## Contenu du dépôt

Chaque bibliothèque reproduit, champ par champ, le moteur qui fait tourner
[nhatnguyet.org](https://nhatnguyet.org) et l'application Nhat Nguyet. Aucun
appel réseau ; les bibliothèques n'ont aucune dépendance tierce.

| Paquet | Python | Rôle |
|---|---|---|
| [`@nhatnguyet/am-lich`](./js/packages/am-lich) | `nhatnguyet` | Conversion entre calendrier lunaire et calendrier grégorien pour le Vietnam, la Chine, la Corée, le Japon et 7 autres régions ; troncs et branches ; 24 termes solaires à la minute près ; 28 demeures lunaires ; na yin |
| [`@nhatnguyet/tu-vi`](./js/packages/tu-vi) | `nhatnguyet` | Zi Wei Dou Shu : 12 palais, éclat des étoiles, Quatre Transformations, Tuần et Triệt, périodes décennales et annuelles, étoiles de transit, configurations accompagnées de la ligne classique d'origine ; SVG ; texte pour les LLM ; couche compatible avec iztro |
| [`@nhatnguyet/bat-tu`](./js/packages/bat-tu) | `nhatnguyet` | BaZi : quatre piliers selon les termes solaires, troncs cachés, Dix Dieux, étoiles symboliques, piliers de chance, petites périodes ; SVG |
| [`@nhatnguyet/than-so-hoc`](./js/packages/than-so-hoc) | `nhatnguyet` | Numérologie pythagoricienne (chemin de vie, expression, élan de l'âme, sommets, défis, année personnelle), noms vietnamiens avec diacritiques ; SVG |
| [`@nhatnguyet/le-hoi`](./js/packages/le-hoi) | `nhatnguyet` | 200 fêtes vietnamiennes avec leur date grégorienne pour n'importe quelle année |
| [`@nhatnguyet/cli`](./js/packages/cli) | commande `nhatnguyet` | Thèmes sous forme de grilles dans le terminal, en JSON ou en SVG |
| [`@nhatnguyet/mcp`](./js/packages/mcp) | | Serveur MCP avec 7 outils pour les assistants IA |
| [`@nhatnguyet/widgets`](./js/packages/widgets) | | 5 composants web (calendrier, grille mensuelle, heures fastes, compte à rebours du Tết, convertisseur) |

[`ca-kiem/`](./ca-kiem) contient **17 291 vecteurs de test** (entrée `vao`,
sortie attendue `ra`) générés par le moteur de référence : 14 936 cas de
calendrier, 777 thèmes Zi Wei, 777 thèmes BaZi, 600 profils numérologiques et
201 années de fêtes. TypeScript et Python les passent tous à chaque push.

## Jeux de données

Tous sur [Hugging Face](https://huggingface.co/nhatnguyet), sous CC BY 4.0,
utilisables dans des produits commerciaux et pour l'entraînement d'IA, avec
attribution.

| Jeu de données | Contenu | Taille compressée |
|---|---|---:|
| [`nhatnguyet/loi-luan-tu-vi`](https://huggingface.co/datasets/nhatnguyet/loi-luan-tu-vi) | 1 761 936 thèmes Zi Wei avec interprétations : chaque jour de 1900 à 2100 × 12 heures × 2 sexes | 9,20 Go |
| [`nhatnguyet/loi-luan-bat-tu`](https://huggingface.co/datasets/nhatnguyet/loi-luan-bat-tu) | 1 761 936 thèmes BaZi avec interprétations, même période | 1,57 Go |
| [`nhatnguyet/loi-luan-than-so-hoc`](https://huggingface.co/datasets/nhatnguyet/loi-luan-than-so-hoc) | 73 414 profils numérologiques, un par date de naissance | 0,08 Go |
| [`nhatnguyet/sach-co`](https://huggingface.co/datasets/nhatnguyet/sach-co) | 412 textes classiques du domaine public (environ 390 œuvres), 70,1 millions de caractères, texte intégral | 151 Mo de texte, 69 Mo en Parquet |
| [33 jeux de données sur le calendrier et la culture](https://nhatnguyet.org/en/du-lieu) | calendrier luni-solaire de 1900 à 2100, termes solaires, 64 hexagrammes, 78 cartes de tarot, 200 fêtes, 456 prières rituelles... en CSV, JSON et Parquet, avec un [DOI](https://doi.org/10.5281/zenodo.23009396) | |

Les trois jeux de données d'interprétations totalisent **3 597 286 thèmes,
10,85 Go compressés**, en trois parties : les thèmes structurés avec les
identifiants d'interprétation (`la-so/`, 1,50 Go), le texte intégral
préassemblé par langue (`ghep-san/<vi|en|zh>/`, 9,31 Go) et le magasin de
textes, où chaque interprétation, citation classique et article n'est conservé
qu'une seule fois (`kho/`, 0,04 Go). Les interprétations citent les classiques
avec le livre et le chapitre. Il y a un fichier par année de naissance.
**Décompressés, ils sont très volumineux** (le texte se répète d'un thème à
l'autre : une année de texte Zi Wei préassemblé pèse environ 2,6 Go par
langue), lisez-les donc en flux ou téléchargez-les une année à la fois.

Les textes classiques : 337 en chinois classique, 44 en anglais, 30 en
vietnamien, 1 en allemand. Par thème : 201 sur le Yi Jing et la divination, 28
sur la numérologie, 26 sur l'histoire et la culture vietnamiennes, 26 sur les
Trois Arts, 22 sur le feng shui, 20 sur le BaZi et la destinée, 20 sur le
bouddhisme, 20 sur les croyances et les rites, 19 sur le calendrier et le choix
des dates, 14 sur la physiognomonie, 8 sur le Zi Wei, 6 sur l'astrologie et le
tarot, 2 divers. 28 sont des textes issus d'OCR et portent l'indicateur `ocr`.

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

## Comparaison avec les autres bibliothèques

[iztro](https://github.com/SylarLong/iztro) et
[lunar-javascript](https://github.com/6tail/lunar-javascript) sont des
bibliothèques soignées et largement utilisées, et toutes deux sont exactes pour
ce qu'elles implémentent : le calendrier chinois à l'heure de Pékin (UTC+8). Le
Vietnam applique les mêmes règles à l'heure de Hanoï (UTC+7). Comparaison sur
chaque jour de 1900 à 2100 ([doi-chieu/](./doi-chieu/README.md), reproductible
avec `node chay.mjs`) :

| | Résultat |
|---|---:|
| Jours dont la date lunaire diffère de lunar-javascript | 2 724 sur 73 414 |
| Années dont le Tết diffère | 9 sur 201 |
| Années dont le mois intercalaire diffère | 6 sur 201 |
| Thèmes Zi Wei (chaque jour × 12 heures) dont le Cục, le palais de la Vie ou une étoile majeure diffère d'iztro | 38 752 sur 880 968 (4,40 %) |
| dont dus au fuseau horaire (iztro utilise l'heure de Pékin même avec `vi-VN`) | 3,02 % |
| dont dus à la règle du mois intercalaire (`fixLeap` d'iztro, une option) | 1,34 % |
| Termes solaires par rapport à l'IMCCE, plus grand écart : Nhat Nguyet / lunar-javascript | 0,9 min / 0,28 min |

Exemple : une naissance le 21 janvier 1985, à l'heure Tỵ. iztro donne le 1er
jour du 12e mois de l'année Giáp Tý, Kim Tứ Cục, palais de la Vie en Thân. Nhat
Nguyet donne le Tết, 1er jour de l'année Ất Sửu, Thủy Nhị Cục, palais de la Vie
en Dậu. Passez `country: "CN"` et Nhat Nguyet donne aussi le calendrier
chinois.

## Pour les IA

Les modèles de langage ne devraient pas calculer de tête les dates lunaires ni
la position des étoiles. Quatre façons de leur fournir les chiffres :

- **Serveur MCP** avec 7 outils (`lunar_convert`, `solar_terms`, `cast_zi_wei`,
  `cast_bazi`, `numerology`, `festivals`, `render_chart_svg`), exécuté en local :
  `claude mcp add nhatnguyet -- npx -y @nhatnguyet/mcp`. Configuration pour
  Claude Desktop, Cursor et VS Code : [js/packages/mcp](./js/packages/mcp/README.md).
- **Agent Skill** qui demande à un assistant d'appeler les outils au lieu de
  deviner : [skills/](./skills/README.md).
- **`chartToText`** (`chart_to_text` en Python) transforme un thème en Markdown
  compact à insérer dans un prompt :

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

- **Jeux de données** pour l'entraînement et la recherche documentaire :
  [voir plus haut](#jeux-de-données).

## Widgets

<p align="center"><img src="./assets/widgets/tong-hop.png" alt="Widgets de calendrier Nhat Nguyet" width="720"></p>

Hébergés sur nhatnguyet.org (14 widgets ; choisissez les options sur
[nhatnguyet.org/widget](https://nhatnguyet.org/widget?lang=en)) :

```html
<div data-widget="lich-hom-nay" data-lang="en" data-theme="auto"></div>
<script async src="https://nhatnguyet.org/embed/w.js"></script>
```

`data-country` (`VN` par défaut, `CN`, `KR`, `JP`...) fait passer les widgets
de calendrier au calendrier lunaire d'un autre pays. Vous pouvez aussi en
exécuter 5 directement dans la page, sans serveur :

```html
<script type="module" src="https://cdn.jsdelivr.net/npm/@nhatnguyet/widgets/dist/nn-widgets.js"></script>
<nn-lich-thang lang="en" theme="auto" country="VN"></nn-lich-thang>
```

Tous les widgets et leurs attributs : [widgets/](./widgets/README.md).

## Fondements scientifiques

**La science est dans la méthode, pas dans les prédictions.** Le calendrier
relève de l'astronomie, et il est vérifié par rapport à la NASA et à l'IMCCE de
1900 à 2100 :

| Vérification | Résultat |
|---|---|
| Nouvelles lunes par rapport à la NASA (2 474) | 0,9 min de retard en moyenne, 3,9 min au maximum |
| Mois lunaires reconstruits à partir des nouvelles lunes de la NASA et des termes solaires de l'IMCCE | 2 459 sur 2 461 concordent (pour les deux autres, la nouvelle lune tombe à moins d'une minute de minuit) |
| Termes solaires par rapport à l'IMCCE (4 824) | 0,27 min d'écart en moyenne, 0,9 min au maximum (arrondi à la minute), chaque terme tombe le bon jour |
| Vietnam (UTC+7) et Chine (UTC+8), mêmes règles | 2 814 jours et 10 dates du Tết diffèrent |

Calendriers par pays : Vietnam UTC+7 (par défaut) ; Chine, Taïwan, Hong Kong,
Macao, Singapour, Malaisie, Indonésie et Philippines UTC+8 ; Corée et Japon
UTC+9. Chaque résultat est déterministe et peut être revérifié avec les
vecteurs de test. Le Zi Wei Dou Shu, le BaZi et la numérologie sont les règles
d'écoles traditionnelles, pas une science validée ; ne les utilisez pas pour
des décisions de santé, d'argent ou d'ordre juridique. Là où les écoles
divergent (le mois intercalaire, l'heure Tý à partir de 23 h), la
documentation indique la règle utilisée.

Pour aller plus loin : [calendrier lunaire et termes solaires](https://nhatnguyet.org/en/blog/co-so-khoa-hoc-am-lich-tiet-khi) ·
[thème Zi Wei](https://nhatnguyet.org/en/blog/co-so-khoa-hoc-la-so-tu-vi) ·
[BaZi](https://nhatnguyet.org/en/blog/co-so-khoa-hoc-bat-tu) ·
[numérologie](https://nhatnguyet.org/en/blog/co-so-khoa-hoc-than-so-hoc) ·
[textes classiques et interprétations](https://nhatnguyet.org/en/blog/co-so-khoa-hoc-sach-co-loi-luan) ·
[comment Nhat Nguyet vérifie son travail](https://nhatnguyet.org/en/blog/co-so-khoa-hoc-kiem-chung).

## Bac à sable et documentation

- **Bac à sable** : [nhatnguyet.org/en/ma-nguon-mo/thu](https://nhatnguyet.org/en/ma-nguon-mo/thu), exécute les paquets dans votre navigateur.
- **Documentation de l'API** : [nhatnguyet.org/en/ma-nguon-mo/tai-lieu](https://nhatnguyet.org/en/ma-nguon-mo/tai-lieu) et [docs/api-en.md](./docs/api-en.md).
- **Exemples** : [examples/](./examples/README.md) (une page HTML sans étape de build, Node, Python).
- **Guides** : [établir un thème Tử Vi en JavaScript](https://nhatnguyet.org/en/blog/lap-la-so-tu-vi-bang-javascript) · [calendrier lunaire et fêtes pour votre application](https://nhatnguyet.org/en/blog/lich-am-le-hoi-cho-ung-dung) · [un assistant IA qui cite les classiques](https://nhatnguyet.org/en/blog/tro-ly-ai-trich-dan-sach-co) · [analyser des données de thèmes avec Python](https://nhatnguyet.org/en/blog/phan-tich-du-lieu-la-so-bang-python).

## Migrer depuis iztro

Changez un seul import : le résultat garde la forme `FunctionalAstrolabe`
d'iztro et ses six langues d'affichage, mais il est calculé sur le calendrier
vietnamien :

```diff
- import { astro } from "iztro";
+ import { astro } from "@nhatnguyet/tu-vi/iztro";
```

Les méthodes comme `astrolabe.palace()` ne sont pas fournies (la couche ne
contient que des données). Détails : [docs/chuyen-tu-iztro.md](./docs/chuyen-tu-iztro.md).

## Licence et attribution

| Partie | Licence |
|---|---|
| Code | [MIT](./LICENSE) |
| Données, interprétations, vecteurs de test | [CC BY 4.0](./DATA-LICENSE) : usage commercial et entraînement d'IA autorisés, attribution obligatoire |
| Textes classiques | Originaux dans le domaine public ; la numérisation et le nettoyage sont sous CC BY 4.0 |

Ligne d'attribution : `Data: Nhat Nguyet (nhatnguyet.org)`, avec un lien
lorsque c'est possible. Le nom et le logo Nhat Nguyet ne sont pas couverts par
ces licences.

```bibtex
@software{nhatnguyet_2026,
  author = {{Nhat Nguyet}},
  title  = {Nhat Nguyet: open source code and data for Zi Wei Dou Shu, BaZi and numerology},
  year   = {2026},
  url    = {https://nhatnguyet.org/en/ma-nguon-mo},
  doi    = {10.5281/zenodo.24358014}
}
```

## FAQ

<details>
<summary><b>Pourquoi le calendrier lunaire vietnamien diffère-t-il du calendrier chinois ?</b></summary>

Mêmes règles, horloge différente. Un mois commence le jour de la nouvelle lune,
et ce jour se décide en heure locale. Quand une nouvelle lune tombe entre
16 h 00 et 17 h 00 UT, il est encore avant minuit à Hanoï mais déjà après
minuit à Pékin : le mois commence donc un jour plus tôt au Vietnam. Le Tết 1985
tombe à un mois entier d'écart (le 21 janvier au Vietnam, le 20 février en
Chine), parce que le mois intercalaire tombe une année différente.
</details>

<details>
<summary><b>Quelle est l'heure Tý, et quelle date retient-on pour une naissance à 23 h 30 ?</b></summary>

L'heure Tý va de 23 h 00 à 0 h 59. Le Zi Wei garde la date saisie (certains
livres la reportent au lendemain ; saisissez la date du lendemain pour les
suivre). Le BaZi change de pilier du jour à 23 h 00. Les deux règles sont
indiquées dans les `notes` du thème.
</details>

<details>
<summary><b>Le pilier du mois du BaZi suit-il le mois lunaire ou les termes solaires ?</b></summary>

Les termes solaires : l'année change à Lập Xuân (début du printemps), le mois à
chaque terme sectionnel. Prendre le mois lunaire à la place donne un pilier du
mois différent pour environ un quart des jours (24,3 % de 1900 à 2100).
</details>

<details>
<summary><b>Puis-je utiliser les données pour entraîner un modèle d'IA ?</b></summary>

Oui, y compris à des fins commerciales, sous CC BY 4.0. Créditez « Data: Nhat
Nguyet (nhatnguyet.org) ».
</details>

<details>
<summary><b>Comment les noms vietnamiens sont-ils traités en numérologie ?</b></summary>

Les diacritiques sont supprimés (« Đ » compte comme « D »), puis la table
pythagoricienne des lettres est appliquée. Les nombres maîtres 11, 22 et 33
sont conservés.
</details>

## Contribuer

Les signalements de bugs accompagnés d'une source (un livre et un chapitre, ou
des données astronomiques) sont les plus utiles ; voir
[CONTRIBUTING.md](./CONTRIBUTING.md).

**Défi de portage** : écrivez le moteur dans un autre langage (Go, Rust, Dart,
Swift, C#...) et passez les 17 291 vecteurs de test de [`ca-kiem/`](./ca-kiem).
Lisez `vao`, comparez avec `ra` ; les règles se trouvent dans
[CONTRIBUTING.md](./CONTRIBUTING.md#port-challenge).

Site web : [nhatnguyet.org](https://nhatnguyet.org) · E-mail : lienhe@nhatnguyet.org

<p align="center"><sub>Données : Nhat Nguyet (nhatnguyet.org) · Code MIT · Données CC BY 4.0</sub></p>
