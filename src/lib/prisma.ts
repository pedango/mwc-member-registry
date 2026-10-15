import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

let client: PrismaClient | undefined = globalForPrisma.prisma;

/**
 * Neon (and other serverless Postgres) closes idle TCP connections.
 * Keep the pool small in dev and prefer short connect timeouts so a
 * dropped socket fails fast and Prisma can open a fresh one.
 */
function datasourceUrl() {
  const raw = process.env.DATABASE_URL;
  if (!raw) return undefined;

  try {
    const url = new URL(raw);
    if (!url.searchParams.has("connect_timeout")) {
      url.searchParams.set("connect_timeout", "5");
    }
    if (!url.searchParams.has("pool_timeout")) {
      url.searchParams.set("pool_timeout", "5");
    }
    if (!url.searchParams.has("connection_limit")) {
      url.searchParams.set("connection_limit", "5");
    }
    // Neon pooler hosts need pgbouncer mode so prepared statements are disabled.
    if (
      /pooler/i.test(url.hostname) &&
      !url.searchParams.has("pgbouncer")
    ) {
      url.searchParams.set("pgbouncer", "true");
    }
    return url.toString();
  } catch {
    return raw;
  }
}

function createClient() {
  const url = datasourceUrl();
  return new PrismaClient({
    log:
      process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
    datasources: url ? { db: { url } } : undefined,
  });
}

function getClient(): PrismaClient {
  if (!client) {
    client = createClient();
    if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = client;
  }
  return client;
}

/** Drop a dead client so the next query opens a new connection. */
export async function resetPrisma() {
  if (!client) return;
  try {
    await client.$disconnect();
  } catch {
    /* already closed */
  }
  client = undefined;
  globalForPrisma.prisma = undefined;
}

/**
 * Constructed on first use rather than on import. Next.js imports every route
 * module while collecting page data at build time, and PrismaClient validates
 * its datasource in the constructor — so eager construction fails any build
 * that runs without database env vars present.
 */
export const prisma = new Proxy({} as PrismaClient, {
  get(_target, property) {
    const instance = getClient();
    const value = Reflect.get(instance, property, instance);
    return typeof value === "function" ? value.bind(instance) : value;
  },
});
