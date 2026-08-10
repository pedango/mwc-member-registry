"use client";

import { useEffect, useRef, useState } from "react";
import { Camera, Loader2, RefreshCcw, Check } from "lucide-react";
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
  const [starting, setStarting] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);

  function stopCamera() {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setActive(false);
  }

  async function startCamera() {
    if (!navigator.mediaDevices?.getUserMedia) {
      toast.error("Camera is not supported in this browser.");
      return;
    }

    setStarting(true);
    setPreview(null);
    try {
      // Prefer environment camera on mobile; fall back to any camera.
      let stream: MediaStream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: { ideal: "user" },
            width: { ideal: 640 },
            height: { ideal: 480 },
          },
          audio: false,
        });
      } catch {
        stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: false,
        });
      }

      streamRef.current = stream;
      setActive(true);
    } catch {
      toast.error(
        "Unable to access camera. Allow camera permission and try again."
      );
      stopCamera();
    } finally {
      setStarting(false);
    }
  }

  // Attach the stream only after the <video> is mounted (active === true).
  useEffect(() => {
    const video = videoRef.current;
    const stream = streamRef.current;
    if (!active || !video || !stream) return;

    video.srcObject = stream;
    const play = async () => {
      try {
        await video.play();
      } catch {
        /* autoplay can fail until user gesture — Capture button still works */
      }
    };
    void play();

    return () => {
      video.srcObject = null;
    };
  }, [active]);

  useEffect(() => {
    return () => {
      streamRef.current?.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    };
  }, []);

  function capture() {
    const video = videoRef.current;
    if (!video) return;

    const width = video.videoWidth || 640;
    const height = video.videoHeight || 480;
    if (!width || !height) {
      toast.error("Camera is still starting. Wait a moment and try again.");
      return;
    }

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(video, 0, 0, width, height);
    const dataUrl = canvas.toDataURL("image/jpeg", 0.9);
    setPreview(dataUrl);
    stopCamera();
  }

  function confirm() {
    if (preview) onCapture(preview);
  }

  return (
    <div className="space-y-3">
      {!active && !preview && (
        <button
          type="button"
          onClick={startCamera}
          disabled={starting}
          aria-busy={starting}
          className="flex aspect-[4/5] w-full flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border bg-muted/60 px-4 text-center transition-ui hover:border-primary/40 hover:bg-muted disabled:opacity-60"
        >
          {starting ? (
            <Loader2
              className="h-6 w-6 animate-spin text-primary"
              aria-hidden="true"
            />
          ) : (
            <span className="rounded-xl bg-card p-2.5 text-primary shadow-sm">
              <Camera className="h-5 w-5" aria-hidden="true" />
            </span>
          )}
          <span className="text-sm font-medium text-foreground">
            {starting ? "Starting camera..." : "Open camera"}
          </span>
          <span className="type-caption">
            {starting
              ? "Allow camera access if prompted"
              : "Capture a photo now"}
          </span>
        </button>
      )}

      {active && (
        <div className="space-y-3">
          <video
            ref={videoRef}
            className="aspect-[4/5] w-full rounded-xl bg-muted object-cover"
            playsInline
            muted
            autoPlay
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
            className="aspect-[4/5] w-full rounded-xl border border-border object-cover"
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
                void startCamera();
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
