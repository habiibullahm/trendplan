/**
 * Week-share READ entry points for RSC / route handlers.
 * Implementations live in lib/week-share (mutations stay in actions/).
 */
export {
  getWeekPlanForViewer,
  userHasPartnerSeatForWeek,
  listWeekPlanItemsForReminder,
  getWeekShareSnapshot,
  peekWeekInvite,
  weekPlanAccessWhere,
  canEditWeekPlan,
  weekShareSnapshotFromPlan,
  type WeekPlanForViewer,
  type WeekShareSnapshot,
} from "@/features/planner/lib/week-share";

export {
  partnerDisplayName,
  shareRoleForUser,
} from "@/features/planner/lib/week-share-pure";
