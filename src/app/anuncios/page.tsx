import Link from "next/link";
import { getAnuncios } from "@/lib/data";
import { CATEGORIAS_ANUNCIO } from "@/lib/types";
import { ANUNCIO_META } from "@/lib/labels";
import { AnunciosResultados } from "./AnunciosResultados";

export const dynamic = "force-dynamic";

export default async function AnunciosPage({
  searchParams,
}: {
  searchParams: Promise<{ cat?: string }>;
}) {
  const { cat } = await searchParams;
  const anuncios = await getAnuncios();
  const filtrados =
    cat && CATEGORIAS_ANUNCIO.includes(cat as never)
      ? anuncios.filter((a) => a.categoria === cat)
      : anuncios;

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-extrabold uppercase tracking-tight text-foreground sm:text-3xl">
          Anuncios y ayudas
        </h1>
        <p className="mt-1 text-sm text-muted">
          Información útil sobre ayudas, servicios gratuitos y avisos. Fíjate en la
          etiqueta: <strong>oficial</strong>, <strong>extraoficial</strong> o{" "}
          <strong>rumor</strong>.
        </p>
      </div>

      <div className="flex flex-wrap gap-2 font-mono text-xs uppercase tracking-wide">
        <FiltroChip label="Todos" href="/anuncios" active={!cat} />
        {CATEGORIAS_ANUNCIO.map((c) => (
          <FiltroChip
            key={c}
            label={`${ANUNCIO_META[c].emoji} ${ANUNCIO_META[c].label}`}
            href={`/anuncios?cat=${c}`}
            active={cat === c}
          />
        ))}
      </div>

      <AnunciosResultados anuncios={filtrados} cat={cat} />

      <p className="text-center text-xs text-faint">
        Los rumores no están verificados. Confirma antes de compartir.{" "}
        <Link href="/" className="underline">
          Inicio
        </Link>
      </p>
    </div>
  );
}

function FiltroChip({
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
