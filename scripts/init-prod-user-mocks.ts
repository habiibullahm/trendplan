/**
 * Run migrate + ensure trend media + user mocks against production Neon.
 *
 * Prod deploy: after curated `/media/trends/` lands, run this (or
 * `npm run db:ensure-trend-media`) in the same release for DBs still on
 * `/mocks/` URLs — otherwise trend media 404s.
 *
 * Requires `.env.prod.local` from:
 *   vercel env pull .env.prod.local --environment=production --yes
 *
 * Uses DATABASE_URL_UNPOOLED (Sensitive DATABASE_URL often pulls as "[SENSITIVE]").
 * Does NOT wipe existing trends (uses ensure-trend-media, not prisma/seed deleteMany).
 *
 * Usage:
 *   npx tsx scripts/init-prod-user-mocks.ts [email]
 *   MOCK_USER_PASSWORD='…' npx tsx scripts/init-prod-user-mocks.ts [email]
 */
import { config } from "dotenv";
import { spawnSync } from "node:child_process";
import { z } from "zod";

config({ path: ".env.prod.local", override: true });

const emailParsed = z.email().safeParse(
  (process.argv[2] ?? "mr.habiibullahm@gmail.com").trim().toLowerCase(),
);
if (!emailParsed.success) {
  console.error("Invalid email argument.");
  process.exit(1);
}
const email = emailParsed.data;

const unpooled = process.env.DATABASE_URL_UNPOOLED ?? "";
if (!/^postgres/i.test(unpooled)) {
  console.error(
    "DATABASE_URL_UNPOOLED missing/invalid in .env.prod.local.\n" +
      "Run: vercel env pull .env.prod.local --environment=production --yes",
  );
  process.exit(1);
}

const env = {
  ...process.env,
  DATABASE_URL: unpooled,
  DIRECT_URL: unpooled,
  TARGET_DATABASE_URL: unpooled,
};

const host = unpooled.replace(/^[^\@]+@/, "").replace(/\/.*$/, "");
console.log(`Target: ${host}`);
console.log(`User mocks email: ${email}`);

const npxBin = process.platform === "win32" ? "npx.cmd" : "npx";

function run(args: string[]) {
  console.log(`\n> ${npxBin} ${args.join(" ")}`);
  const result = spawnSync(npxBin, args, {
    env,
    stdio: "inherit",
    shell: false,
  });
  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

run(["prisma", "migrate", "deploy"]);
run(["tsx", "scripts/ensure-trend-media.ts"]);
run([
  "tsx",
  "scripts/seed-user-mocks.ts",
  "--prod",
  "--create",
  "--yes",
  email,
]);

console.log("\nProd init done.");
