import { auth } from "@/lib/auth";
import { unauthorizedResponse } from "@/lib/session";
import { buildMemberTemplateBuffer } from "@/lib/xlsx";
import { createAuditLog } from "@/lib/audit";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return unauthorizedResponse();

  await createAuditLog({
    userId: session.user.id,
    type: "EXPORT_BULK",
    targetInfo: "template download",
  });

  const buffer = buildMemberTemplateBuffer();
  return new Response(new Uint8Array(buffer), {
    headers: {
      "Content-Type":
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition":
        'attachment; filename="mwc-members-template.xlsx"',
    },
  });
}
