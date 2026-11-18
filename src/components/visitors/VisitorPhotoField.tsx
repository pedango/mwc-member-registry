"use client";

import { useRef, useState } from "react";
import { Camera, ImagePlus, Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { CameraCapture } from "@/components/members/CameraCapture";
import { compressImageDataUrl, compressImageFile } from "@/lib/compress-image";
import { cn } from "@/lib/utils";

export function VisitorPhotoField({
  photoUrl,
  onUploaded,
}: {
  photoUrl?: string | null;
  onUploaded: (url: string) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [mode, setMode] = useState<"idle" | "camera">("idle");
  const [uploading, setUploading] = useState(false);

  async function uploadData(dataUrl: string) {
    setUploading(true);
    try {
      const res = await fetch("/api/visit/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dataUrl }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Upload failed");
      onUploaded(json.url);
      setMode("idle");
      toast.success("Photo added");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  async function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be under 5MB");
      return;
    }
    try {
      const dataUrl = await compressImageFile(file);
      await uploadData(dataUrl);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not read image");
    }
  }

  async function onCapture(dataUrl: string) {
    try {
      const compressed = await compressImageDataUrl(dataUrl);
      await uploadData(compressed);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Capture upload failed");
    }
  }

  return (
    <div className="space-y-3">
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={onFileChange}
      />

      {photoUrl ? (
        <div className="space-y-3">
          <div className="overflow-hidden rounded-2xl border border-border bg-muted">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={photoUrl}
              alt="Your photo"
              className="aspect-[4/3] w-full object-cover"
            />
          </div>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              disabled={uploading}
              onClick={() => inputRef.current?.click()}
            >
              {uploading ? (
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
              ) : (
                <ImagePlus className="h-4 w-4" aria-hidden="true" />
              )}
              Replace
            </Button>
            <Button
              type="button"
              variant="ghost"
              onClick={() => onUploaded("")}
              aria-label="Remove photo"
            >
              <Trash2 className="h-4 w-4 text-destructive" aria-hidden="true" />
            </Button>
          </div>
        </div>
      ) : mode === "camera" ? (
        <div className="space-y-3">
          <CameraCapture onCapture={onCapture} facingMode="user" />
          <Button
            type="button"
            variant="ghost"
            className="w-full"
            onClick={() => setMode("idle")}
            disabled={uploading}
          >
            Cancel camera
          </Button>
        </div>
      ) : (
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setMode("camera")}
            disabled={uploading}
            className={cn(
              "inline-flex h-10 flex-1 items-center justify-center gap-2 rounded-full border border-border bg-card px-3 text-sm font-medium text-foreground shadow-sm transition-ui hover:bg-muted disabled:opacity-60"
            )}
          >
            <Camera className="h-4 w-4" aria-hidden="true" />
            Photo
          </button>
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            aria-busy={uploading}
            className="inline-flex h-10 flex-1 items-center justify-center gap-2 rounded-full border border-border bg-card px-3 text-sm font-medium text-foreground shadow-sm transition-ui hover:bg-muted disabled:opacity-60"
          >
            {uploading ? (
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
            ) : (
              <ImagePlus className="h-4 w-4" aria-hidden="true" />
            )}
            {uploading ? "Uploading..." : "Add photo"}
          </button>
        </div>
      )}
    </div>
  );
}
