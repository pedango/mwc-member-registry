import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { unauthorizedResponse } from "@/lib/session";
import { parseMemberSpreadsheet } from "@/lib/xlsx";
import { toMemberRecord } from "@/lib/validations/member";
import { enqueueAuditLog } from "@/lib/audit";
import { invalidateMemberStats } from "@/lib/member-stats";

const CREATE_BATCH = 40;

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
    const pending: Array<{
      row: number;
      data: ReturnType<typeof toMemberRecord> & { createdById: string };
    }> = [];

    for (const row of parsedRows) {
      if (!row.ok) {
        failed.push({ row: row.row, error: row.error });
        continue;
      }

      const data = row.data;
      const photoUrl =
        data.photoUrl && /^https?:\/\//i.test(data.photoUrl)
          ? data.photoUrl
          : null;
      pending.push({
        row: row.row,
        data: {
          ...toMemberRecord(data, photoUrl),
          createdById: session.user.id,
        },
      });
    }

    for (let i = 0; i < pending.length; i += CREATE_BATCH) {
      const chunk = pending.slice(i, i + CREATE_BATCH);
      try {
        const created = await prisma.$transaction(
          chunk.map((item) => prisma.member.create({ data: item.data }))
        );
        created.forEach((member, index) => {
          succeeded.push({ row: chunk[index]!.row, id: member.id });
        });
      } catch {
        for (const item of chunk) {
          try {
            const member = await prisma.member.create({ data: item.data });
            succeeded.push({ row: item.row, id: member.id });
          } catch (rowErr) {
            failed.push({
              row: item.row,
              error:
                rowErr instanceof Error ? rowErr.message : "Failed to create row",
            });
          }
        }
      }
    }

    enqueueAuditLog({
      userId: session.user.id,
      type: "EXPORT_BULK",
      targetInfo: `bulk upload: ${succeeded.length} created, ${failed.length} failed`,
    });

    await invalidateMemberStats();

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
