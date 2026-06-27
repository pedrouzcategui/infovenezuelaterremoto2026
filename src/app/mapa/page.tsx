import { getPuntosMapa } from "@/lib/data";
import { CATEGORIAS_SERVICIO } from "@/lib/types";
import { SERVICIO_META } from "@/lib/labels";
import { MapaClient } from "./MapaClient";

export const dynamic = "force-dynamic";

export default async function MapaPage() {
  const puntos = await getPuntosMapa();
  const nCentros = puntos.filter((p) => p.tipo === "centro").length;
  const nServicios = puntos.filter((p) => p.tipo === "servicio").length;

  return (
    <div className="space-y-4">
      {/* Bloque del mapa a todo el ancho, estilo HUD */}
      <div className="mx-[calc(50%-50vw)] w-screen border-y border-[#1e2735] bg-[#070a0f] text-white">
        {/* Barra de estado superior */}
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
      </div>

      {puntos.length === 0 && (
        <p className="border border-amber-500/40 bg-amber-500/10 px-3 py-2 font-mono text-xs uppercase tracking-wide text-amber-600">
          Sin puntos con ubicación. Agrega coordenadas a los centros y servicios desde
          administración.
        </p>
      )}

      {/* Leyenda */}
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
    </div>
  );
}
