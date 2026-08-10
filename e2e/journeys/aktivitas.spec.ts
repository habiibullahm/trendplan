import { expect, test } from "@playwright/test";
import { AUTH_STORAGE_PATH, e2eCredentials } from "../helpers/auth";

const creds = e2eCredentials();

test.describe("aktivitas journey", () => {
  test.skip(
    !creds,
    "Needs E2E_EMAIL/E2E_PASSWORD (onboarded user). auth.setup writes .auth/user.json",
  );

  test.use({
    storageState: creds ? AUTH_STORAGE_PATH : { cookies: [], origins: [] },
  });

  test("create multi-line activities on Aktivitas tab", async ({ page }) => {
    const stamp = Date.now();
    const first = `E2E picnic ${stamp}`;
    const second = `E2E nonton ${stamp}`;

    await page.goto("/planner?tab=aktivitas");
    await expect(page).toHaveURL(/tab=aktivitas/);
    await expect(
      page.getByRole("navigation", { name: "Tab planner" }),
    ).toBeVisible();
    await expect(
      page.getByRole("link", { name: "Aktivitas", exact: true }),
    ).toHaveAttribute("aria-current", "page");

    await page.getByRole("link", { name: /\+ Tambah/ }).first().click();
    await expect(page).toHaveURL(/\/planner\/aktivitas\/new/);
    await expect(
      page.getByRole("heading", { name: "Tambah aktivitas" }),
    ).toBeVisible();

    await page.getByLabel("Aktivitas").fill(`${first}\n${second}`);
    await expect(page.getByText(first, { exact: true })).toBeVisible();
    await expect(page.getByText(second, { exact: true })).toBeVisible();

    await page.getByRole("button", { name: /Simpan 2 aktivitas/ }).click();
    await expect(page).toHaveURL(/tab=aktivitas/, { timeout: 15_000 });
    await expect(page.locator("main").getByText(first, { exact: true })).toBeVisible();
    await expect(page.locator("main").getByText(second, { exact: true })).toBeVisible();
  });
});
