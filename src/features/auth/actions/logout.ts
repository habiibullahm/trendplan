"use server";

import { signOut } from "@/auth";

/** Thin logout action so Akun RSC does not pull NextAuth into the page module graph. */
export async function logoutAction() {
  await signOut({ redirectTo: "/" });
}
