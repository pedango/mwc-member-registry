"use client";

import { useEffect, useRef, useState } from "react";
import { Camera, RefreshCcw, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export function CameraCapture({
  onCapture,
}: {
  onCapture: (dataUrl: string) => void;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [active, setActive] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);

  async function startCamera() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: { ideal: 640 }, height: { ideal: 480 } },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setActive(true);
      setPreview(null);
    } catch {
      toast.error("Unable to access camera. Check browser permissions.");
    }
  }

  function stopCamera() {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    setActive(false);
  }

  function capture() {
    const video = videoRef.current;
    if (!video) return;
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL("image/jpeg", 0.9);
    setPreview(dataUrl);
    stopCamera();
  }

  function confirm() {
    if (preview) onCapture(preview);
  }

  useEffect(() => {
    return () => stopCamera();
  }, []);

  return (
    <div className="space-y-3">
      {!active && !preview && (
        <button
          type="button"
          onClick={startCamera}
          className="flex aspect-[4/5] w-full flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-mwc-border bg-mwc-surface/60 px-4 text-center transition-ui hover:border-mwc-blue/40 hover:bg-mwc-surface"
        >
          <span className="rounded-md bg-white p-2.5 text-mwc-blue shadow-sm">
            <Camera className="h-5 w-5" aria-hidden="true" />
          </span>
          <span className="text-sm font-medium text-foreground">
            Open camera
          </span>
          <span className="type-caption">Capture a photo now</span>
        </button>
      )}

      {active && (
        <div className="space-y-3">
          <video
            ref={videoRef}
            className="aspect-[4/5] w-full rounded-lg bg-mwc-ink object-cover"
            playsInline
            muted
          />
          <div className="flex gap-2">
            <Button type="button" size="sm" className="flex-1" onClick={capture}>
              Capture
            </Button>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={stopCamera}
            >
              Cancel
            </Button>
          </div>
        </div>
      )}

      {preview && (
        <div className="space-y-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={preview}
            alt="Captured preview"
            className="aspect-[4/5] w-full rounded-lg border border-mwc-border object-cover"
          />
          <div className="flex gap-2">
            <Button
              type="button"
              size="sm"
              className="flex-1"
              onClick={confirm}
            >
              <Check className="h-4 w-4" aria-hidden="true" />
              Use photo
            </Button>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => {
                setPreview(null);
                startCamera();
              }}
            >
              <RefreshCcw className="h-4 w-4" aria-hidden="true" />
              Retake
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
