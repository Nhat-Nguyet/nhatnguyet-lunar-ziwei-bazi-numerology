"""Chiều sâu và hạn của lá số Tử Vi: hội sao tam phương tứ chính, liên cung,
đại vận, hạn năm (lưu niên, tiểu vận, lưu Tứ Hóa, nguyệt hạn) và sao lưu.

Bản chuyển ngữ của lõi Go (coreengine: tuvi_chieusau.go, tuvi_luunien.go,
tuvi_luusao.go). Ở đây chỉ tính DỮ KIỆN, không sinh câu luận nào; phần câu
công bố cách tính (phepTinh) của lõi Go không được dựng lại.

Dị bản cần biết (ghi theo lõi Go): đại vận khởi ở cung Mệnh (lối Tân Biên;
Toàn thư khởi ở cung kề Mệnh); tiểu vận khởi theo nhóm tam hợp của chi năm
sinh, nam thuận nữ nghịch; nguyệt hạn theo lưu Đẩu Quân (lối Toàn thư).
"""

from __future__ import annotations

from typing import Dict, List

from .am_lich import DIA_CHI, THIEN_CAN, mod
from .tu_vi_du_lieu import (
    LOC_TON_VI_TRI, TEN_HOA, TU_HOA_THEO_CAN, noi_ten_sao, ten_cung_ba_thu, ten_sao_tu_vi_ba_thu, zh_cua,
)
from .tu_vi_lap_so import thien_ma_vi_tri, vi_tri_dau_quan

# ---------------------------------------------------------------------------
# Tiện ích tra trên lá số
# ---------------------------------------------------------------------------


def ten_cung_tai_vi_tri(la_so: Dict, pos: int) -> str:
    """Tên cung (Mệnh, Phụ Mẫu...) tại một vị trí địa bàn."""
    return la_so["cung"][mod(pos, 12)]["tenCung"]


def vi_tri_sao(la_so: Dict, ten: str) -> int:
    """Vị trí của một sao trên lá số; -1 nếu không có."""
    for c in la_so["cung"]:
        for s in c["sao"]:
            if s["ten"] == ten:
                return c["viTri"]
    return -1


def chinh_tinh_cua_cung(la_so: Dict, pos: int) -> str:
    """Tên các chính tinh toạ thủ, nối bằng ", "; rỗng là vô chính diệu."""
    return ", ".join(s["ten"] for s in la_so["cung"][mod(pos, 12)]["sao"] if s["loai"] == "chinh-tinh")


# ---------------------------------------------------------------------------
# Hội sao, liên cung, đại vận (tuvi_chieusau.go)
# ---------------------------------------------------------------------------


def _sao_cua_cung(la_so: Dict, pos: int) -> List[Dict]:
    c = la_so["cung"][mod(pos, 12)]
    out = []
    for s in c["sao"]:
        x = {"ten": s["ten"], "tenEn": s["tenEn"]}
        if s.get("tenZh"):
            x["tenZh"] = s["tenZh"]
        x["loai"] = s["loai"]
        if s.get("mieuVuong"):
            x["mieuVuong"] = s["mieuVuong"]
        if s.get("tuHoa"):
            x["tuHoa"] = s["tuHoa"]
        x["tuCung"] = c["chi"]
        out.append(x)
    return out


def hoi_sao(la_so: Dict) -> List[Dict]:
    """Bộ sao tam phương tứ chính của cả 12 cung: toạ thủ, xung chiếu (+6),
    tam hợp (+4, +8)."""
    out = []
    for i in range(12):
        c = la_so["cung"][i]
        out.append({
            "viTri": c["viTri"], "chi": c["chi"], "tenCung": c["tenCung"], "tenCungEn": c["tenCungEn"],
            "toaThu": _sao_cua_cung(la_so, i),
            "xungChieu": _sao_cua_cung(la_so, i + 6),
            "tamHop": _sao_cua_cung(la_so, i + 4) + _sao_cua_cung(la_so, i + 8),
        })
    return out


