import { requireAprobado } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase";
import type { Servicio } from "@/lib/types";
import { CATEGORIAS_SERVICIO, COSTOS, ZONAS } from "@/lib/types";
import { AdminNav } from "../AdminNav";
import { actualizarServicio, eliminarServicio } from "../actions";
import { ServicioForm } from "./ServicioForm";

export const dynamic = "force-dynamic";

async function getTodos(): Promise<Servicio[]> {
  const { data } = await supabaseAdmin()
    .from("servicios")
    .select("*")
    .order("categoria", { ascending: true });
  return (data ?? []) as Servicio[];
}

const cls =
  "block w-full rounded-none border border-border bg-surface px-3 py-2 text-sm text-foreground placeholder:text-faint focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200";

export default async function AdminServiciosPage() {
  await requireAprobado();
  const servicios = await getTodos();

  return (
    <div className="space-y-6">
      <AdminNav active="servicios" />
      <ServicioForm />

      <div>
        <h2 className="mb-3 font-semibold text-foreground">
          Servicios ({servicios.length})
        </h2>
        {servicios.length === 0 ? (
          <p className="rounded-none border border-dashed border-border bg-surface p-6 text-center text-faint">
            Aún no hay servicios. Agrega el primero arriba.
          </p>
        ) : (
          <ul className="grid gap-3">
            {servicios.map((s) => (
              <li key={s.id} className="rounded-none border border-border bg-surface">
                <details>
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-3 p-4">
                    <span>
                      <span className="font-medium text-foreground">{s.nombre}</span>{" "}
                      {!s.activo && (
                        <span className="rounded-none bg-surface-2 px-1.5 py-0.5 text-xs text-muted">
                          oculto
                        </span>
                      )}
                      <span className="ml-2 text-xs text-faint">{s.categoria}</span>
                    </span>
                    <span className="text-xs text-faint">
                      👍{s.votos_positivos} 👎{s.votos_negativos} · Editar ▾
                    </span>
                  </summary>

                  <form action={actualizarServicio} className="space-y-3 border-t border-border p-4">
                    <input type="hidden" name="id" value={s.id} />
                    <div className="grid gap-3 sm:grid-cols-2">
                      <input name="nombre" defaultValue={s.nombre} className={cls} />
                      <select name="categoria" defaultValue={s.categoria} className={cls}>
                        {CATEGORIAS_SERVICIO.map((c) => (
                          <option key={c} value={c}>
                            {c}
                          </option>
                        ))}
                      </select>
                    </div>
                    <textarea name="descripcion" defaultValue={s.descripcion ?? ""} rows={2} placeholder="Descripción" className={cls} />
                    <div className="grid gap-3 sm:grid-cols-2">
                      <select name="costo" defaultValue={s.costo ?? ""} className={cls}>
                        <option value="">¿Gratis o pago?</option>
                        {COSTOS.map((c) => (
                          <option key={c} value={c}>
                            {c}
                          </option>
                        ))}
                      </select>
                      <select name="zona" defaultValue={s.zona ?? ""} className={cls}>
                        <option value="">Zona (opcional)</option>
                        {ZONAS.map((z) => (
                          <option key={z} value={z}>
                            {z}
                          </option>
                        ))}
                      </select>
                      <input name="direccion" defaultValue={s.direccion ?? ""} placeholder="Dirección" className={cls} />
                    </div>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <input name="instagram" defaultValue={s.instagram ?? ""} placeholder="Instagram" className={cls} />
                      <input name="whatsapp" defaultValue={s.whatsapp ?? ""} placeholder="WhatsApp" className={cls} />
                    </div>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <input name="telefono" defaultValue={s.telefono ?? ""} placeholder="Teléfono" className={cls} />
                      <input name="maps_url" defaultValue={s.maps_url ?? ""} placeholder="Link de Google Maps" className={cls} />
                    </div>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <input name="latitud" defaultValue={s.latitud ?? ""} placeholder="Latitud" className={cls} />
                      <input name="longitud" defaultValue={s.longitud ?? ""} placeholder="Longitud" className={cls} />
                    </div>
                    <div className="flex items-center gap-3">
                      {s.foto_url && (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img src={s.foto_url} alt="" className="h-12 w-16 shrink-0 object-cover" />
                      )}
                      <div className="flex-1">
                        <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-faint">
                          {s.foto_url ? "Cambiar foto" : "Foto (opcional)"}
                        </label>
                        <input name="foto" type="file" accept="image/*" className="block w-full text-sm text-muted file:mr-3 file:border-0 file:bg-surface-2 file:px-3 file:py-1.5 file:text-sm file:text-foreground hover:file:bg-border" />
                      </div>
                    </div>
                    <label className="flex items-center gap-2 text-sm text-muted">
                      <input type="checkbox" name="activo" defaultChecked={s.activo} /> Visible al público
                    </label>
                    <button type="submit" className="rounded-none bg-strong px-4 py-2 text-sm font-semibold text-white hover:opacity-90">
                      Guardar
                    </button>
                  </form>

                  <div className="flex gap-4 border-t border-border px-4 py-2">
                    <form action={eliminarServicio}>
                      <input type="hidden" name="id" value={s.id} />
                      <button type="submit" className="text-xs font-medium text-red-600 hover:underline">
                        Eliminar
                      </button>
                    </form>
                  </div>
                </details>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
