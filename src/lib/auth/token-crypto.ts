import { createHash, randomBytes } from "node:crypto";

const TOKEN_BYTES = 32;

export function hashAuthToken(rawToken: string): string {
  return createHash("sha256").update(rawToken, "utf8").digest("hex");
}

export function generateRawAuthToken(): string {
  return randomBytes(TOKEN_BYTES).toString("base64url");
}
