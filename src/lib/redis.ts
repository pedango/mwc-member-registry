import { Redis } from "@upstash/redis";

export const redis =
  process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
    ? new Redis({
        url: process.env.UPSTASH_REDIS_REST_URL,
        token: process.env.UPSTASH_REDIS_REST_TOKEN,
      })
    : null;

function withTimeout<T>(promise: Promise<T>, ms = 200): Promise<T | null> {
  return Promise.race([
    promise,
    new Promise<null>((resolve) => {
      setTimeout(() => resolve(null), ms);
    }),
  ]);
}

export async function getCachedCount(key: string): Promise<number | null> {
  if (!redis) return null;
  try {
    const value = await withTimeout(redis.get<number>(key));
    return value ?? null;
  } catch {
    return null;
  }
}

export async function setCachedCount(key: string, value: number, ttl = 60) {
  if (!redis) return;
  try {
    await withTimeout(redis.set(key, value, { ex: ttl }));
  } catch {
    // optional cache — ignore failures
  }
}

export async function invalidateMemberCaches() {
  if (!redis) return;
  try {
    await withTimeout(
      redis.del("member:count", "member:count:ENGLISH", "member:count:LOCAL")
    );
  } catch {
    // optional cache — ignore failures
  }
}
