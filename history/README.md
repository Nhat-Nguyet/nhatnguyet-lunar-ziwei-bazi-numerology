# When did Vietnam celebrate Tết?

Official Vietnamese calendar history, compared with computed dates, 1900 to 2100.

The Vietnamese lunar calendar and the Chinese one follow the same rules: a
month starts on the day of the new moon, and the month containing the winter
solstice is month 11. They differ in one parameter, the meridian on which "the
day of the new moon" is decided. Since 1968 in the North, and nationwide after
1975, Vietnam computes it in its own official time, UTC+7 [^121cp]; China
computes it in UTC+8 (since 1929; before that at the Beijing meridian
[^aslaksen]). When a new moon falls between 16:00 and 17:00 UT, it is still the
previous evening in Hanoi and already the next morning in Beijing, and the two
calendars start that month a day apart. This page tells the history of that
choice, what it did to Tết, and how often it matters. The meridian used for the
almanac is not the same thing as the civil clock time; the two are kept apart
below.

Files:

| File | What it is |
|---|---|
| [`tet-1900-2100.csv`](./tet-1900-2100.csv) | One row per year: Tết computed at UTC+7, at UTC+8 and at the Beijing meridian (116°25′ E), the calendar rule in force (north and south for 1955 to 1975), and the Tết actually used where a source documents it |
| [`generate_tet.py`](./generate_tet.py) | Regenerates the computed columns from the Python library in [`../python`](../python); `--check` fails if the CSV drifts, `--summary` prints the figures below |
| [`test_generate_tet.py`](./test_generate_tet.py) | `python3 -m unittest discover -s history` |

## The ten years Tết differs

Computed with the Nhat Nguyet engine (new moons after Jean Meeus, the same
code at both offsets). New moon times are from NASA's catalogue [^nasa].

| Lunar year | Tết at UTC+7 | Tết at UTC+8 | New moon (UT) | What Vietnam actually used |
|---|---|---|---|---|
| 1903 Quý Mão | 28 Jan | 29 Jan | 28 Jan 16:39 | Nguyễn court calendar; date not documented here |
| 1916 Bính Thìn | 3 Feb | 4 Feb | 3 Feb 16:05 | Nguyễn court calendar; date not documented here |
| 1935 Ất Hợi | 3 Feb | 4 Feb | 3 Feb 16:27 | Nguyễn court calendar; date not documented here |
| 1965 Ất Tỵ | 1 Feb | 2 Feb | 1 Feb 16:36 | 2 Feb in the North, reported only by a 2025 retrospective article [^nhandan] (secondary, not an attestation) |
| 1968 Mậu Thân | **29 Jan** | **30 Jan** | 29 Jan 16:29 | **29 Jan in the North (UTC+7), 30 Jan in the South (Beijing meridian)** [^aslaksen] |
| 1969 Kỷ Dậu | 16 Feb | 17 Feb | 16 Feb 16:25 | North by rule 16 Feb, South by rule 17 Feb (Beijing meridian and UTC+8 agree); no printed source found |
| 1985 Ất Sửu | 21 Jan | 20 Feb | 21 Jan 02:28 | 21 Jan by rule (leap month placed differently); the State Calendar Board attests the 1984 leap-month difference [^vnexpress], but we found no source that attests the Tết itself |
| 2007 Đinh Hợi | **17 Feb** | 18 Feb | 17 Feb 16:14 | **17 Feb** [^vnexpress] |
| 2030 Canh Tuất | 2 Feb | 3 Feb | 2 Feb 16:07 | future; Vietnam's legal rule gives 2 Feb |
| 2053 Quý Dậu | 18 Feb | 19 Feb | 18 Feb 16:31 | future; Vietnam's legal rule gives 18 Feb |

Over every day from 1 January 1900 to 31 December 2100 (73,414 days), the
lunar date differs between UTC+7 and UTC+8 on **2,814 days (3.83%)**, in 86
runs of about a month each. Tết differs in **10 of 201 years**. The leap month
differs in 6 years: 1917 (month 3 at UTC+7, month 2 at UTC+8), 1922 (6 and 5),
1938 (8 and 7), 1984 (none and 10), 1985 (2 and none), 1987 (7 and 6).

## History

### Before 1945: Vietnam's own court calendars

