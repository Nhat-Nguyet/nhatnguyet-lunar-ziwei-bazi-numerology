// Lệnh festivals --ics in đúng tệp của festivalsIcs (main() thêm "\n" cuối).
import { test } from "node:test";
import assert from "node:assert/strict";
import { festivalsIcs } from "@nhatnguyet/le-hoi";
import { run } from "../src/cli.ts";

test("cli: festivals 2027 --ics", () => {
  const env = { color: false, width: 88 };
  assert.equal(run(["festivals", "2027", "--ics"], env) + "\n", festivalsIcs(2027));
  assert.equal(run(["festivals", "2027", "--ics", "--lang", "zh"], env) + "\n", festivalsIcs(2027, { lang: "zh" }));
});
