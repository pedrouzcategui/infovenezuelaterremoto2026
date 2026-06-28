import type { Metadata } from "next";
import Link from "next/link";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Buscar personas (desaparecidos)",
  description:
    "Lista y búsqueda de personas desaparecidas, a salvo o encontradas por cédula, nombre o ciudad. Datos consolidados por Venezuela Reporta.",
  alternates: { canonical: "/personas" },
};

const API = "https://venezuelareporta.org/api/v1/personas";
const FUENTE = "https://venezuelareporta.org";
const PER_PAGE = 24;

type Persona = {
  id: string;
  status: string;
  nombre: string | null;
  cedula: string | null;
  genero: string | null;
  edad: number | null;
  ciudad: string | null;
  zona: string | null;
  descripcion: string | null;
  foto_url: string | null;
  verificado: boolean;
  ficha_url: string | null;
};

const ESTADO: Record<string, { label: string; badge: string }> = {
  buscando: { label: "Buscando", badge: "bg-amber-500/15 text-amber-600 ring-amber-500/30" },
  a_salvo: { label: "A salvo", badge: "bg-emerald-500/15 text-emerald-400 ring-emerald-400/40" },
  encontrado: { label: "Encontrado", badge: "bg-sky-500/15 text-sky-400 ring-sky-400/40" },
};

async function buscar(params: {
  q: string;
  status: string;
  ciudad: string;
  offset: number;
}) {
  const url = new URL(API);
  if (params.q) url.searchParams.set("q", params.q);
  if (params.status) url.searchParams.set("status", params.status);
  if (params.ciudad) url.searchParams.set("ciudad", params.ciudad);
  url.searchParams.set("limit", String(PER_PAGE));
  url.searchParams.set("offset", String(params.offset));
  const res = await fetch(url, { next: { revalidate: 30 } });
  if (!res.ok) throw new Error("bad status");
  const json = (await res.json()) as { personas?: Persona[]; total?: number };
  return { personas: json.personas ?? [], total: json.total ?? 0 };
}