Vietnamese dynasties issued their own calendars. Lê Thành Lân, who
reconstructed them from three surviving almanacs, writes: "since AD 1080
Vietnam has always had its own calendar" and "for 171 years there were two
different calendars that existed concurrently" (the Lê-Trịnh north and the
Nguyễn lords' south, 1631 to 1801) [^lan]. Between 1631 and 1788 the two
Vietnamese calendars differed in "four Tets", so people in the two regions did
not always celebrate the New Year on the same day.

Under the Nguyễn dynasty the Hiệp Kỷ calendar of the Khâm Thiên Giám
(Observatory) "was modelled on the Thoi Hien method, so the Vietnamese and
Chinese calendars were quite similar", and was "in continuous use for 133
years, from 1813 to 1945" [^lan]. From 1813 to 1903 Lê Thành Lân counts
"only four differences, all in 'soc' days", that is no Tết difference with the
Qing calendar. For 1904 to 1945 he notes "unresolved issues" and leaves that
calendar aside. He also shows that the French colonial concordances (Deloustal
1908; Cordier and Lê Đức Hoạt 1935) "wrongly assumed that Vietnam used the
Chinese calendar" [^lan].

So for 1903, 1916 and 1935 this dataset gives no "as used" date. The Hiệp Kỷ
calendar used the Qing method, which was not a modern time-zone computation:
until 1929 the Chinese calendar was computed for the Beijing meridian,
116°25′ E, and only after that for 120° E [^aslaksen]. For 1903 that reasoning
points to 29 January (the new moon at 16:39 UT is 00:25 at the Beijing
meridian), but no source we found prints it.

### Civil time is not calendar time

Clock time in Vietnam changed many times: Phù Liễn mean time from 1906, UTC+7
from 1911, UTC+8 from 1943, UTC+9 under the Japanese occupation in 1945, UTC+7
from 2 September 1945, UTC+8 in the French-controlled zones from 1947, then in
the South UTC+7 from July 1955, UTC+8 from 1 January 1960, and UTC+7 again from
13 June 1975 [^tz] [^tienphong]. These are legal clock times. The meridian used
for the lunar calendar is a separate question, and until 1967 it did not follow
the clock: the Democratic Republic of Vietnam kept UTC+7 clocks from 1945 (in Hanoi and
Hải Phòng from 1954 and 1955 [^tz]), but, according to Aslaksen, the
traditional almanac reckoning was the Chinese calendar at the Beijing meridian
[^aslaksen].

### 1945 to 1967: traditional reckoning

Aslaksen writes: "Traditionally, the Vietnamese used the Chinese calendar based
on the longitude of Beijing (116°25′ East)" [^aslaksen]. He gives no period, and
Lê Thành Lân shows that the statement does not hold for 1080 to 1945, when
Vietnam had its own court calendars [^lan]. No source we found documents the
almanac meridian specifically for 1945 to 1967, so the CSV assigns these years
the Beijing meridian by inference from Aslaksen, not from a printed almanac.
Decision 121-CP itself describes the
situation it ended: "Âm lịch có nhiều căn cứ tính và cách tính khác nhau, ngày,
tháng âm lịch không thống nhất và không phù hợp với giờ chính thức của nước ta"
(the lunar calendar had many different bases and methods; its days and months
were not unified and did not match the country's official time) [^121cp].

1965 would be the test case: UTC+7 gives 1 February, while UTC+8 and the
Beijing meridian both give 2 February. A 2025 retrospective article in Nhân Dân
dates a Tết visit of Hồ Chí Minh to Quảng Ninh "ngày 2/2/1965, (tức ngày mùng 1
Tết Ất Tỵ 1965 ...)" [^nhandan]. It is a later secondary source, not a 1965
almanac, so the CSV records it as "reported (secondary)", not as attested.

### 8 August 1967: Decision 121-CP

On 8 August 1967 the Government Council of the Democratic Republic of Vietnam,
signed by Phạm Văn Đồng, issued Decision 121-CP "on calculating the calendar
and managing the State's calendar" [^121cp]:

- Article 1: the country "nằm hoàn toàn trong múi giờ thứ 7" (lies entirely in
  the seventh time zone), whose central meridian is 105° E, near Hanoi; the
  official time is the time of that zone.
- Article 2: the Gregorian calendar is the only calendar of the State; "Ngày
  tết dân tộc, một số ngày kỷ niệm lịch sử và lễ cổ truyền vẫn được tính theo
  âm lịch" (the national Tết, some historical anniversaries and traditional
  festivals are still reckoned by the lunar calendar).
