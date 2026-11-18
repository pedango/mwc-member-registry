import { NextRequest } from "next/server";
import { z } from "zod";
import { uploadImageToCloudinary } from "@/lib/cloudinary";
import { allowRequest, clientIp } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

const bodySchema = z.object({
  dataUrl: z.string().min(1).max(2_500_000),
});

export async function POST(req: NextRequest) {
  const ip = clientIp(req.headers);
  const allowed = await allowRequest(`visit:upload:${ip}`, 20, 600);
  if (!allowed) {
    return Response.json(
      { error: "Too many photo uploads. Please wait a few minutes." },
      { status: 429 }
    );
  }

  try {
    if (
      !process.env.CLOUDINARY_CLOUD_NAME ||
      !process.env.CLOUDINARY_API_KEY ||
      !process.env.CLOUDINARY_API_SECRET
    ) {
      return Response.json(
        {
          error:
            "Photo upload is not configured yet. You can still submit the form without a photo.",
        },
        { status: 503 }
      );
    }

    const json = await req.json();
    const parsed = bodySchema.safeParse(json);
    if (!parsed.success) {
      return Response.json({ error: "Invalid upload payload" }, { status: 400 });
    }

    if (!parsed.data.dataUrl.startsWith("data:image/")) {
      return Response.json(
        { error: "Only image uploads are allowed" },
        { status: 400 }
      );
    }

    const result = await uploadImageToCloudinary(
      parsed.data.dataUrl,
      "mwc-visitors"
    );
    return Response.json(result);
  } catch (err) {
    console.error(err);
    return Response.json({ error: "Image upload failed" }, { status: 500 });
  }
}