export default async function PersonasPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string; ciudad?: string; page?: string }>;
}) {
  const sp = await searchParams;
  const q = sp.q?.trim() ?? "";
  const status = sp.status ?? "";
  const ciudad = sp.ciudad?.trim() ?? "";
  const page = Math.max(1, Number(sp.page) || 1);
  const offset = (page - 1) * PER_PAGE;

  let personas: Persona[] = [];
  let total = 0;
  let error = false;
  try {
    const r = await buscar({ q, status, ciudad, offset });
    personas = r.personas;
    total = r.total;
  } catch {
    error = true;
  }

  const totalPages = Math.max(1, Math.ceil(total / PER_PAGE));

  // Construye un enlace conservando los filtros, cambiando la página.
  const hrefPagina = (p: number) => {
    const usp = new URLSearchParams();
    if (q) usp.set("q", q);
    if (status) usp.set("status", status);
    if (ciudad) usp.set("ciudad", ciudad);
    if (p > 1) usp.set("page", String(p));
    const s = usp.toString();
    return s ? `/personas?${s}` : "/personas";
  };

  return (
    <div className="mx-auto max-w-5xl space-y-5 py-2">
      <div>
        <h1 className="text-2xl font-extrabold uppercase tracking-tight text-foreground sm:text-3xl">
          Buscar personas
        </h1>
        <p className="mt-1 text-sm text-muted">
          Personas desaparecidas, a salvo o encontradas. Busca por{" "}
          <strong className="text-foreground">cédula</strong>, nombre o ciudad.
          Datos de{" "}
          <a href={FUENTE} target="_blank" rel="noopener noreferrer" className="text-emerald-500 underline">
            Venezuela Reporta
          </a>
          .
        </p>
      </div>

      {/* Filtros (GET) */}
      <form method="get" className="grid gap-2 border border-border bg-surface p-4 sm:grid-cols-[1fr_auto_auto_auto]">
        <input
          name="q"
          defaultValue={q}
          placeholder="Cédula o nombre…"
          className="min-w-0 border border-border bg-background px-3 py-2.5 text-sm text-foreground placeholder:text-faint focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
        />
        <input
          name="ciudad"
          defaultValue={ciudad}
          placeholder="Ciudad"
          className="border border-border bg-background px-3 py-2.5 text-sm text-foreground placeholder:text-faint focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
        />
        <select
          name="status"
          defaultValue={status}
          className="border border-border bg-background px-3 py-2.5 text-sm text-foreground focus:border-emerald-500 focus:outline-none"
        >
          <option value="">Cualquier estado</option>
          <option value="buscando">Buscando</option>
          <option value="a_salvo">A salvo</option>
          <option value="encontrado">Encontrado</option>
        </select>
        <button
          type="submit"
          className="bg-emerald-500 px-5 py-2.5 font-mono text-xs font-bold uppercase tracking-wide text-black hover:bg-emerald-400"
        >
          Buscar
        </button>
      </form>

      {error ? (
        <p className="border border-rose-500/40 bg-rose-500/10 p-6 text-center text-rose-500">
          No se pudo consultar el servicio de Venezuela Reporta. Intenta de nuevo
          en un momento.
        </p>
      ) : personas.length === 0 ? (
        <p className="border border-dashed border-border bg-surface p-6 text-center text-faint">
          {q || ciudad || status
            ? "No se encontraron personas con esos filtros."
            : "No hay personas registradas por ahora."}
        </p>
      ) : (
        <>
          <p className="font-mono text-[11px] uppercase tracking-wide text-faint">
            {total.toLocaleString("es-VE")} resultado{total === 1 ? "" : "s"} ·
            página {page} de {totalPages.toLocaleString("es-VE")}
          </p>

          <ul className="grid gap-3 sm:grid-cols-2">
            {personas.map((p) => {
              const e = ESTADO[p.status] ?? {
                label: p.status,
                badge: "bg-slate-500/15 text-slate-300 ring-slate-400/30",
              };
              const detalle = [
                p.cedula ? `C.I. ${p.cedula}` : null,
                [p.ciudad, p.zona].filter(Boolean).join(", ") || null,
                p.edad ? `${p.edad} años` : null,
                p.genero,
              ]
                .filter(Boolean)
                .join(" · ");
              return (
                <li key={p.id} className="flex gap-3 border border-border bg-surface p-3 transition-colors hover:border-emerald-500/40">
                  {p.foto_url ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={p.foto_url}
                      alt={p.nombre ?? ""}
                      className="h-24 w-24 shrink-0 self-start object-cover"
                    />
                  ) : (
                    <div className="flex h-24 w-24 shrink-0 items-center justify-center self-start bg-surface-2 text-2xl opacity-50">
                      👤
                    </div>
                  )}
                  <div className="min-w-0 flex-1 overflow-hidden">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="min-w-0 break-words font-bold text-foreground [overflow-wrap:anywhere]">
                        {p.nombre ?? "Sin nombre"}
                      </h3>
                      <span className={`px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ring-1 ${e.badge}`}>
                        {e.label}
                      </span>
                      {p.verificado && (
                        <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-emerald-400 ring-1 ring-emerald-400/40">
                          ✅ Verificado
                        </span>
                      )}
                    </div>
                    {detalle && <p className="mt-1 text-xs text-muted">{detalle}</p>}
                    {p.descripcion && (
                      <p className="mt-1 line-clamp-2 break-words text-sm text-muted [overflow-wrap:anywhere]">
                        {p.descripcion}
                      </p>
                    )}
                    {p.ficha_url && (
                      <a
                        href={p.ficha_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-2 inline-block font-mono text-[11px] uppercase tracking-wide text-emerald-500 underline"
                      >
                        Ver ficha completa →
                      </a>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>

          {/* Paginación */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between gap-3 border-t border-border pt-4 font-mono text-xs uppercase tracking-wide">
              {page > 1 ? (
                <Link
                  href={hrefPagina(page - 1)}
                  className="border border-border bg-surface px-4 py-2 text-foreground hover:bg-surface-2"
                >
                  ← Anterior
                </Link>
              ) : (
                <span className="px-4 py-2 text-faint/50">← Anterior</span>
              )}
              <span className="text-faint">
                {page} / {totalPages.toLocaleString("es-VE")}
              </span>
              {page < totalPages ? (
                <Link
                  href={hrefPagina(page + 1)}
                  className="border border-border bg-surface px-4 py-2 text-foreground hover:bg-surface-2"
                >
                  Siguiente →
                </Link>
              ) : (
                <span className="px-4 py-2 text-faint/50">Siguiente →</span>
              )}
            </div>
          )}
        </>
      )}

      <p className="border-t border-border pt-4 text-center font-mono text-[11px] uppercase tracking-wide text-faint">
        Registro de personas proporcionado por{" "}
        <a href={FUENTE} target="_blank" rel="noopener noreferrer" className="underline hover:text-muted">
          Venezuela Reporta
        </a>
        . Para reportar o actualizar un caso, visita su sitio.
      </p>
    </div>
  );
}
