// Sinh src/text-data.ts và python/nhatnguyet/du_lieu/iching-text.json từ bộ
// song ngữ du-lieu/classical-parallel/segments.jsonl (phần chia đoạn CC BY 4.0
// của Nhật Nguyệt; văn bản thuộc phạm vi công cộng): lời quẻ và lời hào của 64
// quẻ, nguyên văn Chu Dịch (sc-0034) và bản dịch Anh của James Legge 1882
// (sc-0029), chữ OCR giữ nguyên như bộ dữ liệu. KHÔNG có lời luận nào của site.
// Không sửa tay hai tệp sinh; bộ dữ liệu có bản mới thì chạy lại:
//   node sinh-van-ban.mjs
import { createHash } from "node:crypto";
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const goc = dirname(fileURLToPath(import.meta.url));
const tepNguon = join(goc, "..", "..", "..", "du-lieu", "classical-parallel", "segments.jsonl");
const tho = readFileSync(tepNguon, "utf8");
const sha = createHash("sha256").update(tho).digest("hex");

// que[n] = [lời quẻ Hán, lời quẻ Anh, [[lời hào Hán, Anh], ...]]; thiếu bản Anh là null.
const que = Array.from({ length: 65 }, () => [null, null, []]);
for (const dong of tho.split("\n")) {
  if (!dong.trim()) continue;
  const r = JSON.parse(dong);
  if (r.lang_pair !== "zh-en") continue;
  const q = que[r.hexagram];
  if (r.section === "judgment") {
    q[0] = r.original;
    q[1] = r.translation;
  } else if (r.section === "line_statement") {
    q[2][r.line - 1] = [r.original, r.translation];
  }
}
let soHao = 0;
for (let n = 1; n <= 64; n++) {
  const q = que[n];
  const soDung = n <= 2 ? 7 : 6;
  if (!q[0]) throw new Error(`quẻ ${n} thiếu lời quẻ`);
  if (q[2].length !== soDung || q[2].some((x) => !x)) throw new Error(`quẻ ${n} thiếu lời hào`);
  soHao += q[2].length;
}
const duLieu = {
  source: "du-lieu/classical-parallel/segments.jsonl",
  sha256: sha,
  zh: "Zhou Yi (周易), received text, public domain",
  en: "James Legge (1882) translation, public domain, OCR text as printed",
  hexagrams: que.slice(1),
};

const ts = `// TỆP SINH bởi sinh-van-ban.mjs, không sửa tay.
// Nguồn: ${duLieu.source} (sha256 ${sha}).
// Văn bản thuộc phạm vi công cộng: nguyên văn Chu Dịch và bản dịch của James
// Legge (1882), chữ OCR giữ nguyên. Chia đoạn: Nhat Nguyet (nhatnguyet.org), CC BY 4.0.

/** Per hexagram (index 0 = hexagram 1): [judgment zh, judgment en, [[line zh, line en], ...]]. */
export const CLASSICAL_TEXT: readonly (readonly [string, string | null, readonly (readonly [string, string | null])[]])[] = ${JSON.stringify(duLieu.hexagrams)};

/** Where the text comes from. */
export const CLASSICAL_SOURCE = ${JSON.stringify({ zh: duLieu.zh, en: duLieu.en, dataset: "nhatnguyet/classical-parallel", sha256: sha })} as const;
`;
writeFileSync(join(goc, "src", "text-data.ts"), ts);
const tepPy = join(goc, "..", "..", "..", "python", "nhatnguyet", "du_lieu", "iching-text.json");
writeFileSync(tepPy, JSON.stringify(duLieu) + "\n");
console.log(`đã ghi src/text-data.ts và du_lieu/iching-text.json: 64 lời quẻ, ${soHao} lời hào`);
