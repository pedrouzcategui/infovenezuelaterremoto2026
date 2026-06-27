import { requireAprobado } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase";
import type { Anuncio } from "@/lib/types";
import { CATEGORIAS_ANUNCIO } from "@/lib/types";
import { ANUNCIO_META } from "@/lib/labels";
import { AdminNav } from "../AdminNav";
import { actualizarAnuncio, eliminarAnuncio } from "../actions";
import { AnuncioForm } from "./AnuncioForm";

export const dynamic = "force-dynamic";

async function getTodos(): Promise<Anuncio[]> {
  const { data } = await supabaseAdmin()
    .from("anuncios")
    .select("*")
    .order("fijado", { ascending: false })
    .order("created_at", { ascending: false });
  return (data ?? []) as Anuncio[];
}

const cls =
  "block w-full rounded-none border border-border bg-surface px-3 py-2 text-sm text-foreground placeholder:text-faint focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200";

const fileCls =
  "block w-full text-sm text-muted file:mr-3 file:border-0 file:bg-surface-2 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-foreground hover:file:bg-strong hover:file:text-white";

export default async function AdminAnunciosPage() {
  await requireAprobado();
  const anuncios = await getTodos();

  return (
    <div className="space-y-6">
      <AdminNav active="anuncios" />
      <AnuncioForm />

      <div>
        <h2 className="mb-3 font-semibold text-foreground">
          Anuncios ({anuncios.length})
        </h2>
        {anuncios.length === 0 ? (
          <p className="rounded-none border border-dashed border-border bg-surface p-6 text-center text-faint">
            Aún no hay anuncios. Publica el primero arriba.
          </p>
        ) : (
          <ul className="grid gap-3">
            {anuncios.map((a) => (
              <li key={a.id} className="rounded-none border border-border bg-surface">
                <details>
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-3 p-4">
                    <span>
                      {a.fijado && "📌 "}
                      <span className="font-medium text-foreground">{a.titulo}</span>{" "}
                      {!a.activo && (
                        <span className="rounded-none bg-surface-2 px-1.5 py-0.5 text-xs text-muted">
                          oculto
                        </span>
                      )}
                    </span>
                    <span
                      className={`shrink-0 rounded-none px-2 py-0.5 text-xs font-medium ring-1 ${ANUNCIO_META[a.categoria].badge}`}
                    >
                      {ANUNCIO_META[a.categoria].label}
                    </span>
                  </summary>

                  <form action={actualizarAnuncio} className="space-y-3 border-t border-border p-4">
                    <input type="hidden" name="id" value={a.id} />
                    <input name="titulo" defaultValue={a.titulo} className={cls} />
                    <textarea name="contenido" defaultValue={a.contenido} rows={4} className={cls} />
                    <div className="grid gap-3 sm:grid-cols-2">
                      <select name="categoria" defaultValue={a.categoria} className={cls}>
                        {CATEGORIAS_ANUNCIO.map((c) => (
                          <option key={c} value={c}>
                            {ANUNCIO_META[c].label}
                          </option>
                        ))}
                      </select>
                      <input name="fuente" defaultValue={a.fuente ?? ""} placeholder="Fuente / link" className={cls} />
                    </div>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <label className="block">
                        <span className="mb-1 flex items-center gap-2 font-mono text-[11px] uppercase tracking-wide text-faint">
                          Logo del negocio
                          {a.logo_url && (
                            /* eslint-disable-next-line @next/next/no-img-element */
                            <img src={a.logo_url} alt="" className="h-6 w-6 bg-white object-contain" />
                          )}
                        </span>
                        <input type="file" name="logo" accept="image/*" className={fileCls} />
                      </label>
                      <label className="block">
                        <span className="mb-1 flex items-center gap-2 font-mono text-[11px] uppercase tracking-wide text-faint">
                          Imagen de portada
                          {a.imagen_url && (
                            /* eslint-disable-next-line @next/next/no-img-element */
                            <img src={a.imagen_url} alt="" className="h-6 w-10 object-cover" />
                          )}
                        </span>
                        <input type="file" name="imagen" accept="image/*" className={fileCls} />
                      </label>
                    </div>
                    <div className="flex gap-4">
                      <label className="flex items-center gap-2 text-sm text-muted">
                        <input type="checkbox" name="fijado" defaultChecked={a.fijado} /> Fijado
                      </label>
                      <label className="flex items-center gap-2 text-sm text-muted">
                        <input type="checkbox" name="activo" defaultChecked={a.activo} /> Visible
                      </label>
                    </div>
                    <button type="submit" className="rounded-none bg-strong px-4 py-2 text-sm font-semibold text-white hover:opacity-90">
                      Guardar
                    </button>
                  </form>

                  <form action={eliminarAnuncio} className="border-t border-border px-4 py-2">
                    <input type="hidden" name="id" value={a.id} />
                    <button type="submit" className="text-xs font-medium text-red-600 hover:underline">
                      Eliminar anuncio
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
