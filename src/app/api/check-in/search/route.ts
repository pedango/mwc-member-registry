import { NextRequest } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { fullName } from "@/lib/utils";
import { getServiceDate } from "@/lib/attendance";

export const dynamic = "force-dynamic";

const MAX_RESULTS = 8;

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q")?.trim() ?? "";
  if (q.length < 3) {
    return Response.json({ members: [] });
  }

  const tokens = q.split(/\s+/).filter(Boolean).slice(0, 4);
  const where: Prisma.MemberWhereInput = {
    AND: tokens.map((token) => ({
      OR: [
        { firstName: { contains: token, mode: "insensitive" } },
        { lastName: { contains: token, mode: "insensitive" } },
        { otherNames: { contains: token, mode: "insensitive" } },
      ],
    })),
  };

  const serviceDate = getServiceDate();
  const members = await prisma.member.findMany({
    where,
    take: MAX_RESULTS,
    orderBy: [{ lastName: "asc" }, { firstName: "asc" }],
    select: {
      id: true,
      firstName: true,
      lastName: true,
      otherNames: true,
      assembly: true,
      photoUrl: true,
    },
  });

  const presentIds =
    members.length === 0
      ? []
      : await prisma.attendance.findMany({
          where: {
            serviceDate,
            memberId: { in: members.map((member) => member.id) },
          },
          select: { memberId: true },
        });
  const present = new Set(presentIds.map((row) => row.memberId));

  return Response.json({
    serviceDate: serviceDate.toISOString().slice(0, 10),
    members: members.map((member) => ({
      id: member.id,
      name: fullName(member),
      assembly: member.assembly,
      photoUrl: member.photoUrl,
      alreadyCheckedIn: present.has(member.id),
    })),
  });
}
