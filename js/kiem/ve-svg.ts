// Công cụ kiểm hình SVG của ba gói (tu-vi, bat-tu, than-so-hoc).
//
// Băm SHA-256 của từng hình mẫu ghim ở python/tests/ve_svg_<môn>.json, tệp
// test Python đọc cùng tệp ấy: hai bản cùng khớp một bộ băm nghĩa là ra
// ĐÚNG TỪNG BYTE như nhau. Đổi hình có chủ đích thì sinh lại bộ băm:
//
//   CAP_NHAT_VE_SVG=1 node --conditions=source --test packages/*/test/ve-svg.test.ts

import { createHash } from "node:crypto";
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const GOC = join(dirname(fileURLToPath(import.meta.url)), "../..");

export interface CaVe {
  vao: Record<string, unknown>;
  lang: "vi" | "en" | "zh";
  /** Chỉ ở ca tiếng Anh thêm: cách viết can chi (vắng là mặc định pinyin). */
  terms?: "pinyin" | "han" | "vi";
  theme: "light" | "dark";
  width?: number;
  sha256?: string;
}

export function bam(s: string): string {
  return createHash("sha256").update(s, "utf8").digest("hex");
}

function tepBam(mon: string): string {
  return join(GOC, "python/tests", `ve_svg_${mon}.json`);
}

/**
 * Đọc bộ ca; khi CAP_NHAT_VE_SVG=1 thì ghi lại băm theo hàm `ve`. `coTerms`:
 * thêm hai ca tiếng Anh (nền sáng) với terms "han" và "vi".
 */
export function docHoacGhiBam(mon: string, cacVao: Record<string, unknown>[], ve: (ca: CaVe) => string, coTerms = false): CaVe[] {
  if (process.env.CAP_NHAT_VE_SVG === "1") {
    const ca: CaVe[] = [];
    for (const vao of cacVao) {
      for (const lang of ["vi", "en", "zh"] as const) {
        for (const theme of ["light", "dark"] as const) {
          const c: CaVe = { vao, lang, theme };
          if (lang === "en" && theme === "dark") c.width = 390;
          c.sha256 = bam(ve(c));
          ca.push(c);
        }
      }
      if (coTerms) {
        for (const terms of ["han", "vi"] as const) {
          const c: CaVe = { vao, lang: "en", terms, theme: "light" };
          c.sha256 = bam(ve(c));
          ca.push(c);
        }
      }
    }
    writeFileSync(tepBam(mon), JSON.stringify({ mon, ghiChu: "Băm SHA-256 của hình SVG do bản TypeScript vẽ; bản Python phải ra cùng băm.", ca }, null, 1) + "\n");
    return ca;
  }
  return JSON.parse(readFileSync(tepBam(mon), "utf8")).ca as CaVe[];
}

/**
 * Kiểm SVG hợp lệ ở mức cú pháp XML: thẻ đóng mở khớp, thuộc tính có ngoặc
 * kép, không ký tự & trần. (Bản Python còn đọc lại bằng bộ phân tích XML
 * thật trên cùng các byte, nhờ bộ băm chung.)
 */
export function loiXml(svg: string): string | null {
  const ngan: string[] = [];
  const reThe = /<(\/?)([a-zA-Z][\w:-]*)((?:\s+[\w:-]+="[^"<]*")*)\s*(\/?)>/y;
  let i = 0;
  while (i < svg.length) {
    const lt = svg.indexOf("<", i);
    const doan = svg.slice(i, lt < 0 ? svg.length : lt);
    if (/&(?!(amp|lt|gt|quot|#39);)/.test(doan)) return `ký tự & trần ở ${i}`;
    if (lt < 0) break;
    reThe.lastIndex = lt;
    const m = reThe.exec(svg);
    if (!m) return `thẻ hỏng ở ${lt}: ${svg.slice(lt, lt + 60)}`;
    if (/&(?!(amp|lt|gt|quot|#39);)/.test(m[3])) return `ký tự & trần trong thuộc tính ở ${lt}`;
    if (m[1]) {
      if (ngan.pop() !== m[2]) return `thẻ đóng </${m[2]}> không khớp ở ${lt}`;
    } else if (!m[4]) {
      ngan.push(m[2]);
    }
    i = reThe.lastIndex;
  }
  if (ngan.length) return `thẻ chưa đóng: ${ngan.join(", ")}`;
  if (!svg.startsWith("<svg ") || !svg.endsWith("</svg>")) return "không mở bằng <svg> hay không đóng bằng </svg>";
  return null;
}

/** Chữ trong các thẻ <text> (đã giải thoát), để soát nội dung. */
export function chuTrongHinh(svg: string): string[] {
  const ra: string[] = [];
  for (const m of svg.matchAll(/<text[^>]*>(.*?)<\/text>/g)) {
    ra.push(m[1].replace(/<[^>]+>/g, " ").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&amp;/g, "&"));
  }
  return ra;
}
