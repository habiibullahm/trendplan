import { expect, test, type Page } from "@playwright/test";
import {
  AUTH_STORAGE_PATH,
  PARTNER_AUTH_STORAGE_PATH,
  e2eCredentials,
} from "../helpers/auth";
import { e2ePartnerCredentials } from "../helpers/partner-user";
import { clearWeekInviteRateLimits } from "../helpers/rate-limit";

const creds = e2eCredentials();
const partnerCreds = e2ePartnerCredentials();

const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:3000";

async function openShareModal(page: Page) {
  const shareChip = page.getByRole("button", {
    name: /Bagikan minggu ke partner|Plan bersama dengan|^Bagikan$/,
  });
  await expect(shareChip).toBeVisible({ timeout: 15_000 });
  await shareChip.click();
  await expect(
    page.getByRole("heading", { name: "Bagikan minggu" }),
  ).toBeVisible();
}

/** Clear pending invite or active partner so the owner starts from a free seat. */
async function resetOwnerShareSeat(page: Page) {
  await openShareModal(page);

  const remove = page.getByRole("button", { name: "Cabut akses" });
  if (await remove.isVisible().catch(() => false)) {
    await remove.click();
    await expect(page.getByText("Akses partner dicabut")).toBeVisible({
      timeout: 10_000,
    });
    await page.goto("/planner");
    await openShareModal(page);
  }

  const leave = page.getByRole("button", { name: "Keluar dari plan" });
  if (await leave.isVisible().catch(() => false)) {
    await leave.click();
    await expect(page.getByText("Kamu keluar dari plan")).toBeVisible({
      timeout: 10_000,
    });
    await page.goto("/planner");
    await openShareModal(page);
  }

  const cancel = page.getByRole("button", { name: "Batalkan undangan" });
  if (await cancel.isVisible().catch(() => false)) {
    await cancel.click();
    await expect(page.getByText("Undangan dibatalkan")).toBeVisible({
      timeout: 10_000,
    });
    await expect(
      page.getByRole("button", { name: "Salin tautan undangan" }),
    ).toBeVisible({ timeout: 10_000 });
  }
}

/**
 * Create an invite and return its URL.
 * Hooks clipboard.writeText so we still get the token if Sonner toasts race with refresh.
 */
async function copyFreshInviteUrl(page: Page): Promise<string> {
  await page.evaluate(() => {
    const w = window as unknown as { __e2eInviteUrl?: string };
    w.__e2eInviteUrl = "";
    const clipboard = navigator.clipboard;
    if (!clipboard?.writeText) return;
    const original = clipboard.writeText.bind(clipboard);
    clipboard.writeText = async (text: string) => {
      w.__e2eInviteUrl = text;
      return original(text);
    };
  });

  await page.getByRole("button", { name: "Salin tautan undangan" }).click();

  const rateLimited = page.getByText(/Terlalu banyak percobaan/);
  const pending = page.getByText("Menunggu partner…");
  const copied = page.getByText("Tautan undangan disalin");
  const ready = page.getByText("Tautan undangan siap");
  const failedCopy = page.getByText("Gagal menyalin tautan");

  await expect(pending.or(copied).or(ready).or(rateLimited).or(failedCopy).first()).toBeVisible({
    timeout: 20_000,
  });

  if (await rateLimited.isVisible().catch(() => false)) {
    throw new Error(
      "Week-invite rate limit hit — clear RateLimitBucket or wait before re-running e2e",
    );
  }

  let inviteUrl = "";
  await expect
    .poll(
      async () => {
        inviteUrl = await page.evaluate(() => {
          const w = window as unknown as { __e2eInviteUrl?: string };
          return w.__e2eInviteUrl || "";
        });
        if (!inviteUrl) {
          inviteUrl = await page.evaluate(() => navigator.clipboard.readText());
        }
        return inviteUrl;
      },
      { timeout: 10_000 },
    )
    .toMatch(/\/invite\/week\?token=/);

  return inviteUrl;
}

