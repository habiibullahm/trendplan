/**
 * Compatibility barrel — prefer `@/features/planner/fetchers/*` for new code.
 */
export { berandaUserTag } from "@/features/planner/lib/beranda-cache-tag";
export { purgeStaleSoftDeletes } from "@/features/planner/lib/soft-delete-purge";
export {
  getOrCreateWeekPlan,
  getWeekPlanForBeranda,
  countActiveItemsByWeekStarts,
} from "@/features/planner/fetchers/week-plan";
export { getRecommendations } from "@/features/planner/fetchers/recommendations";
export { requireUserId } from "@/lib/auth/require-app-user";
