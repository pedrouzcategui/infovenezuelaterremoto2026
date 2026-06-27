"use client";

import { useActionState, useEffect, useRef } from "react";
import { crearPais, type FormState } from "../actions";

export function PaisForm() {
  const [state, action, pending] = useActionState<FormState, FormData>(
    crearPais,
    {},
  );
  const ref = useRef<HTMLFormElement>(null);
  useEffect(() => {
    if (state.ok) ref.current?.reset();
  }, [state.ok]);

  return (
    <form
      ref={ref}
      action={action}
      className="space-y-3 border border-border bg-surface p-4"
    >
      <h2 className="font-semibold text-foreground">Agregar país / institución</h2>
      {state.error && (
        <p className="bg-red-50 px-3 py-2 text-sm text-red-700 ring-1 ring-red-200">
          {state.error}
        </p>
      )}
      {state.ok && (
        <p className="bg-emerald-50 px-3 py-2 text-sm text-emerald-700 ring-1 ring-emerald-200">
          Guardado. ✅
        </p>
      )}

      <div className="grid gap-3 sm:grid-cols-[1fr_4rem]">
        <input name="pais" required placeholder="País o institución *" className={cls} />
        <input name="bandera" placeholder="🇪🇸" className={cls} />
      </div>
      <textarea
        name="descripcion"
        required
        rows={3}
        placeholder="¿En qué consiste la ayuda? *"
        className={cls}
      />
      <div className="grid gap-3 sm:grid-cols-2">
        <input name="monto" placeholder="Monto (ej: $3.000.000) — opcional" className={cls} />
        <input name="fuente" placeholder="Fuente / link — opcional" className={cls} />
      </div>
      <label className="flex items-center gap-2 text-sm text-muted">
        <input type="checkbox" name="fijado" /> Fijar arriba 📌
      </label>

      <button
        type="submit"
        disabled={pending}
        className="bg-strong px-4 py-2 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-60"
      >
        {pending ? "Guardando…" : "Agregar"}
      </button>
    </form>
  );
}

const cls =
  "block w-full border border-border bg-surface px-3 py-2 text-sm text-foreground placeholder:text-faint focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200";
