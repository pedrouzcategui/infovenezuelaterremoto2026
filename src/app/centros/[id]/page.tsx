import Link from "next/link";
import { notFound } from "next/navigation";
import { getCentro, getComentarios } from "@/lib/data";
import { formatFecha, instagramLink, whatsappLink } from "@/lib/format";
import { ComentariosForm } from "./ComentariosForm";
import { CentroBadges } from "@/app/components/CentroBadges";
import { CentroQR } from "@/app/components/CentroQR";
import { reportarComentario } from "../actions";

export const dynamic = "force-dynamic";

export default async function CentroDetallePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const centro = await getCentro(id);
  if (!centro) notFound();

  const comentarios = await getComentarios(id);
  const wa = whatsappLink(centro.whatsapp);
  const ig = instagramLink(centro.instagram);
  const necesidades = (centro.necesidades ?? "")
    .split(/[,\n]/)
    .map((s) => s.trim())
    .filter(Boolean);

  return (
    <div className="space-y-6">
      <Link href="/centros" className="text-sm text-faint hover:text-muted">
        ← Volver a centros
      </Link>

      {/* Imagen de portada */}
      <div className="aspect-[16/9] w-full overflow-hidden border border-border bg-surface-2 sm:aspect-[21/8]">
        {centro.foto_url ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={centro.foto_url}
            alt={centro.nombre}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-surface-2 to-surface text-6xl opacity-30">
            🤝
          </div>
        )}
      </div>

      {centro.confianza === "Verificado" && (
        <div className="flex items-center gap-3 border border-emerald-500/40 bg-emerald-500/10 p-4">
          <span className="text-2xl">✅</span>
          <div>
            <p className="font-mono text-xs font-bold uppercase tracking-widest text-emerald-400">
              Centro verificado
            </p>
            <p className="text-sm text-muted">
              Este centro de acopio fue verificado por Info Venezuela Terremoto. Puedes
              contribuir con confianza.
            </p>
          </div>
        </div>
      )}

      {/* Info + QR */}
      <div className="grid items-start gap-6 md:grid-cols-[1fr_240px]">
        <div className="flex flex-col gap-4 border border-border bg-surface p-5">
          <div className="space-y-2">
            <h1 className="text-2xl font-extrabold uppercase tracking-tight text-foreground">
              {centro.nombre}
            </h1>
            <CentroBadges tipo={centro.tipo} confianza={centro.confianza} patrocinado={centro.patrocinado} />
            {centro.patrocinado && (centro.patrocinador_logo || centro.patrocinador_nombre) && (
              <div className="flex items-center gap-2 text-sm text-muted">
                <span className="font-mono text-[11px] uppercase tracking-wide text-faint">
                  Patrocinado por
                </span>
                {centro.patrocinador_logo && (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={centro.patrocinador_logo}
                    alt={centro.patrocinador_nombre ?? "Patrocinador"}
                    className="h-7 bg-white object-contain px-1"
                  />
                )}
                {centro.patrocinador_nombre && (
                  <span className="font-semibold text-foreground">
                    {centro.patrocinador_nombre}
                  </span>
                )}
              </div>
            )}
            <p className="text-sm text-muted">
              {centro.zona}
              {centro.direccion ? ` · 📍 ${centro.direccion}` : ""}
            </p>
            {centro.contribuido_por && (
              <p className="mt-1 font-mono text-[11px] uppercase tracking-wide text-faint">
                Contribuido por {centro.contribuido_por}
              </p>
            )}
          </div>

          {(necesidades.length > 0 || centro.necesidades_detalle) && (
            <div>
              <p className="font-mono text-[11px] uppercase tracking-widest text-faint">
                Necesitamos
              </p>
              {centro.necesidades_detalle && (
                <p className="mt-2 whitespace-pre-line text-sm text-foreground">
                  {centro.necesidades_detalle}
                </p>
              )}
              {necesidades.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {necesidades.map((n) => (
                    <span
                      key={n}
                      className="bg-amber-500/15 px-2.5 py-1 text-xs font-medium text-amber-600 ring-1 ring-amber-500/30"
                    >
                      {n}
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}

          <div className="flex flex-wrap items-stretch gap-2 text-sm">
            {centro.maps_url && (
              <a
                href={centro.maps_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-1 items-center justify-center gap-2 bg-emerald-600 px-4 py-2.5 font-semibold text-white hover:bg-emerald-700"
              >
                📍 Cómo llegar
              </a>
            )}
            {wa && (
              <a
                href={wa}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-1 items-center justify-center gap-2 border border-border px-4 py-2.5 font-medium text-foreground hover:bg-surface-2"
              >
                💬 WhatsApp
              </a>
            )}
            {centro.telefono && (
              <a
                href={`tel:${centro.telefono}`}
                className="flex flex-1 items-center justify-center gap-2 border border-border px-4 py-2.5 font-medium text-foreground hover:bg-surface-2"
              >
                📞 Llamar
              </a>
            )}
            {ig && (
              <a
                href={ig}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                title="Instagram"
                className="flex items-center justify-center bg-gradient-to-br from-fuchsia-600 to-pink-500 px-4 py-2.5 text-white hover:opacity-90"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                </svg>
              </a>
            )}
          </div>
        </div>

        {/* QR de verificación */}
        <aside className="border border-border bg-surface p-4">
          <CentroQR id={centro.id} nombre={centro.nombre} compact />
        </aside>
      </div>

      {/* Comentarios */}
      <section className="space-y-4">
        <h2 className="text-lg font-bold text-foreground">
          Comentarios{" "}
          <span className="text-sm font-normal text-faint">
            ({comentarios.length})
          </span>
        </h2>
        <p className="-mt-2 text-sm text-muted">
          Cuéntale a la comunidad qué necesita este centro. Los comentarios se
          revisan antes de publicarse.
        </p>

        <ComentariosForm centroId={centro.id} />

        {comentarios.length === 0 ? (
          <p className="text-sm text-faint">
            Aún no hay comentarios. Sé el primero.
          </p>
        ) : (
          <ul className="space-y-3">
            {comentarios.map((c) => (
              <li key={c.id} className="rounded-none border border-border bg-surface p-4">
                <div className="flex items-baseline justify-between gap-3">
                  <span className="font-medium text-foreground">{c.autor}</span>
                  <span className="text-xs text-faint">
                    {formatFecha(c.created_at)}
                  </span>
                </div>
                <p className="mt-1 whitespace-pre-line text-sm text-muted">
                  {c.contenido}
                </p>
                <form action={reportarComentario} className="mt-2">
                  <input type="hidden" name="id" value={c.id} />
                  <input type="hidden" name="centro_id" value={centro.id} />
                  <button
                    type="submit"
                    className="text-xs text-rose-500 hover:text-rose-700 hover:underline"
                  >
                    ⚠ Reportar
                  </button>
                </form>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

