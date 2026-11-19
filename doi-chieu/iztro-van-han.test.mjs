// So phần vận hạn của lớp tương thích (@nhatnguyet/tu-vi/iztro: horoscope(),
// decadalList(), yearlyList(), monthlyList()) với chính iztro 2.6.5, cùng đầu
// vào, lớp tương thích chạy với country "CN" (giờ Bắc Kinh, như iztro).
//
// Phải trùng: ngày âm, chỉ số cung, can chi, tên mười hai cung xoay (palaceNames)
// của đại hạn, tiểu hạn, lưu niên, lưu nguyệt; tuổi mụ; vị trí bốn sao lưu lõi
// có an (流禄 流羊 流陀 流马). Khác biệt CÓ LÝ DO được đếm theo nguyên nhân,
// không coi là lỗi:
//   - tứ hóa can Canh (庚): bảng của lõi (Thiên Đồng Khoa, Thái Âm Kỵ);
//   - đồng hạn (童限): lõi không có luật này, decadal là null trước đại hạn đầu;
//   - lưu nguyệt khi lá sinh hay ngày xem ở nửa sau tháng nhuận mà fixLeap false
//     (lõi theo fixLeap của lá, iztro luôn cộng một tháng);
//   - iztro dịch can của đại hạn qua khoá gõ sai ("Heavnly"), nên ở en-US can
//     丙 ("bing") ra "sick" (sao 病 của vòng Tràng Sinh): lớp tương thích giữ can
//     của cung, như palaces[i].decadal.heavenlyStem của chính iztro;
//   - độ dài tháng âm ở vài tháng biên mà lịch UTC+8 của lõi và lunar-typescript
//     lệch nhau (doi-chieu/README.md);
//   - phần lõi chưa tính: tứ hóa của tháng, lưu nhật, lưu thời, sao lưu của đại
//     hạn và của tháng, sáu sao lưu năm còn lại, hai vòng của năm (yearlyDecStar).
//
//   cd doi-chieu && npm ci && node --test iztro-van-han.test.mjs

import { test } from "node:test";
import assert from "node:assert/strict";
import { napIztro, batGhiNhoIztro } from "./nap.mjs";

const { bySolar, IZTRO_LANGUAGES } = await import("../js/packages/tu-vi/src/iztro.ts");
const { NHAN_IZTRO } = await import("../js/packages/tu-vi/src/iztro-nhan.ts");
const iztro = napIztro();
batGhiNhoIztro();

const SO_LA = Number(process.env.SO_LA ?? 400);
const CANH = new Set(Object.values(NHAN_IZTRO).map((b) => b.gengHeavenly));

function cacCa() {
  let seed = 20261120;
  const rnd = () => (seed = (seed * 1103515245 + 12345) % 2147483648) / 2147483648;
  const ngay = (t) => {
    const d = new Date(t);
    return `${d.getUTCFullYear()}-${d.getUTCMonth() + 1}-${d.getUTCDate()}`;
  };
  const ra = [];
  for (let n = 0; n < SO_LA; n++) {
    const sinh = Date.UTC(1900, 1, 1) + rnd() * (Date.UTC(2080, 0, 1) - Date.UTC(1900, 1, 1));
    const xem = sinh + rnd() * Math.min(100 * 365.25 * 864e5, Date.UTC(2100, 10, 30) - sinh);
    ra.push({
      ngay: ngay(sinh), gio: Math.floor(rnd() * 13), gioi: rnd() < 0.5 ? "男" : "女", fixLeap: rnd() < 0.6,
      lang: IZTRO_LANGUAGES[n % IZTRO_LANGUAGES.length], xem: ngay(xem), gioXem: Math.floor(rnd() * 13),
    });
  }
  // Ca biên: sinh nửa sau tháng nhuận (2023 nhuận tháng 2), xem trong tháng nhuận, giờ Tý muộn.
  for (const fixLeap of [true, false]) {
    ra.push({ ngay: "2023-4-12", gio: 5, gioi: "女", fixLeap, lang: "zh-CN", xem: "2045-6-1", gioXem: 3 });
    ra.push({ ngay: "1990-9-19", gio: 10, gioi: "男", fixLeap, lang: "zh-CN", xem: "2023-4-12", gioXem: 12 });
    ra.push({ ngay: "1999-12-31", gio: 12, gioi: "男", fixLeap, lang: "vi-VN", xem: "2001-1-1", gioXem: 0 });
  }
  return ra;
}

