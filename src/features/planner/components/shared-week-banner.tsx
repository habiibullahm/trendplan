"use client";

/** Banner above planner tabs when week is shared. */
export function SharedWeekBanner({
  role,
  ownerLabel,
}: {
  role: "owner" | "partner";
  ownerLabel?: string;
}) {
  const text =
    role === "owner"
      ? "Plan bersama · partner dapat mengedit"
      : `Plan bersama dengan ${ownerLabel ?? "owner"} · kamu dapat mengedit`;

  return (
    <p className="rounded-xl border border-border bg-paper px-3.5 py-2.5 text-sm text-ink">
      {text}
    </p>
  );
}
