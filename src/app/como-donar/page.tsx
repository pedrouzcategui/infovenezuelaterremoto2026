import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Cómo donar",
  description:
    "Guía de qué donar tras el terremoto de Venezuela 2026: comida enlatada, medicinas, herramientas y ropa. Y recomendaciones de seguridad.",
};

const QUE_DONAR = [
  {
    emoji: "🥫",
    titulo: "Comida",
    nota: "NO preparada. Solo enlatada o no perecedera.",
    items: [
      "Atún, sardinas y enlatados",
      "Granos: arroz, caraotas, lentejas",
      "Harina de maíz, pasta",
      "Leche en polvo",
      "Agua embotellada",
    ],
  },
  {
    emoji: "💊",
    titulo: "Medicinas comunes",
    nota: "Selladas y sin vencer.",
    items: [
      "Acetaminofén / ibuprofeno",
      "Suero oral / electrolitos",
      "Gasas, vendas y antisépticos",
      "Alcohol y guantes",
      "Repelente de insectos",
    ],
  },
  {
    emoji: "🔦",
    titulo: "Herramientas",
    nota: "Útiles para rescate y emergencia.",
    items: [
      "Linternas y pilas",
      "Power banks / baterías",
      "Palas, guantes de trabajo",
      "Cuerdas y cinta adhesiva",
      "Velas y fósforos",
    ],
  },
  {
    emoji: "👕",
    titulo: "Ropa",
    nota: "Limpia y en buen estado.",
    items: [
      "Ropa interior y medias nuevas",
      "Abrigos y cobijas",
      "Zapatos en buen estado",
      "Ropa de bebé y niño",
      "Pañales",
    ],
  },
];

const SEGURIDAD = [
  "No confíes en ningún centro de acopio que no esté verificado en este sitio.",
  "No dejes a los niños con extraños bajo ninguna circunstancia.",
  "Este sitio NO recibe pagos ni dinero. No entregues efectivo a desconocidos.",
  "Verifica el centro en el mapa o en la lista antes de ir a donar.",
  "Si algo te parece sospechoso, repórtalo desde la página del centro.",
];

export default function ComoDonarPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-extrabold uppercase tracking-tight text-foreground sm:text-3xl">
          ¿Cómo donar?
        </h1>
        <p className="mt-1 max-w-2xl text-sm text-muted">
          Lo que más ayuda en este momento. Lleva tus donaciones solo a{" "}
          <Link
            href="/centros"
            className="font-semibold text-emerald-400 underline decoration-emerald-500/50 underline-offset-2 hover:text-emerald-300"
          >
            centros verificados
          </Link>
          .
        </p>
      </div>

      <div className="grid gap-px border border-border bg-border sm:grid-cols-2">
        {QUE_DONAR.map((g) => (
          <div key={g.titulo} className="bg-surface p-5">
            <div className="flex items-center gap-2">
              <span className="text-2xl">{g.emoji}</span>
              <h2 className="font-bold uppercase tracking-tight text-foreground">
                {g.titulo}
              </h2>
            </div>
            <p className="mt-1 text-xs font-medium text-emerald-500">{g.nota}</p>
            <ul className="mt-3 space-y-1 text-sm text-muted">
              {g.items.map((i) => (
                <li key={i} className="flex gap-2">
                  <span className="text-emerald-500">›</span>
                  {i}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* Seguridad */}
      <section className="border border-rose-500/40 bg-rose-500/5 p-5">
        <h2 className="font-mono text-xs uppercase tracking-widest text-rose-500">
          ⚠ Recomendaciones de seguridad
        </h2>
        <ul className="mt-3 space-y-2 text-sm text-muted">
          {SEGURIDAD.map((s) => (
            <li key={s} className="flex gap-2">
              <span className="text-rose-500">•</span>
              {s}
            </li>
          ))}
        </ul>
      </section>

      <div className="flex flex-wrap gap-3 font-mono text-xs font-bold uppercase tracking-wide">
        <Link href="/centros" className="bg-emerald-500 px-5 py-3 text-black hover:bg-emerald-400">
          Ver centros verificados
        </Link>
        <Link href="/mapa" className="border border-border px-5 py-3 text-muted hover:bg-surface-2">
          Ver el mapa
        </Link>
      </div>
    </div>
  );
}
