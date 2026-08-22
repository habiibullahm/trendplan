"use client";

import {
  createContext,
  useCallback,
  useContext,
  useState,
  type ComponentType,
  type ReactNode,
} from "react";
import { ChipButton } from "@/components/ui/chip-button";
import type { EmptySlotSaranConfig } from "@/features/planner/components/empty-slot-saran-config";

export type { EmptySlotSaranConfig };

type SaranCtx = EmptySlotSaranConfig & {
  disabled: boolean;
  openForDay: (day: number) => void;
};

const EmptySlotSaranContext = createContext<SaranCtx | null>(null);

type SaranModalProps = {
  config: EmptySlotSaranConfig;
  openDay: number | null;
  onClose: () => void;
};

/** Tiny client host: modal chunk loads on first open. RSC children pass through. */
export function EmptySlotSaranHost({
  config,
  disabled = false,
  children,
}: {
  config: EmptySlotSaranConfig | null;
  disabled?: boolean;
  children: ReactNode;
}) {
  const [openDay, setOpenDay] = useState<number | null>(null);
  const [Modal, setModal] = useState<ComponentType<SaranModalProps> | null>(
    null,
  );
  const openForDay = useCallback((day: number) => {
    setOpenDay(day);
    void import("@/features/planner/components/empty-slot-saran-modal").then(
      (m) => setModal(() => m.SaranModal),
    );
  }, []);
  const onClose = useCallback(() => setOpenDay(null), []);

  if (!config) return children;

  return (
    <EmptySlotSaranContext.Provider
      value={{ ...config, disabled, openForDay }}
    >
      {children}
      {Modal ? (
        <Modal config={config} openDay={openDay} onClose={onClose} />
      ) : null}
    </EmptySlotSaranContext.Provider>
  );
}

export function EmptySlotSaranTrigger({
  day,
  className,
  disabled,
}: {
  day: number;
  className?: string;
  disabled?: boolean;
}) {
  const ctx = useContext(EmptySlotSaranContext);
  if (!ctx) return null;
  if (!ctx.emptyDays.includes(day) || ctx.suggestions.length === 0) {
    return null;
  }

  return (
    <ChipButton
      variant="ghost"
      disabled={disabled ?? ctx.disabled}
      className={className}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        ctx.openForDay(day);
      }}
    >
      Saran ide
    </ChipButton>
  );
}
