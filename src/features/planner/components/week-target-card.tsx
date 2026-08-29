"use client";

import type { ReactNode } from "react";
import { motion } from "motion/react";
import { usePrefersReducedMotion } from "@/components/motion";

const easeOut = [0.22, 1, 0.36, 1] as const;

type WeekTargetCardProps = {
  scheduled: number;
  goal: number;
  progress: number;
  children?: ReactNode;
};

function ProgressBar({ value }: { value: number }) {
  const reduce = usePrefersReducedMotion();
  const width = Math.max(0, Math.min(100, value));

  return (
    <div className="flex min-w-0 w-full items-center gap-2">
      <span className="shrink-0 select-none text-sm font-medium text-ink/70" aria-hidden>
        [
      </span>
      <div
        className="relative h-3.5 min-w-0 flex-1 overflow-hidden border border-ink/45"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={width}
        aria-label="Progress target minggu"
      >
        <div className="tp-week-target-hatch absolute inset-0" aria-hidden />
        <motion.div
          className="absolute inset-y-0 left-0 bg-coral"
          initial={reduce ? false : { width: 0 }}
          animate={{ width: `${width}%` }}
          transition={{
            duration: reduce ? 0 : 0.55,
            ease: easeOut,
          }}
        />
      </div>
      <span className="shrink-0 select-none text-sm font-medium text-ink/70" aria-hidden>
        ]
      </span>
      <span className="sr-only">{width} persen</span>
    </div>
  );
}

/**
 * Surface week-target card: title + count on one row, progress bar below.
 */
export function WeekTargetCard({
  scheduled,
  goal,
  progress,
  children,
}: WeekTargetCardProps) {
  return (
    <section className="tp-week-target mt-6">
      <div className="tp-week-target__frame">
        <div className="flex items-baseline justify-between gap-3">
          <h2 className="tp-week-target__title min-w-0">
            Target konten minggu ini
          </h2>
          <p
            className="shrink-0 text-sm font-semibold tabular-nums text-ink"
            aria-label={`${scheduled} dari ${goal} target minggu`}
          >
            {scheduled} ide · target {goal}
          </p>
        </div>

        <div className="tp-week-target__body">
          <ProgressBar value={progress} />
          {children ? <div className="mt-4">{children}</div> : null}
        </div>
      </div>
    </section>
  );
}
