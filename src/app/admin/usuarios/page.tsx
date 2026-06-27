import { requireAdmin } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase";
import type { Profile } from "@/lib/types";
import { formatFecha } from "@/lib/format";
import { AdminNav } from "../AdminNav";
import { aprobarUsuario, cambiarRol, rechazarUsuario } from "../actions";

export const dynamic = "force-dynamic";

async function getPerfiles(): Promise<Profile[]> {
  const { data } = await supabaseAdmin()
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: false });
  return (data ?? []) as Profile[];
}

const ESTADO_BADGE: Record<string, string> = {
  pendiente: "bg-amber-500/15 text-amber-600 ring-amber-500/30",
  aprobado: "bg-emerald-500/15 text-emerald-400 ring-emerald-400/50",
  rechazado: "bg-rose-500/15 text-rose-500 ring-rose-500/30",
};

export default async function AdminUsuariosPage() {
  await requireAdmin();
  const perfiles = await getPerfiles();
  const pendientes = perfiles.filter((p) => p.estado === "pendiente").length;

  return (
    <div className="space-y-6">
      <AdminNav active="usuarios" />

      <div>
        <h1 className="text-xl font-bold text-foreground">
          Usuarios{" "}
          {pendientes > 0 && (
            <span className="ml-1 bg-amber-500/15 px-2 py-0.5 text-sm text-amber-600 ring-1 ring-amber-500/30">
              {pendientes} por aprobar
            </span>
          )}
        </h1>
        <p className="mt-1 text-sm text-muted">
          Aprueba colaboradores y asigna roles. Solo los aprobados pueden contribuir.
        </p>
      </div>

      {perfiles.length === 0 ? (
        <p className="border border-dashed border-border bg-surface p-6 text-center text-faint">
          Aún no hay usuarios. Aparecerán aquí cuando inicien sesión con Google.
        </p>
      ) : (
        <ul className="grid gap-3">
          {perfiles.map((p) => (
            <li key={p.id} className="border border-border bg-surface p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="font-semibold text-foreground">
                    {p.nombre ?? "Sin nombre"}
                  </p>
                  <p className="font-mono text-xs text-faint">{p.email}</p>
                  <p className="mt-1 font-mono text-[11px] text-faint">
                    {formatFecha(p.created_at)}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="bg-surface-2 px-2 py-0.5 text-xs font-medium text-muted ring-1 ring-border">
                    {p.role}
                  </span>
                  <span
                    className={`px-2 py-0.5 text-xs font-bold uppercase tracking-wide ring-1 ${ESTADO_BADGE[p.estado] ?? ""}`}
                  >
                    {p.estado}
                  </span>
                </div>
              </div>

              <div className="mt-3 flex flex-wrap gap-2 text-xs">
                {p.estado !== "aprobado" && (
                  <form action={aprobarUsuario}>
                    <input type="hidden" name="id" value={p.id} />
                    <button className="bg-emerald-600 px-3 py-1.5 font-medium text-white hover:bg-emerald-700">
                      Aprobar
                    </button>
                  </form>
                )}
                {p.estado !== "rechazado" && (
                  <form action={rechazarUsuario}>
                    <input type="hidden" name="id" value={p.id} />
                    <button className="border border-rose-300 px-3 py-1.5 font-medium text-rose-600 hover:bg-rose-50">
                      Rechazar
                    </button>
                  </form>
                )}
                <form action={cambiarRol}>
                  <input type="hidden" name="id" value={p.id} />
                  <input
                    type="hidden"
                    name="rol"
                    value={p.role === "admin" ? "colaborador" : "admin"}
                  />
                  <button className="border border-border px-3 py-1.5 font-medium text-muted hover:bg-surface-2">
                    {p.role === "admin" ? "Quitar admin" : "Hacer admin"}
                  </button>
                </form>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
