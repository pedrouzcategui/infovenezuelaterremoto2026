"use client";

import dynamic from "next/dynamic";
import type { PuntoMapa } from "./MapaView";

// Leaflet usa `window`, así que el mapa solo se carga en el cliente.
const MapaView = dynamic(() => import("./MapaView"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full items-center justify-center text-sm text-faint">
      Cargando mapa…
    </div>
  ),
});

export function MapaClient({ puntos }: { puntos: PuntoMapa[] }) {
  return <MapaView puntos={puntos} />;
}
