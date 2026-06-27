"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { MapContainer, Marker, TileLayer, Tooltip } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { CATEGORIAS_SERVICIO } from "@/lib/types";
import { servicioMeta } from "@/lib/labels";

export type PuntoMapa = {
  id: string;
  tipo: "centro" | "servicio";
  grupo: string; // clave de filtro: "Centros de acopio" o la categoría del servicio
  nombre: string;
  lat: number;
  lng: number;
  color: string;
  emoji: string;
  foto?: string | null;
  detalle?: string;
  href?: string;
  hrefLabel?: string;
};

// Centro aproximado de los Altos Mirandinos (Los Teques).
const CENTRO_DEFECTO: [number, number] = [10.3437, -67.0418];

function pinIcon(color: string, emoji: string) {
  return L.divIcon({
    className: "ca-pin",
    html: `<div style="width:24px;height:24px;background:#070a0f;border:1.5px solid ${color};box-shadow:0 0 10px ${color},0 0 2px ${color};display:flex;align-items:center;justify-content:center;font-size:12px;line-height:1">${emoji}</div>`,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
    popupAnchor: [0, -14],
  });
}

const userIcon = L.divIcon({
  className: "ca-pin",
  html: `<div style="width:18px;height:18px;border-radius:50%;background:#2563eb;border:3px solid #fff;box-shadow:0 0 0 3px rgba(37,99,235,.35)"></div>`,
  iconSize: [18, 18],
  iconAnchor: [9, 9],
});

