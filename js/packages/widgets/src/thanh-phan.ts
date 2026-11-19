// Năm thành phần chạy tại chỗ. Bố cục, cỡ chữ, màu theo đúng widget nhúng
// cùng tên trên nhatnguyet.org; khác ở chỗ mọi con số tính ngay trong trình
// duyệt bằng @nhatnguyet/am-lich, không gọi máy chủ nào.

import { chon, esc, NnWidget } from "./giao-dien.ts";
import {
  chuCanChiNgay,
  chuoiNgay,
  canChiTheo,
  docNgay,
  gioHoangDao,
  homNay,
  khungGio,
  muaTheoThangAm,
  ngayDuong,
  ngayLich,
  nhanAm,
  tenCanhGio,
  tenConGiap,
  tetSapToi,
  thangLich,
  thangNam,
  THU_DAI,
  THU_NGAN,
} from "./tinh.ts";
import type { SolarDate } from "@nhatnguyet/am-lich";

/** Ngày đang xem: thuộc tính date="YYYY-MM-DD" nếu có, không thì hôm nay của máy người đọc. */
function ngayXem(el: HTMLElement): SolarDate {
  return docNgay(el.getAttribute("date")) ?? homNay();
}

// --- <nn-lich-hom-nay> ---------------------------------------------------
export class NnLichHomNay extends NnWidget {
  protected readonly ma = "lich-hom-nay";
  protected css(): string {
    // Hạt in lấm tấm của giấy lịch, như widget cùng tên trên site.
    return `.nn{background-image:radial-gradient(var(--nn-vien) .5px,transparent .5px);background-size:7px 7px;background-position:-1px -1px}
.hang{display:flex;align-items:flex-start;gap:14px}.phai{flex:1;min-width:0;padding-top:2px}
.vien{margin-top:7px;display:inline-block;font-size:11px;padding:2px 7px;border-radius:999px;border:1px solid}`;
  }
  protected noiDung(): string {
    const lang = this.lang;
    const n = ngayLich(ngayXem(this), this.tz);
    const mu = muaTheoThangAm(n.am.month);
    const tk = lang === "en" ? n.tietKhi.tenEn : lang === "zh" ? n.tietKhi.tenZh : n.tietKhi.ten;
    return `<div class="hang">
  <div><div class="so" style="color:${n.thu === 0 ? "var(--nn-son)" : "var(--nn-muc)"}">${n.duong.day}</div>
  <div class="nhat" style="font-size:11.5px;margin-top:5px">${THU_DAI[lang][n.thu]}</div></div>
  <div class="phai">
    <div class="nhat" style="font-size:13px">${thangNam(lang, n.duong.month, n.duong.year, true)}</div>
    <div style="font-size:16px;font-weight:700;margin-top:4px">${nhanAm(lang, n.am)}</div>
    <div class="nhat" style="font-size:12.5px;margin-top:2px">${chuCanChiNgay(lang, n.duong)}</div>
    <div class="vien" style="border-color:${mu.mau};color:${mu.mau}">${tk}${lang === "vi" ? ` · ${mu.ten}` : ""}</div>
  </div>
</div>`;
  }
}

