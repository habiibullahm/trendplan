import type { z } from "zod";

/** Shared shape for useActionState / Sonner toasts across server actions. */
export type ActionResult = {
  error?: string;
  fieldErrors?: Record<string, string[]>;
  success?: string;
};

/** Generic, non-leaky messages for middleware and actions. */
export const ActionErrors = {
  rateLimited: "Terlalu banyak percobaan. Coba lagi beberapa menit lagi.",
  unauthorized: "Tidak diizinkan.",
  invalid: "Data tidak valid.",
  generic: "Terjadi kesalahan. Coba lagi.",
  loginFailed: "Email atau password salah.",
  registerNeutral: "Jika email tersedia, akun sudah dibuat. Silakan masuk.",
} as const;

export function actionError(message: string): ActionResult {
  return { error: message };
}

export function actionSuccess(message: string): ActionResult {
  return { success: message };
}

export function actionFieldErrors(
  fieldErrors: Record<string, string[] | undefined>,
): ActionResult {
  const cleaned: Record<string, string[]> = {};
  for (const [key, value] of Object.entries(fieldErrors)) {
    if (value?.length) cleaned[key] = value;
  }
  return { fieldErrors: cleaned };
}

export function fromZodError(error: z.ZodError): ActionResult {
  return actionFieldErrors(error.flatten().fieldErrors);
}
