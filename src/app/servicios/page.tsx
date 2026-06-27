import type { Metadata } from "next";
import Link from "next/link";
import { getServicios } from "@/lib/data";
import { CATEGORIAS_SERVICIO } from "@/lib/types";
import { servicioMeta } from "@/lib/labels";
import { ServiciosResultados } from "./ServiciosResultados";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Servicios gratuitos",
  description:
    "Directorio de farmacias, servicios médicos, transporte, agua y más durante el terremoto de Venezuela 2026.",
};

export default async function ServiciosPage({
  searchParams,
}: {
  searchParams: Promise<{ cat?: string }>;
}) {
  const { cat } = await searchParams;
  const servicios = await getServicios();
  const filtrados = cat ? servicios.filter((s) => s.categoria === cat) : servicios;

  const counts = new Map<string, number>();
  for (const s of servicios) counts.set(s.categoria, (counts.get(s.categoria) ?? 0) + 1);

  return (
    <div className="mx-[calc(50%-50vw)] w-screen space-y-5 px-4 sm:px-6 lg:px-8">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold uppercase tracking-tight text-foreground sm:text-3xl">
            Directorio de servicios
          </h1>
          <p className="mt-1 text-sm text-muted">
            Farmacias, servicios médicos, transporte y más.
          </p>
        </div>
        <Link
          href="/servicios/proponer"
          className="shrink-0 bg-emerald-500 px-4 py-2.5 font-mono text-xs font-bold uppercase tracking-wide text-black hover:bg-emerald-400"
        >
          + Proponer un servicio
        </Link>
      </div>

      <div className="md:grid md:grid-cols-[230px_1fr] md:gap-6">
        {/* Sidebar de categorías */}
        <aside className="mb-4 md:mb-0 md:sticky md:top-20 md:self-start">
          <div className="border border-border">
            <div className="border-b border-border px-3 py-2 font-mono text-[11px] uppercase tracking-widest text-faint">
              Categorías
            </div>
            <nav className="flex flex-wrap md:flex-col">
              <FiltroItem
                label="Todos"
                emoji="📋"
                href="/servicios"
                count={servicios.length}
                active={!cat}
              />
              {CATEGORIAS_SERVICIO.map((c) => (
                <FiltroItem
                  key={c}
                  label={c}
                  emoji={servicioMeta(c).emoji}
                  href={`/servicios?cat=${encodeURIComponent(c)}`}
                  count={counts.get(c) ?? 0}
                  active={cat === c}
                />
              ))}
            </nav>
          </div>
        </aside>

        {/* Listado con buscador */}
        <ServiciosResultados servicios={filtrados} cat={cat} />
      </div>
    </div>
  );
}

function FiltroItem({
  label,
  emoji,
  href,
  count,
  active,
}: {
  label: string;
  emoji: string;
  href: string;
  count: number;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      className={`flex items-center justify-between gap-2 border-l-2 px-3 py-2 text-sm transition-colors ${
        active
          ? "border-emerald-500 bg-surface-2 font-semibold text-foreground"
          : "border-transparent text-muted hover:bg-surface-2"
      }`}
    >
      <span>
        {emoji} {label}
      </span>
      <span className="font-mono text-xs text-faint">{count}</span>
    </Link>
  );
}
