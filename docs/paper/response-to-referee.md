# Response to the referees' reports

# Round 2: version 3 to version 4

We thank the referee for the second report, the independent DE440 check with
Skyfield and the clean-tree reproduction. Version 4 makes the required changes
1 to 6, the parts of 7 that are in our control, and the recommended
comparison 9. Numbers in this part are inserted from the result files of
version 4 (`fill.py`); section numbers refer to version 4, in which Section 6
has two new subsections (6.6 The month test, 6.7 Hồ Ngọc Đức's program) and
the harmonised counterfactual moved to 6.8.

## 1. June 1944 (R1)

Agreed: it is an engine error, not a question of resolution. Section 6.5 and
Table 9 now say so: DE440 puts the new moon
27 s
before Hanoi midnight on 20 June 1944, the engine
2.04 min later;
the series contributes +86.5 s
in TT and the ΔT difference 36.0 s.
It is the only month of 1901 to 2025
(1,546 new moons) where the published
engine disagrees with DE440 converted with either ΔT model, both of which
follow observation before 2026. The sentence about the resolution of the
references is removed. Section 6.8 adds that the Espenak–Meeus-harmonised
variant fixes no month of 1901 to 2025 against DE440 and adds July 1967
(DE440 4 s
after midnight). The Conclusions mention 1944, and Section 6.5 states that
this is a computation under the UTC+7 convention, not a statement about the
calendar used in 1944.

We also checked our conjunctions against Skyfield ourselves, for all
2,474 events rather than nine (`skyfield_check.py`, IAU
2006/2000A, relativistic aberration, light deflection): the TT instants agree
to 0.014 s at most. Section 5.1 now
says that the precession model cancels to first order in a conjunction.

## 2. Future ΔT (R2b)

- A current prediction is added: Skyfield 1.55's
  built-in ΔT (`delta_t_forecast.py`, values in `data/delta-t-skyfield.tsv`):
  IERS values to January 2027, then a spline to the long-term parabola of
  Stephenson et al. (2016), with the Morrison et al. (2021) splines before
  1973. It reproduces the observed ΔT to
  0.01 s in 1973–2025. It is
  a column of Table 3 and a curve in Figure 3, cited to Skyfield and
  Stephenson et al. (2016). We present it as a second model, not as the
  better forecast.
- Section 4.4 restricts the statement that $\delta_k$ is much smaller than
  the reference ΔT to 1900–2025, says that the comparison with Espenak–Meeus
  is decisive only up to 2025, and that $\delta_k$ is closer to the Skyfield
  prediction than Espenak–Meeus is from
  2042 on.
- Table 9 gives the DE440 Hanoi time under both models for 2054, 2072, 2077
  and 2085. Our numbers agree with yours: 2072
  2072-12-09 23:59:46, 2077
  2077-11-16 00:01:02, 2085
  2085-10-19 00:00:59 with Skyfield ΔT.
  One nuance: in 2072 DE440 stays on 9 December under both models (under
  Skyfield 14 s
  before midnight), so the engine is a day late under both; under
  Espenak–Meeus the lateness is mostly ΔT, under Skyfield mostly the series.
  Because that margin is far below the uncertainty of any ΔT prediction for
  2072, all three months are classified as depending on the ΔT model, as you
  asked, and the table shows the computed verdict for each model.
- "DE440 sides with the engine" in 2085 is qualified (true only with
  Espenak–Meeus ΔT); the 2077 disagreement disappears with Skyfield ΔT.
- The counterfactual is renamed "Espenak–Meeus-harmonised" throughout, and
  Section 6.8 states that it is not an accuracy improvement after 2025.
- Section 8.2 ties the one- and five-minute windows of Table 12 to the spread
  between the models: Espenak–Meeus exceeds Skyfield by
  61.2 s in 2072 and
  107.6 s in 2100.

## 3. Abstract and Section 6.3 (R2a)

Both now say that the bias
(0.9 min) is mainly ΔT
(43.0 s on average) and the
scatter (0.71 min MAE,
0.89 min RMS in TT) is the series,
which decides the months near midnight.

## 4. Sector test (R3)

- Measured band: $\lambda_{\mathrm{g}}$ minus the engine's apparent longitude,
  every day 1900–2100 (73,414 days), lies between
  −23.0″ and 66.7″, i.e.
  27.1 min early to
  9.3 min late (your figures, sampled every
  1.37 days: −23.0″ to +66.6″). It replaces the 15.3-minute bound in
  Sections 4.5, 5.4 and 6.6; `sector_test_offset_minutes` is removed from
  `results.json`. Recounted with the asymmetric band,
  8 major terms (instead of 6)
  lie in it within a day of a month start at UTC+7.
- Direct check (Section 6.6): the sector at the first day of each month,
  against the sector implied by the IMCCE major terms. Differences at UTC+7
  0 of
  2,486, at UTC+8
  0 of
  2,486, at the Beijing meridian
  3
  (1917-04-21, 1922-07-24, 1984-12-22). Our month count is
  2,486 rather than your 2,470 because we
  include every month start of 1900–2100.
- Exact containment for the counterfactual offsets: `history/generate_tet.py`
  now has an `ExactCalendar` (engine new moons, major terms of the solar-term
  module solved without rounding, Definitions 1 to 6). At UTC+7 and UTC+8 it
  gives the engine's date on every day of 1900–2100 (a unit test checks
  this); at the Beijing meridian it differs on 266 days in three runs (1917,
  1922, 1984–85). Every result at UTC+8 or at the Beijing meridian in the
  paper (Sections 7, 8.3) and in the history dataset now uses it.
