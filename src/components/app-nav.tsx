"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const primaryNav = [
  { href: "/dashboard", label: "Beranda" },
  { href: "/tren", label: "Tren" },
  { href: "/planner", label: "Plan" },
  { href: "/lain", label: "Lain" },
] as const;

function isActive(pathname: string, href: string) {
  if (href === "/dashboard") {
    return pathname === "/dashboard";
  }
  if (href === "/planner") {
    return pathname === "/planner" || pathname.startsWith("/planner/");
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function TopNav() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 hidden border-b border-border bg-surface/95 backdrop-blur-sm md:block">
      <div className="mx-auto flex w-full max-w-5xl items-center justify-between gap-4 px-6 py-3">
        <Link
          href="/dashboard"
          className="font-[family-name:var(--font-fraunces)] text-xl font-semibold text-ink"
        >
          TrendPlan
        </Link>
        <nav className="flex items-center gap-1" aria-label="Navigasi utama">
          {primaryNav.map((item) => {
            const active = isActive(pathname, item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`min-touch inline-flex items-center justify-center rounded-xl px-4 text-sm font-semibold transition-colors ${
                  active
                    ? "bg-coral/10 text-coral"
                    : "text-ink-muted hover:bg-paper hover:text-ink"
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

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Navigasi bawah"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-surface pb-[env(safe-area-inset-bottom)] md:hidden"
    >
      <ul className="mx-auto grid max-w-lg grid-cols-4">
        {primaryNav.map((item) => {
          const active = isActive(pathname, item.href);
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                className={`min-touch flex flex-col items-center justify-center gap-0.5 px-1 text-xs font-semibold ${
                  active ? "text-coral" : "text-ink-muted"
                }`}
              >
                <span
                  className={`h-1 w-1 rounded-full ${active ? "bg-coral" : "bg-transparent"}`}
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
