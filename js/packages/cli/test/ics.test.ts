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

test("cli: a reader that closes the pipe early (| head) ends the command quietly with code 0", async () => {
  // Đầu đọc của ống đóng ngay khi tiến trình con vừa chạy, trước lần ghi duy
  // nhất của nó, nên lần ghi chắc chắn gặp EPIPE.
  const { spawn } = await import("node:child_process");
  const { fileURLToPath } = await import("node:url");
  const cli = fileURLToPath(new URL("../src/cli.ts", import.meta.url));
  const con = spawn(process.execPath, ["--conditions=source", cli, "festivals", "2027", "--ics"], { stdio: ["ignore", "pipe", "pipe"] });
  con.stdout.destroy();
  let loi = "";
  con.stderr.on("data", (d: unknown) => (loi += String(d)));
  const ma = await new Promise<number | null>((xong) => con.on("close", (m: number | null) => xong(m)));
  assert.equal(loi, "");
  assert.equal(ma, 0);
});
