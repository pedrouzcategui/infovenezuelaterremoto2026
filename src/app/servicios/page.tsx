import type { Metadata } from "next";
import Link from "next/link";
import { getServicios } from "@/lib/data";
import { CATEGORIAS_SERVICIO } from "@/lib/types";
import { servicioMeta } from "@/lib/labels";
import { instagramLink, whatsappLink } from "@/lib/format";
import { ServicioReporte } from "./ServicioVotes";
import { IconInstagram, IconMap, IconPhone, IconWhatsApp } from "../components/icons";

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
      <div>
        <h1 className="text-2xl font-extrabold uppercase tracking-tight text-foreground sm:text-3xl">
          Directorio de servicios
        </h1>
        <p className="mt-1 text-sm text-muted">
          Farmacias, servicios médicos, transporte y más. Reporta si ves algo
          indebido.
        </p>
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

        {/* Listado */}
        <div>
          {filtrados.length === 0 ? (
            <p className="border border-dashed border-border bg-surface p-6 text-center text-faint">
              No hay servicios{cat ? " en esta categoría" : ""} todavía.
            </p>
          ) : (
            <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
              {filtrados.map((s) => {
                const wa = whatsappLink(s.whatsapp);
                const ig = instagramLink(s.instagram);
                const meta = servicioMeta(s.categoria);
                return (
                  <li key={s.id} className="overflow-hidden border border-border bg-surface">
                    {s.foto_url && (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img
                        src={s.foto_url}
                        alt={s.nombre}
                        className="aspect-[16/9] w-full object-cover"
                      />
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
                        {s.reportes >= 3 && (
                          <span className="bg-rose-50 px-2 py-0.5 text-xs text-rose-700 ring-1 ring-rose-200">
                            ⚠ reportes
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

                    <div className="mt-3 flex justify-end border-t border-border pt-3">
                      <ServicioReporte id={s.id} />
                    </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
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
