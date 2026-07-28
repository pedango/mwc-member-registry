import { hash } from "bcryptjs";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const password = await hash("Admin@123!", 12);

  const admins = [
    {
      email: "admin@mwc.org",
      name: "System Administrator",
      password,
    },
    {
      email: "pastor@mwc.org",
      name: "Lead Pastor",
      password,
    },
  ];

  for (const admin of admins) {
    await prisma.user.upsert({
      where: { email: admin.email },
      update: {
        name: admin.name,
        password: admin.password,
      },
      create: admin,
    });
  }

  console.log("Seeded admin users:");
  console.log("  admin@mwc.org / Admin@123!");
  console.log("  pastor@mwc.org / Admin@123!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
