// Chạy bản Python của chart_to_text trên cùng bộ ca để test TypeScript so ĐÚNG
// TỪNG BYTE. Máy không có python3 (3.9 trở lên) thì trả null và test bỏ qua.

import { execFileSync } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const THU_MUC_PY = join(dirname(fileURLToPath(import.meta.url)), "../../python");

/** Một ca: môn, cách gọi (lớp tiếng Anh hay hàm thô), đầu vào và tuỳ chọn in. */
export interface CaVanBan {
  mon: "tu-vi" | "bat-tu" | "than-so-hoc";
  cach: "en" | "tho";
  vao: Record<string, unknown>;
  lang?: "vi" | "en" | "zh";
  detail?: "summary" | "full";
  year?: number;
}

const MA_PY = String.raw`
import json, sys
from nhatnguyet import bat_tu, en, than_so_hoc, tu_vi
from nhatnguyet.van_ban import chart_to_text
ra = []
for ca in json.load(sys.stdin):
    v = ca["vao"]
    if ca["mon"] == "tu-vi":
        c = en.cast_zi_wei(date=v["date"], gender=v["gender"], time=v.get("time"), hour_branch_index=v.get("hourBranch"),
                           name=v.get("name", ""), lang=v.get("lang", "en")) if ca["cach"] == "en" else \
            tu_vi.lap_la_so_tu_vi(v["hoTen"], v["gioiTinh"], v["dd"], v["mm"], v["yyyy"], v["gio"])
    elif ca["mon"] == "bat-tu":
        c = en.cast_bazi(date=v["date"], gender=v["gender"], time=v.get("time"), lang=v.get("lang", "en")) \
            if ca["cach"] == "en" else bat_tu.lap_la_so_bat_tu(v["dd"], v["mm"], v["yyyy"], v.get("gio"), v.get("phut", 0), v["gioiTinh"])
    else:
        c = en.numerology(v["name"], v["birthDate"], today=v["today"], lang=v.get("lang", "en")) if ca["cach"] == "en" else \
            than_so_hoc.tinh_ho_so_than_so_hoc_sau(v["hoTen"], v["dd"], v["mm"], v["yyyy"], v["namXem"], v["thangXem"], v["ngayXem"])
    ra.append(chart_to_text(c, lang=ca.get("lang"), detail=ca.get("detail"), year=ca.get("year")))
sys.stdout.write(json.dumps(ra, ensure_ascii=False))
`;

/** Văn bản Python của từng ca, hoặc null khi máy không chạy được python3. */
export function vanBanPython(cacCa: CaVanBan[]): string[] | null {
  try {
    execFileSync("python3", ["-c", "import sys; assert sys.version_info >= (3, 9)"], { stdio: "ignore" });
  } catch {
    return null;
  }
  const out = execFileSync("python3", ["-c", MA_PY], {
    input: JSON.stringify(cacCa),
    cwd: THU_MUC_PY,
    env: { ...process.env, PYTHONPATH: THU_MUC_PY, PYTHONIOENCODING: "utf-8" },
    maxBuffer: 64 * 1024 * 1024,
  });
  return JSON.parse(out.toString("utf8")) as string[];
}
