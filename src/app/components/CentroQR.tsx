"use client";

import { useRef } from "react";
import { QRCodeCanvas } from "qrcode.react";

export function CentroQR({
  id,
  nombre,
  compact = false,
}: {
  id: string;
  nombre: string;
  compact?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);

  const base =
    process.env.NEXT_PUBLIC_SITE_URL ??
    (typeof window !== "undefined" ? window.location.origin : "");
  const url = `${base}/centros/${id}`;

  function descargar() {
    const canvas = ref.current?.querySelector("canvas");
    if (!canvas) return;
    const a = document.createElement("a");
    a.href = canvas.toDataURL("image/png");
    a.download = `qr-${nombre.replace(/\s+/g, "-").toLowerCase()}.png`;
    a.click();
  }

  return (
    <div className={compact ? "space-y-2 text-center" : "flex flex-wrap items-center gap-4"}>
      <div ref={ref} className="inline-block bg-white p-2">
        <QRCodeCanvas value={url} size={compact ? 150 : 132} level="M" />
      </div>
      <div className={compact ? "space-y-2" : "space-y-2 text-sm"}>
        <p className="font-mono text-[11px] uppercase tracking-wide text-faint">
          QR de verificación
        </p>
        {!compact && (
          <p className="max-w-xs text-xs text-muted">
            Imprime este QR para el centro. Al escanearlo abre su página oficial — prueba
            de que es un centro verificado.
          </p>
        )}
        <button
          onClick={descargar}
          className="w-full bg-emerald-500 px-3 py-1.5 text-xs font-bold uppercase tracking-wide text-black hover:bg-emerald-400"
        >
          Descargar QR
        </button>
      </div>
    </div>
  );
}
