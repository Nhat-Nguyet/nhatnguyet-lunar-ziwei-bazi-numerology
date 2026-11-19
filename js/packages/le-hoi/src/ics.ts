// Xuất lịch lễ hội ra iCalendar (RFC 5545): mỗi lễ ngày cố định của một năm
// là một sự kiện cả ngày, phủ cả mùa hội theo lệ (ngày trước, ngày sau ngày
// chính hội). Cùng đầu vào thì cùng từng byte: UID theo id lễ và năm, DTSTAMP
// là ngày cập nhật của bộ dữ liệu, không phải giờ máy. Bản Python
// (nhatnguyet.en.festivals_ics) ra đúng các byte ấy.
//
// iCalendar export of the festival calendar.

import { DATA_UPDATED, PHIEN_BAN_DU_LIEU } from "./du-lieu.ts";
import { festivals } from "./en.ts";
import type { Festival, FestivalLang } from "./en.ts";

const CAL_NAME: Readonly<Record<FestivalLang, string>> = {
  vi: "Lễ hội Việt Nam",
  en: "Vietnamese festivals",
  zh: "越南节庆",
};

const ATTRIBUTION: Readonly<Record<FestivalLang, string>> = {
  vi: "Dữ liệu: Nhật Nguyệt (nhatnguyet.org), bộ dữ liệu mở le-hoi-viet-nam",
  en: "Data: Nhat Nguyet (nhatnguyet.org), open dataset le-hoi-viet-nam",
  zh: "数据：Nhat Nguyet (nhatnguyet.org)，开放数据集 le-hoi-viet-nam",
};

const MAIN_DAY: Readonly<Record<FestivalLang, string>> = { vi: "Chính hội", en: "Main day", zh: "正日" };

/** Escape a TEXT value (RFC 5545 §3.3.11). */
function escapeText(s: string): string {
  return s.replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\r?\n/g, "\\n");
}

/** UTF-8 length of one code point. */
function utf8Len(ch: string): number {
  const c = ch.codePointAt(0) ?? 0;
  return c < 0x80 ? 1 : c < 0x800 ? 2 : c < 0x10000 ? 3 : 4;
}

/** Fold a content line at 75 octets without splitting a UTF-8 character (RFC 5545 §3.1). */
function fold(line: string): string {
  const out: string[] = [];
  let cur = "";
  let octets = 0;
  for (const ch of line) {
    const n = utf8Len(ch);
    const limit = out.length === 0 ? 75 : 74; // continuation lines start with one space
    if (octets + n > limit) {
      out.push(cur);
      cur = "";
      octets = 0;
    }
    cur += ch;
    octets += n;
  }
  out.push(cur);
  return out.join("\r\n ");
}

function addDays(iso: string, days: number): string {
  const [y, m, d] = iso.split("-").map(Number);
  const t = new Date(0);
  t.setUTCFullYear(y, m - 1, d); // setUTCFullYear giữ đúng năm 0..99, Date.UTC thì không
  t.setTime(t.getTime() + days * 86400000);
  const p = (n: number, w: number) => String(n).padStart(w, "0");
  return `${p(t.getUTCFullYear(), 4)}${p(t.getUTCMonth() + 1, 2)}${p(t.getUTCDate(), 2)}`;
}

/** First venue coordinate that has a source, as the dataset writes it ("lat;lon" for GEO). */
function geoOf(f: Festival): string | null {
  const coords = f.raw.toa_do ? f.raw.toa_do.split("; ") : [];
  const sources = f.raw.toa_do_nguon ? f.raw.toa_do_nguon.split("; ") : [];
  for (let i = 0; i < coords.length; i++) {
    const c = coords[i].split(",");
    if (c.length === 2 && c[0] && sources[i]) return `${c[0]};${c[1]}`;
  }
  return null;
}

function eventLines(f: Festival, year: number, lang: FestivalLang, dtstamp: string): string[] {
  const start = addDays(f.date, -f.daysBefore);
  const end = addDays(f.date, f.daysAfter + 1); // DTEND of an all-day event is exclusive
  const desc = [f.description];
  if (f.daysBefore || f.daysAfter) desc.push(`${MAIN_DAY[lang]}: ${f.date}`);
  const lines = [
    "BEGIN:VEVENT",
    `UID:${f.id}-${year}@nhatnguyet.org`,
    `DTSTAMP:${dtstamp}`,
    `DTSTART;VALUE=DATE:${start}`,
    `DTEND;VALUE=DATE:${end}`,
    `SUMMARY:${escapeText(f.name)}`,
  ];
  if (desc.join("").trim()) lines.push(`DESCRIPTION:${escapeText(desc.filter(Boolean).join("\n"))}`);
  const where = f.venues.map((v) => v.name).concat(f.venues.length ? [] : f.provinces.map((p) => p.name));
  if (where.length) lines.push(`LOCATION:${escapeText(where.join("; "))}`);
  const geo = geoOf(f);
  if (geo) lines.push(`GEO:${geo}`);
  lines.push(`CATEGORIES:${[f.group, ...(f.publicHoliday ? ["public-holiday"] : [])].map(escapeText).join(",")}`);
  lines.push("TRANSP:TRANSPARENT", "END:VEVENT");
  return lines;
}

/**
 * Festivals of a year (the same list as `festivals(year)`) as an iCalendar
 * file (RFC 5545): one all-day event per festival, spanning its customary
 * season around the main day, with a stable UID (`<id>-<year>@nhatnguyet.org`)
 * and the dataset attribution in X-WR-CALDESC. Lines end in CRLF and are
 * folded at 75 octets. Festivals dated by their organisers each year are not
 * included, as in `festivals`.
 *
 * @example writeFileSync("vn-2027.ics", festivalsIcs(2027))
 */
export function festivalsIcs(year: number, opts: { lang?: FestivalLang } = {}): string {
  const lang = opts.lang ?? "en";
  const list = festivals(year, { lang });
  const dtstamp = DATA_UPDATED.replace(/-/g, "") + "T000000Z";
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Nhat Nguyet//le-hoi-viet-nam//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    `X-WR-CALNAME:${escapeText(`${CAL_NAME[lang]} ${year}`)}`,
    `X-WR-CALDESC:${escapeText(`${ATTRIBUTION[lang]} ${PHIEN_BAN_DU_LIEU}, CC BY 4.0`)}`,
    "X-WR-TIMEZONE:Asia/Ho_Chi_Minh",
  ];
  for (const f of list) lines.push(...eventLines(f, year, lang, dtstamp));
  lines.push("END:VCALENDAR");
  return lines.map(fold).join("\r\n") + "\r\n";
}
