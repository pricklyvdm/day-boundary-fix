// Runs the test suite twice with different machine time zones. A fix that accidentally uses
// the server's local time passes on a machine in Kyiv but fails here.
import { spawnSync } from "node:child_process";

for (const tz of ["UTC", "America/New_York"]) {
  console.log(`\n=== TZ=${tz} ===`);
  const r = spawnSync("npx", ["vitest", "run"], { stdio: "inherit", shell: true, env: { ...process.env, TZ: tz } });
  if (r.status !== 0) process.exit(r.status ?? 1);
}
