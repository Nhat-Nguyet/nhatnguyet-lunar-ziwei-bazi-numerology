// Loads Code.gs the way Apps Script does (one global script, no modules) and
// calls the custom functions like a sheet would.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import vm from "node:vm";
import { toLunar } from "@nhatnguyet/lunar";

const sandbox = vm.createContext({});
vm.runInContext(readFileSync(new URL("../Code.gs", import.meta.url), "utf8"), sandbox, { filename: "Code.gs" });
const { LUNARDATE, SEXAGENARY, SOLARTERM, SOLARDATE } = sandbox;

test("LUNARDATE: text, date cell, serial number", () => {
  assert.equal(LUNARDATE("2027-02-06"), "1/1/2027");
  assert.equal(LUNARDATE(new Date(2023, 2, 22)), "1/2/2023 (leap)");
  assert.equal(LUNARDATE(46424), "1/1/2027"); // =DATE(2027,2,6) as a serial number
  assert.equal(LUNARDATE("2023-03-22", "vi"), "1/2/2023 (nhuận)");
  assert.equal(LUNARDATE("1985-01-21"), "1/1/1985");
  assert.equal(LUNARDATE("1985-01-21", "en", "CN"), "1/12/1984"); // Tết 1985: Vietnam and China differ
});

test("LUNARDATE on a range keeps the shape and empty cells", () => {
  assert.deepEqual(LUNARDATE([["2027-02-06", ""], ["2027-02-07", "2027-02-08"]]), [["1/1/2027", ""], ["2/1/2027", "3/1/2027"]]);
});

test("SEXAGENARY: day, month, year, all", () => {
  assert.equal(SEXAGENARY("2027-02-06"), "Bing Chen");
  assert.equal(SEXAGENARY("2027-02-06", "month"), "Ren Yin");
  assert.equal(SEXAGENARY("2027-02-06", "year", "vi"), "Đinh Mùi");
  assert.equal(SEXAGENARY("2027-02-06", "all", "zh"), "丙辰, 壬寅, 丁未");
  assert.throws(() => SEXAGENARY("2027-02-06", "week"), /part must be/);
});

test("SOLARTERM", () => {
  assert.equal(SOLARTERM("2027-02-06"), "Start of Spring");
  assert.equal(SOLARTERM("2027-02-03"), "Major Cold");
  assert.equal(SOLARTERM("2027-02-04", "vi"), "Lập Xuân");
  assert.equal(SOLARTERM("2027-02-04", "zh"), "立春");
});

test("SOLARDATE: lunar to Gregorian", () => {
  assert.equal(SOLARDATE(2027, 1, 1), "2027-02-06");
  assert.equal(SOLARDATE(2023, 2, 1, true), "2023-03-22");
  assert.equal(SOLARDATE(1985, 1, 1, false, "CN"), "1985-02-20");
});

test("same answers as the npm package, every day of 2027", () => {
  for (let t = Date.UTC(2027, 0, 1); t < Date.UTC(2028, 0, 1); t += 86400000) {
    const iso = new Date(t).toISOString().slice(0, 10);
    const l = toLunar(iso);
    assert.equal(SEXAGENARY(iso, "all"), `${l.dayName}, ${l.monthName}, ${l.yearName}`);
    assert.equal(LUNARDATE(iso), `${l.day}/${l.month}/${l.year}${l.leap ? " (leap)" : ""}`);
  }
});
