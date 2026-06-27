"use client";

import { useState } from "react";
import { CATEGORIAS_SERVICIO } from "@/lib/types";
import { SERVICIO_META } from "@/lib/labels";
import { MapaClient } from "./MapaClient";
import type { PuntoMapa } from "./MapaView";

const ARCGIS_SRC =
  "https://www.arcgis.com/home/webscene/viewer.html?webscene=c01ef4b6b74b4d25a39f7a1e4865be58&viewpoint=cam:-66.9725224,10.6678662,4994.533;218.21,62.917&ui=min";

type Tab = "acopio" | "edificaciones";

export function MapaTabs({
  puntos,
  nCentros,
  nServicios,
}: {
  puntos: PuntoMapa[];
  nCentros: number;
  nServicios: number;
}) {
  const [tab, setTab] = useState<Tab>("acopio");

  const tabBtn = (t: Tab, label: string) => (
    <button
      onClick={() => setTab(t)}
      className={`px-4 py-2 font-mono text-xs font-bold uppercase tracking-wide transition-colors ${
        tab === t
          ? "bg-emerald-500 text-black"
          : "border border-border bg-surface text-muted hover:bg-surface-2"
      }`}
    >
      {label}
    </button>
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {tabBtn("acopio", "🤝 Centros de acopio")}
        {tabBtn("edificaciones", "🏚️ Edificaciones afectadas")}
      </div>

      <div className="mx-[calc(50%-50vw)] w-screen border-y border-[#1e2735] bg-[#070a0f] text-white">
        {tab === "acopio" ? (
          <>
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#1e2735] px-4 py-2 font-mono text-[11px] uppercase tracking-widest">
              <span className="flex items-center gap-2 text-emerald-400">
                <span className="inline-block h-2 w-2 animate-pulse bg-emerald-400" />
                Mapa en vivo · Centros y servicios
              </span>
              <span className="flex gap-4 text-white/55">
                <span>Centros: {nCentros}</span>
                <span>Servicios: {nServicios}</span>
                <span className="hidden sm:inline">Altos Mirandinos + Caracas</span>
              </span>
            </div>
            <div className="relative h-[80vh] min-h-[480px] w-full">
              <MapaClient puntos={puntos} />
            </div>
          </>
        ) : (
          <>
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#1e2735] px-4 py-2 font-mono text-[11px] uppercase tracking-widest">
              <span className="flex items-center gap-2 text-amber-400">
                <span className="inline-block h-2 w-2 animate-pulse bg-amber-400" />
                Edificaciones afectadas · mapa 3D
              </span>
              <span className="hidden text-white/55 sm:inline">Fuente: ArcGIS</span>
            </div>
            <div className="relative h-[80vh] min-h-[480px] w-full">
              <iframe
                src={ARCGIS_SRC}
                title="Mapa interactivo de edificaciones afectadas"
                allowFullScreen
                className="h-full w-full border-0"
              />
            </div>
          </>
        )}
      </div>

      {tab === "acopio" ? (
        <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 font-mono text-[11px] uppercase tracking-wide text-muted">
          <span className="inline-flex items-center gap-1.5">
            <span className="inline-block h-3 w-3" style={{ background: "#10b981" }} />
            🤝 Centro de acopio
          </span>
          {CATEGORIAS_SERVICIO.map((c) => (
            <span key={c} className="inline-flex items-center gap-1.5">
              <span
                className="inline-block h-3 w-3"
                style={{ background: SERVICIO_META[c].color }}
              />
              {SERVICIO_META[c].emoji} {c}
            </span>
          ))}
        </div>
      ) : (
        <p className="text-center font-mono text-[11px] uppercase tracking-wide text-faint">
          Mapa 3D interactivo de edificaciones afectadas. Arrastra para girar y
          acercar. Información de carácter referencial.
        </p>
      )}
    </div>
  );
}
