import { getInstituciones } from "@/lib/data";
import { apiHandler, corsOptions } from "@/lib/api";

export const dynamic = "force-dynamic";

export const GET = (req: Request) => apiHandler(req, getInstituciones);
export const OPTIONS = () => corsOptions();
