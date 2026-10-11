import { NextRequest } from "next/server";
import { Prisma } from "@prisma/client";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { fullName } from "@/lib/utils";
import { getServiceDate } from "@/lib/attendance";

export const dynamic = "force-dynamic";

const bodySchema = z.object({
  memberId: z.string().min(1),
});

export async function POST(req: NextRequest) {
  const parsed = bodySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return Response.json({ error: "Select a member to check in." }, { status: 400 });
  }

  const member = await prisma.member.findUnique({
    where: { id: parsed.data.memberId },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      otherNames: true,
      assembly: true,
    },
  });

  if (!member) {
    return Response.json({ error: "That member was not found." }, { status: 404 });
  }

  const serviceDate = getServiceDate();

  try {
    const attendance = await prisma.attendance.create({
      data: {
        memberId: member.id,
        serviceDate,
      },
    });

    return Response.json({
      ok: true,
      alreadyCheckedIn: false,
      name: fullName(member),
      assembly: member.assembly,
      serviceDate: serviceDate.toISOString().slice(0, 10),
      checkedInAt: attendance.checkedInAt,
    });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return Response.json({
        ok: true,
        alreadyCheckedIn: true,
        name: fullName(member),
        assembly: member.assembly,
        serviceDate: serviceDate.toISOString().slice(0, 10),
      });
    }
    throw error;
  }
}
