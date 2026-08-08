import { PrismaClient } from "@/generated/prisma/client";
import { createPrismaClientFromEnv } from "@/lib/db";

/** Bump when Prisma schema fields change so the dev singleton is not stale. */
const PRISMA_SCHEMA_REV = "trend-mock-media-v1";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
  prismaSchemaRev: string | undefined;
};

function getPrisma(): PrismaClient {
  if (
    process.env.NODE_ENV !== "production" &&
    globalForPrisma.prisma &&
    globalForPrisma.prismaSchemaRev !== PRISMA_SCHEMA_REV
  ) {
    void globalForPrisma.prisma.$disconnect().catch(() => undefined);
    globalForPrisma.prisma = undefined;
  }

  if (!globalForPrisma.prisma) {
    globalForPrisma.prisma = createPrismaClientFromEnv().prisma;
    globalForPrisma.prismaSchemaRev = PRISMA_SCHEMA_REV;
  }

  return globalForPrisma.prisma;
}

export const prisma = getPrisma();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
  globalForPrisma.prismaSchemaRev = PRISMA_SCHEMA_REV;
}
