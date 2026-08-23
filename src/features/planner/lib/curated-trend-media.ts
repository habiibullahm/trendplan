/**
 * Curated TrendPlan covers under `public/media/trends/covers/**`.
 *
 * Provenance: product-owned SVG posters. Not third-party stock;
 * not TikTok/YouTube CDN URLs. Catalog cards are cover + copy only.
 */
import type { ContentFormat } from "@/generated/prisma/client";
import type { Niche } from "@/lib/niches";

export const CURATED_COVERS = [
  "/media/trends/covers/coral-dusk.svg",
  "/media/trends/covers/sage-morning.svg",
  "/media/trends/covers/ink-night.svg",
  "/media/trends/covers/warm-glow.svg",
] as const;

export type CuratedTrendMedia = {
  coverUrl: string | null;
};

export type CuratedTrendSeedRow = {
  title: string;
  hook: string;
  format: ContentFormat;
  score: number;
  reason: string;
  niche: Niche;
} & CuratedTrendMedia;

type TrendSeedInput = {
  title: string;
  hook: string;
  format: ContentFormat;
  score: number;
  reason: string;
};

/** True when a stored URL still points at the retired `/mocks/` tree. */
export function isMockMediaUrl(url: string | null | undefined): boolean {
  return Boolean(url?.startsWith("/mocks/"));
}

/** True when a stored URL already points at curated `public/media/trends/**`. */
export function isCuratedMediaUrl(url: string | null | undefined): boolean {
  return Boolean(url?.startsWith("/media/trends/"));
}

export function curatedCoverForIndex(index: number): string {
  return CURATED_COVERS[index % CURATED_COVERS.length]!;
}

/** Map a retired `/mocks/...` URL to a curated cover (stable ensure migrate). */
export function rewriteMockMediaUrl(
  url: string | null | undefined,
): string | null {
  if (!url) return null;
  if (!isMockMediaUrl(url)) return url;

  if (url.includes("/covers/") || url.includes("cover")) {
    if (url.includes("sage")) return CURATED_COVERS[1]!;
    if (url.includes("ink")) return CURATED_COVERS[2]!;
    if (url.includes("warm")) return CURATED_COVERS[3]!;
    return CURATED_COVERS[0]!;
  }
  // Retired mock video/audio URLs have no catalog equivalent.
  return null;
}

export function attachCuratedMedia(
  rows: TrendSeedInput[],
  niche: Niche,
): CuratedTrendSeedRow[] {
  return rows.map((t, index) => ({
    ...t,
    niche,
    coverUrl: curatedCoverForIndex(index),
  }));
}

/** Cover already assigned; kept for seed path coverage (no video). */
export function applyCoverOnly(row: CuratedTrendSeedRow): CuratedTrendSeedRow {
  return row;
}

/** Cover null (gradient empty-state path). */
export function applyEmptyMedia(row: CuratedTrendSeedRow): CuratedTrendSeedRow {
  return {
    ...row,
    coverUrl: null,
  };
}

type CoverRow = {
  coverUrl: string | null;
};

/**
 * Ensure backfill:
 * 1. Rewrite `/mocks/` covers → curated (drop retired video/audio URLs).
 * 2. Preserve intentional empty (cover null).
 * 3. Do not invent video/audio.
 */
export function resolveCuratedMediaFields(
  row: CoverRow,
  index: number,
): CoverRow & { changed: boolean } {
  void index;
  const coverUrl = rewriteMockMediaUrl(row.coverUrl);
  return {
    coverUrl,
    changed: coverUrl !== row.coverUrl,
  };
}
