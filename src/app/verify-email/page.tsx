import Link from "next/link";
import { redirect } from "next/navigation";
import { auth, signOut, unstable_update } from "@/auth";
import { VerifyEmailPanel } from "@/features/auth/components/verify-email-panel";
import { Button } from "@/components/ui/button";
import { isEmailVerificationRequired } from "@/lib/auth/env";
import {
  loginPath,
  safeAuthCallbackUrl,
  withAuthCallbackQuery,
} from "@/lib/auth/callback-url";
import { prisma } from "@/lib/prisma";

type Props = {
  searchParams: Promise<{ token?: string; callbackUrl?: string }>;
};

export default async function VerifyEmailPage({ searchParams }: Props) {
  const { token, callbackUrl: rawCallback } = await searchParams;
  const callbackUrl = safeAuthCallbackUrl(rawCallback);
  const session = await auth();

  // Token links work while logged out; soft-gate pages require a session.
  if (!token && !session?.user?.id) {
    redirect(loginPath({ callbackUrl }));
  }

  if (session?.user?.id) {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { emailVerified: true, onboardingComplete: true },
    });

    // DB is source of truth. Refresh JWT before leaving so the edge proxy
    // does not bounce us back to /verify-email (redirect loop).
    if (user?.emailVerified) {
      await unstable_update({});
      if (user.onboardingComplete) {
        redirect(callbackUrl ?? "/dashboard");
      }
      redirect(withAuthCallbackQuery("/onboarding", callbackUrl));
    }

    if (!isEmailVerificationRequired() && !token) {
      redirect(user ? callbackUrl ?? "/dashboard" : loginPath({ callbackUrl }));
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
          alreadyVerified={false}
          canResend={Boolean(session?.user?.id)}
          callbackUrl={callbackUrl}
        />

        {session?.user?.id ? (
          <form
            className="mt-6"
            action={async () => {
              "use server";
              await signOut({ redirectTo: loginPath({ callbackUrl }) });
            }}
          >
            <Button type="submit" variant="secondary" width="full">
              Keluar
            </Button>
          </form>
        ) : (
          <p className="mt-6 text-center text-sm text-ink-muted">
            <Link
              href={loginPath({ callbackUrl })}
              className="font-semibold text-coral"
            >
              Masuk
            </Link>
          </p>
        )}
      </div>
    </main>
  );
}
