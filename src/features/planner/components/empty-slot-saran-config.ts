import type { EmptySlotTrend } from "@/features/planner/lib/empty-slot-assist";
import type { PlannerView } from "@/lib/week";

export type EmptySlotSaranConfig = {
  suggestions: EmptySlotTrend[];
  emptyDays: number[];
  weekStartParam?: string;
  view?: PlannerView;
};
