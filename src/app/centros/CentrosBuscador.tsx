"use client";

import { useMemo, useState } from "react";
import type { Centro } from "@/lib/types";
import { TIPOS_CENTRO, ZONAS } from "@/lib/types";
import { CentroCard } from "../components/CentroCard";

export function CentrosBuscador({ centros }: { centros: Centro[] }) {
  const [q, setQ] = useState("");
  const [tipo, setTipo] = useState<string>("");
  const [zona, setZona] = useState<string>("");
  const [soloVerificados, setSoloVerificados] = useState(false);

  const filtrados = useMemo(() => {
    const term = q.trim().toLowerCase();
    return centros.filter((c) => {
      if (tipo && c.tipo !== tipo) return false;
      if (zona && c.zona !== zona) return false;
      if (soloVerificados && c.confianza !== "Verificado") return false;
      if (!term) return true;
      const hay = `${c.nombre} ${c.direccion ?? ""} ${c.zona} ${c.necesidades ?? ""}`.toLowerCase();
      return hay.includes(term);
    });
  }, [centros, q, tipo, zona, soloVerificados]);

  return (
    <div className="md:grid md:grid-cols-[230px_1fr] md:gap-6">
      {/* Filtros (sidebar izquierda) */}
      <aside className="mb-5 md:mb-0 md:sticky md:top-20 md:self-start">
        <div className="space-y-5 border border-border bg-surface p-4">
          <div>
            <label className="mb-1.5 block font-mono text-[11px] uppercase tracking-widest text-faint">
              Buscar
            </label>
            <input
              type="search"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Nombre, zona, necesidad…"
              className="w-full border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-faint focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
            />
          </div>

          <div>
            <p className="mb-1.5 font-mono text-[11px] uppercase tracking-widest text-faint">
              Tipo
            </p>
            <div className="flex flex-col">
              <FiltroItem label="Todos" active={!tipo} onClick={() => setTipo("")} />
              {TIPOS_CENTRO.map((t) => (
                <FiltroItem
                  key={t}
                  label={t}
                  active={tipo === t}
                  onClick={() => setTipo(t)}
                />
              ))}
            </div>
          </div>

          <div>
            <p className="mb-1.5 font-mono text-[11px] uppercase tracking-widest text-faint">
              Ciudad
            </p>
            <div className="flex flex-col">
              <FiltroItem label="Todas" active={!zona} onClick={() => setZona("")} />
              {ZONAS.map((z) => (
                <FiltroItem
                  key={z}
                  label={z}
                  active={zona === z}
                  onClick={() => setZona(z)}
                />
              ))}
            </div>
          </div>

          <div>
            <p className="mb-1.5 font-mono text-[11px] uppercase tracking-widest text-faint">
              Verificación
            </p>
            <label className="flex cursor-pointer items-center gap-2 text-sm text-muted">
              <input
                type="checkbox"
                checked={soloVerificados}
                onChange={(e) => setSoloVerificados(e.target.checked)}
              />
              Solo verificados
            </label>
          </div>
        </div>
      </aside>

      {/* Resultados (derecha) */}
      <div>
        <p className="mb-4 font-mono text-[11px] uppercase tracking-wide text-faint">
          {filtrados.length} {filtrados.length === 1 ? "centro" : "centros"}
        </p>
        {filtrados.length === 0 ? (
          <p className="border border-dashed border-border bg-surface p-6 text-center text-faint">
            No se encontraron centros con esos filtros.
          </p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
            {filtrados.map((c) => (
              <CentroCard key={c.id} centro={c} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function FiltroItem({
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
      className={`border-l-2 px-3 py-1.5 text-left text-sm transition-colors ${
        active
          ? "border-emerald-500 bg-surface-2 font-semibold text-foreground"
          : "border-transparent text-muted hover:bg-surface-2"
      }`}
    >
      {label}
    </button>
  );
}
