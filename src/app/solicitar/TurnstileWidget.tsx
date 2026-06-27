"use client";

import { useEffect, useRef } from "react";

declare global {
  interface Window {
    turnstile?: {
      render: (el: HTMLElement, opts: Record<string, unknown>) => string;
      remove: (id: string) => void;
    };
  }
}

const SCRIPT_ID = "cf-turnstile-script";
const SRC = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";

/**
 * Renderiza Turnstile de forma EXPLÍCITA, una sola vez, con limpieza al
 * desmontar. Así evitamos el error de doble render en React Strict Mode
 * (dev) y los re-render del formulario controlado. El token se inyecta
 * automáticamente como input oculto `cf-turnstile-response` dentro del form.
 */
export function TurnstileWidget({ siteKey }: { siteKey: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetId = useRef<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    let poll: number | undefined;

    function render() {
      if (
        cancelled ||
        widgetId.current ||
        !containerRef.current ||
        !window.turnstile
      )
        return;
      widgetId.current = window.turnstile.render(containerRef.current, {
        sitekey: siteKey,
        theme: "dark",
      });
    }

    if (window.turnstile) {
      render();
    } else {
      if (!document.getElementById(SCRIPT_ID)) {
        const s = document.createElement("script");
        s.id = SCRIPT_ID;
        s.src = SRC;
        s.async = true;
        s.defer = true;
        document.head.appendChild(s);
      }
      // Espera a que el script cargue (la etiqueta puede existir ya).
      poll = window.setInterval(() => {
        if (window.turnstile) {
          window.clearInterval(poll);
          render();
        }
      }, 150);
    }

    return () => {
      cancelled = true;
      if (poll) window.clearInterval(poll);
      if (widgetId.current && window.turnstile) {
        try {
          window.turnstile.remove(widgetId.current);
        } catch {
          /* el widget ya no existe */
        }
        widgetId.current = null;
      }
    };
  }, [siteKey]);

  return <div ref={containerRef} />;
}
