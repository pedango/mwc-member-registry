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

function parseDate(value?: string | null) {
  if (!value) return null;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
}

type Params = { params: { id: string } };

export async function GET(_req: NextRequest, { params }: Params) {
  const session = await auth();
  if (!session?.user?.id) return unauthorizedResponse();

  const member = await prisma.member.findUnique({
    where: { id: params.id },
    include: { createdBy: { select: { id: true, name: true, email: true } } },
  });

  if (!member) {
    return Response.json({ error: "Member not found" }, { status: 404 });
  }

  return Response.json({ member });
}

export async function PUT(req: NextRequest, { params }: Params) {
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

    const existing = await prisma.member.findUnique({ where: { id: params.id } });
    if (!existing) {
      return Response.json({ error: "Member not found" }, { status: 404 });
    }

    // Optimistic concurrency: if client sent updatedAt, ensure it matches
    if (parsed.data.updatedAt) {
      const clientUpdated = new Date(parsed.data.updatedAt).getTime();
      if (clientUpdated !== existing.updatedAt.getTime()) {
        return Response.json(
          {
            error:
              "This member was updated by another admin. Refresh and try again.",
          },
          { status: 409 }
        );
      }
    }

    const data = parsed.data;
    const member = await prisma.member.update({
      where: { id: params.id },
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
      },
    });

    await invalidateMemberCaches();
    return Response.json({ member });
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2025") {
      return Response.json({ error: "Member not found" }, { status: 404 });
    }
    console.error(err);
    return Response.json({ error: "Failed to update member" }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const session = await auth();
  if (!session?.user?.id) return unauthorizedResponse();

  try {
    await prisma.member.delete({ where: { id: params.id } });
    await invalidateMemberCaches();
    return Response.json({ success: true });
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2025") {
      return Response.json({ error: "Member not found" }, { status: 404 });
    }
    console.error(err);
    return Response.json({ error: "Failed to delete member" }, { status: 500 });
  }
}
