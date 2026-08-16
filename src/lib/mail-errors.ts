import { CodedError } from "@/lib/coded-error";

/** Stable failure codes for callers (map to UI copy; never leak provider text). */
export type MailErrorCode =
  | "disabled"
  | "not_configured"
  | "rejected_address"
  | "send_failed"
  | "generic";

export class MailSendError extends CodedError<MailErrorCode> {
  constructor(code: MailErrorCode) {
    super(code);
    this.name = "MailSendError";
  }
}

export function isMailSendError(error: unknown): error is MailSendError {
  return error instanceof MailSendError;
}

/**
 * Map provider HTTP failures to stable codes.
 * Prefer status / validation shape over vendor-specific domain names in the body.
 */
export function classifyResendFailure(
  status: number,
  body: string,
): Extract<MailErrorCode, "rejected_address" | "send_failed"> {
  if (status === 422) return "rejected_address";
  if (/validation_error/i.test(body)) return "rejected_address";
  if (/\binvalid\s+`?to`?\s+field\b/i.test(body)) return "rejected_address";
  return "send_failed";
}