- History dataset: `tet_beijing_meridian` for 1985 is corrected from
  1985-01-21 to 1985-02-20; no other row changes. The
  README of `history/` explains the method and the failure of the sector
  test at that offset. Nothing else is derived from that column.
- Section 9 states that the sector test fails three times at the Beijing
  meridian in this period.

## 5. Section 6.1 (R4)

Rewritten as suggested: the engine is
0.21 s
before midnight, smaller than the
0.29 s interpolation error,
so this case is undecided by IMCCE as derived here and the 100% is
conditional on it.

## 6. Attributions and small fixes (R5, R6, R7, M6 row)

- VSOP87D precession: the VSOP87 documentation says only "precessional
  moving" without naming the quantities, and we could not consult the full
  text of Bretagnon and Francou (1988). Instead we measured it (Section 6.2):
  VSOP87D minus VSOP87B for the Earth gives
  5029.0967″ per century and
  1.1122″ per century²
  (residual 0.0013″), the IAU 1976
  values of Lieske et al. (1977). The Miriade P03 precession is stated as an
  assumption supported by the residual, as you suggested. The sentence
  crediting the referee is replaced by these statements; the
  Acknowledgements credit the referee.
- INPOP19: one Miriade JSON response is archived
  (`data/raw/miriade-sun-tt-sample.json`, in `SHA256SUMS`; its first row is
  byte-for-byte a row of `miriade-sun-tt-3.csv.gz`). Section 5.1 names the
  field we rely on (`planetary_theory`, `reference_frame`), notes the
  contradictory `coosys` field, and calls INPOP19a an inference.
- "46 minutes": corrected in Section 2.2 and in `history/README.md` (both
  languages): 46 min is 105° E to Beijing; Hanoi is 42.3 min west of Beijing.
- Periods: Table 10 is now 1900–1945 / 1946–1967, like Table 13, and the
  Beijing comparison of Section 8.3 is 1946–1975
  (90 days, unchanged).
- NASA minus DE440: Section 6.3 says that rounding explains 0.5 min and the
  remaining 13 s is the
  error of NASA's Meeus (1998) algorithm.
- Table 2 labels the truncation figures by sample; Table 6's caption calls
  the standard errors formal (white-noise) values that understate the
  uncertainty.
- Response letter of round 1: the −6.84 trend is now labelled as the trend
  after truncation removal, next to the raw TT trend
  −6.86; Appendix A is "recomputed", with a
  different seed.

## 7. Release (M7), parts in our control

- `doi-chieu/ket-qua.json` and `khac-ngay-am.csv` were regenerated with
  engine 2.2.0 from a clean worktree and committed (the lunar
  dates are unchanged; only the version, commit and timestamp fields
  differ), and the version row of `doi-chieu/README.md` is updated.
- `reproduce.sh` records the tree state before any step writes files
  (`NN_TREE_DIRTY`, `NN_TREE_COMMIT`, read by `analysis.py`), so a clean run
  reports `tree_dirty: false`; the run reported here is
  `tree_dirty: false` at commit `e2e5027722c1`.
- Versions: the Python package now reports 0.3.0, the
  same as `pyproject.toml`, and the title block prints the release
  v0.3.0 from the same field.
- Making the repository public, pushing the tag and updating the Zenodo
  record are done at release; the availability statement is unchanged until
  then.

## 8. Authorship (R8)

