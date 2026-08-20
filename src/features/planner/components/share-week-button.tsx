"use client";

import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  createOrRotateWeekInviteAction,
  leaveSharedPlanAction,
  removePartnerAction,
  revokeWeekInviteAction,
  sendWeekInviteEmailAction,
  type ShareWeekActionState,
} from "@/features/planner/actions/week-share";
import { copyText } from "@/features/planner/lib/clipboard";
import {
  copyToastError,
  copyToastSuccess,
} from "@/features/planner/lib/copy-toast";
import { Button } from "@/components/ui/button";
import { ChipButton } from "@/components/ui/chip-button";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { useActionToasts } from "@/hooks/use-action-toasts";
import {
  idleActionResult,
  isCompletedActionSuccess,
} from "@/lib/action-result";
import { isTransactionalEmailEnabled } from "@/lib/auth/env";

export type ShareWeekUiSnapshot = {
  role: "owner" | "partner";
  weekPlanId: string;
  weekLabel: string;
  partner: {
    id: string;
    name: string | null;
    email: string;
    imageUrl: string | null;
  } | null;
  pendingInvite: {
    id: string;
    invitedEmail: string | null;
    expiresAt: string;
  } | null;
  partnerLabel: string | null;
};

const initial: ShareWeekActionState = idleActionResult;

function initials(name: string | null, email: string) {
  const base = (name?.trim() || email).trim();
  return (base[0] ?? "?").toUpperCase();
}