def lien_cung(la_so: Dict) -> List[Dict]:
    """Sáu cặp cung đối xung và cặp Mệnh, Thân."""
    cung = la_so["cung"]
    out = []
    for i in range(6):
        j = mod(i + 6, 12)
        a, b = cung[i], cung[j]
        out.append({
            "loai": "doi-xung", "a": a["tenCung"], "b": b["tenCung"],
            "chiA": a["chi"], "chiB": b["chi"], "viTriA": a["viTri"], "viTriB": b["viTri"],
            "chinhA": chinh_tinh_cua_cung(la_so, i), "chinhB": chinh_tinh_cua_cung(la_so, j),
        })
    m, t = la_so["cungMenh"], la_so["cungThan"]
    out.append({
        "loai": "menh-than", "a": cung[m]["tenCung"], "b": cung[t]["tenCung"],
        "chiA": cung[m]["chi"], "chiB": cung[t]["chi"], "viTriA": m, "viTriB": t,
        "chinhA": chinh_tinh_cua_cung(la_so, m), "chinhB": chinh_tinh_cua_cung(la_so, t),
    })
    return out


def chieu_dai_van(am_duong_menh: str) -> int:
    """+1 đi thuận (Dương Nam, Âm Nữ), -1 đi nghịch (Âm Nam, Dương Nữ)."""
    return 1 if am_duong_menh in ("Dương Nam", "Âm Nữ") else -1


def dai_van(la_so: Dict) -> List[Dict]:
    """Mười hai chặng đại vận, mỗi chặng 10 năm tuổi mụ, khởi ở cung Mệnh từ
    tuổi bằng số Cục."""
    chieu = chieu_dai_van(la_so["amDuongMenh"])
    out = []
    for k in range(12):
        pos = mod(la_so["cungMenh"] + chieu * k, 12)
        c = la_so["cung"][pos]
        tu = la_so["cuc"] + k * 10
        d = {
            "thu": k + 1, "viTri": c["viTri"], "chi": c["chi"], "chiZh": zh_cua(c["chi"]),
            "tenCung": c["tenCung"], "tenCungEn": c["tenCungEn"], "tenCungZh": ten_cung_ba_thu(c["tenCung"])[1],
            "tuTuoi": tu, "denTuoi": tu + 9,
        }
        ct = chinh_tinh_cua_cung(la_so, pos)
        if ct:
            d["chinhTinh"] = ct
            d["chinhTinhEn"], d["chinhTinhZh"] = noi_ten_sao(ct)
        out.append(d)
    return out


# ---------------------------------------------------------------------------
# Hạn năm (tuvi_luunien.go)
# ---------------------------------------------------------------------------


def khoi_tieu_van(chi_nam_idx: int) -> int:
    """Vị trí tiểu vận lúc 1 tuổi: Thân Tý Thìn khởi Tuất, Dần Ngọ Tuất khởi
    Thìn, Tỵ Dậu Sửu khởi Mùi, Hợi Mão Mùi khởi Sửu."""
    r = mod(chi_nam_idx, 4)
    if r == 0:
        return 10
    if r == 2:
        return 4
    if r == 1:
        return 7
    return 1


def chieu_tieu_van(gioi_tinh: str) -> int:
    """Nam đi thuận, nữ đi nghịch (chỉ theo giới tính, khác chieu_dai_van)."""
    return -1 if gioi_tinh == "Nữ" else 1


def tinh_nguyet_han(la_so: Dict, chi_nam_xem: int) -> Dict:
    """Nguyệt hạn theo lưu Đẩu Quân của năm xem."""
    gio = 0
    for i, c in enumerate(DIA_CHI):
        if c == la_so["gioSinh"]:
            gio = i
    dq = vi_tri_dau_quan(chi_nam_xem, la_so["ngaySinhAm"]["month"], gio)
    thang = []
    for t in range(1, 13):
        p = mod(dq + t - 1, 12)
        c = la_so["cung"][p]
        thang.append({
            "thang": t, "viTri": p, "chi": DIA_CHI[p], "chiZh": zh_cua(DIA_CHI[p]),
            "tenCung": c["tenCung"], "tenCungEn": c["tenCungEn"], "tenCungZh": ten_cung_ba_thu(c["tenCung"])[1],
        })
    return {"luuDauQuanViTri": dq, "luuDauQuanChi": DIA_CHI[dq], "luuDauQuanChiZh": zh_cua(DIA_CHI[dq]), "thang": thang}


