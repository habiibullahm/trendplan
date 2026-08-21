/** localStorage: first-run coachmark on planner-detail Bantu AI. */
export const BANTU_AI_COACH_STORAGE_KEY = "trendplan-coach-bantu-ai";
export const BANTU_AI_COACH_SEEN_VALUE = "1";

export function isBantuAiCoachSeen(
  stored: string | null | undefined,
): boolean {
  return stored === BANTU_AI_COACH_SEEN_VALUE;
}

/** Hide on demo routes and after the user has dismissed the coachmark. */
export function shouldShowBantuAiCoach(opts: {
  stored: string | null | undefined;
  pathname: string | null | undefined;
}): boolean {
  if (opts.pathname?.startsWith("/demo")) return false;
  return !isBantuAiCoachSeen(opts.stored);
}

/** Session dismiss wins even when localStorage is blocked. */
export function isBantuAiCoachOpen(opts: {
  dismissed: boolean;
  stored: string | null | undefined;
  pathname: string | null | undefined;
}): boolean {
  if (opts.dismissed) return false;
  return shouldShowBantuAiCoach(opts);
}

export function readBantuAiCoachStored(): string | null {
  try {
    return localStorage.getItem(BANTU_AI_COACH_STORAGE_KEY);
  } catch {
    return null;
  }
}

export function persistBantuAiCoachSeen(): void {
  try {
    localStorage.setItem(BANTU_AI_COACH_STORAGE_KEY, BANTU_AI_COACH_SEEN_VALUE);
  } catch {
    /* quota / private mode — in-memory dismissed still hides the callout */
  }
}
