export interface Event {
  at: string; // ISO 8601 with an offset, e.g. 2026-03-10T01:30:00+02:00
}

export const REPORT_TIME_ZONE = "Europe/Kyiv";

// The time zone database inside Intl knows when Kyiv switches between +02:00 and +03:00,
// so daylight saving time needs no manual offsets. The date is assembled from parts
// (year, month, day) instead of relying on a locale's display format.
const kyivParts = new Intl.DateTimeFormat("en-US", {
  timeZone: REPORT_TIME_ZONE,
  calendar: "gregory",
  numberingSystem: "latn",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

// Events must carry an explicit offset (Z or ±HH:MM): without it `new Date` would read the time
// in the server's own zone and the result would depend on where the code runs.
const ISO_WITH_OFFSET =
  /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::(\d{2})(?:\.\d+)?)?(Z|[+-]\d{2}:\d{2})$/;

/** Calendar day (YYYY-MM-DD) of a moment, counted in Kyiv time. */
export function kyivDayOf(at: string): string {
  const m = ISO_WITH_OFFSET.exec(at);
  if (!m) {
    throw new RangeError(`Event time must be ISO 8601 with an offset: ${at}`);
  }
  const [, y, mo, d, h, mi, sec = "0", zone] = m;
  // `new Date` silently rolls impossible values over (30 Feb -> 2 Mar), so check them first.
  // Year, month and day are set in one call: setting them separately would pass through a
  // non-leap placeholder year and break 29 February.
  const check = new Date(0);
  check.setUTCFullYear(Number(y), Number(mo) - 1, Number(d));
  // Real UTC offsets run from -12:00 to +14:00.
  const offsetMin = zone === "Z" ? 0
    : (zone[0] === "-" ? -1 : 1) * (Number(zone.slice(1, 3)) * 60 + Number(zone.slice(4, 6)));
  const badOffset = zone !== "Z" && (Number(zone.slice(4, 6)) > 59 || offsetMin < -720 || offsetMin > 840);
  if (Number(y) < 1 || check.getUTCMonth() !== Number(mo) - 1 || check.getUTCDate() !== Number(d) ||
      Number(h) > 23 || Number(mi) > 59 || Number(sec) > 59 || badOffset) {
    throw new RangeError(`Date or time does not exist: ${at}`);
  }
  const parts = Object.fromEntries(
    kyivParts.formatToParts(new Date(at)).map((p) => [p.type, p.value]),
  );
  return `${parts.year.padStart(4, "0")}-${parts.month}-${parts.day}`;
}

// Bug was: new Date(e.at).toISOString().slice(0, 10) takes the day in UTC, so anything
// between 00:00 and 02:00 (03:00 in summer) Kyiv time went to the previous day.
export function groupByDay<T extends Event>(events: T[]): Record<string, T[]> {
  const out: Record<string, T[]> = {};
  for (const e of events) {
    (out[kyivDayOf(e.at)] ||= []).push(e);
  }
  return out;
}
