// Kiểm tệp iCalendar: đọc ngược theo RFC 5545 (nối dòng gập, tách thuộc tính,
// gỡ thoát chữ) rồi so với festivals() của cùng năm.
import { test } from "node:test";
import assert from "node:assert/strict";
import { festivals, festivalsIcs, PROVINCES } from "../src/index.ts";

type Prop = { name: string; params: string; value: string };

function parseIcs(ics: string): { cal: Prop[]; events: Prop[][] } {
  assert.ok(ics.endsWith("\r\n"), "file ends with CRLF");
  assert.ok(!/[^\r]\n/.test(ics), "every line ends with CRLF");
  const enc = new TextEncoder();
  for (const raw of ics.slice(0, -2).split("\r\n")) assert.ok(enc.encode(raw).length <= 75, `line over 75 octets: ${raw}`);
  const lines = ics.slice(0, -2).replace(/\r\n[ \t]/g, "").split("\r\n");
  const cal: Prop[] = [];
  const events: Prop[][] = [];
  let cur: Prop[] | null = null;
  for (const l of lines) {
    const m = /^([A-Z-]+)((?:;[^:]*)?):(.*)$/.exec(l);
    assert.ok(m, `content line: ${l}`);
    const p = { name: m[1], params: m[2], value: m[3] };
    if (p.name === "BEGIN" && p.value === "VEVENT") cur = [];
    else if (p.name === "END" && p.value === "VEVENT") {
      assert.ok(cur);
      events.push(cur);
      cur = null;
    } else (cur ?? cal).push(p);
  }
  return { cal, events };
}

const unescape = (s: string) => s.replace(/\\(.)/g, (_, c: string) => (c === "n" || c === "N" ? "\n" : c));
const get = (ps: Prop[], n: string) => ps.find((p) => p.name === n);

test("ics: hợp lệ RFC 5545, mỗi lễ một sự kiện cả ngày, UID ổn định", () => {
  for (const lang of ["en", "vi", "zh"] as const) {
    const ics = festivalsIcs(2027, { lang });
    assert.equal(ics, festivalsIcs(2027, { lang }), "deterministic");
    const { cal, events } = parseIcs(ics);
    assert.equal(cal[0].name + ":" + cal[0].value, "BEGIN:VCALENDAR");
    assert.equal(get(cal, "VERSION")?.value, "2.0");
    assert.ok(get(cal, "PRODID"));
    assert.match(unescape(get(cal, "X-WR-CALDESC")!.value), /Nhat Nguyet \(nhatnguyet\.org\)|Nhật Nguyệt \(nhatnguyet\.org\)/);
    const list = festivals(2027, { lang });
    assert.equal(events.length, list.length);
    const uids = new Set<string>();
    events.forEach((ev, i) => {
      const f = list[i];
      const uid = get(ev, "UID")!.value;
      assert.equal(uid, `${f.id}-2027@nhatnguyet.org`);
      uids.add(uid);
      assert.match(get(ev, "DTSTAMP")!.value, /^\d{8}T\d{6}Z$/);
      const s = get(ev, "DTSTART")!, e = get(ev, "DTEND")!;
      assert.equal(s.params, ";VALUE=DATE");
      assert.equal(e.params, ";VALUE=DATE");
      const d = (v: string) => Date.UTC(+v.slice(0, 4), +v.slice(4, 6) - 1, +v.slice(6, 8));
      const main = Date.UTC(+f.date.slice(0, 4), +f.date.slice(5, 7) - 1, +f.date.slice(8, 10));
      assert.equal((main - d(s.value)) / 864e5, f.daysBefore);
      assert.equal((d(e.value) - main) / 864e5, f.daysAfter + 1);
      assert.equal(unescape(get(ev, "SUMMARY")!.value), f.name);
      const geo = get(ev, "GEO");
      if (geo) assert.match(geo.value, /^-?\d+(\.\d+)?;-?\d+(\.\d+)?$/);
    });
    assert.equal(uids.size, events.length, "UIDs unique");
  }
  assert.equal(festivalsIcs(2027), festivalsIcs(2027, { lang: "en" }));
});

test("ics: Tết 2027 ngày 6/2, năm khác UID khác", () => {
  const ev = parseIcs(festivalsIcs(2027)).events.find((e) => get(e, "UID")?.value === "tet-nguyen-dan-2027@nhatnguyet.org");
  assert.ok(ev);
  assert.equal(get(ev, "DTSTART")!.value <= "20270206", true);
  assert.ok(festivalsIcs(2028).includes("UID:tet-nguyen-dan-2028@nhatnguyet.org"));
});

test("festivals: tỉnh, dân tộc, nơi tổ chức bằng khoá tiếng Anh", () => {
  assert.equal(PROVINCES.length, 34);
  const all = festivals(2027);
  const codes = new Set(PROVINCES.map((p) => p.code));
  for (const f of all) {
    for (const p of f.provinces) assert.ok(codes.has(p.code), p.code);
    for (const v of f.venues) {
      assert.equal(v.coordinates === null, v.sourceUrl === null);
      if (v.coordinates) {
        assert.ok(Math.abs(v.coordinates.lat - 16) < 9 && Math.abs(v.coordinates.lon - 106) < 6, `${f.id} in Vietnam`);
        assert.match(v.sourceUrl!, /^https?:\/\//);
      }
    }
  }
  assert.ok(all.some((f) => f.provinces.length > 0));
  assert.ok(all.some((f) => f.nationwide));
  const kate = festivals(2027, { lang: "zh" }).find((f) => f.ethnicGroups.length > 0);
  if (all.some((f) => f.ethnicGroups.length)) assert.ok(kate && kate.ethnicGroups.every((x) => x.endsWith("族")));
});

test("festivals: mọi mã trong kết quả là mã tiếng Anh, ở cả ba lang", () => {
  const maViet = new Set(["le-tet", "tin-nguong", "khac", "quoc-gia", "vung", "dia-phuong", "dai-dien", "co", "khong", "chuan", "pho-bien-nhat", "cong-bo-theo-nam", "theo-nam", "bien-tap"]);
  for (const lang of ["en", "vi", "zh"] as const) {
    for (const f of festivals(2027, { lang })) {
      const { raw, ...rest } = f;
      assert.ok(raw);
      assert.ok(["holiday", "folk-religion", "other"].includes(f.group), f.group);
      assert.ok(["national", "regional", "local", "representative", ""].includes(f.scope), f.scope);
      assert.ok(["major", "minor"].includes(f.level), f.level);
      const walk = (v: unknown): void => {
        if (typeof v === "string") assert.ok(!maViet.has(v), `${f.id}: Vietnamese code ${v}`);
        else if (Array.isArray(v)) v.forEach(walk);
        else if (v && typeof v === "object") Object.values(v).forEach(walk);
      };
      walk(rest);
      for (const k of Object.keys(rest)) assert.match(k, /^[a-z][A-Za-z]*$/);
    }
  }
});
