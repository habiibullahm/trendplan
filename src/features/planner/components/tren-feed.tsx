"use client";

import type { ContentFormat } from "@/generated/prisma/client";
import { useMemo, useState } from "react";
import { AddToPlannerForm } from "@/features/planner/components/add-to-planner-form";
import {
  TrendMediaBlock,
  type TrendMediaFields,
} from "@/features/planner/components/trend-media";
import { FadeIn, Stagger } from "@/components/motion";
import { EmptyState } from "@/components/ui/empty-state";
import { FORMAT_LABEL } from "@/lib/labels";
import { NICHES, type Niche } from "@/lib/niches";

export type TrenFeedItem = {
  id: string;
  title: string;
  hook: string;
  format: ContentFormat;
  score: number;
  niche: string;
} & TrendMediaFields;

type Filter = "all" | Niche;

export function TrenFeed({
  trends,
  defaultNiche,
}: {
  trends: TrenFeedItem[];
  defaultNiche: Niche;
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
        {visible.map((trend) => (
          <FadeIn
            key={trend.id}
            as="li"
            id={trend.id}
            className="scroll-mt-24 rounded-2xl border border-border bg-surface p-4"
          >
            <TrendMediaBlock
              media={{
                coverUrl: trend.coverUrl,
                videoUrl: trend.videoUrl,
                audioTitle: trend.audioTitle,
                audioUrl: trend.audioUrl,
              }}
            />
            <p className="mt-3 text-xs font-semibold text-ink-muted">
              {trend.niche}
            </p>
            <p className="mt-1 font-semibold text-ink">{trend.title}</p>
            <p className="mt-1 text-sm italic text-ink-muted">{trend.hook}</p>
            <p className="mt-2 text-xs text-ink-muted">
              {FORMAT_LABEL[trend.format]} · skor {trend.score}
            </p>
            <AddToPlannerForm trendId={trend.id} />
          </FadeIn>
        ))}
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
          ? "border-coral bg-coral text-white"
          : "border-border bg-surface text-ink"
      }`}
    >
      {label}
    </button>
  );
}
