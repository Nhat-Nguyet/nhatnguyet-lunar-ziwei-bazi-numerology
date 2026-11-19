// Khung chung của mọi thành phần: Shadow DOM, bảng màu, ba bộ màu (light,
// dark, auto), màu nhấn, dòng ghi nguồn. Cùng hệ thiết kế "lịch bloc" với
// widget nhúng trên nhatnguyet.org (apps/web/src/lib/widget/khung.ts): giấy
// trắng, mực xám than, đỏ gạch cho ngày và màu nhấn, xanh ngọc cho dấu; nẹp
// màu nhấn 2px ở mép trên; font hệ thống.

import { docLang, docTerms, muiGio, type Lang, type Terms } from "./tinh.ts";

const SANG = {
  giay: "#ffffff",
  muc: "#1b1f1e",
  mucNhat: "#4a5250",
  vien: "#dee2df",
  son: "#b5402f",
  ngoc: "#1f6f6b",
  phu: "#dee2df66",
};
const TOI = {
  giay: "#182a28",
  muc: "#ecf1ef",
  mucNhat: "#b4c0bd",
  vien: "#2a3f3c",
  son: "#e8897a",
  ngoc: "#7cc7bf",
  phu: "#2a3f3c66",
};

function bien(m: Record<string, string>): string {
  return Object.entries(m)
    .map(([k, v]) => `--nn-${k}:${v}`)
    .join(";");
}

/** CSS dùng chung, đặt trong Shadow DOM nên không rò ra trang chủ nhà. */
export const CSS_CHUNG = `
:host{display:block;container-type:inline-size;${bien(SANG)};color-scheme:light}
:host([theme="dark"]){${bien(TOI)};color-scheme:dark}
@media (prefers-color-scheme:dark){:host([theme="auto"]){${bien(TOI)};color-scheme:dark}}
:host([hidden]){display:none}
*{box-sizing:border-box}
.nn{position:relative;background:var(--nn-giay);border:1px solid var(--nn-vien);border-radius:4px;overflow:hidden;
  color:var(--nn-muc);font:14px/1.55 -apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Arial,sans-serif;
  -webkit-font-smoothing:antialiased;text-align:left}
.nn::before{content:"";position:absolute;inset:0 0 auto;height:2px;background:var(--nn-nhan)}
.than{padding:14px 15px 12px}
.nguon{border-top:1px solid var(--nn-vien);padding:7px 12px;font-size:11px;color:var(--nn-mucNhat);
  display:flex;justify-content:space-between;align-items:center;gap:8px;flex-wrap:wrap}
.nguon a{color:var(--nn-mucNhat);text-decoration:none}
.nguon a:hover{text-decoration:underline}
.ten{display:flex;align-items:center;gap:5px}
.nhat{color:var(--nn-mucNhat)}
.nhan{color:var(--nn-nhan)}
.so{font-size:46px;font-weight:800;letter-spacing:-.035em;line-height:.85;font-variant-numeric:tabular-nums}
.dau{display:flex;justify-content:space-between;align-items:baseline;gap:8px}
.dau b{font-size:13.5px}
.dau span{font-size:11.5px;color:var(--nn-mucNhat)}
button,input,select{font:inherit;color:inherit}
button{cursor:pointer}
a:focus-visible,button:focus-visible,input:focus-visible{outline:2px solid var(--nn-nhan);outline-offset:2px}
.hop{margin-top:9px;padding:8px 10px;border-radius:5px;background:var(--nn-phu);font-size:12.5px;line-height:1.6}
.mo{animation:nnMo .28s ease both}
@keyframes nnMo{from{opacity:0;transform:translateY(3px)}to{opacity:1;transform:none}}
@media (prefers-reduced-motion:reduce){*{animation:none!important;transition:none!important}}
`;

/** Dấu Nhật Nguyệt rút gọn (vành và âm dương), như dòng nguồn của widget trên site. */
const DAU = `<svg width="14" height="14" viewBox="0 0 24 24" aria-hidden="true" focusable="false" style="flex:none">
<circle cx="12" cy="12" r="11" style="fill:none;stroke:var(--nn-ngoc);stroke-width:1.6"/>
<path d="M12 1a11 11 0 0 0 0 22 5.5 5.5 0 0 0 0-11 5.5 5.5 0 0 1 0-11z" style="fill:var(--nn-ngoc)"/>
<circle cx="12" cy="6.5" r="1.7" style="fill:var(--nn-giay)"/><circle cx="12" cy="17.5" r="1.7" style="fill:var(--nn-ngoc)"/></svg>`;

export function chon(lang: Lang, vi: string, en: string, zh: string): string {
  return lang === "en" ? en : lang === "zh" ? zh : vi;
}

