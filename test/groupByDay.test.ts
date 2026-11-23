import { describe, expect, it } from "vitest";
import { groupByDay } from "../src/groupByDay";

const days = (ats: string[]) => Object.keys(groupByDay(ats.map((at) => ({ at })))).sort();

describe("groupByDay counts the day in Europe/Kyiv", () => {
  it("event at 01:30 Kyiv (winter, +02:00) belongs to the same Kyiv day", () => {
    expect(days(["2026-03-10T01:30:00+02:00"])).toEqual(["2026-03-10"]);
  });

  it("event at 00:30 Kyiv (summer, +03:00) belongs to the same Kyiv day", () => {
    expect(days(["2026-07-15T00:30:00+03:00"])).toEqual(["2026-07-15"]);
  });

  it("the first night after the switch to summer time (29.03.2026)", () => {
    // Kyiv moves from +02:00 to +03:00 at 03:00 local on 29 March 2026.
    expect(days(["2026-03-29T00:30:00+02:00"])).toEqual(["2026-03-29"]);
    expect(days(["2026-03-29T04:30:00+03:00"])).toEqual(["2026-03-29"]);
    expect(days(["2026-03-30T00:30:00+03:00"])).toEqual(["2026-03-30"]);
  });

  it("the night of the switch back to winter time (25.10.2026)", () => {
    // Kyiv moves from +03:00 back to +02:00 at 04:00 local on 25 October 2026.
    expect(days(["2026-10-25T00:30:00+03:00"])).toEqual(["2026-10-25"]);
    expect(days(["2026-10-25T03:30:00+03:00", "2026-10-25T03:30:00+02:00"])).toEqual(["2026-10-25"]);
    expect(days(["2026-10-26T00:30:00+02:00"])).toEqual(["2026-10-26"]);
  });

  it("an event sent in another offset is still counted by Kyiv time", () => {
    // 23:30 UTC on 9 March is already 01:30 on 10 March in Kyiv.
    expect(days(["2026-03-09T23:30:00Z"])).toEqual(["2026-03-10"]);
  });

  it("the last minute of a Kyiv day stays in that day", () => {
    expect(days(["2026-03-10T23:59:00+02:00"])).toEqual(["2026-03-10"]);
  });

  it("keeps every event and groups several per day", () => {
    const grouped = groupByDay([
      { at: "2026-03-10T00:10:00+02:00", id: 1 },
      { at: "2026-03-10T12:00:00+02:00", id: 2 },
      { at: "2026-03-11T00:10:00+02:00", id: 3 },
    ]);
    expect(grouped["2026-03-10"]?.map((e) => e.id)).toEqual([1, 2]);
    expect(grouped["2026-03-11"]?.map((e) => e.id)).toEqual([3]);
  });

  it("rejects an invalid date instead of silently dropping it", () => {
    expect(() => groupByDay([{ at: "not a date" }])).toThrow();
  });
});
