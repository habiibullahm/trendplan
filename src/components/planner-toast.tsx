"use client";

import { useEffect, useRef } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";

const MESSAGES: Record<string, string> = {
  created: "Ide ditambahkan ke planner.",
  saved: "Perubahan disimpan.",
};

/** Fires a one-shot Sonner toast from ?toast= then strips it from the URL. */
export function PlannerToastFromQuery() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const shown = useRef(false);

  useEffect(() => {
    const key = searchParams.get("toast");
    if (!key || shown.current) return;
    const message = MESSAGES[key];
    if (message) {
      shown.current = true;
      toast.success(message);
      router.replace(pathname);
    }
  }, [searchParams, pathname, router]);

  return null;
}
