import { STATUS_LABEL } from "@/lib/labels";

export type RiwayatPostedCardProps = {
  title: string;
  meta: string;
  trendTitle?: string | null;
  hook?: string | null;
  caption?: string | null;
  hashtags?: string | null;
};

/**
 * Read-only posted-item preview for Riwayat.
 * Not a link — editing Posted from here breaks the planner journey.
 */
export function RiwayatPostedCard({
  title,
  meta,
  trendTitle,
  hook,
  caption,
  hashtags,
}: RiwayatPostedCardProps) {
  const captionText = caption?.trim() || null;
  const hashtagsText = hashtags?.trim() || null;
  const hookText = hook?.trim() || null;
  const trendText = trendTitle?.trim() || null;

  return (
    <article className="rounded-2xl border border-border bg-surface p-4">
      <div className="flex items-start justify-between gap-3">
        <p className="min-w-0 font-semibold text-ink">{title}</p>
        <span className="shrink-0 rounded-lg border border-coral/30 bg-coral/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-coral">
          {STATUS_LABEL.POSTED}
        </span>
      </div>
      <p className="mt-1 text-sm text-ink-muted">{meta}</p>
      {trendText ? (
        <p className="mt-2 text-xs text-ink-muted">Sumber tren: {trendText}</p>
      ) : null}
      {hookText ? (
        <p className="mt-2 text-sm italic text-ink-muted">{hookText}</p>
      ) : null}
      {captionText ? (
        <div className="mt-3">
          <p className="text-xs font-semibold text-ink-muted">Caption</p>
          <p className="mt-1 whitespace-pre-wrap text-sm text-ink">
            {captionText}
          </p>
        </div>
      ) : null}
      {hashtagsText ? (
        <div className="mt-3">
          <p className="text-xs font-semibold text-ink-muted">Hashtag</p>
          <p className="mt-1 break-words text-sm text-ink">{hashtagsText}</p>
        </div>
      ) : null}
      {!captionText && !hashtagsText ? (
        <p className="mt-3 text-xs text-ink-muted">
          Belum ada caption atau hashtag tersimpan.
        </p>
      ) : null}
    </article>
  );
}
