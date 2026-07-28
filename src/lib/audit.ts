import { LogType } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export async function createAuditLog(params: {
  userId: string;
  type: LogType;
  targetInfo?: string;
}) {
  return prisma.auditLog.create({
    data: {
      userId: params.userId,
      type: params.type,
      targetInfo: params.targetInfo,
    },
  });
}
