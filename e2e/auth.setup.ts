import { test as setup } from "@playwright/test";
import {
  AUTH_STORAGE_PATH,
  PARTNER_AUTH_STORAGE_PATH,
  e2eCredentials,
  saveAuthenticatedStorageState,
} from "./helpers/auth";
import { e2ePartnerCredentials } from "./helpers/partner-user";

const creds = e2eCredentials();
const partnerCreds = e2ePartnerCredentials();

setup("authenticate", async ({ page }) => {
  setup.skip(
    !creds,
    "Set E2E_EMAIL and E2E_PASSWORD (e.g. via .env.e2e) for auth setup",
  );

  await saveAuthenticatedStorageState(page, creds!, AUTH_STORAGE_PATH);
});

setup("authenticate partner", async ({ page }) => {
  setup.skip(
    !partnerCreds,
    "Set E2E_PARTNER_EMAIL and E2E_PARTNER_PASSWORD for week-share accept journey",
  );
  setup.skip(
    Boolean(
      creds &&
        partnerCreds &&
        creds.email.toLowerCase() === partnerCreds.email.toLowerCase(),
    ),
    "E2E_PARTNER_EMAIL must differ from E2E_EMAIL",
  );

  await saveAuthenticatedStorageState(
    page,
    partnerCreds!,
    PARTNER_AUTH_STORAGE_PATH,
  );
});
