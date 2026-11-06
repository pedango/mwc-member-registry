import type { Prisma } from "@prisma/client";

export const MEMBER_LIST_PAGE_SIZE = 10;
export const ASSEMBLY_ROLL_PAGE_SIZE = 20;

export const MEMBER_LIST_SELECT = {
  id: true,
  firstName: true,
  lastName: true,
  middleName: true,
  assembly: true,
  status: true,
  phone: true,
  photoUrl: true,
  createdAt: true,
} as const satisfies Prisma.MemberSelect;

export const MEMBER_LIST_ORDER_BY = [
  { lastName: "asc" },
  { firstName: "asc" },
] as const satisfies Prisma.MemberOrderByWithRelationInput[];
