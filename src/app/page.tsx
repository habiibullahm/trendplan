import { redirect } from "next/navigation";
import { ButtonLink } from "@/components/ui/button-link";
import { getSafeSession } from "@/lib/session";

export default async function Home() {
  const session = await getSafeSession();
  if (session?.user) {
    redirect(session.user.onboardingComplete ? "/dashboard" : "/onboarding");
  }

  return (
    <main className="flex flex-1 flex-col items-center justify-center px-6 py-16">
      <div className="w-full max-w-md text-center">
        <p className="font-[family-name:var(--font-fraunces)] text-4xl font-semibold tracking-tight text-ink">
          TrendPlan
        </p>
        <p className="mt-3 text-base text-ink-muted">
          Rencana konten TikTok kamu, tiap minggu — niche Couple Date Ideas.
        </p>
        <div className="mt-8 flex flex-col gap-3">
          <ButtonLink href="/login" width="full">
            Masuk
          </ButtonLink>
          <ButtonLink href="/register" variant="secondary" width="full">
            Daftar
          </ButtonLink>
        </div>
      </div>
    </main>
  );
}
