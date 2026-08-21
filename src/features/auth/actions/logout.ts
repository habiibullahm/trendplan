"use server";

import { redirect } from "next/navigation";

/**
 * Clear JWT cookies via the dedicated route (no Auth.js signOut round-trip).
 * Cookie writes are illegal in RSC/actions — clear-session Set-Cookies on the response.
 */
export async function logoutAction() {
  redirect("/api/auth/clear-session");
}
