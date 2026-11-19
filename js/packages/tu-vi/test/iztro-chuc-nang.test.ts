// Kiểm phần hàm của lớp tương thích iztro (src/iztro-chuc-nang.ts) không cần
// iztro: JSON không đổi, hàm gọi được ở mọi ngôn ngữ, giá trị đúng lõi. Phép
// so thật với iztro: doi-chieu/iztro-van-han.test.mjs.
import { test } from "node:test";
import assert from "node:assert/strict";
import { astro, bySolar } from "../src/iztro.ts";
import { daiVan, tinhHanNam, tinhSaoLuu } from "../src/index.ts";

const banTho = (a: object) => JSON.parse(JSON.stringify(a));

test("hàm không liệt kê, JSON giữ khuôn dữ liệu", () => {
  const a = astro.bySolar("1990-9-19", 10, "男", true, "zh-CN");
  assert.equal(Object.keys(a).includes("horoscope"), false);
  assert.equal(Object.keys(a.palaces[0]).includes("has"), false);
  assert.equal(Object.keys(a.palaces[9].majorStars[0]).includes("palace"), false);
  assert.deepEqual(a.toJSON(), banTho(a));
  assert.deepEqual(Object.keys(banTho(a.palaces[0])).sort(), [
    "adjectiveStars", "ages", "boshi12", "changsheng12", "decadal", "earthlyBranch", "heavenlyStem", "index", "isBodyPalace",
    "isOriginalPalace", "jiangqian12", "majorStars", "minorStars", "name", "suiqian12",
  ]);
  const h = a.horoscope("2026-11-19", 3);
  assert.deepEqual(Object.keys(banTho(h)), ["lunarDate", "solarDate", "decadal", "age", "yearly", "monthly", "daily", "hourly"]);
});

test("palace, star, surroundedPalaces như iztro", () => {
  const a = bySolar("1990-9-19", 10, "男", true, "zh-CN", { country: "CN" });
  const menh = a.palace("命宫")!;
  assert.equal(menh.index, 9);
  assert.equal(a.palace(9), menh);
  assert.equal(a.palace("身宫")!.isBodyPalace, true);
  assert.equal(a.palace("soulPalace"), menh, "nhận cả khoá iztro");
  assert.throws(() => a.palace(12), /invalid palace index/);
  const tv = a.star("紫微");
  assert.equal(tv.palace()!.name, "疾厄");
  assert.equal(tv.oppositePalace()!.index, (tv.palace()!.index + 6) % 12);
  assert.throws(() => a.star("不存在"), /invalid star name/);
  const s = a.surroundedPalaces("命宫");
  assert.deepEqual([s.target.name, s.opposite.name, s.wealth.name, s.career.name], ["命宫", "迁移", "财帛", "官禄"]);
  assert.deepEqual(Object.keys(banTho(s)), ["target", "opposite", "wealth", "career"]);
  assert.equal(menh.has(["太阴"]), true);
  assert.equal(menh.hasOneOf(["太阴", "紫微"]), true);
  assert.equal(menh.notHave(["紫微"]), true);
  assert.equal(menh.hasMutagen("忌"), true);
  assert.equal(menh.isEmpty(), false);
  assert.equal(a.isSurrounded("命宫", ["太阴"]), true);
  // Tên ở ngôn ngữ khác cũng nhận (như kot của iztro).
  const vi = bySolar("1990-9-19", 10, "男", true, "vi-VN");
  assert.equal(vi.palace("命宫")!.name, "Mệnh");
  assert.equal(vi.star("紫微").name, "Tử Vi");
  assert.equal(vi.palace("Mệnh")!.has(["太阴"]), vi.palace("Mệnh")!.has(["Thái Âm"]));
});

test("fliesTo, selfMutaged, mutagedPlaces theo bảng Tứ Hóa của lõi", () => {
  const a = bySolar("1990-9-19", 10, "男", true, "zh-CN");
  for (const p of a.palaces) {
    const noi = p.mutagedPlaces();
    ["禄", "权", "科", "忌"].forEach((m, k) => {
      for (const q of a.palaces) assert.equal(p.fliesTo(q.index, m), noi[k] === q, `${p.name} ${m} ${q.name}`);
      assert.equal(p.selfMutaged(m), noi[k] === p);
    });
    assert.equal(p.selfMutagedOneOf(), noi.includes(p));
    assert.equal(p.notSelfMutaged(), !noi.includes(p));
  }
});

