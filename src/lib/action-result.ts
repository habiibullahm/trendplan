import type { z } from "zod";

export type ActionStatus = "success" | "error";

export type ActionErrorCode = keyof typeof ActionErrors;
export type ActionResultErrorCode = ActionErrorCode | (string & {});

/** Optional payload on ActionResult (codes, fields, feature extras). */
export type ActionResultData = {
  errorCode?: ActionResultErrorCode;
  fieldErrors?: Record<string, string[]>;
  inviteUrl?: string;
};

/** Server-action return for `useActionState` / Sonner. */
export type ActionResult<T extends ActionResultData = ActionResultData> = {
  status: ActionStatus;
  message?: string;
  data?: T;
};

/** Shared Indonesian failure/success copy. */
export const ActionErrors = {
  rateLimited: "Terlalu banyak percobaan. Coba lagi beberapa menit lagi.",
  unauthorized: "Tidak diizinkan.",
  invalid: "Data tidak valid.",
  generic: "Terjadi kesalahan. Coba lagi.",
  loginFailed: "Email atau password salah.",
  registerNeutral: "Daftar berhasil. Silakan masuk.",
  resetRequested: "Jika email terdaftar, kami mengirim tautan reset password.",
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
  message?: string;
  fieldErrors?: Record<string, string[]>;
};

export type ActionFailDomainExtras = {
  message: string;
  fieldErrors?: Record<string, string[]>;
};

/** Failure: `status: "error"` + `message` + `data.errorCode`. Domain codes require `extras.message`. */
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
  let message: string;
  if (isActionErrorCode(errorCode)) {
    message = extras?.message ?? ActionErrors[errorCode];
  } else if (extras?.message) {
    message = extras.message;
  } else {
    throw new Error(
      `actionFail("${errorCode}"): domain error codes require extras.message`,
    );
  }

  const data: ActionResultData = { errorCode };
  if (extras?.fieldErrors && Object.keys(extras.fieldErrors).length > 0) {
    data.fieldErrors = extras.fieldErrors;
  }
  return { status: "error", message, data };
}

export function actionError(message: string): ActionResult {
  return { status: "error", message };
}

export function actionErrorCode(errorCode: ActionErrorCode): ActionResult {
  return actionFail(errorCode);
}

export function actionSuccess(
  message: string,
  data?: ActionResultData,
): ActionResult {
  if (data && Object.keys(data).length > 0) {
    return { status: "success", message, data };
  }
  return { status: "success", message };
}

/**
 * Field errors only — `data.errorCode: "validation"` (not in ActionErrors).
 * Omits `message` so Sonner stays quiet.
 */
export function actionFieldErrors(
  fieldErrors: Record<string, string[] | undefined>,
): ActionResult {
  const cleaned: Record<string, string[]> = {};
  for (const [key, value] of Object.entries(fieldErrors)) {
    if (value?.length) cleaned[key] = value;
  }
  return {
    status: "error",
    data: { errorCode: "validation", fieldErrors: cleaned },
  };
}

export function fromZodError(error: z.ZodError): ActionResult {
  return actionFieldErrors(error.flatten().fieldErrors);
}

/**
 * Idle `useActionState` initial value.
 * `status: "success"` without `message` — do not treat as a completed action
 * (toasts / refresh / close-modal side effects need `message`).
 */
export const idleActionResult: ActionResult = { status: "success" };

/** Completed success with user-facing copy (not idle). */
export function isCompletedActionSuccess(result: ActionResult): boolean {
  return result.status === "success" && Boolean(result.message);
}

export function actionFieldErrorsOf(
  result: ActionResult,
): Record<string, string[]> | undefined {
  return result.data?.fieldErrors;
}
