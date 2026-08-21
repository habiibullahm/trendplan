"use client";

import {
  useEffect,
  useState,
  type ComponentType,
} from "react";
import { ChipButton } from "@/components/ui/chip-button";
import type { ShareWeekUiSnapshot } from "@/features/planner/components/share-week-button";

function shareChipLabel(share: ShareWeekUiSnapshot) {
  return share.partner && share.partnerLabel
    ? `Bareng ${share.partnerLabel}`
    : "Bagikan";
}

function ShareWeekButtonFallback({ share }: { share: ShareWeekUiSnapshot }) {
  return (
    <ChipButton
      disabled
      aria-busy="true"
      aria-label={
        share.partner
          ? `Plan bersama dengan ${share.partnerLabel ?? "partner"}`
          : "Bagikan minggu ke partner"
      }
    >
      {shareChipLabel(share)}
    </ChipButton>
  );
}

/** Client shell so planner RSC can defer the share modal chunk. */
export function DeferredShareWeekButton({
  share,
}: {
  share: ShareWeekUiSnapshot;
}) {
  const [ShareWeekButton, setShareWeekButton] = useState<ComponentType<{
    share: ShareWeekUiSnapshot;
  }> | null>(null);

  useEffect(() => {
    let cancelled = false;
    void import("@/features/planner/components/share-week-button").then((m) => {
      if (cancelled) return;
      setShareWeekButton(() => m.ShareWeekButton);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  if (!ShareWeekButton) {
    return <ShareWeekButtonFallback share={share} />;
  }

  return <ShareWeekButton share={share} />;
}
