import "server-only";

import type { AuthTokenType, Prisma } from "@/generated/prisma/client";
import {
  generateRawAuthToken,
  hashAuthToken,
} from "@/lib/auth-token-crypto";
import { prisma } from "@/lib/prisma";

export { generateRawAuthToken, hashAuthToken } from "@/lib/auth-token-crypto";

const DEFAULT_TTL_MS = 60 * 60 * 1000; // 1 hour

export async function createAuthToken(
  userId: string,
  type: AuthTokenType,
  ttlMs: number = DEFAULT_TTL_MS,
): Promise<string> {
  const raw = generateRawAuthToken();
  const tokenHash = hashAuthToken(raw);
  const expiresAt = new Date(Date.now() + ttlMs);

  await prisma.$transaction([
    prisma.authToken.updateMany({
      where: { userId, type, usedAt: null },
      data: { usedAt: new Date() },
    }),
    prisma.authToken.create({
      data: { userId, type, tokenHash, expiresAt },
    }),
  ]);

  return raw;
}

/** Mark outstanding tokens used (e.g. after mail send failure). */
export async function invalidateUnusedAuthTokens(
  userId: string,
  type: AuthTokenType,
): Promise<void> {
  await prisma.authToken.updateMany({
    where: { userId, type, usedAt: null },
    data: { usedAt: new Date() },
  });
}

async function consumeAuthTokenTx(
  tx: Prisma.TransactionClient,
  rawToken: string,
  type: AuthTokenType,
): Promise<{ userId: string } | null> {
  const tokenHash = hashAuthToken(rawToken);
  const now = new Date();

  const row = await tx.authToken.findFirst({
    where: {
      tokenHash,
      type,
      usedAt: null,
      expiresAt: { gt: now },
    },
    select: { id: true, userId: true },
  });
  if (!row) return null;

  // Conditional update so only one concurrent consumer wins.
  const updated = await tx.authToken.updateMany({
    where: {
      id: row.id,
      usedAt: null,
      expiresAt: { gt: now },
    },
    data: { usedAt: now },
  });
  if (updated.count === 0) return null;

  return { userId: row.userId };
}

export async function consumeAuthToken(
  rawToken: string,
  type: AuthTokenType,
): Promise<{ userId: string } | null> {
  return prisma.$transaction((tx) => consumeAuthTokenTx(tx, rawToken, type));
}

/**
 * Consume a one-time token and run a DB side-effect in the same transaction
 * so a failed update cannot leave the token burned.
 */
export async function consumeAuthTokenThen<T>(
  rawToken: string,
  type: AuthTokenType,
  then: (tx: Prisma.TransactionClient, userId: string) => Promise<T>,
): Promise<T | null> {
  return prisma.$transaction(async (tx) => {
    const consumed = await consumeAuthTokenTx(tx, rawToken, type);
    if (!consumed) return null;
    return then(tx, consumed.userId);
  });
}

export { appBaseUrl, isEmailVerificationRequired } from "@/lib/auth-env";
