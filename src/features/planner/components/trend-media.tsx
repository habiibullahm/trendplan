"use client";

import Link from "next/link";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useId,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type { TrendMediaFields } from "@/features/planner/lib/trend-media-types";

export type { TrendMediaFields };

type PlaybackApi = {
  register: (id: string, stop: () => void) => void;
  unregister: (id: string) => void;
  claim: (id: string) => void;
};

const MediaPlaybackContext = createContext<PlaybackApi | null>(null);

export function MediaPlaybackProvider({ children }: { children: ReactNode }) {
  const stopsRef = useRef(new Map<string, () => void>());
  const activeRef = useRef<string | null>(null);

  const register = useCallback((id: string, stop: () => void) => {
    stopsRef.current.set(id, stop);
  }, []);

  const unregister = useCallback((id: string) => {
    stopsRef.current.delete(id);
    if (activeRef.current === id) activeRef.current = null;
  }, []);

  const claim = useCallback((id: string) => {
    if (activeRef.current && activeRef.current !== id) {
      stopsRef.current.get(activeRef.current)?.();
    }
    activeRef.current = id;
  }, []);

  return (
    <MediaPlaybackContext.Provider value={{ register, unregister, claim }}>
      {children}
    </MediaPlaybackContext.Provider>
  );
}

function useMediaSlot(kind: "video" | "audio") {
  const ctx = useContext(MediaPlaybackContext);
  const reactId = useId();
  const id = `${kind}:${reactId}`;
  const stopRef = useRef<() => void>(() => {});

  useEffect(() => {
    if (!ctx) return;
    ctx.register(id, () => stopRef.current());
    return () => ctx.unregister(id);
  }, [ctx, id]);

  const claim = useCallback(() => {
    ctx?.claim(id);
  }, [ctx, id]);

  return { claim, stopRef };
}

function mediaUrl(value?: string | null): string | null {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

/** Soft coral→paper wash; readable on light and dark `bg-surface`. */
const EMPTY_COVER_GRADIENT =
  "linear-gradient(145deg, color-mix(in srgb, var(--color-coral) 72%, white), color-mix(in srgb, var(--color-coral) 35%, var(--color-surface)), color-mix(in srgb, var(--color-coral) 18%, var(--color-paper)))";

/**
 * Media chrome must NOT use `bg-ink` / `text-ink`: in dark mode ink flips to
 * near-white, so `bg-ink/65 text-white` becomes white-on-white (invisible Putar).
 */
function MockBadge() {
  return (
    <span className="pointer-events-none absolute bottom-2 right-2 z-20 rounded bg-black/55 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white backdrop-blur-sm">
      Mock
    </span>
  );
}

function CoverPlaceholder({
  coverUrl,
  className,
  showBadge = true,
}: {
  coverUrl?: string | null;
  className?: string;
  showBadge?: boolean;
}) {
  const src = mediaUrl(coverUrl);
  return (
    <div
      className={`overflow-hidden bg-surface ${className ?? "relative"}`}
      style={
        src
          ? undefined
          : {
              backgroundImage: EMPTY_COVER_GRADIENT,
            }
      }
    >
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element -- local mock SVG/poster
        <img
          src={src}
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
        />
      ) : null}
      {showBadge ? <MockBadge /> : null}
    </div>
  );
}

const AUTOPLAY_RATIO = 0.6;
/** Keep bottom nav / safe area out of the “primary view” region (~72px). */
const AUTOPLAY_ROOT_MARGIN = "0px 0px -72px 0px";
const VIDEO_READY_MS = 8000;

function waitForVideoReady(el: HTMLVideoElement): Promise<void> {
  if (el.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) {
    return Promise.resolve();
  }
  return new Promise((resolve, reject) => {
    const timer = window.setTimeout(() => {
      cleanup();
      reject(new Error("video ready timeout"));
    }, VIDEO_READY_MS);
    const onReady = () => {
      cleanup();
      resolve();
    };
    const onError = () => {
      cleanup();
      reject(new Error("video error"));
    };
    const cleanup = () => {
      window.clearTimeout(timer);
      el.removeEventListener("loadeddata", onReady);
      el.removeEventListener("canplay", onReady);
      el.removeEventListener("error", onError);
    };
    el.addEventListener("loadeddata", onReady);
    el.addEventListener("canplay", onReady);
    el.addEventListener("error", onError);
    // Kick network fetch for mock mp4 when metadata-only preload is too late.
    el.load();
  });
}

