// Phép đo ba thứ tiếng của KẾT QUẢ (Tử Vi, Bát Tự), dùng trong test.
//
// Cùng luật với TestKetQuaTuViBatTuDuBaThuTieng của lõi Go
// (coreengine/tuvi_bangonngu_test.go) và python/tests/ba_ngon_ngu.py:
//   - mọi trường tên (chuỗi, hay mảng chuỗi) mang `<khoá>Zh` có chữ Hán và
//     không còn chữ Latin có dấu;
//   - mang `<khoá>En` khác rỗng, trừ tên mà bản Anh giữ nguyên Hán Việt
//     (can, chi, can chi, Tứ Hóa, tên cách cục);
//   - bỏ qua khoá không phải tên: mã máy (loai, ma, nhom, voi*), tiếng vọng
//     đầu vào (hoTen, gioiTinh), chú văn đã là chữ Hán (chuVan).
// Trường rỗng (đại vận chưa tới, sao không có trên lá số) không tính.

/** Khoá không phải tên người đọc. */
export const KHOA_KHONG_PHAI_TEN: ReadonlySet<string> = new Set([
  "hoTen", "gioiTinh", "loai", "ma", "nhom", "voiLuuNien", "voiTieuVan", "voiDaiVan", "chuVan",
  "dienGiai", "caveat", "cachTinh", "quyUoc", "ghiChuGioTy", "phepTinh",
]);

/** Khoá mà bản tiếng Anh giữ tên Hán Việt, nên chỉ đòi bản chữ Hán. */
export const KHOA_GIU_TEN_GOC: ReadonlySet<string> = new Set([
  "can", "chi", "canChi", "label", "canChiNam", "gioSinh", "menhCungChi", "chiCung",
  "luuNienChi", "tieuVanChi", "luuDauQuanChi", "tuHoa", "hoa", "nhatChu", "chiDich",
]);

/** Đường (mảng ghi []) mà bản tiếng Anh giữ tên Hán Việt. */
export const DUONG_GIU_TEN_GOC: ReadonlySet<string> = new Set([".cachCuc[].ten"]);

const LATIN_CO_DAU = /[À-ɏḀ-ỿ]/;
const CHU_HAN = /[㐀-鿿]/;

/** Một chỗ thiếu: đường, chữ Việt, thiếu gì. */
export interface ChoThieu {
  duong: string;
  vi: string;
  thieu: "en" | "zh";
}

/** Đếm theo đường. */
export interface DemBaNgonNgu {
  tong: number;
  thieu: ChoThieu[];
}

function layPhan(v: unknown, i: number): string {
  if (typeof v === "string") return v;
  if (Array.isArray(v) && typeof v[i] === "string") return v[i] as string;
  return "";
}

/** Quét một kết quả, cộng vào `dem`. */
export function doBaNgonNgu(v: unknown, dem: DemBaNgonNgu, duong = ""): void {
  if (Array.isArray(v)) {
    for (const x of v) doBaNgonNgu(x, dem, duong + "[]");
    return;
  }
  if (v === null || typeof v !== "object") return;
  const o = v as Record<string, unknown>;
  for (const [k, x] of Object.entries(o)) {
    const d = duong + "." + k;
    if (k.endsWith("En") || k.endsWith("Zh") || k.endsWith("Han") || KHOA_KHONG_PHAI_TEN.has(k)) continue;
    let vi: string[] | null = null;
    if (typeof x === "string") vi = [x];
    else if (Array.isArray(x) && x.every((p) => typeof p === "string")) vi = x as string[];
    if (vi === null) {
      doBaNgonNgu(x, dem, d);
      continue;
    }
    const canEn = !KHOA_GIU_TEN_GOC.has(k) && !DUONG_GIU_TEN_GOC.has(d);
    vi.forEach((s, i) => {
      if (s === "") return;
      dem.tong++;
      const zh = layPhan(o[k + "Zh"], i);
      if (!CHU_HAN.test(zh) || LATIN_CO_DAU.test(zh)) dem.thieu.push({ duong: d, vi: s, thieu: "zh" });
      if (canEn && layPhan(o[k + "En"], i) === "") dem.thieu.push({ duong: d, vi: s, thieu: "en" });
    });
  }
}

/** Tóm tắt các chỗ thiếu theo đường, để in khi test đỏ. */
export function tomTatThieu(dem: DemBaNgonNgu, toiDa = 20): string {
  const theoDuong = new Map<string, { n: number; vd: string }>();
  for (const t of dem.thieu) {
    const khoa = t.duong + " (thiếu " + t.thieu + ")";
    const cu = theoDuong.get(khoa);
    if (cu) cu.n++;
    else theoDuong.set(khoa, { n: 1, vd: t.vi });
  }
  const dong = [...theoDuong.entries()].slice(0, toiDa).map(([k, x]) => `${k}: ${x.n} chỗ, ví dụ "${x.vd}"`);
  return `${dem.thieu.length} chỗ thiếu trên ${dem.tong} tên\n` + dong.join("\n");
}
