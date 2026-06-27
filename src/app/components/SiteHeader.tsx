"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ThemeToggle } from "./ThemeToggle";

const LINKS = [
  { href: "/centros", label: "Centros" },
  { href: "/mapa", label: "Mapa" },
  { href: "/servicios", label: "Servicios" },
  { href: "/solicitudes", label: "Solicitudes" },
  { href: "/anuncios", label: "Anuncios" },
  { href: "/paises", label: "Países" },
  { href: "/enlaces", label: "Aliados" },
  { href: "/como-donar", label: "Cómo donar" },
  { href: "/donaciones", label: "Donaciones" },
];

export function SiteHeader() {
  const [abierto, setAbierto] = useState(false);
  const pathname = usePathname();

  function activo(href: string) {
    return pathname === href || pathname.startsWith(`${href}/`);
  }

  return (
    <header className="fixed inset-x-0 top-0 z-30 border-b border-border/60 bg-background/55 backdrop-blur-xl">
      <div className="flex w-full items-center justify-between gap-x-5 px-4 py-3 sm:px-6 lg:px-8">
        <Link
          href="/"
          onClick={() => setAbierto(false)}
          className="font-mono text-sm font-bold uppercase tracking-[0.15em] text-foreground"
        >
          🆘 Info Venezuela Terremoto
        </Link>

        {/* Navegación de escritorio */}
        <nav className="hidden items-center gap-x-5 font-mono text-xs font-medium uppercase tracking-wider lg:flex">
          {LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={
                activo(l.href)
                  ? "text-foreground"
                  : "text-muted transition-colors hover:text-foreground"
              }
            >
              {l.label}
            </Link>
          ))}
          <ThemeToggle />
        </nav>

        {/* Controles móviles */}
        <div className="flex items-center gap-2 lg:hidden">
          <ThemeToggle />
          <button
            type="button"
            onClick={() => setAbierto((v) => !v)}
            aria-label={abierto ? "Cerrar menú" : "Abrir menú"}
            aria-expanded={abierto}
            className="flex h-9 w-9 items-center justify-center border border-border text-foreground"
          >
            <span className="font-mono text-base leading-none">
              {abierto ? "✕" : "☰"}
            </span>
          </button>
        </div>
      </div>

      {/* Panel desplegable móvil */}
      {abierto && (
        <nav className="border-t border-border/60 bg-background/95 backdrop-blur-xl lg:hidden">
          <div className="flex flex-col px-4 py-2 font-mono text-sm font-medium uppercase tracking-wider sm:px-6">
            {LINKS.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setAbierto(false)}
                className={`border-b border-border/40 py-3 last:border-b-0 ${
                  activo(l.href) ? "text-emerald-400" : "text-muted"
                }`}
              >
                {l.label}
              </Link>
            ))}
          </div>
        </nav>
      )}
    </header>
  );
}
