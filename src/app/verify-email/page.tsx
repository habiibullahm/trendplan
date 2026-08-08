import Link from "next/link";
import { redirect } from "next/navigation";
import { auth, signOut, unstable_update } from "@/auth";
import { AuthShell } from "@/features/auth/components/auth-shell";
import { VerifyEmailPanel } from "@/features/auth/components/verify-email-panel";
import { Button } from "@/components/ui/button";
import { isEmailVerificationRequired } from "@/lib/auth/env";
import { prisma } from "@/lib/prisma";

type Props = {
  searchParams: Promise<{ token?: string }>;
};

export default async function VerifyEmailPage({ searchParams }: Props) {
  const { token } = await searchParams;
  const session = await auth();

  // Token links work while logged out; soft-gate pages require a session.
  if (!token && !session?.user?.id) redirect("/login");

  if (session?.user?.id) {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { emailVerified: true, onboardingComplete: true },
    });

    // DB is source of truth. Refresh JWT before leaving so the edge proxy
    // does not bounce us back to /verify-email (redirect loop).
    if (user?.emailVerified) {
      await unstable_update({});
      redirect(user.onboardingComplete ? "/dashboard" : "/onboarding");
    }

    if (!isEmailVerificationRequired() && !token) {
      redirect(user ? "/dashboard" : "/login");
    }
  }

  return (
    <AuthShell>
      <div className="mb-6 text-center">
        <Link
          href="/"
          className="font-[family-name:var(--font-fraunces)] text-3xl font-semibold text-foreground"
        >
          TrendPlan
        </Link>
        <p className="mt-2 text-sm text-muted-foreground">Verifikasi email</p>
      </div>

      <VerifyEmailPanel
        token={token}
        alreadyVerified={false}
        canResend={Boolean(session?.user?.id)}
      />

      {session?.user?.id ? (
        <form
          className="mt-6"
          action={async () => {
            "use server";
            await signOut({ redirectTo: "/login" });
          }}
        >
          <Button type="submit" variant="secondary" width="full">
            Keluar
          </Button>
        </form>
      ) : (
        <p className="mt-6 text-center text-sm text-muted-foreground">
          <Link href="/login" className="font-semibold text-primary">
            Masuk
          </Link>
        </p>
      )}
    </AuthShell>
  );
}
