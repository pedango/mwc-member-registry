import { NextRequest } from "next/server";
import { Prisma } from "@prisma/client";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { unauthorizedResponse } from "@/lib/session";

type Params = { params: { id: string } };

export async function DELETE(_req: NextRequest, { params }: Params) {
  const session = await auth();
  if (!session?.user?.id) return unauthorizedResponse();

  try {
    await prisma.visitor.delete({ where: { id: params.id } });
    return Response.json({ ok: true });
  } catch (err) {
    if (
      err instanceof Prisma.PrismaClientKnownRequestError &&
      err.code === "P2025"
    ) {
      return Response.json({ error: "Visitor not found" }, { status: 404 });
    }
    console.error(err);
    return Response.json({ error: "Failed to delete visitor" }, { status: 500 });
  }
}
