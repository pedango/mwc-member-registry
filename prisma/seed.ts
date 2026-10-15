import { hash } from "bcryptjs";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const password = await hash("admin@123", 12);

  const admins = [
    { email: "admin1@mwc.org", name: "Elder Domfeh", password },
    { email: "admin2@mwc.org", name: "Elder Bob", password },
    { email: "admin3@mwc.org", name: "Elder Awotwe", password },
    { email: "admin4@mwc.org", name: "Dangoman", password },
    { email: "admin5@mwc.org", name: "Administrator 5", password },
  ];

  for (const admin of admins) {
    await prisma.user.upsert({
      where: { email: admin.email },
      update: { name: admin.name, password: admin.password },
      create: admin,
    });
  }

  console.log("Seeded administrators:");
  for (const admin of admins) {
    console.log(`  ${admin.email} (${admin.name}) / admin@123`);
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
