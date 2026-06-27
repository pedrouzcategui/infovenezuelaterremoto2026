"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { Anuncio } from "@/lib/types";
import { ANUNCIO_META } from "@/lib/labels";
import { formatFecha } from "@/lib/format";

export function AnunciosResultados({
  anuncios,
  cat,
}: {
  anuncios: Anuncio[];
  cat?: string;
}) {
  const [q, setQ] = useState("");

  const filtrados = useMemo(() => {
    const t = q.trim().toLowerCase();
    if (!t) return anuncios;
    return anuncios.filter((a) =>
      [a.titulo, a.contenido, a.fuente]
        .filter(Boolean)
        .some((v) => (v as string).toLowerCase().includes(t)),
    );
  }, [q, anuncios]);

  return (
    <div className="space-y-4">
      {/* Buscador */}
      <div className="relative">
        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-faint">
          🔎
        </span>
        <input
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Buscar anuncios…"
          className="block w-full border border-border bg-surface py-2.5 pl-9 pr-3 text-sm text-foreground placeholder:text-faint focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
        />
      </div>

      {filtrados.length === 0 ? (
        <p className="rounded-none border border-dashed border-border bg-surface p-6 text-center text-faint">
          {q.trim()
            ? `No encontramos anuncios para “${q.trim()}”.`
            : `No hay anuncios${cat ? " en esta categoría" : ""} por ahora.`}
        </p>
      ) : (
        <ul className="grid gap-4">
          {filtrados.map((a) => {
            const meta = ANUNCIO_META[a.categoria];
            return (
              <li key={a.id}>
                <Link
                  href={`/anuncios/${a.id}`}
                  className={`block overflow-hidden transition-colors hover:brightness-110 ${meta.card}`}
                >
                  {a.imagen_url && (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={a.imagen_url}
                      alt=""
                      className="aspect-[16/7] w-full object-cover"
                    />
                  )}
                  <div className="p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex min-w-0 items-start gap-3">
                        {a.logo_url && (
                          /* eslint-disable-next-line @next/next/no-img-element */
                          <img
                            src={a.logo_url}
                            alt=""
                            className="h-10 w-10 shrink-0 bg-white object-contain p-0.5"
                          />
                        )}
                        <h3 className="font-bold uppercase tracking-tight text-foreground">
                          {a.fijado && "📌 "}
                          {a.titulo}
                        </h3>
                      </div>
                      <span
                        className={`shrink-0 px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wide ring-1 ${meta.badge}`}
                      >
                        {meta.emoji} {meta.label}
                      </span>
                    </div>
                    <p className="mt-2 line-clamp-3 whitespace-pre-line text-sm text-muted">
                      {a.contenido}
                    </p>
                    <div className="mt-3 flex items-center justify-between font-mono text-[11px] uppercase tracking-wide text-faint">
                      <span>{formatFecha(a.created_at)}</span>
                      <span className="text-emerald-500">Leer más →</span>
                    </div>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
