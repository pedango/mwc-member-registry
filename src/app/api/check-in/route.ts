import { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { fullName } from "@/lib/utils";
import { getServiceDate, serviceDateIso } from "@/lib/attendance";

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
  const created = await prisma.attendance.createMany({
    data: {
      memberId: member.id,
      assembly: member.assembly,
      serviceDate,
    },
    skipDuplicates: true,
  });

  return Response.json({
    ok: true,
    alreadyCheckedIn: created.count === 0,
    name: fullName(member),
    assembly: member.assembly,
    serviceDate: serviceDateIso(serviceDate),
  });
}
