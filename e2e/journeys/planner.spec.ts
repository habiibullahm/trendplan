import { expect, test, type Locator, type Page } from "@playwright/test";
import { AUTH_STORAGE_PATH, e2eCredentials } from "../helpers/auth";

const creds = e2eCredentials();

async function findCreateIdeLink(page: Page): Promise<Locator | null> {
  const createLink = page.getByRole("link", { name: /\+ Buat ide/ });
  if ((await createLink.count()) > 0) return createLink.first();

  // Week chips include "isi N/7" in the accessible name.
  const chips = page.getByRole("link", { name: /isi \d+\/7/ });
  const n = await chips.count();
  for (let i = 0; i < n; i++) {
    const chip = chips.nth(i);
    const label = (await chip.innerText()).replace(/\s+/g, " ");
    if (/isi 7\/7/.test(label)) continue;
    await chip.click();
    await expect(page).toHaveURL(/\/planner\?/);
    try {
      await expect(createLink.first()).toBeVisible({ timeout: 8_000 });
      return createLink.first();
    } catch {
      // try next week
    }
  }
  return null;
}

/** Planner board shows the same title in list + day grid. */
async function expectIdeTitleVisible(page: Page, title: string) {
  await expect(
    page.locator("main").getByText(title, { exact: true }).first(),
  ).toBeVisible();
}

test.describe("planner journey", () => {
  test.skip(
    !creds,
    "Needs E2E_EMAIL/E2E_PASSWORD (onboarded user). auth.setup writes .auth/user.json",
  );

  test.use({
    storageState: creds ? AUTH_STORAGE_PATH : { cookies: [], origins: [] },
  });

  test("create ide, salin daftar, and soft-nav tabs", async ({ page }) => {
    const nav = page.getByRole("navigation", { name: "Navigasi utama" });
    const title = `E2E ide ${Date.now()}`;

    await page.context().grantPermissions(["clipboard-read", "clipboard-write"]);

    // Hard navigation so the week board is fully rendered before we search slots.
    await page.goto("/planner");
    await expect(page).toHaveURL(/\/planner(?:\?|$)/);
    await expect(page.getByText(/Minggu \d+ ·/)).toBeVisible();
    await expect(page.getByText(/\d+\/\d+ terisi/)).toBeVisible();
    await expect(
      page.getByRole("link", { name: /isi \d+\/7/ }).first(),
    ).toBeVisible();

    const createLink = await findCreateIdeLink(page);
    if (!createLink) {
      test.skip(
        true,
        "No empty day slot in this month — free a day or use another E2E user",
      );
      return;
    }

    await createLink.click();
    await expect(page).toHaveURL(/\/planner\/new/);
    await expect(
      page.getByRole("heading", { name: "Buat ide" }),
    ).toBeVisible();

    await page.getByLabel("Judul").fill(title);
    await page.getByRole("button", { name: "Simpan ide" }).click();

    await expect(page).toHaveURL(/\/planner(?:\?|$)/, { timeout: 15_000 });
    await expectIdeTitleVisible(page, title);
    const weekPlannerUrl = page.url();

    await page
      .getByRole("button", { name: "Salin daftar rencana minggu ini" })
      .click();
    await expect(page.getByText("Daftar minggu disalin")).toBeVisible({
      timeout: 10_000,
    });

    await nav.getByRole("link", { name: "Tren" }).click();
    await expect(page).toHaveURL(/\/tren(?:\?|$)/);
    await expect(page.locator("main[aria-busy='true']")).toHaveCount(0);

    await nav.getByRole("link", { name: "Plan" }).click();
    await expect(page).toHaveURL(/\/planner(?:\?|$)/);
    // Plan nav returns to default week — reopen the week where we created the ide.
    await page.goto(weekPlannerUrl);
    await expectIdeTitleVisible(page, title);

    await nav.getByRole("link", { name: "Beranda" }).click();
    await expect(page).toHaveURL(/\/dashboard(?:\?|$)/);
  });
});
