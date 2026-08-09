import { defineConfig, devices } from "@playwright/test";
import { config as loadEnv } from "dotenv";

/**
 * Thin UI smoke — Chromium only.
 *
 * Local: reuses an already-running `npm run dev` when present.
 * CI: starts `npm run dev` via webServer.
 *
 * Optional login: copy `.env.e2e.example` → `.env.e2e` (gitignored) or export
 * E2E_EMAIL / E2E_PASSWORD before `npm run test:e2e`.
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
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    command: "npm run dev",
    url: baseURL,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
    env: {
      ...process.env,
      E2E_LOADING_GALLERY: "1",
    },
  },
});