- Article 3: "Âm lịch dùng để định ngày tết dân tộc ... là âm lịch tính theo
  giờ chính thức của nước ta" (the lunar calendar used to fix Tết is the lunar
  calendar computed in the country's official time).
- Article 4: the Meteorological Service (Nha Khí tượng) computes the unified
  lunar calendar.
- Article 5: effective 1 January 1968.

Article 1 was later amended by Decision 134/2002/QĐ-TTg of 14 October 2002,
which keeps the seventh time zone [^134]. The rule of Article 3 is the one the
Vietnamese calendar follows today, and the one this library implements.

### 1968: two Tết in one country

Tết Mậu Thân was the first Tết under the new rule, and it fell exactly on a
dividing new moon: 16:29 UT on 29 January 1968 [^nasa], which is 23:29 in
Hanoi. Aslaksen: "In North Vietnam, the new Moon therefore occurred at 23h 29m
UTC+7 on Jan 29. So Chinese New Year, known as Tet in Vietnam, was celebrated
on January 29. However, in South Vietnam, the new Moon occurred 46 minutes
(11.5°) later at 0h 15m on January 30, so Tet was celebrated on January 30"
[^aslaksen]. The 46 minutes are the difference between the UTC+7 meridian
(105° E) and the Beijing meridian (116°25′ E); Hanoi itself (105°51′ E) is
42.3 minutes west of Beijing. The South reckoned at the Beijing meridian
(UTC+7h45m40s), not at UTC+8. The CSV therefore gives the South the
Beijing-meridian rule. This dataset records only the two calendar dates.

### 1969 to 1975: the South

The South kept UTC+8 clocks until 13 June 1975 [^tz] [^tienphong]; that is
civil time. Its almanac meridian is documented only for 1968, when it was the
Beijing meridian [^aslaksen]; the CSV assumes the same rule for 1955 to 1975.
Between 1955 and 1975 the Beijing meridian and UTC+8 give different lunar dates
on 60 days and the same Tết every year (`generate_tet.py --summary`). In 1969
the North and South rules give different dates (North 16 February, South 17
February), but we found no printed almanac or contemporary record for either,
so the CSV leaves the "as used" columns empty for 1969.

### Since 1976: one calendar, UTC+7

After 1975 the whole country follows Decision 121-CP. Two cases show that it is
applied as written:

- 1984 and 1985. Trần Tiến Bình of the State Calendar Board (Ban lịch Nhà
  nước) notes that "năm 1984 lịch Việt Nam không có tháng nhuận nhưng lịch
  Trung Quốc lại nhuận tháng 10" (in 1984 the Vietnamese calendar had no leap
  month, the Chinese one had a leap month 10) [^vnexpress]. The winter solstice
  of 1984 (16:22:49 UT on 21 December, IMCCE) fell on 21 December in Hanoi time
  but on 22 December in Beijing time, so month 11 started a month apart, and
  the rule gives Tết 1985 on 21 January in Vietnam and 20 February in China.
  Hồ Ngọc Đức derives the same dates [^duc-en], but he computes them with the
  algorithm this library implements, so his page is not independent evidence;
  we found no source that attests the Tết that was observed in 1985.
- 2007. The Board's published calendar, as quoted by VnExpress, states that
  "năm 2007 mồng một Tết Đinh Hợi ở Việt Nam rơi vào 17/2, đến trước Trung Quốc
  một ngày" (Tết 2007 in Vietnam falls on 17 February, one day before China)
  [^vnexpress].

The next differences are 2030 (2 February in Vietnam, 3 February at UTC+8) and
2053 (18 and 19 February) [^duc-en].

## Why Chinese-calendar software gives Vietnamese users wrong dates

Most lunar-calendar code in circulation is written for China and computes for
UTC+8. Used in Vietnam, it is right on about 96% of days and wrong on the rest,
in blocks of a whole month, because a month that starts a day late stays a day
late until the next new moon. Between 2020 and 2035 the blocks are 14 December
2020 to 12 January 2021, 2 February to 3 March 2030 (including Tết), 21 April
to 20 May 2031, 11 March to 9 April 2032, and 12 September to 11 October 2034.

