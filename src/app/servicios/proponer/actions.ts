"use server";

import { revalidatePath } from "next/cache";
import { supabaseAdmin } from "@/lib/supabase";
import { verifyTurnstile } from "@/lib/turnstile";
import {
  CATEGORIAS_SERVICIO,
  COSTOS,
  ZONAS,
  type CategoriaServicio,
  type Costo,
  type Zona,
} from "@/lib/types";

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
    .from("servicios")
    .upload(path, file, { contentType: file.type, upsert: false });
  if (error) return null;
  return supabase.storage.from("servicios").getPublicUrl(path).data.publicUrl;
}

/**
 * Propuesta pública de un servicio. Queda OCULTO (activo=false) hasta que
 * un administrador lo apruebe. Protegido con captcha (Turnstile).
 */
export async function proponerServicio(
  _prev: ProponerState,
  formData: FormData,
): Promise<ProponerState> {
  const nombre = str(formData, "nombre");
  const categoria = (str(formData, "categoria") ?? "") as CategoriaServicio;
  if (!nombre) return { error: "El nombre del servicio es obligatorio." };
  if (!CATEGORIAS_SERVICIO.includes(categoria))
    return { error: "Selecciona una categoría válida." };

  const token = formData.get("cf-turnstile-response") as string | null;
  if (!(await verifyTurnstile(token)))
    return { error: "No pasaste la verificación anti-robots. Intenta de nuevo." };

  const zona = (str(formData, "zona") ?? "") as Zona;
  const costo = (str(formData, "costo") ?? "") as Costo;
  const foto_url = await uploadFoto(formData);

  const { error } = await supabaseAdmin().from("servicios").insert({
    nombre,
    categoria,
    descripcion: str(formData, "descripcion"),
    zona: ZONAS.includes(zona) ? zona : null,
    direccion: str(formData, "direccion"),
    instagram: str(formData, "instagram"),
    whatsapp: str(formData, "whatsapp"),
    telefono: str(formData, "telefono"),
    maps_url: str(formData, "maps_url"),
    latitud: num(formData, "latitud"),
    longitud: num(formData, "longitud"),
    costo: COSTOS.includes(costo) ? costo : null,
    contribuido_por: str(formData, "proponente") ?? "Propuesta pública",
    ...(foto_url ? { foto_url } : {}),
    activo: false, // pendiente de aprobación
  });
  if (error) return { error: `No se pudo enviar: ${error.message}` };

  revalidatePath("/admin/servicios");
  return { ok: true };
}
