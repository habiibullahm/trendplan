"use server";

import { signOut } from "@/auth";

/**
 * Auth.js signOut clears the JWT session cookie on the action response.
 * (Edge `/logout` remains for RSC orphan-cookie redirects.)
 */
export async function logoutAction() {
  await signOut({ redirectTo: "/login" });
}