This is not new. In 2006 the State Calendar Board traced wrong dates in
popular almanacs to books whose tables were "dịch từ lịch Trung Quốc"
(translated from the Chinese calendar), and advised Vietnamese readers to use
the Vietnamese calendar [^vnexpress]. Anything keyed to the lunar date
inherits the error: anniversaries of a death (giỗ), festivals, and Tử Vi or
BaZi charts. The library comparison in [`../doi-chieu`](../doi-chieu/README.md)
measures it for two widely used JavaScript libraries: 2,724 days and 4.4% of
Tử Vi charts differ from the Vietnamese calendar. Both libraries are correct
for the calendar they implement; the question is which calendar the user lives
by.

## Reading the CSV

| Column | Meaning |
|---|---|
| `year` | Lunar year, by the Gregorian year in which its Tết falls |
| `year_name_vi` | Stem-branch name in Vietnamese |
| `tet_utc7`, `tet_utc8` | Tết computed by this library at UTC+7 and UTC+8 |
| `tet_beijing_meridian` | Tết computed at the Beijing meridian, 116°25′ E (UTC+7h45m40s) |
| `utc7_utc8_differ`, `diff_days` | 1 when they differ; `tet_utc7` minus `tet_utc8` in days |
| `nasa_new_moon_ut` | NASA new moon before Tết, for the differing years |
| `split` | 1 for 1955 to 1975, when north and south are listed separately |
| `rule_north`, `rule_south` | almanac meridian in force: `nguyen-court-calendar`, `beijing-meridian-116e25` or `utc+7-decision-121-cp` (not the civil clock time) |
| `tet_by_rule_north`, `tet_by_rule_south` | Tết computed under that rule; empty for the Nguyễn court calendar, which is not a time-zone computation |
| `tet_as_used_north`, `tet_as_used_south` | Tết as a source documents it; outside 1955 to 1975 both columns are the whole country |
| `as_used_status` | `attested` (a source states the date), `reported (secondary)` (only a later retrospective source states it), or `computed (no historical source)` |
| `sources` | Ids of the sources below that support the row's rule and dates |

`tet_utc7` is the library's own result. `tet_utc8` and `tet_beijing_meridian`
apply the rule with exact containment: the major solar terms are solved without
rounding and assigned to civil days at that offset (`ExactCalendar` in
`generate_tet.py`). The library's month test checks a 30° sector of a
low-precision solar longitude at local midnight; it agrees with exact
containment on every day of 1900 to 2100 at UTC+7 and at UTC+8 (a test checks
this), but not at the Beijing meridian, where it misplaces the leap month or
month 11 in three years (1917, 1922, 1984) and would give Tết 1985 on 21 January instead of 20 February.

Two years carry an attested date (1968, 2007) and one a secondary report
(1965). In every other year, read the rule columns as "what the rule in force
gives", not as a record of what was printed. The test checks that each
documented date equals the date computed under the rule its sources describe.

## Sources

Quotes were checked against the documents on 19 November 2026. No Chinese
source is used for any date or cross-check.

