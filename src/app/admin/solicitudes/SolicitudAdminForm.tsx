"use client";

import { useActionState, useEffect, useRef } from "react";
import { SOLICITUD_TIPOS, ZONAS } from "@/lib/types";
import { crearSolicitudAdmin, type FormState } from "../actions";
import { useActionToast } from "../../components/useActionToast";

const cls =
  "block w-full border border-border bg-surface px-3 py-2 text-sm text-foreground placeholder:text-faint focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20";

export function SolicitudAdminForm() {
  const [state, action, pending] = useActionState<FormState, FormData>(
    crearSolicitudAdmin,
    {},
  );
  const ref = useRef<HTMLFormElement>(null);
  useEffect(() => {
    if (state.ok) ref.current?.reset();
  }, [state.ok]);
  useActionToast(state, "Solicitud publicada ✅");

  return (
    <details className="border border-border bg-surface">
      <summary className="cursor-pointer list-none p-4 font-semibold text-foreground">
        + Publicar solicitud (sin verificación por correo)
      </summary>
      <form ref={ref} action={action} className="space-y-3 border-t border-border p-4">
        <div className="grid gap-3 sm:grid-cols-2">
          <select name="tipo" required defaultValue="" className={cls}>
            <option value="" disabled>
              Tipo de solicitud *
            </option>
            {SOLICITUD_TIPOS.map((t) => (
              <option key={t} value={t}>
                {t}
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
        </div>
        <input name="titulo" required placeholder="Título *" className={cls} />
        <textarea
          name="descripcion"
          rows={3}
          placeholder="Descripción de la solicitud"
          className={cls}
        />
        <input name="ubicacion" placeholder="Lugar / dirección (opcional)" className={cls} />
        <div className="grid gap-3 sm:grid-cols-2">
          <input name="nombre" required placeholder="Quién solicita *" className={cls} />
          <input name="email" type="email" placeholder="Correo (opcional)" className={cls} />
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <input name="whatsapp" placeholder="WhatsApp (opcional)" className={cls} />
          <input name="telefono" placeholder="Teléfono (opcional)" className={cls} />
        </div>
        <button
          type="submit"
          disabled={pending}
          className="bg-strong px-4 py-2 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-60"
        >
          {pending ? "Publicando…" : "Publicar solicitud"}
        </button>
      </form>
    </details>
  );
}
