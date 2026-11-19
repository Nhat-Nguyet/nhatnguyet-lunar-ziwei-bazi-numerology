# @nhatnguyet/festivals

206 Vietnamese festivals with their Gregorian dates for any year from 1900 to
2100, provinces, ethnic groups and venues, and iCalendar export. Data under
CC BY 4.0; no external dependencies, TypeScript types, Node 18+ and browsers.

## Install

```bash
npm i @nhatnguyet/festivals
```

## Quick start

```js
import { festivals, festivalsIcs } from "@nhatnguyet/festivals";

const list = festivals(2027);
console.log(list.length, "festivals with a date in 2027");
for (const f of list.filter((x) => x.publicHoliday)) console.log(f.date, f.name);
console.log(festivalsIcs(2027).split("\r\n")[0]);
```

```text
164 festivals with a date in 2027
2027-01-01 New Year's Day
2027-02-06 Lunar New Year (Tết)
2027-04-16 Hùng Kings' Commemoration Day
2027-04-30 Reunification Day
2027-05-01 International Labor Day
2027-09-02 National Day
2027-11-24 Vietnam Culture Day
BEGIN:VCALENDAR
```

## API

| Function | Returns |
|---|---|
| `festivals(year, { lang })` | the 164 festivals with a fixed lunar or Gregorian date, sorted by date: `id`, `date`, `name`, `group`, `scope`, `provinces`, `ethnicGroups`, `venues`, `publicHoliday` |
| `festivalsIcs(year, { lang })` | the same list as an iCalendar (RFC 5545) file, one all-day event per festival |
| `PROVINCES` | the 34 province codes of 2025 |

The other 42 festivals are dated by their organizers each year. Every field:
[English API](https://github.com/Nhat-Nguyet/nhatnguyet-lunar-ziwei-bazi-numerology/blob/main/docs/api-en.md#festivals-nhatnguyetle-hoi).

This package is the English name of
[`@nhatnguyet/le-hoi`](https://www.npmjs.com/package/@nhatnguyet/le-hoi), which
holds the implementation; both export the same functions. The dates match the
engine behind [nhatnguyet.org](https://nhatnguyet.org/en/ma-nguon-mo) on every
shared test vector. Python: `pip install nhatnguyet`.

Data: Nhat Nguyet (nhatnguyet.org). MIT License.
