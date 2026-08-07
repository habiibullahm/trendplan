/**
 * Clear a stuck Prisma migrate advisory lock on Neon/Postgres.
 * Usage:
 *   DATABASE_URL="<neon-direct-url>" npx tsx scripts/clear-prisma-advisory-lock.ts
 *   # or set DIRECT_URL / DATABASE_URL in .env
 */
import "dotenv/config";
import { Client } from "pg";

const PRISMA_LOCK_KEY = 72707369;

function connectionUrl(): string | undefined {
  return (
    process.env.DIRECT_URL ||
    process.env.DATABASE_URL?.replace("-pooler.", ".") ||
    process.env.DATABASE_URL
  );
}

async function main() {
  const url = connectionUrl();
  if (!url) {
    console.error("DIRECT_URL or DATABASE_URL is required");
    process.exit(1);
  }

  const client = new Client({
    connectionString: url,
    connectionTimeoutMillis: 12_000,
  });
  await client.connect();

  const holders = await client.query<{
    pid: number;
    application_name: string | null;
    state: string | null;
  }>(
    `select l.pid, a.application_name, a.state
     from pg_locks l
     left join pg_stat_activity a on a.pid = l.pid
     where l.locktype = 'advisory'
       and l.granted = true
       and l.objid = $1`,
    [PRISMA_LOCK_KEY],
  );

  if (!holders.rowCount) {
    console.log("No granted advisory lock for Prisma key; nothing to clear.");
    await client.end();
    return;
  }

  for (const row of holders.rows) {
    const res = await client.query<{ pg_terminate_backend: boolean }>(
      `select pg_terminate_backend($1) as pg_terminate_backend`,
      [row.pid],
    );
    console.log(
      `terminate pid=${row.pid} app=${row.application_name} state=${row.state} -> ${res.rows[0]?.pg_terminate_backend}`,
    );
  }

  const after = await client.query(
    `select pid from pg_locks where locktype = 'advisory' and objid = $1`,
    [PRISMA_LOCK_KEY],
  );
  console.log(`Remaining locks on key: ${after.rowCount}`);
  await client.end();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
