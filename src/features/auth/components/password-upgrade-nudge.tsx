"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

const TOAST_ID = "password-upgrade";

/** One toast alert when the account still uses a weak/legacy password. */
export function PasswordUpgradeToast() {
  const router = useRouter();

  useEffect(() => {
    toast.message("Password kamu perlu diperbarui", {
      id: TOAST_ID,
      description:
        "Password lama kurang aman. Perbarui di Akun — kamu tetap bisa memakai aplikasi.",
      duration: 10_000,
      action: {
        label: "Ubah",
        onClick: () => {
          router.push("/akun#password");
        },
      },
    });
  }, [router]);

  return null;
}
