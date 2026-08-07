import type { ReactNode } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { ButtonLink } from "@/components/ui/button-link";

export const metadata = {
  title: "Demo · TrendPlan",
  description:
    "Tour baca saja — Beranda, Tren, Planner, dan Akun tanpa login.",
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
        <div className="flex flex-wrap gap-2">
          <ButtonLink href="/register" target="_top" size="sm">
            Daftar
          </ButtonLink>
          <ButtonLink
            href="/"
            target="_top"
            variant="secondary"
            size="sm"
            className="bg-paper"
          >
            Buka Live
          </ButtonLink>
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
