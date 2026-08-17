import type { z } from "zod";

/** Server-action return for `useActionState` / Sonner. */
export type ActionResult = {
  error?: string;
  fieldErrors?: Record<string, string[]>;
  success?: string;
  /** Machine-stable failure id; UI may ignore. */
  errorCode?: ActionResultErrorCode;
};

export type ActionErrorCode = keyof typeof ActionErrors;
export type ActionResultErrorCode = ActionErrorCode | (string & {});

/** Shared Indonesian failure/success copy. */
export const ActionErrors = {
  rateLimited: "Terlalu banyak percobaan. Coba lagi beberapa menit lagi.",
  unauthorized: "Tidak diizinkan.",
  invalid: "Data tidak valid.",
  generic: "Terjadi kesalahan. Coba lagi.",
  loginFailed: "Email atau password salah.",
  registerNeutral: "Daftar berhasil. Silakan masuk.",
  resetRequested:
    "Jika email terdaftar, kami mengirim tautan reset password.",
  resetInvalid: "Tautan reset tidak valid atau sudah kedaluwarsa.",
  resetSuccess: "Password berhasil diperbarui. Silakan masuk.",
  passwordChanged: "Password berhasil diperbarui.",
  currentPasswordWrong: "Password saat ini salah.",
  passwordUnchanged: "Password baru harus berbeda dari password saat ini.",
  verifyInvalid: "Tautan verifikasi tidak valid atau sudah kedaluwarsa.",
  verifySuccess: "Email berhasil diverifikasi.",
  verifySent: "Jika memungkinkan, kami mengirim ulang email verifikasi.",
  emailUnverified: "Verifikasi email dulu sebelum lanjut.",
  sessionStale: "Sesi tidak valid. Masuk lagi.",
  emailDisabled:
    "Email transaksi belum aktif. Aktifkan setelah domain Resend diverifikasi. Setelah masuk, ubah password dari menu Akun.",
} as const;

function isActionErrorCode(code: string): code is ActionErrorCode {
  return Object.prototype.hasOwnProperty.call(ActionErrors, code);
}

export type ActionFailExtras = {
  error?: string;
  fieldErrors?: Record<string, string[]>;
};

export type ActionFailDomainExtras = {
  error: string;
  fieldErrors?: Record<string, string[]>;
};

/** Failure with `errorCode` + `error`. Domain codes require `extras.error`. */
export function actionFail(
  errorCode: ActionErrorCode,
  extras?: ActionFailExtras,
): ActionResult;
export function actionFail(
  errorCode: string,
  extras: ActionFailDomainExtras,
): ActionResult;
export function actionFail(
  errorCode: string,
  extras?: ActionFailExtras,
): ActionResult {
  let error: string;
  if (isActionErrorCode(errorCode)) {
    error = extras?.error ?? ActionErrors[errorCode];
  } else if (extras?.error) {
    error = extras.error;
  } else {
    throw new Error(
      `actionFail("${errorCode}"): domain error codes require extras.error`,
    );
  }

  const result: ActionResult = { errorCode, error };
  if (extras?.fieldErrors && Object.keys(extras.fieldErrors).length > 0) {
    result.fieldErrors = extras.fieldErrors;
  }
  return result;
}

export function actionError(message: string): ActionResult {
  return { error: message };
}

export function actionErrorCode(errorCode: ActionErrorCode): ActionResult {
  return actionFail(errorCode);
}

export function actionSuccess(message: string): ActionResult {
  return { success: message };
}

/** Field errors only (`errorCode: "validation"`) — no toast string. */
export function actionFieldErrors(
  fieldErrors: Record<string, string[] | undefined>,
): ActionResult {
  const cleaned: Record<string, string[]> = {};
  for (const [key, value] of Object.entries(fieldErrors)) {
    if (value?.length) cleaned[key] = value;
  }
  return { errorCode: "validation", fieldErrors: cleaned };
}

export function fromZodError(error: z.ZodError): ActionResult {
  return actionFieldErrors(error.flatten().fieldErrors);
}
