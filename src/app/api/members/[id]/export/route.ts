import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { unauthorizedResponse } from "@/lib/session";
import { buildMemberPdf } from "@/lib/pdf";
import { buildSingleMemberExcelBuffer } from "@/lib/xlsx";
import { createAuditLog } from "@/lib/audit";
import { fullName, toDateInput } from "@/lib/utils";

type Params = { params: { id: string } };

function yesNo(value: boolean | null | undefined) {
  if (value === true) return "Yes";
  if (value === false) return "No";
  return "";
}

export async function GET(req: NextRequest, { params }: Params) {
  const session = await auth();
  if (!session?.user?.id) return unauthorizedResponse();

  const member = await prisma.member.findUnique({ where: { id: params.id } });
  if (!member) {
    return Response.json({ error: "Member not found" }, { status: 404 });
  }

  const format = new URL(req.url).searchParams.get("format") || "pdf";
  const name = fullName(member).replace(/[^\w\-]+/g, "_");

  await createAuditLog({
    userId: session.user.id,
    type: "EXPORT_SINGLE",
    targetInfo: `${member.id}:${fullName(member)} (${format})`,
  });

  if (format === "xlsx") {
    const buffer = buildSingleMemberExcelBuffer({
      title: member.title,
      firstName: member.firstName,
      middleName: member.middleName,
      lastName: member.lastName,
      sex: member.sex,
      dateOfBirth: toDateInput(member.dateOfBirth),
      placeOfBirth: member.placeOfBirth,
      phone: member.phone,
      email: member.email,
      status: member.status,
      maritalStatus: member.maritalStatus,
      addressLine1: member.addressLine1,
      gpsAddress: member.gpsAddress,
      hometown: member.hometown,
      streetName: member.streetName,
      city: member.city,
      holyGhostBaptism: yesNo(member.holyGhostBaptism),
      dateOfHolySpiritBaptism: toDateInput(member.dateOfHolySpiritBaptism),
      waterBaptism: yesNo(member.waterBaptism),
      dateOfBaptism: toDateInput(member.dateOfBaptism),
      dateOfConversion: toDateInput(member.dateOfConversion),
      dateOfJoining: toDateInput(member.dateOfJoining),
      placeOfBaptism: member.placeOfBaptism,
      officiatingMinisterBaptism: member.officiatingMinisterBaptism,
      officiatingMinisterDistrict: member.officiatingMinisterDistrict,
      communicant: yesNo(member.communicant),
      occupation: member.occupation,
      educationLevel: member.educationLevel,
      profile: member.profile,
      dedicated: yesNo(member.dedicated),
      dedicationDate: toDateInput(member.dedicationDate),
      dedicationOfficiatingMinister: member.dedicationOfficiatingMinister,
      dedicationChurch: member.dedicationChurch,
      assembly: member.assembly,
      photoUrl: member.photoUrl,
    });

    return new Response(new Uint8Array(buffer), {
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="${name}.xlsx"`,
      },
    });
  }

  const pdf = await buildMemberPdf(member);
  return new Response(new Uint8Array(pdf), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${name}.pdf"`,
    },
  });
}
