import Link from "next/link";
import { isAdmin } from "@/lib/auth";
import { logoutAction } from "./actions";

type Tab =
  | "donaciones"
  | "centros"
  | "servicios"
  | "solicitudes"
  | "anuncios"
  | "paises"
  | "comentarios"
  | "usuarios";

const TABS: { key: Tab; label: string; href: string }[] = [
  { key: "donaciones", label: "Instituciones", href: "/admin" },
  { key: "centros", label: "Centros", href: "/admin/centros" },
  { key: "servicios", label: "Servicios", href: "/admin/servicios" },
  { key: "solicitudes", label: "Solicitudes", href: "/admin/solicitudes" },
  { key: "anuncios", label: "Anuncios", href: "/admin/anuncios" },
  { key: "paises", label: "Países", href: "/admin/paises" },
  { key: "comentarios", label: "Comentarios", href: "/admin/comentarios" },
  { key: "usuarios", label: "Usuarios", href: "/admin/usuarios" },
];

export async function AdminNav({ active }: { active: Tab }) {
  const esAdmin = await isAdmin();
  // Solo los administradores gestionan usuarios.
  const tabs = esAdmin ? TABS : TABS.filter((t) => t.key !== "usuarios");
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-4">
      <nav className="flex flex-wrap gap-2">
        {tabs.map((t) => (
          <Link
            key={t.key}
            href={t.href}
            className={`rounded-none px-3 py-1.5 text-sm font-medium ${
              active === t.key
                ? "bg-strong text-white"
                : "text-muted hover:bg-surface-2"
            }`}
          >
            {t.label}
          </Link>
        ))}
      </nav>
      <form action={logoutAction}>
        <button
          type="submit"
          className="text-sm text-faint underline hover:text-muted"
        >
          Salir
        </button>
      </form>
    </div>
  );
}