export function ShareWeekButton({ share }: { share: ShareWeekUiSnapshot }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [createState, createAction, createPending] = useActionState(
    createOrRotateWeekInviteAction,
    initial,
  );
  const [emailState, emailAction, emailPending] = useActionState(
    sendWeekInviteEmailAction,
    initial,
  );
  const [revokeState, revokeAction, revokePending] = useActionState(
    revokeWeekInviteAction,
    initial,
  );
  const [removeState, removeAction, removePending] = useActionState(
    removePartnerAction,
    initial,
  );
  const [leaveState, leaveAction, leavePending] = useActionState(
    leaveSharedPlanAction,
    initial,
  );

  useActionToasts(createState);
  useActionToasts(emailState);
  useActionToasts(revokeState);
  useActionToasts(removeState);
  useActionToasts(leaveState);

  const pending =
    createPending ||
    emailPending ||
    revokePending ||
    removePending ||
    leavePending;

  useEffect(() => {
    const url = createState.data?.inviteUrl ?? emailState.data?.inviteUrl;
    if (!url) return;
    let cancelled = false;
    void (async () => {
      const ok = await copyText(url);
      if (cancelled) return;
      if (ok) copyToastSuccess("Tautan undangan disalin");
      else copyToastError("Gagal menyalin tautan");
      // Refresh after copy so remount does not drop the invite URL mid-write.
      router.refresh();
    })();
    return () => {
      cancelled = true;
    };
  }, [createState.data?.inviteUrl, emailState.data?.inviteUrl, router]);

  useEffect(() => {
    if (
      isCompletedActionSuccess(revokeState) ||
      isCompletedActionSuccess(removeState) ||
      isCompletedActionSuccess(leaveState)
    ) {
      router.refresh();
    }
  }, [revokeState, removeState, leaveState, router]);

  function onClose() {
    if (pending) return;
    setOpen(false);
  }

  const chipLabel =
    share.partner && share.partnerLabel
      ? `Bareng ${share.partnerLabel}`
      : "Bagikan";

  const mailEnabled = isTransactionalEmailEnabled();
  const description = `Undang 1 partner ke minggu ${share.weekLabel}. Kalian bisa isi ide dan aktivitas bareng.`;

  return (
    <>
      <ChipButton
        onClick={() => setOpen(true)}
        aria-label={
          share.partner
            ? `Plan bersama dengan ${share.partnerLabel ?? "partner"}`
            : "Bagikan minggu ke partner"
        }
      >
        {chipLabel}
      </ChipButton>

      <Modal
        open={open}
        onClose={onClose}
        allowClose={!pending}
        title="Bagikan minggu"
        description={description}
        size="sm"
      >
        <div className="flex flex-col gap-3">
          {share.role === "partner" ? (
            <>
              <p className="text-sm text-ink-muted">
                Kamu bergabung sebagai partner. Owner mengontrol undangan.
              </p>
              <form action={leaveAction}>
                <input
                  type="hidden"
                  name="weekPlanId"
                  value={share.weekPlanId}
                />
                <Button
                  type="submit"
                  variant="secondary"
                  width="full"
                  disabled={pending}
                >
                  Keluar dari plan
                </Button>
              </form>
            </>
          ) : null}

          {share.role === "owner" && share.partner ? (
            <>
              <div className="flex items-center gap-3">
                <div
                  className="grid size-9 place-items-center overflow-hidden rounded-full bg-paper text-sm font-semibold text-ink"
                  aria-hidden
                >
                  {share.partner.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={share.partner.imageUrl}
                      alt=""
                      className="size-9 rounded-full object-cover"
                    />
                  ) : (
                    initials(share.partner.name, share.partner.email)
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-ink">
                    {share.partner.name?.trim() || share.partner.email}
                  </p>
                  <p className="truncate text-xs text-ink-muted">
                    {share.partner.email}
                  </p>
                </div>
                <span className="rounded-full border border-border px-2 py-0.5 text-xs text-ink-muted">
                  Partner
                </span>
              </div>
              <form action={removeAction}>
                <input
                  type="hidden"
                  name="weekPlanId"
                  value={share.weekPlanId}
                />
                <Button
                  type="submit"
                  variant="secondary"
                  width="full"
                  disabled={pending}
                >
                  Cabut akses
                </Button>
              </form>
            </>
          ) : null}

          {share.role === "owner" && !share.partner && share.pendingInvite ? (
            <>
              <p className="text-sm font-medium text-ink">Menunggu partner…</p>
              {share.pendingInvite.invitedEmail ? (
                <p className="text-xs text-ink-muted">
                  Email: {share.pendingInvite.invitedEmail}
                </p>
              ) : null}
              <form action={createAction}>
                <input
                  type="hidden"
                  name="weekPlanId"
                  value={share.weekPlanId}
                />
                <Button type="submit" width="full" disabled={pending}>
                  Salin tautan
                </Button>
              </form>
              <form action={createAction}>
                <input
                  type="hidden"
                  name="weekPlanId"
                  value={share.weekPlanId}
                />
                <Button
                  type="submit"
                  variant="secondary"
                  width="full"
                  disabled={pending}
                >
                  Buat tautan baru
                </Button>
              </form>
              <form action={revokeAction}>
                <input
                  type="hidden"
                  name="weekPlanId"
                  value={share.weekPlanId}
                />
                <Button
                  type="submit"
                  variant="secondary"
                  width="full"
                  disabled={pending}
                >
                  Batalkan undangan
                </Button>
              </form>
            </>
          ) : null}

          {share.role === "owner" && !share.partner && !share.pendingInvite ? (
            <>
              <form action={createAction}>
                <input
                  type="hidden"
                  name="weekPlanId"
                  value={share.weekPlanId}
                />
                <Button type="submit" width="full" disabled={pending}>
                  Salin tautan undangan
                </Button>
              </form>

              <form action={emailAction} className="flex flex-col gap-2">
                <input
                  type="hidden"
                  name="weekPlanId"
                  value={share.weekPlanId}
                />
                <FormField
                  label="Kirim email"
                  error={emailState.data?.fieldErrors?.email}
                >
                  <Input
                    name="email"
                    type="email"
                    autoComplete="email"
                    placeholder="email partner"
                    maxLength={254}
                    disabled={pending || !mailEnabled}
                  />
                </FormField>
                {!mailEnabled ? (
                  <p className="text-xs text-ink-muted">
                    Email transaksi belum aktif. Salin tautan undangan tetap
                    bisa dipakai.
                  </p>
                ) : null}
                <Button
                  type="submit"
                  variant="secondary"
                  width="full"
                  disabled={pending || !mailEnabled}
                >
                  Kirim email
                </Button>
              </form>

              <p className="text-xs text-ink-muted">
                Tautan berlaku 7 hari. Satu partner aktif per minggu.
              </p>
            </>
          ) : null}
        </div>
      </Modal>
    </>
  );
}
