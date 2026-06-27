import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

/**
 * Cliente público (anon key). Respeta RLS: solo lee centros activos
 * y donaciones aprobadas. Úsalo para lecturas en páginas públicas.
 */
export function supabasePublic() {
  if (!url || !anonKey) {
    throw new Error(
      "Faltan NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY",
    );
  }
  return createClient(url, anonKey, { auth: { persistSession: false } });
}

/**
 * Cliente de servicio (service_role). Ignora RLS — SOLO en el servidor.
 * Úsalo para insertar donaciones, moderar y administrar centros.
 */
export function supabaseAdmin() {
  if (!url || !serviceKey) {
    throw new Error(
      "Faltan NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY",
    );
  }
  return createClient(url, serviceKey, { auth: { persistSession: false } });
}
