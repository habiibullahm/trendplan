import type { ReactNode } from "react";
import { TopNav, BottomNav } from "@/components/layout/app-nav";
import { ScrollToTop } from "@/components/layout/scroll-to-top";

export function AppShell({
  children,
  basePath = "",
  banner,
}: {
  children: ReactNode;
  basePath?: string;
  banner?: ReactNode;
}) {
  return (
    <div className="flex min-h-full flex-1 flex-col bg-paper">
      <ScrollToTop />
      {banner}
      <TopNav basePath={basePath} />
      <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col px-4 pb-24 pt-4 md:px-6 md:pb-10 md:pt-6">
        {children}
      </div>
      <BottomNav basePath={basePath} />
    </div>
  );
}
