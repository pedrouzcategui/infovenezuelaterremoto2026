"use client";

import { useActionState, useEffect, useRef } from "react";
import { agregarComentario, type ComentarioState } from "../actions";

const initial: ComentarioState = { ok: false };

export function ComentariosForm({ centroId }: { centroId: string }) {
  const [state, action, pending] = useActionState(agregarComentario, initial);
  const ref = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.ok) ref.current?.reset();
  }, [state.ok]);

  return (
    <form
      ref={ref}
      action={action}
      className="space-y-2 rounded-none border border-border bg-surface p-4"
    >
      <input type="hidden" name="centro_id" value={centroId} />
      {state.error && (
        <p className="rounded-none bg-red-50 px-3 py-2 text-sm text-red-700 ring-1 ring-red-200">
          {state.error}
        </p>
      )}
      {state.ok && (
        <p className="rounded-none bg-emerald-50 px-3 py-2 text-sm text-emerald-700 ring-1 ring-emerald-200">
          ¡Gracias! Tu comentario será revisado antes de publicarse.
        </p>
      )}
      <input
        name="autor"
        required
        maxLength={80}
        placeholder="Tu nombre"
        className={cls}
      />
      <textarea
        name="contenido"
        required
        rows={3}
        maxLength={800}
        placeholder="¿Qué necesita este centro ahora? (ej: agua, pañales talla M, voluntarios…)"
        className={cls}
      />
      <button
        type="submit"
        disabled={pending}
        className="rounded-none bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-60"
      >
        {pending ? "Publicando…" : "Publicar comentario"}
      </button>
    </form>
  );
}

const cls =
  "block w-full rounded-none border border-border bg-surface px-3 py-2 text-sm text-foreground placeholder:text-faint focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200";
