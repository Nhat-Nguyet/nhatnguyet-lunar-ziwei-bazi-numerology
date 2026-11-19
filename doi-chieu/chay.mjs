#!/usr/bin/env node
// Đối chiếu Nhat Nguyet với iztro và lunar-javascript trên mọi ngày
// 01/01/1900 tới 31/12/2100: lịch âm, ngày Tết, tháng nhuận, mốc tiết khí
// (so thêm với IMCCE) và lá số Tử Vi. Ghi ket-qua.json và khac-ngay-am.csv.
//
//   node doi-chieu/chay.mjs                 # đủ: mọi ngày x 12 giờ
//   node doi-chieu/chay.mjs --gio=0,6       # nhanh hơn: giờ Tý và giờ Ngọ
//   node doi-chieu/chay.mjs --tu=1984 --den=1986 --luong=2
//
// Comparison of Nhat Nguyet with iztro and lunar-javascript over every day
// from 1900-01-01 to 2100-12-31. See README.md.

import { Worker } from "node:worker_threads";
import { availableParallelism } from "node:os";
import { readFileSync, writeFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import path from "node:path";
import {
  DUONG_DAN,
  batGhiNhoIztro,
  napIztro,
  napLunarJavascript,
  napLunarTypescript,
  napNhatNguyet,
  phienBan,
} from "./nap.mjs";
import { TRUONG, TEN_CHI, laSoIztro, laSoLoi, soLaSo } from "./tu-vi-chung.mjs";

// ---------------------------------------------------------------- tham số

const thamSo = Object.fromEntries(
  process.argv.slice(2).map((a) => {
    const [k, v] = a.replace(/^--/, "").split("=");
    return [k, v ?? "1"];
  }),
);
const NAM_DAU = Number(thamSo.tu ?? 1900);
const NAM_CUOI = Number(thamSo.den ?? 2100);
const CAC_GIO = thamSo.gio && thamSo.gio !== "tat-ca" ? thamSo.gio.split(",").map(Number) : [...Array(12).keys()];
const SO_LUONG = Number(thamSo.luong ?? availableParallelism());
const THU_MUC = DUONG_DAN.THU_MUC;

const { amLich, tuVi } = await napNhatNguyet();
const LJ = napLunarJavascript();
const LT = napLunarTypescript();

const batDau = performance.now();
const log = (...a) => console.log(`[${((performance.now() - batDau) / 1000).toFixed(0)}s]`, ...a);
const jdnDau = amLich.jdFromDate(1, 1, NAM_DAU);
const jdnCuoi = amLich.jdFromDate(31, 12, NAM_CUOI);
const p2 = (n) => String(n).padStart(2, "0");
const ymd = (s) => `${s.year}-${p2(s.month)}-${p2(s.day)}`;
const chuoiAm = (l) => `${l.year}-${p2(l.month)}${l.leap ? "n" : ""}-${p2(l.day)}`;
const amLJ = (l) => ({ year: l.getYear(), month: Math.abs(l.getMonth()), day: l.getDay(), leap: l.getMonth() < 0 });
const giongAm = (a, b) => a.year === b.year && a.month === b.month && a.day === b.day && a.leap === b.leap;

function commitHienTai() {
  try {
    return execFileSync("git", ["rev-parse", "--short=12", "HEAD"], { cwd: THU_MUC, encoding: "utf8" }).trim();
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------- 1. lịch âm

log(`Lịch âm ${NAM_DAU} tới ${NAM_CUOI}: ${jdnCuoi - jdnDau + 1} ngày`);

function demLech() {
  return { ngay: 0, khacSoNgay: 0, khacThang: 0, khacNam: 0, soDot: 0 };
}
const lichAm = {
  soNgay: jdnCuoi - jdnDau + 1,
  nhatNguyetVN_lunarJavascript: demLech(),
  nhatNguyetCN_lunarJavascript: demLech(),
  lunarTypescript_lunarJavascript: demLech(),
  ngayLechCN: [],
};
const truocDo = { vn: false, cn: false, lt: false };
// Tháng nhuận theo năm âm, ghi lại trong lúc quét ngày (cả ba bên cùng một cách).
const nhuanTheoNam = { vn: new Map(), cn: new Map(), lj: new Map() };
const ghiNhuan = (bang, l) => {
  if (!bang.has(l.year)) bang.set(l.year, 0);
  if (l.leap) bang.set(l.year, l.month);
};
const dongCsv = ["ngay_duong,nhat_nguyet_vn_utc7,lunar_javascript,nhat_nguyet_cn_utc8,khac_theo"];

function cong(dem, a, b, khoaTruoc) {
  const khac = !giongAm(a, b);
  if (khac) {
    dem.ngay++;
    if (a.year !== b.year) dem.khacNam++;
    if (a.month !== b.month || a.leap !== b.leap || a.year !== b.year) dem.khacThang++;
    if (a.day !== b.day) dem.khacSoNgay++;
    if (!truocDo[khoaTruoc]) dem.soDot++;
  }
  truocDo[khoaTruoc] = khac;
  return khac;
}

for (let jdn = jdnDau; jdn <= jdnCuoi; jdn++) {
  const s = amLich.jdToDate(jdn);
  const vn = amLich.solarToLunar(s.day, s.month, s.year, 7);
  const cn = amLich.solarToLunar(s.day, s.month, s.year, 8);
  const lj = amLJ(LJ.Solar.fromYmd(s.year, s.month, s.day).getLunar());
  const lt = amLJ(LT.Solar.fromYmd(s.year, s.month, s.day).getLunar());
  const khacVN = cong(lichAm.nhatNguyetVN_lunarJavascript, vn, lj, "vn");
  const khacCN = cong(lichAm.nhatNguyetCN_lunarJavascript, cn, lj, "cn");
  cong(lichAm.lunarTypescript_lunarJavascript, lt, lj, "lt");
  ghiNhuan(nhuanTheoNam.vn, vn);
  ghiNhuan(nhuanTheoNam.cn, cn);
  ghiNhuan(nhuanTheoNam.lj, lj);
  if (khacCN) lichAm.ngayLechCN.push({ ngay: ymd(s), nhatNguyetCN: chuoiAm(cn), lunarJavascript: chuoiAm(lj) });
  if (khacVN || khacCN) {
    const theo = [];
    if (vn.year !== lj.year) theo.push("nam");
    if (vn.month !== lj.month || vn.leap !== lj.leap) theo.push("thang");
    if (vn.day !== lj.day) theo.push("ngay");
    dongCsv.push(`${ymd(s)},${chuoiAm(vn)},${chuoiAm(lj)},${chuoiAm(cn)},${theo.join("+")}`);
  }
}
log("ngày âm khác (Nhat Nguyet giờ VN so lunar-javascript):", lichAm.nhatNguyetVN_lunarJavascript.ngay);
log("ngày âm khác (Nhat Nguyet giờ CN so lunar-javascript):", lichAm.nhatNguyetCN_lunarJavascript.ngay);

// Tết và tháng nhuận theo năm âm.
const tet = { soNam: 0, khacVN: [], khacCN: [] };
const thangNhuan = { soNam: 0, khacVN: [], khacCN: [] };
for (let nam = NAM_DAU; nam <= NAM_CUOI; nam++) {
  tet.soNam++;
  const tVN = ymd(amLich.lunarToSolar(1, 1, nam, false, 7).duong);
  const tCN = ymd(amLich.lunarToSolar(1, 1, nam, false, 8).duong);
  const s = LJ.Lunar.fromYmd(nam, 1, 1).getSolar();
  const tLJ = `${s.getYear()}-${p2(s.getMonth())}-${p2(s.getDay())}`;
  if (tVN !== tLJ) tet.khacVN.push({ nam, nhatNguyetVN: tVN, lunarJavascript: tLJ });
  if (tCN !== tLJ) tet.khacCN.push({ nam, nhatNguyetCN: tCN, lunarJavascript: tLJ });

  thangNhuan.soNam++;
  // Năm âm cuối cùng chỉ quét tới 31/12 dương lịch; tháng nhuận nằm sau đó
  // (nếu có) không được tính, như nhau cho mọi bên.
  const nVN = nhuanTheoNam.vn.get(nam) ?? 0;
  const nCN = nhuanTheoNam.cn.get(nam) ?? 0;
  const nLJ = nhuanTheoNam.lj.get(nam) ?? 0;
  if (nVN !== nLJ) thangNhuan.khacVN.push({ nam, nhatNguyetVN: nVN, lunarJavascript: nLJ });
  if (nCN !== nLJ) thangNhuan.khacCN.push({ nam, nhatNguyetCN: nCN, lunarJavascript: nLJ });
}
log("năm Tết khác:", tet.khacVN.length, "; năm tháng nhuận khác:", thangNhuan.khacVN.length);

// ---------------------------------------------------------------- 2. tiết khí

log("Tiết khí so với IMCCE");
const KINH_DO_TEN = {
  春分: 0, 清明: 15, 谷雨: 30, 立夏: 45, 小满: 60, 芒种: 75, 夏至: 90, 小暑: 105, 大暑: 120, 立秋: 135, 处暑: 150,
  白露: 165, 秋分: 180, 寒露: 195, 霜降: 210, 立冬: 225, 小雪: 240, 大雪: 255, 冬至: 270, 小寒: 285, 大寒: 300,
  立春: 315, 雨水: 330, 惊蛰: 345,
  DA_XUE: 255, DONG_ZHI: 270, XIAO_HAN: 285, DA_HAN: 300, LI_CHUN: 315, YU_SHUI: 330, JING_ZHE: 345,
};
const phutUT = (y, m, d, h, mi, s = 0, tz = 0) => Date.UTC(y, m - 1, d, h, mi, s) / 60000 - tz * 60;
const ngayTai = (phut, tz) => new Date((phut + tz * 60) * 60000).toISOString().slice(0, 10);

const imcce = [];
for (const dong of readFileSync(path.join(THU_MUC, "du-lieu/imcce-tiet-khi-1900-2100.tsv"), "utf8").split("\n")) {
  if (!dong || dong.startsWith("#")) continue;
  const [ngay, gio, kd] = dong.split("\t");
  const [y, m, d] = ngay.split("-").map(Number);
  const [h, mi, s] = gio.split(":").map(Number);
  const nam = y;
  if (nam < NAM_DAU || nam > NAM_CUOI) continue;
  imcce.push({ khoa: `${nam}/${kd}`, phut: phutUT(y, m, d, h, mi, s), kinhDo: Number(kd) });
}

function mocCua6tail(thuVien) {
  const ra = new Map();
  for (let nam = NAM_DAU - 1; nam <= NAM_CUOI + 1; nam++) {
    for (const [ten, s] of Object.entries(thuVien.Lunar.fromYmd(nam, 1, 1).getJieQiTable())) {
      const phut = phutUT(s.getYear(), s.getMonth(), s.getDay(), s.getHour(), s.getMinute(), s.getSecond(), 8);
      ra.set(`${new Date(phut * 60000).getUTCFullYear()}/${KINH_DO_TEN[ten]}`, phut);
    }
  }
  return ra;
}
function mocCuaNhatNguyet() {
  const ra = new Map();
  for (let nam = NAM_DAU - 1; nam <= NAM_CUOI + 1; nam++) {
    for (const m of amLich.mocTietKhiTrongNam(nam)) {
      const phut = phutUT(m.ngay.year, m.ngay.month, m.ngay.day, m.gio, m.phut, 0, 7);
      ra.set(`${new Date(phut * 60000).getUTCFullYear()}/${m.kinhDo}`, phut);
    }
  }
  return ra;
}
function thongKe(moc, tzLich) {
  const lech = [];
  let khacNgay = 0;
  let thieu = 0;
  const lonNhat = [];
  for (const m of imcce) {
    const p = moc.get(m.khoa);
    if (p === undefined) {
      thieu++;
      continue;
    }
    const l = p - m.phut;
    lech.push(l);
    lonNhat.push({ moc: ngayTai(m.phut, 0), kinhDo: m.kinhDo, lechPhut: Math.round(l * 100) / 100 });
    if (ngayTai(p, tzLich) !== ngayTai(m.phut, tzLich)) khacNgay++;
  }
  const tuyetDoi = lech.map(Math.abs).sort((a, b) => a - b);
  const n = lech.length;
  const r2 = (x) => Math.round(x * 100) / 100;
  lonNhat.sort((a, b) => Math.abs(b.lechPhut) - Math.abs(a.lechPhut));
  return {
    soMoc: n,
    thieu,
    lechTrungBinhPhut: r2(lech.reduce((a, b) => a + b, 0) / n),
    lechTuyetDoiTrungBinhPhut: r2(tuyetDoi.reduce((a, b) => a + b, 0) / n),
    trungViPhut: r2(tuyetDoi[Math.floor(n / 2)]),
    p99Phut: r2(tuyetDoi[Math.floor(n * 0.99)]),
    lonNhatPhut: r2(tuyetDoi[n - 1]),
    tren1Phut: tuyetDoi.filter((x) => x > 1).length,
    tren2Phut: tuyetDoi.filter((x) => x > 2).length,
    muiGioXetNgay: tzLich,
    khacNgayGiaoTiet: khacNgay,
    lechNhieuNhat: lonNhat.slice(0, 5),
  };
}
const tietKhi = {
  nguon: "IMCCE Miriade (INPOP), apparent geocentric solar longitude, interpolated to each 15° crossing, UT to the second",
  nhatNguyet: thongKe(mocCuaNhatNguyet(), 7),
  lunarJavascript: thongKe(mocCua6tail(LJ), 8),
  lunarTypescript: thongKe(mocCua6tail(LT), 8),
};
log("tiết khí, lệch tuyệt đối lớn nhất (phút): NN", tietKhi.nhatNguyet.lonNhatPhut, "LJ", tietKhi.lunarJavascript.lonNhatPhut);

// ---------------------------------------------------------------- 3. kiểm trước Tử Vi

const { astro } = napIztro();

// (a) Ghi nhớ hai hàm i18n của iztro không đổi đầu ra: dựng một mẫu lá trước
// và sau khi bật, so nguyên JSON.
const MAU_GHI_NHO = [
  ["1985-1-21", 5], ["2030-2-3", 0], ["1900-3-1", 11], ["2100-12-31", 6], ["2023-3-25", 3],
  ["2023-4-20", 9], ["1968-1-29", 1], ["2007-2-17", 7], ["1955-6-15", 2], ["2057-10-1", 10],
  ["1994-9-9", 4], ["2020-5-30", 8],
];
const chupLa = (ngay, gio) => JSON.stringify(astro.bySolar(ngay, gio, "男", true, "zh-CN"));
log("Kiểm phép ghi nhớ của iztro trên", MAU_GHI_NHO.length, "lá (chậm, khoảng 200 ms một lá)");
const truocGhiNho = MAU_GHI_NHO.map(([n, g]) => chupLa(n, g));
batGhiNhoIztro();
const kiemGhiNho = { soLa: MAU_GHI_NHO.length, khac: MAU_GHI_NHO.filter(([n, g], i) => chupLa(n, g) !== truocGhiNho[i]).length };
if (kiemGhiNho.khac) throw new Error("ghi nhớ đổi đầu ra của iztro");

// (b) Giới tính không đổi các trường được so (ngày âm, can chi năm, cục,
// Mệnh, 14 chính tinh) ở cả hai thư viện; kiểm trên một mẫu.
const kiemGioiTinh = { soLa: 0, khac: 0 };
for (let jdn = jdnDau; jdn <= jdnCuoi; jdn += 211) {
  const s = amLich.jdToDate(jdn);
  const ngay = `${s.year}-${s.month}-${s.day}`;
  const gio = jdn % 12;
  kiemGioiTinh.soLa++;
  const a = astro.bySolar(ngay, gio, "男", true, "zh-CN");
  const b = astro.bySolar(ngay, gio, "女", true, "zh-CN");
  const tomTat = (x) => JSON.stringify([x.rawDates.lunarDate, x.fiveElementsClass, x.earthlyBranchOfSoulPalace, x.palaces.map((p) => p.majorStars.map((m) => m.name))]);
  const nam = tuVi.lapLaSoTuVi("", "Nam", s.day, s.month, s.year, gio);
  const nu = tuVi.lapLaSoTuVi("", "Nữ", s.day, s.month, s.year, gio);
  const tomTatNN = (x) => JSON.stringify([x.ngaySinhAm, x.cuc, x.cungMenh, x.cung.map((c) => c.sao.filter((k) => k.loai === "chinh-tinh").map((k) => k.ten))]);
  if (tomTat(a) !== tomTat(b) || tomTatNN(nam) !== tomTatNN(nu)) kiemGioiTinh.khac++;
}
log("kiểm giới tính:", kiemGioiTinh);

// ---------------------------------------------------------------- 4. Tử Vi

log(`Tử Vi: ${lichAm.soNgay} ngày x ${CAC_GIO.length} giờ, ${SO_LUONG} luồng`);
const SO_KHUC = SO_LUONG * 8;
const doDai = Math.ceil(lichAm.soNgay / SO_KHUC);
const khuc = [];
for (let i = 0; i < SO_KHUC; i++) {
  const tu = jdnDau + i * doDai;
  if (tu > jdnCuoi) break;
  khuc.push({ tuJdn: tu, denJdn: Math.min(jdnCuoi, tu + doDai - 1) });
}
const tuViDem = { tong: 0, kiemNoiBo: { tong: 0, sai: 0 } };
for (const t of TRUONG) tuViDem[t] = { khac: 0, doMuiGio: 0, doThangNhuan: 0, conLai: 0 };
const mauTuVi = {};
let xong = 0;
await new Promise((xongHet, loi) => {
  let dangChay = 0;
  let ke = 0;
  const chayTiep = () => {
    if (ke >= khuc.length && dangChay === 0) return xongHet();
    while (dangChay < SO_LUONG && ke < khuc.length) {
      const k = khuc[ke++];
      dangChay++;
      const w = new Worker(new URL("./tu-vi-tho.mjs", import.meta.url), {
        workerData: { ...k, cacGio: CAC_GIO, soMauMoiLoai: 40 },
      });
      w.once("message", ({ dem, mau }) => {
        tuViDem.tong += dem.tong;
        tuViDem.kiemNoiBo.tong += dem.kiemNoiBo.tong;
        tuViDem.kiemNoiBo.sai += dem.kiemNoiBo.sai;
        for (const t of TRUONG) for (const k2 of Object.keys(dem[t])) tuViDem[t][k2] += dem[t][k2];
        for (const [loai, ds] of Object.entries(mau)) (mauTuVi[loai] ??= []).push(...ds);
        xong++;
        if (xong % SO_LUONG === 0 || xong === khuc.length) log(`Tử Vi: ${xong}/${khuc.length} khúc, ${tuViDem.tong} lá`);
      });
      w.once("error", loi);
      w.once("exit", () => {
        dangChay--;
        chayTiep();
      });
    }
  };
  chayTiep();
});
if (tuViDem.kiemNoiBo.sai) throw new Error("phép dựng rút gọn lệch lapLaSoTuVi");
const tiLe = (x) => Math.round((x / tuViDem.tong) * 1e6) / 1e4;
const tuVi_ = {
  soLa: tuViDem.tong,
  cacGio: CAC_GIO.map((g) => TEN_CHI[g]),
  gioiTinh: "Nam (male); fields compared do not depend on gender, see kiem.gioiTinh",
  iztroThamSo: { timeIndex: "0 (early Zi) .. 11 (Hai)", fixLeap: true, language: "zh-CN" },
  truong: Object.fromEntries(TRUONG.map((t) => [t, { ...tuViDem[t], phanTramKhac: tiLe(tuViDem[t].khac) }])),
  kiemNoiBo: tuViDem.kiemNoiBo,
};
log("Tử Vi, lá khác (cục, Mệnh hay chính tinh):", tuVi_.truong.laSo);

// ---------------------------------------------------------------- 5. ví dụ

const VI_DU = [
  ["1985-01-21", 5, "Tết 1985 is one month apart: at UTC+7 the leap month is the 2nd month of 1985, at UTC+8 it is the 10th month of 1984"],
  ["2030-02-03", 5, "Tết 2030: new moon at 16:07 UT, i.e. 23:07 in Vietnam on 2 Feb and 00:07 in China on 3 Feb"],
  ["2007-02-17", 6, "Tết 2007: new moon at 16:14 UT, i.e. 17 Feb in Vietnam and 18 Feb in China"],
  ["1968-01-29", 6, "Tết 1968: new moon at 16:29 UT, i.e. 29 Jan in Vietnam and 30 Jan in China"],
  ["1990-09-19", 5, "Control: both calendars agree"],
];
for (const loai of ["doThangNhuan", "conLai"]) {
  const m = (mauTuVi[loai] ?? []).sort((a, b) => (a.ngay < b.ngay ? -1 : 1))[0];
  if (m) VI_DU.push([m.ngay, m.gio, loai === "doThangNhuan" ? "Same calendar, different leap-month rule (iztro fixLeap)" : "Same time zone and leap rule, still different: UTC+8 edge case (new moon within minutes of Beijing midnight)"]);
}
const tenCuc = { 2: "Thủy Nhị Cục (水二局)", 3: "Mộc Tam Cục (木三局)", 4: "Kim Tứ Cục (金四局)", 5: "Thổ Ngũ Cục (土五局)", 6: "Hỏa Lục Cục (火六局)" };
const moTa = (x) => ({
  ngayAm: `${x.amLich.ngay}/${x.amLich.thang}${x.amLich.nhuan ? " (leap)" : ""}/${x.amLich.nam}`,
  canChiNam: x.canChiNam,
  cuc: tenCuc[x.cuc],
  menh: TEN_CHI[x.menh],
  tuViO: TEN_CHI[x.sao["Tử Vi"]],
});
const viDu = VI_DU.map(([ngay, gio, ghiChu]) => {
  const [y, m, d] = ngay.split("-").map(Number);
  const vn = laSoLoi(amLich, tuVi, d, m, y, gio, 7);
  const cn = laSoLoi(amLich, tuVi, d, m, y, gio, 8);
  const iz = laSoIztro(astro, ngay, gio, true);
  return {
    ngay,
    gio: TEN_CHI[gio],
    ghiChu,
    nhatNguyet: moTa(vn),
    iztro: moTa(iz),
    nhatNguyetLichTrungQuoc: moTa(cn),
    khac: soLaSo(vn, iz).filter((t) => t !== "laSo"),
  };
});

// ---------------------------------------------------------------- ghi

const ketQua = {
  moTa: "Nhat Nguyet vs iztro and lunar-javascript, every day 1900-01-01..2100-12-31. Generated by doi-chieu/chay.mjs.",
  sinhLuc: new Date().toISOString(),
  phienBan: {
    nhatNguyet: { commit: commitHienTai(), dongCo: amLich.PHIEN_BAN_DONG_CO },
    iztro: phienBan("iztro"),
    "lunar-javascript": phienBan("lunar-javascript"),
    "lunar-typescript (used by iztro)": phienBan("lunar-typescript"),
    "lunar-lite (used by iztro)": phienBan("lunar-lite"),
    node: process.version,
  },
  phamVi: { tu: `${NAM_DAU}-01-01`, den: `${NAM_CUOI}-12-31` },
  lichAm,
  tet,
  thangNhuan,
  tietKhi,
  tuVi: tuVi_,
  viDu,
  kiem: { ghiNhoIztro: kiemGhiNho, gioiTinh: kiemGioiTinh, dungRutGonKhopLapLaSoTuVi: tuViDem.kiemNoiBo },
  thoiGianGiay: Math.round((performance.now() - batDau) / 1000),
};
writeFileSync(path.join(THU_MUC, "ket-qua.json"), JSON.stringify(ketQua, null, 2) + "\n");
writeFileSync(path.join(THU_MUC, "khac-ngay-am.csv"), dongCsv.join("\n") + "\n");
log("Đã ghi doi-chieu/ket-qua.json và doi-chieu/khac-ngay-am.csv");
