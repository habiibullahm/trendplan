"use client";

import { useEffect, useLayoutEffect, useState } from "react";
import { usePathname } from "next/navigation";

export function scrollWindowTop(opts?: { smooth?: boolean }) {
  window.scrollTo({
    top: 0,
    left: 0,
    behavior: opts?.smooth === false ? "auto" : "smooth",
  });
}

function shouldHandlePath(pathname: string) {
  return (
    pathname === "/tren" ||
    pathname === "/rekomendasi" ||
    pathname === "/demo/tren" ||
    pathname === "/demo/rekomendasi" ||
    pathname.endsWith("/tren") ||
    pathname.endsWith("/rekomendasi")
  );
}

const SHOW_AFTER_PX = 320;
/** Hide FAB when within this many px of the document bottom. */
const BOTTOM_HIDE_PX = 80;

function ArrowUpIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M12 19V5" />
      <path d="M5 12l7-7 7 7" />
    </svg>
  );
}

/**
 * Auto scroll-to-top on Tren/Rekomendasi navigations, plus an up-arrow
 * control when scrolled mid-page (hidden at top and when flush at bottom).
 */
export function ScrollToTop() {
  const pathname = usePathname();
  const [visible, setVisible] = useState(false);
  const onTargetPage = shouldHandlePath(pathname);

  useLayoutEffect(() => {
    if (!onTargetPage) {
      window.history.scrollRestoration = "auto";
      return;
    }
    window.history.scrollRestoration = "manual";
    return () => {
      window.history.scrollRestoration = "auto";
    };
  }, [onTargetPage]);

  useLayoutEffect(() => {
    if (!shouldHandlePath(pathname)) return;

    const raw = window.location.hash.slice(1);
    if (raw) {
      let id = raw;
      try {
        id = decodeURIComponent(raw);
      } catch {
        /* keep raw */
      }
      const toHash = () => {
        const el = document.getElementById(id);
        if (el) {
          el.scrollIntoView({ block: "start" });
          return true;
        }
        return false;
      };
      if (!toHash()) {
        window.scrollTo(0, 0);
        const t1 = window.setTimeout(() => {
          if (!toHash()) window.scrollTo(0, 0);
        }, 50);
        return () => window.clearTimeout(t1);
      }
      return;
    }

    window.scrollTo(0, 0);
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
    const t0 = window.setTimeout(() => window.scrollTo(0, 0), 0);
    const t1 = window.setTimeout(() => window.scrollTo(0, 0), 50);
    return () => {
      window.clearTimeout(t0);
      window.clearTimeout(t1);
    };
  }, [pathname]);

  useEffect(() => {
    if (!onTargetPage) return;

    const onScroll = () => {
      const el = document.scrollingElement ?? document.documentElement;
      const y = window.scrollY || el.scrollTop;
      const scrollable = el.scrollHeight - el.clientHeight;
      const canHideAtBottom =
        scrollable > SHOW_AFTER_PX + BOTTOM_HIDE_PX;
      const atBottom =
        canHideAtBottom &&
        y + el.clientHeight >= el.scrollHeight - BOTTOM_HIDE_PX;
      const next = y > SHOW_AFTER_PX && !atBottom;
      setVisible(next);
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [onTargetPage, pathname]);

  if (!onTargetPage || !visible) return null;

  return (
    <button
      type="button"
      onClick={() => {
        scrollWindowTop();
        setVisible(false);
      }}
      aria-label="Kembali ke atas"
      className="min-touch fixed bottom-[calc(3.5rem+env(safe-area-inset-bottom,0px)+0.75rem)] right-4 z-50 inline-flex h-11 w-11 items-center justify-center rounded-full border border-border bg-surface text-ink shadow-sm transition-colors hover:border-coral/40 hover:text-coral md:bottom-6"
    >
      <ArrowUpIcon />
    </button>
  );
}
