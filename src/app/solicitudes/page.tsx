import type { Metadata } from "next";
import Link from "next/link";
import { getSolicitudesAprobadas } from "@/lib/data";
import { SOLICITUD_TIPOS } from "@/lib/types";
import { formatFecha, whatsappLink } from "@/lib/format";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Solicitudes de ayuda",
  description:
    "Solicitudes verificadas de donantes de sangre, comida, inspección, voluntarios y más durante el terremoto de Venezuela 2026.",
  alternates: { canonical: "/solicitudes" },
};

export default async function SolicitudesPage({
  searchParams,
}: {
  searchParams: Promise<{ tipo?: string }>;
}) {
  const { tipo } = await searchParams;
  const todas = await getSolicitudesAprobadas();
  const filtradas =
    tipo && (SOLICITUD_TIPOS as readonly string[]).includes(tipo)
      ? todas.filter((s) => s.tipo === tipo)
      : todas;

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold uppercase tracking-tight text-foreground sm:text-3xl">
            Solicitudes de ayuda
          </h1>
          <p className="mt-1 max-w-2xl text-sm text-muted">
            Pedidos verificados de la comunidad. Cada solicitud fue confirmada por
            correo y revisada por nuestro equipo antes de publicarse.
          </p>
        </div>
        <Link
          href="/solicitar"
          className="shrink-0 bg-emerald-500 px-4 py-2.5 font-mono text-xs font-bold uppercase tracking-wide text-black hover:bg-emerald-400"
        >
          + Publicar solicitud
        </Link>
      </div>

      <div className="flex flex-wrap gap-2 font-mono text-xs uppercase tracking-wide">
        <Chip label="Todas" href="/solicitudes" active={!tipo} />
        {SOLICITUD_TIPOS.map((t) => (
          <Chip
            key={t}
            label={t}
            href={`/solicitudes?tipo=${encodeURIComponent(t)}`}
            active={tipo === t}
          />
        ))}
      </div>

      {filtradas.length === 0 ? (
        <p className="border border-dashed border-border bg-surface p-6 text-center text-faint">
          No hay solicitudes{tipo ? " de este tipo" : ""} por ahora.{" "}
          <Link href="/solicitar" className="underline">
            Publica la primera
          </Link>
          .
        </p>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtradas.map((s) => {
            const wa = whatsappLink(s.whatsapp);
            return (
              <li
                key={s.id}
                className="flex flex-col border border-border bg-surface p-5"
              >
                <span className="mb-2 inline-block w-fit bg-emerald-500/15 px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wide text-emerald-400 ring-1 ring-emerald-500/30">
                  {s.tipo}
                </span>
                <h3 className="font-bold uppercase tracking-tight text-foreground">
                  {s.titulo}
                </h3>
                {s.descripcion && (
                  <p className="mt-2 whitespace-pre-line text-sm text-muted">
                    {s.descripcion}
                  </p>
                )}

                <div className="mt-3 space-y-0.5 font-mono text-[11px] uppercase tracking-wide text-faint">
                  <p>Solicita: {s.nombre}</p>
                  {(s.zona || s.ubicacion) && (
                    <p>
                      📍 {[s.zona, s.ubicacion].filter(Boolean).join(" · ")}
                    </p>
                  )}
                </div>

                <div className="min-h-3 flex-1" />

                {(wa || s.telefono) && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {wa && (
                      <a
                        href={wa}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-emerald-600 px-3 py-1.5 font-mono text-[11px] font-bold uppercase tracking-wide text-white hover:bg-emerald-700"
                      >
                        WhatsApp
                      </a>
                    )}
                    {s.telefono && (
                      <a
                        href={`tel:${s.telefono}`}
                        className="border border-border px-3 py-1.5 font-mono text-[11px] font-bold uppercase tracking-wide text-foreground hover:bg-surface-2"
                      >
                        Llamar
                      </a>
                    )}
                  </div>
                )}

                <p className="mt-3 font-mono text-[10px] uppercase tracking-wide text-faint">
                  {formatFecha(s.created_at)}
                </p>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

function Chip({
  label,
  href,
  active,
}: {
  label: string;
  href: string;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      className={`px-3 py-1.5 font-medium ${
        active
          ? "bg-emerald-500 text-black"
          : "bg-surface text-muted ring-1 ring-border hover:bg-surface-2"
      }`}
    >
      {label}
    </Link>
  );
}
