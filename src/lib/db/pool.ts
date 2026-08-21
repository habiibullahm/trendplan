import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import { PrismaClient } from "@/generated/prisma/client";

/** Prefer explicit URL flags; never force TLS against local Postgres. */
function poolSsl(connectionString: string) {
  if (/sslmode=disable/i.test(connectionString)) return undefined;
  if (process.env.DATABASE_SSL === "false") return undefined;

  const requireSsl = /sslmode=require/i.test(connectionString);
  const wantsSsl =
    process.env.NODE_ENV === "production" ||
    requireSsl ||
    connectionString.includes("neon.tech");

  // Honor sslmode=require even on localhost; otherwise skip TLS for local hosts.
  try {
    const host = new URL(connectionString).hostname;
    if ((host === "localhost" || host === "127.0.0.1") && !requireSsl) {
      return undefined;
    }
  } catch {
    // non-URL connection strings fall through
  }

  if (wantsSsl) {
    return { rejectUnauthorized: false } as const;
  }
  return undefined;
}

export function createPrismaClientFromEnv() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL is not set");
  }

  const pool = new Pool({
    connectionString,
    ssl: poolSsl(connectionString),
  });

  return {
    prisma: new PrismaClient({ adapter: new PrismaPg(pool) }),
    pool,
  };
}
