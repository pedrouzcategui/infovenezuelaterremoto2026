import type { Metadata } from "next";
import Link from "next/link";
import { getCentros } from "@/lib/data";
import { CentrosBuscador } from "./CentrosBuscador";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Centros de acopio",
  description:
    "Lista de centros de acopio verificados en Los Teques, Carrizal, San Antonio de los Altos y Caracas. Busca y filtra por zona.",
};

export default async function CentrosPage() {
  const centros = await getCentros();

  return (
    // A todo el ancho de la pantalla (rompe el contenedor centrado).
    <div className="mx-[calc(50%-50vw)] w-screen space-y-5 px-4 sm:px-6 lg:px-8">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold uppercase tracking-tight text-foreground sm:text-3xl">
            Centros de acopio
          </h1>
          <p className="mt-1 text-sm text-muted">
            Busca y filtra los centros verificados. Lleva tus donaciones solo a centros
            de esta lista.
          </p>
        </div>
        <Link
          href="/centros/proponer"
          className="shrink-0 bg-emerald-500 px-4 py-2.5 font-mono text-xs font-bold uppercase tracking-wide text-black hover:bg-emerald-400"
        >
          + Proponer un centro
        </Link>
      </div>

      <CentrosBuscador centros={centros} />
    </div>
  );
}
