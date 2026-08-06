"use client";

import { useEffect, useRef } from "react";
import { toast } from "sonner";

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
      toast.error(state.error);
    }
    if (state.success && state.success !== lastSuccess.current) {
      lastSuccess.current = state.success;
      toast.success(state.success);
    }
  }, [state.error, state.success]);
}