/** Full Tren card media: cover/video + optional audio row. */
export function TrendMediaBlock({ media }: { media: TrendMediaFields }) {
  const frameRef = useRef<HTMLDivElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const userPausedRef = useRef(false);
  const playGenRef = useRef(0);
  const inViewRef = useRef(false);
  const [playing, setPlaying] = useState(false);
  const { claim, stopRef } = useMediaSlot("video");
  const videoSrc = mediaUrl(media.videoUrl);
  const coverSrc = mediaUrl(media.coverUrl);
  const hasVideo = Boolean(videoSrc);

  useEffect(() => {
    stopRef.current = () => {
      const el = videoRef.current;
      if (!el) return;
      el.pause();
      setPlaying(false);
    };
  }, [stopRef]);

  useEffect(() => {
    if (!hasVideo) return;
    const frame = frameRef.current;
    if (!frame) return;

    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    const playInView = async () => {
      const el = videoRef.current;
      if (!el || userPausedRef.current) return;
      const gen = ++playGenRef.current;
      claim();
      el.muted = true;
      try {
        await waitForVideoReady(el);
        if (
          gen !== playGenRef.current ||
          userPausedRef.current ||
          !inViewRef.current
        ) {
          return;
        }
        await el.play();
        if (gen !== playGenRef.current || !inViewRef.current) {
          el.pause();
          return;
        }
        setPlaying(true);
      } catch {
        if (gen === playGenRef.current) setPlaying(false);
      }
    };

    const pauseOutOfView = () => {
      playGenRef.current += 1;
      const el = videoRef.current;
      if (!el) return;
      el.pause();
      setPlaying(false);
      // Keep userPausedRef — intentional pause survives scroll jitter.
    };

    if (reducedMotion) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (!entry) return;
        const active =
          entry.isIntersecting && entry.intersectionRatio >= AUTOPLAY_RATIO;
        inViewRef.current = active;
        if (active) {
          void playInView();
        } else {
          pauseOutOfView();
          // Fully off-screen: allow autoplay again on next primary view.
          if (entry.intersectionRatio === 0) {
            userPausedRef.current = false;
          }
        }
      },
      {
        threshold: [0, AUTOPLAY_RATIO, 1],
        rootMargin: AUTOPLAY_ROOT_MARGIN,
      },
    );

    observer.observe(frame);
    return () => {
      playGenRef.current += 1;
      observer.disconnect();
    };
  }, [hasVideo, claim]);

  async function toggleVideo() {
    const el = videoRef.current;
    if (!el || !hasVideo) return;
    if (el.paused) {
      userPausedRef.current = false;
      claim();
      el.muted = true;
      const gen = ++playGenRef.current;
      try {
        await waitForVideoReady(el);
        if (gen !== playGenRef.current) return;
        await el.play();
        if (gen !== playGenRef.current) return;
        setPlaying(true);
      } catch {
        if (gen === playGenRef.current) setPlaying(false);
      }
    } else {
      userPausedRef.current = true;
      playGenRef.current += 1;
      el.pause();
      setPlaying(false);
    }
  }

  return (
    <div className="space-y-3">
      {/* Phone-frame width: full-bleed 9/14 on desktop is ~1500px tall. */}
      <div
        ref={frameRef}
        className="relative mx-auto aspect-[9/14] w-full max-w-[17.5rem] overflow-hidden rounded-xl border border-border bg-surface"
      >
        {/* Cover/gradient always underneath; video + Putar only when videoUrl is set. */}
        <CoverPlaceholder
          coverUrl={coverSrc}
          className="absolute inset-0 z-0"
          showBadge={!hasVideo}
        />
        {hasVideo ? (
          <>
            <video
              ref={videoRef}
              className="absolute inset-0 z-[1] h-full w-full object-cover"
              src={videoSrc!}
              poster={coverSrc ?? undefined}
              playsInline
              preload="auto"
              muted
              loop
              onPause={() => setPlaying(false)}
              onPlay={() => setPlaying(true)}
            />
            <button
              type="button"
              onClick={toggleVideo}
              aria-label={playing ? "Jeda video" : "Putar video"}
              className={`absolute inset-0 z-20 flex items-center justify-center transition-colors ${
                playing
                  ? "bg-transparent"
                  : "bg-black/40 hover:bg-black/50"
              }`}
            >
              {playing ? null : (
                <span className="min-touch inline-flex min-w-11 items-center justify-center gap-1.5 rounded-full border border-white/60 bg-black/70 px-5 text-sm font-semibold text-white shadow-md">
                  <span aria-hidden className="text-base leading-none text-white">
                    ▶
                  </span>
                  <span className="text-white">Putar</span>
                </span>
              )}
            </button>
            <MockBadge />
          </>
        ) : null}
      </div>
      <TrendAudioRow media={media} />
    </div>
  );
}

