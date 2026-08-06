import { auth } from "@/auth";

/** auth() that treats invalid/expired JWT as logged out (no throw). */
export async function getSafeSession() {
  try {
    return await auth();
  } catch {
    return null;
  }
}
