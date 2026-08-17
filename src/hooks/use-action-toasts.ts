"use client";

import { useEffect, useRef } from "react";
import { toast } from "sonner";
import type { ActionResult } from "@/lib/action-result";

const ERROR_TOAST_ID = "action-error";
const SUCCESS_TOAST_ID = "action-success";

/** Fire Sonner toasts when a useActionState result gains a message. */
export function useActionToasts(state: ActionResult | { status?: string; message?: string }) {
  const lastError = useRef<string | undefined>(undefined);
  const lastSuccess = useRef<string | undefined>(undefined);

  useEffect(() => {
    if (state.status === "error" && state.message && state.message !== lastError.current) {
      lastError.current = state.message;
      toast.error(state.message, { id: ERROR_TOAST_ID });
    }
    if (
      state.status === "success" &&
      state.message &&
      state.message !== lastSuccess.current
    ) {
      lastSuccess.current = state.message;
      toast.success(state.message, { id: SUCCESS_TOAST_ID });
    }
  }, [state.status, state.message]);
}
