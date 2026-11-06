import "dotenv/config";
import { PrismaClient } from "@prisma/client";

async function timeMs<T>(label: string, work: () => Promise<T>) {
  const start = process.hrtime.bigint();
  const result = await work();
  const ms = Number(process.hrtime.bigint() - start) / 1e6;
  let extra = "";
  if (Array.isArray(result)) extra = ` rows=${result.length}`;
  else if (typeof result === "number") extra = ` n=${result}`;
  else if (result && typeof result === "object" && "length" in result) {
    extra = ` rows=${String((result as { length: number }).length)}`;
  }
  console.log(`${label.padEnd(42)} ${ms.toFixed(1)}ms${extra}`);
  return ms;
}

async function main() {
  const prisma = new PrismaClient();
  try {
    const total = await prisma.member.count();
    console.log(`Member rows: ${total}`);
    console.log(`DATABASE_URL host: ${safeHost()}`);

    await timeMs("count()", () => prisma.member.count());
    await timeMs("dashboard groupBy assembly", () =>
      prisma.member.groupBy({ by: ["assembly"], _count: { _all: true } })
    );
    await timeMs("dashboard officer count", () =>
      prisma.member.count({ where: { status: "OFFICER" } })
    );
    await timeMs("list page 1 (10, surname sort, select)", () =>
      prisma.member.findMany({
        orderBy: [{ lastName: "asc" }, { firstName: "asc" }],
        take: 10,
        select: {
          id: true,
          firstName: true,
          lastName: true,
          middleName: true,
          assembly: true,
          status: true,
          phone: true,
          photoUrl: true,
          createdAt: true,
        },
      })
    );
    await timeMs("search 'John Mills' tokenized AND", () =>
      prisma.member.findMany({
        where: {
          AND: [
            {
              OR: [
                { firstName: { contains: "John", mode: "insensitive" } },
                { lastName: { contains: "John", mode: "insensitive" } },
                { middleName: { contains: "John", mode: "insensitive" } },
              ],
            },
            {
              OR: [
                { firstName: { contains: "Mills", mode: "insensitive" } },
                { lastName: { contains: "Mills", mode: "insensitive" } },
                { middleName: { contains: "Mills", mode: "insensitive" } },
              ],
            },
          ],
        },
        take: 10,
        orderBy: [{ lastName: "asc" }, { firstName: "asc" }],
        select: { id: true, firstName: true, lastName: true },
      })
    );
    await timeMs("search 'Mills John' tokenized AND", () =>
      prisma.member.findMany({
        where: {
          AND: [
            {
              OR: [
                { firstName: { contains: "Mills", mode: "insensitive" } },
                { lastName: { contains: "Mills", mode: "insensitive" } },
                { middleName: { contains: "Mills", mode: "insensitive" } },
              ],
            },
            {
              OR: [
                { firstName: { contains: "John", mode: "insensitive" } },
                { lastName: { contains: "John", mode: "insensitive" } },
                { middleName: { contains: "John", mode: "insensitive" } },
              ],
            },
          ],
        },
        take: 10,
        orderBy: [{ lastName: "asc" }, { firstName: "asc" }],
        select: { id: true, firstName: true, lastName: true },
      })
    );
    await timeMs("assembly ENGLISH page 1 (20)", () =>
      prisma.member.findMany({
        where: { assembly: "ENGLISH" },
        orderBy: [{ lastName: "asc" }, { firstName: "asc" }],
        take: 20,
        select: { id: true, firstName: true, lastName: true, assembly: true },
      })
    );
  } finally {
    await prisma.$disconnect();
  }
}

function safeHost() {
  try {
    return new URL(process.env.DATABASE_URL ?? "").host;
  } catch {
    return "(unparseable)";
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
