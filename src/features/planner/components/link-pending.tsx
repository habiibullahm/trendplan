"use client";

import { useLinkStatus } from "next/link";
import { Spinner } from "@/components/ui/spinner";

/** Must render as a descendant of `next/link` `Link`. */
export function LinkPendingSpinner({ className }: { className?: string }) {
  const { pending } = useLinkStatus();
  if (!pending) return null;
  return <Spinner className={className} />;
}

/** Must render as a descendant of `next/link` `Link`. */
export function LinkPendingLabel({
  idle,
  busy = "Memuat…",
}: {
  idle: string;
  busy?: string;
}) {
  const { pending } = useLinkStatus();
  if (!pending) return idle;
  return (
    <>
      <Spinner className="size-3" />
      <span>{busy}</span>
    </>
  );
}

/** Must render as a descendant of `next/link` `Link`. */
export function LinkPendingGlyph({ idle }: { idle: string }) {
  const { pending } = useLinkStatus();
  if (pending) return <Spinner className="size-3.5" />;
  return idle;
}
