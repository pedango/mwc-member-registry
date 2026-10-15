import { Prisma } from "@prisma/client";

export function memberDirectoryWhere(q: string): Prisma.MemberWhereInput {
  const query = q.trim();
  if (!query) return {};

  return {
    OR: [
      { firstName: { contains: query, mode: "insensitive" } },
      { lastName: { contains: query, mode: "insensitive" } },
      { otherNames: { contains: query, mode: "insensitive" } },
      { contact: { contains: query, mode: "insensitive" } },
      { location: { contains: query, mode: "insensitive" } },
    ],
  };
}
