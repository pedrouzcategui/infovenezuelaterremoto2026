import { requireAprobado } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase";
import type { Solicitud } from "@/lib/types";
import { formatFecha } from "@/lib/format";
import { AdminNav } from "../AdminNav";
import { aprobarSolicitud, eliminarSolicitud } from "../actions";
import { ConfirmButton } from "../usuarios/ConfirmButton";

export const dynamic = "force-dynamic";

async function getTodas(): Promise<Solicitud[]> {
  const { data } = await supabaseAdmin()
    .from("solicitudes")
    .select("*")
    .order("estado", { ascending: true }) // 'aprobada','pendiente','rechazada' alfabético; pendiente al medio
    .order("created_at", { ascending: false });
  return (data ?? []) as Solicitud[];
}

const ESTADO_BADGE: Record<string, string> = {
  pendiente: "bg-amber-500/15 text-amber-600 ring-amber-500/30",
  aprobada: "bg-emerald-500/15 text-emerald-400 ring-emerald-400/50",
  rechazada: "bg-rose-500/15 text-rose-500 ring-rose-500/30",
};

export default async function AdminSolicitudesPage() {
  await requireAprobado();
  const solicitudes = await getTodas();
  // Pendientes primero para revisar.
  solicitudes.sort(
    (a, b) =>
      Number(b.estado === "pendiente") - Number(a.estado === "pendiente"),
  );
  const pendientes = solicitudes.filter((s) => s.estado === "pendiente").length;

  return (
    <div className="space-y-6">
      <AdminNav active="solicitudes" />

      <div>
        <h1 className="text-xl font-bold text-foreground">
          Solicitudes{" "}
          {pendientes > 0 && (
            <span className="ml-1 bg-amber-500/15 px-2 py-0.5 text-sm text-amber-600 ring-1 ring-amber-500/30">
              {pendientes} por revisar
            </span>
          )}
        </h1>
        <p className="mt-1 text-sm text-muted">
          Pedidos enviados por el público (correo verificado). Aprueba los
          legítimos para publicarlos.
        </p>
      </div>

      {solicitudes.length === 0 ? (
        <p className="border border-dashed border-border bg-surface p-6 text-center text-faint">
          Aún no hay solicitudes. Aparecerán aquí cuando alguien envíe el
          formulario público.
        </p>
      ) : (
        <ul className="grid gap-3">
          {solicitudes.map((s) => (
            <li key={s.id} className="border border-border bg-surface p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="bg-surface-2 px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wide text-muted ring-1 ring-border">
                      {s.tipo}
                    </span>
                    <span className="font-semibold text-foreground">
                      {s.titulo}
                    </span>
                  </div>
                  {s.descripcion && (
                    <p className="mt-2 whitespace-pre-line text-sm text-muted">
                      {s.descripcion}
                    </p>
                  )}
                  <div className="mt-2 space-y-0.5 font-mono text-[11px] text-faint">
                    <p>
                      Solicita: <span className="text-muted">{s.nombre}</span> ·{" "}
                      {s.email}
                    </p>
                    {(s.whatsapp || s.telefono) && (
                      <p>
                        {s.whatsapp ? `WhatsApp: ${s.whatsapp}` : ""}
                        {s.whatsapp && s.telefono ? " · " : ""}
                        {s.telefono ? `Tel: ${s.telefono}` : ""}
                      </p>
                    )}
                    {(s.zona || s.ubicacion) && (
                      <p>📍 {[s.zona, s.ubicacion].filter(Boolean).join(" · ")}</p>
                    )}
                    <p>{formatFecha(s.created_at)}</p>
                  </div>
                </div>
                <span
                  className={`shrink-0 px-2 py-0.5 text-xs font-bold uppercase tracking-wide ring-1 ${ESTADO_BADGE[s.estado] ?? ""}`}
                >
                  {s.estado}
                </span>
              </div>

              <div className="mt-3 flex flex-wrap gap-2 text-xs">
                {s.estado !== "aprobada" && (
                  <form action={aprobarSolicitud}>
                    <input type="hidden" name="id" value={s.id} />
                    <button className="bg-emerald-600 px-3 py-1.5 font-medium text-white hover:bg-emerald-700">
                      Aprobar
                    </button>
                  </form>
                )}
                <form action={eliminarSolicitud}>
                  <input type="hidden" name="id" value={s.id} />
                  <ConfirmButton
                    message={`¿Eliminar la solicitud "${s.titulo}"? No se puede deshacer.`}
                    className="border border-rose-300 px-3 py-1.5 font-medium text-rose-600 hover:bg-rose-50"
                  >
                    Eliminar
                  </ConfirmButton>
                </form>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
