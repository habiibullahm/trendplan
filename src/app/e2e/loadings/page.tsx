import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  ActivityEditPageLoading,
  AdminFeedbackPageLoading,
  AkunPageLoading,
  DashboardPageLoading,
  PlannerPageLoading,
  RekomendasiPageLoading,
  RiwayatPageLoading,
  TrenPageLoading,
} from "@/app/loadings";

export const metadata: Metadata = {
  title: "E2E loading gallery",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

/**
 * Dev/e2e-only gallery of shared route loading skeletons.
 * Requires `E2E_LOADING_GALLERY=1` and a non-production runtime
 * (Playwright webServer sets the flag under `next dev`).
 * Never enabled on production / Vercel production deploys.
 */
function isLoadingGalleryEnabled() {
  if (process.env.E2E_LOADING_GALLERY !== "1") return false;
  if (process.env.NODE_ENV === "production") return false;
  if (process.env.VERCEL_ENV === "production") return false;
  return true;
}

export default function E2ELoadingGalleryPage() {
  if (!isLoadingGalleryEnabled()) notFound();

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-10 px-4 py-8">
      <h1 className="font-[family-name:var(--font-fraunces)] text-2xl font-semibold text-ink">
        E2E loading gallery
      </h1>
      <section data-loading="dashboard">
        <DashboardPageLoading as="div" />
      </section>
      <section data-loading="planner">
        <PlannerPageLoading as="div" />
      </section>
      <section data-loading="tren">
        <TrenPageLoading as="div" />
      </section>
      <section data-loading="rekomendasi">
        <RekomendasiPageLoading as="div" />
      </section>
      <section data-loading="riwayat">
        <RiwayatPageLoading as="div" />
      </section>
      <section data-loading="akun">
        <AkunPageLoading as="div" />
      </section>
      <section data-loading="aktivitas-edit">
        <ActivityEditPageLoading as="div" />
      </section>
      <section data-loading="admin-feedback">
        <AdminFeedbackPageLoading as="div" />
      </section>
    </div>
  );
}
