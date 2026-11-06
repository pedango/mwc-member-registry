import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { formatMemberName } from "@/lib/utils";
import { getServiceDate } from "@/lib/attendance";
import { memberNameSearchWhere } from "@/lib/member-search";
import { MEMBER_LIST_ORDER_BY } from "@/lib/member-list";
import { cloudinaryThumbUrl } from "@/lib/cloudinary-url";

export const dynamic = "force-dynamic";

const MAX_RESULTS = 8;

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q")?.trim() ?? "";
  if (q.length < 3) {
    return Response.json({ members: [] });
  }

  const where = memberNameSearchWhere(q);
  const serviceDate = getServiceDate();
  const members = await prisma.member.findMany({
    where,
    take: MAX_RESULTS,
    orderBy: [...MEMBER_LIST_ORDER_BY],
    select: {
      id: true,
      firstName: true,
      lastName: true,
      middleName: true,
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
      name: formatMemberName(member),
      assembly: member.assembly,
      photoUrl: cloudinaryThumbUrl(member.photoUrl, 80),
      alreadyCheckedIn: present.has(member.id),
    })),
  });
}
