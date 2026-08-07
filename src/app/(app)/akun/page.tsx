import Link from "next/link";
import { redirect } from "next/navigation";
import { auth, signOut } from "@/auth";
import { AkunGoalEditor } from "@/features/auth/components/akun-goal-editor";
import { prisma } from "@/lib/prisma";

function initialFrom(name: string | null | undefined, email: string): string {
  const source = name?.trim() || email.trim();
  return (source[0] ?? "?").toUpperCase();
}

export default async function AkunPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      name: true,
      email: true,
      niche: true,
      weeklyGoal: true,
    },
  });

  if (!user) redirect("/login");

  const displayName = user.name?.trim() || "Creator";
  const initial = initialFrom(user.name, user.email);

  return (
    <main className="mx-auto flex w-full max-w-lg flex-1 flex-col">
      <h1 className="font-[family-name:var(--font-fraunces)] text-3xl font-semibold text-ink">
        Akun
      </h1>

      <div className="mt-6 flex items-center gap-3">
        <div
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-border bg-paper text-base font-bold text-ink"
          aria-hidden
        >
          {initial}
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-ink">{displayName}</p>
          <p className="truncate text-sm text-ink-muted">{user.email}</p>
        </div>
      </div>

      <hr className="mt-6 border-border" />

      <section className="mt-2">
        <p className="text-sm font-semibold text-ink">Preferensi konten</p>
        <div className="mt-1 divide-y divide-border">
          <div className="flex items-center justify-between gap-3 py-2.5">
            <span className="text-sm text-ink-muted">Niche</span>
            <span className="text-sm font-semibold text-ink">{user.niche}</span>
          </div>
          <AkunGoalEditor key={user.weeklyGoal} weeklyGoal={user.weeklyGoal} />
        </div>
      </section>

      <hr className="mt-2 border-border" />

      <section className="mt-4 space-y-3">
        <p className="text-sm font-semibold text-ink">Pintasan</p>
        <Link
          href="/riwayat"
          className="min-touch flex items-center justify-between rounded-2xl border border-border bg-surface px-4 py-3"
        >
          <span>
            <span className="block text-sm font-semibold text-ink">Riwayat</span>
            <span className="text-xs text-ink-muted">Posting & performa</span>
          </span>
          <span className="text-ink-muted">→</span>
        </Link>
        <Link
          href="/rekomendasi"
          className="min-touch flex items-center justify-between rounded-2xl border border-border bg-surface px-4 py-3"
        >
          <span>
            <span className="block text-sm font-semibold text-ink">
              Rekomendasi
            </span>
            <span className="text-xs text-ink-muted">Ide dari tren</span>
          </span>
          <span className="text-ink-muted">→</span>
        </Link>
      </section>

      <form
        className="mt-6"
        action={async () => {
          "use server";
          await signOut({ redirectTo: "/" });
        }}
      >
        <button
          type="submit"
          className="min-touch flex w-full items-center justify-center rounded-2xl border border-border bg-surface px-4 text-sm font-semibold text-coral"
        >
          Keluar
        </button>
      </form>
    </main>
  );
}