The report remains a technical report of the project with corporate
authorship, which is the project's rule. We note your point that a journal
submission would require named authors.

## 9. Hồ Ngọc Đức's program (R9)

Done (Section 6.7, `hnd_compare.py`, `results-hnd.json`). The original
pages no longer serve the files; we use Internet Archive copies, fetched at
run time and checked by SHA-256, because their licence allows only personal,
non-commercial use and they are therefore not redistributed:

- amlich-aa98.js (copy of 10 July 2006), SHA-256
  `26ee2710d65967dba934f120dc990d780b7d55b5e6e9cc6ac8df97b06b1cea4f`: its `convertSolar2Lunar(d, m, y, 7)`
  agrees with the engine on 73,412 of 73,414 days of
  1900–2100. The two exceptions are 2054-05-07 and
  2062-04-09, where it returns day 0 because its
  lunation estimate is two ahead and it steps back once; this is the defect
  the engine's `while` loop corrects.
- amlich-js.zip (copy of 1 May 2016), SHA-256
  `83968ce4357e6093678869e2720e7c0b64598ab65c9b3451463d5c6a1a576561`, containing amlich-hnd.js
  (version 0.8, table-driven, 1800–2199): it differs from the engine on
  927 days, 837
  before 1968, because before 1968 it encodes the Chinese calendar. Against
  the Chinese rule computed by exact containment (Beijing meridian before
  1929, UTC+8 1929–1967, UTC+7 from 1968) it differs only in four months
  (120 days): Tết 1925 and the
  near-midnight months of May 2054, December 2072 and November 2077.

The programs were run unmodified in an empty Node.js `vm` context, with no
access to modules, files or the network.

# Round 1: version 2 to version 3

This part is kept as sent with version 3, with the two corrections of
round-2 item R5 (2 and 3); its numbers are those of version 3.

We thank the referee for a careful report and for the independent
recomputations, which agreed with ours on every number. Version 3 addresses
each point below. Numbers quoted here were inserted from the result files of
version 3 (`fill.py`). Section numbers refer to version 3.

### Summary of changes

- The engine's two ΔT models are now disclosed (Sections 4.1, 4.4, Table 3),
  the new-moon error is decomposed into series error in TT (against JPL
  DE440) and ΔT difference (Section 6.3), and the 2072 case is reclassified.
- IMCCE was queried again in TT; the solar-term error is decomposed into ΔT,
  VSOP87D truncation (per instant) and precession rate (Section 6.2). The
  precession hypothesis is supported: the TT residual drops to
  0.5 s RMS.
- The bootstrap interval is removed from the abstract; errors are described as
  trend plus scatter; the block-length sensitivity is in Appendix A.
- Raw Miriade, NASA and IERS downloads, the IMCCE derivation script and a
  DE440 new-moon computation are now in the repository, with checksums.
- The historical model of 1945 to 1975 is corrected (Beijing meridian, civil
  clock time separated from almanac meridian), in the paper and in
  `history/`.

### Major issues

**M1. New-moon bias is mainly ΔT.** Agreed, and confirmed with an
independent reference. The engine is *not* changed: the project keeps month
boundaries identical to the published Hồ Ngọc Đức algorithm (stated as a
design decision in Section 4.1). Changes:

- Section 4.1 and Table 3 state that the calendar module uses the embedded
  ΔT $\delta_k$ (eq. 10) and the solar-term module Espenak–Meeus ΔT; Table 3
  lists both with IMCCE's TT−UTC and the observed ΔT from IERS.
- Section 6.3 (Table 7, Figure 4) decomposes the error. Against DE440 in TT
  the series errs by 0.2 min on
  average (0.71 min MAE); the
  Espenak–Meeus minus $\delta_k$ difference is
  43.0 s on average and
  61.3 s in
  2050–2100. With $\delta_k$ replaced by Espenak–Meeus ΔT the mean error
  against NASA is 0.19 min and the
  MAE 0.73 min (your figures: +0.19
  and 0.73). The sentence attributing the ratio to the 13-term series is
  removed.
- Table 9 (former Table 8): 2072 is now "difference in ΔT assumption" (series
  error 31.3 s
  in TT, ΔT difference 58.1 s);
  2085 remains "undecidable at 1 min", and DE440 sides with the engine there.
  Sections 8.1 and 10 are rewritten accordingly; the remedy sentence about a
  better series is removed.
- Section 6.6 reports, as a finding, what a harmonised ΔT would change in
  1900–2100: 3 month starts
  (1967-07-08, 2072-12-10, 2077-11-16),
  90 days, no Tết and no leap month.
