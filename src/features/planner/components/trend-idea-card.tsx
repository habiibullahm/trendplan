import Link from "next/link";
import type { ReactNode } from "react";
import type { ContentFormat } from "@/generated/prisma/client";
import { Badge } from "@/components/ui/badge";
import { FORMAT_LABEL } from "@/lib/labels";

function mediaUrl(value?: string | null): string | null {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

/** Soft coral→paper wash; readable on light and dark `bg-surface`. */
const EMPTY_COVER_GRADIENT =
  "linear-gradient(145deg, color-mix(in srgb, var(--color-coral) 72%, white), color-mix(in srgb, var(--color-coral) 35%, var(--color-surface)), color-mix(in srgb, var(--color-coral) 18%, var(--color-paper)))";

function TrendCover({
  coverUrl,
  priority = false,
  dense = false,
}: {
  coverUrl?: string | null;
  priority?: boolean;
  dense?: boolean;
}) {
  const src = mediaUrl(coverUrl);
  return (
    <div
      className={`relative shrink-0 overflow-hidden rounded-lg border border-border bg-surface ${
        dense ? "h-14 w-10 sm:h-16 sm:w-12" : "h-16 w-12 sm:h-[4.5rem] sm:w-14"
      }`}
      style={
        src
          ? undefined
          : {
              backgroundImage: EMPTY_COVER_GRADIENT,
            }
      }
    >
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element -- curated local posters under /media/trends
        <img
          src={src}
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
          loading={priority ? "eager" : "lazy"}
          fetchPriority={priority ? "high" : "auto"}
          decoding={priority ? "sync" : "async"}
        />
      ) : null}
    </div>
  );
}

export type TrendIdeaCardProps = {
  title: string;
  format: ContentFormat;
  coverUrl?: string | null;
  hook?: string | null;
  reason?: string | null;
  niche?: string | null;
  /** Dense: cover + title + format only (Beranda). */
  dense?: boolean;
  titleHref?: string;
  rank?: number;
  /** First visible card: prioritize cover for LCP. */
  priority?: boolean;
  actions?: ReactNode;
};

export function TrendIdeaCard({
  title,
  format,
  coverUrl,
  hook,
  reason,
  niche,
  dense = false,
  titleHref,
  rank,
  priority = false,
  actions,
}: TrendIdeaCardProps) {
  const formatLabel = FORMAT_LABEL[format];
  const titleEl = titleHref ? (
    <Link
      href={titleHref}
      className={`block font-semibold text-ink transition-colors hover:text-coral ${
        dense ? "truncate text-sm" : "text-sm sm:text-base"
      }`}
    >
      {title}
    </Link>
  ) : (
    <p
      className={`font-semibold text-ink ${
        dense ? "truncate text-sm" : "text-sm sm:text-base"
      }`}
    >
      {title}
    </p>
  );

  return (
    <div className="flex items-start gap-3">
      {rank != null ? (
        <span className="mt-0.5 shrink-0 rounded-full bg-coral/10 px-2 py-0.5 text-xs font-semibold text-coral">
          #{rank}
        </span>
      ) : null}
      <TrendCover coverUrl={coverUrl} priority={priority} dense={dense} />
      <div className="min-w-0 flex-1">
        {titleEl}
        {dense ? (
          <p className="mt-1 text-xs text-ink-muted">{formatLabel}</p>
        ) : (
          <>
            {hook ? (
              <p className="mt-1 text-sm leading-snug text-ink-muted">{hook}</p>
            ) : null}
            {reason ? (
              <p className="mt-2 text-sm leading-relaxed text-ink">{reason}</p>
            ) : null}
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <Badge
                size="sm"
                className="border-border bg-paper text-ink-muted"
              >
                {formatLabel}
              </Badge>
              {niche ? (
                <span className="text-xs font-medium text-ink-muted">
                  {niche}
                </span>
              ) : null}
            </div>
            {actions}
          </>
        )}
      </div>
    </div>
  );
}
