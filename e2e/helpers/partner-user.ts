import type { E2ECredentials } from "./auth";
import { e2eCredentials } from "./auth";

/** Second onboarded user for partner week-share accept journeys. */
export function e2ePartnerCredentials(): E2ECredentials | null {
  const email = process.env.E2E_PARTNER_EMAIL;
  const password = process.env.E2E_PARTNER_PASSWORD;
  if (!email || !password) return null;

  const owner = e2eCredentials();
  if (owner && owner.email.toLowerCase() === email.toLowerCase()) {
    return null;
  }
  return { email, password };
}