def tinh_han_nam(la_so: Dict, nam_xem: int) -> Dict:
    """Dữ kiện của một năm xem (năm dương lịch, hiểu là năm âm cùng số): tuổi
    mụ, lưu niên, tiểu vận, đại vận đang ở, lưu Tứ Hóa, nguyệt hạn."""
    nam_sinh_am = la_so["ngaySinhAm"]["year"]
    tuoi_mu = nam_xem - nam_sinh_am + 1
    if tuoi_mu < 1:
        tuoi_mu = 1

    can_idx = mod(nam_xem - 4, 10)
    chi_idx = mod(nam_xem - 4, 12)

    chi_nam_sinh = mod(nam_sinh_am - 4, 12)
    tv = mod(khoi_tieu_van(chi_nam_sinh) + chieu_tieu_van(la_so["gioiTinh"]) * (tuoi_mu - 1), 12)

    dv_tu, dv_den, dv_ten = 0, 0, ""
    for c in dai_van(la_so):
        if c["tuTuoi"] <= tuoi_mu <= c["denTuoi"]:
            dv_tu, dv_den, dv_ten = c["tuTuoi"], c["denTuoi"], c["tenCung"]
            break

    luu_tu_hoa = []
    for hoa, sao in zip(TEN_HOA, TU_HOA_THEO_CAN[can_idx]):
        sao_en, sao_zh = ten_sao_tu_vi_ba_thu(sao)
        item = {
            "hoa": hoa, "hoaZh": zh_cua(hoa), "sao": sao, "saoEn": sao_en, "saoZh": sao_zh, "viTri": -1,
            "chiCung": "", "chiCungZh": "", "tenCung": "", "tenCungEn": "", "tenCungZh": "", "coTrenLaSo": False,
        }
        p = vi_tri_sao(la_so, sao)
        if p >= 0:
            ten_cung = ten_cung_tai_vi_tri(la_so, p)
            en, zh = ten_cung_ba_thu(ten_cung)
            item.update(viTri=p, coTrenLaSo=True, chiCung=DIA_CHI[p], chiCungZh=zh_cua(DIA_CHI[p]),
                        tenCung=ten_cung, tenCungEn=en, tenCungZh=zh)
        luu_tu_hoa.append(item)

    can_chi = THIEN_CAN[can_idx] + " " + DIA_CHI[chi_idx]
    ln = ten_cung_tai_vi_tri(la_so, chi_idx)
    tvc = ten_cung_tai_vi_tri(la_so, tv)
    return {
        "nam": nam_xem,
        "canChiNam": can_chi,
        "canChiNamZh": zh_cua(can_chi),
        "tuoiMu": tuoi_mu,
        "luuNienViTri": chi_idx,
        "luuNienChi": DIA_CHI[chi_idx],
        "luuNienChiZh": zh_cua(DIA_CHI[chi_idx]),
        "luuNienTenCung": ln,
        "luuNienTenCungEn": ten_cung_ba_thu(ln)[0],
        "luuNienTenCungZh": ten_cung_ba_thu(ln)[1],
        "tieuVanViTri": tv,
        "tieuVanChi": DIA_CHI[tv],
        "tieuVanChiZh": zh_cua(DIA_CHI[tv]),
        "tieuVanTenCung": tvc,
        "tieuVanTenCungEn": ten_cung_ba_thu(tvc)[0],
        "tieuVanTenCungZh": ten_cung_ba_thu(tvc)[1],
        "daiVanTuTuoi": dv_tu,
        "daiVanDenTuoi": dv_den,
        "daiVanTenCung": dv_ten,
        "daiVanTenCungEn": ten_cung_ba_thu(dv_ten)[0],
        "daiVanTenCungZh": ten_cung_ba_thu(dv_ten)[1],
        "luuTuHoa": luu_tu_hoa,
        "nguyetHan": tinh_nguyet_han(la_so, chi_idx),
    }


