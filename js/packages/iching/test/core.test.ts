import { test } from "node:test";
import assert from "node:assert/strict";
import { baoCao, docCaKiem, kiemCa } from "../../../kiem/so-sanh.ts";
import { gieoTho, maiHoaTho, najiaTho, quaiTho, queNgayTho, queTho } from "../src/core.ts";

const tep = docCaKiem("iching");

/** Phép gọi đứng sau mỗi `ra` của ca-kiem/iching.json. */
export function tinh(vao: Record<string, unknown>): unknown {
  const n = vao.n as number;
  const g = vao.lines as number[];
  const [dd, mm, yyyy] = [vao.dd as number, vao.mm as number, vao.yyyy as number];
  switch (vao.op) {
    case "trigram": return quaiTho(n);
    case "hexagram": return queTho(n);
    case "lines": return gieoTho(g);
    case "numbers": return maiHoaTho(vao.a as number, vao.b as number, vao.c as number);
    case "najia": return najiaTho(g, dd, mm, yyyy);
    case "daily": return queNgayTho(dd, mm, yyyy);
  }
  throw new Error("unknown op " + String(vao.op));
}

test("iching: every Go vector", () => {
  const kq = kiemCa(tep, tinh);
  assert.equal(kq.tong, tep.soCa);
  assert.equal(kq.soLech, 0, baoCao("iching", kq));
});

test("iching: the comparison catches a wrong answer", () => {
  const kq = kiemCa(tep, (vao) => {
    const r = tinh(vao) as Record<string, unknown>;
    return vao.op === "hexagram" ? { ...r, world: (r.world as number) + 1 } : r;
  });
  assert.equal(kq.soLech, 64);
});

import { readFileSync } from "node:fs";
import { castCoins, castFromNumbers, dailyHexagram, hexagram, najia, trigram } from "../src/index.ts";
import { CLASSICAL_TEXT } from "../src/text-data.ts";

test("iching: the English API carries the core object in raw", () => {
  const p2 = (n: number) => String(n).padStart(2, "0");
  const kq = kiemCa(tep, (v) => {
    const date = `${v.yyyy}-${p2(v.mm as number)}-${p2(v.dd as number)}`;
    switch (v.op) {
      case "trigram": return trigram(v.n as number).raw;
      case "hexagram": return hexagram(v.n as number).raw;
      case "lines": return castCoins({ lines: v.lines as number[] }).raw;
      case "numbers": return castFromNumbers(v.a as number, v.b as number, v.c as number).raw;
      case "najia": return najia(v.lines as number[], { date }).raw;
      case "daily": return dailyHexagram(date).raw;
    }
    throw new Error("unknown op");
  });
  assert.equal(kq.soLech, 0, baoCao("iching (English API)", kq));
});

test("iching: the TypeScript and Python copies of the classical text are the same", () => {
  const py = JSON.parse(readFileSync(new URL("../../../../python/nhatnguyet/du_lieu/iching-text.json", import.meta.url), "utf8"));
  assert.deepEqual(py.hexagrams, CLASSICAL_TEXT);
});