- NASA's ΔT column (minutes) agrees with rounded Espenak–Meeus in all
  200 years; we used DE440 rather than NASA's
  minute-resolution ΔT for the TT comparison.

**M2. UT confounds ephemeris and ΔT.** Done.

- Miriade was queried again with `-tscale=TT` and the TT−UTC column (raw
  files in `docs/paper/data/raw/`). The UT error equals the TT error minus the
  ΔT difference to 0.01 s.
- The VSOP87D truncation is subtracted per instant
  (`data/vsop-truncation-at-terms.tsv`, from `vsop_budget.py`).
- Precession: removing the IAU 1976 minus P03 rate difference
  (0.300405″ per century,
  7.31 s per century) changes
  the TT trend after truncation removal from
  −6.84 (raw TT trend
  −6.86, Table 6) to
  0.47 s per century and the residual
  to 0.5 s RMS
  (1.5 s max). Your slope of +0.24″
  per century is consistent with this. The P03 coefficient was checked in
  ERFA's `p06e.c` (which cites Capitaine et al. 2003); the IAU 1976 rate is
  from Lieske et al. (1977).
- 18.6-year term: fitted amplitude 0.18 s on
  the corrected residual; reported without further attribution.
- Table 2 is now a decomposition rather than "included in the residual".

**M3. Bootstrap.** Removed from the abstract. Section 5.3 states that the
4,824 terms and 2,474 new moons are complete populations; errors are given as
trend plus scatter (Table 6) and period means. Your block-length table is
recomputed in Appendix A (with our own seed, so the values differ slightly
from yours), labelled as a sensitivity illustration and not a
confidence interval.

**M4. Independence and provenance.**

- INPOP version: Miriade's JSON output names the theory "INPOP19"; we cite
  INPOP19a (Fienga et al. 2019) and keep INPOP08 only as the series
  reference.
- UTC before 1960: Miriade's documentation is silent. The returned TT−UTC
  equals ΔT before 1972 (−2.76 s on 1 January 1900),
  so we state that we read Miriade's "UTC" before 1972 as UT (Section 5.1).
- USNO: we could not find the ephemeris used for seasons in the USNO API
  documentation (the Topocentric Positions page names DE405, which is a
  different service). The paper says so and uses USNO only as a consistency
  check on the IMCCE derivation.
- NASA's shared lineage (Meeus 1998, Espenak–Meeus ΔT) is now stated in
  Section 5.2, and DE440 removes it for the lunar side in TT.

**M5. Overclaims.**

1. "Engine error" for 2072: replaced (M1).
2. Sector test: Section 6.5 counts
   6 major terms within
   15.3 minutes of Hanoi midnight and within a day
   of a month boundary, and states that the absence of failures is a property
   of the sample.
3. "Well below": replaced by "a non-negligible but sub-minute component".
4. "Scripts and checksummed data reproduce every number": now true for the
   IMCCE instants (raw data and derivation script; the derived UTC instants
   reproduce the earlier file to the second in
   4,824 of
   4,824 cases) and for the
   library comparison (rerun with engine
   2.2.0). The abstract no longer makes the
   claim; the Data availability statement describes what is shipped.
5. "Agree to the last bit": now backed by `cross_language_check.py`: the
   TypeScript and Python ports give bit-identical apparent longitudes in TT and
   UT at the 4,824 IMCCE instants and
   bit-identical new moons for 2,474 lunations.
   The Go engine is compared with the ports only through the test vectors, as
   stated.
6. Abstract and Introduction: "in the North from 1968 and nationwide after
   1975"; the pre-1968 meridian is no longer described as UTC+8.

**M6. History 1945–1975.** Corrected in the paper (Sections 2.2, 8.3,
Table 13) and in `history/` (README, CSV, `generate_tet.py`, tests).

- Aslaksen's sentence is quoted with "Traditionally" and without a period; we
  state that no source documents the almanac meridian for 1945–1967 and that
  the rule there is an inference.
- The South in 1968 is modelled at the Beijing meridian (116°25′ E,
  UTC+7h45m40s), following Aslaksen's 46 minutes. Between 1945 and 1975 the
  Beijing meridian and UTC+8 differ on
  90 days
  (3 runs) and never in Tết; the
  history CSV now has a `tet_beijing_meridian` column and the rule
  `beijing-meridian-116e25`.
- Civil clock time (tz database) and almanac meridian are separate columns of
  Table 13 and are distinguished in the history README.
