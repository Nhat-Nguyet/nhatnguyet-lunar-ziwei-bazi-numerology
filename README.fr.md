<p align="center">
  <a href="https://nhatnguyet.org/en/ma-nguon-mo">
    <picture>
      <source media="(prefers-color-scheme: dark)" srcset="./assets/banner-toi.svg">
      <img src="./assets/banner-sang.svg" alt="Nhat Nguyet" width="720">
    </picture>
  </a>
</p>

<h1 align="center">Nhat Nguyet : bibliothèque et jeux de données open source pour le Zi Wei Dou Shu, le BaZi et la numérologie</h1>

<p align="center">
  <b>Bibliothèque open source gratuite pour établir des thèmes Zi Wei Dou Shu (astrologie de l'Étoile pourpre) et BaZi (Quatre Piliers du destin), calculer la numérologie, convertir le calendrier lunaire vietnamien et le calendrier chinois, et consulter des prières rituelles vietnamiennes, en JavaScript et en Python.</b><br>
  3,6 millions de thèmes pré-interprétés · plus de 60 textes classiques · calendrier lunaire vietnamien vérifié par rapport à la NASA
</p>

<p align="center">
  <a href="./LICENSE"><img alt="Code : MIT" src="https://img.shields.io/badge/code-MIT-1f6f6b.svg"></a>
  <a href="./DATA-LICENSE"><img alt="Données : CC BY 4.0" src="https://img.shields.io/badge/data-CC%20BY%204.0-1f6f6b.svg"></a>
  <a href="./ca-kiem"><img alt="Cas de test : 17 291 réussis" src="https://img.shields.io/badge/test%20cases-17%2C291%20passing-2e7d32.svg"></a>
  <a href="https://github.com/Nhat-Nguyet/nhatnguyet/actions/workflows/kiem.yml"><img alt="Vérifications automatiques" src="https://github.com/Nhat-Nguyet/nhatnguyet/actions/workflows/kiem.yml/badge.svg?branch=main"></a>
  <a href="https://doi.org/10.5281/zenodo.24358014"><img alt="DOI" src="https://zenodo.org/badge/DOI/10.5281/zenodo.24358014.svg"></a>
</p>

<p align="center">
  <a href="./README.md">English</a> · <a href="./README.vi.md">Tiếng Việt</a> · <a href="./README.zh.md">中文</a> · <a href="./README.ja.md">日本語</a> · <a href="./README.ko.md">한국어</a> · <b>Français</b> · <a href="./README.th.md">ไทย</a>
  <br>
  <a href="https://nhatnguyet.org/en/ma-nguon-mo">Page du projet</a> ·
  <a href="https://nhatnguyet.org/en/du-lieu">Données ouvertes</a> ·
  <a href="https://huggingface.co/nhatnguyet">Hugging Face</a> ·
  <a href="https://nhatnguyet.org/en/blog">Tutoriels</a>
</p>

---

## Sommaire

1. [Présentation](#présentation)
2. [Pourquoi Nhat Nguyet](#pourquoi-nhat-nguyet)
3. [Contenu du dépôt](#contenu-du-dépôt)
4. [Démarrage rapide](#démarrage-rapide)
5. [Ce que vous pouvez construire](#ce-que-vous-pouvez-construire)
6. [Fondements scientifiques](#fondements-scientifiques)
7. [Feuille de route](#feuille-de-route)
8. [Licence et attribution](#licence-et-attribution)
9. [FAQ](#faq)
10. [Contribuer et contact](#contribuer-et-contact)

## Présentation

Code et jeux de données open source sur les traditions métaphysiques et les
croyances populaires, **ancrés au Vietnam, couvrant les traditions orientales
comme occidentales** : Tử Vi (Zi Wei Dou Shu), Bát Tự (BaZi), numérologie,
Yi Jing, tarot, astrologie, feng shui, choix des dates, calendriers lunaires de
quatre pays, fêtes traditionnelles et prières rituelles. Chaque résultat
correspond, champ par champ, au moteur de calcul qui fait tourner
[nhatnguyet.org](https://nhatnguyet.org) et l'application Nhat Nguyet sur iOS
et Android.

| Thèmes pré-interprétés | Textes classiques | Articles de connaissances | Jeux de données ouverts | Cas de test |
|:---:|:---:|:---:|:---:|:---:|
| **3,6 millions** | **60+ titres**<br>7,3 millions de caractères | **510 articles**<br>résumés, FAQ | **33 jeux de données**<br>avec DOI | **17 291**<br>tous réussis |
| **456** prières rituelles | **200** fêtes | **4** calendriers lunaires nationaux | **3** langues | **0** dépendance |

## Pourquoi Nhat Nguyet

| | |
|---|---|
| **Calendrier à l'heure du Vietnam** | Entre 1900 et 2100, 2 814 jours tombent à une date lunaire différente de celle du calendrier calculé à l'heure de Pékin ; le Nouvel An lunaire (Tết) diffère sur 10 années. Vous pouvez choisir le calendrier de chaque pays ; le Vietnam est la valeur par défaut. |
| **Vérifiable** | Les nouvelles lunes s'écartent de la NASA de 1,1 minute en moyenne ; les heures des termes solaires s'écartent de l'IMCCE de 4,2 minutes en moyenne. Les versions TypeScript et Python reproduisent chaque champ du moteur de référence sur 17 291 cas. |
| **Appuyé sur les sources** | Chaque citation classique indique son livre et son chapitre, avec le texte original vérifié sur des éditions imprimées. Quand les écoles divergent, le projet le signale au lieu d'en choisir une en silence. |
| **Trois langues** | Noms des étoiles, terminologie et interprétations intégralement en vietnamien, en anglais et en chinois. |
| **S'exécute sur votre appareil** | Aucune dépendance, aucun appel réseau, aucune donnée envoyée nulle part. Fonctionne dans le navigateur, Node et Python. |

## Contenu du dépôt

### Bibliothèques

| Sujet | TypeScript (npm) | Python (`pip install nhatnguyet`) | Rôle |
|---|---|---|---|
| Calendrier lunaire | [`@nhatnguyet/am-lich`](./js/packages/am-lich) | `nhatnguyet.am_lich` | Conversion lunaire et solaire pour quatre pays, troncs célestes et branches terrestres, 24 termes solaires à la minute près, les 28 demeures lunaires (Nhị Thập Bát Tú), nạp âm |
| Zi Wei Dou Shu | [`@nhatnguyet/tu-vi`](./js/packages/tu-vi) | `nhatnguyet.tu_vi` | Thème à 12 palais, éclat des étoiles, Quatre Transformations (Tứ Hóa), Tuần et Triệt, périodes décennales, périodes annuelles, étoiles de transit, configurations du thème |
| BaZi | [`@nhatnguyet/bat-tu`](./js/packages/bat-tu) | `nhatnguyet.bat_tu` | Quatre piliers selon les termes solaires, troncs cachés, Dix Dieux, étoiles symboliques (thần sát), cycles de chance décennaux, petites périodes (tiểu vận) |
| Numérologie | [`@nhatnguyet/than-so-hoc`](./js/packages/than-so-hoc) | `nhatnguyet.than_so_hoc` | Chemin de vie, expression, élan de l'âme, sommets, défis, année personnelle ; noms vietnamiens avec diacritiques |
| Fêtes | [`@nhatnguyet/le-hoi`](./js/packages/le-hoi) | `nhatnguyet.le_hoi` | 200 fêtes, conversion des dates lunaires en dates solaires pour chaque année |

### Jeux de données

| Jeu de données | Contenu | Format | Taille |
|---|---|---|---|
| Interprétations par thème | Zi Wei Dou Shu et BaZi pour chaque date de naissance de 1900 à 2100 (12 heures, 2 sexes) ; numérologie par date de naissance | JSON Lines compressé en zstd, un fichier par année de naissance | ~11 Go compressés |
| ↳ thèmes structurés | positions des étoiles, Quatre Transformations, piliers, nombres, avec identifiants d'interprétation | `la-so/<topic>/<year>` | ~1,6 Go |
| ↳ préassemblés par langue | texte intégral dans une seule langue par fichier, pour l'entraînement d'IA | `ghep-san/<topic>/<vi\|en\|zh>/<year>` | ~9 Go |
| ↳ magasin de textes | interprétations, passages classiques, lectures complémentaires ; chaque passage stocké une seule fois, avec un identifiant | `kho/` | < 0,3 Go |
| Textes classiques | 60+ titres du domaine public, texte intégral | texte brut | ~20 Mo |
| Calendrier, fêtes, prières rituelles | 33 jeux de données : calendrier luni-solaire de 1900 à 2100, 64 hexagrammes, 78 cartes de tarot, termes solaires, prières rituelles, rites... | CSV, JSON, Parquet | 118 Mo |

### Cas de test

[`ca-kiem/`](./ca-kiem) : 17 291 paires entrée et réponse générées à partir du
moteur de référence, pour les calendriers lunaires de quatre pays, les fêtes,
la numérologie, le BaZi et le Zi Wei Dou Shu. Quel que soit le langage dans
lequel vous écrivez une bibliothèque, vous pouvez la vérifier vous-même : lisez
`vao` (entrée), comparez avec `ra` (sortie attendue).

## Démarrage rapide

**TypeScript, JavaScript**

```bash
npm i @nhatnguyet/tu-vi @nhatnguyet/am-lich
```

```ts
import { lapLaSoTuVi, nhanDienCachCuc } from "@nhatnguyet/tu-vi";
import { solarToLunar, MUI_GIO_THEO_NUOC } from "@nhatnguyet/am-lich";

const laSo = lapLaSoTuVi("", "Nam", 19, 9, 1990, 10); // né le 19 septembre 1990, heure Tuất (19 h à 21 h)
console.log(laSo.tenCuc, nhanDienCachCuc(laSo).map((c) => c.ten));

solarToLunar(21, 1, 1985);                       // calendrier vietnamien : premier jour du Tết
solarToLunar(21, 1, 1985, MUI_GIO_THEO_NUOC.CN); // calendrier chinois : premier jour du 12e mois lunaire
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

**Jeux de données**

```python
from datasets import load_dataset
ds = load_dataset("nhatnguyet/loi-luan-tu-vi", data_files="ghep-san/tu-vi/en/1990.jsonl.zst")
```

## Ce que vous pouvez construire

| Objectif | Ce qu'il faut utiliser | Guide |
|---|---|---|
| **Sites et applications de thèmes** | bibliothèques Zi Wei Dou Shu, BaZi, numérologie | [Établir un thème Tử Vi en JavaScript](https://nhatnguyet.org/en/blog/lap-la-so-tu-vi-bang-javascript) |
| **Applications de calendrier et de rappels** | calendrier lunaire, fêtes, prières rituelles | [Calendrier lunaire, fêtes et anniversaires de décès pour votre application](https://nhatnguyet.org/en/blog/lich-am-le-hoi-cho-ung-dung) |
| **Entraînement d'IA** | interprétations préassemblées par langue | [Entraîner une IA sur des données de thèmes Tử Vi](https://nhatnguyet.org/en/blog/huan-luyen-ai-voi-du-lieu-tu-vi) |
| **Assistants IA avec citations** | magasin de passages classiques, lectures complémentaires | [Un assistant IA qui cite les livres classiques](https://nhatnguyet.org/en/blog/tro-ly-ai-trich-dan-sach-co) |
| **Analyse de données** | thèmes structurés | [Quelle est la rareté des configurations de thème ?](https://nhatnguyet.org/en/blog/phan-tich-du-lieu-la-so-bang-python) |
| **Recherche sur le calendrier et la culture** | calendriers lunaires de quatre pays, fêtes, textes classiques | [Le calendrier lunaire vietnamien n'est pas le calendrier chinois](https://nhatnguyet.org/en/blog/am-lich-viet-nam-khac-trung-quoc) |
| **Tester votre propre bibliothèque** | cas de test | [Tester avec les cas de test partagés](https://nhatnguyet.org/en/blog/kiem-thu-vien-bang-bo-ca-kiem) |

Également : l'enseignement (établissement d'un thème pas à pas), la traduction
(terminologie en trois langues), le contenu et le journalisme (chiffres
vérifiables).

## Fondements scientifiques

**La science est dans la méthode, pas dans les prédictions.** Le calendrier
relève du calcul astronomique, vérifié par rapport à la NASA et à l'IMCCE.
Chaque résultat est déterministe et peut être revérifié avec les cas de test.
Le Zi Wei Dou Shu, le BaZi, la numérologie et les autres arts métaphysiques
sont les règles d'écoles particulières et n'ont pas été validés
scientifiquement ; ne les utilisez pas comme base de décisions médicales,
financières ou juridiques.

**Calendrier par pays**

| Calendrier | Fuseau horaire utilisé | Pays et régions |
|---|---|---|
| Vietnam (par défaut) | UTC+7 | Vietnam |
| Chine | UTC+8 | Chine continentale, Taïwan, Hong Kong, Macao ; Nouvel An chinois à Singapour, en Malaisie, en Indonésie, aux Philippines |
| Corée | UTC+9 | Corée du Sud |
| Japon | UTC+9 | Ancien calendrier lunaire (kyūreki), utilisé pour les célébrations traditionnelles |

La Mongolie, le Tibet, la Thaïlande, le Laos, le Cambodge, le Myanmar et l'Inde
suivent des calendriers aux règles différentes et ne figurent pas encore dans
la bibliothèque.

**Pour aller plus loin**

| Données | Article |
|---|---|
| Calendrier lunaire, termes solaires | [Comment est-il calculé, et quelle est sa marge d'erreur ?](https://nhatnguyet.org/en/blog/co-so-khoa-hoc-am-lich-tiet-khi) |
| Troncs et branches, cycle de 60 ans, 28 demeures | [Comment découlent-ils du jour julien ?](https://nhatnguyet.org/en/blog/co-so-khoa-hoc-can-chi-chu-ky) |
| Thème Zi Wei Dou Shu | [De la date et de l'heure de naissance aux 12 palais](https://nhatnguyet.org/en/blog/co-so-khoa-hoc-la-so-tu-vi) |
| Configurations du Tử Vi Đẩu Số Toàn Thư | [Conditions et fréquence de chaque configuration](https://nhatnguyet.org/en/blog/co-so-khoa-hoc-cach-cuc-toan-thu) |
| BaZi | [Pourquoi le pilier du mois suit les termes solaires](https://nhatnguyet.org/en/blog/co-so-khoa-hoc-bat-tu) |
| Numérologie | [Un système moderne, et les noms vietnamiens](https://nhatnguyet.org/en/blog/co-so-khoa-hoc-than-so-hoc) |
| Textes classiques, interprétations | [Numérisés, collationnés, reliés aux thèmes](https://nhatnguyet.org/en/blog/co-so-khoa-hoc-sach-co-loi-luan) |
| Fêtes, prières rituelles | [Sources et vérification des dates](https://nhatnguyet.org/en/blog/co-so-khoa-hoc-le-hoi-van-cung) |
| Méthode générale | [Comment Nhat Nguyet vérifie son travail](https://nhatnguyet.org/en/blog/co-so-khoa-hoc-kiem-chung) |

## Feuille de route

- [x] Calendriers lunaires de quatre pays, troncs et branches, 24 termes solaires, 28 demeures lunaires
- [x] Zi Wei Dou Shu, BaZi, numérologie, fêtes (TypeScript, Python)
- [x] Interprétations de thèmes de 1900 à 2100, en trois langues
- [ ] Prières rituelles : rechercher les cérémonies, obtenir les textes, insérer les noms dans la prière
- [ ] Yi Jing, Six Lignes (Lục Hào), numérologie de la fleur de prunier (Mai Hoa)
- [ ] Feng shui : Huit Demeures (Bát Trạch), trigramme personnel (cung phi), règle de Lỗ Ban
- [ ] Choix des dates : heures fastes, les 12 officiers du jour (12 trực), jours néfastes
- [ ] Astrologie zodiacale occidentale, tarot
- [ ] Options selon les écoles (mois intercalaires, heure du Rat), temps solaire vrai

## Licence et attribution

| Partie | Licence | Ce que vous pouvez faire |
|---|---|---|
| Code source | [MIT](./LICENSE) | Utiliser, modifier, vendre ; conserver la ligne `Copyright (c) 2026 Nhat Nguyet (nhatnguyet.org)` |
| Données, interprétations | [CC BY 4.0](./DATA-LICENSE) | Usage commercial et entraînement d'IA, **attribution obligatoire** |
| Textes classiques | Domaine public | Le texte original est libre d'utilisation ; la numérisation et le collationnement sont sous CC BY 4.0 |
| Prières rituelles | CC BY 4.0 | Recueillies dans la tradition populaire et éditées par Nhat Nguyet, qui ne revendique pas la paternité de leur formulation |

**Ligne d'attribution standard :** `Data: Nhat Nguyet (nhatnguyet.org)` (en
français : « Données : Nhat Nguyet (nhatnguyet.org) »), avec un lien vers
https://nhatnguyet.org lorsque c'est possible. Les applications qui affichent
des résultats écrivent « Selon Nhat Nguyet » (« According to Nhat Nguyet ») à
un endroit visible par les utilisateurs. En cas de redistribution des données,
conservez la colonne `nguon` (source).

Le nom et le logo **Nhat Nguyet** sont des marques et ne sont pas couverts par
les licences. Ne nommez ni ne présentez un produit d'une manière qui laisse
entendre qu'il est créé ou approuvé par Nhat Nguyet.

**Citer le projet**

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
<summary><b>Existe-t-il une bibliothèque gratuite pour établir des thèmes Zi Wei Dou Shu en JavaScript ou en Python ?</b></summary>

Oui : `npm i @nhatnguyet/tu-vi` ou `pip install nhatnguyet`. Un thème comprend
la phase élémentaire (cục), les palais de la Vie et du Corps, les 14 étoiles
majeures et les étoiles mineures, l'éclat des étoiles, les Quatre
Transformations (Tứ Hóa), Tuần et Triệt, les périodes décennales, les périodes
annuelles, les étoiles de transit et les configurations du thème, y compris
celles du Tử Vi Đẩu Số Toàn Thư.
</details>

<details>
<summary><b>Puis-je utiliser ces données pour entraîner un modèle d'IA ?</b></summary>

Oui, y compris pour des produits commerciaux, sous CC BY 4.0. La seule
condition est de créditer « Data: Nhat Nguyet (nhatnguyet.org) » (en français :
« Données : Nhat Nguyet (nhatnguyet.org) »).
</details>

<details>
<summary><b>Quelle est la précision de la conversion entre dates lunaires et grégoriennes ?</b></summary>

Le calendrier est calculé à partir des positions vraies de la Lune et du
Soleil. Sur la période 1900 à 2100, les nouvelles lunes s'écartent de la NASA
de 1,1 minute en moyenne ; les heures des termes solaires s'écartent de l'IMCCE
de 4,2 minutes en moyenne. Reconstruire le calendrier lunaire à partir des
seules données de la NASA et de l'IMCCE donne une correspondance sur 2 459 des
2 461 mois.
</details>

<details>
<summary><b>Le pilier du mois du BaZi suit-il le mois lunaire ou les termes solaires ?</b></summary>

Les termes solaires, comme l'exige la méthode des Quatre Piliers : le pilier de
l'année change à Lập Xuân (début du printemps) et le pilier du mois au moment
où commence chaque terme solaire, et non le premier jour du mois lunaire.
Prendre le mois lunaire comme pilier du mois donne un résultat faux pour
environ un quart des jours.
</details>

<details>
<summary><b>Comment la numérologie traite-t-elle les noms vietnamiens avec diacritiques ?</b></summary>

Les diacritiques sont supprimés, puis les lettres sont converties avec la table
de correspondance lettres et nombres, « Đ » étant compté comme « D ». Vous
obtenez le chemin de vie, l'expression, l'élan de l'âme, la personnalité,
l'attitude, les sommets, les défis, ainsi que les nombres de l'année, du mois
et du jour personnels.
</details>

<details>
<summary><b>D'où viennent les prières rituelles ?</b></summary>

Elles sont recueillies dans la tradition populaire, éditées par Nhat Nguyet et
classées en 155 types de cérémonies : Nouvel An lunaire (Tết), pleine lune,
premier jour du mois lunaire, anniversaires de décès, mariages, pendaisons de
crémaillère, ouvertures de commerce...
</details>

## Contribuer et contact

- Signalements de bugs et suggestions : ouvrez une issue avec la date et
  l'heure de naissance, le sexe, le résultat obtenu, le résultat attendu et
  votre source. Voir [CONTRIBUTING.md](./CONTRIBUTING.md).
- Site web : [nhatnguyet.org](https://nhatnguyet.org) · E-mail : lienhe@nhatnguyet.org

<p align="center"><sub>Données : Nhat Nguyet (nhatnguyet.org) · Code MIT · Données CC BY 4.0</sub></p>
