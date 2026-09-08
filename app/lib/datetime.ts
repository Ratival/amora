// Indonesian DateTime utilities with GMT+7 (WIB) support

export const INDO_DAYS = [
  "Minggu",
  "Senin",
  "Selasa",
  "Rabu",
  "Kamis",
  "Jumat",
  "Sabtu",
] as const;

export const INDO_MONTHS = [
  "Januari",
  "Februari",
  "Maret",
  "April",
  "Mei",
  "Juni",
  "Juli",
  "Agustus",
  "September",
  "Oktober",
  "November",
  "Desember",
] as const;

const MONTH_MAP: Record<string, number> = {
  januari: 0,
  january: 0,
  jan: 0,
  februari: 1,
  february: 1,
  feb: 1,
  maret: 2,
  march: 2,
  mar: 2,
  april: 3,
  apr: 3,
  mei: 4,
  may: 4,
  juni: 5,
  june: 5,
  jun: 5,
  juli: 6,
  july: 6,
  jul: 6,
  agustus: 7,
  august: 7,
  aug: 7,
  september: 8,
  sep: 8,
  oktober: 9,
  october: 9,
  okt: 9,
  oct: 9,
  november: 10,
  nov: 10,
  desember: 11,
  december: 11,
  des: 11,
  dec: 11,
};

/**
 * Converts any date format (free text, ISO YYYY-MM-DD, or Indonesian date) to ISO YYYY-MM-DD
 */
export function parseAnyDateToISO(raw?: string): string {
  if (!raw) return "";
  const trimmed = raw.trim();

  // 1. Direct match YYYY-MM-DD
  const isoMatch = trimmed.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
  if (isoMatch) {
    const y = isoMatch[1];
    const m = isoMatch[2].padStart(2, "0");
    const d = isoMatch[3].padStart(2, "0");
    return `${y}-${m}-${d}`;
  }

  // 2. Pattern: "Sabtu, 24 Oktober 2026" or "24 Oktober 2026" or "24 October 2026"
  const textMatch = trimmed.match(/(\d{1,2})\s+([A-Za-z]+)\s+(\d{4})/);
  if (textMatch) {
    const day = textMatch[1].padStart(2, "0");
    const monthKey = textMatch[2].toLowerCase();
    const year = textMatch[3];
    const monthIdx = MONTH_MAP[monthKey];
    if (monthIdx !== undefined) {
      const monthStr = String(monthIdx + 1).padStart(2, "0");
      return `${year}-${monthStr}-${day}`;
    }
  }

  // 3. Fallback standard Date parsing
  const d = new Date(trimmed);
  if (!isNaN(d.getTime())) {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  }

  return "";
}

/**
 * Formats an ISO string (YYYY-MM-DD) into Indonesian date with Day Name (e.g. "Sabtu, 24 Oktober 2026")
 */
export function formatIndoDateFromISO(isoString?: string): string {
  if (!isoString) return "";
  const iso = parseAnyDateToISO(isoString);
  if (!iso) return isoString;

  const [yStr, mStr, dStr] = iso.split("-");
  const y = parseInt(yStr, 10);
  const m = parseInt(mStr, 10) - 1;
  const d = parseInt(dStr, 10);

  // Use UTC midday to prevent timezone offset shifts
  const date = new Date(Date.UTC(y, m, d, 12, 0, 0));
  const dayName = INDO_DAYS[date.getUTCDay()];
  const monthName = INDO_MONTHS[m] || "";

  return `${dayName}, ${d} ${monthName} ${y}`;
}

export type TimezoneCode = "WIB" | "WITA" | "WIT";

export interface ParsedTimeRange {
  startTime: string; // "09:00"
  endTime: string;   // "11:00"
  isUntilEnd: boolean; // true if "Selesai"
  timezone: TimezoneCode; // "WIB"
}

/**
 * Parses time strings like "09:00 – 11:00 WIB" or "18:30 WIB – Selesai"
 */
export function parseTimeRange(timeStr?: string): ParsedTimeRange {
  if (!timeStr) {
    return {
      startTime: "09:00",
      endTime: "11:00",
      isUntilEnd: false,
      timezone: "WIB",
    };
  }

  let timezone: TimezoneCode = "WIB";
  if (timeStr.includes("WITA")) timezone = "WITA";
  else if (timeStr.includes("WIT") && !timeStr.includes("WIB")) timezone = "WIT";

  const isUntilEnd = /selesai/i.test(timeStr);

  const times = timeStr.match(/(\d{1,2}:\d{2})/g) || [];
  let startTime = "09:00";
  let endTime = "11:00";

  if (times.length >= 1) {
    startTime = times[0].padStart(5, "0");
  }
  if (times.length >= 2) {
    endTime = times[1].padStart(5, "0");
  }

  return {
    startTime,
    endTime,
    isUntilEnd,
    timezone,
  };
}

/**
 * Combines time picker values into formatted Indonesian time string
 * e.g. "09:00 – 11:00 WIB" or "09:00 WIB – Selesai"
 */
export function buildTimeRangeString(
  startTime: string,
  endTime: string,
  isUntilEnd: boolean,
  timezone: TimezoneCode = "WIB"
): string {
  const start = startTime || "09:00";
  if (isUntilEnd) {
    return `${start} ${timezone} – Selesai`;
  }
  const end = endTime || "11:00";
  return `${start} – ${end} ${timezone}`;
}
