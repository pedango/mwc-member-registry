import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { compare, getRounds, hash } from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { enqueueAuditLog } from "@/lib/audit";
import { authConfig } from "@/lib/auth.config";
import { BCRYPT_COST } from "@/lib/password";

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const parsed = credentialsSchema.safeParse(credentials);
        if (!parsed.success) return null;

        const user = await prisma.user.findUnique({
          where: { email: parsed.data.email.toLowerCase() },
          select: { id: true, email: true, name: true, password: true },
        });

        if (!user) return null;

        const valid = await compare(parsed.data.password, user.password);
        if (!valid) return null;

        let storedRounds = 0;
        try {
          storedRounds = getRounds(user.password);
        } catch {
          storedRounds = 0;
        }
        if (storedRounds !== BCRYPT_COST) {
          const nextHash = await hash(parsed.data.password, BCRYPT_COST);
          await prisma.user.update({
            where: { id: user.id },
            data: { password: nextHash },
          });
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
        };
      },
    }),
  ],
  events: {
    signIn({ user }) {
      if (!user?.id) return;
      enqueueAuditLog({
        userId: user.id,
        type: "LOGIN",
        targetInfo: user.email ?? undefined,
      });
    },
  },
});
