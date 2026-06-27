import { apiHandler, corsOptions } from "@/lib/api";

export const dynamic = "force-dynamic";

const base =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://infovenezuelaterremoto.org";

export const GET = (req: Request) =>
  apiHandler(req, async () => ({
    nombre: "Info Venezuela Terremoto — API pública",
    descripcion:
      "Datos abiertos y gratuitos para construir sobre nuestra información. Solo lectura.",
    limite: "100 solicitudes por minuto por IP",
    cors: "Permitido desde cualquier origen (*)",
    endpoints: {
      centros: `${base}/api/centros`,
      servicios: `${base}/api/servicios`,
      solicitudes: `${base}/api/solicitudes`,
      anuncios: `${base}/api/anuncios`,
      paises: `${base}/api/paises`,
      instituciones: `${base}/api/instituciones`,
    },
    formato: 'Cada endpoint devuelve { "data": [...] }',
  }));

export const OPTIONS = () => corsOptions();
