import { requireAprobado } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase";
import type { Comentario } from "@/lib/types";
import { formatFecha } from "@/lib/format";
import { AdminNav } from "../AdminNav";
import { eliminarComentario, ocultarComentario } from "../actions";

export const dynamic = "force-dynamic";

type ComentarioAdmin = Comentario & { centros?: { nombre: string } | null };

async function getComentarios(): Promise<ComentarioAdmin[]> {
  const { data } = await supabaseAdmin()
    .from("comentarios")
    .select("*, centros(nombre)")
    .order("reportes", { ascending: false })
    .order("created_at", { ascending: false });
  return (data ?? []) as ComentarioAdmin[];
}

export default async function AdminComentariosPage() {
  await requireAprobado();
  const comentarios = await getComentarios();
  const reportados = comentarios.filter((c) => c.reportes > 0).length;

  return (
    <div className="space-y-6">
      <AdminNav active="comentarios" />

      <div>
        <h1 className="text-xl font-bold text-foreground">Comentarios</h1>
        <p className="mt-1 text-sm text-muted">
          Se publican en vivo. {reportados > 0 ? `${reportados} con reportes — ` : ""}
          oculta o elimina los que sean indebidos.
        </p>
      </div>

      {comentarios.length === 0 ? (
        <p className="rounded-none border border-dashed border-border bg-surface p-6 text-center text-faint">
          Aún no hay comentarios.
        </p>
      ) : (
        <ul className="grid gap-3">
          {comentarios.map((c) => (
            <li
              key={c.id}
              className={`rounded-none border p-4 ${
                c.reportes > 0
                  ? "border-rose-200 bg-rose-50/40"
                  : "border-border bg-surface"
              }`}
            >
              <div className="flex items-baseline justify-between gap-3">
                <span className="font-medium text-foreground">{c.autor}</span>
                <span className="text-xs text-faint">
                  {formatFecha(c.created_at)}
                </span>
              </div>
              <p className="mt-1 whitespace-pre-line text-sm text-muted">
                {c.contenido}
              </p>
              <p className="mt-2 text-xs text-faint">
                Centro: {c.centros?.nombre ?? "—"}
                {c.reportes > 0 && (
                  <span className="ml-2 rounded-none bg-rose-100 px-1.5 py-0.5 text-rose-700">
                    ⚠ {c.reportes} reportes
                  </span>
                )}
                {c.oculto && (
                  <span className="ml-2 rounded-none bg-surface-2 px-1.5 py-0.5 text-muted">
                    oculto
                  </span>
                )}
              </p>

              <div className="mt-3 flex gap-3">
                <form action={ocultarComentario}>
                  <input type="hidden" name="id" value={c.id} />
                  <input type="hidden" name="centro_id" value={c.centro_id} />
                  <input type="hidden" name="oculto" value={String(c.oculto)} />
                  <button
                    type="submit"
                    className="rounded-none border border-border px-2.5 py-1 text-xs font-medium text-muted hover:bg-surface-2"
                  >
                    {c.oculto ? "Mostrar" : "Ocultar"}
                  </button>
                </form>
                <form action={eliminarComentario}>
                  <input type="hidden" name="id" value={c.id} />
                  <input type="hidden" name="centro_id" value={c.centro_id} />
                  <button
                    type="submit"
                    className="rounded-none border border-red-300 px-2.5 py-1 text-xs font-medium text-red-700 hover:bg-red-50"
                  >
                    Eliminar
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
