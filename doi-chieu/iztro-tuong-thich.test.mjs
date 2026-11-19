// So lớp tương thích @nhatnguyet/tu-vi/iztro với chính iztro 2.6.5: cùng đầu
// vào, lớp tương thích chạy với country "CN" (giờ Bắc Kinh, như iztro) và cùng
// fixLeap. Phải trùng: mọi khoá (gốc, cung, sao), mọi trường lịch và cung,
// vị trí, nhóm, loại của mọi sao lõi có. Khác biệt CỐ Ý theo phái được đếm,
// không coi là lỗi:
//   - độ sáng chính tinh (bảng năm mức của sách Việt, iztro bảy mức);
//   - Thiên Quý (天贵) an theo lối sách Việt;
//   - năm can Canh (庚): Thiên Khôi, Thiên Việt và Tứ Hóa (Thiên Đồng Khoa, Thái Âm Kỵ);
//   - Hỏa Tinh, Linh Tinh an theo lối Tân Biên (iztro đếm cả hai thuận);
//   - Thiên Trù năm can Quý (癸) ở Tuất như Tân Biên (iztro ở Hợi).
//
//   cd doi-chieu && npm ci && node --test iztro-tuong-thich.test.mjs

import { test } from "node:test";
import assert from "node:assert/strict";
import { napIztro, batGhiNhoIztro } from "./nap.mjs";

const { bySolar, byLunar, IZTRO_LANGUAGES } = await import("../js/packages/tu-vi/src/iztro.ts");
const { NHAN_IZTRO } = await import("../js/packages/tu-vi/src/iztro-nhan.ts");
const iztro = napIztro();
batGhiNhoIztro();

const SO_LA = Number(process.env.SO_LA ?? 600);
const TRUONG_GOC = ["gender", "solarDate", "lunarDate", "chineseDate", "rawDates", "time", "timeRange", "sign", "zodiac",
  "earthlyBranchOfSoulPalace", "earthlyBranchOfBodyPalace", "soul", "body", "fiveElementsClass"];
const TRUONG_CUNG = ["index", "name", "isBodyPalace", "isOriginalPalace", "heavenlyStem", "earthlyBranch",
  "changsheng12", "boshi12", "suiqian12", "decadal", "ages"];
const NHOM = ["majorStars", "minorStars", "adjectiveStars"];

function cacLa() {
  let seed = 20261119;
  const rnd = () => (seed = (seed * 1103515245 + 12345) % 2147483648) / 2147483648;
  const ra = [];
  for (let n = 0; n < SO_LA; n++) {
    const t = Date.UTC(1900, 1, 1) + rnd() * (Date.UTC(2100, 10, 30) - Date.UTC(1900, 1, 1));
    const d = new Date(t);
    ra.push({
      ngay: `${d.getUTCFullYear()}-${d.getUTCMonth() + 1}-${d.getUTCDate()}`,
      gio: Math.floor(rnd() * 13),
      gioi: rnd() < 0.5 ? "男" : "女",
      fixLeap: rnd() < 0.6,
      lang: IZTRO_LANGUAGES[n % IZTRO_LANGUAGES.length],
    });
  }
  // Ca biên: tháng nhuận nửa đầu, nửa sau (2023 nhuận tháng 2), Tết 1985, giờ Tý muộn cuối năm.
  for (const ngay of ["2023-3-25", "2023-4-12", "1985-1-21", "2007-2-17", "1999-12-31"]) {
    for (const fixLeap of [true, false]) ra.push({ ngay, gio: ngay === "1999-12-31" ? 12 : 5, gioi: "女", fixLeap, lang: "zh-CN" });
  }
  return ra;
}

const kk = (o) => Object.keys(o).sort().join(",");

// Lựa chọn phái theo lối iztro (docs/schools.md): Hỏa Linh, Tứ Hóa can Canh,
// Thiên Trù tuổi Quý như Toàn Thư; fixLeap của iztro là leapMonth "split-at-15".
const PHAI_IZTRO = { fireBell: "quanshu", transformations: "quanshu", heavenlyKitchen: "chinese" };

