import { requireAdmin } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase";
import type { PaisAyuda } from "@/lib/types";
import { AdminNav } from "../AdminNav";
import { actualizarPais, eliminarPais } from "../actions";
import { PaisForm } from "./PaisForm";

export const dynamic = "force-dynamic";

async function getTodos(): Promise<PaisAyuda[]> {
  const { data } = await supabaseAdmin()
    .from("paises_ayuda")
    .select("*")
    .order("fijado", { ascending: false })
    .order("created_at", { ascending: false });
  return (data ?? []) as PaisAyuda[];
}

const cls =
  "block w-full border border-border bg-surface px-3 py-2 text-sm text-foreground placeholder:text-faint focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200";

export default async function AdminPaisesPage() {
  await requireAdmin();
  const paises = await getTodos();

  return (
    <div className="space-y-6">
      <AdminNav active="paises" />
      <PaisForm />

      <div>
        <h2 className="mb-3 font-semibold text-foreground">
          Países / instituciones ({paises.length})
        </h2>
        {paises.length === 0 ? (
          <p className="border border-dashed border-border bg-surface p-6 text-center text-faint">
            Aún no hay registros. Agrega el primero arriba.
          </p>
        ) : (
          <ul className="grid gap-3">
            {paises.map((p) => (
              <li key={p.id} className="border border-border bg-surface">
                <details>
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-3 p-4">
                    <span className="flex items-center gap-2">
                      <span className="text-xl">{p.bandera ?? "🌐"}</span>
                      <span className="font-medium text-foreground">
                        {p.fijado && "📌 "}
                        {p.pais}
                      </span>
                      {!p.activo && (
                        <span className="bg-surface-2 px-1.5 py-0.5 text-xs text-muted">
                          oculto
                        </span>
                      )}
                    </span>
                    {p.monto && (
                      <span className="shrink-0 font-mono text-xs text-emerald-600">
                        {p.monto}
                      </span>
                    )}
                  </summary>

                  <form action={actualizarPais} className="space-y-3 border-t border-border p-4">
                    <input type="hidden" name="id" value={p.id} />
                    <div className="grid gap-3 sm:grid-cols-[1fr_4rem]">
                      <input name="pais" defaultValue={p.pais} className={cls} />
                      <input name="bandera" defaultValue={p.bandera ?? ""} placeholder="🇪🇸" className={cls} />
                    </div>
                    <textarea name="descripcion" defaultValue={p.descripcion} rows={3} className={cls} />
                    <div className="grid gap-3 sm:grid-cols-2">
                      <input name="monto" defaultValue={p.monto ?? ""} placeholder="Monto" className={cls} />
                      <input name="fuente" defaultValue={p.fuente ?? ""} placeholder="Fuente / link" className={cls} />
                    </div>
                    <div className="flex gap-4">
                      <label className="flex items-center gap-2 text-sm text-muted">
                        <input type="checkbox" name="fijado" defaultChecked={p.fijado} /> Fijado
                      </label>
                      <label className="flex items-center gap-2 text-sm text-muted">
                        <input type="checkbox" name="activo" defaultChecked={p.activo} /> Visible
                      </label>
                    </div>
                    <button type="submit" className="bg-strong px-4 py-2 text-sm font-semibold text-white hover:opacity-90">
                      Guardar
                    </button>
                  </form>

                  <form action={eliminarPais} className="border-t border-border px-4 py-2">
                    <input type="hidden" name="id" value={p.id} />
                    <button type="submit" className="text-xs font-medium text-red-600 hover:underline">
                      Eliminar
                    </button>
                  </form>
                </details>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
