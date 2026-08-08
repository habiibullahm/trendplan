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
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
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
      <ToggleGroup
        className="tp-scroll-x w-full max-w-full pb-1"
        variant="outline"
        size="sm"
        aria-label="Filter niche"
        value={[filter]}
        onValueChange={(next) => {
          const value = next[0];
          if (!value) return;
          if (value === "all" || NICHES.includes(value as Niche)) {
            setFilter(value as Filter);
          }
        }}
      >
        <ToggleGroupItem value="all">Semua</ToggleGroupItem>
        {NICHES.map((niche) => (
          <ToggleGroupItem key={niche} value={niche}>
            {niche}
          </ToggleGroupItem>
        ))}
      </ToggleGroup>

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