function soVoiIztro(schools) {
  const dem = { la: 0, sao: 0, doSangKhac: 0, thienQuyKhac: 0, canhKhoiViet: 0, canhTuHoa: 0, hoaLinhKhac: 0, quyThienTru: 0 };
  const loi = [];
  for (const ca of cacLa()) {
    const a = JSON.parse(JSON.stringify(iztro.astro.bySolar(ca.ngay, ca.gio, ca.gioi, ca.fixLeap, ca.lang)));
    const b = JSON.parse(JSON.stringify(bySolar(ca.ngay, ca.gio, ca.gioi, ca.fixLeap, ca.lang, { country: "CN", schools })));
    dem.la++;
    const sai = (x) => loi.length < 20 && loi.push({ ca, ...x });
    const keys = (o) => kk(o).replace(/(^|,)copyright/, "");
    if (keys(a) !== keys(b)) sai({ khoa: [kk(a), kk(b)] });
    for (const k of TRUONG_GOC) if (JSON.stringify(a[k]) !== JSON.stringify(b[k])) sai({ truong: k, iztro: a[k], nn: b[k] });
    const canCanh = a.rawDates.chineseDate.yearly[0] === "庚";
    const canQuy = a.rawDates.chineseDate.yearly[0] === "癸";
    const viTri = (o) => {
      const m = new Map();
      for (const p of o.palaces) for (const g of NHOM) for (const st of p[g]) m.set(g + "|" + st.name, { i: p.index, st });
      return m;
    };
    const va = viTri(a);
    for (let i = 0; i < 12; i++) {
      const p = a.palaces[i];
      const q = b.palaces[i];
      if (kk(p) !== kk(q)) sai({ cung: i, khoa: [kk(p), kk(q)] });
      for (const k of TRUONG_CUNG) if (JSON.stringify(p[k]) !== JSON.stringify(q[k])) sai({ cung: i, truong: k, iztro: p[k], nn: q[k] });
    }
    for (const [khoa, x] of viTri(b)) {
      dem.sao++;
      const y = va.get(khoa);
      if (!y) {
        sai({ sao: khoa, loi: "iztro không có" });
        continue;
      }
      if (kk(y.st) !== kk(x.st) || y.st.type !== x.st.type) sai({ sao: khoa, iztro: y.st, nn: x.st });
      const tenHan = khoa.split("|")[1];
      if (y.i !== x.i) {
        if (isThienQuy(tenHan)) dem.thienQuyKhac++;
        else if (canCanh && isKhoiViet(tenHan)) dem.canhKhoiViet++;
        else if (HOA_LINH.has(tenHan)) dem.hoaLinhKhac++;
        else if (canQuy && THIEN_TRU.has(tenHan)) dem.quyThienTru++;
        else sai({ sao: khoa, iztro: y.i, nn: x.i });
      }
      if ("mutagen" in x.st && y.st.mutagen !== x.st.mutagen) {
        if (canCanh) dem.canhTuHoa++;
        else sai({ sao: khoa, mutagen: [y.st.mutagen, x.st.mutagen] });
      }
      if (khoa.startsWith("majorStars|") && y.st.brightness !== x.st.brightness) dem.doSangKhac++;
    }
  }
  console.log(`iztro${schools ? " (schools " + JSON.stringify(schools) + ")" : ""} ${dem.la} lá, ${dem.sao} sao so vị trí; khác theo phái: độ sáng ${dem.doSangKhac}, Thiên Quý ${dem.thienQuyKhac}, ` +
    `Khôi Việt năm Canh ${dem.canhKhoiViet}, Tứ Hóa năm Canh ${dem.canhTuHoa}, Hỏa Linh ${dem.hoaLinhKhac}, Thiên Trù năm Quý ${dem.quyThienTru}`);
  return { dem, loi };
}

test("lớp tương thích trùng khuôn và vị trí sao của iztro (giờ Bắc Kinh, cùng fixLeap)", () => {
  const { dem, loi } = soVoiIztro(undefined);
  assert.deepEqual(loi, []);
  assert.ok(dem.hoaLinhKhac > 0 && dem.canhTuHoa > 0, "mặc định là lối sách Việt, phải khác iztro ở Hỏa Linh và Tứ Hóa can Canh");
});

test("schools theo lối iztro: Hỏa Linh, Tứ Hóa can Canh, Thiên Trù tuổi Quý, tháng nhuận trùng iztro", () => {
  const { dem, loi } = soVoiIztro(PHAI_IZTRO);
  assert.deepEqual(loi, []);
  assert.deepEqual([dem.hoaLinhKhac, dem.canhTuHoa, dem.quyThienTru], [0, 0, 0]);
});

// Tên Thiên Quý, Thiên Khôi, Thiên Việt ở sáu ngôn ngữ của iztro.
const THIEN_QUY = new Set(["天贵", "天貴", "noble", "Thiên Quý", "천귀"]);
const KHOI_VIET = new Set(["天魁", "天钺", "天鉞", "assistant", "aide", "Thiên Khôi", "Thiên Việt", "천괴", "천월"]);
// Hỏa Tinh, Linh Tinh, Thiên Trù ở sáu ngôn ngữ của iztro (đọc từ bảng chữ đã chép).
const HOA_LINH = new Set(Object.values(NHAN_IZTRO).flatMap((b) => [b.huoxingMin, b.lingxingMin]));
const THIEN_TRU = new Set(Object.values(NHAN_IZTRO).map((b) => b.tianchu));
function isThienQuy(ten) {
  return THIEN_QUY.has(ten);
}
function isKhoiViet(ten) {
  return KHOI_VIET.has(ten);
}

test("byLunar trùng iztro byLunar (giờ Bắc Kinh)", () => {
  for (const [ngay, nhuan] of [["2023-2-20", true], ["2023-2-20", false], ["1984-10-5", true], ["2000-1-1", false]]) {
    const a = JSON.parse(JSON.stringify(iztro.astro.byLunar(ngay, 4, "男", nhuan, true, "zh-CN")));
    const b = JSON.parse(JSON.stringify(byLunar(ngay, 4, "男", nhuan, true, "zh-CN", { country: "CN" })));
    assert.equal(b.solarDate, a.solarDate, ngay);
    assert.deepEqual(b.rawDates.lunarDate, a.rawDates.lunarDate);
    assert.equal(b.fiveElementsClass, a.fiveElementsClass);
    assert.equal(b.earthlyBranchOfSoulPalace, a.earthlyBranchOfSoulPalace);
  }
});

test("mặc định là lịch Việt Nam: Tết 1985 khác iztro", () => {
  const a = iztro.astro.bySolar("1985-1-21", 5, "男", true, "vi-VN");
  const b = bySolar("1985-1-21", 5, "男", true, "vi-VN");
  assert.equal(a.lunarDate, "Âm lịch ngày 1 tháng 12 năm 1984");
  assert.equal(b.lunarDate, "Âm lịch ngày 1 tháng 1 năm 1985");
  assert.equal(b.fiveElementsClass, "Thủy Nhị Cục");
  assert.equal(b.earthlyBranchOfSoulPalace, "Dậu");
  assert.equal(b.calendar.timeZone, 7);
});
