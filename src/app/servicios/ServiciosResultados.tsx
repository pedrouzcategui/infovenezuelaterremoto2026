"use client";

import { useMemo, useState } from "react";
import type { Servicio } from "@/lib/types";
import { servicioMeta } from "@/lib/labels";
import { instagramLink, whatsappLink } from "@/lib/format";
import { IconInstagram, IconMap, IconPhone, IconWhatsApp } from "../components/icons";

export function ServiciosResultados({
  servicios,
  cat,
}: {
  servicios: Servicio[];
  cat?: string;
}) {
  const [q, setQ] = useState("");

  const filtrados = useMemo(() => {
    const t = q.trim().toLowerCase();
    if (!t) return servicios;
    return servicios.filter((s) =>
      [s.nombre, s.descripcion, s.direccion, s.categoria, s.zona]
        .filter(Boolean)
        .some((v) => (v as string).toLowerCase().includes(t)),
    );
  }, [q, servicios]);

  return (
    <div>
      {/* Buscador */}
      <div className="relative mb-4">
        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-faint">
          🔎
        </span>
        <input
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Buscar por nombre, lugar o descripción…"
          className="block w-full border border-border bg-surface py-2.5 pl-9 pr-3 text-sm text-foreground placeholder:text-faint focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
        />
      </div>

      {filtrados.length === 0 ? (
        <p className="border border-dashed border-border bg-surface p-6 text-center text-faint">
          {q.trim()
            ? `No encontramos servicios para “${q.trim()}”.`
            : `No hay servicios${cat ? " en esta categoría" : ""} todavía.`}
        </p>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
          {filtrados.map((s) => {
            const wa = whatsappLink(s.whatsapp);
            const ig = instagramLink(s.instagram);
            const meta = servicioMeta(s.categoria);
            return (
              <li key={s.id} className="overflow-hidden border border-border bg-surface">
                {s.foto_url ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={s.foto_url}
                    alt={s.nombre}
                    className="aspect-[16/9] w-full object-cover"
                  />
                ) : (
                  <div className="flex aspect-[16/9] w-full items-center justify-center bg-gradient-to-br from-surface-2 to-surface text-4xl opacity-40">
                    {meta.emoji}
                  </div>
                )}
                <div className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="font-semibold text-foreground">{s.nombre}</h3>
                      <p className="text-xs text-faint">
                        <span
                          className="mr-1 inline-block h-2 w-2 align-middle"
                          style={{ background: meta.color }}
                        />
                        {s.categoria}
                        {s.zona ? ` · ${s.zona}` : ""}
                      </p>
                    </div>
                    <div className="flex shrink-0 flex-col items-end gap-1">
                      {s.costo && (
                        <span
                          className={`px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wide ring-1 ${
                            s.costo === "Gratis"
                              ? "bg-emerald-500/15 text-emerald-600 ring-emerald-500/30"
                              : "bg-amber-500/15 text-amber-600 ring-amber-500/30"
                          }`}
                        >
                          {s.costo === "Gratis" ? "GRATIS" : "PAGO"}
                        </span>
                      )}
                    </div>
                  </div>

                  {s.descripcion && (
                    <p className="mt-2 text-sm text-muted">{s.descripcion}</p>
                  )}
                  {s.direccion && (
                    <p className="mt-1 text-sm text-muted">📍 {s.direccion}</p>
                  )}
                  {s.contribuido_por && (
                    <p className="mt-2 font-mono text-[10px] uppercase tracking-wide text-faint">
                      Contribuido por {s.contribuido_por}
                    </p>
                  )}

                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    {wa && (
                      <a href={wa} target="_blank" rel="noopener noreferrer" aria-label="WhatsApp" title="WhatsApp" className="flex h-9 w-9 items-center justify-center bg-emerald-600 text-white hover:bg-emerald-700">
                        <IconWhatsApp />
                      </a>
                    )}
                    {ig && (
                      <a href={ig} target="_blank" rel="noopener noreferrer" aria-label="Instagram" title="Instagram" className="flex h-9 w-9 items-center justify-center bg-gradient-to-br from-fuchsia-600 to-pink-500 text-white hover:opacity-90">
                        <IconInstagram />
                      </a>
                    )}
                    {s.telefono && (
                      <a href={`tel:${s.telefono}`} aria-label="Llamar" title="Llamar" className="flex h-9 w-9 items-center justify-center border border-border text-foreground hover:bg-surface-2">
                        <IconPhone />
                      </a>
                    )}
                    {s.maps_url && (
                      <a href={s.maps_url} target="_blank" rel="noopener noreferrer" aria-label="Cómo llegar" title="Cómo llegar" className="flex h-9 w-9 items-center justify-center border border-border text-foreground hover:bg-surface-2">
                        <IconMap />
                      </a>
                    )}
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