- 1985: VnExpress supports only the 1984 leap-month difference; Hồ Ngọc Đức's
  page computes with the algorithm under test. 1985 is now "computed (no
  historical source)" in the dataset and is no longer cited as evidence.
- 1965: moved out of the evidence column; kept in the dataset as "reported
  (secondary)".
- The official calendar of the State Calendar Board for the twentieth century
  (Trần Tiến Bình) has not been consulted; listed as future work.

**M7. Reproducibility.** The repository is public from release v0.3.0; the
availability statement cites the public URL and the tag, not internal commit
hashes. The analysis now reads the engine version from the evaluated tree
(engine 2.2.0, calendar test vectors
2.2.0) and was run from a
clean checkout. `reproduce.sh` regenerates every result in a checkout of the
tag. The raw Miriade samples, NASA pages and IERS files are shipped with
`SHA256SUMS`; the IMCCE derivation and the four-day-step sensitivity are
scripted. The Zenodo metadata will be aligned with the 0.3.0 release by the
maintainers; the bibliography already uses the 0.3.0 metadata.

**M8. Missing comparisons.**

- JPL DE440: added (`de440_new_moons.py`, Section 6.3).
- Calendrical Calculations: we verified that the authors' published code
  defines `vietnamese-location` (Hanoi, UTC+8 before 1968, UTC+7 after), and
  cite it, but we did not run it in this revision; it is listed as future
  work in Section 9.
- Hồ Ngọc Đức's own program output and the State Calendar Board's calendar:
  listed as future work. The engine's coefficients were checked against Hồ
  Ngọc Đức's published source code.

**M9. Authorship and competing interests.** The project's rule is that its
publications carry the organisation, not personal names; the title block now
states that this is a technical report of the project. The competing-interests
statement now says plainly that nhatnguyet.org offers paid services built on
the engine.

### Minor issues

1. Notation: the leap index is $\ell$, the month-11 days are $A, B$, the
   month-11 new-moon indices $p, q$, the VSOP87 order $\alpha$.
2. Section 3 states where the implementation departs from Definitions 3 and 4.
3. Root-finding error is now "bounded by 0.0021 s".
4. 1984 solstice: 16:22:49 UT (IMCCE).
5. Period labels: new moons start in 1901 everywhere (Table 12 header, text).
6. Hand-typed numbers: the mean motion, rounding standard deviation, Newton
   steps and sector offset now come from `results.json`; "13 periodic terms"
   and the formula constants are stated as constants of the algorithm.
7. NASA rounding: shown to be rounding, not truncation, by the DE440
   comparison (mean 0.01 min).
8. Interpolation error: 0.29 s at
   the two-day step (four-day change
   4.31 s divided by 15).
9. The closest IMCCE term to midnight
   (1953-06-21 16:59:53.7 UT,
   6.2 s before
   midnight, engine +6.0 s)
   is discussed in Section 6.1; "100%" is stated as conditional on the
   reference.
10. ΔT uncertainty: we adopt no formal prediction model and say so; Section 8.2
    uses the measured spread between the models (Espenak–Meeus, IMCCE,
    observed, USNO divergence) instead of inter-reference disagreement alone.
11. Meeus (1985): the printed book was not available to us; the paper says the
    coefficients were checked against Hồ Ngọc Đức's source and GNU Emacs. The
    Explanatory Supplement is cited, noting that it is cited after Hồ Ngọc Đức.
12. Decision 134/2002/QĐ-TTg is cited in the Introduction.
13. Access dates harmonised; the Miriade query is given in
    `fetch_reference_data.py` and described in Section 5.1.
14. Figure 1(a) is now split by era (before and after 2005).
15. Figure 2 has a −20 tick and states UT and TT.
16. Figure 3 now shows observed ΔT from IERS for 1973–2026 instead of a band.
17. Figure 5 legend says "stacked"; Tết years are vertical ticks.
18. Table 11 holds only day and year counts; solar terms are discussed in the
    text; Zi Wei Dou Shu charts are referred to `doi-chieu/README.md` as outside
    the scope.
19. "Thoi Hien" is kept inside the quotation with [Thời Hiến, 時憲].
20. Hồ Ngọc Đức entries carry the year of the archived copy; capitalisation of
    bracketed translations is protected; lunar-typescript year is 2026.
21. No confidence interval remains in the abstract.
22. Section 5.6 gives the commands for both ports.
23. New moons are described as 1901–2100 throughout.

### Points not changed

- The engine itself (M1), by the maintainers' decision.
- Authorship (M9), by the project's rule.
