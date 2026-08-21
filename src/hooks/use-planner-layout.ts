"use client";

import { useEffect, useState } from "react";

/** Returns viewport layout after mount; `null` until media query is known. */
export function usePlannerLayout(): "list" | "grid" | null {
  const [layout, setLayout] = useState<"list" | "grid" | null>(null);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    const apply = () => setLayout(mq.matches ? "grid" : "list");
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

  return layout;
}

/** @deprecated Prefer usePlannerLayout — kept for callers that only need boolean. */
export function useIsDesktop() {
  const layout = usePlannerLayout();
  return layout === "grid";
}
