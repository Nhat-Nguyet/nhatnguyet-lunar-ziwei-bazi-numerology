// Một dòng của bộ dữ liệu mở le-hoi-viet-nam, giữ nguyên tên cột của bộ.
// Mô tả từng cột: https://nhatnguyet.org/du-lieu (bộ le-hoi-viet-nam).
export interface LeHoi {
  id: string;
  ten: string;
  ten_en: string;
  ten_zh: string;
  mo_ta: string;
  mo_ta_en: string;
  mo_ta_zh: string;
  /** "lunar" (ngày âm cố định), "solar" (ngày dương cố định), "theo-nam" (ban tổ chức công bố từng năm). */
  loai_ngay: string;
  loai_ngay_chuan: string;
  /** "ngày/tháng" âm, rỗng khi không theo âm lịch. */
  ngay_am: string;
  /** "ngày/tháng" dương, rỗng khi không theo dương lịch. */
  ngay_duong: string;
  ngay_truoc: string;
  ngay_sau: string;
  ngay_nghi_le: string;
  lich_cong_bo: string;
  lich_cong_bo_en: string;
  lich_cong_bo_zh: string;
  muc_do: string;
  nhom: string;
  pham_vi: string;
  can_cu_phan_loai: string;
  /** Mã tỉnh, thành hiện hành (34 đơn vị, Nghị quyết 202/2025/QH15), ngăn bằng "; ". Từ bộ 1.7.0. */
  tinh: string;
  /** "co" khi là lễ chung cả nước, "khong" khi không. */
  toan_quoc: string;
  /** Tên dân tộc theo danh mục 54, ngăn bằng "; "; rỗng khi lễ không thuộc riêng dân tộc nào. */
  dan_toc: string;
  dan_toc_en: string;
  dan_toc_zh: string;
  /** Tên nơi tổ chức, ngăn bằng "; ". */
  noi_to_chuc: string;
  noi_to_chuc_en: string;
  noi_to_chuc_zh: string;
  /** "vĩ độ,kinh độ" của từng nơi ở noi_to_chuc, cùng thứ tự, ô trống khi chưa có toạ độ có nguồn. */
  toa_do: string;
  /** Địa chỉ nguồn của từng toạ độ, cùng thứ tự. */
  toa_do_nguon: string;
  ghi_chu: string;
  nguon: string;
}

/** A current Vietnamese province or centrally governed city (the 34 units of Resolution 202/2025/QH15). */
export interface Province {
  /** Stable code, as in the dataset's `tinh` column (e.g. "ninh-binh"). */
  code: string;
  vi: string;
  en: string;
  zh: string;
}
