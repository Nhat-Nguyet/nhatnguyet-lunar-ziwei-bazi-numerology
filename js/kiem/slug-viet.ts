// Dò khoá và giá trị tiếng Việt lọt vào đầu ra của lớp API tiếng Anh (luật của
// người vận hành 19/11/2026: API công khai của thư viện bằng tiếng Anh). Bỏ qua
// `raw` (đối tượng gốc khoá tiếng Việt, có chủ đích) và trường tên `...Vi`.
//
// Finds Vietnamese keys or slug values in the English API output.

/** Âm tiết chỉ có ở mã tiếng Việt bỏ dấu (sat-tinh, luu-loc-ton...), không ở mã tiếng Anh. */
const AM_TIET_VIET = new Set([
  "luu", "sat", "tinh", "cat", "tap", "dieu", "thai", "tue", "loc", "ton", "kinh", "duong", "thien", "chinh", "phu",
  "truong", "sinh", "bac", "sy", "dinh", "quy", "tien", "cung", "xung", "chieu", "hop", "nhom", "loai", "sao",
  "thang", "ngay", "gio", "tuoi", "nam", "nu", "am", "vi", "tri", "hoa", "khoa", "ky", "quyen", "menh", "than", "cuc",
  "tru", "chi", "tiet", "khi", "le", "tet", "nguong", "khac", "phai", "nhuan",
]);

const DAU_VIET = /[ăâđêôơưàáạảãằắặẳẵầấậẩẫèéẹẻẽềếệểễìíịỉĩòóọỏõồốộổỗờớợởỡùúụủũừứựửữỳýỵỷỹ]/i;

function amTiet(s: string): string[] {
  return s.replace(/([a-z])([A-Z])/g, "$1 $2").toLowerCase().split(/[^a-z0-9]+/).filter(Boolean);
}

/** Mọi chỗ lọt: "đường: khoá" hay "đường = giá trị". */
export function slugViet(x: unknown, duong = "$", ra: string[] = []): string[] {
  if (Array.isArray(x)) {
    x.forEach((v, i) => slugViet(v, `${duong}[${i}]`, ra));
  } else if (x && typeof x === "object") {
    for (const [k, v] of Object.entries(x)) {
      if (k === "raw") continue;
      if (/Vi$/.test(k)) continue;
      if (DAU_VIET.test(k) || amTiet(k).some((t) => AM_TIET_VIET.has(t))) ra.push(`${duong}: khoá ${k}`);
      slugViet(v, `${duong}.${k}`, ra);
    }
  } else if (typeof x === "string" && /^[a-z0-9]+(-[a-z0-9]+)+$/.test(x) && amTiet(x).some((t) => AM_TIET_VIET.has(t))) {
    ra.push(`${duong} = ${x}`);
  }
  return ra;
}
