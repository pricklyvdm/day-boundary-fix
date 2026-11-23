// Run: node demo.ts  — shows which day each event lands in, before and after the fix.
import { groupByDay } from "./src/groupByDay.ts";

const oldDay = (at: string) => new Date(at).toISOString().slice(0, 10); // the original line

const events = [
  "2026-03-10T01:30:00+02:00", // 01:30 Kyiv, winter
  "2026-03-10T12:00:00+02:00", // midday, never a problem
  "2026-07-15T00:30:00+03:00", // 00:30 Kyiv, summer
  "2026-03-29T04:30:00+03:00", // morning after the switch to summer time
  "2026-10-25T03:30:00+02:00", // night of the switch back to winter time
];

for (const at of events) {
  const fixed = Object.keys(groupByDay([{ at }]))[0];
  console.log(`${at}  было: ${oldDay(at)}  стало: ${fixed}  ${oldDay(at) === fixed ? "" : "<- баг был тут"}`);
}
