import Link from "next/link";
import type { ReactNode } from "react";
import type { Centro } from "@/lib/types";
import { formatHorario, instagramLink, whatsappLink } from "@/lib/format";
import { centroTipoMeta, confianzaMeta } from "@/lib/labels";

function IconInstagram() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </svg>
  );
}
function IconMap() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  );
}
function IconPhone() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z" />
    </svg>
  );
}

export function CentroCard({ centro }: { centro: Centro }) {
  const wa = whatsappLink(centro.whatsapp);
  const ig = instagramLink(centro.instagram);
  const necesidades = (centro.necesidades ?? "")
    .split(/[,\n]/)
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 3);

  const badgeCls = "px-2 py-1 text-[10px] font-bold uppercase tracking-wide";
  const badges: ReactNode[] = [];
  if (centro.fijado)
    badges.push(
      <span key="fijado" className={`${badgeCls} bg-foreground text-background ring-1 ring-white/40`}>
        📌 Fijado
      </span>,
    );
  if (centro.patrocinado)
    badges.push(
      <span key="patro" className={`${badgeCls} bg-gradient-to-r from-amber-300 to-yellow-500 text-black shadow-[0_0_12px_rgba(251,191,36,0.6)]`}>
        ⭐ Patrocinado
      </span>,
    );
  if (centro.confianza)
    badges.push(
      <span key="conf" className={`${badgeCls} ring-1 ${confianzaMeta(centro.confianza).badge}`}>
        {confianzaMeta(centro.confianza).emoji} {centro.confianza}
      </span>,
    );
  if (centro.tipo)
    badges.push(
      <span key="tipo" className={`${badgeCls} ring-1 ${centroTipoMeta(centro.tipo).badge}`}>
        {centroTipoMeta(centro.tipo).emoji} {centro.tipo}
      </span>,
    );
  const badgesVisibles = badges.slice(0, 3);
  const badgesOcultos = badges.length - badgesVisibles.length;

  return (
    <div className="group flex flex-col overflow-hidden border border-border bg-surface transition-colors hover:border-emerald-500/50">
      <Link href={`/centros/${centro.id}`} className="relative block">
        <div className="aspect-[16/10] w-full overflow-hidden bg-surface-2">
          {centro.foto_url ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={centro.foto_url}
              alt={centro.nombre}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-surface-2 to-surface text-4xl opacity-40">
              🤝
            </div>
          )}
        </div>
        {/* Degradado para que las insignias se lean sobre fotos claras */}
        <div className="pointer-events-none absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-black/60 via-black/25 to-transparent" />
        <div className="absolute left-3 right-3 top-3 flex flex-nowrap items-center gap-1.5 overflow-hidden">
          {badgesVisibles}
          {badgesOcultos > 0 && (
            <span className={`${badgeCls} shrink-0 bg-black/70 text-white ring-1 ring-white/30`}>
              …
            </span>
          )}
        </div>
        {/* Logo del patrocinador */}
        {centro.patrocinado && centro.patrocinador_logo && (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={centro.patrocinador_logo}
            alt={centro.patrocinador_nombre ?? "Patrocinador"}
            title={centro.patrocinador_nombre ?? "Patrocinador"}
            className="absolute right-2 top-2 h-10 w-10 rounded-none bg-white object-contain p-1 shadow-md"
          />
        )}
      </Link>

      <div className="flex flex-1 flex-col p-3">
        <Link href={`/centros/${centro.id}`}>
          <h3 className="line-clamp-2 text-sm font-bold uppercase leading-tight tracking-tight text-foreground group-hover:text-emerald-400">
            {centro.nombre}
          </h3>
        </Link>
        <p className="mt-1 line-clamp-2 text-xs text-faint">
          {centro.zona}
          {centro.direccion ? ` · ${centro.direccion}` : ""}
        </p>
        {formatHorario(centro.dias, centro.hora_inicio, centro.hora_fin) && (
          <p className="mt-1 text-xs text-emerald-500/90">
            🕒 {formatHorario(centro.dias, centro.hora_inicio, centro.hora_fin)}
          </p>
        )}

        {necesidades.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1">
            {necesidades.map((n) => (
              <span
                key={n}
                className="bg-amber-500/10 px-1.5 py-0.5 text-[10px] font-medium text-amber-600/90 ring-1 ring-amber-500/25"
              >
                {n}
              </span>
            ))}
          </div>
        )}

        {/* Acciones con iconos */}
        <div className="mt-auto flex items-center gap-1.5 border-t border-border pt-2.5">
          {ig && (
            <a
              href={ig}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
              title="Instagram"
              className="flex h-8 w-8 items-center justify-center bg-gradient-to-br from-fuchsia-600 to-pink-500 text-white hover:opacity-90"
            >
              <IconInstagram />
            </a>
          )}
          {centro.maps_url && (
            <a
              href={centro.maps_url}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Cómo llegar"
              title="Cómo llegar"
              className="flex h-8 w-8 items-center justify-center border border-border text-foreground hover:bg-surface-2"
            >
              <IconMap />
            </a>
          )}
          {(centro.telefono || wa) && (
            <a
              href={wa ?? `tel:${centro.telefono}`}
              target={wa ? "_blank" : undefined}
              rel={wa ? "noopener noreferrer" : undefined}
              aria-label="Llamar / WhatsApp"
              title="Llamar / WhatsApp"
              className="flex h-8 w-8 items-center justify-center border border-border text-foreground hover:bg-surface-2"
            >
              <IconPhone />
            </a>
          )}
          <Link
            href={`/centros/${centro.id}`}
            className="ml-auto border border-emerald-600 px-2.5 py-1 text-xs font-medium text-emerald-500 hover:bg-emerald-500/10"
          >
            Ver centro →
          </Link>
        </div>
      </div>
    </div>
  );
}
