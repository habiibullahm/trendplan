"use client";

import { Toaster } from "sonner";

export function AppToaster() {
  return (
    <Toaster
      theme="light"
      position="bottom-center"
      richColors={false}
      closeButton={false}
      duration={4000}
      gap={10}
      offset={{ bottom: "1.5rem" }}
      mobileOffset={{ bottom: "5.5rem" }}
      style={{ ["--width" as string]: "max-content" }}
      toastOptions={{
        classNames: {
          toast:
            "tp-toast group rounded-2xl border border-border bg-surface text-ink font-sans shadow-none!",
          title: "text-sm font-semibold text-ink!",
          description: "text-sm text-ink-muted!",
          success: "tp-toast-success",
          error: "tp-toast-error",
        },
      }}
    />
  );
}
