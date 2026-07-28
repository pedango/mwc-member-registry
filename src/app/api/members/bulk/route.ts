import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { unauthorizedResponse } from "@/lib/session";
import { parseMemberSpreadsheet } from "@/lib/xlsx";
import { emptyToNull } from "@/lib/validations/member";
import { createAuditLog } from "@/lib/audit";
import { invalidateMemberCaches } from "@/lib/redis";

function parseDate(value?: string | null) {
  if (!value) return null;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return unauthorizedResponse();

  try {
    const formData = await req.formData();
    const file = formData.get("file");
    if (!(file instanceof File)) {
      return Response.json({ error: "Spreadsheet file is required" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const parsedRows = parseMemberSpreadsheet(buffer);

    const succeeded: Array<{ row: number; id: string }> = [];
    const failed: Array<{ row: number; error: string }> = [];

    for (const row of parsedRows) {
      if (!row.ok) {
        failed.push({ row: row.row, error: row.error });
        continue;
      }

      try {
        const data = row.data;
        const photoUrl =
          data.photoUrl && /^https?:\/\//i.test(data.photoUrl)
            ? data.photoUrl
            : null;

        const member = await prisma.member.create({
          data: {
            firstName: data.firstName.trim(),
            lastName: data.lastName.trim(),
            otherNames: emptyToNull(data.otherNames),
            sex: data.sex,
            assembly: data.assembly,
            contact: emptyToNull(data.contact),
            photoUrl,
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
        succeeded.push({ row: row.row, id: member.id });
      } catch (err) {
        failed.push({
          row: row.row,
          error: err instanceof Error ? err.message : "Failed to create row",
        });
      }
    }

    await createAuditLog({
      userId: session.user.id,
      type: "EXPORT_BULK",
      targetInfo: `bulk upload: ${succeeded.length} created, ${failed.length} failed`,
    });

    await invalidateMemberCaches();

    return Response.json({
      succeeded,
      failed,
      summary: {
        total: parsedRows.length,
        successCount: succeeded.length,
        failCount: failed.length,
      },
    });
  } catch (err) {
    console.error(err);
    return Response.json({ error: "Bulk upload failed" }, { status: 500 });
  }
}
