"use client";

import { useActionState } from "react";
import Link from "next/link";
import { CATEGORIAS_SERVICIO, COSTOS, ZONAS } from "@/lib/types";
import { proponerServicio, type ProponerState } from "./actions";
import { TurnstileWidget } from "../../solicitar/TurnstileWidget";

const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

const cls =
  "block w-full border border-border bg-surface px-3 py-2.5 text-sm text-foreground placeholder:text-faint focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20";

export function ProponerServicioForm() {
  const [state, action, pending] = useActionState<ProponerState, FormData>(
    proponerServicio,
    {},
  );

  if (state.ok) {
    return (
      <div className="border border-emerald-500/40 bg-emerald-500/5 p-6 text-center">
        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center border border-emerald-500/50 text-2xl">
          ✅
        </div>
        <h2 className="text-lg font-bold uppercase tracking-tight text-foreground">
          ¡Gracias por tu aporte!
        </h2>
        <p className="mx-auto mt-2 max-w-sm text-sm text-muted">
          Recibimos tu propuesta de servicio. Nuestro equipo la revisará y, una
          vez verificada, aparecerá en el directorio.
        </p>
        <Link
          href="/servicios"
          className="mt-5 inline-block border border-border bg-surface px-4 py-2.5 font-mono text-xs font-bold uppercase tracking-wide text-foreground hover:bg-surface-2"
        >
          Volver a servicios
        </Link>
      </div>
    );
  }

  return (
    <form action={action} className="space-y-4 border border-border bg-surface p-5">
      {state.error && (
        <p className="bg-rose-500/10 px-3 py-2 text-sm text-rose-500 ring-1 ring-rose-500/30">
          {state.error}
        </p>
      )}

      <div className="grid gap-3 sm:grid-cols-2">
        <input name="nombre" required placeholder="Nombre del servicio *" className={cls} />
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

      <textarea
        name="descripcion"
        rows={3}
        placeholder="¿Qué ofrece el servicio? Detalles útiles"
        className={cls}
      />

      <div className="grid gap-3 sm:grid-cols-2">
        <select name="zona" defaultValue="" className={cls}>
          <option value="">Zona (opcional)</option>
          {ZONAS.map((z) => (
            <option key={z} value={z}>
              {z}
            </option>
          ))}
        </select>
        <select name="costo" defaultValue="" className={cls}>
          <option value="">¿Gratis o pago? (opcional)</option>
          {COSTOS.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>

      <input name="direccion" placeholder="Dirección (opcional)" className={cls} />

      <div className="grid gap-3 sm:grid-cols-2">
        <input name="instagram" placeholder="Instagram (opcional)" className={cls} />
        <input name="whatsapp" placeholder="WhatsApp (opcional)" className={cls} />
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <input name="telefono" placeholder="Teléfono (opcional)" className={cls} />
        <input name="maps_url" placeholder="Link de Google Maps (opcional)" className={cls} />
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <input name="latitud" placeholder="Latitud (opcional)" className={cls} />
        <input name="longitud" placeholder="Longitud (opcional)" className={cls} />
      </div>

      <div className="border-t border-border pt-4">
        <p className="mb-2 font-mono text-[11px] uppercase tracking-wide text-faint">
          Foto y tus datos (opcional)
        </p>
        <input
          name="foto"
          type="file"
          accept="image/*"
          className="block w-full text-sm text-muted file:mr-3 file:border-0 file:bg-surface-2 file:px-3 file:py-1.5 file:text-sm file:text-foreground hover:file:bg-border"
        />
        <input
          name="proponente"
          placeholder="Tu nombre (para dar crédito, opcional)"
          className={`${cls} mt-3`}
        />
      </div>

      {siteKey && <TurnstileWidget siteKey={siteKey} />}

      <button
        type="submit"
        disabled={pending}
        className="w-full bg-emerald-500 px-4 py-3 font-mono text-xs font-bold uppercase tracking-wide text-black hover:bg-emerald-400 disabled:opacity-60"
      >
        {pending ? "Enviando…" : "Enviar propuesta para revisión"}
      </button>

      <p className="text-center text-[11px] text-faint">
        Tu propuesta no se publica automáticamente: un administrador la revisa
        antes de mostrarla.
      </p>
    </form>
  );
}
