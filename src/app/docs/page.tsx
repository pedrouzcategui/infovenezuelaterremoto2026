import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "API / Datos abiertos",
  description:
    "Documentación de la API pública y gratuita de Info Venezuela Terremoto: endpoints, formato de respuesta, límites y ejemplos.",
  alternates: { canonical: "/docs" },
};

const base =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://infovenezuelaterremoto.org";

const ENDPOINTS: { path: string; desc: string }[] = [
  { path: "/api", desc: "Índice con la lista de endpoints." },
  { path: "/api/centros", desc: "Centros de acopio activos." },
  { path: "/api/servicios", desc: "Servicios activos (médicos, transporte, etc.)." },
  { path: "/api/solicitudes", desc: "Solicitudes de ayuda aprobadas (sin correo)." },
  { path: "/api/anuncios", desc: "Anuncios (oficiales, extraoficiales, rumores)." },
  { path: "/api/paises", desc: "Países e instituciones que ayudan." },
  { path: "/api/instituciones", desc: "Instituciones oficiales para donar dinero." },
];

function Code({ children }: { children: string }) {
  return (
    <pre className="overflow-x-auto border border-border bg-surface-2 p-4 font-mono text-xs leading-relaxed text-foreground">
      <code>{children}</code>
    </pre>
  );
}

function H2({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="mt-8 border-b border-border pb-2 font-mono text-sm uppercase tracking-widest text-emerald-400">
      {children}
    </h2>
  );
}

export default function DocsPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-4 py-2">
      <div>
        <h1 className="text-2xl font-extrabold uppercase tracking-tight text-foreground sm:text-3xl">
          API / Datos abiertos
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-muted">
          Toda la información verificada de este sitio está disponible como una
          API pública, gratuita y de solo lectura, para que cualquier persona u
          organización pueda construir sobre ella. No requiere registro ni clave.
        </p>
      </div>

      <H2>Resumen</H2>
      <ul className="space-y-1 text-sm text-muted">
        <li>
          <strong className="text-foreground">Base:</strong>{" "}
          <code className="bg-surface-2 px-1.5 py-0.5 font-mono text-xs">{base}</code>
        </li>
        <li>
          <strong className="text-foreground">Método:</strong> GET (solo lectura)
        </li>
        <li>
          <strong className="text-foreground">CORS:</strong> permitido desde
          cualquier origen, puedes llamarlo desde el navegador.
        </li>
        <li>
          <strong className="text-foreground">Límite:</strong> 100 solicitudes
          por minuto por IP.
        </li>
        <li>
          <strong className="text-foreground">Formato:</strong> JSON{" "}
          <code className="bg-surface-2 px-1.5 py-0.5 font-mono text-xs">
            {'{ "data": [ ... ] }'}
          </code>
        </li>
      </ul>

      <H2>Endpoints</H2>
      <div className="overflow-x-auto border border-border">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-border bg-surface-2 font-mono text-[11px] uppercase tracking-wide text-faint">
              <th className="px-3 py-2">Endpoint</th>
              <th className="px-3 py-2">Descripción</th>
            </tr>
          </thead>
          <tbody>
            {ENDPOINTS.map((e) => (
              <tr key={e.path} className="border-b border-border/60 last:border-0">
                <td className="px-3 py-2 align-top font-mono text-xs text-emerald-500">
                  <a
                    href={`${base}${e.path}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:underline"
                  >
                    {e.path}
                  </a>
                </td>
                <td className="px-3 py-2 align-top text-muted">{e.desc}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <H2>Ejemplo · cURL</H2>
      <Code>{`curl ${base}/api/centros`}</Code>

      <H2>Ejemplo · JavaScript (fetch)</H2>
      <Code>{`const res = await fetch("${base}/api/centros");
const { data } = await res.json();

for (const centro of data) {
  console.log(centro.nombre, "·", centro.zona);
}`}</Code>

      <H2>Respuesta</H2>
      <p className="text-sm text-muted">
        Todos los endpoints devuelven un objeto con la propiedad{" "}
        <code className="bg-surface-2 px-1.5 py-0.5 font-mono text-xs">data</code>{" "}
        (un arreglo). Ejemplo de un centro:
      </p>
      <Code>{`{
  "data": [
    {
      "id": "uuid",
      "nombre": "Cubo Negro Caracas",
      "zona": "Caracas",
      "direccion": "...",
      "tipo": "Negocio",
      "confianza": "Verificado",
      "instagram": "...",
      "whatsapp": "...",
      "telefono": "...",
      "maps_url": "...",
      "latitud": 10.48,
      "longitud": -66.85,
      "necesidades": "agua, medicinas",
      "dias": "Lun a Vie",
      "hora_inicio": "08:00",
      "hora_fin": "17:00",
      "foto_url": "...",
      "fijado": false,
      "contribuido_por": "Equipo"
    }
  ]
}`}</Code>

      <H2>Límites de uso</H2>
      <p className="text-sm leading-relaxed text-muted">
        Cada respuesta incluye cabeceras{" "}
        <code className="bg-surface-2 px-1.5 py-0.5 font-mono text-xs">X-RateLimit-Limit</code>,{" "}
        <code className="bg-surface-2 px-1.5 py-0.5 font-mono text-xs">X-RateLimit-Remaining</code>{" "}
        y{" "}
        <code className="bg-surface-2 px-1.5 py-0.5 font-mono text-xs">X-RateLimit-Reset</code>.
        Si superas las 100 solicitudes por minuto recibirás un código{" "}
        <code className="bg-surface-2 px-1.5 py-0.5 font-mono text-xs">429</code>{" "}
        con la cabecera{" "}
        <code className="bg-surface-2 px-1.5 py-0.5 font-mono text-xs">Retry-After</code>.
        Te recomendamos cachear las respuestas (se sirven con{" "}
        <code className="bg-surface-2 px-1.5 py-0.5 font-mono text-xs">Cache-Control: max-age=30</code>).
      </p>

      <H2>Privacidad</H2>
      <p className="text-sm leading-relaxed text-muted">
        Solo se exponen datos públicos ya aprobados. El correo de quienes envían
        solicitudes nunca se incluye en la API. Por favor da crédito a{" "}
        <strong className="text-foreground">Info Venezuela Terremoto</strong> al
        usar estos datos.
      </p>

      <p className="pt-4 text-center font-mono text-[11px] uppercase tracking-wide text-faint">
        ¿Construiste algo con la API?{" "}
        <Link href="/" className="underline">
          Cuéntanos
        </Link>
        .
      </p>
    </div>
  );
}
