"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { scrollWindowTop } from "@/components/layout/scroll-to-top";
import { usePlannerLayout } from "@/hooks/use-planner-layout";

const primaryNav = [
  { href: "/dashboard", label: "Beranda" },
  { href: "/tren", label: "Tren" },
  { href: "/planner", label: "Plan" },
  { href: "/akun", label: "Akun" },
] as const;

function withBase(basePath: string, href: string) {
  if (!basePath) return href;
  return `${basePath}${href}`;
}

function isActive(pathname: string, href: string, basePath = "") {
  const full = withBase(basePath, href);
  if (href === "/dashboard") {
    return (
      pathname === full ||
      pathname === basePath ||
      pathname === `${basePath}/`
    );
  }
  if (href === "/planner") {
    return pathname === full || pathname.startsWith(`${full}/`);
  }
  return pathname === full || pathname.startsWith(`${full}/`);
}

export function TopNav({ basePath = "" }: { basePath?: string }) {
  const pathname = usePathname();
  const layout = usePlannerLayout();
  const homeHref = withBase(basePath, "/dashboard");
  const prefetchTabs = layout === "grid";

  return (
    <header className="sticky top-0 z-40 hidden border-b border-border bg-surface/95 backdrop-blur-sm md:block">
      <div className="mx-auto flex w-full max-w-5xl items-center justify-between gap-4 px-6 py-3">
        <Link
          href={homeHref}
          className="font-[family-name:var(--font-fraunces)] text-xl font-semibold text-ink transition-opacity hover:opacity-80"
        >
          TrendPlan
        </Link>
        <nav className="flex items-center gap-1" aria-label="Navigasi utama">
          {primaryNav.map((item) => {
            const href = withBase(basePath, item.href);
            const active = isActive(pathname, item.href, basePath);
            return (
              <Link
                key={item.href}
                href={href}
                prefetch={prefetchTabs}
                onClick={() => {
                  if (item.href === "/tren") scrollWindowTop({ smooth: false });
                }}
                className={`min-touch inline-flex items-center justify-center rounded-xl px-4 text-sm font-semibold transition-colors duration-200 ${
                  active
                    ? "bg-coral/10 text-coral hover:bg-coral/15"
                    : "text-ink-muted hover:bg-coral/5 hover:text-ink"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}

export function BottomNav({ basePath = "" }: { basePath?: string }) {
  const pathname = usePathname();
  const layout = usePlannerLayout();
  const prefetchTabs = layout === "list";

  return (
    <nav
      aria-label="Navigasi bawah"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-surface pb-[env(safe-area-inset-bottom)] md:hidden"
    >
      <ul className="mx-auto grid max-w-lg grid-cols-4">
        {primaryNav.map((item) => {
          const href = withBase(basePath, item.href);
          const active = isActive(pathname, item.href, basePath);
          return (
            <li key={item.href}>
              <Link
                href={href}
                prefetch={prefetchTabs}
                onClick={() => {
                  if (item.href === "/tren") scrollWindowTop({ smooth: false });
                }}
                className={`group min-touch flex flex-col items-center justify-center gap-0.5 px-1 text-xs font-semibold transition-colors duration-200 ${
                  active
                    ? "text-coral"
                    : "text-ink-muted hover:text-ink"
                }`}
              >
                <span
                  className={`h-1 w-1 rounded-full transition-colors duration-200 ${
                    active
                      ? "bg-coral"
                      : "bg-transparent group-hover:bg-ink-muted/50"
                  }`}
                  aria-hidden
                />
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
