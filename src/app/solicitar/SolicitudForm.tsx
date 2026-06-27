"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { SOLICITUD_TIPOS, ZONAS } from "@/lib/types";
import { TurnstileWidget } from "./TurnstileWidget";
import {
  crearSolicitud,
  enviarCodigoSolicitud,
  type SolicitudState,
} from "./actions";

const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

const cls =
  "block w-full rounded-none border border-border bg-surface px-3 py-2.5 text-sm text-foreground placeholder:text-faint focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20";

const initial = {
  tipo: "",
  titulo: "",
  descripcion: "",
  nombre: "",
  email: "",
  telefono: "",
  whatsapp: "",
  zona: "",
  ubicacion: "",
};

export function SolicitudForm() {
  const [form, setForm] = useState(initial);
  const set =
    (k: keyof typeof initial) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      setForm((f) => ({ ...f, [k]: e.target.value }));

  const [s1, action1, p1] = useActionState<SolicitudState, FormData>(
    enviarCodigoSolicitud,
    {},
  );
  const [s2, action2, p2] = useActionState<SolicitudState, FormData>(
    crearSolicitud,
    {},
  );

  // Éxito final
  if (s2.ok) {
    return (
      <div className="border border-emerald-500/40 bg-emerald-500/5 p-6 text-center">
        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center border border-emerald-500/50 text-2xl">
          ✅
        </div>
        <h2 className="text-lg font-bold uppercase tracking-tight text-foreground">
          ¡Solicitud enviada!
        </h2>
        <p className="mx-auto mt-2 max-w-sm text-sm text-muted">
          Tu correo fue verificado. Un administrador revisará tu solicitud y, una
          vez aprobada, aparecerá en la lista pública.
        </p>
        <Link
          href="/solicitudes"
          className="mt-5 inline-block border border-border bg-surface px-4 py-2.5 font-mono text-xs font-bold uppercase tracking-wide text-foreground hover:bg-surface-2"
        >
          Ver solicitudes
        </Link>
      </div>
    );
  }

  // Paso 2: verificar código
  if (s1.sent || s2.sent) {
    const email = s2.email ?? s1.email ?? form.email;
    return (
      <form action={action2} className="space-y-4 border border-border bg-surface p-5">
        <div>
          <h2 className="font-bold uppercase tracking-tight text-foreground">
            Verifica tu correo
          </h2>
          <p className="mt-1 text-sm text-muted">
            Enviamos un código de 6 dígitos a{" "}
            <span className="text-foreground">{email}</span>. Escríbelo aquí para
            confirmar tu solicitud.
          </p>
        </div>

        {s2.error && (
          <p className="bg-rose-500/10 px-3 py-2 text-sm text-rose-500 ring-1 ring-rose-500/30">
            {s2.error}
          </p>
        )}

        {/* Datos de la solicitud, ocultos, para crearla al verificar */}
        {Object.entries(form).map(([k, v]) => (
          <input key={k} type="hidden" name={k} value={v} />
        ))}

        <input
          name="code"
          inputMode="numeric"
          autoComplete="one-time-code"
          maxLength={6}
          required
          placeholder="Código de 6 dígitos"
          className={`${cls} text-center font-mono text-lg tracking-[0.4em]`}
        />

        <button
          type="submit"
          disabled={p2}
          className="w-full bg-emerald-500 px-4 py-2.5 font-mono text-xs font-bold uppercase tracking-wide text-black hover:bg-emerald-400 disabled:opacity-60"
        >
          {p2 ? "Verificando…" : "Confirmar solicitud"}
        </button>

        <p className="text-center font-mono text-[11px] uppercase tracking-wide text-faint">
          ¿No llegó? Revisa spam o vuelve a empezar recargando la página.
        </p>
      </form>
    );
  }

  // Paso 1: datos + captcha
  return (
    <form action={action1} className="space-y-4 border border-border bg-surface p-5">
      {s1.error && (
        <p className="bg-rose-500/10 px-3 py-2 text-sm text-rose-500 ring-1 ring-rose-500/30">
          {s1.error}
        </p>
      )}

      <div>
        <label className="mb-1 block font-mono text-[11px] uppercase tracking-wide text-faint">
          Tipo de solicitud *
        </label>
        <select required name="tipo" value={form.tipo} onChange={set("tipo")} className={cls}>
          <option value="" disabled>
            Selecciona…
          </option>
          {SOLICITUD_TIPOS.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
      </div>

      <input
        required
        name="titulo"
        value={form.titulo}
        onChange={set("titulo")}
        placeholder="Título * — ej: Se necesitan donantes O+ en Los Teques"
        className={cls}
      />
      <textarea
        name="descripcion"
        value={form.descripcion}
        onChange={set("descripcion")}
        rows={4}
        placeholder="Describe la solicitud: qué se necesita, cuándo, cantidad, detalles…"
        className={cls}
      />

      <div className="grid gap-3 sm:grid-cols-2">
        <select name="zona" value={form.zona} onChange={set("zona")} className={cls}>
          <option value="">Zona (opcional)</option>
          {ZONAS.map((z) => (
            <option key={z} value={z}>
              {z}
            </option>
          ))}
        </select>
        <input
          name="ubicacion"
          value={form.ubicacion}
          onChange={set("ubicacion")}
          placeholder="Lugar / dirección (opcional)"
          className={cls}
        />
      </div>

      <div className="border-t border-border pt-4">
        <p className="mb-2 font-mono text-[11px] uppercase tracking-wide text-faint">
          ¿Quién hace la solicitud?
        </p>
        <div className="space-y-3">
          <input
            required
            name="nombre"
            value={form.nombre}
            onChange={set("nombre")}
            placeholder="Tu nombre o el de tu organización *"
            className={cls}
          />
          <input
            required
            type="email"
            name="email"
            value={form.email}
            onChange={set("email")}
            placeholder="Tu correo electrónico * (te enviaremos un código)"
            className={cls}
          />
          <div className="grid gap-3 sm:grid-cols-2">
            <input
              name="whatsapp"
              value={form.whatsapp}
              onChange={set("whatsapp")}
              placeholder="WhatsApp (opcional)"
              className={cls}
            />
            <input
              name="telefono"
              value={form.telefono}
              onChange={set("telefono")}
              placeholder="Teléfono (opcional)"
              className={cls}
            />
          </div>
        </div>
      </div>

      {siteKey && <TurnstileWidget siteKey={siteKey} />}

      <button
        type="submit"
        disabled={p1}
        className="w-full bg-emerald-500 px-4 py-3 font-mono text-xs font-bold uppercase tracking-wide text-black hover:bg-emerald-400 disabled:opacity-60"
      >
        {p1 ? "Enviando código…" : "Enviar y verificar correo →"}
      </button>

      <p className="text-center text-[11px] text-faint">
        Tu correo solo se usa para verificar la solicitud; no se muestra al
        público.
      </p>
    </form>
  );
}
