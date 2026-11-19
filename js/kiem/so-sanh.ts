// Tiện ích so ca kiểm dùng chung cho mọi gói TypeScript của thư viện mở.
//
// Ca kiểm ở thu-vien-mo/ca-kiem/<môn>.json do lõi tính Go sinh ra (xem
// QUY-UOC.md). Bản chuyển ngữ phải ra đúng `ra` của mọi ca, sau khi bỏ các
// khoá trong `khoaBo` ở mọi tầng của CẢ HAI bên. Thứ tự khoá không tính, mảng
// so theo thứ tự, số thực lệch tối đa 1e-9.
//
// Chỉ dùng trong test (chạy bằng Node), nên được phép nhập node:fs.

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

/** Sai số tuyệt đối cho phép khi so hai số thực. */
export const SAI_SO = 1e-9;

export interface CaKiem {
  vao: Record<string, unknown>;
  ra: unknown;
}

export interface TepCaKiem {
  mon: string;
  moTa: string;
  phienBanDongCo: string;
  khoaBo: string[];
  soCa: number;
  ca: CaKiem[];
}

const thuMucCaKiem = join(dirname(fileURLToPath(import.meta.url)), "..", "..", "ca-kiem");

/** Đọc tệp ca kiểm của một môn, ví dụ "am-lich". */
export function docCaKiem(mon: string): TepCaKiem {
  const duong = join(thuMucCaKiem, mon + ".json");
  return JSON.parse(readFileSync(duong, "utf8")) as TepCaKiem;
}

/**
 * Đưa giá trị về cây JSON thuần (bỏ khoá mang undefined, như encoding/json
 * của Go bỏ trường omitempty), rồi bỏ các khoá trong `khoaBo` ở mọi tầng.
 */
export function chuanHoa(v: unknown, khoaBo: ReadonlySet<string>): unknown {
  const phang = v === undefined ? null : JSON.parse(JSON.stringify(v));
  const di = (x: unknown): unknown => {
    if (Array.isArray(x)) return x.map(di);
    if (x !== null && typeof x === "object") {
      const ra: Record<string, unknown> = {};
      for (const [k, gt] of Object.entries(x as Record<string, unknown>)) {
        if (khoaBo.has(k)) continue;
        ra[k] = di(gt);
      }
      return ra;
    }
    return x;
  };
  return di(phang);
}

function kieu(x: unknown): string {
  if (x === null) return "null";
  if (Array.isArray(x)) return "mảng";
  return typeof x;
}

function tom(x: unknown): string {
  const s = JSON.stringify(x);
  return s === undefined ? String(x) : s.length > 120 ? s.slice(0, 117) + "..." : s;
}

/**
 * So sâu hai cây JSON. Trả null khi khớp, không thì trả mô tả chỗ lệch đầu
 * tiên kèm đường dẫn khoá (ví dụ `ra.am.day: mong 12, nhận 13`).
 */
export function soSanhSau(mong: unknown, nhan: unknown, duong = "ra"): string | null {
  if (typeof mong === "number" && typeof nhan === "number") {
    if (mong === nhan || Math.abs(mong - nhan) <= SAI_SO) return null;
    return `${duong}: mong ${mong}, nhận ${nhan}`;
  }
  if (kieu(mong) !== kieu(nhan)) {
    return `${duong}: mong kiểu ${kieu(mong)} ${tom(mong)}, nhận kiểu ${kieu(nhan)} ${tom(nhan)}`;
  }
  if (Array.isArray(mong)) {
    const b = nhan as unknown[];
    if (mong.length !== b.length) {
      return `${duong}: mong mảng ${mong.length} phần tử, nhận ${b.length}`;
    }
    for (let i = 0; i < mong.length; i++) {
      const lech = soSanhSau(mong[i], b[i], `${duong}[${i}]`);
      if (lech) return lech;
    }
    return null;
  }
  if (mong !== null && typeof mong === "object") {
    const a = mong as Record<string, unknown>;
    const b = nhan as Record<string, unknown>;
    const ka = Object.keys(a).sort();
    const kb = Object.keys(b).sort();
    for (const k of ka) {
      if (!(k in b)) return `${duong}.${k}: thiếu khoá (mong ${tom(a[k])})`;
    }
    for (const k of kb) {
      if (!(k in a)) return `${duong}.${k}: thừa khoá (nhận ${tom(b[k])})`;
    }
    for (const k of ka) {
      const lech = soSanhSau(a[k], b[k], `${duong}.${k}`);
      if (lech) return lech;
    }
    return null;
  }
  if (mong === nhan) return null;
  return `${duong}: mong ${tom(mong)}, nhận ${tom(nhan)}`;
}

export interface KetQuaKiem {
  dat: number;
  tong: number;
  /** Mô tả tối đa `toiDaIn` ca lệch đầu tiên. */
  loi: string[];
  soLech: number;
}

export interface TuyChonKiem {
  /** Chỉ kiểm những ca thoả điều kiện này (ví dụ một loại `phep`). */
  loc?: (vao: Record<string, unknown>) => boolean;
  /** Số ca lệch được in ra, mặc định 5. */
  toiDaIn?: number;
}

/**
 * Chạy hàm tính trên mọi ca của một môn và so với đáp án Go.
 * Hàm tính ném lỗi thì ca ấy tính là lệch, kèm thông báo lỗi.
 */
export function kiemCa(
  tep: TepCaKiem,
  tinh: (vao: Record<string, unknown>) => unknown,
  tuyChon: TuyChonKiem = {},
): KetQuaKiem {
  const khoaBo = new Set(tep.khoaBo);
  const toiDaIn = tuyChon.toiDaIn ?? 5;
  const loi: string[] = [];
  let dat = 0;
  let tong = 0;
  let soLech = 0;
  for (const ca of tep.ca) {
    if (tuyChon.loc && !tuyChon.loc(ca.vao)) continue;
    tong++;
    let lech: string | null;
    try {
      lech = soSanhSau(chuanHoa(ca.ra, khoaBo), chuanHoa(tinh(ca.vao), khoaBo));
    } catch (e) {
      lech = `ném lỗi: ${(e as Error).message}`;
    }
    if (lech === null) {
      dat++;
    } else {
      soLech++;
      if (loi.length < toiDaIn) loi.push(`vào ${JSON.stringify(ca.vao)}\n    ${lech}`);
    }
  }
  return { dat, tong, loi, soLech };
}

/** Câu báo ngắn cho assert: số ca đạt và các ca lệch đầu tiên. */
export function baoCao(mon: string, kq: KetQuaKiem): string {
  const dau = `${mon}: đạt ${kq.dat}/${kq.tong}`;
  if (kq.soLech === 0) return dau;
  return `${dau}, lệch ${kq.soLech}. Các ca lệch đầu tiên:\n  ${kq.loi.join("\n  ")}`;
}
