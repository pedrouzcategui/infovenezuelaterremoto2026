import { redirect } from "next/navigation";
import { getCurrentProfile, isAdmin } from "@/lib/auth";
import { LoginForm } from "./LoginForm";
import { GoogleLoginButton } from "./GoogleLoginButton";

export const dynamic = "force-dynamic";

export default async function LoginPage() {
  if (await isAdmin()) redirect("/admin");
  // Ya autenticado vía Google: enviarlo según su estado.
  const profile = await getCurrentProfile();
  if (profile) redirect(profile.estado === "aprobado" ? "/admin" : "/pendiente");

  return (
    <div className="mx-auto max-w-sm pt-6">
      <h1 className="text-xl font-extrabold uppercase tracking-tight text-foreground">
        Acceder
      </h1>
      <p className="mt-1 mb-5 text-sm text-muted">
        Inicia sesión para administrar o contribuir.
      </p>

      <GoogleLoginButton />

      <details className="mt-6">
        <summary className="cursor-pointer font-mono text-[11px] uppercase tracking-wide text-faint">
          Acceso de administrador con contraseña
        </summary>
        <div className="mt-3">
          <LoginForm />
        </div>
      </details>
    </div>
  );
}
