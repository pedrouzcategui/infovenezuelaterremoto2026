import type { Metadata } from "next";
import Link from "next/link";
import { SolicitudForm } from "./SolicitudForm";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Publicar una solicitud",
  description:
    "¿Necesitas donantes de sangre, comida, inspección de estructuras, voluntarios u otra ayuda por el terremoto de Venezuela? Publica tu solicitud verificada.",
  alternates: { canonical: "/solicitar" },
  openGraph: {
    title: "Publica una solicitud de ayuda",
    description:
      "Pide ayuda (donantes, comida, inspección, voluntarios y más). Verificamos tu correo y un equipo revisa cada solicitud.",
  },
};

export default function SolicitarPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-5 py-2">
      <div>
        <h1 className="text-2xl font-extrabold uppercase tracking-tight text-foreground sm:text-3xl">
          Publicar una solicitud
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-muted">
          ¿Necesitas donantes de sangre, comida, inspección de estructuras,
          voluntarios u otra ayuda? Llena el formulario. Verificaremos tu correo
          con un código y un administrador revisará tu solicitud antes de
          publicarla.
        </p>
      </div>

      <SolicitudForm />

      <p className="text-center font-mono text-[11px] uppercase tracking-wide text-faint">
        ¿Buscas ayuda ya publicada?{" "}
        <Link href="/solicitudes" className="underline">
          Ver solicitudes
        </Link>
      </p>
    </div>
  );
}
