import { getSolicitudesAprobadas } from "@/lib/data";
import { apiHandler, corsOptions } from "@/lib/api";

export const dynamic = "force-dynamic";

// Expone las solicitudes aprobadas SIN el correo del solicitante (privado).
async function getSolicitudesPublicas() {
  const solicitudes = await getSolicitudesAprobadas();
  return solicitudes.map(({ email, email_verificado, ...resto }) => {
    void email;
    void email_verificado;
    return resto;
  });
}

export const GET = (req: Request) => apiHandler(req, getSolicitudesPublicas);
export const OPTIONS = () => corsOptions();
