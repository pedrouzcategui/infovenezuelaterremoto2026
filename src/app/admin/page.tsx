import { requireAdmin } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase";
import type { Institucion } from "@/lib/types";
import { AdminNav } from "./AdminNav";
import { actualizarInstitucion, eliminarInstitucion } from "./actions";
import { InstitucionForm } from "./InstitucionForm";

export const dynamic = "force-dynamic";

async function getInstituciones(): Promise<Institucion[]> {
  const { data } = await supabaseAdmin()
    .from("instituciones")
    .select("*")
    .order("fijado", { ascending: false })
    .order("created_at", { ascending: false });
  return (data ?? []) as Institucion[];
}

const cls =
  "block w-full border border-border bg-surface px-3 py-2 text-sm text-foreground placeholder:text-faint focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200";

export default async function AdminInstitucionesPage() {
  await requireAdmin();
  const instituciones = await getInstituciones();

  return (
    <div className="space-y-6">
      <AdminNav active="donaciones" />

      <div>
        <h1 className="text-xl font-bold text-foreground">Instituciones para donar</h1>
        <p className="mt-1 text-sm text-muted">
          Instituciones oficiales en las que confías para recibir dinero. Se muestran
          en la página de Donaciones.
        </p>
      </div>

      <InstitucionForm />

      <div>
        <h2 className="mb-3 font-semibold text-foreground">
          Instituciones ({instituciones.length})
        </h2>
        {instituciones.length === 0 ? (
          <p className="border border-dashed border-border bg-surface p-6 text-center text-faint">
            Aún no hay instituciones. Agrega la primera arriba.
          </p>
        ) : (
          <ul className="grid gap-3">
            {instituciones.map((i) => (
              <li key={i.id} className="border border-border bg-surface">
                <details>
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-3 p-4">
                    <span className="flex items-center gap-3">
                      {i.logo && (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img src={i.logo} alt="" className="h-8 w-8 bg-white object-contain p-0.5" />
                      )}
                      <span className="font-medium text-foreground">
                        {i.fijado && "📌 "}
                        {i.nombre}
                      </span>
                      {!i.activo && (
                        <span className="bg-surface-2 px-1.5 py-0.5 text-xs text-muted">
                          oculto
                        </span>
                      )}
                    </span>
                  </summary>

                  <form action={actualizarInstitucion} className="space-y-3 border-t border-border p-4">
                    <input type="hidden" name="id" value={i.id} />
                    <div className="grid gap-3 sm:grid-cols-2">
                      <input name="nombre" defaultValue={i.nombre} className={cls} />
                      <input name="categoria" defaultValue={i.categoria ?? ""} placeholder="Categoría" className={cls} />
                    </div>
                    <textarea name="descripcion" defaultValue={i.descripcion ?? ""} rows={3} placeholder="Descripción" className={cls} />
                    <input name="enlace" defaultValue={i.enlace ?? ""} placeholder="Enlace para donar" className={cls} />
                    <div className="flex items-center gap-3">
                      {i.logo && (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img src={i.logo} alt="" className="h-10 w-10 shrink-0 bg-white object-contain p-1" />
                      )}
                      <input name="logo" type="file" accept="image/*" className="block w-full text-sm text-muted file:mr-3 file:border-0 file:bg-surface-2 file:px-3 file:py-1.5 file:text-sm file:text-foreground hover:file:bg-border" />
                    </div>
                    <div className="flex gap-4">
                      <label className="flex items-center gap-2 text-sm text-muted">
                        <input type="checkbox" name="fijado" defaultChecked={i.fijado} /> Fijado
                      </label>
                      <label className="flex items-center gap-2 text-sm text-muted">
                        <input type="checkbox" name="activo" defaultChecked={i.activo} /> Visible
                      </label>
                    </div>
                    <button type="submit" className="bg-strong px-4 py-2 text-sm font-semibold text-white hover:opacity-90">
                      Guardar
                    </button>
                  </form>

                  <form action={eliminarInstitucion} className="border-t border-border px-4 py-2">
                    <input type="hidden" name="id" value={i.id} />
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
