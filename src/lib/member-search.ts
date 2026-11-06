import { Prisma } from "@prisma/client";

const SEARCH_TOKEN_LIMIT = 6;

function searchTokens(q: string) {
  return q
    .trim()
    .split(/\s+/)
    .map((token) => token.trim())
    .filter(Boolean)
    .slice(0, SEARCH_TOKEN_LIMIT);
}

function tokenClause(token: string): Prisma.MemberWhereInput {
  return {
    OR: [
      { firstName: { contains: token, mode: "insensitive" } },
      { lastName: { contains: token, mode: "insensitive" } },
      { middleName: { contains: token, mode: "insensitive" } },
      { phone: { contains: token, mode: "insensitive" } },
      { email: { contains: token, mode: "insensitive" } },
      { city: { contains: token, mode: "insensitive" } },
      { hometown: { contains: token, mode: "insensitive" } },
      { gpsAddress: { contains: token, mode: "insensitive" } },
    ],
  };
}

export function memberDirectoryWhere(q: string): Prisma.MemberWhereInput {
  const tokens = searchTokens(q);
  if (tokens.length === 0) return {};
  return { AND: tokens.map(tokenClause) };
}

export function memberNameSearchWhere(q: string): Prisma.MemberWhereInput {
  const tokens = searchTokens(q);
  if (tokens.length === 0) return {};
  return {
    AND: tokens.map((token) => ({
      OR: [
        { firstName: { contains: token, mode: "insensitive" } },
        { lastName: { contains: token, mode: "insensitive" } },
        { middleName: { contains: token, mode: "insensitive" } },
      ],
    })),
  };
}
