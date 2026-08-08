import Link from "next/link";
import { Suspense } from "react";
import { redirect } from "next/navigation";
import { auth, signOut } from "@/auth";
import { AkunAvatar } from "@/features/auth/components/akun-avatar";
import { AkunGoalEditor } from "@/features/auth/components/akun-goal-editor";
import { AkunNicheEditor } from "@/features/auth/components/akun-niche-editor";
import { AkunToastFromQuery } from "@/features/auth/components/akun-toast-from-query";
import { ChangePasswordForm } from "@/features/auth/components/change-password-form";
import { LogoutButton } from "@/features/auth/components/logout-button";
import { UpdateLog } from "@/features/auth/components/update-log";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
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

      <Separator className="mt-6" />

      <section className="mt-2">
        <p className="text-sm font-semibold text-foreground">Preferensi konten</p>
        <div className="mt-1 divide-y divide-border">
          <AkunNicheEditor key={user.niche} niche={user.niche} />
          <AkunGoalEditor key={user.weeklyGoal} weeklyGoal={user.weeklyGoal} />
        </div>
      </section>

      <Separator className="mt-2" />

      <section id="password" className="mt-2 scroll-mt-24">
        <p className="text-sm font-semibold text-foreground">Keamanan</p>
        <div className="mt-1 divide-y divide-border">
          <ChangePasswordForm />
        </div>
      </section>

      <Separator className="mt-6" />

      <section className="mt-4 space-y-3">
        <p className="text-sm font-semibold text-foreground">Pintasan</p>
        <Link href="/riwayat" className="block">
          <Card className="min-touch flex flex-row items-center justify-between gap-0 rounded-2xl px-4 py-3 ring-border">
            <span>
              <span className="block text-sm font-semibold text-foreground">
                Riwayat
              </span>
              <span className="text-xs text-muted-foreground">
                Konten yang sudah Posted
              </span>
            </span>
            <span className="text-muted-foreground">→</span>
          </Card>
        </Link>
        <Link href="/rekomendasi" className="block">
          <Card className="min-touch flex flex-row items-center justify-between gap-0 rounded-2xl px-4 py-3 ring-border">
            <span>
              <span className="block text-sm font-semibold text-foreground">
                Rekomendasi
              </span>
              <span className="text-xs text-muted-foreground">Ide dari tren</span>
            </span>
            <span className="text-muted-foreground">→</span>
          </Card>
        </Link>
        <UpdateLog />
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
