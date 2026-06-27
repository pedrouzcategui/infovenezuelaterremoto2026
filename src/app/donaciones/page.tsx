import type { Metadata } from "next";
import Link from "next/link";
import { getInstituciones } from "@/lib/data";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Donar dinero — instituciones oficiales",
  description:
    "Instituciones oficiales y de confianza para donar dinero a los afectados por el terremoto de Venezuela. Este sitio no recibe pagos.",
};

export default async function DonacionesPage() {
  const instituciones = await getInstituciones();

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-extrabold uppercase tracking-tight text-foreground sm:text-3xl">
          Donar dinero
        </h1>
        <p className="mt-1 max-w-2xl text-sm text-muted">
          Instituciones oficiales y de confianza para donar dinero.{" "}
          <strong className="text-foreground">
            Este sitio no recibe pagos
          </strong>{" "}
          — dona directamente en los enlaces de abajo.
        </p>
      </div>

      {instituciones.length === 0 ? (
        <p className="border border-dashed border-border bg-surface p-6 text-center text-faint">
          Pronto publicaremos las instituciones de confianza para donar.
        </p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {instituciones.map((i) => (
            <div key={i.id} className="flex flex-col border border-border bg-surface p-5">
              <div className="flex items-center gap-3">
                {i.logo ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={i.logo}
                    alt={i.nombre}
                    className="h-12 w-12 shrink-0 bg-white object-contain p-1"
                  />
                ) : (
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center bg-surface-2 text-xl">
                    🏛️
                  </span>
                )}
                <div>
                  <h3 className="font-bold uppercase tracking-tight text-foreground">
                    {i.fijado && "📌 "}
                    {i.nombre}
                  </h3>
                  {i.categoria && (
                    <p className="font-mono text-[11px] uppercase tracking-wide text-faint">
                      {i.categoria}
                    </p>
                  )}
                </div>
              </div>

              {i.descripcion && (
                <p className="mt-3 whitespace-pre-line text-sm text-muted">
                  {i.descripcion}
                </p>
              )}

              {/* Empuja el botón al fondo dejando siempre un espacio mínimo */}
              <div className="min-h-5 flex-1" />

              {i.enlace && i.enlace.startsWith("http") && (
                <a
                  href={i.enlace}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block bg-emerald-500 px-4 py-2.5 text-center font-mono text-xs font-bold uppercase tracking-wide text-black hover:bg-emerald-400"
                >
                  Donar ↗
                </a>
              )}
            </div>
          ))}
        </div>
      )}

      <p className="text-center font-mono text-[11px] uppercase tracking-wide text-faint">
        ¿Conoces una institución de confianza?{" "}
        <Link href="/" className="underline">
          Avísanos
        </Link>
      </p>
    </div>
  );
}
