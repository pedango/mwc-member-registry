import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { unauthorizedResponse } from "@/lib/session";
import { buildMemberPdf } from "@/lib/pdf";
import { buildSingleMemberExcelBuffer } from "@/lib/xlsx";
import { createAuditLog } from "@/lib/audit";
import { fullName } from "@/lib/utils";

type Params = { params: { id: string } };

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
      firstName: member.firstName,
      lastName: member.lastName,
      otherNames: member.otherNames,
      sex: member.sex,
      assembly: member.assembly,
      contact: member.contact,
      photoUrl: member.photoUrl,
      location: member.location,
      motherName: member.motherName,
      fatherName: member.fatherName,
      position: member.position,
      status: member.status,
      dateBaptised: member.dateBaptised?.toISOString().slice(0, 10) ?? "",
      baptisedBy: member.baptisedBy,
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
