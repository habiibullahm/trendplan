/** Domain lib outcome (not client ActionResult). */
export type Result<T extends object, C extends string> =
  | ({ ok: true } & T)
  | { ok: false; code: C };

export type ResultErrorCode<C extends string = string> = C;

export function resultOk<T extends object>(value: T): { ok: true } & T {
  return { ...value, ok: true };
}

export function resultErr<C extends string>(code: C): { ok: false; code: C } {
  return { ok: false, code };
}

/** @deprecated Use `resultOk`. */
export const ok = resultOk;
/** @deprecated Use `resultErr`. */
export const err = resultErr;

export function isOk<T extends object, C extends string>(
  result: Result<T, C>,
): result is { ok: true } & T {
  return result.ok;
}

export function isErr<T extends object, C extends string>(
  result: Result<T, C>,
): result is { ok: false; code: C } {
  return !result.ok;
}
