import { requireAprobado } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase";
import type { Centro } from "@/lib/types";
import { NIVELES_CONFIANZA, TIPOS_CENTRO, ZONAS } from "@/lib/types";
import { AdminNav } from "../AdminNav";
import { actualizarCentro, eliminarCentro } from "../actions";
import { CentroForm } from "./CentroForm";
import { CentroQR } from "../../components/CentroQR";
import { ToastForm } from "../../components/ToastForm";

export const dynamic = "force-dynamic";

async function getTodosLosCentros(): Promise<Centro[]> {
  const { data } = await supabaseAdmin()
    .from("centros")
    .select("*")
    .order("zona", { ascending: true })
    .order("nombre", { ascending: true });
  return (data ?? []) as Centro[];
}

const cls =
  "block w-full rounded-none border border-border bg-surface px-3 py-2 text-sm text-foreground placeholder:text-faint focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200";

export default async function AdminCentrosPage() {
  await requireAprobado();
  const centros = await getTodosLosCentros();

  return (
    <div className="space-y-6">
      <AdminNav active="centros" />
      <CentroForm />

      <div>
        <h2 className="mb-3 font-semibold text-foreground">
          Centros ({centros.length})
        </h2>
        {centros.length === 0 ? (
          <p className="rounded-none border border-dashed border-border bg-surface p-6 text-center text-faint">
            Aún no hay centros. Agrega el primero arriba.
          </p>
        ) : (
          <ul className="grid gap-3">
            {centros.map((c) => (
              <li key={c.id} className="rounded-none border border-border bg-surface">
                <details>
                  <summary className="flex cursor-pointer list-none items-center gap-3 p-3">
                    {c.foto_url ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img
                        src={c.foto_url}
                        alt=""
                        className="h-14 w-20 shrink-0 rounded-none object-cover"
                      />
                    ) : (
                      <div className="flex h-14 w-20 shrink-0 items-center justify-center bg-surface-2 text-xl opacity-50">
                        🤝
                      </div>
                    )}
                    <span className="min-w-0 flex-1">
                      <span className="font-medium text-foreground">{c.nombre}</span>{" "}
                      {!c.activo && (
                        <span className="rounded-none bg-surface-2 px-1.5 py-0.5 text-xs text-muted">
                          oculto
                        </span>
                      )}
                      {(c.latitud == null || c.longitud == null) && (
                        <span className="ml-1 rounded-none bg-amber-100 px-1.5 py-0.5 text-xs text-amber-800">
                          sin mapa
                        </span>
                      )}
                      <span className="ml-2 text-xs text-faint">{c.zona}</span>
                    </span>
                    <span className="shrink-0 text-xs text-faint">Editar ▾</span>
                  </summary>

                  <ToastForm action={actualizarCentro} successMsg="Centro actualizado ✅" className="space-y-3 border-t border-border p-4">
                    <input type="hidden" name="id" value={c.id} />
                    <div className="grid gap-3 sm:grid-cols-2">
                      <input name="nombre" defaultValue={c.nombre} className={cls} />
                      <select name="zona" defaultValue={c.zona} className={cls}>
                        {ZONAS.map((z) => (
                          <option key={z} value={z}>
                            {z}
                          </option>
                        ))}
                      </select>
                    </div>
                    <input name="direccion" defaultValue={c.direccion ?? ""} placeholder="Dirección" className={cls} />
                    <div className="grid gap-3 sm:grid-cols-2">
                      <select name="tipo" defaultValue={c.tipo ?? ""} className={cls}>
                        <option value="">Sin insignia</option>
                        {TIPOS_CENTRO.map((t) => (
                          <option key={t} value={t}>
                            {t}
                          </option>
                        ))}
                      </select>
                      <select name="confianza" defaultValue={c.confianza ?? ""} className={cls}>
                        <option value="">Sin nivel</option>
                        {NIVELES_CONFIANZA.map((n) => (
                          <option key={n} value={n}>
                            {n}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <input name="instagram" defaultValue={c.instagram ?? ""} placeholder="Instagram" className={cls} />
                      <input name="whatsapp" defaultValue={c.whatsapp ?? ""} placeholder="WhatsApp" className={cls} />
                    </div>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <input name="telefono" defaultValue={c.telefono ?? ""} placeholder="Teléfono" className={cls} />
                      <input name="maps_url" defaultValue={c.maps_url ?? ""} placeholder="Link de Google Maps" className={cls} />
                    </div>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <input name="latitud" defaultValue={c.latitud ?? ""} placeholder="Latitud" className={cls} />
                      <input name="longitud" defaultValue={c.longitud ?? ""} placeholder="Longitud" className={cls} />
                    </div>
                    <textarea name="necesidades" defaultValue={c.necesidades ?? ""} rows={2} placeholder="Etiquetas (separadas por comas)" className={cls} />
                    <textarea name="necesidades_detalle" defaultValue={c.necesidades_detalle ?? ""} rows={3} placeholder="¿Qué necesitamos? Descripción detallada" className={cls} />
                    <div className="flex items-center gap-3">
                      {c.foto_url && (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img src={c.foto_url} alt="" className="h-14 w-20 shrink-0 object-cover" />
                      )}
                      <div className="flex-1">
                        <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-faint">
                          {c.foto_url ? "Cambiar foto" : "Foto de portada"}
                        </label>
                        <input
                          name="foto"
                          type="file"
                          accept="image/*"
                          className="block w-full text-sm text-muted file:mr-3 file:border-0 file:bg-surface-2 file:px-3 file:py-1.5 file:text-sm file:text-foreground hover:file:bg-border"
                        />
                      </div>
                    </div>
                    <label className="flex items-center gap-2 text-sm text-muted">
                      <input type="checkbox" name="patrocinado" defaultChecked={c.patrocinado} /> ⭐ Patrocinado
                    </label>
                    <div className="grid items-center gap-3 sm:grid-cols-2">
                      <input name="patrocinador_nombre" defaultValue={c.patrocinador_nombre ?? ""} placeholder="Nombre del patrocinador" className={cls} />
                      <div className="flex items-center gap-3">
                        {c.patrocinador_logo && (
                          /* eslint-disable-next-line @next/next/no-img-element */
                          <img src={c.patrocinador_logo} alt="" className="h-10 w-10 shrink-0 bg-white object-contain p-1" />
                        )}
                        <input name="patrocinador_logo" type="file" accept="image/*" className="block w-full text-sm text-muted file:mr-3 file:border-0 file:bg-surface-2 file:px-3 file:py-1.5 file:text-sm file:text-foreground hover:file:bg-border" />
                      </div>
                    </div>
                    <label className="flex items-center gap-2 text-sm text-muted">
                      <input type="checkbox" name="activo" defaultChecked={c.activo} /> Visible al público
                    </label>
                    <div className="flex gap-2">
                      <button type="submit" className="rounded-none bg-strong px-4 py-2 text-sm font-semibold text-white hover:opacity-90">
                        Guardar
                      </button>
                    </div>
                  </ToastForm>

                  <div className="border-t border-border p-4">
                    <CentroQR id={c.id} nombre={c.nombre} />
                  </div>

                  <ToastForm
                    action={eliminarCentro}
                    successMsg="Centro eliminado"
                    confirm={`¿Eliminar "${c.nombre}"? No se puede deshacer.`}
                    className="border-t border-border px-4 py-2"
                  >
                    <input type="hidden" name="id" value={c.id} />
                    <button type="submit" className="text-xs font-medium text-red-600 hover:underline">
                      Eliminar centro
                    </button>
                  </ToastForm>
                </details>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
