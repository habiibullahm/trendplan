/**
 * `process.env.NODE_ENV` is typed read-only under `@types/node`.
 * Mutate via a loose record so unit tests can stub production/dev.
 */
export function setNodeEnv(value: string | undefined): void {
  const env = process.env as unknown as Record<string, string | undefined>;
  if (value === undefined) delete env.NODE_ENV;
  else env.NODE_ENV = value;
}
