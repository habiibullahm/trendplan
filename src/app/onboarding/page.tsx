import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { completeOnboardingAction } from "@/app/actions/onboarding";

export default async function OnboardingPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (session.user.onboardingComplete) redirect("/dashboard");

  return (
    <main className="flex flex-1 flex-col items-center justify-center px-6 py-12">
      <div className="w-full max-w-md rounded-2xl border border-border bg-surface p-6">
        <p className="text-sm text-ink-muted">Langkah terakhir</p>
        <h1 className="mt-1 font-[family-name:var(--font-fraunces)] text-2xl font-semibold text-ink">
          Target posting mingguan
        </h1>
        <p className="mt-2 text-sm text-ink-muted">
          Platform: TikTok · Niche: Couple Date Ideas
        </p>

        <form
          action={async (formData) => {
            "use server";
            await completeOnboardingAction(formData);
            redirect("/dashboard");
          }}
          className="mt-6 flex flex-col gap-4"
        >
          <label className="block text-left">
            <span className="text-sm font-medium text-ink">
              Berapa konten per minggu?
            </span>
            <input
              name="weeklyGoal"
              type="number"
              min={1}
              max={7}
              defaultValue={3}
              className="mt-1 min-touch w-full rounded-xl border border-border bg-paper px-3 text-ink outline-none focus:border-coral"
            />
          </label>
          <button
            type="submit"
            className="min-touch inline-flex items-center justify-center rounded-xl bg-coral px-5 py-3 text-sm font-semibold text-white"
          >
            Buat rencana minggu ini
          </button>
        </form>
      </div>
    </main>
  );
}
