import Link from "next/link";
import { redirect } from "next/navigation";
import {
  acceptWeekInviteAction,
  rejectWeekInviteAction,
} from "@/features/planner/actions/week-share";
import { loginPath, withAuthCallbackQuery } from "@/lib/auth/callback-url";
import { peekWeekInvite } from "@/features/planner/lib/week-share";
import { InviteWeekActions } from "@/features/planner/components/invite-week-actions";
import { formatWeekRange } from "@/lib/week";
import { gateAppUser } from "@/lib/auth/require-app-user";
import { getSafeSession } from "@/lib/auth/session";

type Props = {
  searchParams: Promise<{ token?: string }>;
};

export default async function InviteWeekPage({
  searchParams,
}: Readonly<Props>) {
  const { token: rawToken } = await searchParams;
  const token = rawToken?.trim() ?? "";

  const session = await getSafeSession();
  if (!session?.user?.id) {
    const callback = token
      ? `/invite/week?token=${encodeURIComponent(token)}`
      : "/invite/week";
    redirect(loginPath({ callbackUrl: callback }));
  }

  const gate = await gateAppUser();
  if (!gate.ok) {
    if (gate.kind === "unverified") {
      const callback = token
        ? `/invite/week?token=${encodeURIComponent(token)}`
        : "/invite/week";
      redirect(withAuthCallbackQuery("/verify-email", callback));
    }
    redirect(loginPath());
  }

  if (!token) {
    return (
      <main className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-6 py-12">
        <h1 className="font-[family-name:var(--font-fraunces)] text-2xl font-semibold text-ink">
          Undangan ke plan
        </h1>
        <p className="mt-2 text-sm text-ink-muted">
          Tautan undangan tidak valid.
        </p>
        <Link href="/planner" className="mt-6 text-sm font-semibold text-coral">
          Ke planner
        </Link>
      </main>
    );
  }

  const preview = await peekWeekInvite(token);
  const weekLabel = preview.weekStart
    ? formatWeekRange(preview.weekStart)
    : null;

  const errorCopy: Record<string, string> = {
    invalid: "Tautan undangan tidak valid.",
    expired: "Tautan undangan sudah kedaluwarsa.",
    revoked: "Undangan sudah dicabut.",
    partner_exists: "Minggu ini sudah punya partner lain.",
  };

  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-6 py-12">
      <div className="rounded-2xl border border-border bg-surface p-6">
        <h1 className="font-[family-name:var(--font-fraunces)] text-2xl font-semibold text-ink">
          Undangan ke plan
        </h1>

        {preview.status === "ok" && weekLabel ? (
          <>
            <p className="mt-3 text-sm text-ink-muted">
              {preview.ownerName} mengundangmu ke minggu {weekLabel}.
            </p>
            <InviteWeekActions
              token={token}
              acceptAction={acceptWeekInviteAction}
              rejectAction={rejectWeekInviteAction}
            />
          </>
        ) : (
          <>
            <p className="mt-3 text-sm text-ink-muted">
              {errorCopy[preview.status] ?? "Tautan undangan tidak valid."}
            </p>
            <Link
              href="/planner"
              className="mt-6 inline-block text-sm font-semibold text-coral"
            >
              Ke planner
            </Link>
          </>
        )}
      </div>
    </main>
  );
}
