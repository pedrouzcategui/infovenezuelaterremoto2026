import { getAnuncios } from "@/lib/data";
import { apiHandler, corsOptions } from "@/lib/api";

export const dynamic = "force-dynamic";

export const GET = (req: Request) => apiHandler(req, getAnuncios);
export const OPTIONS = () => corsOptions();
