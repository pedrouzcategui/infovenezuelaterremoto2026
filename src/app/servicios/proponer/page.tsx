import type { Metadata } from "next";
import Link from "next/link";
import { ProponerServicioForm } from "./ProponerServicioForm";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Proponer un servicio",
  description:
    "¿Conoces un servicio útil (médico, transporte, agua, etc.)? Propónlo para que lo verifiquemos y lo agreguemos al directorio.",
  alternates: { canonical: "/servicios/proponer" },
};

export default function ProponerServicioPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-5 py-2">
      <div>
        <h1 className="text-2xl font-extrabold uppercase tracking-tight text-foreground sm:text-3xl">
          Proponer un servicio
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-muted">
          ¿Conoces un servicio útil para los afectados? Llena el formulario.
          Nuestro equipo lo verificará antes de publicarlo en el directorio.
        </p>
      </div>

      <ProponerServicioForm />

      <p className="text-center font-mono text-[11px] uppercase tracking-wide text-faint">
        <Link href="/servicios" className="underline">
          Ver servicios publicados
        </Link>
      </p>
    </div>
  );
}