const j = (x) => JSON.parse(JSON.stringify(x));
const ten = (ds) => ds.map((s) => s.name);

test("vận hạn trùng iztro (giờ Bắc Kinh), khác theo nguyên nhân được đếm", () => {
  const dem = {
    ca: 0, lechLich: 0, iztroCanDaiHan: 0, dongHan: 0, daiHanTrung: 0, canhTuHoa: 0, thangNhuan: 0, thangTrung: 0, saoLuu: 0,
    chuaTinh: { tuHoaThang: 0, luuNhat: 0, luuThoi: 0, saoLuuDaiHan: 0 },
  };
  const loi = [];
  const sai = (ca, x) => loi.length < 20 && loi.push({ ca, ...x });
  for (const ca of cacCa()) {
    const A = iztro.astro.bySolar(ca.ngay, ca.gio, ca.gioi, ca.fixLeap, ca.lang);
    const B = bySolar(ca.ngay, ca.gio, ca.gioi, ca.fixLeap, ca.lang, { country: "CN" });
    const a = j(A.horoscope(ca.xem, ca.gioXem));
    const b = j(B.horoscope(ca.xem, ca.gioXem));
    dem.ca++;
    if (a.solarDate !== b.solarDate) sai(ca, { truong: "solarDate", iztro: a.solarDate, nn: b.solarDate });
    if (a.lunarDate !== b.lunarDate) {
      // Lịch UTC+8 của lõi và lunar-typescript lệch ở vài tháng biên (doi-chieu/README.md).
      dem.lechLich++;
      continue;
    }
    const soPhamVi = (pa, pb, k, coCanh) => {
      for (const f of ["index", "heavenlyStem", "earthlyBranch", "palaceNames"]) {
        if (JSON.stringify(pa[f]) === JSON.stringify(pb[f])) continue;
        if (k === "decadal" && f === "heavenlyStem" && ca.lang === "en-US" && pa[f] === "sick" && pb[f] === "bing") dem.iztroCanDaiHan++;
        else sai(ca, { phamVi: k, truong: f, iztro: pa[f], nn: pb[f] });
      }
      if (JSON.stringify(pa.mutagen) !== JSON.stringify(pb.mutagen)) {
        if (coCanh) dem.canhTuHoa++;
        else sai(ca, { phamVi: k, truong: "mutagen", iztro: pa.mutagen, nn: pb.mutagen });
      }
    };
    // Đại hạn.
    if (b.decadal === null) {
      const dau = Math.min(...B.palaces.map((p) => p.decadal.range[0]));
      if (a.age.nominalAge < dau) dem.dongHan++;
      else sai(ca, { phamVi: "decadal", iztro: a.decadal.index, nn: null });
    } else {
      dem.daiHanTrung++;
      soPhamVi(a.decadal, b.decadal, "decadal", CANH.has(b.decadal.heavenlyStem));
      dem.chuaTinh.saoLuuDaiHan++;
    }
    // Tiểu hạn.
    if (a.age.nominalAge !== b.age.nominalAge) sai(ca, { phamVi: "age", truong: "nominalAge", iztro: a.age.nominalAge, nn: b.age.nominalAge });
    soPhamVi(a.age, b.age, "age", CANH.has(b.age.heavenlyStem));
    // Lưu niên và bốn sao lưu.
    soPhamVi(a.yearly, b.yearly, "yearly", CANH.has(b.yearly.heavenlyStem));
    const nhan = NHAN_IZTRO[ca.lang];
    for (const k of ["liulu", "liuyang", "liutuo", "liuma"]) {
      const viTri = (st) => st.findIndex((ds) => ten(ds).includes(nhan[k]));
      dem.saoLuu++;
      if (viTri(a.yearly.stars) !== viTri(b.yearly.stars)) sai(ca, { phamVi: "yearly", sao: k, iztro: viTri(a.yearly.stars), nn: viTri(b.yearly.stars) });
    }
    // Lưu nguyệt.
    for (const f of ["heavenlyStem", "earthlyBranch"]) if (a.monthly[f] !== b.monthly[f]) sai(ca, { phamVi: "monthly", truong: f, iztro: a.monthly[f], nn: b.monthly[f] });
    if (a.monthly.index !== b.monthly.index) {
      const sinh = B.rawDates.lunarDate;
      const xem = B.horoscope(ca.xem, ca.gioXem).lunarDate;
      if (!ca.fixLeap && ((sinh.isLeap && sinh.lunarDay > 15) || /闰/.test(xem))) dem.thangNhuan++;
      else sai(ca, { phamVi: "monthly", truong: "index", iztro: a.monthly.index, nn: b.monthly.index });
    } else {
      dem.thangTrung++;
      if (JSON.stringify(a.monthly.palaceNames) !== JSON.stringify(b.monthly.palaceNames)) sai(ca, { phamVi: "monthly", truong: "palaceNames" });
    }
    if (b.monthly.mutagen.length === 0) dem.chuaTinh.tuHoaThang++;
    if (b.daily === null) dem.chuaTinh.luuNhat++;
    if (b.hourly === null) dem.chuaTinh.luuThoi++;
  }
  console.log("vận hạn so iztro:", JSON.stringify(dem));
  assert.deepEqual(loi, []);
});

