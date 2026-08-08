export const NICHES = [
  "Couple Date Ideas",
  "Tech & Gadget",
  "Food & Cooking",
] as const;

export type Niche = (typeof NICHES)[number];

export const DEFAULT_NICHE: Niche = "Couple Date Ideas";

export function isNiche(value: string): value is Niche {
  return (NICHES as readonly string[]).includes(value);
}

export function resolveNiche(value: string | null | undefined): Niche {
  if (value && isNiche(value)) return value;
  return DEFAULT_NICHE;
}
