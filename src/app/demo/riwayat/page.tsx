import { FadeIn, Stagger } from "@/components/motion";
import { EmptyState } from "@/components/ui/empty-state";
import { demoPostedItems, demoWeekLabel } from "@/features/planner/lib/demo-planner";
import { DAY_SHORT } from "@/lib/week";

export default function DemoRiwayatPage() {
  const items = demoPostedItems();

  return (
    <main className="flex flex-1 flex-col">
      <h1 className="font-[family-name:var(--font-fraunces)] text-3xl font-semibold text-ink">
        Riwayat
      </h1>
      <p className="mt-2 text-sm text-ink-muted">
        Konten yang sudah ditandai Posted · contoh minggu {demoWeekLabel()}.
      </p>

      <Stagger as="ul" className="mt-6 space-y-3">
        {items.map((item) => (
          <FadeIn
            key={item.id}
            as="li"
            className="rounded-2xl border border-border bg-surface p-4"
          >
            <p className="font-semibold text-ink">{item.title}</p>
            <p className="mt-1 text-sm text-ink-muted">
              {DAY_SHORT[item.dayOfWeek]} ·{" "}
              {item.performanceNote || "Belum ada catatan performa"}
            </p>
          </FadeIn>
        ))}
        {items.length === 0 ? (
          <EmptyState as="li">Belum ada yang diposting.</EmptyState>
        ) : null}
      </Stagger>
    </main>
  );
}
