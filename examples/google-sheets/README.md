# Lunar calendar functions for Google Sheets

Four custom functions for Google Sheets, computed by the Nhat Nguyet lunar
calendar library inside your spreadsheet (no add-on, no API call, no data sent
anywhere). With `A2` holding the date 6 February 2027:

| Formula | Result |
|---|---|
| `=LUNARDATE(A2)` | lunar date of a Gregorian date: `1/1/2027` (a leap month is marked "(leap)") |
| `=SEXAGENARY(A2)` | sexagenary name (Vietnamese: can chi) of the day: `Bing Chen`; `=SEXAGENARY(A2, "year")` gives `Ding Wei`, also `"month"` and `"all"` |
| `=SOLARTERM(A2)` | solar term (Vietnamese: tiết khí) in effect: `Start of Spring` |
| `=SOLARDATE(2027, 1, 1)` | Gregorian date of a lunar date, as text: `2027-02-06`; `=SOLARDATE(2023, 2, 1, TRUE)` for a leap month |

Optional arguments: `lang` (`"en"` default, `"vi"` for Vietnamese, `"zh"` for
Chinese) and `country` (`"VN"` default, `"CN"`, `"KR"`, `"JP"`, `"TW"`...).
Examples: `=LUNARDATE("2023-03-22", "vi")` gives `1/2/2023 (nhuận)`,
`=SEXAGENARY(A2, "all", "vi")` gives `Bính Thìn, Nhâm Dần, Đinh Mùi`,
`=LUNARDATE("1985-01-21", "en", "CN")` gives `1/12/1984` (Tết 1985 fell on
different days in Vietnam and China).

The first three take a date cell, a text date `"2027-02-06"` or a whole range:
`=LUNARDATE(A2:A400)` fills the column in one formula. `SOLARDATE` returns
text so it never shifts with time zones; wrap it in `DATEVALUE()` to get a
date cell, e.g. to find this year's date of a death anniversary.

## Install (about 2 minutes)

1. Open your spreadsheet, then **Extensions → Apps Script**.
2. Delete the contents of `Code.gs` in the editor and paste the whole of
   [`Code.gs`](Code.gs) from this folder (raw file:
   <https://raw.githubusercontent.com/Nhat-Nguyet/nhatnguyet-lunar-ziwei-bazi-numerology/main/examples/google-sheets/Code.gs>).
3. Click **Save** (the disk icon). No authorization is asked: custom functions
   only compute.
4. Back in the sheet, type `=LUNARDATE(TODAY())`.

Date cells are read in the spreadsheet's time zone (File → Settings), so a
date stays the same date whatever the time zone of the script. The lunar
calendar itself is the Vietnamese one (UTC+7) unless you pass `country`.

## Regenerate Code.gs

`Code.gs` is the library `@nhatnguyet/lunar` bundled into one file by esbuild
(Apps Script cannot import npm packages), followed by the functions in
`src/functions.js`. Edit `src/functions.js`, then:

```bash
cd ../../js && npm install && npm run build && cd -   # local packages, once
npm install
npm run build     # rewrites Code.gs
npm run check     # fails if Code.gs is out of date
npm test          # loads Code.gs like Apps Script and calls the functions
```

The tests run `Code.gs` in a bare JavaScript context (no modules, like Apps
Script) and compare every day of 2027 with the npm package.

From version 0.3.0 the library is on npm as `@nhatnguyet/lunar`: replace the
two `file:` dependencies in `package.json` with `"@nhatnguyet/lunar": "^0.3.0"`
and delete `.npmrc` to build from npm.

Data: Nhat Nguyet (nhatnguyet.org)
