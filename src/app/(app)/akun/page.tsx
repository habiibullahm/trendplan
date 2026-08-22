import Link from "next/link";
import dynamic from "next/dynamic";
import { Suspense } from "react";
import { redirect } from "next/navigation";
import { AkunAvatar } from "@/features/auth/components/akun-avatar";
import { AkunGoalEditor } from "@/features/auth/components/akun-goal-editor";
import { AkunNicheEditor } from "@/features/auth/components/akun-niche-editor";
import { AkunToastFromQuery } from "@/features/auth/components/akun-toast-from-query";
import { LogoutForm } from "@/features/auth/components/logout-form";
import { AkunPushReminder } from "@/features/reminders/components/akun-push-reminder";
import { getAkunProfile } from "@/features/auth/fetchers/akun-profile";
import { isAdminEmail } from "@/lib/auth/admin";
import { getSafeSession } from "@/lib/auth/session";

const ChangePasswordForm = dynamic(
  () =>
    import("@/features/auth/components/change-password-form").then((m) => ({
      default: m.ChangePasswordForm,
    })),
  { loading: () => <div className="h-12" aria-hidden /> },
);

const FeedbackForm = dynamic(
  () =>
    import("@/features/feedback/components/feedback-form").then((m) => ({
      default: m.FeedbackForm,
    })),
  { loading: () => <div className="h-12" aria-hidden /> },
);

const UpdateLog = dynamic(
  () =>
    import("@/features/auth/components/update-log").then((m) => ({
      default: m.UpdateLog,
    })),
  { loading: () => <div className="h-10" aria-hidden /> },
);

function initialFrom(name: string | null | undefined, email: string): string {
  const source = name?.trim() || email.trim();
  return (source[0] ?? "?").toUpperCase();
}

export default async function AkunPage() {
  const session = await getSafeSession();
  if (!session?.user?.id) redirect("/login");

  // Profile only — push count streams in Suspense so first paint is not blocked.
  const user = await getAkunProfile(session.user.id);

  if (!user) redirect("/login");

  const displayName = user.name?.trim() || "Creator";
  const initial = initialFrom(user.name, user.email);
  const showAdminInbox = isAdminEmail(user.email);

  return (
    <main className="mx-auto flex w-full max-w-lg flex-1 flex-col">
      <Suspense fallback={null}>
        <AkunToastFromQuery />
      </Suspense>
      <h1 className="sr-only">Akun</h1>

      <div className="mt-0">
        <AkunAvatar
          imageUrl={user.imageUrl}
          initialLetter={initial}
          name={displayName}
          email={user.email}
        />
      </div>

      <hr className="mt-6 border-border" />

      <section className="mt-2">
        <p className="text-sm font-semibold text-ink">Preferensi konten</p>
        <div className="mt-1 divide-y divide-border">
          <AkunNicheEditor key={user.niche} niche={user.niche} />
          <AkunGoalEditor key={user.weeklyGoal} weeklyGoal={user.weeklyGoal} />
          <Suspense fallback={<div className="min-touch h-12" aria-hidden />}>
            <AkunPushReminder userId={session.user.id} />
          </Suspense>
        </div>
      </section>

      <hr className="mt-2 border-border" />

      <section id="password" className="mt-2 scroll-mt-24">
        <p className="text-sm font-semibold text-ink">Keamanan</p>
        <div className="mt-1 divide-y divide-border">
          <ChangePasswordForm />
        </div>
      </section>

      <hr className="mt-2 border-border" />

      <section className="mt-2">
        <p className="text-sm font-semibold text-ink">Masukan</p>
        <div className="mt-1 divide-y divide-border">
          <FeedbackForm />
          {showAdminInbox ? (
            <Link
              href="/admin/feedback"
              prefetch
              className="min-touch flex items-center justify-between py-3 transition-colors hover:text-coral"
            >
              <span>
                <span className="block text-sm font-semibold text-ink">
                  Lihat masukan
                </span>
                <span className="text-xs text-ink-muted">
                  Daftar masukan yang masuk
                </span>
              </span>
              <span className="text-ink-muted">→</span>
            </Link>
          ) : null}
        </div>
      </section>

      <hr className="mt-6 border-border" />

      <section className="mt-4 space-y-3">
        <p className="text-sm font-semibold text-ink">Pintasan</p>
        <Link
          href="/riwayat"
          className="min-touch flex items-center justify-between rounded-2xl border border-border bg-surface px-4 py-3 transition-colors hover:border-coral/40 hover:bg-coral/5"
        >
          <span>
            <span className="block text-sm font-semibold text-ink">Riwayat</span>
            <span className="text-xs text-ink-muted">Konten yang sudah Posted</span>
          </span>
          <span className="text-ink-muted">→</span>
        </Link>
        <Link
          href="/rekomendasi"
          className="min-touch flex items-center justify-between rounded-2xl border border-border bg-surface px-4 py-3 transition-colors hover:border-coral/40 hover:bg-coral/5"
        >
          <span>
            <span className="block text-sm font-semibold text-ink">
              Rekomendasi
            </span>
            <span className="text-xs text-ink-muted">Ide dari tren</span>
          </span>
          <span className="text-ink-muted">→</span>
        </Link>
        <UpdateLog />
      </section>

      <LogoutForm />
    </main>
  );
}
