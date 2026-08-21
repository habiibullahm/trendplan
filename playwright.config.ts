import { defineConfig, devices } from "@playwright/test";
import { config as loadEnv } from "dotenv";

/**
 * Thin UI smoke + optional auth journey — Chromium only.
 *
 * Local: reuses an already-running `npm run dev` when present.
 * CI: starts `npm run dev` via webServer.
 *
 * Optional auth: copy `.env.e2e.example` → `.env.e2e` (gitignored) or export
 * E2E_EMAIL / E2E_PASSWORD. Setup writes `.auth/user.json` for journeys.
 * Public smoke does not depend on auth setup (bad creds must not block it).
 */
loadEnv({ path: ".env.e2e" });
loadEnv(); // fall back to `.env` for DATABASE_URL / AUTH when webServer boots

const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:3000";

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: "list",
  use: {
    baseURL,
    trace: "on-first-retry",
  },
  projects: [
    {
      name: "setup",
      testMatch: /auth\.setup\.ts/,
    },
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
      testMatch: /.*\.spec\.ts/,
      testIgnore: /journeys\/.*/,
    },
    // Journeys share one E2E_EMAIL planner week — run serially so create-ide
    // slots and share seats do not race across files.
    {
      name: "journey-planner",
      use: { ...devices["Desktop Chrome"] },
      testMatch: /journeys\/planner\.spec\.ts/,
      dependencies: ["setup"],
    },
    {
      name: "journey-aktivitas",
      use: { ...devices["Desktop Chrome"] },
      testMatch: /journeys\/aktivitas\.spec\.ts/,
      dependencies: ["journey-planner"],
    },
    {
      name: "journey-week-share",
      use: { ...devices["Desktop Chrome"] },
      testMatch: /journeys\/week-share\.spec\.ts/,
      dependencies: ["journey-aktivitas"],
    },
  ],
  webServer: {
    command: "npm run dev",
    url: baseURL,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
