import Link from "next/link";
import { redirect } from "next/navigation";
import { auth, signOut } from "@/auth";
import { VerifyEmailPanel } from "@/features/auth/components/verify-email-panel";
import { Button } from "@/components/ui/button";
import { isEmailVerificationRequired } from "@/lib/auth-tokens";
import { prisma } from "@/lib/prisma";

type Props = {
  searchParams: Promise<{ token?: string }>;
};

export default async function VerifyEmailPage({ searchParams }: Props) {
  const { token } = await searchParams;
  const session = await auth();

  // Token links work while logged out; soft-gate pages require a session.
  if (!token && !session?.user?.id) redirect("/login");

  let alreadyVerified = false;
  if (session?.user?.id) {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { emailVerified: true, email: true },
    });
    alreadyVerified = Boolean(user?.emailVerified);
    if (!isEmailVerificationRequired() && !token) {
      redirect(user ? "/dashboard" : "/login");
    }
  }

  return (
    <main className="flex flex-1 flex-col items-center justify-center px-6 py-12">
      <div className="w-full max-w-md rounded-2xl border border-border bg-surface p-6 shadow-none">
        <div className="mb-6 text-center">
          <Link
            href="/"
            className="font-[family-name:var(--font-fraunces)] text-3xl font-semibold text-ink"
          >
            TrendPlan
          </Link>
          <p className="mt-2 text-sm text-ink-muted">Verifikasi email</p>
        </div>

        <VerifyEmailPanel
          token={token}
          alreadyVerified={alreadyVerified}
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
          <p className="mt-6 text-center text-sm text-ink-muted">
            <Link href="/login" className="font-semibold text-coral">
              Masuk
            </Link>
          </p>
        )}
      </div>
    </main>
  );
}
