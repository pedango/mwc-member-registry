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

/**
 * Write an audit row without blocking the HTTP response. Errors are logged so
 * the entry is still attempted; pages/API routes must not skip this call.
 */
export function enqueueAuditLog(params: {
  userId: string;
  type: LogType;
  targetInfo?: string;
}) {
  const job = createAuditLog(params).catch((err) => {
    console.error("[audit] failed to write log", err);
  });
  void job;
}
