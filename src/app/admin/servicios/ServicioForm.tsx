"use client";

import { useActionState, useEffect, useRef } from "react";
import { CATEGORIAS_SERVICIO, COSTOS, ZONAS } from "@/lib/types";
import { crearServicio, type FormState } from "../actions";
import { useActionToast } from "@/app/components/useActionToast";

export function ServicioForm() {
  const [state, action, pending] = useActionState<FormState, FormData>(
    crearServicio,
    {},
  );
  const ref = useRef<HTMLFormElement>(null);
  useEffect(() => {
    if (state.ok) ref.current?.reset();
  }, [state.ok]);
  useActionToast(state, "Servicio agregado ✅");

  return (
    <form
      ref={ref}
      action={action}
      className="space-y-3 rounded-none border border-border bg-surface p-4"
    >
      <h2 className="font-semibold text-foreground">Agregar servicio</h2>

      <div className="grid gap-3 sm:grid-cols-2">
        <input name="nombre" required placeholder="Nombre *" className={cls} />
        <select name="categoria" required defaultValue="" className={cls}>
          <option value="" disabled>
            Categoría *
          </option>
          {CATEGORIAS_SERVICIO.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>
      <textarea name="descripcion" rows={2} placeholder="Descripción" className={cls} />
      <div className="grid gap-3 sm:grid-cols-2">
        <select name="costo" defaultValue="" className={cls}>
          <option value="">¿Gratis o pago? (opcional)</option>
          {COSTOS.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <select name="zona" defaultValue="" className={cls}>
          <option value="">Zona (opcional)</option>
          {ZONAS.map((z) => (
            <option key={z} value={z}>
              {z}
            </option>
          ))}
        </select>
        <input name="direccion" placeholder="Dirección" className={cls} />
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <input name="instagram" placeholder="Instagram (sin @)" className={cls} />
        <input name="whatsapp" placeholder="WhatsApp" className={cls} />
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <input name="telefono" placeholder="Teléfono" className={cls} />
        <input name="maps_url" placeholder="Link de Google Maps" className={cls} />
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <input name="latitud" placeholder="Latitud" className={cls} />
        <input name="longitud" placeholder="Longitud" className={cls} />
      </div>

      <div>
        <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-faint">
          Foto (opcional)
        </label>
        <input
          name="foto"
          type="file"
          accept="image/*"
          className="block w-full text-sm text-muted file:mr-3 file:border-0 file:bg-surface-2 file:px-3 file:py-2 file:text-sm file:text-foreground hover:file:bg-border"
        />
      </div>

      <button
        type="submit"
        disabled={pending}
        className="rounded-none bg-strong px-4 py-2 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-60"
      >
        {pending ? "Guardando…" : "Agregar servicio"}
      </button>
    </form>
  );
}

const cls =
  "block w-full rounded-none border border-border bg-surface px-3 py-2 text-sm text-foreground placeholder:text-faint focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200";
