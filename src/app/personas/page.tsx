import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Buscar personas (desaparecidos)",
  description:
    "Busca personas desaparecidas, a salvo o encontradas por cédula o nombre. Datos consolidados por Venezuela Reporta.",
  alternates: { canonical: "/personas" },
};

const API = "https://venezuelareporta.org/api/v1/personas";
const FUENTE = "https://venezuelareporta.org";

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

async function buscar(q: string, status: string) {
  const url = new URL(API);
  url.searchParams.set("q", q);
  if (status) url.searchParams.set("status", status);
  url.searchParams.set("limit", "40");
  const res = await fetch(url, { next: { revalidate: 30 } });
  if (!res.ok) throw new Error("bad status");
  const json = (await res.json()) as { personas?: Persona[]; total?: number };
  return { personas: json.personas ?? [], total: json.total ?? 0 };
}

export default async function PersonasPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string }>;
}) {
  const { q, status } = await searchParams;
  const termino = q?.trim() ?? "";
  const est = status ?? "";

  let personas: Persona[] = [];
  let total = 0;
  let error = false;
  if (termino) {
    try {
      const r = await buscar(termino, est);
      personas = r.personas;
      total = r.total;
    } catch {
      error = true;
    }
  }

  return (
    <div className="mx-auto max-w-3xl space-y-5 py-2">
      <div>
        <h1 className="text-2xl font-extrabold uppercase tracking-tight text-foreground sm:text-3xl">
          Buscar personas
        </h1>
        <p className="mt-1 text-sm text-muted">
          Busca por <strong className="text-foreground">cédula</strong> o nombre a
          personas desaparecidas, a salvo o encontradas. Datos de{" "}
          <a href={FUENTE} target="_blank" rel="noopener noreferrer" className="text-emerald-500 underline">
            Venezuela Reporta
          </a>
          .
        </p>
      </div>

      {/* Formulario de búsqueda */}
      <form method="get" className="flex flex-wrap gap-2 border border-border bg-surface p-4">
        <input
          name="q"
          defaultValue={termino}
          required
          placeholder="Cédula o nombre…"
          className="min-w-0 flex-1 border border-border bg-background px-3 py-2.5 text-sm text-foreground placeholder:text-faint focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
        />
        <select
          name="status"
          defaultValue={est}
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

      {/* Resultados */}
      {!termino ? (
        <p className="border border-dashed border-border bg-surface p-6 text-center text-faint">
          Escribe una cédula o un nombre para buscar.
        </p>
      ) : error ? (
        <p className="border border-rose-500/40 bg-rose-500/10 p-6 text-center text-rose-500">
          No se pudo consultar el servicio de Venezuela Reporta. Intenta de nuevo
          en un momento.
        </p>
      ) : personas.length === 0 ? (
        <p className="border border-dashed border-border bg-surface p-6 text-center text-faint">
          No se encontraron personas para “{termino}”.
        </p>
      ) : (
        <>
          <p className="font-mono text-[11px] uppercase tracking-wide text-faint">
            {total} resultado{total === 1 ? "" : "s"}
            {personas.length < total ? ` · mostrando ${personas.length}` : ""}
          </p>
          <ul className="grid gap-3">
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
                <li key={p.id} className="flex gap-3 border border-border bg-surface p-3">
                  {p.foto_url ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={p.foto_url}
                      alt={p.nombre ?? ""}
                      className="h-20 w-20 shrink-0 object-cover"
                    />
                  ) : (
                    <div className="flex h-20 w-20 shrink-0 items-center justify-center bg-surface-2 text-2xl opacity-50">
                      👤
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-bold text-foreground">
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
                    {detalle && (
                      <p className="mt-1 text-xs text-muted">{detalle}</p>
                    )}
                    {p.descripcion && (
                      <p className="mt-1 line-clamp-2 text-sm text-muted">
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
