import { FadeIn, Stagger } from "@/components/motion";
import { EmptyState } from "@/components/ui/empty-state";
import { RiwayatPostedCard } from "@/features/planner/components/riwayat-posted-card";
import {
  demoPostedItems,
  demoWeekLabel,
} from "@/features/planner/lib/demo-planner";
import { DAY_SHORT } from "@/lib/week";

export default function DemoRiwayatPage() {
  const items = demoPostedItems();
  const week = demoWeekLabel();

  return (
    <main className="flex flex-1 flex-col">
      <h1 className="font-[family-name:var(--font-fraunces)] text-3xl font-semibold text-ink">
        Riwayat
      </h1>
      <p className="mt-2 text-sm text-ink-muted">
        Preview konten yang sudah Posted · contoh minggu {week}. Hanya baca
        (termasuk di Planner).
      </p>

      <Stagger as="ul" className="mt-6 space-y-3">
        {items.map((item) => {
          const day = DAY_SHORT[item.dayOfWeek] ?? "";
          return (
            <FadeIn key={item.id} as="li">
              <RiwayatPostedCard
                title={item.title}
                meta={`${day} · ${week}`}
              />
            </FadeIn>
          );
        })}
        {items.length === 0 ? (
          <EmptyState as="li">Belum ada yang diposting.</EmptyState>
        ) : null}
      </Stagger>
    </main>
  );
}
