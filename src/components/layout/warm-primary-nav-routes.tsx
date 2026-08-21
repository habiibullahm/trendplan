"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";

/** Primary shell tabs — warm after idle so the first soft-nav is not a cold compile. */
const PRIMARY_ROUTES = ["/dashboard", "/tren", "/planner", "/akun"] as const;

function isCurrentRoute(pathname: string, href: (typeof PRIMARY_ROUTES)[number]) {
  if (href === "/dashboard") {
    return pathname === "/dashboard" || pathname === "/";
  }
  if (href === "/planner") {
    return pathname === "/planner" || pathname.startsWith("/planner/");
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}

/**
 * Production: `router.prefetch` (Link viewport prefetch is also on).
 * Development: Next disables prefetch; a staggered same-origin GET still makes
 * Turbopack compile each route in the background before the user taps it.
 */
export function WarmPrimaryNavRoutes() {
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    let cancelled = false;
    const routes = PRIMARY_ROUTES.filter((href) => !isCurrentRoute(pathname, href));

    const warm = async () => {
      for (const href of routes) {
        if (cancelled) return;
        if (process.env.NODE_ENV === "development") {
          try {
            await fetch(href, {
              credentials: "same-origin",
              redirect: "manual",
              headers: { Purpose: "prefetch" },
            });
          } catch {
            /* ignore network blips while warming */
          }
          await new Promise((resolve) => {
            window.setTimeout(resolve, 1200);
          });
        } else {
          router.prefetch(href);
        }
      }
    };

    let idleId: number | undefined;
    let timeoutId: number | undefined;
    const start = () => {
      void warm();
    };

    if (typeof window.requestIdleCallback === "function") {
      idleId = window.requestIdleCallback(start, { timeout: 4000 });
    } else {
      timeoutId = window.setTimeout(start, 1800);
    }

    return () => {
      cancelled = true;
      if (idleId != null) window.cancelIdleCallback?.(idleId);
      if (timeoutId != null) window.clearTimeout(timeoutId);
    };
  }, [pathname, router]);

  return null;
}
