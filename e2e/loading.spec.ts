import { expect, test } from "@playwright/test";

const galleryCases = [
  { key: "dashboard", label: "Memuat beranda…" },
  { key: "planner", label: "Memuat planner…" },
  { key: "tren", label: "Memuat tren…" },
  { key: "rekomendasi", label: "Memuat rekomendasi…" },
  { key: "riwayat", label: "Memuat riwayat…" },
  { key: "akun", label: "Memuat akun…" },
] as const;

/**
 * Exercises the shared loading kit via the gated `/e2e/loadings` gallery.
 * Soft-nav loading UIs are too timing-sensitive under Next prefetch to assert
 * reliably; route `loading.tsx` wiring is covered by this gallery instead.
 */
test.describe("e2e loading gallery", () => {
  test("shared page loadings render busy shell, label, and skeletons", async ({
    page,
  }) => {
    const response = await page.goto("/e2e/loadings");
    expect(response?.ok()).toBeTruthy();
    await expect(
      page.getByRole("heading", { name: "E2E loading gallery" }),
    ).toBeVisible();

    for (const { key, label } of galleryCases) {
      const section = page.locator(`[data-loading="${key}"]`);
      const shell = section.locator("[aria-busy='true']");
      await expect(shell).toBeAttached();
      await expect(section.getByText(label)).toBeAttached();
      await expect(
        shell.locator('[data-slot="skeleton"]').first(),
      ).toBeAttached();
    }
  });
});
