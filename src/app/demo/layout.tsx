import Link from "next/link";
import type { ReactNode } from "react";
import { AppShell } from "@/components/app-shell";

export const metadata = {
  title: "Demo · TrendPlan",
  description:
    "Tour baca saja — Beranda, Tren, Planner, dan Lain tanpa login.",
  robots: { index: false, follow: true },
};

function DemoBanner() {
  return (
    <div className="border-b border-border bg-surface">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-3 px-4 py-3 md:flex-row md:items-center md:justify-between md:px-6">
        <p className="text-sm text-ink-muted">
          <span className="font-semibold text-ink">Demo baca saja</span>
          {" — "}
          jelajahi tab aplikasi. Seret & edit butuh akun.
        </p>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/register"
            target="_top"
            className="min-touch inline-flex items-center justify-center rounded-xl bg-coral px-4 py-2 text-sm font-semibold text-white"
          >
            Daftar
          </Link>
          <Link
            href="/"
            target="_top"
            className="min-touch inline-flex items-center justify-center rounded-xl border border-border bg-paper px-4 py-2 text-sm font-semibold text-ink"
          >
            Buka Live
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function DemoLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-full flex-1 flex-col bg-paper text-ink">
      <AppShell basePath="/demo" banner={<DemoBanner />}>
        {children}
      </AppShell>
    </div>
  );
}