# ---------------------------------------------------------------------------
# Sao lưu (tuvi_luusao.go)
# ---------------------------------------------------------------------------

LUU_LOC_TON = "luu-loc-ton"
LUU_KINH_DUONG = "luu-kinh-duong"
LUU_DA_LA = "luu-da-la"
LUU_THIEN_MA = "luu-thien-ma"
LUU_THAI_TUE = "luu-thai-tue"

CUNG_DONG_CUNG = "dong-cung"
CUNG_XUNG_CHIEU = "xung-chieu"
CUNG_TAM_HOP = "tam-hop"

# (mã, tên Việt, Anh, Trung, an theo can)
_TEN_SAO_LUU = (
    (LUU_THAI_TUE, "Lưu Thái Tuế", "Yearly Thái Tuế", "流年太岁", False),
    (LUU_LOC_TON, "Lưu Lộc Tồn", "Yearly Lộc Tồn", "流禄", True),
    (LUU_KINH_DUONG, "Lưu Kình Dương", "Yearly Kình Dương", "流羊", True),
    (LUU_DA_LA, "Lưu Đà La", "Yearly Đà La", "流陀", True),
    (LUU_THIEN_MA, "Lưu Thiên Mã", "Yearly Thiên Mã", "流马", False),
)


def quan_he_hai_cung(a: int, b: int) -> str:
    """Quan hệ tam phương tứ chính của hai vị trí: đồng cung, xung chiếu, tam
    hợp, hay rỗng."""
    d = mod(a - b, 12)
    if d == 0:
        return CUNG_DONG_CUNG
    if d == 6:
        return CUNG_XUNG_CHIEU
    if d in (4, 8):
        return CUNG_TAM_HOP
    return ""


def vi_tri_sao_luu(can_idx: int, chi_idx: int) -> Dict[str, int]:
    """Vị trí năm sao lưu theo can chi của một năm."""
    loc = LOC_TON_VI_TRI[mod(can_idx, 10)]
    return {
        LUU_LOC_TON: loc,
        LUU_KINH_DUONG: mod(loc + 1, 12),
        LUU_DA_LA: mod(loc - 1, 12),
        LUU_THIEN_MA: thien_ma_vi_tri(mod(chi_idx, 12)),
        LUU_THAI_TUE: mod(chi_idx, 12),
    }


def tinh_sao_luu(la_so: Dict, nam_xem: int) -> List[Dict]:
    """Năm sao lưu của năm xem trên lá số, thứ tự Thái Tuế, Lộc Tồn, Kình
    Dương, Đà La, Thiên Mã."""
    if la_so is None:
        return None
    vt = vi_tri_sao_luu(mod(nam_xem - 4, 10), mod(nam_xem - 4, 12))
    hn = tinh_han_nam(la_so, nam_xem)
    dv = -1
    for c in dai_van(la_so):
        if c["tuTuoi"] <= hn["tuoiMu"] <= c["denTuoi"]:
            dv = c["viTri"]
            break
    ra = []
    for ma, vi, en, zh, theo_can in _TEN_SAO_LUU:
        p = vt[ma]
        ten_cung = ten_cung_tai_vi_tri(la_so, p)
        cung_en, cung_zh = ten_cung_ba_thu(ten_cung)
        ra.append({
            "ma": ma, "ten": vi, "tenEn": en, "tenZh": zh, "theoCan": theo_can,
            "viTri": p, "chi": DIA_CHI[p], "chiZh": zh_cua(DIA_CHI[p]),
            "tenCung": ten_cung, "tenCungEn": cung_en, "tenCungZh": cung_zh,
            "voiLuuNien": quan_he_hai_cung(p, hn["luuNienViTri"]),
            "voiTieuVan": quan_he_hai_cung(p, hn["tieuVanViTri"]),
            "voiDaiVan": quan_he_hai_cung(p, dv) if dv >= 0 else "",
        })
    return ra
