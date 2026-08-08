import Link from "next/link";
import { redirect } from "next/navigation";
import { auth, signOut } from "@/auth";
import { AkunAvatar } from "@/features/auth/components/akun-avatar";
import { AkunGoalEditor } from "@/features/auth/components/akun-goal-editor";
import { AkunNicheEditor } from "@/features/auth/components/akun-niche-editor";
import { LogoutButton } from "@/features/auth/components/logout-button";
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
      imageUrl: true,
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

      <div className="mt-6">
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
        <LogoutButton />
      </form>
    </main>
  );
}
