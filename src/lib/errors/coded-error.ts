/** Throwable failure with a stable `code` (prefer `Result` when you can return). */
export class CodedError<Code extends string = string> extends Error {
  readonly code: Code;

  constructor(code: Code) {
    super(code);
    this.name = "CodedError";
    this.code = code;
  }
}

export function isCodedError(error: unknown): error is CodedError {
  return error instanceof CodedError;
}

export function isCodedErrorWithCode<Code extends string>(
  error: unknown,
  code: Code,
): error is CodedError<Code> {
  return error instanceof CodedError && error.code === code;
}
