import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Plataformas aliadas",
  description:
    "Directorio de plataformas aliadas durante el terremoto de Venezuela: personas desaparecidas, daños estructurales, refugios, rescate, mascotas y más.",
};

type Enlace = { nombre: string; url: string; nota?: string };
type Grupo = { titulo: string; enlaces: Enlace[] };

const GRUPOS: Grupo[] = [
  {
    titulo: "Reporte de personas desaparecidas",
    enlaces: [
      { nombre: "venezuelareporta.org", url: "https://venezuelareporta.org" },
      { nombre: "venezuelatebusca.com", url: "https://venezuelatebusca.com" },
      { nombre: "desaparecidosterremotovenezuela.com", url: "https://desaparecidosterremotovenezuela.com" },
      { nombre: "venezuela.tiltely.com", url: "https://venezuela.tiltely.com" },
    ],
  },
  {
    titulo: "Reporte de daños estructurales",
    enlaces: [
      { nombre: "terremotovenezuela.com", url: "https://terremotovenezuela.com" },
      { nombre: "terremotovenezuela.app", url: "https://terremotovenezuela.app" },
    ],
  },
  {
    titulo: "Red de apoyo",
    enlaces: [
      { nombre: "sosvenezuela2026.com", url: "https://sosvenezuela2026.com" },
      { nombre: "redayudavenezuela.com", url: "https://redayudavenezuela.com" },
    ],
  },
  {
    titulo: "Evaluación de daños e inspección de habitabilidad",
    enlaces: [
      { nombre: "revisatuedificio.com", url: "https://revisatuedificio.com" },
      { nombre: "tilinapp.com/inspeccion-emergencia", url: "https://tilinapp.com/inspeccion-emergencia" },
      { nombre: "habitable.lovable.app", url: "https://habitable.lovable.app" },
    ],
  },
  {
    titulo: "Apoyo presencial y rescate",
    enlaces: [
      { nombre: "rescate-ve.vercel.app", url: "https://rescate-ve.vercel.app" },
      { nombre: "refugio-ve.vercel.app/mapa", url: "https://refugio-ve.vercel.app/mapa" },
    ],
  },
  {
    titulo: "Centros de acopio",
    enlaces: [
      { nombre: "ayudaparavenezuela.com", url: "https://ayudaparavenezuela.com" },
      { nombre: "veneconnect.com/apoyo-terremoto", url: "https://veneconnect.com/apoyo-terremoto" },
      { nombre: "zonasegura.up.railway.app", url: "https://zonasegura.up.railway.app" },
    ],
  },
  {
    titulo: "Insumos requeridos por zona",
    enlaces: [{ nombre: "ayudaparavenezuela.com", url: "https://ayudaparavenezuela.com" }],
  },
  {
    titulo: "Refugios y alojamiento",
    enlaces: [
      { nombre: "zonasegura.up.railway.app", url: "https://zonasegura.up.railway.app" },
      { nombre: "refugiosvenezuela.com", url: "https://refugiosvenezuela.com", nota: "parece no estar operativa" },
    ],
  },
  {
    titulo: "Pacientes en hospitales",
    enlaces: [{ nombre: "pacientesterremotovzla.lovable.app", url: "https://pacientesterremotovzla.lovable.app" }],
  },
  {
    titulo: "Información de mascotas",
    enlaces: [{ nombre: "huellascan.com/terremoto", url: "https://huellascan.com/terremoto" }],
  },
];

export default function EnlacesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold uppercase tracking-tight text-foreground sm:text-3xl">
          Plataformas aliadas
        </h1>
        <p className="mt-1 max-w-2xl text-sm text-muted">
          Otras plataformas que ayudan durante el terremoto. Son sitios externos; no
          dependen de nosotros.
        </p>
      </div>

      <div className="grid gap-px border border-border bg-border md:grid-cols-2">
        {GRUPOS.map((g) => (
          <section key={g.titulo} className="bg-surface p-5">
            <h2 className="mb-3 font-mono text-[11px] uppercase tracking-widest text-emerald-400">
              {g.titulo}
            </h2>
            <ul className="space-y-1.5">
              {g.enlaces.map((e) => (
                <li key={e.nombre + e.url}>
                  <a
                    href={e.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between gap-2 text-sm text-foreground hover:text-emerald-400"
                  >
                    <span className={e.nota ? "text-faint line-through" : ""}>
                      {e.nombre}
                    </span>
                    <span className="text-faint">↗</span>
                  </a>
                  {e.nota && (
                    <span className="text-[11px] italic text-faint">{e.nota}</span>
                  )}
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>

      <p className="text-center font-mono text-[11px] uppercase tracking-wide text-faint">
        ¿Conoces otra plataforma?{" "}
        <Link href="/" className="underline">
          Avísanos
        </Link>
      </p>
    </div>
  );
}