[^121cp]: S1. Hội đồng Chính phủ (Government Council), Quyết định 121-CP ngày 08/08/1967 về việc tính lịch và quản lý lịch của Nhà nước, signed Phạm Văn Đồng. Text: [thuvienphapluat.vn](https://thuvienphapluat.vn/van-ban/Linh-vuc-khac/Quyet-dinh-121-CP-tinh-lich-quan-ly-lich-cua-Nha-nuoc-18212.aspx), [archived copy](http://web.archive.org/web/20260113060137/https://thuvienphapluat.vn/van-ban/Linh-vuc-khac/Quyet-dinh-121-CP-tinh-lich-quan-ly-lich-cua-Nha-nuoc-18212.aspx).
[^aslaksen]: S2. Helmer Aslaksen (National University of Singapore), *The Mathematics of the Chinese Calendar*, draft of 17 July 2010, section 4.2 (p. 18) and the Vietnam example (pp. 28 and 29). [Archived PDF](https://web.archive.org/web/2011/http://www.math.nus.edu.sg/aslaksen/calendar/cal.pdf). Aslaksen's own reference for the Vietnam example is a web page (his [55]); his statements on the meridian are his own.
[^lan]: S4. Lê Thành Lân, "The Calendars of Southeast Asia. 3: Vietnam", *Journal of Astronomical History and Heritage* 22(3), 431 to 446 (2019), sections 1.1, 3 and 4. [ADS](https://ui.adsabs.harvard.edu/abs/2019JAHH...22..431L), [archived PDF](http://web.archive.org/web/20220319182801/https://www.narit.or.th/files/JAHH/2019JAHHvol22/2019JAHH...22..431L.pdf).
[^tz]: S5. IANA time zone database, file [`asia`](https://github.com/eggert/tz/blob/main/asia), notes on Vietnam by Paul Eggert, based on Trần Tiến Bình, *Lịch Việt Nam: thế kỷ XX-XXI (1901-2100)* (Văn Hoá - Thông Tin, 2005), pp. 49 and 50, and on the official gazettes of 1945, 1955 and 1960; English summary of Trần Tiến Bình's list by Brian Inglis on the [tz mailing list](https://mm.icann.org/pipermail/tz/2014-October/021654.html), 4 October 2014.
[^nhandan]: S6. Quang Thọ, "Thành phố Hạ Long tổ chức kỷ niệm 95 năm Ngày thành lập Đảng Cộng sản Việt Nam", *Nhân Dân*, 3 February 2025, [nhandan.vn](https://nhandan.vn/thanh-pho-ha-long-to-chuc-ky-niem-95-nam-ngay-thanh-lap-dang-cong-san-viet-nam-post858481.html). A retrospective article, not a 1965 document; it agrees with the photo caption in *Báo Văn Hóa* dating Hồ Chí Minh's Tết visit to Quảng Ninh 2.2.1965 ([baovanhoa.vn](https://baovanhoa.vn/chuyen-de/bac-ho-voi-xuan-at-ty-1965-119934.html)).
[^vnexpress]: S7. "Lịch sai do dịch sách Trung Quốc", *VnExpress*, 21 July 2006 (from *Khoa học và Đời sống*), quoting Trần Tiến Bình of the State Calendar Board, [vnexpress.net](https://vnexpress.net/lich-sai-do-dich-sach-trung-quoc-2814087.html).
[^duc-en]: S8. Hồ Ngọc Đức, "Computing the Vietnamese lunar calendar" (computed with the same algorithm; cited for the derivation, not as an attestation), section "Comparison with Chinese calendar", [archived copy](http://web.archive.org/web/20241204143834/http://www.informatik.uni-leipzig.de/~duc/amlich/calrules_en.html); Vietnamese version "Thuật toán tính âm lịch", [archived copy](http://web.archive.org/web/20151230120308/http://www.informatik.uni-leipzig.de/~duc/amlich/calrules.html).
[^tienphong]: S9. "Trước năm 1975, Việt Nam sử dụng 2 múi giờ", *Tiền Phong*, 29 April 2005 (after *Tuổi Trẻ*), [tienphong.vn](https://tienphong.vn/xa-hoi/8102/Truoc-nam-1975-Viet-Nam-su-dung-2-mui-gio.html).
[^nasa]: S10. Fred Espenak, NASA Goddard Space Flight Center, *Six Millennium Catalog of Phases of the Moon*, [phases 1901 to 2000](https://eclipse.gsfc.nasa.gov/phase/phases1901.html) and [2001 to 2100](https://eclipse.gsfc.nasa.gov/phase/phases2001.html).
[^134]: Quyết định 134/2002/QĐ-TTg ngày 14/10/2002 sửa đổi Điều 1 Quyết định 121-CP, as listed by [thuvienphapluat.vn](https://thuvienphapluat.vn/van-ban/linh-vuc-khac/quyet-dinh-134-2002-qd-ttg-tinh-lich-quan-ly-lich-sua-doi-quyet-dinh-121-cp-50075.aspx). We read the title and the amended article number, not the full text.

## Open questions

- The printed Tết of 1903, 1916 and 1935 in the Nguyễn court calendar.
- Whether the South's almanacs of 1969 printed 17 February, as UTC+8 gives.
- The North's almanacs between 1946 and 1954, when there was no single
  calendar authority. Tết is the same at UTC+7 and UTC+8 in all those years, so
  the answer changes no date in this file.

Corrections with a source are welcome (see [CONTRIBUTING.md](../CONTRIBUTING.md)).
Data: CC BY 4.0, Nhat Nguyet (nhatnguyet.org).

---

## Tiếng Việt: Việt Nam ăn Tết ngày nào?

Âm lịch Việt Nam và âm lịch Trung Quốc dùng chung quy tắc, chỉ khác kinh tuyến
để xét "ngày sóc". Từ 1968 Việt Nam tính theo giờ chính thức UTC+7, Trung Quốc
theo UTC+8. Điểm sóc rơi từ 16 tới 17 giờ UT thì ở Hà Nội vẫn là tối hôm trước,
ở Bắc Kinh đã sang sáng hôm sau, nên hai lịch lệch nhau một ngày cả tháng.

- **Trước 1945**: các triều đại Việt Nam tự làm lịch. Lịch Hiệp Kỷ của Khâm
  Thiên Giám triều Nguyễn (1813 tới 1945) theo phép Thời Hiến nhà Thanh; từ 1813
  tới 1903 chỉ lệch lịch Thanh bốn ngày sóc, không lệch Tết [^lan]. Ngày Tết
  thực dùng các năm 1903, 1916, 1935 chưa có nguồn.
- **1945 tới 1967**: giờ đồng hồ (giờ dân sự) của Việt Nam Dân chủ Cộng hòa là
  UTC+7 [^tz], nhưng kinh tuyến tính âm lịch là chuyện khác: Aslaksen viết rằng
  "theo truyền thống" người Việt dùng lịch Trung Quốc tính theo kinh độ Bắc Kinh
  (116°25′ Đông), không nêu giai đoạn [^aslaksen]. Một bài hồi cố năm 2025 ghi
  Tết Ất Tỵ ở miền Bắc là 2/2/1965 [^nhandan] (nguồn thứ cấp, chưa phải bằng
  chứng; UTC+7 cho 1/2).
- **Quyết định 121-CP ngày 8/8/1967**, hiệu lực 1/1/1968: giờ chính thức là múi
  giờ thứ 7; "Âm lịch dùng để định ngày tết dân tộc ... là âm lịch tính theo
  giờ chính thức của nước ta" (Điều 3); Nha Khí tượng tính lịch (Điều 4) [^121cp].
- **Tết Mậu Thân 1968**: điểm sóc 16:29 UT ngày 29/1, tức 23:29 giờ Hà Nội.
  Miền Bắc ăn Tết 29/1, miền Nam 30/1; miền Nam tính theo kinh tuyến Bắc Kinh
  (sóc lúc 0h15 ngày 30/1, muộn hơn giờ UTC+7 46 phút: 46 phút là khoảng cách
  từ kinh tuyến 105° Đông tới kinh tuyến Bắc Kinh; Hà Nội ở 105°51′ Đông thì
  cách Bắc Kinh 42,3 phút), không phải UTC+8 [^aslaksen].
- **1969 tới 1975**: giờ đồng hồ miền Nam là UTC+8 tới 13/6/1975 [^tz]
  [^tienphong]; kinh tuyến âm lịch chỉ có nguồn cho năm 1968 (Bắc Kinh). Từ 1955
  tới 1975, kinh tuyến Bắc Kinh và UTC+8 cho ngày âm khác nhau ở 60 ngày, Tết
  trùng mọi năm. Tết 1969 theo quy tắc là 16/2 ở miền Bắc, 17/2 ở miền Nam;
  chưa tìm được lịch in.
- **Từ 1976**: cả nước theo 121-CP. Năm 1984 lịch Việt Nam không nhuận, lịch
  Trung Quốc nhuận tháng 10 [^vnexpress]; theo quy tắc, Tết 1985 ở Việt Nam là
  21/1, Trung Quốc 20/2 (tính, chưa có nguồn xác nhận ngày ăn Tết); Tết 2007 là
  17/2, sớm hơn Trung Quốc một ngày [^vnexpress].
  Lần lệch tới: 2030 (2/2 và 3/2), 2053 (18/2 và 19/2).

Từ 1900 tới 2100, âm lịch tính ở UTC+7 và UTC+8 khác nhau 2.814 trên 73.414 ngày
(3,83%), 86 đoạn; Tết khác ở 10 năm; tháng nhuận khác ở 6 năm. Phần mềm viết
cho lịch Trung Quốc vì thế sai với người Việt từng tháng một, như 14/12/2020 tới
12/1/2021 hay 2/2 tới 3/3/2030; từ năm 2006 Ban lịch Nhà nước đã cảnh báo sách
lịch vạn niên "dịch từ lịch Trung Quốc" [^vnexpress].

Tệp `tet-1900-2100.csv` chỉ ghi cột "thực dùng" khi có nguồn: 1968, 2007 có
nguồn xác nhận (`attested`), 1965 chỉ có nguồn hồi cố thứ cấp (`reported
(secondary)`); các năm khác ghi `computed (no historical source)`. Chạy lại phần tính:
`python3 history/generate_tet.py`, kiểm: `python3 -m unittest discover -s history`.
