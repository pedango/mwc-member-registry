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
    return (
      <div className="mx-auto h-48 w-full max-w-[12.25rem] rounded-xl bg-muted" />
    );
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="w-full max-w-[12.25rem] rounded-xl bg-white p-3 shadow-sm">
        <QRCodeSVG
          value={url}
          size={196}
          className="h-auto w-full"
          level="M"
          includeMargin
        />
      </div>
      <p className="max-w-full break-all text-center type-caption">{url}</p>
      <Button asChild variant="outline" size="sm" className="w-full sm:w-auto">
        <a href={url} target="_blank" rel="noreferrer">
          Open attendace page
        </a>
      </Button>
    </div>
  );
}
