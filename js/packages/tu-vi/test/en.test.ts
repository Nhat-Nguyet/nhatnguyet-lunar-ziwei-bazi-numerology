// Kiểm lớp API tiếng Anh của tu-vi: đối chiếu với hàm tiếng Việt và với các
// trường En/Zh của ca kiểm (khi ca kiểm có).
import { test } from "node:test";
import assert from "node:assert/strict";
import { docCaKiem } from "../../../kiem/so-sanh.ts";
import {
  castZiWei,
  daiVan,
  decadeLuck,
  findPatterns,
  lapLaSoTuVi,
  localizeZiWei,
  nhanDienCachCuc,
  parseGender,
  tinhHanNam,
  yearlyLuck,
  yearlyStars,
} from "../src/index.ts";

const tep = docCaKiem("tu-vi");
type R = Record<string, any>; // eslint-disable-line @typescript-eslint/no-explicit-any

// TODO(zh): sao mà lõi TypeScript chưa trả chữ Trung và bảng TU_VUNG không
// dùng được (cùng chữ Việt mang nghĩa khác): bản zh tạm để tên tiếng Anh.
// Agent bổ sung zh cho lõi xong thì danh sách này rỗng dần.
const SAO_CHUA_CO_ZH = new Set(["Phúc Đức"]);

const mau = tep.ca.filter((c, i) => i % 8 === 0 && !(c.ra as R).loi);

function vao(c: (typeof tep.ca)[number], lang: "vi" | "en" | "zh") {
  const v = c.vao as R;
  return {
    date: { year: v.yyyy, month: v.mm, day: v.dd },
    time: `${String(v.gio * 2).padStart(2, "0")}:00`,
    gender: v.gioiTinh === "Nữ" ? "female" : "male",
    viewYear: v.namXem,
    lang,
  };
}

test("en: castZiWei đổi giờ đồng hồ ra đúng chỉ số chi và ra đúng lapLaSoTuVi", () => {
  for (const c of mau) {
    const v = c.vao as R;
    const chart = castZiWei(vao(c, "vi"));
    assert.deepEqual(chart.raw, lapLaSoTuVi("", v.gioiTinh, v.dd, v.mm, v.yyyy, v.gio));
    assert.equal(chart.hour.index, v.gio);
    // Giờ lẻ cùng canh (gio*2 - 1, tức đầu canh) cũng ra cùng chi.
    if (v.gio > 0) assert.equal(castZiWei({ ...vao(c, "vi"), time: `${v.gio * 2 - 1}:59` }).hour.index, v.gio);
  }
  assert.ok(mau.length > 50);
});

test("en: tên cung, sao, cục ba thứ tiếng khớp ca kiểm", () => {
  const thieuZh = new Set<string>();
  for (const c of mau) {
    const ra = (c.ra as R).laSo as R;
    const [vi, en, zh] = (["vi", "en", "zh"] as const).map((l) => castZiWei(vao(c, l)));
    for (let i = 0; i < 12; i++) {
      const cg = ra.cung[i];
      assert.equal(vi.palaces[i].name, cg.tenCung);
      assert.equal(en.palaces[i].name, cg.tenCungEn);
      if (cg.tenCungZh) assert.equal(zh.palaces[i].name, cg.tenCungZh);
      if (cg.canChiZh) assert.equal(zh.palaces[i].stemBranch, cg.canChiZh);
      cg.sao.forEach((s: R, k: number) => {
        assert.equal(vi.palaces[i].stars[k].nameVi, s.ten);
        assert.equal(en.palaces[i].stars[k].name, s.tenEn);
        if (s.tenZh && zh.palaces[i].stars[k].name !== s.tenZh) thieuZh.add(s.ten);
        if (s.mieuVuongEn) assert.equal(en.palaces[i].stars[k].brightness, s.mieuVuongEn);
      });
    }
    if (ra.tenCucEn) assert.equal(en.bureau.name, ra.tenCucEn);
    if (ra.tenCucZh) assert.equal(zh.bureau.name, ra.tenCucZh);
    if (ra.amDuongMenhEn) assert.equal(en.yinYang, ra.amDuongMenhEn);
    if (ra.banMenhNapAmZh) assert.equal(zh.naYin, ra.banMenhNapAmZh);
    if (ra.canChiNamZh) assert.equal(zh.yearPillar, ra.canChiNamZh);
  }
  for (const t of thieuZh) assert.ok(SAO_CHUA_CO_ZH.has(t), `sao ${t}: bản zh lệch ca kiểm`);
});

