"use client";

import { useSyncExternalStore, useTransition } from "react";
import { reportarServicio } from "./actions";

function subscribe(cb: () => void) {
  window.addEventListener("ls-update", cb);
  return () => window.removeEventListener("ls-update", cb);
}
function useReported(id: string): boolean {
  return useSyncExternalStore(
    subscribe,
    () => !!localStorage.getItem(`rep-${id}`),
    () => false,
  );
}

export function ServicioReporte({ id }: { id: string }) {
  const reported = useReported(id);
  const [, startTransition] = useTransition();

  function report() {
    if (reported) return;
    if (!confirm("¿Reportar este servicio como sospechoso o falso?")) return;
    const fd = new FormData();
    fd.set("id", id);
    startTransition(() => reportarServicio(fd));
    localStorage.setItem(`rep-${id}`, "1");
    window.dispatchEvent(new Event("ls-update"));
  }

  return (
    <button
      onClick={report}
      disabled={reported}
      className="text-xs font-medium text-rose-500 hover:text-rose-400 disabled:opacity-50"
    >
      {reported ? "Reportado" : "⚠ Reportar"}
    </button>
  );
}
