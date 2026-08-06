"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { motion, useReducedMotion } from "motion/react";

export function usePrefersReducedMotion() {
  return Boolean(useReducedMotion());
}

const StaggerContext = createContext(false);

const easeOut = [0.22, 1, 0.36, 1] as const;

export function Stagger({
  children,
  className,
  as = "div",
}: {
  children: ReactNode;
  className?: string;
  as?: "div" | "ul";
}) {
  const reduce = usePrefersReducedMotion();
  const variants = {
    hidden: {},
    show: {
      transition: reduce
        ? { staggerChildren: 0 }
        : { staggerChildren: 0.05, delayChildren: 0.04 },
    },
  };

  if (as === "ul") {
    return (
      <StaggerContext.Provider value={!reduce}>
        <motion.ul
          className={className}
          initial="hidden"
          animate="show"
          variants={variants}
        >
          {children}
        </motion.ul>
      </StaggerContext.Provider>
    );
  }

  return (
    <StaggerContext.Provider value={!reduce}>
      <motion.div
        className={className}
        initial="hidden"
        animate="show"
        variants={variants}
      >
        {children}
      </motion.div>
    </StaggerContext.Provider>
  );
}

export function FadeIn({
  children,
  className,
  as = "div",
}: {
  children: ReactNode;
  className?: string;
  as?: "div" | "li";
}) {
  const reduce = usePrefersReducedMotion();
  const inStagger = useContext(StaggerContext);

  const variants = {
    hidden: reduce ? { opacity: 1, y: 0 } : { opacity: 0, y: 8 },
    show: {
      opacity: 1,
      y: 0,
      transition: {
        duration: reduce ? 0 : 0.28,
        ease: easeOut,
      },
    },
  };

  const shared = inStagger
    ? { className, variants }
    : { className, variants, initial: "hidden" as const, animate: "show" as const };

  if (as === "li") {
    return <motion.li {...shared}>{children}</motion.li>;
  }

  return <motion.div {...shared}>{children}</motion.div>;
}

/** Returns viewport layout after mount; `null` until media query is known. */
export function usePlannerLayout(): "list" | "grid" | null {
  const [layout, setLayout] = useState<"list" | "grid" | null>(null);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    const apply = () => setLayout(mq.matches ? "grid" : "list");
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

  return layout;
}

/** @deprecated Prefer usePlannerLayout — kept for callers that only need boolean. */
export function useIsDesktop() {
  const layout = usePlannerLayout();
  return layout === "grid";
}

export function ProgressBar({ value }: { value: number }) {
  const reduce = usePrefersReducedMotion();
  const width = Math.max(0, Math.min(100, value));

  return (
    <div className="mt-3 h-2 overflow-hidden rounded-full bg-paper">
      <motion.div
        className="h-full rounded-full bg-coral"
        initial={reduce ? false : { width: 0 }}
        animate={{ width: `${width}%` }}
        transition={{
          duration: reduce ? 0 : 0.55,
          ease: easeOut,
        }}
      />
    </div>
  );
}
