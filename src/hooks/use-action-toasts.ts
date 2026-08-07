"use client";

import { useEffect, useRef } from "react";
import { toast } from "sonner";

const ERROR_TOAST_ID = "action-error";
const SUCCESS_TOAST_ID = "action-success";

/** Fire Sonner toasts when a useActionState result gains error/success. */
export function useActionToasts(state: {
  error?: string;
  success?: string;
}) {
  const lastError = useRef<string | undefined>(undefined);
  const lastSuccess = useRef<string | undefined>(undefined);

  useEffect(() => {
    if (state.error && state.error !== lastError.current) {
      lastError.current = state.error;
      toast.error(state.error, { id: ERROR_TOAST_ID });
    }
    if (state.success && state.success !== lastSuccess.current) {
      lastSuccess.current = state.success;
      toast.success(state.success, { id: SUCCESS_TOAST_ID });
    }
  }, [state.error, state.success]);
}
