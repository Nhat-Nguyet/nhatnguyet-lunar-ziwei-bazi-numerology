// Bản tiếng Anh không còn chữ Việt: quét mọi chuỗi của kết quả lang "en" (cách
// viết mặc định "pinyin" và "han") trên MỌI ca kiểm Tử Vi, Bát Tự, thần số học,
// mỗi ca thứ bảy của âm lịch, và mã của lễ hội 1900 tới 2100; tìm ký tự Latin
// có dấu tiếng Việt. Bản Python: python/tests/test_khong_tieng_viet.py.
//
// Bỏ qua, có chủ đích: khoá `raw` (đối tượng gốc) và `nameVi` (khoá tên Việt
// ổn định); họ tên người (`name` ở gốc lá số Tử Vi và hồ sơ thần số học); tên
// và mô tả lễ hội (tên riêng Việt Nam giữ đủ dấu ở bản Anh, như quy ước của
// site). Phép đo ba thứ tiếng của lõi (kiem/ba-ngon-ngu.ts) đếm tên Hán Việt
// là đã dịch; phép này đo đầu ra.
import { test } from "node:test";
import assert from "node:assert/strict";
import { docCaKiem } from "../../../kiem/so-sanh.ts";
import { auspiciousHours, dayPillar, solarTerms, toLunar } from "@nhatnguyet/am-lich";
import type { Terms } from "@nhatnguyet/am-lich";
import { castZiWei, chartToText as ziWeiText, decadeLuck, findPatterns, yearlyLuck, yearlyStars, ziWeiSvg } from "@nhatnguyet/tu-vi";
import { baZiSvg, castBaZi, chartToText as baZiText, minorLuck } from "@nhatnguyet/bat-tu";
import { numerology } from "@nhatnguyet/than-so-hoc";
import { festivals } from "@nhatnguyet/le-hoi";

const CO_DAU = /[àáảãạăằắẳẵặâầấẩẫậèéẻẽẹêềếểễệìíỉĩịòóỏõọôồốổỗộơờớởỡợùúủũụưừứửữựỳýỷỹỵđ]/i;
const BO_KHOA = new Set(["raw", "nameVi"]);
const TERMS: (Terms | undefined)[] = [undefined, "han"];
type R = Record<string, any>; // eslint-disable-line @typescript-eslint/no-explicit-any

function quet(v: unknown, duong: string, loi: string[], boDuong: ReadonlySet<string> = new Set()): void {
  if (typeof v === "string") {
    if (CO_DAU.test(v)) loi.push(`${duong}: ${v.slice(0, 120)}`);
  } else if (Array.isArray(v)) {
    for (const x of v) quet(x, duong + "[]", loi, boDuong);
  } else if (v && typeof v === "object") {
    for (const [k, x] of Object.entries(v)) {
      const d = duong + "." + k;
      if (BO_KHOA.has(k) || boDuong.has(d)) continue;
      quet(x, d, loi, boDuong);
    }
  }
}

function bao(loi: string[]): void {
  assert.equal(loi.length, 0, `${loi.length} chuỗi tiếng Việt ở bản tiếng Anh, ví dụ:\n${[...new Set(loi)].sort().slice(0, 30).join("\n")}`);
}

const ngay = (v: R) => ({ year: v.yyyy, month: v.mm, day: v.dd });

test("không chữ Việt: Tử Vi, mọi ca kiểm", () => {
  const loi: string[] = [];
  docCaKiem("tu-vi").ca.forEach((c, i) => {
    const v = c.vao as R;
    for (const terms of TERMS) {
      const ch = castZiWei({ date: ngay(v), hourBranch: v.gio, gender: v.gioiTinh, viewYear: v.namXem, terms });
      quet({ chart: ch, decades: decadeLuck(ch), year: yearlyLuck(ch), stars: yearlyStars(ch), patterns: findPatterns(ch) }, "$", loi, new Set(["$.chart.name"]));
      if (i % 25 === 0) {
        quet(ziWeiText(ch, { year: v.namXem }), "$.text", loi);
        quet(ziWeiSvg(ch), "$.svg", loi);
      }
    }
  });
  bao(loi);
});

test("không chữ Việt: Bát Tự, mọi ca kiểm", () => {
  const loi: string[] = [];
  docCaKiem("bat-tu").ca.forEach((c, i) => {
    const v = c.vao as R;
    const p = (n: number) => String(n).padStart(2, "0");
    const time = v.gio === undefined || v.gio === null ? null : `${p(v.gio)}:${p(v.phut ?? 0)}`;
    for (const terms of TERMS) {
      const ch = castBaZi({ date: ngay(v), time, gender: v.gioiTinh, terms });
      quet({ chart: ch, minor: minorLuck(ch, v.namXem) }, "$", loi);
      if (i % 25 === 0) {
        quet(baZiText(ch), "$.text", loi);
        quet(baZiSvg(ch), "$.svg", loi);
      }
    }
  });
  bao(loi);
});

test("không chữ Việt: âm lịch, tiết khí, thần số học, mã lễ hội", () => {
  const loi: string[] = [];
  let n = 0;
  for (const c of docCaKiem("am-lich").ca) {
    const v = c.vao as R;
    if (v.phep !== "duong-sang-am" || n++ % 7) continue;
    for (const terms of TERMS) {
      quet(toLunar(ngay(v), { terms }), "$", loi);
      quet(dayPillar(ngay(v), { terms }), "$", loi);
      quet(auspiciousHours(ngay(v), { terms }), "$", loi);
    }
  }
  for (let y = 1900; y <= 2100; y += 25) quet(solarTerms(y), "$", loi, new Set(["$[].nameVi"]));
  for (const c of docCaKiem("than-so-hoc").ca) {
    const v = c.vao as R;
    quet(numerology({ name: v.hoTen, birthDate: ngay(v), today: { year: v.namXem, month: v.thangXem, day: v.ngayXem } }), "$", loi, new Set(["$.name"]));
  }
  for (let y = 1900; y <= 2100; y += 10) {
    for (const f of festivals(y)) {
      quet({ id: f.id, date: f.date, calendar: f.calendar, fixedDate: f.fixedDate, level: f.level, group: f.group, scope: f.scope }, "$", loi);
      assert.ok(["holiday", "folk-religion", "other"].includes(f.group), f.group);
      assert.ok(["national", "local", ""].includes(f.scope), f.scope);
    }
  }
  bao(loi);
});

test("phép quét bắt được chữ Việt khi terms là vi", () => {
  const loi: string[] = [];
  quet(castZiWei({ date: "1990-09-19", time: "20:00", gender: "male", terms: "vi" }), "$", loi);
  assert.ok(loi.length > 10);
});
