// Nhập gói ở nơi không có DOM (Node) không được ném lỗi.
import { test } from "node:test";
import assert from "node:assert/strict";

test("importing in Node does not throw and has the five elements", async () => {
  const goi = await import("../src/index.ts");
  assert.deepEqual(Object.keys(goi.THANH_PHAN).sort(), ["nn-dem-nguoc-tet", "nn-doi-lich", "nn-gio-hoang-dao", "nn-lich-hom-nay", "nn-lich-thang"]);
  assert.equal(typeof goi.dangKy, "function");
});