test("decadalList, yearlyList, monthlyList trùng iztro", () => {
  const dem = { la: 0, daiHan: 0, luuNien: 0, luuNguyet: 0, canhTuHoa: 0, thangNhuan: 0, lechDoDaiThang: 0 };
  const loi = [];
  const sai = (ca, x) => loi.length < 20 && loi.push({ ca, ...x });
  for (const ca of cacCa().slice(0, 120)) {
    const A = iztro.astro.bySolar(ca.ngay, ca.gio, ca.gioi, ca.fixLeap, ca.lang);
    const B = bySolar(ca.ngay, ca.gio, ca.gioi, ca.fixLeap, ca.lang, { country: "CN" });
    if (A.lunarDate !== B.lunarDate) continue;
    dem.la++;
    const da = j(A.decadalList());
    const db = j(B.decadalList());
    for (let i = 0; i < 12; i++) {
      dem.daiHan++;
      for (const f of ["index", "palaceName", "ageRange", "yearRange", "heavenlyStem", "earthlyBranch", "palaceNames"]) {
        if (JSON.stringify(da[i][f]) !== JSON.stringify(db[i][f])) sai(ca, { ds: "decadalList", i, f, iztro: da[i][f], nn: db[i][f] });
      }
      if (JSON.stringify(da[i].mutagen) !== JSON.stringify(db[i].mutagen)) {
        if (CANH.has(db[i].heavenlyStem)) dem.canhTuHoa++;
        else sai(ca, { ds: "decadalList", i, mutagen: [da[i].mutagen, db[i].mutagen] });
      }
    }
    const ya = j(A.yearlyList(2));
    const yb = j(B.yearlyList(2));
    for (let i = 0; i < ya.length; i++) {
      dem.luuNien++;
      for (const f of ["index", "age", "year", "heavenlyStem", "earthlyBranch", "palaceNames"]) {
        if (JSON.stringify(ya[i][f]) !== JSON.stringify(yb[i][f])) sai(ca, { ds: "yearlyList", i, f, iztro: ya[i][f], nn: yb[i][f] });
      }
    }
    const nam = Number(ca.xem.split("-")[0]);
    const ma = j(A.monthlyList(nam, ca.fixLeap));
    const mb = j(B.monthlyList(nam, ca.fixLeap));
    if (ma.length !== mb.length) {
      sai(ca, { ds: "monthlyList", soThang: [ma.length, mb.length] });
      continue;
    }
    for (let i = 0; i < ma.length; i++) {
      dem.luuNguyet++;
      for (const f of ["month", "isLeapMonth", "part", "age", "heavenlyStem", "earthlyBranch"]) {
        if (JSON.stringify(ma[i][f]) !== JSON.stringify(mb[i][f])) sai(ca, { ds: "monthlyList", i, f, iztro: ma[i][f], nn: mb[i][f] });
      }
      // Tháng 29 hay 30 ngày: lịch UTC+8 của lõi và lunar-typescript lệch ở vài tháng biên.
      if (JSON.stringify(ma[i].dayRange) !== JSON.stringify(mb[i].dayRange)) dem.lechDoDaiThang++;
      if (ma[i].index !== mb[i].index) {
        const sinh = B.rawDates.lunarDate;
        if (!ca.fixLeap && (ma[i].isLeapMonth || (sinh.isLeap && sinh.lunarDay > 15))) dem.thangNhuan++;
        else sai(ca, { ds: "monthlyList", i, index: [ma[i].index, mb[i].index] });
      }
    }
  }
  console.log("danh sách vận hạn so iztro:", JSON.stringify(dem));
  assert.deepEqual(loi, []);
});