// --- <nn-gio-hoang-dao> --------------------------------------------------
// Dải 12 ô tô theo màu trời của một ngày, giờ hoàng đạo đủ màu và có vạch màu
// nhấn dưới đáy. Khung hẹp hơn 600px thì gập làm hai hàng sáu ô.
const TROI = ["#1e2a44", "#243352", "#33456b", "#5a6f92", "#8fa6c0", "#c3d2df", "#e2e6e0", "#dfd9c8", "#cbb894", "#94849a", "#4e4468", "#2a2f4d"];
function chuTren(hex: string): string {
  const r = parseInt(hex.slice(1, 3), 16), g = parseInt(hex.slice(3, 5), 16), b = parseInt(hex.slice(5, 7), 16);
  return 0.299 * r + 0.587 * g + 0.114 * b > 150 ? "#16120c" : "#ffffff";
}
export class NnGioHoangDao extends NnWidget {
  protected readonly ma = "gio-hoang-dao";
  protected css(): string {
    return `.gio{display:grid;grid-template-columns:repeat(12,minmax(0,1fr));margin-top:11px;border-radius:3px;overflow:hidden;border:1px solid var(--nn-vien)}
.o{position:relative;min-width:0;height:40px;display:flex;align-items:center;justify-content:center}
.o .phu{position:absolute;inset:0;background:var(--nn-giay);opacity:.78}
.o .gach{position:absolute;left:0;right:0;bottom:0;height:3px;background:var(--nn-nhan)}
.o b,.o span{position:relative;font-size:11px;line-height:1.2;max-width:100%;overflow-wrap:anywhere;text-align:center}
.o span{color:var(--nn-mucNhat);opacity:.5;font-weight:400}
.truc{display:flex;justify-content:space-between;font-size:10px;color:var(--nn-mucNhat);margin-top:4px}
.ds{margin:10px 0 0;font-size:13px;line-height:1.7}
.ds span{white-space:nowrap;margin-right:12px;display:inline-block}
.ds b{color:var(--nn-nhan)}
@container (max-width:599px){.gio{grid-template-columns:repeat(6,minmax(0,1fr))}.o:nth-child(n+7){border-top:1px solid var(--nn-vien)}.truc{display:none}}
@container (max-width:340px){.o b,.o span{font-size:10px}}`;
  }
  protected noiDung(): string {
    const lang = this.lang;
    const sd = ngayXem(this);
    const gio = gioHoangDao(sd);
    const o = gio
      .map((g) => {
        const nen = TROI[g.chi];
        const ten = tenCanhGio(lang, g.chi);
        return `<div class="o" style="background:${nen}" title="${ten} ${khungGio(lang, g.chi)}">${
          g.hoangDao ? `<i class="gach"></i><b style="color:${chuTren(nen)}">${ten}</b>` : `<i class="phu"></i><span>${ten}</span>`
        }</div>`;
      })
      .join("");
    const tot = gio.filter((g) => g.hoangDao).map((g) => `<span><b>${tenCanhGio(lang, g.chi)}</b> ${khungGio(lang, g.chi)}</span>`).join("");
    return `<div class="dau"><b>${chon(lang, "Giờ hoàng đạo hôm nay", "Auspicious hours today", "今日黄道吉时")}</b><span>${sd.day}/${sd.month}</span></div>
<div class="gio">${o}</div>
<div class="truc"><span>${chon(lang, "nửa đêm", "midnight", "子夜")}</span><span>${chon(lang, "giữa trưa", "noon", "正午")}</span><span>${chon(lang, "nửa đêm", "midnight", "子夜")}</span></div>
<p class="ds">${tot}</p>`;
  }
}

// --- <nn-dem-nguoc-tet> --------------------------------------------------
export class NnDemNguocTet extends NnWidget {
  protected readonly ma = "dem-nguoc-tet";
  protected noiDung(): string {
    const lang = this.lang;
    const k = tetSapToi(ngayXem(this), this.tz);
    const cg = tenConGiap(lang, k.chiNam);
    const cc = canChiTheo(lang, k.canChiNam.can, k.canChiNam.chi);
    const nam = chon(lang, `${cc} (${cg})`, `Year of the ${cg} (${cc})`, `${cc}年（${cg}）`);
    if (k.laMungMot) {
      return `<p style="margin:0;font-size:21px;font-weight:800;color:var(--nn-son)">${chon(lang, "Hôm nay là mùng Một Tết", "Today is Lunar New Year's Day", "今天是春节正月初一")}</p>
<p style="margin:7px 0 0;font-size:14px">${chon(lang, `Năm ${cc} · tuổi ${cg}`, nam, nam)}</p>`;
    }
    if (k.laGiaoThua) {
      return `<p style="margin:0;font-size:21px;font-weight:800;color:var(--nn-son)">${chon(lang, "Hôm nay là Giao thừa", "Today is Lunar New Year's Eve", "今天是除夕")}</p>
<p style="margin:7px 0 0;font-size:14px">${chon(lang, `Mai là mùng Một năm ${cc}`, `Tomorrow is Lunar New Year's Day, ${nam}`, `明天是正月初一，${nam}`)}</p>`;
    }
    return `<div style="display:flex;align-items:baseline;gap:11px;flex-wrap:wrap">
  <span class="so" style="color:var(--nn-son)">${k.soNgayConLai}</span>
  <span style="font-size:14.5px">${chon(lang, "ngày nữa đến Tết", k.soNgayConLai === 1 ? "day until Tết" : "days until Tết", "天后是春节")}</span>
</div>
<p class="nhat" style="margin:9px 0 0;font-size:12.5px">${chon(lang, "Mùng Một", "Lunar New Year's Day", "正月初一")}${lang === "zh" ? "：" : ": "}${ngayDuong(lang, k.tet)} · ${nam}</p>`;
  }
}

