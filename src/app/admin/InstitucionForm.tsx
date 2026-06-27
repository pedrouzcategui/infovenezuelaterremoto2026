"use client";

import { useActionState, useEffect, useRef } from "react";
import { crearInstitucion, type FormState } from "./actions";
import { useActionToast } from "@/app/components/useActionToast";

export function InstitucionForm() {
  const [state, action, pending] = useActionState<FormState, FormData>(
    crearInstitucion,
    {},
  );
  const ref = useRef<HTMLFormElement>(null);
  useEffect(() => {
    if (state.ok) ref.current?.reset();
  }, [state.ok]);
  useActionToast(state, "Institución agregada ✅");

  return (
    <form ref={ref} action={action} className="space-y-3 border border-border bg-surface p-4">
      <h2 className="font-semibold text-foreground">Agregar institución</h2>

      <div className="grid gap-3 sm:grid-cols-2">
        <input name="nombre" required placeholder="Nombre *" className={cls} />
        <input name="categoria" placeholder="Categoría (ONG, gobierno…)" className={cls} />
      </div>
      <textarea
        name="descripcion"
        rows={3}
        placeholder="Descripción: cómo donar, para qué se usa el dinero…"
        className={cls}
      />
      <input name="enlace" placeholder="Enlace para donar (https://…)" className={cls} />
      <div>
        <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-faint">
          Logo (opcional)
        </label>
        <input
          name="logo"
          type="file"
          accept="image/*"
          className="block w-full text-sm text-muted file:mr-3 file:border-0 file:bg-surface-2 file:px-3 file:py-2 file:text-sm file:text-foreground hover:file:bg-border"
        />
      </div>
      <label className="flex items-center gap-2 text-sm text-muted">
        <input type="checkbox" name="fijado" /> Fijar arriba 📌
      </label>

      <button
        type="submit"
        disabled={pending}
        className="bg-strong px-4 py-2 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-60"
      >
        {pending ? "Guardando…" : "Agregar institución"}
      </button>
    </form>
  );
}

const cls =
  "block w-full border border-border bg-surface px-3 py-2 text-sm text-foreground placeholder:text-faint focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200";
