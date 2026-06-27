import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentProfile } from "@/lib/auth";
import { CerrarSesion } from "./CerrarSesion";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Cuenta en revisión",
  robots: { index: false, follow: false },
};

export default async function PendientePage() {
  const profile = await getCurrentProfile();

  // Sin sesión → al login. Ya aprobado → directo al panel.
  if (!profile) redirect("/admin/login");
  if (profile.estado === "aprobado") redirect("/admin");

  const rechazado = profile.estado === "rechazado";

  return (
    <div className="mx-auto max-w-lg pt-10 text-center">
      <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center border border-border bg-surface text-2xl">
        {rechazado ? "🚫" : "⏳"}
      </div>

      <h1 className="text-2xl font-extrabold uppercase tracking-tight text-foreground">
        {rechazado ? "Solicitud no aprobada" : "¡Gracias por tu interés!"}
      </h1>

      <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-muted">
        {rechazado ? (
          <>
            Tu solicitud para colaborar no fue aprobada en este momento. Si
            crees que es un error, contáctanos y con gusto la revisamos de
            nuevo.
          </>
        ) : (
          <>
            Tu cuenta{profile.nombre ? `, ${profile.nombre},` : ""} fue creada y
            está <strong className="text-foreground">en revisión</strong>. Un
            administrador la revisará y te notificaremos la decisión por correo
            (<span className="text-foreground">{profile.email}</span>).
          </>
        )}
      </p>

      {!rechazado && (
        <p className="mx-auto mt-3 max-w-md text-xs text-faint">
          Mientras tanto, puedes seguir explorando los centros y servicios
          verificados.
        </p>
      )}

      <div className="mt-7 flex items-center justify-center gap-4">
        <Link
          href="/"
          className="border border-border bg-surface px-4 py-2.5 font-mono text-xs font-bold uppercase tracking-wide text-foreground hover:bg-surface-2"
        >
          Ir al inicio
        </Link>
        <CerrarSesion />
      </div>
    </div>
  );
}
