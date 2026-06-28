import type { Metadata } from "next";
import Link from "next/link";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Edificaciones afectadas",
  description:
    "Reportes de edificaciones afectadas por el terremoto de Venezuela: nivel de daño, estado y ubicación. Datos de terremotovenezuela.com.",
  alternates: { canonical: "/edificaciones" },
};

const API = "https://jckifxsdlnsvbztxydes.supabase.co/rest/v1/buildings";
const KEY = "sb_publishable_i7iEDrCVZcSt0k3RGFrY4g_WrtZBB4w";
const FUENTE = "https://terremotovenezuela.com";
const SELECT =
  "id,name,address,city,zone,lat,lng,damage_level,status,main_photo_url,media_urls,last_updated_at,has_missing_persons";
const PER_PAGE = 24;

type Building = {
  id: string;
  name: string | null;
  address: string | null;
  city: string | null;
  zone: string | null;
  lat: number | null;
  lng: number | null;
  damage_level: string | null;
  status: string | null;
  main_photo_url: string | null;
  media_urls: string[] | null;
  last_updated_at: string | null;
  has_missing_persons: boolean | null;
};

const DANO: Record<string, { label: string; badge: string }> = {
  total: { label: "Daño total", badge: "bg-rose-600 text-white" },
  severo: { label: "Severo", badge: "bg-orange-500/20 text-orange-400 ring-1 ring-orange-500/40" },
  parcial: { label: "Parcial", badge: "bg-amber-500/15 text-amber-500 ring-1 ring-amber-500/40" },
};

const ESTADO: Record<string, { label: string; badge: string }> = {
  verificado: { label: "✅ Verificado", badge: "bg-emerald-500/15 text-emerald-400 ring-1 ring-emerald-400/40" },
  en_revision: { label: "⏳ En revisión", badge: "bg-slate-500/15 text-slate-300 ring-1 ring-slate-400/30" },
};

async function fetchBuildings(p: {
  q: string;
  city: string;
  damage: string;
  offset: number;
}) {
  const url = new URL(API);
  url.searchParams.set("select", SELECT);
  url.searchParams.set("order", "last_updated_at.desc");
  url.searchParams.set("limit", String(PER_PAGE));
  url.searchParams.set("offset", String(p.offset));
  if (p.city) url.searchParams.set("city", `ilike.*${p.city}*`);
  if (p.damage) url.searchParams.set("damage_level", `eq.${p.damage}`);
  if (p.q)
    url.searchParams.set(
      "or",
      `(name.ilike.*${p.q}*,address.ilike.*${p.q}*,zone.ilike.*${p.q}*)`,
    );
  const res = await fetch(url, {
    headers: { apikey: KEY, "Accept-Profile": "public", Prefer: "count=exact" },
    next: { revalidate: 30 },
  });
  if (!res.ok) throw new Error("bad status");
  const buildings = (await res.json()) as Building[];
  const cr = res.headers.get("content-range");
  const total = cr && cr.includes("/") ? Number(cr.split("/")[1]) : buildings.length;
  return { buildings, total: Number.isFinite(total) ? total : buildings.length };
}

// Las URLs de Supabase Storage son privadas (400); terremotovenezuela.com
// sirve las mismas imágenes por su proxy público. Reescribimos a ese proxy.
function mediaUrl(u: string | null): string | null {
  if (!u) return null;
  return u.replace(
    "https://jckifxsdlnsvbztxydes.supabase.co/storage/v1/object/public/damage-media/",
    "https://terremotovenezuela.com/api/public/media/",
  );
}

function fechaCorta(iso: string | null) {
  if (!iso) return null;
  try {
    return new Date(iso).toLocaleDateString("es-VE", { day: "numeric", month: "short" });
  } catch {
    return null;
  }
}

