import { hash } from "bcryptjs";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const password = await hash("admin@123", 12);

  const admins = [
    { email: "admin1@mwc.org", name: "Elder Domfeh", password },
    { email: "admin2@mwc.org", name: "Elder Bob", password },
    { email: "admin3@mwc.org", name: "Administrator 3", password },
    { email: "admin4@mwc.org", name: "Administrator 4", password },
    { email: "admin5@mwc.org", name: "Administrator 5", password },
  ];

  await prisma.auditLog.deleteMany();
  await prisma.user.deleteMany();

  await prisma.user.createMany({ data: admins });

  console.log("Cleared previous users and seeded:");
  for (const admin of admins) {
    console.log(`  ${admin.email} / admin@123`);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
