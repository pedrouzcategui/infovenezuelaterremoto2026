"use client";

import { useActionState, useEffect, useRef } from "react";
import { CATEGORIAS_ANUNCIO } from "@/lib/types";
import { ANUNCIO_META } from "@/lib/labels";
import { crearAnuncio, type FormState } from "../actions";
import { useActionToast } from "@/app/components/useActionToast";

export function AnuncioForm() {
  const [state, action, pending] = useActionState<FormState, FormData>(
    crearAnuncio,
    {},
  );
  const ref = useRef<HTMLFormElement>(null);
  useEffect(() => {
    if (state.ok) ref.current?.reset();
  }, [state.ok]);
  useActionToast(state, "Anuncio publicado ✅");

  return (
    <form
      ref={ref}
      action={action}
      className="space-y-3 rounded-none border border-border bg-surface p-4"
    >
      <h2 className="font-semibold text-foreground">Publicar anuncio</h2>

      <input name="titulo" required placeholder="Título *" className={cls} />
      <textarea
        name="contenido"
        required
        rows={4}
        placeholder="Contenido del anuncio *"
        className={cls}
      />
      <div className="grid gap-3 sm:grid-cols-2">
        <select name="categoria" required defaultValue="" className={cls}>
          <option value="" disabled>
            Categoría *
          </option>
          {CATEGORIAS_ANUNCIO.map((c) => (
            <option key={c} value={c}>
              {ANUNCIO_META[c].label}
            </option>
          ))}
        </select>
        <input name="fuente" placeholder="Fuente / link (opcional)" className={cls} />
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block">
          <span className="mb-1 block font-mono text-[11px] uppercase tracking-wide text-faint">
            Logo del negocio (opcional)
          </span>
          <input type="file" name="logo" accept="image/*" className={fileCls} />
        </label>
        <label className="block">
          <span className="mb-1 block font-mono text-[11px] uppercase tracking-wide text-faint">
            Imagen de portada (opcional)
          </span>
          <input type="file" name="imagen" accept="image/*" className={fileCls} />
        </label>
      </div>

      <label className="flex items-center gap-2 text-sm text-muted">
        <input type="checkbox" name="fijado" /> Fijar arriba 📌
      </label>

      <button
        type="submit"
        disabled={pending}
        className="rounded-none bg-strong px-4 py-2 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-60"
      >
        {pending ? "Publicando…" : "Publicar anuncio"}
      </button>
    </form>
  );
}

const cls =
  "block w-full rounded-none border border-border bg-surface px-3 py-2 text-sm text-foreground placeholder:text-faint focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200";

const fileCls =
  "block w-full text-sm text-muted file:mr-3 file:border-0 file:bg-surface-2 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-foreground hover:file:bg-strong hover:file:text-white";
