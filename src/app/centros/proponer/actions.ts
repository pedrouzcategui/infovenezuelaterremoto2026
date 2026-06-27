"use server";

import { revalidatePath } from "next/cache";
import { supabaseAdmin } from "@/lib/supabase";
import { verifyTurnstile } from "@/lib/turnstile";
import { ZONAS, type Zona } from "@/lib/types";

export type ProponerState = { ok?: boolean; error?: string };

function str(fd: FormData, key: string): string | null {
  const v = (fd.get(key) as string | null)?.trim();
  return v ? v : null;
}

function num(fd: FormData, key: string): number | null {
  const v = (fd.get(key) as string | null)?.trim();
  if (!v) return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

async function uploadFoto(fd: FormData): Promise<string | null> {
  const file = fd.get("foto");
  if (!(file instanceof File) || file.size === 0) return null;
  if (!file.type.startsWith("image/")) return null;
  const ext = (file.name.split(".").pop() || "jpg").toLowerCase();
  const path = `${crypto.randomUUID()}.${ext}`;
  const supabase = supabaseAdmin();
  const { error } = await supabase.storage
    .from("centros")
    .upload(path, file, { contentType: file.type, upsert: false });
  if (error) return null;
  return supabase.storage.from("centros").getPublicUrl(path).data.publicUrl;
}

/**
 * Propuesta pública de un centro. Queda OCULTO (activo=false) hasta que
 * un administrador lo apruebe. Protegido con captcha (Turnstile).
 */
export async function proponerCentro(
  _prev: ProponerState,
  formData: FormData,
): Promise<ProponerState> {
  const nombre = str(formData, "nombre");
  const zona = (str(formData, "zona") ?? "") as Zona;
  if (!nombre) return { error: "El nombre del centro es obligatorio." };
  if (!ZONAS.includes(zona)) return { error: "Selecciona una zona válida." };

  const token = formData.get("cf-turnstile-response") as string | null;
  if (!(await verifyTurnstile(token)))
    return { error: "No pasaste la verificación anti-robots. Intenta de nuevo." };

  const foto_url = await uploadFoto(formData);

  const { error } = await supabaseAdmin().from("centros").insert({
    nombre,
    zona,
    direccion: str(formData, "direccion"),
    instagram: str(formData, "instagram"),
    whatsapp: str(formData, "whatsapp"),
    telefono: str(formData, "telefono"),
    necesidades: str(formData, "necesidades"),
    necesidades_detalle: str(formData, "necesidades_detalle"),
    maps_url: str(formData, "maps_url"),
    latitud: num(formData, "latitud"),
    longitud: num(formData, "longitud"),
    confianza: "Por verificar",
    contribuido_por: str(formData, "proponente") ?? "Propuesta pública",
    ...(foto_url ? { foto_url } : {}),
    activo: false, // pendiente de aprobación
  });
  if (error) return { error: `No se pudo enviar: ${error.message}` };

  revalidatePath("/admin/centros");
  return { ok: true };
}
