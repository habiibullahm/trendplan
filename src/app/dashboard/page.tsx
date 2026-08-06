import Link from "next/link";
import { redirect } from "next/navigation";
import { auth, signOut } from "@/auth";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (!session.user.onboardingComplete) redirect("/onboarding");

  return (
    <main className="mx-auto flex w-full max-w-lg flex-1 flex-col px-6 py-10">
      <p className="text-sm text-ink-muted">Halo, {session.user.name ?? "creator"}</p>
      <h1 className="mt-1 font-[family-name:var(--font-fraunces)] text-3xl font-semibold text-ink">
        Dashboard
      </h1>
      <p className="mt-3 text-sm text-ink-muted">
        Auth siap. Halaman tren, rekomendasi, dan planner menyusul.
      </p>

      <div className="mt-8 rounded-2xl border border-border bg-surface p-4">
        <p className="text-sm text-ink">
          Email: <span className="font-medium">{session.user.email}</span>
        </p>
        <p className="mt-1 text-sm text-ink-muted">Niche: Couple Date Ideas · TikTok</p>
      </div>

      <form
        action={async () => {
          "use server";
          await signOut({ redirectTo: "/" });
        }}
        className="mt-8"
      >
        <button
          type="submit"
          className="min-touch inline-flex w-full items-center justify-center rounded-xl border border-border bg-surface px-5 py-3 text-sm font-semibold text-ink"
        >
          Keluar
        </button>
      </form>

      <Link href="/" className="mt-4 text-center text-sm text-coral">
        Kembali ke beranda
      </Link>
    </main>
  );
}
