"use client";

import {
  createContext,
  useContext,
  type ReactNode,
} from "react";
import { motion, useReducedMotion } from "motion/react";

export {
  useIsDesktop,
  usePlannerLayout,
} from "@/hooks/use-planner-layout";

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
  id,
}: {
  children: ReactNode;
  className?: string;
  as?: "div" | "li";
  id?: string;
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
    ? { id, className, variants }
    : {
        id,
        className,
        variants,
        initial: "hidden" as const,
        animate: "show" as const,
      };

  if (as === "li") {
    return <motion.li {...shared}>{children}</motion.li>;
  }

  return <motion.div {...shared}>{children}</motion.div>;
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