export default async function EdificacionesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; city?: string; damage?: string; page?: string }>;
}) {
  const sp = await searchParams;
  const q = sp.q?.trim() ?? "";
  const city = sp.city?.trim() ?? "";
  const damage = sp.damage ?? "";
  const page = Math.max(1, Number(sp.page) || 1);
  const offset = (page - 1) * PER_PAGE;

  let buildings: Building[] = [];
  let total = 0;
  let error = false;
  try {
    const r = await fetchBuildings({ q, city, damage, offset });
    buildings = r.buildings;
    total = r.total;
  } catch {
    error = true;
  }
  const totalPages = Math.max(1, Math.ceil(total / PER_PAGE));

  const hrefPagina = (pg: number) => {
    const usp = new URLSearchParams();
    if (q) usp.set("q", q);
    if (city) usp.set("city", city);
    if (damage) usp.set("damage", damage);
    if (pg > 1) usp.set("page", String(pg));
    const s = usp.toString();
    return s ? `/edificaciones?${s}` : "/edificaciones";
  };

  return (
    <div className="mx-auto max-w-3xl space-y-5 py-2">
      <div>
        <h1 className="text-2xl font-extrabold uppercase tracking-tight text-foreground sm:text-3xl">
          Edificaciones afectadas
        </h1>
        <p className="mt-1 text-sm text-muted">
          Reportes de daños en edificaciones por el terremoto. Datos de{" "}
          <a href={FUENTE} target="_blank" rel="noopener noreferrer" className="text-emerald-500 underline">
            terremotovenezuela.com
          </a>
          .
        </p>
      </div>

      <form method="get" className="grid gap-2 border border-border bg-surface p-4 sm:grid-cols-[1fr_auto_auto_auto]">
        <input
          name="q"
          defaultValue={q}
          placeholder="Nombre, dirección o zona…"
          className="min-w-0 border border-border bg-background px-3 py-2.5 text-sm text-foreground placeholder:text-faint focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
        />
        <input
          name="city"
          defaultValue={city}
          placeholder="Ciudad"
          className="border border-border bg-background px-3 py-2.5 text-sm text-foreground placeholder:text-faint focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
        />
        <select
          name="damage"
          defaultValue={damage}
          className="border border-border bg-background px-3 py-2.5 text-sm text-foreground focus:border-emerald-500 focus:outline-none"
        >
          <option value="">Cualquier daño</option>
          <option value="parcial">Parcial</option>
          <option value="severo">Severo</option>
          <option value="total">Daño total</option>
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
          No se pudo consultar el servicio de terremotovenezuela.com. Intenta de
          nuevo en un momento.
        </p>
      ) : buildings.length === 0 ? (
        <p className="border border-dashed border-border bg-surface p-6 text-center text-faint">
          No se encontraron edificaciones con esos filtros.
        </p>
      ) : (
        <>
          <p className="font-mono text-[11px] uppercase tracking-wide text-faint">
            {total.toLocaleString("es-VE")} reporte{total === 1 ? "" : "s"} ·
            página {page} de {totalPages.toLocaleString("es-VE")}
          </p>

          <ul className="grid gap-3">
            {buildings.map((b) => {
              const d = b.damage_level ? DANO[b.damage_level] : null;
              const e = b.status ? ESTADO[b.status] : null;
              const maps = b.lat != null && b.lng != null
                ? `https://www.google.com/maps?q=${b.lat},${b.lng}`
                : b.address?.startsWith("http")
                  ? b.address
                  : null;
              const fecha = fechaCorta(b.last_updated_at);
              const foto = mediaUrl(b.main_photo_url);
              return (
                <li key={b.id} className="flex gap-3 overflow-hidden border border-border bg-surface p-3">
                  {foto ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={foto}
                      alt={b.name ?? ""}
                      className="h-24 w-24 shrink-0 object-cover"
                    />
                  ) : (
                    <div className="flex h-24 w-24 shrink-0 items-center justify-center bg-surface-2 text-2xl opacity-50">
                      🏚️
                    </div>
                  )}
                  <div className="min-w-0 flex-1 overflow-hidden">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <h3 className="min-w-0 break-words font-bold text-foreground [overflow-wrap:anywhere]">
                        {b.name ?? "Sin nombre"}
                      </h3>
                      {d && (
                        <span className={`px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${d.badge}`}>
                          {d.label}
                        </span>
                      )}
                      {e && (
                        <span className={`px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${e.badge}`}>
                          {e.label}
                        </span>
                      )}
                      {b.has_missing_persons && (
                        <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ring-1 bg-rose-500/15 text-rose-500 ring-rose-500/40">
                          ⚠️ Personas desaparecidas
                        </span>
                      )}
                    </div>
                    {(b.city || b.zone) && (
                      <p className="mt-1 text-xs text-faint">
                        📍 {[b.city, b.zone].filter(Boolean).join(" · ")}
                      </p>
                    )}
                    {b.address && !b.address.startsWith("http") && (
                      <p className="mt-1 break-words text-sm text-muted [overflow-wrap:anywhere]">
                        {b.address}
                      </p>
                    )}
                    <div className="mt-2 flex flex-wrap items-center gap-3 font-mono text-[11px] uppercase tracking-wide">
                      {maps && (
                        <a href={maps} target="_blank" rel="noopener noreferrer" className="text-emerald-500 underline">
                          Cómo llegar →
                        </a>
                      )}
                      {fecha && <span className="text-faint">Actualizado {fecha}</span>}
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>

          {totalPages > 1 && (
            <div className="flex items-center justify-between gap-3 border-t border-border pt-4 font-mono text-xs uppercase tracking-wide">
              {page > 1 ? (
                <Link href={hrefPagina(page - 1)} className="border border-border bg-surface px-4 py-2 text-foreground hover:bg-surface-2">
                  ← Anterior
                </Link>
              ) : (
                <span className="px-4 py-2 text-faint/50">← Anterior</span>
              )}
              <span className="text-faint">
                {page} / {totalPages.toLocaleString("es-VE")}
              </span>
              {page < totalPages ? (
                <Link href={hrefPagina(page + 1)} className="border border-border bg-surface px-4 py-2 text-foreground hover:bg-surface-2">
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
        Reportes de daños proporcionados por{" "}
        <a href={FUENTE} target="_blank" rel="noopener noreferrer" className="underline hover:text-muted">
          terremotovenezuela.com
        </a>
        . Para reportar un edificio, visita su sitio.
      </p>
    </div>
  );
}