// --- <nn-lich-thang> -----------------------------------------------------
// Chuyển tháng và mở chi tiết ngày ngay tại chỗ, không tải lại trang.
export class NnLichThang extends NnWidget {
  static get observedAttributes(): string[] {
    return [...NnWidget.observedAttributes, "month"];
  }
  protected readonly ma = "lich-thang";
  private thang = 0;
  private nam = 0;
  private mo = 0;

  attributeChangedCallback(ten?: string): void {
    if (ten === "month" || ten === "date") this.thang = 0;
    super.attributeChangedCallback();
  }

  protected css(): string {
    return `.dau a,.dau button.chuyen{padding:1px 8px;border:1px solid var(--nn-vien);border-radius:4px;color:var(--nn-mucNhat);background:transparent;line-height:1.4}
.dau{align-items:center}.dau b{font-size:13.5px}
.cot,.luoi{display:grid;grid-template-columns:repeat(7,minmax(0,1fr));gap:2px;text-align:center}
.cot{font-size:10px;margin:9px 0 3px;color:var(--nn-mucNhat)}
.ngay{border:0;background:transparent;padding:4px 0;border-radius:4px;line-height:1.25;min-width:0}
.ngay .d{font-size:13.5px}.ngay .a{font-size:11px;color:var(--nn-mucNhat)}
.ngay.moc .d{font-weight:700}.ngay.moc .a{color:var(--nn-nhan);font-weight:700}
.ngay.cn{color:var(--nn-son)}
.ngay.nay{background:var(--nn-nhan);color:#fff}.ngay.nay .d{font-weight:700}.ngay.nay .a{color:#fff;opacity:.85}
.hop a{color:var(--nn-nhan);font-weight:700;display:inline-block;margin-top:4px}
@container (max-width:259px){.ngay .d{font-size:12px}.ngay .a{font-size:9.5px}}`;
  }

  protected noiDung(): string {
    const lang = this.lang;
    const nay = homNay();
    if (!this.thang) {
      const m = /^(\d{4})-(\d{2})$/.exec(this.getAttribute("month") || "");
      const goc = m ? { month: +m[2], year: +m[1] } : ngayXem(this);
      this.thang = goc.month >= 1 && goc.month <= 12 ? goc.month : nay.month;
      this.nam = goc.year;
      this.mo = 0;
    }
    const { dauTuan, ngay } = thangLich(this.thang, this.nam, this.tz);
    const chon1 = docNgay(this.getAttribute("date")) ?? nay;
    const trong = Array.from({ length: dauTuan }, () => "<div></div>").join("");
    const o = ngay
      .map(({ duong, am }) => {
        const lop = ["ngay"];
        if (am.day === 1 || am.day === 15) lop.push("moc");
        if ((dauTuan + duong.day - 1) % 7 === 6) lop.push("cn");
        if (duong.day === chon1.day && duong.month === chon1.month && duong.year === chon1.year) lop.push("nay");
        return `<button type="button" class="${lop.join(" ")}" data-d="${duong.day}"><div class="d">${duong.day}</div><div class="a">${am.day === 1 ? `${am.day}/${am.month}` : am.day}</div></button>`;
      })
      .join("");
    let hop = "";
    if (this.mo) {
      const sd = { day: this.mo, month: this.thang, year: this.nam };
      const n = ngayLich(sd, this.tz);
      const lk = `https://nhatnguyet.org/lich-am/${chuoiNgay(sd)}?${lang === "vi" ? "" : `lang=${lang}&amp;`}utm_source=nn-widgets&amp;utm_medium=web-component&amp;utm_campaign=lich-thang`;
      hop = `<div class="hop mo"><b>${chon(lang, `Dương lịch ${ngayDuong(lang, sd)}`, ngayDuong(lang, sd), `公历${ngayDuong(lang, sd)}`)}</b>
<div>${nhanAm(lang, n.am)} · ${chuCanChiNgay(lang, sd)}</div>
<a href="${lk}" target="_blank" rel="noopener">${chon(lang, "Xem chi tiết ngày này", "See the full day", "查看当日详情")}</a></div>`;
    }
    return `<div class="dau">
  <button type="button" class="chuyen" data-buoc="-1" aria-label="${chon(lang, "Tháng trước", "Previous month", "上个月")}">‹</button>
  <b>${thangNam(lang, this.thang, this.nam)}</b>
  <button type="button" class="chuyen" data-buoc="1" aria-label="${chon(lang, "Tháng sau", "Next month", "下个月")}">›</button>
</div>
<div class="cot">${THU_NGAN[lang].map((t, i) => `<div${i === 6 ? ' style="color:var(--nn-son)"' : ""}>${t}</div>`).join("")}</div>
<div class="luoi">${trong}${o}</div>${hop}`;
  }

