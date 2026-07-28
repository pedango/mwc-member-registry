import { NextRequest } from "next/server";
import { Prisma } from "@prisma/client";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { unauthorizedResponse } from "@/lib/session";
import {
  emptyToNull,
  memberFormSchema,
} from "@/lib/validations/member";
import { invalidateMemberCaches } from "@/lib/redis";
import { fullName } from "@/lib/utils";

function parseDate(value?: string | null) {
  if (!value) return null;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
}

async function findDuplicate(firstName: string, lastName: string, otherNames?: string | null) {
  const others = emptyToNull(otherNames);
  return prisma.member.findFirst({
    where: {
      AND: [
        { firstName: { equals: firstName, mode: "insensitive" } },
        { lastName: { equals: lastName, mode: "insensitive" } },
        others
          ? { otherNames: { equals: others, mode: "insensitive" } }
          : {
              OR: [{ otherNames: null }, { otherNames: "" }],
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
  if (q) {
    where.OR = [
      { firstName: { contains: q, mode: "insensitive" } },
      { lastName: { contains: q, mode: "insensitive" } },
      { otherNames: { contains: q, mode: "insensitive" } },
      { contact: { contains: q, mode: "insensitive" } },
    ];
  }

  const [total, members] = await Promise.all([
    prisma.member.count({ where }),
    prisma.member.findMany({
      where,
      orderBy: [{ lastName: "asc" }, { firstName: "asc" }],
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: { createdBy: { select: { id: true, name: true, email: true } } },
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
        data.otherNames
      );
      if (duplicate) {
        return Response.json(
          {
            duplicate: true,
            message: `A member named ${fullName(duplicate)} already exists. Add anyway?`,
            existingId: duplicate.id,
          },
          { status: 409 }
        );
      }
    }

    const member = await prisma.member.create({
      data: {
        firstName: data.firstName.trim(),
        lastName: data.lastName.trim(),
        otherNames: emptyToNull(data.otherNames),
        sex: data.sex,
        assembly: data.assembly,
        contact: emptyToNull(data.contact),
        photoUrl: emptyToNull(data.photoUrl) || null,
        location: emptyToNull(data.location),
        motherName: emptyToNull(data.motherName),
        fatherName: emptyToNull(data.fatherName),
        position: emptyToNull(data.position),
        status: data.status,
        dateBaptised: parseDate(data.dateBaptised),
        baptisedBy: emptyToNull(data.baptisedBy),
        createdById: session.user.id,
      },
    });

    await invalidateMemberCaches();
    return Response.json({ member }, { status: 201 });
  } catch (err) {
    console.error(err);
    return Response.json({ error: "Failed to create member" }, { status: 500 });
  }
}
