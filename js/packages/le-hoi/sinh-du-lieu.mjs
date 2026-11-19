// Sinh src/du-lieu.ts từ bản chép bộ dữ liệu mở le-hoi-viet-nam
// (thu-vien-mo/du-lieu/le-hoi-viet-nam.json, CC BY 4.0). Không sửa tay
// src/du-lieu.ts; bộ dữ liệu có bản mới thì chép lại tệp JSON rồi chạy:
//   node sinh-du-lieu.mjs
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const goc = dirname(fileURLToPath(import.meta.url));
const duLieu = join(goc, "..", "..", "..", "du-lieu");
const ds = JSON.parse(readFileSync(join(duLieu, "le-hoi-viet-nam.json"), "utf8"));
const nguon = JSON.parse(readFileSync(join(duLieu, "nguon.json"), "utf8"));
// 34 tỉnh, thành hiện hành (tên ba thứ tiếng) để đọc cột tinh.
const tinh = JSON.parse(readFileSync(join(duLieu, "tinh-2025.json"), "utf8"));
const out = `// TỆP SINH bởi sinh-du-lieu.mjs, không sửa tay.
// Bộ ${nguon.bo} ${nguon.phienBan}, mã phát hành ${nguon.maPhatHanh}, giấy phép ${nguon.giayPhep}.
// Nguồn: ${nguon.nguon}
import type { LeHoi, Province } from "./kieu.ts";

export const PHIEN_BAN_DU_LIEU = ${JSON.stringify(nguon.phienBan)};
export const MA_PHAT_HANH = ${JSON.stringify(nguon.maPhatHanh)};
/** Date the dataset was last updated (YYYY-MM-DD). */
export const DATA_UPDATED = ${JSON.stringify(nguon.capNhat)};

/** The 34 current provinces and cities (${tinh.canCu}). */
export const PROVINCES: readonly Province[] = ${JSON.stringify(tinh.tinh.map((t) => ({ code: t.ma, vi: t.vi, en: t.en, zh: t.zh })))};

export const DANH_SACH_LE_HOI: readonly LeHoi[] = ${JSON.stringify(ds)};
`;
writeFileSync(join(goc, "src", "du-lieu.ts"), out);
console.log(`đã ghi src/du-lieu.ts: ${ds.length} lễ, ${tinh.tinh.length} tỉnh`);