test("hàm cung và sao trả lời như iztro (trừ chỗ khác theo phái)", () => {
  const dem = { la: 0, phep: 0, khacCanh: 0, khacSao: 0 };
  const loi = [];
  for (const ca of cacCa().slice(0, 150)) {
    const A = iztro.astro.bySolar(ca.ngay, ca.gio, ca.gioi, ca.fixLeap, ca.lang);
    const B = bySolar(ca.ngay, ca.gio, ca.gioi, ca.fixLeap, ca.lang, { country: "CN" });
    if (A.lunarDate !== B.lunarDate) continue;
    dem.la++;
    const nhan = NHAN_IZTRO[ca.lang];
    for (let i = 0; i < 12; i++) {
      const pa = A.palace(i);
      const pb = B.palace(i);
      const coCanh = CANH.has(pb.heavenlyStem);
      const so = (phep, x, y, lyDo) => {
        dem.phep++;
        if (x === y) return;
        if (lyDo === "canh" && coCanh) dem.khacCanh++;
        else if (lyDo === "sao") dem.khacSao++;
        else if (loi.length < 20) loi.push({ ca, cung: i, phep, iztro: x, nn: y });
      };
      for (const m of ["禄", "权", "科", "忌"]) {
        so("selfMutaged " + m, pa.selfMutaged(m), pb.selfMutaged(m), "canh");
        for (let k = 0; k < 12; k++) so(`fliesTo ${k} ${m}`, pa.fliesTo(k, m), pb.fliesTo(k, m), "canh");
      }
      so("isEmpty", pa.isEmpty(), pb.isEmpty());
      so("has 紫微", pa.has(["紫微"]), pb.has(["紫微"]));
      so("tam phương có 紫微", A.surroundedPalaces(i).have(["紫微"]), B.surroundedPalaces(i).have(["紫微"]));
      // Ngôi sao sách Việt an khác (Thiên Quý, Hỏa Linh...) làm tam phương khác: đếm, không coi là lỗi.
      so("tam phương có 火星", A.surroundedPalaces(i).haveOneOf([nhan.huoxingMin]), B.surroundedPalaces(i).haveOneOf([nhan.huoxingMin]), "sao");
    }
    assert.equal(B.star("紫微").palace().index, A.star("紫微").palace().index);
    assert.equal(B.palace("命宫").index, A.palace("命宫").index);
    assert.equal(B.palace("身宫").index, A.palace("身宫").index);
  }
  console.log("hàm cung so iztro:", JSON.stringify(dem));
  assert.deepEqual(loi, []);
});
