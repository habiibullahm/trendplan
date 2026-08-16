import { expect, test } from "@playwright/test";

/**
 * Public UI smoke — no auth required.
 * Authenticated login is covered once in `auth.setup.ts` (storageState).
 */
test.describe("public shells", () => {
  test("landing shows TrendPlan and auth CTAs", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByText("TrendPlan", { exact: true })).toBeVisible();
    await expect(page.getByRole("link", { name: "Masuk" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Daftar" })).toBeVisible();
  });

  test("login page shows brand, subtitle, and fields", async ({ page }) => {
    await page.goto("/login");
    await expect(page.getByRole("link", { name: "TrendPlan" })).toBeVisible();
    await expect(
      page.getByText("Masuk ke akun creator kamu"),
    ).toBeVisible();
    await expect(page.getByLabel("Email")).toBeVisible();
    await expect(page.getByLabel("Password")).toBeVisible();
  });

  test("register page renders form", async ({ page }) => {
    await page.goto("/register");
    await expect(page.getByRole("link", { name: "TrendPlan" })).toBeVisible();
    await expect(page.getByLabel("Nama")).toBeVisible();
    await expect(page.getByLabel("Email")).toBeVisible();
    await expect(page.getByLabel("Password")).toBeVisible();
  });

  test("forgot-password page renders subtitle", async ({ page }) => {
    await page.goto("/forgot-password");
    await expect(page.getByRole("link", { name: "TrendPlan" })).toBeVisible();
    await expect(
      page.getByText(
        /Kirim tautan reset|Reset password via email belum aktif/,
      ),
    ).toBeVisible();
  });

  test("demo planner shows disabled Bagikan", async ({ page }) => {
    await page.goto("/demo/planner");
    const bagikan = page.getByRole("button", {
      name: "Bagikan minggu ke partner",
    });
    await expect(bagikan).toBeVisible();
    await expect(bagikan).toBeDisabled();
  });

  test("invite week without auth redirects to login with callback", async ({
    page,
  }) => {
    await page.goto("/invite/week?token=e2e-smoke-token");
    await expect(page).toHaveURL(/\/login\?/);
    expect(page.url()).toMatch(/callbackUrl=/);
    expect(decodeURIComponent(page.url())).toMatch(
      /\/invite\/week\?token=e2e-smoke-token/,
    );
  });
});
