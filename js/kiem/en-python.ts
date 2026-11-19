// Chạy lớp API tiếng Anh của bản Python (nhatnguyet.en) và lệnh dòng lệnh
// Python trên cùng bộ việc, để test TypeScript so kết quả. Máy không có
// python3 (3.9 trở lên) thì trả null và test bỏ qua.

import { execFileSync } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const THU_MUC_PY = join(dirname(fileURLToPath(import.meta.url)), "../../python");

/** Một việc: tên hàm (hay "cli") và tham số. */
export interface ViecPython {
  ham: "zi_wei" | "bazi" | "to_lunar" | "festivals" | "auspicious_hours" | "cli";
  thamSo: Record<string, unknown>;
}

const MA_PY = String.raw`
import json, sys
from nhatnguyet import en
from nhatnguyet.__main__ import run

def bo_raw(x):
    if isinstance(x, dict):
        return {k: bo_raw(v) for k, v in x.items() if k != "raw"}
    if isinstance(x, list):
        return [bo_raw(v) for v in x]
    return x

ra = []
for viec in json.load(sys.stdin):
    a = viec["thamSo"]
    h = viec["ham"]
    if h == "zi_wei":
        c = en.cast_zi_wei(a["date"], a["gender"], hour_branch_index=a["hourBranch"], lang=a.get("lang", "en"),
                           view_year=a["viewYear"], terms=a.get("terms"), name=a.get("name", ""), schools=a.get("schools"))
        r = {"chart": c, "decades": en.decade_luck(c), "year": en.yearly_luck(c), "stars": en.yearly_stars(c),
             "patterns": en.find_patterns(c)}
    elif h == "bazi":
        c = en.cast_bazi(a["date"], a["gender"], time=a.get("time"), lang=a.get("lang", "en"), terms=a.get("terms"),
                         schools=a.get("schools"))
        r = {"chart": c, "minor": en.minor_luck(c, a["year"])}
    elif h == "to_lunar":
        r = en.to_lunar(a["date"], country=a.get("country"), lang=a.get("lang", "en"), terms=a.get("terms"))
    elif h == "festivals":
        r = en.festivals(a["year"], lang=a.get("lang", "en"))
    elif h == "auspicious_hours":
        r = en.auspicious_hours(a["date"], lang=a.get("lang", "en"), terms=a.get("terms"))
    else:
        r = run(a["argv"], color=False, width=a.get("width", 88))
    ra.append(bo_raw(r))
sys.stdout.write(json.dumps(ra, ensure_ascii=False))
`;

/** Kết quả Python của từng việc (đã bỏ khoá raw), hoặc null khi không có python3. */
export function chayPython(viec: ViecPython[]): unknown[] | null {
  try {
    execFileSync("python3", ["-c", "import sys; assert sys.version_info >= (3, 9)"], { stdio: "ignore" });
  } catch {
    return null;
  }
  const out = execFileSync("python3", ["-c", MA_PY], {
    input: JSON.stringify(viec),
    cwd: THU_MUC_PY,
    env: { ...process.env, PYTHONPATH: THU_MUC_PY, PYTHONIOENCODING: "utf-8" },
    maxBuffer: 256 * 1024 * 1024,
  });
  return JSON.parse(out.toString("utf8")) as unknown[];
}

/** Bỏ khoá raw (và hàm toSvg không liệt kê) qua một vòng JSON. */
export function boRaw(x: unknown): unknown {
  return JSON.parse(JSON.stringify(x, (k, v) => (k === "raw" ? undefined : v)));
}
