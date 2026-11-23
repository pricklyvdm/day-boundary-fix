export interface Event {
  at: string; // ISO 8601 with an offset, e.g. 2026-03-10T01:30:00+02:00
}

// Original function from the task (bug: the day is taken in UTC).
export function groupByDay<T extends Event>(events: T[]): Record<string, T[]> {
  const out: Record<string, T[]> = {};
  for (const e of events) {
    const day = new Date(e.at).toISOString().slice(0, 10);
    (out[day] ||= []).push(e);
  }
  return out;
}
