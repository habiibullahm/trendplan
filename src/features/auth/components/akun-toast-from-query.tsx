"use client";

import { useEffect, useRef } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { ActionErrors } from "@/lib/action-result";

const SUCCESS_TOAST_ID = "action-success";

const TOAST_MESSAGES: Record<string, string> = {
  password_changed: ActionErrors.passwordChanged,
};

/** One-shot Sonner toast from ?toast= on Akun (e.g. after password change redirect). */
export function AkunToastFromQuery() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const shownKey = useRef<string | null>(null);

  useEffect(() => {
    const key = searchParams.get("toast");
    if (!key) {
      shownKey.current = null;
      return;
    }

    const message = TOAST_MESSAGES[key];
    if (!message) return;
    if (shownKey.current === key) return;
    shownKey.current = key;

    toast.success(message, { id: SUCCESS_TOAST_ID });

    const next = new URLSearchParams(searchParams.toString());
    next.delete("toast");
    const qs = next.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname);
  }, [pathname, router, searchParams]);

  return null;
}
