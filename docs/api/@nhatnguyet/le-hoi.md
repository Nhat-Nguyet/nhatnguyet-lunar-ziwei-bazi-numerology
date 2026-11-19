[Nhat Nguyet API reference](../README.md) / @nhatnguyet/le-hoi

# @nhatnguyet/le-hoi

Vietnamese festivals and holidays with their Gregorian dates for any year
from 1900 to 2100 (data under CC BY 4.0).

```bash
npm i @nhatnguyet/le-hoi      # or the English-named alias @nhatnguyet/festivals
```

This page lists the English API. The original Vietnamese-named functions
(`danhSachLeHoi`, `leHoiTrongNam`, `leHoiTheoNgay`...) are described in the
[package README](https://github.com/Nhat-Nguyet/nhatnguyet-lunar-ziwei-bazi-numerology/tree/main/js/packages/le-hoi#readme).

## Functions

### festivalPlaces()

```ts
function festivalPlaces(le, lang?): Pick<Festival, "provinces" | "nationwide" | "ethnicGroups" | "venues">;
```

Province, nationwide flag, ethnic groups and venues of one dataset row, in `lang`.

#### Parameters

| Parameter | Type | Default value |
| ------ | ------ | ------ |
| `le` | `LeHoi` | `undefined` |
| `lang?` | [`FestivalLang`](#festivallang) | `"en"` |

#### Returns

`Pick`\<[`Festival`](#festival), `"provinces"` \| `"nationwide"` \| `"ethnicGroups"` \| `"venues"`\>

***

### festivals()

```ts
function festivals(year, opts?): Festival[];
```

Festivals with a fixed date (lunar or Gregorian) in a year, sorted by date.
The dataset holds 206 festivals: 164 have a fixed lunar or Gregorian date
and are returned for every year (1900 to 2100: always 164); the other 42
are dated by their organisers each year and are not included (see
`lich_cong_bo` in `DANH_SACH_LE_HOI`).
Wraps `ngayDuongCuaLe`.

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `year` | `number` |
| `opts?` | \{ `lang?`: [`FestivalLang`](#festivallang); \} |
| `opts.lang?` | [`FestivalLang`](#festivallang) |

#### Returns

[`Festival`](#festival)[]

#### Example

```ts
festivals(2027, { lang: "en" })
```

## Variables

### FESTIVAL\_GROUP\_EN

```ts
const FESTIVAL_GROUP_EN: Readonly<Record<string, string>>;
```

English slugs of the dataset's `nhom` (group) codes.

***

### FESTIVAL\_SCOPE\_EN

```ts
const FESTIVAL_SCOPE_EN: Readonly<Record<string, string>>;
```

English slugs of the dataset's `pham_vi` (scope) codes.

## Interfaces

### Festival

A festival on its Gregorian date in one year.

#### Properties

| Property | Type | Description |
| ------ | ------ | ------ |
| <a id="property-id"></a> `id` | `string` | Stable id from the open dataset (le-hoi-viet-nam). |
| <a id="property-date"></a> `date` | `string` | Gregorian date that year, "YYYY-MM-DD". |
| <a id="property-name"></a> `name` | `string` | Name and description in `lang`. |
| <a id="property-description"></a> `description` | `string` | - |
| <a id="property-calendar"></a> `calendar` | `"lunar"` \| `"solar"` | "lunar": fixed lunar date (converted at UTC+7); "solar": fixed Gregorian date. |
| <a id="property-fixeddate"></a> `fixedDate` | `string` | The fixed date as "day/month" in its own calendar. |
| <a id="property-level"></a> `level` | `string` | "major" or "minor". |
| <a id="property-group"></a> `group` | `string` | Group, an English code in every `lang`: "holiday" (public holidays, Tết and the seasonal feasts), "folk-religion", "other". The dataset's own code ("le-tet", "tin-nguong", "khac") stays in `raw.nhom`. |
| <a id="property-scope"></a> `scope` | `string` | Scope, an English code in every `lang`: "national", "regional", "local", "representative" (one row for a festival held in many places) or "" (not classified yet). The dataset's code stays in `raw.pham_vi`. |
| <a id="property-publicholiday"></a> `publicHoliday` | `boolean` | True for the official days off in Vietnam. |
| <a id="property-daysbefore"></a> `daysBefore` | `number` | Days the festival customarily opens before `date` (its main day) and continues after it. |
| <a id="property-daysafter"></a> `daysAfter` | `number` | - |
| <a id="property-provinces"></a> `provinces` | [`FestivalProvince`](#festivalprovince)[] | Current provinces where it is held (34-unit map of 2025), name in `lang`; empty when not tied to a place or not known. |
| <a id="property-nationwide"></a> `nationwide` | `boolean` | True when observed nationwide (holidays, commemorations, household festivals). Can be true together with `provinces`. |
| <a id="property-ethnicgroups"></a> `ethnicGroups` | `string`[] | Ethnic groups whose festival it is (official list of 54), in `lang`; only where the description says so, otherwise empty. |
| <a id="property-venues"></a> `venues` | [`FestivalVenue`](#festivalvenue)[] | Specific venues, name in `lang`; `coordinates` and `sourceUrl` only when a sourced coordinate is known. |
| <a id="property-raw"></a> `raw` | `LeHoi` | The dataset row, untouched. |

***

### FestivalProvince

A province in a festival, name in the requested language.

#### Properties

| Property | Type | Description |
| ------ | ------ | ------ |
| <a id="property-code"></a> `code` | `string` | Stable code, e.g. "ninh-binh" (see PROVINCES). |
| <a id="property-name-1"></a> `name` | `string` | - |

***

### FestivalVenue

A venue of a festival.

#### Properties

| Property | Type | Description |
| ------ | ------ | ------ |
| <a id="property-name-2"></a> `name` | `string` | - |
| <a id="property-coordinates"></a> `coordinates` | \| \{ `lat`: `number`; `lon`: `number`; \} \| `null` | WGS 84, only when the dataset gives a source for it. |
| <a id="property-sourceurl"></a> `sourceUrl` | `string` \| `null` | Where the coordinates come from (Wikidata, an official page...). |

## Type Aliases

### FestivalLang

```ts
type FestivalLang = "vi" | "en" | "zh";
```

Output language.
