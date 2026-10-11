import { NextRequest } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { fullName } from "@/lib/utils";
import { getServiceDate } from "@/lib/attendance";

export const dynamic = "force-dynamic";

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
    take: 8,
    orderBy: [{ lastName: "asc" }, { firstName: "asc" }],
    select: {
      id: true,
      firstName: true,
      lastName: true,
      otherNames: true,
      assembly: true,
      photoUrl: true,
      attendances: {
        where: { serviceDate },
        select: { id: true },
        take: 1,
      },
    },
  });

  return Response.json({
    serviceDate: serviceDate.toISOString().slice(0, 10),
    members: members.map((member) => ({
      id: member.id,
      name: fullName(member),
      assembly: member.assembly,
      photoUrl: member.photoUrl,
      alreadyCheckedIn: member.attendances.length > 0,
    })),
  });
}
