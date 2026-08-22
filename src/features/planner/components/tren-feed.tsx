"use client";

import type { ContentFormat } from "@/generated/prisma/client";
import { useMemo, useState } from "react";
import { AddToPlannerForm } from "@/features/planner/components/add-to-planner-form";
import { TrendIdeaCard } from "@/features/planner/components/trend-idea-card";
import { FadeIn, Stagger } from "@/components/motion";
import { EmptyState } from "@/components/ui/empty-state";
import { NICHES, type Niche } from "@/lib/niches";

/** First N cards paint immediately so cover/title can be LCP (not opacity-0 FadeIn). */
const INSTANT_CARD_COUNT = 2;

export type TrenFeedItem = {
  id: string;
  title: string;
  hook: string;
  reason: string;
  format: ContentFormat;
  niche: string;
  coverUrl?: string | null;
};

type Filter = "all" | Niche;

export function TrenFeed({
  trends,
  defaultNiche,
  readOnly = false,
}: {
  trends: TrenFeedItem[];
  defaultNiche: Niche;
  /** Demo: no live Pakai (no server action). */
  readOnly?: boolean;
}) {
  const [filter, setFilter] = useState<Filter>(defaultNiche);

  const visible = useMemo(() => {
    if (filter === "all") return trends;
    return trends.filter((t) => t.niche === filter);
  }, [filter, trends]);

  return (
    <div>
      <div
        className="tp-scroll-x flex gap-2 pb-1"
        role="group"
        aria-label="Filter niche"
      >
        <FilterChip
          label="Semua"
          active={filter === "all"}
          onClick={() => setFilter("all")}
        />
        {NICHES.map((niche) => (
          <FilterChip
            key={niche}
            label={niche}
            active={filter === niche}
            onClick={() => setFilter(niche)}
          />
        ))}
      </div>

      <Stagger as="ul" className="mt-6 space-y-4">
        {visible.map((trend, index) => {
          const instant = index < INSTANT_CARD_COUNT;
          return (
            <FadeIn
              key={trend.id}
              as="li"
              id={trend.id}
              instant={instant}
              className="scroll-mt-24 rounded-2xl border border-border bg-surface p-4"
            >
              <TrendIdeaCard
                priority={index === 0}
                title={trend.title}
                hook={trend.hook}
                reason={trend.reason}
                format={trend.format}
                niche={trend.niche}
                coverUrl={trend.coverUrl}
                actions={
                  readOnly ? (
                    <p className="mt-3 rounded-xl border border-dashed border-border px-3 py-2 text-xs text-ink-muted">
                      Tambah ke planner tersedia setelah daftar.
                    </p>
                  ) : (
                    <AddToPlannerForm trendId={trend.id} />
                  )
                }
              />
            </FadeIn>
          );
        })}
        {visible.length === 0 ? (
          <EmptyState as="li">
            {trends.length === 0 ? (
              <>
                <p className="font-medium text-ink">Belum ada tren</p>
                <p className="mt-1">
                  Data masih kosong. Coba lagi nanti, atau ubah filter niche.
                </p>
              </>
            ) : (
              <>
                <p className="font-medium text-ink">
                  Tidak ada tren di filter ini
                </p>
                <p className="mt-1">
                  Coba <span className="font-semibold text-ink">Semua</span> atau
                  niche lain.
                </p>
              </>
            )}
          </EmptyState>
        ) : null}
      </Stagger>
    </div>
  );
}

function FilterChip({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`min-touch shrink-0 rounded-xl border px-3 text-xs font-semibold transition-colors ${
        active
          ? "border-coral bg-coral text-white hover:brightness-110"
          : "border-border bg-surface text-ink hover:border-coral/40 hover:bg-coral/5"
      }`}
    >
      {label}
    </button>
  );
}