/** Thoát chữ trước khi đặt vào HTML (chữ do người nhúng truyền vào, như ngày). */
export function esc(s: string): string {
  return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c] as string);
}

// Ngoài trình duyệt (Node, dựng HTML ở máy chủ) không có HTMLElement: nhập gói
// vẫn không được ném lỗi, chỉ là không có thẻ nào để đăng ký.
const GocPhanTu = (typeof HTMLElement !== "undefined" ? HTMLElement : class {}) as typeof HTMLElement;

/** Lớp gốc của mọi thành phần. Lớp con trả phần thân ở `noiDung()` và gắn sự kiện ở `gan()`. */
export abstract class NnWidget extends GocPhanTu {
  static get observedAttributes(): string[] {
    return ["lang", "theme", "accent", "country", "date", "terms"];
  }

  /** Mã dùng trong utm_campaign của liên kết về site. */
  protected abstract readonly ma: string;
  /** Có đổi theo ngày hôm nay không (khi không đặt `date`): dựng lại lúc nửa đêm. */
  protected theoHomNay = true;
  private hen: ReturnType<typeof setTimeout> | null = null;

  constructor() {
    super();
    this.attachShadow({ mode: "open" });
  }

  /**
   * Ngôn ngữ hiển thị: thuộc tính `lang`, rồi `lang` của tổ tiên gần nhất hay
   * `<html lang>`, rồi `navigator.language`, rồi "en" (luật ở `docLang`).
   * Đổi `lang` của tổ tiên sau khi gắn thì không tự dựng lại.
   */
  get lang(): Lang {
    const toTien =
      this.parentElement?.closest("[lang]")?.getAttribute("lang") ??
      (typeof document !== "undefined" ? document.documentElement?.getAttribute("lang") : null);
    const trinhDuyet = typeof navigator !== "undefined" ? navigator.language : null;
    return docLang(this.getAttribute("lang"), toTien, trinhDuyet);
  }
  set lang(v: string) {
    this.setAttribute("lang", v);
  }

  /**
   * Cách viết can chi khi lang="en", như tùy chọn `terms` của thư viện:
   * "pinyin" (mặc định, "Ding You"), "han" ("丁酉"), "vi" ("Đinh Dậu"). Với
   * lang "vi" luôn là "vi", "zh" luôn là "han".
   */
  get terms(): Terms {
    return docTerms(this.getAttribute("terms"), this.lang);
  }

  /** Múi giờ lịch âm theo thuộc tính country (VN mặc định). */
  protected get tz(): number {
    return muiGio(this.getAttribute("country"));
  }

  connectedCallback(): void {
    this.dung();
  }

  disconnectedCallback(): void {
    if (this.hen) clearTimeout(this.hen);
    this.hen = null;
  }

  attributeChangedCallback(): void {
    if (this.isConnected) this.dung();
  }

  protected abstract noiDung(): string;
  protected gan(_goc: ShadowRoot): void {}

  /** Dựng lại toàn bộ khung. */
  protected dung(): void {
    const goc = this.shadowRoot;
    if (!goc) return;
    const accent = this.getAttribute("accent") || "";
    const nhan = /^#[0-9a-fA-F]{6}$/.test(accent) ? accent : "var(--nn-son)";
    const lang = this.lang;
    // Trang chủ có nhánh /en, /zh thật.
    const href = `https://nhatnguyet.org/${lang === "vi" ? "" : lang}?utm_source=nn-widgets&amp;utm_medium=web-component&amp;utm_campaign=${this.ma}`;
    goc.innerHTML = `<style>${CSS_CHUNG}.nn{--nn-nhan:${nhan}}${this.css()}</style>
<div class="nn" part="frame" lang="${lang}">
  <div class="than">${this.noiDung()}</div>
  <div class="nguon"><span class="ten">${DAU}<span>${chon(lang, "Nguồn: Nhật Nguyệt", "Source: Nhat Nguyet", "数据：Nhat Nguyet")}</span></span><a href="${href}" target="_blank" rel="noopener">nhatnguyet.org</a></div>
</div>`;
    this.gan(goc);
    this.henNuaDem();
  }

  /** CSS riêng của lớp con. */
  protected css(): string {
    return "";
  }

  private henNuaDem(): void {
    if (this.hen) clearTimeout(this.hen);
    this.hen = null;
    if (!this.theoHomNay || this.getAttribute("date")) return;
    const nay = new Date();
    const mai = new Date(nay.getFullYear(), nay.getMonth(), nay.getDate() + 1, 0, 0, 5);
    this.hen = setTimeout(() => this.dung(), mai.getTime() - nay.getTime());
  }
}
