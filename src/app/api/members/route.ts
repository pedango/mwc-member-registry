import { NextRequest } from "next/server";
import { Prisma } from "@prisma/client";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { unauthorizedResponse } from "@/lib/session";
import {
  emptyToNull,
  memberFormSchema,
  toMemberRecord,
} from "@/lib/validations/member";
import { invalidateMemberStats } from "@/lib/member-stats";
import { formatMemberName } from "@/lib/utils";
import { memberDirectoryWhere } from "@/lib/member-search";
import { MEMBER_LIST_ORDER_BY, MEMBER_LIST_SELECT } from "@/lib/member-list";

async function findDuplicate(
  firstName: string,
  lastName: string,
  middleName?: string | null
) {
  const middle = emptyToNull(middleName);
  return prisma.member.findFirst({
    where: {
      AND: [
        { firstName: { equals: firstName, mode: "insensitive" } },
        { lastName: { equals: lastName, mode: "insensitive" } },
        middle
          ? { middleName: { equals: middle, mode: "insensitive" } }
          : {
              OR: [{ middleName: null }, { middleName: "" }],
            },
      ],
    },
  });
}

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return unauthorizedResponse();

  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q")?.trim() ?? "";
  const assembly = searchParams.get("assembly");
  const page = Math.max(1, Number(searchParams.get("page") || 1));
  const pageSize = Math.min(50, Math.max(1, Number(searchParams.get("pageSize") || 10)));

  const where: Prisma.MemberWhereInput = {};
  if (assembly === "ENGLISH" || assembly === "LOCAL") {
    where.assembly = assembly;
  }
  Object.assign(where, memberDirectoryWhere(q));

  const [total, members] = await Promise.all([
    prisma.member.count({ where }),
    prisma.member.findMany({
      where,
      orderBy: [...MEMBER_LIST_ORDER_BY],
      skip: (page - 1) * pageSize,
      take: pageSize,
      select: MEMBER_LIST_SELECT,
    }),
  ]);

  return Response.json({ members, total, page, pageSize });
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return unauthorizedResponse();

  try {
    const body = await req.json();
    const parsed = memberFormSchema.safeParse(body);
    if (!parsed.success) {
      return Response.json(
        { error: parsed.error.issues[0]?.message || "Invalid input" },
        { status: 400 }
      );
    }

    const data = parsed.data;
    if (!data.forceDuplicate) {
      const duplicate = await findDuplicate(
        data.firstName,
        data.lastName,
        data.middleName
      );
      if (duplicate) {
        return Response.json(
          {
            duplicate: true,
            message: `A member named ${formatMemberName(duplicate)} already exists. Add anyway?`,
            existingId: duplicate.id,
          },
          { status: 409 }
        );
      }
    }

    const member = await prisma.member.create({
      data: {
        ...toMemberRecord(data),
        createdById: session.user.id,
      },
    });

    await invalidateMemberStats();
    return Response.json({ member }, { status: 201 });
  } catch (err) {
    console.error(err);
    return Response.json({ error: "Failed to create member" }, { status: 500 });
  }
}
