import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { unauthorizedResponse } from "@/lib/session";
import { uploadImageToCloudinary } from "@/lib/cloudinary";
import { z } from "zod";

const bodySchema = z.object({
  dataUrl: z.string().min(1),
});

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return unauthorizedResponse();

  try {
    if (
      !process.env.CLOUDINARY_CLOUD_NAME ||
      !process.env.CLOUDINARY_API_KEY ||
      !process.env.CLOUDINARY_API_SECRET
    ) {
      return Response.json(
        {
          error:
            "Cloudinary is not configured. Set CLOUDINARY_* environment variables.",
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
      return Response.json({ error: "Only image uploads are allowed" }, { status: 400 });
    }

    const result = await uploadImageToCloudinary(parsed.data.dataUrl);
    return Response.json(result);
  } catch (err) {
    console.error(err);
    return Response.json({ error: "Image upload failed" }, { status: 500 });
  }
}
