import { DashboardPageLoading } from "@/app/loadings";

/**
 * Instant shell feedback while the (app) segment resolves (gate + first child).
 * Route-level loading.tsx still covers soft-nav between tabs once the layout is ready.
 */
export default function AppLoading() {
  return <DashboardPageLoading />;
}
