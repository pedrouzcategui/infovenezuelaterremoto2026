import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Números de emergencia",
  description:
    "Teléfonos de emergencia del estado Miranda: Bomberos, Protección Civil, Policía, VEN 911 y línea 0800 durante el terremoto de Venezuela.",
  alternates: { canonical: "/emergencias" },
};

type Contacto = { nombre: string; emoji: string; numeros: string[] };

// Teléfonos de emergencia de Miranda.
const CONTACTOS: Contacto[] = [
  {
    nombre: "Bomberos de Miranda",
    emoji: "🚒",
    numeros: [
      "+58 414-9175889",
      "+58 414-9254769",
      "+58 212-3229038",
      "+58 414-9271203",
    ],
  },
  {
    nombre: "Protección Civil Miranda",
    emoji: "🦺",
    numeros: ["(0212) 383-7441"],
  },
  {
    nombre: "Policía de Miranda",
    emoji: "👮",
    numeros: ["(0414) 100-1884"],
  },
  {
    nombre: "VEN 911",
    emoji: "🆘",
    numeros: ["911"],
  },
  {
    nombre: "0800 Miranda",
    emoji: "☎️",
    numeros: ["0800 647-26-32"],
  },
];

// Convierte un número visible en un href tel: válido (solo dígitos y +).
function telHref(n: string): string {
  return `tel:${n.replace(/[^\d+]/g, "")}`;
}

export default function EmergenciasPage() {
  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-extrabold uppercase tracking-tight text-foreground sm:text-3xl">
          Números de emergencia
        </h1>
        <p className="mt-1 max-w-2xl text-sm text-muted">
          Líneas oficiales del estado Miranda. Toca un número para llamar.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {CONTACTOS.map((c) => (
          <div key={c.nombre} className="border border-border bg-surface p-5">
            <div className="flex items-center gap-3">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center border border-border bg-surface-2 text-2xl">
                {c.emoji}
              </span>
              <h2 className="font-bold uppercase tracking-tight text-foreground">
                {c.nombre}
              </h2>
            </div>

            <div className="mt-3 flex flex-wrap gap-2">
              {c.numeros.map((n) => (
                <a
                  key={n}
                  href={telHref(n)}
                  className="bg-rose-600 px-3 py-2 font-mono text-sm font-bold tracking-wide text-white hover:bg-rose-500"
                >
                  📞 {n}
                </a>
              ))}
            </div>
          </div>
        ))}
      </div>

      <p className="text-center font-mono text-[11px] uppercase tracking-wide text-faint">
        En caso de emergencia inmediata, marca 911.
      </p>
    </div>
  );
}
