"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { Centro } from "@/lib/types";
import { ZONAS } from "@/lib/types";
import { CentroCard } from "./CentroCard";

export function HomeCentros({ centros }: { centros: Centro[] }) {
  const [q, setQ] = useState("");

  const filtrados = useMemo(() => {
    const t = q.trim().toLowerCase();
    if (!t) return centros;
    return centros.filter((c) =>
      [c.nombre, c.zona, c.direccion, c.necesidades, c.tipo]
        .filter(Boolean)
        .some((v) => (v as string).toLowerCase().includes(t)),
    );
  }, [q, centros]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-mono text-xs uppercase tracking-widest text-faint">
          Centros de acopio
        </h2>
        <div className="relative w-full sm:w-72">
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-faint">
            🔎
          </span>
          <input
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Buscar centro…"
            className="block w-full border border-border bg-surface py-2 pl-9 pr-3 text-sm text-foreground placeholder:text-faint focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
          />
        </div>
      </div>

      {filtrados.length === 0 ? (
        <p className="border border-dashed border-border bg-surface p-6 text-center text-faint">
          {q.trim()
            ? `No encontramos centros para “${q.trim()}”.`
            : "Todavía no hay centros publicados. Vuelve pronto."}
        </p>
      ) : (
        ZONAS.map((zona) => {
          const delZona = filtrados.filter((c) => c.zona === zona);
          if (delZona.length === 0) return null;
          return (
            <div key={zona}>
              <h3 className="mb-3 text-xl font-bold uppercase tracking-tight text-foreground">
                {zona}
              </h3>
              <div className="grid gap-4 sm:grid-cols-2">
                {delZona.map((c) => (
                  <CentroCard key={c.id} centro={c} />
                ))}
              </div>
            </div>
          );
        })
      )}

      <p className="text-center font-mono text-[11px] uppercase tracking-wide text-faint">
        <Link href="/centros" className="underline hover:text-muted">
          Ver todos los centros con filtros →
        </Link>
      </p>
    </div>
  );
}