test("horoscope lấy đại hạn, tiểu hạn, lưu niên, lưu nguyệt của lõi", () => {
  const a = bySolar("1990-9-19", 10, "男", true, "zh-CN", { country: "CN" });
  const h = a.horoscope("2026-11-19", 3);
  assert.equal(h.solarDate, "2026-11-19");
  assert.equal(h.lunarDate, "二〇二六年十月十一");
  const hn = tinhHanNam(a.raw, 2026);
  const dv = daiVan(a.raw).find((x) => hn.tuoiMu >= x.tuTuoi && hn.tuoiMu <= x.denTuoi)!;
  const iz = (vt: number) => (vt + 10) % 12;
  assert.equal(h.decadal!.index, iz(dv.viTri));
  assert.equal(h.age.index, iz(hn.tieuVanViTri));
  assert.equal(h.age.nominalAge, 37);
  assert.equal(h.yearly.index, iz(hn.luuNienViTri));
  assert.equal(h.monthly.index, iz(hn.nguyetHan.thang[9].viTri));
  // Giá trị iztro 2.6.5 cho cùng lá, cùng ngày (trừ tứ hóa can Canh của tiểu hạn).
  assert.deepEqual([h.decadal!.index, h.decadal!.heavenlyStem, h.decadal!.earthlyBranch], [0, "戊", "寅"]);
  assert.deepEqual(h.decadal!.mutagen, ["贪狼", "太阴", "右弼", "天机"]);
  assert.deepEqual(h.decadal!.palaceNames.slice(0, 3), ["命宫", "父母", "福德"]);
  assert.deepEqual([h.yearly.index, h.yearly.heavenlyStem, h.yearly.earthlyBranch], [4, "丙", "午"]);
  assert.deepEqual(h.yearly.mutagen, ["天同", "天机", "文昌", "廉贞"]);
  assert.deepEqual([h.monthly.index, h.monthly.heavenlyStem, h.monthly.earthlyBranch], [4, "己", "亥"]);
  const sao = h.yearly.stars!.map((ds) => ds.map((x) => x.name).join(","));
  assert.deepEqual(sao, ["", "", "流陀", "流禄", "流羊", "", "流马", "", "", "", "", ""]);
  assert.equal(tinhSaoLuu(a.raw, 2026).length, 5);
  assert.deepEqual(h.monthly.mutagen, []);
  assert.equal(h.daily, null);
  assert.equal(h.hourly, null);
  assert.equal(h.agePalace(), a.palaces[2]);
  assert.equal(h.palace("命宫", "yearly"), a.palaces[4]);
  assert.equal(h.hasHoroscopeStars("命宫", "yearly", ["流羊"]), true);
  assert.equal(h.notHaveHoroscopeStars("命宫", "yearly", ["流禄"]), true);
  assert.equal(h.hasHoroscopeMutagen("迁移", "yearly", "权"), a.palaces[(4 + 6) % 12].has(["天机"]));
  // Trước đại hạn đầu: lõi không có đồng hạn.
  assert.equal(a.horoscope("1991-3-1").decadal, null);
  // Giờ Tý muộn tính sang ngày sau.
  assert.equal(a.horoscope("2026-11-18", 12).lunarDate, h.lunarDate);
});

test("decadalList, yearlyList, monthlyList", () => {
  const a = bySolar("1990-9-19", 10, "男", true, "zh-CN", { country: "CN" });
  const d = a.decadalList();
  assert.equal(d.length, 12);
  assert.deepEqual([d[0].palaceName, d[0].ageRange, d[0].yearRange], ["命宫", [5, 14], [1994, 2003]]);
  const y = a.yearlyList(0);
  assert.equal(y.length, 10);
  assert.deepEqual([y[0].age, y[0].year], [5, 1994]);
  assert.equal(a.monthlyList(2026).length, 12);
  const nhuan = a.monthlyList(2023);
  assert.deepEqual(nhuan.filter((m) => m.isLeapMonth).map((m) => [m.month, m.part]), [[2, "first"], [2, "second"]]);
  assert.equal(a.monthlyList(2023, false).length, 13);
});