  protected gan(goc: ShadowRoot): void {
    goc.querySelectorAll<HTMLButtonElement>("button.chuyen").forEach((b) =>
      b.addEventListener("click", () => {
        const buoc = Number(b.dataset.buoc);
        let t = this.thang + buoc, y = this.nam;
        if (t < 1) { t = 12; y--; }
        if (t > 12) { t = 1; y++; }
        this.thang = t;
        this.nam = y;
        this.mo = 0;
        this.dung();
        (this.shadowRoot?.querySelector(`button.chuyen[data-buoc="${buoc}"]`) as HTMLElement | null)?.focus();
      })
    );
    goc.querySelectorAll<HTMLButtonElement>("button.ngay").forEach((b) =>
      b.addEventListener("click", () => {
        const d = Number(b.dataset.d);
        this.mo = this.mo === d ? 0 : d;
        this.dung();
      })
    );
  }
}

// --- <nn-doi-lich> -------------------------------------------------------
// Đổi một ngày dương sang âm lịch, rồi xem giờ hoàng đạo của chính ngày ấy.
export class NnDoiLich extends NnWidget {
  protected readonly ma = "doi-lich";
  protected theoHomNay = false;
  private ngay: SolarDate | null = null;
  private xemGio = false;

  attributeChangedCallback(ten?: string): void {
    if (ten === "date") this.ngay = null;
    super.attributeChangedCallback();
  }

  protected css(): string {
    return `form{display:flex;gap:7px;align-items:center}
input[type=date]{flex:1;min-width:0;padding:7px 9px;border:1px solid var(--nn-vien);border-radius:4px;background:transparent}
.nut{padding:7px 13px;font-weight:700;border:0;border-radius:4px;background:var(--nn-nhan);color:#fff}
.lk{border:0;background:transparent;padding:0;color:var(--nn-nhan);font-weight:700;font-size:12.5px}
.gio{margin-top:10px;padding-top:9px;border-top:1px dashed var(--nn-vien)}
.gio span{white-space:nowrap;display:inline-block;margin-right:12px}.gio b{color:var(--nn-nhan)}`;
  }

  protected noiDung(): string {
    const lang = this.lang;
    const sd = this.ngay ?? ngayXem(this);
    const n = ngayLich(sd, this.tz);
    const gio = this.xemGio
      ? `<div class="gio mo"><div class="nhat" style="font-size:12px">${chon(lang, "Giờ hoàng đạo ngày này", "Auspicious hours", "当日黄道吉时")}</div>
<div style="font-size:13px;margin-top:4px;line-height:1.7">${gioHoangDao(sd)
          .filter((g) => g.hoangDao)
          .map((g) => `<span><b>${tenCanhGio(lang, g.chi)}</b> ${khungGio(lang, g.chi)}</span>`)
          .join("")}</div></div>`
      : `<p style="margin:9px 0 0"><button type="button" class="lk">${chon(lang, "Xem giờ hoàng đạo ngày này", "See auspicious hours", "查看当日黄道吉时")}</button></p>`;
    return `<form>
  <input type="date" value="${esc(chuoiNgay(sd))}" min="1900-01-01" max="2199-12-31" aria-label="${chon(lang, "Chọn ngày dương lịch", "Pick a date", "选择公历日期")}">
  <button type="submit" class="nut">${chon(lang, "Đổi", "Go", "换算")}</button>
</form>
<p style="margin:11px 0 0;font-size:16px;font-weight:700">${nhanAm(lang, n.am, true)}</p>
<p class="nhat" style="margin:3px 0 0;font-size:12.5px">${chuCanChiNgay(lang, sd, true)}</p>
${gio}`;
  }

  protected gan(goc: ShadowRoot): void {
    const form = goc.querySelector("form");
    const o = goc.querySelector<HTMLInputElement>("input[type=date]");
    form?.addEventListener("submit", (e) => {
      e.preventDefault();
      const sd = docNgay(o?.value);
      if (!sd || sd.year < 1900 || sd.year > 2199) {
        o?.focus();
        return;
      }
      this.ngay = sd;
      this.xemGio = false;
      this.dung();
    });
    goc.querySelector("button.lk")?.addEventListener("click", () => {
      this.ngay = this.ngay ?? ngayXem(this);
      this.xemGio = true;
      this.dung();
    });
  }
}
