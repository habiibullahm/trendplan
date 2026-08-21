import type { ReactNode } from "react";
import { TopNav, BottomNav } from "@/components/layout/app-nav";
import { ScrollToTop } from "@/components/layout/scroll-to-top";
import { WarmPrimaryNavRoutes } from "@/components/layout/warm-primary-nav-routes";
import { MediaPlaybackProvider } from "@/features/planner/components/trend-media";

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
      {basePath ? null : <WarmPrimaryNavRoutes />}
      {banner}
      <TopNav basePath={basePath} />
      <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col px-4 pb-24 pt-4 md:px-6 md:pb-10 md:pt-6">
        <MediaPlaybackProvider>{children}</MediaPlaybackProvider>
      </div>
      <BottomNav basePath={basePath} />
    </div>
  );
}
