"use client";

import { useState } from "react";
import { supabaseBrowser } from "@/lib/supabase-browser";

export function CerrarSesion() {
  const [loading, setLoading] = useState(false);

  async function salir() {
    setLoading(true);
    await supabaseBrowser().auth.signOut();
    window.location.href = "/";
  }

  return (
    <button
      onClick={salir}
      disabled={loading}
      className="font-mono text-[11px] uppercase tracking-wide text-faint underline hover:text-muted disabled:opacity-60"
    >
      {loading ? "Cerrando…" : "Cerrar sesión"}
    </button>
  );
}
