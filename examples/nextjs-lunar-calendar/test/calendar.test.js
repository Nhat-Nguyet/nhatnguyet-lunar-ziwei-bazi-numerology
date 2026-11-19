import { test } from "node:test";
import assert from "node:assert/strict";
import { dayInfo, monthGrid, nextTet } from "../lib/calendar.js";

test("February 2027: Tết on Saturday the 6th, Start of Spring on the 4th", () => {
  const weeks = monthGrid(2027, 2);
  const cells = weeks.flat().filter(Boolean);
  assert.equal(cells.length, 28);
  assert.equal(weeks[0][0].date, "2027-02-01"); // 1 Feb 2027 is a Monday
  const tet = cells.find((c) => c.date === "2027-02-06");
  assert.deepEqual([tet.lunarDay, tet.lunarMonth, tet.leap], [1, 1, false]);
  assert.equal(cells.find((c) => c.term)?.date, "2027-02-04");
});

test("today's can chi and solar term", () => {
  const d = dayInfo("2027-02-06");
  assert.equal(d.yearName, "Ding Wei");
  assert.equal(d.dayName, "Bing Chen");
  assert.equal(d.solarTerm, "Start of Spring");
  assert.equal(dayInfo("2027-02-06", { lang: "vi" }).yearName, "Đinh Mùi");
});

test("Tết countdown", () => {
  assert.deepEqual(
    (({ date, days }) => ({ date, days }))(nextTet("2026-11-19")),
    { date: "2027-02-06", days: 79 },
  );
  assert.equal(nextTet("2027-02-06").days, 0);
  // Vietnam and China disagree on Tết 1985.
  assert.equal(nextTet("1985-01-01").date, "1985-01-21");
  assert.equal(nextTet("1985-01-01", { country: "CN" }).date, "1985-02-20");
});
