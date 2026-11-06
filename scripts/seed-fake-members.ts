import "dotenv/config";
import { PrismaClient, type Assembly, type MemberStatus, type Sex } from "@prisma/client";

const MARKER = "__FAKE_SEED__";
const BATCH = 500;

const FIRST_NAMES = [
  "Ama",
  "Kofi",
  "Akosua",
  "Kwame",
  "Abena",
  "Yaw",
  "Efua",
  "Kojo",
  "Adwoa",
  "Kwesi",
  "Esi",
  "John",
  "Mary",
  "Emmanuel",
  "Grace",
];

const LAST_NAMES = [
  "Mensah",
  "Owusu",
  "Asante",
  "Boateng",
  "Agyeman",
  "Appiah",
  "Osei",
  "Darko",
  "Amoah",
  "Mills",
  "Quaye",
  "Tetteh",
  "Adjei",
  "Nyarko",
  "Sarpong",
];

const MIDDLE_NAMES = ["Kwaku", "Akua", "Nii", "Na", "", "", ""];

function argValue(flag: string) {
  const prefixed = process.argv.find((arg) => arg.startsWith(`${flag}=`));
  if (prefixed) return prefixed.slice(flag.length + 1);
  const index = process.argv.indexOf(flag);
  if (index >= 0) return process.argv[index + 1];
  return undefined;
}

function assertDevSeedAllowed() {
  if (process.env.ALLOW_FAKE_MEMBERS !== "1") {
    throw new Error(
      "Refusing to seed fake members. Set ALLOW_FAKE_MEMBERS=1 against a local/dev database only."
    );
  }
  if (process.env.NODE_ENV === "production") {
    throw new Error("Refusing to seed fake members while NODE_ENV=production.");
  }
  const url = process.env.DATABASE_URL ?? "";
  if (/neon\.tech/i.test(url) && process.env.ALLOW_FAKE_MEMBERS_NEON !== "1") {
    throw new Error(
      "Refusing to seed fake members into a Neon database. Point DATABASE_URL at local Postgres, or set ALLOW_FAKE_MEMBERS_NEON=1 only on a disposable branch."
    );
  }
}

function phoneFor(index: number) {
  return `024${String(1000000 + (index % 9000000)).slice(-7)}`;
}

function row(index: number) {
  const firstName = FIRST_NAMES[index % FIRST_NAMES.length]!;
  const lastName = LAST_NAMES[Math.floor(index / FIRST_NAMES.length) % LAST_NAMES.length]!;
  const middle = MIDDLE_NAMES[index % MIDDLE_NAMES.length]!;
  const sex: Sex = index % 2 === 0 ? "FEMALE" : "MALE";
  const assembly: Assembly = index % 3 === 0 ? "LOCAL" : "ENGLISH";
  const status: MemberStatus = index % 17 === 0 ? "OFFICER" : "MEMBER";
  return {
    firstName,
    lastName,
    middleName: middle || null,
    sex,
    assembly,
    status,
    phone: phoneFor(index),
    email: `fake${index}@seed.invalid`,
    hometown: MARKER,
    city: "Accra",
  };
}

async function cleanup(prisma: PrismaClient) {
  const result = await prisma.member.deleteMany({ where: { hometown: MARKER } });
  console.log(`Removed ${result.count} fake members (hometown=${MARKER}).`);
}

async function seed(prisma: PrismaClient, count: number) {
  const existing = await prisma.member.count({ where: { hometown: MARKER } });
  if (existing > 0) {
    console.log(`Removing ${existing} existing fake members before insert.`);
    await prisma.member.deleteMany({ where: { hometown: MARKER } });
  }

  const started = Date.now();
  for (let offset = 0; offset < count; offset += BATCH) {
    const chunk = Array.from(
      { length: Math.min(BATCH, count - offset) },
      (_, i) => row(offset + i)
    );
    await prisma.member.createMany({ data: chunk });
    console.log(`Inserted ${Math.min(offset + BATCH, count)} / ${count}`);
  }
  const total = await prisma.member.count();
  console.log(
    `Seeded ${count} fake members in ${Date.now() - started}ms. Member table now has ${total} rows.`
  );
}

async function main() {
  assertDevSeedAllowed();
  const prisma = new PrismaClient();
  const count = Math.max(1, Number(argValue("--count") || 10000));
  const shouldCleanup = process.argv.includes("--cleanup");

  try {
    if (shouldCleanup) await cleanup(prisma);
    else await seed(prisma, count);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
