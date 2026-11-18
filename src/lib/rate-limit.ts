import { redis } from "@/lib/redis";

export async function allowRequest(
  key: string,
  limit: number,
  windowSec: number
) {
  if (!redis) return true;
  try {
    const count = await redis.incr(key);
    if (count === 1) await redis.expire(key, windowSec);
    return count <= limit;
  } catch {
    return true;
  }
}

export function clientIp(headers: Headers) {
  return (
    headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    headers.get("x-real-ip")?.trim() ||
    "unknown"
  );
}