test("en: decadeLuck, yearlyLuck, yearlyStars, findPatterns khớp hàm gốc và ca kiểm", () => {
  for (const c of mau) {
    const ra = c.ra as R;
    const en = castZiWei(vao(c, "en"));
    const zh = castZiWei(vao(c, "zh"));
    const dv = decadeLuck(en);
    assert.equal(dv.length, ra.daiVan.length);
    dv.forEach((d, i) => {
      assert.equal(d.fromAge, ra.daiVan[i].tuTuoi);
      assert.equal(d.toAge, ra.daiVan[i].denTuoi);
      assert.equal(d.palace, ra.daiVan[i].tenCungEn);
      if (ra.daiVan[i].chinhTinhEn !== undefined) assert.equal(d.majorStars.join(", "), ra.daiVan[i].chinhTinhEn ?? "");
      assert.equal(d.fromYear, en.lunar.year + d.fromAge - 1);
    });
    assert.deepEqual(decadeLuck(en.raw, { lang: "vi" }).map((d) => d.palace), daiVan(en.raw).map((d) => d.tenCung));
    const hn = ra.hanNam;
    const y = yearlyLuck(en);
    assert.equal(y.age, hn.tuoiMu);
    assert.equal(y.year, (c.vao as R).namXem);
    if (hn.luuNienTenCungEn) assert.equal(y.yearPalace.palace, hn.luuNienTenCungEn);
    assert.equal(y.minorLimit.index, hn.tieuVanViTri);
    assert.equal(y.decade?.fromAge ?? 0, hn.daiVanTuTuoi);
    const yz = yearlyLuck(zh);
    hn.luuTuHoa.forEach((t: R, i: number) => {
      if (t.saoZh) assert.equal(yz.transformations[i].star, t.saoZh);
      if (t.hoaZh) assert.equal(yz.transformations[i].type, t.hoaZh);
      assert.equal(yz.transformations[i].palaceIndex, t.coTrenLaSo ? t.viTri : null);
    });
    assert.deepEqual(y.months.map((m) => m.index), tinhHanNam(en.raw, hn.nam).nguyetHan.thang.map((m) => m.viTri));
    assert.deepEqual(yearlyStars(en).map((s) => [s.code, s.palaceIndex]), ra.saoLuu.map((s: R) => [s.ma, s.viTri]));
    const cc = findPatterns(en);
    assert.deepEqual(cc.map((p) => p.nameVi), ra.cachCuc.map((p: R) => p.ten));
    assert.deepEqual(cc.map((p) => p.condition), nhanDienCachCuc(en.raw).map((p) => p.dieuKienEn));
  }
});

test("en: lỗi đầu vào nói rõ việc phải làm", () => {
  assert.throws(() => castZiWei({ date: "1990-09-19", gender: "male" }), /pass time/);
  assert.throws(() => castZiWei({ date: "1990-09-19", time: "20:00", gender: "x" }), /gender must be/);
  assert.throws(() => castZiWei({ date: "1990-09-19", time: "20:00", hourBranch: 3, gender: "f" }), /branch 10/);
  assert.throws(() => castZiWei({ date: "1990-02-30", time: "20:00", gender: "f" }), /no such date/);
  assert.equal(castZiWei({ date: "1990-09-19", hourBranch: 10, gender: "f" }).time, null);
  assert.equal(parseGender("Nữ"), "female");
});

test("en: giờ Tý từ 23h giữ ngày đã nhập, kèm ghi chú", () => {
  const a = castZiWei({ date: "1990-09-19", time: "23:30", gender: "male" });
  const b = castZiWei({ date: "1990-09-19", time: "00:10", gender: "male" });
  assert.equal(a.hour.index, 0);
  assert.deepEqual(a.raw, b.raw);
  assert.equal(a.lunar.day, 1);
  assert.equal(a.notes.length, 2);
  assert.match(a.notes[1], /Tý hour/);
  assert.equal(localizeZiWei(a.raw, "zh").notes.length, 2);
});

test("en: ziWeiSvg và chart.toSvg vẽ đúng renderChartSvg của lá số thô, theo lang của lá số", async () => {
  const { renderChartSvg, ziWeiSvg } = await import("../src/index.ts");
  const c = castZiWei({ date: "1990-09-19", time: "20:00", gender: "male", lang: "zh" });
  assert.equal(c.toSvg(), renderChartSvg(c.raw, { lang: "zh" }));
  assert.equal(c.toSvg({ theme: "dark", lang: "en" }), renderChartSvg(c.raw, { lang: "en", theme: "dark" }));
  assert.equal(ziWeiSvg(c.raw, { width: 360 }), renderChartSvg(c.raw, { lang: "en", width: 360 }));
  assert.ok(!Object.keys(c).includes("toSvg"));
  assert.ok(!JSON.stringify(c).includes("toSvg"));
});
