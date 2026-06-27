import Link from "next/link";
import { getCentros, getInstituciones, getServicios } from "@/lib/data";
import { HomeCentros } from "./components/HomeCentros";

export const dynamic = "force-dynamic";

const TILES = [
  { href: "/mapa", emoji: "🗺️", title: "Mapa en vivo", desc: "Centros y servicios ubicados cerca de ti." },
  { href: "/servicios", emoji: "🧰", title: "Servicios gratuitos", desc: "Farmacias, médicos, transporte y más." },
  { href: "/anuncios", emoji: "📣", title: "Anuncios", desc: "Avisos oficiales, extraoficiales y rumores." },
  { href: "/paises", emoji: "🌍", title: "Ayuda internacional", desc: "Países e instituciones que ayudan." },
  { href: "/donaciones", emoji: "🏛️", title: "Donar dinero", desc: "Instituciones oficiales para donar." },
  { href: "/emergencias", emoji: "🚨", title: "Números de emergencia", desc: "Bomberos, Protección Civil, Policía y 911." },
];

export default async function Home() {
  const [centros, servicios, instituciones] = await Promise.all([
    getCentros(),
    getServicios(),
    getInstituciones(),
  ]);

  const stats = [
    { n: centros.length, label: "Centros" },
    { n: servicios.length, label: "Servicios" },
    { n: instituciones.length, label: "Instituciones" },
  ];

  return (
    <div className="space-y-12">
      {/* HERO — pantalla completa con radar detrás del menú */}
      <section className="relative -mt-20 flex min-h-screen w-screen mx-[calc(50%-50vw)] items-center overflow-hidden border-b border-white/10 bg-[#070a0f] text-white">
        {/* Rejilla + radar de búsqueda y rescate */}
        <div className="grid-overlay absolute inset-0" />
        <div
          className="radar left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 opacity-70"
          style={{ width: "min(95vw, 760px)", height: "min(95vw, 760px)" }}
        >
          <div className="radar__ring" />
          <div className="radar__ring" style={{ inset: "20%" }} />
          <div className="radar__ring" style={{ inset: "40%" }} />
          <div className="radar__sweep" />
          <div className="radar__ping" />
          <div className="radar__ping" style={{ animationDelay: "1.75s" }} />
        </div>

        <div className="relative z-10 mx-auto flex max-w-3xl flex-col items-center px-4 py-16 text-center sm:py-24">
          <div className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.25em] text-emerald-400">
            <span className="inline-block h-2 w-2 animate-pulse bg-emerald-400" />
            Sismo Venezuela · Junio 2026 · Datos en vivo
          </div>

          <h1 className="mt-6 text-4xl font-extrabold uppercase leading-[1.02] tracking-tight sm:text-6xl">
            Centros verificados,{" "}
            <span className="text-emerald-400">ayuda garantizada</span>
          </h1>

          <p className="mt-6 max-w-2xl text-base text-white/65 sm:text-lg">
            Listas de centros de acopio, números de emergencia, servicios gratuitos y
            noticias durante el terremoto de Venezuela de junio 2026.
          </p>

          <div className="mt-8 flex flex-wrap justify-center gap-3 font-mono text-xs font-bold uppercase tracking-wider">
            <Link href="#centros" className="bg-emerald-500 px-5 py-3 text-black hover:bg-emerald-400">
              Ver centros
            </Link>
            <Link href="/mapa" className="border border-white/25 px-5 py-3 text-white hover:bg-white/10">
              Ver el mapa
            </Link>
            <Link href="/como-donar" className="border border-white/25 px-5 py-3 text-white hover:bg-white/10">
              Cómo donar
            </Link>
          </div>

          {/* Stats en vivo */}
          <div className="mt-12 grid w-full max-w-lg grid-cols-3 gap-px border border-white/15 bg-white/15 font-mono">
            {stats.map((s) => (
              <div key={s.label} className="bg-[#070a0f] px-4 py-3">
                <div className="text-2xl font-extrabold text-white">{s.n}</div>
                <div className="mt-0.5 text-[10px] uppercase tracking-widest text-white/45">
                  {s.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ACCESO RÁPIDO */}
      <section>
        <h2 className="mb-3 font-mono text-xs uppercase tracking-widest text-faint">
          Acceso rápido
        </h2>
        <div className="grid gap-px border border-border bg-border sm:grid-cols-2 lg:grid-cols-3">
          {TILES.map((t) => (
            <Link
              key={t.href}
              href={t.href}
              className="bg-surface p-5 transition-colors hover:bg-surface-2"
            >
              <div className="text-2xl">{t.emoji}</div>
              <div className="mt-2 font-bold uppercase tracking-wide text-foreground">
                {t.title}
              </div>
              <p className="mt-1 text-sm text-muted">{t.desc}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* DIRECTORIO DE CENTROS */}
      <section id="centros" className="scroll-mt-20">
        <HomeCentros centros={centros} />
      </section>
    </div>
  );
}
