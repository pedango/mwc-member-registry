"use client";

import { useEffect, useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { Button } from "@/components/ui/button";

export function CheckInQr() {
  const [url, setUrl] = useState("");

  useEffect(() => {
    setUrl(`${window.location.origin}/check-in`);
  }, []);

  if (!url) {
    return <div className="h-48 w-48 rounded-xl bg-muted" />;
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="rounded-xl bg-white p-3 shadow-sm">
        <QRCodeSVG value={url} size={196} level="M" includeMargin />
      </div>
      <p className="break-all text-center type-caption">{url}</p>
      <Button asChild variant="outline" size="sm">
        <a href={url} target="_blank" rel="noreferrer">
          Open check-in page
        </a>
      </Button>
    </div>
  );
}
