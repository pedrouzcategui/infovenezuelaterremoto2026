"use client";

import { useActionState, useEffect, useRef } from "react";
import { NIVELES_CONFIANZA, TIPOS_CENTRO, ZONAS } from "@/lib/types";
import { crearCentro, type FormState } from "../actions";
import { useActionToast } from "@/app/components/useActionToast";

export function CentroForm() {
  const [state, action, pending] = useActionState<FormState, FormData>(
    crearCentro,
    {},
  );
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.ok) formRef.current?.reset();
  }, [state.ok]);
  useActionToast(state, "Centro agregado ✅");

  return (
    <form
      ref={formRef}
      action={action}
      className="space-y-3 rounded-none border border-border bg-surface p-4"
    >
      <h2 className="font-semibold text-foreground">Agregar centro</h2>

      <div className="grid gap-3 sm:grid-cols-2">
        <input name="nombre" required placeholder="Nombre del centro *" className={cls} />
        <select name="zona" required defaultValue="" className={cls}>
          <option value="" disabled>
            Zona *
          </option>
          {ZONAS.map((z) => (
            <option key={z} value={z}>
              {z}
            </option>
          ))}
        </select>
      </div>

      <input name="direccion" placeholder="Dirección" className={cls} />

      <div className="grid gap-3 sm:grid-cols-[1fr_auto_auto]">
        <input name="dias" placeholder="Días (ej: Lun a Vie) — opcional" className={cls} />
        <input name="hora_inicio" type="time" aria-label="Hora de apertura" className={cls} />
        <input name="hora_fin" type="time" aria-label="Hora de cierre" className={cls} />
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <select name="tipo" defaultValue="" className={cls}>
          <option value="">Insignia / tipo (opcional)</option>
          {TIPOS_CENTRO.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
        <select name="confianza" defaultValue="" className={cls}>
          <option value="">Nivel de confianza (opcional)</option>
          {NIVELES_CONFIANZA.map((n) => (
            <option key={n} value={n}>
              {n}
            </option>
          ))}
        </select>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <input name="instagram" placeholder="Instagram (sin @)" className={cls} />
        <input
          name="whatsapp"
          placeholder="WhatsApp (ej: 584141234567)"
          className={cls}
        />
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <input name="telefono" placeholder="Teléfono" className={cls} />
        <input name="maps_url" placeholder="Link de Google Maps" className={cls} />
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <input name="latitud" placeholder="Latitud (ej: 10.3437)" className={cls} />
        <input name="longitud" placeholder="Longitud (ej: -67.0418)" className={cls} />
      </div>
      <p className="-mt-1 text-xs text-faint">
        Coordenadas para el mapa (opcional). En Google Maps: clic derecho sobre el
        punto → copia los dos números.
      </p>

      <textarea
        name="necesidades"
        rows={2}
        placeholder="Etiquetas de necesidades, separadas por comas (Agua, Medicinas, Ropa…)"
        className={cls}
      />
      <textarea
        name="necesidades_detalle"
        rows={3}
        placeholder="¿Qué necesitamos? Descripción detallada (ej: necesitamos urgente agua potable y pañales talla M…)"
        className={cls}
      />

      <label className="flex items-center gap-2 text-sm text-muted">
        <input type="checkbox" name="patrocinado" /> ⭐ Patrocinado (destacar marca
        grande)
      </label>
      <div className="grid gap-3 sm:grid-cols-2">
        <input
          name="patrocinador_nombre"
          placeholder="Nombre del patrocinador (ej: Yummy)"
          className={cls}
        />
        <div>
          <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-faint">
            Logo del patrocinador
          </label>
          <input
            name="patrocinador_logo"
            type="file"
            accept="image/*"
            className="block w-full text-sm text-muted file:mr-3 file:border-0 file:bg-surface-2 file:px-3 file:py-2 file:text-sm file:text-foreground hover:file:bg-border"
          />
        </div>
      </div>

      <div>
        <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-faint">
          Foto de portada (opcional)
        </label>
        <input
          name="foto"
          type="file"
          accept="image/*"
          className="block w-full text-sm text-muted file:mr-3 file:border-0 file:bg-surface-2 file:px-3 file:py-2 file:text-sm file:font-medium file:text-foreground hover:file:bg-border"
        />
      </div>

      <button
        type="submit"
        disabled={pending}
        className="rounded-none bg-strong px-4 py-2 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-60"
      >
        {pending ? "Guardando…" : "Agregar centro"}
      </button>
    </form>
  );
}

const cls =
  "block w-full rounded-none border border-border bg-surface px-3 py-2 text-sm text-foreground placeholder:text-faint focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200";
