"use client";

import { useMemo, useState } from "react";
import type { Centro } from "@/lib/types";
import { NIVELES_CONFIANZA, TIPOS_CENTRO, ZONAS } from "@/lib/types";
import { CentroCard } from "../components/CentroCard";

const selectCls =
  "border border-border bg-surface px-3 py-2 text-sm text-foreground focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/30";

export function CentrosBuscador({ centros }: { centros: Centro[] }) {
  const [q, setQ] = useState("");
  const [tipo, setTipo] = useState<string>("");
  const [zona, setZona] = useState<string>("");
  const [conf, setConf] = useState<string>("");

  const filtrados = useMemo(() => {
    const term = q.trim().toLowerCase();
    return centros.filter((c) => {
      if (tipo && c.tipo !== tipo) return false;
      if (zona && c.zona !== zona) return false;
      if (conf && c.confianza !== conf) return false;
      if (!term) return true;
      const hay = `${c.nombre} ${c.direccion ?? ""} ${c.zona} ${c.necesidades ?? ""}`.toLowerCase();
      return hay.includes(term);
    });
  }, [centros, q, tipo, zona, conf]);

  return (
    <div className="space-y-4">
      {/* Barra de búsqueda y filtros (arriba) */}
      <div className="space-y-3 border border-border bg-surface p-4">
        <div className="relative">
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-faint">
            🔎
          </span>
          <input
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Buscar por nombre, zona o necesidad…"
            className="w-full border border-border bg-background py-2.5 pl-9 pr-3 text-sm text-foreground placeholder:text-faint focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <select
            value={tipo}
            onChange={(e) => setTipo(e.target.value)}
            className={selectCls}
            aria-label="Tipo"
          >
            <option value="">Todos los tipos</option>
            {TIPOS_CENTRO.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>

          <select
            value={zona}
            onChange={(e) => setZona(e.target.value)}
            className={selectCls}
            aria-label="Ciudad"
          >
            <option value="">Todas las ciudades</option>
            {ZONAS.map((z) => (
              <option key={z} value={z}>
                {z}
              </option>
            ))}
          </select>

          {/* Filtro por verificación */}
          <div className="flex flex-wrap gap-1.5">
            <Chip label="Todas" active={!conf} onClick={() => setConf("")} />
            {NIVELES_CONFIANZA.map((n) => (
              <Chip
                key={n}
                label={n}
                active={conf === n}
                onClick={() => setConf(n)}
              />
            ))}
          </div>

          {(tipo || zona || conf || q) && (
            <button
              onClick={() => {
                setQ("");
                setTipo("");
                setZona("");
                setConf("");
              }}
              className="ml-auto font-mono text-[11px] uppercase tracking-wide text-faint underline hover:text-muted"
            >
              Limpiar
            </button>
          )}
        </div>
      </div>

      {/* Resultados */}
      <p className="font-mono text-[11px] uppercase tracking-wide text-faint">
        {filtrados.length} {filtrados.length === 1 ? "centro" : "centros"}
      </p>
      {filtrados.length === 0 ? (
        <p className="border border-dashed border-border bg-surface p-6 text-center text-faint">
          No se encontraron centros con esos filtros.
        </p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
          {filtrados.map((c) => (
            <CentroCard key={c.id} centro={c} />
          ))}
        </div>
      )}
    </div>
  );
}

function Chip({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-2 font-mono text-xs uppercase tracking-wide transition-colors ${
        active
          ? "bg-emerald-500 text-black"
          : "bg-background text-muted ring-1 ring-border hover:bg-surface-2"
      }`}
    >
      {label}
    </button>
  );
}