test.describe("week share journey", () => {
  test.describe.configure({ mode: "serial", timeout: 90_000 });

  test.skip(
    !creds,
    "Needs E2E_EMAIL/E2E_PASSWORD (onboarded user). auth.setup writes .auth/user.json",
  );

  test.use({
    storageState: creds ? AUTH_STORAGE_PATH : { cookies: [], origins: [] },
  });

  test.beforeEach(async () => {
    await clearWeekInviteRateLimits();
  });

  test("owner copies invite, partner accepts, owner revokes", async ({
    page,
    browser,
  }) => {
    test.skip(
      !partnerCreds,
      "Set E2E_PARTNER_EMAIL and E2E_PARTNER_PASSWORD in .env.e2e",
    );
    test.skip(
      Boolean(
        creds &&
          partnerCreds &&
          creds.email.toLowerCase() === partnerCreds.email.toLowerCase(),
      ),
      "E2E_PARTNER_EMAIL must differ from E2E_EMAIL",
    );

    await page.context().grantPermissions(["clipboard-read", "clipboard-write"]);

    await page.goto("/planner");
    await expect(page).toHaveURL(/\/planner(?:\?|$)/);
    await expect(page.getByText(/Minggu \d+ ·/)).toBeVisible();

    await resetOwnerShareSeat(page);
    const inviteUrl = await copyFreshInviteUrl(page);

    const partnerContext = await browser.newContext({
      baseURL,
      storageState: PARTNER_AUTH_STORAGE_PATH,
    });
    const partnerPage = await partnerContext.newPage();
    try {
      // Prefer path+query so we hit the Playwright baseURL (clipboard may use AUTH_URL host).
      const invitePath = new URL(inviteUrl).pathname + new URL(inviteUrl).search;
      await partnerPage.goto(invitePath);
      await expect(
        partnerPage.getByRole("heading", { name: "Undangan ke plan" }),
      ).toBeVisible({ timeout: 15_000 });
      await expect(
        partnerPage.getByText(/mengundangmu ke minggu/),
      ).toBeVisible();

      await partnerPage.getByRole("button", { name: "Terima" }).click();
      await expect(partnerPage).toHaveURL(/\/planner(?:\?|$)/, {
        timeout: 20_000,
      });
      await expect(
        partnerPage.getByText(/Plan bersama dengan .+ · kamu dapat mengedit/),
      ).toBeVisible({ timeout: 15_000 });
    } finally {
      await partnerContext.close().catch(() => undefined);
    }

    await page.goto("/planner");
    await expect(
      page.getByText("Plan bersama · partner dapat mengedit"),
    ).toBeVisible({ timeout: 15_000 });

    await openShareModal(page);
    await page.getByRole("button", { name: "Cabut akses" }).click();
    await expect(page.getByText("Akses partner dicabut")).toBeVisible({
      timeout: 10_000,
    });
    await page.goto("/planner");
    await expect(
      page.getByRole("button", {
        name: /Bagikan minggu ke partner|^Bagikan$/,
      }),
    ).toBeVisible({ timeout: 15_000 });
  });

  test("owner cannot accept own invite link", async ({ page }) => {
    await page.context().grantPermissions(["clipboard-read", "clipboard-write"]);

    await page.goto("/planner");
    await resetOwnerShareSeat(page);
    const inviteUrl = await copyFreshInviteUrl(page);

    const invitePath = new URL(inviteUrl).pathname + new URL(inviteUrl).search;
    await page.goto(invitePath);
    await expect(
      page.getByRole("heading", { name: "Undangan ke plan" }),
    ).toBeVisible();
    await expect(page.getByText(/mengundangmu ke minggu/)).toBeVisible({
      timeout: 10_000,
    });
    await page.getByRole("button", { name: "Terima" }).click();
    await expect(
      page.getByText("Kamu tidak bisa menerima undangan sendiri."),
    ).toBeVisible({ timeout: 10_000 });

    await page.goto("/planner");
    await openShareModal(page);
    const cancel = page.getByRole("button", { name: "Batalkan undangan" });
    if (await cancel.isVisible().catch(() => false)) {
      await cancel.click();
      await expect(page.getByText("Undangan dibatalkan")).toBeVisible({
        timeout: 10_000,
      });
    }
  });
});
