import { expect, type Page } from "@playwright/test";

export type E2ECredentials = {
  email: string;
  password: string;
};

/** Returns credentials when `E2E_EMAIL` / `E2E_PASSWORD` are set. */
export function e2eCredentials(): E2ECredentials | null {
  const email = process.env.E2E_EMAIL;
  const password = process.env.E2E_PASSWORD;
  if (!email || !password) return null;
  return { email, password };
}

/**
 * Credentials login. Lands on dashboard, onboarding, or verify-email.
 */
export async function loginWithCredentials(
  page: Page,
  creds: E2ECredentials,
) {
  await page.goto("/login");
  await page.getByLabel("Email").fill(creds.email);
  await page.getByLabel("Password").fill(creds.password);
  await page.getByRole("button", { name: "Masuk" }).click();

  await expect(page).not.toHaveURL(/\/login(?:\?|$)/, { timeout: 15_000 });
  await expect(page).toHaveURL(
    /\/(dashboard|onboarding|verify-email)(?:\?|$)/,
  );
}
