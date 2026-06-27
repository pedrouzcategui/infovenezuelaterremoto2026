import type { Metadata } from "next";
import Link from "next/link";
import { ProponerCentroForm } from "./ProponerCentroForm";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Proponer un centro de acopio",
  description:
    "¿Conoces un centro de acopio confiable? Propónlo para que lo verifiquemos y lo agreguemos al directorio.",
  alternates: { canonical: "/centros/proponer" },
};

export default function ProponerCentroPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-5 py-2">
      <div>
        <h1 className="text-2xl font-extrabold uppercase tracking-tight text-foreground sm:text-3xl">
          Proponer un centro
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-muted">
          ¿Conoces un centro de acopio confiable? Llena el formulario. Nuestro
          equipo lo verificará antes de publicarlo en el directorio.
        </p>
      </div>

      <ProponerCentroForm />

      <p className="text-center font-mono text-[11px] uppercase tracking-wide text-faint">
        <Link href="/centros" className="underline">
          Ver centros publicados
        </Link>
      </p>
    </div>
  );
}
