import { ReadOnlyPlannerBoard } from "@/components/planner-board";
import { DEMO_ITEMS, demoWeekLabel } from "@/lib/demo-planner";

export default function DemoPlannerPage() {
  return (
    <main className="flex w-full flex-1 flex-col">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-[family-name:var(--font-fraunces)] text-2xl font-semibold text-ink md:text-3xl">
            Planner
          </h1>
          <p className="mt-2 text-sm text-ink-muted">
            Minggu {demoWeekLabel()}
          </p>
        </div>
        <p className="text-sm font-medium text-ink">
          Target 5 · isi {DEMO_ITEMS.length}
        </p>
      </div>

      <ReadOnlyPlannerBoard items={DEMO_ITEMS} />
    </main>
  );
}