/** Compact thumb + ♪ line (Beranda / Rekomendasi). No video player. */
export function CompactTrendMedia({
  media,
  title,
  titleHref,
}: {
  media: TrendMediaFields;
  title: string;
  /** Optional link on the title only (keeps ♪ tappable). */
  titleHref?: string;
}) {
  return (
    <div className="flex gap-3">
      <CoverPlaceholder
        coverUrl={media.coverUrl}
        className="relative h-16 w-12 shrink-0 rounded-lg border border-border"
      />
      <div className="min-w-0 flex-1">
        {titleHref ? (
          <Link
            href={titleHref}
            className="block truncate text-sm font-semibold text-ink transition-colors hover:text-coral"
          >
            {title}
          </Link>
        ) : (
          <p className="truncate text-sm font-semibold text-ink">{title}</p>
        )}
        <div className="mt-1">
          <TrendAudioRow media={media} compact />
        </div>
      </div>
    </div>
  );
}

export function TrendAudioRow({
  media,
  compact = false,
}: {
  media: TrendMediaFields;
  compact?: boolean;
}) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState(false);
  const { claim, stopRef } = useMediaSlot("audio");
  const label = media.audioTitle?.trim() || null;
  const audioSrc = mediaUrl(media.audioUrl);
  const hasAudio = Boolean(audioSrc);

  useEffect(() => {
    stopRef.current = () => {
      const el = audioRef.current;
      if (!el) return;
      el.pause();
      el.currentTime = 0;
      setPlaying(false);
    };
  }, [stopRef]);

  if (!label && !hasAudio) return null;

  async function toggle() {
    if (!hasAudio) return;
    const el = audioRef.current;
    if (!el) return;
    if (el.paused) {
      claim();
      try {
        await el.play();
        setPlaying(true);
      } catch {
        setPlaying(false);
      }
    } else {
      el.pause();
      setPlaying(false);
    }
  }

  const text = label ?? "Audio tren";

  if (!hasAudio) {
    return (
      <p
        className={`truncate text-ink-muted ${compact ? "text-xs" : "text-sm"}`}
      >
        <span aria-hidden>♪ </span>
        {text}
      </p>
    );
  }

  return (
    <>
      <audio
        ref={audioRef}
        src={audioSrc!}
        preload="none"
        onEnded={() => setPlaying(false)}
        onPause={() => setPlaying(false)}
      />
      <button
        type="button"
        onClick={toggle}
        aria-label={playing ? "Jeda audio" : "Putar audio"}
        className={`min-touch flex w-full min-w-0 items-center gap-2 rounded-lg text-left transition-colors hover:text-coral ${
          compact ? "text-xs text-ink-muted" : "text-sm text-ink"
        }`}
      >
        <span aria-hidden className="shrink-0">
          {playing ? "❚❚" : "♪"}
        </span>
        <span className="min-w-0 truncate font-medium">{text}</span>
      </button>
    </>
  );
}
