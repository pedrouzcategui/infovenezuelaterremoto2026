import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getAnuncio } from "@/lib/data";
import { ANUNCIO_META } from "@/lib/labels";
import { formatFecha } from "@/lib/format";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const a = await getAnuncio(id);
  if (!a) return { title: "Anuncio no encontrado" };
  return { title: a.titulo, description: a.contenido.slice(0, 160) };
}

export default async function AnuncioDetallePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const a = await getAnuncio(id);
  if (!a) notFound();

  const meta = ANUNCIO_META[a.categoria];

  return (
    <article className="mx-auto max-w-2xl py-4">
      <Link
        href="/anuncios"
        className="font-mono text-xs uppercase tracking-wide text-faint hover:text-muted"
      >
        ← Volver a anuncios
      </Link>

      {/* Cabecera del artículo */}
      <header className="mt-6 border-b border-border pb-6">
        <span
          className={`inline-block px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wide ring-1 ${meta.badge}`}
        >
          {meta.emoji} {meta.label}
        </span>
        <h1 className="mt-4 text-3xl font-extrabold leading-tight tracking-tight text-foreground sm:text-4xl">
          {a.fijado && "📌 "}
          {a.titulo}
        </h1>
        <p className="mt-3 font-mono text-[11px] uppercase tracking-wide text-faint">
          Publicado el {formatFecha(a.created_at)}
        </p>
      </header>

      {/* Cuerpo estilo blog */}
      <div className="mt-6 space-y-4 whitespace-pre-line text-lg leading-relaxed text-muted">
        {a.contenido}
      </div>

      {a.fuente && a.fuente.startsWith("http") && (
        <a
          href={a.fuente}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-8 inline-block bg-emerald-500 px-4 py-2 font-mono text-xs font-bold uppercase tracking-wide text-black hover:bg-emerald-400"
        >
          Ver fuente original ↗
        </a>
      )}

      {a.categoria === "rumor" && (
        <p className="mt-8 border border-dashed border-rose-500/40 bg-rose-500/5 p-3 text-center text-xs text-rose-500">
          ⚠ Este anuncio es un rumor sin verificar. Confírmalo antes de compartir.
        </p>
      )}
    </article>
  );
}
