import Link from "next/link";

const FAQ = [
  {
    q: "¿Aceptan pago móvil?",
    a: "No. No aceptamos ningún tipo de pago, ni lo vamos a aceptar. Este sitio es netamente informativo y existe para combatir la desinformación.",
  },
  {
    q: "¿Cómo se validan los centros?",
    a: "Tenemos una comunidad que verifica las fuentes ingresadas, y también recibimos solicitudes a través de nuestros canales de Instagram.",
  },
  {
    q: "¿Cómo podemos donar dinero?",
    a: "Dirígete a la sección de Donaciones, donde podrás ver las instituciones en las que confiamos para recibir dinero.",
  },
  {
    q: "¿Cómo puedo enviar una solicitud?",
    a: "Entra a la sección Solicitudes y pulsa “Publicar solicitud”. Llena el formulario (qué necesitas y cómo contactarte), verifica tu correo con el código que te enviamos y listo. Un administrador la revisará antes de publicarla.",
  },
  {
    q: "¿Con quién me puedo contactar para información de la página?",
    a: "Por favor contáctate con @piotruzc en Instagram para cambios o feedback en la página web. Debido al alto volumen de mensajes, tardaré un poco en contestar.",
  },
];

export function Footer() {
  return (
    <footer className="border-t border-border bg-surface">
      <div className="mx-auto w-full max-w-6xl space-y-8 px-4 py-10 sm:px-6 lg:px-8">
        {/* FAQ */}
        <section>
          <h2 className="mb-3 font-mono text-xs uppercase tracking-widest text-faint">
            Preguntas frecuentes
          </h2>
          <div className="divide-y divide-border border border-border">
            {FAQ.map((item) => (
              <details key={item.q} className="group">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-3 text-sm font-semibold text-foreground">
                  {item.q}
                  <span className="font-mono text-faint transition-transform group-open:rotate-45">
                    +
                  </span>
                </summary>
                <p className="px-4 pb-4 text-sm text-muted">{item.a}</p>
              </details>
            ))}
          </div>
        </section>

        {/* Otros sitios relevantes */}
        <section>
          <h2 className="mb-3 font-mono text-xs uppercase tracking-widest text-faint">
            Otros sitios relevantes
          </h2>
          <p className="text-sm text-muted">
            Más de 15 plataformas aliadas (desaparecidos, daños, refugios, rescate,
            mascotas y más) en{" "}
            <Link
              href="/enlaces"
              className="font-semibold text-emerald-500 underline hover:text-emerald-400"
            >
              Plataformas aliadas →
            </Link>
          </p>
        </section>

        {/* Créditos + meta */}
        <div className="flex flex-col items-start justify-between gap-4 border-t border-border pt-6 sm:flex-row sm:items-center">
          <div className="font-mono text-[11px] uppercase tracking-wider text-faint">
            <p>
              Créditos · Desarrollo web:{" "}
              <a
                href="https://github.com/pedrouzcategui"
                target="_blank"
                rel="noopener noreferrer"
                className="underline hover:text-muted"
              >
                Pedro Uzcátegui
              </a>
            </p>
            <p className="mt-1">
              Contribución de información y administración: Mercedes Pineda,
              Jesús Sirit,{" "}
              <a
                href="https://github.com/lospollitosdicen"
                target="_blank"
                rel="noopener noreferrer"
                className="underline hover:text-muted"
              >
                Albany Torres
              </a>
            </p>
            <p className="mt-1">
              Hecho con cariño para Venezuela y el mundo 💚 ·{" "}
              <Link href="/admin" className="underline hover:text-muted">
                Administración
              </Link>
            </p>
          </div>
          <Link
            href="/como-donar"
            className="bg-emerald-500 px-4 py-2 font-mono text-xs font-bold uppercase tracking-wide text-black hover:bg-emerald-400"
          >
            ¿Cómo donar?
          </Link>
        </div>
      </div>
    </footer>
  );
}
