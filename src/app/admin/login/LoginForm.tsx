"use client";

import { useActionState } from "react";
import { loginAction, type LoginState } from "../actions";

export function LoginForm() {
  const [state, action, pending] = useActionState<LoginState, FormData>(
    loginAction,
    {},
  );

  return (
    <form action={action} className="space-y-4">
      {state.error && (
        <p className="rounded-none bg-red-50 px-3 py-2 text-sm text-red-700 ring-1 ring-red-200">
          {state.error}
        </p>
      )}
      <div>
        <label
          htmlFor="password"
          className="mb-1 block text-sm font-medium text-muted"
        >
          Contraseña de administrador
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          autoFocus
          className="block w-full rounded-none border border-border bg-surface px-3 py-2 text-foreground focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200"
        />
      </div>
      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-none bg-strong px-4 py-2.5 font-semibold text-white hover:opacity-90 disabled:opacity-60"
      >
        {pending ? "Entrando…" : "Entrar"}
      </button>
    </form>
  );
}
