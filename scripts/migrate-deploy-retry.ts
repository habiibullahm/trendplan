/**
 * Run `prisma migrate deploy` with retries for Neon P1002 advisory-lock timeouts
 * (common when Vercel Production + Preview builds migrate at the same time).
 */
import { spawnSync } from "node:child_process";

const ATTEMPTS = 5;
const BASE_DELAY_MS = 4_000;

function sleepSync(ms: number) {
  Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms);
}

function isAdvisoryLockTimeout(output: string): boolean {
  return (
    output.includes("P1002") ||
    output.toLowerCase().includes("advisory lock")
  );
}

let lastStatus = 1;
for (let attempt = 1; attempt <= ATTEMPTS; attempt++) {
  const result = spawnSync("npx", ["prisma", "migrate", "deploy"], {
    encoding: "utf8",
    shell: true,
    env: process.env,
  });
  const output = `${result.stdout ?? ""}${result.stderr ?? ""}`;
  process.stdout.write(result.stdout ?? "");
  process.stderr.write(result.stderr ?? "");
  lastStatus = result.status ?? 1;

  if (lastStatus === 0) {
    process.exit(0);
  }

  if (!isAdvisoryLockTimeout(output) || attempt === ATTEMPTS) {
    process.exit(lastStatus);
  }

  const delay = BASE_DELAY_MS * attempt;
  console.error(
    `migrate deploy hit P1002 (attempt ${attempt}/${ATTEMPTS}); retrying in ${delay}ms…`,
  );
  sleepSync(delay);
}

process.exit(lastStatus);
