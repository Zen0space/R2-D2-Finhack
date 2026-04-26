"use client";

import QRCode from "qrcode";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

type InviteQrProps = {
  value: string;
  className?: string;
  size?: number;
};

export function InviteQr({ value, className, size = 220 }: InviteQrProps) {
  const [dataUrl, setDataUrl] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    QRCode.toDataURL(value, {
      errorCorrectionLevel: "M",
      margin: 1,
      width: size * 2,
      color: { dark: "#1f1f1a", light: "#f5f0dc" },
    })
      .then((url) => {
        if (!cancelled) setDataUrl(url);
      })
      .catch(() => {
        if (!cancelled) setDataUrl(null);
      });
    return () => {
      cancelled = true;
    };
  }, [value, size]);

  return (
    <div
      aria-label={`QR code for ${value}`}
      className={cn(
        "flex aspect-square w-full items-center justify-center rounded-[1rem] border border-[color:var(--dl-sand)] bg-[var(--dl-paper-warm)] p-3",
        className,
      )}
    >
      {dataUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img alt="" aria-hidden="true" className="h-full w-full" src={dataUrl} />
      ) : (
        <span className="text-xs text-[color:var(--dl-slate)]">Generating QR…</span>
      )}
    </div>
  );
}
