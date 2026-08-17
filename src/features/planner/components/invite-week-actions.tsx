"use client";

import { useActionState } from "react";
import type { ShareWeekActionState } from "@/features/planner/actions/week-share";
import { Button } from "@/components/ui/button";
import { useActionToasts } from "@/hooks/use-action-toasts";

const initial: ShareWeekActionState = { status: "success" };

type Action = (
  prev: ShareWeekActionState,
  formData: FormData,
) => Promise<ShareWeekActionState>;

export function InviteWeekActions({
  token,
  acceptAction,
  rejectAction,
}: {
  token: string;
  acceptAction: Action;
  rejectAction: Action;
}) {
  const [acceptState, acceptFormAction, acceptPending] = useActionState(
    acceptAction,
    initial,
  );
  const [rejectState, rejectFormAction, rejectPending] = useActionState(
    rejectAction,
    initial,
  );
  useActionToasts(acceptState);
  useActionToasts(rejectState);

  const pending = acceptPending || rejectPending;

  return (
    <div className="mt-6 flex flex-wrap gap-3">
      <form action={acceptFormAction}>
        <input type="hidden" name="token" value={token} />
        <Button type="submit" disabled={pending} loading={acceptPending}>
          Terima
        </Button>
      </form>
      <form action={rejectFormAction}>
        <input type="hidden" name="token" value={token} />
        <Button
          type="submit"
          variant="secondary"
          disabled={pending}
          loading={rejectPending}
        >
          Tolak
        </Button>
      </form>
    </div>
  );
}
