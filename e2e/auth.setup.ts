import { test as setup } from "@playwright/test";
import {
  e2eCredentials,
  saveAuthenticatedStorageState,
} from "./helpers/auth";

const creds = e2eCredentials();

setup("authenticate", async ({ page }) => {
  setup.skip(
    !creds,
    "Set E2E_EMAIL and E2E_PASSWORD (e.g. via .env.e2e) for auth setup",
  );

  await saveAuthenticatedStorageState(page, creds!);
});
