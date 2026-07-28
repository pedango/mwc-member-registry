import { NextRequest } from "next/server";
import { LogType } from "@prisma/client";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { unauthorizedResponse } from "@/lib/session";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return unauthorizedResponse();

  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type");
  const page = Math.max(1, Number(searchParams.get("page") || 1));
  const pageSize = Math.min(100, Math.max(1, Number(searchParams.get("pageSize") || 20)));

  const where =
    type && Object.values(LogType).includes(type as LogType)
      ? { type: type as LogType }
      : {};

  const [total, logs] = await Promise.all([
    prisma.auditLog.count({ where }),
    prisma.auditLog.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: {
        user: { select: { id: true, name: true, email: true } },
      },
    }),
  ]);

  return Response.json({ logs, total, page, pageSize });
}
