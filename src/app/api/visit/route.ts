import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { allowRequest, clientIp } from "@/lib/rate-limit";
import {
  resolveVisitorPurpose,
  visitorFormSchema,
} from "@/lib/validations/visitor";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const ip = clientIp(req.headers);
  const allowed = await allowRequest(`visit:submit:${ip}`, 8, 600);
  if (!allowed) {
    return Response.json(
      { error: "Too many submissions. Please wait a few minutes." },
      { status: 429 }
    );
  }

  const body = await req.json().catch(() => null);
  const parsed = visitorFormSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json(
      { error: parsed.error.issues[0]?.message || "Invalid input" },
      { status: 400 }
    );
  }

  if (parsed.data.website?.trim()) {
    return Response.json({ ok: true });
  }

  const visitor = await prisma.visitor.create({
    data: {
      firstName: parsed.data.firstName,
      otherNames: parsed.data.otherNames,
      lastName: parsed.data.lastName,
      phone: parsed.data.phone,
      email: parsed.data.email,
      purpose: resolveVisitorPurpose(
        parsed.data.purpose,
        parsed.data.purposeOther
      ),
      photoUrl: parsed.data.photoUrl,
    },
    select: { id: true, firstName: true },
  });

  return Response.json({ ok: true, visitor });
}
