import type { Metadata } from "next";
import Link from "next/link";
import { getPaisesAyuda } from "@/lib/data";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Países e instituciones que han ayudado",
  description:
    "Lista de países, gobiernos e instituciones que han enviado ayuda a Venezuela tras el terremoto de junio 2026.",
};

export default async function PaisesPage() {
  const paises = await getPaisesAyuda();

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold uppercase tracking-tight text-foreground">
          🌍 Ayuda internacional
        </h1>
        <p className="mt-1 text-sm text-muted">
          Países, gobiernos e instituciones que han enviado ayuda a Venezuela tras el
          terremoto.
        </p>
      </div>

      {paises.length === 0 ? (
        <p className="border border-dashed border-border bg-surface p-6 text-center text-faint">
          Pronto publicaremos quiénes están ayudando.
        </p>
      ) : (
        <div className="grid gap-px border border-border bg-border sm:grid-cols-2">
          {paises.map((p) => (
            <div key={p.id} className="bg-surface p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="text-3xl leading-none">{p.bandera ?? "🌐"}</span>
                  <h3 className="font-bold uppercase tracking-wide text-foreground">
                    {p.fijado && "📌 "}
                    {p.pais}
                  </h3>
                </div>
                {p.monto && (
                  <span className="shrink-0 bg-emerald-500/15 px-2 py-0.5 font-mono text-xs font-bold text-emerald-600 ring-1 ring-emerald-500/30">
                    {p.monto}
                  </span>
                )}
              </div>
              <p className="mt-3 whitespace-pre-line text-sm text-muted">
                {p.descripcion}
              </p>
              {p.fuente && p.fuente.startsWith("http") && (
                <a
                  href={p.fuente}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 inline-block font-mono text-xs uppercase tracking-wide text-emerald-600 underline"
                >
                  Ver fuente
                </a>
              )}
            </div>
          ))}
        </div>
      )}

      <p className="text-center font-mono text-[11px] uppercase tracking-wide text-faint">
        <Link href="/" className="underline">
          Volver al inicio
        </Link>
      </p>
    </div>
  );
}
