// Nạp ba thư viện cho phép đối chiếu: Nhat Nguyet (mã nguồn TypeScript trong
// repo này), iztro và lunar-javascript (bản ghim trong package.json).
//
// Nhat Nguyet được nạp thẳng từ js/packages/*/src (Node 22.18 trở lên chạy
// thẳng tệp .ts), nên không cần dựng gói hay cài workspace js/. Tên gói
// "@nhatnguyet/am-lich" mà tu-vi nhập được chuyển sang mã nguồn bằng một móc
// phân giải.

import { createRequire, registerHooks } from "node:module";
import { pathToFileURL } from "node:url";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { readFileSync } from "node:fs";

const THU_MUC = path.dirname(fileURLToPath(import.meta.url));
const GOC_JS = path.resolve(THU_MUC, "../js/packages");
const NGUON = {
  "@nhatnguyet/am-lich": pathToFileURL(path.join(GOC_JS, "am-lich/src/index.ts")).href,
  "@nhatnguyet/tu-vi": pathToFileURL(path.join(GOC_JS, "tu-vi/src/index.ts")).href,
};

registerHooks({
  resolve(specifier, context, nextResolve) {
    const url = NGUON[specifier];
    if (url) return { url, shortCircuit: true };
    return nextResolve(specifier, context);
  },
});

const require = createRequire(import.meta.url);

// iztro tra ngược bản dịch (kot) và gọi i18next.t ở mỗi bước, chiếm khoảng
// 95% thời gian (đo bằng --cpu-prof: khoảng 200 ms một lá). Hai hàm ấy thuần
// (kho bản dịch không đổi khi chạy), nên ghi nhớ kết quả của chúng không đổi
// đầu ra mà chỉ làm nhanh khoảng 25 lần. chay.mjs kiểm điều này trên một mẫu
// lá dựng cả hai cách (khoá kiemGhiNho trong ket-qua.json).
let ghiNhoDaBat = false;
export function batGhiNhoIztro() {
  if (ghiNhoDaBat) return;
  ghiNhoDaBat = true;
  const i18n = require("iztro/lib/i18n");
  const gocK = i18n.kot;
  const demK = new Map();
  i18n.kot = (v, k) => {
    const khoa = v + "\u0000" + (k ?? "");
    let r = demK.get(khoa);
    if (r === undefined) {
      r = gocK(v, k);
      demK.set(khoa, r);
    }
    return r;
  };
  const gocT = i18n.t;
  const demT = new Map();
  i18n.t = (s, o) => {
    if (o !== undefined) return gocT(s, o);
    const khoa = i18n.getLanguage() + "\u0000" + s;
    let r = demT.get(khoa);
    if (r === undefined) {
      r = gocT(s);
      demT.set(khoa, r);
    }
    return r;
  };
}

export async function napNhatNguyet() {
  const amLich = await import("@nhatnguyet/am-lich");
  const tuVi = await import("@nhatnguyet/tu-vi");
  return { amLich, tuVi };
}

export function napIztro() {
  return require("iztro");
}

export function napLunarJavascript() {
  return require("lunar-javascript");
}

/** lunar-typescript là lõi lịch của iztro (qua lunar-lite), nạp đúng bản iztro dùng. */
export function napLunarTypescript() {
  const r = createRequire(require.resolve("lunar-lite"));
  return r("lunar-typescript");
}

/** Phiên bản đã cài (đọc thẳng package.json; npm cài phẳng vào node_modules). */
export function phienBan(ten) {
  return JSON.parse(readFileSync(path.join(THU_MUC, "node_modules", ten, "package.json"), "utf8")).version;
}

export const DUONG_DAN = { THU_MUC, GOC_JS };
