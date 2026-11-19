import { test } from "node:test";
import assert from "node:assert/strict";
import { hoursReply, tetReply, todayReply, vietnamToday, ziweiReply } from "../src/replies.js";

test("today in Vietnam, whatever the server's time zone", () => {
  // 18:30 UTC on 21 Jan 1985 is already 22 Jan in Hanoi.
  assert.equal(vietnamToday(new Date("1985-01-21T18:30:00Z")), "1985-01-22");
  assert.equal(vietnamToday(new Date("1985-01-21T16:59:00Z")), "1985-01-21");
});

test("/today 2027-02-06: Tết Đinh Mùi", () => {
  assert.equal(
    todayReply("2027-02-06"),
    [
      "2027-02-06",
      "Lunar date: 1/1/2027",
      "Day Bing Chen · Month Ren Yin · Year Ding Wei (Goat)",
      "Solar term: Start of Spring (next: Rain Water, 2027-02-19)",
    ].join("\n"),
  );
  assert.match(todayReply("2027-02-06", { lang: "vi" }), /Âm lịch: 1\/1\/2027\nNgày Bính Thìn · Tháng Nhâm Dần · Năm Đinh Mùi \(Dê\)/);
});

test("/today rejects a bad date", () => {
  assert.match(todayReply("2027-02-30"), /YYYY-MM-DD/);
  assert.match(todayReply("tomorrow"), /YYYY-MM-DD/);
});

test("/tet counts days to the next Lunar New Year", () => {
  assert.equal(tetReply({ now: new Date("2026-11-19T03:00:00Z") }), "Tết Ding Wei falls on 2027-02-06: 79 days to go.");
  assert.match(tetReply({ now: new Date("2027-02-06T03:00:00Z") }), /^Today is Tết/);
  assert.equal(tetReply({ lang: "vi", now: new Date("2027-02-07T03:00:00Z") }), "Tết Mậu Thân là ngày 2028-01-26: còn 353 ngày.");
});

test("/ziwei gives the chart summary, or the usage line", () => {
  const text = ziweiReply("1990-09-19 20:00 male");
  assert.match(text, /^# Zi Wei Dou Shu chart/);
  assert.match(text, /Bureau: Earth Five \(5\)/);
  assert.match(text, /### Life Palace \(Hai, Ding Hai\)/);
  assert.ok(text.length < 4096, "fits in one Telegram message");
  assert.match(ziweiReply("1990-09-19 male"), /^Usage:/);
  assert.match(ziweiReply("1990-09-19 25:00 male"), /^Usage:/);
});

test("/hours 2027-02-06: the six auspicious hours", () => {
  assert.equal(
    hoursReply("2027-02-06"),
    [
      "Auspicious hours of 2027-02-06 (day Bing Chen), Vietnam time:",
      "03:00-04:59 Yin (Tiger), Si Ming",
      "07:00-08:59 Chen (Dragon), Qing Long",
      "09:00-10:59 Si (Snake), Ming Tang",
      "15:00-16:59 Shen (Monkey), Jin Kui",
      "17:00-18:59 You (Rooster), Bao Guang",
      "21:00-22:59 Hai (Pig), Yu Tang",
    ].join("\n"),
  );
  assert.match(hoursReply("2027-02-06", { lang: "vi" }), /^Giờ hoàng đạo ngày 2027-02-06 \(ngày Bính Thìn\)[^\n]*\n03:00-04:59 Dần \(Hổ\), Tư Mệnh/);
  assert.match(hoursReply("2027-02-30"), /YYYY-MM-DD/);
  // Without a date: today in Vietnam.
  assert.match(hoursReply("", { now: new Date("2027-02-05T18:00:00Z") }), /^Auspicious hours of 2027-02-06 /);
});