// Distancia en metros entre dos coordenadas (haversine).
function distanciaM(aLat: number, aLng: number, bLat: number, bLng: number) {
  const R = 6371000;
  const dLat = ((bLat - aLat) * Math.PI) / 180;
  const dLng = ((bLng - aLng) * Math.PI) / 180;
  const lat1 = (aLat * Math.PI) / 180;
  const lat2 = (bLat * Math.PI) / 180;
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

function formatDist(m: number) {
  return m < 1000 ? `${Math.round(m)} m` : `${(m / 1000).toFixed(1)} km`;
}

export default function MapaView({ puntos }: { puntos: PuntoMapa[] }) {
  const center: [number, number] =
    puntos.length > 0 ? [puntos[0].lat, puntos[0].lng] : CENTRO_DEFECTO;

  const router = useRouter();
  const mapRef = useRef<L.Map | null>(null);
  const userMarkerRef = useRef<L.Marker | null>(null);
  const [estado, setEstado] = useState<"idle" | "buscando" | "error">("idle");

  // Grupos para filtrar: centros + todas las categorías de servicios.
  const grupos = useMemo(() => {
    const counts = new Map<string, number>();
    for (const p of puntos) counts.set(p.grupo, (counts.get(p.grupo) ?? 0) + 1);
    const lista = [
      { grupo: "Centros de acopio", color: "#10b981", emoji: "🤝" },
      ...CATEGORIAS_SERVICIO.map((c) => ({
        grupo: c,
        color: servicioMeta(c).color,
        emoji: servicioMeta(c).emoji,
      })),
    ];
    return lista.map((g) => ({ ...g, count: counts.get(g.grupo) ?? 0 }));
  }, [puntos]);

  // Conjunto de grupos OCULTOS (vacío = todo visible).
  const [ocultos, setOcultos] = useState<Set<string>>(new Set());
  const [filtrosAbiertos, setFiltrosAbiertos] = useState(false);
  const visibles = puntos.filter((p) => !ocultos.has(p.grupo));

  function toggleGrupo(grupo: string) {
    setOcultos((prev) => {
      const next = new Set(prev);
      if (next.has(grupo)) next.delete(grupo);
      else next.add(grupo);
      return next;
    });
  }

  // Asegura que los tiles llenen el contenedor (al montar y al redimensionar).
  useEffect(() => {
    const fix = () => mapRef.current?.invalidateSize();
    const t = setTimeout(fix, 200);
    window.addEventListener("resize", fix);
    return () => {
      clearTimeout(t);
      window.removeEventListener("resize", fix);
    };
  }, []);

  function ubicarMasCercano() {
    const map = mapRef.current;
    if (!map) return;
    if (!navigator.geolocation) {
      setEstado("error");
      return;
    }
    setEstado("buscando");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;

        // Marca la ubicación del usuario (reemplaza la anterior).
        if (userMarkerRef.current) userMarkerRef.current.remove();
        userMarkerRef.current = L.marker([latitude, longitude], {
          icon: userIcon,
        })
          .addTo(map)
          .bindPopup("Tú estás aquí");

        const centros = puntos.filter((p) => p.tipo === "centro");
        if (centros.length === 0) {
          map.flyTo([latitude, longitude], 14);
          setEstado("idle");
          return;
        }

        let cercano = centros[0];
        let mejor = Infinity;
        for (const c of centros) {
          const d = distanciaM(latitude, longitude, c.lat, c.lng);
          if (d < mejor) {
            mejor = d;
            cercano = c;
          }
        }

        map.flyTo([cercano.lat, cercano.lng], 15, { duration: 1.2 });
        L.popup()
          .setLatLng([cercano.lat, cercano.lng])
          .setContent(
            `<strong>${cercano.nombre}</strong><br>El centro más cercano · a ${formatDist(
              mejor,
            )} de ti${cercano.href ? `<br><a href="${cercano.href}" style="color:#059669">Ver centro</a>` : ""}`,
          )
          .openOn(map);
        setEstado("idle");
      },
      () => setEstado("error"),
      { enableHighAccuracy: true, timeout: 10000 },
    );
  }

  return (
    <div className="relative h-full w-full">
      <MapContainer
        center={center}
        zoom={12}
        scrollWheelZoom
        ref={mapRef}
        whenReady={() => setTimeout(() => mapRef.current?.invalidateSize(), 0)}
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />
        {visibles.map((p) => (
          <Marker
            key={`${p.tipo}-${p.id}`}
            position={[p.lat, p.lng]}
            icon={pinIcon(p.color, p.emoji)}
            eventHandlers={{
              click: () => {
                if (p.href) router.push(p.href);
              },
            }}
          >
            <Tooltip direction="top" offset={[0, -14]} opacity={1}>
              <div style={{ width: 200 }}>
                <div
                  style={{
                    width: "100%",
                    height: 104,
                    marginBottom: 8,
                    background: "#161d28",
                    overflow: "hidden",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {p.foto ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={p.foto}
                      alt=""
                      style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    />
                  ) : (
                    <span style={{ fontSize: 30, opacity: 0.4 }}>{p.emoji}</span>
                  )}
                </div>
                <strong style={{ display: "block" }}>{p.nombre}</strong>
                {p.detalle && (
                  <span style={{ color: "#9aa7ba" }}>{p.detalle}</span>
                )}
                {p.href && (
                  <span style={{ display: "block", color: "#34d399", marginTop: 4 }}>
                    {p.hrefLabel ?? "Clic para ver"} →
                  </span>
                )}
              </div>
            </Tooltip>
          </Marker>
        ))}
      </MapContainer>

      {/* Rejilla HUD sobre el mapa */}
      <div className="grid-overlay pointer-events-none absolute inset-0 z-[400]" />

      {/* Botón para mostrar filtros (solo móvil) */}
      <button
        onClick={() => setFiltrosAbiertos((v) => !v)}
        className="absolute bottom-3 left-3 z-[1001] border border-[#1e2735] bg-[#070a0f]/90 px-3 py-2 font-mono text-[11px] font-bold uppercase tracking-wider text-emerald-400 backdrop-blur md:hidden"
      >
        {filtrosAbiertos ? "✕ Cerrar" : "☰ Filtros"}
      </button>

      {/* Panel de filtros por categoría */}
      {grupos.length > 0 && (
        <div
          className={`absolute bottom-14 left-3 z-[1000] max-h-[55%] w-52 overflow-auto border border-[#1e2735] bg-[#070a0f]/95 backdrop-blur md:bottom-3 md:w-56 ${
            filtrosAbiertos ? "block" : "hidden"
          } md:block`}
        >
          <div className="border-b border-[#1e2735] px-3 py-2 font-mono text-[10px] uppercase tracking-widest text-emerald-400">
            Filtrar en el mapa
          </div>
          <div className="p-1">
            {grupos.map((g) => {
              const on = !ocultos.has(g.grupo);
              return (
                <button
                  key={g.grupo}
                  onClick={() => toggleGrupo(g.grupo)}
                  className={`flex w-full items-center gap-2 px-2 py-1.5 text-left font-mono text-[11px] uppercase tracking-wide ${
                    on ? "text-white" : "text-white/35"
                  } hover:bg-white/5`}
                >
                  <span
                    className="inline-block h-3 w-3 shrink-0 border"
                    style={{
                      background: on ? g.color : "transparent",
                      borderColor: g.color,
                    }}
                  />
                  <span className="flex-1 truncate">{g.grupo}</span>
                  <span className="text-white/40">{g.count}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      <button
        onClick={ubicarMasCercano}
        disabled={estado === "buscando"}
        className="absolute right-3 top-3 z-[1000] flex items-center gap-1.5 border border-emerald-400/60 bg-[#070a0f]/90 px-3.5 py-2 font-mono text-xs font-bold uppercase tracking-wider text-emerald-400 shadow-lg backdrop-blur hover:bg-emerald-500 hover:text-black disabled:opacity-70"
      >
        📍 {estado === "buscando" ? "Buscando…" : "Centro más cercano"}
      </button>

      {estado === "error" && (
        <div className="absolute bottom-3 left-1/2 z-[1000] -translate-x-1/2 border border-rose-500/60 bg-[#070a0f]/90 px-3 py-1.5 font-mono text-[11px] uppercase tracking-wide text-rose-400 shadow-lg">
          No pudimos obtener tu ubicación. Activa el permiso.
        </div>
      )}
    </div>
  );
}
