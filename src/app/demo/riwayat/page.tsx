import { FadeIn, Stagger } from "@/components/motion";
import { demoPostedItems, demoWeekLabel } from "@/lib/demo-planner";
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
          <li className="rounded-2xl border border-dashed border-border px-4 py-6 text-sm text-ink-muted">
            Belum ada yang diposting.
          </li>
        ) : null}
      </Stagger>
    </main>
  );
}
