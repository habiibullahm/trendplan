/**
 * Curated TrendPlan media under `public/media/trends/**`.
 *
 * Provenance: product-owned assets (brand SVG posters + short fixture loops/tones).
 * Not third-party stock; not TikTok/YouTube CDN URLs.
 */
import type { ContentFormat } from "@/generated/prisma/client";
import type { Niche } from "@/lib/niches";

export const CURATED_COVERS = [
  "/media/trends/covers/coral-dusk.svg",
  "/media/trends/covers/sage-morning.svg",
  "/media/trends/covers/ink-night.svg",
  "/media/trends/covers/warm-glow.svg",
] as const;

/**
 * Shared short muted loop referenced across niches.
 * One file (~1.1MB) — a second distinct loop would need ffmpeg compression
 * to stay under ~1MB without bloating the repo; add another path entry when available.
 */
export const CURATED_VIDEOS = ["/media/trends/video/loop-soft.mp4"] as const;

export const CURATED_AUDIO_TITLES = [
  "original sound — date night",
  "soft piano loop",
  "cafe ambience",
  "lofi beat",
  "trending audio",
] as const;

export const CURATED_AUDIO_URLS = [
  "/media/trends/audio/loop-soft.wav",
  "/media/trends/audio/loop-warm.wav",
] as const;

export type CuratedTrendMedia = {
  coverUrl: string | null;
  videoUrl: string | null;
  audioTitle: string | null;
  audioUrl: string | null;
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

export function curatedVideoForIndex(index: number): string {
  return CURATED_VIDEOS[index % CURATED_VIDEOS.length]!;
}

export function curatedAudioTitleForIndex(index: number): string {
  return CURATED_AUDIO_TITLES[index % CURATED_AUDIO_TITLES.length]!;
}

export function curatedAudioUrlForIndex(index: number): string | null {
  if (index % 2 !== 0) return null;
  return CURATED_AUDIO_URLS[index % CURATED_AUDIO_URLS.length]!;
}

/** Map a retired `/mocks/...` URL to a curated equivalent (stable ensure migrate). */
export function rewriteMockMediaUrl(
  url: string | null | undefined,
): string | null {
  if (!url) return null;
  if (!isMockMediaUrl(url)) return url;

  if (url.includes("/covers/")) {
    if (url.includes("sage")) return CURATED_COVERS[1]!;
    if (url.includes("ink")) return CURATED_COVERS[2]!;
    if (url.includes("warm")) return CURATED_COVERS[3]!;
    return CURATED_COVERS[0]!;
  }
  if (url.includes("/video/")) return CURATED_VIDEOS[0]!;
  if (url.includes("/audio/")) {
    if (url.includes("tone-b")) return CURATED_AUDIO_URLS[1]!;
    return CURATED_AUDIO_URLS[0]!;
  }
  return url;
}

export function attachCuratedMedia(
  rows: TrendSeedInput[],
  niche: Niche,
): CuratedTrendSeedRow[] {
  return rows.map((t, index) => ({
    ...t,
    niche,
    coverUrl: curatedCoverForIndex(index),
    videoUrl: curatedVideoForIndex(index),
    audioTitle: curatedAudioTitleForIndex(index),
    audioUrl: curatedAudioUrlForIndex(index),
  }));
}

/** Cover set; video/audio cleared (null-video path). */
export function applyCoverOnly(row: CuratedTrendSeedRow): CuratedTrendSeedRow {
  return {
    ...row,
    videoUrl: null,
    audioUrl: null,
  };
}

/** All media null (gradient empty-state path). */
export function applyEmptyMedia(row: CuratedTrendSeedRow): CuratedTrendSeedRow {
  return {
    ...row,
    coverUrl: null,
    videoUrl: null,
    audioTitle: null,
    audioUrl: null,
  };
}

type MediaRow = {
  coverUrl: string | null;
  videoUrl: string | null;
  audioTitle: string | null;
  audioUrl: string | null;
};

/**
 * Ensure backfill:
 * 1. Rewrite `/mocks/` → curated.
 * 2. Fill remaining nulls for normal / incomplete rows.
 * 3. Preserve intentional empty (all media null) and curated cover-only
 *    (cover already under `/media/trends/`, video null — not a mock video).
 */
export function resolveCuratedMediaFields(
  row: MediaRow,
  index: number,
): MediaRow & { changed: boolean } {
  const hadMock =
    isMockMediaUrl(row.coverUrl) ||
    isMockMediaUrl(row.videoUrl) ||
    isMockMediaUrl(row.audioUrl);

  const intentionalEmpty =
    row.coverUrl == null &&
    row.videoUrl == null &&
    row.audioUrl == null &&
    !hadMock;

  if (intentionalEmpty) {
    const audioTitle =
      row.audioTitle && !/\(mock\)/i.test(row.audioTitle)
        ? row.audioTitle
        : null;
    return {
      coverUrl: null,
      videoUrl: null,
      audioTitle,
      audioUrl: null,
      changed: audioTitle !== row.audioTitle,
    };
  }

  // Cover-only only when cover is already curated and video was never a mock URL.
  // Incomplete rows (null/non-curated cover + null video) still get video backfilled.
  // `/mocks/` video rewrites below regardless.
  const intentionalCoverOnly =
    row.videoUrl == null && isCuratedMediaUrl(row.coverUrl);

  let coverUrl = rewriteMockMediaUrl(row.coverUrl);
  let videoUrl = rewriteMockMediaUrl(row.videoUrl);
  let audioUrl = rewriteMockMediaUrl(row.audioUrl);
  let audioTitle = row.audioTitle;

  if (coverUrl == null) {
    coverUrl = curatedCoverForIndex(index);
  }

  if (intentionalCoverOnly) {
    videoUrl = null;
  } else if (videoUrl == null) {
    videoUrl = curatedVideoForIndex(index);
  }

  if (audioTitle == null || /\(mock\)/i.test(audioTitle)) {
    audioTitle = curatedAudioTitleForIndex(index);
  }

  if (audioUrl == null && !intentionalCoverOnly) {
    audioUrl = curatedAudioUrlForIndex(index);
  }

  return {
    coverUrl,
    videoUrl,
    audioTitle,
    audioUrl,
    changed:
      coverUrl !== row.coverUrl ||
      videoUrl !== row.videoUrl ||
      audioTitle !== row.audioTitle ||
      audioUrl !== row.audioUrl,
  };
}
