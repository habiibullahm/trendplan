import { LogoutButton } from "@/features/auth/components/logout-button";
import { logoutAction } from "@/features/auth/actions/logout";

/** Isolated so Akun page can dynamic-import without pulling Auth.js into the first RSC graph. */
export function LogoutForm() {
  return (
    <form className="mt-6" action={logoutAction}>
      <LogoutButton />
    </form>
  );
}
