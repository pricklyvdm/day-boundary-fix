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

/** Calendar day (YYYY-MM-DD) of a moment, counted in Kyiv time. */
export function kyivDayOf(at: string): string {
  const moment = new Date(at);
  if (Number.isNaN(moment.getTime())) {
    throw new RangeError(`Invalid event time: ${at}`);
  }
  const part = (type: string) => kyivParts.formatToParts(moment).find((p) => p.type === type)?.value;
  return `${part("year")}-${part("month")}-${part("day")}`;
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
